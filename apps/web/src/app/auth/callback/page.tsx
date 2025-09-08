'use client';
import React, { useEffect, useState } from 'react';
import { getMagic } from '@/src/lib/magicClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const [status, setStatus] = useState('Procesando...');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const magic = getMagic();
        if (!magic) throw new Error('Magic no disponible');
        // Obtiene el DID token del usuario autenticado por Magic
        const didToken = await magic.user.getIdToken({ lifespan: 900 });
        const res = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + didToken },
        });
        if (!res.ok) throw new Error('No se pudo crear la sesión');
        setStatus('¡Listo! Redirigiendo…');
        router.replace('/demo'); // o a tu dashboard
      } catch (e: any) {
        setStatus(e?.message || 'Error en callback');
      }
    })();
  }, [router]);

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h1>Autenticando…</h1>
      <p>{status}</p>
    </main>
  );
}
