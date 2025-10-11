import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function exportProject(projectData, outputDir) {
  await fs.mkdir(outputDir, { recursive: true })
  const appContent = generateAppVue(projectData)
  await ensureDir(path.join(outputDir, 'src'))
  await fs.writeFile(path.join(outputDir, 'src', 'App.vue'), appContent)
  // main.js
  const mainContent = `
    import { createApp } from 'vue'
    import App from './App.vue'

    createApp(App).mount('#app')
    `
  await fs.writeFile(path.join(outputDir, 'src', 'main.js'), mainContent)

  // index.html
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.name || 'LowCode Project'}</title>
    </head>
    <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
    </body>
    </html>
  `

  await fs.writeFile(path.join(outputDir, 'index.html'), htmlContent)

  const pkgJson = {
    name: projectData.name || 'lowcode-exported-project',
    version: '1.0.0',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      vue: '^3.3.0',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^4.0.0',
      vite: '^4.0.0',
    },
  }
  await fs.writeFile(path.join(outputDir, 'package.json'), JSON.stringify(pkgJson, null, 2))

  const viteConfig = `
    import { defineConfig } from 'vite'
    import vue from '@vitejs/plugin-vue'
    export default defineConfig({
        plugins: [vue()],
    })
  `
  await fs.writeFile(path.join(outputDir, 'vite.config.js'), viteConfig)

  console.log(`项目已经导出到${outputDir}`)
}

function generateAppVue(projectData) {
  const blocks = projectData.blocks || []

  const components = blocks
    .map((block) => {
      if (block.type === 'text') {
        return `<p>${block.content}</p>`
      } else if (block.type === 'button') {
        return `<button>${block.text}</button>`
      }
      return '<!-- 未知组件 -->'
    })
    .join('\n   ')
  return `
    <template>
    <div class="page">
        ${components}
    </div>
    </template>

    <script setup>
    // 这里可以添加自定义代码逻辑
    </script>

    <style scoped>
    .page {
    padding: 20px;
    font-family: Arial, sans-serif;
    }
    </style>
`
}

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath)
  } catch {
    await fs.mkdir(dirPath, { recursive: true })
  }
}
