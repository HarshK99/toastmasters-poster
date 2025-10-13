// lib/replicate.js
import fetch from "node-fetch";
import fs from "fs";

const REPLICATE_API = "https://api.replicate.com/v1";
const TOKEN = process.env.REPLICATE_API_TOKEN;
if (!TOKEN) throw new Error("Set REPLICATE_API_TOKEN");

async function callReplicate(endpoint, body) {
  const r = await fetch(`${REPLICATE_API}${endpoint}`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await r.json();
  if (!r.ok) throw new Error(JSON.stringify(data));
  // Return first output URL or polling info depending on model
  // For brevity, assume outputs[0].url (adjust for specific model)
  if (data && data.output && data.output.length) return data.output[0];
  return data;
}

export async function runReplicateTextToImage(prompt) {
  // Example model: "stability-ai/stable-diffusion" or another photoreal model on Replicate
  const model = "stability-ai/stable-diffusion"; // replace with preferred slug
  const resp = await callReplicate(`/predictions`, {
    version: "db21e45f..", // replace with model version if required
    input: { prompt, width: 1024, height: 1280 }
  });
  return resp;
}

export async function runReplicateImg2Img(imagePath, prompt) {
  // upload image to replicate or pass as input url (here we upload a simple Buffer approach)
  const imageData = fs.readFileSync(imagePath);
  // For many Replicate models you can supply a base64 or presigned URL. Simplified here:
  const uploadResp = await fetch("https://api.replicate.com/v1/uploads", {
    method: "POST",
    headers: { "Authorization": `Token ${TOKEN}` },
    body: imageData
  });
  const uploadJson = await uploadResp.json();
  const imageUrl = uploadJson && uploadJson.url;
  const model = "stability-ai/stable-diffusion"; // choose an img2img-capable model
  const pred = await callReplicate(`/predictions`, {
    version: "db21e45f..",
    input: { image: imageUrl, prompt, width: 1024, height: 1280 }
  });
  return pred;
}
