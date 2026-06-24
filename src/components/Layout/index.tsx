import { useState } from 'react';
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
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/store/useAuth';

const { Header, Sider, Content } = Layout;

interface BreadcrumbItem {
  title: string;
  parent?: string;
}

const breadcrumbMap: Record<string, BreadcrumbItem> = {
  '/': { title: '仪表盘' },
  '/channel': { title: '渠道商管理' },
  '/channel/my': { title: '渠道详情' },
  '/account': { title: '账号管理' },
  '/order': { title: '订单管理' },
  '/transaction': { title: '交易明细' },
  '/settings': { title: '系统配置' },
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

const adminMenuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/channel', icon: <TeamOutlined />, label: '渠道商管理' },
  { key: '/account', icon: <UserOutlined />, label: '账号管理' },
  { key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统配置' },
  {
    key: '/user-center', icon: <IdcardOutlined />, label: '用户中心',
    children: [
      { key: '/user-center/profile', label: '基本信息' },
    ],
  },
];

const channelMenuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/channel/my', icon: <LinkOutlined />, label: '渠道详情' },
  { key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' },
  {
    key: '/user-center', icon: <IdcardOutlined />, label: '用户中心',
    children: [
      { key: '/user-center/profile', label: '基本信息' },
    ],
  },
];

function getSelectedKey(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/user-center/')) return pathname;
  if (pathname === '/user-center') return '/user-center/profile';
  if (pathname.startsWith('/channel/my')) return '/channel/my';
  if (pathname.startsWith('/channel')) return '/channel';
  if (pathname.startsWith('/order')) return '/order';
  if (pathname.startsWith('/transaction')) return '/transaction';
  return '/' + pathname.split('/')[1];
}

function getOpenKeys(pathname: string): string[] {
  if (pathname.startsWith('/user-center')) return ['/user-center'];
  return [];
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'admin' ? adminMenuItems : channelMenuItems;
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
          defaultOpenKeys={getOpenKeys(location.pathname)}
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
          <Dropdown menu={{ items: dropdownItems, onClick: onDropdownClick }} placement="bottomRight">
            <div className="header-user">
              <Avatar size="small" icon={<UserOutlined />} style={{ background: '#2980b9' }} />
              <span>欢迎您，{user?.name}</span>
            </div>
          </Dropdown>
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
