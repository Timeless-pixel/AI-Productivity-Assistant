import type { ActivityKind } from "./storage";

export type PromptTemplate = {
  id: string;
  icon: string;
  title: string;
  category: "Communication" | "Planning" | "Research" | "Strategy" | "Creative";
  target: "email" | "research" | "meetings" | "tasks" | "chat";
  description: string;
  prompt: string;
};

export const TEMPLATES: PromptTemplate[] = [
  {
    id: "professional-email",
    icon: "📧",
    title: "Professional Email",
    category: "Communication",
    target: "email",
    description: "A polished business email with clear subject, greeting, body and sign-off.",
    prompt:
      "Write a professional email to [recipient] about [topic]. Include a clear subject line, warm greeting, three concise paragraphs and a courteous closing.",
  },
  {
    id: "meeting-summary",
    icon: "📝",
    title: "Meeting Summary",
    category: "Communication",
    target: "meetings",
    description: "Turn raw meeting notes into a structured summary with decisions and actions.",
    prompt:
      "Summarise the following meeting notes into: 1) Overview, 2) Key decisions, 3) Action items with owners and dates, 4) Open questions.\n\nNotes:\n[paste notes here]",
  },
  {
    id: "research-report",
    icon: "📚",
    title: "Research Report",
    category: "Research",
    target: "research",
    description: "Structured research report with summary, pros, cons and recommendations.",
    prompt:
      "Produce a structured research report on [topic] covering: executive summary, background, key advantages, challenges, market/context, recommendations and follow-up questions.",
  },
  {
    id: "weekly-planner",
    icon: "📅",
    title: "Weekly Task Planner",
    category: "Planning",
    target: "tasks",
    description: "Break down a goal into a realistic 5-day plan with priorities.",
    prompt:
      "Create a realistic weekly plan (Mon–Fri) to achieve [goal]. For each day list 3 prioritised tasks, estimated time, and success criteria.",
  },
  {
    id: "brainstorm",
    icon: "💡",
    title: "Brainstorm Ideas",
    category: "Creative",
    target: "chat",
    description: "Generate a wide variety of creative ideas around a theme.",
    prompt:
      "Brainstorm 15 diverse, creative ideas for [theme]. Group them into 3 themes, and highlight the top 3 with a one-line rationale.",
  },
  {
    id: "business-proposal",
    icon: "📈",
    title: "Business Proposal",
    category: "Strategy",
    target: "chat",
    description: "Draft a short business proposal with problem, solution and ROI.",
    prompt:
      "Draft a one-page business proposal for [initiative]. Cover: problem, proposed solution, benefits, timeline, budget estimate and expected ROI.",
  },
  {
    id: "swot",
    icon: "📊",
    title: "SWOT Analysis",
    category: "Strategy",
    target: "chat",
    description: "A concise SWOT for a product, team or initiative.",
    prompt:
      "Create a SWOT analysis for [subject]. Provide 4–5 bullet points per quadrant (Strengths, Weaknesses, Opportunities, Threats) and a short strategic takeaway.",
  },
  {
    id: "project-summary",
    icon: "📄",
    title: "Project Summary",
    category: "Communication",
    target: "chat",
    description: "A stakeholder-ready summary of a project's status and next steps.",
    prompt:
      "Summarise the status of [project] for stakeholders: goals, progress, blockers, next milestones and asks.",
  },
];

export const TEMPLATE_CATEGORIES = [
  "All",
  "Communication",
  "Planning",
  "Research",
  "Strategy",
  "Creative",
] as const;

export function activityKindFor(t: PromptTemplate): ActivityKind {
  return t.target === "email"
    ? "email"
    : t.target === "research"
      ? "research"
      : t.target === "meetings"
        ? "meeting"
        : t.target === "tasks"
          ? "tasks"
          : "chat";
}