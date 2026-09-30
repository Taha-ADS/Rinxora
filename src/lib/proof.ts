// Real customer proof. The section stays hidden until at least one entry exists.
// Only add quotes you have permission to publish, attributed to a real person and business.
export interface Testimonial {
  quote: string;
  name: string;
  role: string; // e.g. "Owner, Northside Heating & Air"
  metric?: string; // an outcome they reported, e.g. "31 after-hours jobs booked in May"
}

export const TESTIMONIALS: Testimonial[] = [];
