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

// 生成 App.vue
const generateAppVue = (blocks) => {
  const imports = new Set();
  let components;
  blocks.forEach((block) => {
    const comp = block.code;
    if (!comp) return "<!-- 未知组件 -->";
    imports.add(`import ${comp} from '@/components/${comp}.vue';`);
    components += `<mo-${comp} ${getPropsString(block.formData)} />   \n`;
  });

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
  </style>
`;
};

const getPropsString = (block) => {
  if(!block) return 
  const props = [];
  for (let key in block) {
    if (key !== "type" && key !== "id") {
      props.push(`${key}="${block[key]["desktop"]}"`);
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
  const appContent = generateAppVue(projectData);
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
  for (let comp of projectData) {
    const compName = comp.code;
    const compContent = await fs.readFile(
      `../moten-ui/src/components/${compName}/index.vue`
    );
    await fs.writeFile(
      path.join(outputDir, "src", "components", `${compName}.vue`),
      compContent
    );
  }
};

export function exportRoute(collabService) {
  return async (req, res) => {
    const { projectId, id } = req.body;
    const content = collabService.getPrivatedocData(id);

    const { blockConfig, pageConfig } = content;
    const tempDir = path.join(os.tmpdir(), `lc-${Date.now()}`);

    try {
      console.log("创建临时目录:", tempDir);
      await fs.mkdir(tempDir, { recursive: true });

      await generateVueProject(tempDir, blockConfig);
      // await generateVueProject(tempDir, pageConfig);

      const files = await fs.readdir(tempDir, { recursive: true });
      console.log("生成的文件:", files);

      if (files.length === 0) {
        throw new Error("临时目录为空，项目生成失败");
      }

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
      archive.directory(tempDir, false);
      archive.finalize();

      await finalize;
      console.log("ZIP 打包完成");

      // 延迟清理
      setTimeout(async () => {
        await fs.rm(tempDir, { recursive: true, force: true });
        console.log("临时文件已清理");
      }, 10000);
    } catch (error) {
      console.error("导出失败:", error);

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
}
