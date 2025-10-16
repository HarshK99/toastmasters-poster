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
  const [loadingGenerateImage, setLoadingGenerateImage] = useState<boolean>(false);
  const [loadingPrompt, setLoadingPrompt] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  function buildFormData(): FormData {
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
    return form;
  }

  // Primary: call the real generation endpoint which returns a URL to the composed poster
  async function handleGenerateImage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoadingGenerateImage(true);
    onResult(null);
    onResultUrl && onResultUrl(null);

    try {
      const form = buildFormData();
      const resp = await fetch("/api/generate-image", { method: "POST", body: form });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg = (data && (data.error || data.message)) || `Server ${resp.status}`;
        throw new Error(msg);
      }

      // success: expected { url: string }
      onResult(data ?? null);
      if (data && typeof data === "object" && (data as any).url) {
        onResultUrl && onResultUrl((data as any).url as string);
      } else {
        onResultUrl && onResultUrl(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoadingGenerateImage(false);
    }
  }

  // Secondary: call the prompt-only endpoint which returns the prompt JSON (no image generation)
  async function handleGeneratePrompt(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setLoadingPrompt(true);
    onResult(null);
    onResultUrl && onResultUrl(null);

    try {
      const form = buildFormData();
      const resp = await fetch("/api/generate", { method: "POST", body: form });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const msg = (data && (data.error || data.message)) || `Server ${resp.status}`;
        throw new Error(msg);
      }

      // return the prompt JSON for inspection
      onResult(data ?? null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoadingPrompt(false);
    }
  }

  return (
    <div className="relative py-10 px-2 md:px-0">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-100 via-yellow-50 to-pink-100 opacity-80 pointer-events-none rounded-xl" />
      <form className="relative z-10 grid gap-8 max-w-2xl mx-auto bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-gray-100" onSubmit={handleGenerateImage}>
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-6 tracking-tight">Create Your Toastmasters Poster</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextInput label="Club name" value={clubName} onChange={setClubName} className="" />
          <TextInput label="Meeting #" value={meetingNumber} onChange={setMeetingNumber} className="" />
          <label className="block">
            <span className="text-sm font-medium text-blue-800">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-blue-800">Time</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1 block w-full border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-300 transition" />
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
            className=""
          />
          <Checkbox label="Overlay provided logo (public/logo.png)" checked={useLogo} onChange={setUseLogo} className="mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FileUploader label="Upload portrait (optional)" onChange={handlePhotoChange} previewSrc={photoPreview} />
          {/* Palette is now fixed in the code and not editable by the user */}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-2">
          <Button type="submit" disabled={loadingGenerateImage || loadingPrompt} className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition disabled:opacity-60">
            {loadingGenerateImage ? "Generating poster..." : "Generate Poster"}
          </Button>

          <button
            type="button"
            onClick={handleGeneratePrompt}
            disabled={loadingPrompt || loadingGenerateImage}
            className="px-6 py-2 border border-yellow-400 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-900 font-semibold shadow-sm transition disabled:opacity-60"
          >
            {loadingPrompt ? "Generating prompt..." : "Generate Prompt JSON"}
          </button>

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
            className="px-6 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow-sm transition"
          >
            Reset
          </button>

          <div className="ml-auto text-sm text-gray-500">Preview is a low-cost sample; final high-res uses production flow</div>
        </div>

        {error && <div className="text-sm text-red-600 mt-2">Error: {error}</div>}
      </form>
    </div>
  );
}
