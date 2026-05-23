import type { Vendor } from "./types";

export const SUPPORTED_TOOLS: Vendor[] = [
  "cursor",
  "github-copilot",
  "claude",
  "chatgpt",
  "anthropic-api",
  "openai-api",
  "gemini",
  "windsurf"
];

export function vendorLabel(vendor: Vendor): string {
  const map: Record<Vendor, string> = {
    cursor: "Cursor",
    "github-copilot": "GitHub Copilot",
    claude: "Claude",
    chatgpt: "ChatGPT",
    "anthropic-api": "Anthropic API",
    "openai-api": "OpenAI API",
    gemini: "Gemini",
    windsurf: "Windsurf"
  };

  return map[vendor];
}
