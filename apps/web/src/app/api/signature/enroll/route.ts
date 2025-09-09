import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../../../../lib/session'
import { bucket } from '../../../../lib/firebase'
import { prisma } from '../../../../lib/db'
import { dataUrlToBuffer, sha256Hex } from '../../../../lib/binary'
import { getSignatureEmbedding } from '../../../../lib/biometrics'
import { asPgVector } from '../../../../lib/pgvector'


export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { image } = (await req.json()) as { image: string } // dataURL (image/png;base64,...)
  if (!image) return NextResponse.json({ error: 'Missing image' }, { status: 400 })

  const userId = String(session.sub)

  // (A) Hash del PNG (PII mínima)
  const buf = dataUrlToBuffer(image)
  const hash = await sha256Hex(buf)

  // (B) (Opcional) Guardar PNG en Storage — puedes comentarlo si no quieres almacenar imagen
  const path = `users/${userId}/signatures/${Date.now()}_${hash.slice(0, 8)}.png`
  await bucket.file(path).save(buf, { contentType: 'image/png', resumable: false }).catch(() => {})
  const imageUrl = `gs://${bucket.name}/${path}`

  // (C) Embedding + isX desde tu microservicio
  const base64 = image.split(',')[1]
  const { vector, isX } = await getSignatureEmbedding(base64)

  // (D) Upsert de usuario (por si no existe)
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: (session.email as string) ?? null,
      wallet: (session.wallet as string) ?? null,
      magicIssuer: userId,
    },
  })

  // (E) Crear la firma (sin vector) y luego actualizar vector (pgvector)
  const created = await prisma.userSignature.create({
    data: {
      userId,
      hash,
      storageUrl: imageUrl,
      isX,
    },
  })

  await prisma.$executeRawUnsafe(
    `UPDATE "UserSignature" SET vector = $1::vector WHERE id = $2`,
    asPgVector(vector),
    created.id
  )

  // (F) Umbral adaptativo cuando ya hay al menos 2 muestras: 85 si ambas “no X”, 65 si alguna “X”
  const samples = await prisma.userSignature.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: 2, // solo las dos primeras para el umbral inicial
    select: { isX: true },
  })

  if (samples.length >= 2) {
    const anyX = samples.some(s => s.isX)
    const threshold = anyX ? 65 : 85
    await prisma.user.update({
      where: { id: userId },
      data: { thresholdFirma: threshold },
    })
  }

  return NextResponse.json({ ok: true, hash, isX, storageUrl: imageUrl })
}
