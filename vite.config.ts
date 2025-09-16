import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite';





// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(),],
  server: {
    proxy: {
      '/offer': {
        target: 'http://115.190.2.171:8010', // 代理目标
        changeOrigin: true, // 适用于虚拟托管的站点
        secure: true, // 如果目标是HTTPS，设置为true
      },
      '/human': {
        target: 'http://115.190.2.171:8010', // 代理目标
        changeOrigin: true, // 适用于虚拟托管的站点
        secure: true, // 如果目标是HTTPS，设置为true
      },
      '/interrupt_talk': {
        target: 'http://115.190.2.171:8010', // 代理目标
        changeOrigin: true, // 适用于虚拟托管的站点
        secure: true, // 如果目标是HTTPS，设置为true
      },
      '/is_speaking': {
        target: 'http://115.190.2.171:8010', // 代理目标
        changeOrigin: true, // 适用于虚拟托管的站点
        secure: true, // 如果目标是HTTPS，设置为true
      },

    }
  }
});
