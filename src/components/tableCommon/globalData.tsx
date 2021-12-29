type Options = {
  value: string;
  text: string;
};
export const systemOption: Options[] = [
  { value: '第三方系统', text: '第三方系统' },
  { value: '内部系统', text: '内部系统' },
];

export const systemKOptions: Options[] = [
  { value: 'all', text: '所以类型' },
  { value: '第三方系统', text: '第三方系统' },
  { value: '内部系统', text: '内部系统' },
];

export const systemOrPropertyOption: Options[] = [
  { value: 'all', text: '所有分类' },
  { value: 'system', text: '系统' },
  { value: 'property', text: '资产' },
];
export const levelOptions: Options[] = [
  { value: 'low', text: '低风险' },
  { value: 'mid', text: '中风险' },
  { value: 'high', text: '高风险' },
];

export const propertyOption: any = [
  {
    label: '网络',
    value: '网络',
    children: [
      { label: '交换机', value: '交换机' },
      { label: '路由器', value: '路由器' },
      { label: '防火墙', value: '防火墙' },
      { label: '堡垒机', value: '堡垒机' },
      { label: 'IPS', value: 'IPS' },
      { label: 'IDS', value: 'IDS' },
    ],
  },
  {
    label: '客户端',
    value: '客户端',
    children: [
      { label: '浏览器', value: '浏览器' },
      { label: '手机', value: '手机' },
      { label: 'PC终端', value: 'PC终端' },
      { label: 'PDA手持设备', value: 'PDA手持设备' },
      { label: 'ATM终端', value: 'ATM终端' },
    ],
  },
  {
    label: '服务器',
    value: '服务器',
    children: [
      { label: 'web服务器', value: 'web服务器' },
      { label: '邮件服务器', value: '邮件服务器' },
      { label: '应用服务器', value: '应用服务器' },
      { label: '应用服务器集群', value: '应用服务器集群' },
    ],
  },
  {
    label: '数据存储',
    value: '数据存储',
    children: [
      { label: '数据仓库', value: '数据仓库' },
      { label: '关系型数据库', value: '关系型数据库' },
      { label: 'NoSql数据库', value: 'NoSql数据库' },
      { label: '文件数据库', value: '文件数据库' },
    ],
  },
];

export const areaOptions: Options[] = [
  { text: '互联网边界接入区', value: 'area_1' },
  { text: '互联网服务区', value: 'area_2' },
  { text: '核心生产区', value: 'area_3' },
  { text: '安全管理区', value: 'area_4' },
  // { value: 'diy', text: '其他' },
];

export const imgNames: string[] = [
  'atmzhongduan',
  'baoleiji',
  'fanghuoqiang',
  'guanxixingshujuku',
  'ids',
  'ips',
  'jiaohuanji',
  'liulanqi',
  'luyouqi',
  'nosqlshujuku',
  'nosqlshujuku',
  'pczhongduan',
  'pdashouchishebei',
  'shouji',
  'shujucangku',
  'shujukufuwuqi',
  'webfuwuqi',
  'wenjianshujuku',
  'xitong',
  'yingyongfuwuqi',
  'yingyongfuwuqijiqun',
  'youjianfuwuqi',
];

export const mainImages: string[] = [
  'main_pic1.png',
  'main_pic2.png',
  'main_pic3.png',
  'main_pic4.png',
  'main_pic5.png',
  'main_pic6.png',
  'main_pic7.png',
  'main_pic8.png',
  'main_pic9.png',
  'main_pic10.png',
  'main_pic11.png',
  'main_pic12.png',
  'main_pic13.png',
  'main_pic14.png',
  'main_pic15.png',
];

export const tradeOptions: Options[] = [
  { text: '金融', value: '金融' },
  { text: '能源', value: '能源' },
  { text: '制造业', value: '制造业' },
];

export const dbNamesAndId: Options[] = [
  { text: 'trade', value: 'id' },
  { text: 'business', value: 'businessId' },
  { text: 'app', value: 'systemId' },
  { text: 'data', value: 'dataId' },
  { text: 'property', value: 'propertyId' },
  { text: 'area', value: 'areaId' },
  { text: 'scenes', value: 'scenesId' },
  { text: 'gap', value: 'gapId' },
  { text: 'gapOptions', value: 'id' },
  { text: 'recommend', value: 'recommendId' },
  { text: 'group', value: 'id' },
  { text: 'dashboard', value: 'id' },
  { text: 'track', value: 'name' },
  { text: 'bTrack', value: 'name' },
];

export const initGapOptions = {
  id: 'gapOptions_id' + new Date().getTime(),
  attackOption: [
    { value: 'attack_1', text: '攻击手法1' },
    { value: 'attack_2', text: '攻击手法2' },
    { value: 'attacktion1639379868316', text: '某系统的攻击手法' },
    { value: 'attacktion1639379965948', text: '柜员电脑的攻击手法' },
    { value: 'diy', text: '其他' },
  ],
  bugsOption: [
    { value: 'bug_1', text: '漏洞1' },
    { value: 'bug_2', text: '漏洞2' },
    { value: 'theTheBug1639379897755', text: '某系统的漏洞' },
    { value: 'theTheBug1639379975316', text: '柜员电脑的漏洞' },
    { value: 'diy', text: '其他' },
  ],
  actionOption: [
    { value: 'act_1', text: '执行动作1' },
    { value: 'act_2', text: '执行动作2' },
    { value: 'action1639379982084', text: '柜员电脑的执行动作' },
    { value: 'diy', text: '其他' },
  ],
  againstOption: [
    { value: 'against_1', text: '对抗措施1' },
    { value: 'against_2', text: '对抗措施2' },
    { value: 'against1639379991789', text: '柜员电脑的对抗措施' },
    { value: 'diy', text: '其他' },
  ],
  safetyTrade: '金融/银行',
};

export const propertyKindsOptions: Options[] = [
  { value: 'safety', text: '安全资产' },
  { value: 'others', text: '其他资产' },
];
