import { create } from 'zustand';
import type { SysRole } from '@/types';
import { mockRoles } from '@/mock/data';

interface RoleState {
  roles: SysRole[];
  addRole: (role: SysRole) => void;
  updateRole: (id: string, data: Partial<SysRole>) => void;
  deleteRole: (id: string) => void;
}

export const useRoles = create<RoleState>((set) => ({
  roles: [...mockRoles],
  addRole: (role) =>
    set((state) => ({ roles: [...state.roles, role] })),
  updateRole: (id, data) =>
    set((state) => ({
      roles: state.roles.map((r) => (r.id === id ? { ...r, ...data } : r)),
    })),
  deleteRole: (id) =>
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) })),
}));
