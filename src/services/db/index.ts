import cookie from 'react-cookies';
import { initDB, useIndexedDB } from 'react-indexed-db';
import { initDbData } from '../initdbData';
import { DBConfig, DBTableName } from './modal';

export const initDatabase = () => {
  initDB(DBConfig);
};

export const clearDatabase = () =>
  new Promise((resolve, reject) => {
    // @ts-ignore
    const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    const dbRequest = indexedDB.deleteDatabase(DBConfig.name);
    dbRequest.onerror = function (e) {
      reject(e);
    };
    dbRequest.onsuccess = function (e) {
      resolve(e);
    };
  });

/**
 * 按需初始化预设数据
 * @param refresh 成功后是否刷新
 * @param force 是否强制插入数据
 */
export const initAppDefaultDisplay = async (refresh?: boolean, force?: boolean) => {
  const [need, onComplete] = await needInsertDefault();
  if (!force && !need) {
    return;
  }
  console.log('[AppDB] needInsertDefault');

  const loads = Object.keys(DBTableName).reduce((list, k) => {
    const name = DBTableName[k];
    list.push(insertDefault2DB(name, initDbData[name]));
    return list;
  }, []);

  return Promise.all(loads).then(() => {
    console.log('[AppDB] init data success');
    onComplete();
    if (refresh) {
      location.reload();
    }
  });
};

// 插入初始化数据
const insertDefault2DB = async (tableName: string, data: any[]) => {
  if (!tableName) {
    console.error('[insertDefault2DB] call failed, tableName is empty!');
    return 0;
  }
  const { add, clear } = useIndexedDB(tableName);

  // 清除数据
  clear();

  // 无数据不处理
  if (!Array.isArray(data)) {
    return;
  }

  // 再遍历增加
  for (const line of data) {
    try {
      await add(line);
    } catch (error) {
      console.log('[insertDefault2DB] insert failed, ', error);
    }
  }
  return 1;
};

// 判断是否需要插入数据
const needInsertDefault = async (): Promise<[boolean, (() => void)?]> => {
  const flag = 'isFirstLoad';
  const first = cookie.load(flag);

  // 有记录过
  if (first) {
    const canRun = await hasAppRequiredData();
    // 应用数据齐全，不再插入数据
    if (canRun) {
      return [false];
    }
    // 数据无法运行，需要重新预设数据
  }

  // 没记录过，需要插入
  return [
    true,
    () => {
      cookie.save(flag, 'already');
    },
  ];
};

// 判断是否有应用运行的必要数据
const hasAppRequiredData = async () => {
  const { getAll } = useIndexedDB(DBTableName.trade);

  try {
    const data = await getAll();
    return !!data?.length;
  } catch (error) {}

  return false;
};
