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

// 菜单节点类型：M=目录 C=菜单页 F=按钮
export type MenuType = 'M' | 'C' | 'F';

export interface SysMenu {
  id: string;
  parentId: string | null;
  name: string;
  menuType: MenuType;
  path?: string;            // 路由（目录/菜单页）
  icon?: string;            // 图标名（见 utils/menuIcons）
  perms?: Permission;       // 权限标识（菜单页/按钮），侧边栏据此鉴权
  orderNum: number;         // 同级排序，越小越靠前
  visible: boolean;         // 显隐开关
  status: 'active' | 'inactive';
  system?: boolean;         // 系统预置核心节点，不可删除
  superAdminOnly?: boolean; // 仅超级管理员可见
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
  | 'admin_account:add'
  | 'admin_account:edit'
  | 'admin_account:toggle'
  | 'admin_account:reset_pwd'
  | 'feedback:view'
  | 'feedback:assign'
  | 'feedback:reply'
  | 'feedback:close'
  | 'feedback:export'
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
  'admin_account:add',
  'admin_account:edit',
  'admin_account:toggle',
  'admin_account:reset_pwd',
  'feedback:view',
  'feedback:assign',
  'feedback:reply',
  'feedback:close',
  'feedback:export',
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
    group: '用户反馈',
    items: [
      { key: 'feedback:view', label: '查看用户反馈', desc: '查看反馈列表和详情' },
      { key: 'feedback:assign', label: '指派处理人', desc: '将反馈指派给指定处理人' },
      { key: 'feedback:reply', label: '回复反馈', desc: '回复用户并触达（站内信）' },
      { key: 'feedback:close', label: '关闭/忽略反馈', desc: '关闭已处理反馈或忽略无效反馈' },
      { key: 'feedback:export', label: '导出反馈', desc: '导出反馈记录为 Excel' },
    ],
  },
  {
    group: '系统配置',
    items: [
      { key: 'settings:view', label: '系统配置', desc: '查看和修改配置' },
    ],
  },
  {
    group: '系统账号管理',
    items: [
      { key: 'admin_account:add', label: '新增系统账号', desc: '创建系统管理账号' },
      { key: 'admin_account:edit', label: '编辑系统账号', desc: '编辑账号基础信息与角色' },
      { key: 'admin_account:toggle', label: '启用/停用账号', desc: '切换账号状态' },
      { key: 'admin_account:reset_pwd', label: '重置密码', desc: '重置账号登录密码' },
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
export type ReportType = 'occupational' | 'improvement';

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

export type PayMethod = 'alipay' | 'wechat';

export interface Transaction {
  id: string;
  transactionNo: string;
  orderNo: string;
  type: 'income' | 'refund';
  amount: number;
  payMethod: PayMethod;
  channelId: string;
  channelName: string;
  createdAt: string;
}

// ============ 用户反馈（C 端用户 → 平台，入站）============
// 与「站内信」（平台 → 用户，出站）分开建模，两者唯一交叉点是：
// 回复反馈时生成一条 bizType='feedback_reply' 的站内信推给用户。
export type FeedbackType = 'bug' | 'report_error' | 'billing' | 'suggestion' | 'other';

export type FeedbackStatus = 'pending' | 'processing' | 'replied' | 'closed' | 'ignored';

// 回复触达方式：一期仅站内信，短信/公众号先占位（通知配置里开通后启用）
export type ReplyChannel = 'notice' | 'sms' | 'wechat';

export interface Feedback {
  id: string;
  feedbackNo: string;           // 反馈编号，便于客服口头核对
  userId: string;
  userNickname: string;
  userPhone: string;            // 列表页脱敏展示
  channelId: string;            // 来源渠道，用于按渠道统计问题
  channelName: string;
  type: FeedbackType;
  content: string;
  images?: string[];            // 截图附件
  relatedOrderNo?: string;      // 关联订单/报告
  contactInfo?: string;         // 用户留的联系方式（选填）
  clientInfo?: string;          // 端/版本/机型
  status: FeedbackStatus;
  handlerId?: string;
  handlerName?: string;
  replyContent?: string;
  replyChannel?: ReplyChannel;
  replyAt?: string;
  replyBy?: string;
  internalRemark?: string;      // 内部备注，仅后台可见
  satisfaction?: number;        // 用户对回复的评价 1-5（预留，C 端暂未开放）
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  username: string;
  name: string;
  roleId?: string;
  parentId?: string | null;
  channelId: string;
  channelName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  permissions?: Permission[];
}
