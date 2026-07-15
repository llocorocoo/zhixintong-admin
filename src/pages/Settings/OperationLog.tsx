import { useState } from 'react';
import { Table, Button, Tag, Form, Input, Select, Row, Col, Modal, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useOperationLog } from '@/store/useOperationLog';
import type { OperationLog } from '@/store/useOperationLog';

const MODULE_OPTIONS = ['账号管理', '角色管理', '渠道管理', '订单管理'];
const ACTION_OPTIONS = [
  { value: 'create', label: '新增' },
  { value: 'update', label: '修改' },
  { value: 'delete', label: '删除' },
  { value: 'assign', label: '分配账号' },
  { value: 'toggle', label: '启用/停用' },
  { value: 'reset_pwd', label: '重置密码' },
];

const ACTION_COLORS: Record<string, string> = {
  create: 'blue',
  update: 'orange',
  delete: 'red',
  assign: 'purple',
  toggle: 'cyan',
  reset_pwd: 'gold',
};

export default function OperationLogPage() {
  const { logs } = useOperationLog();
  const [searchForm] = Form.useForm();
  const [searchOperator, setSearchOperator] = useState('');
  const [searchModule, setSearchModule] = useState<string | undefined>(undefined);
  const [searchAction, setSearchAction] = useState<string | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);

  const filtered = logs.filter((log) => {
    if (searchOperator && !log.operatorName.includes(searchOperator)) return false;
    if (searchModule && log.module !== searchModule) return false;
    if (searchAction && log.action !== searchAction) return false;
    return true;
  });

  const handleReset = () => {
    searchForm.resetFields();
    setSearchOperator('');
    setSearchModule(undefined);
    setSearchAction(undefined);
  };

  const showDetail = (log: OperationLog) => {
    setDetailLog(log);
    setDetailOpen(true);
  };

  const columns = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 120 },
    { title: '模块', dataIndex: 'module', key: 'module', width: 100 },
    {
      title: '操作', key: 'action', width: 100,
      render: (_: unknown, record: OperationLog) => (
        <Tag color={ACTION_COLORS[record.action] || 'default'}>{record.actionLabel}</Tag>
      ),
    },
    { title: '操作对象', dataIndex: 'targetName', key: 'targetName', width: 150 },
    {
      title: '结果', dataIndex: 'result', key: 'result', width: 80,
      render: (result: string) => (
        <Tag color={result === 'success' ? 'green' : 'red'}>{result === 'success' ? '成功' : '失败'}</Tag>
      ),
    },
    {
      title: '变更摘要', key: 'summary',
      render: (_: unknown, record: OperationLog) => {
        if (!record.changes || record.changes.length === 0) return <span style={{ color: 'var(--text-secondary)' }}>—</span>;
        return record.changes.map((c, i) => (
          <span key={i}>
            {c.fieldLabel}：{c.before || '无'} → {c.after || '无'}
            {i < record.changes!.length - 1 ? '；' : ''}
          </span>
        ));
      },
    },
    {
      title: '操作', key: 'ops', width: 80,
      render: (_: unknown, record: OperationLog) => (
        <a onClick={() => showDetail(record)}>详情</a>
      ),
    },
  ];

  return (
    <>
      <div className="search-bar">
        <Form form={searchForm} layout="inline">
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={8}>
              <Form.Item label="操作人" name="operator" style={{ width: '100%' }}>
                <Input
                  placeholder="请输入操作人"
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="模块" name="module" style={{ width: '100%' }}>
                <Select
                  placeholder="全部模块"
                  allowClear
                  value={searchModule}
                  onChange={setSearchModule}
                >
                  {MODULE_OPTIONS.map((m) => (
                    <Select.Option key={m} value={m}>{m}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="操作类型" name="action" style={{ width: '100%' }}>
                <Select
                  placeholder="全部类型"
                  allowClear
                  value={searchAction}
                  onChange={setSearchAction}
                >
                  {ACTION_OPTIONS.map((a) => (
                    <Select.Option key={a.value} value={a.value}>{a.label}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="search-buttons">
            <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </div>
        </Form>
      </div>

      <div className="table-toolbar">
        <Button icon={<ReloadOutlined />}>刷新</Button>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>共 {filtered.length} 条日志</span>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{ showTotal: (total) => `共 ${total} 条`, showSizeChanger: true, showQuickJumper: true, defaultPageSize: 20 }}
      />

      <Modal
        title="操作日志详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={<Button onClick={() => setDetailOpen(false)}>关闭</Button>}
        width={600}
      >
        {detailLog && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="操作人">{detailLog.operatorName}</Descriptions.Item>
              <Descriptions.Item label="操作时间">{detailLog.createdAt}</Descriptions.Item>
              <Descriptions.Item label="操作模块">{detailLog.module}</Descriptions.Item>
              <Descriptions.Item label="操作类型">
                <Tag color={ACTION_COLORS[detailLog.action] || 'default'}>{detailLog.actionLabel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="操作对象">{detailLog.targetName}</Descriptions.Item>
              <Descriptions.Item label="操作结果">
                <Tag color={detailLog.result === 'success' ? 'green' : 'red'}>
                  {detailLog.result === 'success' ? '成功' : '失败'}
                </Tag>
              </Descriptions.Item>
              {detailLog.remark && (
                <Descriptions.Item label="备注" span={2}>{detailLog.remark}</Descriptions.Item>
              )}
            </Descriptions>

            {detailLog.changes && detailLog.changes.length > 0 && (
              <>
                <div style={{ margin: '16px 0 8px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>变更内容</div>
                <Table
                  dataSource={detailLog.changes}
                  rowKey="field"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '字段', dataIndex: 'fieldLabel', key: 'fieldLabel' },
                    { title: '变更前', dataIndex: 'before', key: 'before', render: (v: string | null) => v || <span style={{ color: 'var(--text-secondary)' }}>无</span> },
                    { title: '变更后', dataIndex: 'after', key: 'after', render: (v: string | null) => v || <span style={{ color: 'var(--text-secondary)' }}>无</span> },
                  ]}
                />
              </>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
