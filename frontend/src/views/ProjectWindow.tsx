import { defineComponent, reactive, ref } from "vue";
import "./styles/projectWindow.less";
import type { Obj } from "js-funcs";
import { getAssetsPath } from "../utils/contant";
import router from "../router";
import { createImg } from "../utils/UtilsJsx/UtilsJsxPublic";
export default defineComponent({
  name: "ProjectWindow",
  setup: () => () => com(),
  mounted() {
    ins.init();
  },
});

const ins = new (class {
  async init() {
    let map: Obj = {};
    const assetsPath = await getAssetsPath();
    if (router.currentRoute.value.query) {
      map = router.currentRoute.value.query as any as {
        type: any;
        link: string;
        name: string;
      };
    } else {
      const [router, link, type, name] = location.search.split("&");
      const [linkStr, linkVal] = link.split("=");
      const [typeStr, typeVal] = type.split("=");
      const [nameStr, nameVal] = name.split("=");
      map = {
        link: linkVal,
        type: typeVal,
        name: nameVal,
      };
    }

    const { link, name, type } = map;
    console.log(map, "map");
    data.name = name;
    data.url = link;

    if (type === "videoPath") {
      // data.url = tPath.join(assetsPath, link);
      data.isUrl = false;
    } else if (type === "local") {
      // data.url = tPath.join(assetsPath, link + "\\index.html");
    }
    console.log(link, data, "link");
    // if (projectName) {
    //   data.url = `
    //   E:\\hxy\\project\\electron-零拓本地项目\\static\\assets\\${projectName}\\index.html`;
    // } else if (link) {
    //   data.url = link as any;
    // }
    window.addEventListener("resize", async () => {
      console.log(refData.full.value, "   refData.full.value");
      // refData.full.value = await ipcRenderer.invoke("isFull");
    });
  }
  data = reactive({
    url: "",
    isUrl: true,
    name: "",
  });
  refData = {
    full: ref(false),
  };
})();
const { data, refData } = ins;
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
const com = () => {
  console.log(79, "79");
  return (
    <div class="project_window">
      <div class="title" style={{ "-webkit-app-region": "drag" } as any}>
        <div class="left">
          <div class="logo">{createImg("logo")}</div>
          <div class="border"></div>
          <p>{data.name}</p>
        </div>
        <div class="right" style={{ "-webkit-app-region": "no-drag" } as any}>
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
      {data.isUrl && <iframe v-show={data.isUrl} src={data.url}></iframe>}
      {!data.isUrl && (
        <video controls autoplay v-show={!data.isUrl} src={data.url}></video>
      )}
    </div>
  );
};
