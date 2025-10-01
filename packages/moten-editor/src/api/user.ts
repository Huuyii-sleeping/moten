import { get, post } from '../composable/use-request'

export const userLoginAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/login', params)
}

export const userRegisterAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/register', params)
}

export const submitPageAsync = (params: { name: string; content: string }) => {
  return post('/rest/v1/page/create', params)
}

export const getPageAsync = (params: { page: number; size: number } = { page: 1, size: 100 }) => {
  return get('/rest/v1/page', params)
}

export const deletePageAcync = (params: { id: string }) => {
  return post('/rest/v1/page/delete', params)
}
