import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Feedback, ReplyChannel } from '@/types';

const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
const todayAt = (hm: string) => `${dayjs().format('YYYY-MM-DD')} ${hm}`;
const daysAgoAt = (d: number, hm: string) => `${dayjs().subtract(d, 'day').format('YYYY-MM-DD')} ${hm}`;

// 截图占位图（内联 SVG，避免依赖外部图片资源）
const shot = (label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="400"><rect width="240" height="400" fill="#eaeff4"/><rect x="16" y="16" width="208" height="60" rx="6" fill="#d3dce6"/><rect x="16" y="92" width="150" height="14" rx="7" fill="#d3dce6"/><rect x="16" y="118" width="190" height="14" rx="7" fill="#d3dce6"/><text x="120" y="230" font-family="sans-serif" font-size="16" fill="#8899aa" text-anchor="middle">${label}</text></svg>`,
  )}`;

const mockFeedbacks: Feedback[] = [
  {
    id: 'fb1', feedbackNo: 'FB20260821003',
    userId: 'u1001', userNickname: '用户A', userPhone: '139****1001',
    channelId: 'ch1', channelName: '信达渠道',
    type: 'report_error',
    content: '我买的职业信用报告里，工作经历那一栏显示的公司名称不对，我上一家公司是2022年离职的，报告里还写着在职。麻烦帮我核实一下，这个报告我要给面试单位看的，比较着急。',
    images: [shot('报告截图 1'), shot('报告截图 2')],
    relatedOrderNo: 'ORD20240601001',
    contactInfo: '13900001001',
    clientInfo: 'iOS 17.4 / Safari / iPhone 14',
    status: 'pending',
    createdAt: todayAt('09:42:11'), updatedAt: todayAt('09:42:11'),
  },
  {
    id: 'fb2', feedbackNo: 'FB20260821002',
    userId: 'u1002', userNickname: '用户B', userPhone: '139****1002',
    channelId: 'ch2', channelName: '华信科技',
    type: 'bug',
    content: '支付完成之后一直卡在“报告生成中”，刷新了好几次都没反应，钱已经扣了。',
    images: [shot('卡住页面截图')],
    relatedOrderNo: 'ORD20240602001',
    clientInfo: 'Android 14 / Chrome 122 / 小米13',
    status: 'pending',
    createdAt: todayAt('08:15:03'), updatedAt: todayAt('08:15:03'),
  },
  {
    id: 'fb3', feedbackNo: 'FB20260820005',
    userId: 'u1003', userNickname: '用户C', userPhone: '139****1003',
    channelId: 'ch1', channelName: '信达渠道',
    type: 'billing',
    content: '重复下单支付了两次，希望退掉其中一笔。',
    relatedOrderNo: 'ORD20240601002',
    contactInfo: 'user_c@example.com',
    clientInfo: 'Windows 11 / Chrome 121',
    status: 'processing',
    handlerId: '4', handlerName: '运营专员',
    internalRemark: '已核实存在两笔支付记录，已提交财务走退款流程，预计 1-3 个工作日到账。',
    createdAt: daysAgoAt(1, '16:22:40'), updatedAt: daysAgoAt(1, '17:05:12'),
  },
  {
    id: 'fb4', feedbackNo: 'FB20260820004',
    userId: 'u1004', userNickname: '用户D', userPhone: '139****1004',
    channelId: 'ch4', channelName: '鼎信服务',
    type: 'suggestion',
    content: '建议报告可以支持导出 PDF，现在只能在网页上看，发给 HR 不方便。',
    clientInfo: 'iOS 18.1 / 微信内置浏览器',
    status: 'processing',
    handlerId: '1', handlerName: '系统管理员',
    internalRemark: '已记入产品需求池，排期待定。',
    createdAt: daysAgoAt(1, '11:03:27'), updatedAt: daysAgoAt(1, '14:40:00'),
  },
  {
    id: 'fb5', feedbackNo: 'FB20260819007',
    userId: 'u1005', userNickname: '用户E', userPhone: '139****1005',
    channelId: 'ch2', channelName: '华信科技',
    type: 'bug',
    content: '手机号收不到验证码，试了三次都没收到。',
    clientInfo: 'Android 13 / 华为 P60',
    status: 'replied',
    handlerId: '4', handlerName: '运营专员',
    replyContent: '您好，经核实是运营商通道短时拥堵导致，目前已恢复。请重新获取验证码，如仍收不到可点击“语音验证码”，感谢您的反馈。',
    replyChannel: 'notice',
    replyAt: daysAgoAt(2, '10:12:00'), replyBy: '运营专员',
    satisfaction: 5,
    createdAt: daysAgoAt(2, '09:30:15'), updatedAt: daysAgoAt(2, '10:12:00'),
  },
  {
    id: 'fb6', feedbackNo: 'FB20260819006',
    userId: 'u1006', userNickname: '用户F', userPhone: '139****1006',
    channelId: 'ch3', channelName: '诚信数据',
    type: 'report_error',
    content: '报告里的学历信息是空的，我是本科毕业，为什么查不到？',
    images: [shot('学历栏截图')],
    relatedOrderNo: 'ORD20240603001',
    clientInfo: 'iOS 17.2 / Safari',
    status: 'replied',
    handlerId: '1', handlerName: '系统管理员',
    replyContent: '您好，学历信息来源于学信网授权查询，需您在报告页完成学历授权后才会展示。已为您重新生成报告，请重新查看。',
    replyChannel: 'notice',
    replyAt: daysAgoAt(2, '15:48:30'), replyBy: '系统管理员',
    satisfaction: 4,
    createdAt: daysAgoAt(2, '14:20:09'), updatedAt: daysAgoAt(2, '15:48:30'),
  },
  {
    id: 'fb7', feedbackNo: 'FB20260818003',
    userId: 'u1007', userNickname: '用户G', userPhone: '139****1007',
    channelId: 'ch1', channelName: '信达渠道',
    type: 'billing',
    content: '为什么提升信用报告比职业信用报告贵这么多？',
    clientInfo: 'Windows 10 / Edge 120',
    status: 'closed',
    handlerId: '4', handlerName: '运营专员',
    replyContent: '您好，两类报告的数据源与分析维度不同，提升信用报告包含改善建议与信用提升方案，定价说明可在下单页“服务说明”中查看。',
    replyChannel: 'notice',
    replyAt: daysAgoAt(3, '09:20:00'), replyBy: '运营专员',
    internalRemark: '用户已确认无异议，关闭。',
    satisfaction: 4,
    createdAt: daysAgoAt(3, '08:41:52'), updatedAt: daysAgoAt(3, '11:00:00'),
  },
  {
    id: 'fb8', feedbackNo: 'FB20260818002',
    userId: 'u1008', userNickname: '用户H', userPhone: '139****1008',
    channelId: 'ch4', channelName: '鼎信服务',
    type: 'other',
    content: '客服电话打不通，想问下报告多久能出。',
    clientInfo: 'Android 14 / Chrome 121',
    status: 'closed',
    handlerId: '1', handlerName: '系统管理员',
    replyContent: '您好，报告一般在支付后 5 分钟内生成完成，您的报告已生成，可在“我的报告”查看。客服热线服务时间为 9:00-18:00。',
    replyChannel: 'notice',
    replyAt: daysAgoAt(3, '14:05:10'), replyBy: '系统管理员',
    createdAt: daysAgoAt(3, '13:15:33'), updatedAt: daysAgoAt(3, '18:00:00'),
  },
  {
    id: 'fb9', feedbackNo: 'FB20260817001',
    userId: 'u1009', userNickname: '用户I', userPhone: '139****1009',
    channelId: 'ch2', channelName: '华信科技',
    type: 'other',
    content: '加微信 xxxxx 领福利，专业接单代做各类报告',
    clientInfo: 'Android 12 / UC 浏览器',
    status: 'ignored',
    handlerId: '4', handlerName: '运营专员',
    internalRemark: '广告内容，已忽略并标记该用户。',
    createdAt: daysAgoAt(4, '22:10:04'), updatedAt: daysAgoAt(4, '22:35:00'),
  },
  {
    id: 'fb10', feedbackNo: 'FB20260816004',
    userId: 'u1010', userNickname: '用户J', userPhone: '139****1010',
    channelId: 'ch1', channelName: '信达渠道',
    type: 'suggestion',
    content: '希望能增加历史报告对比功能，看看自己的信用有没有提升。',
    clientInfo: 'iOS 18.0 / Safari',
    status: 'replied',
    handlerId: '1', handlerName: '系统管理员',
    replyContent: '您好，感谢建议！报告对比功能已在规划中，上线后会通过站内信通知您。',
    replyChannel: 'notice',
    replyAt: daysAgoAt(5, '10:30:00'), replyBy: '系统管理员',
    satisfaction: 5,
    createdAt: daysAgoAt(5, '09:05:41'), updatedAt: daysAgoAt(5, '10:30:00'),
  },
];

interface ReplyPayload {
  content: string;
  channel: ReplyChannel;
  operatorName: string;
  closeAfterReply?: boolean;
}

interface FeedbackState {
  feedbacks: Feedback[];
  /** 回复用户：写入回复内容，并（正式环境）生成一条站内信推给用户 */
  replyFeedback: (id: string, payload: ReplyPayload) => void;
  /** 指派处理人，待处理自动流转为处理中 */
  assignFeedback: (id: string, handlerId: string, handlerName: string) => void;
  /** 关闭（已处理完毕）/ 忽略（无效或广告内容），均不物理删除 */
  closeFeedback: (id: string) => void;
  ignoreFeedback: (id: string) => void;
  saveRemark: (id: string, remark: string) => void;
}

export const useFeedback = create<FeedbackState>((set) => ({
  feedbacks: mockFeedbacks,

  replyFeedback: (id, { content, channel, operatorName, closeAfterReply }) =>
    set((state) => ({
      feedbacks: state.feedbacks.map((f) =>
        f.id === id
          ? {
              ...f,
              replyContent: content,
              replyChannel: channel,
              replyAt: now(),
              replyBy: operatorName,
              handlerName: f.handlerName ?? operatorName,
              status: closeAfterReply ? 'closed' : 'replied',
              updatedAt: now(),
            }
          : f,
      ),
    })),

  assignFeedback: (id, handlerId, handlerName) =>
    set((state) => ({
      feedbacks: state.feedbacks.map((f) =>
        f.id === id
          ? {
              ...f,
              handlerId,
              handlerName,
              status: f.status === 'pending' ? 'processing' : f.status,
              updatedAt: now(),
            }
          : f,
      ),
    })),

  closeFeedback: (id) =>
    set((state) => ({
      feedbacks: state.feedbacks.map((f) =>
        f.id === id ? { ...f, status: 'closed', updatedAt: now() } : f,
      ),
    })),

  ignoreFeedback: (id) =>
    set((state) => ({
      feedbacks: state.feedbacks.map((f) =>
        f.id === id ? { ...f, status: 'ignored', updatedAt: now() } : f,
      ),
    })),

  saveRemark: (id, remark) =>
    set((state) => ({
      feedbacks: state.feedbacks.map((f) =>
        f.id === id ? { ...f, internalRemark: remark, updatedAt: now() } : f,
      ),
    })),
}));
