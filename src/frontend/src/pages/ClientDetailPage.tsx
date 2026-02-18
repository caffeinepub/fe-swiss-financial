import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetClient } from '../hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Edit, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { formatClientId, getStatusLabel, getRiskLabel } from '../utils/format';
import { generateMockClientDetail } from '../mocks/clientDetailMock';
import ClientOverviewTab from '../components/clients/ClientOverviewTab';
import ClientIdentityKycTab from '../components/clients/ClientIdentityKycTab';

export default function ClientDetailPage() {
  const { clientId } = useParams({ from: '/clients/$clientId' });
  const navigate = useNavigate();
  const { data: client, isLoading } = useGetClient(Number(clientId));
  const [activeTab, setActiveTab] = useState('overview');

  // Generate mock data for the client
  const mockData = generateMockClientDetail(Number(clientId));

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Client not found</p>
          <Button onClick={() => navigate({ to: '/clients' })} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Alert Bar */}
      {mockData.alerts.length > 0 && (
        <div className="bg-muted/30 border-b border-border px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {mockData.alerts.map((alert, index) => {
              const Icon =
                alert.type === 'error'
                  ? AlertCircle
                  : alert.type === 'warning'
                  ? AlertTriangle
                  : Info;
              const bgColor =
                alert.type === 'error'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : alert.type === 'warning'
                  ? 'bg-orange-100 text-orange-800 border-orange-200'
                  : 'bg-blue-100 text-blue-800 border-blue-200';

              return (
                <div
                  key={index}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${bgColor}`}
                >
                  <Icon className="h-3 w-3" />
                  {alert.message}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="border-b border-border px-6 py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-light tracking-tight text-foreground">
              {client.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono">{formatClientId(Number(client.id))}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  client.status === 'active'
                    ? 'default'
                    : client.status === 'onboarding'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {getStatusLabel(client.status)}
              </Badge>
              <Badge
                variant={
                  client.riskLevel === 'high'
                    ? 'destructive'
                    : client.riskLevel === 'medium'
                    ? 'secondary'
                    : 'outline'
                }
                className={
                  client.riskLevel === 'low'
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                    : client.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                    : ''
                }
              >
                {getRiskLabel(client.riskLevel)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border px-6">
          <TabsList className="h-auto bg-transparent p-0 gap-6">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="identity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Identity & KYC
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Financial Profile
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Connections
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Activity Log
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3"
            >
              Notes
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="overview" className="mt-0">
            <ClientOverviewTab mockData={mockData} />
          </TabsContent>

          <TabsContent value="identity" className="mt-0">
            <ClientIdentityKycTab mockData={mockData} />
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <div className="rounded-md border border-border p-8 text-center">
              <h3 className="text-lg font-medium">Documents</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Client documents and file management will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="mt-0">
            <div className="rounded-md border border-border p-8 text-center">
              <h3 className="text-lg font-medium">Financial Profile</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Detailed financial information and portfolio data will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-0">
            <div className="rounded-md border border-border p-8 text-center">
              <h3 className="text-lg font-medium">Connections</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Related parties, beneficial owners, and connections will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <div className="rounded-md border border-border p-8 text-center">
              <h3 className="text-lg font-medium">Activity Log</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Client activity history and audit trail will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="rounded-md border border-border p-8 text-center">
              <h3 className="text-lg font-medium">Notes</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Internal notes and comments about the client will be displayed here.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
