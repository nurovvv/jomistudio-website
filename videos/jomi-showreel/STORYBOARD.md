---
format: 1920x1080
duration: 15s
message: "Jomi Studio ships real websites and apps for real businesses — five of them, shown, not told"
arc: Mark breaks open → KIMCHI → Odiliyon → Bilyard → Zarbulmasal → Khoja Sokhtmon → mark reassembles (loops)
audience: visitors landing on jomistudio.tj — prospective clients in Dushanbe and abroad
mode: automation
rhythm: drift → PUNCH → pull-back → whip → roll-in → wipe → dusk → lockup-hold (loop)
---

## Decisions (v2, 2026-10-30)

- **Message:** the work itself. No on-screen copy; the only letters are the projects' own screens and wordmarks.
- **Grammar from the reference (cuberto.com hero, measured):** one real project per ~2.4 s scene, each in its own
  colour world, devices staged in 3D with a camera move; Jomi's v1 bookends (mark break-open, lockup) keep the loop.
- **Truthfulness:** all five projects are real; every screen is a real capture; Khoja Sokhtmon is rendered from its
  own live 3D engine. Zarbulmasal is Jomi's own app (Google Play, developer Jomi Studio).
- **Format:** 1920x1080, 15.0 s, 30 fps, silent loop. Centre-safe: heroes inside x 528–1392 (the hero crops to 4:5
  on phones).
- **Rendering:** one Three.js canvas (three@0.181.2) for shots 0–4 and 6, time from `hf-seek`; shot 5 is a muted
  `<video>` clip (frames baked from the live site) revealed by a clip-path wipe on the root timeline.
- **Transitions (6 kinds, each caused on screen):** velocity cut (sphere), push into a screen / match on a screen,
  whip tilt, object becomes the world (8-ball), wipe (the Persian script wipe crossing the frame), dusk dip into the
  dark stage.
- **Bans:** see SPEC.md BANNED.

## Frame 0 — Break open (0.0–1.2s)

- scene: The assembled Jomi mark in glossy 3D on the ink stage breaks apart; the green sphere sweeps past the lens.
- duration: 1.2s
- transition_in: cut (loop seam from Frame 6 — match on the mark)
- status: animated
- src: src/reel.js#shot0
- rules: depth-scatter-assemble (scatter), 3d-camera-flight, ambient-glow-bloom, motion-blur-streak
- seam_out: cut on the sphere's fastest frame

## Frame 1 — KIMCHI (1.2–3.7s)

- scene: Laptop + phone float in red-lit darkness; the real KIMCHI desktop and mobile sites scroll; the camera arcs
  left→right and pushes into the laptop screen.
- duration: 2.5s
- transition_in: cut
- status: animated
- src: src/reel.js#shot1
- blueprint: device-surface-showcase (Adapt)
- seam_out: accelerating push into the laptop screen (blur peaks at the cut)

## Frame 2 — Odiliyon (3.7–6.1s)

- scene: Opens tight on a phone showing the real Odiliyon menu (match on the screen push) and pulls back to reveal a
  cream table stand with a brass frame, the arch mark, «ОДИЛИЁН» and the real QR code, against the café's blue
  fluted wall; an amber scan line sweeps the code; the three real dish cards fly out of the phone.
- duration: 2.4s
- transition_in: match cut (screen → screen)
- status: animated
- src: src/reel.js#shot2
- rules: multi-phase-camera (pull-back), spring-pop-entrance (dish cards), depth-of-field-blur
- seam_out: whip tilt down (camera pitch accelerates, blur peaks at the cut)

## Frame 3 — Bilyard (6.1–8.5s)

- scene: The camera arrives from above over green billiard felt: a tablet lies on it showing the real tables board;
  three real table cards lift off the screen; the cue ball rolls into the 8-ball, which rolls into the lens.
- duration: 2.4s
- transition_in: cut (the tilt continues from Frame 2)
- status: animated
- src: src/reel.js#shot3
- rules: 3d-camera-flight, orbit-3d-entry (cards lift), depth-of-field-blur
- seam_out: object becomes the world — the black 8-ball fills the frame

## Frame 4 — Zarbulmasal (8.5–10.9s)

- scene: Out of black into the app's navy: three Android phones with the real store screens fan out over the ikat
  diamond; the home and proverb screens wipe from Tajik to Persian right→left behind a coral edge.
- duration: 2.4s
- transition_in: cut from black (8-ball)
- status: animated
- src: src/reel.js#shot4
- rules: orbit-3d-entry (fan), scale-swap-transition (script wipe), 3d-camera-flight
- seam_out: the coral wipe crosses the whole frame (10.6–10.9) onto Frame 5

## Frame 5 — Khoja Sokhtmon (10.6–13.0s)

- scene: The live 3D site itself — the building, its floors panel, apartment panel and time slider — at sunset; the
  site's clock runs to night and the windows light up; the camera tilts into the night sky and the UI fades.
- duration: 2.4s (0.3s under the wipe)
- transition_in: wipe (from Frame 4)
- status: animated
- src: index.html#khoja (assets/khoja/building.mp4)
- rules: viewport-change (wipe reveal), 3d-camera-flight (baked)
- seam_out: dusk dip — dark sky into the dark stage

## Frame 6 — Lockup (13.0–15.0s)

- scene: The four mark pieces fly in on the dark stage and lock; the wordmark reveals; hold; the lockup slides back
  to the centred mark = Frame 0's first frame.
- duration: 2.0s
- transition_in: cut (dark to dark)
- status: animated
- src: src/reel.js#shot6
- blueprint: logo-assemble-lockup (Adapt)
- seam_out: loop seam (match on the mark)
