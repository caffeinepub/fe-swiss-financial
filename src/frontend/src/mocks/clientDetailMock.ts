// Mock data generator for Client Detail page
export interface MockClientDetail {
  personalInfo: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    civilStatus: string;
    occupation: string;
    employer: string;
  };
  contactDetails: {
    primaryAddress: string;
    secondaryAddress: string;
    phone: string;
    email: string;
  };
  identityDocuments: Array<{
    type: string;
    number: string;
    issuingCountry: string;
    issueDate: string;
    expiryDate: string;
    verifiedDate: string;
  }>;
  kycStatus: {
    currentRiskLevel: string;
    pepStatus: boolean;
    sanctionsScreeningStatus: string;
    lastReviewDate: string;
    nextReviewDate: string;
  };
  taxInformation: {
    taxResidencyCountries: string[];
    taxIdNumbers: string[];
    crsStatus: string;
    usPerson: boolean;
  };
  financialProfile: {
    sourceOfWealth: string;
    estimatedAssetsRange: string;
    sourceOfFunds: string;
    purposeOfRelationship: string;
  };
  kycScreeningHistory: Array<{
    date: string;
    screeningType: 'Initial' | 'Periodic' | 'Event-triggered';
    riskLevelResult: string;
    pepCheckResult: 'Clear' | 'Match';
    sanctionsCheckResult: 'Clear' | 'Hit';
    screenedBy: string;
    notes: string;
  }>;
  currentRiskAssessment: {
    overallRisk: string;
    riskFactors: string[];
    lastAssessmentDate: string;
    nextReviewDate: string;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
  }>;
}

export function generateMockClientDetail(clientId: number): MockClientDetail {
  // Generate deterministic but varied data based on clientId
  const seed = clientId;
  
  // Calculate passport expiry (some expired, some expiring soon)
  const passportExpiryDays = (seed % 3 === 0) ? -10 : (seed % 3 === 1) ? 45 : 180;
  const passportExpiryDate = new Date();
  passportExpiryDate.setDate(passportExpiryDate.getDate() + passportExpiryDays);
  
  // Calculate residence permit expiry
  const permitExpiryDays = (seed % 4 === 0) ? 25 : (seed % 4 === 1) ? 60 : (seed % 4 === 2) ? 120 : 200;
  const permitExpiryDate = new Date();
  permitExpiryDate.setDate(permitExpiryDate.getDate() + permitExpiryDays);
  
  // Calculate KYC review date
  const kycReviewDays = (seed % 2 === 0) ? 15 : 90;
  const kycReviewDate = new Date();
  kycReviewDate.setDate(kycReviewDate.getDate() + kycReviewDays);
  
  const isPEP = seed % 5 === 0;
  
  // Generate alerts based on conditions
  const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];
  
  if (passportExpiryDays < 0) {
    alerts.push({ type: 'error', message: 'Passport expired' });
  } else if (passportExpiryDays < 60) {
    alerts.push({ type: 'warning', message: 'Passport expiring soon' });
  }
  
  if (kycReviewDays < 30) {
    alerts.push({ type: 'warning', message: 'KYC review due' });
  }
  
  if (isPEP) {
    alerts.push({ type: 'info', message: 'PEP flagged' });
  }

  // Swiss-oriented names for screeners
  const swissNames = [
    'Anna Müller',
    'Thomas Weber',
    'Sophie Meier',
    'Lukas Fischer',
    'Maria Schneider',
    'David Keller',
  ];
  
  // Generate KYC screening history
  const kycScreeningHistory = [
    {
      date: '2025-02-10',
      screeningType: 'Periodic' as const,
      riskLevelResult: 'Low',
      pepCheckResult: isPEP ? ('Match' as const) : ('Clear' as const),
      sanctionsCheckResult: 'Clear' as const,
      screenedBy: swissNames[seed % swissNames.length],
      notes: 'Routine periodic review completed. No adverse findings.',
    },
    {
      date: '2024-11-15',
      screeningType: 'Event-triggered' as const,
      riskLevelResult: 'Low',
      pepCheckResult: 'Clear' as const,
      sanctionsCheckResult: 'Clear' as const,
      screenedBy: swissNames[(seed + 1) % swissNames.length],
      notes: 'Triggered by change in source of funds. Reviewed and cleared.',
    },
    {
      date: '2024-08-20',
      screeningType: 'Periodic' as const,
      riskLevelResult: 'Low',
      pepCheckResult: 'Clear' as const,
      sanctionsCheckResult: 'Clear' as const,
      screenedBy: swissNames[(seed + 2) % swissNames.length],
      notes: 'Semi-annual review. All checks passed.',
    },
    {
      date: '2024-02-05',
      screeningType: 'Initial' as const,
      riskLevelResult: 'Low',
      pepCheckResult: 'Clear' as const,
      sanctionsCheckResult: 'Clear' as const,
      screenedBy: swissNames[(seed + 3) % swissNames.length],
      notes: 'Initial onboarding screening. Client approved.',
    },
  ];

  // Generate risk factors based on client characteristics
  const riskFactors: string[] = [];
  if (isPEP) {
    riskFactors.push('Politically Exposed Person (PEP) status');
  }
  riskFactors.push('Cross-border transactions');
  if (seed % 3 === 0) {
    riskFactors.push('High net worth individual');
  }
  if (seed % 4 === 0) {
    riskFactors.push('Multiple tax residencies');
  }
  
  return {
    personalInfo: {
      fullName: `Client ${clientId}`,
      dateOfBirth: '1985-06-15',
      nationality: 'Swiss',
      civilStatus: 'Married',
      occupation: 'Investment Manager',
      employer: 'Global Finance AG',
    },
    contactDetails: {
      primaryAddress: 'Bahnhofstrasse 45, 8001 Zürich, Switzerland',
      secondaryAddress: 'Avenue de la Gare 12, 1003 Lausanne, Switzerland',
      phone: '+41 44 123 4567',
      email: `client${clientId}@example.com`,
    },
    identityDocuments: [
      {
        type: 'Passport',
        number: `CH${String(clientId).padStart(7, '0')}`,
        issuingCountry: 'Switzerland',
        issueDate: '2016-03-20',
        expiryDate: passportExpiryDate.toISOString().split('T')[0],
        verifiedDate: '2024-01-15',
      },
      {
        type: 'Residence Permit (Permit B)',
        number: `B-${String(clientId).padStart(6, '0')}`,
        issuingCountry: 'Switzerland',
        issueDate: '2023-06-01',
        expiryDate: permitExpiryDate.toISOString().split('T')[0],
        verifiedDate: '2023-06-10',
      },
    ],
    kycStatus: {
      currentRiskLevel: 'Low',
      pepStatus: isPEP,
      sanctionsScreeningStatus: 'Clear',
      lastReviewDate: '2025-09-15',
      nextReviewDate: kycReviewDate.toISOString().split('T')[0],
    },
    taxInformation: {
      taxResidencyCountries: ['Switzerland', 'Germany'],
      taxIdNumbers: ['CHE-123.456.789', 'DE-987654321'],
      crsStatus: 'Compliant',
      usPerson: false,
    },
    financialProfile: {
      sourceOfWealth: 'Employment income, inheritance',
      estimatedAssetsRange: 'CHF 5M - 10M',
      sourceOfFunds: 'Salary, dividends, real estate income',
      purposeOfRelationship: 'Wealth management and investment advisory',
    },
    kycScreeningHistory,
    currentRiskAssessment: {
      overallRisk: isPEP ? 'Medium' : 'Low',
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Standard retail client profile'],
      lastAssessmentDate: '2025-02-10',
      nextReviewDate: kycReviewDate.toISOString().split('T')[0],
    },
    alerts,
  };
}
