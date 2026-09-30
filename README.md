# Rinxora — 24/7 Autonomous HVAC Voice Dispatcher & Receptionist

A high-converting, responsive landing page and interactive voice testing terminal for **Rinxora**, an autonomous AI receptionist and emergency triage voice agent built exclusively for HVAC contractors.

Powered by **Retell AI** (`retell-client-js-sdk`) with sub-400ms voice response, emergency life-safety protocols, upfront diagnostic fee protection, and direct field CRM synchronization (ServiceTitan, Housecall Pro, Jobber).

---

## ⚡ Key Features

- **Interactive Voice Testing Terminal**: Real-time voice simulation with dual modes:
  - **Live WebRTC Mode**: Connects directly to Retell AI using client SDK and microphone stream.
  - **Instant Interactive Voice Simulation**: Fully interactive client-side voice demo simulating HVAC emergency triage and call flows without requiring an API key.
- **HVAC-Specific Dispatch Flows**:
  - **Gas & Carbon Monoxide Emergency**: Global override triggering immediate outdoor evacuation instructions and priority alerts.
  - **Active Ceiling Water Leak**: Drywall protection protocol bypassing standard windows to dispatch nearest on-call truck.
  - **Territory & Diagnostic Fee Guardrails**: $89 diagnostic fee credited 100% into approved repair with DFW metro coverage screening.
- **Voice Customization & Cloning**: Multiple voice personas (Sarah, Marcus, custom brand clones) with full-duplex barge-in support.
- **HVAC Missed Revenue ROI Calculator**: Interactive calculator modeling lost revenue from after-hours missed furnace and AC calls.
- **Business-Outcome Pricing Tiers**:
  - **Tier 1: After-Hours Capture** ($1,000 / month, up to 350 mins/mo)
  - **Tier 2: 24/7 Full Front-Desk** ($1,550 / month, up to 750 mins/mo)
  - **Tier 3: Multi-Branch Enterprise** ($3,000+ / month, 1,500+ mins/mo)
  - **Mandatory Setup Fee**: $1,500 – $2,500 one-time onboarding.

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Voice Pipeline**: Retell Client JS SDK (`retell-client-js-sdk`)
- **Audio Visualizer**: HTML5 Canvas Audio Waveform Engine (Web Audio API)
- **Delight Elements**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ or v20+)
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Taha-ADS/Rinxora.git
cd Rinxora
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

---

## 📞 Retell AI Configuration (Optional)

To enable live microphone calls with your own Retell AI Agent:
1. Click the **SDK Key** button in the interface.
2. Enter your Retell **Public API Key** and your **Agent ID**.
3. Save and click **Start Live Call**.

---

## 📄 License

Proprietary © Vocalis / Rinxora Technologies. All rights reserved.
