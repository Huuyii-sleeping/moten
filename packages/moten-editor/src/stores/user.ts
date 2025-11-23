import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  setToken as setLocalStore,
  setRefreshToken as setLocalRefreshToken,
  getToken,
  getRefreshToken,
} from '@/utils/store'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken() || '')
  const role = ref(10)
  const list = ref([])
  const refreshToken = ref(getRefreshToken() || '')

  const isAdminRole = computed(() => role.value === 20)

  const setToken = (value: string) => {
    setLocalStore(value)
    token.value = value
  }
  const setRole = (value: number) => {
    role.value = value
  }
  const setList = (value: any) => {
    list.value = value
  }
  const setRefreshToken = (value: string) => {
    setLocalRefreshToken(value)
    refreshToken.value = value
  }
  return {
    token,
    role,
    isAdminRole,
    list,
    refreshToken,
    setRefreshToken,
    setList,
    setToken,
    setRole,
  }
})
