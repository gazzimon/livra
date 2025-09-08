'use client';
import React, { useState } from 'react';
import { getMagic } from '@/src/lib/magicClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setMsg('');
    try {
      const magic = getMagic();
      if (!magic) throw new Error('Magic no disponible en SSR');
      // Magic Link con redirect a /auth/callback
      await magic.auth.loginWithMagicLink({
        email,
        redirectURI: `${window.location.origin}/auth/callback`,
      });
      setMsg('Revisá tu email y hacé click en el enlace para continuar.');
    } catch (err: any) {
      setMsg(err?.message || 'Error enviando Magic Link');
    } finally {
      setSending(false);
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h1>Ingresar con Magic Link</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        <input
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
        />
        <button disabled={sending} type="submit">
          {sending ? 'Enviando...' : 'Enviar Magic Link'}
        </button>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
