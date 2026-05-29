import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  system: z.string().min(1).max(4000),
  user: z.string().min(1).max(20000),
});

async function callGateway(messages: Array<{ role: string; content: string }>) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI is not configured.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages }),
  });

  if (res.status === 429) throw new Error("Rate limits exceeded — please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
  if (!res.ok) {
    const t = await res.text();
    console.error("AI gateway error:", res.status, t);
    throw new Error("AI request failed. Please try again.");
  }
  const json = await res.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";
  return content;
}

export const generateAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway([
      { role: "system", content: data.system },
      { role: "user", content: data.user },
    ]);
    return { content };
  });

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(40),
});

export const chatAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatSchema.parse(input))
  .handler(async ({ data }) => {
    const system =
      "You are FlowMind, a concise, friendly AI workplace assistant. Help with emails, meetings, tasks, research, and quick questions. Use light markdown (bold, bullets). Keep answers tight unless detail is asked for.";
    const content = await callGateway([
      { role: "system", content: system },
      ...data.messages,
    ]);
    return { content };
  });

