import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import NewPasswordPage from "./pages/NewPassword";
import LaunchPage from "./pages/Launch";
import JenisKelaminPage from "./pages/Question_JenisKelamin";
import TanggunganPage from "./pages/Question_Tanggungan";
import PekerjaanPage from "./pages/Question_Pekerjaan";
import AssetPage from "./pages/Question_Asset";
import UtangPage from "./pages/Question_Utang";
import LoadingPage from "./pages/Loading";
import HomePage from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import ChatbotPage from "./pages/ChatbotPage";
import FinancialOverviewPage from "./pages/FinancialOverviewPage";
import ProtectedRoute from "./components/ProtectedRoute";
import OnboardingPage from "./pages/OnboardingPage";
import OnboardingPageTwo from "./pages/OnboardingPageTwo";
import OnboardingPageThree from "./pages/OnboardingPageThree";
import AssetsPage from "./pages/AssetsPage";

import { auth } from "./firebase";
import { User, onAuthStateChanged } from "firebase/auth";

const queryClient = new QueryClient();

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {loadingAuth ? (
            <LoadingPage />
          ) : (
            <Routes>
              <Route path="/" element={<LaunchPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/onboarding-2" element={<OnboardingPageTwo />} />
              <Route path="/onboarding-3" element={<OnboardingPageThree />} />
              <Route
                path="/auth"
                element={currentUser ? <Navigate to="/home" replace /> : <AuthPage />}
              />
              <Route
                path="/login"
                element={currentUser ? <Navigate to="/home" replace /> : <LoginPage />}
              />
              <Route
                path="/signup"
                element={currentUser ? <Navigate to="/home" replace /> : <SignupPage />}
              />
              <Route path="/new-password" element={<NewPasswordPage />} />

              <Route element={<ProtectedRoute currentUser={currentUser} />}>
                <Route path="/input" element={<Index />} />
                <Route path="/jk" element={<JenisKelaminPage />} />
                <Route path="/tanggungan" element={<TanggunganPage />} />
                <Route path="/pekerjaan" element={<PekerjaanPage />} />
                <Route path="/asset" element={<AssetPage />} />
                <Route path="/utang" element={<UtangPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/onboarding-2" element={<OnboardingPageTwo />} />
                <Route path="/onboarding-3" element={<OnboardingPageThree />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/detail" element={<DetailPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/overview" element={<FinancialOverviewPage />} />
                <Route path="/assets-list" element={<AssetsPage />} />
              </Route>

              <Route path="/load" element={<LoadingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
