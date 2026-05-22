// src/pages/api/verify-payment.ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

function getEnv(key: string): string | undefined {
    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }
    return import.meta.env?.[key];
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { reference, email, plan } = body;

    const secret = env.PAYSTACK_SECRET_KEY;
    const sheetUrl = env.GOOGLE_SHEET_URL;

    // Verify with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.data.status === 'success') {
      // Call Apps Script to upgrade
      await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPGRADE_TO_PREMIUM',
          payload: { email, plan, reference }
        })
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Payment verification failed' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};