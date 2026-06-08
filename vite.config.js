import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from 'path'

const isLibraryBuild = process.env.BUILD_LIB === 'true'

export default defineConfig({
  plugins: [
    react(),
    ...(isLibraryBuild ? [cssInjectedByJsPlugin()] : []),
  ],
  root: isLibraryBuild ? undefined : 'demo',
  resolve: {
    alias: isLibraryBuild
      ? {}
      : {
          'r3f-webgpu-perf': resolve(__dirname, 'src'),
        },
  },
  build: isLibraryBuild
    ? {
        lib: {
          entry: resolve(__dirname, 'src/index.jsx'),
          name: 'R3fWebgpuPerf',
          formats: ['es', 'cjs'],
          fileName: (format) => (format === 'es' ? 'index.mjs' : 'index.js'),
        },
        rollupOptions: {
          external: [
            'react',
            'react-dom',
            'react-dom/client',
            'react/jsx-runtime',
            '@react-three/fiber',
            'three',
            'valtio',
          ],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react-dom/client': 'ReactDOM',
              '@react-three/fiber': 'ReactThreeFiber',
              three: 'THREE',
              valtio: 'Valtio',
            },
          },
        },
        outDir: 'dist',
        emptyOutDir: true,
        cssCodeSplit: false,
      }
    : {
        outDir: resolve(__dirname, 'demo-dist'),
        emptyOutDir: true,
      },
})
