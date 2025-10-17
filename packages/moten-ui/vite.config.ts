/// <reference types="vitest"/>

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { readdirSync } from "fs";
import { filter, includes, map } from "lodash-es";
import viteImagemin from "vite-plugin-imagemin";

function getDirectoriesSync(basePath: string) {
  const entries = readdirSync(basePath, { withFileTypes: true });
  return map(
    filter(entries, (entry) => entry.isDirectory()),
    (entry) => entry.name
  );
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // 进行图片压缩的插件
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: { plugins: [{ removeViewBox: false }] },
    }),
  ],
  resolve: {
    alias: {
      "@": resolve("./src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "moten",
      fileName: "moten",
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "echarts", "element-plus"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "index.css";
          if (
            assetInfo.type === "asset" &&
            /\.(css)$/i.test(assetInfo.name as string)
          ) {
            console.log(assetInfo.name);
            return `theme/[name].css`;
          }
          return assetInfo.name as string;
        },

        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
          if (
            id.includes("/packages/utils") ||
            id.includes("plugin-vue:export-helper")
          ) {
            return "utils";
          }
          if (id.endsWith(".scss") || id.endsWith(".css")) {
            if (id.includes("/src/components/")) {
              const componentName = id.split("/components/")[1].split("/")[0];
              return `css/components/${componentName}`;
            }
            if (id.includes("/src/assets/styles/")) {
              const styleName = id.split("/styles/")[1].split(".")[0];
              return `css/assets/${styleName}`;
            }
            return "css/vendor";
          }
          for (const item of getDirectoriesSync("./src/components")) {
            if (includes(id, `/src/components/${item}`)) {
              return item;
            }
          }
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/resources.scss";`,
      },
    },
  },
  test: {
    // 启用监听模式
    watch: true,
    // 测试文件匹配模式
    include: ["src/**/*.{test,spec}.{js,ts}"],
    // 输出详细信息
    reporters: ["verbose"],
    environment: "jsdom",
    coverage: {
      include: ["src/components/**/*"],
      exclude: ["src/**/schema.ts"],
    },
  },
});
