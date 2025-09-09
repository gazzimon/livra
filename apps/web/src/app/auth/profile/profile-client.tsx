'use client'

import { useEffect, useState } from 'react'
import SignaturePad from '@/components/SignaturePad'

type Status = { samples: number; threshold?: number | null }

export default function ProfileClient() {
  const [status, setStatus] = useState<Status>({ samples: 0, threshold: null })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasStroke, setHasStroke] = useState(false)

  async function refreshStatus() {
    try {
      const r = await fetch('/api/signature/status', { cache: 'no-store' })
      if (!r.ok) throw new Error('No se pudo obtener el estado')
      const j = await r.json()
      setStatus({ samples: j.samples ?? 0, threshold: j.threshold ?? null })
    } catch (e: any) {
      setMessage(e?.message || 'Error obteniendo estado')
    }
  }

  useEffect(() => {
    refreshStatus()
  }, [])

  async function handleEnroll() {
    if (!hasStroke) {
      setMessage('Dibujá tu firma antes de enviar.')
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      // El SignaturePad expone helpers en window (toDataURL / clear)
      const png = (window as any).__signaturePad__?.toDataURL?.()
      if (!png) throw new Error('No se pudo leer el lienzo')
      const res = await fetch('/api/signature/enroll', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image: png }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'Error al enrolar')
      setMessage('Muestra registrada ✅')
      ;(window as any).__signaturePad__?.clear?.()
      setHasStroke(false)
      await refreshStatus()
    } catch (e: any) {
      setMessage(e?.message || 'Ocurrió un error')
    } finally {
      setSubmitting(false)
    }
  }

  const step = Math.min(2, (status.samples ?? 0) + 1)

  return (
    <div className="max-w-2xl mx-auto px-0 py-0 space-y-6">
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Enrolamiento:</span> Paso {step} de 2{' '}
            {status.samples >= 2 && <span className="text-green-600"> (completado)</span>}
          </div>
          {status.threshold != null && (
            <span className="text-sm text-gray-600">
              Umbral actual: <b>{status.threshold}</b>
            </span>
          )}
        </div>

        <SignaturePad onChange={(hs) => setHasStroke(hs)} />

        <div className="flex items-center gap-3">
          <button
            disabled={submitting}
            onClick={handleEnroll}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {status.samples >= 2 ? 'Registrar muestra adicional' : 'Enviar muestra'}
          </button>
          {!hasStroke && (
            <span className="text-xs text-gray-500">Consejo: hacé un trazo antes de enviar.</span>
          )}
        </div>

        {message && <div className="text-sm text-gray-700">{message}</div>}

        <p className="text-xs text-gray-500">
          Guardamos solo el <b>hash</b> del PNG y el <b>embedding</b> vectorial (no la imagen, salvo
          que la necesitemos cifrada para auditoría).
        </p>
      </div>
    </div>
  )
}
