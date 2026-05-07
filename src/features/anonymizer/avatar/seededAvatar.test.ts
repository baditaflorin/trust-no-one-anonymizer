import { describe, expect, it } from 'vitest';
import { createAvatarStyle } from './seededAvatar';

describe('createAvatarStyle', () => {
  it('is deterministic for a seed', () => {
    expect(createAvatarStyle('witness')).toEqual(createAvatarStyle('witness'));
  });

  it('varies visual style across seeds', () => {
    expect(createAvatarStyle('witness-a')).not.toEqual(createAvatarStyle('witness-b'));
  });
});
