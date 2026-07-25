# The Builder's Codex: Gabriel's SDLC Field Guide

(Source: `gabriel-sdlc-guide.html`)

This guide outlines the four-environment Software Development Lifecycle (SDLC) model used for all of Gabriel McPherson's development projects.

## Core Principles

*   **Discipline Creates Freedom**: A rigorous, predictable structure for development, testing, and deployment enables greater creative freedom at the code level.
*   **Environments are Contracts**: Each of the four environments serves a specific, non-negotiable purpose. Promoting code from one to the next is a formal act of validation.
*   **Automate Everything**: Human hands should touch the deployment process as little as possible. CI/CD pipelines are not optional.
*   **Master is Sacred**: The `master` branch is a log of immutable, production-blessed releases. It is never rewritten.

## The Four Environments

### 1. Local (`local`)

*   **Purpose**: Active development, experimentation, and rapid iteration. This is the developer's sandbox.
*   **Branch**: `feature/<ticket-name>` or `dev`
*   **State**: Can be broken. Database can be wiped and reseeded at will. Commits can be amended or squashed before being pushed.
*   **Rule**: Code lives and dies here until it is stable, documented, and has passed local tests.

### 2. Development (`dev`)

*   **Purpose**: Integration testing. This is where feature branches are merged to see if they play well together.
*   **Branch**: `dev`
*   **State**: Should be stable. Represents the collective "work in progress" of the team. Database is persistent but can be reset by consensus.
*   **Rule**: CI pipeline runs on every push to `dev`. All tests must pass. A broken `dev` build is a "stop the world" event that must be fixed immediately.

### 3. Staging (`staging`)

*   **Purpose**: User Acceptance Testing (UAT) and final pre-production validation. This environment should be a mirror of production.
*   **Branch**: `staging`
*   **State**: Must be stable. Data is a recent, sanitized copy of the production database. This is where stakeholders and clients can preview upcoming features.
*   **Rule**: Code is promoted from `dev` to `staging` via a pull request that is reviewed and approved. No direct commits are allowed. The staging environment is deployed to from the `staging` branch automatically.

### 4. Production (`prod`)

*   **Purpose**: The live application. This is what users interact with.
*   **Branch**: `master`
*   **State**: Sacred. Must always be stable and working. The database is the single source of truth.
*   **Rule**: Code is promoted from `staging` to `master` via a formal release process. This involves tagging a version, generating release notes, and running a deployment pipeline that has been validated in all other environments. The `master` branch is deployed to production automatically upon merge.

## Branching and Promotion Flow

1.  **Feature Development**:
    *   Create a `feature/<ticket-name>` branch off of `dev`.
    *   Work locally, commit freely.
    *   Run local tests.
2.  **Merge to Development**:
    *   Once the feature is complete, rebase the feature branch on the latest `dev`.
    - Squash commits into logical units.
    *   Open a pull request from the feature branch to `dev`.
    *   After review and approval, merge into `dev`.
    *   CI runs tests on the `dev` branch.
3.  **Promote to Staging**:
    *   When a set of features is ready for UAT, create a pull request from `dev` to `staging`.
    *   This PR represents a "release candidate".
    *   After review, merge to `staging`.
    *   CI/CD deploys the `staging` branch to the staging environment.
4.  **Release to Production**:
    *   After successful UAT on staging, create a pull request from `staging` to `master`.
    *   This is the final gate. The PR should be reviewed by the lead developer or architect.
    *   Upon merging to `master`, a new version tag is created (e.g., `v1.2.0`).
    *   CI/CD deploys the tagged commit from `master` to the production environment.

## Hotfixes

In the event of a critical production bug:

1.  Create a `hotfix/<ticket-name>` branch off of `master`.
2.  Fix the bug and commit.
3.  Open a pull request from the hotfix branch to `master`.
4.  After review, merge to `master` and deploy.
5.  Immediately open a pull request from the hotfix branch to `staging` and `dev` to ensure the fix is incorporated into all environments.
