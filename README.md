# CareTag

CareTag is an intelligent emergency response and elder care system designed to provide immediate assistance to elderly individuals through smart QR code tags. By bridging the gap between physical tags and digital notifications, CareTag ensures that caregivers are instantly alerted and first responders have access to life-saving medical information.

## 🌟 Project Overview

CareTag empowers families and caregivers by providing a seamless way to monitor and protect their loved ones. Each elder is assigned a unique QR code tag. In the event of an emergency (e.g., getting lost or having an accident), anyone who scans the tag can immediately access the elder's medical profile and trigger a high-priority notification to the registered caregivers.

## 🚀 Key Features

### 📱 LINE Integration
*   **Instant Notifications:** Caregivers receive real-time push messages via the LINE Messaging API when a tag is scanned.
*   **LIFF Support:** Utilizes LINE Front-end Framework (LIFF) for a seamless, in-app mobile experience for both helpers and caregivers.
*   **Location Tracking:** Captures and sends the GPS coordinates of the scan location directly to caregivers.

### 🚑 Emergency Response
*   **Critical Medical Profiles:** Provides instant access to blood type, chronic diseases, allergies, and medical rights.
*   **One-Tap Contact:** Enables helpers to quickly contact the elder's emergency contacts.
*   **Incident Logging:** Maintains a detailed history of all scan events, including timestamps and incident types (e.g., "Lost" or "Accident").

### 🛠️ Caregiver Dashboard
*   **Elder Management:** Easily register and manage multiple elder profiles and their associated tags.
*   **Contact Synchronization:** Link multiple caregivers to a single elder for redundant safety.
*   **Secure Authentication:** Robust user management and data protection powered by Supabase Auth.

## 💻 Tech Stack

### Frontend
*   **Framework:** React 19 (Vite)
*   **Styling:** TailwindCSS 4
*   **Icons:** Lucide React
*   **State & Routing:** React Router 7
*   **Integration:** @line/liff, @supabase/supabase-js

### Backend
*   **Runtime:** Node.js
*   **Framework:** Express
*   **Database:** PostgreSQL (via Supabase)
*   **Auth:** Supabase Auth
*   **Messaging:** LINE Messaging API (@line/bot-sdk)

## ⚙️ Installation

### Prerequisites
*   Node.js (v18 or higher)
*   A Supabase project
*   A LINE Developers account (Messaging API Channel & LIFF)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in your credentials:
   ```env
   PORT=3000
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   LINE_CHANNEL_ACCESS_TOKEN=your_line_token
   LINE_CHANNEL_SECRET=your_line_secret
   ```
4. Start the server:
   ```bash
   node src/app.js
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_LIFF_ID=your_line_liff_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.