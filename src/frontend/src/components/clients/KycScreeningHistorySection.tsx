import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface KycScreeningRecord {
  date: string;
  screeningType: 'Initial' | 'Periodic' | 'Event-triggered';
  riskLevelResult: string;
  pepCheckResult: 'Clear' | 'Match';
  sanctionsCheckResult: 'Clear' | 'Hit';
  screenedBy: string;
  notes: string;
}

interface KycScreeningHistorySectionProps {
  screenings: KycScreeningRecord[];
}

export default function KycScreeningHistorySection({ screenings }: KycScreeningHistorySectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">KYC Screening History</h2>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Screening Type</TableHead>
                  <TableHead>Risk Level Result</TableHead>
                  <TableHead>PEP Check Result</TableHead>
                  <TableHead>Sanctions Check Result</TableHead>
                  <TableHead>Screened By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screenings.map((screening, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap">{screening.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {screening.screeningType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          screening.riskLevelResult === 'High'
                            ? 'destructive'
                            : screening.riskLevelResult === 'Medium'
                            ? 'secondary'
                            : 'outline'
                        }
                        className={
                          screening.riskLevelResult === 'Low'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : screening.riskLevelResult === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : ''
                        }
                      >
                        {screening.riskLevelResult}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={screening.pepCheckResult === 'Match' ? 'secondary' : 'outline'}
                        className={
                          screening.pepCheckResult === 'Clear'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        }
                      >
                        {screening.pepCheckResult}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={screening.sanctionsCheckResult === 'Hit' ? 'destructive' : 'outline'}
                        className={
                          screening.sanctionsCheckResult === 'Clear'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : ''
                        }
                      >
                        {screening.sanctionsCheckResult}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{screening.screenedBy}</TableCell>
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground">{screening.notes}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
