// Meta Pixel + Conversions API tracking utility.
//
// Fires both the client-side Pixel event AND a server-side Conversions API
// event via Stape's CAPI Gateway. They share an `event_id` for Meta-side
// deduplication so the same user action isn't double-counted.

export const META_PIXEL_ID = '754145170241342';
const STAPE_CAPI_ENDPOINT = `https://capig.stape.vip/${META_PIXEL_ID}/events`;

export type Audience = 'agency' | 'creator';
export type Surface = 'home' | 'agency-page' | 'creator-page' | 'nav' | 'mobile-drawer' | 'pricing' | 'agency-band';

export type MetaCustomParams = {
  audience?: Audience;
  surface?: Surface;
  content_name?: string;
  value?: number;
  currency?: string;
  [key: string]: unknown;
};

// "Lead" is a Meta standard event; anything else here is treated as a custom event.
const STANDARD_EVENTS = new Set([
  'PageView', 'ViewContent', 'Search', 'AddToCart', 'AddToWishlist',
  'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Lead', 'CompleteRegistration',
  'Contact', 'CustomizeProduct', 'Donate', 'FindLocation', 'Schedule',
  'StartTrial', 'SubmitApplication', 'Subscribe',
]);

/**
 * SHA-256 hash an email per Meta's CAPI spec (lowercased + trimmed first).
 * Returns hex string. Browser-only — uses Web Crypto.
 */
export async function hashEmail(email: string): Promise<string | undefined> {
  if (typeof window === 'undefined' || !email) return undefined;
  const normalized = email.trim().toLowerCase();
  const buf = new TextEncoder().encode(normalized);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Read a cookie value by name (used for _fbp / _fbc).
function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : undefined;
}

type ServerUserData = {
  em?: string[]; // hashed email
  fbp?: string;
  fbc?: string;
};

/**
 * Fire a Meta Pixel event (client-side) and a matching Conversions API event
 * (server-side via Stape) with a shared event_id for deduplication.
 *
 * @param eventName - Meta standard event name OR a custom event name
 * @param params    - Custom data passed to both Pixel and CAPI
 * @param userData  - Optional user identifiers (email is hashed before send)
 */
export function trackMetaEvent(
  eventName: string,
  params: MetaCustomParams = {},
  userData: { email?: string } = {},
): void {
  if (typeof window === 'undefined') return;

  const eventId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Client-side via Pixel
  if (window.fbq) {
    const fbqMethod = STANDARD_EVENTS.has(eventName) ? 'track' : 'trackCustom';
    window.fbq(fbqMethod, eventName, params, { eventID: eventId });
  }

  // Server-side via Stape Conversions API (fire-and-forget)
  void sendServerEvent(eventName, params, eventId, userData);
}

async function sendServerEvent(
  eventName: string,
  params: MetaCustomParams,
  eventId: string,
  userData: { email?: string },
): Promise<void> {
  try {
    const server_user_data: ServerUserData = {};

    const fbp = readCookie('_fbp');
    const fbc = readCookie('_fbc');
    if (fbp) server_user_data.fbp = fbp;
    if (fbc) server_user_data.fbc = fbc;

    if (userData.email) {
      const hashed = await hashEmail(userData.email);
      if (hashed) server_user_data.em = [hashed];
    }

    const body = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url: window.location.href,
          action_source: 'website',
          user_data: server_user_data,
          custom_data: params,
        },
      ],
    };

    await fetch(STAPE_CAPI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true, // survives page navigation (e.g. clicking external links)
    });
  } catch {
    // CAPI is best-effort; never throw to the caller
  }
}
