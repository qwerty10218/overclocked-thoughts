import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/<overclocked-thoughts>/', // 例如 base: '/garys-lab/', 注意前後要有斜線
})