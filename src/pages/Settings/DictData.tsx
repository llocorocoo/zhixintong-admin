import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, Radio, message, Popconfirm } from 'antd';
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons';

export interface DictDataItem {
  id: string;
  dictCode: string;
  label: string;
  value: string;
  sort: number;
  color: string;
  status: 'active' | 'inactive';
  remark: string;
}

const initialDictData: DictDataItem[] = [
  { id: 'dd1', dictCode: 'sys_common_status', label: '启用', value: '0', sort: 1, color: 'success', status: 'active', remark: '' },
  { id: 'dd2', dictCode: 'sys_common_status', label: '停用', value: '1', sort: 2, color: 'danger', status: 'active', remark: '' },
  { id: 'dd3', dictCode: 'channel_type', label: '纯渠道', value: 'pure', sort: 1, color: 'info', status: 'active', remark: '' },
  { id: 'dd4', dictCode: 'channel_type', label: 'OEM', value: 'oem', sort: 2, color: 'primary', status: 'active', remark: '' },
  { id: 'dd5', dictCode: 'order_status', label: '未完成', value: 'pending', sort: 1, color: 'warning', status: 'active', remark: '' },
  { id: 'dd6', dictCode: 'order_status', label: '已完成', value: 'completed', sort: 2, color: 'success', status: 'active', remark: '' },
  { id: 'dd7', dictCode: 'order_status', label: '已取消', value: 'cancelled', sort: 3, color: 'danger', status: 'active', remark: '' },
  { id: 'dd8', dictCode: 'report_type', label: '职业信用报告', value: 'occupational', sort: 1, color: 'primary', status: 'active', remark: '' },
  { id: 'dd9', dictCode: 'report_type', label: '提升信用报告', value: 'improvement', sort: 2, color: 'info', status: 'active', remark: '' },
  { id: 'dd11', dictCode: 'trade_flow_type', label: '收入', value: 'income', sort: 1, color: 'success', status: 'active', remark: '' },
  { id: 'dd12', dictCode: 'trade_flow_type', label: '退款', value: 'refund', sort: 2, color: 'danger', status: 'active', remark: '' },
];

const colorMap: Record<string, string> = {
  success: 'green',
  danger: 'red',
  warning: 'orange',
  info: 'blue',
  primary: '#2980b9',
};

const colorOptions = [
  { label: '默认(无)', value: '' },
  { label: 'success', value: 'success' },
  { label: 'danger', value: 'danger' },
  { label: 'warning', value: 'warning' },
  { label: 'info', value: 'info' },
  { label: 'primary', value: 'primary' },
];

interface DictDataProps {
  dictCode: string;
  dictName: string;
  onBack: () => void;
}

export default function DictData({ dictCode, dictName, onBack }: DictDataProps) {
  const [allData, setAllData] = useState<DictDataItem[]>(initialDictData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DictDataItem | null>(null);
  const [form] = Form.useForm();

  const filteredData = allData
    .filter((item) => item.dictCode === dictCode)
    .sort((a, b) => a.sort - b.sort);

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sort: 0, color: '', status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (record: DictDataItem) => {
    setEditing(record);
    form.setFieldsValue({
      label: record.label,
      value: record.value,
      sort: record.sort,
      color: record.color,
      status: record.status,
      remark: record.remark,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      if (editing) {
        setAllData((prev) =>
          prev.map((item) =>
            item.id === editing.id
              ? { ...item, label: values.label, value: values.value, sort: values.sort, color: values.color, status: values.status, remark: values.remark || '' }
              : item
          )
        );
        message.success('字典数据已更新');
      } else {
        const newItem: DictDataItem = {
          id: 'dd' + Date.now(),
          dictCode,
          label: values.label,
          value: values.value,
          sort: values.sort,
          color: values.color,
          status: values.status,
          remark: values.remark || '',
        };
        setAllData((prev) => [...prev, newItem]);
        message.success('字典数据创建成功');
      }
      setModalOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    setAllData((prev) => prev.filter((item) => item.id !== id));
    message.success('字典数据已删除');
  };

  const columns = [
    { title: '字典标签', dataIndex: 'label', key: 'label' },
    { title: '字典键值', dataIndex: 'value', key: 'value' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '颜色样式',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => {
        if (!color) return <span style={{ color: 'var(--text-secondary)' }}>默认</span>;
        const tagColor = colorMap[color] || undefined;
        return <Tag color={tagColor}>{color}</Tag>;
      },
    },
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
      render: (_: unknown, record: DictDataItem) => (
        <Space>
          <a onClick={() => openEdit(record)}>编辑</a>
          <Popconfirm title="确定删除该字典数据？" onConfirm={() => handleDelete(record.id)}>
            <a style={{ color: '#e74c3c' }}>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>返回</Button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          字典数据 — {dictName}
        </span>
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
        title={editing ? '编辑字典数据' : '新增字典数据'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editing ? '保存' : '创建'}
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="label" label="字典标签" rules={[{ required: true, message: '请输入字典标签' }]}>
            <Input placeholder="请输入字典标签" />
          </Form.Item>
          <Form.Item name="value" label="字典键值" rules={[{ required: true, message: '请输入字典键值' }]}>
            <Input placeholder="请输入字典键值" />
          </Form.Item>
          <Form.Item name="sort" label="显示顺序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="color" label="颜色样式">
            <Select options={colorOptions} />
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
