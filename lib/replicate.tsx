// Replicate helper removed — this project no longer calls the Replicate API.
// To preserve imports from other modules during a transitional period, export
// lightweight stubs that throw if called.

export async function uploadToReplicate(): Promise<string> {
  throw new Error('Replicate integration removed.');
}

export async function createPrediction(): Promise<{ id: string; predictionUrl: string }> {
  throw new Error('Replicate integration removed.');
}

export async function pollPrediction(): Promise<never> {
  throw new Error('Replicate integration removed.');
}

export async function downloadUrlToBuffer(): Promise<never> {
  throw new Error('Replicate integration removed.');
}
