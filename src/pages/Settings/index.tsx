import { useState } from 'react';
import { Tree } from 'antd';
import {
  SafetyCertificateOutlined,
  FileTextOutlined,
  ToolOutlined,
  TeamOutlined,
  KeyOutlined,
  FileSearchOutlined,
  EditOutlined,
  SettingOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import PermissionGroup from './PermissionGroup';
import PermissionItem from './PermissionItem';
import ReportTemplate from './ReportTemplate';
import ReportContent from './ReportContent';
import BasicParams from './BasicParams';
import NotificationConfig from './NotificationConfig';

const treeData: TreeDataNode[] = [
  {
    title: '权限配置',
    key: 'permission',
    icon: <SafetyCertificateOutlined />,
    children: [
      { title: '权限分组管理', key: 'permission-group', icon: <TeamOutlined /> },
      { title: '权限项管理', key: 'permission-item', icon: <KeyOutlined /> },
    ],
  },
  {
    title: '报告配置',
    key: 'report',
    icon: <FileTextOutlined />,
    children: [
      { title: '报告模板', key: 'report-template', icon: <FileSearchOutlined /> },
      { title: '报告内容设置', key: 'report-content', icon: <EditOutlined /> },
    ],
  },
  {
    title: '平台设置',
    key: 'platform',
    icon: <ToolOutlined />,
    children: [
      { title: '基础参数', key: 'basic-params', icon: <SettingOutlined /> },
      { title: '通知配置', key: 'notification', icon: <BellOutlined /> },
    ],
  },
];

const contentMap: Record<string, React.ReactNode> = {
  'permission-group': <PermissionGroup />,
  'permission-item': <PermissionItem />,
  'report-template': <ReportTemplate />,
  'report-content': <ReportContent />,
  'basic-params': <BasicParams />,
  'notification': <NotificationConfig />,
};

const titleMap: Record<string, string> = {
  'permission-group': '权限分组管理',
  'permission-item': '权限项管理',
  'report-template': '报告模板',
  'report-content': '报告内容设置',
  'basic-params': '基础参数',
  'notification': '通知配置',
};

export default function Settings() {
  const [selectedKey, setSelectedKey] = useState('permission-group');

  const onSelect = (keys: React.Key[]) => {
    const key = keys[0] as string;
    if (key && contentMap[key]) {
      setSelectedKey(key);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 16, minHeight: 'calc(100vh - 160px)' }}>
      <div
        style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--content-bg)',
          borderRadius: 8,
          border: '1px solid var(--search-border)',
          padding: '12px 0',
        }}
      >
        <div
          style={{
            padding: '0 16px 12px',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--text-primary)',
            borderBottom: '1px solid var(--search-border)',
            marginBottom: 8,
          }}
        >
          系统配置
        </div>
        <Tree
          showIcon
          defaultExpandAll
          selectedKeys={[selectedKey]}
          onSelect={onSelect}
          treeData={treeData}
          style={{ background: 'transparent' }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            marginBottom: 16,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          {titleMap[selectedKey] || ''}
        </div>
        {contentMap[selectedKey]}
      </div>
    </div>
  );
}
