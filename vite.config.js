import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 之前说的相对路径，打包用
  server: {
    host: '0.0.0.0', // 允许局域网访问
    port: 3000,      // <--- 在这里改成你想要的端口号，比如 3000
    strictPort: false, // 如果 3000 被占用了，设为 true 会报错退出，设为 false (默认) 会自动试 3001
  },
  // 2. 新增 alias 配置
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})