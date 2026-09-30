import { BOOKING_URL, CONTACT_EMAIL, LEAD_ACCESS_KEY, LEAD_ENDPOINT } from './config';

export interface Lead {
  name: string;
  business: string;
  email: string;
  phone: string;
  trade: string;
  plan: string;
  message: string;
  consent: boolean;
  /** Honeypot: people never see this field, bots fill it in. */
  website: string;
}

export type SendResult = 'sent' | 'mailto';

export class LeadError extends Error {
  constructor(public reason: 'not-configured' | 'rejected' | 'network') {
    super(reason);
  }
}

/** Sends a demo request to the configured endpoint, or hands it to the visitor's mail app. */
export async function sendLead(lead: Lead): Promise<SendResult> {
  if (lead.website) return 'sent'; // a bot: pretend it worked, send nothing

  const { website: _ignored, ...fields } = lead;
  const subject = `Demo request: ${lead.business || lead.name}`;

  if (LEAD_ENDPOINT) {
    let res: Response;
    try {
      res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...fields,
          subject,
          source: window.location.href,
          submitted_at: new Date().toISOString(),
          ...(LEAD_ACCESS_KEY ? { access_key: LEAD_ACCESS_KEY } : {}),
        }),
      });
    } catch {
      throw new LeadError('network');
    }
    if (!res.ok) throw new LeadError('rejected');
    // Some services answer 200 with { success: false }
    const body = await res.json().catch(() => null);
    if (body && body.success === false) throw new LeadError('rejected');
    return 'sent';
  }

  if (CONTACT_EMAIL) {
    window.location.href = mailtoFor(lead);
    return 'mailto';
  }

  throw new LeadError('not-configured');
}

export function mailtoFor(lead: Pick<Lead, 'name' | 'business' | 'email' | 'phone' | 'trade' | 'plan' | 'message'>) {
  const body = [
    `Name: ${lead.name}`,
    `Business: ${lead.business}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Trade: ${lead.trade}`,
    `Plan: ${lead.plan}`,
    lead.message ? `\n${lead.message}` : '',
  ].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Demo request: ${lead.business || lead.name}`)}&body=${encodeURIComponent(body)}`;
}

/** The calendar link with the lead's name and email filled in (Calendly and Cal.com both read these). */
export function calendarFor(name: string, email: string) {
  if (!BOOKING_URL) return '';
  try {
    const url = new URL(BOOKING_URL);
    if (name) url.searchParams.set('name', name);
    if (email) url.searchParams.set('email', email);
    return url.toString();
  } catch {
    return BOOKING_URL;
  }
}

/** Lets any "Book a demo" button preselect the plan the visitor was looking at. */
export const PLAN_EVENT = 'rinxora:plan';
export const choosePlan = (plan: string) => window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: plan }));
