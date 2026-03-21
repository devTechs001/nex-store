# nex-store

A modern, enterprise-grade app store built with React, Vite, and Tailwind CSS.

## 🚀 Features

- 📱 Mobile-first responsive design for desktop and mobile
- 🔍 Advanced search and filtering across categories, languages, platforms, and ratings
- 📂 Category-driven app organization
- ⬇️ Download tracking and installation management
- ⭐ Ratings and reviews for apps
- 👤 User profile and favorites experience
- 🌙 Dark theme support
- 📤 App upload flow for submissions

## 🛠️ Tech Stack

- React 19
- Vite
- Tailwind CSS
- Lucide React

## 📦 Installation

```bash
npm install
npm run dev
npm run build
npm run preview
```

## 📁 Project Structure

```text
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   └── Rating.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── MobileNav.jsx
│   ├── apps/
│   │   ├── AppCard.jsx
│   │   └── AppDetails.jsx
│   └── categories/
│       └── CategoryCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── Downloads.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── context/
│   └── AppContext.jsx
├── data/
│   └── mockData.js
├── styles/
│   └── index.css
├── App.jsx
└── main.jsx
```

## 🎨 Design System

| Element | Value |
| --- | --- |
| Primary Color | `#0ef` |
| Background | `#1f242d` |
| Secondary BG | `#323946` |
| Text | `#fff` |
| Font | Poppins |

## 📱 Categories

- All Apps
- Web Apps
- Desktop
- Mobile
- CLI Tools
- APIs
- Libraries
- Utilities

## 🔧 Supported Languages

JavaScript, TypeScript, Python, Java, C++, C#, Rust, Go, Swift, Kotlin

## 🌐 Platforms

Windows, macOS, Linux, Android, iOS, Web, Cross-Platform

## 🚀 Getting Started

1. Open your browser to `http://localhost:3000`
2. Browse featured apps on the home page
3. Use the Explore page to search and filter apps
4. Click any app to see its details
5. Download apps to add them to your library
6. Upload your own apps using the Upload button

## 📸 Screenshots

The app includes:
- Hero section with call-to-action buttons
- Featured apps grid
- New release items
- Top-rated app lists
- Advanced filtering modal
- App detail modal with tabs
- Responsive mobile navigation

## 🤝 Contributing

Contributions are welcome. Please feel free to submit a pull request.

## 📄 License

MIT License
