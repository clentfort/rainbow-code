import { useEffect, useRef } from 'react';
import jsbarcode from 'jsbarcode';
import QRCode from 'qrcode';
import type { BarcodeFormat } from './storage';

const JSBARCODE_FORMAT: Partial<Record<BarcodeFormat, string>> = {
  code_128: 'CODE128',
  code_39: 'CODE39',
  ean_13: 'EAN13',
  ean_8: 'EAN8',
  upc_a: 'UPC',
  upc_e: 'UPC',
  itf: 'ITF',
};

export function CodeView({ code, format }: { code: string; format: BarcodeFormat }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (format === 'qr_code') {
      QRCode.toCanvas(canvas, code, { width: 320, margin: 1, errorCorrectionLevel: 'M' }).catch(
        (err) => console.error('QR render error', err),
      );
      return;
    }
    const fmt = JSBARCODE_FORMAT[format];
    if (!fmt) {
      console.warn('Unsupported format', format);
      return;
    }
    try {
      jsbarcode(canvas, code, { format: fmt, width: 2, height: 100, displayValue: false });
    } catch (err) {
      console.error('Barcode render error', err);
    }
  }, [code, format]);

  return <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />;
}
