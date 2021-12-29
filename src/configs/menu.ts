import { AppMenu } from '@tea/app/types';

/**
 * 定义导航菜单
 */
export const menu: AppMenu = {
  title: '安全行业知识库',
  items: [
    {
      title: '知识展示',
      items: [
        { route: '/scenes', title: '攻击场景' },
        { route: '/gap', title: '攻击手法与漏洞' },
        { route: '/recommend', title: '改进建议' },
      ],
    },
    {
      title: '行业资产',
      items: [
        { route: '/business', title: '重要业务' },
        { route: '/app', title: '应用系统' },
        { route: '/data', title: '业务数据' },
        { route: '/property', title: '网络资产' },
        { route: '/framework', title: '系统架构' },
        { route: '/topology', title: '业务拓扑' },
      ],
    },
  ],
};
