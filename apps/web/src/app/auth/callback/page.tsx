'use client';
import React, { useEffect, useState } from 'react';
import { getMagic } from '@/lib/magicClient';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const [status, setStatus] = useState('Autenticando…');
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const magic = getMagic();
        if (!magic) throw new Error('Magic no disponible');

        const usp = new URLSearchParams(window.location.search);
        const cred = usp.get('magic_credential');

        if (cred) {
          // Caso 1: flujo de redirección con magic_credential
          await magic.auth.loginWithCredential(cred);
        } else {
          // Caso 2: no vino el credential → intento sesión ya creada por Magic
          const already = await magic.user.isLoggedIn();
          if (!already) {
            throw new Error('Falta magic_credential en la URL');
          }
        }

        // En ambos casos, si estamos logueados, obtenemos DID y creamos sesión
        const didToken = await magic.user.getIdToken({ lifespan: 900 });

        const res = await fetch('/auth/session', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + didToken },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j?.error || 'No se pudo crear la sesión');
        }

        setStatus('¡Listo! Redirigiendo…');
        router.replace('/demo');
      } catch (e: any) {
        setStatus(`Magic RPC Error: ${e?.message || e}`);
      }
    })();
  }, [router]);

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h1>Autenticando...</h1>
      <p>{status}</p>
    </main>
  );
}
