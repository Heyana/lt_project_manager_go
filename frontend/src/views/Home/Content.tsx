import { defineComponent, reactive, ref, watch } from "vue";
import "./style/content.less";
import router from "@renderer/router";
import { createImg } from "@utils/UtilsJsx/UtilsJsxPublic";
import { pagePopData, popCreateTempJsx } from "@utils/UtilsJsx/Pop";
import { CustomJsx } from "@utils/UtilsJsx/UtilsJsx";
import { lv } from "element-plus/es/locale";
import { ipcRenderer, tFs, tPath } from "@utils/UtilsExports";
import { BrowserWindow } from "electron";
import { getId, mapObj, Obj } from "js-funcs";
import {
  MapEx,
  formatDateToMinutes,
  getTime,
  toTimeString,
  transByte,
} from "@utils/UtilsJs";
import { copyDir, copyFile, notHasCreateDir } from "@utils/UtilsNode";
import { tip } from "@utils/UtilsEl";
import { getAssetsPath } from "@utils/contant";
import { ElButton, ElDialog } from "element-plus";
import InterfaceData, { pageInterfaceData } from "./Content/InterfaceData";

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
      }
    );
    ins.onIdChange();
  },
});

const ls = [];

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
export type TypePageContent = {
  savedItem: {
    type: "local" | "link" | "videoPath";
    imgPath: string;
    filePath: string;
    name: string;
    parentType: string;
    id: string;
    time: number;
  };
};
const ins = new (class {
  data = reactive({
    atvIdx: 0,
    subSelect: null as string | null,
    savedMap: {} as {
      [key: string]: MapEx<string, TypePageContent["savedItem"]>;
    },
  });
  interfaceData = ref(null);
  isLink: false;
  refData = {
    img: ref(null),
  };
  reacData = reactive({
    interNames: [],
  });

  onIdChange() {
    const id = router.currentRoute.value.params.id;
    const tId = Number(id) || 0;
    ins.data.atvIdx = tId;

    const content = contentData[tId - 1];
    if (
      tId === 0 ||
      !content?.child?.find((i) => i.name === ins.data.subSelect)
    ) {
      ins.data.subSelect = null;
    }
  }
  async init() {
    const staticPath = await ipcRenderer.invoke("getStaticPath");
    const projectManagerPath = tPath.join(staticPath, "projectManager.json");
    const assetsPath = await getAssetsPath();
    notHasCreateDir(assetsPath);
    this.assetsPath = assetsPath;
    this.staticPath = staticPath;
    this.projectManagerPath = projectManagerPath;
    const savedMap = tFs.readFileSync(projectManagerPath, "utf-8");
    if (savedMap) {
      mapObj(JSON.parse(savedMap), (k: any, v) => {
        this.data.savedMap[k] = MapEx.formJSON(v);
      });
      console.log(this.data.savedMap, "this.data.savedMap");
    }

    this.reacData.interNames = await ipcRenderer.invoke("getInterfaceKeys");
    console.log("Log-- ", this.reacData.interNames, " this.reacData.interMap ");
  }
  assetsPath: null | string;
  projectManagerPath: null | string;
  staticPath: null | string;
  window = new (class {})();
  reset() {}
})();

const upload = new (class {
  selectIndex = ref(0);
  init() {}
  selectKey = ref("web");
  refData = {
    projectPath: ref(""),
  };
  projectData = reactive({
    name: "",
    img: null,
    link: "",
  });
  menu = {
    web: {
      name: "网页链接",
      titleName: "网页链接",
      icon: "web",
      isLink: true,
      upload: () => {
        const subSelect = ins.data.subSelect;
        let map = ins.data.savedMap[subSelect];
        if (!map) {
          ins.data.savedMap[subSelect] = map = new MapEx();
        }
        const name = this.projectData.name;
        const id = getId();
        const img = this.projectData.img;
        const imgExt = tPath.extname(img);
        const imgName = "img_" + id + imgExt;
        const imgPath = tPath.join(ins.assetsPath, imgName);
        copyFile(img, imgPath);
        const filePath = this.projectData.link;
        map.set(id, {
          type: "link",
          imgPath: imgName,
          filePath,
          name,
          parentType: ins.data.subSelect,
          id,
          time: new Date().getTime(),
        });
        tFs.writeFileSync(
          ins.projectManagerPath,
          JSON.stringify(ins.data.savedMap)
        );
        tip("复制文件完成");
        console.log(map, "map");
      },
    },
    local: {
      name: "项目打包文件",
      icon: "local",
      titleName: "文件夹位置",
      // isFile:true,
      isFloder: true,
      upload: () => {
        const subSelect = ins.data.subSelect;
        let map = ins.data.savedMap[subSelect];
        if (!map) {
          ins.data.savedMap[subSelect] = map = new MapEx();
        }
        tip("正在复制文件");
        const name = this.projectData.name;
        const id = getId();
        const img = this.projectData.img;
        const file = this.refData.projectPath.value;
        const imgExt = tPath.extname(img);
        const imgName = "img_" + id + imgExt;
        const imgPath = tPath.join(ins.assetsPath, imgName);
        copyFile(img, imgPath);
        const fileName = name + "_" + id;
        const filePath = tPath.join(ins.assetsPath, fileName);
        copyDir({
          srcPath: file,
          targetPath: filePath,
          isCover: true,
        });
        map.set(id, {
          type: "local",
          imgPath: imgName,
          filePath: fileName,
          name,
          parentType: ins.data.subSelect,
          id,
          time: new Date().getTime(),
        });
        tFs.writeFileSync(
          ins.projectManagerPath,
          JSON.stringify(ins.data.savedMap)
        );
        tip("复制文件完成");
      },
    },
    video: {
      name: "视频",
      titleName: "选择视频",
      icon: "video",
      isFile: true,
      fileTip: "选择视频",
      upload: () => {
        const subSelect = ins.data.subSelect;
        let map = ins.data.savedMap[subSelect];
        if (!map) {
          ins.data.savedMap[subSelect] = map = new MapEx();
        }
        tip("正在复制文件");
        const name = this.projectData.name;
        const id = getId();
        const img = this.projectData.img;
        const file = this.refData.projectPath.value;
        const imgExt = tPath.extname(img);
        const videoExt = tPath.extname(file);
        const imgName = "img_" + id + imgExt;
        const imgPath = tPath.join(ins.assetsPath, imgName);
        const videoName = "video_" + id + videoExt;
        const videoPath = tPath.join(ins.assetsPath, videoName);
        copyFile(img, imgPath);
        copyFile(file, videoPath);
        map.set(id, {
          type: "videoPath",
          imgPath: imgName,
          filePath: videoName,
          name,
          parentType: ins.data.subSelect,
          id,
          time: new Date().getTime(),
        });
        tFs.writeFileSync(
          ins.projectManagerPath,
          JSON.stringify(ins.data.savedMap)
        );
        tip("复制文件完成");
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
    <div class="utils">
      <InterfaceData ref={ins.interfaceData}></InterfaceData>
    </div>
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
type TypeContent = {
  item: {
    icon: string;
    name: string;
    click: Function;
  };
};

const createItem = (map: TypeContent["item"][], parentIndex: number) => {
  return (
    <div class="items">
      {map.map((i) => {
        return (
          <div
            class="item"
            onClick={() => {
              const id = router.currentRoute.value.params.id;
              console.log(parentIndex, id, "parentIndex,id");
              if (Number(id) !== parentIndex) {
                router.push("/home/content/" + parentIndex);
              }
              ins.data.subSelect = i.name;
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
  const { name, num, child } = contentData[index];
  const tIdx = index + 1;
  const sub = ins.data.subSelect;
  const show = ins.data.atvIdx === 0 || ins.data.atvIdx === tIdx;
  return (
    <div class={sub && show ? "sub_items" : ""} v-show={show}>
      {[
        ins.data.atvIdx === 0
          ? createTitle({
              name,
              num,
              child,
            })
          : createSubTitle({
              name,
              num,
              child,
            }),
        sub ? createSubList() : createItem(child, tIdx),
      ]}
    </div>
  );
};

const createSubTitle = (map: { name: string; num?: number; child: any[] }) => {
  const { child } = map;
  const { refData } = ins;
  const { projectData } = upload;
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
          // 重置新增弹窗的临时数据，避免受到上一次编辑影响
          projectData.name = "";
          projectData.img = null;
          projectData.link = "";
          refData.img.value = null;
          upload.refData.projectPath.value = "";
          upload.selectKey.value = "web";
          upload.selectIndex.value = 0;

          pagePopData.open(() => {
            const uploadMap = upload.menu[upload.selectKey.value];
            return popCreateTempJsx({
              title: "添加项目",
              type: "infoWindow",
              child: () => [
                CustomJsx.Text({
                  def: projectData.name,
                  tip: "请输入项目名称",
                  onDone(text) {
                    projectData.name = text;
                    console.log(text, "text");
                  },
                }),
                CustomJsx.Empty(16),
                CustomJsx.TileSwitch({
                  index: upload.selectIndex,
                  menu: mapObj(upload.menu, (k, v) => {
                    return {
                      name: v.name,
                      icon: "content/" + v.icon,
                      click: () => {
                        upload.selectKey.value = k;
                        console.log(
                          upload.selectKey.value,
                          " upload.selectKey.value "
                        );
                      },
                    };
                  }),
                }),
                CustomJsx.Empty(16),
                CustomJsx.Img({
                  def: refData.img,
                  onDone(img) {
                    projectData.img = img;
                  },
                }),
                CustomJsx.Empty(16),
                CustomJsx.Title(uploadMap.titleName),
                CustomJsx.Empty(16),
                uploadMap.isLink &&
                  CustomJsx.Text({
                    def: upload.projectData.link,
                    iconMap: {
                      url: "custom/link",
                    },
                    tip: "请输入链接",
                    onDone: (text) => {
                      upload.projectData.link = text;
                      console.log(text, "text");
                    },
                  }),
                uploadMap.isFloder &&
                  CustomJsx.FloderSelect({
                    def: upload.refData.projectPath,
                    tip: uploadMap.fileTip,
                    onDone: (text) => {
                      console.log(text, "text");
                    },
                  }),
                uploadMap.isFile &&
                  CustomJsx.FileSelect({
                    def: upload.refData.projectPath,
                    tip: uploadMap.fileTip,
                    type: "video",
                    onDone: (text) => {
                      upload.refData.projectPath.value = text;
                      console.log(text, "text");
                    },
                  }),
                CustomJsx.Empty(16),
                CustomJsx.RightButtons([
                  {
                    name: "添加",
                    click: async () => {
                      if (
                        ins.data.savedMap[ins.data.subSelect]?.find(
                          (k, v) => v.name === upload.projectData.name
                        )
                      ) {
                        tip("该项目已存在", "error");
                        return;
                      }
                      uploadMap.upload();
                      pagePopData.close();
                    },
                  },
                ]),
              ],
              onClose: () => {
                pagePopData.close();
              },
            });
          });
        },
      })}
    </div>
  );
};
const createSubList = () => {
  return (
    <div class="sub_list">
      {ins.data.savedMap[ins.data.subSelect]?.map((k, v) => {
        return (
          <div>
            <div class="img">
              <img src={tPath.join(ins.assetsPath, v.imgPath)} alt="" />
              <div class="tools">
                <div
                  onClick={() => {
                    console.log(v, "v");
                    ipcRenderer.invoke("setChildWin", {
                      link: v.filePath,
                      type: v.type,
                      name: v.name,
                    });
                  }}
                >
                  打开项目
                </div>
                <div
                  onClick={() => {
                    // 编辑项目：参考“添加项目”的弹窗样式，自动带出原始数据
                    const assetsPath = ins.assetsPath as string;
                    // 类型映射
                    const typeKey =
                      v.type === "link"
                        ? "web"
                        : v.type === "local"
                        ? "local"
                        : "video";

                    // 预填基础信息
                    upload.projectData.name = v.name;
                    upload.projectData.link =
                      v.type === "link" ? v.filePath : "";
                    ins.refData.img.value = v.imgPath
                      ? tPath.join(assetsPath, v.imgPath)
                      : null;
                    upload.refData.projectPath.value =
                      v.type === "link"
                        ? ""
                        : tPath.join(assetsPath, v.filePath);

                    pagePopData.open(() => {
                      const uploadMap = upload.menu[typeKey];
                      return popCreateTempJsx({
                        title: "修改项目",
                        type: "infoWindow",
                        child: () => [
                          CustomJsx.Text({
                            def: upload.projectData.name,
                            tip: "请输入项目名称",
                            onDone(text) {
                              upload.projectData.name = text;
                            },
                          }),
                          CustomJsx.Empty(16),
                          CustomJsx.Img({
                            def: ins.refData.img,
                            onDone(img) {
                              upload.projectData.img = img;
                            },
                          }),
                          CustomJsx.Empty(16),
                          CustomJsx.Title(uploadMap.titleName),
                          CustomJsx.Empty(16),
                          v.type === "link" &&
                            CustomJsx.Text({
                              def: upload.projectData.link,
                              iconMap: {
                                url: "custom/link",
                              },
                              tip: "请输入链接",
                              onDone(text) {
                                upload.projectData.link = text;
                              },
                            }),
                          v.type === "local" &&
                            CustomJsx.FloderSelect({
                              def: upload.refData.projectPath,
                              tip: uploadMap.fileTip,
                              onDone: (text) => {
                                upload.refData.projectPath.value = text;
                              },
                            }),
                          v.type === "videoPath" &&
                            CustomJsx.FileSelect({
                              def: upload.refData.projectPath,
                              tip: uploadMap.fileTip,
                              type: "video",
                              onDone: (text) => {
                                upload.refData.projectPath.value = text;
                              },
                            }),
                          CustomJsx.RightButtons([
                            {
                              name: "保存",
                              click: () => {
                                const map =
                                  ins.data.savedMap[ins.data.subSelect];
                                if (!map) {
                                  tip("项目数据不存在", "error");
                                  return;
                                }
                                const curItem = map.get(k);
                                if (!curItem) {
                                  tip("项目数据不存在", "error");
                                  return;
                                }

                                // 处理封面变更：如果用户重新选择了图片，则覆盖原有图片文件
                                if (
                                  upload.projectData.img &&
                                  upload.projectData.img !==
                                    tPath.join(assetsPath, curItem.imgPath)
                                ) {
                                  copyFile(
                                    upload.projectData.img,
                                    tPath.join(assetsPath, curItem.imgPath)
                                  );
                                }

                                // 处理路径变更
                                if (
                                  curItem.type === "local" &&
                                  upload.refData.projectPath.value
                                ) {
                                  copyDir({
                                    srcPath: upload.refData.projectPath.value,
                                    targetPath: tPath.join(
                                      assetsPath,
                                      curItem.filePath
                                    ),
                                    isCover: true,
                                  });
                                }
                                if (
                                  curItem.type === "videoPath" &&
                                  upload.refData.projectPath.value
                                ) {
                                  copyFile(
                                    upload.refData.projectPath.value,
                                    tPath.join(assetsPath, curItem.filePath)
                                  );
                                }

                                // 更新基础信息
                                map.set(k, {
                                  ...curItem,
                                  name: upload.projectData.name,
                                  filePath:
                                    curItem.type === "link"
                                      ? upload.projectData.link
                                      : curItem.filePath,
                                  time: new Date().getTime(),
                                });
                                tFs.writeFileSync(
                                  ins.projectManagerPath,
                                  JSON.stringify(ins.data.savedMap)
                                );
                                tip("修改成功");
                                pagePopData.close();
                              },
                            },
                          ]),
                        ],
                        onClose: () => {
                          pagePopData.close();
                        },
                      });
                    });
                  }}
                >
                  修改项目
                </div>
                <div
                  v-show={ins.reacData.interNames.find((i) => {
                    return i == v.name;
                  })}
                  onClick={() => {
                    pageInterfaceData.open(v.name);
                  }}
                >
                  查看接口
                </div>
              </div>
            </div>
            <div class="bottom_out">
              <div class="bottom">
                <div class="left">
                  <div class="name">{v.name}</div>
                  <div class="time">{toTimeString(new Date(v.time))}</div>
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
