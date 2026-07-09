import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, getLovableApiKey } from "./ai-gateway.server";

const MODEL = "openai/gpt-5.5";

async function runPrompt(system: string, prompt: string) {
  const gateway = createLovableAiGatewayProvider(getLovableApiKey());
  const { text } = await generateText({
    model: gateway(MODEL),
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });
  return text;
}

/* ---------- Email ---------- */
const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  tone: z.string().default("Professional"),
  length: z.string().default("Medium"),
  details: z.string().default(""),
  emailType: z.string().default("General"),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const baseSystem =
      "You are a professional workplace communication expert. Generate a polished email using the user's purpose, recipient, tone, length, and additional details. Include a subject line, greeting, clear body, and professional closing. Format the response as markdown with clearly labeled sections: **Subject:**, then the greeting on its own line, then the body, then the closing.";
    const updateAddendum =
      " This is a PROGRESS UPDATE email. Structure the body to clearly cover, in this order: (1) a brief summary of completed work, (2) the current status of the project or task, (3) any challenges, blockers, or delays (only if mentioned in the details — otherwise omit or note 'no blockers at this time'), (4) the next steps and upcoming milestones. Where information is missing, make reasonable, realistic workplace assumptions and keep the email concise and professional. Respect the requested tone and length.";
    const system = data.emailType === "Update" ? baseSystem + updateAddendum : baseSystem;
    const prompt = `Email type: ${data.emailType}\nPurpose: ${data.purpose}\nRecipient: ${data.recipient || "(unspecified)"}\nTone: ${data.tone}\nLength: ${data.length}\nAdditional details: ${data.details || "(none)"}`;
    return { text: await runPrompt(system, prompt) };
  });

/* ---------- Research ---------- */
const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.string().default("Standard"),
});

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are an experienced research assistant. Produce a clear, accurate, well-structured report in markdown with these sections in order: ## Executive Summary, ## Key Points (bullets), ## Advantages (bullets), ## Challenges (bullets), ## Recommendations (bullets), ## Suggested Follow-up Questions (numbered). Be concise, practical, and accurate.";
    const prompt = `Research topic: ${data.topic}\nDesired depth: ${data.depth}`;
    return { text: await runPrompt(system, prompt) };
  });

/* ---------- Meeting ---------- */
const MeetingInput = z.object({ notes: z.string().min(1) });

export const summariseMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are a workplace meeting assistant. Analyse the meeting transcript or notes and produce a markdown report with sections: ## Meeting Summary, ## Key Discussion Points, ## Decisions Made, ## Action Items (with owner if mentioned), ## Deadlines, ## Next Steps. Be concise, faithful, and clear.";
    return { text: await runPrompt(system, data.notes) };
  });

/* ---------- Tasks ---------- */
const TasksInput = z.object({ goal: z.string().min(1) });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TasksInput.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are a professional productivity coach. Break the user's workplace goal into achievable tasks organised by priority and timeline. Reply in markdown with these sections: ## Task Breakdown (numbered list, each task on its own line prefixed with `- [ ]` for a checkbox, followed by the task title, then in italics the priority and estimated duration, e.g. `- [ ] Draft outline — *High priority · 45 min*`). Then ## Daily Schedule (bullets by day), ## Risks (bullets), ## Recommendations (bullets).";
    return { text: await runPrompt(system, `Workplace goal: ${data.goal}`) };
  });