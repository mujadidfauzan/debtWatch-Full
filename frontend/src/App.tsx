import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import ForgotPasswordPage from "./pages/ForgotPassword";
import NewPasswordPage from "./pages/NewPassword";
import LaunchPage from "./pages/Launch";
import UsiaPage from "./pages/Question_Usia";
import JenisKelaminPage from "./pages/Question_JenisKelamin";
import TanggunganPage from "./pages/Question_Tanggungan";
import PekerjaanPage from "./pages/Question_Pekerjaan";
import AssetPage from "./pages/Question_Asset";
import UtangPage from "./pages/Question_Utang";
import LoadingPage from "./pages/Loading";
import HomePage from "./pages/Home";
import DetailPage from "./pages/DetailPage";
import ChatbotPage from "./pages/ChatbotPage";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LaunchPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/input" element={<Index />} />
          <Route path="/usia" element={<UsiaPage />} />
          <Route path="/jk" element={<JenisKelaminPage />} />
          <Route path="/tanggungan" element={<TanggunganPage />} />
          <Route path="/pekerjaan" element={<PekerjaanPage />} />
          <Route path="/asset" element={<AssetPage />} />
          <Route path="/utang" element={<UtangPage />} />
          <Route path="/load" element={<LoadingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/detail" element={<DetailPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          

          {/* Route kustom tambahin kesini ya */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
