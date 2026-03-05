import { reactive, ref } from "vue";

export const rightMenu = {
  _show: ref(false),
  inited: false,
  components: ref(<div></div>),
  local: reactive({
    x: 0,
    y: 0,
  }),
  init() {
    window.onclick = () => {
      this.close();
    };
    window.onpointerdown = () => {
      this.close();
    };
  },
  add(dom: HTMLElement, fn: (e: MouseEvent) => void) {
    dom.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      fn(e);
    });
  },
  show(map: { components: JSX.Element; event: MouseEvent }) {
    if (!rightMenu.inited) this.init();
    const { event, components } = map;
    const { pageX, pageY } = event;
    rightMenu._show.value = true;
    rightMenu.local.x = pageX;
    rightMenu.local.y = pageY;
    rightMenu.components.value = components;
  },
  render() {
    return (
      <div
        onPointerdown={(e) => {
          e.stopPropagation();
        }}
        style={{
          left: rightMenu.local.x + "px",
          top: rightMenu.local.y + "px",
          position: "absolute",
        }}
        v-show={rightMenu._show.value}
        class="right-menu"
      >
        {rightMenu.components.value}
      </div>
    );
  },
  close() {
    rightMenu._show.value = false;
  },
};
