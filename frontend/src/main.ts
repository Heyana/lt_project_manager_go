import { createApp } from "vue";
// @ts-ignore
import "reset-css";
import "./styles/app.less";
import App from "./App.tsx";
import router from "./router";

createApp(App).use(router).mount("#app");
