# Flow State - Design Specification

## 1. System Architecture

### 1.1 Architecture Overview
Flow State follows a component-based Single Page Application (SPA) architecture built with React and TypeScript.

**Architecture Type:** Layered Component Architecture

**Key Layers:**
1. **Presentation Layer** - React components for UI
2. **State Management Layer** - React Context API for global state
3. **Business Logic Layer** - Custom hooks for domain logic
4. **Data Persistence Layer** - LocalStorage abstraction

### 1.2 Technology Stack

**Core Framework:**
- React 19.2.0 with TypeScript 5.9.3
- Vite 7.2.4 (build tool with HMR)
- React DOM 19.2.0

**State Management:**
- React Context API (FlowStateContext)
- Custom hooks (useAlertness, useDailyScore, useLocalStorage)

**UI & Visualization:**
- Recharts 2.15.0 for alertness charts
- Lucide React 0.460.0 for icons
- Custom CSS with Soft UI design system

**Internationalization:**
- i18next 25.8.4
- react-i18next 16.5.4

**Testing:**
- Vitest 4.0.18
- React Testing Library 16.3.2
- jsdom 28.0.0

**Deployment:**
- Vercel platform
- ESLint 9.39.1 for code quality

### 1.3 Design Patterns

**Context Pattern:**
- FlowStateContext provides global state to all components
- Single source of truth for application state
- Prevents prop drilling and simplifies state access

**Custom Hooks Pattern:**
- useAlertness: Encapsulates alertness calculation logic
- useDailyScore: Encapsulates weekly performance tracking
- useLocalStorage: Encapsulates persistence logic
- Promotes reusability and testability

**Compound Components:**
- Modal system with overlay + content structure
- Consistent modal behavior across the app

**Memoization Pattern:**
- useMemo for expensive calculations
- Prevents unnecessary recalculations on re-renders

## 2. Data Models

### 2.1 Core Data Types

```typescript
// Sleep Configuration
interface SleepData {
  avgSleepHours: number;        // Target sleep duration (4-10 hours)
  lastSleepStart: string;       // HH:mm format (e.g., "23:00")
  lastSleepEnd: string;         // HH:mm format (e.g., "07:00")
  sleepQuality: 'good' | 'fair' | 'poor';
}

// Caffeine Intake Record
interface IntakeRecord {
  id: string;                   // Unique identifier (UUID)
  time: string;                 // HH:mm format
  amount: number;               // Milligrams (1-1000)
  drink: DrinkType;             // COFFEE | ESPRESSO | ENERGY | TEA | CUSTOM
  timestamp: number;            // Unix timestamp for ordering
}

// Drink Types
type DrinkType = 'COFFEE' | 'ESPRESSO' | 'ENERGY' | 'TEA' | 'CUSTOM';

// Alertness Data Point (for charting)
interface AlertnessDataPoint {
  time: string;                 // HH:mm format
  baseline: number;             // Sleep-based alertness (0-100)
  caffeine: number;             // Caffeine boost effect (0-100)
  total: number;                // Combined alertness (0-100)
  isCurrent: boolean;           // Is this the current time?
  isIntake: boolean;            // Is this an intake time?
}

// Daily Performance Tracking
interface DailyScoreRecord {
  date: string;                 // YYYY-MM-DD format
  avgAlertness: number;         // Average alertness for the day
  totalCaffeine: number;        // Total caffeine consumed
}

// Tab Navigation
type TabType = 'dashboard' | 'journal' | 'profile';

// Toast Notification
interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Drink Preset
interface DrinkOption {
  name: DrinkType;
  label: string;
  defaultMg: number;
}
```

### 2.2 Drink Presets

```typescript
const DRINK_OPTIONS: DrinkOption[] = [
  { name: 'COFFEE', label: 'Coffee', defaultMg: 100 },
  { name: 'ESPRESSO', label: 'Espresso', defaultMg: 80 },
  { name: 'ENERGY', label: 'Energy Drink', defaultMg: 80 },
  { name: 'TEA', label: 'Tea', defaultMg: 50 },
  { name: 'CUSTOM', label: 'Custom', defaultMg: 0 }
];
```

### 2.3 Constants

```typescript
// Caffeine Metabolism
const CAFFEINE_HALF_LIFE = 5;           // hours
const CAFFEINE_PEAK_TIME = 0.75;        // hours (45 minutes)
const DAILY_LIMIT = 400;                // mg (FDA recommendation)
const AVOID_BEFORE_SLEEP = 9;           // hours

// Alertness Calculation
const MAX_CAFFEINE_EFFECT = 18;         // points
const CAFFEINE_THRESHOLD = 80;          // mg
const SLEEP_DEBT_PENALTY = 5;           // points per hour
const CIRCADIAN_AMPLITUDE = 20;         // points
const CIRCADIAN_BASELINE = 55;          // points

// Sleep Quality Modifiers
const QUALITY_MODIFIERS = {
  good: 1.0,
  fair: 0.9,
  poor: 0.75
};
```

## 3. Core Algorithms

### 3.1 Caffeine Metabolism Model

**Scientific Foundation:**
Based on pharmacokinetic modeling of caffeine absorption and elimination.


**Absorption Phase (0 to 45 minutes):**
```
concentration(t) = amount × (1 - e^(-3t/PEAK_TIME))
```
- Exponential rise to peak concentration
- Reaches ~95% absorption by 45 minutes
- Models gastric absorption kinetics

**Decay Phase (45+ minutes):**
```
concentration(t) = amount × 0.5^((t - PEAK_TIME) / HALF_LIFE)
```
- Exponential decay with 5-hour half-life
- Models hepatic metabolism (CYP1A2 enzyme)
- Individual variation: 1.5-9.5 hours (we use average)

**Dose-Response Curve:**
```
effect(concentration) = MAX_EFFECT × (1 - e^(-concentration/THRESHOLD))
```
- Saturation curve prevents unrealistic effects
- MAX_EFFECT = 18 points
- THRESHOLD = 80mg
- Models adenosine receptor antagonism

**Implementation:**
```typescript
function calculateCaffeineEffect(
  intakes: IntakeRecord[],
  currentTime: Date
): number {
  let totalEffect = 0;
  
  for (const intake of intakes) {
    const hoursElapsed = (currentTime - intake.timestamp) / (1000 * 60 * 60);
    
    let concentration: number;
    if (hoursElapsed < CAFFEINE_PEAK_TIME) {
      // Absorption phase
      concentration = intake.amount * (1 - Math.exp(-3 * hoursElapsed / CAFFEINE_PEAK_TIME));
    } else {
      // Decay phase
      const decayTime = hoursElapsed - CAFFEINE_PEAK_TIME;
      concentration = intake.amount * Math.pow(0.5, decayTime / CAFFEINE_HALF_LIFE);
    }
    
    // Dose-response curve
    const effect = MAX_CAFFEINE_EFFECT * (1 - Math.exp(-concentration / CAFFEINE_THRESHOLD));
    totalEffect += effect;
  }
  
  return Math.min(totalEffect, 100); // Cap at 100
}
```

### 3.2 Baseline Alertness Model

**Scientific Foundation:**
Based on the Two-Process Model of Sleep Regulation (Borbély, 1982).


**Process S (Homeostatic Sleep Pressure):**
```
sleepPressure(t) = 100 × (1 - e^(-hoursAwake/18))
```
- Accumulates exponentially during waking
- Peaks after ~16 hours awake
- Represents adenosine accumulation

**Process C (Circadian Rhythm):**
```
circadian(t) = BASELINE + AMPLITUDE × sin((hoursAwake - 5) × π/12)
```
- 24-hour biological clock
- Peak alertness: 4-6 hours after waking
- Afternoon dip: 6-9 hours after waking (post-lunch effect)
- Evening decline: 12+ hours after waking

**Sleep Quality Modifier:**
```
qualityFactor = QUALITY_MODIFIERS[sleepQuality]
```
- Good: 1.0 (no penalty)
- Fair: 0.9 (10% reduction)
- Poor: 0.75 (25% reduction)

**Sleep Debt Penalty:**
```
sleepDebt = max(0, targetSleep - actualSleep)
debtPenalty = sleepDebt × SLEEP_DEBT_PENALTY
```
- 5 points penalty per hour of sleep deficit
- Accumulates linearly

**Combined Baseline:**
```
baseline = (circadian - sleepPressure) × qualityFactor - debtPenalty
baseline = clamp(baseline, 20, 85)
```

**Implementation:**
```typescript
function calculateBaselineAlertness(
  sleepData: SleepData,
  currentTime: Date
): number {
  const hoursAwake = calculateHoursAwake(sleepData.lastSleepEnd, currentTime);
  
  // Process S: Sleep pressure
  const sleepPressure = 100 * (1 - Math.exp(-hoursAwake / 18));
  
  // Process C: Circadian rhythm
  const circadian = CIRCADIAN_BASELINE + 
    CIRCADIAN_AMPLITUDE * Math.sin((hoursAwake - 5) * Math.PI / 12);
  
  // Sleep quality modifier
  const qualityFactor = QUALITY_MODIFIERS[sleepData.sleepQuality];
  
  // Sleep debt penalty
  const actualSleep = calculateActualSleep(sleepData);
  const sleepDebt = Math.max(0, sleepData.avgSleepHours - actualSleep);
  const debtPenalty = sleepDebt * SLEEP_DEBT_PENALTY;
  
  // Combine all factors
  let baseline = (circadian - sleepPressure) * qualityFactor - debtPenalty;
  
  // Clamp to realistic range
  return Math.max(20, Math.min(85, baseline));
}
```

### 3.3 Total Alertness Calculation

```typescript
function calculateTotalAlertness(
  sleepData: SleepData,
  intakes: IntakeRecord[],
  currentTime: Date
): number {
  const baseline = calculateBaselineAlertness(sleepData, currentTime);
  const caffeineEffect = calculateCaffeineEffect(intakes, currentTime);
  
  return Math.min(100, baseline + caffeineEffect);
}
```

### 3.4 Recommendation Algorithm

```typescript
function generateRecommendation(
  currentTime: Date,
  intakes: IntakeRecord[],
  sleepData: SleepData,
  totalCaffeineToday: number
): { time: string; amount: number } | null {
  // Check daily limit
  if (totalCaffeineToday >= DAILY_LIMIT) {
    return null;
  }
  
  // Check cutoff time
  const avoidAfterTime = calculateAvoidAfterTime(sleepData.lastSleepStart);
  if (isAfterCutoff(currentTime, avoidAfterTime)) {
    return null;
  }
  
  // Check recent intake
  const lastIntake = intakes[intakes.length - 1];
  if (lastIntake) {
    const hoursSinceLastIntake = (currentTime - lastIntake.timestamp) / (1000 * 60 * 60);
    if (hoursSinceLastIntake < 2) {
      return null;
    }
  }
  
  // Recommend 100mg in 30 minutes
  const recommendTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
  return {
    time: formatTime(recommendTime),
    amount: 100
  };
}
```

### 3.5 Avoid-After Time Calculation

```typescript
function calculateAvoidAfterTime(bedtime: string): string {
  const [hours, minutes] = bedtime.split(':').map(Number);
  let avoidHour = hours - AVOID_BEFORE_SLEEP;
  
  if (avoidHour < 0) {
    avoidHour += 24;
  }
  
  return `${String(avoidHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
```

## 4. Component Architecture

### 4.1 Component Hierarchy

```
App
├── FlowStateProvider (Context)
│   └── AppContent
│       ├── Layout
│       │   ├── Header
│       │   │   ├── Logo
│       │   │   └── Sleep Button
│       │   ├── Main Content (Page Router)
│       │   │   ├── DashboardPage
│       │   │   ├── JournalPage
│       │   │   └── ProfilePage
│       │   └── BottomNav
│       ├── OnboardingModal
│       ├── SleepInputModal
│       ├── IntakeModal
│       ├── ConfirmDialog
│       ├── ToastContainer
│       └── BuyMeACoffeeWidget
```


### 4.2 Key Components

**App.tsx**
- Root component
- Manages page routing based on activeTab
- Renders modals conditionally
- Wraps content with FlowStateProvider

**Layout.tsx**
- App shell structure
- Header with logo and sleep button
- Main content area
- Bottom navigation bar
- Handles safe area insets

**DashboardPage.tsx**
- Current alertness score display (large, prominent)
- Status indicator pill
- Recommendation pill
- 24-hour alertness chart
- Floating action button (FAB) for intake logging

**JournalPage.tsx**
- Total daily intake summary
- Intake records list (reverse chronological)
- Delete button for each record
- Empty state with call-to-action

**ProfilePage.tsx**
- Avoid-after time card (dark, prominent)
- Sleep analysis section
- Weekly performance stats
- Edit sleep button
- Developer support link

**AlertnessChart.tsx**
- Recharts ResponsiveContainer
- Area chart for baseline alertness
- Area chart for caffeine effect
- Line chart for total alertness
- Vertical line for current time
- Dots for intake markers
- Custom tooltip
- Responsive to container size

**IntakeModal.tsx**
- Quick add buttons (Coffee, Espresso, Energy, Tea)
- Custom mode toggle
- Amount input (1-1000mg)
- Time input (HH:mm)
- Simulation chart
- Confirm/Cancel buttons

**SleepInputModal.tsx**
- Bedtime input
- Wake-up time input
- Sleep quality selector
- Save/Cancel buttons

**OnboardingModal.tsx**
- Multi-step wizard
- Welcome screen
- Sleep goal slider (4-10 hours)
- Completion screen

**ConfirmDialog.tsx**
- Reusable confirmation modal
- Title and message
- Confirm/Cancel buttons
- Destructive action styling

**Toast.tsx**
- Auto-dismissing notification
- Success/Error/Info variants
- 3-second duration
- Slide-in animation

**BottomNav.tsx**
- Three tabs: Dashboard, Journal, Profile
- Active state indicator
- Icon + label
- Sticky positioning

## 5. State Management

### 5.1 FlowStateContext Structure

```typescript
interface FlowStateContextType {
  // Persisted Data
  sleepData: SleepData;
  intakeRecords: IntakeRecord[];
  hasOnboarded: boolean;
  
  // UI State
  activeTab: TabType;
  showNotification: boolean;
  showIntakeModal: boolean;
  showSleepInput: boolean;
  
  // Computed Values
  alertnessData: AlertnessDataPoint[];
  predictedData: AlertnessDataPoint[];
  currentAlertness: number;
  actualSleepHours: number;
  totalCaffeineToday: number;
  avoidAfterTime: string;
  recommendation: { time: string; amount: number } | null;
  isOverLimit: boolean;
  
  // Weekly Stats
  weeklyStats: {
    thisWeekAvg: number | null;
    lastWeekAvg: number | null;
    weeklyChange: number | null;
    daysTracked: number;
  };
  
  // Notifications
  toasts: ToastData[];
  
  // Simulation
  simulationParams: { time: string; amount: number } | undefined;
  
  // Confirm Dialog
  confirmConfig: {
    isOpen: boolean;
    message: string;
    title?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  };
  
  // Actions
  setSleepData: (data: SleepData) => void;
  addIntake: (drink: DrinkType, amount: number, time: string) => void;
  deleteIntake: (id: string) => void;
  completeOnboarding: (data: SleepData) => void;
  setActiveTab: (tab: TabType) => void;
  setShowNotification: (show: boolean) => void;
  setShowIntakeModal: (show: boolean) => void;
  setShowSleepInput: (show: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  setSimulationParams: (params: { time: string; amount: number } | undefined) => void;
  closeConfirm: () => void;
}
```

### 5.2 State Persistence

**LocalStorage Keys:**
- `flow-state-sleep`: SleepData
- `flow-state-intakes`: IntakeRecord[]
- `flow-state-onboarded`: boolean
- `flow-state-daily-scores`: DailyScoreRecord[]

**Persistence Strategy:**
- useLocalStorage hook handles automatic persistence
- JSON serialization/deserialization
- Graceful handling of parse errors
- Default values on first load

### 5.3 Computed Values

**Memoization Strategy:**
All computed values use useMemo with proper dependencies:

```typescript
const alertnessData = useMemo(() => {
  return generateAlertnessData(sleepData, intakeRecords);
}, [sleepData, intakeRecords]);

const currentAlertness = useMemo(() => {
  return calculateTotalAlertness(sleepData, intakeRecords, new Date());
}, [sleepData, intakeRecords]);
```

## 6. User Interface Design

### 6.1 Design System

**Design Philosophy:** Soft UI with minimalist aesthetic

**Color Palette:**

Light Mode:
- Background (App): #FAFAFA
- Background (Card): #FFFFFF
- Background (Subtle): #F1F5F9
- Text (Primary): #171717
- Text (Secondary): #737373
- Accent: #171717
- Status (Good): #10B981
- Status (Warning): #F59E0B
- Status (Critical): #EF4444

Dark Mode:
- Background (App): #121212
- Background (Card): #1E1E1E
- Background (Subtle): #2C2C2C
- Text (Primary): #FAFAFA
- Text (Secondary): #A3A3A3
- Accent: #FFFFFF
- Status colors remain the same

**Typography:**
- Font Family: Inter (with system fallbacks)
- Weights: 100, 300, 400, 500, 700
- Sizes: xs (0.75rem), sm (0.875rem), base (1rem), lg (1.125rem), xl (1.5rem), 2xl (2rem), 6xl (6rem)

**Spacing:**
- Base unit: 0.5rem (8px)
- Scale: 0.5, 1, 1.5, 2, 3, 4, 6, 8 rem

**Border Radius:**
- sm: 8px
- md: 16px
- lg: 24px
- full: 9999px

**Shadows:**
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px -1px rgba(0,0,0,0.1)
- lg: 0 10px 15px -3px rgba(0,0,0,0.1)
- floating: 0 20px 25px -5px rgba(0,0,0,0.1)

### 6.2 Layout Constraints

- Max width: 480px (mobile-first)
- Header height: 60px
- Bottom nav height: 80px
- Safe area insets: Respected for notch/home indicator
- Content padding: 1.5rem (24px)

### 6.3 Interactive Elements

**Buttons:**
- Minimum touch target: 44x44px
- Hover: scale(1.02), shadow increase
- Active: scale(0.98), opacity 0.9
- Transition: 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)

**Modals:**
- Full-screen on mobile
- Centered overlay
- Backdrop blur effect
- ESC key to close
- Click outside to close

**Charts:**
- Responsive to container
- Touch-friendly tooltips
- Smooth animations
- Accessible colors

## 7. Internationalization

### 7.1 Language Support

**Default Language:** Japanese (ja)
**Fallback Language:** English (en)

### 7.2 Translation Structure

```typescript
const resources = {
  en: {
    translation: {
      common: { save, cancel, delete, edit, add, close, confirm },
      nav: { flow, journal, profile },
      dashboard: { currentAlertness, status, recommendation },
      intake: { title, logCaffeine, quickAdd, custom, amount, time, record },
      sleep: { title, bedtime, wakeUp, quality, poor, fair, good },
      journal: { title, totalIntake, history, noRecords },
      profile: { title, limitAfter, sleepAnalysis, weeklyTrend },
      onboarding: { title, description, sleepGoal },
      validation: { amountRequired, amountRange }
    }
  },
  ja: { /* Japanese translations */ }
};
```

### 7.3 Implementation

- i18next for translation management
- react-i18next for React integration
- useTranslation hook in components
- Language detection from browser
- Persistent language preference (future)

## 8. Testing Strategy

### 8.1 Unit Tests

**Target:** Core business logic in `src/lib/caffeine.ts`

**Test Cases:**
- Caffeine effect calculation (absorption phase)
- Caffeine effect calculation (decay phase)
- Baseline alertness calculation
- Total alertness calculation
- Avoid-after time calculation
- Time conversion utilities
- Recommendation logic

**Framework:** Vitest

### 8.2 Component Tests

**Target:** React components

**Test Cases:**
- Modal open/close interactions
- Form input validation
- Button click handlers
- Navigation between tabs
- Toast notifications
- Chart rendering

**Framework:** React Testing Library + Vitest

### 8.3 Integration Tests

**Target:** User flows

**Test Cases:**
- Onboarding flow completion
- Intake logging flow
- Sleep data update flow
- Intake deletion flow

**Framework:** React Testing Library + Vitest

### 8.4 Test Setup

```typescript
// setupTests.ts
import '@testing-library/jest-dom';

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## 9. Performance Optimization

### 9.1 Memoization

- useMemo for expensive calculations
- useCallback for event handlers
- React.memo for pure components

### 9.2 Code Splitting

- Lazy loading for page components (future)
- Dynamic imports for heavy libraries (future)

### 9.3 Chart Optimization

- Interval-based XAxis labels
- Memoized data transformations
- Debounced resize handlers

### 9.4 Storage Optimization

- Only store today's intake records
- Limit daily scores to 14 days
- Efficient JSON serialization

## 10. Accessibility

### 10.1 Semantic HTML

- Proper heading hierarchy
- Semantic elements (nav, main, header)
- Form labels and fieldsets

### 10.2 ARIA

- aria-label on icon buttons
- aria-hidden on decorative elements
- role attributes on custom components

### 10.3 Keyboard Navigation

- Tab order follows visual order
- ESC to close modals
- Enter to submit forms
- Focus management on modal open/close

### 10.4 Color Contrast

- WCAG AA compliance
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Tested in both light and dark modes

## 11. Deployment

### 11.1 Build Process

```bash
npm run build  # TypeScript compilation + Vite build
```

Output:
- `dist/index.html`
- `dist/assets/*.js` (bundled JavaScript)
- `dist/assets/*.css` (bundled CSS)

### 11.2 Deployment Platform

**Vercel:**
- Automatic deployments from git
- Preview deployments for PRs
- Production deployments on main branch
- Environment: Node.js
- Build command: `tsc -b && vite build`
- Output directory: `dist/`

### 11.3 Environment Configuration

No environment variables required (all data stored locally)

## 12. Future Enhancements

### 12.1 PWA Support

- Service worker for offline functionality
- Web app manifest for install prompt
- Push notifications for recommendations

### 12.2 Advanced Analytics

- Monthly trend charts
- Correlation analysis
- Personalized recommendations

### 12.3 Customization

- Adjustable caffeine half-life
- Custom drink presets
- Theme customization

### 12.4 Export/Import

- Export data as JSON/CSV
- Import historical data
- Backup/restore functionality

## 13. Correctness Properties

### 13.1 Caffeine Calculation Properties

**Property 1.1: Caffeine Effect Non-Negativity**
- For all intake records and times, caffeine effect ≥ 0

**Property 1.2: Caffeine Effect Monotonic Decay**
- After peak time, caffeine effect decreases monotonically

**Property 1.3: Caffeine Effect Bounded**
- Caffeine effect ≤ 100 for all inputs

### 13.2 Alertness Calculation Properties

**Property 2.1: Baseline Alertness Range**
- Baseline alertness ∈ [20, 85] for all valid inputs

**Property 2.2: Total Alertness Range**
- Total alertness ∈ [0, 100] for all valid inputs

**Property 2.3: Sleep Debt Impact**
- Greater sleep debt → lower baseline alertness

### 13.3 Recommendation Properties

**Property 3.1: Daily Limit Enforcement**
- No recommendation when totalCaffeine ≥ 400mg

**Property 3.2: Cutoff Time Enforcement**
- No recommendation after avoid-after time

**Property 3.3: Recent Intake Check**
- No recommendation within 2 hours of last intake

### 13.4 Data Persistence Properties

**Property 4.1: Persistence Idempotence**
- save(load(data)) = data

**Property 4.2: Data Integrity**
- All persisted data can be deserialized without errors

## 14. Security Considerations

### 14.1 Data Privacy

- All data stored locally (no server transmission)
- No personal identifiable information collected
- No external API calls (except optional analytics)

### 14.2 Input Validation

- Sanitize all user inputs
- Validate ranges (caffeine: 1-1000mg, sleep: 4-10 hours)
- Prevent injection attacks

### 14.3 Storage Security

- Use browser's built-in localStorage security
- No sensitive data stored
- Clear data on user request

## 15. Error Handling

### 15.1 Input Errors

- Display clear error messages
- Prevent invalid form submission
- Provide helpful guidance

### 15.2 Storage Errors

- Graceful handling of quota exceeded
- Fallback to default values on parse errors
- User notification on critical errors

### 15.3 Calculation Errors

- Validate inputs before calculations
- Handle edge cases (e.g., division by zero)
- Clamp results to valid ranges

## 16. Monitoring & Analytics

### 16.1 Error Tracking

- Console logging for development
- Error boundaries for React errors
- User-friendly error messages

### 16.2 Usage Analytics (Future)

- Page views
- Feature usage
- User retention
- Performance metrics

## 17. Documentation

### 17.1 Code Documentation

- JSDoc comments for complex functions
- Type definitions for all data structures
- README with setup instructions

### 17.2 User Documentation

- In-app onboarding
- Tooltips for complex features
- FAQ section (future)

## 18. Maintenance

### 18.1 Code Quality

- ESLint for code quality
- TypeScript for type safety
- Consistent code style

### 18.2 Dependency Management

- Regular dependency updates
- Security vulnerability scanning
- Minimal dependency footprint

### 18.3 Version Control

- Git for version control
- Semantic versioning
- Changelog maintenance

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-09  
**Status:** Complete - Reverse Engineered from Production Code
