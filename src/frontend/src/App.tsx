import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import AppLayout from './components/AppLayout';
import AuthGate from './components/AuthGate';
import AuthorizationGate from './components/AuthorizationGate';
import ProfileSetupDialog from './components/ProfileSetupDialog';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AddClientPage from './pages/AddClientPage';
import OnboardingPage from './pages/OnboardingPage';
import KYCScreeningPage from './pages/KYCScreeningPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function LayoutWrapper() {
  return (
    <>
      <ProfileSetupDialog />
      <AppLayout />
    </>
  );
}

function RootComponent() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  return (
    <AuthorizationGate>
      <Outlet />
    </AuthorizationGate>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: LayoutWrapper,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DashboardPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/clients',
  component: ClientsPage,
});

const clientDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/clients/$clientId',
  component: ClientDetailPage,
});

const addClientRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/add-client',
  component: AddClientPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/onboarding',
  component: OnboardingPage,
});

const kycScreeningRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/kyc-screening',
  component: KYCScreeningPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reports',
  component: ReportsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    clientsRoute,
    clientDetailRoute,
    addClientRoute,
    onboardingRoute,
    kycScreeningRoute,
    reportsRoute,
    settingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
