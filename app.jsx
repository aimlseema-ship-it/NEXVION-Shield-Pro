import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import { AppAuthProvider } from "@/lib/AppAuth";
import RequireAuth from "@/components/RequireAuth";
import DashboardLayout from "@/components/DashboardLayout";
import PublicToolShell from "@/components/PublicToolShell";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import MessageScanner from "@/pages/MessageScanner";
import UrlScanner from "@/pages/UrlScanner";
import ProfileScanner from "@/pages/ProfileScanner";
import ConnectApps from "@/pages/ConnectApps";
import ScanHistory from "@/pages/ScanHistory";
import Notifications from "@/pages/Notifications";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<PublicToolShell />}>
        <Route path="/try/message" element={<MessageScanner />} />
        <Route path="/try/url" element={<UrlScanner />} />
        <Route path="/try/profile" element={<ProfileScanner />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan/message" element={<MessageScanner />} />
          <Route path="/scan/url" element={<UrlScanner />} />
          <Route path="/scan/profile" element={<ProfileScanner />} />
          <Route path="/connect" element={<ConnectApps />} />
          <Route path="/history" element={<ScanHistory />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <AppAuthProvider>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
        </AppAuthProvider>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App