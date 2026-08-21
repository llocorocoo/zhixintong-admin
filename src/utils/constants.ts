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

// 反馈类型：正式环境改由「字典管理」维护，运营可自行增减
export const FEEDBACK_TYPE_MAP: Record<string, { text: string; color: string }> = {
  bug: { text: '功能异常', color: 'red' },
  report_error: { text: '报告内容有误', color: 'volcano' },
  billing: { text: '收费与退款', color: 'gold' },
  suggestion: { text: '产品建议', color: 'blue' },
  other: { text: '其他', color: 'default' },
};

export const FEEDBACK_STATUS_MAP: Record<string, { text: string; color: string }> = {
  pending: { text: '待处理', color: 'red' },
  processing: { text: '处理中', color: 'orange' },
  replied: { text: '已回复', color: 'green' },
  closed: { text: '已关闭', color: 'default' },
  ignored: { text: '已忽略', color: 'default' },
};

// 回复触达方式：一期仅站内信可用，其余等「通知配置」开通
export const REPLY_CHANNEL_MAP: Record<string, { text: string; enabled: boolean }> = {
  notice: { text: '站内信', enabled: true },
  sms: { text: '短信', enabled: false },
  wechat: { text: '公众号', enabled: false },
};

export const TRANSACTION_TYPE_MAP: Record<string, { text: string; color: string }> = {
  income: { text: '收入', color: 'green' },
  refund: { text: '退款', color: 'red' },
};
