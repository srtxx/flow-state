# Sample Report Guide

This document explains each section of the sample report and how to interpret the results.

## Overview

The `SAMPLE_REPORT.md` file demonstrates a typical output from the Document Organization System. It shows what you can expect when running the analysis on your workspace.

## Report Sections Explained

### 1. Header and Metadata

```markdown
**Generated**: 2024-01-15T14:30:00.000Z
**Workspace**: `/Users/username/projects/my-workspace`
**Configuration Used**: ...
```

**Purpose**: Provides context about when and where the analysis was run.

**What to look for**:
- Timestamp helps track when analysis was performed
- Workspace path confirms you're analyzing the correct directory
- Configuration shows which settings were used

---

### 2. Summary Section

```markdown
## Summary
- **Total Documents**: 45
- **Necessary (必要)**: 28
- **Needs Review (要確認)**: 10
- **Unnecessary (不要)**: 7
```

**Purpose**: High-level overview of analysis results.

**How to interpret**:
- **High "Necessary" count**: Good! Most documents are valuable
- **High "Unnecessary" count**: Opportunity for cleanup
- **High "Needs Review" count**: Manual review needed
- **Duplicates Found**: Indicates redundant files

**Action items**:
- If >30% are unnecessary: Consider workspace cleanup
- If >40% need review: May need to adjust thresholds
- If many duplicates: Review file management practices

---

### 3. Necessary Documents Section

```markdown
## 必要 (Necessary) - 28 documents

### .kiro/specs/user-authentication/design.md
**Score**: 92/100 | **Status**: 必要 (Necessary)
```

**Purpose**: Lists documents that should definitely be kept.

**What each document shows**:

- **Score**: 0-100 importance rating
- **Metadata**: File size, dates, category, line count
- **References**: How many documents link to/from this file
- **Reasoning**: Why this score was assigned
- **Recommendation**: What action to take

**How to use this section**:
- Generally, no action needed for these documents
- Review reasoning to understand what makes documents important
- Use as examples when creating new documentation

**Red flags to watch for**:
- High score but you know the document is outdated
- Document you don't recognize with high score
- May indicate need to review and update

---

### 4. Needs Review Section

```markdown
## 要確認 (Needs Review) - 10 documents

### backlog/feature-ideas.md
**Score**: 52/100 | **Status**: 要確認 (Needs Review)
```

**Purpose**: Documents that require manual review to determine their fate.

**Common reasons for this status**:
- Moderate age (1-3 months old)
- Few references (1-2)
- Medium-sized content
- Transitional state

**How to review these documents**:

1. **Read the document**
   - Is the content still relevant?
   - Has it been superseded by something else?
   - Is it a work in progress?

2. **Check references**
   - Are the outgoing references still valid?
   - Should other documents reference this?

3. **Make a decision**:
   - **Keep**: Update if needed, ensure it's referenced
   - **Archive**: Move to archive if historical value
   - **Delete**: Remove if no longer relevant

**Example review process**:

```bash
# 1. Open the document
cat backlog/feature-ideas.md

# 2. Search for references to it
grep -r "feature-ideas.md" .

# 3. Decide and act
# If keeping: maybe update and add references
# If archiving: mv backlog/feature-ideas.md archive/
# If deleting: rm backlog/feature-ideas.md
```

---

### 5. Unnecessary Documents Section

```markdown
## 不要 (Unnecessary) - 7 documents

### backlog/old-ideas-2023-q1.md
**Score**: 18/100 | **Status**: 不要 (Unnecessary)
```

**Purpose**: Documents that can likely be archived or deleted.

**Common characteristics**:
- No references (orphaned)
- Very old (6+ months)
- Small size (incomplete)
- Duplicates
- Temporary files

**How to interpret scores**:
- **0-10**: Very safe to delete (empty, temp files)
- **11-20**: Safe to delete (old, no references)
- **21-30**: Consider archiving (may have historical value)

**Before deleting**:
1. ✅ Review the reasoning
2. ✅ Check if you recognize the file
3. ✅ Create a backup/archive
4. ✅ Move (don't delete immediately)
5. ✅ Test workspace
6. ✅ Delete permanently only after verification

---

### 6. Deletion Recommendations Section

```markdown
## Deletion Recommendations

### Create Archive Directory
mkdir -p archive/$(date +%Y%m%d)
```

**Purpose**: Provides actionable commands for cleanup.

**Structure**:
- **Safety notice**: Reminds you to be careful
- **Archive setup**: Commands to create backup
- **Prioritized lists**: High/medium/low priority deletions
- **Batch operations**: Commands to move multiple files
- **Verification steps**: How to test after cleanup

**How to use**:

1. **Don't rush**: Review each file individually first
2. **Create archive**: Always create backup before deleting
3. **Start with high priority**: These are safest to remove
4. **Test incrementally**: Move a few files, test, repeat
5. **Wait before permanent deletion**: Keep archive for 30+ days

**Safety tips**:
- ✅ Use `mv` not `rm` initially
- ✅ Test your workspace after each batch
- ✅ Keep archives for at least 30 days
- ✅ Use version control as additional backup
- ❌ Don't delete everything at once
- ❌ Don't skip the testing step

---

### 7. Reference Graph Insights Section

```markdown
## Reference Graph Insights

### Most Referenced Documents (Top 5)
1. **docs/api-reference.md** - 12 incoming references
```

**Purpose**: Shows document relationships and connectivity.

**Subsections**:

#### Most Referenced Documents
- Shows which documents are central to your workspace
- High reference count = important hub documents
- These should be well-maintained and up-to-date

**Action items**:
- Ensure these documents are current
- Consider these when planning updates
- Use as templates for new documentation

#### Orphaned Documents
- Documents with no references at all
- May be forgotten or abandoned
- Prime candidates for review/archival

**Action items**:
- Review each orphaned document
- Add references if document is valuable
- Archive if no longer needed

#### Category Distribution
- Shows breakdown by document type
- Average scores by category
- Helps identify patterns

**Insights**:
- Low average for a category = needs attention
- High count in one category = may need organization
- Compare to your expectations

---

### 8. Duplicate Analysis Section

```markdown
## Duplicate Analysis

### Exact Duplicates (1 pair)
**docs/README.md** ↔ **docs/README-backup.md**
```

**Purpose**: Identifies redundant files.

**Types of duplicates**:

1. **Exact Duplicates (100% match)**
   - Identical content hash
   - Safe to delete one copy
   - Usually backups or copies

2. **Similar Documents (60-99% match)**
   - High similarity but not identical
   - May be versions or variations
   - Review differences before deciding

**How to handle**:

```bash
# For exact duplicates
# 1. Verify they're truly identical
diff file1.md file2.md

# 2. Check which is current
ls -la file1.md file2.md

# 3. Delete the older/backup version
mv file2.md archive/

# For similar documents
# 1. Compare to see differences
diff file1.md file2.md

# 2. Decide if both are needed
# 3. Consider consolidating into one
```

---

### 9. Errors and Warnings Section

```markdown
## Errors and Warnings

### Errors (1)
#### Error reading file: .kiro/specs/locked-feature/design.md
```

**Purpose**: Lists issues encountered during analysis.

**Types of issues**:

1. **Errors** (Critical)
   - File permission denied
   - File not readable
   - Corrupted files
   - **Impact**: File not analyzed

2. **Warnings** (Non-critical)
   - Directory not found
   - Invalid file format
   - Metadata extraction issues
   - **Impact**: Partial analysis or defaults used

**How to resolve**:

```bash
# Permission errors
chmod 644 path/to/file.md

# Missing directories
mkdir -p path/to/directory

# Or update config to exclude
# Edit config.json to remove from includePaths
```

**When to worry**:
- ✅ A few warnings: Normal, usually config issues
- ⚠️ Many errors: Check file system permissions
- 🚨 Errors on important files: Fix immediately

---

### 10. Recommendations Summary Section

```markdown
## Recommendations Summary

### Immediate Actions
1. **Review "要確認" documents** (10 documents)
```

**Purpose**: Prioritized action plan based on analysis.

**Structure**:
- **Immediate actions**: Do these first
- **Ongoing maintenance**: Regular practices
- **Configuration tuning**: Adjust settings

**How to use**:
1. Start with immediate actions
2. Complete within 1-2 days
3. Implement ongoing maintenance
4. Adjust configuration based on results

---

### 11. Appendix: Understanding the Scoring System

```markdown
## Appendix: Understanding the Scoring System

### How Importance Scores Are Calculated
```

**Purpose**: Explains the scoring algorithm in detail.

**What's included**:
- Breakdown of each factor (reference count, recency, category, size)
- Point ranges for each factor
- Status assignment rules
- Special cases

**How to use**:
- Understand why documents got their scores
- Identify which factors matter most
- Adjust configuration weights if needed
- Predict scores for new documents

**Example**:
If a document has:
- 5 references → ~28 points (40% weight)
- Modified 2 days ago → ~27 points (30% weight)
- Category: spec → ~18 points (20% weight)
- Size: 15 KB → ~8 points (10% weight)
- **Total**: ~81 points → **必要 (Necessary)**

---

## Using the Sample Report

### As a Learning Tool

1. **Study the examples**
   - See what high-scoring documents look like
   - Understand low-scoring patterns
   - Learn from the reasoning

2. **Compare to your results**
   - Run analysis on your workspace
   - Compare patterns
   - Identify differences

3. **Adjust expectations**
   - Understand what's normal
   - Set realistic goals
   - Plan cleanup strategy

### As a Template

1. **Understand the format**
   - Know what each section contains
   - Recognize the structure
   - Find information quickly

2. **Interpret your results**
   - Use this guide to understand your report
   - Follow the same review process
   - Apply the same decision criteria

3. **Take action**
   - Use the provided commands
   - Follow the safety guidelines
   - Implement recommendations

---

## Common Questions

### Q: Why is my important document marked as "不要"?

**A**: Check the reasoning section. Common causes:
- No other documents reference it
- Not modified recently
- Small file size

**Solution**: 
- Add references from other documents
- Update the document
- Adjust configuration weights

### Q: Why are there so many "要確認" documents?

**A**: This means scores are between thresholds (30-60).

**Solution**:
- Adjust thresholds in config
- Review and update documents
- Add references to important docs

### Q: Can I trust the "不要" recommendations?

**A**: Use them as suggestions, not commands.

**Best practice**:
- Review each file individually
- Create archives, don't delete immediately
- Test after moving files
- Keep archives for 30+ days

### Q: How often should I run this analysis?

**A**: Depends on your workspace activity.

**Recommendations**:
- **Active projects**: Monthly
- **Stable projects**: Quarterly
- **Archive projects**: Annually
- **After major changes**: Immediately

### Q: What if I disagree with a score?

**A**: The system uses heuristics, not perfect knowledge.

**Options**:
- Adjust configuration weights
- Add references to important docs
- Update modification dates
- Override recommendations manually

---

## Best Practices

### Before Running Analysis

1. ✅ Commit changes to version control
2. ✅ Review configuration settings
3. ✅ Ensure file permissions are correct
4. ✅ Close unnecessary files

### During Review

1. ✅ Read the entire report first
2. ✅ Start with high-priority items
3. ✅ Take notes on decisions
4. ✅ Don't rush the process

### After Cleanup

1. ✅ Test workspace thoroughly
2. ✅ Update documentation
3. ✅ Commit changes
4. ✅ Schedule next analysis

---

## Related Documents

- **SAMPLE_REPORT.md**: The actual sample report
- **README.md**: System usage guide
- **config/README.md**: Configuration guide
- **design.md**: System design details

---

*This guide helps you understand and use the sample report effectively.*
