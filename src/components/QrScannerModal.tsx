import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { TRANSLATIONS, Language } from '../i18n/translations';

interface QrScannerModalProps {
  lang: Language;
  onScanSuccess: (pin: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  lang,
  onScanSuccess,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    const startScanner = async () => {
      try {
        setErrorMsg(null);
        html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Extract PIN from URL or direct text
            let extractedPin = '';
            try {
              if (decodedText.includes('pin=')) {
                const url = new URL(decodedText.startsWith('http') ? decodedText : `https://${decodedText}`);
                const p = url.searchParams.get('pin');
                if (p) extractedPin = p;
              } else {
                const match = decodedText.match(/\b\d{6}\b/);
                if (match) {
                  extractedPin = match[0];
                }
              }
            } catch {
              const match = decodedText.match(/\b\d{6}\b/);
              if (match) {
                extractedPin = match[0];
              }
            }

            if (extractedPin && /^\d{6}$/.test(extractedPin)) {
              if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {}).finally(() => {
                  onScanSuccess(extractedPin);
                });
              } else {
                onScanSuccess(extractedPin);
              }
            }
          },
          () => {
            // scan failure callback (silent frame miss)
          }
        );

        setIsScanning(true);
      } catch (err: unknown) {
        console.error('Camera QR start error:', err);
        setErrorMsg(
          lang === 'uz'
            ? "Kameraga ruxsat berilmadi yoki kamera topilmadi. PIN kodni qo'lda kiriting."
            : lang === 'ru'
            ? "Доступ к камере отклонен или камера не найдена. Введите PIN вручную."
            : "Camera permission denied or camera not found. Please enter PIN manually."
        );
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().catch(() => {});
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm sm:text-base">
              {t.scanQrTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera viewport */}
        <div className="p-4 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            <div id={scannerContainerId} className="w-full h-full" />

            {!isScanning && !errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/80 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                <span className="text-xs font-medium">Kamera ishga tushirilmoqda...</span>
              </div>
            )}

            {errorMsg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/95 text-rose-300 gap-2">
                <AlertCircle className="w-10 h-10 text-rose-500 mb-1" />
                <p className="text-xs leading-relaxed">{errorMsg}</p>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-400 text-center max-w-xs">
            {lang === 'uz'
              ? "Boshlovchi ekrandagi QR kodni to'rtburchak ichiga to'g'irlang"
              : lang === 'ru'
              ? "Наведите камеру на QR-код с экрана ведущего"
              : "Point your camera at the QR code on the host's screen"}
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition"
          >
            {t.closeScanner}
          </button>
        </div>
      </div>
    </div>
  );
};
