// lib/replicate.ts
import fs from "fs";
import path from "path";

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_TOKEN) throw new Error("Set REPLICATE_API_TOKEN in env");

const REPLICATE_BASE = "https://api.replicate.com/v1";

/**
 * Minimal types for Replicate responses (only the fields we use)
 */
type UploadResponse = {
  id?: string;
  url?: string;
  // other fields ignored
};

type PredictionCreateResponse = {
  id: string;
  version?: string;
  // some Replicate responses include 'urls' or 'webhook'; we only need id
  // other fields ignored
};

type PredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "failed"
  | "canceled"
  | string;

type Prediction = {
  id: string;
  status: PredictionStatus;
  output?: unknown[]; // often array of urls or base64 strings depending on model
  error?: string | { message?: string } | null;
  // other fields omitted
};

function buildPredictionUrlFromId(id: string) {
  return `${REPLICATE_BASE}/predictions/${id}`;
}

/**
 * Upload local file to Replicate uploads endpoint.
 * Returns the upload URL (string).
 */
export async function uploadToReplicate(localFilePath: string): Promise<string> {
  // read file
  const buffer = fs.readFileSync(localFilePath);
  const res = await fetch(`${REPLICATE_BASE}/uploads`, {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      "Content-Type": "application/octet-stream",
    },
    body: buffer,
  });

  const json = (await res.json()) as UploadResponse;
  if (!res.ok) {
    const bodyText = JSON.stringify(json);
    throw new Error(`Replicate upload failed: ${res.status} ${bodyText}`);
  }

  if (!json.url) {
    throw new Error("Replicate upload did not return an upload URL");
  }

  return json.url;
}

/**
 * Create a prediction. `version` should be the pinned model version id string
 * (e.g. "prunaai/hidream-l1-fast@<VERSION_ID>" or just the version id depending on Replicate usage).
 * Returns { id, predictionUrl } so callers can poll.
 */
export async function createPrediction(version: string, input: Record<string, unknown>): Promise<{ id: string; predictionUrl: string }> {
  const body = {
    version,
    input,
  };

  const res = await fetch(`${REPLICATE_BASE}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${REPLICATE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as PredictionCreateResponse;
  if (!res.ok) {
    throw new Error(`Failed to create prediction: ${res.status} ${JSON.stringify(json)}`);
  }

  if (!json.id) {
    throw new Error(`Replicate createPrediction missing id: ${JSON.stringify(json)}`);
  }

  const predictionUrl = buildPredictionUrlFromId(json.id);
  return { id: json.id, predictionUrl };
}

/**
 * Poll prediction until finished. Accepts prediction id or full prediction URL.
 * Returns the final Prediction object.
 */
export async function pollPrediction(predictionIdOrUrl: string, timeoutMs = 120_000, intervalMs = 1500): Promise<Prediction> {
  const url = predictionIdOrUrl.startsWith("http") ? predictionIdOrUrl : buildPredictionUrlFromId(predictionIdOrUrl);
  const start = Date.now();

  while (true) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${REPLICATE_TOKEN}`,
      },
    });

    const json = (await res.json()) as Prediction;
    if (!res.ok) {
      throw new Error(`Failed to poll prediction: ${res.status} ${JSON.stringify(json)}`);
    }

    if (json.status === "succeeded") return json;
    if (json.status === "failed" || json.status === "canceled") {
      const errMsg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
      throw new Error(`Prediction ${json.status}: ${errMsg}`);
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Prediction polling timed out");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

/**
 * Download a URL to Buffer (for image outputs).
 */
export async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}
