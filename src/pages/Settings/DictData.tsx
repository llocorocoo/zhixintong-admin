import { useState } from 'react';
import { Table, Button, Tag, Space, Modal, Form, Input, InputNumber, Select, Radio, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, ArrowLeftOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [importPreview, setImportPreview] = useState<DictDataItem[] | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
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

  const handleExport = () => {
    const toExport = selectedRowKeys.length > 0
      ? filteredData.filter((item) => selectedRowKeys.includes(item.id))
      : filteredData;
    exportToJSON(toExport, `字典数据_${dictCode}`);
    message.success(`已导出 ${toExport.length} 条字典数据`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await importFromJSON<DictDataItem>(file);
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
    const newAllData = [...allData];
    for (const item of importPreview) {
      const existingIdx = newAllData.findIndex(
        (d) => d.dictCode === dictCode && d.value === item.value
      );
      if (existingIdx >= 0) {
        newAllData[existingIdx] = { ...newAllData[existingIdx], ...item, id: newAllData[existingIdx].id, dictCode };
        updated++;
      } else {
        newAllData.push({ ...item, id: 'dd' + Date.now() + Math.random().toString(36).slice(2, 6), dictCode });
        added++;
      }
    }
    setAllData(newAllData);
    message.success(`导入完成：新增 ${added} 条，更新 ${updated} 条`);
    setImportModalOpen(false);
    setImportPreview(null);
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

      <div className="table-toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增</Button>
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
        dataSource={filteredData}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
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
          共 {importPreview?.length || 0} 条数据，同一 dictCode 下 value 相同的将覆盖更新，不同的将新增。
        </p>
        <Table
          columns={[
            { title: '字典标签', dataIndex: 'label', key: 'label' },
            { title: '字典键值', dataIndex: 'value', key: 'value' },
            { title: '排序', dataIndex: 'sort', key: 'sort' },
            { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '停用'}</Tag> },
            {
              title: '操作类型', key: 'action',
              render: (_: unknown, record: DictDataItem) => {
                const existing = allData.find((d) => d.dictCode === dictCode && d.value === record.value);
                return existing ? <Tag color="orange">覆盖</Tag> : <Tag color="blue">新增</Tag>;
              },
            },
          ]}
          dataSource={importPreview || []}
          rowKey="value"
          size="small"
          pagination={false}
        />
      </Modal>
    </>
  );
}
