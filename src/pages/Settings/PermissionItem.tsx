import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PERMISSION_GROUPS } from '@/types';

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
      <div className="table-toolbar">
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
      </div>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
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
    </>
  );
}
