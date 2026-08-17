export type EmailDraft = { subject: string; body: string };

export type ActionItem = {
  task: string;
  owner: string;
  deadline: string;
  status: string;
};

export type MeetingAnalysis = {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  openQuestions: string[];
  nextSteps: string[];
};

export type ResearchSource = { title: string; note: string };

export type ResearchReport = {
  summary: string;
  findings: string[];
  analysis: string;
  benefits: string[];
  risks: string[];
  recommendations: string[];
  sources: ResearchSource[];
};

export const TONES = [
  "Professional",
  "Formal",
  "Friendly",
  "Casual",
  "Persuasive",
  "Apologetic",
  "Executive",
] as const;

export const LENGTHS = ["Short", "Medium", "Detailed"] as const;
export const DEPTHS = ["Quick", "Standard", "Detailed"] as const;
export const FORMATS = [
  "Executive Summary",
  "Research Brief",
  "Business Report",
  "Comparison",
  "Strategic Analysis",
] as const;

export function researchReportToText(question: string, r: ResearchReport): string {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
  return [
    `Research question: ${question}`,
    ``,
    `Summary:\n${r.summary}`,
    ``,
    `Key findings:\n${list(r.findings ?? [])}`,
    ``,
    `Analysis:\n${r.analysis}`,
    ``,
    `Benefits:\n${list(r.benefits ?? [])}`,
    ``,
    `Risks:\n${list(r.risks ?? [])}`,
    ``,
    `Recommendations:\n${list(r.recommendations ?? [])}`,
    ``,
    `Sources:\n${(r.sources ?? []).map((s) => `- ${s.title}${s.note ? ` — ${s.note}` : ""}`).join("\n")}`,
  ].join("\n");
}

export function meetingAnalysisToText(title: string, m: MeetingAnalysis): string {
  const list = (items: string[]) => items.map((i) => `- ${i}`).join("\n");
  return [
    `Meeting: ${title}`,
    ``,
    `Executive summary:\n${m.summary}`,
    ``,
    `Key discussion points:\n${list(m.keyPoints ?? [])}`,
    ``,
    `Decisions:\n${list(m.decisions ?? [])}`,
    ``,
    `Action items:\n${(m.actionItems ?? [])
      .map(
        (a) =>
          `- ${a.task}${a.owner ? ` (owner: ${a.owner})` : ""}${a.deadline ? ` — due ${a.deadline}` : ""}`,
      )
      .join("\n")}`,
    ``,
    `Open questions:\n${list(m.openQuestions ?? [])}`,
    ``,
    `Next steps:\n${list(m.nextSteps ?? [])}`,
  ].join("\n");
}
