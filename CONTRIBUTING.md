# Contributing to Awesome SDET

Thank you for contributing to Awesome SDET! This project follows a **Gitflow-Lite** branching model and strict **Conventional Commits** standards.

---

## 1. Branching Strategy (Gitflow-Lite)

- **`main`**: Production release branch. Strictly contains tagged releases (`vX.Y.Z`). Direct commits are forbidden.
- **`develop`**: Primary integration branch. All feature branches and bugfixes are merged here via Pull Requests.
- **`feat/*`**: New tools, skills, agents, or feature enhancements.
- **`fix/*`**: Bug fixes, schema adjustments, and protocol corrections.
- **`refactor/*`**: Code and architecture restructuring.
- **`release/vX.Y.Z`**: Dedicated release preparation branches targeting `main`.

---

## 2. Development Workflow

### Step 1: Branch from `develop`

```bash
git checkout develop
git pull origin develop
git checkout -b feat/your-feature-name
```

### Step 2: Conventional Commits

All commits must follow the Conventional Commits specification with an explicit scope:

```
<type>(<scope>): <short summary>
```

**Types:**

- `feat`: New capability, tool, prompt, or skill.
- `fix`: Bug fix or protocol correction.
- `refactor`: Refactoring without functional changes.
- `docs`: Documentation updates.
- `test`: Adding or updating test suites.
- `chore`: Maintenance, dependencies, release bumps.

**Examples:**

- `feat(selenium): add bidi network interception tool`
- `fix(mcp): enforce strict 2026-07-28 per-request metadata envelope`
- `refactor(domains): modernize reference doc resolution with shared lookup`

### Step 3: Run Local Verifications

Before submitting a PR, ensure all checks pass:

```bash
pnpm run build         # Build TypeScript files and MCP server
pnpm test              # Run full Vitest suite (54+ tests)
pnpm run validate      # Validate plugin manifest, MCP config, agents, and skills
pnpm run lint          # Run ESLint across code and markdown
pnpm run format:check  # Verify Prettier code style
```

### Step 4: Submit Pull Request

Push your branch and open a Pull Request targeting **`develop`**.

---

## 3. Release Lifecycle

When `develop` is ready for a release:

1. **Create Release Branch from `develop`:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/vX.Y.Z
   ```

2. **Synchronize Versions:**

   ```bash
   node dist/scripts/release.js patch --prepare-branch
   # Or minor / major as appropriate
   git commit -am "chore(release): bump version to X.Y.Z"
   git push -u origin release/vX.Y.Z
   ```

3. **Open PR to `main`:**
   - Title: `Release vX.Y.Z`
   - Target: `main`

4. **Tag & Publish on `main`:**
   Once merged into `main`:

   ```bash
   git checkout main
   git pull origin main
   node dist/scripts/release.js --tag-only
   ```

5. **Sync `main` back to `develop`:**
   ```bash
   git checkout develop
   git pull origin develop
   git merge main
   git push origin develop
   ```
