import { getId } from "js-funcs";
import "./styles/utils-com.less";
import {
  filterFiles,
  getFilesByDataTransfer,
  getFilesFromFileList,
  mergeObject,
} from "./UtilsJs";
export const FileInput = () => {
  return <div class="button=blue-big"></div>;
};

export const fileDropOrInput = (
  cb: (files: File[]) => void,
  options?: {
    multip?: boolean;
    type?: "image" | "any";
  }
) => {
  const { multip, type } = mergeObject(
    {
      multip: false,
      type: "any",
    },
    options
  );
  const id = getId();
  const className = "file-input-" + id;
  return (
    <div
      onDragover={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        cb(filterFiles(getFilesByDataTransfer(e.dataTransfer), type));
      }}
      onClick={() => {
        const input = document.querySelector(
          "." + className
        ) as HTMLInputElement;
        input.click();
        input.onchange = (e) => {
          console.log(e, "e");
          cb(filterFiles(getFilesFromFileList(input.files), type));
        };
      }}
      class="drop-or-input-file"
    >
      <div class="info">
        <div class="iconfont icon-yunshangchuan_o"></div>
        <p>拖拽文件或点击此区域选取文件</p>
      </div>
      <input multiple={multip} class={className} type="file" />
    </div>
  );
};

export const input = (map?: {
  changeable?: boolean;
  cb?: (val: string, target: any) => void;
  inputChange?: (val: any) => void;
  className?: string;
  style?: any;
  defVal?: string;
  width?: number;
  tip?: string;
}) => {
  const {
    changeable,
    style,
    tip,
    cb,
    defVal,
    className,
    width,
    inputChange,
  } = {
    changeable: true,
    ...map,
  };
  return changeable ? (
    <input
      class={className}
      placeholder={`${tip || ""}`}
      v-model={defVal}
      type="text"
      onMousedown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      onKeydown={(e) => {
        e.stopPropagation();
      }}
      onKeyup={(e: any) => {
        e.stopPropagation();
        if (e.key.toLowerCase() === "enter") {
          e.target.blur();
          cb && cb(e.target.value, e.target);
        }
      }}
      onInput={(e: any) => {
        e && inputChange && inputChange(e);
      }}
      onChange={(e: any) => {
        e.target.blur();
        cb && cb(e.target.value, e.target);
      }}
      // style={{ width }}
      style={Object.assign(
        style || {},
        width ? { width: width || 0 + "px" } : {}
      )}
    />
  ) : (
    <p class="input-text">{defVal}</p>
  );
};
