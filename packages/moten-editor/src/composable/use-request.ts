import axios, { type AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'
const baseURL = import.meta.env.VITE_BASE_URL
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
})

let isRefreshing = false
let requestQueue: Array<(token: string) => void> = []

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }
    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  async (response) => {
    if (response.data.code === 401) {
      const userStore = useUserStore()
      const config = response.config

      if (!isRefreshing) {
        isRefreshing = true
        try {
          if (!userStore.refreshToken) throw new Error('No refresh token')
          const res = await axios.post(`${baseURL}/rest/v1/user/refresh`, {
            refreshToken: userStore.refreshToken,
          })
          if (res.data.code === 200) {
            const newToken = res.data.data.token
            userStore.setToken(newToken)
            requestQueue.forEach((cb) => cb(newToken))
            requestQueue = []
            config.headers['Authorization'] = `Bearer ${newToken}`
            return axiosInstance(config)
          } else {
            throw new Error('Refresh failed')
          }
        } catch (e) {
          requestQueue = []
          userStore.setToken('')
          userStore.setRefreshToken('')
          router.replace('/login')
          return Promise.reject(response)
        } finally {
          isRefreshing = false
        }
      } else {
        return new Promise((resolve) => {
          requestQueue.push((token) => {
            config.headers['Authorization'] = `Bearer ${token}`
            resolve(axiosInstance(config))
          })
        })
      }
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
