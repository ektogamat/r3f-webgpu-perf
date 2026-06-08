import { useLayoutEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { HDR_URL } from './constants'

export function SceneEnvironment() {
  const texture = useLoader(RGBELoader, HDR_URL)
  const scene = useThree((s) => s.scene)

  useLayoutEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping

    const prevBackground = scene.background
    const prevEnvironment = scene.environment
    const prevIntensity = scene.environmentIntensity
    const prevBgIntensity = scene.backgroundIntensity

    scene.background = texture
    scene.environment = texture
    scene.environmentIntensity = 1.1
    scene.backgroundIntensity = 0.35

    return () => {
      scene.background = prevBackground
      scene.environment = prevEnvironment
      scene.environmentIntensity = prevIntensity
      scene.backgroundIntensity = prevBgIntensity
    }
  }, [scene, texture])

  return null
}
