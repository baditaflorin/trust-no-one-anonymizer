import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultSettings, loadSettings, settingsSchema } from './settings';

describe('settingsSchema', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts the default settings', () => {
    expect(settingsSchema.safeParse(defaultSettings).success).toBe(true);
  });

  it('rejects out-of-range timbre settings', () => {
    const parsed = settingsSchema.safeParse({ ...defaultSettings, timbreShift: 200 });
    expect(parsed.success).toBe(false);
  });

  it('falls back when local storage contains malformed JSON', () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => '{bad-json'),
      setItem: vi.fn(),
    });

    expect(loadSettings()).toEqual(defaultSettings);
  });
});
