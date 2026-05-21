import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: "Name, email, and message are required"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET ENV VARIABLE FROM CLOUDFLARE WORKER
    const sheetUrl = locals.runtime.env.GOOGLE_SHEET_URL;

    console.log("SHEET URL EXISTS:", !!sheetUrl);

    if (!sheetUrl) {
      console.error('GOOGLE_SHEET_URL environment variable is not set');

      return new Response(JSON.stringify({
        success: false,
        error: "Environment variable missing"
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: "SEND_CONTACT_EMAIL",
        payload: {
          name,
          email,
          phone: phone || "Not provided",
          message,
          timestamp: new Date().toISOString()
        }
      })
    });

    console.log("STATUS:", response.status);

    const rawText = await response.text();

    console.log("RAW RESPONSE:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    if (result.success) {
      return new Response(JSON.stringify({
        success: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw new Error(result.error || "Failed to send");

  } catch (error: any) {
    console.error("SEND CONTACT ERROR:", error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to send message"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};