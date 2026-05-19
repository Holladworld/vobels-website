import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const url = context.url.pathname;

  const isAdminRoute = url.startsWith("/admin");
  const isLogin = url === "/admin/login";

  const session = context.cookies.get("admin_session")?.value;

  // allow login page always
  if (isLogin) return next();

  // protect admin routes
  if (isAdminRoute && !session) {
    return context.redirect("/admin/login");
  }

  return next();
});