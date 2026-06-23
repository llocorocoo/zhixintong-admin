import { useState } from 'react';
import { Table, Tag, Input, Select, Modal, Descriptions, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockOrders, mockChannels } from '@/mock/data';
import { ORDER_STATUS_MAP, REPORT_TYPE_MAP } from '@/utils/constants';
import type { Order } from '@/types';

const { RangePicker } = DatePicker;

export default function OrderList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const allOrders = isAdmin ? mockOrders : mockOrders.filter((o) => o.channelId === user?.channelId);

  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = allOrders.filter((o) => {
    if (search && !o.orderNo.includes(search) && !o.userName.includes(search)) return false;
    if (channelFilter && o.channelId !== channelFilter) return false;
    return true;
  });

  const columns = [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '用户姓名', dataIndex: 'userName', key: 'userName' },
    { title: '手机号', dataIndex: 'userPhone', key: 'userPhone' },
    {
      title: '报告类型', dataIndex: 'reportType', key: 'reportType',
      render: (type: string) => REPORT_TYPE_MAP[type],
    },
    {
      title: '金额', dataIndex: 'amount', key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (status: string) => {
        const s = ORDER_STATUS_MAP[status];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    ...(isAdmin ? [{ title: '渠道', dataIndex: 'channelName', key: 'channelName' }] : []),
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: Order) => (
        <a onClick={() => setDetailOrder(record)}>详情</a>
      ),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索订单号/用户姓名"
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

      <Modal
        title="订单详情"
        open={!!detailOrder}
        onCancel={() => setDetailOrder(null)}
        footer={null}
        width={600}
      >
        {detailOrder && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="订单编号">{detailOrder.orderNo}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={ORDER_STATUS_MAP[detailOrder.status].color}>
                {ORDER_STATUS_MAP[detailOrder.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="用户姓名">{detailOrder.userName}</Descriptions.Item>
            <Descriptions.Item label="手机号">{detailOrder.userPhone}</Descriptions.Item>
            <Descriptions.Item label="报告类型">{REPORT_TYPE_MAP[detailOrder.reportType]}</Descriptions.Item>
            <Descriptions.Item label="金额">¥{detailOrder.amount.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="渠道来源">{detailOrder.channelName}</Descriptions.Item>
            <Descriptions.Item label="下单时间">{detailOrder.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}
