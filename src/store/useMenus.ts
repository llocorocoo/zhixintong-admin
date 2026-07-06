import { create } from 'zustand';
import type { SysMenu } from '@/types';

// 默认菜单树（admin 端）——由 Layout 原硬编码菜单逐条翻译而来。
// 全部标记 system:true（预置节点不可删，仅可编辑/显隐/排序）。
const DEFAULT_MENUS: SysMenu[] = [
  { id: 'm_dash', parentId: null, name: '仪表盘', menuType: 'C', path: '/', icon: 'Dashboard', orderNum: 1, visible: true, status: 'active', system: true },

  { id: 'm_channel_mgmt', parentId: null, name: '渠道管理', menuType: 'M', path: '/channel-mgmt', icon: 'Team', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_channel', parentId: 'm_channel_mgmt', name: '渠道商列表', menuType: 'C', path: '/channel', perms: 'channel:view', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_channel_add', parentId: 'm_channel', name: '新增渠道', menuType: 'F', perms: 'channel:add', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_channel_edit', parentId: 'm_channel', name: '编辑渠道', menuType: 'F', perms: 'channel:edit', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_channel_toggle', parentId: 'm_channel', name: '启用/停用', menuType: 'F', perms: 'channel:toggle', orderNum: 3, visible: true, status: 'active', system: true },
  { id: 'm_account', parentId: 'm_channel_mgmt', name: '渠道账号', menuType: 'C', path: '/account', perms: 'channel_account:view', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_account_add', parentId: 'm_account', name: '新增账号', menuType: 'F', perms: 'channel_account:add', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_account_toggle', parentId: 'm_account', name: '启用/停用', menuType: 'F', perms: 'channel_account:toggle', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_account_reset', parentId: 'm_account', name: '重置密码', menuType: 'F', perms: 'channel_account:reset_pwd', orderNum: 3, visible: true, status: 'active', system: true },

  { id: 'm_order', parentId: null, name: '订单管理', menuType: 'C', path: '/order', icon: 'ShoppingCart', perms: 'order:view', orderNum: 3, visible: true, status: 'active', system: true },
  { id: 'm_transaction', parentId: null, name: '交易明细', menuType: 'C', path: '/transaction', icon: 'Transaction', perms: 'transaction:view', orderNum: 4, visible: true, status: 'active', system: true },

  { id: 'm_settings', parentId: null, name: '系统配置', menuType: 'M', path: '/settings', icon: 'Setting', perms: 'settings:view', orderNum: 5, visible: true, status: 'active', system: true },
  { id: 'm_permission', parentId: 'm_settings', name: '权限配置', menuType: 'M', path: '/settings/permission', icon: 'SafetyCertificate', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_perm_group', parentId: 'm_permission', name: '权限分组管理', menuType: 'C', path: '/settings/permission-group', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_perm_item', parentId: 'm_permission', name: '权限项管理', menuType: 'C', path: '/settings/permission-item', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_role', parentId: 'm_settings', name: '角色管理', menuType: 'C', path: '/settings/role', icon: 'Crown', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_menu', parentId: 'm_settings', name: '菜单管理', menuType: 'C', path: '/settings/menu', icon: 'Appstore', orderNum: 3, visible: true, status: 'active', system: true },
  { id: 'm_admin_account', parentId: 'm_settings', name: '系统账号管理', menuType: 'C', path: '/settings/admin-account', icon: 'User', orderNum: 4, visible: true, status: 'active', system: true, superAdminOnly: true },
  { id: 'm_dict', parentId: 'm_settings', name: '字典管理', menuType: 'C', path: '/settings/dict', icon: 'Book', orderNum: 5, visible: true, status: 'active', system: true },
  { id: 'm_report', parentId: 'm_settings', name: '报告配置', menuType: 'M', path: '/settings/report', icon: 'FileText', orderNum: 6, visible: true, status: 'active', system: true },
  { id: 'm_report_template', parentId: 'm_report', name: '报告模板', menuType: 'C', path: '/settings/report-template', orderNum: 1, visible: true, status: 'active', system: true },
  { id: 'm_report_content', parentId: 'm_report', name: '报告内容设置', menuType: 'C', path: '/settings/report-content', orderNum: 2, visible: true, status: 'active', system: true },
  { id: 'm_notification', parentId: 'm_settings', name: '通知配置', menuType: 'C', path: '/settings/notification', icon: 'Bell', orderNum: 7, visible: true, status: 'active', system: true },

  { id: 'm_user_center', parentId: null, name: '个人设置', menuType: 'M', path: '/user-center', icon: 'Idcard', orderNum: 6, visible: true, status: 'active', system: true },
  { id: 'm_profile', parentId: 'm_user_center', name: '基本信息', menuType: 'C', path: '/user-center/profile', orderNum: 1, visible: true, status: 'active', system: true },
];

const STORAGE_KEY = 'zxt_admin_menus';

function loadMenus(): SysMenu[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as SysMenu[];
    } catch {
      // 解析失败则回退到默认
    }
  }
  return DEFAULT_MENUS.map((m) => ({ ...m }));
}

function persist(menus: SysMenu[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
}

interface MenuState {
  menus: SysMenu[];
  addMenu: (menu: SysMenu) => void;
  updateMenu: (id: string, data: Partial<SysMenu>) => void;
  deleteMenu: (id: string) => void;         // 级联删除子节点（system 节点由页面拦截）
  toggleVisible: (id: string) => void;
  moveMenu: (id: string, dir: 'up' | 'down') => void; // 同级上下移
  resetMenus: () => void;                    // 恢复默认（演示护栏）
}

export const useMenus = create<MenuState>((set) => ({
  menus: loadMenus(),
  addMenu: (menu) =>
    set((state) => {
      const menus = [...state.menus, menu];
      persist(menus);
      return { menus };
    }),
  updateMenu: (id, data) =>
    set((state) => {
      const menus = state.menus.map((m) => (m.id === id ? { ...m, ...data } : m));
      persist(menus);
      return { menus };
    }),
  deleteMenu: (id) =>
    set((state) => {
      // 收集自身 + 所有后代
      const toRemove = new Set<string>([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const m of state.menus) {
          if (m.parentId && toRemove.has(m.parentId) && !toRemove.has(m.id)) {
            toRemove.add(m.id);
            grew = true;
          }
        }
      }
      const menus = state.menus.filter((m) => !toRemove.has(m.id));
      persist(menus);
      return { menus };
    }),
  toggleVisible: (id) =>
    set((state) => {
      const menus = state.menus.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m));
      persist(menus);
      return { menus };
    }),
  moveMenu: (id, dir) =>
    set((state) => {
      const target = state.menus.find((m) => m.id === id);
      if (!target) return state;
      const siblings = state.menus
        .filter((m) => m.parentId === target.parentId)
        .sort((a, b) => a.orderNum - b.orderNum);
      const idx = siblings.findIndex((m) => m.id === id);
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= siblings.length) return state;
      const a = siblings[idx];
      const b = siblings[swapIdx];
      const menus = state.menus.map((m) => {
        if (m.id === a.id) return { ...m, orderNum: b.orderNum };
        if (m.id === b.id) return { ...m, orderNum: a.orderNum };
        return m;
      });
      persist(menus);
      return { menus };
    }),
  resetMenus: () =>
    set(() => {
      const menus = DEFAULT_MENUS.map((m) => ({ ...m }));
      persist(menus);
      return { menus };
    }),
}));
