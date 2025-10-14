import { get, post } from '@/composable/use-request'

export const submitPageAsync = (params: {
  name: string
  content: string
  description: string
  coverImage: string
}) => {
  return post('/rest/v1/page/create', params)
}

export const editPageAsync = (params: {
  id: number
  name: string
  content: string
  description: string
  coverImage: string
}) => {
  return post('/rest/v1/page/update', params)
}

export const getPageAsync = (params: { page: number; size: number } = { page: 1, size: 100 }) => {
  return get('/rest/v1/page', params)
}

export const deletePageAcync = (params: { id: string }) => {
  return post('/rest/v1/page/delete', params)
}

export const uploadPageAsync = (params: any) => {
  return post('/rest/v1/media/upload', params)
}
