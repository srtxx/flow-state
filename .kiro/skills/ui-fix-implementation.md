# UI Fix Implementation Skill

## Purpose
Systematically implement UI/UX fixes based on design specifications, ensuring code quality, maintainability, and thorough testing.

## When to Use
- After design phase is complete and approved
- When implementing responsive design fixes
- For accessibility improvements
- During UI refactoring projects
- When fixing visual regressions

## Implementation Process

### 1. Pre-Implementation Setup
**Goal**: Prepare environment and understand requirements

**Steps**:
1. Review design document thoroughly
2. Understand all dependencies
3. Check current git status
4. Create feature branch (if applicable)
5. Verify development environment

**Checklist**:
- [ ] Design document reviewed
- [ ] All requirements understood
- [ ] Dependencies identified
- [ ] Development environment ready
- [ ] Backup/branch created

### 2. Implementation Strategy
**Goal**: Execute changes systematically and safely

**Order of Operations**:
1. **CSS/Style Changes First**
   - Update global styles
   - Modify component styles
   - Add responsive rules
   - Update CSS variables

2. **Component Structure Changes**
   - Update JSX/TSX structure
   - Modify props and interfaces
   - Add accessibility attributes
   - Update class names

3. **Logic Changes (if needed)**
   - Update state management
   - Modify event handlers
   - Add utility functions

4. **Documentation Updates**
   - Update component comments
   - Add JSDoc annotations
   - Update README if needed

### 3. CSS Implementation Best Practices

#### Use strReplace for Precision
```typescript
// Always use strReplace for CSS changes
strReplace({
  path: "src/App.css",
  oldStr: `/* Exact old code with context */
.selector {
  property: old-value;
}`,
  newStr: `/* Updated code with comments */
.selector {
  property: new-value; /* Explanation */
}`
})
```

#### Include Context Lines
```css
/* ✅ Good: Include surrounding code for uniqueness */
.parent-class {
  /* ... */
}

.target-class {
  property: old-value;
}

.next-class {
  /* ... */
}

/* ❌ Bad: Too isolated, might match multiple places */
.target-class {
  property: old-value;
}
```

#### Group Related Changes
```typescript
// Make related CSS changes together
strReplace({
  path: "src/App.css",
  oldStr: `/* Chart Container */
.main-chart-container {
  margin: 1rem 0;
  padding: 0;
  height: 280px;
  width: 100%;
}`,
  newStr: `/* Chart Container */
.main-chart-container {
  margin: 1rem 0;
  padding: 0;
  height: clamp(220px, 40vh, 320px); /* Responsive height */
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}`
})
```

### 4. Component Implementation Best Practices

#### Update Props and Interfaces
```typescript
// Add new props with proper types
interface ComponentProps {
  // Existing props
  existingProp: string;
  
  // New props with documentation
  /** Responsive size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Enable full width on mobile */
  fullWidthMobile?: boolean;
}
```

#### Add Accessibility Attributes
```typescript
// Before
<button onClick={handleClick}>
  <Icon size={20} />
</button>

// After
<button 
  onClick={handleClick}
  aria-label="Close dialog"
  style={{ minWidth: '44px', minHeight: '44px' }}
>
  <Icon size={20} aria-hidden="true" />
</button>
```

#### Use Semantic Class Names
```typescript
// Before
<div className="mb-8 p-4 bg-white rounded-2xl">

// After
<div className="journal-summary-card mb-8 p-4 bg-white rounded-2xl">
```

### 5. Responsive Implementation Patterns

#### Mobile-First CSS
```css
/* Base styles (mobile) */
.component {
  font-size: 1rem;
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    font-size: 1.125rem;
    padding: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    font-size: 1.25rem;
    padding: 2rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

#### Fluid Sizing
```css
/* Typography */
.heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
}

/* Spacing */
.container {
  padding: clamp(1rem, 3vw, 2rem);
  gap: clamp(0.5rem, 2vw, 1rem);
}

/* Dimensions */
.element {
  width: min(480px, 100% - 2rem);
  height: clamp(200px, 40vh, 400px);
}
```

#### Grid Responsiveness
```css
/* Auto-responsive grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
}

/* Explicit breakpoints */
.intake-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 568px) and (orientation: landscape) {
  .intake-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .intake-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### 6. Testing During Implementation

#### Continuous Validation
```typescript
// After each significant change, run diagnostics
getDiagnostics({
  paths: ["src/App.css", "src/components/Modal.tsx"]
})

// Check for TypeScript errors
executeBash({ command: "npm run build" })
```

#### Visual Verification Checklist
- [ ] Changes applied correctly
- [ ] No syntax errors
- [ ] No TypeScript errors
- [ ] Styles render as expected
- [ ] Responsive behavior works
- [ ] No console errors
- [ ] No visual regressions

### 7. Implementation Workflow

#### Step-by-Step Process
```typescript
// 1. Read current code
readFile({
  path: "src/App.css",
  explanation: "Review current styles before modification"
})

// 2. Make changes with strReplace
strReplace({
  path: "src/App.css",
  oldStr: "/* exact old code */",
  newStr: "/* new code with comments */"
})

// 3. Verify changes
getDiagnostics({
  paths: ["src/App.css"]
})

// 4. Test build
executeBash({
  command: "npm run build"
})

// 5. Repeat for next change
```

#### Parallel Changes
```typescript
// When changes are independent, use parallel strReplace
// Example: Multiple CSS sections
strReplace({ path: "src/App.css", oldStr: "...", newStr: "..." })
strReplace({ path: "src/components/Modal.tsx", oldStr: "...", newStr: "..." })
strReplace({ path: "src/pages/Dashboard.tsx", oldStr: "...", newStr: "..." })
```

### 8. Common Implementation Patterns

#### Pattern 1: Fixed to Responsive Dimension
```typescript
// Before
.element {
  width: 480px;
  height: 280px;
  padding: 16px;
}

// After
.element {
  width: min(480px, 100% - 2rem);
  height: clamp(220px, 40vh, 320px);
  padding: clamp(1rem, 3vw, 2rem);
}
```

#### Pattern 2: Add Responsive Breakpoints
```typescript
// Before
.grid {
  grid-template-columns: repeat(2, 1fr);
}

// After
.grid {
  grid-template-columns: repeat(2, 1fr);
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### Pattern 3: Improve Touch Targets
```typescript
// Before
<button className="btn-ghost p-2">
  <Icon size={18} />
</button>

// After
<button 
  className="btn-ghost p-3"
  style={{ minWidth: '44px', minHeight: '44px' }}
  aria-label="Delete item"
>
  <Icon size={18} />
</button>
```

#### Pattern 4: Fix Overflow Issues
```typescript
// Before
.container {
  overflow-y: auto;
}

// After
.container {
  overflow-y: auto;
  overflow-x: hidden; /* Prevent horizontal scroll */
  max-width: 100%; /* Ensure containment */
}
```

#### Pattern 5: Optimize Modal Height
```typescript
// Before
.modal-content {
  max-height: 90vh;
  padding: 2rem;
}

// After
.modal-content {
  max-height: 85dvh; /* Safer height */
  padding: clamp(1.5rem, 4vw, 2rem); /* Responsive padding */
  overflow-y: auto;
  overflow-x: hidden;
}
```

## Error Handling

### Common Errors and Solutions

#### Error: String Not Found
```typescript
// Problem: oldStr doesn't match exactly
// Solution: Read file first, copy exact text including whitespace

readFile({ path: "src/App.css", start_line: 100, end_line: 120 })
// Copy exact text from output
strReplace({
  oldStr: "/* Exact text from file including all whitespace */"
})
```

#### Error: Multiple Matches
```typescript
// Problem: oldStr matches multiple locations
// Solution: Include more context

// ❌ Too generic
oldStr: `.button { padding: 1rem; }`

// ✅ Unique with context
oldStr: `/* Primary Button */
.button-primary {
  padding: 1rem;
  background: var(--primary);
}`
```

#### Error: TypeScript Errors After Change
```typescript
// Problem: Props interface not updated
// Solution: Update interface first

// 1. Update interface
strReplace({
  path: "src/components/Button.tsx",
  oldStr: `interface ButtonProps {
  onClick: () => void;
}`,
  newStr: `interface ButtonProps {
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}`
})

// 2. Then update component
```

### Recovery Strategies

#### If Build Fails
1. Check diagnostics: `getDiagnostics({ paths: [...] })`
2. Review recent changes
3. Fix syntax errors
4. Verify imports
5. Check TypeScript types
6. Re-run build

#### If Visual Regression
1. Review CSS specificity
2. Check z-index conflicts
3. Verify media query order
4. Test in isolation
5. Use browser DevTools
6. Compare with design

## Best Practices

### Code Quality
- [ ] Follow existing code style
- [ ] Add explanatory comments
- [ ] Use semantic naming
- [ ] Maintain consistency
- [ ] Keep changes focused
- [ ] Avoid over-engineering

### Performance
- [ ] Minimize CSS specificity
- [ ] Avoid expensive selectors
- [ ] Use CSS containment
- [ ] Optimize animations
- [ ] Lazy load when possible
- [ ] Monitor bundle size

### Accessibility
- [ ] Add ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Maintain focus management
- [ ] Test with screen reader
- [ ] Verify color contrast
- [ ] Support reduced motion

### Maintainability
- [ ] Document complex logic
- [ ] Use CSS variables
- [ ] Create reusable patterns
- [ ] Follow DRY principle
- [ ] Keep specificity low
- [ ] Organize logically

## Implementation Checklist

### Before Starting
- [ ] Design document reviewed
- [ ] Requirements understood
- [ ] Environment prepared
- [ ] Dependencies checked
- [ ] Backup created

### During Implementation
- [ ] Changes made systematically
- [ ] Code quality maintained
- [ ] Tests run continuously
- [ ] Errors fixed immediately
- [ ] Progress documented

### After Implementation
- [ ] All changes applied
- [ ] Build successful
- [ ] No diagnostics errors
- [ ] Visual verification done
- [ ] Ready for testing phase

## Integration with Other Skills

### Input from Design Phase
- Detailed specifications
- Code examples
- Testing requirements
- Acceptance criteria

### Output to Deployment Phase
- Completed implementation
- Build artifacts
- Test results
- Change documentation

## Example Implementation Flow

```typescript
// 1. Start with CSS changes
strReplace({
  path: "src/App.css",
  oldStr: "/* Chart Container */\n.main-chart-container {\n  height: 280px;\n}",
  newStr: "/* Chart Container */\n.main-chart-container {\n  height: clamp(220px, 40vh, 320px);\n}"
})

// 2. Update component structure
strReplace({
  path: "src/pages/JournalPage.tsx",
  oldStr: '<div className="mb-8 p-4">',
  newStr: '<div className="journal-summary-card mb-8 p-4">'
})

// 3. Add accessibility
strReplace({
  path: "src/pages/JournalPage.tsx",
  oldStr: '<button className="btn-ghost p-2">',
  newStr: '<button className="btn-ghost p-3" style={{ minWidth: "44px", minHeight: "44px" }}>'
})

// 4. Verify changes
getDiagnostics({
  paths: ["src/App.css", "src/pages/JournalPage.tsx"]
})

// 5. Test build
executeBash({ command: "npm run build" })
```

## Success Metrics
- All design specifications implemented
- Zero build errors
- Zero diagnostic errors
- All tests passing
- Visual verification complete
- Performance maintained
- Accessibility improved

---

**Version**: 1.0  
**Last Updated**: 2026-02-09  
**Based On**: Mobile Responsive Fixes Implementation
