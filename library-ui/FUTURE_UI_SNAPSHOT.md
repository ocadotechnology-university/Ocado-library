# Deferred UI (screenshot mock) — re-apply when ready

This branch keeps **sidebar-only** changes. The following was implemented to match `src/assets/Screenshot 2026-04-04 at 14.42.44.png` and then **reverted** so main stays simple for testing.

## Layout (`Layout.tsx`)

- Sidebars: `bg-[#b8bac7]`, inner edge `border-2 border-white`, responsive width `w-[min(24vw,320px)] min-w-[240px]`, inset shadows.
- Main: `bg-[#d8d9df]` instead of default content area on `#eeeef0` shell.
- Asides used `flex min-h-0 shrink-0 flex-col` in the reverted version; current branch uses simpler `shrink-0` asides from HEAD.

## Top bar (`TopBar.tsx`)

- Title **Ocado library** (italic, lowercase “library”), no subtitle line in the mock variant.
- Notification: small square icon button (`iconButtonClass`).
- Account: dark pill **your account** + circular avatar placeholder (`accountPillClass`), not two equal emoji tiles.

## Home main (`Home.tsx`)

- Tab pills: Books (active with blue ring), Board Games, Games.
- Sub-nav row: All, New arrivals, Bestsellers, Pre-order, Prizes, Filmed ×2.
- 3×2 grid of placeholder cards (white body, grey footer bar).

## Tests (`App.test.tsx`)

- Assertions included **Ocado library** (lowercase), **Books**, **Categories** when the mock was active; restore alongside TopBar/Home if those strings return.

## Reference

- Screenshot: `src/assets/Screenshot 2026-04-04 at 14.42.44.png`
- Sidebar implementation (kept): `src/components/UI/SidebarTemplate.tsx` — `SidebarTemplate`, `SidebarAccentTitle`, `SidebarFilterRow`, `SidebarUserBlock`, `SidebarMenuRow`.
