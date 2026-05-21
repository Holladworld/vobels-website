import type { APIRoute } from 'astro';

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
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const sheetUrl = import.meta.env.GOOGLE_SHEET_URL;
    
    if (!sheetUrl) {
      console.error('GOOGLE_SHEET_URL environment variable is not set');
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Configuration error" 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(sheetUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "SEND_CONTACT_EMAIL",
        payload: {
          name: name,
          email: email,
          phone: phone || "Not provided",
          message: message,
          timestamp: new Date().toISOString()
        }
      })
    });

    console.log("STATUS:", response.status);
    console.log("CONTENT-TYPE:", response.headers.get("content-type"));

    const rawText = await response.text();

    console.log("RAW RESPONSE:", rawText);

    let result;

    try {
      result = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }
    
    if (result.success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error(result.error || "Failed to send");
    }
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Failed to send message" 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};