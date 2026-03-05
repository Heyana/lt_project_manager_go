export const filter = <T>(ls: T[]): T[] => ls.filter((i) => i);

export const isEmpty = (ls: any[]) => ls.length === 0;
export const notEmpty = (ls: any[]) => ls.length !== 0;
export const random = (ls: any[]) => {
  const num = Math.random() * ls.length;
  const idx = Math.floor(num);
  return ls[idx];
};

export const isDef = (d1: number[], d2: any[]) => {
  for (let idx = 0; idx < d1.length; idx++) {
    const item1 = d1[idx];
    const item2 = d2[idx];
    if (item1 !== item2) return true;
  }
  return false;
};

export const toArr = <T>(item: T | T[]) => {
  return Array.isArray(item) ? item : [item];
};

export const findThenDel = <T>(ls: T[], fn: (i: T) => boolean): boolean => {
  const find = ls.findIndex(fn);
  if (find === -1) {
    return false;
  }
  ls.splice(find, 1);
  return true;
};

export const findMultiIndex = <T>(ls: T[], fn: (item: T) => boolean) => {
  return ls
    .map((i, index) => (fn(i) ? index : undefined))
    .filter((i) => i !== undefined);
};

export const isTrues = <T>(ls: Array<T>) => {
  for (const i of ls) {
    if (!i) return false;
  }
  return true;
};
