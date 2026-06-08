import { copyFileSync, mkdirSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dist = resolve(root, 'dist')

mkdirSync(dist, { recursive: true })
copyFileSync(resolve(root, 'src/index.d.ts'), resolve(dist, 'index.d.ts'))

console.log('Copied src/index.d.ts → dist/index.d.ts')
