# FlowOps - Testing Strategy

## Purpose

This document defines the testing strategy for FlowOps.

The goal is to ensure that the application is not only functionally correct, but also secure, maintainable, and reliable.

Testing is treated as part of the development process rather than as a final verification step.

authorization
tenant isolation
data integrity
The testing strategy focuses particularly on:

- business rules
- data integrity
- critical user workflows
- regression prevention

The strategy is designed for a single-developer portfolio project while following production-oriented engineering practices.

## Testing Principles

FlowOps follows the following testing principles.

### 1. Test behavior, not implementation details

Tests should primarily verify observable behavior and business rules.

Implementation details should only be tested directly when doing so provides significant value.

For example, a test should verify:

MEMBER cannot change organization roles

rather than verifying the internal function structure used to perform the permission check.

### 2. Security-sensitive behavior requires automated tests

Security rules must not rely exclusively on manual testing.

authorization
tenant isolation
disabled memberships
The following areas require automated coverage:

- authentication
- session validation
- authorization
- organization membership
- tenant isolation
- role permissions
- disabled memberships
- protected API endpoints

### 3. Business rules require both positive and negative tests

Important rules should be tested in both directions.

Example:

Valid transition:

OPEN
↓
INVESTIGATING

Invalid transition:

OPEN
↓
CLOSED

The first case proves that valid behavior works.

The second case proves that invalid behavior is actively rejected.

### 4. Tests should run automatically

Tests should be executable through the project's standard development commands.

The CI pipeline should execute at minimum:

```text
Lint
↓
Typecheck
↓
Unit Tests
↓
Integration Tests
↓
Build
```

End-to-end tests should run as part of the release validation process and, where practical, in CI.

## Testing Pyramid

FlowOps follows a testing pyramid.

```text
                 ┌───────────────┐
                 │   E2E Tests   │
                 │ Few / Critical│
                 └───────┬───────┘
                         │
                ┌────────┴────────┐
                │ Integration     │
                │ Tests           │
                └────────┬────────┘
                         │
          ┌──────────────┴──────────────┐
          │        Unit Tests           │
          │        Many / Fast          │
          └─────────────────────────────┘
```

The majority of automated tests should be unit tests.

Integration tests verify interactions between important application components.

End-to-end tests are reserved for critical user journeys.

## Test Levels

### Unit Tests

Unit tests verify isolated business logic and deterministic functions.

They should be fast and independent.

authorization rules
domain logic
data transformation
Primary use cases include:

- validation schemas
- authorization rules
- permission evaluation
- incident state transitions
- domain logic
- utility functions
- data transformation
- error classification

Examples:

- `SEV1` is accepted
- `SEV5` is rejected
- `OPEN → INVESTIGATING` is valid
- `OPEN → CLOSED` is invalid
- `OWNER` may manage members
- `MEMBER` may not manage members

Unit tests should not require a real production database.

### Integration Tests

Integration tests verify interactions between multiple application components.

They are particularly important for FlowOps because many security rules depend on the relationship between:

```text
Request
↓
Authentication
↓
Membership
↓
Authorization
↓
Business Logic
↓
Database
```

Integration tests should cover:

- API routes
- authentication
- session lookup
- membership lookup
- authorization
- database queries
- tenant filtering
- incident creation
- incident updates
- event creation
- comments
- postmortems

Integration tests should use an isolated test database or test database environment.

Production data must never be used by automated tests.

### End-to-End Tests

End-to-end tests verify complete user workflows through the application.

Playwright will be used for E2E testing.

The E2E suite should remain intentionally small.

The goal is not to test every API condition through the browser.

Instead, it should verify that the most important workflows work from the user's perspective.

The primary MVP flow is:

```text
Register
↓
Login
↓
Create Organization
↓
Create / Join Membership
↓
Create Service
↓
Create Incident
↓
Update Incident
↓
Add Comment
↓
Resolve Incident
↓
Create Postmortem
↓
Review Postmortem
↓
Publish Postmortem
```

This represents the critical business workflow of FlowOps.

## Testing by Application Layer

### Validation Layer

Runtime validation is tested with unit tests.

Examples:

- required fields
- maximum lengths
- valid email format
- password requirements
- valid severity
- valid status values
- invalid enum values
- invalid query parameters

Example:

Input
↓
Zod Schema
↓
Valid / Invalid

### Authentication Layer

duplicate email handling
Authentication tests verify:

- registration
- duplicate email handling
- invalid registration data
- password verification
- invalid credentials
- session creation
- session lookup
- logout
- invalid session handling
- expired session handling where applicable

Passwords must never be asserted or logged in plaintext test output.

### Authorization Layer

Authorization tests verify the permission matrix defined in:

Authorization-Matrix.md

At minimum:

- `OWNER` → owner operations allowed
- `ADMIN` → administrative operations allowed; owner-only operations rejected
- `MEMBER` → operational operations allowed; administrative operations rejected

Authorization tests must also verify disabled memberships.

Example:

```text
Valid Session + DISABLED Membership = 403 Forbidden
```

## Tenant Isolation Testing

Tenant isolation is one of the highest-priority testing areas in FlowOps.

Tests must verify that users cannot access resources belonging to another organization.

Example:

```text
Organization A
|
+-- User A
|
+-- Incident A

Organization B
|
+-- User B
|
+-- Incident B
```

User A must not be able to:

- retrieve Incident B
- modify Incident B
- retrieve Incident B events
- retrieve Incident B comments
- modify Incident B postmortem
- include Incident B in search results
- include Incident B in filters
- retrieve Incident B through dashboard queries

Tenant isolation must be tested at the database/API boundary.

A client-side organization filter is never considered sufficient protection.

## Incident Lifecycle Testing

The incident state machine must be tested independently from the UI.

The valid state transitions are defined by the application domain.

For each allowed transition, at least one positive test should exist.

For important invalid transitions, negative tests must exist.

Example:

```text
OPEN
↓
INVESTIGATING
↓
MITIGATED
↓
RESOLVED
↓
CLOSED
```

Tests should verify:

- valid transitions succeed
- invalid transitions fail
- a failed transition does not modify the incident
- a successful transition creates the expected event

## Event / Timeline Testing

Incident lifecycle changes must produce timeline events where required by the domain model.

Tests should verify:

```text
Incident Status Change
↓
Database Update +
Timeline Event
```

The test should verify both outcomes.

If the status changes successfully but the event is missing, the operation must be considered incorrect.

## Comment Testing

Comment tests should verify:

- authorized users can create comments
- unauthorized users cannot create comments
- comments belong to the correct incident
- comments belong indirectly to the correct organization
- authenticated user is recorded as the author
- timestamps are generated server-side
- another user's author ID cannot be supplied by the client
- cross-organization comments are rejected

## Postmortem Testing

Postmortem tests should verify the complete lifecycle.

```text
Incident
↓
RESOLVED
↓
Postmortem Created
↓
Reviewed
↓
Published
```

Important negative cases include:

```text
OPEN → Create Postmortem
→ Rejected

Postmortem not reviewed
↓
Publish
↓
Rejected

MEMBER
↓
Publish
↓
Rejected
```

Tests should also verify that postmortem data is stored according to the defined data model.

## API Testing

The API should be tested at the HTTP boundary.

Tests should verify:

- HTTP method
- route
- authentication requirement
- authorization
- request validation
- response status
- response structure
- error format
- tenant isolation
- database side effects

The standard error categories include:

| Status | Category                |
| -----: | ----------------------- |
|    400 | Validation Error        |
|    401 | Unauthenticated         |
|    403 | Forbidden               |
|    404 | Resource Not Found      |
|    500 | Unexpected Server Error |

Internal implementation details must not be exposed through 500 responses.

## Database Testing

Database-related tests should verify:

- foreign key relationships
- unique constraints
- required fields
- organization ownership
- membership relationships
- session persistence
- incident relationships
- event relationships
- comment relationships
- postmortem relationships

Database migrations should be tested against a clean database.

The test process should verify that the complete migration sequence can create the expected schema.

## Test Data

Tests should use deterministic test data.

Test data should be created specifically for each test or test suite where practical.

Tests must not depend on:

- production data
- manually created records
- external personal accounts
- shared mutable state between unrelated tests

A test should leave the environment in a predictable state.

## Test Isolation

Tests should be independent wherever practical.

One test must not depend on another test having run successfully before it.

For example:

Test A
Create Organization

Test B
Create Organization

Test B must not assume that Test A has already created the organization.

This prevents order-dependent test failures.

## Mocking Strategy

Mocking should be used selectively.

Mock dependencies when:

- an external service is unavailable
- the dependency is expensive
- deterministic behavior is required
- the test specifically targets another component

Do not mock core business logic simply to make tests easier.

Database interactions should generally be covered through integration tests rather than extensively mocked.

The goal is to maintain confidence that the real application components work together.

## Coverage Strategy

Code coverage is a useful indicator but is not the primary quality metric.

The project should prioritize coverage of:

- authentication
- authorization
- tenant isolation
- incident state transitions
- validation
- critical API behavior
- postmortem rules

A high percentage of code coverage does not automatically mean that the application is secure or correct.

For example:

100% line coverage

does not guarantee that:

Organization A cannot access Organization B

is correctly enforced.

Business-rule coverage therefore has higher priority than maximizing a single coverage percentage.

## Regression Testing

Every bug that reaches a stable development branch should result in a regression test when practical.

The preferred workflow is:

Bug Found
↓
Reproduce
↓
Write Failing Test
↓
Fix Implementation
↓
Test Passes
↓
Keep Regression Test

This prevents the same defect from silently returning later.

## Security Testing

Security testing is integrated into normal automated testing.

The following areas receive explicit security coverage:

- authentication
- session validation
- authorization
- tenant isolation
- membership status
- input validation
- sensitive error handling
- role changes
- session revocation
- protected API endpoints

The application must not rely on UI restrictions for security.

## API Security Test Matrix

Each protected API endpoint should have at least one test for unauthenticated access.

Where applicable, endpoints should additionally be tested for:

Unauthenticated
↓
401

Authenticated but unauthorized
↓
403

Authenticated + authorized
↓
Success

Authenticated + wrong organization
↓
403 / appropriate resource response

The exact response for cross-organization resource lookup must remain consistent with the API security design and must not disclose unauthorized resource existence.

## E2E Scope

The E2E test suite should focus on critical workflows.

The MVP should include at least:

E2E-001 – Registration and Login
Register
↓
Login
↓
Authenticated application
E2E-002 – Incident Workflow
Login
↓
Create Incident
↓
Update Incident
↓
Change Status
↓
Verify Timeline
E2E-003 – Postmortem Workflow
Resolve Incident
↓
Create Postmortem
↓
Review
↓
Publish
E2E-004 – Authorization
Login as MEMBER
↓
Attempt administrative action
↓
Action rejected

Where practical, tenant isolation should also be covered by an E2E scenario.

## CI Testing

The CI pipeline should execute automated quality checks.

Minimum pipeline:

Install Dependencies
↓
Lint
↓
Typecheck
↓
Unit Tests
↓
Integration Tests
↓
Build

E2E tests may run in a separate CI stage if they require additional infrastructure or a running application.

A pull request should not be considered ready for merge if required CI checks fail.

## Local Development Testing

A developer should be able to execute the relevant test suites locally.

The project should provide clear npm scripts.

For example:

npm run lint
npm run typecheck
npm run test
npm run test:integration
npm run test:e2e
npm run build

The exact script names may be adjusted during implementation.

## Definition of Test Completion

A test-related task is considered complete when:

relevant tests exist
positive cases are covered
important negative cases are covered
tests are deterministic
tests pass locally
required CI checks pass
no sensitive information is exposed in test output
the relevant Testing Matrix entry is satisfied

## Relationship to Definition of Done

Testing is part of the Definition of Done.

A User Story is not considered complete merely because the implementation works manually.

The story must also satisfy the applicable testing requirements.

The following relationship applies:

User Story
↓
Acceptance Criteria
↓
Implementation
↓
Automated Tests
↓
Manual Verification
↓
CI
↓
Definition of Done

## Relationship to Testing Matrix

This document defines the overall testing approach.

The detailed test cases and critical scenarios are maintained in:

Testing-Matrix.md

The two documents have different responsibilities.

Document Purpose
Testing-Strategy.md Defines how FlowOps is tested
Testing-Matrix.md Defines which critical scenarios must be tested

## Testing Priorities

Testing effort should follow the risk of the functionality.

Priority 1 – Critical
authentication
authorization
tenant isolation
session management
incident lifecycle
database integrity
Priority 2 – High
comments
postmortems
services
dashboard
API validation
Priority 3 – Normal
UI-specific behavior
non-critical presentation logic
secondary edge cases

The highest-risk functionality receives the strongest automated coverage.

## Final Testing Model

The overall FlowOps testing strategy can be summarized as:

                 Critical User Flows
                         |
                         v
                    Playwright
                         |
                         v
              Integration / API Tests
                         |
                         v
                   Unit Tests
                         |
                         v
              Business Rules & Security
                         |
                         v
                  CI Quality Gates

The objective is not to maximize the number of tests.

The objective is to create confidence that the most important parts of FlowOps behave correctly, securely, and consistently.

The highest testing priority is therefore given to:

authentication
authorization
tenant isolation
business rules
data integrity
critical user workflows

This strategy is considered the baseline for the FlowOps MVP and should evolve as the application and its risk profile grow.
