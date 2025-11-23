import axios from 'axios'
import { get, post } from '../composable/use-request'
const baseURL = import.meta.env.VITE_BASE_URL
export const userLoginAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/login', params)
}

export const userRegisterAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/register', params)
}

// 注意：这里通常是建议使用原生的axios或者新创建一个实例，防止被request.ts里面的拦截器死循环拦截
export const refreshTokenAsync = (refreshToken: string) => {
  return axios.post(`${baseURL}/rest/v1/user/refresh`, { refreshToken })
}
