# Joof Personal App 🥑

A distraction-free, privacy-first personal health, nutrition, and food intake tracking Progressive Web Application (PWA). Built with React 19, TypeScript, Vite, and Tailwind CSS, featuring a soft pastel card interface inspired by modern diet application designs.

---

## Key Features

- **Precision Food & Calorie Measurer:** Measure intake by exact gram weight with an interactive slider or manual numeric input, quick portion presets (50g, 100g, 150g, 200g), and live-computed macronutrient totals (calories, protein, carbs, fats).
- **Dual External Database Search with Offline Fallback:** Queries USDA FoodData Central and Open Food Facts with automatic 2.5-second timeouts and fallback to a local seed library of 25 staples and cached custom foods.
- **Scientific BMI & Metabolic Calibration:** Mifflin-St Jeor BMR computation, Harris-Benedict TDEE activity multipliers, and standard WHO BMI categorization with healthy target weight brackets.
- **Strict Bonus Deficit Engine:** Active exercise calories contribute 100% to a bonus deficit and are **never** added back to daily eating allowance (`Remaining = Target - Consumed`), preserving weight-loss progression.
- **Pastel Metric Dashboard:** 2x2 metric overview tiles (Calories, Water with +250ml quick-add, Scale Weight, Burned Exercise) and categorized meal logs (Breakfast, Lunch, Dinner, Snacks).
- **7-Day Analytics & Trajectory:** Multi-metric intake charts, macronutrient completion rings, and BMI health trajectory view.
- **Offline-First & PWA-Ready:** Date-partitioned local storage persistence with web manifest support for standalone mobile and desktop home screen installation.

---

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS with custom pastel design system
- **Icons:** Lucide React
- **Charts:** Recharts
- **Testing:** Vitest + React Testing Library + jsdom

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation

```bash
git clone https://github.com/IamJoof/joof-personal-app.git
cd joof-personal-app
npm install
```

### Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run preview
```

---

## Render Deployment

This repository is pre-configured for automated continuous deployment on [Render](https://render.com) as a Static Site.

### Option 1: Automatic Blueprint (Recommended)

1. Connect your GitHub account to [Render](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Select this repository (`joof-personal-app`).
4. Render will automatically detect [`render.yaml`](./render.yaml) and configure the build settings and SPA redirect rules.
5. Click **Apply**.

### Option 2: Manual Static Site Setup

1. In Render Dashboard, click **New +** → **Static Site**.
2. Connect this repository (`joof-personal-app`).
3. Fill in the following settings:
   - **Name:** `joof-personal-app`
   - **Branch:** `main`
   - **Build Command:** `npm install --include=dev && npm run build`
   - **Publish Directory:** `dist`
4. Under **Redirects/Rewrites**, add a rewrite rule:
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
5. Click **Create Static Site**.

---

## License

Private / Personal Project.
