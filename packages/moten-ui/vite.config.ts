import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'moten',
      fileName: 'moten'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        }
      }
    }
  }
})
