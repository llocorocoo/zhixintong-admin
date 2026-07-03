import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm, Checkbox } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRoles } from '@/store/useRoles';
import { CHANNEL_PERMISSION_GROUPS, ALL_CHANNEL_PERMISSIONS } from '@/types';
import type { SysRole, Permission } from '@/types';

export default function ChannelRoleManagement() {
  const { roles, addRole, updateRole, deleteRole } = useRoles();
  const SYSTEM_ROLE_KEYS = ['super_admin', 'admin', 'channel'];
  const channelRoles = roles.filter((r) => r.dataScope === 'channel' && !SYSTEM_ROLE_KEYS.includes(r.roleKey));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SysRole | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
  const [form] = Form.useForm();

  const openAdd = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setSelectedPerms([]);
    setModalOpen(true);
  };

  const openEdit = (role: SysRole) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      roleKey: role.roleKey,
      status: role.status,
      remark: role.remark || '',
    });
    setSelectedPerms([...role.defaultPermissions]);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingRole) {
        updateRole(editingRole.id, {
          name: values.name,
          roleKey: values.roleKey,
          status: values.status,
          remark: values.remark,
          defaultPermissions: selectedPerms,
        });
        message.success('角色已更新');
      } else {
        addRole({
          id: 'role' + Date.now(),
          name: values.name,
          roleKey: values.roleKey,
          dataScope: 'channel',
          defaultPermissions: selectedPerms,
          status: values.status,
          remark: values.remark,
          createdAt: new Date().toISOString().split('T')[0],
        });
        message.success('角色创建成功');
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    deleteRole(id);
    message.success('角色已删除');
  };

  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '权限字符', dataIndex: 'roleKey', key: 'roleKey' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: (text: string) => text || '—' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: SysRole) => (
        <Space>
          <a onClick={() => openEdit(record)}>编辑</a>
          <Popconfirm title="确定删除该角色？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增角色</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table
        columns={columns}
        dataSource={channelRoles}
        rowKey="id"
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }}
      />

      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingRole ? '保存' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="roleKey" label="权限字符" rules={[{ required: true, message: '请输入权限字符' }]}>
            <Input placeholder="请输入权限字符（唯一标识）" disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="active">启用</Select.Option>
              <Select.Option value="inactive">停用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 8 }}>
          <div style={{ margin: '8px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>默认权限</div>
          <div style={{ marginBottom: 12 }}>
            <Checkbox
              checked={selectedPerms.length === ALL_CHANNEL_PERMISSIONS.length && ALL_CHANNEL_PERMISSIONS.length > 0}
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
