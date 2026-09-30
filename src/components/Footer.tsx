import React from 'react';
import { CONTACT_EMAIL, LEGAL } from '../lib/config';

// Absolute so they also work from the legal pages
const LINKS = [
  { href: '/#studio', label: 'Try it live' },
  { href: '/#how', label: 'How it works' },
  { href: '/#capabilities', label: 'Capabilities' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#book', label: 'Book a demo' },
];

const LEGAL_LINKS = [
  { href: '/privacy.html', label: 'Privacy' },
  { href: '/terms.html', label: 'Terms' },
];

const link = 'inline-flex items-center min-h-11 transition-colors duration-500 ease-lux hover:text-white';

export const Footer: React.FC = () => (
  <footer className="relative border-t border-white/[0.08] py-14 bg-black">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <a href="/" className="inline-flex items-center gap-2.5 min-h-11" translate="no" aria-label="Rinxora home">
            <span className="orb-mini w-6 h-6 rounded-full ring-1 ring-white/30" aria-hidden="true" />
            <span className="font-semibold tracking-[0.22em] text-[13px] text-white">RINXORA</span>
          </a>
          <p className="mt-3 text-sm text-titanium-300 max-w-xs">The AI receptionist that answers your calls and books the job.</p>
          {CONTACT_EMAIL && (
            <a href={`mailto:${CONTACT_EMAIL}`} className={`${link} mt-2 text-sm text-titanium-200`}>
              {CONTACT_EMAIL}
            </a>
          )}
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 text-sm text-titanium-300">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-10 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-titanium-400">
        <span>
          © {new Date().getFullYear()} {LEGAL.company}. All rights reserved.
        </span>
        <nav aria-label="Legal" className="flex gap-6">
          {LEGAL_LINKS.map((l) => (
            <a key={l.href} href={l.href} className={link}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  </footer>
);
