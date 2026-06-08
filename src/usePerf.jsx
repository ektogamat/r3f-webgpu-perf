import { proxy, useSnapshot } from 'valtio'

// Performance data store using Valtio
export const perfState = proxy({
  // Current metrics
  fps: 0,
  frameTime: 0,
  gpuTime: 0,
  cpuTime: 0,
  
  // Scene stats
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  shaders: 0,
  lines: 0,
  points: 0,
  vramBytes: 0,
  
  // Graph history (circular buffer of 120 samples)
  history: {
    fps: new Array(120).fill(0),
    gpu: new Array(120).fill(0),
    cpu: new Array(120).fill(0),
    circularId: 0,
  },
  
  // UI state
  paused: false,
  expanded: false,
  hidden: true, // when true, panel is minimized to a small dot (starts hidden)
  tab: 'main',
  gaugeMode: 'fps', // 'fps', 'gpu', 'cpu'
  lightMode: false, // light/dark theme
  
  // Settings
  fpsLimit: 60,
  overclocking: false,
})

// Actions to update state
export const perfActions = {
  updateMetrics(metrics) {
    Object.assign(perfState, metrics)
  },
  
  pushToHistory(fps, gpu, cpu) {
    const id = perfState.history.circularId
    perfState.history.fps[id] = fps
    perfState.history.gpu[id] = gpu
    perfState.history.cpu[id] = cpu
    perfState.history.circularId = (id + 1) % 120
  },
  
  togglePaused() {
    perfState.paused = !perfState.paused
  },
  
  toggleExpanded() {
    perfState.expanded = !perfState.expanded
  },
  
  toggleHidden() {
    perfState.hidden = !perfState.hidden
  },

  setHidden(hidden) {
    perfState.hidden = hidden
  },
  
  setTab(tab) {
    perfState.tab = tab
  },
  
  cycleGaugeMode() {
    const modes = ['fps', 'gpu', 'cpu']
    const currentIndex = modes.indexOf(perfState.gaugeMode)
    perfState.gaugeMode = modes[(currentIndex + 1) % modes.length]
  },
  
  toggleLightMode() {
    perfState.lightMode = !perfState.lightMode
  },
}

// Hook for reactive access
export function usePerf(selector) {
  const snapshot = useSnapshot(perfState)
  if (selector) {
    return selector(snapshot)
  }
  return snapshot
}

// Direct access for non-reactive reads in render loops
export function getPerf() {
  return perfState
}
