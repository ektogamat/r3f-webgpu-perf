import { createContext, useCallback, useContext, useRef, useState } from 'react'
import * as THREE from 'three/webgpu'
import { QUALITY_PRESETS } from './constants'

const DemoSettingsContext = createContext(null)

export function DemoSettingsProvider({ children }) {
  const [quality, setQuality] = useState('ultra')
  const preset = QUALITY_PRESETS[quality]
  const focusPoint = useRef(new THREE.Vector3(0, 1.8, 0))
  const focusTarget = useRef(new THREE.Vector3(0, 1.8, 0))

  const setFocusTarget = useCallback((point) => {
    focusTarget.current.copy(point)
  }, [])

  return (
    <DemoSettingsContext.Provider
      value={{ quality, setQuality, preset, focusPoint, focusTarget, setFocusTarget }}
    >
      {children}
    </DemoSettingsContext.Provider>
  )
}

export function useDemoSettings() {
  const ctx = useContext(DemoSettingsContext)
  if (!ctx) throw new Error('useDemoSettings must be used within DemoSettingsProvider')
  return ctx
}
