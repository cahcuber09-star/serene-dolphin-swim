import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AttendanceProvider } from "./contexts/AttendanceContext";
import { StudentProvider } from "./contexts/StudentContext"; // New Student Context
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout"; // New Layout
import LoginPage from "./pages/LoginPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// New Pages
import HomePage from "./pages/HomePage";
import StudentManagementPage from "./pages/StudentManagementPage";
import DailyAttendancePage from "./pages/DailyAttendancePage";
import RecapReportPage from "./pages/RecapReportPage";
import StudentHistoryPage from "./pages/StudentHistoryPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AttendanceProvider>
        <AuthProvider>
          <StudentProvider> {/* Wrap with StudentProvider */}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes using Layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/dashboard/students" element={<StudentManagementPage />} />
                    <Route path="/dashboard/attendance" element={<DailyAttendancePage />} />
                    <Route path="/dashboard/recap" element={<RecapReportPage />} />
                    <Route path="/dashboard/history" element={<StudentHistoryPage />} />
                  </Route>
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </StudentProvider>
        </AuthProvider>
      </AttendanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;