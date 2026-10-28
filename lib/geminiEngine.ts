import { BriefArgs } from "@/types";
import { BUILD_CONTENT_TOOL, SCHEMAS } from "@/constants/prompts";

// Legacy/Deprecated model migration map
const MODEL_MIGRATIONS: Record<string, string> = {
  "gemini-2.5-pro": "gemini-3.1-pro-preview",
  "models/gemini-2.5-pro": "gemini-3.1-pro-preview"
};

export function resolveModelName(model: string): string {
  if (!model) return "gemini-2.5-flash";
  const clean = model.replace(/^models\//, "").trim();
  return MODEL_MIGRATIONS[clean] || MODEL_MIGRATIONS[model] || clean;
}

export interface GeminiModelInfo {
  name: string;
  displayName: string;
  description?: string;
  isRecommended?: boolean;
}

/**
 * Dynamically queries Google Generative Language API for models available to this API key.
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models?key=...
 */
export async function fetchAvailableModels(apiKey: string): Promise<GeminiModelInfo[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`
    );

    if (!res.ok) {
      console.warn(`Models list endpoint returned HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const rawModels: any[] = data.models || [];

    const available: GeminiModelInfo[] = rawModels
      .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m: any) => {
        const id = m.name.replace(/^models\//, "");
        return {
          name: id,
          displayName: m.displayName || id,
          description: m.description,
          isRecommended: /gemini-3\.1-pro|gemini-2\.5-flash|gemini-3-flash/i.test(id)
        };
      })
      // Filter out legacy models that error for new users
      .filter((m) => m.name !== "gemini-2.5-pro");

    return available;
  } catch (err) {
    console.error("Failed to query Gemini models list:", err);
    return [];
  }
}

/**
 * Structured JSON generator supporting both Google's Interactions API and GenerateContent API.
 */
export async function gemJSON(
  apiKey: string,
  rawModel: string,
  systemInstruction: string,
  userPrompt: string,
  schema: any
): Promise<any> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("Gemini API key is missing. Add your key in Settings.");
  }

  const model = resolveModelName(rawModel);

  // 1. First attempt: Interactions API (Google's latest recommended API)
  // Ref: https://ai.google.dev/gemini-api/docs/get-started
  try {
    const interactionEndpoint = "https://generativelanguage.googleapis.com/v1beta/interactions";
    const interactionPayload = {
      model: model,
      input: `${systemInstruction}\n\nTask Input:\n${userPrompt}`,
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: schema
      }
    };

    const iRes = await fetch(interactionEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": cleanKey
      },
      body: JSON.stringify(interactionPayload)
    });

    if (iRes.ok) {
      const iData = await iRes.json();
      const rawText =
        iData.output_text ||
        iData.steps?.[iData.steps.length - 1]?.content?.[0]?.text;

      if (rawText) {
        return JSON.parse(rawText);
      }
    }
  } catch (iErr) {
    // If Interactions API fails or is not yet enabled for this model, fall through to generateContent
    console.debug("Interactions API fallback to generateContent:", iErr);
  }

  // 2. GenerateContent API with Structured JSON Schema
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

  const generationConfig: any = {
    responseMimeType: "application/json",
    responseSchema: schema,
    temperature: 0.85
  };

  if (/2\.5-flash/.test(model)) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini API returned status ${res.status}`;

    // Auto-migrate if Google returns the legacy model deprecation warning
    if (/no longer available to new users|gemini-2\.5-pro/i.test(msg)) {
      console.warn("Auto-migrating legacy gemini-2.5-pro to gemini-3.1-pro-preview...");
      return gemJSON(apiKey, "gemini-3.1-pro-preview", systemInstruction, userPrompt, schema);
    }

    throw new Error(msg);
  }

  const data = await res.json();
  const text =
    data.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "";

  if (!text) {
    throw new Error("Empty response received from Gemini.");
  }

  return JSON.parse(text);
}

const FALLBACK_IMAGE_MODELS = [
  "gemini-2.5-flash-image",
  "gemini-2.5-flash-image-preview",
  "gemini-2.0-flash-preview-image-generation"
];

export async function gemImage(
  apiKey: string,
  preferredModel: string,
  prompt: string,
  aspect: "1:1" | "16:9" | "4:5" | "9:16"
): Promise<string> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("Gemini API key is missing for image generation.");
  }

  const models = [
    preferredModel,
    ...FALLBACK_IMAGE_MODELS.filter((m) => m !== preferredModel)
  ];

  let lastError: any = null;

  for (const model of models) {
    for (let withAspect = 1; withAspect >= 0; withAspect--) {
      try {
        const gc: any = { responseModalities: ["TEXT", "IMAGE"] };
        if (withAspect && aspect && !/2\.0/.test(model)) {
          gc.imageConfig = { aspectRatio: aspect };
        } else if (withAspect) {
          continue;
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model
        )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: gc
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData?.error?.message || `HTTP ${res.status}`;
          if (/quota|limit: 0|billing/i.test(errMsg)) {
            throw new Error(
              "Image quota is 0 on this Gemini project. Enable billing in Google Cloud or try another key."
            );
          }
          throw new Error(errMsg);
        }

        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];

        for (const part of parts) {
          const d = part.inlineData || part.inline_data;
          if (d && d.data) {
            return `data:${d.mimeType || d.mime_type || "image/png"};base64,${d.data}`;
          }
        }

        lastError = new Error("Model responded without an image part");
      } catch (e: any) {
        lastError = e;
        const msg = String(e.message || e);
        if (/imageConfig|aspect/i.test(msg)) continue;
        if (/not found|unknown name|404/i.test(msg)) break;
        if (/quota|billing/i.test(msg)) throw e;
      }
    }
  }

  throw lastError || new Error("No available image model could fulfill the request.");
}

export async function argsFromTranscript(
  apiKey: string,
  model: string,
  transcript: string
): Promise<BriefArgs> {
  const p: any = {};
  const toolProps = BUILD_CONTENT_TOOL.function.parameters.properties;
  Object.keys(toolProps).forEach((k) => {
    p[k] = { type: "STRING", description: (toolProps as any)[k].description };
  });

  const schema = {
    type: "OBJECT",
    properties: p,
    required: ["idea"]
  };

  const systemPrompt = `Extract the brief for build_content from this interview. The call may be in English or Hinglish; write the brief in clear English. If the caller had no idea and picked one of Riya's suggested ideas, use that chosen idea in full as the idea. Use the caller exact facts and words. Leave a field empty if never said. Never write 'no idea' as the idea.`;

  return gemJSON(apiKey, model, systemPrompt, "Interview:\n" + transcript, schema);
}

export async function testGeminiConnection(
  apiKey: string,
  rawModel: string
): Promise<{
  success: boolean;
  latencySec: number;
  resolvedModel: string;
  sampleTitle?: string;
  error?: string;
}> {
  const t0 = Date.now();
  const model = resolveModelName(rawModel);
  try {
    const res = await gemJSON(
      apiKey,
      model,
      "Reply strictly as valid JSON.",
      "One hook line about authentic Indian chai.",
      SCHEMAS.news
    );
    const latencySec = (Date.now() - t0) / 1000;
    return { success: true, latencySec, resolvedModel: model, sampleTitle: res.title };
  } catch (e: any) {
    return { success: false, latencySec: 0, resolvedModel: model, error: e.message };
  }
}
