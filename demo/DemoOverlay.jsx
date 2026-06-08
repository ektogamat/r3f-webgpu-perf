const MODEL_CREDITS_URL =
  'https://sketchfab.com/3d-models/sikorsky-ch-53e-sea-stallion-6246617aeb874e4793b21d5861eea8c9'

const styles = {
  root: {
    position: 'fixed',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  topLeftGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'min(520px, 58vw)',
    height: 'min(380px, 48vh)',
    background:
      'radial-gradient(ellipse 115% 100% at top left, rgba(5, 8, 15, 0.42) 0%, rgba(5, 8, 15, 0.18) 45%, transparent 72%)',
    pointerEvents: 'none',
  },
  topRightGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 'min(520px, 58vw)',
    height: 'min(380px, 48vh)',
    background:
      'radial-gradient(ellipse 115% 100% at top right, rgba(5, 8, 15, 0.42) 0%, rgba(5, 8, 15, 0.18) 45%, transparent 72%)',
    pointerEvents: 'none',
  },
  branding: {
    position: 'absolute',
    top: 40,
    right: 40,
    textAlign: 'right',
    fontFamily: 'Inter, system-ui, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    textShadow: '0 0 10px rgba(27, 27, 27, 0.23)',
    color: 'rgba(255,255,255,0.85)',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: 14,
    fontWeight: 500,
    maxWidth: 300,
    color: 'rgba(255,255,255,0.4)',
    textShadow: '0 0 10px rgba(27, 27, 27, 0.23)',
  },
  credits: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    margin: 0,
    maxWidth: 280,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 9,
    lineHeight: 1.5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
    pointerEvents: 'auto',
  },
  creditsLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
}

export function DemoOverlay() {
  return (
    <div style={styles.root}>
      <div style={styles.topLeftGradient} aria-hidden="true" />
      <div style={styles.topRightGradient} aria-hidden="true" />

      <div style={styles.branding}>
        <h1 style={styles.title}>R3F-WEBGPU-PERF</h1>
        <p style={styles.subtitle}>PERFORMANCE MONITORING FOR WEBGPU BY ANDERSON MANCINI</p>
      </div>

      <p style={styles.credits}>
        <a href={MODEL_CREDITS_URL} target="_blank" rel="noreferrer" style={styles.creditsLink}>
          3D MODEL: SIKORSKY CH-53E SEA STALLION
          <br />
          BY MUHAMAD MIRZA ARRAFI · CC ATTRIBUTION · SKETCHFAB
        </a>
      </p>
    </div>
  )
}
