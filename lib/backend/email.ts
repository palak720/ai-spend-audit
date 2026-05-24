interface SendLeadConfirmationInput {
  toEmail: string;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
}

export async function sendLeadConfirmationEmail(input: SendLeadConfirmationInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Missing Resend configuration");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [input.toEmail],
      subject: "Your AI Spend Audit Report",
      html: `<p>Thanks for using AI Spend Auditor.</p><p>Estimated savings: <strong>$${input.monthlySavingsUsd.toFixed(2)}/month</strong> and <strong>$${input.annualSavingsUsd.toFixed(2)}/year</strong>.</p><p>If your savings are high, Credex can help you capture more of that upside.</p>`
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend failed: ${text}`);
  }
}
