import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  callAI,
  callAIJson,
  GROUNDING_RULES,
  AiError,
  type ChatMessage,
} from "./ai.server";
import type {
  EmailDraft,
  MeetingAnalysis,
  ResearchReport,
} from "./ai-types";

const emailInput = z.object({
  purpose: z.string().min(1).max(4000),
  recipient: z.string().max(400).default(""),
  context: z.string().max(20000).default(""),
  tone: z.string().max(40).default("Professional"),
  length: z.string().max(40).default("Medium"),
  callToAction: z.string().max(1000).default(""),
  senderName: z.string().max(200).default(""),
});

function fail(error: unknown, fallback: string): never {
  if (error instanceof AiError) throw new Error(error.message);
  console.error(error);
  throw new Error(fallback);
}

export const generateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => emailInput.parse(input))
  .handler(async ({ data }): Promise<EmailDraft> => {
    try {
      return await callAIJson<EmailDraft>([
        { role: "system", content: GROUNDING_RULES },
        {
          role: "user",
          content: `Write a workplace email.

Purpose: ${data.purpose}
Recipient: ${data.recipient || "(unspecified)"}
Background context: ${data.context || "(none provided)"}
Tone: ${data.tone}
Length: ${data.length} (Short = under 90 words, Medium = 120-200 words, Detailed = 250-400 words)
Call to action: ${data.callToAction || "(none provided)"}
Sender name to sign off with: ${data.senderName || "[Your Name]"}

Return JSON: {"subject": string, "body": string}
The body must include a greeting, the message paragraphs and a closing signature. Use \\n for line breaks.`,
        },
      ]);
    } catch (error) {
      fail(error, "Unable to generate your email. Please check your input and try again.");
    }
  });

const transformInput = z.object({
  subject: z.string().max(500).default(""),
  body: z.string().min(1).max(30000),
  instruction: z.string().min(1).max(500),
  senderName: z.string().max(200).default(""),
});

export const transformEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => transformInput.parse(input))
  .handler(async ({ data }): Promise<EmailDraft> => {
    try {
      return await callAIJson<EmailDraft>([
        { role: "system", content: GROUNDING_RULES },
        {
          role: "user",
          content: `Revise the email below. Instruction: ${data.instruction}.
Keep every fact and commitment intact; do not add new facts. Sign off as ${data.senderName || "[Your Name]"}.

Subject: ${data.subject}
Body:
${data.body}

Return JSON: {"subject": string, "body": string}`,
        },
      ]);
    } catch (error) {
      fail(error, "Unable to update your email. Please try again.");
    }
  });

const meetingInput = z.object({
  title: z.string().max(300).default(""),
  date: z.string().max(40).default(""),
  participants: z.string().max(2000).default(""),
  transcript: z.string().min(20).max(120000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => meetingInput.parse(input))
  .handler(async ({ data }): Promise<MeetingAnalysis> => {
    try {
      return await callAIJson<MeetingAnalysis>([
        { role: "system", content: GROUNDING_RULES },
        {
          role: "user",
          content: `Analyse these meeting notes or transcript.

Title: ${data.title || "(untitled)"}
Date: ${data.date || "(unspecified)"}
Participants: ${data.participants || "(unspecified)"}

Notes:
"""
${data.transcript}
"""

Return JSON exactly in this shape:
{
  "summary": string,
  "keyPoints": string[],
  "decisions": string[],
  "actionItems": [{"task": string, "owner": string, "deadline": string, "status": "Not started"}],
  "openQuestions": string[],
  "nextSteps": string[]
}
Only include decisions, owners and deadlines that are explicitly supported by the notes. Use "" for unknown owner or deadline. Return empty arrays where nothing is supported.`,
        },
      ]);
    } catch (error) {
      fail(
        error,
        "We couldn't analyse these meeting notes. Please check the document and try again.",
      );
    }
  });

const researchInput = z.object({
  question: z.string().min(3).max(2000),
  depth: z.string().max(40).default("Standard"),
  format: z.string().max(60).default("Research Brief"),
  context: z.string().max(20000).default(""),
});

export const researchTopic = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => researchInput.parse(input))
  .handler(async ({ data }): Promise<ResearchReport> => {
    try {
      return await callAIJson<ResearchReport>([
        { role: "system", content: GROUNDING_RULES },
        {
          role: "user",
          content: `Research this workplace question and produce a ${data.format}.

Question: ${data.question}
Depth: ${data.depth} (Quick = concise, Standard = balanced, Detailed = thorough)
Additional context: ${data.context || "(none)"}

Return JSON:
{
  "summary": string,
  "findings": string[],
  "analysis": string,
  "benefits": string[],
  "risks": string[],
  "recommendations": string[],
  "sources": [{"title": string, "note": string}]
}
You have no live web access. Do NOT invent citations, URLs, statistics or study names. "sources" must only list the general bodies of knowledge relied on (e.g. "General management literature — no live source retrieved"), and the analysis must state where information may be out of date or uncertain.`,
        },
      ]);
    } catch (error) {
      fail(error, "We couldn't complete the research request. Please try again.");
    }
  });

const followUpInput = z.object({
  report: z.string().min(1).max(60000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(20000) }))
    .max(40)
    .default([]),
  question: z.string().min(1).max(2000),
});

export const askResearchFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => followUpInput.parse(input))
  .handler(async ({ data }): Promise<{ answer: string }> => {
    try {
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `You are a research follow-up assistant. Answer only from the research report below and the user's own words; never invent facts or sources, and say when something is unknown. Reply in clear prose or markdown-style lists.

RESEARCH REPORT:
${data.report}`,
        },
        ...data.history.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
        { role: "user", content: data.question },
      ];
      return { answer: await callAI(messages) };
    } catch (error) {
      fail(error, "We couldn't answer that follow-up. Please try again.");
    }
  });
