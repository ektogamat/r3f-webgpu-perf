import { PerfMetrics } from './PerfMetrics'
import { PerfGraph } from './PerfGraph'
import { PerfStats, PerfVRAM } from './PerfStats'
import { PerfGauge } from './PerfGauge'
import { usePerf, perfActions } from './usePerf'

/**
 * Graph legend component
 */
function GraphLegend() {
  return (
    <div className="perf-graph-legend">
      <div className="perf-legend-item">
        <span className="perf-legend-dot fps" />
        <span>FPS</span>
      </div>
      <div className="perf-legend-item">
        <span className="perf-legend-dot gpu" />
        <span>GPU</span>
      </div>
      <div className="perf-legend-item">
        <span className="perf-legend-dot cpu" />
        <span>CPU</span>
      </div>
    </div>
  )
}

/**
 * Sun icon for light mode
 */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  )
}

/**
 * Moon icon for dark mode
 */
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

/**
 * Expand/collapse button (icon only)
 */
function ExpandButton({ onClick, expanded }) {
  return (
    <button 
      className="perf-expand-btn perf-icon-btn"
      onClick={onClick}
      title={expanded ? 'Collapse stats' : 'Expand stats'}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
        {expanded ? (
          <path d="M18 15l-6-6-6 6"/>
        ) : (
          <path d="M6 9l6 6 6-6"/>
        )}
      </svg>
    </button>
  )
}

/**
 * Hide button - minimizes panel to a small dot
 */
function HideButton({ onClick }) {
  return (
    <button 
      className="perf-hide-btn perf-icon-btn"
      onClick={onClick}
      title="Hide panel"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    </button>
  )
}

/**
 * Theme toggle button
 */
function ThemeButton({ lightMode, onClick }) {
  return (
    <button 
      className="perf-theme-btn"
      onClick={onClick}
      title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {lightMode ? <MoonIcon /> : <SunIcon />}
    </button>
  )
}

/**
 * Hidden state: small dot to restore panel
 */
function PerfPanelHidden({ position, onClick }) {
  return (
    <button
      className={`perf-panel-dot ${position}`}
      onClick={onClick}
      title="Show performance panel"
      aria-label="Show performance panel"
      style={{ pointerEvents: 'auto' }}
    />
  )
}

/**
 * Visual interface for the performance panel
 */
export function PerfPanel({ 
  position = 'top-left', 
  showGraph = true,
  showGauge = true,
  minimal = false,
  showVRAM = false,
}) {
  const expanded = usePerf(s => s.expanded)
  const hidden = usePerf(s => s.hidden)
  const lightMode = usePerf(s => s.lightMode)
  
  const handleToggle = () => {
    perfActions.toggleExpanded()
  }
  
  const handleThemeToggle = () => {
    perfActions.toggleLightMode()
  }

  const handleHide = () => {
    perfActions.toggleHidden()
  }

  // When hidden, show only the small restore dot
  if (hidden) {
    return <PerfPanelHidden position={position} onClick={handleHide} />
  }

  const hasGauge = showGauge && !minimal

  return (
    <div 
      className={`perf-panel ${position} ${minimal ? 'minimal' : ''} ${lightMode ? 'light' : ''}`} 
      style={{ pointerEvents: 'auto' }}
    >
      {/* Two-column layout when gauge is shown */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        
        {/* Left: Gauge + Expand/Theme buttons */}
        {hasGauge && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 12px 8px 12px',
            borderRight: '1px solid var(--perf-border)',
            background: 'var(--perf-gauge-bg)',
            flexShrink: 0,
            gap: '6px',
          }}>
            <PerfGauge size={100} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExpandButton onClick={handleToggle} expanded={expanded} />
              <HideButton onClick={handleHide} />
              <ThemeButton lightMode={lightMode} onClick={handleThemeToggle} />
            </div>
          </div>
        )}
        
        {/* Right: Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar when no gauge (Expand, Hide, Theme) */}
          {!hasGauge && (
            <div className="perf-toolbar">
              <ExpandButton onClick={handleToggle} expanded={expanded} />
              <HideButton onClick={handleHide} />
              <ThemeButton lightMode={lightMode} onClick={handleThemeToggle} />
            </div>
          )}
          {/* Main metrics - showing GPU, CPU, FPS, Frame */}
          <PerfMetrics showFps={!hasGauge} />
          
          {/* Graph */}
          {showGraph && !minimal && (
            <>
              <div className="perf-graph-container">
                <PerfGraph width={hasGauge ? 220 : 316} height={60} />
              </div>
              <GraphLegend />
            </>
          )}
          
          {/* Detailed stats (collapsible) */}
          {!minimal && expanded && <PerfStats />}
          
          {/* VRAM bar */}
          {showVRAM && !minimal && <PerfVRAM />}
        </div>
      </div>
    </div>
  )
}
