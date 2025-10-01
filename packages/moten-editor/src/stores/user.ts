import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { setToken as setLocalStore } from '@/utils/store'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const role = ref(10)
  const list = ref([])

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
  return {
    token,
    role,
    isAdminRole,
    list,
    setList,
    setToken,
    setRole,
  }
})
