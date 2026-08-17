/** Cross-tool handoff: carries context between the email, meeting and research tools. */
export type EmailHandoff = {
  purpose?: string;
  context?: string;
  recipient?: string;
  callToAction?: string;
  tone?: string;
};

export type ResearchHandoff = {
  question?: string;
  context?: string;
};

const KEYS = { email: "handoff:email", research: "handoff:research" } as const;

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

function take<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  sessionStorage.removeItem(key);
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const setEmailHandoff = (v: EmailHandoff) => write(KEYS.email, v);
export const takeEmailHandoff = () => take<EmailHandoff>(KEYS.email);
export const setResearchHandoff = (v: ResearchHandoff) => write(KEYS.research, v);
export const takeResearchHandoff = () => take<ResearchHandoff>(KEYS.research);
