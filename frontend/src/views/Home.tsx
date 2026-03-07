import { defineComponent, reactive, watch } from "vue";
import "./styles/home.less";
import { NMessageProvider } from "naive-ui";
import { mapObj } from "js-funcs";
import router from "../router";
import Pop from "../utils/UtilsJsx/Pop";
import { createImg } from "../utils/UtilsJsx/UtilsJsxPublic";
import TitleBar from "../components/TitleBar";
export default defineComponent({
  name: "Home",
  setup: () => () => com(),
  mounted() {
    console.log(router.currentRoute.value, "router.currentRoute.value");

    // 初始化当前激活索引
    const updateActiveIndex = () => {
      const route = router.currentRoute.value;
      if (route.name === "fileLibrary") {
        ins.data.atvIdx = 5; // 文件库的索引
      } else {
        const id = route.params.id;
        const tId = Number(id) || 0;
        ins.data.atvIdx = tId;
      }
    };

    updateActiveIndex();

    watch(
      () => router.currentRoute.value.name,
      () => {
        updateActiveIndex();
      },
    );
  },
});

export const homeMenu = {
  table: {
    name: "工作台",
    icon: "homeMenuIcon",
    click: (idx: number) => {
      console.log(idx, "index");
    },
  },
  show: {
    name: "I SHOW",
    icon: "homeMenuIcon",
    click: (idx: number) => {},
  },
  tools: {
    name: "工具",
    icon: "homeMenuIcon",
    click: (idx: number) => {},
  },
  platform: {
    name: "平台",
    icon: "homeMenuIcon",
    click: (idx: number) => {},
  },
  origin: {
    name: "源宇宙",
    icon: "homeMenuIcon",
    click: (idx: number) => {},
  },
  fileDoc: {
    name: "文件库",
    icon: "homeMenuIcon",
    routerName: "fileLibrary",
    click: (idx: number) => {},
  },
};
const ins = new (class {
  init() {}
  data = reactive({
    atvIdx: 0,
  });
})();
const com = () => (
  <NMessageProvider>
    <div class="home">
      <TitleBar />
      <div class="home-content">
        <div class="home-menu">
          {mapObj(homeMenu, (k, v, index) => {
            return (
              <div
                class={ins.data.atvIdx === index ? "active" : ""}
                onClick={() => {
                  ins.data.atvIdx = index;
                  v.click(index);
                  // 如果有 routerName，使用命名路由跳转
                  if ((v as any).routerName) {
                    router.push({ name: (v as any).routerName });
                  } else {
                    // 否则使用索引跳转
                    router.push("/home/content/" + index);
                  }
                }}
              >
                {createImg(v.icon)}
                <p>{v.name}</p>
              </div>
            );
          })}
        </div>
        <router-view />
      </div>
      <Pop />
    </div>
  </NMessageProvider>
);
