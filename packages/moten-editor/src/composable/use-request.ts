import router from '@/router'
import axios, { type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8081',
  timeout: 30000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    if (userStore.token) config.headers['Authorization'] = userStore.token
    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data.code === 401) {
      userStore.setToken('')
      router.replace('/login')
    }
    if (response.data.code === 200) {
      response.data['status'] = true
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export async function get(url: string, data?: any, config?: AxiosRequestConfig) {
  const response = await axiosInstance.get(url, { ...config, params: data })
  return response.data
}

export async function post(url: string, data?: any, config?: AxiosRequestConfig) {
  const response = await axiosInstance.post(url, data, config)
  return response.data
}
