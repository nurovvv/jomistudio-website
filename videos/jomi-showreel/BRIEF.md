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

A silent, seamlessly looping hero showreel for the Jomi Studio homepage (jomistudio.tj), "as cool as" the
reference agency reel the user pointed to (cuberto.com hero): about four quick scenes of ~3s with hard cuts,
slow continuous camera drift, premium 3D feel with soft studio light and depth. Original work — the reference
only sets pacing and polish; nothing from its footage, scenes or copy is reused.

Scene outline (revised after the user's note "you can add other stuff too not only kimchi like add some
stuff that we can do it doesnt have to be our customers"): show the range of Jomi's services, with KIMCHI as
the one real client and the rest as unnamed concept pieces (never presented as clients):
1. Break open — the mark breaks apart in glossy 3D (dark).
2. Websites — KIMCHI laptop + phone, real site scrolling (real client).
3. Branding — Jomi's own identity system as stationery/merch (the studio's own brand as the example).
4. Apps / UI-UX — an unnamed concept app: floating phone screens and UI cards.
5. 3D & motion — light cream studio, matte shapes and a green glass sphere.
6. Lockup — the mark reassembles with the wordmark, looping back to 1.

## Assets

- /Users/nurovvv/WebSite/public/brand/jomi_mark_light.svg, jomi_mark_dark.svg, jomi_logo_light.svg, jomi_logo_dark.svg — the Jomi mark (square, rounded square r9, rounded square r16, green circle) and wordmark; scenes 1 and 4.
- /Users/nurovvv/WebSite/public/projects/kimchi/desktop.webp (1440x4200 CSS px), desktop-top.png (sticky header strip) — KIMCHI desktop site for the laptop screen; scene 2.
- /Users/nurovvv/WebSite/public/projects/kimchi/mobile.webp (390x5200 CSS px), mobile-top.png, mobile-bottom.png — KIMCHI mobile site for the phone screen; scene 2.

## Customizations

- One 16:9 render with all key action kept centre-safe, because the site's hero box crops to 4:5 on phones (object-fit: cover).

## Notes

- Only KIMCHI is a real client. Concept scenes carry no client names, logos, or claims.
- Brand: cream #F6F1E9, ink #1F1D24, green #4FC59A; supporting KIMCHI red #E5161E (scene 2 only). Type: Inter Tight.
- Destination: the site hero <video autoplay muted loop playsinline>; final file goes to /Users/nurovvv/WebSite/public/showreel/ and is wired via src/data/projects.ts `showreel.video`.
- Silent by design (muted autoplay) — no music or SFX.
- Laptop is MacBook-style without the Apple logo (trademark). Real-time WebGL 3D, not ray-traced; aim for premium lighting, reflections, glass and depth.
- Usage allowance: `hyperframes usage` reports status unknown (unsupported auth).
