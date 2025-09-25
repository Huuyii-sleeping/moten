import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useEditStore = defineStore('edit', () => {
    const count = ref(0)
    const doubleCount = computed(() => {
        return count.value * 2
    })
    
    return {
        count,
        doubleCount,
    }
})