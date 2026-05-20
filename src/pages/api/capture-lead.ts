import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Send to Google Sheets
    const response = await fetch(import.meta.env.GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    
    const result = await response.json();
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error(result.error || "Failed to save lead");
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};