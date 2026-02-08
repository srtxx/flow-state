# UI Fix Design Skill

## Purpose
Design comprehensive, maintainable solutions for UI/UX issues based on investigation findings. Create detailed implementation plans that follow best practices and ensure consistency.

## When to Use
- After completing UI issue investigation
- Before implementing fixes
- When planning major UI refactors
- For establishing responsive design patterns
- When creating reusable UI components

## Design Process

### 1. Review Investigation Findings
**Goal**: Understand all issues and their relationships

**Steps**:
1. Read complete investigation report
2. Identify issue dependencies
3. Group related issues
4. Prioritize by impact and effort
5. Identify common patterns

**Questions to Answer**:
- Which issues share root causes?
- Can multiple issues be fixed with one solution?
- Are there systemic problems?
- What's the minimum viable fix?
- What's the ideal long-term solution?

### 2. Define Design Principles
**Goal**: Establish consistent approach across all fixes

**Core Principles**:

#### Responsive Design
```css
/* Use fluid typography */
font-size: clamp(min, preferred, max)

/* Use flexible containers */
width: min(max-width, 100% - padding)

/* Use responsive spacing */
padding: clamp(min, preferred, max)
gap: clamp(min, preferred, max)

/* Use viewport-relative units */
height: clamp(minpx, vh, maxpx)
```

#### Mobile-First Approach
```css
/* Base styles for mobile */
.component {
  /* Mobile styles */
}

/* Progressive enhancement */
@media (min-width: 568px) { /* Landscape mobile */ }
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

#### Accessibility Standards
```css
/* Touch targets */
min-width: 44px;
min-height: 44px;

/* Focus indicators */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Solution Design
**Goal**: Create detailed fix specifications for each issue

**Template for Each Fix**:
```markdown
### Fix [Number]: [Issue Title]

#### Problem Summary
[Brief description from investigation]

#### Proposed Solution
[Detailed technical approach]

#### Implementation Details

**Files to Modify**:
- `path/to/file.tsx` - [What changes]
- `path/to/file.css` - [What changes]

**Code Changes**:
```css
/* Before */
.selector {
  property: old-value;
}

/* After */
.selector {
  property: new-value; /* Explanation */
}
```

#### Responsive Behavior
- Mobile (320px-567px): [Behavior]
- Landscape (568px-767px): [Behavior]
- Tablet (768px-1023px): [Behavior]
- Desktop (1024px+): [Behavior]

#### Accessibility Considerations
- Touch target size: [Size]
- Keyboard navigation: [Behavior]
- Screen reader: [Announcement]
- Focus management: [Behavior]

#### Testing Requirements
- [ ] Test on 320px width
- [ ] Test on 375px width (iPhone SE)
- [ ] Test on 768px width (iPad)
- [ ] Test landscape orientation
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Verify no horizontal scroll

#### Edge Cases
- [Edge case 1]
- [Edge case 2]

#### Dependencies
- Requires: [Other fixes]
- Blocks: [Other fixes]
```

### 4. Establish Breakpoint Strategy
**Goal**: Define consistent responsive breakpoints

**Recommended Breakpoints**:
```css
/* Extra small devices */
@media (max-width: 320px) {
  /* iPhone SE and smaller */
}

/* Small devices */
@media (min-width: 360px) {
  /* Most modern phones */
}

/* Landscape mobile */
@media (min-width: 568px) and (orientation: landscape) {
  /* Horizontal phones */
}

/* Tablet */
@media (min-width: 768px) {
  /* iPad and tablets */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop screens */
}

/* Large desktop */
@media (min-width: 1440px) {
  /* Large monitors */
}
```

### 5. CSS Architecture
**Goal**: Maintain clean, scalable styles

**Organization Pattern**:
```css
/* 1. CSS Variables */
:root {
  --spacing-unit: 0.25rem;
  --max-width-mobile: 480px;
  --max-width-tablet: 768px;
}

/* 2. Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 3. Layout Components */
.container { }
.header { }
.main { }

/* 4. UI Components */
.button { }
.card { }
.modal { }

/* 5. Utilities */
.sr-only { }
.text-center { }

/* 6. Responsive Overrides */
@media (min-width: 768px) { }
```

### 6. Component-Level Design
**Goal**: Design reusable, maintainable components

**Component Design Checklist**:
- [ ] Props interface defined
- [ ] Default values specified
- [ ] Responsive behavior documented
- [ ] Accessibility attributes included
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Empty states handled

**Example Component Design**:
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}

// Responsive sizing
const sizes = {
  sm: 'min-h-[36px] px-3 text-sm',
  md: 'min-h-[44px] px-4 text-base',
  lg: 'min-h-[52px] px-6 text-lg'
};
```

## Best Practices

### Design Principles
1. **Progressive Enhancement**: Start with mobile, enhance for larger screens
2. **Graceful Degradation**: Ensure fallbacks for unsupported features
3. **Consistency**: Use design tokens and shared patterns
4. **Performance**: Minimize CSS specificity and complexity
5. **Maintainability**: Document decisions and rationale

### CSS Best Practices
```css
/* ✅ Good: Flexible and maintainable */
.container {
  width: min(var(--max-width), 100% - 2rem);
  padding: clamp(1rem, 3vw, 2rem);
  gap: clamp(0.5rem, 2vw, 1rem);
}

/* ❌ Bad: Fixed and brittle */
.container {
  width: 480px;
  padding: 16px;
  gap: 8px;
}

/* ✅ Good: Semantic and accessible */
.button {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1.5rem;
}

/* ❌ Bad: Too small for touch */
.button {
  width: 32px;
  height: 32px;
  padding: 4px;
}
```

### Responsive Design Patterns

#### Fluid Typography
```css
/* Scale between min and max based on viewport */
font-size: clamp(1rem, 2vw + 0.5rem, 2rem);
line-height: 1.5;
```

#### Flexible Containers
```css
/* Adapt to available space */
width: min(480px, 100% - 2rem);
max-width: 100%;
margin-inline: auto;
```

#### Responsive Grids
```css
/* Auto-fit columns */
display: grid;
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
gap: clamp(1rem, 3vw, 2rem);
```

#### Adaptive Spacing
```css
/* Scale spacing with viewport */
padding: clamp(1rem, 4vw, 2rem);
margin-block: clamp(0.5rem, 2vh, 1.5rem);
```

### Accessibility Patterns

#### Focus Management
```css
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

#### Screen Reader Support
```typescript
// Visually hidden but accessible
<span className="sr-only">
  {accessibleLabel}
</span>

// ARIA labels
<button aria-label="Close dialog">
  <X size={20} aria-hidden="true" />
</button>
```

## Design Documentation Template

```markdown
# UI Fix Design Document

## Overview
**Issue**: [Brief description]
**Scope**: [Affected components]
**Priority**: [High/Medium/Low]
**Estimated Effort**: [Hours/Days]

## Design Principles
- [Principle 1]
- [Principle 2]
- [Principle 3]

## Proposed Solutions

### Solution 1: [Name]
[Detailed description]

**Pros**:
- [Pro 1]
- [Pro 2]

**Cons**:
- [Con 1]
- [Con 2]

**Implementation Complexity**: [Low/Medium/High]

### Solution 2: [Name]
[Alternative approach]

### Recommended Solution
[Chosen solution with rationale]

## Implementation Plan

### Phase 1: Core Fixes
1. [Fix 1]
2. [Fix 2]

### Phase 2: Enhancements
1. [Enhancement 1]
2. [Enhancement 2]

## Technical Specifications

### CSS Changes
[Detailed CSS modifications]

### Component Changes
[Component modifications]

### New Utilities
[New utility classes or functions]

## Responsive Behavior Matrix

| Breakpoint | Layout | Typography | Spacing | Components |
|------------|--------|------------|---------|------------|
| <320px     | ...    | ...        | ...     | ...        |
| 320-567px  | ...    | ...        | ...     | ...        |
| 568-767px  | ...    | ...        | ...     | ...        |
| 768-1023px | ...    | ...        | ...     | ...        |
| 1024px+    | ...    | ...        | ...     | ...        |

## Testing Strategy
- [ ] Unit tests
- [ ] Visual regression tests
- [ ] Accessibility tests
- [ ] Performance tests
- [ ] Cross-browser tests

## Rollout Plan
1. Development environment
2. Staging environment
3. Production (phased)

## Success Metrics
- [ ] All issues resolved
- [ ] No new regressions
- [ ] Performance maintained
- [ ] Accessibility improved
- [ ] User feedback positive

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| ...  | ...    | ...        |
```

## Integration with Other Skills

### Input from Investigation
- Issue list with priorities
- Root cause analysis
- Technical constraints
- User impact assessment

### Output to Implementation
- Detailed specifications
- Code examples
- Testing requirements
- Acceptance criteria

## Common Design Patterns

### Modal Optimization
```css
.modal-content {
  width: 100%;
  max-width: min(480px, 100% - 2rem);
  max-height: 85dvh; /* Safe height */
  padding: clamp(1.5rem, 4vw, 2rem);
  overflow-y: auto;
  overflow-x: hidden;
}
```

### Navigation Optimization
```css
.bottom-nav {
  position: fixed;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  min-width: min(280px, calc(100% - 2rem));
  max-width: calc(100% - 2rem);
  padding: 0.75rem clamp(1rem, 3vw, 1.5rem);
  gap: clamp(1rem, 3vw, 1.5rem);
}
```

### Chart Optimization
```css
.chart-container {
  height: clamp(220px, 40vh, 320px);
  width: 100%;
}

@media (orientation: landscape) {
  .chart-container {
    height: clamp(180px, 35vh, 280px);
  }
}
```

## Validation Checklist

Before finalizing design:
- [ ] All issues addressed
- [ ] Solutions follow best practices
- [ ] Responsive behavior defined
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Browser compatibility checked
- [ ] Testing strategy defined
- [ ] Documentation complete
- [ ] Edge cases handled
- [ ] Rollback plan exists

---

**Version**: 1.0  
**Last Updated**: 2026-02-09  
**Based On**: Mobile Responsive Fixes Design Phase
