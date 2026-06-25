export const REPORT_TYPE_MAP: Record<string, string> = {
  basic: '基础报告',
  standard: '标准报告',
  premium: '高级报告',
};

export const ORDER_STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: '未完成', color: 'orange' },
  completed: { text: '已完成', color: 'green' },
  cancelled: { text: '已取消', color: 'default' },
};

export const CHANNEL_TYPE_MAP: Record<string, string> = {
  pure: '纯渠道',
  oem: 'OEM',
};

export const TRANSACTION_TYPE_MAP: Record<string, { text: string; color: string }> = {
  income: { text: '收入', color: 'green' },
  refund: { text: '退款', color: 'red' },
};
