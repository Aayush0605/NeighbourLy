# NeighborLy — Complete System Architecture & Functional Guide

---

## 1. Executive Summary & Philosophy

**NeighborLy** is a hyperlocal neighborhood and campus micro-services marketplace ("Fiverr + Uber for Neighbors"). It connects nearby neighbors and university students to exchange practical daily skills—from tech setups and tutoring to pet care, handyman repairs, and errands—with **GPS proximity filtering**, **Escrow-Lite payment protection**, an **AI Assistant**, and a **Multi-Factor Trust Score & Verified Status Badge System**.

---

## 2. Admin Portal Credentials & Management

### A. Current Master Admin Credentials
| Field | Value |
| :--- | :--- |
| **Admin Portal URL** | Access via Navbar menu or directly by appending `#admin` to the URL |
| **Username / Email** | `admin` *(or `admin@neighborly.in`)* |
| **Master Password** | `admin` |
| **Assigned Role** | `Super Admin` / `Escrow Officer` |

### B. How to Change the Admin Password in the Future

#### Method 1: Directly inside the Admin Dashboard UI (Recommended)
1. Log in to the Admin Dashboard using the current password.
2. Click the **"Settings & Platform Config"** tab in the admin navigation bar.
3. In the **"Update Master Password"** card, enter:
   - Current Password: `admin`
   - New Desired Password: `[Your New Strong Password]` (minimum 5 characters)
4. Click **"Save New Master Password"**.
5. The password will immediately update in your browser's persistent secure key-value store.

#### Method 2: In Source Code
Open `/src/utils/adminAuth.ts` and modify `DEFAULT_ADMIN_CREDENTIALS`:
```typescript
const DEFAULT_ADMIN_CREDENTIALS: StoredAdminCredentials = {
  username: 'your_custom_admin_username',
  email: 'your_email@domain.com',
  passwordHash: 'your_new_secure_password',
};
```

---

## 3. Production Cloud Database & Security Status

### Active Cloud Database: **Firebase Firestore (Enterprise Edition)**
- **Status:** **Active & Fully Deployed**
- **Project ID:** `stellar-display-wthv3`
- **Database ID:** `ai-studio-promptcrafter-67852b80-a312-49ca-991e-75a3d4475c4d`
- **Security Rules:** Deployed with Zero-Trust Attribute-Based Access Control (`firestore.rules`).
- **Data Protection:**
  - Strict immutable timestamps (`request.time`).
  - Owner-only write authorization on listings, requests, and user profiles.
  - Escrow transactions guarded: only buyer, assigned provider, or verified admin can access order states.
  - Chat subcollection isolated strictly between the two counterparties in each order.
- **Resilience:** Hybrid Cloud + Local Sync ensures zero-latency UI performance with persistent cloud replication.

---

## 4. Trust Score & Verified Status Badge System

To foster neighborhood trust and safety, NeighborLy features a **Multi-Factor Trust Engine** calculated dynamically between `0` and `100`:

### A. Score Calculation Algorithm (0 to 100 Points)
1. **Identity & Verifications (Up to 35 Points):**
   - **Email Confirmation:** `+10 Points` (Personal or institutional email)
   - **Mobile Phone / OTP Verification:** `+10 Points` (Verified via SMS code)
   - **Campus Student ID:** `+15 Points` (University enrollment verification)
   - **Government / Resident ID:** `+15 Points` (Resident address verification)

2. **Escrow & Fulfillment Track Record (Up to 40 Points):**
   - **Completed Tasks:** `+5 Points` per task (up to `25 Points`)
   - **On-Time Delivery Rate:** Up to `10 Points` (e.g., 100% on-time = 10 pts)
   - **Zero Dispute Bonus:** `+5 Points` (Flawless escrow release history)

3. **Community Peer Reviews (Up to 25 Points):**
   - **Star Rating:** `★ 4.8+` = `+15 Points`, `★ 4.5+` = `+12 Points`, `★ 4.0+` = `+8 Points`
   - **Review Volume:** `+2 Points` per review (up to `10 Points`)

### B. Trust Tiers
- **90 – 100:** `Exceptional Trust` *(Emerald badge with verified neighbor status)*
- **80 – 89:** `High Trust` *(Blue badge with verified credentials)*
- **65 – 79:** `Verified Member` *(Purple badge with active escrow protection)*
- **< 65:** `New Member` *(Gray badge with mandatory escrow hold)*

### C. Earnable Badges
- 🎓 **Campus Student Verified:** Confirmed college/university student.
- 🛡️ **Government ID Verified:** Identity verified against official records.
- 📱 **Phone Verified (OTP):** Mobile number confirmed via 2-factor OTP.
- 🔒 **100% Escrow Reliable:** Zero chargebacks or contested disputes.
- ⭐ **Top Neighbor (4.8+):** Exceptional peer satisfaction rating.
- ⚡ **Fast Responder:** Answers neighborhood requests in under 15 minutes.
- 🏛️ **Community Pillar:** Completed 8+ community tasks in the local area.

---

## 5. Complete Feature Walkthrough

### 1. Hyperlocal Proximity Radar ("Work from Current Location")
- **Live GPS Detection:** Click the GPS button in the navbar to capture your exact latitude and longitude via the browser Geolocation API.
- **Dynamic Haversine Distance Engine:** Calculates precise real-time distances (e.g. `0.8 km`, `2.4 km`) between you and providers.
- **Configurable Radius Filter:** Filter services and tasks within `1 km`, `3 km`, `5 km`, `10 km`, or `25 km`.

### 2. Escrow-Lite Safety Mechanism
- When a buyer orders a service or accepts a task proposal, their payment is locked inside the **Escrow Vault**.
- Funds are only released to the provider when the buyer inspects the work and clicks **"Release Payment & Complete"**.
- In the event of a disagreement, both parties can open an escrow dispute, which is escalated directly to the Admin Dashboard for 1-click resolution (Refund, Release, or 50/50 Split).

### 3. Real-Time Order Chat & Milestone Tracking
- Dedicated real-time communication channel for every active order.
- Lifecycle milestones: `In Escrow ➔ In Progress ➔ Work Delivered ➔ Approved & Released`.
- Built-in review and rating system upon task completion.

### 4. AI Hyperlocal Assistant (Gemini 3.8 Flash)
- Grounded conversational assistant that knows your current neighborhood and active radius.
- Recommends nearest providers, calculates price estimates, and helps draft high-converting task listings.

### 5. Campus Student Mode
- Specially tailored for university campuses (IIT, Delhi University, Stanford, MIT, etc.).
- Allows students to offer study notes, exam tutoring, campus deliveries, and dorm repairs to peers with zero platform fees.

---

## 6. Directory Map & Code Structure

```
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx       # Secure admin moderation & escrow vault
│   │   ├── AiAssistantModal.tsx     # Fullscreen AI assistant modal
│   │   ├── AiChatbotWidget.tsx      # Floating sticky AI copilot
│   │   ├── AuthModal.tsx            # Login / Signup / Google OAuth modal
│   │   ├── BrowseServices.tsx       # Hyperlocal filter, search & service cards
│   │   ├── ChatOrderModal.tsx       # Order chat & escrow lifecycle management
│   │   ├── GigDetailModal.tsx       # Detailed service card with provider trust badge
│   │   ├── LandingHero.tsx          # Homepage hero & category discovery
│   │   ├── LocationPickerModal.tsx  # GPS & neighborhood selector
│   │   ├── MyTasksOrdersView.tsx    # Order tracker for buyers & sellers
│   │   ├── Navbar.tsx               # Header with trust badge & profile menu
│   │   ├── NeighborLyLogo.tsx       # Brand vector SVG logo
│   │   ├── PostRequestModal.tsx     # Post a task request
│   │   ├── PostServiceModal.tsx     # Offer a skill listing
│   │   ├── TrustBadge.tsx           # Multi-variant trust badge & score meter
│   │   └── UserProfileModal.tsx     # Trust score breakdown & credential verification
│   ├── data/
│   │   └── mockData.ts              # Clean storage interfaces (0 mock listings)
│   ├── types/
│   │   └── index.ts                 # Full TypeScript schemas for Trust & Escrow
│   ├── utils/
│   │   ├── adminAuth.ts             # Admin authentication & password hashing
│   │   ├── auth.ts                  # User accounts & Google OAuth handlers
│   │   ├── location.ts              # Haversine distance & geocoding helpers
│   │   ├── trustScore.ts            # Trust algorithm & badge computations
│   │   └── soundEffects.ts          # Web Audio API notification chimes
│   ├── App.tsx                      # Root coordinator & state manager
│   └── main.tsx                     # React DOM entry point
```

---
*NeighborLy — Empowering trusted, hyperlocal neighborhood connections.*
