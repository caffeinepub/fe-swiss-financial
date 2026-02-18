import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateClient } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { generateAccountId, saveLocalClient, getNextLocalClientId } from '../utils/localClients';
import type { ClientType, ClientStatus, RiskLevel } from '../backend';

export default function AddClientPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const createClient = useCreateClient();

  // Generate stable Account ID once on mount
  const [accountId] = useState(() => generateAccountId());

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    primaryCountry: '',
    dateOfBirth: '',
    nationality: '',
    passportNumber: '',
    passportExpiryDate: '',
    placeOfBirth: '',
    tin: '',
    clientType: 'individual' as ClientType,
  });

  const [validationError, setValidationError] = useState('');
  const [fallbackError, setFallbackError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setFallbackError('');

    // Validate required fields
    if (!formData.firstName.trim()) {
      setValidationError('First Name is required');
      return;
    }
    if (!formData.lastName.trim()) {
      setValidationError('Last Name is required');
      return;
    }

    if (!identity) {
      setValidationError('You must be logged in to create a client');
      return;
    }

    const clientProfile = {
      id: BigInt(0), // Backend will assign
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      accountId,
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      primaryCountry: formData.primaryCountry.trim(),
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality.trim(),
      passportNumber: formData.passportNumber.trim(),
      passportExpiryDate: formData.passportExpiryDate,
      placeOfBirth: formData.placeOfBirth.trim(),
      tin: formData.tin.trim(),
      clientType: formData.clientType,
      status: 'prospect' as ClientStatus,
      riskLevel: 'low' as RiskLevel,
      riskJustification: '',
      relationshipManager: identity.getPrincipal(),
      onboardingDate: undefined,
      kycReviewDue: undefined,
      kycHistory: [],
      onboardingSteps: [],
      activityLog: [`Client created on ${new Date().toLocaleDateString()}`],
      createdBy: identity.getPrincipal(),
      createdDate: BigInt(Date.now() * 1_000_000),
    };

    try {
      // Attempt backend save
      await createClient.mutateAsync(clientProfile);
      // Success - navigate to clients list
      navigate({ to: '/clients' });
    } catch (error) {
      // Backend failed - save locally and still navigate
      console.error('Backend save failed, storing locally:', error);
      
      const localClient = {
        ...clientProfile,
        id: getNextLocalClientId(),
      };
      
      saveLocalClient(localClient);
      setFallbackError('Client saved locally. Backend sync failed but your data is safe.');
      
      // Navigate after brief delay to show message
      setTimeout(() => {
        navigate({ to: '/clients' });
      }, 2000);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/clients' })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-light tracking-tight text-foreground">Add New Client</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new client profile
          </p>
        </div>
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {fallbackError && (
        <Alert className="border-orange-600 bg-orange-50 dark:bg-orange-950">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-600">
            {fallbackError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CONTACT DETAILS Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium uppercase tracking-wide text-muted-foreground">
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                value={accountId}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+41 XX XXX XX XX"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryCountry">Primary Country</Label>
              <Select
                value={formData.primaryCountry}
                onValueChange={(value) => handleChange('primaryCountry', value)}
              >
                <SelectTrigger id="primaryCountry">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Switzerland">Switzerland</SelectItem>
                  <SelectItem value="Germany">Germany</SelectItem>
                  <SelectItem value="France">France</SelectItem>
                  <SelectItem value="Italy">Italy</SelectItem>
                  <SelectItem value="Austria">Austria</SelectItem>
                  <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                  <SelectItem value="United States">United States</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* PERSONAL DATA Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium uppercase tracking-wide text-muted-foreground">
              Personal Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  placeholder="Enter nationality"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="passportNumber">Passport Number</Label>
                <Input
                  id="passportNumber"
                  value={formData.passportNumber}
                  onChange={(e) => handleChange('passportNumber', e.target.value)}
                  placeholder="Enter passport number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passportExpiryDate">Passport Expiry Date</Label>
                <Input
                  id="passportExpiryDate"
                  type="date"
                  value={formData.passportExpiryDate}
                  onChange={(e) => handleChange('passportExpiryDate', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="placeOfBirth">Place of Birth</Label>
                <Input
                  id="placeOfBirth"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                  placeholder="Enter place of birth"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin">TIN (Tax ID)</Label>
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(e) => handleChange('tin', e.target.value)}
                  placeholder="Enter tax identification number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Client Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientType">Type</Label>
              <Select
                value={formData.clientType}
                onValueChange={(value) => handleChange('clientType', value)}
              >
                <SelectTrigger id="clientType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="entity">Entity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/clients' })}
            disabled={createClient.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createClient.isPending}>
            {createClient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Client'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
