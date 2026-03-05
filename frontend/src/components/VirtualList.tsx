import { LimitCall, mergeObject } from "@utils/UtilsJs";
import { radioGroupEmits } from "element-plus";
import { Ref, ref } from "vue";

export class VirtualList {
  lineHeight: number;
  displayCount: number;
  lineSize: number;
  list: any[];
  startIdx: number;
  child: (data: any, index: number) => JSX.Element;
  curentList: Ref<any[]> = ref([]);
  top = 0;
  rootDom = null as HTMLElement | null;
  contentDom = null as HTMLElement | null;
  viewDom = null as HTMLElement | null;
  peddingTop = ref(0);
  constructor(map: {
    lineHeight: number;
    lineSize: number;
    list: any[];
    startIdx: number;
    child: (data: any, index: number) => JSX.Element;
  }) {
    const { lineSize, list, lineHeight, startIdx, child } = mergeObject(
      {
        list: [],
        lineSize: 5,
        lineHeight: 0,
        startIdx: 0,
        child(data) {
          return <div></div>;
        },
      },
      map
    );
    this.displayCount = 30;
    this.lineHeight = lineHeight;
    this.lineSize = lineSize;
    this.list = list;
    this.startIdx = startIdx;
    this.child = child;
  }
  setDisplayContent() {}
  letIndex = 0;
  getNowWithTop = (top: number) => {
    const index = Math.floor(top / this.lineHeight);
    if (index === this.letIndex) return;
    this.letIndex = index;
    this.createByIndex(index);
  };
  createByIndex(index: number) {
    this.peddingTop.value = index * this.lineHeight;
    this.curentList.value = this.list.slice(
      index * this.lineSize,
      index * this.lineSize + this.displayCount
    );
  }

  onscroll = (e: any) => {
    console.log(e, "e");
    const scroll = e.target.scrollTop;
    this.getNowWithTop(scroll);
  };
  updateList() {
    if (!this.viewDom) return;
    const height = this.viewDom.clientHeight || 700;
    this.displayCount = Math.floor(height / this.lineHeight) * this.lineSize;
    console.log(
      height,
      [this.viewDom],
      this.viewDom.offsetHeight,
      this.viewDom.clientHeight,
      this.displayCount,
      this.list,
      "  this.displayCount "
    );
    this.curentList.value = this.list.slice(0, this.displayCount);
  }
  onmounted(viewDom: HTMLElement) {
    console.log("====================================");
    console.log("onmounted");
    console.log("====================================");
    window.onresize = () => {
      this.updateList();
    };
    this.viewDom = viewDom;
    this.rootDom = viewDom.querySelector("._virtual-list");
    this.contentDom = viewDom.querySelector("._virtual-list-content");
    this.updateList();
  }
  setList(ls: any[]) {
    this.list = ls;
    this.updateList();
  }
  render() {
    const { list, lineSize, lineHeight, child } = this;
    const height = (list.length / lineSize) * lineHeight;
    return (
      <div
        class="_virtual-list"
        style={{
          minHeight: lineHeight + "px",
          height: height + "px",
          paddingTop: this.peddingTop.value + "px",
        }}
      >
        <div class="_virtual-list-content">
          {this.curentList.value.map((i, index) => child(i, index))}
        </div>
      </div>
    );
  }
}
