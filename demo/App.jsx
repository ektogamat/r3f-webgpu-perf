import { Canvas } from '@react-three/fiber'
import { Perf } from 'r3f-webgpu-perf'

function SpinningCubes() {
  const cubes = []
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      cubes.push(
        <mesh key={`${x}-${z}`} position={[x * 1.5, 0, z * 1.5]} rotation={[x, z, 0]}>
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshStandardMaterial color={`hsl(${(x + 2) * 40 + (z + 2) * 20}, 70%, 55%)`} />
        </mesh>
      )
    }
  }
  return <>{cubes}</>
}

export function App() {
  return (
    <Canvas camera={{ position: [0, 4, 8], fov: 50 }}>
      <color attach="background" args={['#0a0a0f']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <SpinningCubes />
      <Perf position="top-left" showVRAM />
    </Canvas>
  )
}
