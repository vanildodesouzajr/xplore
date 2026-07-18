import type { CookieOptionsWithName } from "@supabase/ssr";

// Hardened attributes applied to the Supabase auth cookies. Defined once and
// shared by the server client (server.ts) and the proxy (proxy.ts): if the two
// wrote cookies with different options, Supabase would rewrite them on every
// request and that mismatch can cause random logouts.
//
// `@supabase/ssr` merges these over its defaults and always keeps its own
// `maxAge` (400 days) and `path` ("/"), so we only override the two we care
// about here.
//
// - httpOnly: this app never uses the browser Supabase client — all auth runs
//   in Server Actions, Route Handlers, and the proxy — so the tokens never need
//   to be readable from JavaScript. Marking them HttpOnly stops an XSS payload
//   from exfiltrating the session.
// - secure: only in production; local dev is served over http://localhost.
export const AUTH_COOKIE_OPTIONS: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};
