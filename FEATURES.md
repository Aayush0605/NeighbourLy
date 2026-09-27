# NeighborLy — Architecture, Features & Functional Specification

NeighborLy is a production-grade, hyperlocal skills and community task marketplace designed to connect neighbors within walking or driving distance (1 km – 50 km). It enables community members to discover trusted local skills, broadcast urgent task requests, communicate through order-attached messaging, and transact safely under an **Escrow-Lite** payment protection guarantee.

---

## Table of Contents
1. [Core Architectural Philosophy](#1-core-architectural-philosophy)
2. [Hyperlocal Engine & Geolocation Intelligence](#2-hyperlocal-engine--geolocation-intelligence)
3. [Marketplace Core: Services & Task Requests](#3-marketplace-core-services--task-requests)
4. [Escrow-Lite Financial Protection Pipeline](#4-escrow-lite-financial-protection-pipeline)
5. [Real-Time Contextual Order Chat & Delivery](#5-real-time-contextual-order-chat--delivery)
6. [Gemini 3.8 Flash Local AI Assistant](#6-gemini-38-flash-local-ai-assistant)
7. [Moderator & Admin Command Center](#7-moderator--admin-command-center)
8. [Identity, Authentication & Security](#8-identity-authentication--security)
9. [Mobile-First Responsive Design System](#9-mobile-first-responsive-design-system)
10. [Brand Assets, SEO & PWA Infrastructure](#10-brand-assets-seo--pwa-infrastructure)
11. [Technology Stack & API Endpoints](#11-technology-stack--api-endpoints)

---

## 1. Core Architectural Philosophy
- **Anti-Agency & Zero Take-Rate**: Eliminates high middleman agency cuts (0% platform fee), ensuring 100% of peer task payments go directly from client to neighbor.
- **Physical Proximity Grounding**: Every listing, broadcast request, and AI query is strictly anchored to real geographic coordinates (lat/lng), street addresses, and neighborhood nodes.
- **Trust Through Escrow**: Eliminates fraud, ghosting, and substandard service by holding funds in escrow until the client verifies delivered work.

---

## 2. Hyperlocal Engine & Geolocation Intelligence

### 2.1 GPS Detection & Neighborhood Nodes
- **HTML5 Geolocation Integration**: `detectBrowserLocation()` fetches current device coordinates via the browser's Geolocation API.
- **Pre-Configured High-Density Neighborhoods**: Pre-seeded coordinates across major tech and community hubs (e.g., Koramangala, Indiranagar, HSR Layout, Whitefield, Bandra West, Powai, etc.).
- **Manual Location Picker Modal (`LocationPickerModal.tsx`)**:
  - Live search across neighborhood names, districts, and landmarks.
  - Manual address entry with automatic coordinate assignment.
  - One-click "Use Current GPS Location" button.

### 2.2 Mathematical Proximity & Radial Filtering
- **Haversine Distance Metric**:
  Calculates Great-Circle distance between client coordinates $(lat_1, lng_1)$ and service provider coordinates $(lat_2, lng_2)$ in kilometers:
  $$d = 2r \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta \text{lng}}{2}\right)}\right)$$
- **Enforced Radial Boundary**: Interactive slider allows setting the search radius from **1 km to 50 km**.
- **"Work From Current Location" Toggle**: Instantly excludes any listing outside the active radial perimeter.

### 2.3 Interactive Geospatial Map (Leaflet)
- Embedded interactive OpenStreetMap canvas rendered through Leaflet.
- Custom pulsating SVG pins distinguishing:
  - User's active location node (Royal Blue beacon).
  - Available skill providers (Emerald beacon).
  - Open broadcast task requests (Amber beacon).
- Direct pin click displays listing card with distance in kilometers, pricing, and booking action.

---

## 3. Marketplace Core: Services & Task Requests

### 3.1 Service Categories
1. **Home & Repairs**: Furniture assembly, plumbing repairs, electrical fixing, painting.
2. **Tech & Digital**: Wi-Fi troubleshooting, smart home setup, PC building, printer configuration.
3. **Creative & Design**: Presentation decks, flyer printing, photo retouching, video editing.
4. **Lessons & Tutoring**: Academic math/science, musical instruments, language practice.
5. **Pet Care**: Dog walking, pet sitting, feeding visits.
6. **Errands & Delivery**: Local grocery runs, urgent item delivery, neighborhood pickups.
7. **Gardening & Outdoors**: Lawn care, plant potting, balcony garden setup.
8. **Craft & Handmade**: Tailoring, alterations, custom woodwork.

### 3.2 Offering a Skill (`PostServiceModal.tsx`)
- Title, category selector, detailed description.
- Base service pricing (₹ INR).
- Optional **Rush Delivery Add-on**: Extra fee for urgent same-day turnaround (within 4 hours).
- Estimated turnaround time (Same day, 1 day, 2 days, 3 days, 1 week).
- Number of revisions included.
- Skill keywords for faceted search indexing.

### 3.3 Broadcasting a Task Request (`PostRequestModal.tsx`)
- Allows neighbors to request help when no existing listing matches their specific requirements.
- Flexible or fixed budget.
- Urgency marker (Urgent / Same-day).
- Automatic geo-tagging to the user's current neighborhood.

### 3.4 Search, Sort & Multi-Attribute Filters (`BrowseServices.tsx`)
- Keyword search across titles, provider names, and skill tags.
- Price range slider (up to ₹3,000+).
- Turnaround filters (Any, Same Day, 1–2 Days, 3+ Days).
- Sorting options:
  - **Nearest Distance** (ascending km).
  - **Price: Low to High**.
  - **Top Rated Providers** (highest reviews & stars).
- Favorite / Saved Services toggle with persistent local storage.

---

## 4. Escrow-Lite Financial Protection Pipeline

NeighborLy implements an **Escrow-Lite** state machine to protect buyers from ghosting and sellers from non-payment.

```
[ Booking Initiated ]
         │
         ▼
[ In Escrow Vault ] ──── (Dispute Triggered) ────► [ Dispute Review ]
         │                                                │
         │ (Provider Delivers Work)                       ├─► [ Refunded to Buyer ]
         ▼                                                │
[ Marked Delivered ]                                      └─► [ Released to Seller ]
         │
         ▼ (Buyer Confirms Satisfaction)
[ Released (Completed) ] ──► Seller Wallet Payout
```

### 4.1 Order Lifecycle States
| Order State | Description | Funds Status |
| :--- | :--- | :--- |
| `in_escrow` | Buyer has paid; funds are held in escrow. Seller commences task. | Vault Hold |
| `delivered` | Seller submits deliverable / confirms task completion with proof. | Vault Hold |
| `completed` | Buyer verifies and releases escrow, or moderator approves payout. | Released to Seller |
| `disputed` | Either party files a dispute over quality, delay, or non-delivery. | Frozen in Vault |
| `cancelled` | Order cancelled before work commenced; funds refunded to buyer. | 100% Refunded |

### 4.2 Virtual Wallet & Payout Simulation
- Providers view separate balances: **Available Earnings** (released) and **In-Escrow Hold** (active orders).
- Withdrawal trigger via UPI (`@upi` ID) with simulated bank transfer verification.

---

## 5. Real-Time Contextual Order Chat & Delivery

Each order has a dedicated chat room (`ChatOrderModal.tsx`) providing bilateral communication:
- **System Audit Log**: Automatic timestamps for order creation, escrow funding, file deliveries, and milestone releases.
- **Deliverable Submission Modal**: Sellers upload digital files or proof of completion.
- **One-Click Release**: Buyers approve completion with a single tap, triggering automated escrow release.
- **Rating & Review System**: Interactive 5-star rating with public neighbor feedback.

---

## 6. Gemini 3.8 Flash Local AI Assistant

NeighborLy features an AI assistant powered by **Gemini 3.8 Flash** via server-side proxy (`/api/gemini/assistant`).

### 6.1 Capabilities
- **Hyperlocal Recommendation**: Matches tasks to real neighborhood providers currently within the user's radius.
- **Market Price Estimation**: Suggests fair local rates for tasks (e.g. "What should I pay a neighbor to install a ceiling fan in Indiranagar?").
- **Task Drafting Assistant**: Helps users write clear, detailed task requests with optimal budgets.
- **Safety Explanations**: Details how Escrow-Lite holds payments and manages disputes.

### 6.2 Dual Access Modes
- **Floating Chatbot Widget (`AiChatbotWidget.tsx`)**: Quick-access bottom drawer with instant prompt chips and live streaming responses.
- **Dedicated Full View (`activeView === 'ai'`)**: Full-screen workspace with conversation history, price guides, and direct listing cards.

---

## 7. Moderator & Admin Command Center

Accessible via `/admin` or the user dropdown for authenticated platform moderators (`admin@neighborly.in`).

### 7.1 Recharts Analytical Telemetry
- **Monthly Order Volume & Escrow Trends (AreaChart)**:
  - Dual-axis graph comparing total escrow throughput (₹) and completed order counts over a 3-month or 6-month window.
  - Interactive tooltip with platform transaction telemetry.
- **Escrow Vault Health Distribution (PieChart Donut)**:
  - Breakdown of funds across Released, Held in Escrow, Under Dispute, and Refunded.
  - Centered aggregate currency display.
- **Demand by Skill Category (BarChart)**:
  - Horizontal comparative bars measuring active buyer orders against provider listings to identify skill shortages.

### 7.2 Moderator SLA & Operations
- **Dispute Resolution Hub**: Live arbitration desk allowing moderators to review order history, examine chat logs, and execute a **Release to Provider** or **Refund to Client** ruling.
- **Service Moderation Ledger**: Search, filter, and unpublish inappropriate or fraudulent service listings.
- **Neighborhood Node Configuration**: Adjust enforced global search radii and default neighborhood coordinates.

---

## 8. Identity, Authentication & Security

### 8.1 Multi-Mode Authentication (`AuthModal.tsx`)
- **Simulated Google 1-Tap OAuth**: Immediate profile creation with verified email and avatar.
- **Email & Password Authentication**: Full signup and login with validation.
- **Password Reset Flow**: Simulated 6-digit verification code with password update.
- **Admin Gateway**: Separate administrative credential verification.

### 8.2 Security & Data Privacy
- Passwords and sensitive credentials are encrypted and stored in local state.
- Sensitive environment variables (`GEMINI_API_KEY`) remain strictly server-side inside `server.ts`.
- No telemetry, analytics trackers, or third-party cookies.

---

## 9. Mobile-First Responsive Design System

NeighborLy complies with the **Frontend Design Constitution** for high-craft, anti-slop digital interfaces:

### 9.1 Adaptive Viewport Layouts
- **Desktop (1024px – 1440px+)**: Multi-column grids, sticky sidebar filters, and floating AI assistance.
- **Tablet (768px – 1024px)**: 2-column service card layouts and responsive Recharts dimensions.
- **Mobile (320px – 768px)**:
  - **Persistent Bottom Navigation Dock (`MobileBottomNav.tsx`)**: 5 primary thumb targets (**Home**, **Explore**, **Create [+]**, **Tasks**, **AI Help**) with iOS safe-area inset support (`env(safe-area-inset-bottom)`).
  - **Dynamic Viewport Spacing**: `pb-20 md:pb-0` layout breathing room to prevent bottom navigation overlaps.
  - **Edge-to-Edge Sliders**: Touch-scrolling category navigation tabs (`-mx-4 px-4`).
  - **Touch Targets**: Minimum $\ge 40\text{px}$–$44\text{px}$ touch surface area across all interactive buttons.
  - **Fluid Modal Sheets**: Modals automatically transform into native slide-up bottom sheets on mobile.

---

## 10. Brand Assets, SEO & PWA Infrastructure

### 10.1 Minimalist Favicon & Icon Set (`/public`)
- **`favicon.svg`**: Scalable geometric obsidian badge with architectural white "N" mark and royal blue/emerald connection beacon.
- **`favicon-16x16.png` & `favicon-32x32.png`**: Standard browser tab resolutions.
- **`apple-touch-icon.png` (180x180)**: Antialiased iOS home screen icon.
- **`android-chrome-192x192.png` & `android-chrome-512x512.png`**: PWA splash and launcher icons.
- **`favicon.ico`**: 32x32 multi-resolution browser fallback.

### 10.2 Dynamic SEO & Social Share Cards
- Client-side `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:image`, and Twitter Card tags automatically updated as the user browses neighborhood nodes (`utils/seo.ts`).
- Progressive Web App Manifest (`public/site.webmanifest`) configured for standalone installation.

---

## 11. Technology Stack & API Endpoints

### 11.1 Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite.
- **Visualization**: Recharts (AreaChart, PieChart, BarChart).
- **Icons**: Lucide React.
- **Mapping**: Leaflet, React-Leaflet.
- **Backend / Proxy**: Express, Node.js (`server.ts`).
- **AI Engine**: `@google/genai` (Gemini 3.8 Flash model).

### 11.2 Key API Endpoints
| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/gemini/assistant` | `POST` | Proxy endpoint communicating with Gemini 3.8 Flash with local neighborhood context and listings. |
| `/api/health` | `GET` | Server health check and API status. |

---

*NeighborLy — Local Skills · Real Opportunities · Built for Neighbors to Help Neighbors.*
