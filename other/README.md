# ✨ Peblo Notes AI

![Peblo Notes Banner](https://upload.wikimedia.org/wikipedia/commons/4/4b/Next.js_logo.svg)

**Peblo Notes AI** is an enterprise-grade, collaborative, AI-powered workspace built to seamlessly transform your thoughts into actionable insights. Designed with a premium 3D glassmorphic aesthetic inspired by cutting-edge SaaS platforms, it leverages the bleeding edge of the Next.js App Router, MongoDB, and Anthropic's Claude 3.5.

This project was built to deliver incredible user experience (UX) tied seamlessly to a highly-resilient, robust API layer.

---

## 🚀 Live Environment URLs

Here is how you can interact with the complete system locally:

- **Frontend (Web Application):** [http://localhost:3000](http://localhost:3000)
- **Backend (Next.js API Routes):** [http://localhost:3000/api](http://localhost:3000/api) 
  *(API endpoints include `/api/auth`, `/api/notes`, `/api/insights`, etc.)*
- **Database (MongoDB Local):** `mongodb://localhost:27017/peblo-notes?authSource=admin`
- **Database Studio (Prisma UI):** Run `npx prisma studio` to view data visually at `http://localhost:5555`.

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router + Turbopack)
- **Styling:** Vanilla CSS & Tailwind CSS for extreme customization, 3D animated glassmorphism, glowing micro-interactions, and beautiful gradient topography.
- **Icons:** `lucide-react`
- **State & Data Fetching:** SWR / native React hooks for optimistic UI updates and responsive data streams.

### Backend
- **Architecture:** Serverless Edge Next.js Route Handlers (`/api/*`)
- **Database:** MongoDB
- **ORM:** Prisma v5.22.0 (Strictly enforced Library Engine for MongoDB compatibility)
- **Authentication:** NextAuth.js v5 (Auth.js) with bcryptjs for secure credential hashing, integrated through Edge-compatible Next.js Middleware (`proxy.ts`).
- **AI Engine:** Anthropic Claude 3.5 Sonnet (`@anthropic-ai/sdk`) for structured, automated JSON insight generation.

---

## ⚙️ How Everything Works

### 1. Database & ORM Layer
The app relies on **MongoDB** to handle highly-unstructured document data (perfect for a note-taking app!). 
Because Prisma heavily relies on relational connections, we migrated the `schema.prisma` mapping out of PostgreSQL entirely. We mapped `id` properties to `@map("_id") @db.ObjectId` allowing us to use Prisma's rich type-safety natively with Mongo. 

### 2. Edge Middleware & Authentication
Authentication is managed via **NextAuth v5 (Auth.js)**. 
- **The Problem solved:** Next.js Middleware strictly runs on the Vercel Edge Runtime. Prisma's native MongoDB driver does *not* support Edge environments due to TCP socket reliance. 
- **The Solution:** We decoupled `auth.config.ts` from `lib/auth.ts`. The Edge Middleware (`proxy.ts`) ONLY intercepts route requests (checking for JWT session tokens) without ever invoking the heavy Prisma Node binaries. Once the route reaches the Server Components or API Routes (which run on Node), the full `lib/auth.ts` connects to Prisma to validate credentials.

### 3. AI Insights Pipeline
When a user writes a note, the content is securely debounced and pushed to `/api/notes/[id]/generate-summary`. 
Here, the backend communicates with **Anthropic Claude 3.5**. We enforce a strict system prompt demanding a JSON response schema. Claude extracts:
- A synthesized executive summary.
- Action items / To-Dos.
- A dynamically suggested title.
- Deep-context keywords & tags.
This data is stored back into the MongoDB database and immediately piped to the UI.

### 4. 3D Animated UI & Design System
We implemented a breathtaking Figma design using complex CSS layouts:
- **Radial Gradients:** Massive blurred atmospheric background glows using `radial-gradient` and `filter: blur()`.
- **Glassmorphism:** Leveraging `backdrop-filter: blur(12px)` over highly transparent (`0.05` opacity) container borders to create a glassy, floating effect.
- **3D Hover Mechanics:** Deep interactive micro-animations. Note cards use `translateY` scaling intertwined with expanding drop-shadows and vibrant border-color transitions, achieving a palpable "3D popping" effect.

---

## 📦 Setup & Installation

Follow these instructions strictly to run the project.

### 1. Prerequisites
- Node.js 18+ installed.
- A running local MongoDB server instance on port `27017` (e.g., via Docker: `docker run -d -p 27017:27017 mongo`).

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Ensure you have a `.env` file at the root. The required variables are:
```env
DATABASE_URL="mongodb://localhost:27017/peblo-notes?authSource=admin"
AUTH_SECRET="ENTER_A_RANDOM_32_CHAR_STRING"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-api03-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Initialization
Synchronize your MongoDB database with the Prisma schema:
```bash
npx prisma generate
npx prisma db push
```

### 5. Start the Development Server
Because Next.js Turbopack heavily caches `node_modules`, if you ever encounter a Prisma Engine error, you MUST stop your terminal and restart it.
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the AI workspace!

---

### 🐛 Resolved Bugs Summary
- **Prisma Constructor Error:** Fixed an invalid `@prisma/client` v7.x dependency conflict that was improperly requesting Edge drivers by downgrading to the stable `5.22.0` and explicitly assigning `engineType = "library"`.
- **CSS Syntax Crash:** Repaired multiple unclosed CSS blocks in `globals.css` that broke Turbopack compilation.
- **Relational Mongo Mappings:** Converted all SQL relational joins (e.g., implicit many-to-many tag relations) to explicit array-of-ObjectID references, which are strictly required for MongoDB compatibility.
- **ClientFetchError (500 Auth Error):** Stopped the infinite redirection loops by restructuring NextAuth proxy logic.

---
*Built with ❤️ for the Peblo Challenge.*
