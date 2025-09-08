'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserSession = {
  email?: string | null
  wallet?: string | null
}

export default function NavBar() {
  const [user, setUser] = useState<UserSession | false | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
        else setUser(false)
      })
      .catch(() => setUser(false))
  }, [])

  async function handleLogout() {
    await fetch('/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">
      <a href="/demo" className="font-bold text-lg text-indigo-600">
        LIVRA
      </a>

      {user === null && <span className="text-sm text-gray-500">Cargando…</span>}

      {user === false && (
        <button
          onClick={() => router.push('/auth/login')}
          className="text-sm text-gray-500 underline"
        >
          Iniciar sesión
        </button>
      )}

      {user && (
        <div className="flex items-center gap-6">
          {/* Info de usuario */}
          <div className="text-sm text-gray-700">
            {user.email && <span className="block font-medium">{user.email}</span>}
            {user.wallet && (
              <span className="block text-xs text-gray-500">
                {user.wallet.slice(0, 6)}…{user.wallet.slice(-4)}
              </span>
            )}
          </div>

          {/* 🔗 Nuevo link a Perfil */}
          <a
            href="/auth/profile"
            className="text-sm text-indigo-600 hover:underline"
          >
            Perfil
          </a>

          {/* Botón de logout */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}
