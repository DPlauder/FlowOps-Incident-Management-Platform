# FlowOps – System Architecture

> This document describes the planned architecture, responsibilities, security boundaries, and technical trade-offs of the FlowOps MVP.

## 1. Logical Architecture

The application is divided into four logical layers:

- Presentation Layer
- API Layer
- Application/Domain Layer
- Data Layer

## 2. Infrastructure

The MVP is designed around Cloudflare's serverless platform.

### 2.1 Infrastructure Components

| Component       | Technology         | Responsibility           |
| --------------- | ------------------ | ------------------------ |
| Frontend        | React + TypeScript | User interface           |
| API             | Hono               | HTTP API                 |
| Runtime         | Cloudflare Workers | Backend execution        |
| Database        | Cloudflare D1      | Persistent data          |
| Version control | GitHub             | Source code              |
| CI              | GitHub Actions     | Automated quality checks |
| Deployment      | Cloudflare         | Production hosting       |

The exact infrastructure may be adjusted during implementation if technical constraints require it.

## 3. Frontend Architecture

The frontend is implemented using React and TypeScript.

The frontend is responsible for:

- rendering the user interface
- handling user interactions
- managing client-side UI state
- sending API requests
- displaying API responses
- displaying validation errors
- displaying loading and error states

The frontend must not be responsible for security decisions.

For example, hiding a button based on the user's role is a UX improvement, but it is not an authorization mechanism.

Authorization must always be enforced by the backend.

### 3.1 Frontend Structure

The frontend should be organized by responsibility and feature.

An example structure:

```text
src/
├── components/
│ ├── ui/
│ └── layout/
│
├── features/
│ ├── auth/
│ ├── incidents/
│ ├── services/
│ ├── organizations/
│ └── postmortems/
│
├── pages/
│
├── lib/
│ ├── api/
│ ├── auth/
│ └── validation/
│
├── hooks/
│
└── types/
```

The exact structure may evolve during implementation.

The goal is to avoid placing all application logic into a small number of large files.

## 4. Backend Architecture

The backend runs as a Cloudflare Worker.

Hono is used as the HTTP framework.

The backend is responsible for:

- authentication
- authorization
- request validation
- business rules
- database access
- state transitions
- audit event creation
- error handling

The backend is the security boundary of the application.

## 5. Backend Layering

The backend follows a lightweight layered architecture.

```text
HTTP Request
│
▼
┌───────────────┐
│ Routes        │
└───────┬───────┘
▼
┌───────────────┐
│ Middleware    │
│               │
│ Auth          │
│ Authorization │
│ Validation    │
└───────┬───────┘
▼
┌───────────────┐
│ Services      │
│               │
│ Business      │
│ Logic         │
└───────┬───────┘
▼
┌───────────────┐
│ Repositories  │
│ / Data Access │
└───────┬───────┘
▼
┌───────────────┐
│ D1            │
└───────────────┘
```

## 6. API Layer

The API layer handles HTTP-specific concerns.

Responsibilities include:

- route definitions
- request parsing
- input validation
- authentication middleware
- authorization middleware
- response formatting
- HTTP status codes

The API layer should not contain complex business rules.

For example, the route handler should not contain the complete logic for changing an incident from INVESTIGATING to RESOLVED.

That logic belongs in the application/domain layer.

## 7. Application / Domain Layer

The application layer contains the core business logic of FlowOps.

Examples include:

- creating incidents
- assigning incidents
- changing incident status
- creating comments
- creating timeline events
- creating postmortems
- validating state transitions

This layer should contain the rules that define how FlowOps behaves.

### 7.1 Incident State Machine

Incident status changes follow a controlled state machine.

```text
             ┌─────────────────┐
             │      OPEN       │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  INVESTIGATING  │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │    MITIGATED    │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │    RESOLVED     │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │     CLOSED      │
             └─────────────────┘
```

Invalid transitions must be rejected by the application layer.

For example:

OPEN → RESOLVED

must not be allowed unless explicitly supported by the business rules.

Every valid transition generates an audit event.

## 8. Data Access Layer

The data access layer is responsible for communicating with Cloudflare D1.

The application layer should not contain raw SQL throughout the business logic.

Instead, database access should be isolated behind dedicated data access functions or repositories.

Conceptually:

```text
Application Service
│
▼
Repository
│
▼
D1
```

This makes the business logic easier to test and reduces coupling to the database implementation.

## 9. Database

Cloudflare D1 is used as the primary database for the MVP.

D1 is based on SQLite.

The database stores:

- users
- organizations
- organization memberships
- services
- incidents
- incident events
- comments
- postmortems
- sessions

The detailed schema is documented separately in [Data-Model.md](Data-Model.md).

## 10. Multi-Tenancy

FlowOps uses organization-based multi-tenancy.

Each organization represents an isolated tenant.

Resources belonging to an organization include:

```text
Organization
│
├── Members
├── Services
├── Incidents
├── Comments
├── Events
└── Postmortems
```

A user may only access resources belonging to an organization they are a member of.

The organization context is derived from the authenticated session.

It must never be trusted solely from a client-provided organization ID.

## 11. Authentication Flow

The authentication flow is based on server-side sessions.

```text
User
│
│ Login
▼
Frontend
│
│ POST /api/auth/login
▼
API
│
├── Validate credentials
│
├── Verify password hash
│
├── Create session
│
└── Set secure cookie
│
▼
Browser
```

For subsequent requests:

```text
Browser
│
│ Cookie
▼
API
│
├── Validate session
├── Resolve user
├── Resolve organization
└── Check permissions
```

Authentication and security details are documented separately in [Security.md](Security.md).

## 12. Authorization Flow

Authorization is performed server-side.

The general flow is:

```text
Request
│
▼
Authenticated?
│
├── No → 401
│
▼
Organization membership?
│
├── No → Access denied
│
▼
Required role?
│
├── No → 403
│
▼
Resource belongs to organization?
│
├── No → Access denied
│
▼
Business operation
```

The frontend may hide UI elements based on permissions, but this is not considered a security mechanism.

## 13. Request Lifecycle

A typical authenticated request follows this flow:

```text
Browser
│
│ HTTPS
▼
Cloudflare
│
▼
Hono Router
│
▼
Authentication Middleware
│
▼
Authorization Middleware
│
▼
Request Validation
│
▼
Application Service
│
▼
Repository
│
▼
D1
│
▼
Repository
│
▼
Application Service
│
▼
API Response
│
▼
Browser
```

## 14. Error Handling

Errors are handled consistently across the application.

The API uses standardized HTTP status codes.

| Status | Meaning                  |
| -----: | ------------------------ |
|  `400` | Invalid request          |
|  `401` | Authentication required  |
|  `403` | Insufficient permissions |
|  `404` | Resource not found       |
|  `409` | Resource conflict        |
|  `500` | Unexpected server error  |

Error responses use a consistent JSON structure.

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "fields": {}
  }
}
```

Internal implementation details must not be exposed to clients.

## 15. API Communication

The frontend communicates with the backend exclusively through the HTTP API.

The frontend must not access the database directly.

```text
React
│
│ HTTP / JSON
▼
API
│
▼
Application Logic
│
▼
D1
```

This provides a clear security boundary and keeps business logic on the server.

The complete API specification is documented in [API.md](API.md).

## 16. Audit Trail

FlowOps maintains an audit trail for relevant incident changes.

Examples include:

incident created
incident assigned
severity changed
status changed
comment added
postmortem created
postmortem published

The audit trail allows users to reconstruct what happened during an incident.

Conceptually:

```text
Incident
│
├── Event
├── Event
├── Comment
├── Event
└── Event
```

Audit events are generated by the application layer rather than being trusted to the frontend.

## 17. Postmortem Architecture

Postmortems are associated with incidents.

The relationship is:

```text
Incident
│
└── Postmortem
```

A postmortem contains structured information such as:

- summary
- impact
- root cause
- timeline
- resolution
- corrective actions
- lessons learned

Postmortems are only created after an incident has reached an appropriate lifecycle state.

The exact data structure is defined in [Data-Model.md](Data-Model.md).

## 18. Validation Strategy

Input validation occurs at the API boundary.

The system validates:

- required fields
- data types
- string lengths
- enum values
- IDs
- relationships
- status transitions

Validation is performed server-side even if the frontend performs the same validation for usability.

The frontend validation is therefore considered a UX feature, not a security mechanism.

## 19. Testing Architecture

Testing is performed at multiple levels.

```text
              ┌─────────────┐
              │   E2E Tests │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │ Integration │
              │    Tests    │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │ Unit Tests  │
              └─────────────┘
```

### Unit Tests

Used for isolated business logic.

Examples:

- incident state transitions
- permission checks
- validation logic

### Integration Tests

Used to verify API and database interaction.

Examples:

- create incident
- retrieve incident
- update incident
- organization isolation

### End-to-End Tests

Used for critical user journeys.

Example:

```text
Register -> Login -> Create Incident -> Assign Incident
      -> Investigate -> Resolve -> Create Postmortem
```

Testing details are documented in the testing strategy.

## 20. Deployment Architecture

The MVP is designed for serverless deployment.

Conceptually:

```text
                GitHub
                   │
                   │ Push
                   ▼
             GitHub Actions
                   │
             ┌─────┴─────┐
             │           │
             ▼           ▼
         Typecheck     Tests
             │           │
             └─────┬─────┘
                   │
                   ▼
              Deployment
                   │
                   ▼
              Cloudflare
             ┌────┴────┐
             │         │
             ▼         ▼
          Frontend    Worker
                         │
                         ▼
                         D1
```

The exact deployment configuration is documented separately in the release and deployment documentation.

## 21. Environment Configuration

Environment-specific configuration must not be committed to the repository.

Examples include:

- secrets
- authentication configuration
- API keys
- environment-specific identifiers

Development and production environments should be separated.

## 22. Observability

The MVP will use lightweight logging and error reporting.

The initial goal is to provide enough information to diagnose application errors without introducing additional paid infrastructure.

Logs must not contain sensitive information.

Potential future improvements include:

- structured logging
- metrics
- performance monitoring
- external error tracking

These are outside the initial MVP scope.

## 23. Scalability Considerations

The initial architecture is optimized for simplicity rather than maximum scale.

Potential future scaling challenges include:

- database size
- high-frequency event creation
- complex analytics queries
- background processing
- notification delivery
- large organizations
- external monitoring integrations

The architecture keeps the application and data access layers sufficiently separated so that individual components can be replaced or extended later.

## 24. Architecture Trade-offs

The architecture deliberately favors simplicity over infrastructure complexity.

### Advantages

- Low operational cost
- Simple deployment
- Small infrastructure footprint
- Easy local development
- Clear separation of responsibilities
- Suitable for a solo-developed MVP

### Disadvantages

- Cloudflare-specific runtime considerations
- D1/SQLite limitations
- Limited background processing compared with dedicated infrastructure
- Serverless-specific constraints

These trade-offs are accepted for the MVP.

## 25. Architectural Principles

The following principles guide implementation.

### Principle 1 – Server is the Security Boundary

The frontend must never be trusted with security decisions.

### Principle 2 – Business Logic is Centralized

Important business rules should not be duplicated across routes and frontend components.

### Principle 3 – Data Access is Isolated

Database access should be separated from business logic.

### Principle 4 – Tenant Isolation is Mandatory

Every organization-owned resource must be scoped to the authenticated organization.

### Principle 5 – Prefer Simple Solutions

The MVP should avoid unnecessary infrastructure and abstractions.

### Principle 6 – Document Important Decisions

Significant architectural decisions should be documented using Architecture Decision Records.

### Principle 7 – Design for Change

The system should remain modular enough to replace individual components when requirements change.

## 26. Architecture Decision Records

Important architectural decisions are documented separately as ADRs.

Examples:

- ADR-001 – Frontend Framework
- ADR-002 – Backend Runtime
- ADR-003 – Database
- ADR-004 – Authentication Strategy
- ADR-005 – Multi-Tenant Data Isolation
- ADR-006 – API Architecture

ADRs document:

- Context
- Considered options
- Decision
- Consequences

## 27. Open Architectural Questions

The following questions are intentionally left open until the relevant implementation phase.

- What exact session storage strategy should be used?
- What password hashing implementation should be used?
- How should rate limiting be implemented within the free infrastructure?
- Which validation library should be used?
- How should database migrations be handled in CI/CD?
- What level of logging is sufficient for the MVP?
- Should API responses use DTOs separate from database models?
- How should pagination be implemented for incident lists?

Open questions are tracked in:

the risks and open questions documentation.

## 28. Architecture Status

| Status          | Items                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Current**     | Planning                                                                                                                                                |
| **Completed**   | Requirements; User Stories; MVP definition; MVP backlog; initial API design; initial security requirements                                              |
| **In progress** | System architecture; data model; technology decisions; Architecture Decision Records                                                                    |
| **Next steps**  | Finalize architecture; create data model; define database schema; finalize API contracts; document architecture decisions; begin project implementation |
