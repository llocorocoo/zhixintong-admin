import type { ReactNode } from 'react';
import {
  DashboardOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  TransactionOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  AppstoreOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  BellOutlined,
  IdcardOutlined,
  LinkOutlined,
  FolderOutlined,
  ProfileOutlined,
  ThunderboltOutlined,
  TagsOutlined,
} from '@ant-design/icons';

// 图标名 → 图标元素。菜单数据只存字符串名，渲染时映射为组件（可持久化到 localStorage）。
export const MENU_ICONS: Record<string, ReactNode> = {
  Dashboard: <DashboardOutlined />,
  Team: <TeamOutlined />,
  ShoppingCart: <ShoppingCartOutlined />,
  Transaction: <TransactionOutlined />,
  Setting: <SettingOutlined />,
  SafetyCertificate: <SafetyCertificateOutlined />,
  Crown: <CrownOutlined />,
  Appstore: <AppstoreOutlined />,
  User: <UserOutlined />,
  Book: <BookOutlined />,
  FileText: <FileTextOutlined />,
  Bell: <BellOutlined />,
  Idcard: <IdcardOutlined />,
  Link: <LinkOutlined />,
  Folder: <FolderOutlined />,
  Profile: <ProfileOutlined />,
  Thunderbolt: <ThunderboltOutlined />,
  Tags: <TagsOutlined />,
};

export const MENU_ICON_OPTIONS = Object.keys(MENU_ICONS);

export function renderMenuIcon(name?: string): ReactNode {
  if (!name) return null;
  return MENU_ICONS[name] ?? null;
}
