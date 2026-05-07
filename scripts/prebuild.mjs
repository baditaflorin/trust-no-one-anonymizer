import { rm } from 'node:fs/promises';

await rm(new URL('../docs/assets/', import.meta.url), { force: true, recursive: true });
