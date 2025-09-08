import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/auth/login')

  return (
    <main className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Perfil de usuario</h1>

      <p><strong>Email:</strong> {session.email}</p>
      <p><strong>Wallet:</strong> {session.wallet}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Actividad reciente</h2>
      <p className="text-gray-500">El historial de eventos estará disponible cuando conectemos la base de datos.</p>
    </main>
  )
}
