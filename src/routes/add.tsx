import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Scanner } from '../lib/Scanner';
import { MembershipForm } from '../lib/MembershipForm';
import type { BarcodeFormat } from '../lib/storage';

export const Route = createFileRoute('/add')({
  component: AddPage,
});

function AddPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'choose' | 'scan' | 'manual'>('choose');
  const [seed, setSeed] = useState<{ code: string; format: BarcodeFormat } | null>(null);

  if (seed) {
    return (
      <MembershipForm
        initial={{ code: seed.code, format: seed.format }}
        onSaved={(id) => navigate({ to: '/m/$id', params: { id } })}
      />
    );
  }

  if (step === 'scan') {
    return (
      <>
        <div className="header">
          <button className="btn" onClick={() => setStep('choose')}>← Back</button>
          <h1>Scan code</h1>
        </div>
        <Scanner onDetected={(code, format) => setSeed({ code, format })} />
        <p className="muted">Point the camera at the code. It will be detected automatically.</p>
      </>
    );
  }

  if (step === 'manual') {
    return (
      <>
        <div className="header">
          <Link to="/" className="btn">← Back</Link>
          <h1>New membership</h1>
        </div>
        <MembershipForm onSaved={(id) => navigate({ to: '/m/$id', params: { id } })} />
      </>
    );
  }

  return (
    <>
      <div className="header">
        <Link to="/" className="btn">← Back</Link>
        <h1>Add membership</h1>
      </div>
      <button className="btn btn-primary btn-block" onClick={() => setStep('scan')}>
        Scan barcode or QR
      </button>
      <div style={{ height: 8 }} />
      <button className="btn btn-block" onClick={() => setStep('manual')}>
        Enter code manually
      </button>
    </>
  );
}
