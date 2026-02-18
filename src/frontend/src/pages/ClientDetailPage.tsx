import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetClient, useUpdateClientOverviewFields, useAppendActivityLogEntries, useGetClientActivityLog, useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Download, AlertCircle, Edit, Save, X } from 'lucide-react';
import { formatDate, getStatusLabel, getRiskLabel } from '../utils/format';
import ClientOverviewTab from '../components/clients/ClientOverviewTab';
import ClientIdentityKycTab from '../components/clients/ClientIdentityKycTab';
import ClientActivityLogTab from '../components/clients/ClientActivityLogTab';
import { mockClients } from '../mocks/clientsListMock';
import { getLocalClient, updateLocalClient } from '../utils/localClients';
import { generateMockClientDetail } from '../mocks/clientDetailMock';
import { loadClientOverrides, saveClientOverrides } from '../utils/clientOverrides';
import { loadClientActivityLog, appendClientActivityLog } from '../utils/clientActivityLog';
import { generateClientPDF } from '../utils/clientPdfExport';
import { downloadPDF, sanitizeFilename, formatDateForFilename } from '../utils/pdfDownload';
import type { ClientProfile, ActivityLogEntry } from '../backend';

export default function ClientDetailPage() {
  const { clientId } = useParams({ from: '/clients/$clientId' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [draftOverview, setDraftOverview] = useState<Record<string, string>>({});
  const [originalOverview, setOriginalOverview] = useState<Record<string, string>>({});
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const numericId = parseInt(clientId, 10);
  const { data: backendClient, isLoading, error } = useGetClient(numericId);
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: backendActivityLog } = useGetClientActivityLog(BigInt(numericId));
  const updateOverviewMutation = useUpdateClientOverviewFields();
  const appendActivityMutation = useAppendActivityLogEntries();

  // Try to find client from backend, mock data, or local storage
  const baseClient = backendClient || 
                     mockClients.find(c => c.id === BigInt(clientId)) ||
                     getLocalClient(BigInt(clientId));

  // Load overrides and merge with base client
  const overrides = loadClientOverrides(clientId);
  const client = baseClient ? { ...baseClient, ...overrides } : null;

  // Generate mock detail data for tabs
  const mockDetailData = generateMockClientDetail(numericId);

  // Load activity log (merge backend + local)
  const localActivityLog = loadClientActivityLog(clientId);
  const mergedActivityLog = [...(backendActivityLog || []), ...localActivityLog];

  // Initialize draft state when entering edit mode
  useEffect(() => {
    if (isEditMode && client) {
      const overview = {
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        primaryCountry: client.primaryCountry || '',
        dateOfBirth: client.dateOfBirth || '',
        nationality: client.nationality || '',
        passportNumber: client.passportNumber || '',
        passportExpiryDate: client.passportExpiryDate || '',
        placeOfBirth: client.placeOfBirth || '',
        tin: client.tin || '',
      };
      setDraftOverview(overview);
      setOriginalOverview(overview);
    }
  }, [isEditMode, client]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setDraftOverview({});
    setOriginalOverview({});
  };

  const handleSaveClick = async () => {
    if (!client) return;

    // Compute changes
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    const fieldLabels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      primaryCountry: 'Primary Country',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      passportNumber: 'Passport Number',
      passportExpiryDate: 'Passport Expiry Date',
      placeOfBirth: 'Place of Birth',
      tin: 'TIN',
    };

    Object.keys(draftOverview).forEach((key) => {
      if (draftOverview[key] !== originalOverview[key]) {
        changes.push({
          field: fieldLabels[key] || key,
          oldValue: originalOverview[key] || '',
          newValue: draftOverview[key] || '',
        });
      }
    });

    if (changes.length === 0) {
      setIsEditMode(false);
      return;
    }

    // Prepare activity log entries
    const userName = userProfile?.name || userProfile?.email || 'Unknown User';
    const activityEntries: ActivityLogEntry[] = changes.map((change) => ({
      timestamp: BigInt(Date.now() * 1000000), // nanoseconds
      fieldName: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      user: userName,
    }));

    try {
      // Try to persist to backend if it's a backend client
      if (backendClient) {
        await updateOverviewMutation.mutateAsync({
          id: BigInt(numericId),
          updates: {
            firstName: draftOverview.firstName !== originalOverview.firstName ? draftOverview.firstName : undefined,
            lastName: draftOverview.lastName !== originalOverview.lastName ? draftOverview.lastName : undefined,
            email: draftOverview.email !== originalOverview.email ? draftOverview.email : undefined,
            phone: draftOverview.phone !== originalOverview.phone ? draftOverview.phone : undefined,
            address: draftOverview.address !== originalOverview.address ? draftOverview.address : undefined,
            primaryCountry: draftOverview.primaryCountry !== originalOverview.primaryCountry ? draftOverview.primaryCountry : undefined,
            dateOfBirth: draftOverview.dateOfBirth !== originalOverview.dateOfBirth ? draftOverview.dateOfBirth : undefined,
            nationality: draftOverview.nationality !== originalOverview.nationality ? draftOverview.nationality : undefined,
            passportNumber: draftOverview.passportNumber !== originalOverview.passportNumber ? draftOverview.passportNumber : undefined,
            passportExpiryDate: draftOverview.passportExpiryDate !== originalOverview.passportExpiryDate ? draftOverview.passportExpiryDate : undefined,
            placeOfBirth: draftOverview.placeOfBirth !== originalOverview.placeOfBirth ? draftOverview.placeOfBirth : undefined,
            tin: draftOverview.tin !== originalOverview.tin ? draftOverview.tin : undefined,
          },
        });

        // Append activity log to backend
        await appendActivityMutation.mutateAsync({
          clientId: BigInt(numericId),
          entries: activityEntries,
        });
      }

      // Always save to local storage as fallback/override
      saveClientOverrides(clientId, draftOverview);

      // Update local client if it's a local client
      const localClient = getLocalClient(BigInt(clientId));
      if (localClient) {
        updateLocalClient(BigInt(clientId), { ...localClient, ...draftOverview });
      }

      // Append to local activity log
      appendClientActivityLog(clientId, activityEntries);

      setIsEditMode(false);
      setDraftOverview({});
      setOriginalOverview({});
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Still save locally as fallback
      saveClientOverrides(clientId, draftOverview);
      appendClientActivityLog(clientId, activityEntries);
      setIsEditMode(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setDraftOverview((prev) => ({ ...prev, [field]: value }));
  };

  const handleExportPDF = () => {
    if (!client) return;

    setIsExportingPDF(true);
    try {
      // Generate PDF HTML content
      const pdfHtml = generateClientPDF(client, mockDetailData);

      // Create filename components using actual client data
      const firstName = sanitizeFilename(client.firstName || 'Unknown');
      const lastName = sanitizeFilename(client.lastName || 'Client');
      const accountId = sanitizeFilename(client.accountId || client.id.toString());
      const dateStr = formatDateForFilename(new Date());
      
      // Create filename: FirstName_LastName_AccountID_YYYY-MM-DD
      const filename = `${firstName}_${lastName}_${accountId}_${dateStr}`;

      // Trigger print via popup window
      downloadPDF(pdfHtml, filename);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/clients' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Client not found. The client may have been deleted or the ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/clients' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              {client.firstName} {client.lastName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Client ID: {client.accountId || client.id.toString()} • {client.nationality || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              <Button variant="outline" className="gap-2" onClick={handleEditClick}>
                <Edit className="h-4 w-4" />
                Edit Client
              </Button>
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleExportPDF}
                disabled={isExportingPDF}
              >
                <Download className="h-4 w-4" />
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="gap-2" onClick={handleCancelClick}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button 
                className="gap-2" 
                onClick={handleSaveClick}
                disabled={updateOverviewMutation.isPending || appendActivityMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {updateOverviewMutation.isPending || appendActivityMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
            {getStatusLabel(client.status)}
          </Badge>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Risk Level:</span>
          <Badge
            variant={
              client.riskLevel === 'high'
                ? 'destructive'
                : client.riskLevel === 'medium'
                ? 'secondary'
                : 'default'
            }
          >
            {getRiskLabel(client.riskLevel)}
          </Badge>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Onboarding Date:</span>
          <span className="text-sm font-medium">
            {client.onboardingDate ? formatDate(client.onboardingDate) : 'N/A'}
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">KYC Review Due:</span>
          <span className="text-sm font-medium">
            {client.kycReviewDue ? formatDate(client.kycReviewDue) : 'N/A'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identity-kyc">Identity & KYC</TabsTrigger>
          <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ClientOverviewTab
            mockData={mockDetailData}
            client={client}
            isEditMode={isEditMode}
            draftValues={draftOverview}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="identity-kyc" className="space-y-6">
          <ClientIdentityKycTab mockData={mockDetailData} />
        </TabsContent>

        <TabsContent value="activity-log" className="space-y-6">
          <ClientActivityLogTab activityLog={mergedActivityLog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
