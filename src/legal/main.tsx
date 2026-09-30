import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArrowLeft } from 'lucide-react';
import { PRIVACY, TERMS, LegalDoc } from './content';
import { LEGAL } from '../lib/config';
import { Footer } from '../components/Footer';
import '../index.css';

const root = document.getElementById('root')!;
const doc: LegalDoc = root.dataset.page === 'terms' ? TERMS : PRIVACY;

const LegalPage: React.FC<{ doc: LegalDoc }> = ({ doc }) => (
  <div className="min-h-[100dvh] flex flex-col bg-black">
    <header className="px-4 sm:px-6 lg:px-8 pt-6">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5" aria-label="Rinxora home" translate="no">
          <span className="orb-mini w-6 h-6 rounded-full ring-1 ring-white/30" />
          <span className="font-semibold tracking-[0.22em] text-[13px] text-white">RINXORA</span>
        </a>
        <a href="/" className="inline-flex items-center gap-2 h-11 text-sm text-titanium-300 hover:text-white transition-colors duration-500 ease-lux">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to site
        </a>
      </div>
    </header>

    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <article className="legal max-w-3xl mx-auto">
        <h1 className="text-[2.6rem] sm:text-6xl font-semibold tracking-[-0.045em] leading-[1]">
          <span className="chrome-text pb-[0.08em] inline-block">{doc.title}</span>
        </h1>
        <p className="mt-4 text-sm text-titanium-400">Effective {LEGAL.effective}</p>
        <p className="mt-8 text-lg text-titanium-200 leading-relaxed">{doc.intro}</p>

        <nav aria-label="On this page" className="mt-10 rounded-2xl ring-1 ring-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-titanium-400">On this page</p>
          <ol className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {doc.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-block py-1 text-titanium-200 hover:text-white transition-colors duration-300 ease-lux">
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s) => (
          <section key={s.id} id={s.id} className="mt-14 scroll-mt-8">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-white">{s.h}</h2>
            <div className="mt-4">{s.body}</div>
          </section>
        ))}
      </article>
    </main>

    <Footer />
  </div>
);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LegalPage doc={doc} />
  </React.StrictMode>,
);
