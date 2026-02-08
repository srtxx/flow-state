# UI Fix Deployment Skill

## Purpose
Deploy UI/UX fixes to production safely and efficiently, with proper documentation, version control, and rollback capabilities.

## When to Use
- After implementation is complete and tested
- When deploying to staging or production
- For creating deployment documentation
- When updating project documentation
- For tracking deployment history

## Deployment Process

### 1. Pre-Deployment Validation
**Goal**: Ensure implementation is production-ready

**Validation Checklist**:
- [ ] All implementation complete
- [ ] Build successful
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests passing
- [ ] Visual verification done
- [ ] Accessibility verified
- [ ] Performance acceptable
- [ ] Documentation updated

**Commands**:
```bash
# Build check
npm run build

# Lint check
npm run lint

# Test check (if applicable)
npm test

# Type check
npx tsc --noEmit

# Diagnostics check
getDiagnostics({ paths: ["src/**/*.tsx", "src/**/*.css"] })
```

### 2. Version Control
**Goal**: Create clean, meaningful commit history

#### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `fix:` - Bug fixes
- `feat:` - New features
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions/changes
- `chore:` - Build process or auxiliary tool changes

#### Example Commit Messages

**For Bug Fixes**:
```bash
git commit -m "fix: モバイル表示の問題を修正

- レスポンシブなチャート高さ (clamp使用)
- FABボタンとボトムナビの配置を簡素化
- スコア表示のフォントサイズをレスポンシブ化
- ジャーナルページのスティッキーヘッダーを最適化
- 削除ボタンのタッチターゲットサイズを44px以上に
- モーダルの最大高さを85dvhに調整
- IntakeModalのグリッドをレスポンシブ化
- 320px以下の小型デバイス対応
- テキストの折り返し問題を修正
- オーバーフローの横スクロール防止"
```

**For Documentation**:
```bash
git commit -m "docs: モバイルレスポンシブ修正の完全なドキュメント作成

- 実施手順の詳細ドキュメント作成
- バックログ項目を完了ステータスに更新
- 10個の問題点と解決策を記録
- デプロイ情報とURL追加"
```

#### Git Workflow
```bash
# 1. Check status
git status

# 2. Stage changes
git add <files>

# 3. Commit with message
git commit -m "type: subject"

# 4. View commit history
git log --oneline -5

# 5. Push to remote (if configured)
git push origin <branch>
```

### 3. Build Process
**Goal**: Create optimized production build

#### Build Steps
```bash
# 1. Clean previous build
rm -rf dist

# 2. Run production build
npm run build

# 3. Verify build output
ls -lh dist/

# 4. Check bundle size
du -sh dist/
```

#### Build Optimization Checklist
- [ ] Bundle size acceptable
- [ ] No build warnings (or documented)
- [ ] Source maps generated
- [ ] Assets optimized
- [ ] Environment variables set
- [ ] Dependencies up to date

#### Build Output Analysis
```bash
# Example output
vite v7.3.1 building client environment for production...
✓ 2249 modules transformed.
dist/index.html                   1.21 kB │ gzip:   0.67 kB
dist/assets/index-DJpQ6n7T.css   13.36 kB │ gzip:   3.38 kB
dist/assets/index-_iGs-oUi.js   681.59 kB │ gzip: 199.83 kB
```

**What to Check**:
- CSS size reasonable (< 50 kB gzipped)
- JS size acceptable (< 250 kB gzipped for main bundle)
- No critical warnings
- All assets included

### 4. Deployment Methods

#### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Expected Output**:
```
Vercel CLI 50.13.2
🔍  Inspect: https://vercel.com/[org]/[project]/[deployment-id]
✅  Production: https://[project]-[hash].vercel.app
🔗  Aliased: https://[project].vercel.app
```

#### Method 2: Git Integration
```bash
# Push to main/master branch
git push origin main

# Vercel auto-deploys from git
# Check Vercel dashboard for status
```

#### Method 3: GitHub Actions (if configured)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 5. Deployment Verification
**Goal**: Confirm successful deployment

#### Verification Checklist
- [ ] Deployment completed successfully
- [ ] Production URL accessible
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Responsive behavior works
- [ ] Performance acceptable
- [ ] Analytics tracking (if applicable)

#### Manual Testing
```bash
# 1. Open production URL
open https://[project].vercel.app

# 2. Test on multiple devices
# - Desktop browser
# - Mobile browser (Chrome DevTools)
# - Tablet browser
# - Real devices (if available)

# 3. Check specific fixes
# - Navigate to affected pages
# - Test responsive breakpoints
# - Verify touch targets
# - Test accessibility features
```

#### Automated Verification
```bash
# Lighthouse audit
npx lighthouse https://[project].vercel.app --view

# Check for broken links
npx broken-link-checker https://[project].vercel.app

# Performance monitoring
# (Use tools like WebPageTest, GTmetrix)
```

### 6. Documentation
**Goal**: Create comprehensive deployment records

#### Deployment Document Template
```markdown
# [Feature Name] - Deployment Record

## 📅 Deployment Date
[Date and Time]

## 🚀 Deployment Information
- **Environment**: Production
- **Deployment Method**: Vercel CLI
- **Build Version**: [Version/Hash]
- **Deployment URL**: [URL]
- **Deployment ID**: [Vercel Deployment ID]

## 📝 Changes Deployed
### Files Modified
- `path/to/file1.tsx` - [Description]
- `path/to/file2.css` - [Description]

### Features Added
- [Feature 1]
- [Feature 2]

### Bugs Fixed
- [Bug 1]
- [Bug 2]

### Performance Improvements
- [Improvement 1]
- [Improvement 2]

## 🔍 Testing Results
### Pre-Deployment
- [x] Build successful
- [x] All tests passing
- [x] No linting errors
- [x] Visual verification complete

### Post-Deployment
- [x] Production URL accessible
- [x] All pages load correctly
- [x] Responsive behavior verified
- [x] No console errors

## 📊 Metrics
### Build Metrics
- Bundle size: [Size] (gzipped: [Size])
- Build time: [Time]
- Dependencies: [Count]

### Performance Metrics
- Lighthouse Score: [Score]
- First Contentful Paint: [Time]
- Time to Interactive: [Time]
- Cumulative Layout Shift: [Score]

## 🔗 Related Resources
- Investigation Report: [Link]
- Design Document: [Link]
- Implementation PR: [Link]
- Deployment Dashboard: [Link]

## 📋 Rollback Plan
### If Issues Occur
1. Revert to previous deployment: `vercel rollback [deployment-url]`
2. Or redeploy previous commit: `git revert [commit-hash]`
3. Monitor error logs: [Dashboard URL]

### Previous Deployment
- URL: [Previous URL]
- Deployment ID: [Previous ID]
- Commit Hash: [Hash]

## ✅ Sign-off
- [x] Deployment successful
- [x] Verification complete
- [x] Documentation updated
- [x] Stakeholders notified

---

**Deployed by**: [Name]
**Approved by**: [Name]
**Status**: ✅ Complete
```

### 7. Post-Deployment Tasks

#### Update Project Documentation
```markdown
# Update README.md
- Add deployment date
- Update version number
- Add changelog entry
- Update screenshots (if UI changed)

# Update CHANGELOG.md
## [Version] - [Date]
### Added
- [New features]

### Fixed
- [Bug fixes]

### Changed
- [Changes]

### Performance
- [Improvements]
```

#### Update Backlog
```markdown
# Mark completed items
- [x] Issue #123 - Mobile responsive fixes
- [x] Issue #124 - Touch target improvements

# Add deployment information
**Status**: ✅ Completed
**Deployed**: [Date]
**URL**: [Production URL]
```

#### Notify Stakeholders
```markdown
# Deployment Notification Template

Subject: [Project] - [Feature] Deployed to Production

Hi team,

The [feature name] has been successfully deployed to production.

**Deployment Details**:
- Date: [Date]
- URL: https://[project].vercel.app
- Changes: [Brief summary]

**What's New**:
- [Change 1]
- [Change 2]
- [Change 3]

**Testing**:
All pre-deployment tests passed, and post-deployment verification is complete.

**Documentation**:
- Full details: [Link to deployment doc]
- User guide: [Link if applicable]

Please test and provide feedback.

Thanks,
[Your name]
```

### 8. Monitoring and Maintenance

#### Set Up Monitoring
```javascript
// Error tracking (e.g., Sentry)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  release: process.env.VERCEL_GIT_COMMIT_SHA
});

// Analytics (e.g., Google Analytics)
gtag('config', 'GA_MEASUREMENT_ID', {
  page_path: window.location.pathname
});

// Performance monitoring
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Log performance metrics
  }
}).observe({ entryTypes: ['navigation', 'paint'] });
```

#### Monitor Key Metrics
- [ ] Error rate
- [ ] Page load time
- [ ] User engagement
- [ ] Bounce rate
- [ ] Core Web Vitals
- [ ] API response times

#### Regular Checks
```bash
# Daily
- Check error logs
- Monitor performance
- Review user feedback

# Weekly
- Analyze metrics trends
- Review accessibility
- Check for updates

# Monthly
- Security audit
- Dependency updates
- Performance optimization
```

## Best Practices

### Deployment Safety
1. **Always test before deploying**
   - Run full test suite
   - Manual testing on key flows
   - Cross-browser testing

2. **Use staging environment**
   - Deploy to staging first
   - Verify in production-like environment
   - Get stakeholder approval

3. **Deploy during low-traffic periods**
   - Minimize user impact
   - Easier to monitor
   - Faster rollback if needed

4. **Have rollback plan ready**
   - Know how to revert
   - Keep previous deployment accessible
   - Document rollback procedure

### Version Control Best Practices
```bash
# ✅ Good commit messages
git commit -m "fix: resolve mobile navigation overlap issue

- Adjust bottom nav positioning
- Update FAB button placement
- Add safe area insets support

Fixes #123"

# ❌ Bad commit messages
git commit -m "fix stuff"
git commit -m "updates"
git commit -m "wip"
```

### Documentation Best Practices
1. **Document everything**
   - What changed
   - Why it changed
   - How to test
   - How to rollback

2. **Keep documentation updated**
   - Update immediately after deployment
   - Include screenshots
   - Link related resources

3. **Make it searchable**
   - Use consistent naming
   - Add tags/labels
   - Include keywords

## Troubleshooting

### Common Deployment Issues

#### Issue: Build Fails
```bash
# Check build logs
npm run build 2>&1 | tee build.log

# Common causes:
- TypeScript errors
- Missing dependencies
- Environment variables
- Import errors

# Solution:
1. Fix errors locally
2. Test build locally
3. Commit fixes
4. Redeploy
```

#### Issue: Deployment Succeeds but Site Broken
```bash
# Check browser console
# Check network tab
# Check Vercel logs

# Common causes:
- Missing environment variables
- API endpoint issues
- CORS problems
- Asset loading failures

# Solution:
1. Check Vercel dashboard logs
2. Verify environment variables
3. Test API endpoints
4. Check asset URLs
```

#### Issue: Performance Degradation
```bash
# Run Lighthouse audit
npx lighthouse [url] --view

# Check bundle size
npm run build -- --analyze

# Common causes:
- Large bundle size
- Unoptimized images
- Too many dependencies
- Inefficient code

# Solution:
1. Optimize bundle
2. Lazy load components
3. Compress images
4. Remove unused dependencies
```

### Rollback Procedures

#### Vercel Rollback
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Or promote previous deployment
vercel promote [deployment-url]
```

#### Git Rollback
```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert [commit-hash]

# Reset to previous commit (use with caution)
git reset --hard [commit-hash]
git push --force
```

## Integration with Other Skills

### Input from Implementation Phase
- Completed code changes
- Build artifacts
- Test results
- Implementation documentation

### Output
- Deployed application
- Deployment documentation
- Updated project docs
- Monitoring setup

## Success Metrics
- [ ] Deployment completed successfully
- [ ] Zero downtime
- [ ] All features working
- [ ] Performance maintained
- [ ] No critical errors
- [ ] Documentation complete
- [ ] Stakeholders notified
- [ ] Monitoring active

## Deployment Checklist

### Pre-Deployment
- [ ] Implementation complete
- [ ] Build successful
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Stakeholders informed

### Deployment
- [ ] Version control updated
- [ ] Build created
- [ ] Deployed to production
- [ ] Deployment verified
- [ ] URL accessible

### Post-Deployment
- [ ] Verification complete
- [ ] Documentation updated
- [ ] Monitoring active
- [ ] Stakeholders notified
- [ ] Rollback plan ready

---

**Version**: 1.0  
**Last Updated**: 2026-02-09  
**Based On**: Mobile Responsive Fixes Deployment
