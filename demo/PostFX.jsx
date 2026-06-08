import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three/webgpu'
import { float, mix, mrt, normalView, output, pass, smoothstep, uniform, vec2, vec3, vec4 } from 'three/tsl'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { boxBlur } from 'three/addons/tsl/display/boxBlur.js'
import { ao } from 'three/addons/tsl/display/GTAONode.js'
import { lensflare } from 'three/addons/tsl/display/LensflareNode.js'
import { edgeChromaticAberration } from './EdgeChromaticAberrationNode.js'
import { useDemoSettings } from './DemoSettings'

function buildOutputNode(scenePass, preset, camera, focusPointView, dofUniforms) {
  const sceneColor = scenePass.getTextureNode('output')
  let color = sceneColor

  if (preset.gtao) {
    const depth = scenePass.getTextureNode('depth')
    const normal = scenePass.getTextureNode('normal')
    const aoPass = ao(depth, normal, camera)
    aoPass.resolutionScale = preset.gtaoResolutionScale ?? 0.5
    aoPass.radius = 0.85
    const aoMap = aoPass.getTextureNode()
    color = sceneColor.mul(vec4(vec3(aoMap.r), float(1)))
  }

  let bloomPass = null
  if (preset.bloom) {
    bloomPass = bloom(
      color,
      preset.bloomStrength,
      preset.bloomRadius,
      preset.bloomThreshold
    )
    color = color.add(bloomPass)
  }

  if (preset.lensflare && bloomPass) {
    const flare = lensflare(bloomPass, {
      ghostTint: vec3(1, 0.92, 0.78),
      threshold: preset.lensflareThreshold ?? 0.35,
    })
    color = color.add(flare)
  }

  if (preset.dof) {
    const viewZ = scenePass.getViewZNode()
    const blurred = boxBlur(color, {
      size: dofUniforms.blurSize,
      separation: dofUniforms.blurSpread,
    })
    const blurFactor = smoothstep(
      dofUniforms.minDistance,
      dofUniforms.maxDistance,
      viewZ.sub(focusPointView.z).abs()
    )
    color = mix(color, blurred, blurFactor)
  }

  if (preset.chromaticAberration) {
    color = edgeChromaticAberration(
      color,
      preset.caStrength ?? 1.2,
      vec2(0.5, 0.5),
      preset.caScale ?? 1.15,
      preset.caEdgeInner ?? 0.52,
      preset.caEdgeOuter ?? 0.92
    )
  }

  return color
}

export function PostFX() {
  const { gl, scene, camera } = useThree()
  const { preset, focusPoint, focusTarget } = useDemoSettings()
  const pipelineRef = useRef(null)
  const scenePassRef = useRef(null)
  const readyRef = useRef(false)
  const insidePipelineRef = useRef(false)
  const focusPointView = useRef(uniform(vec3())).current
  const dofUniforms = useRef({
    minDistance: uniform(1),
    maxDistance: uniform(3),
    blurSize: uniform(2),
    blurSpread: uniform(4),
  }).current

  useLayoutEffect(() => {
    const scenePass = pass(scene, camera)

    if (preset.gtao) {
      scenePass.setMRT(mrt({ output, normal: normalView }))
    }

    const sceneColor = scenePass.getTextureNode('output')
    const pipeline = new THREE.RenderPipeline(gl, sceneColor)

    scenePassRef.current = scenePass
    pipelineRef.current = pipeline

    const originalRender = gl.__r3fNativeRender || gl.render.bind(gl)
    gl.__r3fNativeRender = originalRender

    gl.render = (object, renderCamera, ...rest) => {
      if (object?.isScene && !insidePipelineRef.current) return
      return originalRender(object, renderCamera, ...rest)
    }

    return () => {
      gl.render = originalRender
      pipeline.dispose()
      pipelineRef.current = null
      scenePassRef.current = null
      readyRef.current = false
      insidePipelineRef.current = false
    }
  }, [gl, scene, camera])

  useLayoutEffect(() => {
    const pipeline = pipelineRef.current
    const scenePass = scenePassRef.current
    if (!pipeline || !scenePass) return

    dofUniforms.minDistance.value = preset.dofMinDistance
    dofUniforms.maxDistance.value = preset.dofMaxDistance
    dofUniforms.blurSize.value = preset.dofBlurSize
    dofUniforms.blurSpread.value = preset.dofBlurSpread

    readyRef.current = false
    pipeline.outputNode = buildOutputNode(scenePass, preset, camera, focusPointView, dofUniforms)
    pipeline.outputColorTransform = true
    pipeline.needsUpdate = true

    let cancelled = false

    scenePass.compileAsync(gl).then(() => {
      if (!cancelled) readyRef.current = true
    })

    return () => {
      cancelled = true
      readyRef.current = false
    }
  }, [preset, gl, camera, focusPointView, dofUniforms])

  useFrame(() => {
    if (preset.dof) {
      focusPoint.current.lerp(focusTarget.current, 0.2)
      camera.updateMatrixWorld()
      focusPointView.value.copy(focusPoint.current).applyMatrix4(camera.matrixWorldInverse)
    }

    if (!readyRef.current) return

    const pipeline = pipelineRef.current
    if (!pipeline) return

    insidePipelineRef.current = true
    try {
      pipeline.render()
    } finally {
      insidePipelineRef.current = false
    }
  }, 1)

  return null
}
