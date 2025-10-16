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
      {label && <div className="text-sm font-medium text-blue-800 mb-1">{label}</div>}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="mt-1 block w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition-all duration-150 shadow-sm hover:border-blue-400 bg-white"
      />
      {previewSrc && (
        <div className="mt-3 border border-blue-200 rounded-xl p-2 inline-block shadow-sm bg-blue-50">
          <img src={previewSrc} alt="preview" className="w-48 h-auto object-cover rounded-xl" />
        </div>
      )}
    </div>
  );
}
