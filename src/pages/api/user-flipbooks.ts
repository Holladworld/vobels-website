import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const email = url.searchParams.get('email');
    
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the sheet URL from env
    let sheetUrl: string | undefined;
    
    // Try Cloudflare first
    try {
      const { env } = await import('cloudflare:workers');
      if (env && env.GOOGLE_SHEET_URL) {
        sheetUrl = env.GOOGLE_SHEET_URL;
      }
    } catch (e) {
      // Not in Cloudflare
    }
    
    // Fallback for local
    if (!sheetUrl) {
      sheetUrl = process.env.GOOGLE_SHEET_URL || import.meta.env.GOOGLE_SHEET_URL;
    }
    
    if (!sheetUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Call Google Apps Script to get user's flipbooks
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'GET_USER_FLIPBOOKS',
        payload: { userEmail: email }
      })
    });
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Error fetching user flipbooks:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};