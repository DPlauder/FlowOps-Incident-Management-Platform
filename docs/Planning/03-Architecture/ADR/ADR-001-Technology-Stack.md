# ADR-001 – Technology Stack

## Status

Accepted

## Date

2026-08

## Decision

FlowOps will use the following technology stack for the MVP:

| Area                       | Technology                          |
| -------------------------- | ----------------------------------- |
| Frontend                   | Next.js                             |
| Frontend Language          | TypeScript                          |
| Styling                    | Tailwind CSS                        |
| Backend API                | Hono                                |
| API Runtime                | Cloudflare Workers                  |
| Database                   | Cloudflare D1                       |
| Database Type              | SQLite                              |
| Authentication             | Custom session-based authentication |
| Validation                 | Zod                                 |
| Unit / Integration Testing | Vitest                              |
| End-to-End Testing         | Playwright                          |
| Package Manager            | npm                                 |
| Version Control            | Git                                 |
| Repository Hosting         | GitHub                              |
| Deployment                 | Cloudflare                          |

The stack is intentionally kept relatively small.

The goal is to build a production-oriented MVP without introducing unnecessary infrastructure or paid services.

---

## Context

FlowOps is a portfolio project designed to demonstrate how a mid-level software developer approaches the development of a real application.

The project should demonstrate more than the ability to write frontend code.

It should demonstrate:

- Requirements analysis
- Product planning
- Architecture
- API design
- Database design
- Authentication
- Authorization
- Multi-tenant data isolation
- Validation
- Testing
- Error handling
- Deployment
- Documentation
- Technical decision-making

The project must also be possible to operate without ongoing infrastructure costs.

Therefore, the technology stack needs to satisfy several constraints.

## Primary Requirements

The stack should:

1. Support TypeScript across the application.
2. Support a modern React-based frontend.
3. Provide server-side API capabilities.
4. Provide a relational database.
5. Support authentication and sessions.
6. Support automated testing.
7. Support deployment without requiring paid infrastructure for the MVP.
8. Be suitable for a realistic production-style application.
9. Be understandable and maintainable by a single developer.
10. Avoid unnecessary infrastructure complexity.

---

## Considered Options

The following technology categories were considered.

## Frontend Framework

Possible options:

- Next.js
- React with Vite
- Remix
- Vue
- SvelteKit

## Backend API

Possible options:

- Hono on Cloudflare Workers
- Next.js API / Route Handlers
- Node.js with Express
- Node.js with Fastify
- NestJS
- Separate backend service

## Database

Possible options:

- Cloudflare D1
- PostgreSQL
- SQLite
- Supabase
- Firebase

## Hosting

Possible options:

- Cloudflare
- Vercel
- Netlify
- Self-hosted server
- Traditional cloud infrastructure

---

## Decision Details

## Frontend – Next.js

Next.js is selected as the frontend framework.

The project requires:

- React
- TypeScript
- Routing
- Server-side capabilities where appropriate
- API integration
- Production deployment

Next.js provides these capabilities within the frontend application.

The existing portfolio project also uses Next.js, which reduces the number of frameworks the developer needs to maintain and allows experience gained from the portfolio to be reused.

Next.js is therefore used as the primary frontend framework.

The Next.js application is responsible for:

- Rendering the user interface
- Client-side interactions
- Application routing
- Calling the backend API
- Presenting API responses
- Managing frontend application state where required

Next.js is not used as the primary backend API runtime for FlowOps.

---

## Programming Language – TypeScript

TypeScript is selected as the primary programming language.

TypeScript provides:

- Static typing
- Better IDE support
- Improved refactoring
- Explicit interfaces
- Safer API contracts
- Better maintainability for larger applications

The project contains several areas where type safety provides significant value:

- API requests
- API responses
- Database models
- User roles
- Membership states
- Incident states
- Incident events
- Validation schemas

TypeScript will therefore be used throughout the application where practical.

---

## Styling – Tailwind CSS

Tailwind CSS is selected for the frontend styling layer.

The main reasons are:

- Rapid development
- Consistent design tokens
- Component-oriented styling
- Good integration with React and Next.js
- No additional runtime styling system required

The project does not require a large external component library for the MVP.

Reusable UI components will be implemented within the application where appropriate.

---

## Backend API – Hono

Hono is selected as the backend API framework.

The Hono API will run on Cloudflare Workers.

The Next.js frontend communicates with the Hono API through HTTP requests.

The API will expose routes under:

```text
/api/*

Examples include:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/organization

POST /api/organization/join

GET /api/services

POST /api/services

GET /api/incidents

POST /api/incidents

GET /api/incidents/:id

PATCH /api/incidents/:id

GET /api/incidents/:id/events

GET /api/incidents/:id/comments

POST /api/incidents/:id/comments

GET /api/incidents/:id/postmortem

POST /api/incidents/:id/postmortem

PATCH /api/incidents/:id/postmortem

```

A separate Node.js backend service is intentionally avoided for the MVP.

Hono provides a lightweight HTTP API framework that fits the selected Cloudflare Workers runtime.

This reduces:

Infrastructure complexity
Deployment complexity
Number of runtimes
Local development requirements
Operational overhead

The API will still be structured using clear application boundaries so that business logic is not tightly coupled to the HTTP layer.

## Runtime – Cloudflare Workers

The Hono API will run on Cloudflare Workers as the serverless runtime.

Cloudflare Workers is selected because it provides:

- Serverless execution
- Low operational overhead
- Integration with Cloudflare D1
- Suitable deployment infrastructure
- A suitable free-tier entry point for the MVP

The architecture does not require managing a traditional application server.

The application should therefore remain compatible with a serverless execution model.

The backend must not rely on:

- Long-running processes
- Local persistent filesystem state
- Persistent in-memory application state between requests
- Traditional server lifecycle assumptions

## Database – Cloudflare D1

Cloudflare D1 is selected as the primary database for the MVP.

D1 is based on SQLite and provides a relational database model.

This is suitable for FlowOps because the application has clearly relational data:

organizations
users
organization_members
sessions
services
incidents
incident_events
comments
postmortems

The relational model is important because the application requires:

Foreign key relationships
Unique constraints
Tenant boundaries
Structured queries
Consistent relationships

D1 also integrates directly with the selected Cloudflare Workers runtime.

This allows the MVP to avoid operating a separate database server.

### Database Model – SQLite

The database model is intentionally relational.

The project will not use a document database for the MVP.

The main reasons are:

Strong relationships between entities
Transactional requirements
Structured querying
Organization-based tenant isolation
Clear relational constraints

SQLite is sufficient for the expected scale of a portfolio MVP.

If the application later requires significantly higher database capabilities, the database layer can be reconsidered.

## Authentication – Session-Based Authentication

FlowOps will use server-side session-based authentication.

The initial architecture will not use stateless JWT authentication for browser sessions.

The session model provides:

Server-side session invalidation
Straightforward logout
Centralized session management
Secure HTTP-only cookies
Simple session revocation

Sessions will be stored in the database.

The browser will receive a secure session cookie containing the session identifier.

The cookie will use appropriate security attributes:

HttpOnly
Secure
SameSite

The exact authentication and session requirements are documented in:

../Security.md

and the related authentication ADRs.

## Validation – Zod

Zod is selected for runtime validation of external input.

TypeScript types alone are not sufficient for validating HTTP requests because TypeScript types do not exist at runtime.

API input must therefore be validated at runtime.

Examples include:

Registration data
Login data
Organization data
Service data
Incident creation
Incident updates
Comments
Postmortems
Query parameters

Example:

const incidentSchema = z.object({
title: z.string().min(1).max(200),
description: z.string().min(1),
severity: z.enum(["SEV1", "SEV2", "SEV3", "SEV4"]),
});

This allows the application to combine:

TypeScript compile-time safety
Runtime input validation

## Testing – Vitest

Vitest is selected for unit and integration testing.

It will be used primarily for:

Business logic
Validation
State transitions
Authorization rules
Tenant isolation
Utility functions
API-level tests where appropriate

The test suite should focus particularly on security-sensitive business rules.

Examples:

OPEN → INVESTIGATING valid

OPEN → CLOSED invalid

The exact allowed incident transitions are defined by the incident lifecycle specification.

Cross-organization access must also be tested.

## End-to-End Testing – Playwright

Playwright is selected for end-to-end testing.

It will be used to verify complete user workflows.

Example workflow:

Register
↓
Login
↓
Create Organization
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

End-to-end tests will focus on the most important user journeys rather than attempting to test every possible combination through the browser.

## Package Manager – npm

npm will be used as the package manager.

The repository will contain a lock file to ensure reproducible dependency installation.

Dependencies should only be added when they provide clear value.

The project intentionally avoids introducing large frameworks or libraries when a small local implementation is sufficient.

## Version Control – Git

Git will be used for version control.

The repository will be hosted on GitHub.

The project will use Git history as part of the development process.

Commits should ideally represent meaningful changes rather than arbitrary save points.

Examples:

feat: add incident creation API

feat: add session authentication

test: add incident authorization tests

fix: prevent cross-organization incident access

docs: document authentication architecture

## Repository Hosting – GitHub

GitHub is selected as the repository platform.

The repository will contain:

Application source code
Database migrations
Tests
Documentation
Architecture decisions
Project planning
Blog-related project documentation where appropriate

GitHub also provides the foundation for the project's development workflow and public portfolio visibility.

## Deployment – Cloudflare

The MVP will be deployed using Cloudflare.

The intended deployment architecture is:

GitHub
│
▼
Cloudflare
│
├── Next.js Application
│
├── Hono API
│ │
│ └── Cloudflare Workers
│
└── Cloudflare D1

The exact deployment configuration will be documented separately once the initial application structure has been implemented.

Cost Constraint

One of the main project constraints is:

The MVP must be possible to operate without recurring infrastructure costs.

The selected architecture therefore avoids services that require a paid subscription for basic development and MVP usage.

The initial architecture uses services with suitable free-tier capabilities.

However, free-tier limits are not considered guarantees of unlimited usage.

The project documentation will explicitly document relevant service limits and assumptions.

## Alternatives Rejected

Next.js API / Route Handlers

Next.js API routes and Route Handlers were considered for the backend API.

They were not selected because the architecture intentionally separates the frontend application from the backend API.

Using Hono on Cloudflare Workers provides a clearer backend boundary and aligns the API directly with the selected serverless runtime.

The separation also allows the API architecture to evolve independently from the frontend implementation.

Separate Node.js Backend

A separate Node.js backend using Express, Fastify, or NestJS was considered.

It was rejected for the MVP because it would introduce:

A second application
A second deployment target
Additional configuration
Additional infrastructure
More local development complexity

A separate backend may become reasonable if the application grows beyond the scope of the MVP.

PostgreSQL

PostgreSQL was considered because it is a mature production-grade relational database.

It was not selected for the initial MVP because it would introduce additional infrastructure or require a managed external database service.

The relational model is still preserved through SQLite/D1.

PostgreSQL remains a possible future migration target if project requirements change.

Supabase

Supabase was considered because it provides:

PostgreSQL
Authentication
Storage
APIs
Managed backend capabilities

It was not selected because the project intentionally implements authentication and API architecture itself.

Using a managed backend platform would hide some of the engineering decisions that FlowOps is intended to demonstrate.

The project should demonstrate understanding of:

Authentication
Authorization
Sessions
Database access
API design

rather than outsourcing those core areas to a backend-as-a-service platform.

```text
POST /api/incidents/:id/postmortem
```

Firebase was considered.

It was rejected because the project's data model is strongly relational.

The following relationships are central to the application:

Organization
↓
Membership
↓
User

Organization
↓
Service
↓
Incident
↓
Events
↓
Comments
↓
Postmortem

A relational database is therefore a better conceptual fit.

JWT Authentication

JWT-based authentication was considered.

It was not selected for the initial browser-based application.

The project requires straightforward session invalidation and server-controlled authentication state.

Server-side sessions provide a simpler model for the MVP.

JWT may be reconsidered if FlowOps later exposes a public API for external clients.

Docker

Docker was considered for local development and deployment.

It is not required for the initial MVP because the selected architecture uses Cloudflare's managed runtime and D1 database.

Adding Docker would provide limited value at this stage while increasing development complexity.

Docker may be introduced later if local infrastructure becomes more complex.

## Consequences

### Positive Consequences

Clear Frontend / Backend Separation

The frontend and backend have explicit responsibilities.

Next.js
↓
HTTP
↓
Hono API
↓
Application Logic
↓
Data Access
↓
Cloudflare D1

This makes the architecture easier to reason about and demonstrates a clear separation of concerns.

Shared TypeScript

TypeScript can be used across:

UI
API
Validation
Domain logic
Database access

This reduces duplicated type definitions and improves maintainability.

Relational Data Model

D1 provides a relational model that fits the domain.

The application can use:

Foreign keys
Constraints
Relationships
Structured queries
Low Infrastructure Overhead

The application does not require:

A dedicated application server
A separately managed database server
Container infrastructure
Multiple backend services

for the MVP.

Strong Portfolio Value

The stack allows the project to demonstrate several real-world engineering concepts:

Frontend
↓
API
↓
Authentication
↓
Authorization
↓
Business Logic
↓
Database
↓
Testing
↓
Deployment

This is more representative of a real application than a frontend-only project.

### Negative Consequences

Cloudflare Dependency

The application becomes partially dependent on Cloudflare-specific infrastructure.

The main examples are:

Workers
D1
Cloudflare deployment

This creates some vendor lock-in.

SQLite / D1 Limitations

D1 is not equivalent to a full PostgreSQL deployment.

Some PostgreSQL features and scaling characteristics are not available.

This is acceptable for the MVP but must be considered if the application grows.

Serverless Constraints

The application must work within serverless runtime constraints.

The code should avoid relying on:

Long-running processes
Local persistent filesystem state
In-memory application state between requests
Traditional server lifecycle assumptions
Custom Authentication Responsibility

Because authentication is not outsourced to a managed authentication platform, FlowOps becomes responsible for implementing authentication securely.

This increases development responsibility.

The security requirements in:

../Security.md

must therefore be treated as mandatory implementation requirements.

## Architectural Principles Resulting From This Decision

Rule 1

The application must remain deployable as a serverless application.

Rule 2

Business logic must not depend directly on HTTP request objects.

Rule 3

Database access should be isolated behind a data-access layer.

Rule 4

Authentication and authorization must be implemented as explicit application concerns.

Rule 5

Validation must happen at the API boundary.

Rule 6

All organization-owned data must enforce tenant isolation.

Rule 7

External services should not be introduced unless they provide clear value.

Rule 8

The application should remain portable enough that major components can be replaced later.

## Implementation Structure

The selected stack should result in a structure similar to:

src/

├── app/
│ ├── ...
│ └── ...

├── components/

├── domain/
│ ├── incidents/
│ ├── organizations/
│ ├── users/
│ └── postmortems/

├── server/
│ ├── auth/
│ ├── db/
│ ├── services/
│ └── ...

├── lib/
│ ├── validation/
│ └── ...

└── tests/

The exact directory structure may be adjusted during implementation.

The important architectural separation is:

HTTP Layer
↓
Application / Domain Logic
↓
Data Access
↓
Database

The implementation must not allow framework-specific concerns to leak unnecessarily into domain logic.

## Security Implications

The technology stack has direct security implications.

The application must ensure:

Secure session cookies
Server-side authorization
Organization-level tenant isolation
Parameterized database queries
Runtime input validation
Safe rendering of user-generated content
Secure secret management
HTTPS in production
Appropriate security headers
Server-side role and membership checks

These requirements are documented in:

../Security.md

Authentication-specific decisions are documented in the related authentication and session-management ADRs.

## Testing Implications

The technology stack requires testing at multiple levels.

Unit Tests
↓
Business Logic

Integration Tests
↓
API + Database

End-to-End Tests
↓
Complete User Workflows

The project should prioritize tests around:

Authentication
Authorization
Tenant isolation
Membership status
Role-based access
Incident state transitions
Validation
API behavior

Security-sensitive business rules must have both positive and negative test cases where applicable.

## Cost Implications

The architecture is designed around the requirement that the MVP can be operated without recurring infrastructure costs.

Expected infrastructure:

GitHub
Cloudflare
Cloudflare Workers
Cloudflare D1

No paid third-party service is required for the core application.

The project must nevertheless monitor free-tier limits before production-like usage.

Free-tier availability and limits are treated as deployment constraints rather than guarantees of unlimited usage.

## Future Reconsideration

This decision should be revisited if one or more of the following conditions occur:

The application exceeds the practical limits of D1.
PostgreSQL-specific features become necessary.
A separate public API is required.
Multiple independent backend services are required.
Authentication requirements become significantly more complex.
Traffic exceeds the intended free-tier usage.
Background processing becomes a major requirement.
Real-time communication becomes a core requirement.
The frontend and backend need independent deployment lifecycles.
Cloudflare-specific limitations become a significant architectural constraint.

At that point, individual technology decisions can be revisited through additional ADRs.

## Related Decisions

This ADR is related to:

ADR-002 – Cloudflare Architecture
ADR-003 – Database Selection
ADR-004 – Authentication Strategy
ADR-005 – Multi-Tenant Architecture
ADR-006 – Session Management
ADR-007 – Multi-Organization Membership

## Related Documentation

../Architecture.md
../Data-Model.md
../Security.md
../API.md
../../01-Anforderungen/Anforderungsblatt-de.md
../../01-Anforderungen/Requirements-Specification-en.md
../../02-Produktplanung/MVP-Core.md
../../02-Produktplanung/MVP-Backlog-de.md

## Decision Summary

FlowOps will use a TypeScript-based Next.js frontend with a Hono backend API running on Cloudflare Workers.

Cloudflare D1 will provide the relational database.

The application will use server-side sessions for authentication, Zod for runtime validation, Vitest for automated unit and integration testing, and Playwright for end-to-end testing.

The architecture intentionally favors:

- Low operational complexity
- Low cost
- A small technology footprint
- Strong type safety
- Relational data modeling
- Explicit security controls
- Good testability
- Clear architectural boundaries
- A clear separation between frontend and backend

The stack is considered appropriate for the FlowOps MVP and will remain in place unless future requirements justify a new architectural decision.
