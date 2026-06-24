import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const menuItems: MenuProps['items'] = [
  { key: '/user-center/profile', icon: <UserOutlined />, label: '基本信息' },
];

export default function UserCenter() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{
        width: 180, flexShrink: 0, background: '#fafbfc',
        border: '1px solid #e8e8e8', borderRadius: 2,
      }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
