import type { PlanInfo, Vendor } from "../audit/types";

export const pricingByTool: Record<Vendor, PlanInfo[]> = {
  "cursor": [
    { plan: "Hobby", monthlyPriceUsd: 0, type: "seat" },
    { plan: "Pro", monthlyPriceUsd: 20, type: "seat" },
    { plan: "Business", monthlyPriceUsd: 40, type: "seat" },
    { plan: "Enterprise", monthlyPriceUsd: 60, type: "seat" }
  ],
  "github-copilot": [
    { plan: "Individual", monthlyPriceUsd: 10, type: "seat" },
    { plan: "Business", monthlyPriceUsd: 19, type: "seat" },
    { plan: "Enterprise", monthlyPriceUsd: 39, type: "seat" }
  ],
  "claude": [
    { plan: "Free", monthlyPriceUsd: 0, type: "seat" },
    { plan: "Pro", monthlyPriceUsd: 20, type: "seat" },
    { plan: "Max", monthlyPriceUsd: 100, type: "seat" },
    { plan: "Team", monthlyPriceUsd: 30, type: "seat" },
    { plan: "Enterprise", monthlyPriceUsd: 60, type: "seat" },
    { plan: "API direct", monthlyPriceUsd: 120, type: "usage" }
  ],
  "chatgpt": [
    { plan: "Plus", monthlyPriceUsd: 20, type: "seat" },
    { plan: "Team", monthlyPriceUsd: 30, type: "seat" },
    { plan: "Enterprise", monthlyPriceUsd: 60, type: "seat" },
    { plan: "API direct", monthlyPriceUsd: 100, type: "usage" }
  ],
  "anthropic-api": [
    { plan: "API direct", monthlyPriceUsd: 120, type: "usage" }
  ],
  "openai-api": [
    { plan: "API direct", monthlyPriceUsd: 100, type: "usage" }
  ],
  "gemini": [
    { plan: "Pro", monthlyPriceUsd: 20, type: "seat" },
    { plan: "Ultra", monthlyPriceUsd: 40, type: "seat" },
    { plan: "API", monthlyPriceUsd: 90, type: "usage" }
  ],
  "windsurf": [
    { plan: "Free", monthlyPriceUsd: 0, type: "seat" },
    { plan: "Pro", monthlyPriceUsd: 15, type: "seat" },
    { plan: "Team", monthlyPriceUsd: 30, type: "seat" }
  ]
};

export const sameUseCaseAlternatives: Record<string, Vendor[]> = {
  coding: ["cursor", "github-copilot", "windsurf"],
  writing: ["chatgpt", "claude", "gemini"],
  data: ["chatgpt", "claude", "gemini"],
  research: ["chatgpt", "claude", "gemini"],
  mixed: ["chatgpt", "claude", "gemini", "cursor", "github-copilot"]
};

export const creditsDiscountRate = 0.2;
