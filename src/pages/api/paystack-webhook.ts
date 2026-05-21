import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import crypto from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    const secret = env.PAYSTACK_SECRET_KEY;
    const sheetUrl = env.GOOGLE_SHEET_URL;

    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY is missing');
    }

    if (!sheetUrl) {
      throw new Error('GOOGLE_SHEET_URL is missing');
    }

    const signature = request.headers.get('x-paystack-signature');

    const hash = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      return new Response('Unauthorized', {
        status: 401
      });
    }

    if (body.event === 'charge.success') {
      const d = body.data;

      const payload = {
        action: "SAVE_TRANSACTION",
        payload: {
          adminEmail: env.VOBELS_ADMIN_EMAIL,
          adminPass: env.VOBELS_ADMIN_PASSWORD,

          transaction: {
            Date: new Date().toLocaleDateString('en-GB'),

            Name:
              `${d.customer.first_name || ''} ${d.customer.last_name || ''}`.trim()
              || d.customer.email,

            Email: d.customer.email,

            WhatsApp:
              d.metadata?.whatsapp_no || "N/A",

            Amount:
              d.amount / 100,

            Description:
              d.metadata?.product_name || "Vobels Purchase",

            Ref:
              d.reference,

            Category:
              d.metadata?.category || "courses",

            ProductId:
              d.metadata?.product_id || "UNKNOWN"
          }
        }
      };

      const response = await fetch(sheetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        redirect: 'follow'
      });

      const rawText = await response.text();

      console.log('GOOGLE SHEET RESPONSE:', rawText);
    }

    return new Response(
      JSON.stringify({
        status: 'ok'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (err: any) {
    console.error('PAYSTACK WEBHOOK ERROR:', err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};