import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const GET: APIRoute = async () => {
  try {
    const sheetUrl = env.GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      throw new Error('GOOGLE_SHEET_URL is missing');
    }

    const res = await fetch(
      `${sheetUrl}?action=customers`
    );

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('CUSTOMERS ERROR:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};