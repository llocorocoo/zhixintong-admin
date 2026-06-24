import { Card, Descriptions, QRCode, Input, message, Space, Tag } from 'antd';
import { useAuth } from '@/store/useAuth';
import { useChannels } from '@/store/useChannels';
import { CHANNEL_TYPE_MAP } from '@/utils/constants';

export default function MyChannel() {
  const { user } = useAuth();
  const { channels } = useChannels();
  const channel = channels.find((c) => c.id === user?.channelId);

  if (!channel) {
    return <div>未找到渠道信息</div>;
  }

  return (
    <>
      <Card title="渠道信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="渠道商名称">{channel.name}</Descriptions.Item>
          <Descriptions.Item label="渠道类型">
            <Tag color={channel.type === 'oem' ? 'purple' : 'blue'}>
              {CHANNEL_TYPE_MAP[channel.type]}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="推广链接与二维码">
        <Space direction="vertical" size="middle">
          <div>
            <strong>推广码: </strong>{channel.promoCode}
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
              <QRCode value={channel.promoLink} size={200} />
            </div>
          </div>
        </Space>
      </Card>
    </>
  );
}
