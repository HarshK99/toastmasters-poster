import React from "react";

type FileUploaderProps = {
  label?: string;
  accept?: string;
  onChange: (file: File | null) => void;
  previewSrc?: string | null;
};

export default function FileUploader({ label, accept = "image/*", onChange, previewSrc = null }: FileUploaderProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  return (
    <div>
      {label && <div className="text-sm text-gray-700">{label}</div>}
      <input type="file" accept={accept} onChange={handleChange} className="mt-1 block" />
      {previewSrc && (
        <div className="mt-3 border rounded p-2 inline-block">
          <img src={previewSrc} alt="preview" className="w-48 h-auto object-cover rounded" />
        </div>
      )}
    </div>
  );
}
