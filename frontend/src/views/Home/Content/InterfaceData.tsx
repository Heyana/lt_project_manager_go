import { defineComponent, reactive, ref } from "vue";
import "./style/interface_data.less";
import { ElDialog, ElButton, ElMessage } from "element-plus";
import { formatDateToMinutes } from "@utils/UtilsJs";
import { mapObj, Obj, transByte } from "js-funcs";
import { ipcRenderer } from "@utils/UtilsExports";
import JsonEditorVue from "json-editor-vue";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
export default defineComponent({
  name: "interface_data",
  setup: () => () => com(),
  mounted() {
    ins.moutend();
  },
});
type InnerData = {
  url: string;
  size: number;
  code: {
    code?: number;
    msg?: string;
    data?: Obj;
  };
};
type ProjectInner = {
  time: string;
  size: number;
  name: string;
  apiSize: number;
  data: Obj;
};
const ins = new (class {
  async moutend() {}
  reacData = reactive({
    show: false,
    showInner: false,
  });
  data = {};
  select = ref({
    apiSize: 0,
    name: "123",
    size: 123,
    time: "0",
    data: {},
  } as ProjectInner);
  dataInner = ref({} as InnerData["code"]);
  async open(name: string) {
    console.log("Log-- ", name, "name");
    const res = (await ipcRenderer.invoke("getProjectData", name)) as Obj;
    if (!res) {
      alert("暂无");
      return;
    }
    const ls = [];
    this.select.value = {
      apiSize: Object.keys(res).length - 1,
      name,
      size: new Blob([JSON.stringify(res)]).size,
      time: res.time || 0,
      data: ls,
    };
    mapObj(res, (k: string, v) => {
      console.log("Log-- ", v, "v");
      if (k == "time") return;
      ls.push({
        url: k,
        size: JSON.stringify(v.data)?.length || 0,
        code: v,
      });
    });
    this.reacData.show = true;
  }
  setInnerData(data: InnerData) {
    this.dataInner.value = data.code;
    console.log("Log-- ", data, "data");
    this.reacData.showInner = true;
  }
})();
const com = () => (
  <div class="interface_data">
    <ElDialog
      title="接口查看"
      class="interface_dialog"
      onClose={() => {
        ins.reacData.show = false;
      }}
      modelValue={ins.reacData.show}
    >
      <div class="title_inner">
        <div class="title flex_bt l">
          <p>{ins.select.value.name}</p>
        </div>
        <div class="inner">
          <div class="flex_bt l_r">
            <p>数据大小</p>
            <div>{transByte(Number(ins.select.value.size))}</div>
          </div>
          <div class="flex_bt l_r">
            <p>更新时间</p>
            <div>{formatDateToMinutes(ins.select.value.time)}</div>
          </div>
          <div class="flex_bt l_r">
            <p>接口个数</p>
            <div>{ins.select.value.apiSize}</div>
          </div>
          <div class="flex_bt l_r">
            <p>清空数据</p>
            <div>
              <ElButton
                onClick={() => {
                  // ins.cleanProject(interfaceData.select.value.name);
                }}
              >
                清空
              </ElButton>
            </div>
          </div>
        </div>
      </div>
      <div class="border"></div>
      <div class="datas">
        <p class="title">项目内容</p>
        <div class="datas_content">
          {Object.values(ins.select.value.data)
            .sort((a, b) => b.size - a.size)
            .map((i) => {
              console.log("Log-- ", i, "i");
              return (
                <div
                  class="multi"
                  onClick={() => {
                    ins.setInnerData(i);
                  }}
                >
                  {mapObj(
                    {
                      url: i.url,
                      size: transByte(i.size),
                      code: i.code.code,
                      msg: i.code.msg?.slice(0, 20),
                    },
                    (k, v) => {
                      return (
                        <div>
                          <div class="key">{k}:</div>
                          <div class="value">{v}</div>
                        </div>
                      );
                    }
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div class="speace"></div>
      <ElDialog
        title="接口数据"
        onClose={() => {
          ins.reacData.showInner = false;
        }}
        modelValue={ins.reacData.showInner}
      >
        <JsonEditorVue
          dark
          mode={"tree"}
          mainMenuBar={false}
          class="jse-theme-dark"
          modelValue={ins.dataInner.value || {}}
          onChange={(a) => {
            console.log("Log-- ", a, "a");
          }}
        />
      </ElDialog>
    </ElDialog>
  </div>
);

export const pageInterfaceData = ins;
