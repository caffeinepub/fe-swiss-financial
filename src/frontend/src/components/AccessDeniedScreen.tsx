import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            Your Principal ID is not authorized. Contact the administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please reach out to your system administrator for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
