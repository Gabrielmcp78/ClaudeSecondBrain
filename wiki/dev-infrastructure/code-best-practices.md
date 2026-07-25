# Code Development Best Practices

*Source: `raw/Best Practice Briefing_Code Development.md`. Ingested 2026-07-07. Domain: dev-infrastructure. Cross-reference: [SDLC Guide](sdlc-guide.md).*

Enterprise-level code quality reference for all active Gabriel projects. Applies across ComTechSuite, Codex Guardian, WriteTrack, private-club-app, Prestige Fiction Forge, and any new builds.

---

## Coding Style & Naming Conventions

Language-specific style guides are the baseline: PEP 8 for Python; Airbnb or Google JavaScript Style Guide for JS/TS; Google Java Style Guide for Java; Microsoft C# Conventions for C#. Automated linting and formatting enforce these consistently — ESLint + Prettier for JS/TS, flake8 or pylint + Black for Python, Checkstyle for Java. An `.editorconfig` file anchors spacing, line endings, and indentation uniformly across editors.

---

## Documentation

Two levels required. **Inline technical reference:** every function documented with purpose, parameters, expected behavior, and failure conditions (JSDoc for JS/TS, Sphinx/mkdocs for Python, JavaDoc for Java). **Project-level docs:** `README.md` for quick-start and project overview; `docs/` directory at repo root for architecture, design decisions, and troubleshooting guides.

---

## Source Control & Git Workflows

Standard branching strategy (Gitflow, GitHub Flow, or trunk-based development). Protected `main` and `develop` branches require PR approval and status checks before merge. Conventional Commits spec for commit messages enables automated changelog generation. PR templates ensure all changes are described, tested, and documented before merging.

---

## Testing & Quality Assurance

Test-driven or behavior-driven development as the default. Unit, integration, and end-to-end tests cover all application layers. Continuous testing runs on every commit or pull request. Frameworks by language: Jest/Mocha/Cypress for JS/TS, pytest for Python, JUnit/TestNG for Java, xUnit/NUnit for C#.

---

## Security

OWASP Top Ten as the baseline security reference. Static Application Security Testing (SonarQube, Checkmarx) scans source code for vulnerabilities. Dependency scanning (Dependabot, Snyk) keeps dependencies current. Secrets management through environment variables or a secure vault (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault) — never hardcoded.

---

## CI/CD

Modern CI/CD service (GitHub Actions, GitLab CI, CircleCI) automates linting, tests, build artifacts, and deployments. Pipeline-as-code configurations (`.github/workflows/`, Jenkinsfile) version-control the pipeline alongside the codebase. Deployment strategies (blue-green, canary, rolling updates) minimize downtime and risk.

---

## Containerization & Orchestration

Docker for consistent environment packaging: minimal, efficient Dockerfiles; stateless containers where possible. Container image vulnerability scanning with Trivy or Docker's built-in scanning. Kubernetes for large-scale deployments with Helm charts for reproducible configurations.

---

## Infrastructure as Code

Terraform, AWS CloudFormation, or Azure Resource Manager Templates for version-controlled infrastructure. Separate configurations for local, dev, staging, and prod environments — kept in version control for traceability and compliance. See [SDLC Guide](sdlc-guide.md) for the four-environment model.

---

## Observability & Monitoring

Standardized logging format and severity levels (Logstash, Fluentd). Application and infrastructure metrics collection (Prometheus). Distributed tracing (OpenTelemetry, Jaeger, or Zipkin). These three pillars — logs, metrics, traces — enable early issue detection and precise root-cause analysis in production.

---

## Key VS Code Extensions

ESLint, Prettier, EditorConfig (linting and formatting); GitLens, GitHub Pull Requests & Issues (source control); Jest/Mocha Test Runner, Test Explorer UI (testing); Docker extension (containerization); HashiCorp Terraform extension (IaC).
