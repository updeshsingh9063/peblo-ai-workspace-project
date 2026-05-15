# Peblo AI Notes Workspace 🚀

A full-stack **Collaborative AI Notes Workspace** built for the Peblo Full Stack Developer Challenge.

## ✨ Features

- **🔐 Secure Authentication**: Full JWT-based user authentication. Users can securely sign up, log in, and maintain persistent sessions using NextAuth.
- **📝 Intelligent Note Editor**: A fully-featured markdown text editor allowing users to draft, format, and organize their ideas with a live markdown preview toggle.
- **💾 Seamless Auto-Save**: Never lose your progress. The application automatically saves your notes in the background within 2 seconds of you stopping typing.
- **🤖 Peblo AI Assistant (Powered by Groq)**: Integrated AI right into the editor. 
  - *Summarize*: Instantly generate a concise summary of your entire document.
  - *Extract Action Items*: Automatically scan your notes and pull out a markdown bulleted list of actionable tasks.
  - *Improve & Suggest*: Let the AI suggest better titles and extract the primary "Key Topics" of your document.
- **🏷️ Tag-Based Organization**: Easily categorize notes by assigning custom tags (e.g., `#meetings`, `#strategy`). 
- **🔍 Advanced Search & Filtering**: Lightning-fast keyword search that scans both note titles and full text content, along with the ability to filter notes by specific tags or view your archived notes.
- **📊 Real-Time Insights Dashboard**: A productivity analytics dashboard displaying your total notes, words written, AI generations, your top used tags (with progress bars), a weekly activity chart, and your current writing streak.
- **🌐 Public Sharing**: Generate unique, secure, read-only public links for any note to instantly share your ideas with colleagues or friends without requiring them to log in.
- **🌌 Premium Glassmorphic UI**: A stunning, modern dark-mode aesthetic featuring interactive micro-animations, vibrant gradients, and responsive layouts designed in Figma.

---

## 🏗️ Architecture

```
peblo-notes/
├── frontend/          # Next.js 16 (App Router, Turbopack)
│   ├── app/           # Pages & API routes (Next.js API)
│   ├── components/    # React UI components
│   ├── lib/           # Prisma, Auth, Groq, utils
│   └── prisma/        # MongoDB schema
│
└── backend/           # Express.js REST API (standalone)
    ├── src/
    │   ├── routes/    # auth, notes, shared, insights, tags
    │   ├── middleware/ # JWT authentication guard
    │   └── lib/       # prisma, jwt, groq helpers
    └── prisma/        # Shared MongoDB schema
```

### Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Backend** | Express.js 4, TypeScript, Node.js |
| **Database** | MongoDB (via Prisma ORM) |
| **Authentication** | NextAuth v5 (frontend) · JWT (backend API) |
| **AI Provider** | Groq (`llama-3.3-70b-versatile`) |
| **Styling** | Custom CSS with glassmorphism design |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB database (Atlas free tier works great)
- Groq API key (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

---

### 2. Environment Variables

#### Frontend (`frontend/.env`)
```env
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/peblo
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key_here
```

#### Backend (`backend/.env`)
```env
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/peblo
JWT_SECRET=your-super-secret-jwt-key
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> ⚠️ Never commit real API keys. Both `.env` files are git-ignored.

---

### 3. Set Up Database

```bash
# Push the Prisma schema to MongoDB (run from frontend OR backend)
cd frontend
npm run db:push
```

---

### 4. Run the Applications

**Frontend (Next.js)**
```bash
cd frontend
npm run dev
# → http://localhost:3000
```

**Backend API (Express.js)**
```bash
cd backend
npm run dev
# → http://localhost:5000
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, get JWT token |
| `GET` | `/api/auth/me` | Get current user |

### Notes (requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | List notes (search, filter, sort, paginate) |
| `POST` | `/api/notes` | Create a new note |
| `GET` | `/api/notes/:id` | Fetch a single note |
| `PATCH` | `/api/notes/:id` | Update note |
| `DELETE` | `/api/notes/:id` | Delete note |
| `POST` | `/api/notes/:id/ai` | Generate AI insights (Summarize, Extract Action Items, Suggest Title) |
| `POST` | `/api/notes/:id/share` | Toggle public sharing |

### Public & Analytics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/shared/:shareId` | Public note view (no auth) |
| `GET` | `/api/insights` | Productivity analytics |
| `GET` | `/api/tags` | Tags used by current user |
| `GET` | `/api/health` | API health check |

### Query Parameters for `GET /api/notes`
| Param | Type | Description |
|---|---|---|
| `q` | string | Keyword search (title + content) |
| `tag` | string | Filter by tag name |
| `archived` | boolean | Show archived notes |
| `sort` | string | `updatedAt` \| `createdAt` \| `title` |
| `order` | string | `asc` \| `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (max 50) |

---

## 🤖 AI Integration

The AI summarization uses **Groq** (`llama-3.3-70b-versatile`) for blazing-fast inference.

### Example Request
```bash
POST /api/notes/:id/ai
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "extract"
}
```

### Example Response
```json
{
  "success": true,
  "data": {
    "result": "- Finalize UI mockups by end of sprint\n- Review API structure with backend team"
  }
}
```

---

## 🗄️ Database Schema

```prisma
model User {
  id           String  @id @default(auto()) @map("_id") @db.ObjectId
  name         String
  email        String  @unique
  passwordHash String
  notes        Note[]
}

model Note {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  content     String
  isArchived  Boolean     @default(false)
  isPublic    Boolean     @default(false)
  shareId     String?     @unique
  userId      String      @db.ObjectId
  user        User        @relation(...)
  tags        Tag[]       @relation(...)
  aiSummaries AISummary[]
}

model Tag {
  id    String @id @default(auto()) @map("_id") @db.ObjectId
  name  String @unique
  notes Note[] @relation(...)
}

model AISummary {
  id             String   @id @default(auto()) @map("_id") @db.ObjectId
  noteId         String   @db.ObjectId
  summary        String
  actionItems    String[]
  suggestedTitle String?
  keyTopics      String[]
}
```

---

## 🎬 Demo

Click **"▷ Live demo"** on the landing page for instant one-click access — no signup needed.

Or visit `http://localhost:3000` after running `npm run dev`.

---

## 📁 Sample Outputs

See [`/other`](./other/) directory for:
- Sample API responses
- AI-generated summary examples
- Screenshots

---

## 🔑 Key Design Decisions

1. **MongoDB with Prisma** — Flexible schema, great for tag relationships and embedded AI summaries
2. **Groq over OpenAI** — 10x faster inference, free tier generous enough for demos
3. **Dual API surface** — Next.js API routes (frontend) + Express.js (backend) — shows full-stack breadth
4. **JWT on backend, NextAuth on frontend** — Industry standard for each context
5. **Real-Time Live Analytics** — Dashboard strictly pulls real data and gracefully handles zero-states without relying on hardcoded mock/dummy data.

---

*Built with ❤️ for the Peblo Full Stack Developer Challenge*
