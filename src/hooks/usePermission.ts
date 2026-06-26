import { useAuth } from '@/store/useAuth';
import { ALL_CHANNEL_PERMISSIONS } from '@/types';
import type { Permission } from '@/types';

export function usePermission() {
  const { user } = useAuth();

  // 超级管理员判断：isSuperAdmin为true，或admin角色且无permissions字段（兼容旧缓存）
  const isSuperAdmin = user?.role === 'admin' && (user.isSuperAdmin === true || (!('isSuperAdmin' in user) && !user.permissions));

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    // admin角色
    if (user.role === 'admin') {
      if (isSuperAdmin) return true;
      return user.permissions?.includes(permission) ?? false;
    }

    // channel角色：无permissions字段时默认拥有所有渠道权限（向后兼容）
    if (user.role === 'channel') {
      if (!user.permissions) return ALL_CHANNEL_PERMISSIONS.includes(permission);
      return user.permissions.includes(permission);
    }

    return false;
  };

  return { hasPermission, isSuperAdmin };
}
