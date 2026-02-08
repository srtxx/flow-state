# Kiro Skills - UI/UX Fix Workflow

## Overview
This directory contains a comprehensive set of skills for systematically investigating, designing, implementing, and deploying UI/UX fixes in web applications. These skills are based on real-world experience fixing mobile responsive issues and follow industry best practices.

## Skills Collection

### 1. UI Issue Investigation (`ui-issue-investigation.md`)
**Purpose**: Systematically investigate and document UI/UX issues

**When to Use**:
- User reports display issues
- Visual regression detected
- Accessibility concerns identified
- Performance issues related to UI
- Cross-browser compatibility problems

**Key Features**:
- Structured investigation process
- Issue categorization framework
- Root cause analysis methods
- Documentation templates
- Responsive design red flags
- Accessibility checklist

**Output**: Comprehensive investigation report with prioritized issues

---

### 2. UI Fix Design (`ui-fix-design.md`)
**Purpose**: Design comprehensive, maintainable solutions for UI/UX issues

**When to Use**:
- After completing investigation
- Before implementing fixes
- Planning major UI refactors
- Establishing responsive patterns
- Creating reusable components

**Key Features**:
- Design principles and patterns
- Responsive design strategies
- CSS architecture guidelines
- Component design patterns
- Accessibility standards
- Testing strategy templates

**Output**: Detailed design document with implementation specifications

---

### 3. UI Fix Implementation (`ui-fix-implementation.md`)
**Purpose**: Systematically implement UI/UX fixes with quality and testing

**When to Use**:
- After design approval
- Implementing responsive fixes
- Making accessibility improvements
- During UI refactoring
- Fixing visual regressions

**Key Features**:
- Step-by-step implementation process
- CSS best practices
- Component update patterns
- Testing during implementation
- Error handling strategies
- Code quality guidelines

**Output**: Completed, tested implementation ready for deployment

---

### 4. UI Fix Deployment (`ui-fix-deployment.md`)
**Purpose**: Deploy fixes safely with proper documentation and monitoring

**When to Use**:
- After implementation complete
- Deploying to staging/production
- Creating deployment docs
- Updating project documentation
- Setting up monitoring

**Key Features**:
- Pre-deployment validation
- Version control best practices
- Build and deployment process
- Verification procedures
- Documentation templates
- Monitoring setup
- Rollback procedures

**Output**: Successfully deployed application with complete documentation

---

## Complete Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    UI/UX Fix Workflow                        │
└─────────────────────────────────────────────────────────────┘

1. INVESTIGATION
   ├─ Identify issues
   ├─ Analyze root causes
   ├─ Categorize problems
   ├─ Prioritize fixes
   └─ Document findings
        │
        ▼
2. DESIGN
   ├─ Review investigation
   ├─ Define principles
   ├─ Design solutions
   ├─ Create specifications
   └─ Plan implementation
        │
        ▼
3. IMPLEMENTATION
   ├─ Setup environment
   ├─ Apply CSS changes
   ├─ Update components
   ├─ Test continuously
   └─ Verify quality
        │
        ▼
4. DEPLOYMENT
   ├─ Validate build
   ├─ Commit changes
   ├─ Deploy to production
   ├─ Verify deployment
   └─ Document & monitor
```

## Quick Start Guide

### Step 1: Investigation
```bash
# Activate investigation skill
Use skill: ui-issue-investigation.md

# Follow investigation process:
1. Read user's issue description
2. Analyze codebase systematically
3. Document all findings
4. Prioritize by severity
5. Create investigation report
```

### Step 2: Design
```bash
# Activate design skill
Use skill: ui-fix-design.md

# Follow design process:
1. Review investigation findings
2. Define design principles
3. Create solution specifications
4. Document responsive behavior
5. Plan testing strategy
```

### Step 3: Implementation
```bash
# Activate implementation skill
Use skill: ui-fix-implementation.md

# Follow implementation process:
1. Setup environment
2. Apply changes systematically
3. Test continuously
4. Verify with diagnostics
5. Ensure build success
```

### Step 4: Deployment
```bash
# Activate deployment skill
Use skill: ui-fix-deployment.md

# Follow deployment process:
1. Validate pre-deployment
2. Commit with proper messages
3. Build for production
4. Deploy to Vercel
5. Verify and document
```

## Real-World Example

### Case Study: Mobile Responsive Fixes
**Date**: 2026-02-09  
**Project**: Flow State App  
**Issues**: 10 mobile display problems

#### Investigation Phase
- Identified 10 distinct issues
- Categorized by severity
- Documented root causes
- Created prioritized list

**Time**: ~30 minutes

#### Design Phase
- Designed responsive solutions
- Established CSS patterns
- Created implementation specs
- Defined testing requirements

**Time**: ~45 minutes

#### Implementation Phase
- Modified 3 files
- Applied 10+ fixes
- Tested continuously
- Zero errors at completion

**Time**: ~60 minutes

#### Deployment Phase
- Built successfully
- Committed with documentation
- Deployed to production
- Verified all fixes

**Time**: ~15 minutes

**Total Time**: ~2.5 hours  
**Result**: All issues resolved, deployed to production

## Best Practices Summary

### Investigation
✅ **Do**:
- Read all related code
- Document everything
- Prioritize by impact
- Include reproduction steps
- Check accessibility

❌ **Don't**:
- Jump to solutions
- Miss edge cases
- Ignore context
- Skip documentation
- Forget mobile testing

### Design
✅ **Do**:
- Follow mobile-first
- Use responsive units
- Plan for accessibility
- Document decisions
- Consider performance

❌ **Don't**:
- Use fixed dimensions
- Ignore breakpoints
- Skip accessibility
- Over-engineer
- Forget edge cases

### Implementation
✅ **Do**:
- Test continuously
- Use strReplace carefully
- Include context
- Verify with diagnostics
- Maintain code quality

❌ **Don't**:
- Make blind changes
- Skip testing
- Ignore errors
- Rush implementation
- Forget comments

### Deployment
✅ **Do**:
- Validate thoroughly
- Write clear commits
- Document everything
- Verify deployment
- Monitor after deploy

❌ **Don't**:
- Skip validation
- Use vague commits
- Deploy without testing
- Forget documentation
- Ignore monitoring

## Common Patterns

### Responsive Design Patterns
```css
/* Fluid Typography */
font-size: clamp(1rem, 2vw + 0.5rem, 2rem);

/* Flexible Containers */
width: min(480px, 100% - 2rem);

/* Responsive Spacing */
padding: clamp(1rem, 3vw, 2rem);
gap: clamp(0.5rem, 2vw, 1rem);

/* Adaptive Heights */
height: clamp(200px, 40vh, 400px);
```

### Accessibility Patterns
```css
/* Touch Targets */
min-width: 44px;
min-height: 44px;

/* Focus Indicators */
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Component Patterns
```typescript
// Responsive Props
interface ComponentProps {
  size?: 'sm' | 'md' | 'lg';
  fullWidthMobile?: boolean;
  'aria-label'?: string;
}

// Accessibility Attributes
<button
  aria-label="Close dialog"
  style={{ minWidth: '44px', minHeight: '44px' }}
>
  <Icon aria-hidden="true" />
</button>
```

## Troubleshooting

### Investigation Issues
**Problem**: Can't find root cause  
**Solution**: Read more context, check related components

**Problem**: Too many issues  
**Solution**: Group by category, prioritize by severity

### Design Issues
**Problem**: Solution too complex  
**Solution**: Start with minimum viable fix, iterate

**Problem**: Conflicting requirements  
**Solution**: Discuss trade-offs, document decisions

### Implementation Issues
**Problem**: strReplace fails  
**Solution**: Read exact text, include more context

**Problem**: Build errors  
**Solution**: Check diagnostics, fix incrementally

### Deployment Issues
**Problem**: Build fails  
**Solution**: Test locally first, check logs

**Problem**: Site broken after deploy  
**Solution**: Check console, verify environment variables

## Resources

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [A11y Project](https://www.a11yproject.com/)

### Tools
- Chrome DevTools
- Lighthouse
- axe DevTools
- React DevTools
- Vercel Dashboard

### Testing
- Manual testing on real devices
- Browser DevTools device emulation
- Accessibility testing tools
- Performance monitoring
- Error tracking (Sentry, etc.)

## Metrics for Success

### Investigation
- All issues documented
- Root causes identified
- Priorities assigned
- Reproduction steps provided

### Design
- Solutions specified
- Responsive behavior defined
- Accessibility requirements met
- Testing strategy created

### Implementation
- All changes applied
- Zero build errors
- Tests passing
- Code quality maintained

### Deployment
- Deployment successful
- Verification complete
- Documentation updated
- Monitoring active

## Version History

### v1.0 (2026-02-09)
- Initial release
- Based on mobile responsive fixes project
- Includes all 4 workflow skills
- Complete documentation

## Contributing

To improve these skills:
1. Use them in real projects
2. Document lessons learned
3. Update with new patterns
4. Share improvements
5. Keep examples current

## License

These skills are part of the Kiro AI Assistant system and are provided for use within the Kiro environment.

---

**Created**: 2026-02-09  
**Last Updated**: 2026-02-09  
**Version**: 1.0  
**Status**: Active
