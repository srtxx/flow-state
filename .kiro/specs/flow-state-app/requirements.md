# Flow State - Requirements Specification

## 1. Overview

### 1.1 Product Vision
Flow State is a science-based caffeine intake optimization and alertness tracking application designed to help users maintain peak cognitive performance while protecting sleep quality.

### 1.2 Target Users
- Knowledge workers seeking to optimize cognitive performance
- Students managing study schedules and alertness
- Professionals requiring sustained focus throughout the day
- Anyone interested in evidence-based caffeine management

### 1.3 Core Value Proposition
- Optimize alertness through intelligent caffeine recommendations
- Track caffeine intake and its effects on alertness levels in real-time
- Protect sleep quality by calculating safe cutoff times
- Provide data-driven insights on weekly performance trends

## 2. Functional Requirements

### 2.1 User Onboarding
**Priority:** High

**User Story:** As a first-time user, I want to be guided through initial setup so that I can start using the app with my personal sleep schedule.

**Acceptance Criteria:**
- 2.1.1 Display welcome screen explaining app purpose and benefits
- 2.1.2 Allow user to set target sleep duration (4-10 hours range)
- 2.1.3 Prompt user to input today's actual sleep times after onboarding
- 2.1.4 Store onboarding completion status to prevent repeated onboarding
- 2.1.5 Provide clear visual progress through onboarding steps

### 2.2 Sleep Configuration
**Priority:** High

**User Story:** As a user, I want to configure my sleep schedule and quality so that the app can accurately calculate my baseline alertness.

**Acceptance Criteria:**
- 2.2.1 Allow input of bedtime (HH:mm format)
- 2.2.2 Allow input of wake-up time (HH:mm format)
- 2.2.3 Allow selection of sleep quality (Poor/Fair/Good)
- 2.2.4 Calculate actual sleep duration from bedtime and wake-up time
- 2.2.5 Persist sleep data to local storage
- 2.2.6 Display sleep configuration in profile page
- 2.2.7 Allow editing of sleep configuration at any time
- 2.2.8 Recalculate alertness baseline when sleep data changes

### 2.3 Caffeine Intake Logging
**Priority:** High

**User Story:** As a user, I want to log my caffeine intake quickly and accurately so that I can track its effect on my alertness.

**Acceptance Criteria:**
- 2.3.1 Provide quick-add buttons for common drinks (Coffee: 100mg, Espresso: 80mg, Energy: 80mg, Tea: 50mg)
- 2.3.2 Allow custom caffeine amount input (1-1000mg range)
- 2.3.3 Allow custom time input (HH:mm format, defaults to current time)
- 2.3.4 Generate unique ID for each intake record
- 2.3.5 Store timestamp for proper ordering
- 2.3.6 Persist intake records to local storage
- 2.3.7 Display intake records in journal page
- 2.3.8 Show simulation of alertness impact before confirming intake
- 2.3.9 Validate caffeine amount is within acceptable range
- 2.3.10 Provide visual feedback on successful intake logging

### 2.4 Intake History Management
**Priority:** Medium

**User Story:** As a user, I want to view and manage my caffeine intake history so that I can review and correct my records.

**Acceptance Criteria:**
- 2.4.1 Display all intake records for current day in reverse chronological order
- 2.4.2 Show total daily caffeine consumption
- 2.4.3 Display drink type, amount, and time for each record
- 2.4.4 Allow deletion of intake records with confirmation dialog
- 2.4.5 Update alertness calculations when records are deleted
- 2.4.6 Show empty state with helpful message when no records exist
- 2.4.7 Provide visual indication of daily limit status (400mg FDA recommendation)

### 2.5 Real-Time Alertness Monitoring
**Priority:** High

**User Story:** As a user, I want to see my current alertness level and predicted alertness throughout the day so that I can make informed decisions about caffeine intake.

**Acceptance Criteria:**
- 2.5.1 Display current alertness score (0-100 scale)
- 2.5.2 Show status indicator (Good/Peak/Low/Over Limit)
- 2.5.3 Visualize 24-hour alertness prediction on interactive chart
- 2.5.4 Distinguish between baseline alertness (sleep-based) and caffeine effect
- 2.5.5 Mark current time point on chart
- 2.5.6 Mark intake times on chart
- 2.5.7 Update alertness in real-time as time progresses
- 2.5.8 Recalculate predictions when intake records change

### 2.6 Caffeine Recommendations
**Priority:** Medium

**User Story:** As a user, I want to receive intelligent caffeine intake recommendations so that I can optimize my alertness without compromising sleep.

**Acceptance Criteria:**
- 2.6.1 Recommend 100mg caffeine 30 minutes from current time when appropriate
- 2.6.2 Only recommend if no recent intake within 2 hours
- 2.6.3 Only recommend if total daily intake < 400mg
- 2.6.4 Only recommend if current time is before cutoff time (9 hours before sleep)
- 2.6.5 Display recommendation prominently on dashboard
- 2.6.6 Allow quick action from recommendation to intake modal

### 2.7 Sleep Protection
**Priority:** High

**User Story:** As a user, I want to know when to stop consuming caffeine so that my sleep quality is not affected.

**Acceptance Criteria:**
- 2.7.1 Calculate avoid-after time as 9 hours before bedtime
- 2.7.2 Display avoid-after time prominently in profile page
- 2.7.3 Use visual emphasis (dark card) to highlight importance
- 2.7.4 Update avoid-after time when sleep schedule changes
- 2.7.5 Prevent recommendations after avoid-after time

### 2.8 Sleep Analysis
**Priority:** Medium

**User Story:** As a user, I want to understand my sleep patterns and their impact on alertness so that I can make better sleep decisions.

**Acceptance Criteria:**
- 2.8.1 Display last night's actual sleep duration
- 2.8.2 Compare actual sleep to target sleep goal
- 2.8.3 Show sleep quality indicator
- 2.8.4 Calculate and display sleep debt (if any)
- 2.8.5 Provide visual warning for significant sleep debt
- 2.8.6 Explain impact of sleep quality on alertness

### 2.9 Weekly Performance Tracking
**Priority:** Medium

**User Story:** As a user, I want to track my weekly alertness trends so that I can understand long-term patterns and optimize my routine.

**Acceptance Criteria:**
- 2.9.1 Calculate average alertness for current week
- 2.9.2 Calculate average alertness for previous week
- 2.9.3 Show weekly change percentage with trend indicator
- 2.9.4 Display number of days tracked
- 2.9.5 Store daily scores for last 14 days
- 2.9.6 Automatically update daily scores based on current alertness
- 2.9.7 Show "Not enough data" message when insufficient data available

### 2.10 Intake Simulation
**Priority:** Medium

**User Story:** As a user, I want to preview the impact of caffeine intake before logging it so that I can make informed decisions.

**Acceptance Criteria:**
- 2.10.1 Show predicted alertness curve when user enters intake details
- 2.10.2 Update prediction in real-time as amount or time changes
- 2.10.3 Distinguish simulated data from actual data visually
- 2.10.4 Allow user to adjust parameters before confirming
- 2.10.5 Clear simulation when modal is closed without confirming

### 2.11 Multi-Language Support
**Priority:** Medium

**User Story:** As a user, I want to use the app in my preferred language so that I can understand all features clearly.

**Acceptance Criteria:**
- 2.11.1 Support Japanese as default language
- 2.11.2 Support English as fallback language
- 2.11.3 Translate all UI text, labels, and messages
- 2.11.4 Allow language switching (future enhancement)
- 2.11.5 Persist language preference

### 2.12 Dark Mode Support
**Priority:** Low

**User Story:** As a user, I want to use the app in dark mode so that I can reduce eye strain in low-light conditions.

**Acceptance Criteria:**
- 2.12.1 Automatically detect system dark mode preference
- 2.12.2 Apply dark color scheme to all components
- 2.12.3 Maintain WCAG AA contrast ratios in dark mode
- 2.12.4 Adjust chart colors for dark mode visibility
- 2.12.5 Adjust shadows and borders for dark mode aesthetics

## 3. Non-Functional Requirements

### 3.1 Performance
- 3.1.1 Initial page load < 2 seconds on 3G connection
- 3.1.2 Alertness calculations complete < 100ms
- 3.1.3 Chart rendering < 500ms
- 3.1.4 UI interactions respond < 100ms
- 3.1.5 Smooth animations at 60fps

### 3.2 Usability
- 3.2.1 Mobile-first design optimized for screens 320px-480px
- 3.2.2 Touch targets minimum 44x44px
- 3.2.3 Clear visual hierarchy and information architecture
- 3.2.4 Consistent design language across all screens
- 3.2.5 Intuitive navigation with bottom tab bar

### 3.3 Accessibility
- 3.3.1 Semantic HTML structure
- 3.3.2 ARIA labels on interactive elements
- 3.3.3 Keyboard navigation support
- 3.3.4 Color contrast ratios meet WCAG AA standards
- 3.3.5 Screen reader compatible

### 3.4 Reliability
- 3.4.1 Data persists across browser sessions
- 3.4.2 Graceful handling of invalid input
- 3.4.3 No data loss on app crashes
- 3.4.4 Automatic recovery from errors

### 3.5 Security
- 3.5.1 All data stored locally (no server transmission)
- 3.5.2 No personal identifiable information collected
- 3.5.3 No external API calls (except optional analytics)

### 3.6 Compatibility
- 3.6.1 Support modern browsers (Chrome, Firefox, Safari, Edge)
- 3.6.2 Support iOS Safari 14+
- 3.6.3 Support Android Chrome 90+
- 3.6.4 Responsive design for tablets and desktops

### 3.7 Maintainability
- 3.7.1 TypeScript for type safety
- 3.7.2 Component-based architecture
- 3.7.3 Comprehensive unit tests for core logic
- 3.7.4 ESLint for code quality
- 3.7.5 Clear code documentation

## 4. Data Requirements

### 4.1 Data Storage
- 4.1.1 Use browser localStorage for persistence
- 4.1.2 Store sleep data, intake records, onboarding status, daily scores
- 4.1.3 Implement automatic serialization/deserialization
- 4.1.4 Handle storage quota exceeded gracefully

### 4.2 Data Retention
- 4.2.1 Keep intake records for current day only
- 4.2.2 Keep daily scores for last 14 days
- 4.2.3 Keep sleep data indefinitely
- 4.2.4 Implement automatic cleanup of old data

### 4.3 Data Validation
- 4.3.1 Validate all user inputs before storage
- 4.3.2 Sanitize data to prevent injection attacks
- 4.3.3 Provide clear error messages for invalid data

## 5. Scientific Requirements

### 5.1 Caffeine Metabolism Model
- 5.1.1 Use 5-hour half-life for caffeine decay
- 5.1.2 Model 45-minute absorption peak time
- 5.1.3 Implement exponential rise during absorption phase
- 5.1.4 Implement exponential decay after peak
- 5.1.5 Use dose-response curve with saturation effect

### 5.2 Alertness Calculation
- 5.2.1 Implement Two-Process Model (Process S + Process C)
- 5.2.2 Model homeostatic sleep pressure accumulation
- 5.2.3 Model circadian rhythm with peak and dip periods
- 5.2.4 Apply sleep quality modifiers (good=1.0, fair=0.9, poor=0.75)
- 5.2.5 Apply sleep debt penalties (5 points per hour deficit)
- 5.2.6 Combine baseline and caffeine effects (capped at 100)

### 5.3 Safety Guidelines
- 5.3.1 Enforce 400mg daily caffeine limit (FDA recommendation)
- 5.3.2 Implement 9-hour cutoff before sleep
- 5.3.3 Warn users when approaching limits
- 5.3.4 Provide educational content on safe caffeine use

## 6. Future Enhancements (Backlog)

### 6.1 PWA Support
- Offline functionality
- Install to home screen
- Push notifications

### 6.2 Advanced Analytics
- Monthly trends
- Correlation analysis (sleep quality vs. alertness)
- Personalized recommendations based on history

### 6.3 Social Features
- Share weekly stats
- Compare with friends (anonymized)

### 6.4 Customization
- Adjustable caffeine half-life (genetic variation)
- Custom drink presets
- Theme customization

### 6.5 Export/Import
- Export data as JSON/CSV
- Import historical data
- Backup/restore functionality

## 7. Success Metrics

### 7.1 User Engagement
- Daily active users
- Average session duration
- Retention rate (7-day, 30-day)

### 7.2 Feature Usage
- Intake logging frequency
- Sleep configuration updates
- Weekly stats views

### 7.3 User Satisfaction
- App store ratings
- User feedback sentiment
- Feature request frequency

## 8. Constraints

### 8.1 Technical Constraints
- Client-side only (no backend)
- Browser localStorage limitations (~5-10MB)
- No native mobile app (web-only)

### 8.2 Resource Constraints
- Solo developer project
- Limited budget for third-party services
- Community-driven development

### 8.3 Regulatory Constraints
- Not a medical device
- Educational/informational purposes only
- Disclaimer required for health-related advice
