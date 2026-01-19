import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import SimpleDashboard from "./pages/SimpleDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import Tasks from "./pages/Tasks";
import Agents from "./pages/Agents";
import Mailing from "./pages/Mailing";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Quotes from "./pages/Quotes";
import Catalog from "./pages/Catalog";
import Instagram from "./pages/Instagram";
import NotFound from "./pages/NotFound";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Contact from "./pages/Contact";
import { auth } from "./services/supabase/auth";
import { User } from "@supabase/supabase-js";
import { StatusProvider } from "./contexts/StatusContext";
import { useUser } from '@/hooks/auth/useUser';
import { useUserRole } from '@/hooks/auth/useUserRole';
import { supabase } from '@/services/supabase/client';

const queryClient = new QueryClient();

// Componente para rotas protegidas que requerem autenticação
const ProtectedRoute = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await auth.currentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Componente para proteger rota de Agents
const AgentsRoute = () => {
  const { role, loading: roleLoading } = useUserRole();
  
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (role === 'admin' || role === 'manager') {
    return <Agents />;
  }
  
  return <Navigate to="/" replace />;
};

// Componente para proteger rota de Settings
const SettingsRoute = () => {
  const { role, loading: roleLoading } = useUserRole();
  
  if (roleLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (role === 'admin') {
    return <Settings />;
  }
  
  return <Navigate to="/" replace />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contact" element={<Contact />} />
            {/* Rotas protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={
                <StatusProvider>
                  <AppLayout />
                </StatusProvider>
              }>
                <Route index element={<Dashboard />} />
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="simple-dashboard" element={<SimpleDashboard />} />
                <Route path="leads" element={<Leads />} />
                <Route path="leads/:id" element={<LeadDetails />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="agents" element={<AgentsRoute />} />
                <Route path="mailing" element={<Mailing />} />
                <Route path="settings" element={<SettingsRoute />} />
                <Route path="clients" element={<Clients />} />
                <Route path="projects" element={<Projects />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="instagram" element={<Instagram />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
