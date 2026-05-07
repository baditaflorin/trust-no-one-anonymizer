import { z } from 'zod';

const storageKey = 'trust-no-one-anonymizer-settings-v1';

export const settingsSchema = z.object({
  avatarSeed: z.string().min(1).max(48),
  timbreShift: z.number().min(-100).max(100),
  rnnoiseEnabled: z.boolean(),
  enhancementEnabled: z.boolean(),
  usePublicStun: z.boolean(),
  privacyNoticeAccepted: z.boolean(),
});

export type AppSettings = z.infer<typeof settingsSchema>;

export const defaultSettings: AppSettings = {
  avatarSeed: 'witness-001',
  timbreShift: 28,
  rnnoiseEnabled: true,
  enhancementEnabled: false,
  usePublicStun: false,
  privacyNoticeAccepted: false,
};

export function loadSettings(): AppSettings {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return defaultSettings;

  try {
    const parsed = settingsSchema.safeParse(JSON.parse(stored) as unknown);
    return parsed.success ? parsed.data : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(storageKey, JSON.stringify(settingsSchema.parse(settings)));
}
