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
  esbuild: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: [
      'three/addons/loaders/GLTFLoader.js',
      'three/addons/loaders/KTX2Loader.js',
      'three/addons/loaders/RGBELoader.js',
      'three/addons/loaders/DRACOLoader.js',
      'three/addons/libs/meshopt_decoder.module.js',
      'three/addons/controls/OrbitControls.js',
      'three/addons/tsl/display/GTAONode.js',
      'three/addons/tsl/display/LensflareNode.js',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    ...(isLibraryBuild ? {} : { dedupe: ['three'] }),
    alias: isLibraryBuild
      ? {}
      : [
          { find: 'r3f-webgpu-perf', replacement: resolve(__dirname, 'src') },
          { find: 'three/webgpu', replacement: resolve(__dirname, 'node_modules/three/build/three.webgpu.js') },
          { find: 'three/tsl', replacement: resolve(__dirname, 'node_modules/three/build/three.tsl.js') },
          { find: /^three\/addons\/(.*)/, replacement: resolve(__dirname, 'node_modules/three/examples/jsm/$1') },
          { find: /^three$/, replacement: resolve(__dirname, 'node_modules/three/build/three.webgpu.js') },
        ],
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
        target: 'esnext',
      },
})
