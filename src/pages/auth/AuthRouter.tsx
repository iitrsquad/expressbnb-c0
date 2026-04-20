import { useState } from 'react';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';

type AuthPage = 'login' | 'register' | 'forgot';

interface AuthRouterProps {
  onClose: () => void;
}

export default function AuthRouter({ onClose }: AuthRouterProps) {
  const [currentPage, setCurrentPage] = useState<AuthPage>('login');

  const navigate = (page: AuthPage) => {
    setCurrentPage(page);
  };

  return (
    <>
      {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
      {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
      {currentPage === 'forgot' && <ForgotPasswordPage onNavigate={navigate} />}
    </>
  );
}
