// src/pages/api/flipbook.ts
import type { APIRoute } from 'astro';

// Helper to get env variables (works locally + Cloudflare)
function getEnv(key: string): string | undefined {
    // For Cloudflare production
    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }
    // For local development
    return import.meta.env?.[key];
}

// =========================
// POST: Upload PDF
// =========================
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const pdf = formData.get('pdf');
    const userEmail = formData.get('email');

    if (!pdf || !(pdf instanceof File)) {
      return new Response(
        JSON.stringify({ success: false, error: 'No PDF uploaded' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Require email for tracking
    if (!userEmail || typeof userEmail !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    if (!sheetUrl) throw new Error("GOOGLE_SHEET_URL is missing");

    // Convert PDF to base64
    const arrayBuffer = await pdf.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    const base64 = btoa(binary);

    // Send to Google Sheets WITH email
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPLOAD_FLIPBOOK',
        payload: {
          fileName: pdf.name,
          pdfData: `data:application/pdf;base64,${base64}`,
          userEmail: userEmail
        }
      })
    });

    const rawText = await response.text();
    let result;
    try { 
      result = JSON.parse(rawText); 
    } catch (e) { 
      throw new Error(`Invalid JSON: ${rawText}`); 
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("UPLOAD FLIPBOOK ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// =========================
// GET: Retrieve PDF by ID
// =========================
export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');
    const checkPlan = url.searchParams.get('checkPlan');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing ID' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    if (!sheetUrl) throw new Error("GOOGLE_SHEET_URL is missing");

    if (checkPlan === 'true') {
      const response = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CHECK_FLIPBOOK_PLAN',
          payload: { bookId: id }
        })
      });
      const result = await response.json();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'GET_FLIPBOOK',
        payload: { bookId: id }
      })
    });

    const rawText = await response.text();
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("GET FLIPBOOK ERROR:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// =========================
// OPTIONS: CORS
// =========================
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }
  });
};