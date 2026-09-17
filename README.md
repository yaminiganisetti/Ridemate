# 🚗 RideMate — Premium Ride Booking Platform

India's smartest ride-booking platform. Book bikes, autos, and cars. Share rides, split fares.

---

## ✅ Implemented Features

### Frontend
- **Homepage** — Hero, Features, Vehicle types, Shared Ride section, Testimonials, FAQ, Download CTA
- **Authentication** — Email/password signup + login, Google Sign-In, Forgot password, role-based (user/driver/admin)
- **Booking Flow** — Full multi-step: location input, auto-detect GPS, vehicle selection, fare estimation, driver search, accept, payment, tracking, completion
- **Shared Rides** — Toggle for auto/car only, join existing rides, fare splitting, seat count, real-time updates
- **Payment System** — UPI deep links (PhonePe, GPay, Paytm), Razorpay scaffold, cash, transaction recording
- **Chat System** — Real-time user ↔ driver messaging per ride
- **Feedback & Ratings** — Post-ride 5-star rating with comments, updates driver average rating
- **Notifications** — Firebase-based in-app notifications for ride accepted/rejected, driver approval, payment

### Dashboards
- **User Dashboard** — Overview, ride history, payments/transactions, saved places
- **Driver Dashboard** — Online/offline toggle, ride requests (accept/reject), active rides, earnings, history
- **Admin Dashboard** — Driver approvals (view license, approve/reject), all rides table, transactions, analytics, shared ride stats, rating distribution

### Driver Flow
- Multi-step registration (personal info → vehicle → document upload)
- License photo upload to Firebase Storage
- Pending approval state screen
- Admin approve/reject with notifications

### Backend (Firebase)
- Firestore collections: users, drivers, rides, sharedRides, transactions, feedback, notifications, messages
- Security rules (role-based)
- Real-time subscriptions for rides, chat, notifications, driver location

---

## 🚀 Setup & Installation

### 1. Clone & Install
```bash
git clone <repo>
cd ridemate
npm install
```

### 2. Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable: **Authentication** (Email/Password + Google), **Firestore**, **Storage**, **Cloud Messaging**
3. Copy your Firebase config credentials

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
```bash
cp .env.example .env.local
```

### 4. Firestore Security Rules
Deploy the rules from `src/firebase/firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Build for Production
```bash
npm run build
firebase deploy
```

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── booking/      # PaymentModal, RideTrackerModal, FeedbackModal
│   ├── chat/         # ChatModal
│   ├── common/       # Navbar, Footer, DashboardSidebar, DashboardTopbar, LoadingScreen
│   ├── shared/       # SharedRideList
│   └── ui/           # Button, Card, Input, Modal, Badge, Avatar, Spinner, StarRating
├── context/          # AuthContext, NotificationContext, RideContext
├── dashboard/
│   ├── admin/        # AdminDashboard
│   ├── driver/       # DriverDashboard
│   └── user/         # UserDashboard
├── firebase/         # config.js, firestore.rules
├── layouts/          # MainLayout, DashboardLayout
├── pages/
│   ├── auth/         # LoginPage, SignupPage, ForgotPasswordPage
│   ├── booking/      # BookingPage
│   ├── driver/       # DriverRegisterPage, DriverPendingPage
│   └── home/         # HomePage + all sections
├── services/         # authService, rideService, driverService, paymentService, chatService, notificationService, feedbackService
└── utils/            # mapUtils, helpers, pricing
```

---

## 💳 Payment Configuration

### UPI
UPI ID is set to `ridemate@ybl` in `src/services/paymentService.js`. Replace with your actual UPI ID.

### Razorpay
Set `VITE_RAZORPAY_KEY_ID` in `.env.local` with your Razorpay Test/Live key.

---

## 👤 Test Accounts

After setup, create accounts through the app:
- Sign up as **Rider** → `/signup`
- Sign up as **Driver** → `/signup` (select Driver) → complete registration at `/become-driver`
- Set admin role manually in Firestore: `users/{uid}.role = "admin"`

---

## 📱 Responsive Design
- Mobile (320px+)
- Tablet (768px+)  
- Desktop (1280px+)
