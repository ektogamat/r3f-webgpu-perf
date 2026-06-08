import { useRef, useEffect, useCallback } from 'react'
import { getPerf } from './usePerf'

const COLORS = {
  fps: '#00ffd0',
  gpu: '#ff9f43', 
  cpu: '#a78bfa',
  grid: 'rgba(255, 255, 255, 0.05)',
}

/**
 * Real-time performance graph using Canvas 2D
 * Renders FPS, GPU time, and CPU time as smooth animated lines
 */
export function PerfGraph({ width = 310, height = 60 }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const lastDrawRef = useRef(0)
  
  // Get ordered history from circular buffer
  const getOrderedHistory = useCallback((historyArray, circularId) => {
    const ordered = []
    const len = historyArray.length
    for (let i = 0; i < len; i++) {
      const id = (circularId + i) % len
      ordered.push(historyArray[id])
    }
    return ordered
  }, [])
  
  // Draw a smooth line with gradient fill underneath
  const drawLine = useCallback((ctx, data, color, maxVal, yOffset = 0) => {
    if (!data || data.length === 0) return
    
    const padding = 4
    const graphHeight = height - padding * 2
    const graphWidth = width - padding * 2
    const pointSpacing = graphWidth / (data.length - 1)
    
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    
    // Start path for the line
    let started = false
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * pointSpacing
      const normalizedValue = Math.min(data[i] / maxVal, 1)
      const y = height - padding - (normalizedValue * graphHeight) + yOffset
      
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    
    // Draw gradient fill under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    const baseColor = color.replace('#', '')
    const r = parseInt(baseColor.substr(0, 2), 16)
    const g = parseInt(baseColor.substr(2, 2), 16)
    const b = parseInt(baseColor.substr(4, 2), 16)
    
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.15)`)
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`)
    
    ctx.beginPath()
    ctx.fillStyle = gradient
    
    // Build closed path for fill
    started = false
    for (let i = 0; i < data.length; i++) {
      const x = padding + i * pointSpacing
      const normalizedValue = Math.min(data[i] / maxVal, 1)
      const y = height - padding - (normalizedValue * graphHeight) + yOffset
      
      if (!started) {
        ctx.moveTo(x, height)
        ctx.lineTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.lineTo(padding + (data.length - 1) * pointSpacing, height)
    ctx.closePath()
    ctx.fill()
  }, [width, height])
  
  // Draw subtle grid lines
  const drawGrid = useCallback((ctx) => {
    ctx.strokeStyle = COLORS.grid
    ctx.lineWidth = 1
    
    // Horizontal lines
    const hLines = 4
    for (let i = 1; i < hLines; i++) {
      const y = (height / hLines) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Vertical lines (sparse)
    const vLines = 6
    for (let i = 1; i < vLines; i++) {
      const x = (width / vLines) * i
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
  }, [width, height])
  
  // Main render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const perf = getPerf()
    const now = performance.now()
    
    // Throttle to ~30fps for the graph itself
    if (now - lastDrawRef.current < 33) {
      animationRef.current = requestAnimationFrame(render)
      return
    }
    lastDrawRef.current = now
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw grid
    drawGrid(ctx)
    
    // Get ordered history data
    const { history } = perf
    const fpsData = getOrderedHistory(history.fps, history.circularId)
    const gpuData = getOrderedHistory(history.gpu, history.circularId)
    const cpuData = getOrderedHistory(history.cpu, history.circularId)
    
    // Draw lines (from back to front)
    drawLine(ctx, cpuData, COLORS.cpu, 20) // Max 20ms for CPU
    drawLine(ctx, gpuData, COLORS.gpu, 20) // Max 20ms for GPU  
    drawLine(ctx, fpsData, COLORS.fps, 144) // Max 144 FPS
    
    animationRef.current = requestAnimationFrame(render)
  }, [width, height, drawLine, drawGrid, getOrderedHistory])
  
  // Setup canvas and start render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set canvas size with device pixel ratio for crisp rendering
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }
    
    // Start render loop
    animationRef.current = requestAnimationFrame(render)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [width, height, render])
  
  return (
    <canvas
      ref={canvasRef}
      className="perf-graph"
      style={{ width, height }}
    />
  )
}
