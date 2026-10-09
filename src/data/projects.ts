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

// Showreel shown in the hero. Leave empty to show the animated brand placeholder.
export const showreel = { video: '' };

// Client logos (SVG/PNG in public/clients/). Empty `logo` shows a placeholder;
// `url` makes the logo a link to the client's site (opens in a new tab).
export const clients: { name: string; logo?: string; url?: string }[] = [
  { name: 'KIMCHI', logo: '/clients/kimchi.svg', url: 'https://kimchi-menu-dushanbe.netlify.app/' },
  ...Array.from({ length: 11 }, (_, i) => ({ name: `Client ${String(i + 2).padStart(2, '0')}` })),
];

export type Testimonial = { name: string; role: string; text: T; color: 'mint' | 'lavender' | 'cream' };

const reviewSoon: T = {
  en: 'A client review will appear here. Send us your clients’ feedback and we will add it to this section.',
  ru: 'Здесь появится отзыв клиента. Пришлите нам отзывы клиентов, и мы добавим их в этот раздел.',
  tg: 'Дар ин ҷо фикри мизоҷ хоҳад буд. Фикрҳои мизоҷонро фиристед ва мо онҳоро илова мекунем.',
};

export const testimonials: Testimonial[] = [
  { name: 'Client name', role: 'Company', text: reviewSoon, color: 'mint' },
  { name: 'Client name', role: 'Company', text: reviewSoon, color: 'lavender' },
  { name: 'Client name', role: 'Company', text: reviewSoon, color: 'cream' },
  { name: 'Client name', role: 'Company', text: reviewSoon, color: 'lavender' },
  { name: 'Client name', role: 'Company', text: reviewSoon, color: 'mint' },
];

export const contact = {
  email: 'hello@jomistudio.tj',
  phone: '',
  instagram: 'https://instagram.com/jomistudio.tj',
  telegram: '',
};
