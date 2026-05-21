import type { APIRoute } from 'astro';

// Simple in-memory storage for demo (stores raw bytes)
const demoFlipbooks = new Map();

// CORS-friendly demo PDF
const DEMO_PDF_URL = 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

// POST: Upload a PDF
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const pdf = formData.get('pdf');

    if (!pdf || !(pdf instanceof File)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No PDF uploaded'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Convert PDF to base64
    const arrayBuffer = await pdf.arrayBuffer();

    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';
    bytes.forEach((b) => binary += String.fromCharCode(b));

    const base64 = btoa(binary);

    const response = await fetch(import.meta.env.GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'UPLOAD_FLIPBOOK',
        payload: {
          fileName: pdf.name,
          pdfData: `data:application/pdf;base64,${base64}`
        }
      })
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// GET: Retrieve a PDF
export const GET: APIRoute = async ({ url }) => {
  try {
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing ID'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const response = await fetch(import.meta.env.GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'GET_FLIPBOOK',
        payload: {
          bookId: id
        }
      })
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Handle OPTIONS preflight requests for CORS
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