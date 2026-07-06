import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import { PERMISSION_GROUPS } from '@/types';
import { useRoles } from '@/store/useRoles';

interface AdminAccount {
  id: string;
  username: string;
  name: string;
  roleId?: string;
  isSuperAdmin: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
}

// 账号不再单独存权限：权限完全由所绑定的角色决定。
const initialAccounts: AdminAccount[] = [
  { id: 'adm1', username: 'admin', name: '系统管理员', roleId: 'role1', isSuperAdmin: true, status: 'active', createdAt: '2024-01-01' },
  { id: 'adm2', username: 'admin02', name: '运营专员', roleId: 'role2', isSuperAdmin: false, status: 'active', createdAt: '2024-02-01' },
];

export default function AdminAccountList() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [form] = Form.useForm();

  const { roles } = useRoles();
  const adminRoles = roles.filter((r) => r.dataScope === 'all' && r.status === 'active');

  // 弹窗内实时预览所选角色绑定的权限（只读）
  const selectedRoleId = Form.useWatch('roleId', form);
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const grantedPerms = new Set(selectedRole?.defaultPermissions ?? []);

  const openAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (account: AdminAccount) => {
    setEditingAccount(account);
    form.setFieldsValue({ username: account.username, name: account.name, roleId: account.roleId });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingAccount) {
        // 超管仅可编辑基础信息与角色（权限随角色变化）
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === editingAccount.id ? { ...a, name: values.name, roleId: values.roleId } : a
          )
        );
        message.success('账号信息已更新');
      } else {
        const newAccount: AdminAccount = {
          id: 'adm' + Date.now(),
          username: values.username,
          name: values.name,
          roleId: values.roleId,
          isSuperAdmin: false,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setAccounts((prev) => [...prev, newAccount]);
        message.success('系统账号创建成功');
      }
      closeModal();
    });
  };

  const toggleStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
    message.success('状态已更新');
  };

  const resetPassword = (account: AdminAccount) => {
    message.success(`已重置 ${account.username} 的密码为默认密码`);
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '角色', key: 'role',
      render: (_: unknown, record: AdminAccount) => {
        const role = roles.find((r) => r.id === record.roleId);
        return <Tag color={record.isSuperAdmin ? 'gold' : 'blue'}>{role?.name || '未分配'}</Tag>;
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
      render: (_: unknown, record: AdminAccount) => (
        <Space>
          {!record.isSuperAdmin && (
            <>
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
            </>
          )}
          {record.isSuperAdmin && <span style={{ color: 'var(--text-secondary)' }}>—</span>}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={accounts} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

      {/* 新增 / 编辑账号弹窗（不再直接配置权限，权限随角色而定） */}
      <Modal
        title={editingAccount ? '编辑系统账号' : '新增系统账号'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={closeModal}
        okText={editingAccount ? '保存' : '创建'}
        cancelText="取消"
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入登录用户名" disabled={!!editingAccount} />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          {!editingAccount && (
            <Form.Item name="password" label="登录密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
              <Input.Password placeholder="请输入登录密码" />
            </Form.Item>
          )}
          <Form.Item name="roleId" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              {adminRoles.map((r) => (
                <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 只读展示所选角色绑定的权限（不可在此编辑，权限由角色决定） */}
          <div style={{ marginTop: 4 }}>
            <div style={{ margin: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              该角色包含的权限
            </div>
            {!selectedRole ? (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>请先选择角色</div>
            ) : grantedPerms.size === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>该角色暂未配置任何权限</div>
            ) : (
              PERMISSION_GROUPS.map((group) => {
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
