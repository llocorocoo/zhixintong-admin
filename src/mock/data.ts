import type { Channel, Order, Transaction, Account, User } from '@/types';

export const mockUsers: (User & { password: string })[] = [
  { id: '1', username: 'admin', password: 'admin123', name: '系统管理员', role: 'admin', isSuperAdmin: true },
  { id: '2', username: 'channel01', password: '123456', name: '张三', role: 'channel', channelId: 'ch1' },
  { id: '3', username: 'channel02', password: '123456', name: '李四', role: 'channel', channelId: 'ch2' },
  { id: '4', username: 'admin02', password: 'admin123', name: '运营专员', role: 'admin', isSuperAdmin: false, permissions: ['channel:view', 'channel:pure_detail', 'order:view', 'transaction:view'] },
];

export const mockChannels: Channel[] = [
  {
    id: 'ch1', name: '信达渠道', contact: '张三', phone: '13800138001',
    type: 'pure', status: 'active', promoCode: 'XD2024',
    promoLink: 'https://zhixintong.com/r/XD2024', createdAt: '2024-01-15',
  },
  {
    id: 'ch2', name: '华信科技', contact: '李四', phone: '13800138002',
    type: 'oem', status: 'active', promoCode: 'HX2024',
    promoLink: 'https://zhixintong.com/r/HX2024',
    domain: 'report.huaxin.com', logo: '', createdAt: '2024-02-20',
  },
  {
    id: 'ch3', name: '诚信数据', contact: '王五', phone: '13800138003',
    type: 'pure', status: 'inactive', promoCode: 'CX2024',
    promoLink: 'https://zhixintong.com/r/CX2024', createdAt: '2024-03-10',
  },
  {
    id: 'ch4', name: '鼎信服务', contact: '赵六', phone: '13800138004',
    type: 'oem', status: 'active', promoCode: 'DX2024',
    promoLink: 'https://zhixintong.com/r/DX2024',
    domain: 'check.dingxin.cn', logo: '', createdAt: '2024-04-05',
  },
];

export const mockOrders: Order[] = [
  { id: 'o1', orderNo: 'ORD20240601001', userName: '用户A', userPhone: '139****1001', reportType: 'basic', amount: 29.9, status: 'completed', channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-01 10:30:00' },
  { id: 'o2', orderNo: 'ORD20240601002', userName: '用户B', userPhone: '139****1002', reportType: 'standard', amount: 59.9, status: 'completed', channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-01 11:20:00' },
  { id: 'o3', orderNo: 'ORD20240602001', userName: '用户C', userPhone: '139****1003', reportType: 'premium', amount: 99.9, status: 'paid', channelId: 'ch2', channelName: '华信科技', createdAt: '2024-06-02 09:15:00' },
  { id: 'o4', orderNo: 'ORD20240602002', userName: '用户D', userPhone: '139****1004', reportType: 'basic', amount: 29.9, status: 'pending', channelId: 'ch2', channelName: '华信科技', createdAt: '2024-06-02 14:00:00' },
  { id: 'o5', orderNo: 'ORD20240603001', userName: '用户E', userPhone: '139****1005', reportType: 'standard', amount: 59.9, status: 'cancelled', channelId: 'ch3', channelName: '诚信数据', createdAt: '2024-06-03 16:45:00' },
  { id: 'o6', orderNo: 'ORD20240604001', userName: '用户F', userPhone: '139****1006', reportType: 'premium', amount: 99.9, status: 'completed', channelId: 'ch4', channelName: '鼎信服务', createdAt: '2024-06-04 08:30:00' },
  { id: 'o7', orderNo: 'ORD20240605001', userName: '用户G', userPhone: '139****1007', reportType: 'basic', amount: 29.9, status: 'completed', channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-05 12:00:00' },
  { id: 'o8', orderNo: 'ORD20240606001', userName: '用户H', userPhone: '139****1008', reportType: 'standard', amount: 59.9, status: 'paid', channelId: 'ch4', channelName: '鼎信服务', createdAt: '2024-06-06 10:10:00' },
];

export const mockTransactions: Transaction[] = [
  { id: 't1', transactionNo: 'TXN20240601001', orderNo: 'ORD20240601001', type: 'income', amount: 29.9, channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-01 10:30:05' },
  { id: 't2', transactionNo: 'TXN20240601002', orderNo: 'ORD20240601002', type: 'income', amount: 59.9, channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-01 11:20:05' },
  { id: 't3', transactionNo: 'TXN20240602001', orderNo: 'ORD20240602001', type: 'income', amount: 99.9, channelId: 'ch2', channelName: '华信科技', createdAt: '2024-06-02 09:15:05' },
  { id: 't4', transactionNo: 'TXN20240602002', orderNo: 'ORD20240602002', type: 'income', amount: 29.9, channelId: 'ch2', channelName: '华信科技', createdAt: '2024-06-02 14:00:05' },
  { id: 't5', transactionNo: 'TXN20240603001', orderNo: 'ORD20240603001', type: 'refund', amount: -59.9, channelId: 'ch3', channelName: '诚信数据', createdAt: '2024-06-03 17:00:00' },
  { id: 't6', transactionNo: 'TXN20240604001', orderNo: 'ORD20240604001', type: 'income', amount: 99.9, channelId: 'ch4', channelName: '鼎信服务', createdAt: '2024-06-04 08:30:05' },
  { id: 't7', transactionNo: 'TXN20240605001', orderNo: 'ORD20240605001', type: 'income', amount: 29.9, channelId: 'ch1', channelName: '信达渠道', createdAt: '2024-06-05 12:00:05' },
  { id: 't8', transactionNo: 'TXN20240606001', orderNo: 'ORD20240606001', type: 'income', amount: 59.9, channelId: 'ch4', channelName: '鼎信服务', createdAt: '2024-06-06 10:10:05' },
];

export const mockAccounts: Account[] = [
  { id: 'a1', username: 'channel01', name: '张三', channelId: 'ch1', channelName: '信达渠道', status: 'active', createdAt: '2024-01-15' },
  { id: 'a2', username: 'channel02', name: '李四', channelId: 'ch2', channelName: '华信科技', status: 'active', createdAt: '2024-02-20' },
  { id: 'a3', username: 'channel03', name: '王五', channelId: 'ch3', channelName: '诚信数据', status: 'inactive', createdAt: '2024-03-10' },
  { id: 'a4', username: 'channel04', name: '赵六', channelId: 'ch4', channelName: '鼎信服务', status: 'active', createdAt: '2024-04-05' },
];
