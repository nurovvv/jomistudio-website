// Site content that changes often: projects, testimonials, clients, contacts.
// Images/videos go in public/projects/ (e.g. image: '/projects/my-project.jpg').

import type { Screen } from '../components/DeviceMock.astro';
import type { Lift } from '../components/LiftScene.astro';
import type { Scan } from '../components/ScanScene.astro';

type T = { en: string; ru: string; tg: string };

export type Project = {
  slug: string;
  title: string;
  caption: T;
  /** Live site; the card opens it in a new tab */
  url?: string;
  image?: string;
  video?: string;
  /**
   * Live laptop + phone mockup instead of a still image (see DeviceMock.astro):
   * each screen scrolls through a tall screenshot of the site on hover.
   */
  mockup?: { laptop: Screen; phone: Screen };
  /**
   * Tilted tablet whose screen cards lift off into the air on hover (see LiftScene.astro).
   * `aspect` is the screen image's width / height; `balls` adds billiard balls.
   */
  lift?: { screen: string; aspect: number; cards: Lift[]; balls?: boolean };
  /** QR table stand beside a phone showing the menu it opens (see ScanScene.astro) */
  scan?: Scan;
  /** Brand name drawn huge and faint across the top of the card: an alpha-mask image and its width / height */
  ghost?: { src: string; aspect: number };
  /** Card background (and placeholder colour until a real image is added) */
  color: string;
};

export const projects: Project[] = [
  {
    slug: 'kimchi',
    title: 'KIMCHI',
    caption: {
      en: 'Online menu and ordering website for KIMCHI, a Korean street-food spot in Dushanbe',
      ru: 'Онлайн-меню и сайт для заказов корейского стритфуда KIMCHI в Душанбе',
      tg: 'Менюи онлайн ва сайти фармоиш барои KIMCHI — ғизои кӯчагии кореягӣ дар Душанбе',
    },
    url: 'https://kimchi-menu-dushanbe.netlify.app/',
    image: '/projects/kimchi/cover.webp',
    // The "KIMCHI" lettering from their own logo.svg
    ghost: { src: '/projects/kimchi/wordmark.svg', aspect: 3.33 },
    mockup: {
      laptop: {
        page: '/projects/kimchi/desktop.webp',
        pageHeight: 4200,
        viewHeight: 900,
        top: '/projects/kimchi/desktop-top.png',
        start: 0,
        travel: 1800,
      },
      phone: {
        page: '/projects/kimchi/mobile.webp',
        pageHeight: 5200,
        viewHeight: 844,
        top: '/projects/kimchi/mobile-top.png',
        bottom: '/projects/kimchi/mobile-bottom.png',
        start: 700,
        travel: 1900,
      },
    },
    color: '#E5161E',
  },
  {
    slug: 'bilyard',
    title: 'Bilyard',
    caption: {
      en: 'Cash desk and table tracking for a billiard club: game timers, bills, payments and owner reports',
      ru: 'Касса и учёт столов для бильярдного клуба: таймеры игр, счета, оплата и отчёты для владельца',
      tg: 'Хазина ва ҳисоби мизҳо барои клуби билярд: вақти бозӣ, ҳисобҳо, пардохт ва ҳисоботҳо барои соҳиб',
    },
    // Internal tool, so no public link: the card leads to the contact form.
    // «БИЛЬЯРД» in the app's own font (bold system UI font, SF Pro on Apple devices)
    ghost: { src: '/projects/bilyard/wordmark.png', aspect: 5.3295 },
    // The tables board from the app (tablet, 2360x1640); three table cards lift off it
    lift: {
      screen: '/projects/bilyard/board.webp',
      aspect: 2360 / 1640,
      cards: [
        { src: '/projects/bilyard/table-4.webp', x: 0.0114, y: 0.5744, w: 0.3195, h: 0.4177, z: 3, up: 10 },
        { src: '/projects/bilyard/table-2.webp', x: 0.3403, y: 0.1439, w: 0.3195, h: 0.4177, z: 5, up: 15 },
        { src: '/projects/bilyard/table-3.webp', x: 0.6691, y: 0.1439, w: 0.3195, h: 0.4177, z: 8, up: 20 },
      ],
      balls: true,
    },
    color: '#1F7049',
  },
  {
    slug: 'odiliyon',
    title: 'Odiliyon',
    caption: {
      en: 'QR-code menu for Odiliyon, a teahouse in Vahdat: dishes, prices and photos in three languages',
      ru: 'Меню по QR-коду для чайханы «Одилиён» в Вахдате: блюда, цены и фото на трёх языках',
      tg: 'Менюи рақамӣ бо QR-рамз барои чойхонаи «Одилиён» дар Ваҳдат: таомҳо, нархҳо ва аксҳо бо се забон',
    },
    url: 'https://odiliyon.pages.dev/',
    ghost: { src: '/projects/odiliyon/wordmark.png', aspect: 3.4145 },
    // Captured from the live menu at 390x844 @3x. The stand's QR code opens the real menu.
    scan: {
      qr: '/projects/odiliyon/qr.svg',
      mark: '/projects/odiliyon/mark.svg',
      wordmark: { src: '/projects/odiliyon/wordmark.png', aspect: 3.4145 },
      tagline: { src: '/projects/odiliyon/tagline.png', aspect: 8.3962 },
      phone: {
        page: '/projects/odiliyon/mobile.webp',
        pageHeight: 3800,
        viewHeight: 844,
        top: '/projects/odiliyon/mobile-top.png',
        pin: { src: '/projects/odiliyon/mobile-pin.png', at: 628 },
        start: 0,
        travel: 2900,
      },
      dishes: ['/projects/odiliyon/dish-1.webp', '/projects/odiliyon/dish-2.webp', '/projects/odiliyon/dish-3.webp'],
    },
    color: '#1F3A8A',
  },
];

// Hero showreel (source project: videos/jomi-showreel, rendered at 4K and downscaled).
// Phones get the lighter 1080p files, larger screens the 1440p ones. Empty `mp4` shows the
// animated brand placeholder.
export const showreel = {
  small: { webm: '/showreel/jomi-showreel-1080.webm', mp4: '/showreel/jomi-showreel-1080.mp4' },
  webm: '/showreel/jomi-showreel-1440.webm',
  mp4: '/showreel/jomi-showreel-1440.mp4',
  poster: '/showreel/jomi-showreel-poster.jpg',
};

// Client logos (SVG/PNG in public/clients/). `url` makes the logo a link to the client's
// site (opens in a new tab). Entries without `logo` show the name as a text wordmark.
export const clients: { name: string; logo?: string; url?: string }[] = [
  { name: 'KIMCHI', logo: '/clients/kimchi.svg', url: 'https://kimchi-menu-dushanbe.netlify.app/' },
  { name: 'Bilyard', logo: '/clients/bilyard.svg' },
  { name: 'Odiliyon', logo: '/clients/odiliyon.svg', url: 'https://odiliyon.pages.dev/' },
];

export type Testimonial = { name: string; role: string; text: T; color: 'mint' | 'lavender' | 'cream' };

// Real client reviews only. The "What our clients say" section is hidden while this is empty.
// Example: { name: 'Name Surname', role: 'Owner, KIMCHI', text: { en: '…', ru: '…', tg: '…' }, color: 'mint' }
export const testimonials: Testimonial[] = [];

export const contact = {
  email: 'hello@jomistudio.tj',
  phone: '',
  instagram: 'https://instagram.com/jomistudio.tj',
  telegram: 'https://t.me/jomistudio',
};
