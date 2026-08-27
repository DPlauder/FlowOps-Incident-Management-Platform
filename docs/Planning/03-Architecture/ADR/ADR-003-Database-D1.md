# ADR-003 – Database Selection: Cloudflare D1

## Status

Accepted

## Date

2026-08

## Decision

FlowOps will use Cloudflare D1 as the primary relational database for the MVP.

Cloudflare D1 is based on SQLite and provides a relational database model that is suitable for the current requirements of FlowOps.

The database will store persistent application data including:

- Organizations
- Users
- Organization memberships
- Sessions
- Services
- Incidents
- Incident events
- Comments
- Postmortems

The database will be accessed exclusively through the server-side application layer.

Client-side code must never access the database directly.

The selected architecture is:

```text
Browser
   │
   ▼
Next.js Application
   │
   ▼
Application / Domain Logic
   │
   ▼
Data Access Layer
   │
   ▼
Cloudflare D1
```

The database schema will be managed through version-controlled migrations.

## Context

FlowOps requires persistent storage for the core application domain.

The application is not a simple frontend project. It contains several related entities and requires a relational data model.

The core domain contains relationships such as:

```text
Organization
│
├── Users / Members
│
├── Services
│
└── Incidents
   │
   ├── Events
   ├── Comments
   └── Postmortem
```

The database therefore needs to support structured relationships between entities.

The project also has additional requirements:

- Multi-tenant data isolation
- Authentication sessions
- Foreign key relationships
- Unique constraints
- Data validation
- Consistent state changes
- Database migrations
- Automated testing
- Low infrastructure complexity
- No recurring infrastructure costs for the MVP

The database decision must therefore balance technical suitability with project scope.

## Database Requirements

The database must provide the following capabilities.

### Relational Data Model

The application requires relationships between multiple entities.

Examples include:

- `users`
- `organizations`
- `organization_members`
- `services`
- `incidents`
- `incident_events`
- `comments`
- `postmortems`

These relationships should be represented explicitly.

### Persistent Storage

Application data must survive application restarts and new serverless runtime instances.

Persistent state must therefore be stored in the database.

### Tenant Isolation

FlowOps is a multi-tenant application.

Organization-owned resources must be isolated from other organizations.

The database must support queries that can enforce organization boundaries.

Example:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The organization identifier must originate from the authenticated application context.

### Constraints

The database should support constraints where appropriate.

Examples include:

- Primary keys
- Foreign keys
- Unique constraints
- Not-null constraints
- Check constraints where appropriate

Constraints should be used to protect important invariants at the persistence layer.

### Transactions

Some operations require multiple related database changes.

For example:

```text
Update Incident
   +
Create Incident Event
```

These operations should be executed atomically where required.

### Migrations

The database schema must be version-controlled.

Schema changes must be represented by migration files.

Example:

```text
migrations/
├── 0001_initial_schema.sql
├── 0002_add_services.sql
├── 0003_add_incident_events.sql
└── ...
```

### Local Development

Developers must be able to work with a local database without modifying production data.

The local development environment should provide a D1-compatible development database.

### Testing

Automated tests require isolated database environments.

Tests must not use production data.

### Cost

The database must fit the project's requirement that the MVP can be developed and operated without recurring infrastructure costs.

## Considered Options

The following database technologies were considered.

### Cloudflare D1

SQLite-based relational database integrated with Cloudflare.

### PostgreSQL

A mature, production-grade relational database.

### MySQL / MariaDB

Traditional relational database systems with broad hosting support.

### Supabase PostgreSQL

Managed PostgreSQL with additional backend services.

### Firebase Firestore

Document-oriented cloud database.

### SQLite

A local embedded relational database.

## Decision

Cloudflare D1 was selected for the MVP.

The decision is based on the combination of:

- Relational data model
- Cloudflare integration
- Low operational complexity
- Low cost
- Sufficient functionality for the MVP
- Serverless compatibility
- Simple local development model

### Why a Relational Database

A relational database is preferred over a document database because the FlowOps domain contains many explicit relationships.

For example:

Organization
│
├── Organization Members
│ │
│ └── Users
│
├── Services
│ │
│ └── Incidents
│
└── Incidents
│
├── Events
├── Comments
└── Postmortems

These relationships are central to the application's functionality.

A relational database makes these relationships explicit.

### Why D1

#### Integration With Cloudflare

D1 integrates directly with the selected Cloudflare architecture.

The application can therefore use:

Cloudflare Workers
│
▼
Cloudflare D1

without requiring an additional database infrastructure provider.

#### Low Operational Overhead

D1 removes the need to manage a traditional database server.

The project does not need to handle:

- Operating system updates
- Database server installation
- Database process management
- Server networking
- Database server patching

This is appropriate for a single-developer portfolio project.

#### Serverless Compatibility

FlowOps uses a serverless application architecture.

D1 is designed to work with Cloudflare's serverless ecosystem.

This keeps the infrastructure model consistent:

Serverless Application
│
▼
Serverless-Compatible Database

#### Relational Model

Although D1 is based on SQLite, it still provides the relational model required by FlowOps.

The application can use:

- Tables
- Primary keys
- Foreign keys
- Indexes
- Constraints
- SQL queries
- Transactions

where supported by the platform.

#### Cost

D1 fits the project's cost constraints for MVP-scale usage.

The project does not require a separately managed database server.

The free-tier assumption is nevertheless treated as a project constraint rather than a permanent guarantee.

Usage limits must be monitored as the application grows.

## Database Architecture

The database is accessed through the application backend.

The client must never communicate directly with D1.

The intended architecture is:

┌──────────────┐
│ Browser │
└──────┬───────┘
│
│ HTTPS
▼
┌──────────────┐
│ Next.js │
│ Application │
└──────┬───────┘
│
▼
┌──────────────┐
│ Application │
│ Logic │
└──────┬───────┘
│
▼
┌──────────────┐
│ Data Access │
│ Layer │
└──────┬───────┘
│
▼
┌──────────────┐
│ Cloudflare │
│ D1 │
└──────────────┘

### Data Access Layer

Database access must be isolated from the rest of the application.

Application routes should not contain large amounts of raw SQL.

Instead, the application should use a data-access layer.

Example:

API Route
│
▼
Incident Service
│
▼
Incident Repository
│
▼
D1

This separation improves:

- Testability
- Maintainability
- Separation of concerns
- Database portability

### Database Responsibilities

The database is responsible for:

- Persistent data storage
- Relational integrity
- Primary keys
- Foreign keys
- Uniqueness constraints
- Indexes
- Data retrieval
- Data modification
- Transactional operations where required

The database is not responsible for:

- Authentication decisions
- Authorization decisions
- UI logic
- HTTP request handling
- Business workflows that require application context

### Application Responsibilities

The application is responsible for:

- Authentication
- Authorization
- Tenant context
- Business rules
- Input validation
- State transition validation
- API behavior
- Error handling

The database should enforce important persistence-level invariants in addition to application-level validation.

## Tenant Isolation

Tenant isolation is a critical database requirement.

FlowOps must never rely solely on the frontend to provide the organization identifier.

The application must derive the organization context from the authenticated session.

For example:

Authenticated Session
│
▼
User
│
▼
Organization Membership
│
▼
Organization ID

The resulting organization ID is then used in database queries.

### Example Tenant-Safe Query

An unsafe query would be:

```sql
SELECT *
FROM incidents
WHERE id = ?;
```

The application could accidentally return an incident belonging to another organization.

The preferred pattern is:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The second parameter must come from the authenticated organization context.

### Write Operations

Write operations must also enforce tenant boundaries.

Example:

```sql
UPDATE incidents
SET title = ?,
    description = ?
WHERE id = ?
AND organization_id = ?;
```

This prevents a user from modifying an incident outside their organization even if they know its identifier.

## Primary Keys

Each persistent entity will have a unique primary key.

The exact ID strategy will be defined in the data model.

The application should avoid exposing sequential internal database IDs where doing so could create unnecessary enumeration risks.

The final ID strategy will be documented in:

../Data-Model.md

## Foreign Keys

Foreign keys should be used where they provide meaningful relational integrity.

Examples include:

- `organization_members.organization_id`
- `organization_members.user_id`
- `services.organization_id`
- `incidents.organization_id`
- `incidents.service_id`
- `incident_events.incident_id`
- `comments.incident_id`

- `postmortems.incident_id`

Foreign key usage should be consistent with the database schema.

## Indexes

Indexes should be created for frequently queried fields.

Potential indexes include:

- `organization_id`
- `user_id`
- `service_id`
- `incident_id`
- `status`
- `created_at`

The exact indexes will be determined based on actual query patterns.

Indexes should not be added blindly.

## Query Principles

Database queries should follow these principles:

- Select only required data where practical.
- Always apply tenant filtering to organization-owned resources.
- Use parameterized queries.
- Avoid unnecessary full-table scans.
- Use pagination for potentially large result sets.
- Add indexes for known query patterns.
- Keep database logic isolated from presentation logic.

## SQL Injection Protection

All external values must be passed to the database using parameterized queries.

Unsafe:

```ts
const query = `
   SELECT *
  FROM incidents
   WHERE id = '${incidentId}'
`;
```

Preferred:

```ts
const query = `
   SELECT *
  FROM incidents
   WHERE id = ?
`;
```

The value must be passed separately as a query parameter.

## Transactions

Transactions should be used for operations where multiple database changes represent one logical operation.

Example:

Incident Status Change

1. Update incident status
2. Create incident event

The intended result is:

Transaction
│
├── UPDATE incidents
│
└── INSERT incident_events

If one operation fails, the complete logical operation should fail where transaction support permits.

## Incident Event Logging

Incident state changes must be represented as events.

For example:

Incident
│
├── Created
├── Investigating
├── Identified
├── Monitoring
└── Resolved

The event history provides an audit trail for incident activity.

The event should contain enough information to reconstruct the relevant history.

## Sessions

Sessions will be stored in the database.

The session record should be associated with the authenticated user.

Conceptually:

sessions
│
└── user_id

Session identifiers must not be stored or logged in plaintext where a hashed representation can be used safely.

The exact session implementation is documented in:

../Security.md

and the relevant authentication ADR.

## Password Storage

Passwords must never be stored in plaintext.

The database stores only password hashes.

Conceptually:

User Input
│
▼
Password Hashing
│
▼
password_hash
│
▼
D1

The exact password hashing algorithm and configuration are defined in the security architecture.

## Schema Management

The database schema is part of the source code of the project.

Every schema change must be represented by a migration.

Example:

```text
migrations/
├── 0001_initial_schema.sql
├── 0002_add_services.sql
├── 0003_add_incidents.sql
├── 0004_add_incident_events.sql
└── ...
```

Migrations must be committed to Git.

### Migration Principles

Migrations should be:

- Ordered
- Reproducible
- Reviewable
- Version-controlled
- Safe to execute in the intended environment

Destructive migrations require additional consideration.

Examples include:

DROP TABLE
DROP COLUMN
Data type changes
Large data transformations

Such changes should be documented and tested before production deployment.

## Local Development Database

Local development must use a separate database environment.

The developer must be able to:

Create Database
↓
Run Migrations
↓
Seed Development Data
↓
Develop
↓
Reset Database

Development data must never contain real user information.

## Seed Data

The project may provide deterministic development seed data.

Example:

Organization
├── Admin User
├── Developer User
│
├── Service A
│ ├── Incident 1
│ └── Incident 2
│
└── Service B
└── Incident 3

Seed data is intended only for local development and automated testing.

Production seed data must not contain default credentials.

## Test Database

Automated tests should run against an isolated database.

Tests should be able to create the required database state without depending on another test.

A typical test lifecycle is:

Create Test Database
↓
Run Migrations
↓
Insert Test Data
↓
Run Tests
↓
Clean / Reset

## Production Database

The production database contains real application data.

Production access must be restricted.

Developers should not use production data for local development.

Direct manual production modifications should be avoided.

Schema changes should be performed through migrations.

## Database Backups

The MVP requires a documented backup strategy before production-like usage.

The initial project does not define a complex disaster-recovery architecture.

However, the following must be considered:

Database export
Backup frequency
Backup retention
Restoration procedure
Recovery testing

The exact strategy is tracked separately as an operational requirement.

## Data Retention

FlowOps should define retention requirements for:

- Incidents
- Incident events
- Comments
- Postmortems
- Sessions
- User accounts

The MVP does not require automatic deletion of historical incident data.

Session data may have an explicit expiration policy.

The exact retention periods will be documented as part of the security and data-management design.

## Database Security

Database access must only occur on the server.

The database must never be exposed directly to browser clients.

The architecture is:

Browser
X
│
│ Direct database access prohibited
│
▼
API
│
▼
Data Access Layer
│
▼
D1

### Secrets and Database Credentials

Database configuration must not be hard-coded into the source code.

Production configuration must be provided by the deployment environment.

No credentials or secrets may be committed to Git.

## Performance Considerations

The expected MVP scale does not justify complex database optimization.

Nevertheless, the application should follow basic principles:

- Use indexes for frequent queries.
- Avoid unnecessary joins.
- Paginate large collections.
- Avoid loading complete tables.
- Keep queries simple and understandable.
- Measure before optimizing.

Premature optimization should be avoided.

## Expected Query Patterns

The most important query patterns are expected to include:

#### Incidents by Organization

```sql
SELECT *
FROM incidents
WHERE organization_id = ?
ORDER BY created_at DESC;
```

#### Incident by ID and Organization

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

#### Incident Events

```sql
SELECT *
FROM incident_events
WHERE incident_id = ?
ORDER BY created_at ASC;
```

#### Services by Organization

```sql
SELECT *
FROM services
WHERE organization_id = ?
ORDER BY name ASC;
```

### Pagination

Collection endpoints should support pagination where datasets could grow.

For example:

```text
GET /api/incidents?page=1&limit=20
```

The exact pagination implementation will be defined during API implementation.

The application should avoid returning unbounded collections.

## Data Consistency

The application should maintain consistency between related entities.

For example:

If an incident belongs to a service, the service must belong to the same organization as the incident.

An invalid relationship such as:

Organization A
│
└── Incident

Organization B
│
└── Service

must not be created.

Application-level validation must therefore verify organization boundaries during relationship creation.

## Database and Domain Rules

Not every business rule belongs in the database.

The following rules belong primarily in application logic:

- Who can create incidents
- Who can resolve incidents
- Which state transitions are allowed
- Which roles can create postmortems
- Which organization a user can access

The database should enforce structural integrity.

The application should enforce business behavior.

### Example Responsibility Split

```text
Database
├── Primary Keys
├── Foreign Keys
├── Unique Constraints
├── Not-Null Constraints
└── Data Persistence

Application
├── Authentication
├── Authorization
├── Tenant Context
├── State Transitions
├── Business Rules
└── API Behavior
```

This separation keeps the architecture understandable.

## Consequences

### Positive Consequences

#### Simple Infrastructure

D1 avoids the need to manage a separate database server.

#### Relational Model

The database structure matches the domain model of FlowOps.

#### Cloudflare Integration

D1 integrates naturally with the selected Cloudflare architecture.

#### Low Cost

The database can be used within the intended MVP cost constraints.

#### Easy Development

A SQLite-compatible database model is relatively easy to understand and work with locally.

#### Portfolio Value

The project demonstrates knowledge of:

- Relational databases
- SQL
- Database migrations
- Indexes
- Transactions
- Tenant isolation
- Data-access architecture
- Database security

### Negative Consequences

#### SQLite / D1 Limitations

D1 is not equivalent to a full PostgreSQL deployment.

Certain advanced database capabilities may not be available.

#### Vendor Lock-In

The application becomes partially dependent on Cloudflare D1.

Migrating away from D1 would require database and infrastructure changes.

#### Scaling Limitations

The database architecture is designed for the expected MVP scale.

It should not automatically be assumed to support significantly larger workloads without further evaluation.

#### Operational Constraints

The application must follow D1-specific limitations and deployment behavior.

## Alternative: PostgreSQL

PostgreSQL was considered the strongest alternative.

PostgreSQL provides:

- Mature relational database functionality
- Extensive SQL support
- Advanced indexing
- Advanced transactions
- Strong ecosystem
- Broad hosting options

It was not selected for the MVP because it would introduce additional infrastructure complexity or require another managed service.

PostgreSQL remains the primary candidate for a future database migration if FlowOps outgrows D1.

## Alternative: Supabase

Supabase was considered.

It would provide:

- PostgreSQL
- Authentication
- APIs
- Additional managed services

It was rejected because the project intentionally implements core backend concerns itself.

Using Supabase would reduce the amount of backend and authentication architecture demonstrated by the project.

## Alternative: Firebase Firestore

Firestore was rejected because the FlowOps data model is relational.

The application relies heavily on:

- Organization relationships
- User memberships
- Services
- Incidents
- Events
- Comments
- Postmortems

A relational database is considered a better conceptual fit.

## Alternative: SQLite

Standard SQLite was considered.

SQLite is technically suitable for the relational model.

However, using D1 provides better integration with the selected Cloudflare serverless architecture.

D1 therefore provides the preferred deployment model for the MVP.

## Portability Considerations

The application should avoid coupling domain logic directly to D1-specific APIs.

The intended architecture is:

Domain Logic
│
▼
Repository Interface
│
▼
D1 Repository

This creates a boundary that could later allow another database implementation.

For example:

Repository Interface
│
├── D1 Repository
│
└── PostgreSQL Repository

A complete database migration would still require significant testing and migration work.

## Migration to PostgreSQL

If D1 becomes insufficient, a possible future architecture is:

Next.js
│
▼
Application / Domain Layer
│
▼
Repository Interface
│
▼
PostgreSQL

The migration would require evaluation of:

- SQL compatibility
- Data migration
- Indexes
- Transactions
- Connection management
- Deployment architecture
- Backup strategy
- Cost

This is explicitly outside the MVP scope.

## Monitoring and Maintenance

Database usage should be monitored as the project grows.

Relevant metrics include:

- Database size
- Query performance
- Request volume
- Storage usage
- Migration failures
- Error rates

The MVP does not require a dedicated database monitoring platform.

## When to Reconsider This Decision

The decision should be revisited if:

- D1 limitations block a required feature.
- Database performance becomes insufficient.
- Database size becomes significantly larger than expected.
- Advanced PostgreSQL functionality becomes necessary.
- Traffic exceeds the intended MVP scale.
- The application requires advanced analytics workloads.
- Complex background processing requires a different persistence architecture.
- Backup or recovery requirements exceed the current platform capabilities.
- Infrastructure costs or limits change significantly.

A new ADR should document any replacement database decision.

## Implementation Requirements

The following requirements result directly from this ADR.

### Requirement 1

All persistent application data must be stored in D1.

### Requirement 2

The browser must never access D1 directly.

### Requirement 3

All database access must happen through server-side application code.

### Requirement 4

Organization-owned resources must enforce tenant filtering.

### Requirement 5

Database schema changes must use migrations.

### Requirement 6

Production data must never be used for automated tests.

### Requirement 7

External input must never be concatenated directly into SQL queries.

### Requirement 8

Database indexes must be created based on known query patterns.

### Requirement 9

Multi-step state changes must use transactions where appropriate.

### Requirement 10

Database access must be isolated from the HTTP layer.

## Verification Checklist

Before considering the database architecture implemented, the following should be verified:

- [ ] D1 database created
- [ ] Local database environment configured
- [ ] Initial migration created
- [ ] All MVP tables implemented
- [ ] Primary keys defined
- [ ] Foreign keys defined where required
- [ ] Required unique constraints defined
- [ ] Required indexes defined
- [ ] Seed data available for development
- [ ] Test database isolated
- [ ] Database access layer implemented
- [ ] Tenant filtering implemented
- [ ] Parameterized queries used
- [ ] Transactions implemented where required
- [ ] Migration process documented
- [ ] Production database configured
- [ ] Backup strategy documented
- [ ] Database error handling implemented
- [ ] Database tests implemented

## Related Decisions

This ADR is related to:

- ADR-001 – Technology Stack
- ADR-002 – Cloudflare Architecture
- ADR-004 – Authentication Strategy
- ADR-005 – Multi-Tenant Architecture
- ADR-006 – Session Management

## Related Documentation

- `../Architecture.md`
- `../Data-Model.md`
- `../API.md`
- `../Security.md`
- `../../01-Anforderungen/Anforderungsblatt-de.md`
- `../../02-Produktplanung/MVP-Core.md`
- `../../02-Produktplanung/MVP-Backlog-de.md`
- `../../04-Umsetzung/planung.md`
- `../../05-Qualitaet/Testing-Matrix.md`
- `../../05-Qualitaet/Risks-and-Open-Questions.md`

## Decision Summary

Cloudflare D1 is selected as the database for the FlowOps MVP.

The decision is based on the requirement for a relational data model combined with the project's serverless Cloudflare architecture and zero-recurring-cost constraint.

D1 provides the required relational capabilities while avoiding the operational complexity of managing a separate database server.

The architecture intentionally separates database access from the application's domain logic and enforces tenant isolation at the application level.

The project accepts the limitations and Cloudflare dependency of D1 as a deliberate trade-off for the MVP.

If future requirements exceed the practical capabilities of D1, PostgreSQL is the primary alternative to evaluate through a new architectural decision record.

```

```
