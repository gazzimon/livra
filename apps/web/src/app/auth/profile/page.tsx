// apps/web/src/app/auth/profile/page.tsx
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ProfileClient from './profile-client'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  return (
    <main className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow rounded space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>
        <p>
          <strong>Email:</strong> {session.email}
        </p>
        <p>
          <strong>Wallet:</strong> {session.wallet}
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Enrolamiento de firma</h2>
        <ProfileClient />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Actividad reciente</h2>
        <p className="text-gray-500">
          El historial de eventos estará disponible cuando conectemos la base de datos.
        </p>
      </section>
    </main>
  )
}
