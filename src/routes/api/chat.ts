import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider, getLovableApiKey } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Nova, a friendly and highly capable AI workplace assistant inside WorkWise AI. You help with workplace questions, productivity, brainstorming, writing, coding, business ideas, and general knowledge. Be warm, concise, and practical. Use markdown formatting (headings, lists, code blocks) when it helps clarity. Never claim to have real-time data you don't have. Remind users to verify important information when relevant.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const messages = body.messages as UIMessage[];
        const gateway = createLovableAiGatewayProvider(getLovableApiKey());
        const result = streamText({
          model: gateway("openai/gpt-5.5"),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});