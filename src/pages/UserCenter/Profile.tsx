import { useState } from 'react';
import { Avatar, Tag, Modal, Form, Input, message } from 'antd';
import { UserOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { useChannels } from '@/store/useChannels';

export default function Profile() {
  const { user } = useAuth();
  const { channels } = useChannels();
  const channel = channels.find((c) => c.id === user?.channelId);

  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [pwdForm] = Form.useForm();
  const [emailForm] = Form.useForm();

  // Mock state
  const [email, setEmail] = useState('');
  const [phone] = useState('131****9819');

  const handlePasswordChange = () => {
    pwdForm.validateFields().then((values) => {
      if (values.newPassword !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      pwdForm.resetFields();
      setPwdModalOpen(false);
      message.success('密码修改成功');
    });
  };

  const handleEmailBind = () => {
    emailForm.validateFields().then((values) => {
      setEmail(values.email);
      emailForm.resetFields();
      setEmailModalOpen(false);
      message.success('邮箱绑定成功');
    });
  };

  const registerId = `2026${user?.id?.padStart(16, '0') || '0000000000000000'}`;

  return (
    <div style={{ background: 'var(--content-bg)', border: '1px solid var(--search-border)' }}>
      {/* 顶部：头像 + 认证信息 + 注册ID */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '32px 40px',
        borderBottom: '1px dashed var(--search-border)',
      }}>
        <Avatar size={80} icon={<UserOutlined />} style={{ background: '#c0c0c0', flexShrink: 0 }} />
        <div style={{ marginLeft: 24 }}>
          <div style={{ marginBottom: 10 }}>
            <span style={{ color: 'var(--text-secondary)', marginRight: 12 }}>角色认证：</span>
            <Tag color={user?.role === 'admin' ? 'blue' : 'green'} style={{ fontSize: 14 }}>
              {user?.role === 'admin' ? '平台管理员' : '渠道商'}
            </Tag>
            {channel && (
              <>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 20, marginRight: 12 }}>所属渠道：</span>
                <span style={{ color: 'var(--table-link)' }}>{channel.name}</span>
                <Tag color={channel.type === 'oem' ? 'purple' : 'blue'} style={{ marginLeft: 8 }}>
                  {channel.type === 'oem' ? 'OEM' : '纯渠道'}
                </Tag>
              </>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)', marginRight: 12 }}>注册ID：</span>
            <span style={{ color: 'var(--text-primary)', fontSize: 15 }}>{registerId}</span>
          </div>
        </div>
      </div>

      {/* 登录密码 */}
      <ProfileRow
        label="登录密码"
        content="安全性高的密码可以使帐号更安全。建议您定期更换密码，设置一个包含字母、符号、数字且长度超过6位的密码。"
        status={<StatusTag done text="已设置" />}
        action={<a style={{ color: '#2980b9' }} onClick={() => setPwdModalOpen(true)}>修改</a>}
      />

      {/* 手机绑定 */}
      <ProfileRow
        label="手机绑定"
        content={
          <span>
            您已绑定了手机<span style={{ color: '#2980b9' }}>{phone}</span>
            （您的手机号为登录手机，可以找回登录密码）
          </span>
        }
        status={<StatusTag done text="已绑定" />}
        action={<a style={{ color: '#2980b9' }}>修改</a>}
      />

      {/* 邮箱绑定 */}
      <ProfileRow
        label="邮箱绑定"
        content={email ? <span>已绑定邮箱 <span style={{ color: '#2980b9' }}>{email}</span></span> : '未绑定邮箱'}
        status={email ? <StatusTag done text="已绑定" /> : <StatusTag done={false} text="未设置" />}
        action={
          <a style={{ color: '#2980b9' }} onClick={() => setEmailModalOpen(true)}>
            {email ? '修改' : '绑定'}
          </a>
        }
        isLast
      />

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={pwdModalOpen}
        onOk={handlePasswordChange}
        onCancel={() => { pwdForm.resetFields(); setPwdModalOpen(false); }}
        okText="确认修改"
        cancelText="取消"
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="oldPassword" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" rules={[{ required: true, message: '请再次输入新密码' }]}>
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 绑定邮箱弹窗 */}
      <Modal
        title={email ? '修改邮箱' : '绑定邮箱'}
        open={emailModalOpen}
        onOk={handleEmailBind}
        onCancel={() => { emailForm.resetFields(); setEmailModalOpen(false); }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={emailForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function StatusTag({ done, text }: { done: boolean; text: string }) {
  return (
    <span style={{ color: done ? '#52c41a' : '#faad14', whiteSpace: 'nowrap' }}>
      {done ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
      <span style={{ marginLeft: 4 }}>{text}</span>
    </span>
  );
}

function ProfileRow({ label, content, status, action, isLast }: {
  label: string;
  content: React.ReactNode;
  status: React.ReactNode;
  action: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '20px 40px',
      borderBottom: isLast ? 'none' : '1px dashed var(--search-border)',
    }}>
      <div style={{ width: 80, color: 'var(--text-secondary)', flexShrink: 0, fontSize: 14 }}>{label}</div>
      <div style={{ flex: 1, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>{content}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, marginLeft: 20 }}>
        {status}
        {action}
      </div>
    </div>
  );
}
