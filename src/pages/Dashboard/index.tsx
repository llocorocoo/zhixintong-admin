import { Card, Col, Row, Statistic } from 'antd';
import { TeamOutlined, ShoppingCartOutlined, TransactionOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '@/store/useAuth';
import { mockChannels, mockOrders, mockTransactions } from '@/mock/data';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const orders = isAdmin ? mockOrders : mockOrders.filter((o) => o.channelId === user?.channelId);
  const transactions = isAdmin ? mockTransactions : mockTransactions.filter((t) => t.channelId === user?.channelId);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>
        {isAdmin ? '平台概览' : '我的数据'}
      </h2>
      <Row gutter={[16, 16]}>
        {isAdmin && (
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="渠道商总数" value={mockChannels.length} prefix={<TeamOutlined />} />
            </Card>
          </Col>
        )}
        <Col xs={24} sm={12} lg={isAdmin ? 6 : 8}>
          <Card>
            <Statistic title="订单总数" value={orders.length} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={isAdmin ? 6 : 8}>
          <Card>
            <Statistic title="交易笔数" value={transactions.length} prefix={<TransactionOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={isAdmin ? 6 : 8}>
          <Card>
            <Statistic title="收入总额" value={totalIncome} precision={2} prefix={<DollarOutlined />} suffix="元" />
          </Card>
        </Col>
      </Row>
    </>
  );
}
