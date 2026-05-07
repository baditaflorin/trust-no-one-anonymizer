import { describe, expect, it } from 'vitest';
import { decodeSignal, encodeSignal } from './manualWebRtc';

describe('manual WebRTC signaling helpers', () => {
  it('round-trips JSON signal descriptions', () => {
    const encoded = encodeSignal({ type: 'offer', sdp: 'v=0\r\n' });
    expect(decodeSignal(encoded)).toEqual({ type: 'offer', sdp: 'v=0\r\n' });
  });

  it('rejects malformed signaling text', () => {
    expect(() => decodeSignal('not-json')).toThrow(/Signal text must be JSON/);
  });
});
