import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { useRoles } from '@/store/useRoles';
import { useChannels } from '@/store/useChannels';
import { CHANNEL_PERMISSION_GROUPS } from '@/types';
import type { Account } from '@/types';
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

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

  const handleDelete = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    message.success('员工账号已删除');
  };

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newAccount: Account = {
        id: 'a' + Date.now(),
        username: values.username,
        name: values.name,
        channelId: user?.channelId || '',
        channelName: myChannel?.name || '',
        roleId: undefined,
        permissions: [],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      setModalOpen(false);
      form.resetFields();
      message.success('员工账号创建成功');
    });
  };

  const openEdit = (account: Account) => {
    setEditingAccount(account);
    editForm.setFieldsValue({ name: account.name, roleId: account.roleId });
    setEditModalOpen(true);
  };

  const selectedRoleId = Form.useWatch('roleId', editForm);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const grantedPerms = new Set(selectedRole?.defaultPermissions ?? []);

  const handleEditSave = () => {
    editForm.validateFields().then((values) => {
      if (!editingAccount) return;
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === editingAccount.id ? { ...a, name: values.name, roleId: values.roleId } : a
        )
      );
      setEditModalOpen(false);
      setEditingAccount(null);
      editForm.resetFields();
      message.success('员工信息已更新');
    });
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '角色', key: 'role',
      render: (_: unknown, record: Account) => {
        const role = roles.find((r) => r.id === record.roleId);
        return role ? <Tag color="blue">{role.name}</Tag> : <span style={{ color: 'var(--text-secondary)' }}>未分配</span>;
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
          <a onClick={() => openEdit(record)}>编辑</a>
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
          <Popconfirm title="确定删除该员工账号？删除后不可恢复。" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>新增员工</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={accounts} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

      {/* 新增员工弹窗 */}
      <Modal
        title="新增员工账号"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => setModalOpen(false)}
        okText="创建"
        cancelText="取消"
        width={500}
        destroyOnClose
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
        </Form>
      </Modal>

      {/* 编辑员工弹窗 */}
      <Modal
        title={`编辑员工 — ${editingAccount?.username || ''}`}
        open={editModalOpen}
        onOk={handleEditSave}
        onCancel={() => { setEditModalOpen(false); setEditingAccount(null); editForm.resetFields(); }}
        okText="保存"
        cancelText="取消"
        width={520}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="roleId" label="角色">
            <Select placeholder="请选择角色" allowClear>
              {channelRoles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ marginTop: 4 }}>
            <div style={{ margin: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              该角色包含的权限
            </div>
            {!selectedRole ? (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>请先选择角色</div>
            ) : grantedPerms.size === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>该角色暂未配置任何权限</div>
            ) : (
              CHANNEL_PERMISSION_GROUPS.map((group) => {
                const items = group.items.filter((item) => grantedPerms.has(item.key));
                if (items.length === 0) return null;
                return (
                  <div key={group.group} style={{ marginBottom: 12 }}>
                    <div style={{ margin: '8px 0', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{group.group}</div>
                    {items.map((item) => (
                      <div key={item.key} style={{ padding: '4px 0 4px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-primary)' }}>
                          <CheckOutlined style={{ color: '#27ae60', marginRight: 8 }} />
                          {item.label}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 8 }}>
            账号权限由所绑定的角色决定。如需调整权限，请前往「角色管理」修改对应角色，或改绑其它角色。
          </div>
        </Form>
      </Modal>
    </>
  );
}
