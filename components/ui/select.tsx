import React from "react";

type Option = { value: string; label: string } | string;

type SelectProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options?: Option[];
  className?: string;
};

export default function Select({ label, value, onChange, options = [], className = "" }: SelectProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          )
        )}
      </select>
    </label>
  );
}
