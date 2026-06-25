# Atelier Admin CMS — Bolt handoff kit

Everything Bolt needs to restyle the `/admin` area of **jeflowers/csvlasik** into the
brand-accurate, data-oriented system shown in the reference mockups.

## What's in here

```
bolt-handoff/
├─ README.md                      ← you are here
├─ src/
│  ├─ components/Logo.tsx         ← Marquise logo component (horizontal/stacked/mark)
│  └─ utils/roleColors.ts         ← role → color / label helpers (drop-in)
├─ public/
│  ├─ atelier-mark.svg            ← primary marquise mark
│  ├─ atelier-monogram.svg        ← medallion / "A" seal
│  ├─ app-icon.svg                ← charcoal app tile (apple-touch-icon)
│  └─ favicon.svg                 ← single-colour favicon (scales to 16px)
├─ tailwind.additions.js          ← status + role colors to merge into tailwind.config.js
└─ prompts/
   ├─ 01-foundation.md            ← paste FIRST (layout shell, tokens, auth, primitives)
   └─ 02-pages.md                 ← paste per section (data pages)
```

The visual targets live in the design project as:
`Admin CMS Mockup`, `Admin Users Mockup`, `Admin Login Mockup` (+ role-switch tweak on the dashboard).

## How to use it

1. **Copy files into the repo** (same paths):
   - `src/components/Logo.tsx`, `src/utils/roleColors.ts`
   - the four `public/*.svg`
2. **Merge `tailwind.additions.js`** into `tailwind.config.js` (the brand tokens
   `onyx / graphite / bullion / champagne / cream` are already there — keep them).
3. **Open the repo in Bolt**, then paste `prompts/01-foundation.md`. Verify the shell,
   login, and shared components.
4. Work through `prompts/02-pages.md` ~3 routes at a time, telling Bolt to **match the mockups**.

## The one rule that keeps it consistent

> **Gold (`#D4AF37`) = the active/selected state, everywhere.**
> **Role color = identity only** — the sidebar top strip, the avatar ring, role dots/badges.
> They are never the same signal. Don't let Bolt tint active nav with the role color.

## Brand quick-reference

- Onyx `#1A1A1A` · Graphite `#2C2C2C` · Bullion `#D4AF37` · Champagne `#C9A96E` · Cream `#FBF7EF`
- Status — success `#059669` · warning `#D97706` · info `#2563EB` · danger `#DC2626`
- Fonts — Cormorant Garamond (titles) · Inter (body/UI). Already configured as `font-serif` / `font-sans`.
- Current bug to kill: the admin is styled with `teal` (`bg-teal-100`, `bg-teal-600`). Remove all of it.
