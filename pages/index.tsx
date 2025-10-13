import React, { useRef, useState } from "react";
import type { NextPage } from "next";
import Button from "@/components/ui/button";
import TextInput from "@/components/ui/textInput";
import Select from "@/components/ui/select";
import Checkbox from "@/components/ui/checkbox";
import FileUploader from "@/components/ui/fileUploader";
import { ColorSwatch } from "@/components/ui/colorSwatch";

const Home: NextPage = () => {
  const [clubName, setClubName] = useState<string>("Bright Beginning Toastmasters");
  const [meetingNumber, setMeetingNumber] = useState<string>("274");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [place, setPlace] = useState<string>("Community Hall / Zoom");
  const [zoomLink, setZoomLink] = useState<string>("");
  const [theme, setTheme] = useState<string>("Diwali Celebration");
  const [stylePreset, setStylePreset] = useState<string>("minimalist");
  const [useLogo, setUseLogo] = useState<boolean>(true);

  const [palette, setPalette] = useState<{ primary: string; accent: string; bg: string; text: string }>({
    primary: "#0B3D91",
    accent: "#E94B35",
    bg: "#FFFFFF",
    text: "#111827",
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handlePhotoChange(file: File | null) {
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);
    setLoading(true);
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
      if (!resp.ok) {
        const j = await resp.json().catch(() => null);
        throw new Error(j?.error || `Server ${resp.status}`);
      }
      const data = await resp.json();
      if (!data?.url) throw new Error("No URL returned");
      setResultUrl(data.url);
      setTimeout(() => {
        const el = document.getElementById("poster-preview");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Toastmasters Poster Builder</h1>
          <p className="text-sm text-gray-600 mt-1">Short inputs → stylized poster. Upload portrait and your logo (logo is read server-side from public/logo.svg).</p>
        </header>

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
                setResultUrl(null);
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

        <section id="poster-preview" className="mt-8">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Preview / Result</h2>

          {loading && <div className="rounded border p-6 bg-white shadow text-gray-600">Generating poster — this may take a few seconds.</div>}

          {resultUrl && (
            <div className="bg-white p-4 rounded shadow">
              <div className="mb-3">
                <a href={resultUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                  Open poster in new tab
                </a>
              </div>
              <img src={resultUrl} alt="poster" className="max-w-full border" />
              <div className="mt-3 flex space-x-2">
                <a href={resultUrl} download className="px-3 py-2 border rounded text-sm">
                  Download
                </a>
                <button className="px-3 py-2 border rounded text-sm" onClick={() => navigator.clipboard?.writeText(resultUrl)}>
                  Copy URL
                </button>
              </div>
            </div>
          )}

          {!loading && !resultUrl && <div className="text-sm text-gray-500">No preview yet. Fill inputs and click Generate Poster.</div>}
        </section>
      </div>
    </div>
  );
};

export default Home;
