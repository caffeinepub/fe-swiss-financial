import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import type { MockClientDetail } from '../../mocks/clientDetailMock';
import type { ClientProfile } from '../../backend';

interface ClientOverviewTabProps {
  mockData: MockClientDetail;
  client: ClientProfile;
  isEditMode: boolean;
  draftValues: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

interface FieldRowProps {
  label: string;
  value: string | number;
  isEditMode?: boolean;
  fieldName?: string;
  onFieldChange?: (field: string, value: string) => void;
}

function FieldRow({ label, value, isEditMode, fieldName, onFieldChange }: FieldRowProps) {
  if (isEditMode && fieldName && onFieldChange) {
    return (
      <div className="flex justify-between items-start gap-4 py-1.5">
        <p className="text-xs text-muted-foreground pt-2">{label}</p>
        <Input
          value={value}
          onChange={(e) => onFieldChange(fieldName, e.target.value)}
          className="h-8 text-sm max-w-[200px]"
        />
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-right">{value}</p>
    </div>
  );
}

interface CheckboxFieldRowProps {
  label: string;
  checked: boolean;
}

function CheckboxFieldRow({ label, checked }: CheckboxFieldRowProps) {
  return (
    <div className="flex justify-between items-center gap-4 py-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Checkbox checked={checked} disabled className="pointer-events-none" />
    </div>
  );
}

export default function ClientOverviewTab({ 
  mockData, 
  client, 
  isEditMode, 
  draftValues, 
  onFieldChange 
}: ClientOverviewTabProps) {
  // Use draft values in edit mode, otherwise use client data
  const getValue = (field: keyof typeof draftValues, fallback: string = '') => {
    if (isEditMode && draftValues[field] !== undefined) {
      return draftValues[field];
    }
    return (client[field as keyof ClientProfile] as string) || fallback;
  };

  // Extract data from mockData where available
  const fullName = isEditMode 
    ? `${getValue('firstName')} ${getValue('lastName')}`
    : `${client.firstName} ${client.lastName}`;
  const email = getValue('email', mockData.contactDetails.email);
  const phone = getValue('phone', mockData.contactDetails.phone);
  const address = getValue('address', mockData.contactDetails.primaryAddress);
  const primaryCountry = getValue('primaryCountry', 'Switzerland');
  const dateOfBirth = getValue('dateOfBirth', mockData.personalInfo.dateOfBirth);
  const nationality = getValue('nationality', mockData.personalInfo.nationality);
  
  // Passport data from identity documents
  const passportDoc = mockData.identityDocuments.find(doc => doc.type === 'Passport');
  const passportNumber = getValue('passportNumber', passportDoc?.number || 'N/A');
  const passportExpiry = getValue('passportExpiryDate', passportDoc?.expiryDate || 'N/A');
  const passportIssueDate = passportDoc?.issueDate || 'N/A';
  const issuingAuthority = passportDoc?.issuingCountry || 'N/A';
  
  // Tax information
  const tin = getValue('tin', mockData.taxInformation.taxIdNumbers[0] || 'N/A');
  const placeOfBirth = getValue('placeOfBirth', 'Zürich, Switzerland');
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Section 1: Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow label="Account ID" value={client.accountId || client.id.toString()} />
          <FieldRow 
            label="First Name" 
            value={getValue('firstName', client.firstName)} 
            isEditMode={isEditMode}
            fieldName="firstName"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Last Name" 
            value={getValue('lastName', client.lastName)} 
            isEditMode={isEditMode}
            fieldName="lastName"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Address" 
            value={address} 
            isEditMode={isEditMode}
            fieldName="address"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Primary Country" 
            value={primaryCountry} 
            isEditMode={isEditMode}
            fieldName="primaryCountry"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Email" 
            value={email} 
            isEditMode={isEditMode}
            fieldName="email"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Phone" 
            value={phone} 
            isEditMode={isEditMode}
            fieldName="phone"
            onFieldChange={onFieldChange}
          />
          <FieldRow label="Telegram" value="@client_telegram" />
          <FieldRow label="LinkedIn" value="linkedin.com/in/client" />
          <FieldRow label="Date Created" value="2024-01-15" />
        </CardContent>
      </Card>

      {/* Section 2: Personal Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Personal Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Date of Birth" 
            value={dateOfBirth} 
            isEditMode={isEditMode}
            fieldName="dateOfBirth"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Passport Number" 
            value={passportNumber} 
            isEditMode={isEditMode}
            fieldName="passportNumber"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Passport Expiry" 
            value={passportExpiry} 
            isEditMode={isEditMode}
            fieldName="passportExpiryDate"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Nationality" 
            value={nationality} 
            isEditMode={isEditMode}
            fieldName="nationality"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="TIN" 
            value={tin} 
            isEditMode={isEditMode}
            fieldName="tin"
            onFieldChange={onFieldChange}
          />
          <FieldRow 
            label="Place of Birth" 
            value={placeOfBirth} 
            isEditMode={isEditMode}
            fieldName="placeOfBirth"
            onFieldChange={onFieldChange}
          />
          <FieldRow label="Issuing Authority" value={issuingAuthority} />
          <FieldRow label="Date of Issue" value={passportIssueDate} />
          <FieldRow label="Date of Expiry" value={passportExpiry} />
        </CardContent>
      </Card>

      {/* Section 3: Mandate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow label="Brokerage Fee (%)" value="1.5" />
          <FieldRow label="Active From" value="2024-01-15" />
          <FieldRow label="Exit From" value="N/A" />
          <FieldRow label="Telegram Channel" value="@trading_updates" />
          <FieldRow label="Trade Limit (CHF)" value="500,000" />
          <FieldRow label="Traded Amount (CHF)" value="2,350,000" />
        </CardContent>
      </Card>

      {/* Section 4: Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Wallets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow label="Bitcoin Wallet" value="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" />
          <FieldRow label="Ethereum Wallet" value="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" />
          <FieldRow label="TRON Wallet" value="TN3W4H6rK2ce4vX9YnFxx6HhdqKUqvETcd" />
        </CardContent>
      </Card>

      {/* Section 5: Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <CheckboxFieldRow label="Video ID Completed" checked={true} />
          <CheckboxFieldRow label="CV Completed" checked={true} />
          <CheckboxFieldRow label="Utility Bill Completed" checked={true} />
          <CheckboxFieldRow label="SOF/SOW Completed" checked={true} />
          <FieldRow label="KYC Completed" value="2024-01-20" />
          <FieldRow label="EDD Completed" value="2024-02-05" />
          <CheckboxFieldRow label="MME Confirmation" checked={true} />
        </CardContent>
      </Card>

      {/* Section 6: VQF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">VQF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow label="Risk Profile AML" value="Low Risk" />
          <FieldRow label="Identification" value="Verified" />
          <FieldRow label="Customer Profile" value="Standard" />
          <FieldRow label="Form A or K" value="Form A" />
          <FieldRow label="FATF Travel Rule" value="Compliant" />
          <FieldRow label="Category Risk" value="Category 1" />
          <FieldRow label="Income/Annual Sales (CHF)" value="850,000" />
          <FieldRow label="Fortune/Assets (CHF)" value="7,500,000" />
          <FieldRow label="Liabilities (CHF)" value="450,000" />
          <CheckboxFieldRow label="High Risk Confirmed" checked={false} />
          <FieldRow label="AML Note Documentation" value="Complete" />
          <CheckboxFieldRow label="Produce High Risk" checked={false} />
          <CheckboxFieldRow label="VideoID+Utility" checked={true} />
        </CardContent>
      </Card>
    </div>
  );
}
