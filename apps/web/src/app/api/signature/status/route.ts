import { NextResponse } from 'next/server'
import { getSession } from '../../../lib/session'
import { prisma } from '../../../lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = String(session.sub)

  const [count, user] = await Promise.all([
    prisma.userSignature.count({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { thresholdFirma: true } }),
  ])

  return NextResponse.json({ samples: count, threshold: user?.thresholdFirma ?? null })
}
