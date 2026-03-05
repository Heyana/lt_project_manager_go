import { defineComponent, ref } from "vue";
import "./style/title-bar.less";
import { CustomJsx } from "../utils/UtilsJsx/UtilsJsx";
import { createImg, onlyInput } from "../utils/UtilsJsx/UtilsJsxPublic";
export default defineComponent({
  name: "TitleBar",
  setup: () => () => com(),
});
const refData = {
  full: ref(false),
};
const menu = [
  {
    name: "mini",
    img: "miniWin",
    click: () => {},
  },
  {
    name: "win",
    elseVal: refData.full,
    elseImg: "minWin",
    img: "bigWin",
    click: () => {
      refData.full.value = !refData.full.value;
    },
  },

  {
    name: "close",
    img: "closeWin",
    click: () => {},
  },
];
const com = () => (
  <div class="title" style={{ "-webkit-app-region": "drag" } as any}>
    <div class="left" style={{ "-webkit-app-region": "no-drag" } as any}>
      <div class="logo">{createImg("logo")}</div>
      <div class="search">
        <div class="icon">{createImg("search")}</div>
        {onlyInput({
          tip: "请输入项目名称",
        })}
      </div>
      {CustomJsx.BtGradient({
        name: "订制应用",
        async click() {},
      })}
    </div>
    <div class="right" style={{ "-webkit-app-region": "no-drag" } as any}>
      <div class="user">
        {createImg("user")}
        <p>GT-STAB</p>
      </div>
      <div class="setting">{createImg("setting")}</div>
      <div class="contro">
        {menu.map((i) => {
          return (
            <div onClick={i.click} class={i.name}>
              {createImg(
                "projectWindow/" + (i.elseVal?.value ? i.elseImg : i.img),
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);
