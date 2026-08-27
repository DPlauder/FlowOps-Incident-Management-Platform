# ADR-005 – Multi-Tenant Architecture

## Status

Accepted

## Date

2026-08

## Decision

FlowOps will use a shared-database, shared-schema multi-tenant architecture.

All organizations will use the same Cloudflare D1 database and the same database schema.

Every tenant-owned resource will contain an explicit `organization_id` that identifies the organization to which the resource belongs.

Access to tenant-owned resources will always be restricted by the authenticated user's organization context.

The application will derive the organization context from the authenticated session and the user's organization membership.

The client must never be trusted to determine the organization context of a protected request.

The fundamental security rule is:

````text
Authenticated User
        │
        ▼
Organization Membership
        │
        ▼
Authenticated Organization ID
        │
        ▼
Database Query
        │
        └── organization_id = authenticatedOrganizationId
      ```

The architecture therefore follows:

      ```text
                    FlowOps
                       │
              ┌────────┴────────┐
              │                 │
        Organization A    Organization B
              │                 │
        ┌─────┴─────┐     ┌─────┴─────┐
        │ Incidents │     │ Incidents │
        │ Events    │     │ Events    │
        │ Comments  │     │ Comments  │
        └───────────┘     └───────────┘
              │                 │
              └────────┬────────┘
                       │
                 Shared D1
                 Shared Schema
````

Logical tenant isolation will be enforced at the application and database-query level.

## Context

FlowOps is a multi-tenant incident management platform.

The system must support multiple organizations while keeping their data strictly separated.

An organization may contain multiple users.

Users can perform actions based on their role within the organization.

Example:

```text
Organization A
├── Alice – Admin
├── Bob – MEMBER
└── Charlie – Member

Organization B
├── David – Admin
└── Eva – Member
```

Alice must be able to access resources belonging to Organization A.

Alice must never be able to access resources belonging to Organization B.

The architecture therefore requires an explicit tenant boundary.

## Goals

The multi-tenant architecture must provide:

- Strong organization-level data isolation
- Clear authorization boundaries
- Simple database design
- Low infrastructure complexity
- Low operational cost
- Good local development experience
- Easy testing
- Compatibility with Cloudflare D1
- Clear implementation patterns
- Good scalability for the MVP
- A structure that can evolve later if required

The architecture should also make tenant isolation easy to understand during code review.

## Non-Goals

The MVP does not attempt to provide:

- A physically isolated database per organization
- A separate Cloudflare account per organization
- A separate application deployment per organization
- Dedicated infrastructure for individual organizations
- Enterprise-grade data residency per tenant
- Cross-tenant reporting
- Cross-tenant resource sharing

These may be considered later if product requirements change.

## Tenant Definition

A tenant in FlowOps is represented by an organization.

The organization is the primary isolation boundary.

Conceptually:

Organization
│
├── Users
├── Incidents
├── Events
├── Comments
└── Postmortems

A user accesses an organization through an explicit membership relationship.

User
│
▼
Organization Membership
│
├── organization_id
├── user_id
└── role

### Organization as Security Boundary

The organization is treated as a security boundary.

Every operation involving tenant-owned data must answer:

Which organization owns this resource?

and:

Does the authenticated user belong to that organization?

Only when both conditions are satisfied may the operation continue.

## Shared Database Strategy

All organizations share the same D1 database.

The database contains a shared schema.

Example:

D1 Database
│
├── users
├── organizations
├── organization_members
├── sessions
├── incidents
├── incident_events
├── comments
└── postmortems

Tenant-owned tables contain an organization_id where appropriate.

Example:

incidents
├── id
├── organization_id
├── title
├── description
├── status
└── created_at

### Why Shared Database?

A shared database was selected because it provides the best balance for the FlowOps MVP.

Advantages include:

- Lower operational complexity
- Lower cost
- Simple deployment
- Simple migrations
- Simple local development
- Straightforward backups
- Easy database management
- Good compatibility with D1
- Efficient use of infrastructure

For the expected MVP scale, physically separate databases would introduce unnecessary complexity.

## Alternatives Considered

The following multi-tenant architectures were considered:

- Shared database / shared schema
- Shared database / separate schema
- Separate database per organization
- Separate deployment per organization

The MVP selects:

Shared Database

- Shared Schema
- Explicit organization_id

### Alternative: Database Per Tenant

A separate database could be created for every organization.

Example:

Organization A
│
▼
Database A

Organization B
│
▼
Database B

Organization C
│
▼
Database C

This provides stronger physical isolation.

However, it introduces additional complexity:

- Database provisioning
- Migration management
- Connection management
- Deployment complexity
- Backup management
- Operational monitoring
- Tenant lifecycle management

This is unnecessary for the MVP.

### Alternative: Separate Schema Per Tenant

A separate schema per organization could theoretically provide isolation.

However, this approach is not a good fit for the chosen database architecture and would complicate:

Migrations
Queries
Schema management
Application logic
Local development

It was therefore rejected.

### Alternative: Separate Application Per Tenant

Running a separate application instance for each organization would provide strong isolation.

However, it would create significant operational overhead.

It is not appropriate for the MVP.

## Tenant Identification

The organization must be identified server-side.

The preferred flow is:

HTTP Request
│
▼
Session Cookie
│
▼
Session
│
▼
User
│
▼
Organization Membership
│
▼
Organization ID

The resulting organization ID becomes part of the authenticated request context.

### Authenticated Context

The application should expose the organization through an authenticated server-side context.

Conceptually:

```ts
type AuthContext = {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
};
```

The exact implementation may differ.

The important rule is:

organizationId
│
▼
must originate from authenticated server-side state

and not from arbitrary client input.

### Client-Supplied Organization IDs

Client-supplied organization IDs must never be trusted for authorization.

Unsafe:

```json
{
  "organizationId": "org-b"
}
```

The server must not assume that the authenticated user is allowed to access org-b.

Instead:

Session
│
▼
User
│
▼
Membership
│
▼
Authenticated Organization

determines the organization.

## API Example

Consider:

GET /api/incidents/123

The server must not simply execute:

```sql
SELECT *
FROM incidents
WHERE id = ?;
```

Instead, it must scope the lookup to the authenticated organization:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The second parameter must come from the authenticated server-side context.

## List Queries

Tenant isolation also applies to collection endpoints.

Unsafe:

```sql
SELECT *
FROM incidents
ORDER BY created_at DESC;
```

Safe:

```sql
SELECT *
FROM incidents
WHERE organization_id = ?
ORDER BY created_at DESC;
```

The organization filter is mandatory for tenant-owned resources.

## Create Operations

When creating a tenant-owned resource, the server must assign the organization ID.

Unsafe:

```json
{
  "organizationId": "org-a",
  "title": "Database outage"
}
```

The server should derive the organization:

Authenticated Context
│
▼
organizationId
│
▼
Create Incident

The client only provides fields that it is actually allowed to control.

Example:

```json
{
  "title": "Database outage",
  "description": "Production database is unavailable."
}
```

The server adds:

organization_id = authenticatedOrganizationId

## Update Operations

Updates must also be organization-scoped.

Unsafe:

```sql
UPDATE incidents
SET status = ?
WHERE id = ?;
```

Safe:

```sql
UPDATE incidents
SET status = ?
WHERE id = ?
AND organization_id = ?;
```

This prevents a user from modifying a resource belonging to another organization.

## Delete Operations

If deletion is supported, it must also include the organization boundary.

Example:

```sql
DELETE FROM incidents
WHERE id = ?
AND organization_id = ?;
```

Authorization must additionally verify whether the user's role is allowed to delete the resource.

## Nested Resources

Nested resources must inherit the organization boundary from their parent resource.

Example:

/api/incidents/:id/events

The server must verify that the incident belongs to the authenticated organization before returning its events.

Unsafe:

```sql
SELECT *
FROM incident_events
WHERE incident_id = ?;
```

Safer:

```sql
SELECT events.*
FROM incident_events events
JOIN incidents incidents
  ON incidents.id = events.incident_id
WHERE events.incident_id = ?
AND incidents.organization_id = ?;
```

The exact query may differ depending on the data model.

## Organization Ownership

Tenant-owned resources must have a clear ownership model.

For example:

organizations
│
├── incidents
│ ├── events
│ ├── comments
│ └── postmortems
│
└── users through memberships

The application must be able to determine the organization of every tenant-owned resource.

## Data Model

The core relationship is:

users
│
│
└────< organization_members >──── organizations
│
├────< incidents
│
├────< incident_events
│
├────< comments
│
└────< postmortems

The complete data model is defined in:

Data-Model.md

### Organization Membership

A user may be associated with an organization through a membership record.

Conceptually:

organization_members
├── id
├── organization_id
├── user_id
├── role
└── created_at

This provides the relationship:

User
│
▼
Membership
│
├── Organization
└── Role

### User and Organization Relationship

Users may belong to multiple organizations.

The active organization is resolved from the authenticated user's active membership for each request.

The architecture should nevertheless keep the membership relationship explicit rather than embedding organization_id directly into the authentication session as the sole source of truth.

This keeps the model extensible for future multi-organization support.

### Future Multi-Organization Support

If users later need to belong to multiple organizations:

User
├── Membership → Organization A
├── Membership → Organization B
└── Membership → Organization C

the authentication system can introduce an active organization context.

The user would then select which organization they are currently operating in.

This is outside the MVP scope.

### Roles

Roles are organization-specific.

A user's role is determined by their organization membership.

Conceptually:

User
│
└── Membership
│
├── organization_id
└── role

This prevents global roles from being incorrectly applied across organizations.

## Authorization Flow

The authorization process is:

Request
│
▼
Authenticate Session
│
▼
Load User
│
▼
Load Organization Membership
│
▼
Determine Organization
│
▼
Load Requested Resource
│
▼
Verify Resource Organization
│
▼
Verify Role / Permission
│
▼
Execute Operation

## Defense in Depth

Tenant isolation should not depend on a single check.

The application should enforce multiple boundaries:

```text
Layer 1: Authentication
  │
  ▼
Layer 2: Organization Membership
  │
  ▼
Layer 3: Organization-Scoped Query
  │
  ▼
Layer 4: Role / Permission Check
  │
  ▼
Layer 5: Business Rules
```

A failure at any layer must prevent unauthorized access.

## Database Constraints

Where possible, database constraints should reinforce tenant integrity.

Examples include:

- Foreign keys
- Unique constraints
- Not-null constraints
- Check constraints where appropriate

The database should not be expected to replace application authorization.

However, database integrity should prevent invalid relationships.

### Composite Uniqueness

Tenant-specific uniqueness should include the organization boundary where appropriate.

For example, if incident identifiers or names are only required to be unique within an organization, the constraint should reflect that.

Conceptually:

UNIQUE (
organization_id,
name
)

rather than:

UNIQUE (
name
)

This prevents unnecessarily global constraints.

### Foreign Keys

Tenant-owned resources should reference their owning organization through a foreign key.

Example:

incidents.organization_id
│
▼
organizations.id

This ensures that an incident cannot reference a non-existent organization.

### Referential Integrity

Relationships between tenant-owned resources should be explicit.

For example:

Incident
│
├── Events
├── Comments
└── Postmortem

The database should enforce the appropriate foreign key relationships.

Deletion behavior must be deliberately defined.

For example:

Delete Organization
│
├── Delete / archive incidents
├── Delete / archive events
├── Delete / archive comments
└── Delete / archive postmortems

The exact behavior is outside the scope of this ADR and must be documented in the data model.

## Cross-Tenant Access Prevention

The application must explicitly protect against cross-tenant access.

The following must all be considered security-sensitive:

- `GET`
- `POST`
- `PATCH`
- `DELETE`

Tenant isolation applies to:

Detail requests
Collection requests

### Search

Filtering

### Sorting

Updates
Deletes
Nested resources
Aggregations
Search

Search queries must always include the organization boundary.

Unsafe:

```sql
SELECT *
FROM incidents
WHERE title LIKE ?;
```

Safe:

```sql
SELECT *
FROM incidents
WHERE organization_id = ?
AND title LIKE ?;
```

### Filtering

Filters must not allow the client to escape the organization boundary.

For example:

GET /api/incidents?status=OPEN

must internally become conceptually:

SELECT \*
FROM incidents
WHERE organization_id = ?
AND status = 'OPEN';

The organization condition is mandatory and not user-controlled.

Sorting

Sorting does not normally change the tenant boundary.

However, dynamically constructed sorting queries must be implemented safely.

The organization filter must remain present regardless of the selected sort order.

### Pagination

Pagination must remain organization-scoped.

Example:

```sql
SELECT *
FROM incidents
WHERE organization_id = ?
ORDER BY created_at DESC
LIMIT ?
OFFSET ?;
```

Pagination must never allow resources from another organization to appear.

### Aggregations

Aggregations must also be scoped.

Unsafe:

```sql
SELECT COUNT(*)
FROM incidents;
```

Safe:

```sql
SELECT COUNT(*)
FROM incidents
WHERE organization_id = ?;
```

This applies to:

- Incident counts
- Status statistics
- Response metrics
- User statistics
- Dashboard data

## Events and Audit Data

Incident events are tenant-owned data.

Therefore:

Incident Event
│
▼
Incident
│
▼
Organization

The application must ensure that an authenticated user can only access events associated with incidents belonging to their organization.

## Comments

Comments are also tenant-owned.

A comment should not be accessible solely because the client knows its ID.

The application must verify the ownership chain:

Comment
│
▼
Incident
│
▼
Organization
│
▼
Authenticated User

## Postmortems

Postmortems follow the same organization boundary.

Example:

Postmortem
│
▼
Incident
│
▼
Organization

Access must be denied if the incident belongs to another organization.

## Resource IDs

Resource IDs should be difficult to guess where appropriate.

The application should avoid relying solely on sequential IDs as a security mechanism.

However, changing the identifier format does not replace authorization.

Even an unpredictable ID must still be organization-scoped.

The security rule remains:

```text
Unknown ID
+
Valid Organization
=
Resource may be looked up

Known ID
+
Wrong Organization
=
Access denied
```

## Error Handling

The application must avoid leaking information about resources belonging to other organizations.

For a request such as:

GET /api/incidents/123

where incident 123 belongs to another organization, the application should generally return:

404 Not Found

rather than confirming that the resource exists.

This reduces resource enumeration.

The exact behavior must remain consistent across the API.

## Security Logging

Cross-tenant access attempts should be considered security-relevant events.

The application may record:

TENANT_ACCESS_DENIED

or an equivalent audit event.

Logs must not contain unnecessary sensitive information.

Session identifiers and secrets must never be logged.

## Administrative Access

The MVP does not introduce a global platform administrator role.

Organization administrators are scoped to their own organization.

For example:

Organization A Admin
│
▼
Organization A

does not imply:

Organization B

access.

If a future platform administrator is introduced, it must be explicitly modeled as a separate authorization concept.

## Tenant Creation

The MVP should define how organizations are created.

The expected initial flow is:

Registration
│
▼
Create Organization
│
▼
Create Membership
│
▼
Assign Initial Role

The user who creates the organization receives the appropriate initial role according to the product requirements.

## Tenant Deletion

Organization deletion is outside the MVP unless explicitly required.

If implemented later, it must consider:

Resource deletion
Referential integrity
Sessions
Memberships
Audit records
Backups
Data retention

Deletion should be treated as a high-risk administrative operation.

## Tenant Isolation in Application Code

Tenant filtering should be centralized as much as practical.

The goal is to prevent developers from accidentally writing:

SELECT \*
FROM incidents
WHERE id = ?;

when the correct query is:

SELECT \*
FROM incidents
WHERE id = ?
AND organization_id = ?;

The data access layer should make organization-scoped operations the default.

### Repository / Data Access Pattern

A repository or data-access abstraction may receive the organization ID explicitly.

Example:

```ts
getIncident(
  organizationId: string,
  incidentId: string
);
```

rather than:

```ts
getIncident(
  incidentId: string
);
```

This makes the tenant boundary visible in the function signature.

### Example Service

Conceptually:

```ts
async function getIncident(context: AuthContext, incidentId: string) {
  return incidentRepository.findById(context.organizationId, incidentId);
}
```

The service does not accept an arbitrary organization ID from the request body.

### Example Create Operation

```ts
async function createIncident(
  context: AuthContext,
  input: CreateIncidentInput,
) {
  return incidentRepository.create({
    organizationId: context.organizationId,
    title: input.title,
    description: input.description,
  });
}
```

The organization ID comes from the authenticated context.

### Example Update Operation

```ts
async function updateIncident(
  context: AuthContext,
  incidentId: string,
  input: UpdateIncidentInput,
) {
  return incidentRepository.update({
    organizationId: context.organizationId,
    incidentId,
    ...input,
  });
}
```

The repository is responsible for applying the organization filter.

## Security Principle

The most important principle of this ADR is:

Never trust the client to determine tenant ownership.

The following values must be treated as untrusted:

- `organizationId`
- `userId`
- `role`
- `permissions`
- resource ownership

when supplied directly by the client.

The server must derive these values from authenticated and authorized state.

## Testing Strategy

Multi-tenant isolation must be tested explicitly.

It is not sufficient to test only that Organization A can access its own resources.

Tests must also verify that Organization A cannot access Organization B.

### Unit Tests

Unit tests should cover:

- Organization context resolution
- Role resolution
- Authorization rules
- Tenant-scoped repository methods
- Resource ownership checks

### Integration Tests

Integration tests should cover:

Creating resources within an organization
Listing resources within an organization
Updating resources within an organization
Accessing another organization's resource
Updating another organization's resource
Deleting another organization's resource
Nested resource access

### Cross-Tenant Test

A mandatory security test should follow:

1. Create Organization A
2. Create User A
3. Create Organization B
4. Create User B
5. Create Incident in Organization A
6. Authenticate User B
7. Request Incident belonging to Organization A
8. Verify access is denied

Expected result:

404 Not Found

or another explicitly defined safe response.

### Cross-Tenant Mutation Test

A second mandatory test should verify that a user cannot modify another organization's resource.

1. Create Incident in Organization A
2. Authenticate User B
3. Attempt PATCH against Incident A
4. Verify request is rejected
5. Verify Incident A remains unchanged

### Cross-Tenant Collection Test

The application must also ensure that list endpoints do not leak resources.

Example:

Organization A
├── Incident A1
└── Incident A2

Organization B
└── Incident B1

When User A requests:

GET /api/incidents

the response must contain:

Incident A1
Incident A2

but never:

Incident B1

### Cross-Tenant Search Test

Search must also be isolated.

If:

Organization A
Incident: "Database outage"

Organization B
Incident: "Database outage"

User A searching for:

Database

must only receive the Organization A result.

### Cross-Tenant Aggregation Test

Dashboard statistics must not include data from other organizations.

For example:

Organization A
Open incidents: 3

Organization B
Open incidents: 8

User A must see:

Open incidents: 3

not:

Open incidents: 11

## Performance Considerations

The shared database architecture is efficient for the MVP.

However, every tenant-scoped query introduces an additional filtering condition.

The primary query pattern is:

WHERE organization_id = ?

Indexes should therefore be designed around common tenant-scoped access patterns.

Examples may include:

- `organization_id`
- `organization_id + status`
- `organization_id + created_at`
- `organization_id + id`

The exact indexes are defined in the database design.

### Indexing Strategy

Tenant-scoped tables should be evaluated for appropriate indexes.

For example:

```sql
CREATE INDEX idx_incidents_organization
ON incidents(organization_id);
```

If queries frequently filter by organization and status:

```sql
CREATE INDEX idx_incidents_org_status
ON incidents(organization_id, status);
```

Indexes should be based on actual query patterns rather than created indiscriminately.

## Migration Considerations

All tenant-owned schema changes must be applied consistently to all organizations because the database uses a shared schema.

This is one of the main advantages of the selected architecture.

A migration changes:

Shared Schema
│
▼
All Organizations

rather than requiring tenant-by-tenant migrations.

## Backup Considerations

The shared database architecture means that backups contain data from multiple organizations.

Backup access must therefore be treated as highly sensitive.

Future operational processes must consider:

- Encryption
- Access control
- Retention
- Restoration
- Data deletion requirements

The MVP does not implement tenant-specific backup restoration.

## Data Export

Tenant-specific data export is outside the MVP.

If implemented later, export queries must apply the same organization boundary as normal application queries.

## Data Deletion

If users or organizations can be deleted later, deletion must preserve tenant isolation.

Deleting an organization must not accidentally affect resources belonging to another organization.

Database foreign keys and carefully designed deletion rules are required.

## Observability

Application metrics should be designed so that tenant information does not accidentally leak sensitive data.

Where organization IDs are included in logs or metrics, they should be treated as potentially sensitive identifiers.

Metrics should not expose customer data unnecessarily.

## Cloudflare Architecture

This decision is designed to work with the Cloudflare architecture defined in:

ADR-002-Cloudflare-Architecture.md

The intended architecture is:

Browser
│
▼
Cloudflare
│
▼
Application
│
▼
D1
│
├── Organizations
├── Users
├── Memberships
├── Incidents
├── Events
├── Comments
└── Postmortems

The multi-tenant boundary exists inside the application and data model.

### D1 Relationship

This ADR depends on the database decision documented in:

ADR-003-Database-D1.md

D1 provides the shared relational database used by all tenants.

The application is responsible for applying the tenant boundary to queries.

### Authentication Relationship

This ADR depends on:

ADR-004-Authentication-Strategy.md

Authentication provides:

- User
- Organization
- Role
- Session

The multi-tenant architecture uses that authenticated context to enforce tenant isolation.

### Security Relationship

The complete security controls are documented in:

Security.md

This ADR specifically defines the tenant isolation architecture.

It does not replace the general security documentation.

## Consequences

### Positive Consequences

#### Low Infrastructure Complexity

All organizations use the same application and database.

#### Low Cost

The architecture avoids provisioning separate infrastructure for every organization.

#### Simple Deployment

A single deployment updates all tenants.

#### Simple Migrations

Database migrations apply to the shared schema.

#### Easy Local Development

Developers can run the complete system with one database.

#### Clear Tenant Boundary

The organization_id pattern makes tenant ownership explicit.

#### Easy Testing

Multiple organizations can be represented in a single test database.

#### Good MVP Scalability

The architecture is appropriate for the expected scale of the MVP.

### Negative Consequences

#### Application-Level Isolation

Tenant isolation relies heavily on correct application and query implementation.

A missing organization_id filter can create a serious security vulnerability.

#### Shared Failure Domain

A database problem can affect multiple organizations simultaneously.

#### Shared Resource Limits

All organizations share the same database and application resources.

#### More Complex Security Testing

Cross-tenant access must be explicitly tested.

#### Future Enterprise Requirements

Some enterprise customers may eventually require:

Dedicated databases
Dedicated infrastructure
Data residency
Stronger physical isolation

The current architecture does not provide these guarantees.

### Security Trade-Off

The selected architecture intentionally trades physical isolation for operational simplicity.

The security boundary is logical rather than physical.

Physical Isolation
│
X
│
Logical Isolation
│
├── Authentication
├── Membership
├── Authorization
└── organization_id filtering

For the MVP, this is considered an acceptable trade-off.

## Decision Rationale

The shared-database/shared-schema approach was selected because it:

- Fits the Cloudflare D1 architecture
- Minimizes infrastructure
- Keeps costs low
- Simplifies deployment
- Simplifies development
- Supports multiple organizations
- Provides a clear tenant model
- Is easy to test
- Can evolve later

The most important requirement is that tenant isolation is treated as a first-class security concern rather than an optional application feature.

## Implementation Requirements

The following requirements result from this ADR.

### Requirement 1

Every organization must have a unique identifier.

### Requirement 2

Users must be associated with organizations through explicit membership records.

### Requirement 3

Organization membership must contain the user's organization-specific role.

### Requirement 4

Tenant-owned resources must contain or be traceably associated with an organization_id.

### Requirement 5

Authenticated organization context must be derived server-side.

### Requirement 6

Client-provided organization IDs must never determine authorization.

### Requirement 7

Collection queries must always be organization-scoped.

### Requirement 8

Detail queries must always be organization-scoped.

### Requirement 9

Update operations must always be organization-scoped.

### Requirement 10

Delete operations must always be organization-scoped.

### Requirement 11

Nested resources must inherit and verify the organization boundary.

### Requirement 12

Search and filtering must remain organization-scoped.

### Requirement 13

Aggregations and dashboard statistics must remain organization-scoped.

### Requirement 14

Role checks must be applied after authentication and organization resolution.

### Requirement 15

Cross-tenant access must be covered by automated tests.

### Requirement 16

Cross-tenant mutation must be covered by automated tests.

### Requirement 17

Database constraints must protect referential integrity.

### Requirement 18

Appropriate indexes must support common organization-scoped queries.

### Requirement 19

Security-sensitive cross-tenant access attempts must be handled consistently.

### Requirement 20

The application must never rely on resource IDs alone as an authorization mechanism.

## Verification Checklist

Before considering the multi-tenant architecture complete:

- [ ] Organizations can be created
- [ ] Users can belong to organizations
- [ ] Organization memberships contain roles
- [ ] Authenticated organization context is available
- [ ] Client organization IDs are ignored for authorization
- [ ] Incidents are organization-scoped
- [ ] Incident events are organization-scoped
- [ ] Comments are organization-scoped
- [ ] Postmortems are organization-scoped
- [ ] Collection queries include organization filtering
- [ ] Detail queries include organization filtering
- [ ] Update queries include organization filtering
- [ ] Delete queries include organization filtering
- [ ] Search queries include organization filtering
- [ ] Aggregations include organization filtering
- [ ] Nested resource access is protected
- [ ] Role-based authorization is enforced
- [ ] Cross-tenant read tests exist
- [ ] Cross-tenant update tests exist
- [ ] Cross-tenant delete tests exist
- [ ] Cross-tenant search tests exist
- [ ] Cross-tenant aggregation tests exist
- [ ] Foreign keys are defined
- [ ] Appropriate tenant indexes exist
- [ ] No client-provided organization ID bypasses the security boundary

## Related Decisions

This ADR is related to:

- ADR-001 – Technology Stack
- ADR-002 – Cloudflare Architecture
- ADR-003 – Database Selection: Cloudflare D1
- ADR-004 – Authentication Strategy

## Related Documentation

- `../Architecture.md`
- `../Data-Model.md`
- `../API.md`
- `../Security.md`
- `../../01-Anforderungen/Anforderungsblatt-de.md`
- `../../01-Anforderungen/Requirements-Specification-en.md`
- `../../02-Produktplanung/MVP-Core.md`
- `../../02-Produktplanung/MVP-Backlog-de.md`
- `../../02-Produktplanung/User-Stories/user-stories-de.md`
- `../../04-Umsetzung/Definition-of-Done.md`
- `../../05-Qualitaet/Testing-Matrix.md`
- `../../05-Qualitaet/Risks-and-Open-Questions.md`

## Decision Summary

FlowOps will use a shared-database, shared-schema multi-tenant architecture.

Organizations are the primary tenant boundary.

Tenant-owned resources are associated with an organization through organization_id or an explicit ownership relationship.

The authenticated user's organization is derived from the server-side session and organization membership.

Client-provided organization identifiers are never trusted for authorization.

Every tenant-scoped database operation must include the authenticated organization context.

The architecture prioritizes:

- Strong logical tenant isolation
- Low infrastructure complexity
- Low cost
- Simple deployment
- Clear security boundaries
- Testability
- Compatibility with Cloudflare D1

The architecture may be reconsidered if FlowOps later requires dedicated infrastructure, enterprise isolation, data residency, or substantially different scalability characteristics.
