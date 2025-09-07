'use client';
import React, { useRef, useState } from 'react';

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [hash, setHash] = useState<string>('');

  const drawStart: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const move = (ev: PointerEvent) => {
      const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.lineTo(x, y); ctx.stroke();
    };
    const x0 = e.clientX - rect.left, y0 = e.clientY - rect.top;
    ctx.beginPath(); ctx.moveTo(x0, y0);
    canvas.setPointerCapture(e.pointerId);
    canvas.onpointermove = move as any;
  };

  const drawEnd: React.PointerEventHandler<HTMLCanvasElement> = (e) => {
    const canvas = canvasRef.current!;
    canvas.onpointermove = null;
    canvas.releasePointerCapture(e.pointerId);
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const computeHash = async () => {
    const canvas = canvasRef.current!;
    const png = canvas.toDataURL('image/png'); // MVP: luego lo cambiamos por SVG canónico
    const enc = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const pepper = 'LIVRA_MINI'; // luego pasamos a variable de entorno
    const bytes = new Uint8Array([
      ...enc.encode(text.trim()),
      ...enc.encode(png),
      ...salt,
      ...enc.encode(pepper),
    ]);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    setHash(toHex(digest));
  };

  const anchor = async () => {
    if (!hash) return;
    const res = await fetch('/api/anchor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ hash, signers: [], meta: { demo: true } }),
    });
    const j = await res.json();
    alert(res.ok ? `Anchored: ${j.chain ?? 'local'} ${j.txHash ?? j.file}` : `Error: ${j.error}`);
  };

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h1>LIVRA – Demo mínima</h1>
      <p>Pegá el contrato, firmá en el lienzo y generá el hash.</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Pega aquí el texto del contrato…"
        style={{ width: '100%', height: 160, margin: '12px 0' }}
      />

      <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <strong>Firma manuscrita</strong>
          <button onClick={clear}>Limpiar</button>
        </div>
        <canvas
          ref={canvasRef}
          width={760}
          height={220}
          style={{ border: '1px solid #ccc', borderRadius: 8, touchAction: 'none' }}
          onPointerDown={drawStart}
          onPointerUp={drawEnd}
          onPointerLeave={drawEnd}
        />
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={computeHash}>Generar hash</button>
        <button onClick={anchor} disabled={!hash}>Anclar (local)</button>
        {hash && <code style={{ wordBreak: 'break-all' }}>H_final: {hash}</code>}
      </div>
    </main>
  );
}
