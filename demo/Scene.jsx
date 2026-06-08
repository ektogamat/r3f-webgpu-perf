import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Helicopter } from './Helicopter'
import { SceneEnvironment } from './SceneEnvironment'
import { PostFX } from './PostFX'
import { useDemoSettings } from './DemoSettings'

function CameraControls() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl])

  useLayoutEffect(() => {
    controls.target.set(0, 3, -1)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 15
    controls.enablePan = false
    controls.maxDistance = 28
    controls.minPolarAngle = 0.15
    controls.maxPolarAngle = Math.PI * 0.69
    controls.update()

    return () => controls.dispose()
  }, [controls])

  useFrame(() => {
    controls.update()
  }, -1)

  return null
}

function CursorFocus({ targetRef }) {
  const { preset, setFocusTarget } = useDemoSettings()
  const { camera, gl } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const pointerNdc = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!preset.dof) return

    const onPointerMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect()
      pointerNdc.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointerNdc.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    gl.domElement.addEventListener('pointermove', onPointerMove)
    return () => gl.domElement.removeEventListener('pointermove', onPointerMove)
  }, [preset.dof, gl])

  useFrame(() => {
    if (!preset.dof) return

    const target = targetRef.current
    if (!target) return

    pointer.set(pointerNdc.current.x, pointerNdc.current.y)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObject(target, true)
    if (hits.length > 0) setFocusTarget(hits[0].point)
  })

  return null
}

export function Scene() {
  const { preset } = useDemoSettings()
  const usePostFX =
    preset.bloom || preset.dof || preset.gtao || preset.lensflare || preset.chromaticAberration
  const helicopterRef = useRef()

  return (
    <>
      <Suspense fallback={null}>
        <SceneEnvironment />
        <Helicopter ref={helicopterRef} rotation={[0, Math.PI * 0.15, 0]} />
      </Suspense>

      <ambientLight intensity={0.25} />
      <directionalLight position={[12, 18, 8]} intensity={2.2} />
      <directionalLight position={[-8, 6, -6]} intensity={0.6} color="#c8d8ff" />

      <CameraControls />
      <CursorFocus targetRef={helicopterRef} />
      {usePostFX ? <PostFX key={preset.gtao ? 'gtao' : 'standard'} /> : null}
    </>
  )
}
