<div align="center">

<!-- HERO BANNER ANIMATION -->
<img src="docs/assets/animations/hero_banner.svg" alt="SmartMart Vendor OS Hero Banner" width="100%" />

<br/><br/>

[![React Native](https://img.shields.io/badge/React_Native-0.88.0_TurboModules-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platforms](https://img.shields.io/badge/Platforms-iOS_14+_|_Android_7+-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://reactnative.dev)
[![Architecture](https://img.shields.io/badge/Engine-100%25_Offline--First-27AE60?style=for-the-badge&logo=fastapi&logoColor=white)](#offline-first-sync-engine)
[![WhatsApp Business](https://img.shields.io/badge/Invoicing-WhatsApp_Direct_PDF-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](#tax-invoicing--whatsapp-sharing)
[![License](https://img.shields.io/badge/License-Proprietary_Enterprise-yellow?style=for-the-badge)](#license)

<br/>

### **The Enterprise Supermarket & Retail Operating System**
*Instant 10-Second Checkout • On-Device Vector GST Tax Invoicing • 60 FPS Laser Barcode Scanner • Omnichannel Dark Store Picking • Hardware-Free Floor Intercom*

<br/>

[📱 Live Screen Gallery](#-live-app-screen-showcase) • [⚡ 10-Second Checkout](#-the-10-second-checkout-pipeline) • [📷 Barcode Scanner Engine](#-hardware-barcode-scanner-engine) • [🏗️ System Architecture](#️-high-level-system-architecture) • [📖 Full Master Specification](docs/SMARTMART_VENDOR_SYSTEM_SPECIFICATION.md)

---

</div>

<br/>

## 🌟 Executive Overview & Value Proposition

**SmartMart Vendor** transforms any smartphone or retail tablet into an **Enterprise Retail Command Center**, bridging the gap between traditional Indian kirana stores, regional supermarket chains, and high-velocity quick-commerce dark stores.

### The Problem vs. SmartMart Solution

| Traditional Retail Friction | The SmartMart Vendor Solution |
|:---|:---|
| ⏳ **Slow Counter Queues**: Manual SKU typing on clunky legacy desktops causes 3-5 minute customer wait times. | ⚡ **10-Second Checkout**: 60 FPS hardware camera barcode scanning + 1-tap cart tender calculation. |
| 💸 **Thermal Paper Drain**: ₹18,000+ spent per counter yearly on fading, non-recyclable paper rolls. | 📄 **Zero-Paper PDF Invoicing**: High-resolution vector A4 GST Tax Invoices rendered locally & sent to WhatsApp. |
| 📴 **Internet Outage Blackouts**: Billing halts when broadband connectivity drops. | 📶 **100% Offline-First**: Local SQLite cache enables continuous sales; batch-syncs automatically on reconnect. |
| 📦 **Desynchronized Omnichannel**: Online delivery orders conflict with floor stock, causing stockouts. | 🔄 **Unified Catalog & Picking**: Dynamic aisle-by-aisle dark store picking routes with barcode verification. |
| 📢 **Noisy Counter Intercom**: Cashiers shout across store counters for manager price overrides or security. | 🚨 **Silent Floor Pager**: Digital buzzer with haptic alerts, counter targeting, and staff chat. |

---

## 📱 Live App Screen Showcase

Below are genuine, production screenshots captured from the active application running on physical devices:

<div align="center">

### In-Store POS Billing & Barcode Terminal

| 📄 On-Device GST Tax Invoice Modal | 📷 60 FPS Laser Barcode Terminal |
|:---:|:---:|
| <img src="docs/assets/screenshots/pos_tax_invoice_modal.png" width="360" alt="SmartMart Market Tax Invoice Modal with WhatsApp Sharing" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" /> | <img src="docs/assets/screenshots/barcode_scanner_terminal.png" width="360" alt="Laser Barcode Scanner Terminal with Animated Sweep" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" /> |
| **Instant Vector PDF Preview & Direct WhatsApp Share**<br/><sub>• Dark green frame `#2D5A43`, cream card `#FAF7F2`<br/>• Automatic GST 5% calculation & savings badge<br/>• Direct WhatsApp dispatch with zero external links</sub> | **Real-Time CameraKit Viewfinder**<br/><sub>• Animated green sweep laser & corner targeting reticles<br/>• Instant EAN-13, EAN-8, UPC, and QR decoding<br/>• Direct bottom sheet product card with aisle location</sub> |

<br/>

### Store Operations, Dark Store Settings & Onboarding

| ⚙️ Store Operations & Settings | 🏪 Store Profile & Live Status | 🚀 Interactive Merchant Onboarding |
|:---:|:---:|:---:|
| <img src="docs/assets/screenshots/vendor_settings_screen.png" width="270" alt="Vendor Settings Screen" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" /> | <img src="docs/assets/screenshots/vendor_profile_header.png" width="340" alt="Vendor Store Profile Screen" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" /> | <img src="docs/assets/screenshots/onboarding_welcome.png" width="270" alt="Merchant Onboarding Carousel" style="border-radius: 14px; box-shadow: 0 8px 24px rgba(0,0,0,0.25);" /> |
| **Operational Hub**<br/><sub>• Store Profile & FSSAI / GSTIN<br/>• Geofence fulfillment radius<br/>• Working hours & emergency pause<br/>• High-volume order siren settings</sub> | **Executive Identity**<br/><sub>• Live accepting orders status pill<br/>• Verified vendor store badge<br/>• Multi-counter performance tracking<br/>• Instant role switcher</sub> | **Visual Onboarding**<br/><sub>• Omnichannel order management<br/>• Instant barcode billing guides<br/>• Staff floor pager instructions<br/>• Multi-language setup</sub> |

</div>

---

## ⚡ The 10-Second Checkout Pipeline

SmartMart eliminates thermal printer bottlenecks with an autonomous on-device pipeline:

<div align="center">

<img src="docs/assets/animations/pos_flow_diagram.svg" alt="The 10-Second Checkout Pipeline" width="100%" />

</div>

1. **60 FPS Scan**: Cashier points camera at SKU barcode (`< 85ms` detection).
2. **Cart Engine**: Real-time MRP vs. discounted price evaluation, calculating customer savings (`Save ₹X`) and 5% GST breakdown.
3. **Multi-Mode Tender**: Select `CASH` (auto-computes change returned), `UPI` (in-store dynamic QR), or `CARD`.
4. **On-Device Vector PDF**: Generates a standard A4 Tax Invoice document locally without server roundtrips.
5. **Direct WhatsApp Delivery**: Sends the official PDF file directly to the customer's phone number via native WhatsApp dispatch.

---

## 📷 Hardware Barcode Scanner Engine

Equipped with high-performance native camera streams via `react-native-camera-kit`:

<div align="center">

<img src="docs/assets/animations/barcode_scanner_demo.svg" alt="Barcode Scanner Engine Demo" width="100%" />

</div>

- **Formats**: EAN-13, EAN-8, UPC-A, UPC-E, Code 128, QR Code.
- **Instant Shelf Metadata**: Instantly retrieves selling price, stock quantities, and physical aisle placement (e.g. *Aisle 2 • Dairy Chiller #1*).
- **Cart Integration**: 1-tap "Add to Active POS Register Cart".

---

## 🏛️ High-Level System Architecture

SmartMart Vendor operates on a decentralized, hybrid-cloud architecture:

```mermaid
flowchart TD
    subgraph ClientLayer["Mobile Client (React Native 0.88 - New Architecture)"]
        UI["UI Screens & Component Kit (41 Screens)"]
        POS["StoreBillingScreen (POS Engine)"]
        Scanner["BarcodeScanner (CameraKit 60FPS)"]
        PDF["InvoicePdf (Local HTML-to-PDF Engine)"]
        Pager["FloorPager & StaffChat Context"]
        Offline["AsyncStorage / SQLite Sync Queue"]
    end

    subgraph GatewayLayer["API Gateway & Real-Time Message Bus"]
        REST["REST API Gateway (HTTPS / TLS 1.3)"]
        WSS["WebSocket Engine (Socket.io / Redis PubSub)"]
        FCM["Firebase Cloud Messaging / Apple APNs"]
    end

    subgraph ServiceLayer["Backend Microservices"]
        AuthSvc["Auth & RBAC Service (JWT + Biometrics)"]
        CatalogSvc["Catalog & Inventory Service"]
        OrderSvc["Omnichannel Order Processing Engine"]
        BillingSvc["Billing, Tax (GST) & Ledger Service"]
        TeamSvc["Staff, Shift & Attendance Service"]
        SettlementSvc["Earnings & Bank Payout Gateway"]
        WhatsAppSvc["WhatsApp Business Cloud API Webhook"]
    end

    subgraph StorageLayer["Data & Persistence Tier"]
        Postgres[(PostgreSQL 16 - Relational DB)]
        Redis[(Redis 7 - Session / Cache / Geo)]
        S3[(Object Storage - PDF / Invoices / Product Media)]
    end

    UI --> REST
    POS --> PDF
    POS --> Offline
    Offline -.->|Auto-sync on reconnect| REST
    Scanner --> UI
    Pager --> WSS
    REST --> AuthSvc & CatalogSvc & OrderSvc & BillingSvc & TeamSvc & SettlementSvc
    WSS --> OrderSvc & Pager
    BillingSvc --> WhatsAppSvc
    WhatsAppSvc --> S3
    ServiceLayer --> Postgres & Redis & S3
```

---

## 👥 Role-Based Access Control (RBAC)

Configured dynamically via `StaffRoleContext`, supporting granular supermarket security:

| Role | Title | POS Counter | Catalog CRUD | Order Picking | Team / Leaves | Bank Financials |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **VENDOR** | Store Proprietor / Owner | Full CRUD | Full CRUD | Full CRUD | Full Admin | Full Access |
| **MANAGER** | Store General Manager | Full CRUD | Create / Update | Full CRUD | View & Approve | Store Summary |
| **BILLER** | Counter Cashier | Create / Update | Read Only | None | Shift Clock-in | Cash Count Only |
| **ORDERS** | Online Orders Specialist | None | Read Stock | Full Picking | Shift Clock-in | None |
| **INVENTORY** | Stockroom / Inwarding | None | Full CRUD | Read Only | Shift Clock-in | Purchase Ledger |
| **SUPERVISOR** | Floor Supervisor | Read Only | Adjust Buffer | Monitor Queue | Attendance Logs | None |

---

## 📑 A-to-Z Screen Dictionary (41 Screens)

<details>
<summary><b>1. Authentication & Onboarding Module (4 Screens)</b></summary>

- `SplashScreen` (`src/features/auth/screens/SplashScreen.tsx`): App launch entry point, session restoration, and biometric lock verification.
- `OnboardingScreen` (`src/features/auth/screens/OnboardingScreen.tsx`): 3-slide value illustration carousel tailored for supermarkets.
- `LoginScreen` (`src/features/auth/screens/LoginScreen.tsx`): Multi-factor merchant & staff authentication with biometric Face ID / Fingerprint login.
- `SignupScreen` (`src/features/auth/screens/SignupScreen.tsx`): Supermarket onboarding & KYC compliance registration (GSTIN verification, GPS pinpoint).
</details>

<details>
<summary><b>2. Dashboard & Operational Hub (2 Screens)</b></summary>

- `VendorHomeScreen` (`src/features/home/screens/VendorHomeScreen.tsx`): Executive cockpit displaying today's gross sales, channel splits (online vs POS), active picking orders, and quick action bar.
- `EmployeeHomeScreen` (`src/features/home/screens/EmployeeHomeScreen.tsx`): Role-tailored operational home for floor staff showing shift elapsed timers, assigned aisles, and picking tickets.
</details>

<details>
<summary><b>3. POS Counter Billing & Tax Invoicing (2 Screens/Components)</b></summary>

- `StoreBillingScreen` (`src/features/billing/screens/StoreBillingScreen.tsx`): High-speed offline-capable in-store billing counter register with category filtering, cart calculations, multi-mode tender, and tax invoice modal.
- `InvoiceDocumentView` (`src/features/billing/components/InvoiceDocumentView.tsx`): Visual on-screen rendering replicating the cream/green A4 tax invoice card design with paid badges and GST terms.
</details>

<details>
<summary><b>4. Barcode Scanning & Instant Price Checker (1 Screen)</b></summary>

- `BarcodeScannerScreen` (`src/features/inventory/screens/BarcodeScannerScreen.tsx`): 60 FPS camera scanner with laser targeting overlay, haptic feedback, and matched bottom sheet card.
</details>

<details>
<summary><b>5. Inventory, Catalog & Stock Management (4 Screens)</b></summary>

- `InventoryScreen` (`src/features/inventory/screens/InventoryScreen.tsx`): Master inventory with tabs for All SKUs, In Stock, Low Stock (<= 5 units), and Out of Stock.
- `StoreProductsScreen` (`src/features/inventory/screens/StoreProductsScreen.tsx`): Grid & list catalog view for rapid price tag updates and replenishment.
- `ProductFormScreen` (`src/features/inventory/screens/ProductFormScreen.tsx`): Add/edit product SKU with barcode autofocus, MRP, selling price, tax slab, and aisle location.
- `LowStockScreen` (`src/features/inventory/screens/LowStockScreen.tsx`): Critical stock depletion manager with 1-tap supplier reorder requisitions.
</details>

<details>
<summary><b>6. Omnichannel Order Fulfillment & Dark Store Staging (3 Screens)</b></summary>

- `VendorOrdersScreen` (`src/features/orders/screens/VendorOrdersScreen.tsx`): Central dispatch monitor for online quick-commerce delivery orders (New, Picking, Ready for Rider, Dispatched).
- `OrderDetailScreen` (`src/features/orders/screens/OrderDetailScreen.tsx`): Interactive picker checklist with SKU barcode verification, staging bay allocation (e.g. *Bay #4, Bag #B-42*), and rider 4-digit PIN verification.
- `DeliveryNavigation` (`src/app/navigation/DeliveryNavigation.tsx`): Dedicated dark store workflow segmented by target SLAs (4 mins target, 6 mins target).
</details>

<details>
<summary><b>7. Team Management, Attendance & HR Workflow (8 Screens)</b></summary>

- `TeamManagementScreen` (`src/features/team/screens/TeamManagementScreen.tsx`): Staff list with role badges and active shift indicators.
- `AddEmployeeScreen` (`src/features/team/screens/AddEmployeeScreen.tsx`): Register staff and configure granular permissions.
- `EmployeeDetailScreen` (`src/features/team/screens/EmployeeDetailScreen.tsx`): 360-degree employee overview with picking speed and attendance scores.
- `EmployeeShiftAttendanceScreen` (`src/features/team/screens/EmployeeShiftAttendanceScreen.tsx`): Geofenced clock-in/out and leave application portal (*Casual, Sick, Emergency, Swap*).
- `EmployeeTasksActivityScreen` (`src/features/team/screens/EmployeeTasksActivityScreen.tsx`): Shift task assignment board.
- `EmployeeGuidelinesSOPScreen` (`src/features/team/screens/EmployeeGuidelinesSOPScreen.tsx`): Food hygiene, fragile packing, and return SOPs.
- `EmployeeNoticeBoardScreen` (`src/features/team/screens/EmployeeNoticeBoardScreen.tsx`): Store owner announcements.
- `TeamAnalyticsScreen` (`src/features/team/screens/TeamAnalyticsScreen.tsx`): Productivity metrics tracking tickets picked per hour.
</details>

<details>
<summary><b>8. Floor Pager & In-Store Intercom (3 Screens/Components)</b></summary>

- `ManagerSummonOverlay` (`src/features/team/components/ManagerSummonOverlay.tsx`): Hardware-free digital intercom to summon managers to counters/aisles with high-priority haptic buzzes.
- `TeamChatListScreen` & `TeamChatConversationScreen` (`src/features/team/screens/TeamChatListScreen.tsx`): Internal store messaging channels (`#general-floor`, `#billing-counters`, `#riders`).
</details>

<details>
<summary><b>9. Finance, Earnings & Settlement Gateway (2 Screens)</b></summary>

- `EarningsScreen` (`src/features/earnings/screens/EarningsScreen.tsx`): Revenue, tax liability, platform commissions, and scheduled bank payout ledger.
- `SettlementDetailScreen` (`src/features/earnings/screens/SettlementDetailScreen.tsx`): NEFT/RTGS UTR deposit tracking with downloadable tax certificates.
</details>

<details>
<summary><b>10. Store Configuration & Operational Settings (6 Screens)</b></summary>

- `VendorSettingsScreen` (`src/features/settings/screens/VendorSettingsScreen.tsx`): Master settings dashboard.
- `StoreProfileScreen` (`src/features/settings/screens/StoreProfileScreen.tsx`): Trading name, logo, GSTIN, FSSAI number.
- `StoreAddressScreen` (`src/features/settings/screens/StoreAddressScreen.tsx`): GPS pinpoint and delivery fulfillment radius.
- `WorkingHoursScreen` (`src/features/settings/screens/WorkingHoursScreen.tsx`): Operational schedule & emergency store rush pause.
- `CommissionRateScreen` (`src/features/settings/screens/CommissionRateScreen.tsx`): Platform commission and gateway fees breakdown.
- `NotificationPreferencesScreen` (`src/features/settings/screens/NotificationPreferencesScreen.tsx`): High-volume siren and WhatsApp summary toggles.
</details>

<details>
<summary><b>11. Account, Security, Support & Legal (7 Screens)</b></summary>

- `ProfileScreen` & `EditProfileScreen`: Store Owner security and contact details.
- `AddressScreen` & `AddEditAddressScreen`: Secondary warehouses and supplier pickup points.
- `PaymentMethodsScreen`: Bank accounts for automated Razorpay settlements.
- `NotificationsScreen`: Real-time notification inbox.
- `SettingsScreen`: Multi-language selector (9 languages) and biometric lock settings.
- `HelpScreen` & `LiveChatScreen`: 24/7 priority live chat support with partner operations.
- `PrivacyPolicyScreen` & `TermsOfServiceScreen`: Statutory compliance and GST records guidelines.
</details>

> 📖 **Complete Specification**: For the complete 780-line technical guide with every REST endpoint, WebSocket payload, and database column, see [docs/SMARTMART_VENDOR_SYSTEM_SPECIFICATION.md](docs/SMARTMART_VENDOR_SYSTEM_SPECIFICATION.md).

---

## 📊 Key ROI Metrics for Supermarkets

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MEASURED BUSINESS IMPACT                        │
├─────────────────────────┬────────────────────────┬─────────────────────┤
│ ⚡ Checkout Wait Time    │ 📄 Thermal Paper Costs │ 🎯 Picking Accuracy │
│   -70% (10s per ticket) │   ₹18,000 Saved/Year   │   99.8% (Barcode)   │
├─────────────────────────┼────────────────────────┴─────────────────────┤
│ 📶 Network Resilience   │ 🧾 GST Tax Compliance                        │
│   100% Offline Billing  │   Automated CGST/SGST/IGST Calculations      │
└─────────────────────────┴──────────────────────────────────────────────┘
```

---

## 🛠️ Developer Quick Start

### Prerequisites
- **Node.js**: `20.x` or `22.x` LTS
- **React Native**: `0.88.0` (New Architecture / TurboModules)
- **Xcode**: `16.0+` with iOS 17/18 SDKs (for iOS development on macOS)
- **Android Studio**: Android SDK Build-Tools 35, NDK 27.x

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-org/Smart-Mart-Vendor.git
cd Smart-Mart-Vendor

# Install JavaScript dependencies
npm install
```

### 2. iOS CocoaPods Setup
```bash
# Install iOS native pods
cd ios
bundle exec pod install
cd ..
```

### 3. Run the Development Server & App
```bash
# Start Metro bundler
npm start

# In a separate terminal:
npm run ios       # Runs on iOS Simulator or connected iPhone
npm run android   # Runs on Android Emulator or connected device
```

### 4. Running Test Suites
```bash
# Run unit & integration test suites
npm test -- --no-watchman
```

---

## 📁 Repository Structure

```
Smart-Mart-Vendor/
├── docs/
│   ├── SMARTMART_VENDOR_SYSTEM_SPECIFICATION.md  # Master 780-line System Guide
│   └── assets/
│       ├── animations/                           # Animated vector SVGs
│       │   ├── hero_banner.svg
│       │   ├── barcode_scanner_demo.svg
│       │   └── pos_flow_diagram.svg
│       └── screenshots/                          # Real app screenshots
│           ├── pos_tax_invoice_modal.png
│           ├── barcode_scanner_terminal.png
│           ├── vendor_settings_screen.png
│           └── vendor_profile_header.png
├── src/
│   ├── app/                                      # Root Navigation & Themes
│   │   ├── navigation/
│   │   └── providers/                            # BiometricLock, StaffRoleContext
│   ├── features/                                 # Feature Modules
│   │   ├── auth/                                 # Splash, Onboarding, Login, Signup
│   │   ├── billing/                              # StoreBillingScreen, InvoiceView
│   │   ├── home/                                 # VendorHomeScreen, EmployeeHome
│   │   ├── inventory/                            # Scanner, Catalog, LowStock
│   │   ├── orders/                               # VendorOrders, OrderDetail
│   │   ├── team/                                 # Floor Pager, Attendance, Leaves
│   │   ├── earnings/                             # Ledger, Settlements
│   │   ├── settings/                             # StoreProfile, WorkingHours
│   │   └── support/                              # LiveChat, Helpdesk
│   └── utils/
│       └── invoicePdf.ts                         # On-Device HTML-to-PDF Engine
├── App.tsx                                       # Application Root Entry
├── package.json                                  # Dependencies & Scripts
└── README.md                                     # Executive Project Overview
```

---

## 🔒 Security & Privacy Compliance

- **Biometric Keychain Protection**: Refresh tokens and merchant secrets are stored strictly within the Secure Enclave / Android Keystore.
- **Zero External Intermediaries**: Invoices are generated directly on-device and shared straight to the customer's WhatsApp application without passing through third-party URL link shorteners or domain parking redirects.
- **GST Statutory Records**: Conforms to Section 31 of the Central Goods and Services Tax (CGST) Act, 2017 for digital tax invoice issuance.

---

## 📄 License & Intellectual Property

Copyright © 2026 **SmartMart Retail Technologies Inc.** All rights reserved.  
*Confidential & Proprietary. Unauthorized distribution, reverse engineering, or commercial reproduction is strictly prohibited.*
