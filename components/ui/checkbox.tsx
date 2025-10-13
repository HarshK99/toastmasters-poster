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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4" />
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
}
