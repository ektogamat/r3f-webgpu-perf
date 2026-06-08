import type { CSSProperties, ReactNode } from 'react'

export type PerfPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface PerfProps {
  position?: PerfPosition
  showGraph?: boolean
  showGauge?: boolean
  minimal?: boolean
  showVRAM?: boolean
  logsPerSecond?: number
  openByDefault?: boolean
  className?: string
  style?: CSSProperties
}

export interface PerfPanelProps {
  position?: PerfPosition
  showGraph?: boolean
  showGauge?: boolean
  minimal?: boolean
  showVRAM?: boolean
}

export interface PerfHeadlessProps {
  logsPerSecond?: number
}

export interface PerfState {
  fps: number
  frameTime: number
  gpuTime: number
  cpuTime: number
  drawCalls: number
  triangles: number
  geometries: number
  textures: number
  shaders: number
  lines: number
  points: number
  vramBytes: number
  history: {
    fps: number[]
    gpu: number[]
    cpu: number[]
    circularId: number
  }
  paused: boolean
  expanded: boolean
  hidden: boolean
  tab: string
  gaugeMode: 'fps' | 'gpu' | 'cpu'
  lightMode: boolean
  fpsLimit: number
  overclocking: boolean
}

export interface PerfActions {
  updateMetrics: (metrics: Partial<PerfState>) => void
  pushToHistory: (fps: number, gpu: number, cpu: number) => void
  togglePaused: () => void
  toggleExpanded: () => void
  toggleHidden: () => void
  setHidden: (hidden: boolean) => void
  setTab: (tab: string) => void
  cycleGaugeMode: () => void
  toggleLightMode: () => void
}

export function Perf(props: PerfProps): ReactNode
export function PerfHeadless(props: PerfHeadlessProps): null
export function PerfPanel(props: PerfPanelProps): ReactNode

export function usePerf(): PerfState
export function usePerf<T>(selector: (state: PerfState) => T): T

export const perfState: PerfState
export const perfActions: PerfActions
export function getPerf(): PerfState
