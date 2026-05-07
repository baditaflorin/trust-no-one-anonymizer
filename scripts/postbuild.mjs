import { copyFile, mkdir, writeFile } from 'node:fs/promises';

const docsDir = new URL('../docs/', import.meta.url);

await mkdir(docsDir, { recursive: true });
await copyFile(
  new URL('../docs/index.html', import.meta.url),
  new URL('../docs/404.html', import.meta.url),
);
await writeFile(new URL('../docs/.nojekyll', import.meta.url), '');
await writeFile(
  new URL('../docs/manifest.webmanifest', import.meta.url),
  `${JSON.stringify(
    {
      name: 'Trust No One Anonymizer',
      short_name: 'Anonymizer',
      description: 'Client-side face and voice anonymization for browser video calls.',
      start_url: '/trust-no-one-anonymizer/',
      scope: '/trust-no-one-anonymizer/',
      display: 'standalone',
      background_color: '#101820',
      theme_color: '#101820',
      icons: [
        {
          src: '/trust-no-one-anonymizer/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable',
        },
      ],
    },
    null,
    2,
  )}\n`,
);
await writeFile(
  new URL('../docs/icon.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="24" fill="#101820"/><path d="M28 68c0-25 15-42 36-42s36 17 36 42-16 38-36 38-36-14-36-38Z" fill="#f2d5b5"/><path d="M41 59c9-9 37-11 49 0 4-21-6-37-26-37S35 38 41 59Z" fill="#25495f"/><path d="M45 73c6 6 32 6 38 0" fill="none" stroke="#101820" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="63" r="5" fill="#101820"/><circle cx="78" cy="63" r="5" fill="#101820"/></svg>\n`,
);
