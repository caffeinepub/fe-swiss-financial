import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { formatExpiryStatusDetailed } from '../../utils/format';

interface IdentityDocument {
  type: string;
  number: string;
  issuingCountry: string;
  issueDate: string;
  expiryDate: string;
  verifiedDate: string;
}

interface IdentityDocumentsSectionProps {
  documents: IdentityDocument[];
}

export default function IdentityDocumentsSection({ documents }: IdentityDocumentsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Identity Documents</h2>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Document
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc, index) => {
          const expiryStatus = formatExpiryStatusDetailed(doc.expiryDate);
          const colorClasses = {
            green: 'bg-green-100 text-green-800 border-green-200',
            orange: 'bg-orange-100 text-orange-800 border-orange-200',
            red: 'bg-red-100 text-red-800 border-red-200',
          };

          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">{doc.type}</CardTitle>
                  <div className="flex items-center gap-1 text-xs text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Document Number:</span>
                    <span className="font-mono">{doc.number}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issuing Country:</span>
                    <span>{doc.issuingCountry}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span>{doc.issueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span>{doc.expiryDate}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`${colorClasses[expiryStatus.color]} font-medium`}
                    >
                      {expiryStatus.text}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Verified: {doc.verifiedDate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
