import { defineComponent } from 'vue'
import JSZip from 'jszip'

class PluginManager {
  loadedPlugins: Map<any, any>
  constructor() {
    this.loadedPlugins = new Map()
  }

  async loadPlugin(pluginId: any, zipUrl: any) {
    if (this.loadedPlugins.has(pluginId)) {
      console.log(`插件 ${pluginId} 已加载，跳过`)
      return this.loadedPlugins.get(pluginId).meta
    }
    try {
      const res = await fetch(zipUrl)
      if (!res.ok) throw new Error(`下载失败：${res.status}`)
      const arrayBuffer = await res.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      const pluginJsonStr = await zip.file('plugin.json')?.async('string')
      const meta = JSON.parse(pluginJsonStr as string)
      const componentCode = await zip.file(meta.main || 'component.js')?.async('string')
      const component = this.buildVue3Component(componentCode as string, meta)
      if (meta.style) {
        const styleCode = await zip.file(meta.style)?.async('string')
        this.injectStyle(styleCode, pluginId)
      }
      this.loadedPlugins.set(meta.id, { meta, component })
      console.log(`✅ Vue 3 插件 ${meta.name} 加载成功`)
    } catch (error) {
      console.error(`❌ 插件加载失败:`, error)
    }
  }
  buildVue3Component(code: string, meta: any) {
    let cleanCode = code
      .replace(/export\s+default\s+/, '')
      .trim()
      .replace(/;\s*$/, '')
    let componentOptions
    try {
      // 使用Functuon函数隔离性更高，比eval稍微安全一点
      componentOptions = new Function(`return (${cleanCode})`)()
    } catch (e) {
      console.error('组件代码解析失败:', cleanCode)
      throw new Error('无效的组件格式')
    }
    return defineComponent(componentOptions)
  }
  injectStyle(css: any, pluginId: any) {
    const styleId = `plugin-style-${pluginId}`
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = css
    document.head.appendChild(style)
  }

  getPluginMetas() {
    return Array.from(this.loadedPlugins.values()).map((item) => item.meta)
  }

  getComponent(pluginId: any) {
    return this.loadedPlugins.get(pluginId)?.component
  }

  getDefaultProps(pluginId: any) {
    const meta = this.loadedPlugins.get(pluginId)?.meta
    if (!meta?.props) return {}
    const props = {} as any
    meta.props.forEach((prop: any) => {
      props[prop.name] = prop.default
    })
    return props
  }
}

export default new PluginManager()
