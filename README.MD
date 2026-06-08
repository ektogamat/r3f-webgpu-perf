# r3f-webgpu-perf

Easily monitor the performance of your [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) application — with first-class support for WebGPU renderers where `gl.info` may be unavailable.

Inspired by [r3f-perf](https://github.com/utsuboco/r3f-perf).

## Installation

```bash
npm i r3f-webgpu-perf
```

Peer dependencies (already present in most R3F projects):

- `react` >= 18
- `react-dom` >= 18
- `@react-three/fiber` >= 8
- `three` >= 0.150

## Usage

Add `<Perf />` anywhere inside your `<Canvas>`:

```jsx
import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-webgpu-perf'

function App() {
  return (
    <Canvas>
      <Perf position="top-left" />
      {/* your scene */}
    </Canvas>
  )
}
```

## Options

| Prop | Default | Description |
|------|---------|-------------|
| `position` | `'top-left'` | Panel position: `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `showGraph` | `true` | Show real-time FPS/GPU/CPU graph |
| `showGauge` | `true` | Show circular gauge (click to cycle FPS → GPU → CPU) |
| `minimal` | `false` | Condensed view with essential metrics only |
| `showVRAM` | `false` | Show estimated VRAM usage bar |
| `logsPerSecond` | `10` | How often scene stats refresh |
| `openByDefault` | `true` | Show panel on load (set `false` to start minimized as a dot) |
| `className` | — | Custom CSS class on the portal wrapper |
| `style` | — | Inline styles on the portal wrapper |

## Advanced: headless mode

Use `PerfHeadless` to collect metrics without the built-in UI, and read values with `usePerf`:

```jsx
import { Canvas } from '@react-three/fiber'
import { PerfHeadless, usePerf } from 'r3f-webgpu-perf'

function PerfLogger() {
  const fps = usePerf((s) => s.fps)
  console.log('FPS:', fps)
  return <PerfHeadless logsPerSecond={10} />
}

function App() {
  return (
    <Canvas>
      <PerfLogger />
    </Canvas>
  )
}
```

You can also build a custom UI with `PerfPanel` and wire it yourself outside the canvas if needed.

### API exports

```js
import {
  Perf,
  PerfHeadless,
  PerfPanel,
  usePerf,
  perfActions,
  getPerf,
  perfState,
} from 'r3f-webgpu-perf'
```

## WebGPU vs WebGL

| Metric | Source |
|--------|--------|
| FPS / frame time | Measured via `performance.now()` |
| GPU / CPU ms | **Estimated** (20% / 80% split of frame delta) |
| Draw calls, triangles, geometries, textures | `gl.info` when available (WebGL), otherwise manual scene traversal (WebGPU fallback) |
| VRAM | Estimated from geometry attributes and texture sizes |

Real WebGPU timestamp queries are not implemented yet — planned for a future release.

## Development

```bash
git clone https://github.com/ektogamat/r3f-webgpu-perf.git
cd r3f-webgpu-perf
npm install
npm run dev      # demo app with hot reload
npm run build    # build library to dist/
```

## Publishing (maintainers)

```bash
npm login
npm run build
npm pack                    # test locally first
npm publish --access public
```

Bump version with `npm version patch|minor|major` before publishing updates.

## License

MIT © [Anderson Mancini](https://github.com/ektogamat)
