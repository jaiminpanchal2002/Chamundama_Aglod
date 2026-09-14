# Shree Chamunda Dham Aglod — Official Temple & Trust Website

A premium, devotional, multilingual (Gujarati / Hindi / English) temple website
with a full CMS, RBAC admin panel, and a secure donation → verification →
receipt workflow for **Shree Chamunda Dham, Aglod (Vijapur, Gujarat, India)**.

> **Content note:** No temple facts (history, timings, trustees, bank details,
> tax registrations) are fabricated anywhere in this project. Wherever real
> information is unknown, the app shows a clearly-labelled placeholder:
> _"Content to be provided by Shree Chamunda Dham Aglod Trust."_ Everything is
> editable from the admin panel.

---

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v3 + custom temple design system |
| Motion | Framer Motion (respects `prefers-reduced-motion`) |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (credentials, JWT sessions) + bcrypt |
| Private storage | Local signed-URL driver (swappable for Cloudinary / S3) |
| PDF receipts | pdf-lib + qrcode |
| Validation | Zod + React Hook Form |

---

## Features

**Public site** — cinematic CMS-driven hero, Today-at-the-temple, About,
Darshan & Aarti timings, Events + event detail (with `Event` structured data),
masonry Gallery with lightbox, Live Darshan, Donate wizard, Trust, Visit (map +
directions), Updates/News, Volunteer & Contact forms, receipt verification,
gu/hi/en switching, WhatsApp button, optional temple ambience audio, festival
theme, maintenance mode, SEO (dynamic metadata, sitemap, robots), branded 404.

**Admin panel** (`/admin`) — dashboard with live metrics, Hero Slides, Events,
Darshan timings + date overrides, Announcements, Gallery, Donation Campaigns,
QR Codes, Donations (verify → approve → receipt), Website Settings (temple info,
social links, WhatsApp, donation config, festival, maintenance), Audit Log.

**Donation security** (spec §14–18)

- QR + manual verification. **No** auto-approval from a screenshot.
- Payment proofs stored **privately**; served to admins only via short-lived
  signed URLs, and every view is audit-logged.
- Status pipeline: `SUBMITTED → PENDING_VERIFICATION → VERIFIED → APPROVED`
  (or `REJECTED` / `CLARIFICATION_REQUIRED`).
- Receipts (PDF) are generated **only after approval**, with a public
  verification endpoint that exposes only safe fields.
- Only `SUPER_ADMIN`, `TRUSTEE_ADMIN`, `DONATION_MANAGER` can verify/approve.
- No 80G / tax wording is printed unless the Trust enables it with a valid
  registration (default **off**).

---

## Local setup

### 1. Prerequisites
- Node.js 20+ (tested on 24)
- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway)

### 2. Install
```bash
npm install
```

### 3. Environment
```bash
cp .env.example .env
```
Fill in at minimum `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`
(`npx auth secret`) and `STORAGE_SIGNING_SECRET`.

### 4. Database
```bash
npm run prisma:generate     # generate the client
npm run prisma:migrate      # create tables (dev)
npm run db:seed             # demo/sample data + super admin
```
The seed creates a super admin from `SEED_SUPERADMIN_EMAIL` /
`SEED_SUPERADMIN_PASSWORD`. **Change these before production.**

### 5. Run
```bash
npm run dev
```
- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

### Create additional admins
```bash
npm run create:admin -- someone@example.com "StrongPassword" "Their Name" DONATION_MANAGER
```

---

## Admin roles (RBAC)

| Role | Capabilities |
|------|--------------|
| `SUPER_ADMIN` | Everything |
| `TRUSTEE_ADMIN` | Content, temple, events, donations, settings, audit |
| `CONTENT_MANAGER` | Pages, hero, gallery, events, announcements (no donor data) |
| `EVENT_MANAGER` | Events only |
| `DONATION_MANAGER` | Donation verification, receipts, campaigns, QR |
| `VIEWER` | Read-only donations + audit |

Content managers **cannot** access donor details, payment proofs, or user
management.

---

## Storage drivers

`STORAGE_DRIVER=local` (default) keeps donation proofs under
`PRIVATE_STORAGE_DIR` (git-ignored, never web-served) and serves them via signed
5-minute admin links. Public CMS images upload to `/public/uploads`.

> **Production note:** on serverless hosts (e.g. Vercel) the filesystem is not
> persistent. For production, implement the Cloudinary or S3 driver behind the
> existing `StorageDriver` interface in `src/lib/storage/index.ts`, and point
> CMS image uploads at the same provider.

---

## Deployment

1. Provision managed PostgreSQL; set `DATABASE_URL` / `DIRECT_URL`.
2. Set `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `STORAGE_SIGNING_SECRET`.
3. Configure a persistent private storage provider (Cloudinary/S3) for proofs.
4. `npm run prisma:deploy` then `npm run build` / `npm start` (or deploy to Vercel).
5. Create the first super admin (`npm run create:admin`), then change the
   seeded password.

### Backups (spec §48)
Schedule daily automated backups of the PostgreSQL database and the media/
private-storage buckets. Test restores periodically. Managed providers
(Neon/Supabase/RDS) offer point-in-time recovery — enable it.

---

## Project structure

```
src/
  app/
    (site)/        # public pages (navbar/footer layout)
    admin/         # admin panel + server actions
    api/           # donations, contact, volunteer, media, proof, receipts, auth
  components/      # site + admin + ui components
  features/        # donation wizard, gallery grid
  lib/             # prisma, auth-guard, rbac, storage, settings, i18n, receipt…
prisma/            # schema.prisma + seed.ts
scripts/           # create-admin.ts
storage/private/   # git-ignored private uploads (donation proofs)
```

---

## Security summary (spec §45)

Server-side authorization on every admin action, Zod validation, rate limiting
on public submissions, honeypot bot fields, file magic-byte + size validation,
private proof storage with signed expiring URLs, append-only audit log,
security headers, secrets only in env. Optional: add Cloudflare Turnstile keys
to enable CAPTCHA on public forms.

---

## What still needs the Trust / future work

- Real temple content, timings, trustees, history, contact, and QR (via admin).
- Production storage driver (Cloudinary/S3) for proofs and CMS media.
- Email/WhatsApp notifications (providers are structured to plug in).
- Optional online payment gateway (deliberately not implemented — see spec §59).

_|| જય મા ચામુંડા ||_
