---
format: 1920x1080
duration: 15s
message: "Jomi Studio crafts premium brands and websites — shown, not told"
arc: Mark breaks open → websites (real client) → branding → apps → 3D craft → mark reassembles (loops)
audience: visitors landing on jomistudio.tj — prospective clients in Dushanbe and abroad
mode: collaborative
rhythm: drift → PUNCH → glide → pop → breathe → lockup-hold (loop)
---

## Decisions

- **Message:** Jomi Studio crafts premium brands and websites — shown, not told. No on-screen claims; the craft is the claim.
- **Audience and arc:** first-time visitors on the homepage hero. Mark breaks open → one scene per service (websites, branding, apps, 3D) → mark reassembles.
- **Format:** 1920x1080, 15.0s, 30fps, silent (muted autoplay loop), no captions, no voiceover.
- **Truthfulness:** only KIMCHI (frame 2) is a real client and real capture. Branding uses Jomi's own identity as the example; the app is an unnamed concept. No client names, logos, or claims in concept scenes.
- **Spine:** the four Jomi brand shapes (square, rounded square r9, rounded square r16, green sphere). They are the hero prop in every frame: they break out of the mark (1), orbit the devices (2), become the identity pattern (3), the app's UI accents (4), the studio objects (5), and lock back into the mark (6).
- **Seamless loop:** frame 6's last frame equals frame 1's first frame (assembled mark, dark stage, same camera pose) — a match cut on the mark.
- **Centre-safe:** all focal action inside the centre 864x1080 column (x 528–1392), because the site hero crops to 4:5 on phones.
- **Brand:** cream #F6F1E9 · ink #1F1D24 · green #4FC59A · KIMCHI red #E5161E (frame 2 only). Type: the Jomi wordmark is used as the real logo SVG (public/brand/jomi_logo_dark.svg), not retyped. Source: the user's brand files.
- **Rendering:** one Three.js canvas (three@0.181.2, pinned), time from `hf-seek`; MeshPhysicalMaterial (clearcoat, transmission for the glass sphere) with an environment map; seeded motion only.
- **Bans:** no on-screen marketing copy; no fake UI — the KIMCHI screens are the real captures; no Apple logo on the laptop; no neon/cyan accents; no full-screen linear gradients on dark (banding); slideshow failure (each scene a static card) and screensaver failure (motion with no intent) both avoided — every frame's motion is a camera move with a landing.
- **Held frame:** frame 6 holds the lockup ~0.8s before the loop seam.

## Frame 1 — Break open (0.0–2.4s)

- scene: The assembled Jomi mark in glossy 3D on a near-black ink stage breaks apart; the four shapes drift into a slow orbit as the camera dollies in.
- duration: 2.4s
- poster: 1.4s
- transition_in: cut (loop seam from Frame 6 — match cut on the mark)
- status: outline
- src: compositions/01-break-open.html
- blueprint: compose — depth-scatter-assemble (reversed: scatter), 3d-camera-flight, depth-of-field-blur, ambient-glow-bloom
- seam_out: cut on max velocity — the green sphere sweeps past the lens left→right (motion-blur-streak)

0.0–0.3s the mark sits whole (cream square, two rounded squares, green sphere), soft top key and a cool rim. 0.3–1.9s it breaks: the shapes separate along depth, each spinning slowly, clearcoat catching a moving highlight; camera dollies in and tilts 8°. Ink #1F1D24 stage with a soft green radial glow breathing behind (ambient-glow-bloom), faint fog. 1.9–2.4s the green sphere accelerates past the lens — blur peaks at the cut.
Why: opens on the brand itself and shows it is alive and three-dimensional — sets the premium tone.
Constraint: no text; no particle confetti.

## Frame 2 — Websites: KIMCHI (2.4–5.2s)

- scene: A MacBook-style laptop and a phone float in red-lit darkness; the real KIMCHI desktop and mobile sites scroll on their screens; two brand shapes orbit as defocused satellites.
- duration: 2.8s
- poster: 1.4s
- transition_in: cut
- status: outline
- src: compositions/02-websites.html
- blueprint: device-surface-showcase (Adapt — floating-window push-scroll variant: held hero devices, screens scroll, continuous 3D push)
- seam_out: cut — the camera's push accelerates into the laptop screen; blur peaks at the cut

Laptop (thin black bezel, notch, silver aluminium base, no logo) centre, lid open ~105°, angled 18° to camera; phone in front-right, tilted. desktop.webp scrolls ~1300 px, mobile.webp ~1600 px, with their real header/bottom-bar strips fixed on top. KIMCHI-red #E5161E rim light from behind-left, cool fill, reflections sliding across the lid, soft red floor haze. Cream square + green sphere orbit behind, defocused (depth-of-field-blur). Camera: slow arc left→right + slight push.
Why: proof — real client work, shown on real devices. The only real client in the reel.
Constraint: screens show only the real captures; no invented UI; no Apple logo.

## Frame 3 — Branding (5.2–7.6s)

- scene: Jomi's own identity system floats in a warm cream void — business cards, a letterhead, an envelope and a round green sticker, all printed with the Jomi mark, wordmark and a pattern built from the four shapes.
- duration: 2.4s
- poster: 1.2s
- transition_in: cut
- status: outline
- src: compositions/03-branding.html
- blueprint: compose — depth-scatter-assemble (items glide into a loose stack), 3d-camera-flight (slow push + tilt), depth-of-field-blur, sine-wave-loop (idle float)
- seam_out: cut — a business card flips toward camera, filling frame on the flip's fastest point

Paper items with real thickness and soft shadow: two business cards (one ink with a cream mark, one cream with the ink wordmark), an A4 letterhead (cream, mark top-left, a quiet four-shape pattern strip along the bottom edge), an envelope (ink, cream mark), a round sticker (green #4FC59A, cream mark). They float at different depths, slowly rotating as they glide into a loose fan; camera pushes in with a slight tilt; shallow focus on the front card. Warm cream #F6F1E9 backdrop with a soft warm shadow gradient (radial, not linear).
Why: branding is a core service — shown on the studio's own identity, not a fake client.
Constraint: no contact details or taglines printed; Jomi artwork only.

## Frame 4 — Apps (7.6–10.0s)

- scene: On a full-bleed green field, a phone with an unnamed concept app (cards, a progress ring, a button) rises and turns; three UI cards pop out of the screen and float around it.
- duration: 2.4s
- poster: 1.4s
- transition_in: cut
- status: outline
- src: compositions/04-apps.html
- blueprint: compose — spring-pop-entrance (UI cards), orbit-3d-entry, 3d-camera-flight, sine-wave-loop
- seam_out: cut — the phone spins 90° fast; blur peaks at the cut

Background green #4FC59A with a deeper green radial vignette and faint large ghost shapes (the four brand shapes at ~12% opacity, drifting). Phone (ink frame) centre, rotating from three-quarter to near-front. Screen: a concept dashboard in cream/ink/green — a greeting line, a progress ring, two cards, a pill button; no brand name. 0.6–1.4s three cards (a chart card, a toggle row, a chip group) spring out of the screen and orbit (spring-pop-entrance, staggered ≤0.4s).
Why: UI/UX is a core service — shown as a concept, clearly not a client.
Constraint: no product name or logo in the app; no fake metrics claims (decorative numbers only).

## Frame 5 — 3D & motion (10.0–12.2s)

- scene: A bright cream studio: matte ink and cream shapes rest on a seamless cyclorama; a green glass sphere rolls into frame and refracts them.
- duration: 2.2s
- poster: 1.2s
- transition_in: cut
- status: outline
- src: compositions/05-studio.html
- blueprint: compose — 3d-camera-flight (slow lateral glide), depth-of-field-blur, sine-wave-loop
- seam_out: cut — camera tilts fast down toward the sphere; blur peaks at the cut

Cream #F6F1E9 cyclorama, soft overhead light, long gentle shadows. Ink square and two rounded squares in matte (high roughness) at different heights — one balanced on an edge. The green sphere is glass (transmission, IOR 1.45, tinted #4FC59A), rolling right→centre and stopping, refracting the shapes. Camera glides right→left at low height, shallow depth of field.
Why: creative development / 3D is a service; the calm beat before the finale.
Constraint: no text; four objects only.

## Frame 6 — Lockup (12.2–15.0s)

- scene: Back in the dark: the four shapes fly in from depth and lock into the Jomi mark; the "Jomi Studio" wordmark reveals beside it; the wordmark fades and the camera settles into Frame 1's opening pose.
- duration: 2.8s
- poster: 2.0s
- transition_in: cut
- status: outline
- src: compositions/06-lockup.html
- blueprint: logo-assemble-lockup (Adapt — elements assemble around the mark, glow bloom, wordmark reveal)
- seam_out: loop seam — match cut on the assembled mark into Frame 1

12.2–13.4s shapes fly in from four depths and snap into the 2x2 mark (depth-scatter-assemble, power4.out landings, slight spring on the sphere). 13.4–14.0s green glow blooms behind (ambient-glow-bloom); the wordmark (from the logo SVG, cream) wipes in right of the mark. 14.0–14.6s held lockup. 14.6–15.0s wordmark fades, the mark slides back to centre and the camera eases to Frame 1's exact start pose.
Why: the brand lands; the loop restarts invisibly.
Constraint: wordmark is the real logo artwork; no tagline, no URL.
