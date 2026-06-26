import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TransactionOutlined,
  DashboardOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  LinkOutlined,
  HomeOutlined,
  IdcardOutlined,
  SunOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/store/useAuth';
import { useTheme } from '@/store/useTheme';
import { usePermission } from '@/hooks/usePermission';
import type { Permission } from '@/types';

const { Header, Sider, Content } = Layout;

interface BreadcrumbItem {
  title: string;
  parent?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem> = {
  '/': { title: '仪表盘' },
  '/channel': { title: '渠道商管理' },
  '/channel/my': { title: '渠道详情' },
  '/account': { title: '渠道账号管理' },
  '/user-center/admin-account': { title: '管理员账号', parent: '/user-center' },
  '/order': { title: '订单管理' },
  '/transaction': { title: '交易明细' },
  '/settings': { title: '系统配置' },
  '/settings/permission-group': { title: '权限分组管理', parent: '/settings' },
  '/settings/permission-item': { title: '权限项管理', parent: '/settings' },
  '/settings/report-template': { title: '报告模板', parent: '/settings' },
  '/settings/report-content': { title: '报告内容设置', parent: '/settings' },
  '/settings/basic-params': { title: '基础参数', parent: '/settings' },
  '/settings/notification': { title: '通知配置', parent: '/settings' },
  '/user-center': { title: '用户中心' },
  '/user-center/profile': { title: '基本信息', parent: '/user-center' },
};

function getBreadcrumb(pathname: string): string[] {
  const item = breadcrumbMap[pathname];
  if (item) {
    if (item.parent) {
      const parentItem = breadcrumbMap[item.parent];
      return parentItem ? [parentItem.title, item.title] : [item.title];
    }
    return [item.title];
  }
  if (pathname.startsWith('/channel/')) return ['渠道商管理', '渠道商详情'];
  if (pathname.startsWith('/order/')) return ['订单管理', '订单详情'];
  return [''];
}

function buildAdminMenuItems(hasPermission: (p: Permission) => boolean, isSuperAdmin: boolean): MenuProps['items'] {
  const items: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  ];

  if (hasPermission('channel:view')) {
    items.push({ key: '/channel', icon: <TeamOutlined />, label: '渠道商管理' });
  }
  if (hasPermission('channel_account:view')) {
    items.push({ key: '/account', icon: <UserOutlined />, label: '渠道账号管理' });
  }
  if (hasPermission('order:view')) {
    items.push({ key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' });
  }
  if (hasPermission('transaction:view')) {
    items.push({ key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' });
  }
  if (hasPermission('settings:view')) {
    items.push({
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统配置',
      children: [
        {
          key: '/settings/permission',
          icon: <SafetyCertificateOutlined />,
          label: '权限配置',
          children: [
            { key: '/settings/permission-group', label: '权限分组管理' },
            { key: '/settings/permission-item', label: '权限项管理' },
          ],
        },
        {
          key: '/settings/report',
          icon: <FileTextOutlined />,
          label: '报告配置',
          children: [
            { key: '/settings/report-template', label: '报告模板' },
            { key: '/settings/report-content', label: '报告内容设置' },
          ],
        },
        {
          key: '/settings/platform',
          icon: <ToolOutlined />,
          label: '平台设置',
          children: [
            { key: '/settings/basic-params', label: '基础参数' },
            { key: '/settings/notification', label: '通知配置' },
          ],
        },
      ],
    });
  }

  const userCenterChildren: MenuProps['items'] = [
    { key: '/user-center/profile', label: '基本信息' },
  ];
  if (isSuperAdmin) {
    userCenterChildren.push({ key: '/user-center/admin-account', label: '管理员账号' });
  }
  items.push({
    key: '/user-center', icon: <IdcardOutlined />, label: '用户中心',
    children: userCenterChildren,
  });

  return items;
}

function buildChannelMenuItems(hasPermission: (p: Permission) => boolean): MenuProps['items'] {
  const items: MenuProps['items'] = [
    { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  ];

  if (hasPermission('my_channel:view')) {
    items.push({ key: '/channel/my', icon: <LinkOutlined />, label: '渠道详情' });
  }
  if (hasPermission('order:view')) {
    items.push({ key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' });
  }
  if (hasPermission('transaction:view')) {
    items.push({ key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' });
  }

  items.push({
    key: '/user-center', icon: <IdcardOutlined />, label: '用户中心',
    children: [
      { key: '/user-center/profile', label: '基本信息' },
    ],
  });

  return items;
}

function getSelectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/user-center/')) return pathname;
  if (pathname === '/user-center') return '/user-center/profile';
  if (pathname.startsWith('/settings/permission-')) return pathname;
  if (pathname.startsWith('/settings/report-')) return pathname;
  if (pathname.startsWith('/settings/basic-')) return pathname;
  if (pathname.startsWith('/settings/notification')) return pathname;
  if (pathname === '/settings') return '/settings/permission-group';
  if (pathname.startsWith('/channel/my')) return '/channel/my';
  if (pathname.startsWith('/channel')) return '/channel';
  if (pathname.startsWith('/order')) return '/order';
  if (pathname.startsWith('/transaction')) return '/transaction';
  return '/' + pathname.split('/')[1];
}

function getOpenKeys(pathname: string): string[] {
  const keys: string[] = [];
  if (pathname.startsWith('/user-center')) keys.push('/user-center');
  if (pathname.startsWith('/settings')) {
    keys.push('/settings');
    if (pathname.includes('permission')) keys.push('/settings/permission');
    if (pathname.includes('report')) keys.push('/settings/report');
    if (pathname.includes('basic') || pathname.includes('notification')) keys.push('/settings/platform');
  }
  return keys;
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggle } = useTheme();
  const { hasPermission, isSuperAdmin } = usePermission();

  const menuItems = user?.role === 'admin' ? buildAdminMenuItems(hasPermission, isSuperAdmin) : buildChannelMenuItems(hasPermission);

  useEffect(() => {
    setOpenKeys((prev) => {
      const fromPath = getOpenKeys(location.pathname);
      const merged = new Set([...prev, ...fromPath]);
      return Array.from(merged);
    });
  }, [location.pathname]);
  const breadcrumbs = getBreadcrumb(location.pathname);

  const dropdownItems: MenuProps['items'] = [
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ];

  const onDropdownClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        className="app-sider"
      >
        <div className="sider-logo">
          {collapsed ? '职信' : '职信通管理后台'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey(location.pathname)]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
              style={{ color: '#ffffffcc', fontSize: 16 }}
              title={mode === 'dark' ? '切换到白天模式' : '切换到黑夜模式'}
            />
            <Dropdown menu={{ items: dropdownItems, onClick: onDropdownClick }} placement="bottomRight">
              <div className="header-user">
                <Avatar size="small" icon={<UserOutlined />} style={{ background: '#2980b9' }} />
                <span>欢迎您，{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <div className="app-breadcrumb">
          <HomeOutlined style={{ marginRight: 6 }} />
          {breadcrumbs.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span style={{ margin: '0 4px' }}>&gt;&gt;</span>}
              {crumb}
            </span>
          ))}
        </div>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
