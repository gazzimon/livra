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
      if (!magic) throw new Error('Magic no disponible en este entorno');

      // 1) Enviar OTP al email
      // Opción A: UI propia: pedimos el código y luego llamamos loginWithEmailOTP({ email, otp })
      // Opción B: UI de Magic: magic.auth.loginWithEmailOTP({ email, showUI: true }) y listo.
      // Aquí usamos UI PROPIA:
      // @ts-ignore - algunos tipos del SDK aún son beta en OTP
      await magic.auth.loginWithEmailOTP({ email, /* showUI: false */ });

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

      // 2) Verificar el OTP y crear sesión de Magic (cliente)
      // @ts-ignore - algunos tipos del SDK aún son beta en OTP
      const res = await magic.auth.loginWithEmailOTP({ email, otp });

      // 3) Obtener DID Token (esto “cuenta” el login ante Magic)
      const didToken = await magic.user.getIdToken({ lifespan: 900 });

      // 4) Crear sesión del backend (cookie httpOnly)
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
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 16 }}>
      <h1>Ingresar con Email OTP</h1>

      {step === 'ask-email' && (
        <form onSubmit={sendCode} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8 }}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar código'}
          </button>
        </form>
      )}

      {step === 'check-inbox' && (
        <form onSubmit={verifyCode} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
            placeholder="Código de 6 dígitos"
            required
            style={{ padding: 10, border: '1px solid #ccc', borderRadius: 8, letterSpacing: 2 }}
          />
          <button type="submit" disabled={loading || otp.length < 4}>
            {loading ? 'Verificando…' : 'Verificar código'}
          </button>
          <button type="button" disabled={loading} onClick={()=>setStep('ask-email')} style={{ opacity: .7 }}>
            Reingresar email
          </button>
        </form>
      )}

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}
