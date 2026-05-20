import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;
    
    // Send email using your Google Sheets webhook (which will forward to email)
    const sheetUrl = import.meta.env.GOOGLE_SHEET_URL;
    
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "SEND_CONTACT_EMAIL",
        payload: {
          name: name,
          email: email,
          phone: phone,
          message: message,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};