import { useAuth } from '@/store/useAuth';
import type { Permission } from '@/types';

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user || user.role !== 'admin') return false;
    if (user.isSuperAdmin) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  const isSuperAdmin = user?.isSuperAdmin === true;

  return { hasPermission, isSuperAdmin };
}
