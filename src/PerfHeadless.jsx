import { useRef, useEffect } from 'react'
import { useFrame, useThree, addEffect, addAfterEffect } from '@react-three/fiber'
import { perfActions, getPerf } from './usePerf'

function isWebGPURenderer(gl) {
  return gl.isWebGPURenderer === true
}

function readRendererStats(gl, webgpu) {
  const info = gl.info
  if (!info?.render) return null

  const render = info.render
  const memory = info.memory || {}

  if (webgpu) {
    return {
      drawCalls: render.drawCalls ?? render.frameCalls ?? 0,
      triangles: render.triangles ?? 0,
      lines: render.lines ?? 0,
      points: render.points ?? 0,
      geometries: memory.geometries ?? 0,
      textures: memory.textures ?? 0,
    }
  }

  return {
    drawCalls: render.calls ?? 0,
    triangles: render.triangles ?? 0,
    lines: render.lines ?? 0,
    points: render.points ?? 0,
    geometries: memory.geometries ?? 0,
    textures: memory.textures ?? 0,
  }
}

/**
 * Count triangles and scene stats by traversing all objects
 */
function countSceneStats(scene) {
  let triangles = 0
  let geometries = 0
  let drawCalls = 0
  let textures = 0
  let lines = 0
  let points = 0
  const geometrySet = new Set()
  const textureSet = new Set()

  scene.traverse((object) => {
    if (object.isMesh || object.isInstancedMesh) {
      drawCalls++

      if (object.geometry) {
        const geometryId = object.geometry.uuid

        // Count triangles in geometry
        let geomTriangles = 0
        if (object.geometry.index) {
          geomTriangles = object.geometry.index.count / 3
        } else if (object.geometry.attributes.position) {
          geomTriangles = object.geometry.attributes.position.count / 3
        }

        // For instanced meshes, multiply by instance count
        if (object.isInstancedMesh && object.count) {
          triangles += Math.floor(geomTriangles * object.count)
        } else {
          triangles += Math.floor(geomTriangles)
        }

        // Count unique geometries
        if (!geometrySet.has(geometryId)) {
          geometrySet.add(geometryId)
          geometries++
        }
      }
    }

    if (object.isLine) {
      lines++
      drawCalls++
    }

    if (object.isPoints) {
      points++
      drawCalls++
    }

    // Count textures from materials
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((mat) => {
        const texMaps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'envMap', 'aoMap', 'emissiveMap', 'lightMap']
        texMaps.forEach((mapName) => {
          if (mat[mapName] && !textureSet.has(mat[mapName].uuid)) {
            textureSet.add(mat[mapName].uuid)
          }
        })
      })
    }
  })

  return {
    triangles: Math.floor(triangles),
    geometries,
    drawCalls,
    textures: textureSet.size,
    lines,
    points,
  }
}

/**
 * Calculate approximate VRAM usage
 */
function calculateVRAMUsage(scene) {
  let vramBytes = 0
  const textureSet = new Set()

  scene.traverse((object) => {
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((mat) => {
        const texMaps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'envMap', 'aoMap', 'emissiveMap']
        texMaps.forEach((mapName) => {
          const texture = mat[mapName]
          if (texture && texture.image && !textureSet.has(texture.uuid)) {
            textureSet.add(texture.uuid)
            const width = texture.image.width || texture.image.videoWidth || 1
            const height = texture.image.height || texture.image.videoHeight || 1
            const bytesPerPixel = 4
            const mipmapMultiplier = texture.generateMipmaps ? 1.33 : 1.0
            vramBytes += width * height * bytesPerPixel * mipmapMultiplier
          }
        })
      })
    }

    if (object.geometry) {
      const geom = object.geometry
      if (geom.index) {
        const indexSize = (geom.index.array && geom.index.array.BYTES_PER_ELEMENT) || 2
        vramBytes += geom.index.count * indexSize
      }
      Object.values(geom.attributes).forEach((attr) => {
        if (attr && attr.array) {
          const bytesPerElement = attr.array.BYTES_PER_ELEMENT || 4
          vramBytes += attr.count * attr.itemSize * bytesPerElement
        }
      })
    }
  })

  return vramBytes
}

/**
 * Headless performance data collector
 * This component runs inside the R3F canvas and collects metrics every frame
 */
export function PerfHeadless({ logsPerSecond = 10 }) {
  const { gl, scene } = useThree()
  
  const frameTimeRef = useRef([])
  const lastTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)
  const updateIntervalRef = useRef(0)
  const renderStatsRef = useRef(null)
  const isWebGPURef = useRef(isWebGPURenderer(gl))

  useEffect(() => {
    isWebGPURef.current = isWebGPURenderer(gl)
  }, [gl])

  // WebGL: reset info before each frame so reads reflect a single frame
  useEffect(() => {
    if (isWebGPURenderer(gl)) return undefined

    if (gl.info) {
      gl.info.autoReset = false
    }

    const unsub = addEffect(() => {
      if (gl.info?.reset) gl.info.reset()
    })

    return () => {
      unsub()
      if (gl.info) {
        gl.info.autoReset = true
      }
    }
  }, [gl])

  // Read renderer stats after each frame
  useEffect(() => {
    const unsub = addAfterEffect(() => {
      renderStatsRef.current = readRendererStats(gl, isWebGPURef.current)
    })

    return () => {
      unsub()
    }
  }, [gl])
  
  // Calculate update interval based on logsPerSecond
  useEffect(() => {
    updateIntervalRef.current = Math.floor(60 / logsPerSecond)
  }, [logsPerSecond])

  useFrame(() => {
    const perf = getPerf()
    if (perf.paused) return

    const currentTime = performance.now()
    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime
    frameCountRef.current++

    // Store frame times for averaging
    frameTimeRef.current.push(deltaTime)
    if (frameTimeRef.current.length > 60) {
      frameTimeRef.current.shift()
    }

    const avgFrameTime = frameTimeRef.current.reduce((a, b) => a + b, 0) / frameTimeRef.current.length
    const fps = Math.round(1000 / avgFrameTime)

    // Update history every frame for smooth graphs
    const gpuTime = deltaTime * 0.2 // Approximate GPU time as 20% of frame
    const cpuTime = deltaTime * 0.8 // Approximate CPU time as 80% of frame
    perfActions.pushToHistory(fps, gpuTime, cpuTime)

    // Update full stats less frequently
    const updateInterval = updateIntervalRef.current || 6
    if (frameCountRef.current % updateInterval === 0) {
      let stats = {
        fps,
        frameTime: Math.round(avgFrameTime * 100) / 100,
        gpuTime: Math.round(gpuTime * 1000) / 1000,
        cpuTime: Math.round(cpuTime * 1000) / 1000,
        drawCalls: 0,
        triangles: 0,
        geometries: 0,
        textures: 0,
        shaders: 0,
        lines: 0,
        points: 0,
        vramBytes: 0,
      }

      const webgpu = isWebGPURef.current
      const fromRenderer = renderStatsRef.current

      if (webgpu) {
        if (fromRenderer && fromRenderer.drawCalls > 0) {
          stats.drawCalls = fromRenderer.drawCalls
          stats.triangles = fromRenderer.triangles
          stats.geometries = fromRenderer.geometries
          stats.textures = fromRenderer.textures
          stats.lines = fromRenderer.lines
          stats.points = fromRenderer.points
        } else {
          const sceneStats = countSceneStats(scene)
          stats.triangles = sceneStats.triangles
          stats.geometries = sceneStats.geometries
          stats.drawCalls = sceneStats.drawCalls
          stats.textures = sceneStats.textures
          stats.lines = sceneStats.lines
          stats.points = sceneStats.points
        }
      } else if (fromRenderer) {
        stats.drawCalls = fromRenderer.drawCalls
        stats.triangles = fromRenderer.triangles
        stats.geometries = fromRenderer.geometries
        stats.textures = fromRenderer.textures
        stats.lines = fromRenderer.lines
        stats.points = fromRenderer.points
      }

      stats.vramBytes = calculateVRAMUsage(scene)
      
      // Check for overclock
      perf.overclocking = fps > perf.fpsLimit

      perfActions.updateMetrics(stats)
    }
  })

  return null
}
