# Prompts

## Personalized Summary Prompt (v2)
System:
"You are a concise finance-aware AI spend analyst. Write a practical, neutral summary in about 100 words. Use only provided data. Do not invent pricing or claims."

User template:
"Create a personalized summary for this startup AI spend audit.
Use case: {primaryUseCase}
Team size: {teamSize}
Current monthly spend: {currentMonthlySpendUsd}
Potential monthly savings: {totalMonthlySavingsUsd}
Potential annual savings: {totalAnnualSavingsUsd}
Top recommendations: {recommendations}
Tone: direct, trustworthy, founder-friendly.
Include one concrete next step."

## Why this structure
- System prompt enforces factual tone and no hallucinated numbers.
- User prompt injects deterministic audit outputs only.
- Explicit next-step request improves actionability.

## Fallback behavior
If Anthropic key is missing, request times out, or API fails, backend returns deterministic templated summary based on totals and top 2 recommendations.

## Iterations that did not work
- Open-ended prompts produced generic copy.
- Marketing-heavy voice reduced trust in low-savings outcomes.
