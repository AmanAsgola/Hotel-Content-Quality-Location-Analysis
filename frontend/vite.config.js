import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const frontendDir = import.meta.dirname
const repository = process.env.GITHUB_REPOSITORY
const pagesBase = repository ? `/${repository.split('/')[1]}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase,
  plugins: [react()],
  resolve: {
    alias: {
      react: resolve(frontendDir, 'node_modules/react'),
      'react-dom': resolve(frontendDir, 'node_modules/react-dom'),
      recharts: resolve(frontendDir, 'node_modules/recharts'),
    },
  },
})
