import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatActivityLogTimestamp } from '../../utils/format';

interface ClientActivityLogTabProps {
  activityLog: string[];
}

interface ParsedLogEntry {
  timestamp: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  user: string;
}

function parseLogEntry(entry: string): ParsedLogEntry | null {
  // Format: "timestamp | fieldName | Old: oldValue | New: newValue | User: user"
  const parts = entry.split(' | ');
  if (parts.length !== 5) return null;

  return {
    timestamp: parts[0],
    fieldName: parts[1],
    oldValue: parts[2].replace('Old: ', ''),
    newValue: parts[3].replace('New: ', ''),
    user: parts[4].replace('User: ', ''),
  };
}

export default function ClientActivityLogTab({ activityLog }: ClientActivityLogTabProps) {
  const parsedEntries = activityLog
    .map(parseLogEntry)
    .filter((entry): entry is ParsedLogEntry => entry !== null)
    .reverse(); // Show most recent first

  if (parsedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet. Changes to client overview fields will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Field</TableHead>
              <TableHead>Old Value</TableHead>
              <TableHead>New Value</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm">
                  {formatActivityLogTimestamp(entry.timestamp)}
                </TableCell>
                <TableCell className="text-sm font-medium">{entry.fieldName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.oldValue || '—'}</TableCell>
                <TableCell className="text-sm">{entry.newValue || '—'}</TableCell>
                <TableCell className="text-sm">{entry.user}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
