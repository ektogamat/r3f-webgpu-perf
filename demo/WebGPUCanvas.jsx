import * as THREE from 'three/webgpu'
import { Canvas, extend } from '@react-three/fiber'

extend(THREE)

export function WebGPUCanvas({ children }) {
  return (
    <Canvas
      camera={{ position: [-20, 3.5, -19], fov: 50, near: 0.1, far: 200 }}
      gl={async (props) => {
        const renderer = new THREE.WebGPURenderer({
          ...props,
          antialias: true,
          powerPreference: 'high-performance',
        })
        await renderer.init()
        renderer.__r3fNativeRender = renderer.render.bind(renderer)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.0
        return renderer
      }}
      style={{ width: '100%', height: '100%' }}
    >
      {children}
    </Canvas>
  )
}
