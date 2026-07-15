import { useState, useMemo } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, Row, Col, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons';
import { mockAccounts } from '@/mock/data';
import { useChannels } from '@/store/useChannels';
import { usePermission } from '@/hooks/usePermission';
import { CHANNEL_PERMISSION_GROUPS } from '@/types';
import type { Account } from '@/types';
import { useRoles } from '@/store/useRoles';
import { useAuth } from '@/store/useAuth';
import { useOperationLog } from '@/store/useOperationLog';
import { exportToExcel } from '@/utils/exportExcel';

type AccountNode = Account & { children?: AccountNode[] };

function toTree(list: Account[]): AccountNode[] {
  const map = new Map<string, AccountNode>();
  const roots: AccountNode[] = [];
  for (const item of list) {
    map.set(item.id, { ...item });
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export default function AccountList() {
  const { channels } = useChannels();
  const { hasPermission } = usePermission();
  const { user } = useAuth();
  const { addLog } = useOperationLog();
  const canAdd = hasPermission('channel_account:add');
  const canToggle = hasPermission('channel_account:toggle');
  const canResetPwd = hasPermission('channel_account:reset_pwd');
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [parentAccount, setParentAccount] = useState<Account | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchForm] = Form.useForm();

  const [searchUsername, setSearchUsername] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchChannel, setSearchChannel] = useState<string | undefined>(undefined);
  const [searchStatus, setSearchStatus] = useState<string | undefined>(undefined);

  const { roles } = useRoles();
  const channelRoles = roles.filter((r) => r.dataScope === 'channel' && r.status === 'active');

  const filteredAccounts = accounts.filter((a) => {
    if (searchUsername && !a.username.includes(searchUsername)) return false;
    if (searchName && !a.name.includes(searchName)) return false;
    if (searchChannel && a.channelId !== searchChannel) return false;
    if (searchStatus && a.status !== searchStatus) return false;
    return true;
  });

  const treeData = useMemo(() => toTree(filteredAccounts), [filteredAccounts]);

  const toggleStatus = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
      )
    );
    const account = accounts.find((a) => a.id === id);
    const newStatus = account?.status === 'active' ? '停用' : '启用';
    addLog({ operatorId: user?.id || '', operatorName: user?.name || '', module: '账号管理', action: 'toggle', actionLabel: newStatus, targetType: 'account', targetId: id, targetName: account?.username || '', changes: [{ field: 'status', fieldLabel: '状态', before: account?.status === 'active' ? '启用' : '停用', after: newStatus }], result: 'success' });
    message.success('状态已更新');
  };

  const resetPassword = (account: Account) => {
    addLog({ operatorId: user?.id || '', operatorName: user?.name || '', module: '账号管理', action: 'reset_pwd', actionLabel: '重置密码', targetType: 'account', targetId: account.id, targetName: account.username, result: 'success' });
    message.success(`已重置 ${account.username} 的密码为默认密码`);
  };

  const handleDelete = (id: string) => {
    const account = accounts.find((a) => a.id === id);
    setAccounts((prev) => {
      const childIds = new Set<string>();
      childIds.add(id);
      for (const a of prev) {
        if (a.parentId === id) childIds.add(a.id);
      }
      return prev.filter((a) => !childIds.has(a.id));
    });
    addLog({ operatorId: user?.id || '', operatorName: user?.name || '', module: '账号管理', action: 'delete', actionLabel: '删除', targetType: 'account', targetId: id, targetName: account?.username || '', result: 'success' });
    message.success('账号已删除');
  };

  const openAdd = (parent?: Account) => {
    setParentAccount(parent || null);
    form.resetFields();
    if (parent) {
      form.setFieldsValue({ channelId: parent.channelId });
    }
    setModalOpen(true);
  };

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const channel = channels.find((c) => c.id === values.channelId);
      const newAccount: Account = {
        id: 'a' + Date.now(),
        username: values.username,
        name: values.name,
        channelId: values.channelId,
        channelName: channel?.name || '',
        parentId: parentAccount?.id || null,
        roleId: undefined,
        permissions: [],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      addLog({ operatorId: user?.id || '', operatorName: user?.name || '', module: '账号管理', action: 'create', actionLabel: '新增', targetType: 'account', targetId: newAccount.id, targetName: newAccount.username, result: 'success' });
      setModalOpen(false);
      form.resetFields();
      setParentAccount(null);
      message.success('账号创建成功');
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
      const changes: { field: string; fieldLabel: string; before: string | null; after: string | null }[] = [];
      if (values.name !== editingAccount.name) changes.push({ field: 'name', fieldLabel: '姓名', before: editingAccount.name, after: values.name });
      if (values.roleId !== editingAccount.roleId) {
        const oldRole = roles.find((r) => r.id === editingAccount.roleId);
        const newRole = roles.find((r) => r.id === values.roleId);
        changes.push({ field: 'roleId', fieldLabel: '角色', before: oldRole?.name || '未分配', after: newRole?.name || '未分配' });
      }
      addLog({ operatorId: user?.id || '', operatorName: user?.name || '', module: '账号管理', action: 'update', actionLabel: '修改', targetType: 'account', targetId: editingAccount.id, targetName: editingAccount.username, changes, result: 'success' });
      setEditModalOpen(false);
      setEditingAccount(null);
      editForm.resetFields();
      message.success('账号信息已更新');
    });
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '所属渠道', dataIndex: 'channelName', key: 'channelName' },
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
          {!record.parentId && <a onClick={() => openAdd(record)}>新增</a>}
          <a onClick={() => openEdit(record)}>编辑</a>
          {canToggle && (
            <Popconfirm
              title={`确定${record.status === 'active' ? '停用' : '启用'}该账号？`}
              onConfirm={() => toggleStatus(record.id)}
            >
              <a style={{ color: record.status === 'active' ? '#e74c3c' : '#27ae60' }}>
                {record.status === 'active' ? '停用' : '启用'}
              </a>
            </Popconfirm>
          )}
          {canResetPwd && (
            <Popconfirm title="确定重置该账号密码？" onConfirm={() => resetPassword(record)}>
              <a>重置密码</a>
            </Popconfirm>
          )}
          <Popconfirm title={record.parentId ? '确定删除该账号？删除后不可恢复。' : '确定删除该账号及其所有子账号？删除后不可恢复。'} onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleReset = () => {
    searchForm.resetFields();
    setSearchUsername('');
    setSearchName('');
    setSearchChannel(undefined);
    setSearchStatus(undefined);
  };

  return (
    <>
      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item label="用户名" name="username" style={{ width: '100%' }}>
                <Input
                  placeholder="请输入用户名"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="姓名" name="name" style={{ width: '100%' }}>
                <Input
                  placeholder="请输入姓名"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="渠道" name="channel" style={{ width: '100%' }}>
                <Select
                  placeholder="全部渠道"
                  allowClear
                  value={searchChannel}
                  onChange={setSearchChannel}
                >
                  {channels.filter((c) => c.status === 'active').map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="状态" name="status" style={{ width: '100%' }}>
                <Select
                  placeholder="全部状态"
                  allowClear
                  value={searchStatus}
                  onChange={setSearchStatus}
                >
                  <Select.Option value="active">启用</Select.Option>
                  <Select.Option value="inactive">停用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="search-buttons">
            <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </div>
        </Form>
      </div>

      <div className="table-toolbar">
        {canAdd && <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd()}>新增</Button>}
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToExcel(
            filteredAccounts as unknown as Record<string, unknown>[],
            [
              { title: '用户名', dataIndex: 'username' },
              { title: '姓名', dataIndex: 'name' },
              { title: '所属渠道', dataIndex: 'channelName' },
              { title: '角色', dataIndex: 'roleId', render: (v) => { const r = roles.find((role) => role.id === v); return r?.name || '未分配'; } },
              { title: '状态', dataIndex: 'status', render: (v) => v === 'active' ? '启用' : '停用' },
              { title: '创建时间', dataIndex: 'createdAt' },
            ],
            '渠道账号',
          )}
        >
          导出 Excel
        </Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={treeData} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

      {/* 新增账号弹窗 */}
      <Modal
        title={parentAccount ? `新增子账号 — 上级：${parentAccount.username}` : '新增渠道商账号'}
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); setParentAccount(null); }}
        okText="创建"
        cancelText="取消"
        width={500}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="channelId" label="所属渠道商" rules={[{ required: true, message: '请选择' }]}>
            <Select placeholder="请选择渠道商" disabled={!!parentAccount}>
              {channels.filter((c) => c.status === 'active').map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
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

      {/* 编辑账号弹窗 */}
      <Modal
        title={`编辑账号 — ${editingAccount?.username || ''}`}
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
