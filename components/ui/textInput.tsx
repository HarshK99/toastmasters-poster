import React from "react";

type TextInputProps = {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
};

export default function TextInput({ label, value, onChange, placeholder = "", type = "text", className = "" }: TextInputProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="text-sm font-medium text-blue-800 mb-1 block">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition-all duration-150 shadow-sm hover:border-blue-400"
      />
    </label>
  );
}
