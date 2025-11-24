import { defineComponent } from 'vue'
import JSZip from 'jszip'

function scopeCss(css: string, scopeId: string): string {
  return css.replace(/([^\r\n,{}]+)(?=\{)/g, (match) => {
    const selector = match.trim()
    if (
      selector.startsWith('@') ||
      selector === 'to' ||
      selector === 'from' ||
      /^\d+%$/.test(selector)
    ) {
      return match
    }
    return `${selector}[${scopeId}]`
  })
}

function createSandbox(context: any) {
  // 黑名单：绝对禁止访问的全局对象
  const blackList = new Set(['window', 'document', 'localStorage', 'cookie', 'location', 'alert'])

  const proxy = new Proxy(context, {
    has(target, key: string | symbol) {
      return true
    },
    get(target, key: string | symbol, receiver) {
      if (key === Symbol.unscopables) return undefined
      if (typeof key === 'string' && blackList.has(key)) {
        console.warn(`沙箱拦截: 插件试图访问被禁用的全局对象 "${key}"`)
        return undefined // 或者 throw new Error()
      }
      if (Reflect.has(target, key)) {
        return Reflect.get(target, key, receiver)
      }
      const globalVal = (window as any)[key]
      if (
        globalVal &&
        (key === 'console' ||
          key === 'Math' ||
          key === 'Date' ||
          key === 'JSON' ||
          key === 'setTimeout' ||
          key === 'setInterval')
      ) {
        return globalVal
      }
      return undefined
    },
  })
  return proxy
}

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
    console.log(zipUrl)
    try {
      const res = await fetch(zipUrl)
      if (!res.ok) throw new Error(`下载失败：${res.status}`)

      const arrayBuffer = await res.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer)
      let file = zip.file('plugin.json')
      let rootPath = ''

      if (!file) {
        const files = Object.keys(zip.files)
        const pluginEnpty = files.find(
          (name) => name.endsWith('plugin.json') && !name.startsWith('__MACOSX'),
        )
        if (pluginEnpty) {
          file = zip.file(pluginEnpty)
          rootPath = pluginEnpty.replace('plugin.json', '')
        }
      }
      if (!file) throw new Error('压缩包中未找到 plugin.json')
      const pluginJsonStr = await file.async('string')
      const meta = JSON.parse(pluginJsonStr)

      const scopeId = `data-v-${pluginId.replace(/[^a-zA-Z0-9]/g, '')}`
      const mainPath = rootPath + (meta.main || 'component.js')
      const componentCode = await zip.file(mainPath)?.async('string')
      if (!componentCode) throw new Error(`未找到入口文件: ${mainPath}`)

      const component = this.buildSafeComponent(componentCode, scopeId)

      if (meta.style) {
        const stylePath = rootPath + meta.style
        const rawCss = await zip.file(stylePath)?.async('string')
        if (rawCss) {
          const scopedCss = scopeCss(rawCss, scopeId)
          this.injectStyle(scopedCss, pluginId)
        }
        this.loadedPlugins.set(meta.id, { meta, component })
        console.log('✅ 安全沙箱插件 ${meta.name} 加载成功')
        return meta
      }
      this.loadedPlugins.set(meta.id, { meta, component })
      console.log(`✅ Vue 3 插件 ${meta.name} 加载成功`)
    } catch (error) {
      console.error(`❌ 插件加载失败:`, error)
      throw error
    }
  }
  buildSafeComponent(code: string, scopeId: string) {
    const cleanCode = code
      .replace(/export\s+default\s+/, '')
      .trim()
      .replace(/;\s*$/, '')

    const sandboxContext = {
      console: console,
    }
    const sandboxProxy = createSandbox(sandboxContext)

    try {
      const runInSandbox = new Function('sandbox', `with(sandbox){return (${cleanCode})}`)
      const componentOptions = runInSandbox(sandboxProxy)
      componentOptions.__scopeId = scopeId
      return defineComponent(componentOptions)
    } catch (error) {
      console.error('组件代码沙箱执行失败:', error)
      throw new Error('组件加载失败：代码执行异常')
    }
  }
  injectStyle(css: any, pluginId: any) {
    const styleId = `plugin-style-${pluginId}`
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = css
    style.setAttribute('data-sandbox', 'true')
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
