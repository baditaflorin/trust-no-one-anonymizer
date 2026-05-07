import { clamp } from '../../../shared/clamp';

export interface AvatarStyle {
  skin: string;
  hair: string;
  accent: string;
  iris: string;
  shirt: string;
  faceWidth: number;
  faceHeight: number;
  hairline: number;
}

function hash(seed: string): number {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function random(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) % 10_000) / 10_000;
  };
}

function pick<T>(items: readonly T[], next: () => number): T {
  return items[Math.floor(next() * items.length)] ?? items[0];
}

export function createAvatarStyle(seedText: string): AvatarStyle {
  const next = random(hash(seedText));
  return {
    skin: pick(['#f0c8a8', '#c98f69', '#8f5f46', '#d9ad82', '#6f4b3e'], next),
    hair: pick(['#16232e', '#27394a', '#5b3b28', '#7a5545', '#d9d0bf'], next),
    accent: pick(['#3dd6b4', '#f5b84b', '#7dc5ff', '#ff8f7a', '#b7e36a'], next),
    iris: pick(['#162f4a', '#2e5f51', '#6e513f', '#243441'], next),
    shirt: pick(['#24525f', '#392f5a', '#5a3c2f', '#2f5a44', '#26394f'], next),
    faceWidth: 0.86 + next() * 0.18,
    faceHeight: 0.92 + next() * 0.14,
    hairline: clamp(0.2 + next() * 0.16, 0.18, 0.38),
  };
}
