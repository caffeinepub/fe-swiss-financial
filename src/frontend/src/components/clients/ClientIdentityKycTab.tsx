import IdentityDocumentsSection from './IdentityDocumentsSection';
import KycScreeningHistorySection from './KycScreeningHistorySection';
import CurrentRiskAssessmentSection from './CurrentRiskAssessmentSection';
import type { MockClientDetail } from '../../mocks/clientDetailMock';

interface ClientIdentityKycTabProps {
  mockData: MockClientDetail;
}

export default function ClientIdentityKycTab({ mockData }: ClientIdentityKycTabProps) {
  return (
    <div className="space-y-8">
      <IdentityDocumentsSection documents={mockData.identityDocuments} />
      <KycScreeningHistorySection screenings={mockData.kycScreeningHistory} />
      <CurrentRiskAssessmentSection assessment={mockData.currentRiskAssessment} />
    </div>
  );
}
