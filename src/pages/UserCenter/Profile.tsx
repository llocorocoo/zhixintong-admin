import { Card, Form, Input, Button, Divider, message, Descriptions, Tag } from 'antd';
import { useAuth } from '@/store/useAuth';
import { useChannels } from '@/store/useChannels';

export default function Profile() {
  const { user, login } = useAuth();
  const { channels } = useChannels();
  const channel = channels.find((c) => c.id === user?.channelId);

  const [emailForm] = Form.useForm();
  const [pwdForm] = Form.useForm();

  const handleEmailSave = (values: { email: string }) => {
    if (user) {
      login({ ...user, email: values.email } as typeof user & { email: string }, localStorage.getItem('token') || '');
      message.success('邮箱绑定成功');
    }
  };

  const handlePasswordChange = () => {
    pwdForm.validateFields().then((values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      pwdForm.resetFields();
      message.success('密码修改成功');
    });
  };

  return (
    <>
      <Card title="账号信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="用户名">{user?.username}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user?.name}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color={user?.role === 'admin' ? 'blue' : 'green'}>
              {user?.role === 'admin' ? '平台管理员' : '渠道商'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="企业 ID">{user?.id}</Descriptions.Item>
          {channel && (
            <>
              <Descriptions.Item label="所属渠道">{channel.name}</Descriptions.Item>
              <Descriptions.Item label="渠道类型">
                <Tag color={channel.type === 'oem' ? 'purple' : 'blue'}>
                  {channel.type === 'oem' ? 'OEM' : '纯渠道'}
                </Tag>
              </Descriptions.Item>
            </>
          )}
        </Descriptions>
      </Card>

      <Card title="绑定邮箱" style={{ marginBottom: 16 }}>
        <Form form={emailForm} layout="inline" onFinish={handleEmailSave}>
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" style={{ width: 300 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">保存</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="修改密码">
        <Form form={pwdForm} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item
            name="oldPassword"
            label="当前密码"
            rules={[{ required: true, message: '请输入当前密码' }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Divider style={{ margin: '12px 0' }} />
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            rules={[{ required: true, message: '请再次输入新密码' }]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handlePasswordChange}>修改密码</Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
