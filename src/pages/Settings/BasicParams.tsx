import { useState } from 'react';
import { Form, Input, InputNumber, Button, Upload, message, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

interface BasicParamsData {
  platformName: string;
  basicPrice: number;
  standardPrice: number;
  premiumPrice: number;
  channelSharePercent: number;
  servicePhone: string;
  serviceEmail: string;
}

const defaultValues: BasicParamsData = {
  platformName: '职信通',
  basicPrice: 29.9,
  standardPrice: 59.9,
  premiumPrice: 99.9,
  channelSharePercent: 30,
  servicePhone: '400-800-1234',
  serviceEmail: 'service@zhixintong.com',
};

export default function BasicParams() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log('保存基础参数:', values, '文件:', fileList);
      message.success('基础参数已保存');
    });
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultValues}
        style={{ maxWidth: 600 }}
      >
        <Form.Item name="platformName" label="平台名称" rules={[{ required: true, message: '请输入平台名称' }]}>
          <Input placeholder="请输入平台名称" />
        </Form.Item>

        <Form.Item label="平台Logo">
          <Upload
            fileList={fileList}
            onChange={({ fileList: newFileList }) => setFileList(newFileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
            listType="picture"
          >
            <Button icon={<UploadOutlined />}>上传Logo</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="basicPrice" label="基础报告定价（元）" rules={[{ required: true, message: '请输入' }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入金额" />
        </Form.Item>

        <Form.Item name="standardPrice" label="标准报告定价（元）" rules={[{ required: true, message: '请输入' }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入金额" />
        </Form.Item>

        <Form.Item name="premiumPrice" label="高级报告定价（元）" rules={[{ required: true, message: '请输入' }]}>
          <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入金额" />
        </Form.Item>

        <Form.Item name="channelSharePercent" label="渠道分成比例" rules={[{ required: true, message: '请输入' }]}>
          <InputNumber min={0} max={100} precision={0} style={{ width: '100%' }} addonAfter="%" placeholder="请输入比例" />
        </Form.Item>

        <Form.Item name="servicePhone" label="客服电话" rules={[{ required: true, message: '请输入客服电话' }]}>
          <Input placeholder="请输入客服电话" />
        </Form.Item>

        <Form.Item name="serviceEmail" label="客服邮箱" rules={[{ required: true, message: '请输入客服邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
          <Input placeholder="请输入客服邮箱" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
