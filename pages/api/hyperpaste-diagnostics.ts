import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    appName, bundleId, windowTitle, clipboardURL,
    failedStep, description, osVersion, appVersion, timestamp
  } = req.body;

  if (!bundleId || !failedStep) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `HyperPaste: couldn't paste in ${appName || bundleId}${windowTitle ? ` — ${windowTitle.slice(0, 60)}` : ""}`;

  const row = (label: string, value: string | undefined) =>
    value ? `<tr><td style="padding: 4px 16px 4px 0; font-weight: bold; white-space: nowrap;">${label}</td><td>${value}</td></tr>` : "";

  try {
    await resend.emails.send({
      from: "HyperPaste Diagnostics <info@georgevisan.com>",
      to: "info@georgevisan.com",
      subject,
      html: `
        <h2>HyperPaste Diagnostic Report</h2>
        ${description ? `<p style="font-family: -apple-system, sans-serif; color: #333; margin-bottom: 16px;">${description}</p>` : ""}
        <table style="border-collapse: collapse; font-family: -apple-system, sans-serif;">
          ${row("App", appName ? `${appName} (${bundleId})` : bundleId)}
          ${row("Window", windowTitle)}
          ${row("URL on clipboard", clipboardURL)}
          ${row("Failed step", failedStep)}
          ${row("macOS", osVersion)}
          ${row("HyperPaste", appVersion)}
          ${row("Time", timestamp || new Date().toISOString())}
        </table>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Diagnostics email failed:", error);
    return res.status(500).json({ error: "Failed to send diagnostic email" });
  }
}
