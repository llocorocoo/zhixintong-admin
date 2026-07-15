import { create } from 'zustand';

export interface OperationLog {
  id: string;
  operatorId: string;
  operatorName: string;
  module: string;
  action: string;
  actionLabel: string;
  targetType: string;
  targetId: string;
  targetName: string;
  changes?: {
    field: string;
    fieldLabel: string;
    before: string | null;
    after: string | null;
  }[];
  result: 'success' | 'fail';
  remark?: string;
  createdAt: string;
}

interface OperationLogState {
  logs: OperationLog[];
  addLog: (log: Omit<OperationLog, 'id' | 'createdAt'>) => void;
}

const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const mockLogs: OperationLog[] = [
  { id: 'log1', operatorId: 'adm1', operatorName: '系统管理员', module: '角色管理', action: 'assign', actionLabel: '分配账号', targetType: 'role', targetId: 'role2', targetName: '管理员', result: 'success', createdAt: '2024-06-01 10:30:00' },
  { id: 'log2', operatorId: 'adm1', operatorName: '系统管理员', module: '账号管理', action: 'create', actionLabel: '新增', targetType: 'account', targetId: 'a1', targetName: 'channel01', result: 'success', createdAt: '2024-06-01 09:15:00' },
  { id: 'log3', operatorId: 'adm1', operatorName: '系统管理员', module: '账号管理', action: 'update', actionLabel: '修改', targetType: 'account', targetId: 'a2', targetName: 'channel02', changes: [{ field: 'roleId', fieldLabel: '角色', before: '未分配', after: '管理员' }], result: 'success', createdAt: '2024-06-02 14:20:00' },
  { id: 'log4', operatorId: 'adm1', operatorName: '系统管理员', module: '渠道管理', action: 'delete', actionLabel: '删除', targetType: 'channel', targetId: 'ch5', targetName: '测试渠道', result: 'success', createdAt: '2024-06-03 11:00:00' },
  { id: 'log5', operatorId: 'adm2', operatorName: '运营专员', module: '账号管理', action: 'reset_pwd', actionLabel: '重置密码', targetType: 'account', targetId: 'a3', targetName: 'channel03', result: 'success', createdAt: '2024-06-04 16:45:00' },
  { id: 'log6', operatorId: 'adm1', operatorName: '系统管理员', module: '角色管理', action: 'update', actionLabel: '修改', targetType: 'role', targetId: 'role3', targetName: '渠道商', changes: [{ field: 'status', fieldLabel: '状态', before: '启用', after: '停用' }], result: 'success', createdAt: '2024-06-05 09:30:00' },
  { id: 'log7', operatorId: 'adm1', operatorName: '系统管理员', module: '账号管理', action: 'toggle', actionLabel: '停用', targetType: 'account', targetId: 'a4', targetName: 'channel04', changes: [{ field: 'status', fieldLabel: '状态', before: '启用', after: '停用' }], result: 'success', createdAt: '2024-06-06 13:10:00' },
];

export const useOperationLog = create<OperationLogState>((set) => ({
  logs: mockLogs,
  addLog: (log) =>
    set((state) => ({
      logs: [
        { ...log, id: 'log' + Date.now(), createdAt: now() },
        ...state.logs,
      ],
    })),
}));
