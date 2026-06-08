import { useRef, useEffect, useCallback } from 'react'
import { getPerf, usePerf, perfActions } from './usePerf'

// Mode configurations
const GAUGE_MODES = {
  fps: {
    label: 'FPS',
    minValue: 0,
    maxValue: 144,
    getValue: (perf) => perf.fps,
    colorStart: '#00ffd0',  // Green for good
    colorMid: '#ffaa00',    // Yellow for medium
    colorEnd: '#ff4444',    // Red for bad
    // For FPS: higher is better
    getPercent: (value, min, max) => Math.min(Math.max((value - min) / (max - min), 0), 1),
    glowColor: 'rgba(0, 255, 208, 0.2)',
  },
  gpu: {
    label: 'GPU',
    minValue: 0,
    maxValue: 16.67, // Target for 60fps
    getValue: (perf) => perf.gpuTime,
    colorStart: '#ff4444',  // Red for high (bad)
    colorMid: '#ffaa00',    // Yellow for medium
    colorEnd: '#ff9f43',    // Orange for low (good)
    // For GPU time: lower is better, so invert the color logic
    getPercent: (value, min, max) => Math.min(Math.max((value - min) / (max - min), 0), 1),
    glowColor: 'rgba(255, 159, 67, 0.2)',
  },
  cpu: {
    label: 'CPU',
    minValue: 0,
    maxValue: 16.67, // Target for 60fps
    getValue: (perf) => perf.cpuTime,
    colorStart: '#ff4444',  // Red for high (bad)
    colorMid: '#ffaa00',    // Yellow for medium  
    colorEnd: '#a78bfa',    // Purple for low (good)
    // For CPU time: lower is better
    getPercent: (value, min, max) => Math.min(Math.max((value - min) / (max - min), 0), 1),
    glowColor: 'rgba(167, 139, 250, 0.2)',
  },
}

/**
 * Premium Gauge Meter Component
 * Inspired by luxury car speedometers
 * Click to cycle through FPS, GPU, CPU modes
 */
export function PerfGauge({ 
  size = 120,
  showTicks = true,
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const currentValueRef = useRef(0)
  const gaugeMode = usePerf(s => s.gaugeMode)
  const lightMode = usePerf(s => s.lightMode)
  
  // Get current mode config
  const modeConfig = GAUGE_MODES[gaugeMode] || GAUGE_MODES.fps
  
  // Lerp for smooth animation
  const lerp = (a, b, t) => a + (b - a) * t
  
  // Get color based on percentage and mode
  const getColor = useCallback((percent, mode) => {
    const config = GAUGE_MODES[mode] || GAUGE_MODES.fps
    
    if (mode === 'fps') {
      // FPS: higher is better
      if (percent > 0.7) return config.colorStart
      if (percent > 0.4) return config.colorMid
      return config.colorEnd
    } else {
      // GPU/CPU: lower is better (invert logic)
      if (percent < 0.3) return config.colorEnd  // Good (low time)
      if (percent < 0.6) return config.colorMid  // Medium
      return config.colorStart                    // Bad (high time)
    }
  }, [])
  
  // Draw the gauge
  const draw = useCallback((ctx, displayValue, mode) => {
    const config = GAUGE_MODES[mode] || GAUGE_MODES.fps
    const { minValue, maxValue, label, colorStart, colorMid, colorEnd } = config
    
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 10
    
    // Clear
    ctx.clearRect(0, 0, size, size)
    
    // Arc angles (start from bottom-left, go to bottom-right)
    const startAngle = 0.75 * Math.PI  // 135 degrees
    const endAngle = 2.25 * Math.PI    // 405 degrees (wraps around)
    const totalAngle = endAngle - startAngle
    
    // Calculate value angle
    const percent = config.getPercent(displayValue, minValue, maxValue)
    const valueAngle = startAngle + (totalAngle * percent)
    
    // Background arc
    const bgStroke = lightMode ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = bgStroke
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.stroke()
    
    // Value arc with gradient
    if (percent > 0.01) {
      const gradient = ctx.createLinearGradient(0, size, size, 0)
      
      if (mode === 'fps') {
        gradient.addColorStop(0, colorEnd)
        gradient.addColorStop(0.5, colorMid)
        gradient.addColorStop(1, colorStart)
      } else {
        // For GPU/CPU, reverse gradient (low = good color)
        gradient.addColorStop(0, colorEnd)
        gradient.addColorStop(0.5, colorMid)
        gradient.addColorStop(1, colorStart)
      }
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, valueAngle)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.stroke()
      
      // Glow effect
      const glowColor = getColor(percent, mode)
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, valueAngle - 0.1, valueAngle)
      ctx.strokeStyle = glowColor
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.shadowBlur = 0
    }
    
    // Tick marks
    if (showTicks) {
      const tickCount = 12
      for (let i = 0; i <= tickCount; i++) {
        const tickAngle = startAngle + (totalAngle * i / tickCount)
        const tickLength = i % 3 === 0 ? 10 : 5
        const innerRadius = radius - 15
        const outerRadius = innerRadius - tickLength
        
        const x1 = centerX + Math.cos(tickAngle) * innerRadius
        const y1 = centerY + Math.sin(tickAngle) * innerRadius
        const x2 = centerX + Math.cos(tickAngle) * outerRadius
        const y2 = centerY + Math.sin(tickAngle) * outerRadius
        
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = lightMode ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.3)'
        ctx.lineWidth = i % 3 === 0 ? 2 : 1
        ctx.stroke()
      }
    }
    
    // Center value text (dark in light mode for readability)
    ctx.fillStyle = lightMode ? '#1a202c' : '#ffffff'
    ctx.font = `bold ${size * 0.28}px Inter, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Format value based on mode
    const displayText = mode === 'fps' 
      ? Math.round(displayValue).toString()
      : displayValue.toFixed(1)
    ctx.fillText(displayText, centerX, centerY - 5)
    
    // Label with unit
    ctx.fillStyle = lightMode ? 'rgba(26, 32, 44, 0.7)' : 'rgba(255, 255, 255, 0.6)'
    ctx.font = `500 ${size * 0.1}px Inter, sans-serif`
    const labelText = mode === 'fps' ? label : `${label} ms`
    ctx.fillText(labelText, centerX, centerY + size * 0.18)
    
  }, [size, showTicks, getColor, lightMode])
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    let lastTime = 0
    const animate = (time) => {
      if (time - lastTime > 33) { // ~30fps for the gauge animation
        lastTime = time
        
        const perf = getPerf()
        const mode = perf.gaugeMode || 'fps'
        const config = GAUGE_MODES[mode] || GAUGE_MODES.fps
        const targetValue = config.getValue(perf)
        
        // Smooth lerp to target
        currentValueRef.current = lerp(currentValueRef.current, targetValue, 0.15)
        
        draw(ctx, currentValueRef.current, mode)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [size, draw])
  
  // Handle click to cycle mode
  const handleClick = () => {
    perfActions.cycleGaugeMode()
    // Reset the current value for smooth transition
    currentValueRef.current = 0
  }
  
  return (
    <canvas
      ref={canvasRef}
      className="perf-gauge"
      onClick={handleClick}
      style={{ 
        width: size, 
        height: size,
        cursor: 'pointer',
        filter: `drop-shadow(0 0 10px ${modeConfig.glowColor})`
      }}
      title="Click to change mode (FPS → GPU → CPU)"
    />
  )
}

/**
 * Mini Gauge for GPU/CPU time (vertical bar style)
 */
export function PerfMiniGauge({
  value = 0,
  maxValue = 16.67, // 60fps target
  label = 'GPU',
  color = '#ff9f43',
  height = 60,
}) {
  const percent = Math.min(Math.max(value / maxValue, 0), 1)
  const isWarning = percent > 0.8
  
  return (
    <div className="perf-mini-gauge" style={{ height }}>
      <div className="perf-mini-gauge-track">
        <div 
          className="perf-mini-gauge-fill"
          style={{ 
            height: `${percent * 100}%`,
            background: isWarning 
              ? 'linear-gradient(to top, #ff4444, #ffaa00)' 
              : `linear-gradient(to top, ${color}88, ${color})`,
            boxShadow: `0 0 10px ${color}66`
          }}
        />
      </div>
      <span className="perf-mini-gauge-value" style={{ color }}>
        {value.toFixed(1)}
      </span>
      <span className="perf-mini-gauge-label">{label}</span>
    </div>
  )
}
