<<<<<<< HEAD
# TaskFlow — Smart Task & Project Manager

A full-stack task and project management app built on the MERN stack. Create boards, manage tasks across a Kanban board, and get AI-powered effort estimates powered by Google Gemini.

---

## Features

| Category | Details |
|---|---|
| **Authentication** | JWT register/login, hashed passwords (bcrypt), protected routes, session persistence |
| **Boards** | Create, rename, delete boards with custom accent colours |
| **Kanban board** | Three columns: To Do · In Progress · Done |
| **Tasks** | Full CRUD — title, description, priority, due date, effort estimate |
| **Drag & Drop** | Move tasks between columns with HTML5 native drag-and-drop + optimistic updates |
| **AI Estimates** | Google Gemini suggests effort size (XS–XL) and a due date — accept or dismiss |
| **Filters & sort** | Search, priority filter, sort by due date / priority / title |
| **Overdue badges** | Red visual indicator on past-due tasks |
| **Dark / light mode** | Toggle persisted per user in MongoDB |
| **Responsive** | Mobile-first, works on any screen size |
| **Skeletons** | Smooth loading states throughout |

---

## Tech Stack

### Frontend
- **React 18** + Vite — fast dev & optimised builds
- **Tailwind CSS 3** — utility-first styling with dark mode via `class` strategy
- **React Router 6** — client-side routing with protected routes
- **Axios** — HTTP client with request/response interceptors
- **date-fns** — lightweight date formatting
- **react-hot-toast** — non-intrusive toast notifications

### Backend
- **Node.js + Express 4** — REST API with clean MVC structure
- **MongoDB + Mongoose 8** — document DB with virtual populate for task counts
- **bcryptjs** — password hashing (cost factor 12)
- **jsonwebtoken** — JWT generation and verification
- **express-validator** — server-side input validation
- **helmet** — HTTP security headers
- **express-rate-limit** — brute-force protection
- **morgan** — HTTP request logging (development only)
- **Google Gemini API** (`gemini-2.0-flash`) — AI effort estimation

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Request handlers
│   ├── middleware/      # Auth, error handler, validation
│   ├── models/          # Mongoose schemas (User, Board, Task)
│   ├── routes/          # Express routers
│   ├── services/        # Gemini AI service, JWT service
│   ├── validators/      # express-validator chains
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/  # Reusable UI, board, task, layout
    │   ├── context/     # AuthContext (useReducer)
    │   ├── pages/       # Login, Register, Dashboard, BoardView, NotFound
    │   ├── services/    # Axios service modules
    │   └── utils/       # Date helpers, constants
    ├── index.html
    └── package.json
```

---

## Local Setup

### Prerequisites
- **Node.js ≥ 18**
- **MongoDB Atlas** free cluster — [create one here](https://cloud.mongodb.com) (M0 is free)
- **Google Gemini API key** — [get one free](https://aistudio.google.com/app/apikey)

### 1. Clone

```bash
git clone https://github.com/your-username/taskflow.git
cd taskflow
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and Gemini API key
npm run dev        # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL is already set to /api which proxies to localhost:5000
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** and register a new account.

---

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow

# JWT — use a long random secret in production
JWT_SECRET=change_this_to_a_long_random_secret
JWT_EXPIRES_IN=7d

# Google Gemini API key
GEMINI_API_KEY=AIzaSy...

# Allowed CORS origin
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
# For local dev, Vite proxies /api -> localhost:5000
VITE_API_URL=/api

# For production deployment, set to your backend URL:
# VITE_API_URL=https://taskflow-api.onrender.com/api
```

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | — | Register new user |
| `POST` | `/login` | — | Login, returns JWT |
| `GET` | `/me` | ✓ | Get current user |
| `PATCH` | `/preferences` | ✓ | Update theme preference |

### Boards — `/api/boards`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✓ | List all user's boards |
| `POST` | `/` | ✓ | Create a board |
| `GET` | `/:id` | ✓ | Get a board |
| `PUT` | `/:id` | ✓ | Update a board |
| `DELETE` | `/:id` | ✓ | Delete board + all its tasks |

### Tasks — `/api/boards/:boardId/tasks`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | ✓ | List tasks (query: `priority`, `status`, `sortBy`, `sortOrder`) |
| `POST` | `/` | ✓ | Create a task |
| `POST` | `/suggest` | ✓ | Get AI effort/due-date estimate |
| `PATCH` | `/reorder` | ✓ | Bulk update order + status |
| `GET` | `/:id` | ✓ | Get a task |
| `PUT` | `/:id` | ✓ | Update a task |
| `DELETE` | `/:id` | ✓ | Delete a task |
| `PATCH` | `/:id/status` | ✓ | Move task to new column |

---

## AI Feature

**Provider:** Google Gemini (`gemini-2.0-flash`) — chosen for its generous free tier and fast inference.

**Flow:**
1. User types a task title (and optional description) in the task form.
2. They click **"Suggest estimate"**.
3. The **frontend** sends the title + description to `POST /api/boards/:boardId/tasks/suggest`.
4. The **backend** constructs a structured prompt and calls Gemini.
5. Gemini returns JSON: `{ effort, suggestedDueDate, reasoning }`.
6. The backend validates and forwards the result.
7. The user sees the suggestion and can **Accept** (pre-fills fields) or **Dismiss** it.

**The `GEMINI_API_KEY` never leaves the server.** If the key is absent or the call fails, a fallback response is returned — the app remains fully functional.

---

## Deployment

### Frontend → Vercel / Netlify

```bash
cd frontend && npm run build   # outputs to dist/
```

Set environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render / Railway

- Set all `.env` variables in the platform dashboard.
- Build command: `npm install`
- Start command: `node server.js`
- Use **MongoDB Atlas** (free M0 tier).

---

## Known Limitations

- **Intra-column reordering** — drag-and-drop moves tasks between columns; reordering within a column uses the sort controls instead.
- **No email verification** — registration accepts any email without verification.
- **Single-user boards** — collaboration is not implemented.
- **No pagination** — boards with very large numbers of tasks will load all at once.
- **No refresh token** — JWT expires after 7 days; the user must log in again.

---

## Test Credentials (demo deploy)

| Field | Value |
|---|---|
| Email | `demo@taskflow.app` |
| Password | `demo123` |

> Replace with your own credentials after deploying.
=======
# Task-Flow
>>>>>>> 1babe6e694bb513698b4ac50288188a2f02787c7
