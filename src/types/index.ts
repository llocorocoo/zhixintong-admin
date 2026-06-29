export type RoleType = 'admin' | 'channel';

export type DataScope = 'all' | 'channel';

export interface SysRole {
  id: string;
  name: string;
  roleKey: string;
  dataScope: DataScope;
  defaultPermissions: Permission[];
  status: 'active' | 'inactive';
  remark?: string;
  createdAt: string;
}

export type Permission =
  | 'channel:view'
  | 'channel:add'
  | 'channel:edit'
  | 'channel:toggle'
  | 'channel:pure_detail'
  | 'channel:oem_detail'
  | 'channel_account:view'
  | 'channel_account:add'
  | 'channel_account:toggle'
  | 'channel_account:reset_pwd'
  | 'order:view'
  | 'transaction:view'
  | 'settings:view'
  | 'my_channel:view';

export const ALL_PERMISSIONS: Permission[] = [
  'channel:view',
  'channel:add',
  'channel:edit',
  'channel:toggle',
  'channel:pure_detail',
  'channel:oem_detail',
  'channel_account:view',
  'channel_account:add',
  'channel_account:toggle',
  'channel_account:reset_pwd',
  'order:view',
  'transaction:view',
  'settings:view',
];

export const PERMISSION_GROUPS: { group: string; items: { key: Permission; label: string; desc: string }[] }[] = [
  {
    group: '渠道商管理',
    items: [
      { key: 'channel:view', label: '查看渠道商', desc: '查看渠道商列表和基本信息' },
      { key: 'channel:add', label: '新增渠道商', desc: '新增渠道商' },
      { key: 'channel:edit', label: '编辑渠道商', desc: '编辑渠道商基本信息' },
      { key: 'channel:toggle', label: '启用/停用渠道商', desc: '切换渠道商状态' },
      { key: 'channel:pure_detail', label: '纯渠道详情操作', desc: '管理推广链接/二维码' },
      { key: 'channel:oem_detail', label: 'OEM渠道详情操作', desc: '管理域名绑定/Logo' },
    ],
  },
  {
    group: '渠道账号',
    items: [
      { key: 'channel_account:view', label: '查看渠道账号', desc: '查看账号列表' },
      { key: 'channel_account:add', label: '新增渠道账号', desc: '创建渠道商登录账号' },
      { key: 'channel_account:toggle', label: '启用/停用渠道账号', desc: '切换账号状态' },
      { key: 'channel_account:reset_pwd', label: '重置密码', desc: '重置渠道商账号密码' },
    ],
  },
  {
    group: '订单管理',
    items: [
      { key: 'order:view', label: '查看订单', desc: '查看订单列表和详情' },
    ],
  },
  {
    group: '交易明细',
    items: [
      { key: 'transaction:view', label: '查看交易', desc: '查看交易明细' },
    ],
  },
  {
    group: '系统配置',
    items: [
      { key: 'settings:view', label: '系统配置', desc: '查看和修改配置' },
    ],
  },
];

export const ALL_CHANNEL_PERMISSIONS: Permission[] = [
  'my_channel:view',
  'order:view',
  'transaction:view',
];

export const CHANNEL_PERMISSION_GROUPS: { group: string; items: { key: Permission; label: string; desc: string }[] }[] = [
  {
    group: '渠道信息',
    items: [
      { key: 'my_channel:view', label: '查看渠道详情', desc: '查看本渠道详情信息' },
    ],
  },
  {
    group: '订单管理',
    items: [
      { key: 'order:view', label: '查看订单', desc: '查看订单列表和详情' },
    ],
  },
  {
    group: '交易明细',
    items: [
      { key: 'transaction:view', label: '查看交易明细', desc: '查看交易明细记录' },
    ],
  },
];

export interface User {
  id: string;
  username: string;
  name: string;
  role: RoleType;
  roleId?: string;
  channelId?: string;
  isSuperAdmin?: boolean;
  permissions?: Permission[];
}

export type ChannelType = 'pure' | 'oem';
export type ChannelStatus = 'active' | 'inactive';

export interface Channel {
  id: string;
  name: string;
  contact: string;
  phone: string;
  type: ChannelType;
  status: ChannelStatus;
  promoCode: string;
  promoLink: string;
  domain?: string;
  logo?: string;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type ReportType = 'basic' | 'standard' | 'premium';

export interface Order {
  id: string;
  orderNo: string;
  userName: string;
  userPhone: string;
  reportType: ReportType;
  amount: number;
  status: OrderStatus;
  channelId: string;
  channelName: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionNo: string;
  orderNo: string;
  type: 'income' | 'refund';
  amount: number;
  channelId: string;
  channelName: string;
  createdAt: string;
}

export interface Account {
  id: string;
  username: string;
  name: string;
  roleId?: string;
  channelId: string;
  channelName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  permissions?: Permission[];
}
