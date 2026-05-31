import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/client/Dashboard";
import AdminDashboard from "./pages/admin/Dashboard";
import ApplyLoan from "./pages/client/ApplyLoan";
import MyLoans from "./pages/client/MyLoans";
import LoanDetails from "./pages/client/LoanDetails";
import Profile from "./pages/client/Profile";
import ManageUsers from "./pages/admin/ManageUsers";
import LoanApplications from "./pages/admin/LoanApplications";
import ReviewLoan from "./pages/admin/ReviewLoan";
import Reports from "./pages/admin/Reports";
import Header from "./components/layout/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentHistory from "./pages/client/PaymentHistory";
import OverduePayments from "./pages/admin/OverduePayments";
import Credits from "./pages/Credits";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Simulation from "./pages/Simulation";
import CreateClientLoan from "./pages/admin/CreateClientLoan";
import About from "./pages/About";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ChatWidget from "./components/ui/ChatWidget";

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/how" element={<HowItWorks />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/simulate" element={<Simulation />} />
            <Route path="/about" element={<About />} />

            {/* Client protected routes */}
            <Route element={<ProtectedRoute allowedRoles={["client"]} />}>
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/client/apply-loan" element={<ApplyLoan />} />
              <Route path="/client/loans" element={<MyLoans />} />
              <Route path="/client/loans/:id" element={<LoanDetails />} />
              <Route path="/client/profile" element={<Profile />} />
              <Route path="/client/payments" element={<PaymentHistory />} />
            </Route>

            {/* Admin protected routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["admin"]} />}
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/create-loan" element={<CreateClientLoan />} />
              <Route path="/admin/loans" element={<LoanApplications />} />
              <Route path="/admin/loans/:id" element={<ReviewLoan />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/overdue" element={<OverduePayments />} />
              <Route path="/admin/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
        </main>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
