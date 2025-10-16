import React from "react";

type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
};

export default function Checkbox({ label, checked, onChange, className = "" }: CheckboxProps) {
  return (
    <label className={`flex items-center space-x-3 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-blue-300 text-blue-700 focus:ring-2 focus:ring-blue-300 transition duration-150 shadow-sm hover:border-blue-400"
      />
      {label && <span className="text-sm font-medium text-blue-800">{label}</span>}
    </label>
  );
}
