# NeighborLy — Hyperlocal Community Skills & Task Marketplace

> **Local Skills · Real Opportunities · Built for Neighbors to Help Neighbors**

NeighborLy connects neighbors within walking and driving distance (1 km – 50 km) to get daily tasks done affordably, securely, and without middleman agency fees.

---

## 📖 Complete Feature Documentation
For an exhaustive, technical, and architectural breakdown of all features, workflows, and state machines, please read:
👉 **[FEATURES.md](./FEATURES.md)**

---

## 🚀 Quick Highlights
- **📍 GPS Proximity Engine**: Haversine distance calculations, dynamic radial boundary slider (1–50 km), and interactive Leaflet map with custom marker beacons.
- **🛡️ Escrow-Lite Safety**: Simulated escrow vaults holding buyer funds until task completion is approved.
- **💬 Order-Attached Live Chat**: Real-time bilateral communication with file deliverable attachments, system audit trails, and reviews.
- **✨ Gemini 3.8 Flash Assistant**: Real-time neighborhood AI for fair price estimation, task drafting, and provider matching.
- **📊 Moderator Command Portal**: Recharts telemetry (Monthly Volume AreaChart, Escrow Health Donut, Category Demand BarChart) and live dispute arbitration.
- **📱 Fully Responsive & PWA Ready**: Mobile bottom dock (`MobileBottomNav`), fluid touch targets ($\ge 44\text{px}$), dynamic SEO meta tags, and complete favicon suite.

---

## 🛠️ Tech Stack
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Mapping**: Leaflet & OpenStreetMap
- **AI**: Google Gemini 3.8 Flash via `@google/genai`
- **Backend**: Node.js & Express (`server.ts`)
