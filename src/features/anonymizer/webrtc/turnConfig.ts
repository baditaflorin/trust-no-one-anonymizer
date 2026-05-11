/**
 * TURN credential fetcher.
 *
 * trust-no-one-anonymizer exchanges SDP manually (copy/paste) — there's no
 * online signaling. We DO add a TURN relay path so peers behind symmetric NAT
 * (mobile carriers, corporate firewalls) can complete a video call when
 * direct STUN-only connections fail.
 *
 * Default token endpoint: https://turn.0docker.com/credentials
 * Default relay:          turn:turn.0docker.com:3479
 *
 *  • https://github.com/baditaflorin/turn-token-server  (HMAC, 1h TTL)
 *  • https://github.com/baditaflorin/coturn-hetzner     (the relay)
 *
 * Override with VITE_TURN_TOKEN_URL at build time or
 * localStorage["trust-no-one:turnTokenUrl"] at runtime. Set empty to disable.
 */

const DEFAULT_TURN_TOKEN_URL = "https://turn.0docker.com/credentials";

export const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

type TurnCredentialResponse = {
  username: string;
  password: string;
  ttl: number;
  uris: string[];
};

function loadTurnTokenUrl(): string {
  if (typeof localStorage === "undefined") return DEFAULT_TURN_TOKEN_URL;
  const stored = localStorage.getItem("trust-no-one:turnTokenUrl");
  if (stored !== null) return stored;
  const env = (import.meta as ImportMeta).env?.VITE_TURN_TOKEN_URL as string | undefined;
  return env ?? DEFAULT_TURN_TOKEN_URL;
}

export async function fetchIceServers(): Promise<RTCIceServer[]> {
  const tokenUrl = loadTurnTokenUrl();
  if (!tokenUrl) return STUN_SERVERS;
  try {
    const res = await fetch(tokenUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cred = (await res.json()) as TurnCredentialResponse;
    if (!Array.isArray(cred.uris) || cred.uris.length === 0) {
      throw new Error("token server returned no TURN URIs");
    }
    return [
      ...STUN_SERVERS,
      ...cred.uris.map((u) => ({
        urls: u,
        username: cred.username,
        credential: cred.password,
      })),
    ];
  } catch (err) {
    console.warn("[turn] credential fetch failed, falling back to STUN-only:", err);
    return STUN_SERVERS;
  }
}
