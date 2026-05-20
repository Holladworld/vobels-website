import type { APIRoute } from 'astro';

// Simple in-memory storage for demo (stores raw bytes)
const demoFlipbooks = new Map();

// CORS-friendly demo PDF
const DEMO_PDF_URL = 'https://cdn.jsdelivr.net/gh/mozilla/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';

// POST: Upload a PDF
export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const pdf = formData.get('pdf');
        
        if (!pdf || !(pdf instanceof File)) {
            return new Response(JSON.stringify({ error: 'No PDF file provided' }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Generate unique ID
        const bookId = crypto.randomUUID().slice(0, 12);
        
        // Read file as array buffer (no base64 conversion)
        const buffer = await pdf.arrayBuffer();
        
        // Store the raw buffer in memory
        demoFlipbooks.set(bookId, buffer);
        
        const shareUrl = `/flipbook/view.html?id=${bookId}`;
        
        return new Response(JSON.stringify({
            success: true,
            bookId: bookId,
            shareUrl: shareUrl,
            message: 'Flipbook created!'
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

// GET: Retrieve a PDF
export const GET: APIRoute = async ({ url }) => {
    const id = url.searchParams.get('id');
    const download = url.searchParams.get('download') === 'true';
    
    // Set CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing book ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
    
    // Check if we have this flipbook in memory
    const pdfBuffer = demoFlipbooks.get(id);
    
    if (pdfBuffer) {
        if (download) {
            // Return the PDF as a download
            return new Response(pdfBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="flipbook-${id}.pdf"`,
                    ...corsHeaders
                }
            });
        }
        
        // Return as blob URL for viewing
        // Convert buffer to base64 for the frontend
        const base64 = Buffer.from(pdfBuffer).toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64}`;
        
        return new Response(JSON.stringify({
            success: true,
            pdfUrl: dataUrl,
            bookId: id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
    
    // Return a CORS-friendly demo PDF for testing
    return new Response(JSON.stringify({
        success: true,
        pdfUrl: DEMO_PDF_URL,
        bookId: id,
        isDemo: true,
        message: 'Using demo PDF - Upload your own to replace it'
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
};

// Handle OPTIONS preflight requests for CORS
export const OPTIONS: APIRoute = async () => {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
};