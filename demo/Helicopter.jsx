import { forwardRef, useEffect, useLayoutEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { BASIS_TRANSCODER_PATH, MODEL_URL } from './constants'

const DRACO_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

let sharedKTX2Loader = null
let sharedDracoLoader = null
let sharedGLTFLoader = null
let readyRenderer = null

function getKTX2Loader(renderer) {
  if (!sharedKTX2Loader) {
    sharedKTX2Loader = new KTX2Loader().setTranscoderPath(BASIS_TRANSCODER_PATH)
  }

  if (renderer && readyRenderer !== renderer) {
    sharedKTX2Loader.detectSupport(renderer)
    readyRenderer = renderer
  }

  return sharedKTX2Loader
}

function getDracoLoader() {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader().setDecoderPath(DRACO_PATH)
  }
  return sharedDracoLoader
}

function getGLTFLoader(renderer) {
  const ktx2Loader = getKTX2Loader(renderer)

  if (!sharedGLTFLoader) {
    sharedGLTFLoader = new GLTFLoader()
    sharedGLTFLoader.setKTX2Loader(ktx2Loader)
    sharedGLTFLoader.setDRACOLoader(getDracoLoader())
    sharedGLTFLoader.setMeshoptDecoder(MeshoptDecoder)
  } else {
    sharedGLTFLoader.setKTX2Loader(ktx2Loader)
  }

  return sharedGLTFLoader
}

function centerOnGround(object) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  object.position.y -= box.min.y
}

export const Helicopter = forwardRef(function Helicopter({ rotation, scale = 1, ...props }, ref) {
  const gl = useThree((s) => s.gl)
  const [model, setModel] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loader = getGLTFLoader(gl)

    loader.loadAsync(MODEL_URL).then((gltf) => {
      if (cancelled) return
      const scene = gltf.scene
      centerOnGround(scene)
      setModel(scene)
    })

    return () => {
      cancelled = true
    }
  }, [gl])

  useLayoutEffect(() => {
    if (!model) return
    centerOnGround(model)
  }, [model])

  if (!model) return null

  return (
    <group ref={ref} rotation={rotation} scale={scale} {...props}>
      <primitive object={model} />
    </group>
  )
})
