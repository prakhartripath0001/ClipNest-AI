/**
 * CONTRIBUTING GUIDE
 * ==================
 * 
 * Thank you for considering contributing to ClipNest AI!
 * Please follow these guidelines to help us maintain code quality.
 */

# Contributing to ClipNest AI

## Code of Conduct

Be respectful and constructive in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/clipnest-ai.git`
3. Create a feature branch: `git checkout -b feature/amazing-feature`
4. Install dependencies: `npm install`

## Development Workflow

### Before Starting

- Check existing issues and PRs to avoid duplicates
- Discuss major changes in an issue first
- Follow the code style of existing files

### Making Changes

```bash
# Start development server
npm run dev

# Watch for changes and rebuild
npm run build
```

### Code Style

- Use 2-space indentation
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Add comments for complex logic
- Write meaningful variable names

### Testing

Before submitting:

```bash
# Test your changes
npm test

# Check for linting errors
npm run lint
```

## Commit Guidelines

Use descriptive commit messages:

```
git commit -m "feat: add OCR caching for performance"
git commit -m "fix: handle clipboard paste on Windows"
git commit -m "docs: update README with new feature"
git commit -m "refactor: simplify database query builder"
```

Prefix commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code reorganization
- `perf:` - Performance improvement
- `test:` - Testing

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Submit PR with clear description
5. Request review from maintainers

### PR Description Template

```markdown
## Description
Brief summary of changes

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Performance

## Testing
Describe how you tested this

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
```

## Area-Specific Guidelines

### Frontend (React)

- Use functional components with hooks
- Keep components focused and reusable
- Use custom hooks for complex logic
- Add PropTypes or TypeScript types
- Test component interactions

### Backend (Electron)

- Follow Electron security best practices
- Use IPC for main ↔ renderer communication
- Handle errors gracefully
- Clean up resources in lifecycle events
- Log important operations

### Database

- Use prepared statements (prevents SQL injection)
- Create indexes for frequently queried columns
- Add migrations for schema changes
- Document schema changes
- Test query performance

## Reporting Bugs

When reporting bugs, include:

- OS and version
- ClipNest AI version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable

## Feature Requests

Describe the feature:

- What problem does it solve?
- How should it work?
- Any alternative approaches?
- Potential impact on performance/security

## Documentation

Help us maintain great documentation:

- Update README for user-facing changes
- Add code comments for complex logic
- Document new APIs
- Add examples for new features
- Fix typos and clarity issues

## Need Help?

- **Questions**: Open a GitHub Discussion
- **Bug Reports**: GitHub Issues
- **Security Issues**: Email security@clipnest.ai (don't open public issues)

---

Thank you for contributing! 🙏
