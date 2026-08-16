import { defineConfig } from 'vite'

export default defineConfig({
  // Treat .js files as JSX too
  esbuild: {
    include: /\.(js|jsx|ts|tsx)$/,
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
