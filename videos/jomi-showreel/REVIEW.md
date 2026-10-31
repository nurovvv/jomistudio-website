# REVIEW — showreel v2 (the real projects), 2026-10-30

## Creative calls
- One real project per ~2.4 s shot, each in its own brand world (cuberto.com hero grammar, measured: 12 s, 4 shots of
  ~3 s): KIMCHI red → Odiliyon blue fluted wall → Bilyard felt → Zarbulmasal navy + ikat → Khoja Sokhtmon's own 3D
  site, between v1's Jomi-mark bookends, 15.0 s seamless loop.
- Every transition is caused on screen: sphere velocity cut; push into the laptop screen matched to the phone screen;
  whip tilt down into an overhead shot; the 8-ball rolling into the lens (object becomes the world); Zarbulmasal's
  right-to-left Persian script wipe crossing the whole frame; dusk-to-night sky dipping into the dark lockup.
- Khoja Sokhtmon is footage rendered frame by frame from its live site (window.__app: camera + setHours) with its own
  UI kept, so it reads as a website; the other shots are real captures on Three.js devices.
- Not built: a narrated or music version (muted autoplay hero), a branding/apps concept scene (v1) — replaced by the
  real projects as asked.

## Measured vs looked at
- `hyperframes check` (0.8.143): lint, runtime, layout (9 samples), motion: 0 errors, 0 warnings.
- Snapshots inspected: every shot's middle, every seam at ±0.05–0.2 s (1.2, 3.7, 6.1, 8.5, 10.6–10.9, 13.0, 15.0→0),
  the 360 px phone sheet (`snapshot --review` with CLI 0.8.222; it sees only DOM clips, so canvas seams were checked
  with targeted `--at` snapshots).
- Fixed in review: Odiliyon wide shot too small (hero < 40 % of height → camera to 4.75 units); Zarbulmasal ikat
  diamond too big and heavy (24 % at 1500 px → 17 % at 1060 px, whole shape behind the phones); the 8-ball dolly
  clipped by the near plane at the cut (near 0.1 → 0.02, dolly lands 2 frames early so the ball fills the frame).
- Not checked by anyone: playback on a real phone browser; the render's colour after H.264 encode (checked on the
  final files only by eye).

## Weakest shot
- Bilyard's middle (7.4–7.8 s): while the camera turns from the lifted cards to the balls, the cards leave the frame
  top-left. With more time: hold the three-quarter view 0.3 s longer and start the ball turn later.

## Kept on purpose
- Zarbulmasal on a navy ground: it is the app icon's own ground and motif, not the generated-video default.
- The lockup's soft green glow and the amber scan light on Odiliyon's QR: brand/story lights, not decoration.
