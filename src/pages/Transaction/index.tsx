import { useState } from 'react';
import { Table, Tag, Input, Select, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockTransactions, mockChannels } from '@/mock/data';
import { TRANSACTION_TYPE_MAP } from '@/utils/constants';

const { RangePicker } = DatePicker;

export default function TransactionList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const allTransactions = isAdmin
    ? mockTransactions
    : mockTransactions.filter((t) => t.channelId === user?.channelId);

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);

  const filtered = allTransactions.filter((t) => {
    if (search && !t.transactionNo.includes(search) && !t.orderNo.includes(search)) return false;
    if (channelFilter && t.channelId !== channelFilter) return false;
    return true;
  });

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
        <span style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {amount >= 0 ? '+' : ''}{amount.toFixed(2)} 元
        </span>
      ),
    },
    ...(isAdmin ? [{ title: '渠道', dataIndex: 'channelName', key: 'channelName' }] : []),
    { title: '交易时间', dataIndex: 'createdAt', key: 'createdAt' },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索流水号/订单号"
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
        {isAdmin && (
          <Select
            placeholder="按渠道筛选"
            style={{ width: 180 }}
            allowClear
            value={channelFilter}
            onChange={setChannelFilter}
          >
            {mockChannels.map((c) => (
              <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
            ))}
          </Select>
        )}
        <RangePicker placeholder={['开始日期', '结束日期']} />
      </div>
      <Table columns={columns} dataSource={filtered} rowKey="id" />
    </>
  );
}
