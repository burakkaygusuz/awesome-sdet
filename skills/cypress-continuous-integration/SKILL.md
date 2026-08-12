---
name: cypress-continuous-integration
description: 'Set up, configure, and optimize Cypress test execution in CI/CD pipelines. Use when creating GitHub Actions, GitLab CI, or CircleCI workflows, running Cypress in Docker, enabling parallelization, or configuring Cypress Cloud.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - continuous-integration
    - ci-cd
    - github-actions
    - gitlab-ci
    - circleci
    - bitbucket-pipelines
    - parallelization
    - cypress-cloud
    - docker
---

# Cypress Continuous Integration & CI/CD Pipeline Automation

## 1. What Is It?

A CI/CD pipeline automation skill for configuring, parallelizing, and optimizing Cypress test runs across major CI providers (GitHub Actions, GitLab CI, CircleCI, Bitbucket Pipelines) using official Docker images and Cypress Cloud recording.

## 2. Core Capabilities & Responsibilities

- **Pipeline Bootstrapping**: Configures `start-server-and-test` or `wait-on` to ensure local web servers are fully initialized before running tests.
- **Parallelization & Cloud Orchestration**: Orchestrates test parallelization across multi-machine CI jobs via `cypress run --record --parallel --ci-build-id $CI_BUILD_ID`. _Note: Native Cypress parallelization requires Cypress Cloud orchestration and a valid `CYPRESS_RECORD_KEY`._
- **Docker Environment Isolation**: Uses official Docker container images (`cypress/browsers:22.15.0`) with explicit non-root options (`--user 1001`) to prevent host inconsistencies.
- **Provider Configurations**:

### GitHub Actions (`.github/workflows/cypress.yml`)

```yaml
name: Cypress Tests
on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-24.04
    container:
      image: cypress/browsers:22.15.0
      options: --user 1001
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run Cypress tests
        uses: cypress-io/github-action@v7
        with:
          build: npm run build
          start: npm start
          wait-on: 'https://example.com'
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

### GitLab CI (`.gitlab-ci.yml`)

```yaml
stages:
  - test

cypress:
  stage: test
  image: cypress/browsers:22.15.0
  script:
    - npm ci
    - npx start-server-and-test start https://example.com "cypress run --record --key $CYPRESS_RECORD_KEY"
  artifacts:
    when: always
    paths:
      - cypress/videos
      - cypress/screenshots
    expire_in: 7 days
```

### CircleCI (`.circleci/config.yml`)

```yaml
version: 2.1

orbs:
  cypress: cypress-io/cypress@6.1.0

workflows:
  build-and-test:
    jobs:
      - cypress/run:
          start-command: 'npm run start'
          cypress-command: 'npx cypress run --parallel --record'
          parallelism: 4
```

### Bitbucket Pipelines (`bitbucket-pipelines.yml`)

```yaml
image: cypress/browsers:22.15.0

pipelines:
  default:
    - step:
        name: Cypress E2E Tests
        caches:
          - node
          - cypress
        script:
          - npm ci
          - npx start-server-and-test start https://example.com "cypress run"
definitions:
  caches:
    cypress: ~/.cache/Cypress
```

## 3. Why Use It?

Used to run automated regression suites deterministically on every pull request, preventing broken builds from reaching production while reducing CI execution times via parallelization.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                        | Anti-Pattern                                                                                  |
| :--------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **`cypress-io/github-action@v7`**: Use major version `@v7` for GitHub Actions                        | **Deprecated Action Versions**: Using legacy `@v4` or `@v5` action tags                       |
| **`cypress-io/cypress@6.1.0`**: Pin exact CircleCI orb versions                                      | **Unpinned Orbs**: Relying on loose orb version tags in production                            |
| **`start-server-and-test`**: Use `npx start-server-and-test start https://example.com 'cypress run'` | **Unwaited Background Server**: Launching `npm start &` without waiting for port availability |
| **Cache `~/.cache/Cypress`**: Cache the Cypress binary directory across CI pipeline runs             | **Re-downloading Cypress Binary**: Re-installing the 500MB+ Cypress binary on every job run   |
| **Explicit Docker Tags**: Pin exact Docker tags (`cypress/browsers:22.15.0`)                         | **Unstable `:latest` Tag**: Using `cypress/browsers:latest` which mutates without notice      |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_cy_task_docs`, `read_cy_commands_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
