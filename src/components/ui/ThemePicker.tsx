'use client';

import { useInvoiceStore } from '@/store/invoiceStore';
import { ThemeName } from '@/types/invoice';

const themes: {
  id: ThemeName;
  name: string;
  description: string;
  colors: [string, string, string];
}[] = [
  {
    id: 'minimal-mono',
    name: 'Minimal Mono',
    description: 'Swiss-style clean design',
    colors: ['#111827', '#ffffff', '#6b7280'],
  },
  {
    id: 'corporate-blue',
    name: 'Swiss Studio',
    description: 'Crisp, structured grid',
    colors: ['#0F172A', '#E2E8F0', '#ffffff'],
  },
  {
    id: 'bold-modern',
    name: 'Editorial Minimal',
    description: 'Stark, high-contrast',
    colors: ['#000000', '#f3f4f6', '#ffffff'],
  },
];

export default function ThemePicker() {
  const currentTheme = useInvoiceStore((s) => s.theme);
  const setTheme = useInvoiceStore((s) => s.setTheme);
  const accentColor = useInvoiceStore((s) => s.accentColor);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Theme
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const isActive = currentTheme === theme.id;
          const displayColor = theme.id === 'minimal-mono'
            ? theme.colors[0]
            : accentColor || theme.colors[0];

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`group relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              {/* Mini Preview Thumbnail */}
              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-white relative">
                {/* Header bar */}
                <div
                  className="h-[30%] w-full"
                  style={{ backgroundColor: displayColor }}
                />
                {/* Content lines */}
                <div className="p-2 space-y-1.5">
                  <div className="h-1 w-3/4 bg-gray-200 rounded-full" />
                  <div className="h-1 w-1/2 bg-gray-200 rounded-full" />
                  <div className="h-1 w-full bg-gray-100 rounded-full" />
                  <div className="h-1 w-full bg-gray-100 rounded-full" />
                  <div className="h-1 w-2/3 bg-gray-100 rounded-full" />
                  <div className="mt-1.5 flex justify-end">
                    <div
                      className="h-2 w-12 rounded-sm"
                      style={{ backgroundColor: displayColor }}
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs font-semibold text-white">{theme.name}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{theme.description}</p>

              {isActive && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
