import { useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Select, InputNumber, Switch, Tag, Upload, message, Popconfirm, Tooltip,
} from 'antd';
import { PlusOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import { exportToJSON, importFromJSON } from '@/utils/exportImport';
import { useMenus } from '@/store/useMenus';
import { ALL_PERMISSIONS } from '@/types';
import type { SysMenu, MenuType, Permission } from '@/types';
import { MENU_ICON_OPTIONS, renderMenuIcon } from '@/utils/menuIcons';

type MenuNode = SysMenu & { children?: MenuNode[] };

const TYPE_TAG: Record<MenuType, { text: string; color: string }> = {
  M: { text: '目录', color: 'blue' },
  C: { text: '菜单', color: 'green' },
  F: { text: '按钮', color: 'default' },
};

const PERM_OPTIONS: Permission[] = Array.from(new Set<Permission>([...ALL_PERMISSIONS, 'settings:view']));

function toTree(menus: SysMenu[]): MenuNode[] {
  const sorted = [...menus].sort((a, b) => a.orderNum - b.orderNum);
  const byParent = new Map<string | null, SysMenu[]>();
  for (const m of sorted) {
    const arr = byParent.get(m.parentId) ?? [];
    arr.push(m);
    byParent.set(m.parentId, arr);
  }
  const build = (parentId: string | null): MenuNode[] =>
    (byParent.get(parentId) ?? []).map((m) => {
      const children = build(m.id);
      return children.length ? { ...m, children } : { ...m };
    });
  return build(null);
}

export default function MenuManagement() {
  const { menus, addMenu, updateMenu, deleteMenu, toggleVisible, moveMenu, resetMenus, setMenus } = useMenus();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const menuType = Form.useWatch('menuType', form) as MenuType | undefined;

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<SysMenu[] | null>(null);

  const treeData = toTree(menus);
  const parentName = parentId ? menus.find((m) => m.id === parentId)?.name ?? '—' : '顶级菜单';

  const openAdd = (pid: string | null) => {
    setEditingId(null);
    setParentId(pid);
    const siblings = menus.filter((m) => m.parentId === pid);
    const nextOrder = siblings.length ? Math.max(...siblings.map((m) => m.orderNum)) + 1 : 1;
    form.resetFields();
    form.setFieldsValue({ menuType: pid ? 'C' : 'M', orderNum: nextOrder, visible: true });
    setModalOpen(true);
  };

  const openEdit = (record: SysMenu) => {
    setEditingId(record.id);
    setParentId(record.parentId);
    form.setFieldsValue({
      menuType: record.menuType,
      name: record.name,
      icon: record.icon,
      path: record.path,
      perms: record.perms,
      orderNum: record.orderNum,
      visible: record.visible,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.resetFields();
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const isButton = values.menuType === 'F';
      const payload = {
        name: values.name,
        menuType: values.menuType as MenuType,
        icon: isButton ? undefined : values.icon,
        path: isButton ? undefined : values.path,
        perms: values.perms || undefined,
        orderNum: values.orderNum ?? 0,
        visible: values.visible ?? true,
      };
      if (editingId) {
        updateMenu(editingId, payload);
        message.success('菜单已更新');
      } else {
        addMenu({
          id: 'm_' + Date.now(),
          parentId,
          status: 'active',
          system: false,
          ...payload,
        });
        message.success('菜单已创建');
      }
      closeModal();
    });
  };

  const handleExport = () => {
    exportToJSON(menus, '菜单配置');
    message.success(`已导出 ${menus.length} 条菜单数据`);
  };

  const handleImportFile = async (file: File) => {
    try {
      const data = await importFromJSON<SysMenu>(file);
      setImportPreview(data);
      setImportModalOpen(true);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    setMenus(importPreview);
    message.success(`已导入 ${importPreview.length} 条菜单数据（整体替换）`);
    setImportModalOpen(false);
    setImportPreview(null);
  };

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MenuNode) => (
        <Space size={6}>
          {renderMenuIcon(record.icon)}
          <span>{name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'menuType',
      key: 'menuType',
      width: 80,
      render: (t: MenuType) => <Tag color={TYPE_TAG[t].color}>{TYPE_TAG[t].text}</Tag>,
    },
    { title: '路由', dataIndex: 'path', key: 'path', render: (p?: string) => p || '—' },
    { title: '权限标识', dataIndex: 'perms', key: 'perms', render: (p?: string) => p || '—' },
    { title: '排序', dataIndex: 'orderNum', key: 'orderNum', width: 70 },
    {
      title: '显示',
      key: 'visible',
      width: 80,
      render: (_: unknown, record: MenuNode) => (
        <Switch size="small" checked={record.visible} onChange={() => toggleVisible(record.id)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: unknown, record: MenuNode) => (
        <Space size={4}>
          {record.menuType !== 'F' && <a onClick={() => openAdd(record.id)}>新增</a>}
          <a onClick={() => openEdit(record)}>编辑</a>
          <Tooltip title="上移">
            <a onClick={() => moveMenu(record.id, 'up')}><ArrowUpOutlined /></a>
          </Tooltip>
          <Tooltip title="下移">
            <a onClick={() => moveMenu(record.id, 'down')}><ArrowDownOutlined /></a>
          </Tooltip>
          {record.system ? (
            <Tooltip title="系统预置菜单，不可删除">
              <span style={{ color: '#bbb' }}>删除</span>
            </Tooltip>
          ) : (
            <Popconfirm title="确定删除该菜单及其子菜单？" onConfirm={() => { deleteMenu(record.id); message.success('菜单已删除'); }}>
              <a style={{ color: '#e74c3c' }}>删除</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="table-toolbar" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openAdd(null)}>
          新增顶级菜单
        </Button>
        <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
        <Upload
          accept=".json"
          showUploadList={false}
          beforeUpload={(file) => { handleImportFile(file); return false; }}
        >
          <Button icon={<ImportOutlined />}>导入</Button>
        </Upload>
        <Popconfirm title="恢复为系统默认菜单？将丢弃全部自定义修改。" onConfirm={() => { resetMenus(); message.success('已恢复默认菜单'); }}>
          <Button icon={<ReloadOutlined />}>恢复默认</Button>
        </Popconfirm>
      </div>

      <Table
        columns={columns}
        dataSource={treeData}
        rowKey="id"
        pagination={false}
        defaultExpandAllRows
        indentSize={20}
      />

      <Modal
        title={editingId ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={closeModal}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="上级菜单">
            <Input value={parentName} disabled />
          </Form.Item>
          <Form.Item name="menuType" label="菜单类型" rules={[{ required: true, message: '请选择菜单类型' }]}>
            <Select
              options={[
                { value: 'M', label: '目录' },
                { value: 'C', label: '菜单' },
                { value: 'F', label: '按钮' },
              ]}
            />
          </Form.Item>
          <Form.Item name="name" label="菜单名称" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          {menuType !== 'F' && (
            <>
              <Form.Item name="icon" label="图标">
                <Select allowClear placeholder="请选择图标" showSearch
                  options={MENU_ICON_OPTIONS.map((name) => ({
                    value: name,
                    label: <Space size={6}>{renderMenuIcon(name)}<span>{name}</span></Space>,
                  }))}
                />
              </Form.Item>
              <Form.Item name="path" label="路由" rules={[{ required: true, message: '请输入路由地址' }]}>
                <Input placeholder="例如: /order" />
              </Form.Item>
            </>
          )}
          <Form.Item name="perms" label="权限标识" tooltip="侧边栏 / 按钮据此鉴权，可留空">
            <Select allowClear showSearch placeholder="请选择权限标识"
              options={PERM_OPTIONS.map((p) => ({ value: p, label: p }))}
            />
          </Form.Item>
          <Form.Item name="orderNum" label="排序" rules={[{ required: true, message: '请输入排序号' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label="显示" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* 导入预览弹窗 */}
      <Modal
        title="导入预览"
        open={importModalOpen}
        onOk={confirmImport}
        onCancel={() => { setImportModalOpen(false); setImportPreview(null); }}
        okText="确认导入（整体替换）"
        cancelText="取消"
        width={600}
      >
        <p style={{ color: '#e74c3c', marginBottom: 12 }}>
          导入将整体替换当前菜单配置，共 {importPreview?.length || 0} 条数据。
        </p>
        <Table
          columns={[
            { title: '菜单名称', dataIndex: 'name', key: 'name' },
            { title: '类型', dataIndex: 'menuType', key: 'menuType', render: (t: string) => <Tag>{t}</Tag> },
            { title: '路由', dataIndex: 'path', key: 'path', render: (p?: string) => p || '—' },
          ]}
          dataSource={importPreview || []}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ y: 300 }}
        />
      </Modal>
    </>
  );
}
