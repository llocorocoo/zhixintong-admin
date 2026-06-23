import { Card, Empty } from 'antd';

export default function Settings() {
  return (
    <>
      <h2 style={{ marginBottom: 24 }}>系统配置</h2>
      <Card title="报告相关配置" style={{ marginBottom: 16 }}>
        <Empty description="报告模板配置（后续扩展）" />
      </Card>
      <Card title="其他常规配置">
        <Empty description="预留配置模块（后续扩展）" />
      </Card>
    </>
  );
}
