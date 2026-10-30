# Joof Personal App — Design Specification

**Date:** 2026-10-30  
**Project:** Joof Personal App (Health & Food Intake Tracker)  
**Location:** `c:\Users\techd\Documents\Joof Coding\joof personal app`  
**Status:** Approved by User (Ready for Implementation Planning)

---

## 1. Intent and The Why

The goal of **Joof Personal App** is to provide a clean, distraction-free, aesthetically pleasing personal health and nutrition tracker. Commercial apps (like MyFitnessPal or Noom) are often cluttered with advertisements, subscription paywalls, and slow search interfaces. Joof Personal App provides a lightning-fast, privacy-first tool to measure food portions accurately, track daily caloric and macronutrient intake, and compare consumption against scientifically calibrated targets based on Body Mass Index (BMI) and metabolic expenditure.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Visual Design Excellence:** Replicate the warm, elegant pastel card UI inspired by the user's reference design (Dribbble Diet App), featuring soft rounded cards, clear typography, and color-coded status tiles.
- **Calorie & Food Measurer:** Allow users to measure food portions by exact kitchen scale weight (grams) or convenient household units (servings, cups, pieces, scoops), dynamically computing calories, protein, carbohydrates, and fats.
- **BMI & Energy Calibration:** Collect user profile attributes (height, weight, age, biological sex, activity level) to calculate BMI category and Basal Metabolic Rate (BMR/TDEE). Provide recommended daily caloric allowance.
- **Full Intake Customization (Option C):** Present the scientific BMI/TDEE targets while allowing the user to customize their daily calorie and macro goals (e.g., set deficit for weight loss, maintenance, or surplus for muscle gain).
- **Strict Bonus Deficit Engine:** Exercise calories are counted as a **bonus deficit** and are *never* added back to the eating allowance, preserving the integrity of fat loss and fitness progress.
- **Dual External Food Database Querying:**
  - **USDA FoodData Central API (Primary):** Query verified scientific nutrient data for whole foods, cooked meats, produce, grains, and kitchen staples.
  - **Open Food Facts API (Secondary):** Query over 4.8 million packaged goods, branded items, and barcode lookups.
- **Offline-First & Privacy:** Store all user profiles, daily meal logs, weight history, and cached foods locally in browser storage (IndexedDB / localStorage). No login, no accounts, and works offline.
- **PWA Capabilities:** Responsive across mobile and desktop with install-to-homescreen capability.

### Non-Goals (v1)
- Multi-user authentication, cloud server syncing, or social feeds.
- Complex paid meal delivery integrations or third-party ads.
- Bluetooth scale hardware drivers (manual weight entry is used).
- Full exercise catalog database (activity is tracked via quick manual calorie/activity entry).

### Anti-Goals
- Clunky or slow interfaces: search results must be snappy, with cached responses and optimistic UI updates.
- Network dependency for core functionality: viewing daily intake, logged meals, and past days must never fail if the device is offline.
- Diluting fitness progress by allowing exercise "eat-back" that negates the user's calorie deficit.

---

## 3. User Experience & Layout Architecture

### 3.1. Main Dashboard (`/`)
- **Header:** Personalized greeting ("Good morning, Joof 🌞"), current date selector with day-switching strip.
- **BMI Status Banner:** Displays calculated BMI, healthy weight bracket, and the daily calibrated target calorie allowance.
- **2x2 Core Metric Tiles:**
  - **Calories (Green `#EDF7EC` / `#2C6E26`):** Consumed calories vs. daily target allowance (`Remaining = Target - Consumed`), circular/linear progress bar.
  - **Water (Blue `#EBF5FB` / `#1A5276`):** Current intake in ml vs. daily goal (e.g. 2100 ml / 3.0L) with quick +250ml glass buttons.
  - **Weight (Yellow `#FEF9E7` / `#7D6608`):** Current weight in kg/lbs, target weight, and recent delta. Tap tile to quick-log new weight.
  - **Activity / Burned (Coral/Pink `#FCE8EF` / `#782845`):** Active calories burned from exercise/walking, tracked strictly as a bonus deficit. Tap tile to quick-log burned calories and optional activity note.
- **Today's Meals Section:**
  - Structured buckets: **Breakfast**, **Lunch**, **Dinner**, **Snacks**.
  - Per-meal summaries: Total calories and macronutrient breakdown (Protein, Carbs, Fat).
  - Expandable food items list showing exact time logged and portion weight.
  - "+ Add Food" button launching the Food Measurer modal.
- **Floating Bottom Navigation Bar:**
  - Dashboard (Home)
  - Food Measurer / Logger
  - Analytics & BMI Insights
  - Settings / Profile Setup

### 3.2. Food & Calorie Measurer (Modal / Dedicated Screen)
- **Search Bar:** Debounced live search querying USDA FoodData Central and Open Food Facts with a toggle/filter for Whole Foods vs. Packaged Items.
- **Food Detail & Measurement Controls:**
  - Selected food display with base nutrition per 100g.
  - **Measurement Input:**
    - Slider and numeric input for exact grams (0–1000g).
    - Quick-unit buttons: "100g standard", "1 serving", "1/2 cup", "1 piece".
  - **Dynamic Nutrient Preview:** Live calculation of Calories, Protein (g), Carbohydrates (g), Total Fat (g), and Fiber (g) based on the adjusted portion.
  - **Daily Impact Indicator:** Visual preview showing how this portion will impact the remaining daily calorie allowance.
  - **Meal Selector:** Pick which meal slot to log to (Breakfast, Lunch, Dinner, Snack).
  - "Add to Meal" confirmation button with instant local persistence.
- **Custom Food Creator:** Simple form to manually input any custom food (Name, Brand/Notes, Calories, Protein, Carbs, Fat per serving or per 100g).

### 3.3. BMI & Profile Settings
- **Inputs:** Height (cm or ft/in), Current Weight (kg or lbs), Age, Biological Sex, Activity Level (Sedentary, Light, Moderate, Very Active).
- **Calculations:**
  - **BMI Formula:** $\text{BMI} = \frac{\text{weight (kg)}}{\text{height (m)}^2}$
  - **Classification:** Underweight (<18.5), Normal (18.5–24.9), Overweight (25–29.9), Obese (≥30).
  - **BMR (Mifflin-St Jeor Formula):**
    - Men: $\text{BMR} = 10 \times \text{weight(kg)} + 6.25 \times \text{height(cm)} - 5 \times \text{age} + 5$
    - Women: $\text{BMR} = 10 \times \text{weight(kg)} + 6.25 \times \text{height(cm)} - 5 \times \text{age} - 161$
  - **TDEE (Total Daily Energy Expenditure):** $\text{BMR} \times \text{Activity Multiplier}$.
  - **Goal Adjustment:** Maintenance (TDEE), Mild Loss (-300 kcal), Standard Loss (-500 kcal), Mild Gain (+300 kcal), or Custom Manual Calorie Target.

### 3.4. Analytics & BMI Insights (Matching Dribbble Screen 3)
- **7-Day Calorie & Macro Trend Chart:** Smooth multi-line curved area chart showing Calories, Carbs, Protein, and Fat over the past 7 days against target lines.
- **Macro Distribution Bars:** Today's macro completion percentages (e.g. Calories 90%, Carbs 45%, Protein 80%, Fat 65%).
- **Weight Trajectory:** Weight log points plotted over time alongside the target weight goal line.
- **BMI Bracket Summary:** Visual scale showing current position in BMI range and progress toward the healthy boundary.

### 3.5. Quick Logging for Tiles
- **Weight Tile:** Tapping opens a quick prompt to enter today's weigh-in (e.g. 72.3 kg) which updates the profile and saves a timestamped history point.
- **Activity Tile:** Tapping opens a quick prompt to enter active calories burned (e.g. 350 kcal) with an optional note ("30m jog").

---

## 4. Technical Architecture

### 4.1. Technology Stack
- **Framework:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS with custom pastel design tokens matching the Dribbble design system.
- **Icons:** Lucide React.
- **Charts / Visualizations:** Lightweight SVG / Recharts for nutrition breakdown arcs and weekly progress.
- **PWA Setup:** `vite-plugin-pwa` with web manifest and service worker caching.
- **Local Persistence:** LocalStorage / IndexedDB via a lightweight repository pattern for instant offline-first reads and writes.

### 4.2. API Integration Layer
- **USDA FoodData Central API:**
  - Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search`
  - Authentication: Demo key with user option to provide own API key in settings if desired.
  - Response parsing: Extracts energy (kcal), protein (g), total lipid (fat) (g), carbohydrates (g), fiber (g).
- **Open Food Facts API:**
  - Endpoint: `https://world.openfoodfacts.org/api/v2/search`
  - Headers: Standard compliant application user-agent header.
  - Response parsing: Extracts product name, brand, image thumbnail, energy-kcal_100g, proteins_100g, carbohydrates_100g, fat_100g.
- **Local Food Cache:** Caches search results and recent food picks in IndexedDB to minimize redundant network requests and enable offline re-logging.

---

## 5. What Was Decided by the User vs. Left to Builder

### Decided by User
1. Folder name: `joof personal app`.
2. Core first feature: Calorie/food measurer tracking total intake and proper intake calibrated against BMI.
3. Visual styling: Pastel color scheme, soft rounded cards, 2x2 metric tiles, and layout from the Dribbble Diet/Nutrition App reference.
4. Platform: Modern Web App / PWA (Option A).
5. Intake logic: Full control (Option C: scientific BMI guidance + custom override).
6. Calorie budget engine: Fixed target budget (`Remaining = Target - Consumed`); exercise calories contribute 100% to bonus deficit.
7. External food databases: USDA FoodData Central (primary) + Open Food Facts (secondary).

### Builder Calls & Settle Decisions
1. **Analytics Screen Scope:** Implemented as a 7-day multi-line chart (Calories + Macros) and BMI classification tracker directly modeled on the 3rd Dribbble screen.
2. **Tile Interaction:** Weight and Activity tiles use lightweight quick-tap modals for friction-free logging rather than heavy standalone subsystems.
3. **Starter Foods:** Built-in offline seed library of 25 popular healthy staple foods so the measurer works instantly without needing an initial search.
