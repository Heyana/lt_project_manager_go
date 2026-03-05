import { defineComponent, reactive } from "vue";
import "./style/pop.less";
import { createImg } from "./UtilsJsxPublic";
import { ArrowFn } from "@utils/UtilsTypes";
export default defineComponent({
  name: "Pop",
  setup: () => () => com(),
});
const ins = new (class {
  init() {}
  data = reactive({
    child: undefined as (() => JSX.Element) | undefined,
    show: false,
    showBottom: true,
    title: undefined as undefined | string,
  });
  open(
    child?: () => JSX.Element,
    opts?: {
      // showBottom?: boolean;
      title?: string;
    }
  ) {
    const { title } = opts || {};
    this.data.child = child;
    this.data.show = true;
    this.data.title = title;
  }
  close() {
    this.data.show = false;
  }
})();

const com = () => {
  const { data } = ins;
  return (
    <div
      class="pop"
      onClick={() => {
        data.show = false;
      }}
      v-show={data.show}
    >
      {data.child?.()}
    </div>
  );
};

export const pagePopData = ins;

export const popCreateTempJsx = (data: {
  title?: string;
  type: "infoWindow";
  child: () => JSX.Element | JSX.Element[];
  onClose?: ArrowFn;
}) => {
  const { type, title, child, onClose } = data;
  switch (type) {
    case "infoWindow":
      {
        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            class="pop_info_window"
          >
            <div class="title" v-show={title}>
              <div class="data">{title}</div>
              <div class="close" onClick={onClose}>
                {createImg("closeBox")}
              </div>
            </div>
            <div class="content">{child()}</div>
          </div>
        );
      }
      break;
  }
};
