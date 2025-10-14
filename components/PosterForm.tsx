import React, { useRef, useState } from "react";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/textInput";
import Select from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox";
import FileUploader from "@/components/ui/fileUploader";
import { ColorSwatch } from "@/components/ui/colorSwatch";

export type PromptResponse = unknown;

type PosterFormProps = {
  onResult: (data: PromptResponse | null) => void;
  onResultUrl?: (url: string | null) => void;
};

export default function PosterForm({ onResult, onResultUrl }: PosterFormProps) {
  const [clubName, setClubName] = useState<string>("Bright Beginning Toastmasters Club");
  const [meetingNumber, setMeetingNumber] = useState<string>("274");
  const [date, setDate] = useState<string>("2025-07-05");
  const [time, setTime] = useState<string>("10:30");
  const [place, setPlace] = useState<string>("Community Hall / Zoom");
  const [zoomLink, setZoomLink] = useState<string>("bit.ly/tmbbc");
  const [theme, setTheme] = useState<string>("Diwali Celebration");
  const [stylePreset, setStylePreset] = useState<string>("minimalist");
  const [useLogo, setUseLogo] = useState<boolean>(true);

  const [palette, setPalette] = useState<{ primary: string; primary_2: string; accent: string; bg: string; text: string }>(
    {
      primary: "#004165",
      primary_2: "#772432",
      accent: "#F2DF74",
      bg: "#FFFFFF",
      text: "#111827",
    }
  );

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);
    onResult(null);
    onResultUrl && onResultUrl(null);

    try {
      const form = new FormData();
      form.append("clubName", clubName);
      form.append("meetingNumber", meetingNumber);
      form.append("date", date);
      form.append("time", time);
      form.append("place", place);
      form.append("zoomLink", zoomLink);
      form.append("theme", theme);
      form.append("stylePreset", stylePreset);
      form.append("paletteJson", JSON.stringify(palette));
      form.append("useLogo", useLogo ? "1" : "0");
      if (photoFile) form.append("photo", photoFile);

      const resp = await fetch("/api/generate", { method: "POST", body: form });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg = (data && (data.error || data.message)) || `Server ${resp.status}`;
        throw new Error(msg);
      }

      // return whatever the API returned: prompts json or { url }
      onResult(data ?? null);
      if (data && typeof data === "object" && (data as any).url) {
        onResultUrl && onResultUrl((data as any).url as string);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleGenerate} className="grid gap-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput label="Club name" value={clubName} onChange={setClubName} />
        <TextInput label="Meeting #" value={meetingNumber} onChange={setMeetingNumber} />
        <label className="block">
          <span className="text-sm text-gray-700">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Time</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </label>
        <TextInput label="Place" value={place} onChange={setPlace} className="md:col-span-2" />
        <TextInput label="Zoom link" value={zoomLink} onChange={setZoomLink} className="md:col-span-2" />
        <TextInput label="Theme" value={theme} onChange={setTheme} className="md:col-span-2" />
        <Select
          label="Style preset"
          value={stylePreset}
          onChange={setStylePreset}
          options={[
            { value: "minimalist", label: "Minimalist" },
            { value: "vintage", label: "Vintage" },
            { value: "bold", label: "Bold" },
            { value: "photorealistic", label: "Photorealistic" },
            { value: "illustrative", label: "Illustrative" },
          ]}
        />
        <Checkbox label="Overlay provided logo (public/logo.png)" checked={useLogo} onChange={setUseLogo} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploader label="Upload portrait (optional)" onChange={handlePhotoChange} previewSrc={photoPreview} />
        <div>
          <div className="text-sm text-gray-700">Palette (editable)</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <ColorSwatch label="primary" value={palette.primary} onChange={(v) => setPalette((p) => ({ ...p, primary: v }))} />
            </div>
            <div>
              <ColorSwatch label="accent" value={palette.accent} onChange={(v) => setPalette((p) => ({ ...p, accent: v }))} />
            </div>
            <div>
              <ColorSwatch label="bg" value={palette.bg} onChange={(v) => setPalette((p) => ({ ...p, bg: v }))} />
            </div>
            <div>
              <ColorSwatch label="text" value={palette.text} onChange={(v) => setPalette((p) => ({ ...p, text: v }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Poster"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setClubName("");
            setMeetingNumber("");
            setDate("");
            setTime("");
            setPlace("");
            setZoomLink("");
            setTheme("");
            setPhotoFile(null);
            setPhotoPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            onResult(null);
            onResultUrl && onResultUrl(null);
            setError(null);
          }}
          className="px-4 py-2 border rounded"
        >
          Reset
        </button>
        <div className="ml-auto text-sm text-gray-500">Preview is a low-cost sample; final high-res uses production flow</div>
      </div>

      {error && <div className="text-sm text-red-600">Error: {error}</div>}
    </form>
  );
}
