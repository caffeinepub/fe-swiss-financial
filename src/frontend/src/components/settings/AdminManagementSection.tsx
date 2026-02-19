import { useState } from 'react';
import { useGetMyAdminEntry, useAddAdmin, useRemoveAdmin } from '../../hooks/useQueries';
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
  const { data: myAdminEntry, isLoading: myEntryLoading } = useGetMyAdminEntry();
  const addAdminMutation = useAddAdmin();
  const removeAdminMutation = useRemoveAdmin();

  const [newPrincipalId, setNewPrincipalId] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [formError, setFormError] = useState('');

  const isAdmin = myAdminEntry?.role === AdminRole.operator;
  const isLoading = myEntryLoading;

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>
            Manage authorized Principal IDs with access to the system. Only the Admin can add or remove admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div>
                <h3 className="mb-3 text-sm font-medium">Current Admins</h3>
                {!myAdminEntry ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>No admin entries found.</AlertDescription>
                  </Alert>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Principal ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Added On</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-mono text-xs">{myAdminEntry.principal.toString()}</TableCell>
                          <TableCell>{myAdminEntry.name}</TableCell>
                          <TableCell>
                            <Badge variant={myAdminEntry.role === AdminRole.operator ? 'default' : 'secondary'}>
                              {myAdminEntry.role === AdminRole.operator ? 'Admin' : 'Staff'}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(myAdminEntry.addedOn)}</TableCell>
                          <TableCell>
                            {myAdminEntry.role !== AdminRole.operator && isAdmin && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(myAdminEntry.principal.toString())}
                                disabled={removeAdminMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div>
                  <h3 className="mb-3 text-sm font-medium">Add Staff Member</h3>
                  <form onSubmit={handleAddStaff} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="principalId">Principal ID</Label>
                        <Input
                          id="principalId"
                          placeholder="Enter Principal ID"
                          value={newPrincipalId}
                          onChange={(e) => setNewPrincipalId(e.target.value)}
                          disabled={addAdminMutation.isPending}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          placeholder="Enter display name"
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
              )}

              {!isAdmin && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You do not have permission to add or remove admins. Only the Admin can perform these actions.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
