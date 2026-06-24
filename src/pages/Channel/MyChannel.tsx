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

      {channel.type === 'pure' && (
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
      )}

      {channel.type === 'oem' && (
        <>
          <Card title="域名绑定" style={{ marginBottom: 16 }}>
            {channel.domain ? (
              <div>
                <strong>已绑定域名: </strong>
                <span style={{ color: '#2980b9', fontSize: 15 }}>{channel.domain}</span>
                <span style={{ color: '#999', marginLeft: 8 }}>→ 映射至平台服务</span>
              </div>
            ) : (
              <div style={{ color: '#999' }}>暂未绑定域名，请联系管理员配置</div>
            )}
          </Card>

          <Card title="品牌 Logo">
            {channel.logo ? (
              <div>
                <img src={channel.logo} alt="Logo" style={{ maxHeight: 100, border: '1px solid #eee', padding: 8, borderRadius: 4 }} />
              </div>
            ) : (
              <div style={{ color: '#999' }}>暂未上传 Logo，请联系管理员配置</div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
