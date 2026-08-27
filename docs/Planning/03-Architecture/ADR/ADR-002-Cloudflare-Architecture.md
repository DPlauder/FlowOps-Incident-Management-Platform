# ADR-002 – Cloudflare Architecture

## Status

Accepted

## Date

2026-08

## Decision

FlowOps will use Cloudflare as the primary application and infrastructure platform for the MVP.

The initial deployment architecture consists of:

- Cloudflare Workers for server-side application execution
- Cloudflare D1 for the relational database
- Cloudflare's deployment infrastructure for the application
- GitHub as the source code repository
- GitHub-based deployment integration where appropriate

The application will be designed around a serverless architecture.

The initial architecture is:

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  │ HTTPS
                                  ▼
                         ┌──────────────────┐
                         │    Cloudflare    │
                         │                  │
                         │  Application     │
                         │  / Workers       │
                         └────────┬─────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌──────────────────┐       ┌──────────────────┐
           │   Application    │       │   Cloudflare D1  │
           │   / API Logic    │──────▶│   SQLite DB      │
           └──────────────────┘       └──────────────────┘
```

The goal is to provide a production-oriented architecture while keeping infrastructure complexity and operating costs low.

## Context

FlowOps is a portfolio project intended to demonstrate the development of a realistic software application.

The project should demonstrate not only frontend development but also:

- Backend development
- API design
- Authentication
- Authorization
- Database design
- Multi-tenant architecture
- Testing
- Deployment
- Infrastructure decisions
- Security
- Documentation

The project is developed by a single developer.

The infrastructure therefore needs to remain manageable without introducing unnecessary operational complexity.

A major project requirement is that the MVP should be possible to develop and operate without recurring infrastructure costs.

This creates several constraints for the deployment architecture.

## Requirements

The deployment platform should provide the following capabilities.

### Application Runtime

The platform must be able to execute the server-side application and API.

### Database

The application requires a relational database.

The database must support:

- Persistent storage
- Relationships
- Transactions where required
- Constraints
- Queries
- Organization-based tenant isolation

### HTTPS

Production traffic must be transmitted over HTTPS.

### Serverless Execution

The application should not require the developer to manage a traditional server.

The architecture should avoid:

- Server provisioning
- Operating system maintenance
- Manual process management
- Manual scaling configuration

### Low Operational Complexity

The deployment should be straightforward enough for a single developer to maintain.

### Low Cost

The initial infrastructure should be usable within the free-tier capabilities of the selected platform.

The architecture must nevertheless document that free-tier limits are not unlimited.

### Portfolio Value

The infrastructure should demonstrate realistic engineering decisions.

The goal is not to select the simplest possible hosting provider.

The goal is to demonstrate an architecture that is:

- Practical
- Explainable
- Maintainable
- Secure
- Cost-conscious
- Production-oriented

## Considered Options

The following deployment approaches were considered.

### Cloudflare

Potential components:

- Workers
- D1
- Pages / application deployment
- Additional Cloudflare services where required

### Vercel

Vercel was considered because of its strong integration with Next.js.

Advantages include:

- Excellent Next.js integration
- Simple deployment
- Serverless functions
- Preview deployments
- Low initial setup complexity

However, using Vercel together with a separate database would introduce another infrastructure provider.

The project also benefits from using a single infrastructure platform for the application runtime and database.

### Netlify

Netlify was considered as another serverless deployment platform.

It provides:

- Serverless functions
- Frontend deployment
- CI/CD integration

However, it does not provide the same integrated relational database architecture selected for FlowOps.

### Traditional VPS

A traditional VPS could host:

Next.js
Database
Reverse Proxy
Application Runtime

This approach was rejected for the MVP because it introduces additional operational responsibilities.

Examples include:

- Server updates
- OS security
- Firewall configuration
- Process management
- Database maintenance
- Backups
- Monitoring

These responsibilities are not central to the goals of the FlowOps MVP.

### Docker-Based Deployment

A Docker-based architecture was considered.

For example:

Docker
├── Next.js
├── Database
└── Reverse Proxy

Docker provides useful reproducibility and environment isolation.

However, it is not necessary for the initial MVP because the selected infrastructure already provides the required runtime environment.

Docker may be introduced later if the architecture becomes more complex.

## Why Cloudflare

Cloudflare was selected because it provides several infrastructure capabilities within one ecosystem.

The architecture can therefore be simplified to:

```text
GitHub
   │
   ▼
Cloudflare
   │
   ├── Application Runtime
   └── Database
```

This reduces the number of independently managed services.

The selected architecture also fits the project's serverless requirements.

### Cloudflare Workers

Cloudflare Workers is responsible for executing server-side application code.

The application logic includes:

- API routes
- Authentication
- Authorization
- Validation
- Business logic
- Database access

The runtime is stateless from the application's perspective.

Persistent application state must therefore be stored in external services such as D1.

#### Worker Responsibilities

The Worker is responsible for:

HTTP Request
│
▼
Authentication
│
▼
Authorization
│
▼
Validation
│
▼
Business Logic
│
▼
Database Access
│
▼
HTTP Response

The Worker must not rely on local persistent state.

### Cloudflare D1

Cloudflare D1 is the primary database for FlowOps.

D1 provides a SQLite-based relational database.

The database stores:

- `organizations`
- `users`
- `organization_members`
- `sessions`
- `services`
- `incidents`
- `incident_events`
- `comments`
- `postmortems`

The database is therefore responsible for persistent application state.

#### Why D1

D1 was selected because it provides a relational database while remaining closely integrated with the selected Cloudflare runtime.

This allows the project to avoid managing a separate database server.

The architecture can therefore remain:

Application
│
▼
Cloudflare Worker
│
▼
Cloudflare D1

without requiring another external infrastructure provider.

#### Relational Data Model

The application requires a relational data model.

Important relationships include:

Organization
│
├── Members
│
├── Services
│
└── Incidents
│
├── Events
├── Comments
└── Postmortem

D1 is suitable for this model.

The detailed schema is documented in:

../Data-Model.md

### Tenant Isolation

Cloudflare is not responsible for FlowOps's application-level tenant isolation.

Tenant isolation is implemented by the application and database access layer.

Every organization-owned resource contains an organization identifier.

Examples:

- `services.organization_id`
- `incidents.organization_id`
- `incident_events.organization_id`
- `comments.organization_id`
- `postmortems.organization_id`

Every protected query must enforce the authenticated user's organization context.

Example:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The organization_id must come from the authenticated application context.

It must not be trusted from client input.

### Authentication

Cloudflare provides the infrastructure runtime but does not provide the application's authorization model.

FlowOps implements authentication itself.

The authentication flow is:

Browser
│
│ Login
▼
Worker
│
├── Validate credentials
│
├── Verify password
│
└── Create session
│
▼
D1
│
└── Session stored
│
▼
Secure HTTP-only Cookie

The authentication architecture is documented in:

../Security.md

and related ADRs.

### Session Storage

Sessions are stored in D1.

The application does not rely on Worker memory for authentication state.

This is important because serverless execution does not guarantee that subsequent requests will reach the same runtime instance.

The session lookup therefore follows:

Request
│
▼
Session Cookie
│
▼
Worker
│
▼
D1 Session Lookup
│
▼
Authenticated User

### Stateless Application Runtime

The Worker layer should be treated as stateless.

The application must not rely on:

- Global mutable state
- Local files for persistent storage
- In-memory session storage
- In-memory user data
- Runtime instance affinity

Persistent information belongs in the database or another explicitly selected persistent service.

## Environment Configuration

The application will distinguish between environments.

Initial environments:

- Development
- Test
- Production

Environment-specific configuration must not be hard-coded.

Examples include:

Database configuration
Session secrets
Application configuration
Deployment configuration

Secrets must be provided through the appropriate environment configuration mechanism.

### Secrets

Secrets must never be committed to Git.

The repository may contain:

.env.example

but must not contain real secrets.

Examples of sensitive values include:

- `SESSION_SECRET`
- `DATABASE_CREDENTIAL`
- `API_KEY`
- `PRIVATE_KEY`

If Cloudflare-specific secret storage is required, secrets will be configured through the deployment environment.

## Source Code Repository

GitHub is the source of truth for application code.

The repository contains:

- Application Source
- Database Migrations
- Tests
- Documentation
- Architecture Decisions
- Project Planning

The deployment pipeline should use the repository as the source for deployments.

## Deployment Flow

The intended deployment workflow is:

Developer
│
▼
Local Development
│
▼
Git Commit
│
▼
GitHub
│
▼
Deployment
│
▼
Cloudflare
│
├── Application
│
└── D1

The exact CI/CD implementation will be finalized during the implementation phase.

## Database Migrations

Database schema changes must be managed through version-controlled migrations.

Example:

```text
migrations/
├── 0001_initial_schema.sql
├── 0002_add_services.sql
├── 0003_add_incident_events.sql
└── ...
```

The migration files are stored in Git.

A deployment must not rely on manually modifying the production database.

### Migration Principle

Every schema change must be reproducible.

For example:

Development Database
│
│ migrations
▼
Test Database
│
│ migrations
▼
Production Database

This ensures that the database schema can be recreated from version-controlled source files.

## API Architecture

The API is exposed through the application runtime.

The API base path is `/api`.

Examples:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

GET /api/incidents
POST /api/incidents
GET /api/incidents/:id
PATCH /api/incidents/:id

GET /api/incidents/:id/events
POST /api/incidents/:id/comments
POST /api/incidents/:id/postmortem
```

The API conventions are documented separately in:

../API.md

### Request Lifecycle

A protected API request follows this architecture:

Client
│
▼
Cloudflare
│
▼
Worker
│
├── Parse Request
│
├── Authenticate
│
├── Load Organization Context
│
├── Authorize
│
├── Validate Input
│
├── Execute Business Logic
│
├── Access D1
│
└── Build Response
│
▼
Client

The exact implementation may separate these concerns into different application modules.

## Error Handling

Infrastructure errors and application errors must be handled separately.

Expected application errors include:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

Unexpected application failures return:

500 Internal Server Error

Production responses must not expose internal implementation details.

## Security Boundaries

The architecture defines several security boundaries.

Browser
│
│ Untrusted
▼
API
│
│ Authentication
▼
Application
│
│ Authorization
▼
Domain Logic
│
│ Tenant Validation
▼
Data Access
│
▼
D1

The most important rule is:

The client is never a trusted security boundary.

### Cloudflare Security Responsibilities

Cloudflare provides infrastructure-level capabilities such as:

- HTTPS
- Network-level infrastructure
- Runtime isolation
- Platform security
- Deployment infrastructure

However, FlowOps remains responsible for application-level security.

FlowOps must implement:

- Authentication
- Authorization
- Tenant isolation
- Input validation
- Session management
- Password security
- SQL injection protection
- XSS protection
- CSRF protection
- Secure error handling
- Application-level audit logging

Cloudflare therefore does not replace the application's security architecture.

HTTPS

Production traffic must use HTTPS.

The intended communication flow is:

Browser
│
│ HTTPS
▼
Cloudflare
│
▼
Worker

Sensitive authentication information must never be transmitted over unencrypted HTTP.

### HTTP Security Headers

The production application should configure appropriate security headers.

Potential headers include:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`

The exact configuration will be finalized during implementation.

### Logging

Application logging must not expose sensitive information.

The application must never log:

- `password`
- `password_hash`
- `session_id`
- `session_cookie`
- API keys
- secrets
- private keys

Logs should provide enough information for debugging without exposing credentials or sensitive user information.

### Monitoring

The MVP will use basic platform and application logging.

A dedicated observability platform is not required for the initial MVP.

Future monitoring capabilities may include:

- Metrics
- Tracing
- Error tracking
- Performance monitoring
- Alerting

These are intentionally outside the initial MVP scope unless required by the implementation.

## Availability

The architecture benefits from a managed serverless runtime.

The application does not require a continuously running server process.

However, the MVP does not define a formal high-availability or disaster-recovery architecture.

The following are explicitly outside the initial scope:

- Multi-region database architecture
- Custom failover infrastructure
- Dedicated disaster recovery environment
- Formal SLA

These may be introduced in a future version.

## Backups

Database backup requirements must be evaluated before production-like usage.

The MVP should not assume that platform-level persistence automatically satisfies a complete backup strategy.

A future backup strategy may include:

- Scheduled database exports
- Versioned backups
- Recovery testing
- Documented restoration procedure

The exact strategy is tracked as an open question.

## Cost Model

One of the main reasons for selecting Cloudflare is the ability to build and operate the MVP without recurring infrastructure costs.

The expected infrastructure footprint is:

```text
GitHub
   │
   ▼
Cloudflare
   ├── Workers
   └── D1
```

No paid database server or VPS is required.

However, free-tier usage limits may change over time.

The project therefore treats the free-tier assumption as a constraint rather than a permanent guarantee.

### Cost Monitoring

The project should monitor infrastructure usage before significant increases in traffic.

Relevant areas include:

- Worker requests
- Database usage
- Database storage
- Deployment usage
- Build usage

The project should avoid introducing infrastructure that creates unnecessary recurring costs.

## Local Development

Local development should not require a permanent internet connection to implement basic application logic.

The development environment should provide:

- Node.js
- npm
- Next.js
- Local development server
- Local D1-compatible database environment

Cloudflare tooling may be used to emulate the relevant runtime and database behavior locally.

### Local Database

Development and testing should use a local database environment where practical.

Production data must never be used for local development.

Example:

Local Development
│
▼
Local Database

rather than:

Local Development
│
▼
Production Database

### Test Environment

Automated tests should use an isolated test database.

Tests must not modify production data.

The architecture should support:

Development Database
Test Database
Production Database

as logically separate environments.

### Production Environment

Production should contain only production configuration and production data.

The production environment must:

Use HTTPS
Use secure cookies
Use production secrets
Use production database configuration
Avoid development debugging
Avoid exposing internal errors

## Application Portability

Although Cloudflare is the selected platform, the application should avoid unnecessary coupling to Cloudflare-specific APIs.

The architecture should separate:

- Application Logic
- Infrastructure-Specific Code

For example:

Domain Logic
│
└── should not directly depend on Cloudflare APIs

Infrastructure-specific functionality should be isolated behind clear interfaces where practical.

### Portability Goal

The application should remain conceptually portable to another runtime.

A possible future architecture could be:

Next.js
│
▼
Alternative Runtime
│
▼
PostgreSQL

The migration would still require engineering work.

Portability is therefore a design goal, not a guarantee of zero migration effort.

### Cloudflare-Specific Coupling

Some Cloudflare coupling is intentionally accepted.

Examples include:

- Cloudflare Workers
- Cloudflare D1
- Cloudflare deployment configuration

This is considered an acceptable trade-off because the project prioritizes:

Low cost
Low operational complexity
Fast development
Integrated infrastructure

## Scaling Considerations

The selected architecture is sufficient for the expected MVP scale.

The application should nevertheless avoid assumptions that prevent future scaling.

Examples:

- Avoid unnecessary global in-memory state.
- Keep database access structured.
- Use pagination for potentially large result sets.
- Use indexes for common queries.
- Keep API responses bounded.
- Avoid loading entire tables unnecessarily.

### Performance Principles

The application should follow basic performance principles.

#### Database

Queries should:

- Select only required fields where practical
- Use appropriate indexes
- Use pagination
- Avoid unnecessary repeated queries

#### API

Responses should:

- Remain reasonably small
- Avoid unnecessary nested data
- Use pagination for collections

#### Frontend

The frontend should:

- Avoid unnecessary requests
- Load data on demand where appropriate
- Use appropriate caching strategies
- Avoid blocking the entire UI on non-critical data

## Data Access Layer

Application code should not access D1 directly from every route.

Instead, database access should be organized behind a data-access layer.

Conceptually:

API Route
│
▼
Application Service
│
▼
Repository / Data Access
│
▼
D1

This improves:

- Testability
- Separation of concerns
- Maintainability
- Portability

## Business Logic

Business rules should not be implemented directly inside database queries or UI components.

Examples include:

- Incident state transitions
- Authorization
- Incident assignment
- Postmortem publication rules

These rules belong in the application/domain layer.

Example:

API
│
▼
Incident Service
│
├── Validate State Transition
├── Validate Permissions
├── Update Incident
└── Create Event

### Transactional Operations

Operations that require multiple related database changes should be handled transactionally where supported.

For example, changing an incident status may require:

1. Update incident status
2. Create incident event

These operations should not result in a state where one change succeeds and the other fails.

The exact transaction implementation will be finalized during development.

Incident Example

A status transition could follow:

PATCH /api/incidents/:id
│
▼
Authenticate
│
▼
Authorize
│
▼
Validate Request
│
▼
Load Incident
│
▼
Validate Organization
│
▼
Validate State Transition
│
▼
Database Transaction
│
├── Update Incident
│
└── Create Incident Event
│
▼
Return Response

This illustrates how the infrastructure, security, API, and data layers work together.

## Deployment Strategy

The initial deployment strategy is intentionally simple.

The project should support:

Development
↓
Git Commit
↓
Pull Request
↓
Review
↓
Merge
↓
Production Deployment

The exact branch and CI/CD strategy is documented separately in the project planning documentation.

### Rollback Strategy

A deployment should be reversible where practical.

The project should maintain:

Version-controlled source code
Version-controlled database migrations
Tagged or identifiable releases

Application rollback and database rollback must be considered separately.

Database migrations should preferably use forward-compatible changes where possible.

### Database Migration Safety

Database migrations can be more difficult to reverse than application deployments.

The following principle applies:

Database changes should be designed so that application rollback remains possible where practical.

For example, destructive schema changes should not be performed without a clear migration strategy.

### Disaster Recovery

Formal disaster recovery is outside the MVP scope.

However, the project should document:

Where source code is stored
Where database data is stored
How database migrations are recreated
How the application can be redeployed

A future release may add:

- Automated backups
- Recovery procedures
- Recovery testing
- Recovery time objectives

## Consequences

### Positive Consequences

#### Low Infrastructure Complexity

The project can use a small number of infrastructure components:

- Cloudflare Workers
- Cloudflare D1
- GitHub

#### Low Cost

The architecture is compatible with the project's no-recurring-cost requirement for MVP-scale usage.

#### Serverless Architecture

The developer does not need to manage:

- Operating systems
- Servers
- Reverse proxies
- Database servers

#### Integrated Runtime and Database

The application runtime and database belong to the same infrastructure ecosystem.

This reduces configuration complexity.

#### Good Portfolio Value

The architecture demonstrates knowledge of:

- Serverless applications
- Cloud deployment
- Relational databases
- Infrastructure decisions
- Security boundaries
- Environment management
- Database migrations

### Negative Consequences

#### Vendor Lock-In

The architecture depends on Cloudflare-specific services.

Moving to another provider would require migration work.

#### D1 Limitations

D1 is based on SQLite and does not provide the complete feature set of a traditional PostgreSQL database.

#### Serverless Constraints

The application must respect the execution model of Workers.

Long-running background processes cannot be treated like traditional server processes.

#### Platform Knowledge

The developer needs to understand Cloudflare-specific concepts and tooling.

This adds some learning overhead.

#### Infrastructure Abstraction

Some infrastructure behavior is abstracted away by Cloudflare.

This means the project demonstrates application-level infrastructure knowledge but does not attempt to demonstrate traditional server administration.

## Alternatives Rejected

### Vercel + PostgreSQL

This would provide an excellent Next.js deployment experience.

However, it would introduce multiple infrastructure providers:

Vercel
│
└── Application

External Provider
│
└── PostgreSQL

The selected Cloudflare architecture provides a more integrated infrastructure model for this MVP.

### VPS + PostgreSQL

A VPS would provide greater control.

However, it would also require:

Server maintenance
Security updates
Database administration
Monitoring
Backups
Process management

This is outside the primary goals of the project.

### Self-Hosted Docker

Docker would improve portability and environment consistency.

However, the MVP does not need container orchestration or self-managed infrastructure.

It may be introduced later if the project grows.

## Security Implications

The Cloudflare architecture does not remove the need for application-level security.

The application remains responsible for:

- Authentication
- Authorization
- Tenant Isolation
- Input Validation
- Session Security
- SQL Injection Protection
- XSS Protection
- CSRF Protection
- Error Handling
- Secret Management

The complete security requirements are documented in:

../Security.md

## Testing Implications

The architecture should be tested at multiple levels.

Unit Tests

Test domain and business logic independently.

Integration Tests

Test:

API

- Application Logic
- D1
  End-to-End Tests

Test complete user workflows through the deployed application or an equivalent test environment.

## Operational Implications

The project does not require traditional server administration.

Operational responsibilities are therefore shifted toward:

- Application monitoring
- Deployment management
- Database migration management
- Secret management
- Error handling
- Usage monitoring

The developer must still understand the underlying infrastructure rather than treating the platform as a black box.

## Documentation Requirements

The following documentation must remain synchronized with this ADR:

- `../Architecture.md`
- `../Data-Model.md`
- `../API.md`
- `../Security.md`
- `../../02-Produktplanung/MVP-Core.md`
- `../../02-Produktplanung/MVP-Backlog-de.md`

Changes to the infrastructure architecture should result in an updated ADR.

## Future Extensions

The following Cloudflare capabilities may be considered later:

- Cloudflare Queues
- Cloudflare R2
- Cloudflare KV
- Cloudflare Cron Triggers
- Cloudflare Analytics

These are not part of the MVP unless a concrete requirement justifies them.

No additional Cloudflare service should be introduced solely because it is available.

## When to Reconsider This Decision

This ADR should be revisited if:

The application exceeds D1's practical capabilities.
PostgreSQL-specific functionality becomes necessary.
Background processing becomes a major requirement.
Long-running tasks become necessary.
Real-time functionality becomes a core feature.
Traffic exceeds the intended free-tier usage.
Infrastructure costs become significant.
Cloudflare-specific limitations block required functionality.
A different deployment architecture provides substantial technical advantages.

Any major change should result in a new ADR rather than silently modifying this decision.

## Related Decisions

This ADR is related to:

- ADR-001 – Technology Stack
- ADR-003 – Database Selection
- ADR-004 – Authentication Strategy
- ADR-005 – Multi-Tenant Architecture
- ADR-006 – Session Management

### Related Documentation

- `../Architecture.md`
- `../Data-Model.md`
- `../API.md`
- `../Security.md`
- `../../01-Anforderungen/Anforderungsblatt-de.md`
- `../../02-Produktplanung/MVP-Core.md`
- `../../02-Produktplanung/MVP-Backlog-de.md`
- `../../04-Umsetzung/planung.md`
- `../../05-Qualitaet/Risks-and-Open-Questions.md`

## Decision Summary

FlowOps will use Cloudflare as the primary infrastructure platform for the MVP.

Cloudflare Workers will execute the application and API logic, while Cloudflare D1 will provide the relational database.

The architecture is intentionally serverless and minimizes operational infrastructure.

The decision prioritizes:

- Low cost
- Low operational complexity
- Integrated application and database infrastructure
- Serverless execution
- Security
- Maintainability
- Testability
- Portfolio value

The project accepts a degree of Cloudflare vendor lock-in as a deliberate trade-off for the benefits of the selected architecture.

The architecture is considered appropriate for the FlowOps MVP.
