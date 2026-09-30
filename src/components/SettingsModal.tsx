import React, { useState, useEffect } from 'react';
import { X, Sliders, Key, Bot, Copy, Check, Shield, Code, Sparkles, AlertCircle } from 'lucide-react';
import { DEFAULT_AGENT_ID, saveRetellConfig } from '../lib/retell';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  agentId: string;
  onSave: (newKey: string, newAgentId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  publicKey,
  agentId,
  onSave,
}) => {
  const [inputKey, setInputKey] = useState(publicKey);
  const [inputAgent, setInputAgent] = useState(agentId || DEFAULT_AGENT_ID);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setInputKey(publicKey);
    setInputAgent(agentId || DEFAULT_AGENT_ID);
  }, [publicKey, agentId, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveRetellConfig({ publicKey: inputKey.trim(), agentId: inputAgent.trim() });
    onSave(inputKey.trim(), inputAgent.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  const sampleSnippet = `import { RetellClient } from "retell-client-js-sdk";

const client = new RetellClient({
  key: "${inputKey || 'public_key_YOUR_PUBLIC_KEY'}"
});

function startCall() {
  client.createWebCall({
    agent_id: "${inputAgent || DEFAULT_AGENT_ID}",
    hooks: {
      onStatus: (status) => console.log("Call status:", status),
      onEnd: () => console.log("Call completed"),
      onError: (err) => console.error("Call error:", err),
    }
  });
}`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel-elevated rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-white/10 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-titanium-900 hover:bg-titanium-800 text-titanium-400 hover:text-white transition-colors border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-champagne-400/10 border border-champagne-400/20 text-champagne-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">Retell Client SDK Settings</h3>
            <p className="text-xs text-titanium-400">Configure your live WebRTC credentials or inspect SDK wiring</p>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="space-y-4 mb-6">
          {/* Agent ID Input */}
          <div>
            <label className="block text-xs font-mono uppercase text-titanium-300 mb-1.5 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-champagne-400" />
              <span>Retell Agent ID</span>
            </label>
            <input
              type="text"
              value={inputAgent}
              onChange={(e) => setInputAgent(e.target.value)}
              placeholder="agent_c43073d7aac77bb4ea80e4ef6e"
              className="w-full px-4 py-2.5 rounded-xl bg-titanium-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-champagne-400/50 transition-colors"
            />
            <span className="text-xs text-titanium-500 font-mono mt-1 block">
              Default pre-configured agent: <code className="text-titanium-400">{DEFAULT_AGENT_ID}</code>
            </span>
          </div>

          {/* Public Key Input */}
          <div>
            <label className="block text-xs font-mono uppercase text-titanium-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retell Public API Key</span>
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="public_key_YOUR_PUBLIC_KEY"
              className="w-full px-4 py-2.5 rounded-xl bg-titanium-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-400/50 transition-colors"
            />
            <div className="flex items-start gap-1.5 text-xs text-titanium-400 font-mono mt-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                Use only your <strong>Public Key</strong>. If left blank, the terminal operates in ultra-fast interactive simulation mode so you can demo without key limits.
              </span>
            </div>
          </div>
        </div>

        {/* Code Snippet Verification Preview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-titanium-400 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-champagne-400" />
              <span>Current SDK Client Implementation</span>
            </span>
            <button
              onClick={handleCopySnippet}
              className="text-xs font-mono text-titanium-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-xl bg-titanium-950 border border-white/10 text-xs font-mono text-titanium-300 overflow-x-auto">
            {sampleSnippet}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-titanium-900 hover:bg-titanium-800 text-titanium-300 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-champagne-400 to-amber-500 text-titanium-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 hover:scale-[1.02] flex items-center gap-2"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{saveSuccess ? 'Saved!' : 'Save & Connect'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
