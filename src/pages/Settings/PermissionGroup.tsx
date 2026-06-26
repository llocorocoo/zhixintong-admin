import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PERMISSION_GROUPS } from '@/types';

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
          新增分组
        </Button>
      </div>

      <Table columns={columns} dataSource={groups} rowKey="id" pagination={false} />

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
    </>
  );
}
