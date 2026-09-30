import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveStudio } from './components/LiveStudio';
import { HowItWorks } from './components/HowItWorks';
import { Capabilities } from './components/Capabilities';
import { EdgeCaseLab } from './components/EdgeCaseLab';
import { VoiceCustomization } from './components/VoiceCustomization';
import { RoiCalculator } from './components/RoiCalculator';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Proof } from './components/Proof';
import { BookDemo } from './components/BookDemo';
import { Footer } from './components/Footer';

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

export function App() {
  return (
    <div className="min-h-screen bg-black text-titanium-100 flex flex-col font-sans selection:bg-violet-400/30 selection:text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-white focus:text-titanium-950 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <Navbar onScrollToDemo={() => scrollTo('studio')} />

      <main id="main" className="flex-1">
        <Hero onTalk={() => scrollTo('studio')} onBook={() => scrollTo('book')} />
        <LiveStudio onExploreEdgeCases={() => scrollTo('playbooks')} />
        <HowItWorks />
        <Proof />
        <Capabilities />
        <EdgeCaseLab />
        <VoiceCustomization />
        <RoiCalculator />
        <Pricing />
        <FAQ />
        <BookDemo onTryLive={() => scrollTo('studio')} />
      </main>

      <Footer />
    </div>
  );
}

export default App;
