import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home"),
  },
  {
    path: "/preview/:id",
    name: "Preview",
    component: () => import("@/views/ProjectPreview"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
