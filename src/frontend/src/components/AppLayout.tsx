import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Users, Workflow, ShieldCheck, FileBarChart, Settings, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyAdminEntry } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AppLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: adminEntry } = useGetMyAdminEntry({ enabled: !!identity });

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Workflow, label: 'Onboarding', path: '/onboarding' },
    { icon: ShieldCheck, label: 'KYC Screening', path: '/kyc-screening' },
    { icon: FileBarChart, label: 'Reports', path: '/reports' },
  ];

  const settingsNavItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // Determine the display role from admin entry
  const displayRole = adminEntry 
    ? (adminEntry.role === 'operator' ? 'Admin' : 'Staff')
    : 'User';

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border">
        <SidebarHeader className="border-b border-border px-6 py-5">
          <img
            src="/assets/generated/fe-swiss-financial-wordmark.dim_800x200.png"
            alt="FE Swiss Financial"
            className="h-8 w-auto"
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate({ to: item.path })}
                      isActive={currentPath === item.path}
                      className="w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="my-2" />
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsNavItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate({ to: item.path })}
                      isActive={currentPath === item.path}
                      className="w-full"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border p-4">
          {userProfile && (
            <>
              <div className="mb-3 px-2">
                <p className="text-sm font-medium text-foreground">{userProfile.name}</p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {displayRole}
                </Badge>
              </div>
              <SidebarSeparator className="mb-3" />
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col md:ml-[220px]">
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-2">
            <div className="flex items-center">
              <span>© {new Date().getFullYear()} FE Swiss Financial. Built with love using </span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 underline hover:text-foreground"
              >
                caffeine.ai
              </a>
            </div>
            <span className="hidden sm:inline">•</span>
            <span className="text-gray-500">v42</span>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
