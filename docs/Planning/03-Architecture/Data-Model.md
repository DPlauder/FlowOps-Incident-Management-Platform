# FlowOps – Data Model

> This document defines the persistent data model for the FlowOps MVP, including entities, relationships, tenant isolation, lifecycle rules, and migration principles.

## 1. Overview

The FlowOps database stores all persistent application data required for authentication, organizations, services, incidents, incident timelines, comments, and postmortems.

The MVP uses a relational data model based on Cloudflare D1 (SQLite).

The data model is designed around the following principles:

- Organizations are the primary tenant boundary.
- Users can belong to one or more organizations.
- Organization membership determines access and role.
- Organization-owned resources always reference an organization.
- Incident history is stored as immutable events.
- Authentication sessions are stored separately from user accounts.
- Relationships are enforced through foreign keys where supported.
- Data access must always respect organization boundaries.

---

## 2. Entity Overview

The core entities are:

```text
┌─────────────────────┐
│    organizations    │
└──────────┬──────────┘
           │
           │
           ├──────────────────────┐
           │                      │
           ▼                      ▼
┌─────────────────────┐   ┌─────────────────────┐
│ organization_members│   │      services       │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           ▼                         ▼
      ┌─────────┐            ┌─────────────────┐
      │  users  │            │    incidents    │
      └────┬────┘            └────────┬────────┘
           │                          │
           │                          ├───────────────┐
           │                          │               │
           │                          ▼               ▼
           │                  ┌───────────────┐ ┌───────────────┐
           │                  │incident_events│ │   comments    │
           │                  └───────────────┘ └───────────────┘
           │
           ▼
      ┌──────────┐
      │ sessions │
      └──────────┘

                    incidents
                        │
                        ▼
                 ┌────────────┐
                 │postmortems │
                 └────────────┘
```

## 3. Entity List

| Entity                 | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `organizations`        | Represents a FlowOps tenant                              |
| `users`                | Stores user accounts                                     |
| `organization_members` | Connects users to organizations and stores roles         |
| `sessions`             | Stores authenticated sessions                            |
| `services`             | Represents applications or services monitored by FlowOps |
| `incidents`            | Stores incidents                                         |
| `incident_events`      | Stores the incident timeline and audit events            |
| `comments`             | Stores user comments on incidents                        |
| `postmortems`          | Stores post-incident analysis                            |

## 4. Organizations

The organizations table represents the tenant boundary of FlowOps.

All organization-owned resources must belong to exactly one organization.

**Table:** `organizations`

| Column       | Type | Constraints      | Description                      |
| ------------ | ---- | ---------------- | -------------------------------- |
| `id`         | TEXT | PK               | Unique organization identifier   |
| `name`       | TEXT | NOT NULL         | Organization name                |
| `slug`       | TEXT | NOT NULL, UNIQUE | URL-safe organization identifier |
| `created_at` | TEXT | NOT NULL         | Creation timestamp               |
| `updated_at` | TEXT | NOT NULL         | Last modification timestamp      |

**Example:**

```text
id: org_01JABC123
name: Example Engineering
slug: example-engineering
```

## 5. Users

The users table stores user accounts.

A user represents an individual person and is not directly tied to a single organization.

Organization membership is handled through organization_members.

**Table:** `users`

| Column          | Type    | Constraints      | Description                 |
| --------------- | ------- | ---------------- | --------------------------- |
| `id`            | TEXT    | PK               | Unique user identifier      |
| `email`         | TEXT    | NOT NULL, UNIQUE | User email address          |
| `password_hash` | TEXT    | NOT NULL         | Secure password hash        |
| `display_name`  | TEXT    | NOT NULL         | User's display name         |
| `is_active`     | INTEGER | NOT NULL         | Account status              |
| `created_at`    | TEXT    | NOT NULL         | Creation timestamp          |
| `updated_at`    | TEXT    | NOT NULL         | Last modification timestamp |

is_active uses SQLite integer values:

```text
1 = active
0 = inactive
```

Passwords are never stored in plain text.

## 6. Organization Members

The organization_members table represents the membership relationship between users and organizations.

This table also stores the user's role within the organization.

The membership is the explicit link between a user and an organization:

```text
User
 │
 │ 1:N
 ▼
Membership
 │
 │ N:1
 ▼
Organization
```

**Table:** `organization_members`

| Column            | Type | Constraints  | Description                   |
| ----------------- | ---- | ------------ | ----------------------------- |
| `id`              | TEXT | PK           | Membership identifier         |
| `organization_id` | TEXT | FK, NOT NULL | Organization                  |
| `user_id`         | TEXT | FK, NOT NULL | User                          |
| `role`            | TEXT | NOT NULL     | Organization role             |
| `status`          | TEXT | NOT NULL     | Membership status             |
| `created_at`      | TEXT | NOT NULL     | Membership creation timestamp |
| `updated_at`      | TEXT | NOT NULL     | Last modification timestamp   |

### Roles

The initial MVP supports the following roles:

| Role       | Responsibility                                                               |
| ---------- | ---------------------------------------------------------------------------- |
| **OWNER**  | Can manage the organization and its members.                                 |
| **ADMIN**  | Can manage operational resources and incidents.                              |
| **MEMBER** | Can participate in incident management according to the defined permissions. |

### Membership Status

The initial MVP supports the following membership statuses:

| Status       | Meaning                                                      |
| ------------ | ------------------------------------------------------------ |
| **ACTIVE**   | The membership grants access according to the assigned role. |
| **DISABLED** | The membership is retained, but access is disabled.          |

### Constraints

A user should only have one membership per organization.

Conceptually:

```sql
UNIQUE(user_id, organization_id)
```

## 7. Sessions

The sessions table stores authenticated user sessions.

Sessions are separate from users so that a user can have multiple active sessions.

**Table:** `sessions`

| Column         | Type | Constraints  | Description             |
| -------------- | ---- | ------------ | ----------------------- |
| `id`           | TEXT | PK           | Session identifier      |
| `user_id`      | TEXT | FK, NOT NULL | Associated user         |
| `expires_at`   | TEXT | NOT NULL     | Session expiration      |
| `created_at`   | TEXT | NOT NULL     | Creation timestamp      |
| `last_used_at` | TEXT | NOT NULL     | Last activity timestamp |

The session identifier is stored in a secure HTTP-only cookie.

Sensitive session values must never be written to application logs.

## 8. Services

A service represents an application, system, or component for which incidents can be created.

**Examples:** Web Application, Payment API, Authentication Service, Database, Customer Portal

**Table:** `services`

| Column            | Type    | Constraints  | Description                   |
| ----------------- | ------- | ------------ | ----------------------------- |
| `id`              | TEXT    | PK           | Service identifier            |
| `organization_id` | TEXT    | FK, NOT NULL | Owning organization           |
| `name`            | TEXT    | NOT NULL     | Service name                  |
| `description`     | TEXT    | NULL         | Service description           |
| `is_active`       | INTEGER | NOT NULL     | Whether the service is active |
| `created_at`      | TEXT    | NOT NULL     | Creation timestamp            |
| `updated_at`      | TEXT    | NOT NULL     | Last modification timestamp   |

## 9. Incidents

The incidents table represents operational incidents.

An incident belongs to exactly one organization and may optionally reference a service.

**Table:** `incidents`

| Column            | Type | Constraints  | Description                   |
| ----------------- | ---- | ------------ | ----------------------------- |
| `id`              | TEXT | PK           | Incident identifier           |
| `organization_id` | TEXT | FK, NOT NULL | Owning organization           |
| `service_id`      | TEXT | FK, NULL     | Affected service              |
| `title`           | TEXT | NOT NULL     | Incident title                |
| `description`     | TEXT | NOT NULL     | Incident description          |
| `severity`        | TEXT | NOT NULL     | Incident severity             |
| `status`          | TEXT | NOT NULL     | Current incident status       |
| `created_by`      | TEXT | FK, NOT NULL | User who created the incident |
| `assigned_to`     | TEXT | FK, NULL     | Assigned user                 |
| `started_at`      | TEXT | NULL         | Time incident started         |
| `resolved_at`     | TEXT | NULL         | Time incident was resolved    |
| `closed_at`       | TEXT | NULL         | Time incident was closed      |
| `created_at`      | TEXT | NOT NULL     | Creation timestamp            |
| `updated_at`      | TEXT | NOT NULL     | Last modification timestamp   |

## 10. Incident Severity

The MVP uses four severity levels.

| Severity | Definition                                       |
| -------- | ------------------------------------------------ |
| **SEV1** | Critical incident with major impact.             |
| **SEV2** | High-impact incident requiring urgent attention. |
| **SEV3** | Moderate incident with limited impact.           |
| **SEV4** | Low-impact incident.                             |

The exact operational definitions are maintained in the application requirements.

## 11. Incident Status

The MVP uses the following lifecycle:

```text
OPEN -> INVESTIGATING -> MITIGATED -> RESOLVED -> CLOSED
```

Status transitions are controlled by application logic.

The database stores the current status.

The complete history is stored separately in incident_events.

## 12. Incident Events

The incident_events table stores the chronological history of an incident.

Events are append-only.

**Examples:** `INCIDENT_CREATED`, `STATUS_CHANGED`, `SEVERITY_CHANGED`, `ASSIGNED`, `COMMENT_ADDED`, `POSTMORTEM_CREATED`, `POSTMORTEM_PUBLISHED`

**Table:** `incident_events`

| Column            | Type | Constraints  | Description                |
| ----------------- | ---- | ------------ | -------------------------- |
| `id`              | TEXT | PK           | Event identifier           |
| `incident_id`     | TEXT | FK, NOT NULL | Related incident           |
| `organization_id` | TEXT | FK, NOT NULL | Owning organization        |
| `actor_id`        | TEXT | FK, NOT NULL | User performing the action |
| `type`            | TEXT | NOT NULL     | Event type                 |
| `payload`         | TEXT | NULL         | Event-specific JSON data   |
| `created_at`      | TEXT | NOT NULL     | Event timestamp            |

The payload column stores structured event-specific information as JSON.

Example:

```json
{
  "from": "INVESTIGATING",
  "to": "MITIGATED"
}
```

## 13. Comments

Comments allow users to communicate during an incident.

Comments are associated with both an incident and the user who created them.

**Table:** `comments`

| Column            | Type | Constraints  | Description                 |
| ----------------- | ---- | ------------ | --------------------------- |
| `id`              | TEXT | PK           | Comment identifier          |
| `incident_id`     | TEXT | FK, NOT NULL | Related incident            |
| `organization_id` | TEXT | FK, NOT NULL | Owning organization         |
| `author_id`       | TEXT | FK, NOT NULL | Comment author              |
| `body`            | TEXT | NOT NULL     | Comment content             |
| `created_at`      | TEXT | NOT NULL     | Creation timestamp          |
| `updated_at`      | TEXT | NOT NULL     | Last modification timestamp |

## 14. Postmortems

A postmortem documents what happened during an incident and what the team learned from it.

An incident can have at most one postmortem in the MVP.

**Table:** `postmortems`

| Column            | Type | Constraints          | Description                 |
| ----------------- | ---- | -------------------- | --------------------------- |
| `id`              | TEXT | PK                   | Postmortem identifier       |
| `incident_id`     | TEXT | FK, UNIQUE, NOT NULL | Related incident            |
| `organization_id` | TEXT | FK, NOT NULL         | Owning organization         |
| `author_id`       | TEXT | FK, NOT NULL         | Postmortem author           |
| `summary`         | TEXT | NOT NULL             | Incident summary            |
| `impact`          | TEXT | NOT NULL             | Impact description          |
| `root_cause`      | TEXT | NOT NULL             | Root cause                  |
| `resolution`      | TEXT | NOT NULL             | Resolution description      |
| `lessons_learned` | TEXT | NOT NULL             | Lessons learned             |
| `status`          | TEXT | NOT NULL             | Postmortem status           |
| `published_at`    | TEXT | NULL                 | Publication timestamp       |
| `created_at`      | TEXT | NOT NULL             | Creation timestamp          |
| `updated_at`      | TEXT | NOT NULL             | Last modification timestamp |

## 15. Postmortem Status

The MVP uses:

`DRAFT` -> `REVIEW` -> `PUBLISHED`

Lifecycle:

```text
DRAFT -> REVIEW -> PUBLISHED
```

The postmortem cannot be published until the required fields have been completed.

## 16. Relationships

### Organization → Members

One organization can have many members.

```text
Organization 1 ──────── N OrganizationMembers
```

### User → Organization Memberships

One user can belong to multiple organizations.

```text
User 1 ──────── N OrganizationMembers
```

### Organization → Services

One organization can have many services.

```text
Organization 1 ──────── N Services
```

### Organization → Incidents

One organization can have many incidents.

```text
Organization 1 ──────── N Incidents
```

### Service → Incidents

One service can have many incidents.

An incident may optionally belong to a service.

```text
Service 1 ──────── N Incidents
```

### Incident → Events

One incident can have many events.

```text
Incident 1 ──────── N IncidentEvents
```

### Incident → Comments

One incident can have many comments.

```text
Incident 1 ──────── N Comments
```

### Incident → Postmortem

An incident can have zero or one postmortem.

```text
Incident 1 ──────── 0..1 Postmortem
```

## 17. Complete Entity Relationship Diagram

```text
                         ┌─────────────────────┐
                         │    organizations    │
                         │─────────────────────│
                         │ id                  │
                         │ name                │
                         │ slug                │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    │               │               │
                    ▼               ▼               ▼
          ┌────────────────┐ ┌──────────────┐ ┌───────────────┐
          │ organization_  │ │   services   │ │   incidents   │
          │    members     │ │──────────────│ │───────────────│
          │────────────────│ │ id           │ │ id            │
          │ organization_id│ │ organization │ │ organization  │
          │ user_id        │ │ name         │ │ service_id    │
          │ role           │ │              │ │ severity      │
          └───────┬────────┘ └──────────────┘ │ status        │
                  │                            │ assigned_to   │
                  │                            └───────┬───────┘
                  │                                    │
                  ▼                         ┌──────────┼──────────┐
          ┌───────────────┐                 │          │          │
          │     users     │                 ▼          ▼          ▼
          │───────────────│          ┌───────────┐ ┌─────────┐ ┌────────────┐
          │ id            │          │  events   │ │comments │ │ postmortems│
          │ email         │          └───────────┘ └─────────┘ └────────────┘
          │ password_hash │
          │ display_name  │
          └───────┬───────┘
                  │
                  ▼
          ┌───────────────┐
          │   sessions    │
          │───────────────│
          │ id            │
          │ user_id       │
          │ expires_at    │
          └───────────────┘
```

## 18. Tenant Isolation

Tenant isolation is a fundamental database design principle.

All organization-owned resources contain an organization_id.

These include:

services
incidents
incident events
comments
postmortems

This allows queries to explicitly scope resources to an organization.

Example:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The organization_id used in the query must come from the authenticated application context.

It must not be trusted from client input.

## 19. Foreign Key Strategy

Foreign keys should be enabled and used wherever they represent meaningful relationships.

Examples:

```text
organization_members.organization_id
        ↓
organizations.id

organization_members.user_id
        ↓
users.id

services.organization_id
        ↓
organizations.id

incidents.organization_id
        ↓
organizations.id

incidents.service_id
        ↓
services.id

incident_events.incident_id
        ↓
incidents.id

comments.incident_id
        ↓
incidents.id

postmortems.incident_id
        ↓
incidents.id
```

Foreign key behavior must be explicitly considered for delete operations.

## 20. Delete Strategy

The MVP should avoid uncontrolled cascading deletes.

For important operational data, deletion should generally be handled through application-level rules.

For example:

- Users may be deactivated instead of deleted.
- Services may be deactivated instead of deleted.
- Incidents should not be deleted casually.
- Incident events should be immutable.
- Postmortems should remain associated with their incidents.

This preserves historical information.

## 21. Immutable Data

Some data should be treated as immutable after creation.

### Incident Events

Incident events are append-only.

Existing events should never be modified.

### Audit Information

Audit information must preserve the original actor and timestamp.

### Historical Incident Data

Closing an incident does not remove its history.

## 22. Timestamp Strategy

All persistent entities use timestamps.

The initial implementation uses ISO 8601-compatible UTC timestamps.

Example:

2026-08-25T14:30:00Z

The application should consistently use UTC for persisted timestamps.

The frontend converts timestamps into the user's local timezone for display.

## 23. Identifier Strategy

The application uses string-based identifiers rather than auto-incrementing integer IDs.

Example:

```text
usr_01JABC123
org_01JABC456
inc_01JABC789
```

The exact ID generation strategy will be finalized before implementation.

The identifier must:

- be unique
- be safe to expose through the API
- avoid leaking information about record count
- be easy to handle in URLs

## 24. Indexing Strategy

Indexes should be created for fields frequently used in queries.

Initial candidates include:

- `organization_members.organization_id`
- `organization_members.user_id`
- `services.organization_id`
- `incidents.organization_id`
- `incidents.service_id`
- `incidents.status`
- `incidents.severity`
- `incidents.assigned_to`
- `incidents.created_at`
- `incident_events.incident_id`
- `incident_events.created_at`
- `comments.incident_id`
- `comments.created_at`
- `sessions.user_id`
- `sessions.expires_at`
- `postmortems.incident_id`

Indexes will be reviewed during implementation based on actual query patterns.

## 25. Data Integrity Rules

The following rules must be enforced by the application and, where possible, the database.

### User

A user must have a unique email address.

### Organization Membership

A user cannot have multiple memberships in the same organization.

### Service

A service must belong to an organization.

### Incident

An incident must belong to an organization.

If an incident references a service, the service must belong to the same organization.

### Assignment

If an incident is assigned to a user, that user must belong to the same organization.

### Incident Event

Every event must belong to an existing incident.

### Comment

Every comment must belong to an existing incident.

### Postmortem

An incident can have at most one postmortem.

## 26. Cross-Tenant Relationship Validation

Foreign key constraints alone are not sufficient to guarantee tenant isolation.

For example, the following relationship must not be allowed:

```text
Organization A
    │
    └── Incident A
           │
           └── Service belonging to Organization B

The application must verify that related resources belong to the same organization.

Conceptually:

Incident.organization_id
        ==
Service.organization_id
```

The same principle applies to:

- assigned users
- comments
- events
- postmortems

## 27. Data Lifecycle

The basic incident lifecycle is:

```text
Incident Created
       │
       ▼
Incident Updated
       │
       ▼
Investigation
       │
       ▼
Mitigation
       │
       ▼
Resolution
       │
       ▼
Closure
       │
       ▼
Postmortem
```

Historical data remains available after an incident is closed.

## 28. Database Migration Strategy

Database schema changes are managed through version-controlled migrations.

Example:

```text
migrations/
├── 0001_initial_schema.sql
├── 0002_add_services.sql
├── 0003_add_incident_events.sql
└── ...
```

Each migration should be:

- version-controlled
- reproducible
- reviewable
- applied consistently across environments

Schema changes must not be performed manually in production.

## 29. MVP Schema

The initial MVP requires the following tables:

```text
organizations
users
organization_members
sessions
services
incidents
incident_events
comments
postmortems
```

No additional tables should be introduced without a concrete requirement.

## 30. Future Extensions

The following entities may be added after the MVP:

- notifications
- webhooks
- incident_subscribers
- service_dependencies
- teams
- attachments
- integrations
- maintenance_windows
- escalation_policies

These are intentionally excluded from the MVP.

## 31. Open Questions

The following database decisions remain open:

- Exact identifier format
- Exact password hashing implementation
- Session expiration duration
- Whether soft deletion is required for all entities
- Exact incident event payload structure
- Pagination strategy
- Full-text search strategy
- Database backup strategy
- Production migration workflow

These questions are tracked in the risks and open questions documentation.

## 32. Architecture References

Related documentation:

- [Architecture.md](Architecture.md)
- [API.md](API.md)

## 33. Status

**Status:** Draft

### Completed

- Core entities identified
- Organization-based tenancy defined
- User and membership model defined
- Incident lifecycle defined
- Incident event model defined
- Postmortem relationship defined
- Initial indexing strategy defined
- Migration strategy defined

### Next Steps

- Review the data model against the MVP backlog.
- Resolve open database questions.
- Create the initial database schema.
- Create the first migration.
- Validate the model against API requirements.
- Implement database repositories.
