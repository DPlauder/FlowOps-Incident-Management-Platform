# FlowOps - Definition of Ready

## Purpose

This document defines the minimum conditions that must be fulfilled before a User Story is considered ready for implementation.

The purpose of the Definition of Ready is to prevent development work from starting with unclear requirements, unresolved architectural decisions, missing acceptance criteria, or undefined dependencies.

A User Story that does not meet the required criteria should not be moved into active implementation.

---

## 1. Definition of Ready Principles

A story is considered Ready when:

- the business requirement is understood
- the expected behavior is clearly defined
- acceptance criteria are testable
- required dependencies are known
- relevant API behavior is defined
- relevant data model requirements are defined
- security implications are understood
- the story can reasonably be implemented within the planned sprint
- no unresolved critical question blocks implementation

The Definition of Ready is a planning tool.

It does not require every technical detail to be fully implemented or documented before development starts.

---

## 2. Mandatory Criteria

A User Story must satisfy all mandatory criteria before implementation.

| ID      | Criterion                                                         | Required |
| ------- | ----------------------------------------------------------------- | -------- |
| DOR-001 | User Story has a clear title                                      | Yes      |
| DOR-002 | User Story contains a clear description                           | Yes      |
| DOR-003 | User Story has defined acceptance criteria                        | Yes      |
| DOR-004 | Acceptance criteria are testable                                  | Yes      |
| DOR-005 | Story has an assigned priority                                    | Yes      |
| DOR-006 | Story has an estimated Story Point value                          | Yes      |
| DOR-007 | Story dependencies are identified                                 | Yes      |
| DOR-008 | Required API behavior is defined                                  | Yes      |
| DOR-009 | Required data model changes are identified                        | Yes      |
| DOR-010 | Required authorization rules are known                            | Yes      |
| DOR-011 | Tenant isolation requirements are known where applicable          | Yes      |
| DOR-012 | Required tests can be identified                                  | Yes      |
| DOR-013 | No critical open question blocks implementation                   | Yes      |
| DOR-014 | Story is small enough to be implemented within the planned sprint | Yes      |

---

## 3. Requirement Readiness

Before implementation starts, the intended behavior of the story must be understandable.

The team should be able to answer:

- What problem does this story solve?
- Who is performing the action?
- What should happen?
- What should happen when the input is invalid?
- What permissions are required?
- What should happen when the resource does not exist?
- What security restrictions apply?

If these questions cannot be answered, the story is not Ready.

---

## 4. Acceptance Criteria

Every implementation-ready story must have explicit acceptance criteria.

Acceptance criteria should describe observable behavior.

Example:

```text
Given an authenticated user
When the user creates an organization
Then the organization is created
And the user becomes an OWNER

Negative behavior must also be defined where relevant.

Example:

Given an unauthenticated user
When the user attempts to create an organization
Then the API returns 401 Unauthorized
```

Acceptance criteria should avoid prescribing unnecessary implementation details.

## 5. API Readiness

If a story requires an API endpoint, the API contract must be sufficiently defined before implementation.

The following should be known:

authentication requirement
authorization requirement

- HTTP method
- route
- authentication requirement
- authorization requirement
- request structure
- response structure
- validation behavior
- relevant error responses

Example:

POST /api/organization

The implementation should not begin if the required API behavior is still undefined.

The authoritative API specification is:

03-Architektur/API.md

## 6. Data Model Readiness

If a story requires persistent data, the affected data model must be understood.

The following should be known where applicable:

- entities involved
- relationships
- required fields
- optional fields
- foreign keys
- unique constraints
- organization ownership
- indexes where relevant

The authoritative data model is:

03-Architektur/Data-Model.md

A story does not require the final database migration to exist before it becomes Ready.

The required schema changes must, however, be understood.

## 7. Security Readiness

Security requirements must be identified before implementing security-sensitive functionality.

This includes:

authorization
tenant isolation

- authentication
- authorization
- session handling
- role checks
- tenant isolation
- sensitive data handling
- rate limiting where applicable
- server-side validation

For multi-tenant resources, the story must explicitly identify the organization boundary.

Example:

The organization must be derived from the authenticated user's membership.

The organization ID supplied by the client must not be trusted as the authorization boundary.

The authoritative security specification is:

03-Architektur/Security.md

## 8. Role and Permission Readiness

FlowOps uses the following roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

If a story is role-sensitive, the required permissions must be known before implementation.

Example:

```text
OWNER
    ✓ allowed

ADMIN
    ✓ allowed if explicitly defined

MEMBER
    ✗ rejected if permission is not granted

Unauthenticated
    ✗ 401 Unauthorized
```

Permissions must be enforced server-side.

## 9. Tenant Isolation Readiness

Any story involving organization-owned resources must define the tenant boundary.

events
dashboard data
Examples:

- organizations
- services
- incidents
- events
- comments
- postmortems
- dashboard data

The implementation must ensure that users can only access resources belonging to organizations for which they have valid membership.

Tenant isolation must be testable.

At minimum, the story must define behavior for:

Same Organization
→ permitted if role allows it

Different Organization
→ rejected

## 10. Testing Readiness

Before a story enters implementation, the required tests should be identifiable.

authorization behavior
tenant isolation where applicable
At minimum, determine:

- happy path
- invalid input
- authorization behavior
- tenant isolation where applicable
- relevant business rules
- expected API errors

Example:

Feature:
Create Incident

Tests:
✓ valid incident can be created
✓ missing required field is rejected
✓ invalid severity is rejected
✓ unauthenticated request is rejected
✓ unauthorized organization access is rejected
✓ correct organization is assigned
✓ incident creation creates required event

The story does not require every test to be implemented before development begins.

The required test scope must be understood.

## 11. Dependency Readiness

Dependencies must be identified before a story is started.

Dependencies may include:

previous User Stories
database schema
authentication
organization membership
API infrastructure
shared components
security functionality

Example:

US-016 Create Incident

Depends on:

US-001 Authentication
US-005 Organization
US-011 Authorization
US-012 Service Management

A story with an unresolved blocking dependency is not Ready.

## 12. Open Questions

Open questions must be reviewed before implementation.

A story is not Ready if a critical question remains unresolved.

Examples:

❌ Which role is allowed to publish a postmortem?
❌ How is organization membership determined?
❌ Can users belong to multiple organizations?
❌ What happens when a membership is disabled?

Questions that do not affect the implementation may remain open.

## 13. Scope Readiness

The story must have a clearly defined scope.

The implementation should answer:

Included:

- Required MVP functionality

Excluded:

- Deferred functionality
- Future enhancements
- Optional improvements

Features outside the MVP should not be silently added to the implementation.

If the scope changes significantly, the story should be re-evaluated.

## 14. Story Size

A story should be small enough to be implemented within the planned sprint.

As a guideline:

| Story Points | Recommendation    |
| -----------: | ----------------- |
|            1 | Ready             |
|            2 | Ready             |
|            3 | Ready             |
|            5 | Ready             |
|            8 | Review complexity |
|          13+ | Split story       |

Stories estimated at 13 points or more should normally be split into smaller stories unless there is a documented reason not to do so.

## 15. Definition of Ready Checklist

Before moving a story into implementation, verify:

### Minimum Ready Gate

A story may enter a sprint only when all of the following criteria are fulfilled:

- [ ] Requirement is understood
- [ ] Acceptance criteria are defined
- [ ] Dependencies are identified
- [ ] Technical approach is sufficiently understood
- [ ] Required API changes are known
- [ ] Required database changes are known
- [ ] Security implications are identified
- [ ] Testing approach is defined
- [ ] Story can be estimated
- [ ] Story is small enough for a sprint

### Business Requirements

- [ ] Story is clearly understood
- [ ] User and goal are defined
- [ ] Scope is clear

### Acceptance Criteria

- [ ] Acceptance criteria exist
- [ ] Acceptance criteria are testable
- [ ] Positive behavior is defined
- [ ] Negative behavior is defined where applicable

### Planning

- [ ] Priority is assigned
- [ ] Story Points are assigned
- [ ] Dependencies are known
- [ ] Story fits the sprint

### API

- [ ] Required endpoint is defined
- [ ] Request structure is known
- [ ] Response structure is known
- [ ] Error behavior is defined

### Data Model

- [ ] Required entities are known
- [ ] Required fields are known
- [ ] Relationships are understood
- [ ] Required schema changes are identified

### Security

- [ ] Authentication requirements are known
- [ ] Authorization requirements are known
- [ ] Role requirements are known
- [ ] Tenant isolation is defined where applicable
- [ ] Server-side validation requirements are known

### Testing

- [ ] Unit test requirements are known
- [ ] Integration test requirements are known
- [ ] E2E requirements are known where applicable

### Open Questions

- [ ] No critical open question blocks implementation
- [ ] No unresolved architectural decision blocks implementation

## 16. Ready / Not Ready Decision

A User Story receives one of two states.

### READY

The story satisfies all mandatory criteria.

It can be selected for a sprint.

```text
READY
  ↓
Sprint
  ↓
Implementation
```

### NOT READY

One or more mandatory criteria are missing.

The story must remain outside active implementation.

```text
NOT READY
   ↓
Clarification
   ↓
Documentation Update
   ↓
Re-Review
   ↓
READY
```

## 17. Definition of Ready vs Definition of Done

Definition of Ready and Definition of Done serve different purposes.

### Definition of Ready

Answers:

Can we start implementing this story?

### Definition of Done

Answers:

Is this story completely implemented and releasable?

The relationship is:

```text
Definition of Ready
        |
        v
Implementation
        |
        v
Testing
        |
        v
Definition of Done
```

A story must satisfy the Definition of Ready before implementation begins.

A story must satisfy the Definition of Done before it is considered completed.

## 18. Documentation References

The following documents are relevant when evaluating whether a story is Ready:

```text
01-Anforderungen/
    ├── Anforderungsblatt-de.md
    └── Requirements-Specification-en.md

02-Produktplanung/
    ├── MVP-Core.md
    ├── MVP-Backlog-de.md
    ├── Backlog-Matrix.md
    └── User-Stories/

03-Architektur/
    ├── Architecture.md
    ├── Data-Model.md
    ├── API.md
    ├── Security.md
    └── ADR/

05-Qualitaet/
    ├── Testing-Matrix.md
    └── Risks-and-Open-Questions.md
```

These documents should remain consistent with each other.

## 19. Change Management

If implementation reveals that a story is not actually Ready, development should not continue by silently changing requirements.

Instead:

Stop at the unclear decision.
Identify the missing information.
Update the relevant documentation.
Update the User Story if required.
Update the API, data model, or security documentation if required.
Update the testing requirements.
Re-evaluate the story.
Continue implementation once the story is Ready again.

This prevents undocumented architectural decisions from accumulating in the codebase.

## 20. MVP Readiness Gate

Before Sprint 1 begins, the following must be completed:

- [ ] Requirements are finalized
- [ ] User Stories are finalized
- [ ] MVP Backlog is finalized
- [ ] Architecture is finalized
- [ ] Data Model is finalized
- [ ] API specification is finalized
- [ ] Security specification is finalized
- [ ] Relevant ADRs are finalized
- [ ] Testing Matrix is finalized
- [ ] Critical risks are addressed or explicitly accepted
- [ ] Blocking open questions are resolved
- [ ] Sprint scope is defined
- [ ] Definition of Done is defined

## 21. Current Status

| Area                   | Status      |
| ---------------------- | ----------- |
| Requirements           | Completed   |
| User Stories           | Completed   |
| MVP Backlog            | Completed   |
| Architecture           | Completed   |
| Data Model             | Completed   |
| API Specification      | Completed   |
| Security Specification | Completed   |
| ADRs                   | Completed   |
| Testing Matrix         | Completed   |
| Risk Register          | In Progress |
| Open Questions         | In Progress |
| Definition of Ready    | Completed   |
| Definition of Done     | Pending     |
| Sprint Planning        | Pending     |
| Implementation         | Not Started |

## 22. Final Rule

A story should not be implemented simply because it is next in the backlog.

It should be implemented because:

Requirement
↓
User Story
↓
Acceptance Criteria
↓
API
↓
Data Model
↓
Security
↓
Testing
↓
Dependencies
↓
READY

Only after this chain is sufficiently defined should implementation begin.
