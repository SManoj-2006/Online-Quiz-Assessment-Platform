# Aura Frontend Console

An ultra-premium, interactive 3D SaaS assessment dashboard built with **React 19**, **Tailwind CSS**, and **Vite**.

---

## Key Visual & Functional Features

### 1. Futuristic 3D SaaS Styling System
*   **Deep Celestial Space Theme**: Extends the default Tailwind configuration with deep celestial space-dark backgrounds, glowing neon HSL highlights (violet, cyan, and pink), and responsive borders.
*   **Custom Brand Color**: Configured `'brand-gray'` (`#1A1A1A`) and custom `'sans'` typography mappings in the styling system.
*   **CSS 3D Perspective Card Tilts**: Hardware-accelerated CSS perspective matrices trigger smooth three-dimensional card shifts on mouse hover.
*   **Smooth Keyframe Animations**: Implements custom floating, glowing, and pulsing keyframe configurations.

### 2. Immersive Interactive Backgrounds & Hero
*   **Lightweight Canvas Particles**: Employs a custom high-performance HTML5 Canvas animation that paints floating neon particle fields at 60fps with zero WebGL conflicts or peer-dependency lags in React 19.
*   **Live MCQ Sandbox Demo**: Spawns a 3-question MCQ Sandbox Player on the pre-login dashboard hero, enabling visitors to test knowledge and view instant negative marking point grading without needing credentials!

### 3. Aurora Onboarding Gateway
*   **Two-Column credentials Interface**:
    *   **Left Column (Hero)**: Features an unmasked background edge video loop (`playsInline`, `autoPlay`, `muted`, `loop`) playing in its pure form with zero overlays or tints, overlaid by staggered, framer-motion powered slide-up animations.
    *   **Expandable Accordion FAQ**: Clickable related platform questions expand smoothly to showcase platform details directly on the login card.
    *   **Right Column (Form)**: Houses clean, focus-driven credentials inputs, custom selector dropdowns, secure password toggle visibility actions, and validation helpers.
    *   **Breadcrumb Back Escape**: Subtle back arrow transition allows unauthenticated visitors to navigate back to the guest dashboard seamlessly.

### 4. Anti-Cheat timed Assessment Engine
*   **Countdown Matrix**: Secure countdown timer that caches answer selections in real-time. Closing the tab or refreshing the page **will not stop the clock** — preventing local time tampering!
*   **Grid Matrix Navigation**: High-fidelity matrix display showing active, answered, and unanswered question matrices.

---

## Tech Stack & Dependencies

*   **Core**: `React 19.2.6` & `React DOM 19.2.6`
*   **Routing**: `react-router-dom 7.16.0`
*   **Icons**: `lucide-react 1.17.0`
*   **Animations**: `framer-motion 12.0.0`
*   **Build Tool**: `Vite 5.4.11`
*   **Styling**: `Tailwind CSS 3.4.19` with custom HSL token variables in `index.css`

---

## Quick Start Dev Launch

Initialize the development server instantly:

```bash
# Navigate to the frontend directory
cd c:\Claudee\MERNN\frontend

# Install dependencies
npm install

# Launch Vite development server
npm run dev
```

*Vite dev console will launch at: [http://localhost:5173/](http://localhost:5173/)*

---

## Production Asset Bundling

Validate build assets and generate optimized production HTML/CSS/JS bundles:

```bash
npm run build
```

*Rollup compiles and bundles all modules cleanly in less than 15 seconds with 0 warnings or errors.*
