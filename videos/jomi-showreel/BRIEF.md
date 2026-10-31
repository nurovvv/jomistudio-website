---
workflow: general-video
flow: automation
storyboard: yes
message: "Jomi Studio crafts premium brands and websites — shown, not told"
destination: website
aspect: 1920x1080
language: en
length: 15s
angle: brand-showreel-loop
---

## Intent

v2 (2026-10-30). The user: "we made a lot of projects so far and now i want to change first motion video in our
website ... use more our projects in our video", with cuberto.com's hero reel as the reference
(cuberto.com/assets/showreel/short.mp4, measured: 12 s, 4 scenes of ~3 s, each one real project staged in its own
colour world with 3D device presentation and camera moves). Grammar only; nothing from its footage is reused.

v2 replaces the concept scenes with Jomi's five real projects, one world each, between the Jomi mark bookends:
0. Break open — the mark breaks apart (dark), as in v1.
1. KIMCHI — website on laptop + phone, red.
2. Odiliyon — QR menu: table stand with the real QR + phone + dish cards, the café's blue fluted wall.
3. Bilyard — cash-desk app: tablet on billiard felt, table cards lifting, real billiard balls.
4. Zarbulmasal — Android app: three phones, Tajik screens wiping to Persian script, navy + ikat.
5. Khoja Sokhtmon — the live 3D building site itself, sunset to night.
6. Lockup — the mark reassembles with the wordmark, looping back to 0.
Shot numbers, timings and looks are in SPEC.md.

## Assets

- assets/brand/*, assets/fonts/InterTight-var.woff2 — the Jomi mark and wordmark (bookends), as in v1.
- assets/kimchi/ — KIMCHI desktop + mobile captures (copied from public/projects/kimchi in v1).
- assets/odiliyon/ — from public/projects/odiliyon: mobile.webp (3800 CSS px of the live menu, 390 wide @1.5x),
  mobile-top.png / mobile-pin.png (header; header + category bar), dish-1..3.webp, qr.svg (real code for
  odiliyon.pages.dev), mark.svg, wordmark.png + tagline.png (alpha masks).
- assets/bilyard/ — from public/projects/bilyard: board.webp (tables board, 2360x1640 source), table-2/3/4.webp.
- assets/zarbulmasal/ — from public/projects/zarbulmasal: home/proverb (tj + fa), poet-tj.webp (store screenshots,
  1080x2160 source), ikat.webp (icon art).
- assets/khoja/building.mp4 — 2.4 s rendered frame by frame from https://khoja-sokhtmon.pages.dev at 1920x1080
  (@1.333x) through its own window.__app (camera, setHours); script kept in the session scratchpad.

## Customizations

- One 16:9 render with all key action kept centre-safe, because the site's hero box crops to 4:5 on phones (object-fit: cover).

## Notes

- All five projects are real (KIMCHI, Odiliyon, Bilyard, Khoja Sokhtmon are client work; Zarbulmasal is Jomi's own
  app on Google Play). Screens are real captures only.
- Brand: cream #F6F1E9, ink #1F1D24, green #4FC59A for the bookends; each project scene uses its own brand colours.
- Destination: the site hero <video autoplay muted loop playsinline>; files go to /Users/nurovvv/JomiStudio/public/showreel/
  (jomi-showreel-1440/1080 .mp4/.webm + poster), wired in src/data/projects.ts `showreel`.
- Silent by design (muted autoplay) — no music or SFX.
- Laptop is MacBook-style without the Apple logo (trademark). Real-time WebGL 3D, not ray-traced.
- Usage allowance: `hyperframes usage` reports status unknown (unsupported auth).
