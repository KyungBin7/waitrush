import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import CreateServicePage from "./pages/CreateServicePage";
import WaitlistPage from "./pages/WaitlistPage";
import NotFound from "./pages/NotFound";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import GoogleCallback from "./pages/auth/callback/GoogleCallback";
import GitHubCallback from "./pages/auth/callback/GitHubCallback";
import AuthSuccess from "./pages/auth/AuthSuccess";
import SocialSignupPage from "./pages/auth/SocialSignupPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";

const queryClient = new QueryClient();

// TODO: Replace with actual Google OAuth Client ID from environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback/google" element={<GoogleCallback />} />
            <Route path="/auth/callback/github" element={<GitHubCallback />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/social-signup" element={<SocialSignupPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <AccountSettingsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-service" 
              element={
                <ProtectedRoute>
                  <CreateServicePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/waitlist/:slug" element={<WaitlistPage />} />
            <Route path="/service/:slug" element={<ServiceDetailPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </GoogleOAuthProvider>
  </QueryClientProvider>
);

export default App;
