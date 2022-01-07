import { DBNAME_ADN_ID } from '@src/components/tableCommon/globalData';
import { filterTheTrade, toLogout } from '@src/utils/util';
import { message } from '@tencent/tea-component';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import cookie from 'react-cookies';

const defaultConfig: AxiosRequestConfig = {
  baseURL: '/api',
  timeout: 20000,
  headers: {
    'X-Requested-With': 'xmlhttprequest', // 此标记用于OA系统302状态码转401
  },
};
export const api: AxiosInstance = axios.create({
  ...defaultConfig,
});

// 定义接口
interface PendingType {
  url?: string;
  method?: Method;
  params: any;
  data: any;
  cancel: Function;
}

// 取消重复请求
const pending: Array<PendingType> = [];
const CancelToken = axios.CancelToken;
// 移除重复请求
const removePending = (config: AxiosRequestConfig) => {
  if (config.headers.allow) {
    return;
  }
  for (const key in pending) {
    const item: number = +key;
    const list: PendingType = pending[key];
    // 当前请求在数组中存在时执行函数体
    if (
      list.url === config.url &&
      list.method === config.method &&
      JSON.stringify(list.params) === JSON.stringify(config.params) &&
      JSON.stringify(list.data) === JSON.stringify(config.data)
    ) {
      // 执行取消操作
      list.cancel('操作太频繁，请稍后再试');
      // 从数组中移除记录
      pending.splice(item, 1);
    }
  }
};

/**
 * http request 拦截器
 */
api.interceptors.request.use(
  config => {
    removePending(config);
    config.cancelToken = new CancelToken(c => {
      pending.push({ url: config.url, method: config.method, params: config.params, data: config.data, cancel: c });
    });
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * http response 拦截器
 */
api.interceptors.response.use(
  response => {
    removePending(response.config);
    if (response.data?.code === 0) {
      return Promise.resolve(response.data);
    }
    return Promise.resolve(response);
  },
  error => {
    const { status, statusText } = error?.response || {};
    // 登录
    if (status === 401) {
      toLogout();
      return Promise.reject('请登录');
    }
    // 无权限
    if (status === 403) {
      window.location.href = '/403';
      return Promise.reject('暂无权限');
    }
    return Promise.reject(statusText || { message: error.message });
  },
);

/**
 * @param loadingFlag 判断是否当前是否有loading message 弹出
 *
 * @param hideLoading 默认不传 传true 时不显著loading状态
 *
 */

let loadingFlag: boolean = false;
export async function getAll(dbName: string, hideLoading?: boolean): Promise<any> {
  return await apiFn('/useDB/executor', dbName, 'getAll', {}, hideLoading);
}

export async function add(dbName: string, data: any, hideLoading?: boolean) {
  //dbName为gapOptions时不需要执行此方法 会在添加页面时添加safetyTrade
  if (dbName !== 'gapOptions') {
    addSafetyTrade(data);
  }
  return await apiFn('/useDB/executor', dbName, 'add', data, hideLoading);
}
export async function addAll(dbName: string, data: any, hideLoading?: boolean) {
  addSafetyTrade(data);
  return await apiFn('/useDB/executor', dbName, 'addAll', data, hideLoading);
}

export async function update(dbName: string, data: any, hideLoading?: boolean) {
  upDateUserName(data);
  let theData = formatterData(dbName, data);
  return await apiFn('/useDB/executor', dbName, 'update', theData, hideLoading);
}

export async function deleteRecord(dbName: string, data: any, hideLoading?: boolean) {
  let theData = formatterData(dbName, data);
  return await apiFn('/useDB/executor', dbName, 'deleteRecord', theData, hideLoading);
}
export async function getByIndex(dbName: string, data: any, hideLoading?: boolean) {
  let theData = formatterData(dbName, data);
  return await apiFn('/useDB/executor', dbName, 'getByIndex', theData, hideLoading);
}

export async function clear(dbName: string, hideLoading?: boolean): Promise<any> {
  // 获取 dbName 对应的 id 名称
  const idName = DBNAME_ADN_ID.filter(item => item.text === dbName)[0].value;
  return new Promise((resolve, reject) => {
    getAll(dbName, hideLoading)
      .then((res: any) => {
        if (res.length) {
          let ids: any = res.map((item: any) => {
            return item[idName];
          });
          deleteRecord(dbName, ids, hideLoading).then(dres => {
            resolve(dres);
          });
        } else {
          resolve([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}
// 将请求参数格式化成规定的数据格式
const formatterData = (dbName: string, data: any) => {
  const key = DBNAME_ADN_ID.filter(item => item.text === dbName)[0].value;
  let result = {
    key: key,
    value: data,
  };
  return result;
};

// 添加时给每条数据添加safetyTrade字段来区分行业
const addSafetyTrade = (data: any) => {
  const val = cookie.load('safetyTrade');
  const user = cookie.load('u_name');
  if (Array.isArray(data)) {
    data.map(item => {
      item.safetyTrade = val;
      item.addMen = user;
    });
  } else {
    data.safetyTrade = val;
    data.addMen = user;
  }
};
// 添加时给每条数据添加safetyTrade字段来区分行业
const upDateUserName = (data: any) => {
  const val = cookie.load('u_name');
  if (Array.isArray(data)) {
    data.map(item => {
      item.editMen = val;
    });
  } else {
    data.editMen = val;
  }
};
// 不需要进行筛选的dbName数组;
const whiteSafetyTrade: string[] = ['trade'];

// api调用统一方法
const apiFn = (url: string, dbName: string, handleName: string, data: any, hideLoading?: boolean) => {
  if (!hideLoading && !loadingFlag) {
    loadingFlag = true;
    message.loading({
      content: '加载中 ...',
      duration: 0,
    });
  }
  return new Promise((resolve, reject) => {
    let request: any = {
      DBTableName: dbName,
      handleName: handleName,
      data: data,
    };
    api
      .post(url, request)
      .then((res: any) => {
        if (res?.data?.code === '0000') {
          // 获取时根据safetyTrade字段筛选出当前行业数据
          if (whiteSafetyTrade.indexOf(dbName) < 0 && handleName === 'getAll') {
            const val = cookie.load('safetyTrade');
            const arr = filterTheTrade(res.data.data, 'safetyTrade', val);
            resolve(arr);
          } else {
            resolve(res.data.data);
          }
        } else {
          reject('数据错误');
        }
      })
      .catch(err => {
        if (!err.message) {
          reject(err);
        }
      })
      .finally(() => {
        // 请求结束 取消loading状态
        if (!hideLoading) {
          setTimeout(() => {
            message.loading({ content: '' }).hide();
            loadingFlag = false;
          }, 1000);
        }
      });
  });
};
