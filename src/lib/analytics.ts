// Thin wrapper over the gtag snippet in index.html. Safe when the tag is blocked.
type Params = Record<string, string | number | boolean>;

export function track(event: string, params: Params = {}) {
  try {
    (window as any).gtag?.('event', event, params);
  } catch {
    /* analytics must never break the product */
  }
}
