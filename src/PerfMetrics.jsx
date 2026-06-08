import { usePerf } from './usePerf'

/**
 * Header metrics display showing GPU, CPU, and FPS values
 */
export function PerfMetrics({ showFps = true }) {
  const fps = usePerf(s => s.fps)
  const gpuTime = usePerf(s => s.gpuTime)
  const cpuTime = usePerf(s => s.cpuTime)
  const frameTime = usePerf(s => s.frameTime)
  const overclocking = usePerf(s => s.overclocking)

  // Determine if FPS is low (warning)
  const isLowFps = fps < 30

  return (
    <div className="perf-header">
      {/* GPU Time */}
      <div className="perf-metric">
        <span className="perf-metric-value gpu">
          {gpuTime.toFixed(2)}
          <span className="perf-metric-unit">ms</span>
        </span>
        <span className="perf-metric-label">GPU</span>
      </div>

      {/* CPU Time */}
      <div className="perf-metric">
        <span className="perf-metric-value cpu">
          {cpuTime.toFixed(2)}
          <span className="perf-metric-unit">ms</span>
        </span>
        <span className="perf-metric-label">CPU</span>
      </div>

      {/* FPS - only show if showFps is true (hidden when gauge is showing) */}
      {showFps && (
        <div className="perf-metric">
          <span className={`perf-metric-value fps ${overclocking ? 'overclock' : ''} ${isLowFps ? 'warning' : ''}`}>
            {fps}
            {overclocking && ' 🚀'}
          </span>
          <span className="perf-metric-label">FPS</span>
        </div>
      )}

      {/* Frame Time */}
      <div className="perf-metric" style={{ opacity: 0.7 }}>
        <span className="perf-metric-value" style={{ fontSize: 14, color: 'var(--perf-text-dim)' }}>
          {frameTime.toFixed(1)}
          <span className="perf-metric-unit">ms</span>
        </span>
        <span className="perf-metric-label">Frame</span>
      </div>
    </div>
  )
}
