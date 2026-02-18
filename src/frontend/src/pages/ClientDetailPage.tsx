import { useState, useEffect, useRef } from 'react';
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
import { loadClientActivityLog, appendClientActivityLog, appendLocalActivityLog, type LocalActivityLogEntry } from '../utils/clientActivityLog';
import { generateClientPDF } from '../utils/clientPdfExport';
import { downloadPDF, sanitizeFilename, formatDateForFilename } from '../utils/pdfDownload';
import type { ClientProfile, ActivityLogEntry } from '../backend';

async function fetchIPAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', { 
      signal: AbortSignal.timeout(3000) 
    });
    const data = await response.json();
    return data.ip || '—';
  } catch {
    return '—';
  }
}

export default function ClientDetailPage() {
  const { clientId } = useParams({ from: '/layout/clients/$clientId' });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalOverview, setOriginalOverview] = useState<Record<string, string>>({});
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const numericId = parseInt(clientId, 10);
  const { data: backendClient, isLoading, error } = useGetClient(BigInt(numericId));
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

  // Initialize original state when entering edit mode - ALL fields from ALL 6 sections
  useEffect(() => {
    if (isEditMode && client) {
      const passportDoc = mockDetailData.identityDocuments.find(doc => doc.type === 'Passport');
      
      const overview = {
        // Contact Details section
        accountId: client.accountId || client.id.toString(),
        firstName: client.firstName || '',
        lastName: client.lastName || '',
        address: client.address || mockDetailData.contactDetails.primaryAddress || '',
        primaryCountry: client.primaryCountry || 'Switzerland',
        email: client.email || mockDetailData.contactDetails.email || '',
        phone: client.phone || mockDetailData.contactDetails.phone || '',
        telegram: overrides.telegram || '@client_telegram',
        linkedin: overrides.linkedin || 'linkedin.com/in/client',
        dateCreated: overrides.dateCreated || '2024-01-15',
        
        // Personal Data section
        dateOfBirth: client.dateOfBirth || mockDetailData.personalInfo.dateOfBirth || '',
        passportNumber: client.passportNumber || passportDoc?.number || 'N/A',
        passportExpiryDate: client.passportExpiryDate || passportDoc?.expiryDate || 'N/A',
        nationality: client.nationality || mockDetailData.personalInfo.nationality || '',
        tin: client.tin || mockDetailData.taxInformation.taxIdNumbers[0] || 'N/A',
        placeOfBirth: client.placeOfBirth || 'Zürich, Switzerland',
        issuingAuthority: overrides.issuingAuthority || passportDoc?.issuingCountry || 'N/A',
        dateOfIssue: overrides.dateOfIssue || passportDoc?.issueDate || 'N/A',
        dateOfExpiry: overrides.dateOfExpiry || passportDoc?.expiryDate || 'N/A',
        
        // Mandate section
        brokerageFee: overrides.brokerageFee || '1.5',
        activeFrom: overrides.activeFrom || '2024-01-15',
        exitFrom: overrides.exitFrom || 'N/A',
        telegramChannel: overrides.telegramChannel || '@trading_updates',
        tradeLimit: overrides.tradeLimit || '500,000',
        tradedAmount: overrides.tradedAmount || '2,350,000',
        
        // Wallets section
        bitcoinWallet: overrides.bitcoinWallet || 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        ethereumWallet: overrides.ethereumWallet || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        tronWallet: overrides.tronWallet || 'TN3W4H6rK2ce4vX9YnFxx6HhdqKUqvETcd',
        
        // Compliance section
        videoIdCompleted: overrides.videoIdCompleted || 'true',
        cvCompleted: overrides.cvCompleted || 'true',
        utilityBillCompleted: overrides.utilityBillCompleted || 'true',
        sofSowCompleted: overrides.sofSowCompleted || 'true',
        kycCompleted: overrides.kycCompleted || '2024-01-20',
        eddCompleted: overrides.eddCompleted || '2024-02-05',
        mmeConfirmation: overrides.mmeConfirmation || 'true',
        
        // VQF section
        riskProfileAml: overrides.riskProfileAml || 'Low Risk',
        identification: overrides.identification || 'Verified',
        customerProfile: overrides.customerProfile || 'Standard',
        formAOrK: overrides.formAOrK || 'Form A',
        fatfTravelRule: overrides.fatfTravelRule || 'Compliant',
        categoryRisk: overrides.categoryRisk || 'Category 1',
        incomeAnnualSales: overrides.incomeAnnualSales || '850,000',
        fortuneAssets: overrides.fortuneAssets || '7,500,000',
        liabilities: overrides.liabilities || '450,000',
        highRiskConfirmed: overrides.highRiskConfirmed || 'false',
        amlNoteDocumentation: overrides.amlNoteDocumentation || 'Complete',
        produceHighRisk: overrides.produceHighRisk || 'false',
        videoIdUtility: overrides.videoIdUtility || 'true',
      };
      setOriginalOverview(overview);
    }
  }, [isEditMode, client, mockDetailData, overrides]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
    setOriginalOverview({});
  };

  const handleSaveClick = async () => {
    if (!client || !formRef.current) return;

    // Collect values from form using FormData
    const formData = new FormData(formRef.current);
    const draftOverview: Record<string, string> = {};
    
    // Build draft object from FormData
    formData.forEach((value, key) => {
      draftOverview[key] = value.toString();
    });

    // Compute changes
    const changes: Array<{ field: string; oldValue: string; newValue: string }> = [];
    const fieldLabels: Record<string, string> = {
      accountId: 'Account ID',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      primaryCountry: 'Primary Country',
      telegram: 'Telegram',
      linkedin: 'LinkedIn',
      dateCreated: 'Date Created',
      dateOfBirth: 'Date of Birth',
      nationality: 'Nationality',
      passportNumber: 'Passport Number',
      passportExpiryDate: 'Passport Expiry',
      placeOfBirth: 'Place of Birth',
      tin: 'TIN',
      issuingAuthority: 'Issuing Authority',
      dateOfIssue: 'Date of Issue',
      dateOfExpiry: 'Date of Expiry',
      brokerageFee: 'Brokerage Fee (%)',
      activeFrom: 'Active From',
      exitFrom: 'Exit From',
      telegramChannel: 'Telegram Channel',
      tradeLimit: 'Trade Limit (CHF)',
      tradedAmount: 'Traded Amount (CHF)',
      bitcoinWallet: 'Bitcoin Wallet',
      ethereumWallet: 'Ethereum Wallet',
      tronWallet: 'TRON Wallet',
      videoIdCompleted: 'Video ID Completed',
      cvCompleted: 'CV Completed',
      utilityBillCompleted: 'Utility Bill Completed',
      sofSowCompleted: 'SOF/SOW Completed',
      kycCompleted: 'KYC Completed',
      eddCompleted: 'EDD Completed',
      mmeConfirmation: 'MME Confirmation',
      riskProfileAml: 'Risk Profile AML',
      identification: 'Identification',
      customerProfile: 'Customer Profile',
      formAOrK: 'Form A or K',
      fatfTravelRule: 'FATF Travel Rule',
      categoryRisk: 'Category Risk',
      incomeAnnualSales: 'Income/Annual Sales (CHF)',
      fortuneAssets: 'Fortune/Assets (CHF)',
      liabilities: 'Liabilities (CHF)',
      highRiskConfirmed: 'High Risk Confirmed',
      amlNoteDocumentation: 'AML Note Documentation',
      produceHighRisk: 'Produce High Risk',
      videoIdUtility: 'VideoID+Utility',
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

    // Fetch IP address
    const ipAddress = await fetchIPAddress();

    // Prepare user display string
    const userName = userProfile?.name || 'Unknown';
    const userEmail = userProfile?.email || '';
    const userDisplay = userEmail ? `${userName} (${userEmail})` : userName;

    // Prepare activity log entries for backend
    const activityEntries: ActivityLogEntry[] = changes.map((change) => ({
      timestamp: BigInt(Date.now() * 1000000), // nanoseconds
      fieldName: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      user: userDisplay,
    }));

    // Prepare local activity log entries
    const localEntries: LocalActivityLogEntry[] = changes.map((change) => ({
      timestamp: Date.now(),
      user: userDisplay,
      action: 'Updated',
      details: `${change.field}: "${change.oldValue}" → "${change.newValue}"`,
      ip: ipAddress,
    }));

    try {
      // Try to persist backend-supported fields to backend if it's a backend client
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

      // Always save ALL fields to local storage (including non-backend fields)
      saveClientOverrides(clientId, draftOverview);

      // Update local client if it's a local client
      const localClient = getLocalClient(BigInt(clientId));
      if (localClient) {
        updateLocalClient(BigInt(clientId), { ...localClient, ...draftOverview });
      }

      // Append to local activity log with new format
      appendLocalActivityLog(clientId, localEntries);

      setIsEditMode(false);
      setOriginalOverview({});
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Still save locally as fallback
      saveClientOverrides(clientId, draftOverview);
      appendLocalActivityLog(clientId, localEntries);
      setIsEditMode(false);
    }
  };

  const handleExportPDF = async () => {
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

      // Log the export action
      const ipAddress = await fetchIPAddress();
      const userName = userProfile?.name || 'Unknown';
      const userEmail = userProfile?.email || '';
      const userDisplay = userEmail ? `${userName} (${userEmail})` : userName;

      const exportLogEntry: LocalActivityLogEntry = {
        timestamp: Date.now(),
        user: userDisplay,
        action: 'Exported PDF',
        details: `Exported client profile as PDF: ${filename}.pdf`,
        ip: ipAddress,
      };

      appendLocalActivityLog(clientId, [exportLogEntry]);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/clients' })}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-light tracking-tight">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {client.accountId || `ID: ${client.id}`} • {getStatusLabel(client.status)} • {getRiskLabel(client.riskLevel)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleEditClick}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelClick}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveClick}
                disabled={updateOverviewMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateOverviewMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="mt-1 text-sm font-medium">{client.email || '—'}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Phone</p>
          <p className="mt-1 text-sm font-medium">{client.phone || '—'}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Primary Country</p>
          <p className="mt-1 text-sm font-medium">{client.primaryCountry || '—'}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="identity-kyc">Identity & KYC</TabsTrigger>
          <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <form ref={formRef}>
            <ClientOverviewTab
              client={client}
              mockData={mockDetailData}
              isEditMode={isEditMode}
              originalValues={originalOverview}
            />
          </form>
        </TabsContent>

        <TabsContent value="identity-kyc" className="mt-6">
          <ClientIdentityKycTab mockData={mockDetailData} />
        </TabsContent>

        <TabsContent value="activity-log" className="mt-6">
          <ClientActivityLogTab activityLog={mergedActivityLog} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
