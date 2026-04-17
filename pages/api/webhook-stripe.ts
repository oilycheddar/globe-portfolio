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
        from: 'George <info@georgevisan.com>',
        to: session.customer_details.email,
        subject: 'Pasting links just got better',
        html: `
          <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
            <p style="font-size: 16px; line-height: 1.7; color: #111; margin: 0 0 24px;">Hey there,</p>
            <p style="font-size: 16px; line-height: 1.7; color: #111; margin: 0 0 24px;">Thanks for downloading HyperPaste. Installing is easy. Just open the app, accept the system permissions, and that's it. Whether it's Gmail, Notes, or Google Docs, you can now create hyperlinks by pasting them directly onto text.</p>
            <p style="font-size: 16px; line-height: 1.7; color: #111; margin: 0 0 16px;">Here's your unique download link:</p>
            <a href="${downloadUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">Download HyperPaste</a>
            <p style="font-size: 16px; line-height: 1.7; color: #111; margin: 48px 0 0;">Thanks for supporting indie software.</p>
            <p style="font-size: 16px; line-height: 1.7; color: #111; margin: 8px 0 0;">George</p>
          </div>
        `,
      });
    }
  }

  res.status(200).json({ received: true });
}
