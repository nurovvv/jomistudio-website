// Site content that changes often: projects, testimonials, clients, contacts.
// Images/videos go in public/projects/ (e.g. image: '/projects/my-project.jpg').

import type { Screen } from '../components/DeviceMock.astro';
import type { Lift } from '../components/LiftScene.astro';
import type { Scan } from '../components/ScanScene.astro';
import type { Fan } from '../components/FanScene.astro';
import type { Film } from '../components/FilmScene.astro';

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
  /** Fanned Android phones whose screens switch script on hover (see FanScene.astro) */
  fan?: Fan;
  /** Video recorded from the live site, played on hover (see FilmScene.astro) */
  film?: Film;
  /**
   * Brand name drawn huge and faint across the top of the card: an alpha-mask image, its
   * width / height, and optionally how wide to draw it in % of the card (default 90)
   */
  ghost?: { src: string; aspect: number; width?: number };
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
  {
    slug: 'zarbulmasal',
    title: 'Zarbulmasal',
    caption: {
      en: 'Zarbulmasal, our Android app of Tajik proverbs, school poems and history, offline in two scripts',
      ru: 'Зарбулмасал — наше Android-приложение: таджикские пословицы, школьные стихи и история, офлайн и в двух письменностях',
      tg: 'Зарбулмасал — барномаи Android-и мо: зарбулмасалҳо, шеърҳои мактабӣ ва таърих, бе интернет ва бо ду хат',
    },
    url: 'https://play.google.com/store/apps/details?id=com.marufi.zarbulmasal',
    // «Зарбулмасал» in the app's own EB Garamond, as on its store graphic
    ghost: { src: '/projects/zarbulmasal/wordmark.png', aspect: 5.3573 },
    // Store screenshots (Android, 1080x2160). Home and the proverb of the day switch to
    // their Persian-script versions; the motif is the ikat diamond from the app icon.
    fan: {
      motif: { src: '/projects/zarbulmasal/ikat.webp', aspect: 0.9302 },
      status: { bg: '#F2ECDE', ink: '#1D1A16' },
      phones: [
        { src: '/projects/zarbulmasal/home-tj.webp', alt: '/projects/zarbulmasal/home-fa.webp' },
        { src: '/projects/zarbulmasal/proverb-tj.webp', alt: '/projects/zarbulmasal/proverb-fa.webp' },
        { src: '/projects/zarbulmasal/poet-tj.webp' },
      ],
    },
    color: '#0B1327',
  },
  {
    slug: 'khoja-sokhtmon',
    title: 'Khoja Sokhtmon',
    caption: {
      en: '3D website for the developer Khoja Sokhtmon: turn the building, pick a floor and a flat, walk inside, switch day to night',
      ru: '3D-сайт для застройщика «Хоча сохтмон»: дом можно вращать, выбрать этаж и квартиру, пройтись внутри и сменить день на ночь',
      tg: 'Сайти 3D барои ширкати сохтмонии «Хоча сохтмон»: биноро гардонед, ошёна ва хонаро интихоб кунед, дарун гардиш кунед ва рӯзро ба шаб иваз кунед',
    },
    url: 'https://khoja-sokhtmon.pages.dev/',
    // «Хоча сохтмон» in the site's own bold system font, stacked so it stays in the sky
    ghost: { src: '/projects/khoja-sokhtmon/wordmark.png', aspect: 2.3986, width: 52 },
    // Recorded from the live 3D site with its UI hidden: the camera circles the building
    // while the site's own clock runs from 13:00 to 22:00, forward and back (13 s loop).
    // `clock` repeats how the film was rendered so the slider copy keeps time with it.
    film: {
      mp4: '/projects/khoja-sokhtmon/film.mp4',
      poster: '/projects/khoja-sokhtmon/poster.webp',
      clock: { half: 6.5, keys: [[0, 13], [0.3, 18.25], [0.78, 20.75], [1, 22]], range: [6, 23.5], dusk: 17.75, night: 20.5 },
    },
    color: '#2B2A29',
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
  { name: 'Khoja Sokhtmon', logo: '/clients/khoja-sokhtmon.svg', url: 'https://khoja-sokhtmon.pages.dev/' },
];

export type Testimonial = { name: string; role: string; text: T; color: 'mint' | 'lavender' | 'cream' };

// Real client reviews only. The "What our clients say" section is hidden while this is empty.
// Example: { name: 'Name Surname', role: 'Owner, KIMCHI', text: { en: '…', ru: '…', tg: '…' }, color: 'mint' }
export const testimonials: Testimonial[] = [];

export const contact = {
  email: 'hello@jomistudio.tj',
  phone: '+992 00 001 02 72',
  instagram: 'https://instagram.com/jomistudio.tj',
  telegram: 'https://t.me/jomistudio',
};
