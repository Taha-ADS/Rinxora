import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VoiceTerminal } from './components/VoiceTerminal';
import { EdgeCaseLab } from './components/EdgeCaseLab';
import { VoiceCustomization } from './components/VoiceCustomization';
import { RoiCalculator } from './components/RoiCalculator';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { getStoredRetellConfig, DEFAULT_AGENT_ID } from './lib/retell';
import confetti from 'canvas-confetti';

export function App() {
  const [retellConfig, setRetellConfig] = useState(() => getStoredRetellConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPlanSuccess, setSelectedPlanSuccess] = useState<string | null>(null);

  const handleScrollToDemo = () => {
    const el = document.getElementById('live-demo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToEdgeCases = () => {
    const el = document.getElementById('hvac-triage');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveConfig = (newKey: string, newAgentId: string) => {
    setRetellConfig({
      publicKey: newKey,
      agentId: newAgentId || DEFAULT_AGENT_ID,
    });
  };

  const handleSelectPlan = (planName: string) => {
    setSelectedPlanSuccess(planName);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#38BDF8'],
    });
  };

  return (
    <div className="min-h-screen bg-titanium-950 text-titanium-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onScrollToDemo={handleScrollToDemo}
        hasCustomKey={Boolean(retellConfig.publicKey)}
      />

      {/* Main Streamlined Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onStartDemo={handleScrollToDemo}
          onExploreEdgeCases={handleScrollToEdgeCases}
        />

        {/* 2. Live HVAC Voice Terminal (Retell SDK + Simulation) */}
        <VoiceTerminal
          publicKey={retellConfig.publicKey}
          agentId={retellConfig.agentId || DEFAULT_AGENT_ID}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* 3. Real-World HVAC Emergency Triage Showcase */}
        <EdgeCaseLab />

        {/* 4. Voice Customization, Retell AI Superpowers & Sales FAQs */}
        <VoiceCustomization />

        {/* 5. HVAC Revenue Loss & Recovery Calculator */}
        <RoiCalculator />

        {/* 6. Business-Outcome HVAC Pricing Tiers */}
        <Pricing onSelectPlan={handleSelectPlan} />
      </main>

      {/* Clean Footer */}
      <Footer />

      {/* Retell SDK Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        publicKey={retellConfig.publicKey}
        agentId={retellConfig.agentId || DEFAULT_AGENT_ID}
        onSave={handleSaveConfig}
      />

      {/* Trial Notification Toast */}
      {selectedPlanSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl glass-panel-elevated border border-amber-400/40 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <div>
            <div className="text-sm font-semibold text-amber-400">
              Tier Selected
            </div>
            <div className="text-sm text-white">
              Selected <strong>{selectedPlanSuccess}</strong> — 14-day zero-risk trial active.
            </div>
          </div>
          <button
            onClick={() => setSelectedPlanSuccess(null)}
            className="ml-2 text-titanium-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
