# GitHub Actions CI/CD Workflows

This directory contains automated GitHub Actions workflows for continuous integration and deployment.

## Available Workflows

### test.yml
Automated testing and code quality checks

**Triggers**:
- Push to `main` or `develop` branches
- All pull requests to `main` or `develop`

**Jobs**:
- Multi-version Node.js testing (18.x, 20.x)
- Solidity contract linting
- JavaScript/TypeScript linting
- Code formatting checks
- Smart contract compilation
- Test execution
- Code coverage reporting

**Artifacts**:
- Coverage reports uploaded to Codecov

## Adding New Workflows

To add a new workflow:
1. Create a new `.yml` file in this directory
2. Follow GitHub Actions syntax
3. Use consistent naming and structure
4. Test locally with `act` (optional)

## Workflow Status

Check the status of all workflows:
- Visit the repository's "Actions" tab on GitHub
- Filter by branch or workflow name
- View detailed logs for debugging

## Local Testing

To test workflows locally:
```bash
# Install act (local GitHub Actions runner)
# https://github.com/nektos/act

# Run a specific workflow
act -j test-matrix
```

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
