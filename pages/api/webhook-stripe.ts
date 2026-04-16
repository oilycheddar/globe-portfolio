import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { buffer } from 'micro';

export const config = {
  api: { bodyParser: false },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === 'paid' && session.customer_details?.email) {
      const downloadUrl = `https://www.georgebugg.com/download?session_id=${session.id}`;

      await resend.emails.send({
        from: 'HyperPaste <noreply@georgebugg.com>',
        to: session.customer_details.email,
        subject: 'Your HyperPaste download',
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
            <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Thanks for buying HyperPaste!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 24px;">
              Your download link is below. Bookmark this email if you ever need to re-download.
            </p>
            <a href="${downloadUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Download HyperPaste
            </a>
            <p style="font-size: 13px; line-height: 1.6; color: #888; margin-top: 32px;">
              After downloading, open the app and grant Accessibility permission when prompted. HyperPaste will restart automatically once permission is granted.
            </p>
            <p style="font-size: 13px; color: #888; margin-top: 24px;">
              Questions? Reply to this email.
            </p>
          </div>
        `,
      });
    }
  }

  res.status(200).json({ received: true });
}
