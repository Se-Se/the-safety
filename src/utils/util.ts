import $ from 'jquery';
import moment from 'moment';
import { useEffect, useRef } from 'react';

// 判断是否为空值或空字符串
export const isNull = (v: any) => {
  return v === null || typeof v === 'undefined' || v === '';
};

// 格式化时间为指定格式
export const formatDate = (time: string | number | undefined, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) {
    return '';
  }
  // 时间戳
  if (isNumber(time)) {
    return moment(parseInt(time as string, 10)).format(format);
  }
  // 时间文本
  if (typeof time === 'string') {
    return moment(time).format(format);
  }
  return '';
};

// 判断字符串是否为 number
export const isNumber = (str: any) => {
  // 只有 string 和 number 才认为是数字 // fixed: Number(moment) 可以通过的问题
  if (isNull(str) || typeof str === 'object' || typeof str === 'boolean') {
    return false;
  }
  const num = Number(str);
  if (Number.isNaN(num)) {
    return false;
  }
  return true;
};

// 随机生成指定长度字符串
export function randomString(len = 32) {
  const chars = 'ABCDEFGHIJKLMNOPGRSTUVWXYZabcdefghijklmnopgrstuvwxyz123456789';
  const maxPos = chars.length;
  const pwd = [];
  for (let index = 0; index < len; index++) {
    pwd.push(chars.charAt(Math.floor(Math.random() * maxPos)));
  }
  return pwd.join('');
}

// 随机生成指定长度汉字串
export function randomChinese(len = 10) {
  const words = [];
  for (let index = 0; index < len; index++) {
    const element = String.fromCodePoint(Math.round(Math.random() * (40870 - 19968)) + 19968);
    words.push(element);
  }
  return words.join('');
}

//筛选数组
export function filterTheTrade(arr: any, attr: string, value: any) {
  if (!arr) {
    return [];
  }
  return arr.filter(item => {
    return item[attr] === value;
  });
}

// 矩形定义，(top, left, width, height)
export type VertexRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

// 用户点击图标中心位置
export const calcElemPos = dom => {
  if (dom) {
    const w = dom.clientWidth;
    const h = dom.clientHeight;
    // 画布节点
    const gridDom = document.getElementsByClassName('react-grid-layout')[0] as Element;
    const sx = gridDom.getBoundingClientRect().left;
    const sy = gridDom.getBoundingClientRect().top;
    let x = dom.getBoundingClientRect().left;
    let y = dom.getBoundingClientRect().top;

    x -= sx;
    y -= sy;
    return { x, y, w, h };
  }

  return { x: 0, y: 0, w: 0, h: 0 };
};

// 构造矩形4个边的中心点
export const getElemBorderCenters = (pos: VertexRect) => {
  const { x, y, w, h } = pos;
  const leftCenter = { x: x, y: y + h / 2 };
  const rightCenter = { x: x + w, y: y + h / 2 };
  const topCenter = { x: x + w / 2, y: y };
  const bottomCenter = { x: x + w / 2, y: y + h };
  return [topCenter, rightCenter, bottomCenter, leftCenter];
};

// x轴是否交叠
export const xOverlap = (from: VertexRect, to: VertexRect) => {
  if (from.x < to.x + to.w && from.x + from.w > to.x) {
    return true;
  } else {
    return false;
  }
};

// y轴是否交叠
export const yOverlap = (from: VertexRect, to: VertexRect) => {
  if (from.y < to.y + to.h && from.h + from.y > to.y) {
    return true;
  } else {
    return false;
  }
};

// 构造两点间连线
export const setupLink = (from: VertexRect, to: VertexRect, threshold: number) => {
  let vertex = [];
  let dir = 0;
  const sColl = getElemBorderCenters(from);
  const eColl = getElemBorderCenters(to);
  const xGap = from.x - to.x;
  const yGap = from.y - to.y;
  const isXOverlap = xOverlap(from, to);
  const isYOverlap = yOverlap(from, to);
  let type = 'z-link';

  if (isXOverlap && !isYOverlap) {
    if (yGap >= threshold + to.h) {
      // top -> bottom
      vertex.push(sColl[0], eColl[2]);
      dir = sColl[0].x - eColl[2].x > 0 ? 1 : 0;
    } else if (yGap <= -threshold - from.h) {
      // bottom -> top
      vertex.push(sColl[2], eColl[0]);
      dir = sColl[2].x - eColl[0].x > 0 ? 0 : 1;
    } else {
      // too close, top -> top
      vertex.push(sColl[0], eColl[0]);
    }
  } else if (!isXOverlap && isYOverlap) {
    if (xGap >= threshold + to.w) {
      // left -> right
      vertex.push(sColl[3], eColl[1]);
      dir = sColl[3].y - eColl[1].y > 0 ? 0 : 1;
    } else if (xGap <= -threshold - from.w) {
      // right -> left
      vertex.push(sColl[1], eColl[3]);
      dir = sColl[1].y - eColl[3].y > 0 ? 1 : 0;
    } else {
      // too close, left -> left
      vertex.push(sColl[3], eColl[3]);
    }
  } else if (!isXOverlap && !isYOverlap) {
    if (xGap > 0 && yGap > 0) {
      if (Math.abs(xGap) >= Math.abs(yGap)) {
        // left -> right
        vertex.push(sColl[3], eColl[1]);
        dir = 0;
      } else {
        // top -> bottom
        vertex.push(sColl[0], eColl[2]);
        dir = 1;
      }
    } else if (xGap > 0 && yGap < 0) {
      if (Math.abs(xGap) >= Math.abs(yGap)) {
        // left -> right
        vertex.push(sColl[3], eColl[1]);
        dir = 1;
      } else {
        // bottom -> top
        vertex.push(sColl[2], eColl[0]);
        dir = 0;
      }
    } else if (xGap < 0 && yGap > 0) {
      if (Math.abs(xGap) >= Math.abs(yGap)) {
        // right -> left
        vertex.push(sColl[1], eColl[3]);
        dir = 1;
      } else {
        // top -> bottom
        vertex.push(sColl[0], eColl[2]);
        dir = 0;
      }
    } else if (xGap < 0 && yGap < 0) {
      if (Math.abs(xGap) >= Math.abs(yGap)) {
        // right -> left
        vertex.push(sColl[1], eColl[3]);
        dir = 0;
      } else {
        // bottom -> top
        vertex.push(sColl[2], eColl[0]);
        dir = 1;
      }
    }
  } else {
    // overlap!!!
    // left -> left
    vertex.push(sColl[3], eColl[3]);
  }
  return { vertex, dir, type };
};

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

// 获取url参数
export const getQueryStringParams = query => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
        let [key, value] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
      }, {})
    : {};
};

// 计算给定点，在矩形边框上的对称点
export const oppositePos = props => {
  let { box, point } = props;
  let maxDist = 0;
  let pos;
  const { x, y } = point;
  for (let index = 0; index < box.length; index++) {
    const { x: x1, y: y1 } = box[index];
    const dist = Math.pow(Math.pow(x1 - x, 2) + Math.pow(y1 - y, 2), 0.5);
    if (maxDist < dist) {
      maxDist = dist;
      pos = index;
    }
  }

  return pos;
};

// 移除序列中重复的项
export function unique(arr) {
  return Array.from(new Set(arr));
}

// 简易事件机制
class TheEventBus {
  bus: {};

  constructor() {
    this.bus = {};
  }

  $off(id) {
    delete this.bus[id];
  }

  $on(id, callback) {
    this.bus[id] = callback;
  }

  $emit(id, ...params) {
    if (this.bus[id]) this.bus[id](...params);
  }
}

export const EventBus = new TheEventBus();

// oa 退出登录
export const toLogout = () => {
  // 当前已处于退出页 不进行再次退出
  if (window.location.pathname === '/_logout/') {
    return;
  }
  const currentHref = encodeURIComponent(window.location.href);

  // 本地开发环境支持内网跳转登录
  if (process.env.NODE_ENV === 'development') {
    window.location.href = `http://passport.oa.com/modules/passport/signin.ashx?url=${encodeURIComponent(
      window.location.origin + '/_sp_login_/?url=' + currentHref,
    )}`;
    return;
  }

  // build 后执行的登录操作
  window.location.href = `//${window.location.host}/_logout/?url=${currentHref}`;
};

// 分区与大区高度取较大的高度
export const activeChange = () => {
  let area: any = document.getElementsByClassName('area-content')[0];
  let group: any = document.getElementsByClassName('group-content')[0];
  if (!!area && !!group) {
    const areaH = $('.area-content').find('.react-grid-layout').height();
    const groupH = $('.group-content').find('.react-grid-layout').height();
    if (areaH >= groupH) {
      group.style.height = areaH + 'px';
    } else {
      area.style.height = groupH + 'px';
    }
  }
};
