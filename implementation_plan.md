# Implementation Plan: LODGEME Rental Service MVP

## 1. Project Overview
LODGEME is a dual-sided rental platform bridging homeowners/agents and tenants. The MVP focuses on trust, clarity, and breaking location barriers through an intuitive, mobile-first experience.

## 2. Brand Identity & UI Approach
- **Brand Colors**: 
  - Primary: `#bb7655` (Terracotta/Brown)
  - Secondary: `#f0d38f` (Sand/Gold)
  - Layout: `#ffffff` (White background)
- **UI Feel**: Clean, spacious, calm, and trustworthy.
- **Design Principles**: 
  - White or light background (No default dark mode).
  - Soft shadows and rounded corners (lg/xl).
  - Clear card-based layouts for properties.
  - Large, readable typography (Inter/Outfit).
  - Consistency in border-radius, button styles, and spacing.

## 3. Tech Stack
- **Frontend**: Next.js 15+ (App Router), React 19, Tailwind CSS 4.
- **Backend/Database**: **Firebase** (Firestore for DB, Firebase Auth, Firebase Storage).
- **Icons**: Lucide React.
- **Animations**: Framer Motion (subtle micro-animations).

## 4. Dashboard UI Structures

### A. Client Dashboard (Home Screen)
- **Layout**: Top Navbar (Logo, Search, Notifs, Profile) + Hero (Random property highlights) + Property Grid.
- **Features**:
  - **Search & Filter**: Keyword search (location) + Filters (Price, Bedrooms, Bathrooms, Property Type, Year Built, Water Source, Ratings).
  - **Property Grid**: Cards show Photo, Price, and Full Address.
  - **Property Detail Page**: 
    - Full photo gallery (Min 2 images).
    - Detailed Info: Sales Copy, Type, Beds, Baths, Water Source, Year Built.
    - **Publisher "About" section**: Name, Photo, Address, Verified Badge, Ratings.
    - **Messenger Access**: Initiate chat button.
  - **Favoriting**: Save listings to "Favorites" list; access history and delete.
  - **"INTEREST" System**: Create one-time detailed post of requirement. (Edit/Delete enabled).
  - **Bottom Navigation**: Persistent menu for mobile.

### B. Homeowner/Agent Dashboard
- **Layout**: Sidebar Navigation (Dashboard, My Listings, Add Property, Market Insight, Messages, Profile, Logout).
- **Features**:
  - **Verification Hub**: placeholder for Gov ID and Face Verification (Blocker for publishing).
  - **Role Selection**: Toggle between "Direct Homeowner" or "Agent".
  - **Add Property Wizard**: 4-step form requiring: Sales Copy, Address, Type, Price, Baths, Beds, Water Source, Year, and Min 2 Photos.
  - **Market Insight**: Feed showing all client "INTEREST" posts. (VIEW ONLY: No reaction/response capability).
  - **Messenger**: WhatsApp-style list (Response-only: cannot initiate new chats).
  - **Profile Management**: Update personal info and display photo (subject to verification).

## 5. Development Roadmap

### Phase 1: Authentication & Onboarding (IN PROGRESS)
- [x] Initial Project Setup & UI Foundation
- [x] Dual-Role Auth UI (Tenant vs Homeowner tabs)
- [x] Email/Password & Google Sign-In Integration
- [x] Auto-creation of Firestore User Profiles (Role + Basic Info)
- [ ] **Homeowner Verification UI**: ID upload and face verification placeholder screens.
- [ ] **Profile Setup**: Name, Address, and Profile Photo upload for all users.

### Phase 2: Client Home & Discovery
- [ ] **Property Listing Engine**: Fetching/Displaying random listings on Home.
- [ ] **Advanced Search & Filtering**: Implementing keyword and categorical filters.
- [ ] **Property Detail View**: Comprehensive view including Publisher "About" card.
- [ ] **Favorites System**: Firestore collection for saved listings.
- [ ] **"INTEREST" Builder**: UI and logic for clients to post requirements.

### Phase 3: Homeowner Listing & Management
- [ ] **Listing Wizard**: Strict validation for all required fields (beds, baths, water, year, 2+ photos).
- [ ] **Listing Management**: Edit/Update/Delete active properties.
- [ ] **Market Insight Page**: Special feed to view client "INTEREST" posts.
- [ ] **Publishing Guard**: Logic to verify 'account_status' before allowing 'Public' listing state.

### Phase 4: Communication (Messenger)
- [ ] **Real-time Messaging**: Text and Voice message support via Firestore.
- [ ] **Initiation Logic**: Restricted to Client -> Homeowner only.
- [ ] **Message History**: Accessing previous chat threads for both roles.

### Phase 5: Trust, Safety & Support
- [ ] **Ratings & Reviews**: System for clients to rate homeowners with constructive feedback guidelines.
- [ ] **Reporting System**: Report listings, users, or specific chats for misconduct.
- [ ] **Help & Support**: Click-to-call support line + in-app support messaging.
- [ ] **Session Persistence**: Ensure users stay signed in until explicit logout.

### Phase 6: Final Polish
- [ ] Mobile optimization pass.
- [ ] Performance and security audit.
