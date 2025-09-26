/// <reference types="vitest"/>

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue",
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
      include: ['src/components/**/*'],
      exclude: ['src/**/schema.ts']
    }
  },
});
