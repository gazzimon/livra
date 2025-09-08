'use client';
import React, { useState } from 'react';
import { getMagic } from '@/lib/magicClient';
import { useRouter } from 'next/navigation';

export default function LoginOTPPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'ask-email' | 'check-inbox'>('ask-email');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const magic = getMagic();
      if (!magic) throw new Error('Magic no disponible');
      // Enviar OTP por email (sin UI de Magic)
      // @ts-ignore (OTP puede estar en beta de tipos)
      await magic.auth.loginWithEmailOTP({ email, showUI: false });
      setStep('check-inbox');
      setMsg('Te enviamos un código de 6 dígitos al email.');
    } catch (err: any) {
      setMsg(err?.message || 'Error enviando el código');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const magic = getMagic();
      if (!magic) throw new Error('Magic no disponible');
      // Verificar OTP con UI propia
      // @ts-ignore
      await magic.auth.loginWithEmailOTP({ email, otp, showUI: false });

      // Obtener DID y crear sesión en tu backend
      const didToken = await magic.user.getIdToken({ lifespan: 900 });
      const r = await fetch('/auth/session', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + didToken },
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || 'No se pudo crear la sesión');
      }
      router.replace('/demo');
    } catch (err: any) {
      setMsg(err?.message || 'Error verificando el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 460, margin: '60px auto', padding: 16, textAlign: 'center' }}>
      <h1>Ingresar con Email OTP</h1>

      {step === 'ask-email' && (
        <form onSubmit={sendCode} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
            style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
          />
          <button type="submit" disabled={loading || !email}> {loading ? 'Enviando…' : 'Enviar código'} </button>
        </form>
      )}

      {step === 'check-inbox' && (
        <form onSubmit={verifyCode} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Código de 6 dígitos"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
            required
            style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8, letterSpacing: 2 }}
          />
          <button type="submit" disabled={loading || otp.length < 6}>
            {loading ? 'Verificando…' : 'Verificar código'}
          </button>
          <button type="button" disabled={loading} onClick={()=>setStep('ask-email')} style={{ opacity:.75 }}>
            Reingresar email
          </button>
          <p style={{ opacity:.8 }}>Te enviamos un código de 6 dígitos al email: <b>{email}</b></p>
        </form>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
