# SPEC — Jomi Studio hero showreel v2: the real projects

GOAL:    In one 15 s loop a first-time visitor sees that Jomi Studio ships real websites and apps for real
         businesses — five of them, each in its own world — and the loop lands back on the Jomi mark.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps, silent seamless loop (the site hero: muted autoplay, crops to 4:5 on
         phones, so every hero sits in the centre 864 px column, x 528–1392).
TIME:    15.0 s x 30 = 450 frames. No music (muted autoplay).
LOOK:    Each project in its own brand world, built from that brand's real colours and materials; no added type —
         the only letters are the projects' own screens and wordmarks.
         - Jomi bookends: ink stage #121116, cream #F6F1E9 pieces, green #4FC59A sphere; the existing satin dunes.
         - KIMCHI: near-black #0E0B0C, KIMCHI red #E5161E rim and floor haze.
         - Odiliyon: the site's fluted wall, blue #1F3A8A with 1 px dark / 1 px light flutes every 7 px (scaled),
           warm lamp pool rgba(230,204,150,.24) from the top; stand cream #F5F1E8, brass #B49969, amber #E8A33A.
         - Bilyard: billiard felt #1F7049 deepening to #0F3D2E at the edges, a lamp pool 1.3x brighter in the middle,
           felt noise 3 %.
         - Zarbulmasal: icon navy #0B1327 with the ikat diamond (its icon art) at 22 % behind; coral #ED6A4E only on
           the script-wipe edge.
         - Khoja Sokhtmon: the live site's own 3D render with its own UI (no restyle).
         Medium: real product UI on 3D devices under studio light — warm key from upper left, a coloured rim from
         behind in the project's colour, contact shadows at 0.3–0.5, grain 1.4–1.6 %, vignette 0.35–0.5,
         depth of field only on the exits.
OBJECTS: KIMCHI — a MacBook-style laptop (no logo) and a phone, the real site scrolling on both.
         Odiliyon — a cream acrylic table stand in a brass frame with the arch-and-bowl mark, «ОДИЛИЁН», «Чайхона в
         Вахдате» and the real QR code; a phone with the real menu; the three real «Попробуйте» dish cards.
         Bilyard — a tablet lying on felt showing the real tables board; three real table cards lifting off it;
         a cue ball and an 8-ball (black with a white roundel and «8») that roll for real.
         Zarbulmasal — three Android phones (punch-hole camera, parchment status bar) with the real store screens:
         home, proverb of the day, Umari Khayyom; home and proverb switch Tajik → Persian.
         Khoja Sokhtmon — the live 3D site itself at 1920 x 1080 (building, floors panel, apartment panel, time
         slider) rendered frame by frame from its own engine, sunset to night.
MOTION:  arrivals expo.out / outQuint; camera inOutSine; exits accelerate inCubic over 0.3–0.45 s into the cut;
         springs (cards, balls) outBack 1.4 ≈ damping 0.75; one hero move per shot, secondary moves 50–70 % as far,
         starting 3–6 frames after it.
SHOTS:   0  f0–36    (0.0–1.2)  Jomi mark breaks open on the ink stage; the green sphere sweeps the lens → cut
                                 on its fastest frame.
         1  f36–111  (1.2–3.7)  KIMCHI: laptop + phone in red light, real site scrolling; camera arcs left→right;
                                 exit: accelerating push into the laptop screen.
         2  f111–183 (3.7–6.1)  Odiliyon: opens tight on the phone's menu (match on the screen push) and pulls back
                                 to the QR stand on the blue fluted wall; an amber scan line sweeps the QR; the three
                                 dish cards fly out of the phone; exit: whip tilt down.
         3  f183–255 (6.1–8.5)  Bilyard: arrives from above (the tilt continues) over green felt; the table cards
                                 lift off the tablet; the cue ball rolls into the 8-ball; the 8-ball rolls into the
                                 lens and its black fills the frame → cut.
         4  f255–327 (8.5–10.9) Zarbulmasal: out of black into navy; the phones fan out over the ikat diamond; the
                                 home and proverb screens wipe from Tajik to Persian right→left with a coral edge;
                                 exit: the coral wipe crosses the whole frame (10.6–10.9) onto shot 5.
         5  f318–390 (10.6–13.0) Khoja Sokhtmon: the live 3D site at sunset, revealed by that wipe; its clock runs
                                 to night and the windows light up; the camera tilts into the night sky and the UI
                                 fades → dark.
         6  f390–450 (13.0–15.0) Lockup: the four mark pieces fly in on the dark stage, the wordmark reveals, holds
                                 0.6 s, slides back to centre = frame 0 (seamless loop).
BANNED:  invented UI or copy (every screen is a real capture); titles, labels, numbers, HUD or corner marks added by
         us; the logo docked in a corner; glow orbs, rings, particles or lens flares as decoration (the mark stage
         keeps only its existing soft green ambient glow); purple/blue gradients, glass cards; worlds crossfading
         into each other; everything centred and static; an Apple logo on the laptop; claims beyond the five real
         projects.
QA:      t 0.9 (break-open), 2.5 (KIMCHI), 4.6 (Odiliyon stand + scan), 7.2 (Bilyard cards up), 9.6 (Zarbulmasal
         wipe), 11.2 (Khoja sunset), 12.3 (night), 14.3 (lockup); every seam at ±0.1 s; the centre 4:5 crop.
