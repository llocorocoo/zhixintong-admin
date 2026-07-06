export const REPORT_TYPE_MAP: Record<string, string> = {
  occupational: '职业信用报告',
  improvement: '提升信用报告',
};

export const PAY_METHOD_MAP: Record<string, { text: string; color: string }> = {
  alipay: { text: '支付宝', color: 'blue' },
  wechat: { text: '微信', color: 'green' },
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
