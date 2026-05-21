import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const form = await request.formData();

    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    const isValid =
      email === env.VOBELS_ADMIN_EMAIL &&
      password === env.VOBELS_ADMIN_PASSWORD;

    if (!isValid) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Invalid credentials"
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    cookies.set("admin_session", "vobels-auth", {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24
    });

    return new Response(
      JSON.stringify({
        ok: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};