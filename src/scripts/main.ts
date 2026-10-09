import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, Draggable);

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
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from(words, { yPercent: 110, duration: 1.3, stagger: 0.045 })
    .from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 1.2 }, 0.35)
    .from('.hero__media-wrap', { y: 120, autoAlpha: 0, duration: 1.6 }, 0.45)
    .from('.header', { yPercent: -100, duration: 1.2 }, 0.3);
}
// Showreel block grows as it scrolls toward the top
gsap.fromTo('.hero__media', { scale: 0.92 }, {
  scale: 1, ease: 'none',
  scrollTrigger: { trigger: '.hero__media', start: 'top 90%', end: 'top 10%', scrub: true },
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

/* ---------------- Header: hide on scroll down, show on scroll up ---------------- */
const header = $('.header');
let headerHidden = false;
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    header.classList.toggle('is-scrolled', y > 20);
    const hide = self.direction === 1 && y > 300 && !root.classList.contains('is-menu-open');
    if (hide === headerHidden) return;
    headerHidden = hide;
    gsap.to(header, { yPercent: hide ? -100 : 0, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
  },
});

/* ---------------- Mobile menu ---------------- */
const burger = $<HTMLButtonElement>('.burger');
function closeMenu() {
  if (!root.classList.contains('is-menu-open')) return;
  root.classList.remove('is-menu-open');
  burger.setAttribute('aria-expanded', 'false');
  lenis?.start();
}
burger.addEventListener('click', () => {
  const open = root.classList.toggle('is-menu-open');
  burger.setAttribute('aria-expanded', String(open));
  if (open) {
    lenis?.stop();
    gsap.fromTo('.menu__nav a span', { yPercent: 110 }, { yPercent: 0, stagger: 0.06, duration: 1, delay: 0.2, ease: 'expo.out' });
    gsap.fromTo('.menu__foot', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.45, ease: 'expo.out' });
  } else lenis?.start();
});
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
    const link = target.closest('a, button, .review');
    cursor.classList.toggle('is-view', !!view);
    cursor.classList.toggle('is-link', !view && !!link);
    if (view) label.textContent = view.dataset.cursor!;
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

/* ---------------- Scroll animations ---------------- */
let refreshTimer = 0;
const refreshSoon = (ms = 950) => { clearTimeout(refreshTimer); refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), ms); };

if (reduced) {
  $$('.srv').forEach((s) => s.classList.add('is-open'));
} else {
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

  // Staggered groups (client logos, stat cards)
  gsap.set('[data-stagger]', { y: 50, autoAlpha: 0 });
  ScrollTrigger.batch('[data-stagger]', {
    start: 'top 92%',
    onEnter: (els) => gsap.to(els, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.07, ease: 'expo.out' }),
  });

  // Service cards expand into dark cards as they reach the viewport
  $$('.srv').forEach((card) =>
    ScrollTrigger.create({
      trigger: card, start: 'top 78%', once: true,
      onEnter: () => { card.classList.add('is-open'); refreshSoon(); },
    }),
  );

  // Work cards rise in; right column drifts for a parallax offset
  $$('.card').forEach((card) =>
    gsap.from(card, { y: 120, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 95%' } }),
  );
  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px)', () => {
    gsap.to('.work__col[data-speed="1"]', {
      y: -160, ease: 'none',
      scrollTrigger: { trigger: '.work__cols', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Testimonials: cards fly in, then can be dragged around (desktop)
  mm.add('(min-width: 901px)', () => {
    const cards = $$('.review');
    gsap.from(cards, {
      y: 500, rotation: () => gsap.utils.random(-25, 25), autoAlpha: 0, duration: 1.6, stagger: 0.12, ease: 'expo.out',
      scrollTrigger: { trigger: '.reviews__board', start: 'top 80%' },
    });
    let z = 10;
    const drags = Draggable.create(cards, {
      bounds: '.reviews',
      onPress() { gsap.set(this.target, { zIndex: ++z }); gsap.to(this.target, { scale: 1.04, duration: 0.3 }); },
      onRelease() { gsap.to(this.target, { scale: 1, duration: 0.5, ease: 'elastic.out(1, .5)' }); },
    });
    return () => drags.forEach((d) => d.kill());
  });

  // Count-up numbers
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(obj.v))),
      scrollTrigger: { trigger: el, start: 'top 90%' },
    });
  });

  // Footer: content rises from underneath, rings breathe
  gsap.from('.footer__cta', {
    yPercent: 25, ease: 'none',
    scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'top 20%', scrub: true },
  });
  gsap.to('.footer__rings span', { scale: 1.06, duration: 2.6, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.25, from: 'start' } });
}

/* ---------------- FAQ accordion ---------------- */
$$('.faq__item').forEach((item) => {
  const btn = $<HTMLButtonElement>('.faq__q', item);
  const panel = $('.faq__a', item);
  btn.addEventListener('click', () => {
    const open = !item.classList.contains('is-open');
    $$('.faq__item.is-open').forEach((other) => {
      if (other === item) return;
      other.classList.remove('is-open');
      $('.faq__q', other).setAttribute('aria-expanded', 'false');
      gsap.to($('.faq__a', other), { height: 0, duration: 0.6, ease: 'power3.inOut' });
    });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    gsap.to(panel, { height: open ? 'auto' : 0, duration: 0.7, ease: 'power3.inOut', onComplete: () => ScrollTrigger.refresh() });
  });
});

/* ---------------- Go ---------------- */
document.fonts?.ready.then(() => ScrollTrigger.refresh());
revealPage();
