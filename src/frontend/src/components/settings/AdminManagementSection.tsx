import { useState } from 'react';
import { useGetAdminEntries, useAddAdmin, useRemoveAdmin, useGetMyAdminEntry } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Trash2, UserPlus, AlertCircle } from 'lucide-react';
import { AdminRole } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';

export default function AdminManagementSection() {
  const { identity } = useInternetIdentity();
  const { data: adminEntries, isLoading: entriesLoading } = useGetAdminEntries();
  const { data: myAdminEntry, isLoading: myEntryLoading, isFetched: myEntryFetched } = useGetMyAdminEntry();
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();

  const [newPrincipalId, setNewPrincipalId] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  // Determine if current user is Operator by comparing Principal IDs
  const currentPrincipalId = identity?.getPrincipal().toString();
  
  // Primary method: Find Operator in adminEntries and compare with current Principal ID
  let isOperator = false;
  if (adminEntries && currentPrincipalId) {
    const operatorEntry = adminEntries.find(entry => entry.role === AdminRole.operator);
    if (operatorEntry) {
      isOperator = operatorEntry.principal.toString() === currentPrincipalId;
    }
  }
  
  // Fallback: Use myAdminEntry if adminEntries is not available yet
  if (!adminEntries && myAdminEntry) {
    isOperator = myAdminEntry.role === AdminRole.operator;
  }

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newPrincipalId.trim() || !newDisplayName.trim()) {
      setFormError('Both Principal ID and Display Name are required.');
      return;
    }

    try {
      const principal = Principal.fromText(newPrincipalId.trim());
      await addAdminMutation.mutateAsync({
        principal,
        name: newDisplayName.trim(),
        role: AdminRole.staff,
      });
      setNewPrincipalId('');
      setNewDisplayName('');
    } catch (error: any) {
      setFormError(error.message || 'Failed to add staff member. Please check the Principal ID format.');
    }
  };

  const handleRemove = async (principalText: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) {
      return;
    }

    try {
      const principal = Principal.fromText(principalText);
      await removeAdminMutation.mutateAsync(principal);
    } catch (error: any) {
      alert(error.message || 'Failed to remove admin.');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isLoading = entriesLoading || (myEntryLoading && !myEntryFetched);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>
            Manage authorized Principal IDs with access to the system. Only the Operator can add or remove admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Admin List Table */}
          <div>
            <h3 className="mb-3 text-sm font-medium">Authorized Admins</h3>
            {entriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : adminEntries && adminEntries.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Principal ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Date Added</TableHead>
                      {isOperator && <TableHead className="w-[100px]">Remove</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminEntries.map((entry) => {
                      const principalText = entry.principal.toString();
                      const isOperatorEntry = entry.role === AdminRole.operator;
                      return (
                        <TableRow key={principalText}>
                          <TableCell className="font-mono text-xs">{principalText}</TableCell>
                          <TableCell>{entry.name}</TableCell>
                          <TableCell>
                            <Badge variant={isOperatorEntry ? 'default' : 'secondary'}>
                              {isOperatorEntry ? 'Operator' : 'Staff'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(entry.addedOn)}</TableCell>
                          {isOperator && (
                            <TableCell>
                              {!isOperatorEntry && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemove(principalText)}
                                  disabled={removeAdminMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No admin entries found.</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Add Staff Form - Only visible to Operator */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : isOperator ? (
            <div>
              <h3 className="mb-3 text-sm font-medium">Add Staff Member</h3>
              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="principalId">Principal ID</Label>
                    <Input
                      id="principalId"
                      placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
                      value={newPrincipalId}
                      onChange={(e) => setNewPrincipalId(e.target.value)}
                      disabled={addAdminMutation.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="John Doe"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      disabled={addAdminMutation.isPending}
                    />
                  </div>
                </div>
                {formError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={addAdminMutation.isPending}>
                  {addAdminMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Staff
                    </>
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Only the Operator can add or remove admin entries.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
