import { useAuth } from '@/store/useAuth';
import type { Permission } from '@/types';

export function usePermission() {
  const { user } = useAuth();

  // 超级管理员判断：isSuperAdmin为true，或admin角色且无permissions字段（兼容旧缓存）
  const isSuperAdmin = user?.role === 'admin' && (user.isSuperAdmin === true || (!('isSuperAdmin' in user) && !user.permissions));

  const hasPermission = (permission: Permission): boolean => {
    if (!user || user.role !== 'admin') return false;
    if (isSuperAdmin) return true;
    return user.permissions?.includes(permission) ?? false;
  };

  return { hasPermission, isSuperAdmin };
}
