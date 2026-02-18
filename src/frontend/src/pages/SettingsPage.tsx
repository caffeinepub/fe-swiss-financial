import AdminManagementSection from '../components/settings/AdminManagementSection';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-light tracking-tight text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Configure application preferences and system settings.
        </p>
      </div>
      <AdminManagementSection />
    </div>
  );
}
