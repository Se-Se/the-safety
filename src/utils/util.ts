import { useApi } from '@src/services/api/useApi';
import { initDbData } from '@src/services/initdbData';
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
    const parentDom = document.getElementsByClassName('dashboard-content')[0] as Element;
    const sx = gridDom.getBoundingClientRect().left + parentDom.scrollLeft;
    const sy = gridDom.getBoundingClientRect().top + parentDom.scrollTop;
    let x = dom.getBoundingClientRect().left;
    let y = dom.getBoundingClientRect().top;

    x -= sx;
    y -= sy;
    return { x, y, w, h };
  }

  return { x: 0, y: 0, w: 0, h: 0 };
};

export const getElemBorderCenters = (pos: VertexRect) => {
  const { x, y, w, h } = pos;
  const leftCenter = { x: x, y: y + h / 2 };
  const rightCenter = { x: x + w, y: y + h / 2 };
  const topCenter = { x: x + w / 2, y: y };
  const bottomCenter = { x: x + w / 2, y: y + h };
  return [topCenter, rightCenter, bottomCenter, leftCenter];
};

// 需要和划线逻辑整合下
export const makeupVertex = (from: VertexRect, to: VertexRect, maxGap: number) => {
  let vertex = [];
  let dir = 0;
  const sColl = getElemBorderCenters(from);
  const eColl = getElemBorderCenters(to);
  if (from.x - to.x >= maxGap) {
    if (from.y - to.y >= maxGap) {
      // top -> right
      vertex.push(sColl[0], eColl[1]);
    } else if (from.y - to.y < -maxGap) {
      // bottom -> right
      vertex.push(sColl[2], eColl[1]);
    } else {
      // left -> right
      vertex.push(sColl[3], eColl[1]);
    }
  } else if (from.x - to.x <= -maxGap) {
    if (from.y - to.y >= maxGap) {
      // top -> left
      vertex.push(sColl[0], eColl[3]);
      dir = 1;
    } else if (from.y - to.y < -maxGap) {
      // bottom -> left
      vertex.push(sColl[2], eColl[3]);
    } else {
      // right -> left
      vertex.push(sColl[1], eColl[3]);
    }
  } else {
    if (from.y - to.y >= maxGap) {
      // top -> bottom
      vertex.push(sColl[0], eColl[2]);
    } else {
      // bottom -> top
      vertex.push(sColl[2], eColl[0]);
    }
  }

  return { vertex, dir };
};

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

export const getQueryStringParams = query => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query).split('&').reduce((params, param) => {
        let [key, value] = param.split('=');
        params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
        return params;
      }, {})
    : {};
};

const dir2Value = dir => {
  let value = -1;
  // 上右下左
  switch (dir) {
    case 'left':
      value = 3;
      break;
    case 'up':
      value = 0;
      break;
    case 'right':
      value = 1;
      break;
    case 'down':
      value = 2;
      break;
  }
  return value;
};

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

export function unique(arr) {
  return Array.from(new Set(arr));
}

class _EventBus {
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

export const EventBus = new _EventBus();

// 初始化单个表数据根据 initdbData.tsx文件
export const initOneDbData = (dbName: string) => {
  const { add, clear } = useApi(dbName);
  clear().then(() => {
    let data = initDbData[dbName];
    let fn = (d: any) => {
      return new Promise((reslove, reject) => {
        setTimeout(() => {
          add(d)
            .then((res: any) => {
              console.log(res);
              reslove(res);
            })
            .catch(err => {
              console.log(err);
            });
        }, 500);
      });
    };
    let loop = 0;
    const loopFn = () => {
      if (loop < data.length) {
        fn(data[loop]).then(() => {
          loop++;
          loopFn();
        });
      } else {
        console.log('数据加载完成');
      }
    };
    loopFn();
  });
};
export const initTheDbData = (dbName: string) => {
  const { addAll, clear } = useApi(dbName);
  clear().then(() => {
    let data = initDbData[dbName];
    addAll([...data]);
  });
};
