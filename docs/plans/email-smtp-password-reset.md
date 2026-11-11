# Plan: Gmail SMTP email + async dispatch + password-reset flow

## Context

Aumigo currently sends email only through the Resend SDK, selected in the composition
root by `RESEND_API_KEY`. We moved to **Gmail SMTP** (a dedicated account for the MVP)
because of domain-registration cost with Resend. The `SMTP_*` credentials already exist in
`.env` / `.env.example` but nothing reads them and no SMTP library was installed. This
change:

1. Adds a Gmail-SMTP adapter behind the existing `EmailSender` port (Nodemailer), keeps the
   Resend adapter in place but unused, and selects the adapter by an explicit
   `EMAIL_PROVIDER` env var.
2. Makes email dispatch **non-blocking** so it is safe on Vercel serverless (where bare
   fire-and-forget promises are dropped after the response) via Vercel `waitUntil`, with a
   fall-back for long-lived/Docker deploys.
3. Implements the previously-missing **password-reset flow** using BetterAuth's built-in
   `forgetPassword`/`resetPassword` (no new table — reuses the existing `verification`
   table), wired to the same `EmailSender` port, plus the `/forgot-password` and
   `/reset-password` pages and a login-page entry point.

**Library choice:** **Nodemailer** — MIT-licensed, de-facto standard Node SMTP client.
Gmail requires a 16-char **App Password** with 2FA enabled (not the account password);
`from` must be the Gmail address. Free Gmail cap ≈ 500 recipients/day.

**Decisions:** BetterAuth built-in reset · `waitUntil` async · explicit `EMAIL_PROVIDER`
var · full flow including pages.

---

## 1. Dependencies

- `nodemailer` (runtime), `@vercel/functions` (runtime — `waitUntil` from any request
  context), `@types/nodemailer` (dev).

## 2. Email adapters + async decorator — `server/email/email-sender.ts`

Keep `EmailMessage`, `EmailSender`, `ConsoleEmailSender`, `ResendEmailSender`. Add:

- **`SmtpEmailSender`** — `{ host, port, user, pass, from }`; one memoized Nodemailer
  transporter (`secure: port === 465`); `send()` → `transporter.sendMail(...)`; throws
  `createError(502)` on failure.
- **`DeferredEmailSender`** — decorator; `send()` returns immediately after scheduling the
  real send in the background via `waitUntil` (`@vercel/functions`), falling back to
  fire-and-forget when there is no Vercel request context (local/Docker). Errors are logged.
- **`createEmailSender(opts)`** — selects base adapter by `opts.provider`
  (`smtp|resend|console`, default `console`) and wraps it in `DeferredEmailSender`. Plain
  options (no `runtimeConfig` import) to avoid an import cycle between the two composition
  roots.

Tradeoff: deferred sends no longer fail the originating request — a delivery error is
logged, not surfaced (staff invite returns 201 even if its email later fails).

## 3. Runtime config — `nuxt.config.ts`

Add to server-only `runtimeConfig`: `emailProvider`, `smtpHost`, `smtpPort` (Number,
default 465), `smtpUser`, `smtpPass`, `smtpFrom` (default `SMTP_USER`). Keep Resend keys.

## 4. Composition root — `server/utils/services.ts`

Replace the `emailSender` ternary with `createEmailSender({ provider, smtp, resend })` from
config. Still injected only into `StaffService`.

## 5. Password-reset backend — `server/utils/auth.ts`

Build an `EmailSender` via `createEmailSender(...)` and add to `emailAndPassword`:
`resetPasswordTokenExpiresIn: 3600` and `sendResetPassword({ user, url })` that emails the
reset link (`url` carries the token). BetterAuth stores the hashed token in the existing
`verification` table — no migration.

Security: generic success on `forgetPassword` (no enumeration); single-use, hashed, 1h
token; built-in rate limiting; HTTPS link via `authBaseUrl`. Optional follow-up: revoke the
user's other sessions on reset.

## 6. Frontend

Follow existing auth-page conventions (`layout: false`, `robots: noindex`, `vue-sonner`,
shadcn inputs, mirror `LoginForm.vue`):
- `app/pages/(public)/forgot-password.vue` + `app/components/ForgotPasswordForm.vue` —
  `authClient.forgetPassword({ email, redirectTo: '/reset-password' })`, generic confirmation.
- `app/pages/(public)/reset-password.vue` + `app/components/ResetPasswordForm.vue` — read
  `token` from query; new-password + confirm; `authClient.resetPassword({ newPassword, token })`;
  handle expired/missing token.
- `app/pages/(public)/login.vue` — add "Esqueceu a senha?" link to `/forgot-password`.
- Optional shared zod schemas for client-side validation.

## 7. Docs & env

- `.env.example`: add `EMAIL_PROVIDER="console"` and `SMTP_FROM`; note `SMTP_PASS` is a Gmail
  App Password.
- `docs/backend.md`: note `EMAIL_PROVIDER` selection, SMTP adapter, deferred dispatch, reset
  flow.

---

## Critical files

`server/email/email-sender.ts`, `server/utils/services.ts`, `server/utils/auth.ts`,
`nuxt.config.ts`, `app/pages/(public)/forgot-password.vue`,
`app/pages/(public)/reset-password.vue`, `app/components/ForgotPasswordForm.vue`,
`app/components/ResetPasswordForm.vue`, `app/pages/(public)/login.vue`, `.env.example`,
`docs/backend.md`.

## Reuse

`EmailSender` port + Console/Resend adapters; `verification` table (no migration);
`authClient.forgetPassword`/`resetPassword`; login/LoginForm styling; `createError`,
`#shared/schemas`, `useValidatedBody`.

## Verification

1. `pnpm install`.
2. Console mode: `/forgot-password` → link logged → `/reset-password` → log in.
3. SMTP mode (`EMAIL_PROVIDER=smtp` + Gmail App Password): real email arrives, response
   returns immediately.
4. Staff invite still works, non-blocking.
5. Enumeration check: unknown email → identical generic response.
6. `pnpm lint` · `pnpm typecheck` · `pnpm test`.
7. On Vercel: deferred sends complete via waitUntil; local fallback still delivers.
