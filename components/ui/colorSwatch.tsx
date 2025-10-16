import React from "react";

type ColorSwatchProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
};

export function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <label className="flex items-center space-x-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 border border-blue-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-300 transition-all duration-150 shadow-sm hover:border-blue-400 bg-white"
      />
      <div className="w-8 h-8 border border-blue-200 rounded-lg shadow-sm" style={{ backgroundColor: value }} />
      {label && <span className="text-xs font-medium text-blue-800">{label}</span>}
    </label>
  );
}
