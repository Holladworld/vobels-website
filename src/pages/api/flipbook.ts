import type { APIRoute } from 'astro';
import { env } from "cloudflare:workers";

// Simple in-memory storage for demo
const demoFlipbooks = new Map();

// Demo PDF
const DEMO_PDF_URL =
  'https://cdn.jsdelivr.net/gh/mozilla/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';


// =========================
// POST: Upload PDF
// =========================
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
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // GET ENV VARIABLE
    const sheetUrl = env.GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      throw new Error("GOOGLE_SHEET_URL is missing");
    }

    // CONVERT PDF TO BASE64
    const arrayBuffer = await pdf.arrayBuffer();

    const bytes = new Uint8Array(arrayBuffer);

    let binary = '';

    bytes.forEach((b) => {
      binary += String.fromCharCode(b);
    });

    const base64 = btoa(binary);

    // SEND TO GOOGLE SHEET
    const response = await fetch(sheetUrl, {
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

    const rawText = await response.text();

    console.log("UPLOAD RESPONSE:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {

    console.error("UPLOAD FLIPBOOK ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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


// =========================
// GET: Retrieve PDF
// =========================
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
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // GET ENV VARIABLE
    const sheetUrl = env.GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      throw new Error("GOOGLE_SHEET_URL is missing");
    }

    // FETCH FLIPBOOK
    const response = await fetch(sheetUrl, {
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

    const rawText = await response.text();

    console.log("GET RESPONSE:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error: any) {

    console.error("GET FLIPBOOK ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
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