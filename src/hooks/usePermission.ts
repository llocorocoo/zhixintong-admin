import { useAuth } from '@/store/useAuth';
import type { Permission } from '@/types';

export function usePermission() {
  const { user } = useAuth();

  // 兼容旧缓存：admin角色且没有明确设置isSuperAdmin为false的，视为超级管理员
  const isSuperAdmin = user?.role === 'admin' && user.isSuperAdmin !== false && (user.isSuperAdmin === true || !user.permissions);

  const hasPermission = (permission: Permission): boolean => {
    if (!user || user.role !== 'admin') return false;
    if (isSuperAdmin) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return { hasPermission, isSuperAdmin };
}
