import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(), // 全局启用 TSX/JSX 支持
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
        @import "@/styles/index.less";
        `,
      },
    },
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:23370",
        changeOrigin: true,
      },
      "/cdn": {
        target: "http://localhost:23370",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
