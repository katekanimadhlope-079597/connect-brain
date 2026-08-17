const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class AiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export async function callAI(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("AI service is not configured.", 500);

  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model: MODEL, messages, stream: false }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 429)
      throw new AiError("The AI service is busy right now. Please try again in a moment.", 429);
    if (res.status === 402)
      throw new AiError("AI credits are exhausted. Please add credits to continue.", 402);
    if (res.status === 403)
      throw new AiError("AI access is currently blocked for this workspace.", 403);
    throw new AiError(`AI request failed (${res.status}). ${detail.slice(0, 200)}`, res.status);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new AiError("The AI returned an empty response. Please try again.", 502);
  return text;
}

function stripFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }
  return trimmed;
}

export async function callAIJson<T>(messages: ChatMessage[]): Promise<T> {
  const raw = await callAI(messages);
  const cleaned = stripFences(raw);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as T;
      } catch {
        /* fall through */
      }
    }
    throw new AiError("The AI response could not be read. Please try again.", 502);
  }
}

export const GROUNDING_RULES = `You are an accurate workplace AI assistant.
Rules you must never break:
- Never invent facts, decisions, deadlines, owners, names, statistics or sources.
- Only attribute an owner or deadline when the source material clearly supports it; otherwise use an empty string.
- Clearly flag uncertainty in the text rather than guessing.
- Preserve the user's intended meaning and language register.
- Respond with valid JSON only, with no markdown fences and no commentary.`;
