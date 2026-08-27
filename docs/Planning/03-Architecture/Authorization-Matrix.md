# FlowOps - Authorization Matrix

## Purpose

This document defines the authorization rules for FlowOps.

It specifies which actions are available to each organization role and which additional conditions must be fulfilled before an operation is allowed.

The authorization model is based on:

- authenticated user sessions
- organization membership
- membership status
- organization role
- resource ownership and organization scope where applicable
- business rules
- incident lifecycle rules

Authorization must always be enforced server-side.

The client interface must never be treated as an authorization mechanism.

---

## Authorization Principles

FlowOps follows these principles:

1. Authentication is required for all protected resources.
2. A valid session alone does not grant access to organization data.
3. The user must have an active membership in the target organization.
4. Authorization is evaluated against the user's membership in the target organization.
5. Every organization-owned resource must be scoped to its organization.
6. Client-provided organization identifiers must never be trusted without server-side membership validation.
7. Role checks are performed server-side.
8. Membership status is evaluated before role permissions.
9. Disabled memberships cannot access organization resources.
10. Business rules are evaluated in addition to role permissions.
11. Authorization failures must not expose information about resources in another organization.
12. The same authorization rules apply regardless of whether a request originates from the web application or another HTTP client.

---

# Roles

FlowOps uses three organization roles.

| Role     | Description                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| `OWNER`  | Full control over the organization and its members                                    |
| `ADMIN`  | Administrative control over the organization but cannot perform owner-only operations |
| `MEMBER` | Standard operational user with access to day-to-day incident management               |

There is no `VIEWER` role.

There is no `RESPONDER` role.

---

# Membership Status

Organization membership has one of the following states:

| Status     | Meaning                                                  |
| ---------- | -------------------------------------------------------- |
| `ACTIVE`   | User can access the organization according to their role |
| `DISABLED` | User cannot access organization resources                |

A disabled membership overrides role permissions.

For example:

```text
ACTIVE + ADMIN
    -> administrative access

DISABLED + ADMIN
    -> no organization access

A valid authentication session does not bypass a disabled membership.
```

## Authorization Evaluation Order

Protected organization requests should follow this logical order:

HTTP Request
|
v
Authenticate Session
|
v
Identify User
|
v
Resolve Target Organization
|
v
Load Organization Membership
|
v
Membership exists?
|
No -----> 403
|
Yes
|
v
Membership ACTIVE?
|
No -----> 403
|
Yes
|
v
Evaluate Role
|
v
Evaluate Resource Scope
|
v
Evaluate Business Rules
|
v
Allow Request

A request must not reach the business operation before these checks have succeeded.

## Permission Matrix

### Organization

| Action                      | OWNER | ADMIN | MEMBER |
| --------------------------- | :---: | :---: | :----: |
| View organization           |  Yes  |  Yes  |  Yes   |
| Update organization         |  Yes  |  Yes  |   No   |
| Delete organization         |  Yes  |  No   |   No   |
| View organization settings  |  Yes  |  Yes  |  Yes   |
| Manage organization members |  Yes  |  Yes  |   No   |
| Manage organization roles   |  Yes  |  Yes  |   No   |

#### Additional Rules

Only the OWNER may delete an organization.

An ADMIN may manage members but may not remove or replace the organization owner.

A MEMBER cannot modify organization settings.

### Membership Management

| Action                               | OWNER | ADMIN | MEMBER |
| ------------------------------------ | :---: | :---: | :----: |
| View members                         |  Yes  |  Yes  |  Yes   |
| Invite member                        |  Yes  |  Yes  |   No   |
| Join organization using valid invite |  Yes  |  Yes  |  Yes   |
| Disable member                       |  Yes  |  Yes  |   No   |
| Re-enable member                     |  Yes  |  Yes  |   No   |
| Change member role                   |  Yes  |  Yes  |   No   |
| Remove member                        |  Yes  |  Yes  |   No   |
| Modify owner role                    | No\*  |  No   |   No   |

- The owner role cannot be modified through the normal membership management API.

The owner cannot be demoted by an administrator.

An organization must always have exactly one active owner in the MVP.

### Role Management Rules

The following role transitions are permitted:

| Current Role | Requested Role | OWNER | ADMIN |
| ------------ | -------------- | :---: | :---: |
| MEMBER       | MEMBER         |  Yes  |  Yes  |
| MEMBER       | ADMIN          |  Yes  |  Yes  |
| ADMIN        | MEMBER         |  Yes  |  Yes  |
| ADMIN        | ADMIN          |  Yes  |  Yes  |
| OWNER        | ADMIN          |  No   |  No   |
| OWNER        | MEMBER         |  No   |  No   |

The owner role is protected from normal role modification.

If ownership transfer is introduced in a future version, it must be specified through a separate product and security decision.

## Services

Services represent operational systems or applications monitored by FlowOps.

| Action               |  OWNER   |  ADMIN   |  MEMBER  |
| -------------------- | :------: | :------: | :------: |
| View services        |   Yes    |   Yes    |   Yes    |
| Create service       |   Yes    |   Yes    |    No    |
| View service details |   Yes    |   Yes    |   Yes    |
| Update service       |   Yes    |   Yes    |    No    |
| Deactivate service   | Deferred | Deferred | Deferred |

Service operations are always restricted to the current organization.

A user must have an active membership in the service's organization.

## Incidents

Incidents are operational records belonging to an organization and, where applicable, a service.

| Action                 | OWNER | ADMIN | MEMBER |
| ---------------------- | :---: | :---: | :----: |
| View incidents         |  Yes  |  Yes  |  Yes   |
| Create incident        |  Yes  |  Yes  |  Yes   |
| Update incident        |  Yes  |  Yes  |  Yes   |
| Change severity        |  Yes  |  Yes  |  Yes   |
| Change status          |  Yes  |  Yes  |  Yes   |
| View incident timeline |  Yes  |  Yes  |  Yes   |
| Add comment            |  Yes  |  Yes  |  Yes   |
| Create postmortem      |  Yes  |  Yes  |  Yes   |
| Review postmortem      |  Yes  |  Yes  |   No   |
| Publish postmortem     |  Yes  |  Yes  |   No   |

All incident operations require:

- authenticated session
- active organization membership
- access to the incident's organization
- compliance with the incident lifecycle rules

### Incident Resource Ownership

Incidents are organization-scoped resources.

The incident creator does not automatically receive a separate authorization role.

Authorization is determined by the user's organization membership and role.

For example:

User A
|
+-- Organization A
|
+-- MEMBER
|
+-- Incident 123

User A may modify Incident 123 because they are an active member of Organization A.

A user belonging only to Organization B must not be able to access Incident 123.

### Incident Lifecycle Authorization

Role authorization alone is not sufficient to change an incident.

The requested state transition must also be valid according to the incident state machine.

Example:

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

A request is therefore allowed only when:

Authenticated
AND
Active Membership
AND
Required Role
AND
Valid Organization Scope
AND
Valid State Transition

An otherwise authorized user must still receive a validation/business-rule error when attempting an invalid transition.

## Comments

| Action         | OWNER | ADMIN | MEMBER |
| -------------- | :---: | :---: | :----: |
| View comments  |  Yes  |  Yes  |  Yes   |
| Create comment |  Yes  |  Yes  |  Yes   |

Comments are organization-scoped through their parent incident.

A comment cannot be created for an incident belonging to another organization.

The author of a comment is determined from the authenticated session.

The client must not be allowed to provide an arbitrary author identifier.

## Postmortems

| Action             | OWNER | ADMIN | MEMBER |
| ------------------ | :---: | :---: | :----: |
| View postmortem    |  Yes  |  Yes  |  Yes   |
| Create postmortem  |  Yes  |  Yes  |  Yes   |
| Update postmortem  |  Yes  |  Yes  |  Yes   |
| Review postmortem  |  Yes  |  Yes  |   No   |
| Publish postmortem |  Yes  |  Yes  |   No   |

### Postmortem Business Rules

A postmortem can only be created for an incident that has reached:

RESOLVED

A postmortem cannot be published before it has been reviewed.

Publishing additionally requires an authorized role.

The expected flow is:

Incident
|
v
RESOLVED
|
v
Postmortem created
|
v
Postmortem reviewed
|
v
Postmortem published

## Dashboard

The dashboard is organization-scoped.

| Action         | OWNER | ADMIN | MEMBER |
| -------------- | :---: | :---: | :----: |
| View dashboard |  Yes  |  Yes  |  Yes   |

Dashboard queries must only include data belonging to the user's active organization context.

The server must apply the organization filter.

The client must not be able to bypass tenant filtering by modifying query parameters.

## Authentication Endpoints

Authentication endpoints have different authorization requirements because they operate before an authenticated session exists.

| Endpoint                  | Authentication Required |
| ------------------------- | :---------------------: |
| `POST /api/auth/register` |           No            |
| `POST /api/auth/login`    |           No            |
| `POST /api/auth/logout`   |           Yes           |

Registration and login must perform their own validation and security checks.

Logout must only invalidate the session belonging to the authenticated request.

## Organization Endpoints

| Endpoint                                       | OWNER | ADMIN | MEMBER |
| ---------------------------------------------- | :---: | :---: | :----: |
| `POST /api/organization`                       |  N/A  |  N/A  |  N/A   |
| `POST /api/organization/join`                  |  N/A  |  N/A  |  N/A   |
| `PATCH /api/organization/users/:userId/role`   |  Yes  |  Yes  |   No   |
| `PATCH /api/organization/users/:userId/status` |  Yes  |  Yes  |   No   |

Creating or joining an organization is handled as an account/membership operation rather than a normal organization resource operation.

The resulting membership must be validated and persisted server-side.

## API Authorization Matrix

| Method | Route                | Required Role |
| ------ | -------------------- | ------------- |
| POST   | `/api/auth/register` | Public        |
| POST   | `/api/auth/login`    | Public        |
| POST   | `/api/auth/logout`   | Authenticated |

| Method | Route                                    | OWNER | ADMIN | MEMBER |
| ------ | ---------------------------------------- | :---: | :---: | :----: |
| POST   | `/api/organization`                      |  N/A  |  N/A  |  N/A   |
| POST   | `/api/organization/join`                 |  N/A  |  N/A  |  N/A   |
| PATCH  | `/api/organization/users/:userId/role`   |  Yes  |  Yes  |   No   |
| PATCH  | `/api/organization/users/:userId/status` |  Yes  |  Yes  |   No   |
| GET    | `/api/services`                          |  Yes  |  Yes  |  Yes   |
| POST   | `/api/services`                          |  Yes  |  Yes  |   No   |
| GET    | `/api/services/:id`                      |  Yes  |  Yes  |  Yes   |
| PATCH  | `/api/services/:id`                      |  Yes  |  Yes  |   No   |
| GET    | `/api/incidents`                         |  Yes  |  Yes  |  Yes   |
| POST   | `/api/incidents`                         |  Yes  |  Yes  |  Yes   |
| GET    | `/api/incidents/:id`                     |  Yes  |  Yes  |  Yes   |
| PATCH  | `/api/incidents/:id`                     |  Yes  |  Yes  |  Yes   |
| GET    | `/api/incidents/:id/events`              |  Yes  |  Yes  |  Yes   |
| GET    | `/api/incidents/:id/comments`            |  Yes  |  Yes  |  Yes   |
| POST   | `/api/incidents/:id/comments`            |  Yes  |  Yes  |  Yes   |
| POST   | `/api/incidents/:id/postmortem`          |  Yes  |  Yes  |  Yes   |
| GET    | `/api/incidents/:id/postmortem`          |  Yes  |  Yes  |  Yes   |
| PATCH  | `/api/incidents/:id/postmortem`          |  Yes  |  Yes  |  Yes   |
| POST   | `/api/incidents/:id/postmortem/review`   |  Yes  |  Yes  |   No   |
| POST   | `/api/incidents/:id/postmortem/publish`  |  Yes  |  Yes  |   No   |
| GET    | `/api/dashboard`                         |  Yes  |  Yes  |  Yes   |

## Tenant Isolation

Authorization and tenant isolation are separate but related concerns.

A user may be authenticated and have a valid role while still being unauthorized to access a particular resource.

Example:

User
|
+-- Organization A
| |
| +-- ADMIN
|
+-- Organization B
|
+-- MEMBER

The same user may access resources from both organizations according to the role associated with each membership.

The API must therefore determine the user's membership for the target organization before evaluating the requested operation.

### Cross-Organization Access

The following must always be rejected:

User belongs to Organization A
|
X
|
Resource belongs to Organization B

This applies to:

dashboard data
detail endpoints

- organization details
- members
- services
- incidents
- incident events
- comments
- postmortems
- dashboard data
- search results
- filters
- detail endpoints

Cross-organization access must not be possible by changing:

- URL parameters
- query parameters
- request body fields
- resource IDs
- organization IDs

## Authorization and HTTP Responses

The API should distinguish authentication failures from authorization failures.

401 Unauthorized

Use when the request does not have a valid authenticated session.

Examples:

- missing session
- invalid session
- expired session

Example:

{
"error": {
"code": "UNAUTHENTICATED",
"message": "Authentication is required."
}
}
403 Forbidden

Use when the user is authenticated but does not have permission to perform the requested operation.

disabled membership
Examples:

- insufficient role
- disabled membership
- missing organization membership

Example:

{
"error": {
"code": "FORBIDDEN",
"message": "You do not have permission to perform this action."
}
}

The API should avoid exposing unnecessary information about resources that the user is not authorized to access.

## Server-Side Enforcement

Authorization checks must be implemented on the server.

disabling form controls
The following client-side mechanisms are not sufficient:

- hiding buttons
- disabling form controls
- removing navigation links
- checking roles only in React components
- trusting organization IDs from the client

For example, this is insufficient:

if (user.role === "ADMIN") {
showAdminButton();
}

The corresponding API operation must still verify the role.

The correct model is:

Client
|
v
HTTP Request
|
v
Authentication
|
v
Membership
|
v
Role Authorization
|
v
Business Rules
|
v
Operation

## Authorization Middleware / Application Boundary

Authorization should be implemented through reusable server-side application logic.

The exact implementation may use middleware, helper functions, or application services.

The important requirement is that authorization logic is centralized enough to avoid inconsistent checks across individual endpoints.

Conceptually:

requireAuthentication()
|
v
requireOrganizationMembership()
|
v
requireActiveMembership()
|
v
requireRole(...)
|
v
executeBusinessOperation()

Individual business operations should not rely on the frontend to provide authorization context.

## Audit and Security Events

Security-sensitive authorization operations should generate appropriate audit events where defined by the application.

Examples include:

- member role changes
- membership disabling
- membership re-enabling
- organization administration changes
- postmortem publication

authentication secrets
Audit events must not contain:

- passwords
- session identifiers
- authentication secrets
- sensitive credentials

## Testing Requirements

Every authorization rule must have automated test coverage where practical.

disabled member cannot access organization resources
At minimum, tests must cover:

- Authentication: unauthenticated request is rejected
- Authentication: invalid session is rejected
- Authentication: valid session is accepted
- Membership: active member can access organization resources
- Membership: disabled member cannot access organization resources
- Membership: non-member cannot access organization resources
- Roles: OWNER can perform owner operations
- Roles: ADMIN can perform administrator operations
- Roles: MEMBER can perform member operations
- Roles: MEMBER cannot perform administrator operations
- Roles: ADMIN cannot perform owner-only operations
- Tenant isolation: Organization A cannot access Organization B resources
- Tenant isolation: Organization A cannot modify Organization B resources
- Tenant isolation: Organization A cannot retrieve Organization B search results
- Tenant isolation: Organization A cannot access Organization B dashboard data
- Business rules: invalid incident transitions are rejected
- Business rules: postmortem cannot be created before RESOLVED
- Business rules: postmortem cannot be published before review

## Security Invariants

The following invariants must always hold:

Invariant 1

A user without a valid session cannot access protected resources.

Invariant 2

A user without an active membership cannot access organization resources.

Invariant 3

A user cannot access resources belonging to an organization in which they have no membership.

Invariant 4

A MEMBER cannot perform ADMIN or OWNER operations.

Invariant 5

An ADMIN cannot perform OWNER-only operations.

Invariant 6

The OWNER role cannot be modified through normal role-management operations.

Invariant 7

Client-provided organization identifiers cannot bypass tenant isolation.

Invariant 8

Authorization must be enforced server-side.

Invariant 9

Business rules cannot be bypassed by having a sufficiently privileged role.

Invariant 10

A disabled membership cannot regain access merely because its session remains valid.

## Relationship to Other Documents

This document is derived from and must remain consistent with:

- `Architecture.md`
- `Data-Model.md`
- `API.md`
- `Security.md`
- `ADR-004-Authentication-Strategy.md`
- `ADR-005-Multi-Tenant-Architecture.md`
- `ADR-006-Session-Management.md`
- `ADR-007-Multi-Organization-Membership.md`
- `MVP-Backlog-de.md`
- `Testing-Matrix.md`

If an authorization requirement changes, the affected requirements, user stories, API definitions, security documentation, tests, and architectural decisions must be reviewed.

## Future Considerations

temporary elevated privileges
The following authorization features are outside the initial MVP unless explicitly added to the backlog:

- custom roles
- resource-level permissions
- service-specific roles
- incident-specific roles
- permission groups
- temporary elevated privileges
- approval workflows for administrative operations
- ownership transfer workflows
- fine-grained access control policies

These features should not be implemented implicitly.

If required later, they should be introduced through explicit requirements and architectural decisions.

## Summary

FlowOps uses a role-based authorization model combined with organization membership and tenant isolation.

The MVP roles are:

- `OWNER`
- `ADMIN`
- `MEMBER`

The fundamental authorization model is:

```text
Authenticated User
        |
        v
Organization Membership
        |
        v
ACTIVE Membership
        |
        v
Role
        |
        v
Resource Organization
        |
        v
Business Rules
        |
        v
Permission Granted
```

Authorization is always enforced server-side.

Tenant isolation is mandatory for all organization-owned resources.

The authorization matrix serves as the reference for:

- API authorization
- application-level permission checks
- security testing
- integration tests
- end-to-end tests
- future implementation decisions
