import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Fetch live rate from free API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rate = data.rates.NGN;
    
    return new Response(JSON.stringify({ rate, timestamp: Date.now() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Fallback rate
    return new Response(JSON.stringify({ rate: 1600, timestamp: Date.now(), isFallback: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};