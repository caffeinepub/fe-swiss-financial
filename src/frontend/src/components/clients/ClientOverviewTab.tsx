import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { MockClientDetail } from '../../mocks/clientDetailMock';
import { formatExpiryStatus } from '../../utils/format';

interface ClientOverviewTabProps {
  mockData: MockClientDetail;
}

interface FieldRowProps {
  label: string;
  value: string | boolean;
  verifiedDate?: string;
}

function FieldRow({ label, value, verifiedDate = '2025-03-15' }: FieldRowProps) {
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;
  
  return (
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm">{displayValue}</p>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">Verified: {verifiedDate}</p>
      </div>
    </div>
  );
}

export default function ClientOverviewTab({ mockData }: ClientOverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label="Full Name" value={mockData.personalInfo.fullName} />
          <FieldRow label="Date of Birth" value={mockData.personalInfo.dateOfBirth} />
          <FieldRow label="Nationality" value={mockData.personalInfo.nationality} />
          <FieldRow label="Civil Status" value={mockData.personalInfo.civilStatus} />
          <FieldRow label="Occupation" value={mockData.personalInfo.occupation} />
          <FieldRow label="Employer" value={mockData.personalInfo.employer} />
        </CardContent>
      </Card>

      {/* Contact Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label="Primary Address" value={mockData.contactDetails.primaryAddress} />
          <FieldRow label="Secondary Address" value={mockData.contactDetails.secondaryAddress} />
          <FieldRow label="Phone" value={mockData.contactDetails.phone} />
          <FieldRow label="Email" value={mockData.contactDetails.email} />
        </CardContent>
      </Card>

      {/* Identity Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Identity Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockData.identityDocuments.map((doc, index) => {
            const expiryStatus = formatExpiryStatus(doc.expiryDate);
            return (
              <div key={index} className="rounded-md border border-border p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{doc.type}</p>
                  <p className="text-xs text-muted-foreground">Verified: {doc.verifiedDate}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Number:</span>
                    <span>{doc.number}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span>{doc.issueDate}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span>{doc.expiryDate}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <p
                    className={`text-xs font-medium ${
                      expiryStatus.variant === 'error'
                        ? 'text-red-600'
                        : expiryStatus.variant === 'warning'
                        ? 'text-orange-600'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {expiryStatus.text}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">KYC Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label="Current Risk Level" value={mockData.kycStatus.currentRiskLevel} />
          <FieldRow label="PEP Status" value={mockData.kycStatus.pepStatus} />
          <FieldRow label="Sanctions Screening Status" value={mockData.kycStatus.sanctionsScreeningStatus} />
          <FieldRow label="Last Review Date" value={mockData.kycStatus.lastReviewDate} />
          <FieldRow label="Next Review Date" value={mockData.kycStatus.nextReviewDate} />
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Tax Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Tax Residency Countries</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {mockData.taxInformation.taxResidencyCountries.map((country, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {country}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Verified: 2025-03-15</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Tax ID Numbers</p>
                <div className="space-y-1 mt-1">
                  {mockData.taxInformation.taxIdNumbers.map((taxId, idx) => (
                    <p key={idx} className="text-sm font-mono">
                      {taxId}
                    </p>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Verified: 2025-03-15</p>
            </div>
          </div>
          <Separator />
          <FieldRow label="CRS Status" value={mockData.taxInformation.crsStatus} />
          <FieldRow label="US Person" value={mockData.taxInformation.usPerson} />
        </CardContent>
      </Card>

      {/* Financial Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Financial Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldRow label="Source of Wealth" value={mockData.financialProfile.sourceOfWealth} />
          <FieldRow label="Estimated Assets Range" value={mockData.financialProfile.estimatedAssetsRange} />
          <FieldRow label="Source of Funds" value={mockData.financialProfile.sourceOfFunds} />
          <FieldRow label="Purpose of Relationship" value={mockData.financialProfile.purposeOfRelationship} />
        </CardContent>
      </Card>
    </div>
  );
}
