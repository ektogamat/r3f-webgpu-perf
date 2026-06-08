import { useDemoSettings } from './DemoSettings'
import { QUALITY_PRESETS } from './constants'

const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  panel: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    pointerEvents: 'auto',
  },
  title: {
    margin: 0,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
  },
  row: {
    display: 'flex',
    gap: 6,
  },
  btn: (active) => ({
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 14px',
    borderRadius: 8,
    border: active ? '1px solid rgba(0,255,208,0.5)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(0,255,208,0.12)' : 'rgba(8,10,15,0.85)',
    color: active ? '#00ffd0' : 'rgba(255,255,255,0.75)',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    transition: 'all 0.15s ease',
  }),
  hint: {
    margin: 0,
    maxWidth: 220,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 11,
    lineHeight: 1.45,
    color: 'rgba(255,255,255,0.35)',
  },
}

export function DemoControls() {
  const { quality, setQuality } = useDemoSettings()

  return (
    <div style={styles.root}>
      <div style={styles.panel}>
        <p style={styles.title}>GPU load</p>
        <div style={styles.row}>
          {Object.entries(QUALITY_PRESETS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              style={styles.btn(quality === key)}
              onClick={() => setQuality(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p style={styles.hint}>
          Low: direct lighting. Med: bloom. Ultra: GTAO, bloom, lens flare, edge chromatic aberration and DOF — move the cursor over the helicopter to focus.
        </p>
      </div>
    </div>
  )
}
