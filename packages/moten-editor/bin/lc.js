#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const command = process.argv[2]
const projectName = process.argv[3] || 'my-project'

if (command === 'export') {
  exportProject()
} else if (command === 'dev') {
  startDevServer()
} else {
  console.log('用法: lc export [项目名] | lc dev')
}

async function exportProject() {
  try {
    const projectData = {
      name: projectName,
      blocks: [],
    }
    const outputDir = path.resolve(process.cwd(), projectName)
    await import('../src/cli/export.js').then((m) => m.exportProject(projectData, outputDir))

    console.log(`✅ 项目已导出到: ${outputDir}`)
    console.log('\n🚀 快速开始:')
    console.log(`cd ${projectName}`)
    console.log('npm install')
    console.log('npm run dev')
  } catch (error) {
    console.error('❌ 导出失败:', error.message)
  }
}

async function startDevServer() {
  try {
    const projectPath = path.resolve(process.cwd(), projectName)
    const cmd = `cd ${projectPath} && npm run dev`
    const { execSync } = await import('child_process')
    execSync(cmd, { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ 启动开发服务器失败:', error.message)
  }
}
