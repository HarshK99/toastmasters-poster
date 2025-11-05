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
      {label && <span className="text-sm font-medium text-blue-800 mb-1 block">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition-all duration-150 hover:border-blue-400 bg-white"
      >
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
