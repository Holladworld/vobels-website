import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();

  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();

  const isValid =
    email === import.meta.env.VOBELS_ADMIN_EMAIL &&
    password === import.meta.env.VOBELS_ADMIN_PASSWORD;

  if (!isValid) {
    return new Response(
      JSON.stringify({ ok: false, message: "Invalid credentials" }),
      { status: 401 }
    );
  }

  cookies.set("admin_session", "vobels-auth", {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD, // works on localhost + production
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 1 day
  });

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200 }
  );
};