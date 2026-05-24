import type { APIRoute } from 'astro';

function getEnv(key: string): string | undefined {

    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }

    return import.meta.env?.[key];
}


// ========================================
// FETCH WITH RETRY
// ========================================

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
    timeout = 60000
) {

    for (let i = 0; i < maxRetries; i++) {

        const controller = new AbortController();

        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeout);

        try {

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            return response;

        } catch (error) {

            clearTimeout(timeoutId);

            console.log(`Attempt ${i + 1} failed:`, error);

            if (i === maxRetries - 1) {
                throw error;
            }

            await new Promise(resolve =>
                setTimeout(resolve, 2000)
            );
        }
    }

    throw new Error('Max retries reached');
}


// ========================================
// POST - UPLOAD FLIPBOOK
// ========================================

export const POST: APIRoute = async ({ request, locals }) => {

    try {

        const formData =
            await request.formData();

        const pdf =
            formData.get('pdf');

        const userEmail =
            formData.get('email');

        // VALIDATE PDF
        if (!pdf || !(pdf instanceof File)) {

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No PDF uploaded'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // VALIDATE EMAIL
        if (
            !userEmail ||
            typeof userEmail !== 'string'
        ) {

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Email is required'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // CHECK ENV
        const sheetUrl =
            locals.runtime.env.GOOGLE_SHEET_URL;

        if (!sheetUrl) {

            console.error(
                'GOOGLE_SHEET_URL missing'
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Server configuration error'
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // CONVERT PDF TO BASE64
        const arrayBuffer =
            await pdf.arrayBuffer();

        const bytes =
            new Uint8Array(arrayBuffer);

        let binary = '';

        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }

        const base64 = btoa(binary);

        console.log(
            'Uploading to Apps Script...',
            {
                fileName: pdf.name,
                userEmail
            }
        );

        // SEND TO GOOGLE APPS SCRIPT
        const response =
            await fetchWithRetry(
                sheetUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'UPLOAD_FLIPBOOK',
                        payload: {
                            fileName: pdf.name,
                            pdfData:
                                `data:application/pdf;base64,${base64}`,
                            userEmail
                        }
                    })
                }
            );

        const rawText =
            await response.text();

        console.log(
            'Apps Script response:',
            rawText
        );

        let result;

        try {

            result =
                JSON.parse(rawText);

        } catch {

            console.error(
                'Failed to parse JSON:',
                rawText
            );

            throw new Error(
                `Invalid JSON from server`
            );
        }

        if (!result.success) {

            throw new Error(
                result.error || 'Upload failed'
            );
        }

        // SHARE URL
        const fullShareUrl =
            `/flipbook/view?id=${result.bookId}`;

        return new Response(
            JSON.stringify({
                success: true,
                bookId: result.bookId,
                shareUrl: fullShareUrl,
                pdfUrl: result.pdfUrl,
                plan: result.plan
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error: any) {

        console.error(
            "UPLOAD FLIPBOOK ERROR:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    error.message ||
                    'Upload failed'
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


// ========================================
// GET FLIPBOOK
// ========================================

export const GET: APIRoute = async ({ url, locals }) => {

    try {

        const id =
            url.searchParams.get('id');

        const checkPlan =
            url.searchParams.get('checkPlan');

        console.log(
            'GET flipbook request:',
            {
                id,
                checkPlan
            }
        );

        if (!id) {

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing ID'
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const sheetUrl =
            getEnv('GOOGLE_SHEET_URL');

        if (!sheetUrl) {

            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Server configuration error'
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // CHECK PLAN
        if (checkPlan === 'true') {

            const response =
                await fetchWithRetry(
                    sheetUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            action: 'CHECK_FLIPBOOK_PLAN',
                            payload: {
                                bookId: id
                            }
                        })
                    }
                );

            const result =
                await response.json();

            return new Response(
                JSON.stringify(result),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        // GET FLIPBOOK
        const response =
            await fetchWithRetry(
                sheetUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action: 'GET_FLIPBOOK',
                        payload: {
                            bookId: id
                        }
                    })
                }
            );

        const rawText =
            await response.text();

        console.log(
            'Apps Script GET response:',
            rawText.substring(0, 500)
        );

        let result;

        try {

            result =
                JSON.parse(rawText);

        } catch {

            console.error(
                'Failed to parse JSON:',
                rawText
            );

            throw new Error(
                'Invalid JSON response'
            );
        }

        if (!result.success) {

            throw new Error(
                result.error ||
                'Flipbook not found'
            );
        }

        // IMPORTANT VALIDATION
        if (!result.pdfUrl) {

            throw new Error(
                'PDF URL missing'
            );
        }

        // ========================================
        // IMPORTANT FIX
        // USE PROXY URL INSTEAD OF GOOGLE DRIVE
        // ========================================

        const proxyUrl =
            `${url.origin}/api/flipbook-proxy?url=${encodeURIComponent(result.pdfUrl)}`;

        console.log('PROXY URL:', proxyUrl);

        return new Response(
            JSON.stringify({
                success: true,
                pdfUrl: proxyUrl,
                fileName: result.fileName,
                views: result.views,
                plan: result.plan
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error: any) {

        console.error(
            "GET FLIPBOOK ERROR:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    error.message ||
                    'Failed to fetch flipbook'
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


// ========================================
// OPTIONS
// ========================================

export const OPTIONS: APIRoute = async () => {

    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
};