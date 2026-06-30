import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, Radio, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

export interface DictTypeItem {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
  remark: string;
}

const initialDictTypes: DictTypeItem[] = [
  { id: 'd1', name: '通用状态', code: 'sys_common_status', status: 'active', remark: '' },
  { id: 'd2', name: '渠道类型', code: 'channel_type', status: 'active', remark: '' },
  { id: 'd3', name: '订单状态', code: 'order_status', status: 'active', remark: '' },
  { id: 'd4', name: '报告类型', code: 'report_type', status: 'active', remark: '' },
  { id: 'd5', name: '流水类型', code: 'trade_flow_type', status: 'active', remark: '' },
];

interface DictTypeProps {
  onViewData: (dictType: DictTypeItem) => void;
}

export default function DictType({ onViewData }: DictTypeProps) {
  const [dictTypes, setDictTypes] = useState<DictTypeItem[]>(initialDictTypes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DictTypeItem | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [form] = Form.useForm();

  const filteredData = dictTypes.filter((item) => {
    const matchName = !searchName || item.name.includes(searchName);
    const matchCode = !searchCode || item.code.includes(searchCode);
    return matchName && matchCode;
  });

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (record: DictTypeItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setDictTypes((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? { ...item, name: values.name, status: values.status, remark: values.remark || '' }
              : item
          )
        );
        message.success('字典类型已更新');
      } else {
        const newItem: DictTypeItem = {
          id: 'd' + Date.now(),
          name: values.name,
          code: values.code,
          status: values.status,
          remark: values.remark || '',
        };
        setDictTypes((prev) => [...prev, newItem]);
        message.success('字典类型创建成功');
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    setDictTypes((prev) => prev.filter((item) => item.id !== id));
    message.success('字典类型已删除');
  };

  const columns = [
    { title: '字典名称', dataIndex: 'name', key: 'name' },
    { title: '字典类型编码', dataIndex: 'code', key: 'code' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: DictTypeItem) => (
        <Space>
          <a onClick={() => openEdit(record)}>编辑</a>
          <Popconfirm title="确定删除该字典类型？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
          <a onClick={() => onViewData(record)}>字典数据</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-search-bar" style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="字典名称"
          prefix={<SearchOutlined />}
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Input
          placeholder="字典类型编码"
          prefix={<SearchOutlined />}
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
      </div>

      <div className="table-toolbar">
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增</Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }}
      />

      <Modal
        title={editing ? '编辑字典类型' : '新增字典类型'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="字典名称" rules={[{ required: true, message: '请输入字典名称' }]}>
            <Input placeholder="请输入字典名称" />
          </Form.Item>
          <Form.Item name="code" label="字典类型编码" rules={[{ required: true, message: '请输入字典类型编码' }]}>
            <Input placeholder="请输入字典类型编码" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="active">启用</Radio>
              <Radio value="inactive">停用</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
