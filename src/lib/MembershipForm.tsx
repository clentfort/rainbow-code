import { useEffect, useState } from 'react';
import {
  type BarcodeFormat,
  type Membership,
  saveMembership,
  slugify,
  uniqueId,
} from './storage';
import { fileToIcon, initialsFromName, makeInitialsIcon, urlToIcon } from './icon';
import { useBlobUrl } from './useBlobUrl';

interface Props {
  initial?: Partial<Membership>;
  onSaved: (id: string) => void;
}

type IconMode = 'initials' | 'file' | 'url';

const FORMATS: { value: BarcodeFormat; label: string }[] = [
  { value: 'qr_code', label: 'QR code' },
  { value: 'code_128', label: 'Code 128' },
  { value: 'code_39', label: 'Code 39' },
  { value: 'ean_13', label: 'EAN-13' },
  { value: 'ean_8', label: 'EAN-8' },
  { value: 'upc_a', label: 'UPC-A' },
  { value: 'upc_e', label: 'UPC-E' },
  { value: 'itf', label: 'ITF' },
];

const PRESET_COLORS = ['#c8a040', '#4a6cf7', '#2ecc71', '#e74c3c', '#9b59b6', '#222222'];

export function MembershipForm({ initial, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [format, setFormat] = useState<BarcodeFormat>(initial?.format ?? 'qr_code');
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [iconMode, setIconMode] = useState<IconMode>('initials');
  const [iconBlob, setIconBlob] = useState<Blob | undefined>(initial?.iconBlob);
  const [iconUrl, setIconUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useBlobUrl(iconBlob);

  useEffect(() => {
    if (iconMode === 'initials') {
      const text = initialsFromName(name || '?');
      makeInitialsIcon(text, color).then(setIconBlob).catch(() => setIconBlob(undefined));
    }
  }, [iconMode, name, color]);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      setIconBlob(await fileToIcon(file, color));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleUrl() {
    if (!iconUrl) return;
    setBusy(true);
    setError(null);
    try {
      setIconBlob(await urlToIcon(iconUrl, color));
    } catch (e) {
      setError(`Could not load image (CORS or network). ${String(e)}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !code || !iconBlob) {
      setError('Name, code and icon are required.');
      return;
    }
    const id = initial?.id ?? (await uniqueId(slugify(name)));
    const m: Membership = {
      id,
      name,
      code,
      format,
      color,
      iconBlob,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    await saveMembership(m);
    onSaved(id);
  }

  return (
    <form onSubmit={handleSave}>
      <div className="field">
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bakery" />
      </div>

      <div className="field">
        <label>Code</label>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456789" />
      </div>

      <div className="field">
        <label>Format</label>
        <select value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}>
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Color</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: c, border: color === c ? '3px solid #fff' : '1px solid #0003',
                outline: color === c ? '2px solid var(--accent)' : 'none',
              }}
              aria-label={c}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>Icon</label>
        <div className="tabs">
          {(['initials', 'file', 'url'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-selected={iconMode === m}
              onClick={() => setIconMode(m)}
            >
              {m === 'initials' ? 'Initials' : m === 'file' ? 'Photo' : 'URL'}
            </button>
          ))}
        </div>

        {iconMode === 'file' && (
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        )}
        {iconMode === 'url' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://…/logo.png"
            />
            <button type="button" className="btn" onClick={handleUrl} disabled={busy}>Fetch</button>
          </div>
        )}

        {previewUrl && (
          <div style={{ marginTop: 12 }}>
            <img src={previewUrl} alt="" style={{ width: 96, height: 96, borderRadius: 16 }} />
          </div>
        )}
      </div>

      {error && <p style={{ color: '#c0392b' }}>{error}</p>}

      <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
        Save membership
      </button>
    </form>
  );
}
