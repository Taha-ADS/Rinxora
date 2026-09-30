// Lets any CTA start the live call in the console. Dispatched synchronously so the
// console's handler still runs inside the visitor's tap, which iOS requires for audio and the mic.
export const CALL_EVENT = 'rinxora:call';
export const startCall = () => window.dispatchEvent(new Event(CALL_EVENT));
