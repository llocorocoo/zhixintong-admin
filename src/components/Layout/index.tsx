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
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/store/useAuth';

const { Header, Sider, Content } = Layout;

const pageTitleMap: Record<string, string> = {
  '/': '仪表盘',
  '/channel': '渠道商管理',
  '/channel/my': '我的推广',
  '/account': '账号管理',
  '/order': '订单管理',
  '/transaction': '交易明细',
  '/settings': '系统配置',
};

function getPageTitle(pathname: string): string {
  if (pageTitleMap[pathname]) return pageTitleMap[pathname];
  if (pathname.startsWith('/channel/')) return '渠道商详情';
  if (pathname.startsWith('/order/')) return '订单详情';
  return '';
}

const adminMenuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/channel', icon: <TeamOutlined />, label: '渠道商管理' },
  { key: '/account', icon: <UserOutlined />, label: '账号管理' },
  { key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统配置' },
];

const channelMenuItems: MenuProps['items'] = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/channel/my', icon: <LinkOutlined />, label: '我的推广' },
  { key: '/order', icon: <ShoppingCartOutlined />, label: '订单管理' },
  { key: '/transaction', icon: <TransactionOutlined />, label: '交易明细' },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'admin' ? adminMenuItems : channelMenuItems;
  const pageTitle = getPageTitle(location.pathname);

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
          selectedKeys={[location.pathname === '/' ? '/' : '/' + location.pathname.split('/')[1] + (location.pathname.split('/')[2] === 'my' ? '/my' : '')]}
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
          {pageTitle}
        </div>

        <Content className="app-content">
          {pageTitle && <div className="page-title">{pageTitle}</div>}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
