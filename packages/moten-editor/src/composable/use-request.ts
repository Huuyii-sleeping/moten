import router from '@/router'
import axios, { type AxiosRequestConfig } from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8081',
  timeout: 30000,
})

// 添加请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers['Authorization'] =
      'Bearer ' +
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im15OHIxcDJueTYiLCJpYXQiOjE3NTkxMTcxMDEsImV4cCI6MTc1OTIwMzUwMX0.QDu3nLsrBIDf_TL02QQ08NYh5rvBtH5K9J0twL1C51A'
    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (response.data.code === 401) {
      router.replace('/login')
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
  const response = await axiosInstance.post(url, { ...config, params: data })
  return response.data
}
