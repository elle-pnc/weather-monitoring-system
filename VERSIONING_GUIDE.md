# Versioning & Upgrade Guide

## 📋 Quick Start: Creating a New Version

### Step 1: Create a New Branch
```bash
# Create and switch to a new version branch
git checkout -b ver-4.0

# Or for a feature-based upgrade
git checkout -b feature/new-feature-name
```

### Step 2: Make Your Changes
- Update code, add features, fix bugs
- Test thoroughly before committing

### Step 3: Document Changes
- Update `CHANGELOG.md` with your changes
- Update version number in code/docs if needed

### Step 4: Commit and Push
```bash
git add .
git commit -m "v4.0: Description of major changes"
git push origin ver-4.0
```

### Step 5: Merge to Main (when ready)
```bash
git checkout main
git merge ver-4.0
git push origin main
```

---

## 🏷️ Version Numbering Strategy

Use **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** (4.0.0): Breaking changes, major new features
- **MINOR** (3.1.0): New features, backward compatible
- **PATCH** (3.0.1): Bug fixes, small improvements

### Current Version History
- v2.0: Fan automation, Firebase integration
- v2.1: High-tech chart enhancements
- v3.0: Auto-connect MQTT, mobile fixes, brand updates

### Next Version Options
- **v4.0**: Major upgrade (new architecture, breaking changes)
- **v3.1**: Minor upgrade (new features, backward compatible)
- **v3.0.1**: Patch (bug fixes only)

---

## 📝 Pre-Upgrade Checklist

Before starting a new version:

- [ ] **Backup Current Version**
  ```bash
  git tag v3.0-stable  # Tag current stable version
  git push origin v3.0-stable
  ```

- [ ] **Document Current State**
  - Take screenshots of current UI
  - Note current features
  - List known issues

- [ ] **Plan Your Changes**
  - What features to add?
  - What bugs to fix?
  - What to improve?

- [ ] **Create Branch**
  ```bash
  git checkout -b ver-4.0  # or feature/feature-name
  ```

---

## 🔄 Upgrade Workflow

### Option 1: Version Branch (Recommended for Major Upgrades)
```bash
# 1. Create version branch
git checkout -b ver-4.0

# 2. Make changes, commit frequently
git add .
git commit -m "Add: New feature X"
git commit -m "Fix: Bug Y"
git commit -m "Update: Improve Z"

# 3. Update CHANGELOG.md
# 4. Test thoroughly

# 5. Merge to main when ready
git checkout main
git merge ver-4.0
git tag v4.0
git push origin main --tags
```

### Option 2: Feature Branch (For Specific Features)
```bash
# 1. Create feature branch
git checkout -b feature/dark-mode-toggle

# 2. Develop feature
# 3. Test and commit

# 4. Merge to main
git checkout main
git merge feature/dark-mode-toggle
git push origin main
```

---

## 📚 Documentation Updates

### Update CHANGELOG.md
```markdown
## [4.0.0] - 2025-01-XX

### Added
- New feature 1
- New feature 2

### Changed
- Improved X
- Updated Y

### Fixed
- Bug fix 1
- Bug fix 2

### Removed
- Deprecated feature (if any)
```

### Update README.md
- Add new features to Features list
- Update version number
- Update screenshots if UI changed

### Update Version in Code (Optional)
If you want to display version in dashboard:
```javascript
// In script.js
const APP_VERSION = '4.0.0';
```

---

## 🧪 Testing Before Release

### Checklist
- [ ] Test all existing features still work
- [ ] Test new features thoroughly
- [ ] Test on mobile devices
- [ ] Test MQTT connection/disconnection
- [ ] Test automation features
- [ ] Test chart updates
- [ ] Test weather condition computation
- [ ] Test fan control commands
- [ ] Check browser console for errors
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### Test Commands
```bash
# Run local server to test dashboard
python3 -m http.server 8000
# Or
npx serve .

# Test MQTT connection
# Use MQTT Explorer or similar tool
```

---

## 🚀 Release Process

### 1. Final Testing
- Complete all tests
- Fix any critical bugs
- Update documentation

### 2. Create Release Commit
```bash
git add .
git commit -m "Release v4.0: Major upgrade with new features"
```

### 3. Tag the Release
```bash
git tag -a v4.0 -m "Version 4.0: Major upgrade"
git push origin v4.0
```

### 4. Merge to Main
```bash
git checkout main
git merge ver-4.0
git push origin main
```

### 5. Create GitHub Release (if using GitHub)
- Go to GitHub → Releases → Draft a new release
- Tag: `v4.0`
- Title: `Version 4.0 - Major Upgrade`
- Description: Copy from CHANGELOG.md
- Attach any release notes

---

## 🔀 Branch Naming Conventions

- `ver-4.0` - Version branch
- `feature/feature-name` - New feature
- `fix/bug-description` - Bug fix
- `hotfix/critical-fix` - Urgent fix
- `refactor/component-name` - Code refactoring

---

## 📦 Backup Strategy

### Before Major Changes
```bash
# Create backup branch
git checkout -b backup/pre-v4.0
git push origin backup/pre-v4.0

# Return to main
git checkout main
```

### Tag Stable Versions
```bash
git tag v3.0-stable
git push origin v3.0-stable
```

---

## 🎯 Best Practices

1. **Always create a branch** before making changes
2. **Commit frequently** with clear messages
3. **Test thoroughly** before merging
4. **Update documentation** with changes
5. **Tag releases** for easy rollback
6. **Keep main branch stable** - only merge tested code
7. **Use descriptive commit messages**
8. **Review changes** before merging

---

## 🔙 Rollback Plan

If something goes wrong:

```bash
# Rollback to previous version
git checkout v3.0-stable

# Or revert last commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>
```

---

## 📞 Quick Reference Commands

```bash
# Create new version branch
git checkout -b ver-4.0

# Check current branch
git branch

# View commit history
git log --oneline -10

# View all tags
git tag

# Create tag
git tag v4.0

# Push tag
git push origin v4.0

# Merge branch to main
git checkout main
git merge ver-4.0

# Delete local branch (after merging)
git branch -d ver-4.0

# Delete remote branch
git push origin --delete ver-4.0
```

---

## 🎨 Example: Creating v4.0

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Tag current stable version
git tag v3.0-stable
git push origin v3.0-stable

# 3. Create new version branch
git checkout -b ver-4.0

# 4. Make your changes...
# (edit files, add features, etc.)

# 5. Update CHANGELOG.md
# 6. Test everything

# 7. Commit changes
git add .
git commit -m "v4.0: Add new features X, Y, Z"

# 8. Push branch
git push origin ver-4.0

# 9. When ready to release:
git checkout main
git merge ver-4.0
git tag v4.0
git push origin main --tags
```

---

**Remember**: Always test in a branch before merging to main!

