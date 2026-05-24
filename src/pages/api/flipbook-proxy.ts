import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  try {
    const pdfUrl = url.searchParams.get('url');

    if (!pdfUrl) {
      return new Response('Missing PDF URL', {
        status: 400
      });
    }

    console.log('Proxy fetching PDF:', pdfUrl);

    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const pdfBuffer = await response.arrayBuffer();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error: any) {
    console.error('PROXY ERROR:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
};