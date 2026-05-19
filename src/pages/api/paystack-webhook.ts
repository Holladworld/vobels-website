import type { APIRoute } from 'astro';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const secret = import.meta.env.PAYSTACK_SECRET_KEY;
    const signature = request.headers.get('x-paystack-signature');

    // 🔐 verify Paystack
    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (body.event === 'charge.success') {
      const d = body.data;

      const payload = {
        action: "SAVE_TRANSACTION",
        payload: {
          adminEmail: import.meta.env.VOBELS_ADMIN_EMAIL,
          adminPass: import.meta.env.VOBELS_ADMIN_PASSWORD,

          transaction: {
            Date: new Date().toLocaleDateString('en-GB'),
            Name: `${d.customer.first_name || ''} ${d.customer.last_name || ''}`.trim() || d.customer.email,
            Email: d.customer.email,
            WhatsApp: d.metadata?.whatsapp_no || "N/A",

            Amount: d.amount / 100,
            Description: d.metadata?.product_name || "Vobels Purchase",

            Ref: d.reference,

            // 🔥 CORE ROUTING FIELDS
            Category: d.metadata?.category || "courses",
            ProductId: d.metadata?.product_id || "UNKNOWN"
          }
        }
      };

      await fetch(import.meta.env.GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200
    });

  } catch (err) {
    console.error(err);
    return new Response('Error', { status: 200 });
  }
};