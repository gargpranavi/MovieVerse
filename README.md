# 🎬 Filmoria — Movie Discovery & Watchlist Platform

> A collaborative movie platform built with **React + Vite** by a 3-member team.
> Explore movies, manage your watchlist, track what you've watched, and discover trending films & actors.

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 👥 Team Structure & Branches

| Branch | Member | Responsibility |
|--------|--------|----------------|
| `feature/movie-discovery` | Member 1 | Home, Explore Movies, Search & Filters, Movie Details |
| `feature/user-watchlist`  | Member 2 | Login, Register, Watchlist, Watched Movies, Profile |
| `feature/trending-exploration` | Member 3 | Trending, Popular, Actors, Directors, Similar Movies |

---

## 📁 Project Structure

```text
member2/
│
├── pages/
│   ├── login2.jsx
│   ├── register2.jsx
│   ├── watchlist2.jsx
│   ├── watched2.jsx
│   └── profile2.jsx
│
├── css/
│   ├── login2.css
│   ├── register2.css
│   ├── watchlist2.css
│   ├── watched2.css
│   └── profile2.css
│
├── js/
│   ├── login2.js
│   ├── register2.js
│   ├── watchlist2.js
│   ├── watched2.js
│   └── profile2.js
│
├── components/
│   ├── LoginForm2.jsx
│   ├── RegisterForm2.jsx
│   ├── WatchlistCard2.jsx
│   ├── Rating2.jsx
│   ├── ReviewCard2.jsx
│   ├── ProfileCard2.jsx
│   ├── StatusBadge2.jsx
│   └── EmptyState2.jsx
│
└── data/
    ├── users2.js
    └── user-movies2.js
```

---

## 🗺️ Routes

| Route | Page | Status |
|-------|------|--------|
| `/login` | Login Page | ✅ Done (Day 1) |
| `/watchlist` | Watchlist Page | ✅ Done (Day 2) |
| `/watched` | Watched Movies | ✅ Done (Day 3) |
| `/profile` | My Profile | 🔜 Day 4 |
| `/register` | Register | 🔜 Upcoming |

---

## 🎨 Design System

- **Color Palette:** Deep black (`#050503`) + Gold (`#D4A017` / `#F5C842`) + Emerald Green (`#46D369`)
- **Typography:** `Outfit` (headings) + `Inter` (body)
- **Style:** Glassmorphism, dark cards, ambient glows, Amazon Prime/Netflix hover cards
- **Animations:** Hover scale-up, z-index elevation, drop-down info panel, toast notifications

---

## 📦 Tech Stack

- **React 19** — UI components & state
- **React Router v7** — Client-side routing
- **Vite 8** — Build tool & dev server
- **CSS Modules** — Scoped component styling
- **TVMaze API** — Real-time shows data fetching (`https://api.tvmaze.com/shows`)
- **localStorage** — Client-side persistence for watchlist & watched data

---

## 📅 Progress Log (Member 2)

### ✅ Day 1 — Watchlist & Login Foundation
- Created `/login` and `/watchlist` routes
- Built `LoginPage.jsx` with glassmorphic authentication UI
- Initial watchlist structure

### ✅ Day 2 — Watchlist + LocalStorage & TVMaze API
- Connected Watchlist to TVMaze API (`https://api.tvmaze.com/shows`)
- Persistent `localStorage` management (`localStorage.setItem("watchlist", ...)` & `getItem("watchlist")`)
- Auto-seeded 6 permanent default TVMaze shows on page load
- Implemented duplicate prevention logic
- Built `EmptyState2.jsx` with 🎬 empty watchlist illustration & CTA
- Redesigned movie cards to Amazon Prime / Netflix hover style (landscape 16:9, drop-down info panel, z-index elevation)
- Remove movie & Mark as Watched flow fully working

### ✅ Day 3 — Watched Movies System
- Built `WatchedPage2.jsx` & `WatchedPage2.module.css` with `/watched` route
- Created `StatusBadge2.jsx` component supporting `watched`, `running`, `ended`, and `genre` variants
- Implemented move from Watchlist (`watchlist`) → Watched (`filmoria_watched`) with persistent date timestamp
- Added empty state for watched movies with quick link back to watchlist
- Added header navigation buttons between `/watchlist` and `/watched`
- Standardized member2 folder format (`pages/`, `components/`, `css/`, `js/`, `data/`)

### 🔜 Day 4 — Profile & Register
- `ProfilePage2.jsx`
- `ProfileCard2.jsx`
- `RegisterPage2.jsx`

