import { defineComponent, reactive, ref, watch } from "vue";
import "./style/content.less";
import router from "../../router";
import { createImg } from "../../utils/UtilsJsx/UtilsJsxPublic";
import { CustomJsx } from "../../utils/UtilsJsx/UtilsJsx";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  type Project,
} from "../../api/project";

export default defineComponent({
  name: "Content",
  setup: () => () => com(),
  mounted() {
    ins.init();
    watch(
      () => router.currentRoute.value.params.id,
      () => {
        console.log("onIdChange");
        ins.onIdChange();
      },
    );
    ins.onIdChange();
  },
});

const contentData = [
  {
    name: "I SHOW",
    num: 0,
    child: [
      "云展",
      "3D产品",
      "云工厂",
      "数字大屏",
      "数字名片",
      "虚拟展厅",
      "宣传片",
    ].map((i) => {
      return {
        icon: i,
        name: i,
        click: () => {},
      };
    }),
  },
  {
    name: "工具集合",
    num: 0,
    child: ["储能计算器", "光伏计算器"].map((i) => {
      return {
        icon: i,
        name: i,
        click: () => {},
      };
    }),
  },
  {
    name: "平台应用",
    num: 0,
    child: ["充电桩管理平台", "EMS管理", "IOC", "智慧工厂"].map((i) => {
      return {
        icon: i,
        name: i,
        click: () => {},
      };
    }),
  },
  {
    name: "源宇宙",
    child: ["源宇宙"].map((i) => {
      return {
        icon: i,
        name: i,
        click: () => {},
      };
    }),
  },
];

const ins = new (class {
  data = reactive({
    atvIdx: 0,
    subSelect: null as string | null,
    projects: [] as Project[],
    loading: false,
  });

  onIdChange() {
    const id = router.currentRoute.value.params.id;
    const tId = Number(id) || 0;
    this.data.atvIdx = tId;

    const content = contentData[tId - 1];
    if (
      tId === 0 ||
      !content?.child?.find((i) => i.name === this.data.subSelect)
    ) {
      this.data.subSelect = null;
    }
  }

  async init() {
    await this.loadProjects();
  }

  async loadProjects() {
    if (!this.data.subSelect) return;

    this.data.loading = true;
    try {
      const typeMap: Record<string, string> = {
        云展: "show",
        "3D产品": "show",
        云工厂: "show",
        数字大屏: "show",
        数字名片: "show",
        虚拟展厅: "show",
        宣传片: "show",
        储能计算器: "tools",
        光伏计算器: "tools",
        充电桩管理平台: "platform",
        EMS管理: "platform",
        IOC: "platform",
        智慧工厂: "platform",
        源宇宙: "origin",
      };

      const type = typeMap[this.data.subSelect] || "table";
      const res = await getProjects({ type, page: 1, page_size: 100 });
      this.data.projects = res.list;
    } catch (error) {
      console.error("加载项目失败:", error);
    } finally {
      this.data.loading = false;
    }
  }

  reset() {}
})();

const upload = new (class {
  selectIndex = ref(0);
  selectKey = ref<"web" | "local" | "video">("web");
  refData = {
    projectPath: ref(""),
  };
  projectData = reactive({
    name: "",
    img: null as string | null,
    link: "",
  });

  menu = {
    web: {
      name: "网页链接",
      titleName: "网页链接",
      icon: "web",
      isLink: true,
      upload: async () => {
        // TODO: 实现上传逻辑
        console.log("上传网页链接");
      },
    },
    local: {
      name: "项目打包文件",
      icon: "local",
      titleName: "文件夹位置",
      isFloder: true,
      upload: async () => {
        // TODO: 实现上传逻辑
        console.log("上传本地项目");
      },
    },
    video: {
      name: "视频",
      titleName: "选择视频",
      icon: "video",
      isFile: true,
      fileTip: "选择视频",
      upload: async () => {
        // TODO: 实现上传逻辑
        console.log("上传视频");
      },
    },
  };
})();

const com = () => (
  <div class="content">
    <div class="title" v-show={ins.data.atvIdx !== 0}>
      <div class="back"></div>
      <div class="routers"></div>
      <div class="border"></div>
      <div class="num"></div>
    </div>
    {contentData.map((_, idx) => {
      return createById(idx);
    })}
  </div>
);

const createTitle = (map: { name: string; num?: number; child: any[] }) => {
  return (
    <div class="content-title">
      <div class="icon"></div>
      <div class="name">{map.name}</div>
      <div class="num" v-show={map.num !== undefined}>
        {map.child.length}项应用
      </div>
    </div>
  );
};

const createItem = (map: any[], parentIndex: number) => {
  return (
    <div class="items">
      {map.map((i) => {
        return (
          <div
            class="item"
            onClick={() => {
              const id = router.currentRoute.value.params.id;
              if (Number(id) !== parentIndex) {
                router.push("/home/content/" + parentIndex);
              }
              ins.data.subSelect = i.name;
              ins.loadProjects();
            }}
          >
            <div class="icon">{createImg("classify/" + i.icon)}</div>
            <div class="data">
              <div class="title">{i.name}</div>
              <div class="sub_title">在线展会展示系统文字描述占位</div>
            </div>
            <div class="menus"></div>
          </div>
        );
      })}
    </div>
  );
};

const createById = (index: number) => {
  const content = contentData[index];
  if (!content) return null;
  const { name, num, child } = content;
  const tIdx = index + 1;
  const sub = ins.data.subSelect;
  const show = ins.data.atvIdx === 0 || ins.data.atvIdx === tIdx;
  return (
    <div class={sub && show ? "sub_items" : ""} v-show={show}>
      {[
        ins.data.atvIdx === 0
          ? createTitle({ name, num, child })
          : createSubTitle({ name, num, child }),
        sub ? createSubList() : createItem(child, tIdx),
      ]}
    </div>
  );
};

const createSubTitle = (map: { name: string; num?: number; child: any[] }) => {
  const { child } = map;
  const sub = ins.data.subSelect;
  return (
    <div class="content-title">
      <div
        class="left_arrow"
        onClick={() => {
          sub ? (ins.data.subSelect = null) : router.push("/home/content/0");
        }}
      >
        {createImg("leftArrow")}
        <p>返回</p>
      </div>
      <div class={"name " + (sub ? "un_active_name" : "")}>{map.name}</div>
      <div class="slice" v-show={sub}></div>
      <div class="active_name" v-show={sub}>
        {sub}
      </div>
      <div class="slice_column" v-show={sub}></div>
      <div class="num" v-show={map.num !== undefined}>
        {child.length}项应用
      </div>
      {CustomJsx.BtGradient({
        name: "上传应用",
        show: ins.data.subSelect !== null,
        click() {
          // TODO: 打开上传对话框
          console.log("打开上传对话框");
        },
      })}
    </div>
  );
};

const createSubList = () => {
  const subSelect = ins.data.subSelect;
  if (!subSelect) return null;

  if (ins.data.loading) {
    return <div class="loading">加载中...</div>;
  }

  if (ins.data.projects.length === 0) {
    return <div class="empty">暂无项目</div>;
  }

  return (
    <div class="sub_list">
      {ins.data.projects.map((project) => {
        return (
          <div key={project.id}>
            <div class="img">
              <img
                src={project.thumbnail || "/images/logo.png"}
                alt={project.name}
              />
              <div class="tools">
                <div
                  onClick={() => {
                    // 打开项目
                    if (project.link_type === "url") {
                      window.open(project.link, "_blank");
                    } else {
                      router.push(`/preview/${project.id}`);
                    }
                  }}
                >
                  打开项目
                </div>
                <div
                  onClick={() => {
                    // TODO: 编辑项目
                    console.log("编辑项目", project);
                  }}
                >
                  修改项目
                </div>
              </div>
            </div>
            <div class="bottom_out">
              <div class="bottom">
                <div class="left">
                  <div class="name">{project.name}</div>
                  <div class="time">
                    {new Date(project.created_at || "").toLocaleString()}
                  </div>
                </div>
                <div class="right">
                  <div class="icon"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
