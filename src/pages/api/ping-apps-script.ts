import type { APIRoute } from 'astro';

function getEnv(key: string): string | undefined {
    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }
    return import.meta.env?.[key];
}

export const GET: APIRoute = async () => {
  try {
    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    const response = await fetch(sheetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const text = await response.text();
    
    return new Response(JSON.stringify({ 
      status: 'ok', 
      response: text.substring(0, 200) 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      status: 'error', 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};