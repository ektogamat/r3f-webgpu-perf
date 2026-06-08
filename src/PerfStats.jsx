import { usePerf } from './usePerf'

/**
 * Format bytes to human-readable string (MB/GB)
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toLocaleString()
}

/**
 * Detailed stats grid showing draw calls, triangles, geometries, etc.
 */
export function PerfStats() {
  const drawCalls = usePerf(s => s.drawCalls)
  const triangles = usePerf(s => s.triangles)
  const geometries = usePerf(s => s.geometries)
  const textures = usePerf(s => s.textures)
  const lines = usePerf(s => s.lines)
  const points = usePerf(s => s.points)

  const stats = [
    { label: 'Draw Calls', value: formatNumber(drawCalls) },
    { label: 'Triangles', value: formatNumber(triangles) },
    { label: 'Geometries', value: formatNumber(geometries) },
    { label: 'Textures', value: formatNumber(textures) },
    { label: 'Lines', value: formatNumber(lines) },
    { label: 'Points', value: formatNumber(points) },
  ]

  return (
    <div className="perf-stats">
      {stats.map(({ label, value }) => (
        <div key={label} className="perf-stat">
          <div className="perf-stat-content">
            <span className="perf-stat-value">{value}</span>
            <span className="perf-stat-label">{label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * VRAM usage bar
 */
export function PerfVRAM() {
  const vramBytes = usePerf(s => s.vramBytes)
  const maxVRAM = 2 * 1024 * 1024 * 1024 // 2GB as reference for bar fill
  const percent = Math.min(100, (vramBytes / maxVRAM) * 100)

  return (
    <div className="perf-vram">
      <div className="perf-vram-header">
        <span className="perf-vram-label">VRAM</span>
        <span className="perf-vram-value">{formatBytes(vramBytes)}</span>
      </div>
      <div className="perf-vram-bar">
        <div
          className="perf-vram-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
