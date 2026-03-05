import { createApp } from "vue";
import { createPinia } from "pinia";
// @ts-ignore
import "reset-css";
import "./assets/styles/main.less";
import App from "./App.tsx";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(router).use(pinia).mount("#app");
