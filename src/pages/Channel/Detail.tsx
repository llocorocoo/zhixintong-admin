import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Button, Card, QRCode, Input, Form, Upload, message, Space } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons';
import { mockChannels } from '@/mock/data';
import { CHANNEL_TYPE_MAP } from '@/utils/constants';

export default function ChannelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const channel = mockChannels.find((c) => c.id === id);

  if (!channel) {
    return <div>渠道商不存在</div>;
  }

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

      <Card title="推广链接" style={{ marginBottom: 16 }}>
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
              <QRCode value={channel.promoLink} size={160} />
            </div>
          </div>
        </Space>
      </Card>

      {channel.type === 'oem' && (
        <>
          <Card title="OEM 域名绑定" style={{ marginBottom: 16 }}>
            <Form layout="inline">
              <Form.Item label="自定义域名">
                <Input defaultValue={channel.domain} placeholder="例: report.example.com" style={{ width: 300 }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={() => message.success('域名配置已保存（演示）')}>
                  保存
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="OEM Logo 定制">
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => { message.info('Logo 上传（演示）'); return false; }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传 Logo</div>
              </div>
            </Upload>
          </Card>
        </>
      )}
    </>
  );
}
