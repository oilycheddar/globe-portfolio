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

  const { bundleId, osVersion, appVersion, failedStep, timestamp } = req.body;

  if (!bundleId || !failedStep) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await resend.emails.send({
      from: "HyperPaste Diagnostics <info@georgevisan.com>",
      to: "info@georgevisan.com",
      subject: `HyperPaste failure: ${failedStep} in ${bundleId}`,
      html: `
        <h2>HyperPaste Diagnostic Report</h2>
        <table style="border-collapse: collapse; font-family: -apple-system, sans-serif;">
          <tr><td style="padding: 4px 16px 4px 0; font-weight: bold;">App</td><td>${bundleId}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; font-weight: bold;">Failed Step</td><td>${failedStep}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; font-weight: bold;">macOS</td><td>${osVersion || "unknown"}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; font-weight: bold;">App Version</td><td>${appVersion || "unknown"}</td></tr>
          <tr><td style="padding: 4px 16px 4px 0; font-weight: bold;">Time</td><td>${timestamp || new Date().toISOString()}</td></tr>
        </table>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Diagnostics email failed:", error);
    return res.status(500).json({ error: "Failed to send diagnostic email" });
  }
}
