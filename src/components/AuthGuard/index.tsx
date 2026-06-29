import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import type { RoleType } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: RoleType[];
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
