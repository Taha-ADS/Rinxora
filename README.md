# Rinxora — 24/7 Autonomous HVAC Voice Dispatcher & Receptionist

A high-converting, responsive landing page and interactive voice testing terminal for **Rinxora**, an autonomous AI receptionist and emergency triage voice agent built exclusively for HVAC contractors.

Powered by **Retell AI** (`retell-client-js-sdk`) with sub-400ms voice response, emergency life-safety protocols, upfront diagnostic fee protection, and direct field CRM synchronization (ServiceTitan, Housecall Pro, Jobber).

---

## ⚡ Key Features

- **Live Sarah Calls**: The page embeds Retell's voice widget and the in-page console connects to the same Sarah agent using the client SDK.
- **HVAC-Specific Dispatch Flows**:
  - **Gas & Carbon Monoxide Emergency**: Global override triggering immediate outdoor evacuation instructions and priority alerts.
  - **Active Ceiling Water Leak**: Drywall protection protocol bypassing standard windows to dispatch nearest on-call truck.
  - **Territory & Diagnostic Fee Guardrails**: $89 diagnostic fee credited 100% into approved repair with DFW metro coverage screening.
- **Voice Previews**: Visitors can preview voice styles; live calls use Sarah.
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

## ⚙️ Configuration

Copy `.env.example` to `.env.local` and fill in what you use. Everything is public (it ships in the browser bundle).

The Retell voice widget is configured in `index.html`. The in-page call console uses the same public key and agent ID from `src/lib/agent.ts`. Restrict the public key to your domains in the Retell dashboard.

| Variable | What it does |
| --- | --- |
| `VITE_LEAD_ENDPOINT` | Where the “Book a demo” form posts, as JSON (Formspree, Web3Forms, a Zapier/Make webhook or your own API). |
| `VITE_LEAD_ACCESS_KEY` | Only for services that expect a key in the body (Web3Forms `access_key`). |
| `VITE_BOOKING_URL` | Calendly or Cal.com link offered after the form is sent, prefilled with the lead’s name and email. |
| `VITE_CONTACT_EMAIL` | Shown in the footer and legal pages; the fallback when the form can’t be sent. |
| `VITE_LEGAL_COMPANY`, `VITE_LEGAL_ADDRESS`, `VITE_LEGAL_JURISDICTION` | Filled into the Privacy Policy and Terms. |
| `VITE_SITE_URL` | The public address, so share previews get an absolute image URL. |

At least one of `VITE_LEAD_ENDPOINT`, `VITE_BOOKING_URL` or `VITE_CONTACT_EMAIL` must be set, or the demo form cannot reach you.

## 🗂 Pages and content

- `index.html` is the landing page; `privacy.html` and `terms.html` are the legal pages (text in `src/legal/content.tsx`, have it reviewed before launch).
- The hero film’s script and timing are the constants at the top of `src/components/Hero.tsx`. In development, `?heroT=12` shows the film at 12 seconds.
- Customer quotes go in `src/lib/proof.ts`; the section stays hidden until it has entries.
- `public/horizon-glow.webp` is rendered from `design/horizon-glow.svg` (SVG filters are too slow to run live in Safari).

## 📄 License

Proprietary © Rinxora Technologies. All rights reserved.
