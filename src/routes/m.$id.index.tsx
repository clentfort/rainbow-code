import { useEffect, useState } from 'react';
import { Link, createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { CodeView } from '../lib/CodeView';
import { deleteMembership, getMembership } from '../lib/storage';
import { useBlobUrl } from '../lib/useBlobUrl';
import { isLight } from '../lib/icon';

export const Route = createFileRoute('/m/$id/')({
  loader: async ({ params }) => {
    const m = await getMembership(params.id);
    if (!m) throw notFound();
    return m;
  },
  component: CardPage,
});

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function CardPage() {
  const m = Route.useLoaderData();
  const navigate = useNavigate();
  const iconUrl = useBlobUrl(m.iconBlob);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', m.color);

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.href = `${import.meta.env.BASE_URL}m/${m.id}/manifest.webmanifest`;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, [m.id, m.color]);

  async function handleInstall() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  async function handleDelete() {
    if (!confirm(`Delete “${m.name}”?`)) return;
    await deleteMembership(m.id);
    navigate({ to: '/' });
  }

  const textColor = isLight(m.color) ? '#111' : '#fff';

  return (
    <>
      <div className="header">
        <Link to="/" className="btn">←</Link>
        <h1>{m.name}</h1>
        <Link to="/m/$id/edit" params={{ id: m.id }} className="btn">Edit</Link>
      </div>

      <div className="card" style={{ background: m.color, color: textColor, borderColor: m.color }}>
        {iconUrl && (
          <img
            src={iconUrl}
            alt=""
            style={{ width: 72, height: 72, borderRadius: 16, marginBottom: 12 }}
          />
        )}
        <div className="code-area">
          <CodeView code={m.code} format={m.format} />
        </div>
        <h2 style={{ color: textColor }}>{m.name}</h2>
        <p style={{ opacity: 0.8 }}>{m.code}</p>
      </div>

      {installEvent && (
        <button className="btn btn-primary btn-block" onClick={handleInstall} style={{ marginTop: 16 }}>
          Install to home screen
        </button>
      )}

      <button className="btn btn-danger btn-block" onClick={handleDelete} style={{ marginTop: 24 }}>
        Delete
      </button>
    </>
  );
}
