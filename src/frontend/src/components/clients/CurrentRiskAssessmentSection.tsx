import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface CurrentRiskAssessment {
  overallRisk: string;
  riskFactors: string[];
  lastAssessmentDate: string;
  nextReviewDate: string;
}

interface CurrentRiskAssessmentSectionProps {
  assessment: CurrentRiskAssessment;
}

export default function CurrentRiskAssessmentSection({ assessment }: CurrentRiskAssessmentSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Current Risk Assessment</h2>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">Overall Risk Level</CardTitle>
              <Badge
                variant={
                  assessment.overallRisk === 'High'
                    ? 'destructive'
                    : assessment.overallRisk === 'Medium'
                    ? 'secondary'
                    : 'outline'
                }
                className={
                  assessment.overallRisk === 'Low'
                    ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100'
                    : assessment.overallRisk === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                    : ''
                }
              >
                {assessment.overallRisk} Risk
              </Badge>
            </div>
            <Button variant="default" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Initiate New Screening
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
            <ul className="space-y-1.5">
              {assessment.riskFactors.map((factor, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Last Assessment Date</p>
              <p className="text-sm font-medium mt-1">{assessment.lastAssessmentDate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Review Date</p>
              <p className="text-sm font-medium mt-1">{assessment.nextReviewDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
