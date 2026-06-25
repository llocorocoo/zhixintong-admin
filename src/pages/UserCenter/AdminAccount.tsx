import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

interface AdminAccount {
  id: string;
  username: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const initialAccounts: AdminAccount[] = [
  { id: 'adm1', username: 'admin', name: '系统管理员', status: 'active', createdAt: '2024-01-01' },
];

export default function AdminAccountList() {
  const [accounts, setAccounts] = useState<AdminAccount[]>(initialAccounts);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

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

  const handleAdd = () => {
    form.validateFields().then((values) => {
      const newAccount: AdminAccount = {
        id: 'adm' + Date.now(),
        username: values.username,
        name: values.name,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAccounts((prev) => [...prev, newAccount]);
      setModalOpen(false);
      form.resetFields();
      message.success('管理员账号创建成功');
    });
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>新增</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={accounts} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

      <Modal
        title="新增管理员账号"
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => setModalOpen(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入登录用户名" />
          </Form.Item>
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
