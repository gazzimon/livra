'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

type Props = {
  onChange?: (hasStroke: boolean) => void
}

export default function SignaturePad({ onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawing = useRef(false)
  const [hasStroke, setHasStroke] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current!
    const dpr = Math.max(1, window.devicePixelRatio || 1)
    const width = Math.min(600, window.innerWidth - 32)
    const height = 220
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#111827'
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, width, height)
    ctxRef.current = ctx
  }, [])

  const point = useCallback((e: any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }, [])

  const start = useCallback((e: any) => {
    e.preventDefault()
    drawing.current = true
    const { x, y } = point(e)
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(x, y)
  }, [point])

  const move = useCallback((e: any) => {
    if (!drawing.current) return
    e.preventDefault()
    const { x, y } = point(e)
    ctxRef.current?.lineTo(x, y)
    ctxRef.current?.stroke()
    if (!hasStroke) {
      setHasStroke(true)
      onChange?.(true)
    }
  }, [point, hasStroke, onChange])

  const end = useCallback((e: any) => {
    if (!drawing.current) return
    e.preventDefault()
    drawing.current = false
    ctxRef.current?.closePath()
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current!
    const ctx = ctxRef.current!
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasStroke(false)
    onChange?.(false)
  }, [onChange])

  const toDataURL = useCallback(() => {
    return canvasRef.current!.toDataURL('image/png')
  }, [])

  // ⬇️ Registrar helpers en window SOLO en cliente
  useEffect(() => {
    (window as any).__signaturePad__ = { toDataURL, clear }
    return () => {
      delete (window as any).__signaturePad__
    }
  }, [toDataURL, clear])

  return (
    <div className="w-full max-w-xl">
      <div
        className="border rounded-lg shadow-sm select-none touch-none"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      >
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-2 text-sm text-gray-500">Firmá dentro del recuadro.</div>
      <div className="mt-2">
        <button
          onClick={clear}
          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
