# Joof Personal App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build "Joof Personal App", a modern pastel-styled PWA for measuring food portions, tracking daily calories and macronutrients, and guiding proper intake calibrated against BMI with a strict bonus deficit model.

**Architecture:** A client-side React 19 + TypeScript + Vite PWA styled with Tailwind CSS. Core domain logic computes BMI, BMR, TDEE, and daily budgets with zero external dependencies; a unified food service queries USDA FoodData Central and Open Food Facts with local offline caching; local state and meal logs persist in browser storage.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts / SVG charts, Vitest, `@testing-library/react`.

**Spec:** `docs/superpowers/specs/2026-10-30-joof-personal-app-design.md`

## Global Constraints

- App directory: `c:\Users\techd\Documents\Joof Coding\joof personal app`
- Framework: React 19 + TypeScript + Vite + Tailwind CSS
- Design Language: Dribbble Diet App pastel cards (`#EDF7EC` green, `#EBF5FB` blue, `#FEF9E7` yellow, `#FCE8EF` coral/pink, rounded corners, soft shadows)
- Calorie Budget Engine: Strict bonus deficit (`Remaining = Target - Consumed`; exercise calories are tracked strictly as a bonus deficit and never added back to food allowance)
- Dual Food APIs: USDA FoodData Central (primary) + Open Food Facts (secondary)
- Offline Resilience: Zero-login, offline-first local persistence with 25 seed healthy foods

## Review Focus

1. **Zero / Negative Portion Inputs:** Food measurer slider or manual gram input set to `0` or negative values must not corrupt calorie math or log zero-calorie ghost meals.
2. **Offline Network Failure during API Search:** When device is offline or API fails, search must fall back immediately to cached and seed foods without breaking the UI.
3. **Calorie Deficit Calculation Integrity:** Logged exercise calories must strictly increase the bonus deficit and never increase the remaining food calorie budget.
4. **Day Rollover / Date Switching:** Viewing meals from previous or future dates must correctly display that date's logs without overwriting today's active progress.
5. **BMI Boundary Values:** Extreme user height/weight inputs (e.g. height 250cm or weight 30kg) must calculate valid numeric BMI and BMR without resulting in `NaN` or infinite numbers.

---

### Task 1: Project Scaffolding, Tailwind Pastel Tokens & Test Harness

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: None
- Produces: Runnable Vite dev server and Vitest test suite with configured Tailwind pastel theme tokens (`pastel-green`, `pastel-blue`, `pastel-yellow`, `pastel-coral`, `pastel-peach`).

- [ ] **Step 1: Create package.json and install dependencies**

Setup `package.json` with React 19, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, Vitest, and `@testing-library/react`. Run `npm install` in `c:\Users\techd\Documents\Joof Coding\joof personal app`.

- [ ] **Step 2: Configure Vite, TypeScript, PostCSS, and Tailwind CSS with pastel tokens**

Write `vite.config.ts` (configured with React and Vitest setup), `tsconfig.json`, `postcss.config.js`, `tailwind.config.js` with the exact Dribbble pastel palette:
```javascript
// tailwind.config.js theme extension
colors: {
  pastel: {
    green: '#EDF7EC',
    greenText: '#2C6E26',
    blue: '#EBF5FB',
    blueText: '#1A5276',
    yellow: '#FEF9E7',
    yellowText: '#7D6608',
    coral: '#FCE8EF',
    coralText: '#782845',
    peach: '#FFF0EC',
    primary: '#E0533C',
    dark: '#1E1E1E'
  }
}
```

- [ ] **Step 3: Write the failing smoke test in `src/App.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Smoke Test', () => {
  it('renders Joof Personal App header', () => {
    render(<App />);
    expect(screen.getByText(/Joof/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test` in the app directory.
Expected: FAIL (App component not yet defined).

- [ ] **Step 5: Implement `src/App.tsx` and `src/main.tsx`**

Provide initial minimal `App.tsx` rendering the header and styled container with Tailwind classes.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.ts tsconfig*.json tailwind.config.js src/
git commit -m "chore: scaffold project with React 19, Tailwind pastel theme, and Vitest"
```

---

### Task 2: Core Domain Logic & Calculations (BMI, BMR, TDEE, Deficit Engine)

**Files:**
- Create: `src/types/health.ts`
- Create: `src/domain/calculator.ts`
- Test: `src/domain/calculator.test.ts`

**Interfaces:**
- Consumes: None
- Produces:
  - `calculateBMI(weightKg: number, heightCm: number): BMICalculation`
  - `calculateBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number`
  - `calculateTDEE(bmr: number, activityLevel: ActivityLevel): number`
  - `calculateCalorieBudget(tdee: number, goal: GoalType, customTarget?: number): CalorieBudget`
  - `calculateBonusDeficit(budget: number, consumed: number, burned: number): DeficitSummary`
  - `calculatePortionNutrition(basePer100g: Nutrition, grams: number): Nutrition`

- [ ] **Step 1: Define types in `src/types/health.ts`**

Define `UserProfile`, `BMICalculation`, `ActivityLevel`, `GoalType`, `Nutrition`, `CalorieBudget`, and `DeficitSummary`.

- [ ] **Step 2: Write failing tests in `src/domain/calculator.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  calculateCalorieBudget,
  calculateBonusDeficit,
  calculatePortionNutrition
} from './calculator';

describe('Calculator Domain Logic', () => {
  it('calculates BMI correctly and categorizes normal weight', () => {
    const res = calculateBMI(70, 175);
    expect(res.bmi).toBeCloseTo(22.86, 1);
    expect(res.category).toBe('Normal');
    expect(res.healthyMinWeight).toBeCloseTo(56.7, 1);
    expect(res.healthyMaxWeight).toBeCloseTo(76.3, 1);
  });

  it('calculates BMR using Mifflin-St Jeor formula for male and female', () => {
    expect(calculateBMR(70, 175, 25, 'male')).toBe(1663.75);
    expect(calculateBMR(60, 165, 25, 'female')).toBe(1345.25);
  });

  it('calculates TDEE using activity multipliers', () => {
    const bmr = 1600;
    expect(calculateTDEE(bmr, 'sedentary')).toBe(1920);
    expect(calculateTDEE(bmr, 'moderate')).toBe(2480);
  });

  it('calculates calorie budget with goal deficits and custom override', () => {
    const tdee = 2200;
    expect(calculateCalorieBudget(tdee, 'maintain').targetCalories).toBe(2200);
    expect(calculateCalorieBudget(tdee, 'mild_loss').targetCalories).toBe(1900);
    expect(calculateCalorieBudget(tdee, 'standard_loss').targetCalories).toBe(1700);
    expect(calculateCalorieBudget(tdee, 'custom', 2050).targetCalories).toBe(2050);
  });

  it('enforces bonus deficit where burned calories do NOT increase food remaining', () => {
    const budget = 2000;
    const consumed = 1400;
    const burned = 400;
    const res = calculateBonusDeficit(budget, consumed, burned);
    expect(res.foodRemaining).toBe(600); // 2000 - 1400
    expect(res.totalDeficit).toBe(1000); // (2000 - 1400) + 400
  });

  it('calculates portion nutrition scaled linearly by grams and handles 0g', () => {
    const per100g = { calories: 200, protein: 20, carbs: 10, fat: 5, fiber: 2 };
    expect(calculatePortionNutrition(per100g, 150)).toEqual({
      calories: 300, protein: 30, carbs: 15, fat: 7.5, fiber: 3
    });
    expect(calculatePortionNutrition(per100g, 0)).toEqual({
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0
    });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test src/domain/calculator.test.ts`
Expected: FAIL (modules not implemented).

- [ ] **Step 4: Implement `src/domain/calculator.ts`**

Implement Mifflin-St Jeor BMR equation, BMI formula, TDEE multiplier, calorie budget selector, bonus deficit tracker, and portion scaler.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/domain/calculator.test.ts`
Expected: PASS (6 tests passing).

- [ ] **Step 6: Commit**

```bash
git add src/types/health.ts src/domain/
git commit -m "feat: implement BMI, BMR, TDEE, and bonus deficit domain calculator"
```

---

### Task 3: Local Storage & Offline Repository Layer

**Files:**
- Create: `src/data/seedFoods.ts`
- Create: `src/data/storage.ts`
- Test: `src/data/storage.test.ts`

**Interfaces:**
- Consumes: `src/types/health.ts`
- Produces:
  - `loadUserProfile(): UserProfile`
  - `saveUserProfile(profile: UserProfile): void`
  - `getDailyLog(dateStr: string): DailyMealLog`
  - `saveMealItem(dateStr: string, meal: MealType, item: LoggedFoodItem): void`
  - `removeMealItem(dateStr: string, meal: MealType, itemId: string): void`
  - `updateWaterIntake(dateStr: string, deltaMl: number): number`
  - `logWeightEntry(dateStr: string, weightKg: number): void`
  - `logActivityEntry(dateStr: string, calories: number, note?: string): void`
  - `getHistoricalLogs(days: number): DailyMealLog[]`
  - `SEED_FOODS: FoodItem[]` (25 staple items)

- [ ] **Step 1: Create `src/data/seedFoods.ts` with 25 calibrated healthy staples**

Include common everyday staples: Chicken Breast, Eggs, Oats, White Rice, Brown Rice, Salmon, Broccoli, Avocado, Banana, Greek Yogurt, Olive Oil, Peanut Butter, Apple, Sweet Potato, Almonds, Tuna, etc.

- [ ] **Step 2: Write failing tests in `src/data/storage.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadUserProfile,
  saveUserProfile,
  getDailyLog,
  saveMealItem,
  removeMealItem,
  updateWaterIntake,
  logWeightEntry,
  logActivityEntry,
  getHistoricalLogs
} from './storage';

describe('Local Storage Repository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default profile and persists updates', () => {
    const initial = loadUserProfile();
    expect(initial.weightKg).toBeGreaterThan(0);
    saveUserProfile({ ...initial, weightKg: 75, name: 'Joof' });
    expect(loadUserProfile().weightKg).toBe(75);
    expect(loadUserProfile().name).toBe('Joof');
  });

  it('adds and removes food items from daily meal buckets', () => {
    const date = '2026-10-30';
    saveMealItem(date, 'breakfast', {
      id: 'item-1',
      foodName: 'Oatmeal',
      grams: 50,
      nutrition: { calories: 190, protein: 7, carbs: 34, fat: 3, fiber: 5 },
      loggedAt: '08:30 AM'
    });
    let log = getDailyLog(date);
    expect(log.meals.breakfast.length).toBe(1);
    expect(log.meals.breakfast[0].foodName).toBe('Oatmeal');

    removeMealItem(date, 'breakfast', 'item-1');
    log = getDailyLog(date);
    expect(log.meals.breakfast.length).toBe(0);
  });

  it('updates water intake with increments', () => {
    const date = '2026-10-30';
    expect(updateWaterIntake(date, 250)).toBe(250);
    expect(updateWaterIntake(date, 250)).toBe(500);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test src/data/storage.test.ts`
Expected: FAIL (storage functions not defined).

- [ ] **Step 4: Implement `src/data/storage.ts`**

Implement strongly-typed repository functions backed by `localStorage` with date-keyed indexing (`joof_profile`, `joof_log_YYYY-MM-DD`, `joof_weights`).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test src/data/storage.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/
git commit -m "feat: implement offline-first storage repository and seed foods"
```

---

### Task 4: External API Clients & Unified Food Search Service

**Files:**
- Create: `src/services/usdaApi.ts`
- Create: `src/services/openFoodFactsApi.ts`
- Create: `src/services/foodSearchService.ts`
- Test: `src/services/foodSearchService.test.ts`

**Interfaces:**
- Consumes: `src/types/health.ts`, `src/data/seedFoods.ts`
- Produces:
  - `searchFoodItems(query: string, sourceFilter?: 'all' | 'usda' | 'off'): Promise<FoodItem[]>`
  - `cacheFoodItem(item: FoodItem): void`

- [ ] **Step 1: Implement USDA FoodData Central parser in `src/services/usdaApi.ts`**

Write `searchUSDA(query: string, apiKey?: string)` calling `https://api.nal.usda.gov/fdc/v1/foods/search` with default `DEMO_KEY`, extracting per-100g Energy (kcal), Protein, Fat, Carbs, and Fiber.

- [ ] **Step 2: Implement Open Food Facts parser in `src/services/openFoodFactsApi.ts`**

Write `searchOpenFoodFacts(query: string)` calling `https://world.openfoodfacts.org/api/v2/search` with compliant User-Agent header, extracting product name, brand, image thumbnail, and nutriments per 100g.

- [ ] **Step 3: Write failing tests in `src/services/foodSearchService.test.ts`**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchFoodItems } from './foodSearchService';

describe('Unified Food Search Service', () => {
  it('returns matching seed foods immediately even when offline', async () => {
    const results = await searchFoodItems('chicken');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('chicken');
  });

  it('handles external API network errors gracefully and falls back to seed/cached items', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));
    const results = await searchFoodItems('egg');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name.toLowerCase()).toContain('egg');
    vi.unstubAllGlobals();
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm test src/services/foodSearchService.test.ts`
Expected: FAIL (service not implemented).

- [ ] **Step 5: Implement `src/services/foodSearchService.ts`**

Search local seed foods first, dispatch debounced parallel requests to USDA and Open Food Facts if online, normalize results into a standard `FoodItem` schema, and cache search hits.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test src/services/foodSearchService.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/services/
git commit -m "feat: implement USDA and Open Food Facts search service with offline fallback"
```

---

### Task 5: Portion Measurer & Food Logging Modal Component

**Files:**
- Create: `src/components/FoodMeasurerModal.tsx`
- Test: `src/components/FoodMeasurerModal.test.tsx`

**Interfaces:**
- Consumes: `src/types/health.ts`, `src/services/foodSearchService.ts`, `src/domain/calculator.ts`
- Produces: `<FoodMeasurerModal isOpen={isOpen} initialMeal={meal} onClose={onClose} onAddFood={onAddFood} remainingCalories={remaining} />`

- [ ] **Step 1: Write failing tests in `src/components/FoodMeasurerModal.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FoodMeasurerModal from './FoodMeasurerModal';

describe('FoodMeasurerModal Component', () => {
  it('calculates and updates calories when gram slider changes', () => {
    const onAdd = vi.fn();
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="breakfast"
        onClose={() => {}}
        onAddFood={onAdd}
        remainingCalories={800}
      />
    );
    // Modal opens with default seed food selected
    expect(screen.getByText(/Measure & Log Food/i)).toBeInTheDocument();
    const gramInput = screen.getByLabelText(/Gram Weight/i) as HTMLInputElement;
    fireEvent.change(gramInput, { target: { value: '200' } });
    expect(screen.getByTestId('computed-calories')).toBeInTheDocument();
  });

  it('triggers onAddFood with correct portion and meal slot on submit', () => {
    const onAdd = vi.fn();
    render(
      <FoodMeasurerModal
        isOpen={true}
        initialMeal="lunch"
        onClose={() => {}}
        onAddFood={onAdd}
        remainingCalories={800}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /\+ Add to Lunch/i }));
    expect(onAdd).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/components/FoodMeasurerModal.test.tsx`
Expected: FAIL (component not found).

- [ ] **Step 3: Implement `src/components/FoodMeasurerModal.tsx`**

Implement search input, portion measurement controls (grams slider + quick buttons: 50g, 100g, 150g, 200g, 1 cup), live macro dials (Calories, Protein, Carbs, Fat), remaining allowance preview, meal selector, and custom food creation tab. Styled in Tailwind matching the mockup.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/FoodMeasurerModal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/FoodMeasurerModal*
git commit -m "feat: build FoodMeasurerModal with interactive portion slider and live nutrition calculation"
```

---

### Task 6: Pastel Dashboard (Home Screen) & Metric Tiles

**Files:**
- Create: `src/components/Dashboard.tsx`
- Create: `src/components/MetricTile.tsx`
- Create: `src/components/MealSection.tsx`
- Create: `src/components/QuickLogModal.tsx`
- Test: `src/components/Dashboard.test.tsx`

**Interfaces:**
- Consumes: `src/types/health.ts`, `src/data/storage.ts`, `src/domain/calculator.ts`
- Produces:
  - `<Dashboard date={date} onOpenMeasurer={(meal) => ...} />`
  - `<MetricTile title="Calories" value="1,450" ... />`
  - `<MealSection meal="breakfast" items={...} onAdd={() => ...} onRemove={(id) => ...} />`

- [ ] **Step 1: Write failing tests in `src/components/Dashboard.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  it('renders all 4 pastel metric tiles with proper labels', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    expect(screen.getByText('Calories')).toBeInTheDocument();
    expect(screen.getByText('Water')).toBeInTheDocument();
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('Burned')).toBeInTheDocument();
  });

  it('renders BMI status banner with calculated category', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    expect(screen.getByText(/BMI CALIBRATED TARGET/i)).toBeInTheDocument();
  });

  it('increments water intake on +250ml click', () => {
    render(<Dashboard onOpenMeasurer={vi.fn()} />);
    const addWaterBtn = screen.getByLabelText(/Add 250ml water/i);
    fireEvent.click(addWaterBtn);
    expect(screen.getByText(/250 ml/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/components/Dashboard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Dashboard, MetricTile, MealSection, and QuickLogModal**

Implement the full pastel UI from the Dribbble design:
- 4 color-coded cards with wave fill for water, arc progress for calories, gauge for weight, flame icon for burned.
- Quick-tap modal for logging weight and active burned calories.
- Expandable meal cards (Breakfast, Lunch, Dinner, Snacks) with calories, protein, carbs breakdown and delete action.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/Dashboard.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/
git commit -m "feat: build pastel dashboard, metric tiles, meal sections, and quick-log popups"
```

---

### Task 7: Analytics & BMI Insights Screen

**Files:**
- Create: `src/components/AnalyticsView.tsx`
- Test: `src/components/AnalyticsView.test.tsx`

**Interfaces:**
- Consumes: `src/types/health.ts`, `src/data/storage.ts`
- Produces: `<AnalyticsView />`

- [ ] **Step 1: Write failing tests in `src/components/AnalyticsView.test.tsx`**

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsView from './AnalyticsView';

describe('AnalyticsView Component', () => {
  it('renders 7-day intake chart and macro completion percentages', () => {
    render(<AnalyticsView />);
    expect(screen.getByText(/Activities & Analytics/i)).toBeInTheDocument();
    expect(screen.getByText(/Macro Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Weight Trajectory/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test src/components/AnalyticsView.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/AnalyticsView.tsx`**

Implement 7-day multi-line trend chart (Calories, Protein, Carbs, Fat), macro completion percentage bars, weight trajectory, and BMI range gauge matching Screen 3 of the user's reference.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test src/components/AnalyticsView.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/AnalyticsView*
git commit -m "feat: implement 7-day analytics chart, macro distribution, and BMI trajectory screen"
```

---

### Task 8: Profile Settings, PWA Manifest & App Integration

**Files:**
- Create: `src/components/ProfileSettings.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `public/manifest.webmanifest`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Consumes: All components from Tasks 1–7
- Produces: Fully interactive Joof Personal App with working tab navigation, persistent profile calibration, and PWA manifest.

- [ ] **Step 1: Implement `src/components/ProfileSettings.tsx`**

Form to edit user name, height, weight, age, biological sex, activity level, and goal type (Maintain, Mild Loss, Standard Loss, Custom). Recomputes BMI & daily calorie budget in real-time on change.

- [ ] **Step 2: Implement `src/components/BottomNav.tsx` and integrate all tabs in `src/App.tsx`**

Bottom bar with tabs:
- 🏠 Dashboard
- ⚖️ Food Measurer (opens modal directly)
- 📊 Analytics
- 👤 Profile & BMI Settings

- [ ] **Step 3: Add `public/manifest.webmanifest` and PWA icons**

Configure PWA manifest for standalone home-screen installation with Joof Personal App name, theme colors (`#faf9f6`), and avocado icon.

- [ ] **Step 4: Write comprehensive end-to-end integration test in `src/App.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Joof Personal App Full Integration', () => {
  it('switches tabs between Dashboard, Analytics, and Settings', () => {
    render(<App />);
    expect(screen.getByText(/Good morning, Joof/i)).toBeInTheDocument();

    // Switch to Analytics
    fireEvent.click(screen.getByLabelText(/Analytics/i));
    expect(screen.getByText(/Activities & Analytics/i)).toBeInTheDocument();

    // Switch to Settings
    fireEvent.click(screen.getByLabelText(/Profile/i));
    expect(screen.getByText(/Profile & BMI Calibration/i)).toBeInTheDocument();
  });

  it('measures food and logs it to Breakfast', async () => {
    render(<App />);
    const addBreakfastBtn = screen.getByTestId('add-food-breakfast');
    fireEvent.click(addBreakfastBtn);
    expect(screen.getByText(/Measure & Log Food/i)).toBeInTheDocument();

    const addBtn = screen.getByRole('button', { name: /\+ Add to Breakfast/i });
    fireEvent.click(addBtn);

    // Food item should now show in breakfast list
    expect(screen.queryByText(/Measure & Log Food/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run all tests to verify everything passes**

Run: `npm test`
Expected: PASS (all test suites passing).

- [ ] **Step 6: Build production bundle to verify no build errors**

Run: `npm run build`
Expected: Successful build with clean output in `dist/`.

- [ ] **Step 7: Commit**

```bash
git add public/ src/
git commit -m "feat: complete Joof Personal App with tab navigation, profile settings, and PWA setup"
```
