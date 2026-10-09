// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://jomistudio.tj',
  i18n: {
    locales: ['en', 'ru', 'tg'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
