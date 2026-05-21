import type { APIRoute } from 'astro';
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // GET ENV VARIABLE FROM CLOUDFLARE
    const sheetUrl = env.GOOGLE_SHEET_URL;

    console.log("SHEET URL EXISTS:", !!sheetUrl);

    if (!sheetUrl) {
      throw new Error("GOOGLE_SHEET_URL environment variable is missing");
    }

    // SEND DATA TO GOOGLE SHEETS
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: "SAVE_LEAD",
        payload: {
          email: body.email,
          businessType: body.businessType || "Not specified",
          shareCapital: body.shareCapital || "Not specified",
          source: body.source || "growth_popup",
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
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    throw new Error(result.error || "Failed to save lead");

  } catch (error: any) {

    console.error("CAPTURE LEAD ERROR:", error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to save lead"
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};