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

  const displayApp = appName || bundleId;
  const subject = `HyperPaste failed in ${displayApp}`;

  const stepExplanations: Record<string, string> = {
    selected_text: "Couldn't read the selected text (AX API and Cmd+C fallback both failed)",
  };

  const formatTime = (ts: string | undefined) => {
    if (!ts) return new Date().toLocaleString("en-US", { timeZone: "America/Denver" });
    try {
      return new Date(ts).toLocaleString("en-US", {
        timeZone: "America/Denver",
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit", hour12: true,
      });
    } catch { return ts; }
  };

  const what = description || stepExplanations[failedStep] || failedStep;

  try {
    await resend.emails.send({
      from: "HyperPaste Diagnostics <info@georgebugg.com>",
      to: "info@georgebugg.com",
      subject,
      html: `
        <div style="font-family: -apple-system, sans-serif; color: #333; max-width: 480px;">
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 20px;">
            <strong>${displayApp}</strong>${windowTitle ? ` — ${windowTitle}` : ""}<br>
            ${what}
          </p>
          ${clipboardURL ? `<p style="font-size: 13px; margin: 0 0 20px; color: #666;">URL on clipboard: <a href="${clipboardURL}" style="color: #0066cc;">${clipboardURL.length > 80 ? clipboardURL.slice(0, 80) + "…" : clipboardURL}</a></p>` : ""}
          <p style="font-size: 12px; color: #999; margin: 0;">
            v${appVersion || "?"} · macOS ${osVersion || "?"} · ${formatTime(timestamp)}
          </p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Diagnostics email failed:", error);
    return res.status(500).json({ error: "Failed to send diagnostic email" });
  }
}
