import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "总览",
    component: () => import("../views/Home"),
    redirect: "/home/content/0",
    children: [
      {
        path: "content/:id?",
        name: "content",
        component: () => import("../views/Home/Content"),
      },
      {
        path: "filelibrary/:folderId?",
        name: "fileLibrary",
        component: () => import("../views/Home/FileLibrary"),
      },
    ],
  },
  {
    path: "/preview/:id",
    name: "Preview",
    component: () => import("../views/ProjectWindow"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
