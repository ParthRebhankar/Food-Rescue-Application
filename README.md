A functional, hackathon-ready sustainability marketplace connecting local restaurants, bakeries, and grocery stores with neighborhood consumers to rescue surplus food at discounted prices and track avoided greenhouse gas emissions in real time.

> [!NOTE]
> **Educational & Non-Commercial Hackathon Project**:
> This repository and web application were built strictly for educational, learning, and hackathon evaluation purposes. It does **not** process real financial payments, charge credit cards, or represent actual registered businesses. All stores and listings are fictional illustrative sample data. Do not use real personal passwords.

---

## 🚀 Key Features

1. **Dual Role Architecture (`customer` & `merchant`)**:
   - Role stored in and enforced by the PostgreSQL database (`profiles` table), protected by Row Level Security (RLS) policies.
   - Dedicated workflows: Customers browse and reserve; Merchants manage inventory, view pickup orders, and confirm collections.

2. **Surplus Food Marketplace (`/customer`)**:
   - Filter by food category: **Bakery**, **Restaurant**, **Grocery**, and **Other**.
   - Live search by bundle title, description, and merchant store name.
   - Displays real-time discount percentages, weights in kilograms, and countdown to pickup deadlines.
   - Only displays active, non-expired listings with remaining inventory.

3. **Interactive OpenStreetMap with Leaflet (`StoreMapView`)**:
   - Geographic visualization of stores in the **Nagpur pilot region** (Dharampeth, Civil Lines, Sadar, Ramdaspeth).
   - Custom category pins with popups showing store address, contact details, and available surplus bundles.
   - Direct dual-view switching between Grid and Map modes.

4. **Atomic Reservation Engine (`create_reservation` RPC)**:
   - Eliminates overselling via PostgreSQL row locks (`FOR UPDATE`).
   - Decrements inventory atomically and generates unique pickup codes (e.g., `PK-7F4A8C`).
   - Customer-side cancellation restores inventory automatically.
   - Transparent in-person payment workflow (no card gateway needed for MVP).

5. **Merchant Operations Command (`/merchant`)**:
   - Real-time KPIs: Active listings, total reservations, bundles collected, and rescued weight.
   - Pending pickup queue: In-person customer verification with "Mark as Collected" confirmation flow.
   - 1-Click Nagpur Demo Data Seeder button directly in the merchant hub.

6. **Science-Backed Environmental Impact Tracker (`/impact`)**:
   - **Formula**: $\text{Avoided Emissions (kg CO}_2\text{e)} = \text{Rescued Food (kg)} \times 2.5\text{ kg CO}_2\text{e/kg}$
   - Based on United Nations Food and Agriculture Organization (FAO) and Poore & Nemecek (2018) meta-analysis.
   - Includes water footprint metrics (~750 L/kg) and passenger car travel distance offsets.
   - Emissions are only counted after verified merchant pickup confirmation (never for uncollected reservations).
   - Interactive Sensitivity Simulator slider to model different food composite factors (1.0 to 5.0 kg CO2e/kg).

---

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite (JavaScript)
- **Styling**: Tailwind CSS with custom cream (`#fcfbf7`) and forest green (`#265936`) sustainability palette
- **Icons**: Lucide React
- **Routing**: React Router v7
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Triggers
- **Maps**: React-Leaflet + OpenStreetMap

---

## 📋 Getting Started

### 1. Clone & Install Dependencies

```bash
cd "f:\Hackathon 6 hours practise"
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (copied from `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key
```

> **Where to get these?**
> 1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
> 2. Open your project.
> 3. Go to **Project Settings** (gear icon) → **API**.
> 4. Copy the **Project URL** and the **anon / public** API key.

---

## 🗄️ Database Setup (Supabase SQL)

### Step 1: Execute Schema & Security Policies
1. Open your Supabase project dashboard.
2. Navigate to the **SQL Editor** tab on the left menu.
3. Open `supabase/schema.sql` from this repository, copy its entire contents, paste them into the SQL Editor, and click **Run**.

This script sets up:
- `profiles` table linked to `auth.users(id)`
- `restaurants` table with latitude and longitude coordinates
- `food_bundles` table with constraints (`discounted_price <= original_price`, etc.)
- `reservations` table with status tracking (`reserved`, `picked_up`, `cancelled`)
- `handle_new_user()` trigger on `auth.users` to automatically populate profile roles
- Row Level Security (RLS) policies on all four tables
- Atomic stored procedures: `create_reservation`, `cancel_reservation`, and `confirm_pickup`

### Step 2: Seed Demo Stores & Bundles (Optional)
You have two easy options to populate demo stores around Nagpur:
- **Option A (In-App, Recommended)**: Sign up as a `Merchant` in the app, open the **Merchant Hub** (`/merchant`), and click the **"Seed Nagpur Demo Stores & Bundles"** button.
- **Option B (SQL Script)**: Open `supabase/seed.sql`, and run it in the Supabase SQL Editor.

---

## 🏃 Running the Application

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

To build the production bundle:

```bash
npm run build
```

---

## 🧪 End-to-End Walkthrough & Testing Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| **1. Merchant Onboarding** | Visit `/signup`, select **Merchant**, enter details, and sign up. | Redirected to `/merchant`. Profile role is securely set to `merchant` in Supabase. |
| **2. Demo Stores Population** | In the Merchant Dashboard, click **"Seed Nagpur Demo Stores & Bundles"**. | 4 demo stores in Nagpur (Bakery, Grocery, Dining, Deli) and 5 surplus bundles are created. |
| **3. Create New Listing** | Click **"New Food Bundle"** (`/merchant/bundle/new`), enter details, and submit. | Strict validations check positive price, discount <= retail, future deadline. Listing is published immediately. |
| **4. Customer Browsing** | Sign out or open an incognito window. Visit `/customer`. | All non-expired bundles appear. Test search, category filtering, and toggle between Grid and Map view. |
| **5. Map Inspection** | Switch to **Map View**. Click the store pins around Nagpur. | Popup shows store name, address, category, phone number, and available surplus bundles. |
| **6. Reserve Bundle** | Sign up/log in as a **Customer**. Open a bundle, click **"Reserve"**, pick quantity, and confirm. | Inventory decreases atomically in Supabase. Customer receives a pickup code (e.g., `PK-9B4E12`). |
| **7. Customer Dashboard** | Visit `/reservations`. | Shows reserved bundle, pickup deadline, merchant location, and pickup passcode. |
| **8. Merchant Collection Confirmation** | Log back into the merchant account. Go to `/merchant`. | The reservation appears in **Pending Customer Pickups**. Click **"Confirm Pickup"** to mark as collected. |
| **9. Environmental Accounting** | Visit `/impact`. | Total rescued kg, avoided CO2e, and water saved update automatically based on the confirmed pickup. |
| **10. Route Protection** | Try accessing `/merchant` while logged in as a customer or logged out. | Automatically blocked and redirected to unauthorized/login destination. |

---

## 🔬 Scientific Methodology & Assumptions

- **Emissions Factor**: $2.5 \text{ kg CO}_2\text{e}$ per kg of rescued food.
- **Source**: United Nations Food and Agriculture Organization (FAO) *Food Wastage Footprint* and Poore & Nemecek (2018).
- **Water Footprint**: $750 \text{ L}$ of embedded water per kg of food waste prevented.
- **Integrity Guarantee**: Metrics only update when reservations reach the `picked_up` terminal state, preventing fabricated numbers or duplicates.
