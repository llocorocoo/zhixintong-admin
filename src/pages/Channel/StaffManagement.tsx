import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm, Checkbox } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { useRoles } from '@/store/useRoles';
import { useChannels } from '@/store/useChannels';
import { CHANNEL_PERMISSION_GROUPS, ALL_CHANNEL_PERMISSIONS } from '@/types';
import type { Account, Permission } from '@/types';
import { mockAccounts } from '@/mock/data';

export default function StaffManagement() {
  const { user } = useAuth();
  const { roles } = useRoles();
  const { channels } = useChannels();
  const SYSTEM_ROLE_KEYS = ['super_admin', 'admin', 'channel'];
  const channelRoles = roles.filter((r) => r.dataScope === 'channel' && r.status === 'active' && !SYSTEM_ROLE_KEYS.includes(r.roleKey));
  const myChannel = channels.find((c) => c.id === user?.channelId);

  const [accounts, setAccounts] = useState<Account[]>(
    mockAccounts.filter((a) => a.channelId === user?.channelId)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
  const [createPerms, setCreatePerms] = useState<Permission[]>([]);
  const [form] = Form.useForm();

  const handleRoleChange = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setCreatePerms([...role.defaultPermissions]);
    }
  };

  const toggleStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
    message.success('状态已更新');
  };

  const resetPassword = (account: Account) => {
    message.success(`已重置 ${account.username} 的密码为默认密码`);
  };

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newAccount: Account = {
        id: 'a' + Date.now(),
        username: values.username,
        name: values.name,
        channelId: user?.channelId || '',
        channelName: myChannel?.name || '',
        roleId: values.roleId,
        permissions: [...createPerms],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      setModalOpen(false);
      form.resetFields();
      setCreatePerms([]);
      message.success('员工账号创建成功');
    });
  };

  const openPermissions = (account: Account) => {
    setEditingAccount(account);
    setSelectedPerms(account.permissions ? [...account.permissions] : [...ALL_CHANNEL_PERMISSIONS]);
    setPermModalOpen(true);
  };

  const savePermissions = () => {
    if (!editingAccount) return;
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === editingAccount.id ? { ...a, permissions: selectedPerms } : a
      )
    );
    setPermModalOpen(false);
    message.success('权限已保存');
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '角色', key: 'role',
      render: (_: unknown, record: Account) => {
        const role = roles.find((r) => r.id === record.roleId);
        return <Tag color="blue">{role?.name || '未分配'}</Tag>;
      },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Account) => (
        <Space>
          <a onClick={() => openPermissions(record)}>权限</a>
          <Popconfirm
            title={`确定${record.status === 'active' ? '停用' : '启用'}该账号？`}
            onConfirm={() => toggleStatus(record.id)}
          >
            <a style={{ color: record.status === 'active' ? '#e74c3c' : '#27ae60' }}>
              {record.status === 'active' ? '停用' : '启用'}
            </a>
          </Popconfirm>
          <Popconfirm title="确定重置该账号密码？" onConfirm={() => resetPassword(record)}>
            <a>重置密码</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreatePerms([]); setModalOpen(true); }}>新增员工</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={accounts} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

      <Modal
        title="新增员工账号"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); setCreatePerms([]); }}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入登录用户名" />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="password" label="登录密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password placeholder="请输入登录密码" />
          </Form.Item>
          <Form.Item name="roleId" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" onChange={handleRoleChange}>
              {channelRoles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        <div style={{ marginTop: 8 }}>
          <div style={{ margin: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>权限配置</div>
          <div style={{ marginBottom: 12 }}>
            <Checkbox
              checked={createPerms.length === ALL_CHANNEL_PERMISSIONS.length}
              indeterminate={createPerms.length > 0 && createPerms.length < ALL_CHANNEL_PERMISSIONS.length}
              onChange={(e) => setCreatePerms(e.target.checked ? [...ALL_CHANNEL_PERMISSIONS] : [])}
            >
              全选
            </Checkbox>
          </div>
          {CHANNEL_PERMISSION_GROUPS.map((group) => (
            <div key={group.group} style={{ marginBottom: 16 }}>
              <div style={{ margin: '8px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{group.group}</div>
              {group.items.map((item) => (
                <div key={item.key} style={{ padding: '6px 0 6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Checkbox
                    checked={createPerms.includes(item.key)}
                    onChange={(e) => {
                      setCreatePerms(e.target.checked
                        ? [...createPerms, item.key]
                        : createPerms.filter((p) => p !== item.key)
                      );
                    }}
                  >
                    {item.label}
                  </Checkbox>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        title={`权限配置 — ${editingAccount?.name || ''}`}
        open={permModalOpen}
        onOk={savePermissions}
        onCancel={() => setPermModalOpen(false)}
        okText="保存"
        cancelText="取消"
        width={520}
      >
        <div style={{ marginTop: 8 }}>
          <div style={{ marginBottom: 12 }}>
            <Checkbox
              checked={selectedPerms.length === ALL_CHANNEL_PERMISSIONS.length}
              indeterminate={selectedPerms.length > 0 && selectedPerms.length < ALL_CHANNEL_PERMISSIONS.length}
              onChange={(e) => setSelectedPerms(e.target.checked ? [...ALL_CHANNEL_PERMISSIONS] : [])}
            >
              全选
            </Checkbox>
          </div>
          {CHANNEL_PERMISSION_GROUPS.map((group) => (
            <div key={group.group} style={{ marginBottom: 16 }}>
              <div style={{ margin: '8px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{group.group}</div>
              {group.items.map((item) => (
                <div key={item.key} style={{ padding: '6px 0 6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Checkbox
                    checked={selectedPerms.includes(item.key)}
                    onChange={(e) => {
                      setSelectedPerms(e.target.checked
                        ? [...selectedPerms, item.key]
                        : selectedPerms.filter((p) => p !== item.key)
                      );
                    }}
                  >
                    {item.label}
                  </Checkbox>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
