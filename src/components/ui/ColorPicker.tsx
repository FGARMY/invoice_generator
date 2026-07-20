'use client';

import { useState } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';

const presetColors = [
  '#2563eb', // Blue
  '#1e3a5f', // Navy
  '#7c3aed', // Purple
  '#059669', // Emerald
  '#dc2626', // Red
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#4f46e5', // Indigo
  '#be185d', // Pink
  '#854d0e', // Amber dark
  '#0f766e', // Teal
  '#1d4ed8', // Royal Blue
];

export default function ColorPicker() {
  const accentColor = useInvoiceStore((s) => s.accentColor);
  const setAccentColor = useInvoiceStore((s) => s.setAccentColor);
  const [customColor, setCustomColor] = useState(accentColor);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Accent Color
      </h3>

      {/* Preset Swatches */}
      <div className="flex flex-wrap gap-2">
        {presetColors.map((color) => (
          <button
            key={color}
            onClick={() => {
              setAccentColor(color);
              setCustomColor(color);
            }}
            className={`w-7 h-7 rounded-lg transition-all duration-150 hover:scale-110 ${
              accentColor === color
                ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                : 'hover:ring-1 hover:ring-white/30'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            setAccentColor(e.target.value);
          }}
          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-700 bg-transparent"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
              setAccentColor(e.target.value);
            }
          }}
          className="flex-1 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          placeholder="#2563eb"
          maxLength={7}
        />
      </div>
    </div>
  );
}
