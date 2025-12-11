import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({ default: module.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(module => ({ default: module.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(module => ({ default: module.ResetPasswordPage })));
const AskQuestionPage = lazy(() => import('./pages/AskQuestionPage').then(module => ({ default: module.AskQuestionPage })));
const QuestionDetailPage = lazy(() => import('./pages/QuestionDetailPage').then(module => ({ default: module.QuestionDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(module => ({ default: module.UserManagement })));
const UserDetails = lazy(() => import('./pages/admin/UserDetails').then(module => ({ default: module.UserDetails })));
const SearchPage = lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then(module => ({ default: module.CategoriesPage })));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage').then(module => ({ default: module.BookmarksPage })));
const TopicPage = lazy(() => import('./pages/TopicPage').then(module => ({ default: module.TopicPage })));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage').then(module => ({ default: module.PreferencesPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskQuestionPage />} />
          <Route path="/question/:id" element={<QuestionDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/topic/:tag" element={<TopicPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/:id" element={<UserDetails />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
