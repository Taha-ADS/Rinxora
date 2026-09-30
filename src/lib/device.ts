/**
 * Safari (and so every browser on iPhone) re-rasterises an element each time its
 * filter changes and paints blend modes off-screen, which stalls heavy motion.
 * LITE devices get the same design with those costs removed. Also low-core devices.
 */
export const LITE = (() => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg|OPR|Android/.test(ua);
  return iOS || safari || (navigator.hardwareConcurrency ?? 8) <= 4;
})();

if (LITE && typeof document !== 'undefined') document.documentElement.classList.add('lite');
