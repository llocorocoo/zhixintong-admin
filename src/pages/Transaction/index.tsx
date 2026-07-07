import { useState } from 'react';
import { Table, Tag, Input, Select, DatePicker, Form, Button, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockTransactions, mockChannels } from '@/mock/data';
import { TRANSACTION_TYPE_MAP, PAY_METHOD_MAP } from '@/utils/constants';
import type { Dayjs } from 'dayjs';
import { exportToExcel } from '@/utils/exportExcel';

const { RangePicker } = DatePicker;

export default function TransactionList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const allTransactions = isAdmin
    ? mockTransactions
    : mockTransactions.filter((t) => t.channelId === user?.channelId);

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchForm] = Form.useForm();

  const filtered = allTransactions.filter((t) => {
    if (search && !t.transactionNo.includes(search) && !t.orderNo.includes(search)) return false;
    if (channelFilter && t.channelId !== channelFilter) return false;
    if (dateRange) {
      const txDate = t.createdAt.split(' ')[0];
      if (txDate < dateRange[0].format('YYYY-MM-DD') || txDate > dateRange[1].format('YYYY-MM-DD')) return false;
    }
    return true;
  });

  const handleReset = () => {
    searchForm.resetFields();
    setSearch('');
    setChannelFilter(undefined);
    setDateRange(null);
  };

  const columns = [
    { title: '交易流水号', dataIndex: 'transactionNo', key: 'transactionNo' },
    { title: '关联订单', dataIndex: 'orderNo', key: 'orderNo' },
    {
      title: '类型', dataIndex: 'type', key: 'type',
      render: (type: string) => {
        const t = TRANSACTION_TYPE_MAP[type];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '金额', dataIndex: 'amount', key: 'amount',
      render: (amount: number) => (
        <span style={{ color: amount >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 500 }}>
          {amount >= 0 ? '+' : ''}{amount.toFixed(2)} 元
        </span>
      ),
    },
    {
      title: '支付方式', dataIndex: 'payMethod', key: 'payMethod',
      render: (method: string) => {
        const m = PAY_METHOD_MAP[method];
        return m ? <Tag color={m.color}>{m.text}</Tag> : '-';
      },
    },
    ...(isAdmin ? [{ title: '渠道', dataIndex: 'channelName', key: 'channelName' }] : []),
    { title: '交易时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <>
      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="关键词" name="search" style={{ width: '100%' }}>
                <Input
                  placeholder="流水号/订单号"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            {isAdmin && (
              <Col span={8}>
                <Form.Item label="渠道" name="channel" style={{ width: '100%' }}>
                  <Select
                    placeholder="全部渠道"
                    allowClear
                    value={channelFilter}
                    onChange={setChannelFilter}
                  >
                    {mockChannels.map((c) => (
                      <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            )}
            <Col span={8}>
              <Form.Item label="日期" name="dateRange" style={{ width: '100%' }}>
                <RangePicker
                  placeholder={['开始日期', '结束日期']}
                  style={{ width: '100%' }}
                  onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                />
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
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToExcel(
            filtered as unknown as Record<string, unknown>[],
            [
              { title: '交易流水号', dataIndex: 'transactionNo' },
              { title: '关联订单', dataIndex: 'orderNo' },
              { title: '类型', dataIndex: 'type', render: (v) => TRANSACTION_TYPE_MAP[v as string]?.text || String(v) },
              { title: '金额', dataIndex: 'amount', render: (v) => `${Number(v).toFixed(2)}` },
              { title: '支付方式', dataIndex: 'payMethod', render: (v) => PAY_METHOD_MAP[v as string]?.text || '-' },
              ...(isAdmin ? [{ title: '渠道', dataIndex: 'channelName' }] : []),
              { title: '交易时间', dataIndex: 'createdAt' },
            ],
            '交易明细',
          )}
        >
          导出 Excel
        </Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />
    </>
  );
}
