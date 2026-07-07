import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm, Checkbox, Upload } from 'antd';
import { PlusOutlined, ReloadOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { useRoles } from '@/store/useRoles';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';
import {
  PERMISSION_GROUPS,
  ALL_PERMISSIONS,
  CHANNEL_PERMISSION_GROUPS,
  ALL_CHANNEL_PERMISSIONS,
} from '@/types';
import type { SysRole, DataScope, Permission } from '@/types';

export default function RoleManagement() {
  const { roles, addRole, updateRole, deleteRole } = useRoles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<SysRole | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
  const [currentDataScope, setCurrentDataScope] = useState<DataScope>('all');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importPreview, setImportPreview] = useState<SysRole[] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [form] = Form.useForm();

  const permissionGroups = currentDataScope === 'all' ? PERMISSION_GROUPS : CHANNEL_PERMISSION_GROUPS;
  const allPermsForScope = currentDataScope === 'all' ? ALL_PERMISSIONS : ALL_CHANNEL_PERMISSIONS;

  const openAdd = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({ dataScope: 'all', status: 'active' });
    setCurrentDataScope('all');
    setSelectedPerms([]);
    setModalOpen(true);
  };

  const openEdit = (role: SysRole) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      roleKey: role.roleKey,
      dataScope: role.dataScope,
      status: role.status,
      remark: role.remark || '',
    });
    setCurrentDataScope(role.dataScope);
    setSelectedPerms([...role.defaultPermissions]);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingRole) {
        updateRole(editingRole.id, {
          name: values.name,
          roleKey: values.roleKey,
          dataScope: values.dataScope,
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
          dataScope: values.dataScope,
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

  const handleDataScopeChange = (scope: DataScope) => {
    setCurrentDataScope(scope);
    setSelectedPerms([]);
  };

  const handleExport = () => {
    const toExport = selectedRowKeys.length > 0
      ? roles.filter((r) => selectedRowKeys.includes(r.id))
      : roles;
    exportToJSON(toExport, '角色配置');
    message.success(`已导出 ${toExport.length} 条角色数据`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await importFromJSON<SysRole>(file);
      setImportPreview(data);
      setImportModalOpen(true);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    let added = 0;
    let updated = 0;
    for (const item of importPreview) {
      const existing = roles.find((r) => r.roleKey === item.roleKey);
      if (existing) {
        updateRole(existing.id, { ...item, id: existing.id });
        updated++;
      } else {
        addRole({ ...item, id: 'role' + Date.now() + Math.random().toString(36).slice(2, 6) });
        added++;
      }
    }
    message.success(`导入完成：新增 ${added} 条，更新 ${updated} 条`);
    setImportModalOpen(false);
    setImportPreview(null);
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
      render: (_: unknown, record: SysRole) => {
        if (record.roleKey === 'super_admin') {
          return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
        }
        return (
          <Space>
            <a onClick={() => openEdit(record)}>编辑</a>
            <Popconfirm title="确定删除该角色？" onConfirm={() => handleDelete(record.id)}>
              <a style={{ color: '#e74c3c' }}>删除</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="table-toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增角色</Button>
        <Button icon={<ExportOutlined />} onClick={handleExport}>
          导出{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
        </Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={(file) => { handleImportFile(file); return false; }}
        >
          <Button icon={<ImportOutlined />}>导入</Button>
        </Upload>
        <Button icon={<ReloadOutlined />}>刷新</Button>
        {selectedRowKeys.length > 0 && (
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>已选 {selectedRowKeys.length} 项</span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }}
      />

      {/* 新增/编辑角色弹窗 */}
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
          <Form.Item name="dataScope" label="数据范围" rules={[{ required: true }]}>
            <Select onChange={handleDataScopeChange}>
              <Select.Option value="all">全部数据</Select.Option>
              <Select.Option value="channel">本渠道数据</Select.Option>
            </Select>
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
              checked={selectedPerms.length === allPermsForScope.length && allPermsForScope.length > 0}
              indeterminate={selectedPerms.length > 0 && selectedPerms.length < allPermsForScope.length}
              onChange={(e) => setSelectedPerms(e.target.checked ? [...allPermsForScope] : [])}
            >
              全选
            </Checkbox>
          </div>
          {permissionGroups.map((group) => (
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

      {/* 导入预览弹窗 */}
      <Modal
        title="导入预览"
        open={importModalOpen}
        onOk={confirmImport}
        onCancel={() => { setImportModalOpen(false); setImportPreview(null); }}
        okText="确认导入"
        cancelText="取消"
        width={700}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          共 {importPreview?.length || 0} 条数据，roleKey 相同的将覆盖更新，不同的将新增。
        </p>
        <Table
          columns={[
            { title: '角色名称', dataIndex: 'name', key: 'name' },
            { title: '权限字符', dataIndex: 'roleKey', key: 'roleKey' },
            { title: '数据范围', dataIndex: 'dataScope', key: 'dataScope', render: (s: string) => s === 'all' ? '全部数据' : '本渠道' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
            {
              title: '操作类型', key: 'action',
              render: (_: unknown, record: SysRole) => {
                const existing = roles.find((r) => r.roleKey === record.roleKey);
                return existing
                  ? <Tag color="orange">覆盖</Tag>
                  : <Tag color="blue">新增</Tag>;
              },
            },
          ]}
          dataSource={importPreview || []}
          rowKey="roleKey"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
}
