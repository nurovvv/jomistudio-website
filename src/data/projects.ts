// Site content that changes often: projects, testimonials, clients, contacts.
// Images/videos go in public/projects/ (e.g. image: '/projects/my-project.jpg').

import type { Screen } from '../components/DeviceMock.astro';

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
  { name: 'Bilyard' },
];

export type Testimonial = { name: string; role: string; text: T; color: 'mint' | 'lavender' | 'cream' };

// Real client reviews only. The "What our clients say" section is hidden while this is empty.
// Example: { name: 'Name Surname', role: 'Owner, KIMCHI', text: { en: '…', ru: '…', tg: '…' }, color: 'mint' }
export const testimonials: Testimonial[] = [];

export const contact = {
  email: 'hello@jomistudio.tj',
  phone: '',
  instagram: 'https://instagram.com/jomistudio.tj',
  telegram: '',
};
