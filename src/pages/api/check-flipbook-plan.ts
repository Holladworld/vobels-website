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

    if (!bookId) {
      return new Response(
        JSON.stringify({ error: 'Book ID required', isPremium: false }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    if (!sheetUrl) throw new Error("GOOGLE_SHEET_URL missing");

    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CHECK_FLIPBOOK_PLAN',
        payload: { bookId: bookId }
      })
    });

    const result = await response.json();

    return new Response(JSON.stringify({
      isPremium: result.isPremium || false,
      bookId: bookId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("CHECK FLIPBOOK PLAN ERROR:", error);
    return new Response(JSON.stringify({ error: error.message, isPremium: false }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};