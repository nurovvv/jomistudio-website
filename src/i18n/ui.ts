export const locales = ['en', 'ru', 'tg'] as const;
export type Locale = (typeof locales)[number];

// First-time visitors get Russian at the bare domain; other languages live under /en/ and /tg/.
export const defaultLocale: Locale = 'ru';
export const localePath = (l: Locale) => (l === defaultLocale ? '/' : `/${l}/`);

// Button labels for the language switcher. `tg` is the ISO code for Tajik and stays in
// URLs and hreflang; visitors know it by the country code, TJ.
export const localeLabels: Record<Locale, string> = { en: 'EN', ru: 'RU', tg: 'TJ' };

const en = {
  title: 'Jomi Studio — digital design & development studio in Dushanbe',
  meta: 'Jomi Studio — digital design & development studio in Dushanbe. Brands, websites and digital products.',
  nav: { services: 'Services', work: 'Work', about: 'About', faq: 'FAQ', contact: 'Contact' },
  menu: 'Menu',
  close: 'Close',
  hero: {
    title: ['Digital design &', 'development studio'],
    sub: 'We create brands, websites and digital products for companies that want to stand out.',
  },
  showreel: 'Showreel',
  view: 'View',
  intro: {
    label: 'What we do',
    text: 'Jomi Studio is a team of designers and developers from Dushanbe. We help startups and growing businesses build brands, websites and digital products that look great and work hard for the business.',
  },
  services: [
    { title: 'Branding & Identity', desc: 'Logos, visual systems, guidelines and naming. We build identities that are recognisable everywhere, from signage to social media.' },
    { title: 'Web Design & Development', desc: 'Company websites, landing pages and online stores. Designed around your goals and built to be fast, responsive and easy to update.' },
    { title: 'UI/UX Design', desc: 'Apps and digital products, from research and user flows to prototypes and polished interfaces.' },
    { title: 'Motion & Content', desc: 'Motion design, video and social media content that keeps your brand alive and moving.' },
    { title: 'Creative Development', desc: 'Interactive experiences, animation and 3D for the web, built with modern technology.' },
  ],
  explore: 'Discuss a project',
  clients: 'Brands that trust us',
  work: { title: 'Selected work', all: 'View all projects' },
  testimonials: { title: 'What our clients say' },
  why: {
    label: 'Why Jomi',
    text: 'We are a small, focused team, so every project gets senior attention from the first call to launch — and we stay with you after it.',
    cards: [
      { value: 10, suffix: ' days', label: 'Free support after launch' },
      { label: 'Strategy, design & development — one team, start to finish' },
      { value: 100, suffix: '%', label: 'Every site mobile-first, fast and SEO-ready' },
      { label: 'Built around your goal — more calls, orders and bookings, not just a pretty page' },
      { label: 'You talk directly to the designers and developers — no middlemen' },
    ],
  },
  faq: {
    title: 'FAQ',
    items: [
      { q: 'How long does a website take?', a: 'A landing page usually takes 2–4 weeks and a full company website 4–8 weeks. We agree on a clear timeline before we start.' },
      { q: 'How much does a project cost?', a: 'Every project is different. Tell us about your goals and we will send a proposal with a fixed price and timeline.' },
      { q: 'Do you work with clients outside Tajikistan?', a: 'Yes. We work remotely with clients worldwide, in English, Russian and Tajik.' },
      { q: 'What do you need from us to start?', a: 'A short brief: what your business does, your goals, examples you like and your deadline. We will take it from there.' },
    ],
  },
  footer: {
    cta: ['Have a project', 'in mind?'],
    sub: 'Tell us about your business and what you want to create. We will get back to you within one day.',
    button: 'Get in touch',
    office: 'Dushanbe, Tajikistan',
    rights: 'All rights reserved.',
  },
};

export type Dict = typeof en;

const ru: Dict = {
  title: 'Jomi Studio — студия цифрового дизайна и разработки в Душанбе',
  meta: 'Jomi Studio — студия цифрового дизайна и разработки в Душанбе. Бренды, сайты и цифровые продукты.',
  nav: { services: 'Услуги', work: 'Работы', about: 'О нас', faq: 'FAQ', contact: 'Контакты' },
  menu: 'Меню',
  close: 'Закрыть',
  hero: {
    title: ['Студия цифрового', 'дизайна и разработки'],
    sub: 'Мы создаём бренды, сайты и цифровые продукты для компаний, которые хотят выделяться.',
  },
  showreel: 'Шоурил',
  view: 'Смотреть',
  intro: {
    label: 'Что мы делаем',
    text: 'Jomi Studio — команда дизайнеров и разработчиков из Душанбе. Мы помогаем стартапам и растущему бизнесу создавать бренды, сайты и цифровые продукты, которые красиво выглядят и приносят результат.',
  },
  services: [
    { title: 'Брендинг и айдентика', desc: 'Логотипы, визуальные системы, гайдлайны и нейминг. Создаём айдентику, которую узнают везде — от вывески до соцсетей.' },
    { title: 'Веб-дизайн и разработка', desc: 'Корпоративные сайты, лендинги и интернет-магазины. Проектируем под ваши цели, делаем быстрыми, адаптивными и удобными в обновлении.' },
    { title: 'UI/UX дизайн', desc: 'Приложения и цифровые продукты: от исследований и пользовательских сценариев до прототипов и готовых интерфейсов.' },
    { title: 'Моушн и контент', desc: 'Моушн-дизайн, видео и контент для соцсетей, которые делают ваш бренд живым.' },
    { title: 'Креативная разработка', desc: 'Интерактивные проекты, анимация и 3D для веба на современных технологиях.' },
  ],
  explore: 'Обсудить проект',
  clients: 'Нам доверяют',
  work: { title: 'Избранные работы', all: 'Все проекты' },
  testimonials: { title: 'Отзывы клиентов' },
  why: {
    label: 'Почему Jomi',
    text: 'Мы небольшая сфокусированная команда, поэтому каждый проект от первого звонка до запуска ведут опытные специалисты — и мы остаёмся рядом после запуска.',
    cards: [
      { value: 10, suffix: ' дней', label: 'Бесплатной поддержки после запуска' },
      { label: 'Стратегия, дизайн и разработка — одна команда от начала до конца' },
      { value: 100, suffix: '%', label: 'Сайтов с мобильной версией, высокой скоростью и готовых к SEO' },
      { label: 'Проектируем под вашу цель — больше звонков, заказов и записей, а не просто красивую страницу' },
      { label: 'Вы общаетесь напрямую с дизайнерами и разработчиками — без посредников' },
    ],
  },
  faq: {
    title: 'Вопросы и ответы',
    items: [
      { q: 'Сколько времени занимает создание сайта?', a: 'Лендинг обычно занимает 2–4 недели, полноценный корпоративный сайт — 4–8 недель. Перед стартом мы согласуем точные сроки.' },
      { q: 'Сколько стоит проект?', a: 'Каждый проект индивидуален. Расскажите о своих целях, и мы пришлём предложение с фиксированной ценой и сроками.' },
      { q: 'Вы работаете с клиентами за пределами Таджикистана?', a: 'Да. Мы работаем удалённо с клиентами по всему миру на английском, русском и таджикском языках.' },
      { q: 'Что нужно от нас для старта?', a: 'Короткий бриф: чем занимается ваш бизнес, цели, примеры, которые вам нравятся, и сроки. Дальше — наша работа.' },
    ],
  },
  footer: {
    cta: ['Есть проект', 'на примете?'],
    sub: 'Расскажите о своём бизнесе и о том, что хотите создать. Мы ответим в течение одного дня.',
    button: 'Связаться',
    office: 'Душанбе, Таджикистан',
    rights: 'Все права защищены.',
  },
};

const tg: Dict = {
  title: 'Jomi Studio — студияи тарҳрезӣ ва барномасозии рақамӣ дар Душанбе',
  meta: 'Jomi Studio — студияи тарҳрезӣ ва барномасозии рақамӣ дар Душанбе. Брендҳо, сайтҳо ва маҳсулоти рақамӣ.',
  nav: { services: 'Хизматҳо', work: 'Корҳо', about: 'Дар бораи мо', faq: 'Саволҳо', contact: 'Тамос' },
  menu: 'Меню',
  close: 'Пӯшидан',
  hero: {
    title: ['Студияи тарҳрезӣ ва', 'барномасозии рақамӣ'],
    sub: 'Мо барои ширкатҳое, ки мехоҳанд фарқ кунанд, брендҳо, сайтҳо ва маҳсулоти рақамӣ месозем.',
  },
  showreel: 'Шоурил',
  view: 'Дидан',
  intro: {
    label: 'Мо чӣ кор мекунем',
    text: 'Jomi Studio — дастаи дизайнерҳо ва барномасозон аз Душанбе. Мо ба стартапҳо ва ширкатҳои рушдёбанда кӯмак мекунем, ки брендҳо, сайтҳо ва маҳсулоти рақамии зебо ва самаранок созанд.',
  },
  services: [
    { title: 'Брендинг ва айдентика', desc: 'Логотипҳо, системаҳои визуалӣ, дастурамалҳо ва номгузорӣ. Мо айдентикае месозем, ки дар ҳама ҷо — аз лавҳа то шабакаҳои иҷтимоӣ — шинохта мешавад.' },
    { title: 'Веб-дизайн ва барномасозӣ', desc: 'Сайтҳои ширкат, лендингҳо ва мағозаҳои онлайн. Мувофиқи ҳадафҳои шумо тарҳрезӣ мешаванд — тез, мутобиқ ва барои навсозӣ осон.' },
    { title: 'Дизайни UI/UX', desc: 'Барномаҳо ва маҳсулоти рақамӣ: аз тадқиқот ва сенарияҳои корбар то прототипҳо ва интерфейсҳои тайёр.' },
    { title: 'Моушн ва контент', desc: 'Моушн-дизайн, видео ва контент барои шабакаҳои иҷтимоӣ, ки бренди шуморо зинда нигоҳ медоранд.' },
    { title: 'Барномасозии эҷодӣ', desc: 'Лоиҳаҳои интерактивӣ, аниматсия ва 3D барои веб бо технологияҳои муосир.' },
  ],
  explore: 'Муҳокимаи лоиҳа',
  clients: 'Брендҳое, ки ба мо эътимод доранд',
  work: { title: 'Корҳои интихобшуда', all: 'Ҳамаи лоиҳаҳо' },
  testimonials: { title: 'Мизоҷон дар бораи мо' },
  why: {
    label: 'Чаро Jomi',
    text: 'Мо дастаи хурд ва мутамарказ ҳастем, бинобар ин ҳар лоиҳаро аз занги аввал то оғоз мутахассисони ботаҷриба пеш мебаранд — ва пас аз оғоз низ дар паҳлӯи шумо мемонем.',
    cards: [
      { value: 10, suffix: ' рӯз', label: 'Дастгирии ройгон пас аз оғоз' },
      { label: 'Стратегия, дизайн ва барномасозӣ — як даста аз аввал то охир' },
      { value: 100, suffix: '%', label: 'Сайтҳо бо версияи мобилӣ, суръати баланд ва омода барои SEO' },
      { label: 'Мувофиқи ҳадафи шумо месозем — зангҳо, фармоишҳо ва сабтҳои бештар, на танҳо саҳифаи зебо' },
      { label: 'Шумо бевосита бо дизайнерҳо ва барномасозон гап мезанед — бе миёнарав' },
    ],
  },
  faq: {
    title: 'Саволҳои маъмул',
    items: [
      { q: 'Сохтани сайт чӣ қадар вақт мегирад?', a: 'Лендинг одатан 2–4 ҳафта, сайти пурраи ширкат 4–8 ҳафта вақт мегирад. Пеш аз оғоз мо мӯҳлати аниқро муайян мекунем.' },
      { q: 'Лоиҳа чанд пул меистад?', a: 'Ҳар лоиҳа гуногун аст. Дар бораи ҳадафҳоятон нақл кунед ва мо пешниҳодро бо нарх ва мӯҳлати аниқ мефиристем.' },
      { q: 'Оё шумо бо мизоҷони берун аз Тоҷикистон кор мекунед?', a: 'Бале. Мо бо мизоҷони тамоми ҷаҳон ба таври фосилавӣ бо забонҳои англисӣ, русӣ ва тоҷикӣ кор мекунем.' },
      { q: 'Барои оғоз аз мо чӣ лозим аст?', a: 'Брифи кӯтоҳ: фаъолияти ширкат, ҳадафҳо, намунаҳое, ки ба шумо писанданд ва мӯҳлат. Боқимондааш кори мост.' },
    ],
  },
  footer: {
    cta: ['Лоиҳае', 'дар назар доред?'],
    sub: 'Дар бораи кори худ ва он чи сохтан мехоҳед, нақл кунед. Мо дар давоми як рӯз ҷавоб медиҳем.',
    button: 'Тамос гиред',
    office: 'Душанбе, Тоҷикистон',
    rights: 'Ҳамаи ҳуқуқҳо ҳифз шудаанд.',
  },
};

export const ui: Record<Locale, Dict> = { en, ru, tg };
