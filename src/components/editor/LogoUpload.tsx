'use client';

import { useRef, useCallback } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';

export default function LogoUpload() {
  const { business, setLogo } = useInvoiceStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PNG, JPG, SVG, or WebP image.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to fit 200x80 max
          const maxW = 400;
          const maxH = 160;
          let w = img.width;
          let h = img.height;

          if (w > maxW || h > maxH) {
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/png');
            setLogo(dataUrl);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [setLogo]
  );

  const removeLogo = useCallback(() => {
    setLogo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setLogo]);

  const initials = business.name
    ? business.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AB';

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-slate-400 mb-1">
        Logo
      </label>

      <div className="flex items-center gap-4">
        {/* Logo Preview */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
          {business.logoUrl ? (
            <img
              src={business.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{
                background: `linear-gradient(135deg, ${useInvoiceStore.getState().accentColor}, ${useInvoiceStore.getState().accentColor}88)`,
              }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Upload Logo
          </button>
          {business.logoUrl && (
            <button
              onClick={removeLogo}
              className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {!business.logoUrl && (
        <p className="text-xs text-slate-500">
          No logo? We&apos;ll auto-generate a monogram from your business name.
        </p>
      )}
    </div>
  );
}
