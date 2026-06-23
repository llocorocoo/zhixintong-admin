export type Role = 'admin' | 'channel';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  channelId?: string;
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

export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled';
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
  channelId: string;
  channelName: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
