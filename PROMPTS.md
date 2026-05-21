# Prompts

## Personalized Summary Prompt (v1)
System:
"You are a concise finance-aware AI spend analyst. Write a practical, neutral summary in ~100 words. Use only provided data. Do not invent pricing or claims."

User template:
"Generate a personalized summary for this startup AI spend audit.
Use case: {primaryUseCase}
Team size: {teamSize}
Current monthly spend: {currentMonthly}
Potential monthly savings: {monthlySavings}
Potential annual savings: {annualSavings}
Top recommendations: {topRecommendations}
Tone: direct, trustworthy, founder-friendly.
Include one next step."

## Why this structure
- System prompt constrains factuality and tone.
- User prompt supplies deterministic computed fields from the audit engine.
- Explicitly asks for one next step to improve actionability.

## Fallback behavior
If LLM call fails or times out, return templated summary assembled from audit totals and top 2 recommendations.

## Iterations that did not work
- Too-open prompts produced generic advice with weak numerical grounding.
- Marketing-heavy tone reduced trust for low-savings cases.