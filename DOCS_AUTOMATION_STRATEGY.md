# 📚 Documentation Automation Strategy

**Problem:** With 28+ markdown files, keeping documentation up-to-date manually is error-prone and time-consuming.

**Goal:** Automate documentation updates to maintain context across sessions.

---

## 🎯 Documentation Hierarchy

### Tier 1: Critical (Always Update)
These files MUST be updated with every significant change:

1. **CHANGELOG.md** - Complete history of all changes
   - Update after every feature/fix commit
   - Template: Date → Feature → Technical Details → Files Changed

2. **README.md** - Project overview and quick start
   - Update when adding major features
   - Keep feature list current

3. **QUICK_REFERENCE.md** - Developer quick reference
   - Update when adding new components/utilities
   - Keep API signatures current

### Tier 2: Important (Update Weekly)
4. **PRODUCT_ROADMAP.md** - Feature planning (99KB!)
   - Update when completing roadmap items
   - Mark features as ✅ Completed

5. **PROJECT_STATUS.md** - Current state
   - Update after major milestones
   - Track completed/in-progress features

### Tier 3: Reference (Update as Needed)
6. Testing docs (TESTING.md, TESTING_GUIDE.md, etc.)
7. Deployment docs (DEPLOYMENT.md, etc.)
8. Architecture docs (ARCHITECTURE_REVIEW.md, etc.)

---

## 🤖 Automation Strategies

### Strategy 1: Git Hooks (Recommended)
**What:** Auto-update CHANGELOG.md on every commit

**How to implement:**
```bash
# .git/hooks/prepare-commit-msg
#!/bin/bash

# Extract commit message
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Parse commit type (feat:, fix:, docs:, etc.)
if [[ $COMMIT_MSG =~ ^(feat|fix|refactor|docs|chore): ]]; then
  TYPE=${BASH_REMATCH[1]}
  MESSAGE=${COMMIT_MSG#*: }

  # Append to CHANGELOG.md
  DATE=$(date +%Y-%m-%d)
  echo "## [$DATE] - $MESSAGE" >> CHANGELOG_TEMP.md
  echo "" >> CHANGELOG_TEMP.md
  echo "$COMMIT_MSG" >> CHANGELOG_TEMP.md
  echo "" >> CHANGELOG_TEMP.md
  cat CHANGELOG.md >> CHANGELOG_TEMP.md
  mv CHANGELOG_TEMP.md CHANGELOG.md
fi
```

**Pros:**
- ✅ Automatic
- ✅ Runs on every commit
- ✅ No manual work

**Cons:**
- ❌ Requires git hook setup
- ❌ Only captures commit messages (not full context)

---

### Strategy 2: Claude Code Session Summary
**What:** Use Claude Code to generate session summary at end of each session

**How to implement:**
```bash
# .claude/hooks/session-end.sh
#!/bin/bash

# Generate session summary
claude code --summary > SESSION_SUMMARY.md

# Append to CHANGELOG.md
cat SESSION_SUMMARY.md >> CHANGELOG.md

# Clean up
rm SESSION_SUMMARY.md
```

**Pros:**
- ✅ Captures full context (not just commits)
- ✅ Includes rationale and decisions
- ✅ Natural language explanations

**Cons:**
- ❌ Requires manual trigger
- ❌ Claude Code custom hook needed

---

### Strategy 3: Pre-Commit Questions (Current Best Practice)
**What:** Before each commit, Claude asks: "Should I update docs?"

**Implementation in Claude Code sessions:**

**At the END of every work session:**
1. **Claude checks:** "Did we add/remove/change features?"
2. **If YES → Update docs automatically:**
   - CHANGELOG.md ← Full feature description
   - README.md ← Update feature list (if major)
   - QUICK_REFERENCE.md ← Update API (if public API changed)

3. **Ask user confirmation:**
   ```
   📚 Documentation Updates:
   - ✅ CHANGELOG.md updated with Documents feature
   - ✅ README.md feature list updated
   - ⏭️ PRODUCT_ROADMAP.md - mark as completed? (y/n)
   ```

**Pros:**
- ✅ Works today (no git hooks needed)
- ✅ Claude has full context
- ✅ User confirms changes
- ✅ Natural workflow

**Cons:**
- ❌ Requires Claude to remember
- ❌ User must approve each time

---

## 📋 Automation Checklist

### After Every Feature Commit:
```markdown
- [ ] Update CHANGELOG.md with:
  - Date
  - Feature name
  - What's new
  - How it works
  - Files changed
  - Database migrations

- [ ] Check README.md:
  - [ ] Feature list current?
  - [ ] Installation steps current?

- [ ] Check QUICK_REFERENCE.md:
  - [ ] New components documented?
  - [ ] API changes reflected?
```

### End of Session:
```markdown
- [ ] Review PRODUCT_ROADMAP.md
  - [ ] Mark completed features as ✅
  - [ ] Update progress percentages

- [ ] Update PROJECT_STATUS.md
  - [ ] Current milestone
  - [ ] Completed features this session
  - [ ] Known issues
```

---

## 🛠️ Recommended Implementation

**For YOUR workflow (Maksym + Claude Code):**

**Option A: Manual Checklist (Simplest)**
- At end of session, user says: "update docs"
- Claude runs through checklist above
- User approves changes
- Commit docs separately: `docs: Update documentation for [feature]`

**Option B: Custom .claude/commands/update-docs.md**
Create a slash command that triggers doc updates:

```markdown
# .claude/commands/update-docs.md

Update all documentation files based on recent changes:

1. Review git log --oneline -5
2. Identify features added/changed
3. Update CHANGELOG.md with full context
4. Update README.md if major features added
5. Update PRODUCT_ROADMAP.md - mark completed items
6. Ask user to confirm changes
7. Commit with message: "docs: Update documentation [date]"
```

**Usage:** `/update-docs` at end of session

**Option C: Automated Pre-Commit Hook (Advanced)**
```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🤖 Checking if docs need update..."

# Check if feature files changed
CHANGED_FILES=$(git diff --cached --name-only)

if echo "$CHANGED_FILES" | grep -E "types.ts|components/|services/"; then
  echo "⚠️  Feature files changed. Update CHANGELOG.md? (y/n)"
  read -r response

  if [[ "$response" == "y" ]]; then
    # Open editor to add CHANGELOG entry
    $EDITOR CHANGELOG.md
    git add CHANGELOG.md
  fi
fi
```

---

## 💡 Best Practices

1. **CHANGELOG is source of truth**
   - Always update first
   - Use as reference for other docs

2. **Commit docs separately**
   ```bash
   git commit -m "feat: Add Documents feature"
   git commit -m "docs: Update CHANGELOG and README"
   ```

3. **Date-based sections**
   - Use `[YYYY-MM-DD]` format
   - Easier to track when features added

4. **Link to files**
   - Use relative paths: `components/ShootDetails.tsx`
   - Easier navigation

5. **Database migrations in CHANGELOG**
   - Always note SQL changes
   - Critical for deployment

---

## 🚀 Quick Start (Implement TODAY)

**Step 1:** Create slash command
```bash
echo "Update docs: CHANGELOG, README, ROADMAP based on recent commits" > .claude/commands/update-docs.md
```

**Step 2:** At end of each session
```bash
/update-docs
```

**Step 3:** Commit docs
```bash
git commit -m "docs: Update documentation [date]"
```

---

## 📊 Metrics to Track

- **Doc freshness:** Days since last update
- **Coverage:** % of features documented in CHANGELOG
- **Consistency:** Do feature commits include doc updates?

**Goal:** 100% of features documented within same session.

---

## ✅ Action Items

- [x] Create this strategy document
- [ ] Implement `/update-docs` slash command
- [ ] Set up pre-commit reminder
- [ ] Update docs at end of THIS session
- [ ] Commit CHANGELOG.md + this file

---

**Last Updated:** 2026-01-04
**Status:** Strategy defined, ready to implement
