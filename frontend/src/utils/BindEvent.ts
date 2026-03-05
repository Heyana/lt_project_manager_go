import { getId } from "js-funcs";

export type addArgs<T, F = any> = {
  name: string;
  fn: (data: T) => F;
};
export type CallBackType = {
  gltfExportSizeMap: {
    name: string;
    data: { name: string; size: number; url?: string }[];
    all: number;
  }[];
};
export default class BindEvent<inputType = void, outType = void> {
  private cbs: Array<addArgs<inputType, outType>> = [];
  cb = (data: inputType): outType[] => {
    return this.cbs.map((map) => map.fn?.(data));
  };
  emit = this.cb;
  /**
   *
   * @param name 传入的函数名称，用来确定该函数的作用
   * @param fn 函数本身
   * @returns
   */
  add(name: string, fn: (data: inputType) => outType, isUnique?: boolean) {
    if (isUnique) {
      if (this.get(name)) return;
    }
    return this.cbs.push({
      fn,
      name,
    });
  }
  on(fn: (data: inputType) => outType, name?: string) {
    return this.add(name || "custom_" + getId(), fn);
  }
  get(
    name: string
  ):
    | {
        data: undefined | addArgs<inputType>;
        index: number;
      }
    | undefined {
    const index = this.cbs.findIndex((i) => i.name === name);
    if (index === -1) return undefined;
    return {
      data: this.cbs[index],
      index,
    };
  }
  reset(name: string, fn: ((data: inputType) => void) | null): Boolean {
    const old = this.get(name);
    if (!old) return false;
    const { data } = old;
    data.fn = fn;
    return true;
  }
  remove(name: string) {
    this.reset(name, null);
  }
  delete(name) {
    const { index } = this.get(name) || {};
    if (index === undefined) return;
    this.cbs.splice(index, 1);
  }
}
