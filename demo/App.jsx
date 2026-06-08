import { useEffect, useState } from 'react'
import WebGPU from 'three/addons/capabilities/WebGPU.js'
import { Perf } from 'r3f-webgpu-perf'
import { DemoSettingsProvider } from './DemoSettings'
import { WebGPUCanvas } from './WebGPUCanvas'
import { Scene } from './Scene'
import { DemoControls } from './DemoControls'
import { DemoOverlay } from './DemoOverlay'

function Unsupported() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050508',
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div>
        <h2 style={{ color: '#00ffd0', marginBottom: 8 }}>WebGPU required</h2>
        <p style={{ maxWidth: 420, lineHeight: 1.5 }}>
          This demo uses WebGPU with TSL post-processing. Try Chrome or Edge with WebGPU enabled.
        </p>
      </div>
    </div>
  )
}

export function App() {
  const [supported, setSupported] = useState(null)

  useEffect(() => {
    setSupported(WebGPU.isAvailable())
  }, [])

  if (supported === null) return null
  if (!supported) return <Unsupported />

  return (
    <DemoSettingsProvider>
      <WebGPUCanvas>
        <Scene />
        <Perf position="top-left" showVRAM />
      </WebGPUCanvas>
      <DemoOverlay />
      <DemoControls />
    </DemoSettingsProvider>
  )
}
