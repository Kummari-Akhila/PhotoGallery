# Infinite Scroll Photo Gallery (`photo-gallery`)

Built for the **Exactspace Technologies** UI Developer Internship selection process.

---

## 🌟 Key Features

### 1. Core Assignment Requirements
- **Paginated JSON Feed Consumption:** Fetches sequentially from `https://picsum.photos/v2/list?page=1`, `page=2`, `page=3`, etc.
- **1-Column Responsive Layout:** Displays each photo with its `author` in an elegant single-column card feed.
- **Infinite Scroll Engine:** Uses standard browser `IntersectionObserver` observing a sentinel target to smoothly fetch subsequent pages when the user approaches the bottom. Automatically ceases requests when no more items exist.
- **FontAwesome Thumbs-Up Counter:**
  - Strictly uses `@fortawesome/react-fontawesome` with `faThumbsUp` from `@fortawesome/free-solid-svg-icons`.
  - Initialized to `0` for every photo.
  - On clicking the icon, increases the count dynamically as many times as clicked.

### 2. Enhanced Dynamic Features
- **Zero Layout-Shift Media Container:** Fixed aspect ratio container with animated shimmer skeleton while images load asynchronously.
- **Search & Filter:** Instant live search to filter photos by photographer author name.
- **Sorting Options:** Sort feed by *Default Order*, *Most Liked*, or *Author (A-Z)*.
- **Local Persistence:** Preserves like counts in `localStorage` across page navigations.
- **Floating "Back to Top" Action:** Automatically appears when scrolling down for seamless navigation.
- **Graceful Error Recovery:** Displays network error state with a "Try Again" retry trigger.

---

## 🚀 Getting Started

```bash
cd photo-gallery
npm install
npm run dev
```

App runs at `http://localhost:3001`.

To build for production:
```bash
npm run build
```
