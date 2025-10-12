import { get, post } from '@/composable/use-request'

export const getOnePluginAsync = (params: { id: string }) => {
  return get('/rest/v1/plugin', params)
}

export const installPluginsAsync = (params: { pluginId: string }) => {
  return post('/rest/v1/plugin/install', params)
}

export const uploadPluginAsync = (parmas: FormData) => {
  return post('/rest/v1/plugin/upload', parmas)
}

export const loadingUniquePluginsAsync = (params?: {
  status: 'pending' | 'rejected' | 'published'
}) => {
  return get('/rest/v1/plugin', params)
}

export const approvePluginAsync = (parmas: { pluginId: string }) => {
  return post('/rest/v1/plugin/approve', parmas)
}

export const rejectPluginAsync = (params: { pluginId: string }) => {
  return post('/rest/v1/plugin/reject', params)
}

export const getInstalledPluginsAsync = () => {
  return get('/rest/v1/plugin/installed')
}
