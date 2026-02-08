# UI Issue Investigation Skill

## Purpose
Systematically investigate and document UI/UX issues in web applications, particularly focusing on responsive design, mobile compatibility, and accessibility concerns.

## When to Use
- User reports display issues on specific devices
- Visual regression testing reveals problems
- Accessibility audits identify concerns
- Performance issues related to UI rendering
- Cross-browser compatibility problems

## Investigation Process

### 1. Initial Assessment
**Goal**: Understand the scope and context of the issue

**Steps**:
1. Read user's description of the problem
2. Identify affected components/pages
3. Determine device/browser context if provided
4. Check existing backlog items for related issues

**Tools**:
- `readFile` - Review component code
- `readMultipleFiles` - Check related files
- `grepSearch` - Find similar patterns
- `listDirectory` - Explore project structure

### 2. Code Analysis
**Goal**: Identify root causes through systematic code review

**Steps**:
1. **Read main application files**:
   - Layout components (`Layout.tsx`, `App.tsx`)
   - Page components (Dashboard, Journal, Profile, etc.)
   - Shared components (Modals, Navigation, etc.)
   - Style files (`App.css`, component-specific CSS)

2. **Look for common issues**:
   - Fixed dimensions (px instead of responsive units)
   - Missing media queries
   - Overflow issues (`overflow-x`, `overflow-y`)
   - Z-index conflicts
   - Position calculations (especially with `calc()`)
   - Touch target sizes (<44px)
   - Text overflow (`whitespace-nowrap` without `overflow`)
   - Viewport units without fallbacks

3. **Check responsive patterns**:
   - Use of `clamp()`, `min()`, `max()`
   - Media query breakpoints
   - Flexible layouts (flexbox, grid)
   - Container queries (if applicable)

**Example Analysis Pattern**:
```typescript
// Read core files
readMultipleFiles([
  "src/App.tsx",
  "src/App.css",
  "src/components/Layout.tsx",
  "src/pages/DashboardPage.tsx"
])

// Search for potential issues
grepSearch("position: fixed")
grepSearch("height: \\d+px")
grepSearch("width: \\d+px")
```

### 3. Issue Categorization
**Goal**: Organize findings into actionable categories

**Categories**:
1. **Layout Issues**
   - Container widths
   - Spacing and padding
   - Alignment problems

2. **Responsive Issues**
   - Fixed dimensions
   - Missing breakpoints
   - Viewport-specific problems

3. **Accessibility Issues**
   - Touch target sizes
   - Color contrast
   - Focus indicators
   - Screen reader support

4. **Performance Issues**
   - Large images
   - Unnecessary re-renders
   - Heavy animations

5. **Cross-browser Issues**
   - Vendor prefixes
   - Feature support
   - Polyfills needed

### 4. Documentation Structure
**Goal**: Create clear, actionable documentation

**Template**:
```markdown
# [Issue Type] - Investigation Report

## 📅 Investigation Date
[Date]

## 🔍 Discovered Issues

### [Issue Number]. [Issue Title]
- **Problem**: [Clear description]
- **Location**: [File path and line numbers]
- **Impact**: [User experience impact]
- **Severity**: [Critical/High/Medium/Low]
- **Affected Devices**: [Device types/sizes]

### Root Cause Analysis
[Technical explanation]

### Reproduction Steps
1. [Step 1]
2. [Step 2]
...

### Evidence
- Code snippet
- Screenshot reference
- Console errors
```

## Best Practices

### Investigation Checklist
- [ ] Read user's complete description
- [ ] Check existing documentation/backlog
- [ ] Review main application structure
- [ ] Analyze CSS/styling approach
- [ ] Check component hierarchy
- [ ] Test responsive breakpoints
- [ ] Verify accessibility standards
- [ ] Document all findings systematically
- [ ] Prioritize issues by severity
- [ ] Provide reproduction steps

### Common Pitfalls to Avoid
1. **Jumping to solutions too quickly** - Investigate thoroughly first
2. **Missing context** - Always check related components
3. **Incomplete documentation** - Record all findings, not just major ones
4. **Ignoring edge cases** - Consider extreme viewport sizes
5. **Forgetting accessibility** - Always check WCAG compliance

### Responsive Design Red Flags
```css
/* ❌ Avoid */
.container { width: 480px; }
.button { font-size: 16px; }
.modal { max-height: 90vh; }

/* ✅ Prefer */
.container { width: min(480px, 100% - 2rem); }
.button { font-size: clamp(14px, 2vw, 16px); }
.modal { max-height: 85dvh; }
```

### Accessibility Checklist
- [ ] Touch targets ≥44px × 44px
- [ ] Color contrast ratio ≥4.5:1 (text)
- [ ] Color contrast ratio ≥3:1 (UI components)
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] No horizontal scrolling on mobile

## Output Format

### Investigation Report Structure
1. **Executive Summary**
   - Total issues found
   - Severity breakdown
   - Estimated impact

2. **Detailed Findings**
   - Each issue with full context
   - Code references
   - Visual examples

3. **Recommendations**
   - Prioritized fix list
   - Estimated effort
   - Dependencies

4. **Next Steps**
   - Design phase requirements
   - Testing requirements
   - Documentation needs

## Example Usage

### Scenario: Mobile Display Issues
```markdown
User reports: "The app looks broken on my iPhone SE"

Investigation Process:
1. Check viewport sizes (iPhone SE: 375×667)
2. Review responsive breakpoints
3. Test fixed-width elements
4. Check touch target sizes
5. Verify safe area insets
6. Test landscape orientation

Findings:
- Bottom nav too wide (min-width: 280px on 320px screen)
- FAB button overlaps nav
- Score display too large (5.5rem on small screen)
- Delete button too small (32px × 32px)
```

## Integration with Other Skills

### Workflow Connection
```
Investigation → Design → Implementation → Deployment
     ↓              ↓            ↓              ↓
  This Skill   Design Skill  Fix Skill   Deploy Skill
```

### Handoff to Design Phase
Provide:
- Complete issue list with priorities
- Technical constraints
- Affected components
- Recommended approaches
- Testing requirements

## Metrics for Success
- All issues documented with severity
- Root causes identified
- Reproduction steps provided
- Impact assessment complete
- Recommendations prioritized
- Estimated effort provided

## Related Resources
- WCAG 2.1 Guidelines
- Mobile-First Design Principles
- CSS Responsive Design Patterns
- Accessibility Testing Tools
- Browser DevTools Documentation

---

**Version**: 1.0  
**Last Updated**: 2026-02-09  
**Based On**: Mobile Responsive Fixes Investigation
