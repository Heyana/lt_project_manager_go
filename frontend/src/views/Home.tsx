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
    watch(
      () => router.currentRoute.value.params.id,
      () => {
        const id = router.currentRoute.value.params.id;
        const tId = Number(id);
        ins.data.atvIdx = tId;
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
                  router.push("/home/content/" + index);
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
