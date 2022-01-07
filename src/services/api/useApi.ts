import { add, addAll, clear, deleteRecord, getAll, getByIndex, update } from './apis';

export function useApi(dbName?: string) {
  return {
    add: (data: any, hide?: boolean) => add(dbName, data, hide),
    addAll: (data: Array<{}>, hide?: boolean) => addAll(dbName, data, hide),
    getAll: (hide?: boolean) => getAll(dbName, hide),
    update: (data: any, hide?: boolean) => update(dbName, data, hide),
    deleteRecord: (data: (string | number)[], hide?: boolean) => deleteRecord(dbName, data, hide),
    getByIndex: (data: any, hide?: boolean) => getByIndex(dbName, data, hide),
    clear: (hide?: boolean) => clear(dbName, hide),
  };
}
