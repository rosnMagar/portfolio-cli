import { build, defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir: "github-host"
  },
  server: {
    watch: {
      usePolling: true,
    }
  }
})
