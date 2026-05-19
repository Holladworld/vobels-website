import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const res = await fetch(
    `${import.meta.env.GOOGLE_SHEET_URL}?action=stats`
  );

  const data = await res.json();

  return new Response(JSON.stringify(data));
};