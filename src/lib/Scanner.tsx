import { useEffect, useRef, useState } from 'react';
import { BarcodeDetector } from 'barcode-detector/pure';
import type { BarcodeFormat } from './storage';

const SUPPORTED: BarcodeFormat[] = [
  'qr_code',
  'code_128',
  'code_39',
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'itf',
];

export function Scanner({ onDetected }: { onDetected: (code: string, format: BarcodeFormat) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detector = new BarcodeDetector({ formats: SUPPORTED });
    let stream: MediaStream | null = null;
    let raf = 0;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (results[0]) {
              const fmt = SUPPORTED.includes(results[0].format as BarcodeFormat)
                ? (results[0].format as BarcodeFormat)
                : 'qr_code';
              onDetected(results[0].rawValue, fmt);
              return;
            }
          } catch {
            /* keep trying */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (err) {
        const msg = (err as Error).message || String(err);
        if (!window.isSecureContext) {
          setError(
            'Camera requires HTTPS. Open this page over HTTPS (e.g. the GitHub Pages URL, or a cloudflared tunnel) and try again.',
          );
        } else {
          setError(`Camera unavailable: ${msg}`);
        }
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  if (error) return <p className="muted">{error}</p>;
  return (
    <div className="scanner">
      <video ref={videoRef} muted playsInline />
    </div>
  );
}
