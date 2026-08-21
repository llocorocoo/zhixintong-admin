import { useRef, useState } from 'react';
import {
  Table, Tag, Tabs, Input, Select, DatePicker, Form, Button, Row, Col, Card, Statistic,
  Drawer, Descriptions, Image, Radio, Rate, Space, Tooltip, Popconfirm, Typography, message, Divider,
} from 'antd';
import {
  SearchOutlined, ReloadOutlined, DownloadOutlined, MessageOutlined,
  ClockCircleOutlined, SyncOutlined, PlusCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useFeedback } from '@/store/useFeedback';
import { useOperationLog } from '@/store/useOperationLog';
import { useAuth } from '@/store/useAuth';
import { usePermission } from '@/hooks/usePermission';
import { mockChannels, mockUsers } from '@/mock/data';
import { FEEDBACK_TYPE_MAP, FEEDBACK_STATUS_MAP, REPLY_CHANNEL_MAP } from '@/utils/constants';
import { exportToExcel } from '@/utils/exportExcel';
import type { Feedback, ReplyChannel } from '@/types';

const { RangePicker } = DatePicker;
const { Paragraph } = Typography;

// 可指派的处理人 = 平台管理账号
const HANDLERS = mockUsers.filter((u) => u.role === 'admin');

export default function FeedbackList() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const { feedbacks, replyFeedback, assignFeedback, closeFeedback, ignoreFeedback, saveRemark } = useFeedback();
  const { addLog } = useOperationLog();

  const [searchForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [channelFilter, setChannelFilter] = useState<string | undefined>(undefined);
  const [handlerFilter, setHandlerFilter] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState<ReplyChannel>('notice');
  const [remarkText, setRemarkText] = useState('');
  // 「回复」入口打开抽屉后直接定位到回复框，「详情」则停在顶部先看内容
  const [jumpToReply, setJumpToReply] = useState(false);
  const replyBoxRef = useRef<HTMLDivElement>(null);

  const detail = feedbacks.find((f) => f.id === detailId) ?? null;

  const canReply = hasPermission('feedback:reply');
  const canAssign = hasPermission('feedback:assign');
  const canClose = hasPermission('feedback:close');
  const canExport = hasPermission('feedback:export');

  // ---------- 统计 ----------
  const today = dayjs().format('YYYY-MM-DD');
  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;
  const processingCount = feedbacks.filter((f) => f.status === 'processing').length;
  const todayCount = feedbacks.filter((f) => f.createdAt.startsWith(today)).length;
  const repliedList = feedbacks.filter((f) => f.replyAt);
  const avgHours = repliedList.length
    ? repliedList.reduce((sum, f) => sum + dayjs(f.replyAt).diff(dayjs(f.createdAt), 'minute'), 0) / repliedList.length / 60
    : 0;

  // ---------- 筛选 ----------
  const tabFiltered = activeTab === 'all' ? feedbacks : feedbacks.filter((f) => f.status === activeTab);

  const filtered = tabFiltered.filter((f) => {
    if (search && !f.feedbackNo.includes(search) && !f.userPhone.includes(search)
      && !f.content.includes(search) && !f.userNickname.includes(search)) return false;
    if (typeFilter && f.type !== typeFilter) return false;
    if (channelFilter && f.channelId !== channelFilter) return false;
    if (handlerFilter && f.handlerId !== handlerFilter) return false;
    if (dateRange) {
      const d = f.createdAt.split(' ')[0];
      if (d < dateRange[0].format('YYYY-MM-DD') || d > dateRange[1].format('YYYY-MM-DD')) return false;
    }
    return true;
  });

  const countOf = (status: string) => feedbacks.filter((f) => f.status === status).length;

  const tabItems = [
    { key: 'all', label: `全部 (${feedbacks.length})` },
    { key: 'pending', label: `待处理 (${countOf('pending')})` },
    { key: 'processing', label: `处理中 (${countOf('processing')})` },
    { key: 'replied', label: `已回复 (${countOf('replied')})` },
    { key: 'closed', label: `已关闭 (${countOf('closed')})` },
    { key: 'ignored', label: `已忽略 (${countOf('ignored')})` },
  ];

  const handleReset = () => {
    searchForm.resetFields();
    setSearch('');
    setTypeFilter(undefined);
    setChannelFilter(undefined);
    setHandlerFilter(undefined);
    setDateRange(null);
  };

  const openDetail = (record: Feedback, toReply = false) => {
    setDetailId(record.id);
    setReplyText(record.replyContent ?? '');
    setReplyChannel(record.replyChannel ?? 'notice');
    setRemarkText(record.internalRemark ?? '');
    setJumpToReply(toReply);
  };

  // 抽屉动画结束后再滚动/聚焦，否则元素还没定位好
  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setJumpToReply(false);
      return;
    }
    if (jumpToReply) {
      replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      replyBoxRef.current?.querySelector('textarea')?.focus();
    }
  };

  const log = (action: string, actionLabel: string, target: Feedback, remark?: string) => {
    addLog({
      operatorId: user?.id ?? '',
      operatorName: user?.name ?? '',
      module: '用户反馈',
      action,
      actionLabel,
      targetType: 'feedback',
      targetId: target.id,
      targetName: target.feedbackNo,
      result: 'success',
      remark,
    });
  };

  // ---------- 操作 ----------
  const handleReply = (closeAfterReply: boolean) => {
    if (!detail) return;
    if (!replyText.trim()) {
      message.warning('请输入回复内容');
      return;
    }
    replyFeedback(detail.id, {
      content: replyText.trim(),
      channel: replyChannel,
      operatorName: user?.name ?? '',
      closeAfterReply,
    });
    log('reply', '回复', detail, `通过${REPLY_CHANNEL_MAP[replyChannel].text}回复用户${closeAfterReply ? '并关闭反馈' : ''}`);
    message.success(`回复已提交，将通过${REPLY_CHANNEL_MAP[replyChannel].text}触达用户`);
    if (closeAfterReply) setDetailId(null);
  };

  const handleAssign = (handlerId: string) => {
    if (!detail) return;
    const handler = HANDLERS.find((h) => h.id === handlerId);
    if (!handler) return;
    assignFeedback(detail.id, handler.id, handler.name);
    log('assign', '指派', detail, `处理人：${handler.name}`);
    message.success(`已指派给 ${handler.name}`);
  };

  const handleSaveRemark = () => {
    if (!detail) return;
    saveRemark(detail.id, remarkText.trim());
    log('update', '修改', detail, '更新内部备注');
    message.success('内部备注已保存');
  };

  const handleClose = () => {
    if (!detail) return;
    closeFeedback(detail.id);
    log('close', '关闭', detail);
    message.success('反馈已关闭');
    setDetailId(null);
  };

  const handleIgnore = () => {
    if (!detail) return;
    ignoreFeedback(detail.id);
    log('ignore', '忽略', detail);
    message.success('反馈已忽略');
    setDetailId(null);
  };

  const columns = [
    { title: '反馈编号', dataIndex: 'feedbackNo', key: 'feedbackNo', width: 140 },
    {
      title: '用户', key: 'user', width: 130,
      render: (_: unknown, r: Feedback) => (
        <>
          <div>{r.userNickname}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{r.userPhone}</div>
        </>
      ),
    },
    {
      title: '反馈类型', dataIndex: 'type', key: 'type', width: 115,
      render: (t: string) => <Tag color={FEEDBACK_TYPE_MAP[t].color}>{FEEDBACK_TYPE_MAP[t].text}</Tag>,
    },
    {
      title: '反馈内容', dataIndex: 'content', key: 'content', ellipsis: true,
      render: (c: string, r: Feedback) => (
        <Tooltip title={c} placement="topLeft">
          <span>
            {c}
            {r.images?.length ? (
              <Tag style={{ marginLeft: 6 }}>{r.images.length} 图</Tag>
            ) : null}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '关联订单', dataIndex: 'relatedOrderNo', key: 'relatedOrderNo', width: 150,
      render: (v?: string) => v || <span style={{ color: 'var(--text-secondary)' }}>—</span>,
    },
    { title: '来源渠道', dataIndex: 'channelName', key: 'channelName', width: 100 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => <Tag color={FEEDBACK_STATUS_MAP[s].color}>{FEEDBACK_STATUS_MAP[s].text}</Tag>,
    },
    {
      title: '处理人', dataIndex: 'handlerName', key: 'handlerName', width: 95,
      render: (v?: string) => v || <span style={{ color: 'var(--text-secondary)' }}>未指派</span>,
    },
    { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 165 },
    {
      title: '操作', key: 'ops', width: 110, fixed: 'right' as const,
      render: (_: unknown, r: Feedback) => (
        <Space size={4}>
          <a onClick={() => openDetail(r)}>详情</a>
          {canReply && r.status !== 'closed' && r.status !== 'ignored' && (
            <a onClick={() => openDetail(r, true)}>{r.replyAt ? '追加回复' : '回复'}</a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: pendingCount > 0 ? '#cf1322' : undefined }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="处理中" value={processingCount} prefix={<SyncOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card><Statistic title="今日新增" value={todayCount} prefix={<PlusCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="平均响应时长" value={avgHours} precision={1} suffix="小时" prefix={<MessageOutlined />} />
          </Card>
        </Col>
      </Row>

      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="关键词" name="search" style={{ width: '100%' }}>
                <Input
                  placeholder="反馈编号/手机号/昵称/内容"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="反馈类型" name="type" style={{ width: '100%' }}>
                <Select placeholder="全部类型" allowClear value={typeFilter} onChange={setTypeFilter}>
                  {Object.entries(FEEDBACK_TYPE_MAP).map(([value, cfg]) => (
                    <Select.Option key={value} value={value}>{cfg.text}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="来源渠道" name="channel" style={{ width: '100%' }}>
                <Select placeholder="全部渠道" allowClear value={channelFilter} onChange={setChannelFilter}>
                  {mockChannels.map((c) => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="处理人" name="handler" style={{ width: '100%' }}>
                <Select placeholder="全部处理人" allowClear value={handlerFilter} onChange={setHandlerFilter}>
                  {HANDLERS.map((h) => (
                    <Select.Option key={h.id} value={h.id}>{h.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="提交时间" name="dateRange" style={{ width: '100%' }}>
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

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} style={{ marginBottom: 0 }} />

      <div className="table-toolbar">
        {canExport && (
          <Button
            icon={<DownloadOutlined />}
            onClick={() => exportToExcel(
              filtered as unknown as Record<string, unknown>[],
              [
                { title: '反馈编号', dataIndex: 'feedbackNo' },
                { title: '用户昵称', dataIndex: 'userNickname' },
                { title: '手机号', dataIndex: 'userPhone' },
                { title: '反馈类型', dataIndex: 'type', render: (v) => FEEDBACK_TYPE_MAP[v as string]?.text || String(v) },
                { title: '反馈内容', dataIndex: 'content' },
                { title: '关联订单', dataIndex: 'relatedOrderNo' },
                { title: '来源渠道', dataIndex: 'channelName' },
                { title: '状态', dataIndex: 'status', render: (v) => FEEDBACK_STATUS_MAP[v as string]?.text || String(v) },
                { title: '处理人', dataIndex: 'handlerName' },
                { title: '回复内容', dataIndex: 'replyContent' },
                { title: '回复时间', dataIndex: 'replyAt' },
                { title: '提交时间', dataIndex: 'createdAt' },
              ],
              '用户反馈',
            )}
          >
            导出 Excel
          </Button>
        )}
        <Button icon={<ReloadOutlined />}>刷新</Button>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>共 {filtered.length} 条反馈</span>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true, defaultPageSize: 20 }}
      />

      <Drawer
        title={detail ? `反馈详情 · ${detail.feedbackNo}` : '反馈详情'}
        open={!!detail}
        onClose={() => setDetailId(null)}
        afterOpenChange={handleDrawerOpenChange}
        width={760}
        extra={detail && <Tag color={FEEDBACK_STATUS_MAP[detail.status].color}>{FEEDBACK_STATUS_MAP[detail.status].text}</Tag>}
        footer={detail && (
          <Space>
            {canClose && detail.status !== 'closed' && (
              <Popconfirm title="确认关闭该反馈？" description="关闭后不再计入待办，记录保留可查。" onConfirm={handleClose}>
                <Button>关闭反馈</Button>
              </Popconfirm>
            )}
            {canClose && detail.status !== 'ignored' && (
              <Popconfirm title="确认忽略该反馈？" description="用于广告、重复或无效内容，不会通知用户。" onConfirm={handleIgnore}>
                <Button danger>忽略</Button>
              </Popconfirm>
            )}
            <Button onClick={() => setDetailId(null)}>取消</Button>
          </Space>
        )}
      >
        {detail && (
          <>
            <Descriptions
              column={2}
              bordered
              size="small"
              styles={{ label: { width: 96, whiteSpace: 'nowrap' } }}
            >
              <Descriptions.Item label="用户昵称">{detail.userNickname}</Descriptions.Item>
              <Descriptions.Item label="手机号">{detail.userPhone}</Descriptions.Item>
              <Descriptions.Item label="反馈类型">
                <Tag color={FEEDBACK_TYPE_MAP[detail.type].color}>{FEEDBACK_TYPE_MAP[detail.type].text}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="来源渠道">{detail.channelName}</Descriptions.Item>
              <Descriptions.Item label="关联订单">{detail.relatedOrderNo || '—'}</Descriptions.Item>
              <Descriptions.Item label="联系方式">{detail.contactInfo || '—'}</Descriptions.Item>
              <Descriptions.Item label="设备信息" span={2}>{detail.clientInfo || '—'}</Descriptions.Item>
              <Descriptions.Item label="提交时间">{detail.createdAt}</Descriptions.Item>
              <Descriptions.Item label="最后处理时间">{detail.updatedAt}</Descriptions.Item>
              <Descriptions.Item label="反馈内容" span={2}>
                <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>{detail.content}</Paragraph>
              </Descriptions.Item>
            </Descriptions>

            {detail.images && detail.images.length > 0 && (
              <>
                <div style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  截图附件（{detail.images.length}）
                </div>
                <Image.PreviewGroup>
                  <Space wrap>
                    {detail.images.map((src, i) => (
                      <Image key={i} src={src} width={96} height={140} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </>
            )}

            <Divider />

            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>处理信息</div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div style={{ marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>处理人</div>
                <Select
                  placeholder="选择处理人"
                  style={{ width: '100%' }}
                  value={detail.handlerId}
                  onChange={handleAssign}
                  disabled={!canAssign}
                >
                  {HANDLERS.map((h) => (
                    <Select.Option key={h.id} value={h.id}>{h.name}</Select.Option>
                  ))}
                </Select>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>用户评价（C 端暂未开放）</div>
                <Rate disabled value={detail.satisfaction ?? 0} />
              </Col>
            </Row>

            <div style={{ marginBottom: 6, color: 'var(--text-secondary)', fontSize: 13 }}>
              内部备注（仅后台可见，不会发给用户）
            </div>
            <Input.TextArea
              rows={2}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="记录排查过程、跟进结论等"
              maxLength={500}
            />
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Button size="small" onClick={handleSaveRemark}>保存备注</Button>
            </div>

            <Divider />

            <div ref={replyBoxRef}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>回复用户</div>
              {detail.replyAt && (
                <Card size="small" style={{ marginBottom: 12 }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 6 }}>
                    {detail.replyBy} 于 {detail.replyAt} 通过
                    {REPLY_CHANNEL_MAP[detail.replyChannel ?? 'notice'].text}回复
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{detail.replyContent}</div>
                </Card>
              )}

              <Input.TextArea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={canReply ? '回复内容将以站内信形式推送给用户，请注意用语规范' : '无回复权限'}
                maxLength={1000}
                showCount
                disabled={!canReply}
              />

              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <Radio.Group
                  value={replyChannel}
                  onChange={(e) => setReplyChannel(e.target.value)}
                  disabled={!canReply}
                >
                  {Object.entries(REPLY_CHANNEL_MAP).map(([value, cfg]) => (
                    <Radio key={value} value={value} disabled={!cfg.enabled}>
                      {cfg.enabled ? cfg.text : (
                        <Tooltip title="需在「通知配置」中开通后启用">
                          <span>{cfg.text}</span>
                        </Tooltip>
                      )}
                    </Radio>
                  ))}
                </Radio.Group>
                <Space>
                  <Button onClick={() => handleReply(true)} disabled={!canReply || !canClose}>回复并关闭</Button>
                  <Button type="primary" onClick={() => handleReply(false)} disabled={!canReply}>
                    {detail.replyAt ? '再次回复' : '提交回复'}
                  </Button>
                </Space>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </>
  );
}
