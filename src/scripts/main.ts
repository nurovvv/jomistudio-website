import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* ---------------- Text splitting ---------------- */
// Wraps every word in <span class="w"><span>word</span></span>, keeping nested elements.
function splitWords(el: Element, cls = 'w') {
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent!.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(' '));
          const outer = document.createElement('span');
          outer.className = cls;
          if (cls === 'w') {
            const inner = document.createElement('span');
            inner.textContent = part;
            outer.append(inner);
          } else outer.textContent = part;
          frag.append(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
    });
  };
  walk(el);
  return $$(cls === 'w' ? '.w > span' : `.${cls}`, el);
}
const splits = new Map<Element, HTMLElement[]>();
$$('[data-split]').forEach((el) => splits.set(el, splitWords(el)));

/* ---------------- Smooth scroll ---------------- */
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis!.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ---------------- Curtain: loader + page transitions ---------------- */
const curtain = $('.curtain');
const curtainMarks = $$('.curtain__mark .mark__s');
let firstVisit = true;
try { firstVisit = !sessionStorage.getItem('jomi-visited'); sessionStorage.setItem('jomi-visited', '1'); } catch {}

function revealPage() {
  if (reduced) { gsap.set(curtain, { autoAlpha: 0 }); heroIntro(); return; }
  lenis?.stop();
  const tl = gsap.timeline({
    onComplete: () => { lenis?.start(); gsap.set(curtain, { yPercent: 100, autoAlpha: 1 }); gsap.set(curtainMarks, { autoAlpha: 0 }); },
  });
  if (firstVisit) {
    tl.from(curtainMarks, { scale: 0, rotation: -90, stagger: 0.09, duration: 0.8, ease: 'back.out(1.7)' })
      .to('.curtain__mark', { rotation: 90, duration: 0.8, ease: 'expo.inOut' }, '+=0.15')
      .to(curtainMarks, { scale: 0, stagger: 0.05, duration: 0.45, ease: 'power3.in' }, '-=0.1');
  } else {
    gsap.set(curtainMarks, { autoAlpha: 0 });
  }
  tl.to(curtain, { yPercent: -100, duration: 1, ease: 'expo.inOut' })
    .add(heroIntro, '-=0.55');
}

function leaveTo(href: string) {
  if (reduced) { location.href = href; return; }
  lenis?.stop();
  gsap.fromTo(curtain, { yPercent: 100, autoAlpha: 1 }, {
    yPercent: 0, duration: 0.75, ease: 'expo.inOut', onComplete: () => { location.href = href; },
  });
}

document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest('a');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('#')) {
    const target = href.length > 1 ? document.querySelector(href) : null;
    if (!target) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: href === '#contact' ? 0 : -90, duration: 1.6 });
    else target.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname) return;
  e.preventDefault();
  leaveTo(url.href);
});
// Restore when coming back via the browser's back/forward cache
addEventListener('pageshow', (e) => {
  if (e.persisted) { gsap.set(curtain, { yPercent: 100 }); lenis?.start(); }
});

/* ---------------- Hero ---------------- */
// Hero starts hidden (behind the curtain) so nothing flashes before the intro
gsap.set($$('.hero__title .w > span'), { yPercent: 110 });
gsap.set('[data-hero-fade], .hero__media-wrap', { autoAlpha: 0 });

function heroIntro() {
  const words = splits.get($('.hero__title')) || [];
  gsap.set([...words, ...$$('[data-hero-fade], .hero__media-wrap')], { clearProps: 'transform,opacity,visibility' });
  // The showreel opens out from a smaller rounded window
  const media = $('.hero__media');
  const r = parseFloat(getComputedStyle(media).borderTopLeftRadius) || 0;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(words, { yPercent: 110, duration: 1.3, stagger: 0.045 })
    .from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 1.2 }, 0.35)
    .from('.hero__media-wrap', { y: 80, autoAlpha: 0, duration: 1.6 }, 0.45)
    .fromTo(media, { clipPath: `inset(7% 12% round ${r}px)` }, { clipPath: `inset(0% 0% round ${r}px)`, duration: 2.2, clearProps: 'clipPath' }, 0.45)
    .from('.header__bar', { autoAlpha: 0, y: -16, duration: 1.2 }, 0.3);
}
// Showreel block grows as it scrolls toward the top
gsap.fromTo('.hero__media', { scale: 0.92 }, {
  scale: 1, ease: 'none',
  scrollTrigger: { trigger: '.hero__media', start: 'top 90%', end: 'top 10%', scrub: true },
});

// Visitors who prefer reduced motion see the showreel's poster frame instead of playback
$$<HTMLVideoElement>('.hero__media video').forEach((v) => {
  if (reduced) {
    v.removeAttribute('autoplay');
    v.pause();
  } else if (v.paused) {
    // Some mobile browsers skip the autoplay attribute (data-saver modes); nudge playback once.
    v.play().catch(() => {});
  }
});

// Brand placeholder animation inside the showreel
if ($('.reel', document) && !reduced) {
  const reel = gsap.timeline({ repeat: -1, defaults: { ease: 'expo.inOut', duration: 1.2 } });
  reel.to('.reel__grid', { rotation: '+=90', delay: 0.8 })
    .to('.reel__s', { scale: 0.86, stagger: { each: 0.08, from: 'random' }, duration: 0.6, yoyo: true, repeat: 1, ease: 'power2.inOut' }, '<')
    .to('.reel__grid', { rotation: '+=90', delay: 0.8 });
  gsap.to('.reel__glow--1', { xPercent: 60, yPercent: 30, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  gsap.to('.reel__glow--2', { xPercent: -50, yPercent: -40, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  ScrollTrigger.create({ trigger: '.hero__media', onToggle: (s) => (s.isActive ? reel.play() : reel.pause()) });
}

/* ---------------- Header ---------------- */
// Slides away on scroll down, comes back on scroll up
const header = $('.header');
let headerHidden = false;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const hide = self.direction === 1 && self.scroll() > 300 && !root.classList.contains('is-menu-open');
    if (hide === headerHidden) return;
    headerHidden = hide;
    gsap.to(header, { yPercent: hide ? -100 : 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
  },
});

// Turns white while it sits over a dark section. A zone already under the header at load
// toggles while it is still being created, so the colour is synced once more after.
const darkZones: ScrollTrigger[] = [];
const syncHeader = () => header.classList.toggle('is-dark', darkZones.some((z) => z.isActive));
$$('.hero__media, .work, .faq, .footer').forEach((el) =>
  darkZones.push(ScrollTrigger.create({ trigger: el, start: 'top 36px', end: 'bottom 36px', onToggle: syncHeader })),
);
syncHeader();

// Underlines the link of the section in view
$$<HTMLAnchorElement>('.header__link').forEach((link) => {
  const section = document.getElementById(link.dataset.section!);
  if (!section) return;
  ScrollTrigger.create({
    trigger: section, start: 'top 50%', end: 'bottom 50%',
    onToggle: (st) => link.classList.toggle('is-active', st.isActive),
  });
});

/* ---------------- Phone menu: panel drops down under the header ---------------- */
const burger = $<HTMLButtonElement>('.burger');
const menu = $('.menu');
function closeMenu() {
  if (!root.classList.contains('is-menu-open')) return;
  root.classList.remove('is-menu-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
  lenis?.start();
}
burger.addEventListener('click', () => {
  const open = root.classList.toggle('is-menu-open');
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
  if (!open) { lenis?.start(); return; }
  lenis?.stop();
  if (reduced) return;
  gsap.fromTo('.menu__nav a span', { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 1, delay: 0.15, ease: 'expo.out' });
  gsap.fromTo('.menu__label, .menu__cta, .menu__foot', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.8, delay: 0.3, ease: 'expo.out' });
});
// Tapping the dimmed page behind the panel closes it
menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });
addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());

/* ---------------- Cursor dot + magnetic elements ---------------- */
if (finePointer) {
  const cursor = $('.cursor');
  const label = $('.cursor__label', cursor);
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3' });
  let shown = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!shown) { gsap.set(cursor, { x: e.clientX, y: e.clientY }); shown = true; }
    cursor.classList.remove('is-hidden');
    xTo(e.clientX);
    yTo(e.clientY);
  });
  // Hide when the pointer leaves the window, show again on return
  root.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
  addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  // One delegated listener decides the cursor state for whatever is under the pointer
  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    const view = target.closest<HTMLElement>('[data-cursor]');
    const mode = view?.dataset.cursor;
    const icon = mode === 'arrow' || mode === 'play';
    const link = target.closest('a, button');
    cursor.classList.toggle('is-arrow', mode === 'arrow');
    cursor.classList.toggle('is-play', mode === 'play');
    cursor.classList.toggle('is-view', !!view && !icon);
    cursor.classList.toggle('is-link', !view && !!link);
    if (view && !icon) label.textContent = mode!;
  });

  // Stretch the shape along the direction of travel; it settles round when the pointer rests
  const shape = $('.cursor__shape', cursor);
  let lastX = 0;
  let lastY = 0;
  let vx = 0;
  let vy = 0;
  gsap.ticker.add(() => {
    const x = gsap.getProperty(cursor, 'x') as number;
    const y = gsap.getProperty(cursor, 'y') as number;
    vx += (x - lastX - vx) * 0.35;
    vy += (y - lastY - vy) * 0.35;
    lastX = x;
    lastY = y;
    const stretch = Math.min(Math.hypot(vx, vy) / 60, 1) * 0.32;
    gsap.set(shape, { rotation: (Math.atan2(vy, vx) * 180) / Math.PI, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.55 });
  });

  $$('.magnetic').forEach((el) => {
    const strength = Number(el.dataset.strength || 0.3);
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.6, ease: 'power3' });
    });
    el.addEventListener('pointerleave', () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .3)' }));
  });
}

/* ---------------- Showreel player ---------------- */
// Clicking the hero video opens it large; close with the button, Esc, or a click outside.
const reelModal = document.querySelector<HTMLElement>('.reel-modal');
const heroMedia = document.querySelector<HTMLElement>('.hero__media');
if (reelModal && heroMedia) {
  const modalVideo = $<HTMLVideoElement>('.reel-modal__video', reelModal);
  const heroVideo = heroMedia.querySelector('video');
  let open = false;
  const closeBtn = $<HTMLButtonElement>('.reel-modal__close', reelModal);
  const openReel = () => {
    if (open) return;
    open = true;
    lenis?.stop();
    reelModal.setAttribute('aria-hidden', 'false');
    if (heroVideo) {
      modalVideo.currentTime = heroVideo.currentTime;
      heroVideo.pause();
    }
    // Started from the click, so unmuted playback is allowed (the reel has no sound track anyway);
    // muted autoplay would be paused by the browser while the player is still fading in.
    modalVideo.play().catch(() => {
      modalVideo.muted = true;
      modalVideo.play().catch(() => {});
    });
    gsap.set(reelModal, { visibility: 'visible' });
    gsap.fromTo(reelModal, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out', overwrite: true });
    gsap.fromTo(modalVideo, { scale: 0.92, y: 30 }, { scale: 1, y: 0, duration: 0.9, ease: 'expo.out' });
    closeBtn.focus();
  };
  const closeReel = () => {
    if (!open) return;
    open = false;
    reelModal.setAttribute('aria-hidden', 'true');
    gsap.to(reelModal, {
      opacity: 0, duration: 0.4, ease: 'power2.in', overwrite: true,
      onComplete: () => {
        gsap.set(reelModal, { visibility: 'hidden' });
        modalVideo.pause();
      },
    });
    if (heroVideo && !reduced) heroVideo.play().catch(() => {});
    lenis?.start();
    heroMedia.focus();
  };
  // Keep the reel running while the player is open, even if the browser pauses it
  modalVideo.addEventListener('pause', () => {
    if (open) modalVideo.play().catch(() => {});
  });
  heroMedia.addEventListener('click', openReel);
  heroMedia.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openReel();
    }
  });
  $('.reel-modal__close', reelModal).addEventListener('click', closeReel);
  reelModal.addEventListener('click', (e) => { if (e.target === reelModal) closeReel(); });
  addEventListener('keydown', (e) => e.key === 'Escape' && closeReel());
}

/* ---------------- Scroll animations ---------------- */
if (!reduced) {
  // Headings: words rise from a mask
  splits.forEach((words, el) => {
    if (el.classList.contains('hero__title')) return;
    gsap.from(words, {
      yPercent: 110, duration: 1.2, stagger: 0.04, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  // Paragraphs: words light up as you scroll
  $$('[data-scrub-words]').forEach((el) => {
    const words = splitWords(el, 'sw');
    gsap.to(words, {
      opacity: 1, stagger: 0.1, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 50%', scrub: true },
    });
  });

  // Simple fade-ups
  $$('[data-fade]').forEach((el) =>
    gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } }),
  );

  // Staggered group (client logos): each one pops up from nothing
  gsap.set('[data-stagger]', { scale: 0 });
  ScrollTrigger.batch('[data-stagger]', {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { scale: 1, duration: 1.6, stagger: 0.1, ease: 'expo.out' }),
  });

  // Showreel drifts inside its frame as the page scrolls past (zoomed in a little so
  // its edges never show)
  const reelInner = $$('.hero__media > video, .hero__media > .reel');
  gsap.set(reelInner, { scale: 1.1 });
  gsap.fromTo(reelInner, { yPercent: -4.5 }, {
    yPercent: 4.5, ease: 'none',
    scrollTrigger: { trigger: '.hero__media', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // Call-to-action buttons grow out of a thin line, then their label rises in
  $$('[data-pop]').forEach((btn) => {
    gsap.timeline({ scrollTrigger: { trigger: btn, start: 'top 94%' } })
      .fromTo(btn, { scaleX: 0, scaleY: 0.5 }, { scaleX: 1, scaleY: 1, duration: 1.5, ease: 'expo.out' })
      .from($('.btn__roll', btn), { yPercent: 110, scale: 0.6, duration: 1.2, ease: 'expo.out' }, 0.1);
  });

  initServices();
  initMocks();
  initLifts();
  initScans();

  // Work cards rise in; right column drifts for a parallax offset
  $$('.card').forEach((card) =>
    gsap.from(card, { y: 120, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 95%' } }),
  );
  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px)', () => {
    if (!document.querySelector('.work__col[data-speed="1"]')) return;
    gsap.to('.work__col[data-speed="1"]', {
      y: -160, ease: 'none',
      scrollTrigger: { trigger: '.work__cols', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Testimonials: cards rest in a tilted pile and spread into a tidy grid while the
  // pointer is over them (tap toggles on touch screens). Desktop layout only.
  mm.add('(min-width: 901px)', () => {
    const board = document.querySelector<HTMLElement>('.reviews__board');
    if (!board) return;
    const cards = $$('.review', board);
    // Per-card nudge and tilt so the pile looks hand-dropped
    const pile = [
      { dx: -46, dy: 18, r: -8 },
      { dx: 4, dy: -26, r: 3 },
      { dx: 48, dy: 22, r: 8 },
      { dx: -28, dy: -6, r: -15 },
      { dx: 34, dy: -14, r: 13 },
    ];
    // Offset that pulls a card from its grid slot toward the board centre
    const pileOf = (i: number) => {
      const c = cards[i];
      const p = pile[i % pile.length];
      return {
        x: (board.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2)) * 0.62 + p.dx,
        y: (board.clientHeight / 2 - (c.offsetTop + c.offsetHeight / 2)) * 0.62 + p.dy,
        rotation: p.r,
      };
    };
    let spread = false;
    const toPile = (duration = 1) =>
      cards.forEach((c, i) => gsap.to(c, { ...pileOf(i), duration, delay: duration ? i * 0.03 : 0, ease: 'expo.out', overwrite: 'auto' }));
    const toGrid = () =>
      gsap.to(cards, { x: 0, y: 0, rotation: 0, duration: 1, stagger: 0.03, ease: 'expo.out', overwrite: 'auto' });
    const set = (open: boolean) => { if (open === spread) return; spread = open; open ? toGrid() : toPile(); };

    toPile(0);
    gsap.from(cards, {
      yPercent: 70, autoAlpha: 0, duration: 1.4, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: board, start: 'top 80%' },
    });

    const enter = (e: PointerEvent) => e.pointerType === 'mouse' && set(true);
    const leave = (e: PointerEvent) => e.pointerType === 'mouse' && set(false);
    const tap = (e: PointerEvent) => e.pointerType !== 'mouse' && set(!spread);
    const resize = () => { if (!spread) toPile(0); };
    board.addEventListener('pointerenter', enter);
    board.addEventListener('pointerleave', leave);
    board.addEventListener('pointerup', tap);
    addEventListener('resize', resize);
    return () => {
      board.removeEventListener('pointerenter', enter);
      board.removeEventListener('pointerleave', leave);
      board.removeEventListener('pointerup', tap);
      removeEventListener('resize', resize);
      gsap.set(cards, { clearProps: 'transform' });
    };
  });

  // Why cards grow from nothing one after another, once, when the grid comes into
  // view; their numbers count up at the same time.
  gsap.set('.stat', { scale: 0, autoAlpha: 0 });
  ScrollTrigger.create({
    trigger: '.why__grid', start: 'top 85%', once: true,
    onEnter: () => {
      gsap.to('.stat', { scale: 1, autoAlpha: 1, duration: 1.3, stagger: 0.09, ease: 'expo.out' });
      $$('[data-count]').forEach((el) => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: Number(el.dataset.count), duration: 2, delay: 0.2, ease: 'power3.out',
          onUpdate: () => (el.textContent = String(Math.round(obj.v))),
        });
      });
    },
  });

  // Footer: content rises from underneath, rings breathe
  gsap.from('.footer__cta', {
    yPercent: 25, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 20%', scrub: true },
  });
  gsap.to('.footer__rings span', { scale: 1.06, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.25, from: 'start' } });
}

/* ---------------- Services: cards open and close with scroll position ---------------- */
// A card's openness follows where it sits on screen: closed while its top is below
// 72% of the viewport, fully open once it reaches 32%, and partly open in between.
// Scrolling back up plays the same motion in reverse. Positions are read live, so
// cards above changing height never throw the others off.
function initServices() {
  const cards = $$('.srv').map((card) => ({
    card,
    body: $('.srv__body', card),
    inner: $('.srv__inner', card),
    art: $('.srv__art', card),
    fade: $$('.srv__desc, .srv__link', card),
    h: 0,
    p: -1,
  }));
  const bg = gsap.utils.interpolate('#EFEFF1', '#1F1D24');
  const fg = gsap.utils.interpolate('#9A97A0', '#FFFFFF');
  const ease = gsap.parseEase('power2.inOut');
  const clamp = gsap.utils.clamp(0, 1);

  const render = (c: (typeof cards)[number], p: number) => {
    if (Math.abs(c.p - p) < 0.0005) return;
    c.p = p;
    const t = clamp((p - 0.45) / 0.55); // text fades in over the second half
    c.card.style.backgroundColor = bg(p);
    c.card.style.color = fg(p);
    c.body.style.height = `${(p * c.h).toFixed(2)}px`;
    c.art.style.opacity = String(p);
    c.fade.forEach((el) => {
      el.style.opacity = String(t);
      el.style.transform = `translateY(${((1 - t) * 24).toFixed(2)}px)`;
    });
  };
  const measure = () => cards.forEach((c) => { c.h = c.inner.offsetHeight; c.p = -1; });
  const update = () => {
    const vh = innerHeight;
    const tops = cards.map((c) => c.card.getBoundingClientRect().top); // read all, then write
    cards.forEach((c, i) => render(c, ease(clamp((vh * 0.72 - tops[i]) / (vh * 0.4)))));
  };

  measure();
  update();
  if (lenis) lenis.on('scroll', update);
  else addEventListener('scroll', update, { passive: true });
  // Sections below are only reached once every card is open, so measure their
  // trigger positions with the cards open, then restore the real state.
  ScrollTrigger.addEventListener('refreshInit', () => { measure(); cards.forEach((c) => render(c, 1)); });
  ScrollTrigger.addEventListener('refresh', () => { cards.forEach((c) => (c.p = -1)); update(); });
}

/* ---------------- Project phone mockups ---------------- */
// The screens scroll through the client's site while the card is hovered (on touch
// screens: while it is in view), then glide back to the start.
function initMocks() {
  $$('[data-mock]').forEach((mock) => {
    const card = mock.closest<HTMLElement>('.card')!;
    const tl = gsap.timeline({ paused: true, repeat: -1, yoyo: true, repeatDelay: 0.6 });
    $$('.mock__page', mock).forEach((img, i) => {
      img.style.transform = '';
      tl.fromTo(img,
        { yPercent: -Number(img.dataset.start) },
        { yPercent: -Number(img.dataset.end), duration: 6.5, ease: 'sine.inOut' }, i * 0.25);
    });
    let rewind: gsap.core.Tween | undefined;
    const play = () => { rewind?.kill(); tl.play(); };
    const stop = () => { tl.pause(); rewind = gsap.to(tl, { totalTime: 0, duration: 1.2, ease: 'expo.out' }); };
    if (finePointer) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
    } else {
      ScrollTrigger.create({ trigger: card, start: 'top 75%', end: 'bottom 25%', onToggle: (st) => (st.isActive ? play() : stop()) });
    }
  });
}

/* ---------------- Project lift scenes ---------------- */
// Hovering the card (on touch screens: having it in view) leans the tablet toward you,
// lifts its cards higher, where they keep bobbing, and rolls the cue ball into the
// 8-ball. On leave it all settles back. The pointer also tilts the scene a few degrees.
function initLifts() {
  $$('[data-lift]').forEach((scene) => {
    const card = scene.closest<HTMLElement>('.card')!;
    const tilt = $('.lift__tilt', scene);
    const stage = $('.lift__stage', scene);
    const items = $$('.lift__item', scene);
    const cue = scene.querySelector<HTMLElement>('.lift__ball--cue');
    const eight = scene.querySelector<HTMLElement>('.lift__ball--eight');

    const tl = gsap.timeline({ paused: true });
    tl.to(stage, { '--rx': '43deg', '--rz': '-27deg', duration: 1.6, ease: 'expo.inOut' }, 0)
      .to(items, { '--z': (_: number, el: HTMLElement) => Number(el.dataset.up), duration: 1.3, stagger: 0.12, ease: 'expo.out' }, 0.2);
    if (cue && eight) {
      // Both sit on a line along the tablet's near edge. The cue ball runs up to the
      // 8-ball and stops dead; the 8-ball carries on, spinning.
      tl.to(cue, { '--bx': 22, duration: 0.55, ease: 'power2.in' }, 0.25)
        .to(eight, { '--bx': 12, duration: 1.1, ease: 'power3.out' }, 0.8)
        .to($('b', eight), { rotation: 160, duration: 1.1, ease: 'power3.out' }, 0.8);
    }
    const bobs = items.map((it, i) =>
      gsap.to(it, { '--bob': 0.9, duration: 1.5 + i * 0.25, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true }));
    let settle: gsap.core.Tween | undefined;

    const play = () => {
      settle?.kill();
      tl.timeScale(1).play();
      bobs.forEach((b) => b.restart());
    };
    const stop = () => {
      tl.timeScale(1.5).reverse();
      bobs.forEach((b) => b.pause());
      settle = gsap.to(items, { '--bob': 0, duration: 0.8, ease: 'power2.out' });
    };
    if (finePointer) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', () => {
        stop();
        gsap.to(tilt, { '--tx': 0, '--ty': 0, duration: 1.2, ease: 'expo.out', overwrite: 'auto' });
      });
      card.addEventListener('pointermove', (e) => {
        const r = scene.getBoundingClientRect();
        gsap.to(tilt, {
          '--tx': ((e.clientX - r.left) / r.width - 0.5) * 10,
          '--ty': -((e.clientY - r.top) / r.height - 0.5) * 8,
          duration: 0.8, ease: 'power3.out', overwrite: 'auto',
        });
      });
    } else {
      ScrollTrigger.create({ trigger: card, start: 'top 75%', end: 'bottom 25%', onToggle: (st) => (st.isActive ? play() : stop()) });
    }
  });
}

/* ---------------- Project scan scenes ---------------- */
// Hovering the card (on touch screens: having it in view) scans the QR code on the
// stand: a light sweeps down it and pings the phone, which tilts up and scrolls through
// the menu while the dish cards float out from behind it and bob. On leave it all
// settles back. Everything starts from its CSS rest state, so the timeline only uses
// to() tweens and plays back cleanly in reverse.
function initScans() {
  $$('[data-scan]').forEach((scene) => {
    const card = scene.closest<HTMLElement>('.card')!;
    const page = $('.mock__page', scene);
    const pin = scene.querySelector<HTMLElement>('.scan__pin');
    const pinAt = Number(scene.dataset.pin);
    const beam = $('.scan__beam', scene);
    const ping = $('.scan__ping', scene);
    const flash = $('.scan__flash', scene);
    const dishes = $$('.scan__dish', scene);

    const tl = gsap.timeline({ paused: true });
    tl.to($$('.scan__corner', scene), { scale: 1.12, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
      .to(beam, { autoAlpha: 1, duration: 0.15 }, 0.05)
      .to(beam, { '--scan': 1, duration: 0.9, ease: 'power1.inOut' }, 0.05)
      .to(beam, { autoAlpha: 0, duration: 0.25 }, 0.9)
      .to(ping, { autoAlpha: 0.9, duration: 0.05 }, 0.8)
      .to(ping, { scale: 4, autoAlpha: 0, duration: 1, ease: 'power2.out' }, 0.85)
      .to($('.scan__phone', scene), { '--pr': 1.5, '--py': -1.5, duration: 1.3, ease: 'expo.out' }, 0.85)
      .to(flash, { autoAlpha: 0.5, duration: 0.08 }, 0.95)
      .to(flash, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, 1.03)
      .to($('.scan__ghost', scene), { '--gx': -3, duration: 2.6, ease: 'power2.out' }, 0)
      .to(dishes, {
        '--dx': 0, '--dy': 0, '--r': (_: number, el: HTMLElement) => Number(el.dataset.r), '--s': 1,
        duration: 1.2, stagger: 0.14, ease: 'expo.out',
      }, 1.15);

    // The menu scrolls up and down while hovered; the category bar pins once the page
    // has scrolled past it, like on the real site
    page.style.transform = '';
    const scroll = gsap.timeline({ paused: true, repeat: -1, yoyo: true, repeatDelay: 0.8 });
    scroll.fromTo(page, { yPercent: -Number(page.dataset.start) }, {
      yPercent: -Number(page.dataset.end), duration: 6.5, ease: 'sine.inOut',
      onUpdate: () => { if (pin) pin.style.opacity = -(gsap.getProperty(page, 'yPercent') as number) >= pinAt ? '1' : '0'; },
    });
    const bobs = dishes.map((d, i) =>
      gsap.to(d, { '--bob': 0.8 + i * 0.2, duration: 1.6 + i * 0.3, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true }));
    let begin: gsap.core.Tween | undefined;
    let rewind: gsap.core.Tween | undefined;
    let settle: gsap.core.Tween | undefined;

    const play = () => {
      rewind?.kill();
      settle?.kill();
      tl.timeScale(1).play();
      begin = gsap.delayedCall(1, () => { scroll.play(); bobs.forEach((b) => b.restart()); });
    };
    const stop = () => {
      begin?.kill();
      tl.timeScale(1.5).reverse();
      scroll.pause();
      rewind = gsap.to(scroll, { totalTime: 0, duration: 1.2, ease: 'expo.out' });
      bobs.forEach((b) => b.pause());
      settle = gsap.to(dishes, { '--bob': 0, duration: 0.8, ease: 'power2.out' });
    };
    if (finePointer) {
      card.addEventListener('pointerenter', play);
      card.addEventListener('pointerleave', stop);
    } else {
      ScrollTrigger.create({ trigger: card, start: 'top 75%', end: 'bottom 25%', onToggle: (st) => (st.isActive ? play() : stop()) });
    }
  });
}

/* ---------------- Dividers: rules that twang like a plucked string ---------------- */
// Each rule is a quadratic curve in an SVG that reaches 60px above and below it. Rules
// draw in from the left as they scroll into view. When the pointer crosses one, its
// middle is dragged along in the direction of travel, then let go with an elastic wobble.
function initDividers() {
  const mid = 60.5; // the line's y inside the SVG; .5 keeps a 1px stroke crisp
  const curve = (w: number, x = w / 2, y = mid) => `M0,${mid} Q${x},${y} ${w},${mid}`;
  const lines = $$('.divider').map((el) => ({ el, svg: $('svg', el), path: $('path', el), w: 0 }));
  if (!lines.length) return;
  const size = () => lines.forEach((l) => {
    l.w = l.el.offsetWidth;
    gsap.killTweensOf(l.path);
    l.path.setAttribute('d', curve(l.w));
  });
  size();
  addEventListener('resize', size);
  lines.forEach((l) => l.el.classList.add('is-live'));
  if (reduced) return;

  lines.forEach((l) => gsap.from(l.svg, {
    scaleX: 0, transformOrigin: '0 50%', duration: 2.4, ease: 'expo.out',
    scrollTrigger: { trigger: l.el, start: 'top 92%' },
  }));

  if (!finePointer) return;
  // Only rules on screen are tested against the pointer
  const onScreen = new Set<(typeof lines)[number]>();
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    const l = lines.find((x) => x.el === en.target)!;
    if (en.isIntersecting) onScreen.add(l); else onScreen.delete(l);
  }), { rootMargin: '60px 0px' });
  lines.forEach((l) => io.observe(l.el));

  const pluck = (l: (typeof lines)[number], x: number, dy: number) => {
    // Faster crossings pull further; even a slow one gives a small twang
    const pull = Math.sign(dy) * gsap.utils.clamp(10, 36, Math.abs(dy) * 1.4);
    gsap.killTweensOf(l.path);
    gsap.timeline()
      .to(l.path, { attr: { d: curve(l.w, x, mid + pull * 2) }, duration: 0.14, ease: 'power2.out' })
      .to(l.path, { attr: { d: curve(l.w, x) }, duration: 1.8, ease: 'elastic.out(1, 0.2)' });
  };
  let prevY = NaN;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const y = e.clientY;
    onScreen.forEach((l) => {
      const r = l.el.getBoundingClientRect();
      const lineY = r.top + r.height / 2;
      if (e.clientX < r.left || e.clientX > r.right || !((prevY - lineY) * (y - lineY) < 0)) return;
      pluck(l, e.clientX - r.left, y - prevY);
    });
    prevY = y;
  });
}

/* ---------------- FAQ accordion ---------------- */
// Row height eases open, the answer fades up into place, and the "+" turns into
// an "x" (CSS). Opening one question closes the others.
function setFaq(item: HTMLElement, open: boolean) {
  const panel = $('.faq__a', item);
  const text = $('p', panel);
  item.classList.toggle('is-open', open);
  $('.faq__q', item).setAttribute('aria-expanded', String(open));
  gsap.to(panel, {
    height: open ? 'auto' : 0, duration: reduced ? 0 : 0.8, ease: 'expo.inOut', overwrite: 'auto',
    onComplete: () => ScrollTrigger.refresh(),
  });
  if (reduced) return;
  if (open) gsap.fromTo(text, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.9, delay: 0.2, ease: 'expo.out', overwrite: 'auto' });
  else gsap.to(text, { autoAlpha: 0, y: 8, duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
}
$$('.faq__item').forEach((item) => {
  $('.faq__q', item).addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    $$('.faq__item.is-open').forEach((other) => other !== item && setFaq(other, false));
    setFaq(item, open);
  });
});

/* ---------------- Go ---------------- */
initDividers();
document.fonts?.ready.then(() => ScrollTrigger.refresh());
revealPage();
