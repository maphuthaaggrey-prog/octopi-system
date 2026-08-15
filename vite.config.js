import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'


export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/octopi-system/' : '/',
  plugins: [react()],
}))