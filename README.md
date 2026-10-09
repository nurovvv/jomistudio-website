# Jomi Studio website

Marketing site for [jomistudio.tj](https://jomistudio.tj). Built with Astro, GSAP and Lenis; English, Russian and Tajik.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Where things live

- `src/data/projects.ts`: projects, showreel, client logos, testimonials, contacts
- `src/i18n/ui.ts`: all page text in `en`, `ru`, `tg`
- `src/scripts/main.ts`: animations (loader, scroll reveals, cursor, drag, accordion)
- `src/styles/global.css`: styles
- `public/`: images, videos, brand files

## Deploy

Cloudflare Pages, connected to this repository:
build command `npm run build`, output directory `dist`, Node version from `.node-version`.
