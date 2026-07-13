import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Button, Card, QRCode, Input, message, Space, Alert } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useChannels } from '@/store/useChannels';
import { CHANNEL_TYPE_MAP } from '@/utils/constants';
import { usePermission } from '@/hooks/usePermission';

export default function ChannelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { channels, updateChannel } = useChannels();
  const { hasPermission } = usePermission();
  const channel = channels.find((c) => c.id === id);

  if (!channel) {
    return <div>渠道商不存在</div>;
  }

  const regeneratePromoLink = () => {
    const newCode = channel.name.substring(0, 2).toUpperCase() + Date.now().toString().slice(-4);
    updateChannel(channel.id, {
      promoCode: newCode,
      promoLink: `https://zhixintong.com/r/${newCode}`,
    });
    message.success('推广链接已重新生成');
  };

  return (
    <>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/channel')} style={{ marginBottom: 16 }}>
        返回列表
      </Button>

      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="渠道商名称">{channel.name}</Descriptions.Item>
          <Descriptions.Item label="联系人">{channel.contact}</Descriptions.Item>
          <Descriptions.Item label="联系方式">{channel.phone}</Descriptions.Item>
          <Descriptions.Item label="渠道类型">
            <Tag color={channel.type === 'oem' ? 'purple' : 'blue'}>
              {CHANNEL_TYPE_MAP[channel.type]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={channel.status === 'active' ? 'green' : 'default'}>
              {channel.status === 'active' ? '启用' : '停用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{channel.createdAt}</Descriptions.Item>
        </Descriptions>
      </Card>

      {channel.type === 'pure' && hasPermission('channel:pure_detail') && (
        <Card
          title="推广链接"
          style={{ marginBottom: 16 }}
          extra={
            <Button icon={<ReloadOutlined />} onClick={regeneratePromoLink}>
              重新生成
            </Button>
          }
        >
          <Alert
            message="纯渠道模式：用户通过此专属链接下单时，系统自动识别订单来源归属该渠道商"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Space direction="vertical" size="middle">
            <div>
              <strong>渠道码: </strong>{channel.promoCode}
            </div>
            <div>
              <strong>推广链接: </strong>
              <Input value={channel.promoLink} readOnly style={{ width: 400 }}
                addonAfter={
                  <a onClick={() => { navigator.clipboard.writeText(channel.promoLink); message.success('已复制'); }}>
                    复制
                  </a>
                }
              />
            </div>
            <div>
              <strong>二维码: </strong>
              <div style={{ marginTop: 8 }}>
                <QRCode value={channel.promoLink} size={160} />
              </div>
            </div>
          </Space>
        </Card>
      )}

      {channel.type === 'oem' && hasPermission('channel:oem_detail') && (
        <>
          <Alert
            message="OEM 白标模式：渠道商使用自有域名，系统通过域名映射识别订单来源，同时支持 Logo 定制"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Card title="域名信息" style={{ marginBottom: 16 }}>
            {channel.domain ? (
              <div>
                <strong>已绑定域名：</strong>
                <span style={{ color: '#52c41a' }}>{channel.domain}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>→ 映射至平台服务</span>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>暂未绑定域名，请在渠道商列表中编辑添加</div>
            )}
          </Card>

          <Card title="Logo 信息">
            {channel.logo ? (
              <div>
                <div style={{ marginBottom: 8, color: 'var(--text-secondary)' }}>当前品牌 Logo：</div>
                <img src={channel.logo} alt="Logo" style={{ maxHeight: 80, border: '1px solid #eee', padding: 4 }} />
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>暂未上传 Logo，请在渠道商列表中编辑添加</div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
