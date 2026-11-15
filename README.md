# Infinite Scroll Photo Gallery (`photo-gallery`)

Built for the **ExactSpace Technologies Frontend/UI Developer Internship** selection process.

---

## 🌟 Key Features

### 1. Core Assignment Requirements

- **Paginated JSON Feed Consumption:** Fetches sequentially from the Picsum Photos API (`page=1`, `page=2`, `page=3`, etc.).
- **1-Column Responsive Layout:** Displays each photo with its author in an elegant single-column card feed.
- **Infinite Scroll Engine:** Uses the browser's native `IntersectionObserver` API to fetch subsequent pages when the user approaches the bottom. Automatically stops when no more images are available.
- **FontAwesome Thumbs-Up Counter:**
  - Uses `@fortawesome/react-fontawesome` with `faThumbsUp` from `@fortawesome/free-solid-svg-icons`.
  - Initializes every photo with a like count of `0`.
  - Increases the count dynamically whenever the user clicks the Like button.

### 2. Enhanced Dynamic Features

- **Zero Layout-Shift Media Container:** Fixed aspect-ratio image containers with animated shimmer skeleton loaders.
- **Search & Filter:** Instantly filters photos by photographer name.
- **Sorting Options:** Sorts photos by Default Order, Most Liked, or Author (A–Z).
- **Local Persistence:** Preserves like counts in `localStorage`.
- **Floating Back-to-Top Action:** Appears when scrolling down for easy navigation.
- **Graceful Error Recovery:** Displays network error messages with a Try Again option.

---

## 📁 Project Structure

```text
photo-gallery/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── GalleryHeader.jsx
│   │   ├── GallerySettings.jsx
│   │   ├── GallerySidebar.jsx
│   │   ├── LightboxModal.jsx
│   │   ├── PhotoCard.jsx
│   │   └── SkeletonCard.jsx
│   │
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies Used

- React.js
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3
- Picsum Photos API
- Font Awesome
- Intersection Observer API
- LocalStorage

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/Kummari-Akhila/PhotoGallery.git
```

Navigate to the project directory:

```bash
cd PhotoGallery
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run at the local URL displayed in your terminal.

### Production Build

To create an optimized production build:

```bash
npm run build
```

---

## 🌐 Live Demo

[View Infinite Scroll Photo Gallery](https://exactspace-photogallery.netlify.app/)

Demo Video : https://drive.google.com/file/d/1rOlaHVeFEXbBArNzuKXklafR0g_LjFDd/view?usp=sharing
