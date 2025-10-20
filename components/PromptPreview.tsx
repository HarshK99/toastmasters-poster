import React from "react";

type PromptPreviewProps = {
  data: unknown | null;
  className?: string;
};

export default function PromptPreview({ data, className = "" }: PromptPreviewProps) {
  if (!data) {
    return (
      <div className={`mt-6 p-4 border border-dashed text-sm text-gray-500 rounded ${className}`}>
        No prompt JSON yet. Generate to preview.
      </div>
    );
  }

  const jsonString = JSON.stringify(data, null, 2);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(jsonString);
      // optional small UX: alert or toast (avoid alert in production)
       
      alert("Prompt JSON copied to clipboard");
    } catch {
      // fallback: create a temporary textarea
      const ta = document.createElement("textarea");
      ta.value = jsonString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
       
      alert("Prompt JSON copied to clipboard (fallback)");
    }
  }

  function handleDownload() {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prompt.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`mt-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Returned Prompt JSON</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Copy JSON
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50"
          >
            Download
          </button>
        </div>
      </div>

      <pre className="bg-gray-900 text-green-300 text-sm p-4 rounded-lg overflow-auto whitespace-pre-wrap max-h-96">
        {jsonString}
      </pre>
    </div>
  );
}
