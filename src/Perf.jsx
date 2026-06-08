import { useEffect } from 'react'
import { PerfHeadless } from './PerfHeadless'
import { PerfPanel } from './PerfPanel'
import { HtmlPortal } from './HtmlPortal'
import { perfActions } from './usePerf'

/**
 * All-in-one performance monitor for React Three Fiber.
 * Place inside <Canvas> — collects metrics and renders the overlay UI.
 */
export function Perf({
  position = 'top-left',
  showGraph = true,
  showGauge = true,
  minimal = false,
  showVRAM = false,
  logsPerSecond = 10,
  openByDefault = true,
  className,
  style,
}) {
  useEffect(() => {
    perfActions.setHidden(!openByDefault)
  }, [openByDefault])

  return (
    <>
      <PerfHeadless logsPerSecond={logsPerSecond} />
      <HtmlPortal className={className} style={{ pointerEvents: 'none', ...style }}>
        <PerfPanel
          position={position}
          showGraph={showGraph}
          showGauge={showGauge}
          minimal={minimal}
          showVRAM={showVRAM}
        />
      </HtmlPortal>
    </>
  )
}
