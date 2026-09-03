import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useGetMe } from '@workspace/api-client-react';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/layout';

import { Home } from '@/pages/home';
import { Login } from '@/pages/login';
import { Register } from '@/pages/register';
import { Dashboard } from '@/pages/dashboard';
import { Console } from '@/pages/console';
import { Contact } from '@/pages/contact';
import { ForgotPassword } from '@/pages/forgot-password';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useGetMe();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return user ? <Component /> : null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
        <Route path="/console"><ProtectedRoute component={Console} /></Route>
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
