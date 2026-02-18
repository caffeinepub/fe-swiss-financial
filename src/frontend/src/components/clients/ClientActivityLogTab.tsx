import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientActivityLogTabProps {
  activityLog: string[];
}

interface ParsedLogEntry {
  timestamp: number;
  user: string;
  action: string;
  details: string;
  ip: string;
}

function parseLogEntry(entry: string): ParsedLogEntry | null {
  try {
    // New format: JSON string with timestamp, user, action, details, ip
    const parsed = JSON.parse(entry);
    return {
      timestamp: parsed.timestamp || 0,
      user: parsed.user || 'Unknown user',
      action: parsed.action || 'Updated',
      details: parsed.details || '',
      ip: parsed.ip || '—',
    };
  } catch {
    // Fallback: try old format "timestamp | fieldName | Old: oldValue | New: newValue | User: user"
    const parts = entry.split(' | ');
    if (parts.length === 5) {
      const timestamp = parts[0];
      const fieldName = parts[1];
      const oldValue = parts[2].replace('Old: ', '');
      const newValue = parts[3].replace('New: ', '');
      const user = parts[4].replace('User: ', '');
      
      // Convert old format to new structure
      let timestampMs = 0;
      try {
        const ns = BigInt(timestamp);
        timestampMs = Number(ns / BigInt(1000000));
      } catch {
        timestampMs = Date.now();
      }
      
      return {
        timestamp: timestampMs,
        user: user || 'Unknown user',
        action: 'Updated',
        details: `${fieldName}: "${oldValue}" → "${newValue}"`,
        ip: '—',
      };
    }
    
    // If parsing fails completely, return placeholder
    return {
      timestamp: Date.now(),
      user: 'Unknown user',
      action: 'Unknown',
      details: entry,
      ip: '—',
    };
  }
}

function formatDateTime(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

export default function ClientActivityLogTab({ activityLog }: ClientActivityLogTabProps) {
  const parsedEntries = activityLog
    .map(parseLogEntry)
    .filter((entry): entry is ParsedLogEntry => entry !== null)
    .sort((a, b) => b.timestamp - a.timestamp); // Sort newest first

  if (parsedEntries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity recorded yet. Changes to client data will appear here.
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
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parsedEntries.map((entry, index) => (
              <TableRow key={index}>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDateTime(entry.timestamp)}
                </TableCell>
                <TableCell className="text-sm">{entry.user}</TableCell>
                <TableCell className="text-sm font-medium">{entry.action}</TableCell>
                <TableCell className="text-sm">{entry.details}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
