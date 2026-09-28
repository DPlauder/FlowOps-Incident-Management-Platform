# FlowOps - Testing Matrix

## Purpose

This document defines the testing strategy for the FlowOps MVP.

The testing strategy is derived from:

- Requirements Specification
- User Stories
- MVP Backlog
- Architecture
- Data Model
- API Specification
- Security Specification

The goal is to ensure that critical business rules, security boundaries, API behavior, and user workflows are verified before release.

---

## Testing Matrix

| Area | Critical Case | Test Type | Reference |

## Testing Principles

FlowOps follows a layered testing strategy.

```text
                    E2E Tests
                       |
                Integration Tests
                       |
                   Unit Tests
                       |
                Static Analysis
```

Each layer has a different purpose.

### Unit Tests

Unit tests verify isolated business logic.

Examples:

- validation
- state transitions
- permission checks
- severity validation
- helper functions

### Integration Tests

Integration tests verify interactions between application components.

authentication
authorization
tenant isolation
event creation
Examples:

- API endpoints
- database access
- authentication
- authorization
- tenant isolation
- event creation

### End-to-End Tests

E2E tests verify complete user workflows.

Examples:

- registration
- login
- organization creation
- incident creation
- incident resolution
- postmortem workflow

### CI Tests

CI tests verify that the application can be safely built and checked automatically.

Examples:

- lint
- type checking
- unit tests
- integration tests
- build

## Test Categories

| Category    | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| Unit        | Verify isolated business logic                                   |
| Integration | Verify API, database, authentication, and authorization behavior |
| E2E         | Verify complete user workflows                                   |
| Security    | Verify authentication, authorization, and tenant isolation       |
| Regression  | Prevent previously fixed defects from returning                  |
| CI          | Verify code quality and build integrity                          |

## Testing Matrix

| Area             | Critical Case                                                      | Test Type              | Reference              |
| ---------------- | ------------------------------------------------------------------ | ---------------------- | ---------------------- |
| Authentication   | Registration with valid data                                       | Integration / E2E      | US-001                 |
| Authentication   | Registration with invalid data                                     | Unit / Integration     | US-001, TR-010         |
| Authentication   | Registration with existing email                                   | Integration            | US-001                 |
| Authentication   | Password is never stored in plain text                             | Integration            | US-001, Security       |
| Authentication   | Login with valid credentials                                       | Integration / E2E      | US-002                 |
| Authentication   | Login with invalid credentials                                     | Integration            | US-002                 |
| Authentication   | Login does not reveal whether an email exists                      | Integration            | US-002, Security       |
| Sessions         | Successful login creates session                                   | Integration            | US-002, US-003         |
| Sessions         | Authenticated request is accepted                                  | Integration            | US-003                 |
| Sessions         | Logout invalidates current session                                 | Integration / E2E      | US-003, US-004         |
| Sessions         | Revoked session cannot access protected endpoint                   | Integration            | US-004                 |
| Sessions         | Expired session cannot access protected endpoint                   | Integration            | US-004, Security       |
| Authorization    | OWNER can perform owner-only actions                               | Unit / Integration     | US-011                 |
| Authorization    | ADMIN can perform permitted administrative actions                 | Unit / Integration     | US-011                 |
| Authorization    | MEMBER can perform permitted member actions                        | Unit / Integration     | US-011                 |
| Authorization    | MEMBER cannot perform owner-only actions                           | Unit / Integration     | US-011                 |
| Authorization    | Unauthorized role change is rejected                               | Integration            | US-011                 |
| Tenant Isolation | User cannot read another organization's resource                   | Integration            | US-007, US-043         |
| Tenant Isolation | User cannot update another organization's resource                 | Integration            | US-007, US-043         |
| Tenant Isolation | User cannot search another organization's resources                | Integration            | US-007, US-043         |
| Tenant Isolation | User cannot filter another organization's resources                | Integration            | US-007, US-043         |
| Tenant Isolation | Client-provided organization ID cannot bypass tenant isolation     | Integration / Security | US-007                 |
| Organization     | Authenticated user can create organization                         | Integration            | US-005                 |
| Organization     | Organization creator receives OWNER role                           | Integration            | US-005                 |
| Organization     | User can join organization using defined join flow                 | Integration            | US-006                 |
| Organization     | Invalid organization join request is rejected                      | Integration            | US-006                 |
| Organization     | User cannot modify organization without permission                 | Integration            | US-011                 |
| Organization     | Unauthorized role changes are rejected                             | Integration            | US-011                 |
| Organization     | Unauthorized member status changes are rejected                    | Integration            | US-011                 |
| Services         | Service can be created                                             | Integration            | US-012                 |
| Services         | Service can be retrieved                                           | Integration            | US-012                 |
| Services         | Service can be updated                                             | Integration            | US-013, US-014         |
| Services         | Service from another organization cannot be accessed               | Integration            | US-007                 |
| Services         | Service deactivation is not part of MVP                            | Regression             | Deferred               |
| Incidents        | Required fields are validated                                      | Unit / Integration     | US-016                 |
| Incidents        | Invalid severity is rejected                                       | Unit / Integration     | US-019                 |
| Incidents        | Valid severity values are accepted                                 | Unit                   | US-019                 |
| Incidents        | New incident receives correct initial status                       | Integration            | US-016                 |
| Incidents        | Incident is assigned to authenticated organization                 | Integration            | US-016, US-043         |
| Incidents        | Incident can be retrieved by authorized user                       | Integration            | US-017                 |
| Incidents        | Incident can be updated by authorized user                         | Integration            | US-018                 |
| Incidents        | Unauthorized incident update is rejected                           | Integration            | US-011, US-018         |
| Incidents        | Incident from another organization cannot be retrieved             | Integration            | US-043                 |
| Lifecycle        | OPEN → INVESTIGATING is allowed                                    | Unit / Integration     | US-021                 |
| Lifecycle        | INVESTIGATING → MITIGATED is allowed                               | Unit / Integration     | US-022                 |
| Lifecycle        | MITIGATED → RESOLVED is allowed                                    | Unit / Integration     | US-023                 |
| Lifecycle        | RESOLVED → CLOSED is allowed                                       | Unit / Integration     | US-024                 |
| Lifecycle        | Invalid state transition is rejected                               | Unit / Integration     | US-021 to US-025       |
| Lifecycle        | Unauthorized user cannot perform restricted transition             | Integration            | US-011                 |
| Timeline         | Incident creation generates event                                  | Integration            | US-031                 |
| Timeline         | Status change generates event                                      | Integration            | US-031, US-033         |
| Timeline         | Severity change generates event                                    | Integration            | US-033                 |
| Timeline         | Events are ordered chronologically                                 | Integration            | US-031                 |
| Timeline         | User cannot access events from another organization                | Integration            | US-043                 |
| Comments         | Comment can be created                                             | Integration            | US-032                 |
| Comments         | Comment author is taken from authenticated user                    | Integration            | US-032                 |
| Comments         | Comment timestamp is generated server-side                         | Integration            | US-032                 |
| Comments         | Empty comment is rejected                                          | Unit / Integration     | US-032                 |
| Comments         | Comments from another organization cannot be accessed              | Integration            | US-043                 |
| Postmortem       | Postmortem cannot be created before incident is resolved           | Unit / Integration     | US-034                 |
| Postmortem       | Postmortem can be created for eligible incident                    | Integration            | US-034                 |
| Postmortem       | Postmortem can be edited by authorized user                        | Integration            | US-035                 |
| Postmortem       | Postmortem review requires appropriate permission                  | Integration            | US-036                 |
| Postmortem       | Postmortem can be published after successful review                | Integration / E2E      | US-036                 |
| Postmortem       | Unreviewed postmortem cannot be published                          | Integration            | US-036                 |
| Postmortem       | Postmortem from another organization cannot be accessed            | Integration            | US-043                 |
| Dashboard        | Dashboard returns only current organization's data                 | Integration            | US-047                 |
| Dashboard        | Dashboard does not expose another organization's incidents         | Integration / Security | US-043, US-047         |
| API              | Missing authentication returns 401                                 | Integration            | Security               |
| API              | Insufficient permissions return 403                                | Integration            | Security               |
| API              | Invalid request returns 400                                        | Unit / Integration     | API                    |
| API              | Missing resource returns 404                                       | Integration            | API                    |
| API              | Invalid state operation returns 409 where applicable               | Integration            | API                    |
| API              | Unexpected errors return generic 500 response                      | Integration            | Security               |
| API              | Error responses follow common schema                               | Integration            | API                    |
| API              | Pagination limits are enforced                                     | Integration            | API                    |
| API              | Invalid filters are rejected                                       | Integration            | API                    |
| API              | Invalid sorting values are rejected                                | Integration            | API                    |
| Security         | Protected endpoints require authentication                         | Integration            | Security               |
| Security         | Session cookie is not accessible to client-side JavaScript         | Integration / E2E      | Security               |
| Security         | Cross-tenant access is rejected                                    | Integration            | Security               |
| Security         | Client cannot select another organization by changing request data | Integration            | Security               |
| Security         | Role cannot be escalated through client input                      | Integration            | Security               |
| Security         | Password hash is never returned by API                             | Integration            | Security               |
| Security         | Sensitive internal errors are not returned                         | Integration            | Security               |
| Security         | Rate limiting protects authentication endpoints                    | Integration            | Security               |
| CI               | Lint succeeds                                                      | CI                     | US-048                 |
| CI               | Type checking succeeds                                             | CI                     | US-049                 |
| CI               | Unit tests succeed                                                 | CI                     | US-050                 |
| CI               | Integration tests succeed                                          | CI                     | US-050                 |
| CI               | Production build succeeds                                          | CI                     | US-051                 |
| E2E              | Registration → Login → Organization creation                       | E2E                    | US-001, US-002, US-005 |
| E2E              | Login → Incident creation → Investigation                          | E2E                    | US-002, US-016, US-021 |
| E2E              | Incident lifecycle from OPEN to CLOSED                             | E2E                    | US-021 to US-025       |
| E2E              | Incident → Comments → Timeline                                     | E2E                    | US-031, US-032         |
| E2E              | Incident → Resolve → Postmortem → Review → Publish                 | E2E                    | US-034 to US-036       |
| E2E              | Complete MVP incident workflow                                     | E2E                    | US-047                 |

## MVP Minimum Coverage

The following rules define the minimum required test coverage for the MVP.

### Business Rules

Every critical business rule must have at least:

- one positive test
- one negative test

Example:

```text
Allowed transition:
OPEN → INVESTIGATING

Positive:
Transition succeeds.

Negative:
OPEN → RESOLVED is rejected.
```

### Protected API Endpoints

Every protected API endpoint must have at least one test verifying that an unauthenticated request is rejected.

Expected result:

401 Unauthorized

### Authorization

Every permission-sensitive operation must have tests for:

permitted role
forbidden role
unauthenticated request

Example:

OWNER
✓ allowed

ADMIN
✓ allowed if permission exists

MEMBER
✗ rejected where owner/admin permission is required

Unauthenticated
✗ 401

### Tenant Isolation

Tenant isolation is a critical security requirement.

It must be tested for:

- reading
- creating
- updating
- searching
- filtering
- timeline access
- comments
- postmortems
- dashboard data
- service access

Example:

Organization A
|
+-- User A
+-- Incident A

Organization B
|
+-- User B
+-- Incident B

User A must never be able to access Incident B.

Expected result:

404 Not Found

or another explicitly defined non-disclosing response.

The API must not reveal that the resource belongs to another organization.

### State Transition Coverage

The incident lifecycle must be tested as a state machine.

Expected valid transitions:

OPEN
|
v
INVESTIGATING
|
v
MITIGATED
|
v
RESOLVED
|
v
CLOSED

Every valid transition requires a positive test.

Invalid transitions require negative tests.

Example:

OPEN → RESOLVED

must fail if the defined business rules require the incident to pass through the intermediate states.

### Severity Coverage

The API must accept only the defined severity values:

- `SEV1`
- `SEV2`
- `SEV3`
- `SEV4`

Tests must verify:

- `SEV1` → valid
- `SEV2` → valid
- `SEV3` → valid
- `SEV4` → valid

and reject invalid values such as:

- `low`
- `medium`
- `high`
- `critical`
- `SEV0`
- `SEV5`

### Role Coverage

The MVP role model is:

- `OWNER`
- `ADMIN`
- `MEMBER`

Tests must verify that:

- roles are assigned correctly
- unauthorized role changes are rejected
- client input cannot escalate privileges
- permissions are checked server-side

The API must never trust a role supplied by the client.

### Postmortem Coverage

The postmortem lifecycle must be tested separately from the incident lifecycle.

Expected flow:

Incident
|
v
RESOLVED
|
v
Create Postmortem
|
v
Edit
|
v
Review
|
v
Publish

The following invalid flows must be rejected:

OPEN
|
X
Create Postmortem

and:

Postmortem
|
X
Publish without required review

### Event and Timeline Coverage

Important state changes must generate events.

At minimum:

Incident Created
Status Changed
Severity Changed
Comment Added
Postmortem Created

Tests must verify:

- the event is created
- the correct event type is stored
- the authenticated user is recorded
- the timestamp is generated server-side
- the event belongs to the correct organization
- the event is visible only to authorized users

### API Error Coverage

The following responses must be tested:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `429 Too Many Requests`
- `500 Internal Server Error`

Error responses must follow the common API structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message."
  }
}
```

Sensitive implementation details must never appear in production error responses.

### Database Testing

Database integration tests must verify:

- required fields
- foreign key relationships
- unique constraints
- organization ownership
- session persistence
- incident persistence
- event persistence
- comment persistence
- postmortem persistence

Tenant isolation must also be verified at the database query level.

### Regression Testing

Every production defect that is fixed must result in a regression test where practical.

Example:

Bug:
User from Organization A could access an incident from Organization B.

Fix:
Tenant filter added to incident query.

Regression test:
Cross-tenant incident access must return 404.

The regression test must remain part of the automated test suite.

### Test Data

Automated tests should use isolated test data.

Tests must not depend on:

- production data
- personal accounts
- external production services
- manually created database records

Test data should be created and cleaned up automatically where possible.

### Test Environment

Automated tests should run against a dedicated test environment or isolated local/test database.

Production data must never be used for automated tests.

### CI Pipeline

The CI pipeline must execute the following checks:

Install Dependencies
|
v
Lint
|
v
Typecheck
|
v
Unit Tests
|
v
Integration Tests
|
v
Build

A failed critical test must cause the CI pipeline to fail.

## Pull Request Requirements

A pull request should not be merged when:

- lint fails
- type checking fails
- required tests fail
- the production build fails
- critical security tests fail

Changes to business logic should include or update relevant tests.

affected user stories where necessary
Changes to API behavior should update:

- API documentation
- relevant tests
- affected user stories where necessary

## Definition of Test Completion

A feature is considered sufficiently tested for the MVP when:

- Happy path is covered
- Invalid input is covered
- Authorization is covered
- Tenant isolation is covered where applicable
- Relevant database behavior is covered
- Critical business rules are covered
- Error responses are covered
- Regression tests exist for known defects
- CI passes

## MVP Release Gate

The MVP must not be released until:

- [ ] All critical unit tests pass
- [ ] All critical integration tests pass
- [ ] Authentication tests pass
- [ ] Authorization tests pass
- [ ] Tenant isolation tests pass
- [ ] Incident lifecycle tests pass
- [ ] Postmortem workflow tests pass
- [ ] Critical E2E flow passes
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Production build passes
- [ ] No known critical security issue remains

## Critical E2E Flow

The primary end-to-end test covers the complete operational workflow:

```text
Register
   |
   v
Login
   |
   v
Create Organization
   |
   v
Create Service
   |
   v
Create Incident
   |
   v
Investigate
   |
   v
Mitigate
   |
   v
Resolve
   |
   v
Create Postmortem
   |
   v
Review Postmortem
   |
   v
Publish Postmortem
   |
   v
Dashboard / Incident History
```

This flow must pass before an MVP release.

## Quality Goals

The FlowOps MVP prioritizes the following:

- Correct business behavior
- Secure authentication
- Reliable authorization
- Strong tenant isolation
- Correct incident lifecycle handling
- Reliable audit/event history
- Stable API behavior
- Automated regression protection
- Reproducible CI checks
- Safe release process

The objective is not maximum test count.

The objective is reliable coverage of the application's most important business and security risks.
