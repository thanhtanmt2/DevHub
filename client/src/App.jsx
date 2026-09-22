import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import CandidateLayout from '@/layouts/CandidateLayout';
import EmployerLayout from '@/layouts/EmployerLayout';
import AdminLayout from '@/layouts/AdminLayout';

// Auth pages
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import VerifyEmailPage from '@/pages/auth/VerifyEmailPage';

// Modals
import AuthModal from '@/components/auth/AuthModal';

// Public pages
import HomePage from '@/pages/public/HomePage';
import JobsPage from '@/pages/public/JobsPage';
import ProjectsPage from '@/pages/public/ProjectsPage';
import JobDetailPage from '@/pages/public/JobDetailPage';

// Candidate pages
import CandidateDashboard from '@/pages/candidate/CandidateDashboard';
import ProfilePage from '@/pages/candidate/ProfilePage';
import MyApplicationsPage from '@/pages/candidate/MyApplicationsPage';
import CandidateWorkspacePage from '@/pages/candidate/WorkspacePage';
import ManagedProjectsPage from '@/pages/candidate/ManagedProjectsPage';

// Employer pages
import EmployerDashboard from '@/pages/employer/EmployerDashboard';
import ManageJobsPage from '@/pages/employer/ManageJobsPage';
import SearchCandidatesPage from '@/pages/employer/SearchCandidatesPage';
import ManageApplicationsPage from '@/pages/employer/ManageApplicationsPage';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import ManageSkillsPage from '@/pages/admin/ManageSkillsPage';
import InternalProjectsPage from '@/pages/admin/InternalProjectsPage';
import AdminWorkspacePage from '@/pages/admin/WorkspacePage';
import PaymentsPage from '@/pages/admin/PaymentsPage';
import StatsPage from '@/pages/admin/StatsPage';

// Components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AuthProvider } from '@/contexts/AuthContext';

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
      </Route>

      {/* Auth */}
      <Route path="/login" element={<Navigate to="/?auth=login" replace />} />
      <Route path="/register" element={<Navigate to="/?auth=register" replace />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

      {/* Candidate */}
      <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
        <Route element={<CandidateLayout />}>
          <Route path="/candidate" element={<CandidateDashboard />} />
          <Route path="/candidate/profile" element={<ProfilePage />} />
          <Route path="/candidate/applications" element={<MyApplicationsPage />} />
          <Route path="/candidate/managed-projects" element={<ManagedProjectsPage />} />
          <Route path="/candidate/workspaces/:id" element={<CandidateWorkspacePage />} />
        </Route>
      </Route>

      {/* Employer */}
      <Route element={<ProtectedRoute allowedRoles={['EMPLOYER']} />}>
        <Route element={<EmployerLayout />}>
          <Route path="/employer" element={<EmployerDashboard />} />
          <Route path="/employer/jobs" element={<ManageJobsPage />} />
          <Route path="/employer/candidates" element={<SearchCandidatesPage />} />
          <Route path="/employer/applications" element={<ManageApplicationsPage />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/skills" element={<ManageSkillsPage />} />
          <Route path="/admin/projects" element={<InternalProjectsPage />} />
          <Route path="/admin/workspaces/:id" element={<AdminWorkspacePage />} />
          <Route path="/admin/payments" element={<PaymentsPage />} />
          <Route path="/admin/stats" element={<StatsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <AuthModal />
    </AuthProvider>
  );
}

