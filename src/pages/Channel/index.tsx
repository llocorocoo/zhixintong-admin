import { useState } from 'react';
import { Table, Button, Tag, Space, Input, Modal, Form, Select, message, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useChannels } from '@/store/useChannels';
import { CHANNEL_TYPE_MAP } from '@/utils/constants';
import type { Channel, ChannelType } from '@/types';

export default function ChannelList() {
  const navigate = useNavigate();
  const { channels, addChannel, updateChannel, toggleStatus } = useChannels();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  const filtered = channels.filter((c) => {
    if (search && !c.name.includes(search) && !c.contact.includes(search)) return false;
    if (typeFilter && c.type !== typeFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const handleToggle = (id: string) => {
    toggleStatus(id);
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
        updateChannel(editingChannel.id, values);
        message.success('编辑成功');
      } else {
        const promoCode = values.name.substring(0, 2).toUpperCase() + Date.now().toString().slice(-4);
        const newChannel: Channel = {
          ...values,
          id: 'ch' + Date.now(),
          status: 'active' as const,
          promoCode,
          promoLink: `https://zhixintong.com/r/${promoCode}`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        addChannel(newChannel);
        message.success('新增成功');
      }
      setModalOpen(false);
    });
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearch('');
    setTypeFilter(undefined);
    setStatusFilter(undefined);
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
          <a onClick={() => openEdit(record)}>编辑</a>
          <a onClick={() => navigate(`/channel/${record.id}`)}>渠道详情</a>
          <Popconfirm
            title={`确定${record.status === 'active' ? '停用' : '启用'}该渠道商？`}
            onConfirm={() => handleToggle(record.id)}
          >
            <a style={{ color: record.status === 'active' ? '#e74c3c' : '#27ae60' }}>
              {record.status === 'active' ? '停用' : '启用'}
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="名称" name="name" style={{ width: '100%' }}>
                <Input
                  placeholder="渠道商名称/联系人"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="类型" name="type" style={{ width: '100%' }}>
                <Select
                  placeholder="全部类型"
                  allowClear
                  value={typeFilter}
                  onChange={setTypeFilter}
                >
                  <Select.Option value="pure">纯渠道</Select.Option>
                  <Select.Option value="oem">OEM</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="状态" name="status" style={{ width: '100%' }}>
                <Select
                  placeholder="全部状态"
                  allowClear
                  value={statusFilter}
                  onChange={setStatusFilter}
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
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增</Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

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
