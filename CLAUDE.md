# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository. Keep it updated as the project evolves.

---

## Repository Overview

> **Update this section** once the project has been initialized with its purpose, tech stack, and key goals.

This is a newly initialized repository. As the codebase grows, document:
- What this project does and why it exists
- Primary language(s) and framework(s)
- Target environment (browser, server, mobile, CLI, etc.)

---

## Development Setup

> **Update this section** with actual setup steps once the project is bootstrapped.

Typical setup commands to document here:

```bash
# Clone and enter the repo
git clone <repo-url>
cd <repo-name>

# Install dependencies (example for Node.js)
npm install

# Install dependencies (example for Python)
pip install -e ".[dev]"

# Install dependencies (example for Rust)
cargo build
```

---

## Common Commands

> **Replace these examples** with actual project commands.

| Task | Command |
|------|---------|
| Run dev server | `npm run dev` / `python manage.py runserver` |
| Run tests | `npm test` / `pytest` / `cargo test` |
| Lint code | `npm run lint` / `ruff check .` |
| Format code | `npm run format` / `ruff format .` / `cargo fmt` |
| Build | `npm run build` / `cargo build --release` |
| Type check | `npx tsc --noEmit` / `mypy .` |

**Always run tests and linting before committing.**

---

## Project Structure

> **Update this section** as the project grows.

```
/
├── src/              # Main source code
├── tests/            # Test files
├── docs/             # Documentation
├── scripts/          # Build/utility scripts
├── .github/          # GitHub Actions workflows
├── CLAUDE.md         # This file
└── README.md         # Project overview for humans
```

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI-assisted work: `claude/<task-id>` (auto-managed by Claude Code)
- Hotfixes: `hotfix/<short-description>`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples**:
```
feat(auth): add JWT refresh token support
fix(api): handle null response from user endpoint
docs: update setup instructions in README
test(cart): add edge case tests for empty cart
```

### Pull Request Guidelines

- Keep PRs focused and small (< 400 lines changed when possible)
- Write a clear description of what changed and why
- Link to the relevant issue
- Ensure all CI checks pass before requesting review
- Request review from appropriate code owners

---

## Code Conventions

> **Update this section** with language/framework-specific conventions once chosen.

### General Principles

- **Readability over cleverness**: Write code that the next person can understand
- **DRY but not over-abstracted**: Extract shared logic, but don't create abstractions for their own sake
- **Fail loudly**: Prefer explicit errors over silent failures
- **No commented-out code**: Delete dead code; use git history to recover it
- **No TODO comments in committed code**: Convert them to tracked issues

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Variables/functions | camelCase (JS/TS) / snake_case (Python) | `getUserById` / `get_user_by_id` |
| Classes | PascalCase | `UserAuthService` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Files (JS/TS) | kebab-case | `user-auth.service.ts` |
| Files (Python) | snake_case | `user_auth.py` |
| Test files | Same name + `.test.` or `_test.` | `user-auth.service.test.ts` |

### File Organization

- One primary export per file (classes, major functions)
- Keep files under ~300 lines; split if larger
- Co-locate tests with source files or in a parallel `tests/` directory

---

## Testing

> **Update this section** with actual testing framework and patterns.

### Philosophy

- Write tests that verify behavior, not implementation details
- Aim for meaningful coverage on business logic; don't chase 100% at the expense of quality
- Test the happy path, error cases, and edge cases

### Test Structure

```
describe('UserService', () => {
  describe('getById', () => {
    it('returns user when found')
    it('throws NotFoundError when user does not exist')
    it('throws ValidationError when id is invalid')
  })
})
```

### Test Categories

| Type | Scope | Speed |
|------|-------|-------|
| Unit | Single function/class | Fast (<1ms) |
| Integration | Module interactions | Medium |
| E2E | Full user flows | Slow |

Run unit tests frequently during development. Run all tests before pushing.

---

## Environment Variables

> **Update this section** with actual env vars once defined.

- Never commit secrets or credentials to the repository
- Use a `.env` file locally (add to `.gitignore`)
- Document all required env vars in `.env.example` with placeholder values
- For CI/CD, store secrets in the platform's secret manager

```bash
# .env.example
DATABASE_URL=postgres://localhost:5432/mydb
API_KEY=your-api-key-here
NODE_ENV=development
```

---

## CI/CD

> **Update this section** once CI/CD pipelines are configured.

Typical pipeline stages to implement:

1. **Lint** - Code style and static analysis
2. **Test** - Unit and integration tests
3. **Build** - Compile/bundle the project
4. **Security scan** - Dependency vulnerability check
5. **Deploy** - Push to staging/production (on main branch merges)

---

## Dependencies

### Adding Dependencies

- Prefer well-maintained libraries with active communities
- Check the license is compatible with the project
- Evaluate bundle size impact (for frontend projects)
- Pin major versions; allow minor/patch updates

### Updating Dependencies

- Update dependencies regularly to get security patches
- Run the full test suite after any dependency update
- Review changelogs for breaking changes before major version bumps

---

## Security

- Never log sensitive data (passwords, tokens, PII)
- Validate and sanitize all user input at system boundaries
- Use parameterized queries — never interpolate user data into SQL
- Keep dependencies up to date to patch known CVEs
- Follow the principle of least privilege for service accounts and API keys

---

## For AI Assistants

### What You Should Do

- **Read before editing**: Always read a file before modifying it
- **Understand context**: Check surrounding code, imports, and tests before making changes
- **Minimal changes**: Make the smallest change that solves the problem
- **Run validation**: After changes, run relevant tests and linting
- **Commit atomically**: One logical change per commit with a clear message
- **Update this file**: When you discover conventions or patterns not documented here, add them

### What You Should Avoid

- Introducing new dependencies without justification
- Changing code style or formatting in files unrelated to the task
- Adding speculative features or "nice to haves" not requested
- Committing directly to `main` or `master`
- Ignoring failing tests — fix them or flag them explicitly
- Leaving debug code, `console.log`, or `print` statements in production code

### Working with Issues and PRs

When implementing a GitHub issue:
1. Understand the full scope before writing any code
2. Identify all files that need to change
3. Write or update tests first when possible
4. Implement the change
5. Verify tests pass
6. Write a clear commit message referencing the issue

---

## Getting Help

- Check existing issues and PRs before creating duplicates
- For bugs: include steps to reproduce, expected behavior, and actual behavior
- For features: explain the use case and proposed solution
- Tag relevant code owners or maintainers for review

---

*Last updated: 2026-02-25 — Update this file as the project evolves.*
