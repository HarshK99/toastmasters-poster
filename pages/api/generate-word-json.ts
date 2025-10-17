// pages/api/generate-word-json.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { theme, level } = req.body || {};
  if (!theme || !level) {
    return res.status(400).json({ error: "Missing required fields: theme, level." });
  }

  // Simulate AI response (replace with real AI call as needed)
  // You can enhance this logic to call an LLM or external API
  const samples = [
    {
      word: "Ebullient",
      meaning: "Cheerful and full of energy.",
      example: "Her ebullient personality made her the life of the party."
    },
    {
      word: "Sagacious",
      meaning: "Having or showing keen mental discernment and good judgment; wise or shrewd.",
      example: "The sagacious leader guided the team through difficult times."
    },
    {
      word: "Serendipity",
      meaning: "The occurrence and development of events by chance in a happy or beneficial way.",
      example: "Finding the book was pure serendipity."
    }
  ];
  // Pick a random sample for demonstration
  const pick = samples[Math.floor(Math.random() * samples.length)];

  res.status(200).json(pick);
}
