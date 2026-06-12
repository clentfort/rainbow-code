import { useEffect, useRef, useState } from 'react';
import type { BarcodeFormat } from './storage';

interface DetectedBarcode {
  rawValue: string;
  format: string;
}

interface BarcodeDetectorCtor {
  new (opts?: { formats?: string[] }): { detect(src: CanvasImageSource): Promise<DetectedBarcode[]> };
  getSupportedFormats?(): Promise<string[]>;
}

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
    const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
    if (!Ctor) {
      setError('BarcodeDetector not available — please enter the code manually.');
      return;
    }

    const detector = new Ctor({ formats: SUPPORTED });
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
        setError(`Camera unavailable: ${(err as Error).message}`);
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
