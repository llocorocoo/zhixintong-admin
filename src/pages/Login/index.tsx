import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { useTheme } from '@/store/useTheme';
import { mockUsers } from '@/mock/data';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mode } = useTheme();
  const isDark = mode === 'dark';

  const onFinish = (values: { username: string; password: string }) => {
    const user = mockUsers.find(
      (u) => u.username === values.username && u.password === values.password
    );
    if (user) {
      const { password: _, ...userInfo } = user;
      login(userInfo, 'mock-token-' + user.id);
      message.success('登录成功');
      navigate('/');
    } else {
      message.error('用户名或密码错误');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark
        ? 'linear-gradient(135deg, #0a1628 0%, #1b2838 100%)'
        : 'linear-gradient(135deg, #1a2b4a 0%, #2c3e50 100%)',
    }}>
      <Card style={{ width: 400, boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32, color: isDark ? '#dce4ec' : '#2c3e50' }}>
          职信通后台管理系统
        </h2>
        <Form name="login" onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登 录
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            超管: admin / admin123 &nbsp;|&nbsp; 管理员: admin02 / admin123 &nbsp;|&nbsp; 纯渠道: channel01 / 123456 &nbsp;|&nbsp; OEM: channel02 / 123456
          </div>
        </Form>
      </Card>
    </div>
  );
}
