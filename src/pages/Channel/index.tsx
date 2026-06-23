import { useState } from 'react';
import { Table, Button, Tag, Space, Input, Modal, Form, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockChannels } from '@/mock/data';
import { CHANNEL_TYPE_MAP } from '@/utils/constants';
import type { Channel, ChannelType } from '@/types';

export default function ChannelList() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>(mockChannels);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [form] = Form.useForm();

  const filtered = channels.filter(
    (c) => c.name.includes(search) || c.contact.includes(search)
  );

  const toggleStatus = (id: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
    message.success('状态已更新');
  };

  const openAdd = () => {
    setEditingChannel(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (channel: Channel) => {
    setEditingChannel(channel);
    form.setFieldsValue(channel);
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editingChannel) {
        setChannels((prev) =>
          prev.map((c) => (c.id === editingChannel.id ? { ...c, ...values } : c))
        );
        message.success('编辑成功');
      } else {
        const newChannel: Channel = {
          ...values,
          id: 'ch' + Date.now(),
          status: 'active' as const,
          promoCode: values.name.substring(0, 2).toUpperCase() + Date.now().toString().slice(-4),
          promoLink: '',
          createdAt: new Date().toISOString().split('T')[0],
        };
        newChannel.promoLink = `https://zhixintong.com/r/${newChannel.promoCode}`;
        setChannels((prev) => [...prev, newChannel]);
        message.success('新增成功');
      }
      setModalOpen(false);
    });
  };

  const columns = [
    { title: '渠道商名称', dataIndex: 'name', key: 'name' },
    { title: '联系人', dataIndex: 'contact', key: 'contact' },
    { title: '联系方式', dataIndex: 'phone', key: 'phone' },
    {
      title: '渠道类型', dataIndex: 'type', key: 'type',
      render: (type: ChannelType) => (
        <Tag color={type === 'oem' ? 'purple' : 'blue'}>{CHANNEL_TYPE_MAP[type]}</Tag>
      ),
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
      render: (_: unknown, record: Channel) => (
        <Space>
          <a onClick={() => navigate(`/channel/${record.id}`)}>详情</a>
          <a onClick={() => openEdit(record)}>编辑</a>
          <Popconfirm
            title={`确定${record.status === 'active' ? '停用' : '启用'}该渠道商？`}
            onConfirm={() => toggleStatus(record.id)}
          >
            <a>{record.status === 'active' ? '停用' : '启用'}</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input
          placeholder="搜索渠道商名称/联系人"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
          新增渠道商
        </Button>
      </div>
      <Table columns={columns} dataSource={filtered} rowKey="id" />
      <Modal
        title={editingChannel ? '编辑渠道商' : '新增渠道商'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="渠道商名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入渠道商名称" />
          </Form.Item>
          <Form.Item name="contact" label="联系人" rules={[{ required: true, message: '请输入联系人' }]}>
            <Input placeholder="请输入联系人" />
          </Form.Item>
          <Form.Item name="phone" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
            <Input placeholder="请输入联系方式" />
          </Form.Item>
          <Form.Item name="type" label="渠道类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择渠道类型">
              <Select.Option value="pure">纯渠道</Select.Option>
              <Select.Option value="oem">OEM</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
