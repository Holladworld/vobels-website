import type { APIRoute } from 'astro';
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
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
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // GET ENV VARIABLE FROM CLOUDFLARE
    const sheetUrl = env.GOOGLE_SHEET_URL;

    if (!sheetUrl) {
      console.error("GOOGLE_SHEET_URL is missing");

      return new Response(JSON.stringify({
        success: false,
        error: "Server configuration error"
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    // SEND TO GOOGLE SHEET
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

    const rawText = await response.text();

    console.log("RAW RESPONSE:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (err) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    if (!result.success) {
      throw new Error(result.error || "Failed to send");
    }

    return new Response(JSON.stringify({
      success: true
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {

    console.error("SEND CONTACT ERROR:", error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Something went wrong"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};