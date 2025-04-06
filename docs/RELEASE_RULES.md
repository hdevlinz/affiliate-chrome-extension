# 📜 Semantic Release Rules Documentation

This configuration file defines how **semantic-release** determines the next version based on commit messages.

## 🎯 General Principles

- **`major`**: When a breaking change occurs.
- **`minor`**: When a new feature is added.
- **`patch`**: When a bug fix, minor refactor, or documentation update is made.
- **No release**: When the commit does not affect the codebase.

---

## 🚀 Rules & Examples

### 🔥 Major Release (`major`)

#### **Rule**

- A commit with `type: feat` and `scope: breaking` → Increases the **major** version.
- Used for breaking changes that are not backward-compatible.

#### **Example**

```sh
git commit -m "feat(breaking): Remove support for legacy API"
```

➡️ **Version bump**: `1.2.3` → `2.0.0`

---

### 🚀 Minor Release (`minor`)

#### **Rule**

- A commit with `type: feat` → Increases the **minor** version.
- Used when adding new features that do not break compatibility.

#### **Example**

```sh
git commit -m "feat: Add dark mode support"
```

➡️ **Version bump**: `1.2.3` → `1.3.0`

---

### 🛠️ Patch Release (`patch`)

#### **Rule**

- A commit with `type: fix`, `refactor`, `chore`, or `docs` → Increases the **patch** version.
- Used for bug fixes, small optimizations, and documentation updates.

#### **Examples**

✅ **Bug fix**

```sh
git commit -m "fix: Fix layout issue on mobile"
```

✅ **Code refactor (without changing logic)**

```sh
git commit -m "refactor: Optimize database queries"
```

✅ **Chore (non-functional changes, e.g., dependency updates)**

```sh
git commit -m "chore: Update dependencies"
```

✅ **Documentation update**

```sh
git commit -m "docs: Improve API documentation"
```

➡️ **Version bump**: `1.2.3` → `1.2.4`

---

### 🛑 No Release (No Version Change)

#### **Rule**

- A commit with `type: test`, `style`, `ci`, or `build` → **Does not trigger a release**.
- Used for test updates, code formatting, or CI/CD changes.

#### **Examples**

🚫 **Test updates (No version bump)**

```sh
git commit -m "test: Improve unit tests for user authentication"
```

🚫 **Code style changes (No logic changes)**

```sh
git commit -m "style: Format code using Prettier"
```

🚫 **CI/CD updates (No effect on production code)**

```sh
git commit -m "ci: Update GitHub Actions workflow"
```

➡️ **Version remains the same**: `1.2.3` → `1.2.3`

---

## 📝 Key Notes

1. **Ensure commit messages follow the Conventional Commits format.**
2. **For breaking changes, always use `scope: breaking` to trigger a major release.**

---
