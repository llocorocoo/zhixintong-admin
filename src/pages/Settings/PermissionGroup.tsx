import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tag, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { PERMISSION_GROUPS } from '@/types';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';

interface PermissionGroupItem {
  id: string;
  name: string;
}

export default function PermissionGroup() {
  const [groups, setGroups] = useState<PermissionGroupItem[]>(
    PERMISSION_GROUPS.map((g, i) => ({ id: String(i + 1), name: g.group }))
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importPreview, setImportPreview] = useState<PermissionGroupItem[] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        setGroups((prev) =>
          prev.map((g) => (g.id === editingId ? { ...g, name: values.name } : g))
        );
        message.success('分组已更新');
      } else {
        const newGroup: PermissionGroupItem = {
          id: 'g' + Date.now(),
          name: values.name,
        };
        setGroups((prev) => [...prev, newGroup]);
        message.success('分组已创建');
      }
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
    });
  };

  const handleEdit = (record: PermissionGroupItem) => {
    setEditingId(record.id);
    form.setFieldsValue({ name: record.name });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    message.success('分组已删除');
  };

  const handleExport = () => {
    const toExport = selectedRowKeys.length > 0
      ? groups.filter((g) => selectedRowKeys.includes(g.id))
      : groups;
    exportToJSON(toExport, '权限分组');
    message.success(`已导出 ${toExport.length} 条分组数据`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await importFromJSON<PermissionGroupItem>(file);
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
    const newGroups = [...groups];
    for (const item of importPreview) {
      const existingIdx = newGroups.findIndex((g) => g.name === item.name);
      if (existingIdx >= 0) {
        newGroups[existingIdx] = { ...newGroups[existingIdx], ...item, id: newGroups[existingIdx].id };
        updated++;
      } else {
        newGroups.push({ ...item, id: 'g' + Date.now() + Math.random().toString(36).slice(2, 6) });
        added++;
      }
    }
    setGroups(newGroups);
    message.success(`导入完成：新增 ${added} 条，更新 ${updated} 条`);
    setImportModalOpen(false);
    setImportPreview(null);
  };

  const columns = [
    { title: '分组名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: PermissionGroupItem) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title="确定删除该分组？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          新增分组
        </Button>
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
        {selectedRowKeys.length > 0 && (
          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>已选 {selectedRowKeys.length} 项</span>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={groups}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={false}
      />

      <Modal
        title={editingId ? '编辑分组' : '新增分组'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="分组名称" rules={[{ required: true, message: '请输入分组名称' }]}>
            <Input placeholder="请输入分组名称" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="导入预览"
        open={importModalOpen}
        onOk={confirmImport}
        onCancel={() => { setImportModalOpen(false); setImportPreview(null); }}
        okText="确认导入"
        cancelText="取消"
        width={500}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          共 {importPreview?.length || 0} 条数据，name 相同的将覆盖更新，不同的将新增。
        </p>
        <Table
          columns={[
            { title: '分组名称', dataIndex: 'name', key: 'name' },
            {
              title: '操作类型', key: 'action',
              render: (_: unknown, record: PermissionGroupItem) => {
                const existing = groups.find((g) => g.name === record.name);
                return existing ? <Tag color="orange">覆盖</Tag> : <Tag color="blue">新增</Tag>;
              },
            },
          ]}
          dataSource={importPreview || []}
          rowKey="name"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
}
