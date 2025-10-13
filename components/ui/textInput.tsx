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
      {label && <span className="text-sm text-gray-700">{label}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full border rounded px-3 py-2"
      />
    </label>
  );
}
