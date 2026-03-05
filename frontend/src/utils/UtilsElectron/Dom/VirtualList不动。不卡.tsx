import { mergeObject } from "@utils/UtilsJs";
import { Ref, ref } from "vue";

export class VirtualList {
  lineHeight: number;
  displayCount: number;
  lineSize: number;
  list: any[];
  startIdx: number;
  child: (data: any, index: number) => JSX.Element;
  curentList: Ref<JSX.Element[]> = ref([]);
  top = 0;
  rootDom = null as HTMLElement | null;

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
  getNowWithTop() {
    const index = Math.floor((this.top / this.lineHeight) * 5);
    if (index + this.displayCount >= this.list.length)
      return this.curentList.value;
    return this.list.slice(index, index + this.displayCount);
  }
  onscroll = (e: any) => {
    if (!this.rootDom) {
      this.rootDom = document.querySelector("._virtual-list");
    }
    const scroll = e.target.scrollTop;
    this.top = scroll;
    this.rootDom.style.paddingTop = scroll + "px";
    this.curentList.value = this.getNowWithTop();
  };
  render() {
    const { list, lineSize, lineHeight, child } = this;
    const height = (list.length / lineSize) * lineHeight;
    console.log(height, "height");
    return (
      <div class="_virtual-list" style={{ height: height + "px" }}>
        <div class="_virtual-list-content">
          {this.curentList.value.map((i, index) => child(i, index))}
        </div>
      </div>
    );
  }
}
