import type { APIRoute } from 'astro';

function getEnv(key: string): string | undefined {
    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }
    return import.meta.env?.[key];
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const bookId = url.searchParams.get('id');
    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    
    if (!sheetUrl) {
      return new Response(JSON.stringify({ error: 'No sheet URL' }), { status: 500 });
    }
    
    // Call Apps Script to debug
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "DEBUG_FLIPBOOK",
        payload: { bookId: bookId }
      })
    });
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};