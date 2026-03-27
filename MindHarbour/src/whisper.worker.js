import { pipeline, env } from "@xenova/transformers";

env.allowLocalModels = false;
env.useBrowserCache = true;

let transcriber = null;

self.onmessage = async ({ data: { audio, language } }) => {
  try {
    if (!transcriber) {
      transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny",
        {
          progress_callback: (p) => {
            if (p.status === "progress") {
              self.postMessage({ status: "loading", progress: Math.round(p.progress) });
            }
          },
        }
      );
    }

    self.postMessage({ status: "transcribing" });

    const result = await transcriber(audio, {
      language,
      task: "transcribe",
    });

    self.postMessage({ status: "done", text: result.text.trim() });
  } catch (err) {
    self.postMessage({ status: "error", error: err.message });
  }
};
