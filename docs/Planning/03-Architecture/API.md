# FlowOps API

## Status

Draft

## Version

MVP v1

## Overview

The FlowOps API provides the backend interface for authentication, organization management, incident management, incident timelines, comments, and postmortems.

The API is designed as a JSON-based HTTP API running within the FlowOps Cloudflare architecture.

The API follows a resource-oriented design and uses standard HTTP methods and status codes.

The API is responsible for:

- request validation
- authentication
- authorization
- tenant isolation
- resource access
- state transitions
- event creation
- error handling

Security-specific implementation details are documented separately in:

- `Security.md`
- `ADR-004-Authentication-Strategy.md`
- `ADR-005-Multi-Tenant-Architecture.md`
- `ADR-006-Session-Management.md`

---

## API Base URL

All application API endpoints are located below:

```text
/api

Examples:

/api/auth/login
/api/incidents
/api/incidents/:id
```

The API is intended to be served from the same application origin as the FlowOps frontend.

This reduces unnecessary CORS and cross-origin authentication complexity.

## Communication Format

### Request Format

Requests use JSON where a request body is required.

Example:

```http
POST /api/incidents
Content-Type: application/json
```

```json
{
  "title": "Production API unavailable",
  "description": "The production API is returning HTTP 500 errors.",
  "severity": "SEV2"
}
```

### Response Format

Successful responses use JSON unless the endpoint explicitly defines another response type.

Example:

```json
{
  "id": "inc_123",
  "title": "Production API unavailable",
  "status": "OPEN"
}
```

### HTTP Status Codes

The API uses standard HTTP status codes.

| Status | Meaning                                                    |
| -----: | ---------------------------------------------------------- |
|    200 | Request completed successfully                             |
|    201 | Resource successfully created                              |
|    204 | Request completed without response body                    |
|    400 | Request is invalid                                         |
|    401 | Authentication is required or invalid                      |
|    403 | Authenticated user is not allowed to perform the operation |
|    404 | Resource does not exist or is not accessible               |
|    409 | Request conflicts with the current resource state          |
|    422 | Request is syntactically valid but cannot be processed     |
|    429 | Rate limit exceeded                                        |
|    500 | Unexpected server error                                    |

## Error Handling

All API errors use a consistent structure.

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

### Error Object

The error object contains:

| Field     | Type   | Required | Description                      |
| --------- | ------ | :------: | -------------------------------- |
| `code`    | string |   yes    | Machine-readable error code      |
| `message` | string |   yes    | Human-readable error message     |
| `fields`  | object |    no    | Field-specific validation errors |

### Validation Error

Example:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "fields": {
      "title": "Title is required.",
      "severity": "Severity must be one of: SEV1, SEV2, SEV3, SEV4."
    }
  }
}
```

Response:

400 Bad Request

### Authentication Error

Example:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required."
  }
}
```

Response:

401 Unauthorized

### Authorization Error

Example:

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You are not allowed to perform this action."
  }
}
```

Response:

403 Forbidden

### Not Found Error

Example:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

Response:

404 Not Found

The API must not reveal whether a resource exists in another organization.

### Conflict Error

Example:

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "The resource cannot be modified in its current state."
  }
}
```

Response:

409 Conflict

### Rate Limit Error

Example:

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later."
  }
}
```

Response:

429 Too Many Requests

### Internal Server Error

Unexpected errors return:

500 Internal Server Error

Example:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

Internal implementation details, database errors, stack traces, credentials, and other sensitive information must never be returned to the client.

## Authentication

FlowOps uses server-side sessions for browser authentication.

The session identifier is stored in a secure HTTP cookie.

The browser does not send authentication credentials through request bodies for normal authenticated API requests.

The authentication flow is:

Browser
|
| Login
v
POST /api/auth/login
|
v
Authentication
|
v
Session created
|
v
HttpOnly Cookie
|
v
Authenticated API Requests

Authentication details are defined in:

ADR-004-Authentication-Strategy.md
ADR-006-Session-Management.md

### Authentication Context

After successful authentication, the API resolves an internal authentication context.

Conceptually:

```ts
type AuthContext = {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
};
```

This context is used internally for authorization and tenant isolation.

It must not be accepted from the client as trusted input.

### Protected Endpoints

Unless explicitly documented as public, API endpoints require authentication.

Protected request flow:

HTTP Request
|
v
Session Validation
|
v
User Validation
|
v
Organization Membership
|
v
Authorization
|
v
Resource Access

Authentication must be implemented centrally rather than independently in every endpoint.

## Multi-Tenant API Rules

FlowOps is a multi-tenant application.

Every organization-owned resource must be accessed within the authenticated organization context.

The organization must never be trusted solely because the client supplied an organizationId.

Unsafe:

```json
{
  "organizationId": "org_other"
}
```

The server must determine the organization from the authenticated user's current membership.

Conceptually:

Session
|
v
User
|
v
Membership
|
v
Organization
|
v
Resource Query

### Tenant Isolation

Every query involving organization-owned data must apply the organization filter.

Conceptually:

SELECT \*
FROM incidents
WHERE id = ?
AND organization_id = ?;

The organization_id value comes from the authenticated request context.

It must not be trusted from the client request.

Resource Enumeration Protection

The API must not expose whether a resource belonging to another organization exists.

For example:

GET /api/incidents/inc_other_org

must not return information such as:

"This incident exists but belongs to another organization."

The API should respond as if the resource does not exist or is inaccessible.

API Versioning

The MVP does not introduce a version prefix such as:

/api/v1

The initial API is exposed under:

/api

If breaking API changes become necessary, API versioning may be introduced later.

## Authentication Endpoints

### Register

POST /api/auth/register

Creates a new user account.

Request:

```json
{
  "displayName": "Example User",
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:
201 Created

Example:

```json
{
  "user": {
    "id": "usr_123",
    "displayName": "Example User",
    "email": "user@example.com"
  }
}
```

Registration must not return the user's password or password hash.

### Login

POST /api/auth/login

Authenticates a user and creates a session.

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Successful Response:
200 OK

The response sets the session cookie.

Example response body:

```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com"
  }
}
```

Authentication failures use a generic error response.

### Logout

POST /api/auth/logout

Revokes the current session and clears the session cookie.

Successful Response
204 No Content

### Current User

The following endpoint may be implemented for the frontend to retrieve the current authenticated user:

GET /api/auth/me
Successful Response
200 OK

Example:

```json
{
  "user": {
    "id": "usr_123",
    "email": "user@example.com"
  },
  "organization": {
    "id": "org_123",
    "name": "Example Organization"
  },
  "role": "MEMBER"
}
```

If no valid session exists:

401 Unauthorized

## Organization Endpoints

Organization management is part of the multi-tenant application model.

The exact MVP scope depends on the final product requirements.

### Get Current Organization

GET /api/organization

Returns the organization associated with the current authenticated context.

Successful Response:

```json
{
  "id": "org_123",
  "name": "Example Organization"
}
```

### Update Organization

PATCH /api/organization

Updates organization information.

Request
{
"name": "Updated Organization Name"
}

Authorization is required.

Only roles with the appropriate organization management permission may perform this operation.

Create Organization
POST /api/organization

Creates an organization and creates an `ACTIVE` membership for the creating user.
The creating user receives the `OWNER` role.

Request
{
"name": "Example Organization"
}

### Join Organization

POST /api/organization/join

Creates an organization membership for the authenticated user.

The organizationId identifies the organization the user wants to join, but
does not by itself grant access.

The server must verify that the user is allowed to join the organization
according to the applicable organization membership rules.

The organizationId must never be used to bypass authorization or tenant
isolation.

## User Endpoints

User management is scoped to the authenticated organization.

### List Organization Users

GET /api/organization/users

Returns users belonging to the current organization.

Successful Response:

```json
{
  "items": [
    {
      "id": "usr_123",
      "email": "user@example.com",
      "role": "MEMBER",
      "membershipStatus": "ACTIVE"
    }
  ]
}
```

### Update Organization User Role

PATCH /api/organization/users/:userId/role

Updates the role of a user in the authenticated organization.

The role is stored on the user's organization membership.

Request:

```json
{
  "role": "ADMIN"
}
```

### Deactivate Organization User

PATCH /api/organization/users/:userId/status

Updates the membership status of a user in the authenticated organization.

The status is stored on the organization membership, not as a replacement for the user's account status.

Request:

```json
{
  "status": "DISABLED"
}
```

Allowed values are:

- `ACTIVE`
- `DISABLED`

When a membership is changed to `DISABLED`, access to the organization and its resources ends immediately.
Subsequent protected requests must reject that membership, even if the session is still valid.
The authorization flow must check membership status before evaluating the role or accessing a resource.

Reactivation is performed with:

```json
{
  "status": "ACTIVE"
}
```

## Service Endpoints

### List Services

GET /api/services

Returns services belonging to the authenticated organization.

### Create Service

POST /api/services

Creates a service within the authenticated organization.

Request:

```json
{
  "name": "Production API",
  "description": "Public production API"
}
```

### Get Service

GET /api/services/:id

Returns a service belonging to the authenticated organization.

### Update Service

PATCH /api/services/:id

Updates a service belonging to the authenticated organization.

Service deactivation is deferred and is not part of the initial MVP API.

## Incident Endpoints

Incidents are the primary operational resource in FlowOps.

### List Incidents

GET /api/incidents

Returns incidents visible to the authenticated user.

All returned incidents must belong to the authenticated organization.

Query Parameters

The MVP supports filtering where required by the product requirements.

Potential parameters include:

- `status`
- `severity`
- `search`
- `page`
- `limit`
- `sort`

Example:

```text
GET /api/incidents?status=OPEN&severity=SEV2
```

### List Response

Example:

```json
{
"items": [
{
"id": "inc_123",
"title": "Production API unavailable",
"status": "OPEN",
"severity": "SEV2",
"createdAt": "2026-08-25T10:00:00Z"
}
```

],
"pagination": {
"page": 1,
"limit": 20,
"total": 1
}
}

### Create Incident

POST /api/incidents

Creates a new incident within the authenticated organization.

Request:

```json
{
  "title": "Production API unavailable",
  "description": "The production API is returning HTTP 500 errors.",
  "severity": "SEV2"
}
```

Response:
201 Created

Example:

```json
{
  "id": "inc_123",
  "title": "Production API unavailable",
  "description": "The production API is returning HTTP 500 errors.",
  "status": "OPEN",
  "severity": "SEV2",
  "createdAt": "2026-08-25T10:00:00Z"
}
```

### Get Incident

GET /api/incidents/:id

Returns a single incident.

The incident must belong to the authenticated organization.

Example:

GET /api/incidents/inc_123
Response:

```json
{
  "id": "inc_123",
  "title": "Production API unavailable",
  "description": "The production API is returning HTTP 500 errors.",
  "status": "OPEN",
  "severity": "SEV2",
  "createdAt": "2026-08-25T10:00:00Z",
  "updatedAt": "2026-08-25T10:30:00Z"
}
```

### Update Incident

PATCH /api/incidents/:id

Updates an existing incident.

Only fields allowed by the current incident state and user's permissions may be changed.

Example:

```json
{
  "title": "Production API outage",
  "severity": "SEV1"
}
```

### Incident State Transitions

Incident status changes must be validated centrally.

Example states:

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

Invalid transitions must be rejected.

Example:

RESOLVED
|
X
v
INVESTIGATING

if the transition is not allowed by the defined state machine.

## Incident Events

GET /api/incidents/:id/events

Returns the timeline of an incident.

Events may represent:

- incident creation
- status changes
- severity changes
- comments
- assignments
- other relevant operational actions

The timeline is tenant-scoped and may contain a large number of events.

### Event Pagination

The incident timeline uses pagination to prevent very large event collections from being returned in a single response.

The following query parameters are supported:

| Parameter | Type    | Default | Maximum | Description               |
| --------- | ------- | ------- | ------- | ------------------------- |
| `page`    | integer | 1       | —       | Page number               |
| `limit`   | integer | 20      | 100     | Number of events per page |

Example:

````text
GET /api/incidents/inc_123/events?page=1&limit=20

The server must enforce the maximum page size.

A client must not be able to request an unlimited number of timeline events.

The events are returned in chronological order, with the newest events returned first.

Event List Response

Example:

{
  "items": [
    {
      "id": "evt_123",
      "type": "INCIDENT_CREATED",
      "createdAt": "2026-08-25T10:00:00Z",
      "actor": {
        "id": "usr_123",
        "email": "user@example.com"
      }
    },
    {
      "id": "evt_124",
      "type": "STATUS_CHANGED",
      "createdAt": "2026-08-25T10:15:00Z",
      "actor": {
        "id": "usr_456",
        "email": "admin@example.com"
      },
      "metadata": {
        "from": "OPEN",
        "to": "INVESTIGATING"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2
  }
}

The pagination object provides information required by the client to navigate through the timeline.

The total value represents the number of timeline events belonging to the incident and the authenticated organization.

Pagination must be applied server-side before the response is returned.

The query must remain tenant-scoped and must not allow access to events belonging to another organization.

Timeline Ordering

Timeline events are ordered by creation time.

The default ordering is:

createdAt DESC

The newest event is therefore returned first.

The ordering must be deterministic. If multiple events have the same timestamp, the event identifier should be used as a secondary ordering criterion.

Conceptually:

ORDER BY created_at DESC, id DESC
Timeline Access

Access to timeline events requires:

a valid authenticated session
an active organization membership
access to the requested incident
authorization for the incident resource

The API must not return timeline events for incidents belonging to another organization.

Large Timelines

The API must not load an entire incident timeline into memory when only one page is requested.

The database query should apply the requested pagination directly.

Conceptually:

page = 1
limit = 20

offset = (page - 1) * limit

The implementation should use database-level pagination.

For example:

LIMIT 20
OFFSET 0

for the first page.

Very large timelines therefore remain bounded by the requested page size.


### 2. Den allgemeinen Pagination-Abschnitt würde ich leicht präzisieren

In deinem bestehenden Abschnitt `## Pagination` kannst du diesen Satz:

```markdown
Collection endpoints should support pagination.

durch Folgendes ersetzen:

## Pagination

Collection endpoints that may return a large number of resources must support pagination.

The MVP uses page-based pagination with:

- `page`
- `limit`

Example:

```text
GET /api/incidents?page=1&limit=20

The server must enforce a maximum page size.

The client must not be able to request unlimited amounts of data.

Pagination must be applied at database/query level where possible.

The default page size is:

20

The maximum page size is:

100

The same pagination model is used for incident collections and incident timelines unless an endpoint explicitly defines a different strategy.

## Comments

### Create Comment

POST /api/incidents/:id/comments

Adds a comment to an incident.

Request:

```json
{
  "content": "The database connection pool has been identified as the likely cause."
}
````

Response:
201 Created

Example:

```json
{
  "id": "comment_123",
  "content": "The database connection pool has been identified as the likely cause.",
  "author": {
    "id": "usr_123",
    "email": "user@example.com"
  },
  "createdAt": "2026-08-25T10:30:00Z"
}
```

A comment must belong to an incident within the authenticated organization.

### List Comments

GET /api/incidents/:id/comments

Returns comments belonging to the incident and authenticated organization.

## Postmortems

### Create Postmortem

POST /api/incidents/:id/postmortem

Creates a postmortem for an incident.

Request:

```json
{
  "summary": "The outage was caused by an exhausted database connection pool.",
  "rootCause": "A connection leak caused the pool to reach its maximum size.",
  "impact": "API requests returned HTTP 500 errors for approximately 20 minutes.",
  "resolution": "The connection leak was fixed and the pool was restored.",
  "lessonsLearned": "Connection handling requires explicit lifecycle checks."
}
```

Response:
201 Created

The API field `lessonsLearned` maps to the database column `lessons_learned`.

### Get Postmortem

GET /api/incidents/:id/postmortem

Returns the postmortem belonging to the incident, if one exists.

### Update Postmortem

PATCH /api/incidents/:id/postmortem

Updates a postmortem while it is editable.

### Submit Postmortem for Review

POST /api/incidents/:id/postmortem/review

Moves a postmortem from DRAFT to REVIEW after validation.

### Publish Postmortem

POST /api/incidents/:id/postmortem/publish

Publishes a reviewed postmortem after the required checks succeed.

## Dashboard

GET /api/dashboard

Returns tenant-scoped dashboard data, including open, critical, and recently resolved incidents.

## Resource Relationships

The primary API relationships are:

Organization
|
+---- Users
|
+---- Incidents
|
+---- Events
|
+---- Comments
|
+---- Postmortem

All organization-owned resources must be tenant-scoped.

## Request Validation

All client-provided input must be validated before business logic is executed.

Validation applies to:

- request bodies
- query parameters
- route parameters
- filters
- pagination
- state transitions

Invalid input must return:

400 Bad Request

### Input Sanitization

Input must be treated as untrusted.

authorized
The API must not assume that client input is:

- valid
- complete
- correctly typed
- authorized
- safe

Validation and output handling must prevent injection and other input-based attacks.

### Route Parameters

Resource identifiers are provided through route parameters.

Example:

/api/incidents/:id

The identifier must be validated before database access.

### Query Parameters

Query parameters must be explicitly supported.

Unknown or invalid parameters should not silently change application behavior.

Example:

GET /api/incidents?status=OPEN

The API must validate that:

status

is an allowed filter.

## Pagination

Collection endpoints should support pagination.

The initial API uses:

page
limit

Example:

GET /api/incidents?page=1&limit=20

The server must enforce a maximum page size.

The client must not be able to request unlimited amounts of data.

### Default Page Size

The default page size is:

20

unless a different value is defined by the implementation.

### Maximum Page Size

The API should enforce a maximum page size.

Recommended MVP limit:

100

Requests exceeding the maximum must either be capped or rejected according to the final implementation.

## Sorting

Sorting must use an explicit allowlist.

Example:

GET /api/incidents?sort=createdAt

The API must not directly insert arbitrary client-provided values into SQL statements.

## Filtering

Filtering must be implemented through explicitly supported fields.

Example:

GET /api/incidents?status=OPEN&severity=SEV2

Filters must always include tenant isolation.

## Search

If text search is supported:

GET /api/incidents?search=database

The search implementation must use parameterized queries.

User-provided search values must never be concatenated directly into SQL.

## State Transitions

State transitions are treated as business operations rather than simple unrestricted field updates.

For example:

PATCH /api/incidents/:id

must not allow the client to transition an incident into an arbitrary state.

The server validates:

Current State +
Requested State +
User Permission
=
Allowed Transition

## Event Creation

Important state-changing operations must create timeline events.

Examples:

Incident Created
Status Changed
Severity Changed
Comment Added
Postmortem Created

This provides an auditable history of the incident.

## Idempotency

The MVP does not require a general idempotency-key mechanism.

However, operations that may be retried by clients or infrastructure must be reviewed for duplicate side effects.

A future API version may introduce:

Idempotency-Key

for selected operations.

## HTTP Methods

FlowOps follows these conventions:

Method Purpose
GET Retrieve resources
POST Create resources or execute creation operations
PATCH Partially update resources
DELETE Delete resources where supported

The MVP intentionally avoids unnecessary endpoint-specific verbs.

## Delete Operations

Deletion is not automatically available for every resource.

Operational records such as incidents and events may require retention rather than hard deletion.

The final deletion policy is defined by the product requirements and data model.

## Data Ownership

Each resource must have a clearly defined ownership model.

Example:

Incident
|
+-- organization_id

The API uses ownership information to enforce tenant isolation.

## Authorization

Authentication determines the identity of the user.

Authorization determines whether the user may perform an operation.

Example:

Authenticated User
|
v
Organization Membership
|
v
Role
|
v
Permission
|
v
API Operation

### Role-Based Authorization

The MVP uses role-based authorization.

The MVP uses the following organization membership roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

The final role definitions are specified by the product requirements.

Authorization rules must be implemented centrally where possible.

### Authorization Examples

Example:

GET /api/incidents

may be available to all authenticated organization members.

Whereas:

PATCH /api/organization

may require an organization administrator.

The API must enforce these rules server-side.

## API Security Principles

The API follows these principles:

- Never trust client-provided organization IDs.
- Never trust client-provided roles.
- Validate all input.
- Authenticate protected requests.
- Authorize every protected operation.
- Apply tenant filters to organization-owned resources.
- Use parameterized database queries.
- Avoid leaking sensitive information.
- Return consistent errors.
- Do not expose internal implementation details.

Detailed security requirements are defined in:

Security.md

## Database Access

API handlers must not construct SQL queries by concatenating user input.

Unsafe:

```ts
const query = `
  SELECT *
  FROM incidents
  WHERE title = '${title}'
`;
```

Safe:

```ts
const query = `
  SELECT *
  FROM incidents
  WHERE title = ?
`;
```

```ts
const result = await db.prepare(query).bind(title).all();
```

The exact database abstraction may differ in implementation, but parameterized queries are mandatory.

## Transactional Operations

Operations that modify multiple related records should use transactions where required.

Example:

```text
Create Incident
|
+---- Create Incident
|
+---- Create Incident Event
```

These operations should succeed or fail consistently.

## API Response Consistency

Responses should use consistent naming conventions.

The API uses camelCase for JSON fields.

Example:

```json
{
  "createdAt": "2026-08-25T10:00:00Z",
  "updatedAt": "2026-08-25T10:30:00Z"
}
```

Database naming may use snake_case independently.

Example:

```text
created_at
updated_at
```

The API layer is responsible for mapping between the two representations.

## Date and Time

All API timestamps use ISO 8601 format.

Example:

2026-08-25T10:30:00Z

The API stores timestamps consistently and returns them in UTC.

## IDs

Resources use opaque identifiers.

Examples:

```text
usr_123
org_123
inc_123
evt_123
comment_123
```

The exact ID generation strategy is defined in the data model.

IDs must not expose sensitive internal information.

## API Documentation

The API documentation should be kept synchronized with:

Data-Model.md
Security.md
MVP-Backlog-de.md
User-Stories/user-stories-de.md

When an endpoint changes, the corresponding documentation must be updated.

## MVP Endpoint Overview

| Area         | Method | Route                                    | Purpose                        | Auth |
| ------------ | ------ | ---------------------------------------- | ------------------------------ | :--: |
| Auth         | POST   | `/api/auth/register`                     | Create account                 |  No  |
| Auth         | POST   | `/api/auth/login`                        | Create session                 |  No  |
| Auth         | POST   | `/api/auth/logout`                       | Revoke session                 | Yes  |
| Auth         | GET    | `/api/auth/me`                           | Get current user               | Yes  |
| Organization | GET    | `/api/organization`                      | Get current organization       | Yes  |
| Organization | PATCH  | `/api/organization`                      | Update organization            | Yes  |
| Organization | POST   | `/api/organization`                      | Create organization            | Yes  |
| Organization | POST   | `/api/organization/join`                 | Join organization              | Yes  |
| Users        | GET    | `/api/organization/users`                | List organization users        | Yes  |
| Users        | PATCH  | `/api/organization/users/:userId/role`   | Update user role               | Yes  |
| Users        | PATCH  | `/api/organization/users/:userId/status` | Disable or activate membership | Yes  |
| Services     | GET    | `/api/services`                          | List services                  | Yes  |
| Services     | POST   | `/api/services`                          | Create service                 | Yes  |
| Services     | GET    | `/api/services/:id`                      | Get service                    | Yes  |
| Services     | PATCH  | `/api/services/:id`                      | Update service                 | Yes  |
| Incidents    | GET    | `/api/incidents`                         | List incidents                 | Yes  |
| Incidents    | POST   | `/api/incidents`                         | Create incident                | Yes  |
| Incidents    | GET    | `/api/incidents/:id`                     | Get incident                   | Yes  |
| Incidents    | PATCH  | `/api/incidents/:id`                     | Update incident                | Yes  |
| Events       | GET    | `/api/incidents/:id/events`              | Get incident timeline          | Yes  |
| Comments     | POST   | `/api/incidents/:id/comments`            | Add comment                    | Yes  |
| Comments     | GET    | `/api/incidents/:id/comments`            | List comments                  | Yes  |
| Postmortems  | POST   | `/api/incidents/:id/postmortem`          | Create postmortem              | Yes  |
| Postmortems  | GET    | `/api/incidents/:id/postmortem`          | Get postmortem                 | Yes  |
| Postmortems  | PATCH  | `/api/incidents/:id/postmortem`          | Update postmortem              | Yes  |
| Postmortems  | POST   | `/api/incidents/:id/postmortem/review`   | Submit postmortem for review   | Yes  |
| Postmortems  | POST   | `/api/incidents/:id/postmortem/publish`  | Publish postmortem             | Yes  |
| Dashboard    | GET    | `/api/dashboard`                         | Get dashboard data             | Yes  |

## MVP Endpoint Dependencies

The logical dependency structure is:

```text
Authentication
|
v
Organization Membership
|
+-------------------+
| |
v v
Organization Users
|
v
Incidents
|
+---------+---------+
| | |
v v v
Events Comments Postmortem
```

Authentication must therefore be implemented before protected incident functionality.

## Implementation Order

The recommended implementation order is:

1. API foundation
2. Error handling
3. Validation
4. Authentication
5. Session management
6. Organization context
7. Authorization
8. Incident CRUD
9. Incident state transitions
10. Incident events
11. Comments
12. Postmortems
13. Pagination and filtering
14. Security hardening
15. Integration tests

## Definition of API Completion

The API can be considered MVP-complete when:

- All MVP endpoints are implemented
- Authentication is implemented
- Session validation is implemented
- Authorization is implemented
- Tenant isolation is enforced
- Request validation is implemented
- Consistent error responses are implemented
- Incident state transitions are validated
- Incident events are generated
- Pagination is implemented where required
- Filtering is implemented where required
- Database queries are parameterized
- API integration tests exist
- Authentication tests exist
- Authorization tests exist
- Cross-tenant access tests exist
- API documentation matches the implementation
- Security review is completed

## Related Architecture Decisions

The API design is based on the following architectural decisions:

- `ADR-001-Technology-Stack.md`
- `ADR-002-Cloudflare-Architecture.md`
- `ADR-003-Database-D1.md`
- `ADR-004-Authentication-Strategy.md`
- `ADR-005-Multi-Tenant-Architecture.md`
- `ADR-006-Session-Management.md`

## Related Documentation

```text
03-Architektur/
├── Architecture.md
├── Data-Model.md
├── API.md
├── Security.md
└── ADR/
├── ADR-001-Technology-Stack.md
├── ADR-002-Cloudflare-Architecture.md
├── ADR-003-Database-D1.md
├── ADR-004-Authentication-Strategy.md
├── ADR-005-Multi-Tenant-Architecture.md
└── ADR-006-Session-Management.md
```

## Open Questions

The following API topics are intentionally left open until the implementation phase:

- Final role and permission matrix
- Exact pagination implementation
- Exact filtering requirements
- Exact sorting options
- Final ID generation strategy
- Whether `GET /api/auth/me` is required by the frontend
- Organization creation flow
- Organization switching if multi-organization users are introduced
- Deletion and retention policies
- Idempotency requirements
- API rate limiting implementation
- Final API integration test structure
- Whether API versioning will be required in the future

## Final API Model

The overall FlowOps API architecture can be summarized as:

```text
                         FlowOps API
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
        Authentication   Organization      Incidents
             |                |                |
             v                v                +--------+--------+
         Sessions           Users             |        |        |
                                               v        v        v
                                             Events  Comments Postmortem
```

Every protected request follows:

```text
HTTP Request
|
v
Session Authentication
|
v
User Resolution
|
v
Organization Membership
|
v
Authorization
|
v
Tenant-Scoped Resource Access
|
v
Business Logic
|
v
Consistent API Response
```

The API is intentionally kept small for the MVP.

The goal is not to expose every possible operation, but to provide a clear and secure API surface that supports the core FlowOps workflow.

```

```
