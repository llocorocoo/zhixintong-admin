import { useState } from 'react';
import { Table, Tag, Tabs, Input, Select, Modal, Descriptions, DatePicker, Form, Button, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockOrders, mockChannels } from '@/mock/data';
import { ORDER_STATUS_MAP, REPORT_TYPE_MAP, CHANNEL_TYPE_MAP } from '@/utils/constants';
import type { Order } from '@/types';
import { exportToExcel } from '@/utils/exportExcel';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function OrderList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const allOrders = isAdmin ? mockOrders : mockOrders.filter((o) => o.channelId === user?.channelId);

  const [activeTab, setActiveTab] = useState('completed');
  const [search, setSearch] = useState('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string | undefined>(undefined);
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);
  const [channelTypeFilter, setChannelTypeFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [searchForm] = Form.useForm();

  const channelTypeMap = new Map(mockChannels.map((c) => [c.id, c.type]));

  const tabOrders = allOrders.filter((o) => o.status === activeTab);

  const filtered = tabOrders.filter((o) => {
    if (search && !o.orderNo.includes(search) && !o.userName.includes(search) && !o.userPhone.includes(search)) return false;
    if (reportTypeFilter && o.reportType !== reportTypeFilter) return false;
    if (channelFilter && o.channelId !== channelFilter) return false;
    if (channelTypeFilter && channelTypeMap.get(o.channelId) !== channelTypeFilter) return false;
    if (dateRange) {
      const orderDate = o.createdAt.split(' ')[0];
      if (orderDate < dateRange[0].format('YYYY-MM-DD') || orderDate > dateRange[1].format('YYYY-MM-DD')) return false;
    }
    return true;
  });

  const tabItems = [
    { key: 'completed', label: `已完成 (${allOrders.filter((o) => o.status === 'completed').length})` },
    { key: 'pending', label: `未完成 (${allOrders.filter((o) => o.status === 'pending').length})` },
    { key: 'cancelled', label: `已取消 (${allOrders.filter((o) => o.status === 'cancelled').length})` },
  ];

  const handleReset = () => {
    searchForm.resetFields();
    setSearch('');
    setReportTypeFilter(undefined);
    setChannelFilter(undefined);
    setChannelTypeFilter(undefined);
    setDateRange(null);
  };

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
    {
      title: '渠道种类', dataIndex: 'channelId', key: 'channelType',
      render: (channelId: string) => {
        const type = channelTypeMap.get(channelId);
        return type ? CHANNEL_TYPE_MAP[type] : '-';
      },
    },
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
      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="关键词" name="search" style={{ width: '100%' }}>
                <Input
                  placeholder="订单号/用户姓名/手机号"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="报告类型" name="reportType" style={{ width: '100%' }}>
                <Select
                  placeholder="全部类型"
                  allowClear
                  value={reportTypeFilter}
                  onChange={setReportTypeFilter}
                >
                  {Object.entries(REPORT_TYPE_MAP).map(([value, label]) => (
                    <Select.Option key={value} value={value}>{label}</Select.Option>
                  ))}
                </Select>
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
            {isAdmin && (
              <Col span={8}>
                <Form.Item label="渠道种类" name="channelType" style={{ width: '100%' }}>
                  <Select
                    placeholder="全部种类"
                    allowClear
                    value={channelTypeFilter}
                    onChange={setChannelTypeFilter}
                  >
                    {Object.entries(CHANNEL_TYPE_MAP).map(([value, label]) => (
                      <Select.Option key={value} value={value}>{label}</Select.Option>
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

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 0 }}
      />

      <div className="table-toolbar">
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToExcel(
            filtered as unknown as Record<string, unknown>[],
            [
              { title: '订单编号', dataIndex: 'orderNo' },
              { title: '用户姓名', dataIndex: 'userName' },
              { title: '手机号', dataIndex: 'userPhone' },
              { title: '报告类型', dataIndex: 'reportType', render: (v) => REPORT_TYPE_MAP[v as string] || String(v) },
              { title: '金额', dataIndex: 'amount', render: (v) => `¥${Number(v).toFixed(2)}` },
              { title: '状态', dataIndex: 'status', render: (v) => ORDER_STATUS_MAP[v as string]?.text || String(v) },
              ...(isAdmin ? [{ title: '渠道', dataIndex: 'channelName' }] : []),
              { title: '渠道种类', dataIndex: 'channelId', render: (v) => { const t = channelTypeMap.get(v as string); return t ? CHANNEL_TYPE_MAP[t] : '-'; } },
              { title: '下单时间', dataIndex: 'createdAt' },
            ],
            '订单管理',
          )}
        >
          导出 Excel
        </Button>
        <Button icon={<ReloadOutlined />}>刷新</Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true }} />

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
