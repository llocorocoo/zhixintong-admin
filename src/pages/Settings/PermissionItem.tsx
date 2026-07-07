import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, Tag, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { PERMISSION_GROUPS } from '@/types';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';

interface PermissionItemData {
  id: string;
  key: string;
  label: string;
  desc: string;
  group: string;
}

function buildInitialData(): PermissionItemData[] {
  const items: PermissionItemData[] = [];
  let idx = 0;
  for (const group of PERMISSION_GROUPS) {
    for (const item of group.items) {
      items.push({
        id: String(++idx),
        key: item.key,
        label: item.label,
        desc: item.desc,
        group: group.group,
      });
    }
  }
  return items;
}

export default function PermissionItem() {
  const [items, setItems] = useState<PermissionItemData[]>(buildInitialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importPreview, setImportPreview] = useState<PermissionItemData[] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [form] = Form.useForm();

  const groupNames = [...new Set(PERMISSION_GROUPS.map((g) => g.group))];

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingId) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, key: values.key, label: values.label, desc: values.desc, group: values.group }
              : item
          )
        );
        message.success('权限项已更新');
      } else {
        const newItem: PermissionItemData = {
          id: 'p' + Date.now(),
          key: values.key,
          label: values.label,
          desc: values.desc,
          group: values.group,
        };
        setItems((prev) => [...prev, newItem]);
        message.success('权限项已创建');
      }
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
    });
  };

  const handleEdit = (record: PermissionItemData) => {
    setEditingId(record.id);
    form.setFieldsValue({
      key: record.key,
      label: record.label,
      desc: record.desc,
      group: record.group,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    message.success('权限项已删除');
  };

  const handleExport = () => {
    const toExport = selectedRowKeys.length > 0
      ? items.filter((item) => selectedRowKeys.includes(item.id))
      : items;
    exportToJSON(toExport, '权限项');
    message.success(`已导出 ${toExport.length} 条权限项数据`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await importFromJSON<PermissionItemData>(file);
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
    const newItems = [...items];
    for (const item of importPreview) {
      const existingIdx = newItems.findIndex((i) => i.key === item.key);
      if (existingIdx >= 0) {
        newItems[existingIdx] = { ...newItems[existingIdx], ...item, id: newItems[existingIdx].id };
        updated++;
      } else {
        newItems.push({ ...item, id: 'p' + Date.now() + Math.random().toString(36).slice(2, 6) });
        added++;
      }
    }
    setItems(newItems);
    message.success(`导入完成：新增 ${added} 条，更新 ${updated} 条`);
    setImportModalOpen(false);
    setImportPreview(null);
  };

  const columns = [
    { title: '权限标识', dataIndex: 'key', key: 'key' },
    { title: '权限名称', dataIndex: 'label', key: 'label' },
    { title: '描述', dataIndex: 'desc', key: 'desc' },
    { title: '所属分组', dataIndex: 'group', key: 'group' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: PermissionItemData) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <Popconfirm title="确定删除该权限项？" onConfirm={() => handleDelete(record.id)}>
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
          新增权限项
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
        dataSource={items}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true }}
      />

      <Modal
        title={editingId ? '编辑权限项' : '新增权限项'}
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
          <Form.Item name="key" label="权限标识" rules={[{ required: true, message: '请输入权限标识' }]}>
            <Input placeholder="例如: module:action" />
          </Form.Item>
          <Form.Item name="label" label="权限名称" rules={[{ required: true, message: '请输入权限名称' }]}>
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          <Form.Item name="desc" label="描述" rules={[{ required: true, message: '请输入描述' }]}>
            <Input placeholder="请输入权限描述" />
          </Form.Item>
          <Form.Item name="group" label="所属分组" rules={[{ required: true, message: '请选择所属分组' }]}>
            <Select placeholder="请选择分组">
              {groupNames.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
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
        width={700}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
          共 {importPreview?.length || 0} 条数据，key 相同的将覆盖更新，不同的将新增。
        </p>
        <Table
          columns={[
            { title: '权限标识', dataIndex: 'key', key: 'key' },
            { title: '权限名称', dataIndex: 'label', key: 'label' },
            { title: '所属分组', dataIndex: 'group', key: 'group' },
            {
              title: '操作类型', key: 'action',
              render: (_: unknown, record: PermissionItemData) => {
                const existing = items.find((i) => i.key === record.key);
                return existing ? <Tag color="orange">覆盖</Tag> : <Tag color="blue">新增</Tag>;
              },
            },
          ]}
          dataSource={importPreview || []}
          rowKey="key"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
}
