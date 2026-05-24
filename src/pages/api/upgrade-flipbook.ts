import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { reference, email, plan } = body;
    
    console.log('Upgrade request received:', { reference, email, plan });
    
    // Get environment variables
    const secret = import.meta.env.PAYSTACK_SECRET_KEY;
    const sheetUrl = import.meta.env.GOOGLE_SHEET_URL;
    
    if (!secret) {
      console.error('PAYSTACK_SECRET_KEY missing');
      return new Response(JSON.stringify({ success: false, error: 'Payment key missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!sheetUrl) {
      console.error('GOOGLE_SHEET_URL missing');
      return new Response(JSON.stringify({ success: false, error: 'Configuration missing' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Verify payment with Paystack
    console.log('Verifying payment with Paystack...');
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      }
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Paystack verification result:', verifyData.status);
    
    if (!verifyData.status || verifyData.data.status !== 'success') {
      return new Response(JSON.stringify({ success: false, error: 'Payment verification failed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Upgrade user in Google Sheets
    console.log('Upgrading user in Google Sheets...');
    const upgradeResponse = await fetch(sheetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: "UPGRADE_TO_PREMIUM",
        payload: {
          email: email,
          plan: plan,
          reference: reference,
          timestamp: new Date().toISOString()
        }
      })
    });
    
    const result = await upgradeResponse.json();
    console.log('Upgrade result:', result);
    
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('Upgrade error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};