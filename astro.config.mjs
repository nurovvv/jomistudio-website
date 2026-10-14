// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jomistudio.tj',
  i18n: {
    locales: ['en', 'ru', 'tg'],
    defaultLocale: 'ru',
    routing: { prefixDefaultLocale: false, redirectToDefaultLocale: false },
  },
});
