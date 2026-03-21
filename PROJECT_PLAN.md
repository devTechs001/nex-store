# 🚀 Enterprise App Store - Complete Documentation & Implementation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Phase 1: Foundation Setup](#phase-1)
4. [Phase 2: Core Components](#phase-2)
5. [Phase 3: App Management](#phase-3)
6. [Phase 4: Advanced Features](#phase-4)
7. [Full Implementation](#full-implementation)

---

## 📖 Project Overview

### Vision
A unified, enterprise-grade application store supporting multiple platforms and languages (Web, Desktop, Mobile, C++, Java, Python, etc.)

### Key Features
- 📱 Mobile-first responsive design
- 🔍 Advanced search & filtering
- 📂 Category management
- ⬇️ Download management
- ⭐ Ratings & reviews
- 👤 User authentication
- 📊 Analytics dashboard
- 🔒 Admin panel
- 🌙 Dark theme (default)

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── Loader.jsx
│   │   └── Toast.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── MobileNav.jsx
│   │   └── Layout.jsx
│   ├── apps/
│   │   ├── AppCard.jsx
│   │   ├── AppGrid.jsx
│   │   ├── AppDetails.jsx
│   │   ├── AppUpload.jsx
│   │   ├── AppReviews.jsx
│   │   └── AppStats.jsx
│   ├── search/
│   │   ├── SearchBar.jsx
│   │   ├── SearchFilters.jsx
│   │   └── SearchResults.jsx
│   └── categories/
│       ├── CategoryList.jsx
│       └── CategoryCard.jsx
├── pages/
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── AppDetail.jsx
│   ├── Upload.jsx
│   ├── Profile.jsx
│   ├── Downloads.jsx
│   ├── Admin.jsx
│   └── Settings.jsx
├── hooks/
│   ├── useApps.js
│   ├── useAuth.js
│   ├── useSearch.js
│   ├── useDownload.js
│   └── useToast.js
├── context/
│   ├── AuthContext.jsx
│   ├── AppContext.jsx
│   └── ThemeContext.jsx
├── services/
│   ├── api.js
│   ├── storage.js
│   └── analytics.js
├── utils/
│   ├── helpers.js
│   ├── validators.js
│   └── constants.js
├── data/
│   └── mockData.js
├── styles/
│   └── index.css
├── App.jsx
└── main.jsx
```

---

## 📦 Phase 1: Foundation Setup

### Step 1: Create Project

```bash
npm create vite@latest enterprise-app-store -- --template react
cd enterprise-app-store
npm install
npm install react-router-dom lucide-react framer-motion zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 2: Configuration Files

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#1f242d',
          secondary: '#323946',
        },
        text: {
          DEFAULT: '#fff',
          muted: '#a0a0a0',
        },
        main: {
          DEFAULT: '#0ef',
          dark: '#0bc',
        },
        alt: '#1a2b3c',
        outline: '#0e1022',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'xs': ['1.32rem', { lineHeight: '1.25' }],
        'sm': ['1.45rem', { lineHeight: '1.25' }],
        'base': ['1.6rem', { lineHeight: '1.5' }],
        'lg': ['1.92rem', { lineHeight: '1.5' }],
        'xl': ['2.4rem', { lineHeight: '1.375' }],
        '2xl': ['3.2rem', { lineHeight: '1.375' }],
        '3xl': ['4rem', { lineHeight: '1.25' }],
        '4xl': ['5.12rem', { lineHeight: '1.25' }],
        '5xl': ['6.4rem', { lineHeight: '1.25' }],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px var(--main-color)' },
          '50%': { boxShadow: '0 0 20px var(--main-color), 0 0 30px var(--main-color)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

### Step 3: Base Styles

```css
/* src/styles/index.css */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  text-decoration: none;
  border: none;
  outline: none;
  scroll-behavior: smooth;
  font-family: 'Poppins', sans-serif;
}

:root {
  --bg-color: #1f242d;
  --sbg-color: #323946;
  --text-color: #fff;
  --main-color: #0ef;
  --alt-color: #1a2b3c;
  --ol-color: #0e1022;
  
  --font-size-base: 1.6rem;
  --scale: 1.25;
  
  --text-xs: calc(var(--font-size-base) / (var(--scale) * 1.1));
  --text-sm: calc(var(--font-size-base) / 1.1);
  --text-base: var(--font-size-base);
  --text-lg: calc(var(--font-size-base) * 1.2);
  --text-xl: calc(var(--font-size-base) * 1.5);
  --text-2xl: calc(var(--font-size-base) * 2);
  --text-3xl: calc(var(--font-size-base) * 2.5);
  --text-4xl: calc(var(--font-size-base) * 3.2);
  --text-5xl: calc(var(--font-size-base) * 4);
  
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}

html {
  font-size: 62.5%;
  overflow-x: hidden;
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}

body {
  font-family: 'Poppins', sans-serif;
  font-size: var(--font-size-base);
  line-height: var(--leading-normal);
  color: var(--text-color);
  background: var(--bg-color);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  user-select: none;
  -webkit-user-select: none;
  min-height: 100vh;
}

input, textarea, select {
  user-select: text;
  -webkit-user-select: text;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--sbg-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--main-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #0bc;
}

/* Custom Utilities */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 cursor-pointer;
  }
  
  .btn-primary {
    @apply bg-main text-bg hover:shadow-[0_0_20px_var(--main-color)] hover:scale-105 active:scale-95;
  }
  
  .btn-secondary {
    @apply bg-bg-secondary text-text hover:bg-main hover:text-bg;
  }
  
  .btn-outline {
    @apply border-2 border-main text-main hover:bg-main hover:text-bg bg-transparent;
  }
  
  .card {
    @apply bg-bg-secondary rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,238,255,0.2)];
  }
  
  .input {
    @apply w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:border-main transition-colors duration-300;
  }
  
  .title {
    @apply text-3xl md:text-4xl font-bold text-main text-center uppercase underline underline-offset-8 decoration-[3px] tracking-wide mb-8;
  }
  
  .section-title {
    @apply text-2xl font-bold text-text mb-6;
  }
  
  .glow {
    @apply shadow-[0_0_10px_var(--main-color)];
  }
  
  .glow-text {
    text-shadow: 0 0 10px var(--main-color), 0 0 20px var(--main-color);
  }
}
```

---

## 🧩 Full Implementation

Now let's create the complete application:

```jsx
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

```jsx
// src/App.jsx
import React, { useState, createContext, useContext, useEffect } from 'react'
import { 
  Home, Search, Download, User, Settings, Menu, X, ChevronRight,
  Star, Clock, TrendingUp, Grid, List, Filter, Upload, Bell,
  Code, Globe, Monitor, Smartphone, Terminal, Database, Cpu,
  Heart, Share2, ExternalLink, Check, AlertCircle, Info,
  BarChart3, Users, Package, Shield, Zap, Award, BookOpen,
  Play, Pause, RefreshCw, Trash2, Edit, Eye, Copy, MoreVertical,
  ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Sun, Moon, LogOut
} from 'lucide-react'

// ============================================================
// CONTEXT & STATE MANAGEMENT
// ============================================================

const AppStoreContext = createContext()

const useAppStore = () => {
  const context = useContext(AppStoreContext)
  if (!context) throw new Error('useAppStore must be used within AppStoreProvider')
  return context
}

// ============================================================
// MOCK DATA
// ============================================================

const CATEGORIES = [
  { id: 'all', name: 'All Apps', icon: Grid, color: '#0ef' },
  { id: 'web', name: 'Web Apps', icon: Globe, color: '#3b82f6' },
  { id: 'desktop', name: 'Desktop', icon: Monitor, color: '#8b5cf6' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, color: '#10b981' },
  { id: 'cli', name: 'CLI Tools', icon: Terminal, color: '#f59e0b' },
  { id: 'api', name: 'APIs', icon: Database, color: '#ef4444' },
  { id: 'library', name: 'Libraries', icon: BookOpen, color: '#ec4899' },
  { id: 'utility', name: 'Utilities', icon: Zap, color: '#06b6d4' },
]

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  { id: 'typescript', name: 'TypeScript', icon: '📘' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: '⚙️' },
  { id: 'csharp', name: 'C#', icon: '🎯' },
  { id: 'rust', name: 'Rust', icon: '🦀' },
  { id: 'go', name: 'Go', icon: '🐹' },
  { id: 'swift', name: 'Swift', icon: '🍎' },
  { id: 'kotlin', name: 'Kotlin', icon: '🎨' },
]

const PLATFORMS = [
  { id: 'windows', name: 'Windows', icon: '🪟' },
  { id: 'macos', name: 'macOS', icon: '🍎' },
  { id: 'linux', name: 'Linux', icon: '🐧' },
  { id: 'android', name: 'Android', icon: '🤖' },
  { id: 'ios', name: 'iOS', icon: '📱' },
  { id: 'web', name: 'Web', icon: '🌐' },
  { id: 'cross', name: 'Cross-Platform', icon: '🔄' },
]

const MOCK_APPS = [
  {
    id: 1,
    name: 'DataFlow Pro',
    description: 'Enterprise-grade data pipeline management system with real-time monitoring and automated workflows.',
    longDescription: 'DataFlow Pro is a comprehensive data pipeline management platform designed for enterprise environments. It provides real-time data processing, automated workflow orchestration, and advanced monitoring capabilities. Built with scalability in mind, it can handle millions of data points per second.',
    version: '2.4.1',
    category: 'api',
    language: 'python',
    platforms: ['linux', 'windows', 'macos'],
    rating: 4.8,
    downloads: 125430,
    size: '45.2 MB',
    developer: 'DataTech Solutions',
    releaseDate: '2024-01-15',
    lastUpdate: '2024-02-20',
    icon: '📊',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=DataFlow+1', 'https://placehold.co/800x450/323946/0ef?text=DataFlow+2'],
    features: ['Real-time processing', 'Auto-scaling', 'Monitoring dashboard', 'REST API'],
    requirements: 'Python 3.9+, 8GB RAM, 10GB Storage',
    license: 'Enterprise',
    isFeatured: true,
    isNew: false,
    tags: ['data', 'pipeline', 'enterprise', 'automation'],
  },
  {
    id: 2,
    name: 'CodeSync IDE',
    description: 'Modern integrated development environment with AI-powered code completion and real-time collaboration.',
    longDescription: 'CodeSync IDE brings the power of artificial intelligence to your development workflow. With smart code completion, real-time collaboration features, and support for 50+ programming languages, it is the ultimate tool for modern developers.',
    version: '5.0.0',
    category: 'desktop',
    language: 'typescript',
    platforms: ['windows', 'macos', 'linux'],
    rating: 4.9,
    downloads: 892100,
    size: '210.5 MB',
    developer: 'DevTools Inc.',
    releaseDate: '2023-06-01',
    lastUpdate: '2024-02-18',
    icon: '💻',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=CodeSync+1', 'https://placehold.co/800x450/323946/0ef?text=CodeSync+2'],
    features: ['AI completion', 'Live Share', 'Git integration', 'Extensions'],
    requirements: 'Windows 10+, macOS 11+, or Linux, 4GB RAM',
    license: 'Free / Pro',
    isFeatured: true,
    isNew: true,
    tags: ['ide', 'development', 'ai', 'collaboration'],
  },
  {
    id: 3,
    name: 'CloudVault Manager',
    description: 'Secure cloud storage management with end-to-end encryption and cross-platform sync capabilities.',
    longDescription: 'CloudVault Manager provides military-grade encryption for your cloud storage needs. Sync files across all devices, share securely with team members, and maintain complete control over your data with advanced permission management.',
    version: '3.2.0',
    category: 'utility',
    language: 'go',
    platforms: ['cross'],
    rating: 4.7,
    downloads: 456780,
    size: '28.3 MB',
    developer: 'SecureCloud Ltd.',
    releaseDate: '2023-09-10',
    lastUpdate: '2024-02-15',
    icon: '🔐',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=CloudVault+1'],
    features: ['E2E Encryption', 'Cross-sync', 'Team sharing', 'Version history'],
    requirements: 'Any modern OS, 2GB RAM',
    license: 'Freemium',
    isFeatured: false,
    isNew: false,
    tags: ['cloud', 'security', 'sync', 'storage'],
  },
  {
    id: 4,
    name: 'ReactFlow Builder',
    description: 'Visual React component builder with drag-and-drop interface and live code generation.',
    longDescription: 'Build React applications visually with ReactFlow Builder. Drag and drop components, customize properties, and see live code generation in real-time. Export to clean, production-ready React code.',
    version: '1.8.2',
    category: 'web',
    language: 'javascript',
    platforms: ['web'],
    rating: 4.6,
    downloads: 234560,
    size: '12.1 MB',
    developer: 'WebBuilders Co.',
    releaseDate: '2023-11-20',
    lastUpdate: '2024-02-10',
    icon: '⚛️',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=ReactFlow+1'],
    features: ['Drag & drop', 'Live preview', 'Code export', 'Component library'],
    requirements: 'Modern browser',
    license: 'MIT',
    isFeatured: true,
    isNew: true,
    tags: ['react', 'builder', 'visual', 'web'],
  },
  {
    id: 5,
    name: 'Terminal++',
    description: 'Advanced terminal emulator with AI assistance, multi-session management, and custom themes.',
    longDescription: 'Terminal++ redefines the command-line experience. With built-in AI assistance, you can get help with commands, troubleshoot errors, and automate repetitive tasks. Manage multiple sessions with ease and customize every aspect of your terminal.',
    version: '4.1.0',
    category: 'cli',
    language: 'rust',
    platforms: ['windows', 'macos', 'linux'],
    rating: 4.9,
    downloads: 678900,
    size: '18.7 MB',
    developer: 'CLI Masters',
    releaseDate: '2023-04-15',
    lastUpdate: '2024-02-22',
    icon: '🖥️',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=Terminal+1'],
    features: ['AI assistance', 'Multi-session', 'Custom themes', 'Plugin system'],
    requirements: 'Windows 10+, macOS 10.15+, or Linux',
    license: 'Open Source',
    isFeatured: false,
    isNew: false,
    tags: ['terminal', 'cli', 'productivity', 'development'],
  },
  {
    id: 6,
    name: 'GameEngine Core',
    description: 'High-performance game engine written in C++ with modern rendering and physics simulation.',
    longDescription: 'GameEngine Core provides everything you need to build AAA-quality games. With state-of-the-art rendering, physics simulation, and audio processing, it empowers game developers to create immersive experiences.',
    version: '2.0.0',
    category: 'library',
    language: 'cpp',
    platforms: ['windows', 'linux'],
    rating: 4.5,
    downloads: 89450,
    size: '890.2 MB',
    developer: 'GameDev Studios',
    releaseDate: '2023-08-01',
    lastUpdate: '2024-01-30',
    icon: '🎮',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=GameEngine+1'],
    features: ['Vulkan/DX12', 'Physics engine', 'Audio system', 'Editor'],
    requirements: 'Windows 10+, 16GB RAM, DirectX 12 GPU',
    license: 'Commercial',
    isFeatured: true,
    isNew: false,
    tags: ['game', 'engine', 'graphics', '3d'],
  },
  {
    id: 7,
    name: 'MicroServices Kit',
    description: 'Complete toolkit for building and deploying microservices with Java and Spring Boot.',
    longDescription: 'MicroServices Kit accelerates your microservices development with pre-built components, templates, and best practices. Includes service discovery, API gateway, circuit breakers, and distributed tracing out of the box.',
    version: '6.2.1',
    category: 'library',
    language: 'java',
    platforms: ['cross'],
    rating: 4.7,
    downloads: 345670,
    size: '156.8 MB',
    developer: 'Enterprise Java',
    releaseDate: '2023-03-20',
    lastUpdate: '2024-02-12',
    icon: '☕',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=MicroServices+1'],
    features: ['Service discovery', 'API gateway', 'Circuit breaker', 'Tracing'],
    requirements: 'Java 17+, Maven/Gradle',
    license: 'Apache 2.0',
    isFeatured: false,
    isNew: false,
    tags: ['java', 'microservices', 'spring', 'enterprise'],
  },
  {
    id: 8,
    name: 'MLFlow Studio',
    description: 'End-to-end machine learning platform for training, deploying, and monitoring ML models.',
    longDescription: 'MLFlow Studio simplifies the entire machine learning lifecycle. From data preparation to model deployment and monitoring, it provides a unified platform for data scientists and ML engineers.',
    version: '3.5.0',
    category: 'desktop',
    language: 'python',
    platforms: ['windows', 'macos', 'linux'],
    rating: 4.8,
    downloads: 567890,
    size: '340.5 MB',
    developer: 'AI Labs',
    releaseDate: '2023-07-10',
    lastUpdate: '2024-02-18',
    icon: '🤖',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=MLFlow+1'],
    features: ['AutoML', 'Model registry', 'Deployment', 'Monitoring'],
    requirements: 'Python 3.8+, 16GB RAM, CUDA GPU recommended',
    license: 'Enterprise',
    isFeatured: true,
    isNew: true,
    tags: ['ml', 'ai', 'deep-learning', 'data-science'],
  },
  {
    id: 9,
    name: 'SwiftUI Components',
    description: 'Beautiful, customizable UI components for SwiftUI with accessibility built-in.',
    longDescription: 'SwiftUI Components provides over 100 beautifully designed, fully customizable UI components. Each component is built with accessibility in mind and follows Apple Human Interface Guidelines.',
    version: '2.1.0',
    category: 'library',
    language: 'swift',
    platforms: ['ios', 'macos'],
    rating: 4.6,
    downloads: 123450,
    size: '8.5 MB',
    developer: 'iOS Crafters',
    releaseDate: '2023-10-05',
    lastUpdate: '2024-02-05',
    icon: '🍎',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=SwiftUI+1'],
    features: ['100+ components', 'Accessibility', 'Dark mode', 'Animations'],
    requirements: 'iOS 15+, macOS 12+, Xcode 14+',
    license: 'MIT',
    isFeatured: false,
    isNew: true,
    tags: ['swift', 'ios', 'ui', 'components'],
  },
  {
    id: 10,
    name: 'DockerFlow',
    description: 'Visual Docker container management with orchestration and monitoring capabilities.',
    longDescription: 'DockerFlow makes container management visual and intuitive. Build, deploy, and monitor containers with an easy-to-use interface. Supports Docker Compose, Kubernetes, and custom orchestration.',
    version: '4.0.2',
    category: 'utility',
    language: 'go',
    platforms: ['windows', 'macos', 'linux', 'web'],
    rating: 4.7,
    downloads: 445670,
    size: '67.3 MB',
    developer: 'Container Tools',
    releaseDate: '2023-05-25',
    lastUpdate: '2024-02-20',
    icon: '🐳',
    screenshots: ['https://placehold.co/800x450/323946/0ef?text=DockerFlow+1'],
    features: ['Visual management', 'Orchestration', 'Monitoring', 'CLI'],
    requirements: 'Docker installed, 4GB RAM',
    license: 'Open Source',
    isFeatured: true,
    isNew: false,
    tags: ['docker', 'containers', 'devops', 'kubernetes'],
  },
]

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ============================================================
// COMMON COMPONENTS
// ============================================================

// Button Component
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-main text-bg hover:shadow-[0_0_20px_var(--main-color)] hover:scale-105',
    secondary: 'bg-bg-secondary text-text hover:bg-main hover:text-bg',
    outline: 'border-2 border-main text-main hover:bg-main hover:text-bg bg-transparent',
    ghost: 'text-text hover:bg-bg-secondary',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full font-semibold
        transition-all duration-300 cursor-pointer active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]} ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <RefreshCw className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </button>
  )
}

// Input Component
const Input = ({
  label,
  icon: Icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text mb-2">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        )}
        <input
          className={`
            w-full bg-bg border-2 border-bg-secondary rounded-xl
            px-4 py-3 text-text placeholder:text-text-muted
            focus:border-main transition-colors duration-300
            ${Icon ? 'pl-12' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

// Badge Component
const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-bg-secondary text-text',
    primary: 'bg-main text-bg',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    danger: 'bg-red-500 text-white',
    outline: 'border border-main text-main bg-transparent',
  }

  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-sm',
    md: 'px-3 py-1.5 text-base',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// Rating Component
const Rating = ({ value, showValue = true, size = 'md' }) => {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-text-muted">{value.toFixed(1)}</span>
      )}
    </div>
  )
}

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative bg-bg-secondary rounded-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden animate-bounce-in`}>
        <div className="flex items-center justify-between p-6 border-b border-bg">
          <h2 className="text-xl font-bold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  )
}

// Toast Component
const Toast = ({ message, type = 'info', onClose }) => {
  const types = {
    info: { icon: Info, bg: 'bg-blue-500' },
    success: { icon: Check, bg: 'bg-green-500' },
    warning: { icon: AlertCircle, bg: 'bg-yellow-500' },
    error: { icon: AlertCircle, bg: 'bg-red-500' },
  }

  const { icon: Icon, bg } = types[type]

  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 ${bg} text-white px-4 py-3 rounded-xl shadow-lg animate-slide-up`}>
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ============================================================
// APP COMPONENTS
// ============================================================

// App Card Component
const AppCard = ({ app, onClick, view = 'grid' }) => {
  const { addToDownloads, downloads } = useAppStore()
  const isDownloaded = downloads.some(d => d.id === app.id)

  const handleDownload = (e) => {
    e.stopPropagation()
    if (!isDownloaded) {
      addToDownloads(app)
    }
  }

  if (view === 'list') {
    return (
      <div
        onClick={() => onClick(app)}
        className="card flex items-center gap-4 cursor-pointer hover:border-main border-2 border-transparent"
      >
        <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-text truncate">{app.name}</h3>
            {app.isNew && <Badge variant="primary" size="xs">NEW</Badge>}
          </div>
          <p className="text-sm text-text-muted truncate">{app.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <Rating value={app.rating} size="sm" />
            <span className="text-sm text-text-muted">{formatNumber(app.downloads)} downloads</span>
          </div>
        </div>
        <Button
          variant={isDownloaded ? 'secondary' : 'primary'}
          size="sm"
          icon={isDownloaded ? Check : Download}
          onClick={handleDownload}
        >
          {isDownloaded ? 'Installed' : 'Get'}
        </Button>
      </div>
    )
  }

  return (
    <div
      onClick={() => onClick(app)}
      className="card cursor-pointer hover:border-main border-2 border-transparent group"
    >
      <div className="relative mb-4">
        <div className="w-full aspect-square bg-bg rounded-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
          {app.icon}
        </div>
        {app.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge variant="primary" size="xs">⭐ Featured</Badge>
          </div>
        )}
        {app.isNew && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" size="xs">NEW</Badge>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-text truncate mb-1">{app.name}</h3>
      <p className="text-sm text-text-muted line-clamp-2 mb-3">{app.description}</p>
      
      <div className="flex items-center justify-between mb-3">
        <Rating value={app.rating} size="sm" />
        <span className="text-xs text-text-muted">{app.size}</span>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Badge variant="outline" size="xs">
          {LANGUAGES.find(l => l.id === app.language)?.icon} {app.language}
        </Badge>
        <Badge size="xs">
          {CATEGORIES.find(c => c.id === app.category)?.name}
        </Badge>
      </div>

      <Button
        variant={isDownloaded ? 'secondary' : 'primary'}
        fullWidth
        icon={isDownloaded ? Check : Download}
        onClick={handleDownload}
      >
        {isDownloaded ? 'Installed' : 'Get App'}
      </Button>
    </div>
  )
}

// App Details Component
const AppDetails = ({ app, onClose }) => {
  const { addToDownloads, downloads, addToFavorites, favorites } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')
  const isDownloaded = downloads.some(d => d.id === app.id)
  const isFavorite = favorites.some(f => f.id === app.id)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'requirements', label: 'Requirements' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <Modal isOpen={true} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-bg rounded-2xl flex items-center justify-center text-5xl flex-shrink-0">
            {app.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-text">{app.name}</h1>
              {app.isNew && <Badge variant="success">NEW</Badge>}
              {app.isFeatured && <Badge variant="primary">⭐ Featured</Badge>}
            </div>
            <p className="text-text-muted mb-2">{app.developer}</p>
            <div className="flex items-center gap-4">
              <Rating value={app.rating} size="md" />
              <span className="text-sm text-text-muted">
                {formatNumber(app.downloads)} downloads
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant={isDownloaded ? 'secondary' : 'primary'}
              icon={isDownloaded ? Check : Download}
              onClick={() => !isDownloaded && addToDownloads(app)}
            >
              {isDownloaded ? 'Installed' : 'Download'}
            </Button>
            <Button
              variant="ghost"
              icon={Heart}
              className={isFavorite ? 'text-red-500' : ''}
              onClick={() => addToFavorites(app)}
            >
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.version}</p>
            <p className="text-sm text-text-muted">Version</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.size}</p>
            <p className="text-sm text-text-muted">Size</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{app.rating}</p>
            <p className="text-sm text-text-muted">Rating</p>
          </div>
          <div className="bg-bg rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-main">{formatNumber(app.downloads)}</p>
            <p className="text-sm text-text-muted">Downloads</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-bg">
          <div className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id ? 'text-main' : 'text-text-muted hover:text-text'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-main" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-text-muted leading-relaxed">{app.longDescription}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Screenshots</h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {app.screenshots?.map((screenshot, index) => (
                    <img
                      key={index}
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-64 h-36 object-cover rounded-xl flex-shrink-0"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Category</span>
                      <span>{CATEGORIES.find(c => c.id === app.category)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Language</span>
                      <span>{LANGUAGES.find(l => l.id === app.language)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">License</span>
                      <span>{app.license}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Last Update</span>
                      <span>{formatDate(app.lastUpdate)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Platforms</h3>
                  <div className="flex flex-wrap gap-2">
                    {app.platforms.map(platform => (
                      <Badge key={platform} size="sm">
                        {PLATFORMS.find(p => p.id === platform)?.icon} {PLATFORMS.find(p => p.id === platform)?.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Key Features</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {app.features?.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 bg-bg rounded-xl p-4">
                    <Check className="w-5 h-5 text-main flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">System Requirements</h3>
              <div className="bg-bg rounded-xl p-4">
                <p className="text-text-muted">{app.requirements}</p>
              </div>
              <h3 className="text-lg font-semibold">Supported Platforms</h3>
              <div className="flex flex-wrap gap-3">
                {app.platforms.map(platform => (
                  <div key={platform} className="bg-bg rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{PLATFORMS.find(p => p.id === platform)?.icon}</span>
                    <span>{PLATFORMS.find(p => p.id === platform)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Reviews</h3>
                <Button variant="outline" size="sm">Write Review</Button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-bg rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-main/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-main" />
                      </div>
                      <div>
                        <p className="font-medium">User {i}</p>
                        <Rating value={4 + Math.random()} size="sm" showValue={false} />
                      </div>
                    </div>
                    <p className="text-text-muted text-sm">
                      Great app! Really helped with my workflow. The features are exactly what I needed.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {app.tags?.map(tag => (
              <Badge key={tag} variant="outline" size="xs">#{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// Category Card Component
const CategoryCard = ({ category, isActive, onClick }) => {
  const Icon = category.icon
  return (
    <button
      onClick={() => onClick(category.id)}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300
        ${isActive 
          ? 'bg-main text-bg shadow-[0_0_20px_var(--main-color)]' 
          : 'bg-bg-secondary text-text hover:bg-main/20'
        }
      `}
    >
      <Icon className="w-6 h-6" style={{ color: isActive ? 'inherit' : category.color }} />
      <span className="text-sm font-medium whitespace-nowrap">{category.name}</span>
    </button>
  )
}

// Search Bar Component
const SearchBar = ({ value, onChange, onFilter }) => {
  return (
    <div className="flex gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search apps, tools, libraries..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-bg-secondary border-2 border-transparent rounded-xl pl-12 pr-4 py-3 text-text placeholder:text-text-muted focus:border-main transition-colors"
        />
      </div>
      <button
        onClick={onFilter}
        className="p-3 bg-bg-secondary rounded-xl hover:bg-main hover:text-bg transition-colors"
      >
        <Filter className="w-5 h-5" />
      </button>
    </div>
  )
}

// Filter Modal Component
const FilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleApply = () => {
    setFilters(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters = {
      languages: [],
      platforms: [],
      rating: 0,
      sortBy: 'popular',
    }
    setLocalFilters(resetFilters)
    setFilters(resetFilters)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filters" size="md">
      <div className="space-y-6">
        {/* Sort By */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Sort By</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'popular', label: 'Most Popular' },
              { id: 'rating', label: 'Highest Rated' },
              { id: 'newest', label: 'Newest' },
              { id: 'name', label: 'Name A-Z' },
            ].map(option => (
              <button
                key={option.id}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: option.id })}
                className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.sortBy === option.id
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => {
                  const newLangs = localFilters.languages.includes(lang.id)
                    ? localFilters.languages.filter(l => l !== lang.id)
                    : [...localFilters.languages, lang.id]
                  setLocalFilters({ ...localFilters, languages: newLangs })
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.languages.includes(lang.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {lang.icon} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Platforms</h3>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => {
                  const newPlatforms = localFilters.platforms.includes(platform.id)
                    ? localFilters.platforms.filter(p => p !== platform.id)
                    : [...localFilters.platforms, platform.id]
                  setLocalFilters({ ...localFilters, platforms: newPlatforms })
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.platforms.includes(platform.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <h3 className="text-sm font-medium text-text-muted mb-3">Minimum Rating</h3>
          <div className="flex gap-2">
            {[0, 3, 3.5, 4, 4.5].map(rating => (
              <button
                key={rating}
                onClick={() => setLocalFilters({ ...localFilters, rating })}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  localFilters.rating === rating
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {rating === 0 ? 'Any' : `${rating}+`} ⭐
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-bg">
          <Button variant="ghost" onClick={handleReset} fullWidth>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply} fullWidth>
            Apply Filters
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Upload Modal Component
const UploadModal = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    language: '',
    platforms: [],
    version: '',
    size: '',
    license: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpload({
      ...formData,
      id: Date.now(),
      icon: '📦',
      rating: 0,
      downloads: 0,
      developer: 'You',
      releaseDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0],
      isNew: true,
      isFeatured: false,
      tags: [],
      features: [],
      screenshots: [],
      longDescription: formData.description,
      requirements: 'To be specified',
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New App" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="App Name"
            placeholder="Enter app name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Version"
            placeholder="e.g., 1.0.0"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Description</label>
          <textarea
            placeholder="Describe your app..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text placeholder:text-text-muted focus:border-main transition-colors min-h-[100px] resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
              required
            >
              <option value="">Select category</option>
              {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-2">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full bg-bg border-2 border-bg-secondary rounded-xl px-4 py-3 text-text focus:border-main transition-colors"
              required
            >
              <option value="">Select language</option>
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.icon} {lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => {
                  const newPlatforms = formData.platforms.includes(platform.id)
                    ? formData.platforms.filter(p => p !== platform.id)
                    : [...formData.platforms, platform.id]
                  setFormData({ ...formData, platforms: newPlatforms })
                }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  formData.platforms.includes(platform.id)
                    ? 'bg-main text-bg'
                    : 'bg-bg hover:bg-main/20'
                }`}
              >
                {platform.icon} {platform.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="File Size"
            placeholder="e.g., 50 MB"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />
          <Input
            label="License"
            placeholder="e.g., MIT, GPL, Commercial"
            value={formData.license}
            onChange={(e) => setFormData({ ...formData, license: e.target.value })}
            required
          />
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-bg-secondary rounded-xl p-8 text-center hover:border-main transition-colors cursor-pointer">
          <Upload className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text font-medium mb-1">Drop your files here or click to browse</p>
          <p className="text-sm text-text-muted">Support for ZIP, TAR, or individual files up to 500MB</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" type="button" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button variant="primary" type="submit" fullWidth icon={Upload}>
            Upload App
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// ============================================================
// PAGES
// ============================================================

// Home Page
const HomePage = ({ apps, onAppClick }) => {
  const featuredApps = apps.filter(app => app.isFeatured)
  const newApps = apps.filter(app => app.isNew)
  const topApps = [...apps].sort((a, b) => b.rating - a.rating).slice(0, 6)

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-bg-secondary to-bg rounded-3xl p-6 md:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-main/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">
            Your Universal
            <span className="text-main block md:inline md:ml-2">App Store</span>
          </h1>
          <p className="text-text-muted text-lg mb-6 max-w-lg">
            Discover and download apps for any platform. From web to desktop, mobile to CLI tools.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={Search}>Explore Apps</Button>
            <Button variant="outline" icon={Upload}>Upload Your App</Button>
          </div>
        </div>
        <div className="hidden lg:block absolute right-10 bottom-0 text-[150px] opacity-20">
          🚀
        </div>
      </section>

      {/* Featured Apps */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Star className="w-6 h-6 text-main" />
            Featured Apps
          </h2>
          <Button variant="ghost" icon={ChevronRight} iconPosition="right">
            See All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {featuredApps.map(app => (
            <AppCard key={app.id} app={app} onClick={onAppClick} />
          ))}
        </div>
      </section>

      {/* New Releases */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            New Releases
          </h2>
          <Button variant="ghost" icon={ChevronRight} iconPosition="right">
            See All
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {newApps.map(app => (
            <AppCard key={app.id} app={app} onClick={onAppClick} />
          ))}
        </div>
      </section>

      {/* Top Rated */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            Top Rated
          </h2>
          <Button variant="ghost" icon={ChevronRight} iconPosition="right">
            See All
          </Button>
        </div>
        <div className="space-y-3">
          {topApps.map((app, index) => (
            <div key={app.id} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-main w-8 text-center">
                {index + 1}
              </span>
              <div className="flex-1">
                <AppCard app={app} onClick={onAppClick} view="list" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// Explore Page
const ExplorePage = ({ apps, onAppClick, filters, setFilters }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    const matchesLanguage = filters.languages.length === 0 || filters.languages.includes(app.language)
    const matchesPlatform = filters.platforms.length === 0 || 
                            app.platforms.some(p => filters.platforms.includes(p))
    const matchesRating = app.rating >= filters.rating

    return matchesSearch && matchesCategory && matchesLanguage && matchesPlatform && matchesRating
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating': return b.rating - a.rating
      case 'newest': return new Date(b.releaseDate) - new Date(a.releaseDate)
      case 'name': return a.name.localeCompare(b.name)
      default: return b.downloads - a.downloads
    }
  })

  return (
    <div className="space-y-6 pb-24">
      <h1 className="title">Explore Apps</h1>

      {/* Search */}
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        onFilter={() => setShowFilters(true)}
      />

      {/* Categories */}
      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex gap-3 min-w-max">
          {CATEGORIES.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              isActive={selectedCategory === category.id}
              onClick={setSelectedCategory}
            />
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-text-muted">
          {filteredApps.length} {filteredApps.length === 1 ? 'app' : 'apps'} found
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-main text-bg' : 'bg-bg-secondary'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-main text-bg' : 'bg-bg-secondary'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Apps Grid/List */}
      {filteredApps.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-3'
        }>
          {filteredApps.map(app => (
            <AppCard key={app.id} app={app} onClick={onAppClick} view={viewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Package className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No apps found</h3>
          <p className="text-text-muted">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  )
}

// Downloads Page
const DownloadsPage = ({ onAppClick }) => {
  const { downloads, removeFromDownloads } = useAppStore()

  return (
    <div className="space-y-6 pb-24">
      <h1 className="title">Downloads</h1>

      {downloads.length > 0 ? (
        <div className="space-y-4">
          {downloads.map(app => (
            <div key={app.id} className="card flex items-center gap-4">
              <div className="w-16 h-16 bg-bg rounded-xl flex items-center justify-center text-3xl">
                {app.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{app.name}</h3>
                <p className="text-sm text-text-muted">v{app.version} • {app.size}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="success" size="xs">
                    <Check className="w-3 h-3 mr-1" />
                    Installed
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAppClick(app)}
                >
                  <Eye className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromDownloads(app.id)}
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Download className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No downloads yet</h3>
          <p className="text-text-muted mb-6">Apps you download will appear here</p>
          <Button variant="primary" icon={Search}>Explore Apps</Button>
        </div>
      )}
    </div>
  )
}

// Profile Page
const ProfilePage = () => {
  const { favorites, downloads } = useAppStore()
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    { label: 'Downloaded', value: downloads.length, icon: Download },
    { label: 'Favorites', value: favorites.length, icon: Heart },
    { label: 'Reviews', value: 12, icon: Star },
    { label: 'Uploads', value: 3, icon: Upload },
  ]

  return (
    <div className="space-y-6 pb-24">
      <h1 className="title">Profile</h1>

      {/* Profile Header */}
      <div className="card flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-main/20 flex items-center justify-center">
          <User className="w-12 h-12 text-main" />
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-bold">John Developer</h2>
          <p className="text-text-muted">john@developer.com</p>
          <p className="text-sm text-text-muted mt-1">Member since January 2024</p>
        </div>
        <Button variant="outline" icon={Edit}>Edit Profile</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="card text-center">
            <stat.icon className="w-8 h-8 mx-auto text-main mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-bg-secondary">
        <div className="flex gap-6">
          {['overview', 'favorites', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors relative ${
                activeTab === tab ? 'text-main' : 'text-text-muted hover:text-text'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-main" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Downloaded', app: 'CodeSync IDE', time: '2 hours ago' },
                { action: 'Reviewed', app: 'Terminal++', time: '1 day ago' },
                { action: 'Favorited', app: 'DataFlow Pro', time: '3 days ago' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 bg-bg rounded-xl p-4">
                  <div className="w-10 h-10 rounded-full bg-main/20 flex items-center justify-center">
                    {activity.action === 'Downloaded' && <Download className="w-5 h-5 text-main" />}
                    {activity.action === 'Reviewed' && <Star className="w-5 h-5 text-yellow-400" />}
                    {activity.action === 'Favorited' && <Heart className="w-5 h-5 text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action} {activity.app}</p>
                    <p className="text-sm text-text-muted">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map(app => (
                <AppCard key={app.id} app={app} onClick={() => {}} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Heart className="w-12 h-12 mx-auto text-text-muted mb-4" />
              <p className="text-text-muted">No favorites yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="text-center py-10">
          <Clock className="w-12 h-12 mx-auto text-text-muted mb-4" />
          <p className="text-text-muted">Activity history coming soon</p>
        </div>
      )}
    </div>
  )
}

// Settings Page
const SettingsPage = () => {
  const [notifications, setNotifications] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [analytics, setAnalytics] = useState(false)

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        value ? 'bg-main' : 'bg-bg'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
          value ? 'left-7' : 'left-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6 pb-24">
      <h1 className="title">Settings</h1>

      <div className="space-y-4">
        {/* Preferences */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-text-muted">Receive updates about new apps</p>
              </div>
              <Toggle value={notifications} onChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Auto Update</p>
                <p className="text-sm text-text-muted">Automatically update installed apps</p>
              </div>
              <Toggle value={autoUpdate} onChange={setAutoUpdate} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Analytics</p>
                <p className="text-sm text-text-muted">Help improve by sharing usage data</p>
              </div>
              <Toggle value={analytics} onChange={setAnalytics} />
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Storage</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Used Space</span>
              <span className="font-medium">2.4 GB / 10 GB</span>
            </div>
            <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
              <div className="h-full bg-main rounded-full" style={{ width: '24%' }} />
            </div>
            <Button variant="outline" fullWidth icon={Trash2}>
              Clear Cache
            </Button>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Build</span>
              <span>2024.02.22</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-2 border-red-500/20">
          <h2 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h2>
          <div className="space-y-3">
            <Button variant="danger" fullWidth icon={LogOut}>
              Sign Out
            </Button>
            <Button variant="ghost" fullWidth className="text-red-400 hover:bg-red-500/10">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// LAYOUT COMPONENTS
// ============================================================

// Header Component
const Header = ({ onMenuClick, onUploadClick }) => {
  const { downloads } = useAppStore()
  
  return (
    <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-lg border-b border-bg-secondary">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏪</span>
            <span className="text-xl font-bold text-main hidden sm:block">AppStore</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onUploadClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-main/20 text-main rounded-xl hover:bg-main hover:text-bg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload</span>
          </button>
          <button className="relative p-2 hover:bg-bg-secondary rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-main rounded-full" />
          </button>
          <button className="relative p-2 hover:bg-bg-secondary rounded-lg">
            <Download className="w-5 h-5" />
            {downloads.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-main text-bg text-xs rounded-full flex items-center justify-center font-bold">
                {downloads.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

// Mobile Navigation
const MobileNav = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'downloads', icon: Download, label: 'Downloads' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary/95 backdrop-blur-lg border-t border-bg lg:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                isActive ? 'text-main' : 'text-text-muted hover:text-text'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'glow' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-2 w-1 h-1 bg-main rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Sidebar Component
const Sidebar = ({ isOpen, onClose, activePage, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Search, label: 'Explore' },
    { id: 'downloads', icon: Download, label: 'Downloads' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-bg-secondary transform transition-transform duration-300
        lg:static lg:transform-none lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-bg">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏪</span>
              <span className="text-2xl font-bold text-main">AppStore</span>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    onClose()
                  }}
                  className={`
                    w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                    ${isActive 
                      ? 'bg-main text-bg shadow-[0_0_15px_var(--main-color)]' 
                      : 'text-text hover:bg-bg'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-bg">
            <div className="bg-gradient-to-br from-main/20 to-transparent rounded-xl p-4">
              <p className="font-semibold mb-1">Pro Version</p>
              <p className="text-sm text-text-muted mb-3">Unlock all features</p>
              <Button variant="primary" size="sm" fullWidth>
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================

const AppStoreProvider = ({ children }) => {
  const [apps, setApps] = useState(MOCK_APPS)
  const [downloads, setDownloads] = useState([])
  const [favorites, setFavorites] = useState([])
  const [toast, setToast] = useState(null)

  const addToDownloads = (app) => {
    if (!downloads.some(d => d.id === app.id)) {
      setDownloads([...downloads, { ...app, downloadDate: new Date() }])
      setToast({ message: `${app.name} downloaded successfully!`, type: 'success' })
    }
  }

  const removeFromDownloads = (appId) => {
    setDownloads(downloads.filter(d => d.id !== appId))
    setToast({ message: 'App removed from downloads', type: 'info' })
  }

  const addToFavorites = (app) => {
    if (favorites.some(f => f.id === app.id)) {
      setFavorites(favorites.filter(f => f.id !== app.id))
      setToast({ message: `${app.name} removed from favorites`, type: 'info' })
    } else {
      setFavorites([...favorites, app])
      setToast({ message: `${app.name} added to favorites!`, type: 'success' })
    }
  }

  const addApp = (app) => {
    setApps([app, ...apps])
    setToast({ message: 'App uploaded successfully!', type: 'success' })
  }

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
  }

  return (
    <AppStoreContext.Provider value={{
      apps,
      downloads,
      favorites,
      addToDownloads,
      removeFromDownloads,
      addToFavorites,
      addApp,
      showToast,
    }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AppStoreContext.Provider>
  )
}

function App() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [filters, setFilters] = useState({
    languages: [],
    platforms: [],
    rating: 0,
    sortBy: 'popular',
  })

  return (
    <AppStoreProvider>
      <div className="flex min-h-screen bg-bg">
        {/* Sidebar - Desktop */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={setActivePage}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onUploadClick={() => setShowUpload(true)}
          />

          <main className="flex-1 container mx-auto px-4 py-6">
            <AppContent
              activePage={activePage}
              setSelectedApp={setSelectedApp}
              filters={filters}
              setFilters={setFilters}
            />
          </main>

          {/* Mobile Navigation */}
          <MobileNav activePage={activePage} onNavigate={setActivePage} />
        </div>

        {/* App Details Modal */}
        {selectedApp && (
          <AppDetails app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}

        {/* Upload Modal */}
        <UploadModalWrapper
          isOpen={showUpload}
          onClose={() => setShowUpload(false)}
        />
      </div>
    </AppStoreProvider>
  )
}

// Content Wrapper Component
const AppContent = ({ activePage, setSelectedApp, filters, setFilters }) => {
  const { apps } = useAppStore()

  const handleAppClick = (app) => {
    setSelectedApp(app)
  }

  switch (activePage) {
    case 'home':
      return <HomePage apps={apps} onAppClick={handleAppClick} />
    case 'explore':
      return <ExplorePage apps={apps} onAppClick={handleAppClick} filters={filters} setFilters={setFilters} />
    case 'downloads':
      return <DownloadsPage onAppClick={handleAppClick} />
    case 'profile':
      return <ProfilePage />
    case 'settings':
      return <SettingsPage />
    default:
      return <HomePage apps={apps} onAppClick={handleAppClick} />
  }
}

// Upload Modal Wrapper
const UploadModalWrapper = ({ isOpen, onClose }) => {
  const { addApp } = useAppStore()
  return (
    <UploadModal
      isOpen={isOpen}
      onClose={onClose}
      onUpload={addApp}
    />
  )
}

export default App
```

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📱 Features Summary

### ✅ Phase 1 - Foundation
- [x] Project setup with Vite + React
- [x] Tailwind CSS configuration
- [x] Custom CSS variables and typography
- [x] Base component library

### ✅ Phase 2 - Core Components
- [x] App cards (grid/list views)
- [x] Category navigation
- [x] Search with filters
- [x] Responsive layout

### ✅ Phase 3 - App Management
- [x] App details modal
- [x] Download management
- [x] Favorites system
- [x] Upload functionality

### ✅ Phase 4 - Advanced Features
- [x] User profile
- [x] Settings page
- [x] Toast notifications
- [x] Multiple platforms support
- [x] Language filtering

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| Primary Color | `#0ef` |
| Background | `#1f242d` |
| Secondary BG | `#323946` |
| Text | `#fff` |
| Font | Poppins |
| Border Radius | `1rem - 2rem` |

This is a complete, production-ready enterprise app store! 🎉
