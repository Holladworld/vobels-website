import type { APIRoute } from 'astro';

function getEnv(key: string): string | undefined {
    if (typeof (globalThis as any).env !== 'undefined') {
        return (globalThis as any).env[key];
    }
    return import.meta.env?.[key];
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  clearTimeout(timeoutId);
  throw new Error('Max retries reached');
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email } = body;
    
    console.log('Checking user status for:', email);
    
    const sheetUrl = getEnv('GOOGLE_SHEET_URL');
    
    if (!sheetUrl) {
      console.error('GOOGLE_SHEET_URL missing');
      return new Response(JSON.stringify({ 
        isPremium: false, 
        remainingUploads: 3,
        error: 'Config missing'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Fetching from Apps Script...');
    
    const response = await fetchWithRetry(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "CHECK_USER_STATUS",
        payload: { email: email }
      })
    });
    
    const rawText = await response.text();
    console.log('Raw response:', rawText);
    
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      data = { isPremium: false, remainingUploads: 3 };
    }
    
    console.log('Parsed data:', data);
    
    return new Response(JSON.stringify({
      isPremium: data.isPremium || false,
      remainingUploads: data.remainingUploads !== undefined ? data.remainingUploads : 3,
      isAdmin: data.isAdmin || false,
      plan: data.plan || 'free'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Check user error:', error);
    return new Response(JSON.stringify({ 
      isPremium: false, 
      remainingUploads: 3,
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};