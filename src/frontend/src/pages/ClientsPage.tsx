import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllClients } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowUpDown, Plus } from 'lucide-react';
import { formatDate, getStatusLabel, getRiskLabel } from '../utils/format';
import { mockClients } from '../mocks/clientsListMock';
import { getLocalClients } from '../utils/localClients';
import type { ClientProfile } from '../backend';

type SortField = 'name' | 'onboardingDate' | 'status' | 'riskLevel';
type SortDirection = 'asc' | 'desc';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { data: backendClients, isLoading } = useGetAllClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Merge backend clients, local clients, and always include mock clients
  const displayClients = useMemo(() => {
    const localClients = getLocalClients();
    const backend = backendClients || [];
    
    // Always include mock clients + backend clients + local clients
    return [...mockClients, ...backend, ...localClients];
  }, [backendClients]);

  const filteredAndSortedClients = useMemo(() => {
    if (!displayClients) return [];

    // Search by first name, last name, or full name
    let filtered = displayClients.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      return fullName.includes(query) || 
             client.firstName.toLowerCase().includes(query) ||
             client.lastName.toLowerCase().includes(query);
    });

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        case 'onboardingDate':
          const dateA = a.onboardingDate || BigInt(0);
          const dateB = b.onboardingDate || BigInt(0);
          comparison = dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'riskLevel':
          comparison = a.riskLevel.localeCompare(b.riskLevel);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [displayClients, searchQuery, sortField, sortDirection]);

  const handleRowClick = (clientId: bigint) => {
    navigate({ to: '/clients/$clientId', params: { clientId: clientId.toString() } });
  };

  const handleAddClient = () => {
    navigate({ to: '/add-client' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Clients</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and view all client information
          </p>
        </div>
        <Button onClick={handleAddClient} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search clients by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Client Name
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('riskLevel')}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Risk Level
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Relationship Manager</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort('onboardingDate')}
                  className="flex items-center gap-1 font-medium hover:text-foreground"
                >
                  Onboarding Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))}
              </>
            ) : filteredAndSortedClients.length > 0 ? (
              filteredAndSortedClients.map((client) => (
                <TableRow
                  key={client.id.toString()}
                  onClick={() => handleRowClick(client.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    {client.firstName} {client.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                      {getStatusLabel(client.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.riskLevel === 'high'
                          ? 'destructive'
                          : client.riskLevel === 'medium'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {getRiskLabel(client.riskLevel)}
                    </Badge>
                  </TableCell>
                  <TableCell>{client.nationality || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.relationshipManager.toString().slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {client.onboardingDate ? formatDate(client.onboardingDate) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchQuery ? 'No clients found matching your search' : 'No clients yet'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
