import fs from "fs/promises";
import path from "path";
import archiver from "archiver";
import os from "os";

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// 模拟：从内存获取项目数据
const getProjectData = async (projectId) => {
  return {
    name: "我的项目",
    blocks: [
      { id: "text-1", type: "text", content: "欢迎来到首页" },
      { id: "btn-1", type: "button", text: "点击我" },
    ],
  };
};

// 组件映射表
const componentMap = {
  text: {
    name: "MyText",
    template: `<p class="my-text">{{ content }}</p>`,
    script: `
    <script setup>
        defineProps({
        content: String
        })
    </script>
`,
  },
  button: {
    name: "MyButton",
    template: `<button class="my-button">{{ text }}</button>`,
    script: `
    <script setup>
        defineProps({
        text: String
        })
    </script>
`,
  },
};

// 生成 App.vue
const generateAppVue = (blocks) => {
  const imports = new Set();
  const components = blocks
    .map((block) => {
      const comp = componentMap[block.type];
      if (!comp) return "<!-- 未知组件 -->";

      imports.add(`import ${comp.name} from '@/components/${comp.name}.vue';`);
      return `<${comp.name} ${getPropsString(block)} />`;
    })
    .join("\n    ");

  return `
<template>
  <div class="page">
    ${components}
  </div>
</template>

<script setup>
${Array.from(imports).join("\n")}
</script>

<style scoped>
.page {
  padding: 20px;
  font-family: Arial, sans-serif;
}
.my-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.my-text {
  margin: 10px 0;
  font-size: 16px;
}
</style>
`;
};

const getPropsString = (block) => {
  const props = [];
  for (let key in block) {
    if (key !== "type" && key !== "id") {
      props.push(`${key}="${block[key]}"`);
    }
  }
  return props.join(" ");
};

// 生成 Vue 项目
const generateVueProject = async (outputDir, projectData) => {
  // 创建目录
  await ensureDir(path.join(outputDir, "src"));
  await ensureDir(path.join(outputDir, "src", "components"));

  // 生成 App.vue
  const appContent = generateAppVue(projectData.blocks);
  await fs.writeFile(path.join(outputDir, "src", "App.vue"), appContent);

  // 生成 main.js
  const mainContent = `
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
`;
  await fs.writeFile(path.join(outputDir, "src", "main.js"), mainContent);

  // 生成 index.html
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectData.name || "LowCode Project"}</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
`;
  await fs.writeFile(path.join(outputDir, "index.html"), htmlContent);

  // 生成 package.json
  const pkgJson = {
    name: projectData.name || "lowcode-exported-project",
    version: "1.0.0",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      vue: "^3.3.0",
    },
    devDependencies: {
      "@vitejs/plugin-vue": "^4.0.0",
      vite: "^4.0.0",
    },
  };

  await fs.writeFile(
    path.join(outputDir, "package.json"),
    JSON.stringify(pkgJson, null, 2)
  );

  // 生成 vite.config.js
  const viteConfig = `
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
`;

  await fs.writeFile(path.join(outputDir, "vite.config.js"), viteConfig);

  // 生成组件文件
  for (let type in componentMap) {
    const comp = componentMap[type];
    const compContent = `${comp.template}\n${comp.script}`;
    await fs.writeFile(
      path.join(outputDir, "src", "components", `${comp.name}.vue`),
      compContent
    );
  }
};

// 导出路由
export const exportRoute = async (req, res) => {
  const { projectId } = req.body;
  const tempDir = path.join(os.tmpdir(), `lc-${Date.now()}`);

  try {
    console.log("📁 创建临时目录:", tempDir);
    await fs.mkdir(tempDir, { recursive: true });

    // 生成项目
    const projectData = await getProjectData(projectId);
    await generateVueProject(tempDir, projectData);

    // 👇 验证文件
    const files = await fs.readdir(tempDir, { recursive: true });
    console.log("📄 生成的文件:", files);

    if (files.length === 0) {
      throw new Error("临时目录为空，项目生成失败");
    }

    // 打包 ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=project-${projectId}.zip`
    );

    const archive = archiver("zip");
    archive.on("error", (err) => {
      console.error("ZIP error:", err);
      if (!res.headersSent) res.status(500).send("打包失败");
    });

    const finalize = new Promise((resolve, reject) => {
      archive.on("end", resolve);
      archive.on("error", reject);
    });

    archive.pipe(res);
    archive.directory(tempDir, false); // 👈 确保路径正确
    archive.finalize();

    await finalize;
    console.log("📦 ZIP 打包完成");

    // 延迟清理
    setTimeout(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log("🧹 临时文件已清理");
    }, 10000);
  } catch (error) {
    console.error("❌ 导出失败:", error);

    // 清理临时文件
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      console.error("清理失败:", e);
    }

    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
};
