import { build, defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir: "personal"
  },
  server: {
    watch: {
      usePolling: true,
    }
  }
})
