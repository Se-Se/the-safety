import { dbNamesAndId } from '@src/components/tableCommon/globalData';
import { filterTheTrade } from '@src/utils/util';
import { message } from '@tencent/tea-component';
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import Base64 from 'base-64';
import cookie from 'react-cookies';

const defalutConfig: AxiosRequestConfig = {
  baseURL: 'http://dev-sec-sandbox.testsite.woa.com',
  timeout: 20000,
  headers: {
    'Access-Control-Allow-Origin': '*',
    token: cookie.load('sec_token') || '',
  },
};
export const api: AxiosInstance = axios.create({
  ...defalutConfig,
});

// 允许cookie
// api.defaults.withCredentials = true;

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
    console.log('config', config);
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
    // console.log('response', response);
    removePending(response.config);
    if (response.data?.code === 0) {
      return Promise.resolve(response.data);
    }
    return Promise.resolve(response);
  },
  error => {
    console.log('error', error);
    return Promise.reject(error?.response?.statusText || { message: error.message });
  },
);

/**
 * @param loadingFlag 判断是否当前是否有loading message 弹出
 *
 * @param hideLoading 默认不传 传true 时不显著loading状态
 *
 */

interface Login {
  userName: string;
  password: string;
}

let loadingFlag: boolean = false;
export async function getAll(dbName: string, hideLoading?: boolean): Promise<any> {
  return await apiFn('/api/useDB/executor', dbName, 'getAll', {}, hideLoading);
}

export async function add(dbName: string, data: any, hideLoading?: boolean) {
  addSafetyTrade(data);
  return await apiFn(`/api/useDB/executor`, dbName, 'add', data, hideLoading);
}
export async function addAll(dbName: string, data: any, hideLoading?: boolean) {
  addSafetyTrade(data);
  return await apiFn(`/api/useDB/executor`, dbName, 'addAll', data, hideLoading);
}

export async function update(dbName: string, data: any, hideLoading?: boolean) {
  let theData = formatterData(dbName, data);
  return await apiFn(`/api/useDB/executor`, dbName, 'update', theData, hideLoading);
}

export async function deleteRecord(dbName: string, data: any, hideLoading?: boolean) {
  let theData = formatterData(dbName, data);
  return await apiFn(`/api/useDB/executor`, dbName, 'deleteRecord', theData, hideLoading);
}
export async function getByIndex(dbName: string, data: any, hideLoading?: boolean) {
  let theData = formatterData(dbName, data);
  return await apiFn(`/api/useDB/executor`, dbName, 'getByIndex', theData, hideLoading);
}

export async function clear(dbName: string, hideLoading?: boolean): Promise<any> {
  const idName = dbNamesAndId.filter(item => item.text === dbName)[0].value;
  return new Promise((reslove, reject) => {
    getAll(dbName, hideLoading)
      .then((res: any) => {
        if (res.length) {
          let ids: any = res.map((item: any) => {
            return item[idName];
          });
          deleteRecord(dbName, ids, hideLoading).then(dres => {
            reslove(dres);
          });
        } else {
          reslove([]);
        }
      })
      .catch(err => {
        reject(err);
      });
  });
}

export async function login(data: Login, hideLoading?: boolean) {
  const base64Data: Login = {
    userName: Base64.encode(data.userName),
    password: Base64.encode(data.password),
  };
  return await loginFn('/api/manager/login', base64Data, hideLoading);
}

const formatterData = (dbName: string, data: any) => {
  const key = dbNamesAndId.filter(item => item.text === dbName)[0].value;
  let result = {
    key: key,
    value: data,
  };
  return result;
};

// 添加时给每条数据添加safetyTrade字段来区分行业
const addSafetyTrade = (data: any) => {
  const val = cookie.load('safetyTrade');
  if (Array.isArray(data)) {
    data.map(item => {
      item['safetyTrade'] = val;
    });
  } else {
    data['safetyTrade'] = val;
  }
};

// 不需要进行筛选的dbName数组;
const whiteSafetyTrade: string[] = ['trade'];

const apiFn = (url: string, dbName: string, handleName: string, data: any, hideLoading?: boolean) => {
  if (!hideLoading && !loadingFlag) {
    loadingFlag = true;
    message.loading({
      content: '加载中 ...',
      duration: 0,
    });
  }
  return new Promise((reslove, reject) => {
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
            reslove(arr);
          } else {
            reslove(res.data.data);
          }
        } else if (res?.data?.code === '402') {
          // location.href = '/login';
          reject(res?.data?.msg);
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
        if (!hideLoading) {
          setTimeout(() => {
            message.loading({ content: '' }).hide();
            loadingFlag = false;
          }, 1000);
        }
      });
  });
};

const loginFn = (url: string, data: Login, hideLoading?: boolean) => {
  if (!hideLoading && !loadingFlag) {
    loadingFlag = true;
    message.loading({
      content: '登陆中...',
      duration: 0,
    });
  }
  return new Promise((reslove, reject) => {
    api
      .post(url, data)
      .then((res: any) => {
        if (res?.data?.code === '0000') {
          reslove(res.data.data);
        } else {
          reject('登录失败');
        }
      })
      .catch(err => {
        if (!err.message) {
          reject(err);
        }
      })
      .finally(() => {
        if (!hideLoading) {
          setTimeout(() => {
            message.loading({ content: '' }).hide();
            loadingFlag = false;
          }, 1000);
        }
      });
  });
};
