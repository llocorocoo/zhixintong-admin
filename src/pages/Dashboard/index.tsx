import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, Col, Empty, Row, Statistic } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RightOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockOrders, mockTransactions } from '@/mock/data';
import type { Transaction } from '@/types';

const UP_COLOR = '#cf1322';
const DOWN_COLOR = '#3f8600';

function DeltaLine({ current, previous, label = '较前日' }: { current: number; previous?: number; label?: string }) {
  if (previous === undefined || previous === 0) {
    return <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>{label} —</div>;
  }
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return (
    <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
      {label}{' '}
      <span style={{ color: up ? UP_COLOR : DOWN_COLOR }}>
        {up ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(pct).toFixed(1)}%
      </span>
    </div>
  );
}

function TrendChart({ data }: { data: { date: string; value: number }[] }) {
  if (data.length === 0) {
    return <Empty description="暂无收入数据" style={{ padding: '40px 0' }} />;
  }
  const width = 680;
  const height = 260;
  const pad = { top: 16, right: 24, bottom: 32, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value)) * 1.2 || 1;
  const x = (i: number) => pad.left + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
  const y = (v: number) => pad.top + innerH - (v / max) * innerH;
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${pad.top + innerH} L${x(0).toFixed(1)},${pad.top + innerH} Z`;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1677ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1677ff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridLines.map((g) => {
        const gy = pad.top + innerH - g * innerH;
        return (
          <g key={g}>
            <line x1={pad.left} y1={gy} x2={width - pad.right} y2={gy} stroke="#f0f0f0" />
            <text x={pad.left - 8} y={gy + 4} textAnchor="end" fontSize="12" fill="#999">
              {(max * g).toFixed(0)}
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill="url(#trendFill)" />
      <path d={linePath} fill="none" stroke="#1677ff" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.date}>
          <circle cx={x(i)} cy={y(d.value)} r="4" fill="#fff" stroke="#1677ff" strokeWidth="2">
            <title>{`${d.date}  ¥${d.value.toFixed(2)}`}</title>
          </circle>
          <text x={x(i)} y={height - 10} textAnchor="middle" fontSize="12" fill="#999">
            {d.date.slice(5)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TodoItem({ to, label, count, color }: { to: string; label: string; count: number; color?: string }) {
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 4px',
        color: 'inherit',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <span>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Badge count={count} showZero color={count > 0 ? color : '#d9d9d9'} />
        <RightOutlined style={{ fontSize: 12, color: '#bbb' }} />
      </span>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const orders = useMemo(
    () => (isAdmin ? mockOrders : mockOrders.filter((o) => o.channelId === user?.channelId)),
    [isAdmin, user?.channelId],
  );
  const transactions = useMemo(
    () => (isAdmin ? mockTransactions : mockTransactions.filter((t) => t.channelId === user?.channelId)),
    [isAdmin, user?.channelId],
  );

  const stats = useMemo(() => {
    const incomes = transactions.filter((t) => t.type === 'income');
    const refunds = transactions.filter((t) => t.type === 'refund');
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
    const refundAmount = refunds.reduce((s, t) => s + Math.abs(t.amount), 0);
    const netIncome = totalIncome - refundAmount;

    const byDay = new Map<string, number>();
    for (const t of incomes) {
      const day = t.createdAt.slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + t.amount);
    }
    const trend = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, value]) => ({ date, value }));

    const orderByDay = new Map<string, number>();
    for (const o of orders) {
      const day = o.createdAt.slice(0, 10);
      orderByDay.set(day, (orderByDay.get(day) ?? 0) + 1);
    }
    const orderDays = [...orderByDay.keys()].sort();

    const completed = orders.filter((o) => o.status === 'completed').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const pending = orders.filter((o) => o.status === 'pending').length;

    return {
      totalIncome,
      refundAmount,
      netIncome,
      trend,
      incomeToday: trend.at(-1)?.value ?? 0,
      incomePrev: trend.at(-2)?.value,
      ordersToday: orderDays.length > 0 ? orderByDay.get(orderDays[orderDays.length - 1])! : 0,
      ordersPrev: orderDays.length > 1 ? orderByDay.get(orderDays[orderDays.length - 2]) : undefined,
      completionRate: orders.length > 0 ? (completed / orders.length) * 100 : 0,
      cancelled,
      pending,
      refundCount: refunds.length,
    };
  }, [orders, transactions]);

  const ranking = useMemo(() => {
    if (!isAdmin) return [];
    const byChannel = new Map<string, number>();
    let total = 0;
    for (const t of mockTransactions.filter((t: Transaction) => t.type === 'income')) {
      byChannel.set(t.channelName, (byChannel.get(t.channelName) ?? 0) + t.amount);
      total += t.amount;
    }
    return [...byChannel.entries()]
      .map(([name, amount]) => ({ name, amount, share: total > 0 ? (amount / total) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [isAdmin]);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="收入总额" value={stats.totalIncome} precision={2} prefix={<DollarOutlined />} suffix="元" />
          <DeltaLine current={stats.incomeToday} previous={stats.incomePrev} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="净收入" value={stats.netIncome} precision={2} prefix={<WalletOutlined />} suffix="元" />
          <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
            退款 <span style={{ color: stats.refundAmount > 0 ? UP_COLOR : '#999' }}>¥{stats.refundAmount.toFixed(2)}</span>
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="订单总数" value={orders.length} prefix={<ShoppingCartOutlined />} />
          <DeltaLine current={stats.ordersToday} previous={stats.ordersPrev} />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="订单完成率"
            value={stats.completionRate}
            precision={1}
            prefix={<CheckCircleOutlined />}
            suffix="%"
          />
          <div style={{ marginTop: 8, fontSize: 13, color: '#999' }}>
            已取消 <span style={{ color: stats.cancelled > 0 ? UP_COLOR : '#999' }}>{stats.cancelled}</span> 笔
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Card title="收入趋势" styles={{ body: { paddingBottom: 8 } }}>
          <TrendChart data={stats.trend} />
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="待办事项" styles={{ body: { paddingTop: 4, paddingBottom: 4 } }}>
              <TodoItem to="/order" label="待处理订单" count={stats.pending} color="#faad14" />
              <TodoItem to="/transaction" label="退款交易" count={stats.refundCount} color="#cf1322" />
            </Card>
          </Col>
          {isAdmin && (
            <Col span={24}>
              <Card title="渠道商收入" styles={{ body: { paddingTop: 4, paddingBottom: 4 } }}>
                <div style={{ maxHeight: 264, overflowY: 'auto' }}>
                  {ranking.map((r, i) => (
                    <div
                      key={r.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i === ranking.length - 1 ? 'none' : '1px solid #f0f0f0',
                      }}
                    >
                      <span style={{ flex: 1, fontSize: 14 }}>{r.name}</span>
                      <span style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, color: '#333', fontVariantNumeric: 'tabular-nums' }}>
                          ¥{r.amount.toFixed(2)}
                        </div>
                        <div style={{ fontSize: 12, color: '#999' }}>占比 {r.share.toFixed(1)}%</div>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </Col>
    </Row>
  );
}
