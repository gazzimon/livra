'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMagic } from '@/lib/magicClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    try {
      setLoading(true)
      const magic = getMagic()

      // 🔑 Paso 1: Magic manda el OTP al correo e inmediatamente abre su modal
      await magic?.auth.loginWithEmailOTP({ email, showUI: true })

      // 🔑 Paso 2: cuando el usuario ingresa el código en el modal, el login queda válido
      const didToken = await magic?.user.getIdToken()

      // 🔑 Paso 3: mandás el DID a tu backend para crear cookie de sesión
      const res = await fetch('/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${didToken}` },
      })

      if (!res.ok) throw new Error('Login failed')

      // 🔑 Paso 4: redirigir al dashboard o demo
      router.replace('/demo')
    } catch (err) {
      console.error(err)
      alert('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-4 w-80">
        <h1 className="text-xl font-semibold text-center">Accedé a LIVRA</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo electrónico"
          className="border px-3 py-2 rounded-md"
          disabled={loading}
        />
        <button
          onClick={handleLogin}
          disabled={!email || loading}
          className="bg-black text-white rounded-md py-2"
        >
          {loading ? 'Esperando OTP…' : 'Enviar código'}
        </button>
      </div>
    </main>
  )
}
