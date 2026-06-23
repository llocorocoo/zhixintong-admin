import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import type { Role } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: Role[];
}

export default function AuthGuard({ children, roles }: AuthGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
