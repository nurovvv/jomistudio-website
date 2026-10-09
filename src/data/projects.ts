// Site content that changes often: projects, testimonials, clients, contacts.
// Images/videos go in public/projects/ (e.g. image: '/projects/my-project.jpg').

type T = { en: string; ru: string; tg: string };

export type Project = {
  slug: string;
  title: string;
  caption: T;
  image?: string;
  video?: string;
  /** Placeholder background until a real image is added */
  color: string;
};

const soon: T = {
  en: 'Project description coming soon',
  ru: 'Описание проекта скоро появится',
  tg: 'Тавсифи лоиҳа ба наздикӣ',
};

export const projects: Project[] = [
  { slug: 'project-01', title: 'Project 01', caption: soon, color: '#4FC59A' },
  { slug: 'project-02', title: 'Project 02', caption: soon, color: '#8C7CF0' },
  { slug: 'project-03', title: 'Project 03', caption: soon, color: '#F6F1E9' },
  { slug: 'project-04', title: 'Project 04', caption: soon, color: '#2C2A33' },
  { slug: 'project-05', title: 'Project 05', caption: soon, color: '#F2B84B' },
  { slug: 'project-06', title: 'Project 06', caption: soon, color: '#E7E2F7' },
];

// Showreel shown in the hero. Leave empty to show the animated brand placeholder.
export const showreel = { video: '' };

// Client logos (SVG/PNG in public/clients/). Empty `logo` shows a placeholder.
export const clients: { name: string; logo?: string }[] = Array.from({ length: 12 }, (_, i) => ({
  name: `Client ${String(i + 1).padStart(2, '0')}`,
}));

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
