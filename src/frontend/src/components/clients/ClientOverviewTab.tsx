import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { MockClientDetail } from '../../mocks/clientDetailMock';
import type { ClientProfile } from '../../backend';

interface ClientOverviewTabProps {
  mockData: MockClientDetail;
  client: ClientProfile;
  isEditMode: boolean;
  originalValues: Record<string, string>;
}

interface FieldRowProps {
  label: string;
  value: string | number;
  isEditMode?: boolean;
  fieldName?: string;
}

function FieldRow({ label, value, isEditMode, fieldName }: FieldRowProps) {
  if (isEditMode && fieldName) {
    return (
      <div className="flex justify-between items-start gap-4 py-1.5">
        <p className="text-xs text-muted-foreground pt-2">{label}</p>
        <Input
          name={fieldName}
          defaultValue={value}
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

export default function ClientOverviewTab({ 
  mockData, 
  client, 
  isEditMode, 
  originalValues 
}: ClientOverviewTabProps) {
  // Use original values in edit mode, otherwise use client data or fallback
  const getValue = (field: string, fallback: string = '') => {
    if (isEditMode && originalValues[field] !== undefined) {
      return originalValues[field];
    }
    // Check if field exists in client overrides (from localStorage)
    if ((client as any)[field] !== undefined && (client as any)[field] !== null) {
      return String((client as any)[field]);
    }
    return fallback;
  };

  // Extract data from mockData where available
  const passportDoc = mockData.identityDocuments.find(doc => doc.type === 'Passport');
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Section 1: Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Account ID" 
            value={getValue('accountId', client.accountId || client.id.toString())} 
            isEditMode={isEditMode}
            fieldName="accountId"
          />
          <FieldRow 
            label="First Name" 
            value={getValue('firstName', client.firstName)} 
            isEditMode={isEditMode}
            fieldName="firstName"
          />
          <FieldRow 
            label="Last Name" 
            value={getValue('lastName', client.lastName)} 
            isEditMode={isEditMode}
            fieldName="lastName"
          />
          <FieldRow 
            label="Address" 
            value={getValue('address', client.address || mockData.contactDetails.primaryAddress)} 
            isEditMode={isEditMode}
            fieldName="address"
          />
          <FieldRow 
            label="Primary Country" 
            value={getValue('primaryCountry', client.primaryCountry || 'Switzerland')} 
            isEditMode={isEditMode}
            fieldName="primaryCountry"
          />
          <FieldRow 
            label="Email" 
            value={getValue('email', client.email || mockData.contactDetails.email)} 
            isEditMode={isEditMode}
            fieldName="email"
          />
          <FieldRow 
            label="Phone" 
            value={getValue('phone', client.phone || mockData.contactDetails.phone)} 
            isEditMode={isEditMode}
            fieldName="phone"
          />
          <FieldRow 
            label="Telegram" 
            value={getValue('telegram', '@client_telegram')} 
            isEditMode={isEditMode}
            fieldName="telegram"
          />
          <FieldRow 
            label="LinkedIn" 
            value={getValue('linkedin', 'linkedin.com/in/client')} 
            isEditMode={isEditMode}
            fieldName="linkedin"
          />
          <FieldRow 
            label="Date Created" 
            value={getValue('dateCreated', '2024-01-15')} 
            isEditMode={isEditMode}
            fieldName="dateCreated"
          />
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
            value={getValue('dateOfBirth', client.dateOfBirth || mockData.personalInfo.dateOfBirth)} 
            isEditMode={isEditMode}
            fieldName="dateOfBirth"
          />
          <FieldRow 
            label="Passport Number" 
            value={getValue('passportNumber', client.passportNumber || passportDoc?.number || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="passportNumber"
          />
          <FieldRow 
            label="Passport Expiry" 
            value={getValue('passportExpiryDate', client.passportExpiryDate || passportDoc?.expiryDate || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="passportExpiryDate"
          />
          <FieldRow 
            label="Nationality" 
            value={getValue('nationality', client.nationality || mockData.personalInfo.nationality)} 
            isEditMode={isEditMode}
            fieldName="nationality"
          />
          <FieldRow 
            label="TIN" 
            value={getValue('tin', client.tin || mockData.taxInformation.taxIdNumbers[0] || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="tin"
          />
          <FieldRow 
            label="Place of Birth" 
            value={getValue('placeOfBirth', client.placeOfBirth || 'Zürich, Switzerland')} 
            isEditMode={isEditMode}
            fieldName="placeOfBirth"
          />
          <FieldRow 
            label="Issuing Authority" 
            value={getValue('issuingAuthority', passportDoc?.issuingCountry || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="issuingAuthority"
          />
          <FieldRow 
            label="Date of Issue" 
            value={getValue('dateOfIssue', passportDoc?.issueDate || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="dateOfIssue"
          />
          <FieldRow 
            label="Date of Expiry" 
            value={getValue('dateOfExpiry', passportDoc?.expiryDate || 'N/A')} 
            isEditMode={isEditMode}
            fieldName="dateOfExpiry"
          />
        </CardContent>
      </Card>

      {/* Section 3: Mandate */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Brokerage Fee (%)" 
            value={getValue('brokerageFee', '1.5')} 
            isEditMode={isEditMode}
            fieldName="brokerageFee"
          />
          <FieldRow 
            label="Active From" 
            value={getValue('activeFrom', '2024-01-15')} 
            isEditMode={isEditMode}
            fieldName="activeFrom"
          />
          <FieldRow 
            label="Exit From" 
            value={getValue('exitFrom', 'N/A')} 
            isEditMode={isEditMode}
            fieldName="exitFrom"
          />
          <FieldRow 
            label="Telegram Channel" 
            value={getValue('telegramChannel', '@trading_updates')} 
            isEditMode={isEditMode}
            fieldName="telegramChannel"
          />
          <FieldRow 
            label="Trade Limit (CHF)" 
            value={getValue('tradeLimit', '500,000')} 
            isEditMode={isEditMode}
            fieldName="tradeLimit"
          />
          <FieldRow 
            label="Traded Amount (CHF)" 
            value={getValue('tradedAmount', '2,350,000')} 
            isEditMode={isEditMode}
            fieldName="tradedAmount"
          />
        </CardContent>
      </Card>

      {/* Section 4: Wallets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Wallets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Bitcoin Wallet" 
            value={getValue('bitcoinWallet', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')} 
            isEditMode={isEditMode}
            fieldName="bitcoinWallet"
          />
          <FieldRow 
            label="Ethereum Wallet" 
            value={getValue('ethereumWallet', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')} 
            isEditMode={isEditMode}
            fieldName="ethereumWallet"
          />
          <FieldRow 
            label="TRON Wallet" 
            value={getValue('tronWallet', 'TN3W4H6rK2ce4vX9YnFxx6HhdqKUqvETcd')} 
            isEditMode={isEditMode}
            fieldName="tronWallet"
          />
        </CardContent>
      </Card>

      {/* Section 5: Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Video ID Completed" 
            value={getValue('videoIdCompleted', 'true')} 
            isEditMode={isEditMode}
            fieldName="videoIdCompleted"
          />
          <FieldRow 
            label="CV Completed" 
            value={getValue('cvCompleted', 'true')} 
            isEditMode={isEditMode}
            fieldName="cvCompleted"
          />
          <FieldRow 
            label="Utility Bill Completed" 
            value={getValue('utilityBillCompleted', 'true')} 
            isEditMode={isEditMode}
            fieldName="utilityBillCompleted"
          />
          <FieldRow 
            label="SOF/SOW Completed" 
            value={getValue('sofSowCompleted', 'true')} 
            isEditMode={isEditMode}
            fieldName="sofSowCompleted"
          />
          <FieldRow 
            label="KYC Completed" 
            value={getValue('kycCompleted', '2024-01-20')} 
            isEditMode={isEditMode}
            fieldName="kycCompleted"
          />
          <FieldRow 
            label="EDD Completed" 
            value={getValue('eddCompleted', '2024-02-05')} 
            isEditMode={isEditMode}
            fieldName="eddCompleted"
          />
          <FieldRow 
            label="MME Confirmation" 
            value={getValue('mmeConfirmation', 'true')} 
            isEditMode={isEditMode}
            fieldName="mmeConfirmation"
          />
        </CardContent>
      </Card>

      {/* Section 6: VQF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">VQF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <FieldRow 
            label="Risk Profile AML" 
            value={getValue('riskProfileAml', 'Low Risk')} 
            isEditMode={isEditMode}
            fieldName="riskProfileAml"
          />
          <FieldRow 
            label="Identification" 
            value={getValue('identification', 'Verified')} 
            isEditMode={isEditMode}
            fieldName="identification"
          />
          <FieldRow 
            label="Customer Profile" 
            value={getValue('customerProfile', 'Standard')} 
            isEditMode={isEditMode}
            fieldName="customerProfile"
          />
          <FieldRow 
            label="Form A or K" 
            value={getValue('formAOrK', 'Form A')} 
            isEditMode={isEditMode}
            fieldName="formAOrK"
          />
          <FieldRow 
            label="FATF Travel Rule" 
            value={getValue('fatfTravelRule', 'Compliant')} 
            isEditMode={isEditMode}
            fieldName="fatfTravelRule"
          />
          <FieldRow 
            label="Category Risk" 
            value={getValue('categoryRisk', 'Category 1')} 
            isEditMode={isEditMode}
            fieldName="categoryRisk"
          />
          <FieldRow 
            label="Income/Annual Sales (CHF)" 
            value={getValue('incomeAnnualSales', '850,000')} 
            isEditMode={isEditMode}
            fieldName="incomeAnnualSales"
          />
          <FieldRow 
            label="Fortune/Assets (CHF)" 
            value={getValue('fortuneAssets', '7,500,000')} 
            isEditMode={isEditMode}
            fieldName="fortuneAssets"
          />
          <FieldRow 
            label="Liabilities (CHF)" 
            value={getValue('liabilities', '450,000')} 
            isEditMode={isEditMode}
            fieldName="liabilities"
          />
          <FieldRow 
            label="High Risk Confirmed" 
            value={getValue('highRiskConfirmed', 'false')} 
            isEditMode={isEditMode}
            fieldName="highRiskConfirmed"
          />
          <FieldRow 
            label="AML Note Documentation" 
            value={getValue('amlNoteDocumentation', 'Complete')} 
            isEditMode={isEditMode}
            fieldName="amlNoteDocumentation"
          />
          <FieldRow 
            label="Produce High Risk" 
            value={getValue('produceHighRisk', 'false')} 
            isEditMode={isEditMode}
            fieldName="produceHighRisk"
          />
          <FieldRow 
            label="VideoID+Utility" 
            value={getValue('videoIdUtility', 'true')} 
            isEditMode={isEditMode}
            fieldName="videoIdUtility"
          />
        </CardContent>
      </Card>
    </div>
  );
}
