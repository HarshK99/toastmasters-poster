import React from "react";

type ColorSwatchProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
};

export function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <label className="flex items-center space-x-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-28 border rounded px-2 py-1" />
      <div className="w-8 h-8 border" style={{ backgroundColor: value }} />
      {label && <span className="text-xs text-gray-600">{label}</span>}
    </label>
  );
}
