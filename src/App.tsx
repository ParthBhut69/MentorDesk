import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AskQuestionPage } from './pages/AskQuestionPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { UserDetails } from './pages/admin/UserDetails';
import { SearchPage } from './pages/SearchPage';

import { NotificationsPage } from './pages/NotificationsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { TopicPage } from './pages/TopicPage';

function App() {
  return (
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

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<UserManagement />} />
      <Route path="/admin/users/:id" element={<UserDetails />} />
    </Routes>
  );
}

export default App;
