import type { Ref } from "vue/dist/vue.js";
import { createImg, onlyInput } from "./UtilsJsxPublic";
import "./style/custom.less";
import type { ArrowFn } from "../UtilsTypes";
export const BtGradient = (map: {
  name: string;
  width?: number;
  click?: () => void;
  show?: boolean;
}) => {
  const { name, width, click, show } = map;
  return (
    <div
      v-show={show === false ? false : true}
      onClick={click}
      class="bt_gradient"
      style={
        width
          ? {
              width,
            }
          : {}
      }
    >
      {createImg("add")}
      <p>{name}</p>
    </div>
  );
};

export const Text = (map: {
  iconMap?: {
    url: string;
    click?: () => void;
  };
  def: string;
  tip: string;
  onChange?: (text: string) => void;
  onDone?: (text: string) => void;
}) => {
  const { iconMap, tip, onChange, onDone, def } = map;
  const { url, click } = iconMap || {};
  return (
    <div class="custom_text">
      {onlyInput({
        tip,
        defVal: def,
        cb: onDone,
      })}
      <div class="icon" v-show={iconMap} onClick={click}>
        {createImg(url)}
      </div>
    </div>
  );
};

export const Img = (map: {
  onDone: (img: string) => void;
  def: Ref<string | null>;
}) => {
  const { onDone, def } = map;
  console.log(def, "def");
  return (
    <div
      class="custom_img"
      onClick={async () => {
        // const paths = await ipcRenderer.invoke("getSelectPath", {
        //   isFile: true,
        //   title: "选择封面图片",
        //   type: "image",
        // });
        // console.log(paths, "paths");
        // if (!paths) return;
        // const path = paths[0];
        // if (!path) return;
        // def.value = path;
        // onDone?.(path);
        // // const
      }}
    >
      {def.value ? (
        <img src={def.value} />
      ) : (
        <div class="text">
          <div class="main">点击或拽到此处上传封面</div>
          <div class="sub">支持 2M 以内.JPG .PNG图片格式</div>
        </div>
      )}
    </div>
  );
};
export const Title = (name: string) => {
  return <div class="custom_title">{name}</div>;
};

export const Empty = (height: number) => {
  return <div style={{ height: height + "px" }}></div>;
};

export const RightButtons = (
  bts: {
    name: string;
    click: ArrowFn;
  }[],
) => {
  return (
    <div class="custom_right_button">
      {bts.map((bt) => {
        return <div onClick={bt.click}>{bt.name}</div>;
      })}
    </div>
  );
};

export const FloderSelect = (map: {
  def: Ref<string | undefined>;
  tip?: string;
  onDone?: (path: string) => void;
}) => {
  const { def, onDone, tip } = map;
  return (
    <div class="custom_file_select">
      <div
        class="bt"
        onClick={async () => {
          // const paths = await ipcRenderer.invoke("getSelectPath", {
          //   title: "选择文件夹",
          // });
          // const path = paths[0];
          // if (!path) return;
          // onDone?.(path);
          // console.log(path, "path");
          // def.value = path;
        }}
      >
        {createImg("custom/floder")}
        <div class="tip">选择位置</div>
      </div>
      <div class="text">{def.value || "请选择安装包文件夹"}</div>
    </div>
  );
};

export const FileSelect = (map: {
  def: Ref<string | undefined>;
  tip?: string;
  type?: "video" | "image";
  onDone?: (path: string) => void;
}) => {
  const { def, onDone, type } = map;
  return (
    <div class="custom_file_select">
      <div
        class="bt"
        onClick={async () => {
          // const paths = await ipcRenderer.invoke("getSelectPath", {
          //   title: "选择文件",
          //   isFile: true,
          //   type,
          // });
          // const path = paths[0];
          // if (!path) return;
          // onDone?.(path);
          // def.value = path;
        }}
      >
        {createImg("custom/floder")}
        <div class="tip">选择位置</div>
      </div>
      <div class="text">{def.value || "请选择文件"}</div>
    </div>
  );
};

export const TileSwitch = (map: {
  index: Ref<number>;
  menu: { name: string; icon: string; click: ArrowFn }[];
}) => {
  return (
    <div class="custom_tile_switch">
      {map.menu.map(({ name, icon, click }, index) => {
        return (
          <div
            onClick={() => {
              map.index.value = index;
              click();
            }}
            class={map.index.value === index ? "select" : ""}
          >
            {createImg(icon)}
            <p>{name}</p>
          </div>
        );
      })}
    </div>
  );
};
