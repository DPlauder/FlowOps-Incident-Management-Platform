# FlowOps – Security

> This document defines the security goals, threat model, protection mechanisms, and testing strategy for the FlowOps MVP.

## 1. Overview

Security is a core architectural requirement of FlowOps.

FlowOps stores operational information about organizations, users, services, incidents, comments, audit events, and postmortems.

The security architecture therefore focuses on protecting:

- User accounts
- Authentication sessions
- Organization data
- Incident data
- Incident history
- Comments
- Postmortems
- Authorization boundaries

The most important security principle is:

> The backend is the security boundary.

The frontend may improve the user experience by hiding unavailable actions, but all security decisions must be enforced server-side.

## 2. Security Goals

The MVP follows the following security goals:

1. Only authenticated users can access protected resources.
2. Users can only access organizations they belong to.
3. Users can only perform actions allowed by their role.
4. Organization data must be isolated from other organizations.
5. Passwords must never be stored in plain text.
6. Sessions must be protected against common attacks.
7. Client input must never be trusted.
8. Sensitive information must not be exposed through API responses or logs.
9. Important operational changes must be traceable.
10. Security-related behavior must be covered by automated tests.

---

## 3. Threat Model

The initial MVP considers the following threat categories.

### 3.1 Unauthenticated Access

An attacker attempts to access protected API endpoints without a valid session.

Example:

```text
GET /api/incidents
```

**Expected result:** `401 Unauthorized`

### 3.2 Broken Authorization

An authenticated user attempts to access a resource they are not allowed to access.

Examples:

- A MEMBER attempts an ADMIN operation.
- A user attempts to access another organization's incident.
- A user attempts to modify a resource they do not have permission to modify.

**Expected result:** `403 Forbidden` or an appropriate access-denied response.

### 3.3 Cross-Tenant Data Access

A user attempts to access data belonging to another organization.

Example:

```text
User belongs to Organization A
Incident belongs to Organization B

User requests:
GET /api/incidents/{incident-from-organization-b}
```

The request must not expose the incident.

Tenant isolation is enforced server-side.

### 3.4 Credential Attacks

Potential attacks include:

- Brute-force login attempts
- Credential stuffing
- Password guessing
- Account enumeration

The MVP protects authentication endpoints with appropriate rate limiting or a documented MVP limitation.

### 3.5 Session Attacks

Potential attacks include:

- Session theft
- Session fixation
- Session reuse after logout
- Access using expired sessions

Session handling must therefore be designed carefully.

### 3.6 Malicious Input

Users may submit intentionally malformed or malicious input.

Examples include:

- Invalid IDs
- Unexpected data types
- Excessively long strings
- Invalid enum values
- Malicious text
- Unexpected JSON structures

All input must be validated server-side.

### 3.7 Injection Attacks

The application must prevent SQL injection and similar injection vulnerabilities.

Database queries must use parameterized statements.

User-controlled values must never be concatenated directly into SQL statements.

### 3.8 Information Disclosure

The application must not expose internal implementation details.

Examples include:

- Stack traces
- SQL errors
- File paths
- Environment variables
- Secrets
- Password hashes
- Session identifiers

## 4. Authentication

FlowOps uses session-based authentication.

The authentication flow is:

```text
User
 │
 │ Email + Password
 ▼
POST /api/auth/login
 │
 ▼
Validate Input
 │
 ▼
Find User
 │
 ▼
Verify Password
 │
 ▼
Create Session
 │
 ▼
Set Secure Cookie
 │
 ▼
Authenticated User
```

Authentication details must be handled by the backend.

The frontend must never receive or store the user's password.

## 5. Password Security

Passwords must never be stored in plain text.

Only a secure password hash is stored in the database.

The application must use a modern password hashing algorithm suitable for password storage.

The exact implementation will be decided before authentication is implemented.

Passwords must never appear in:

- API responses
- logs
- error messages
- database records in plain text
- client-side application state

## 6. Session Security

Authentication sessions are stored server-side.

The browser receives a session cookie.

The cookie must use appropriate security attributes.

Required attributes:

| Attribute  | Purpose                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| `HttpOnly` | Prevents client-side JavaScript from directly accessing the session cookie. |
| `Secure`   | Ensures the cookie is only transmitted over HTTPS.                          |
| `SameSite` | Helps protect against cross-site request forgery.                           |

The exact SameSite configuration will be selected based on the deployment architecture.

## 7. Session Lifecycle

A session follows this lifecycle:

```text
Login
  │
  ▼
Session Created
  │
  ▼
Session Active
  │
  ├── Request
  │
  ├── Request
  │
  └── Request
  │
  ▼
Logout / Expiration
  │
  ▼
Session Invalidated
```

Sessions must become invalid when:

- The user logs out.
- The session expires.
- The account is deactivated.
- The session is explicitly revoked.

## 8. Authentication Failure

Authentication failures should not expose unnecessary information.

For example, the application should avoid revealing whether an email address exists in the system.

A login failure should return a generic authentication error.

Example:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The provided credentials are invalid."
  }
}
```

## 9. Authorization

Authentication answers:

Who is the user?

Authorization answers:

What is this user allowed to do?

Authentication and authorization are separate concerns:

```text
Authenticated != Authorized
```

A user may have a valid session and still be unauthorized to access a specific organization or resource.

FlowOps performs authorization after authentication.

The authorization flow is:

```text
Request
  ↓
Session
  ↓
Authenticated User
  ↓
Active Organization
  ↓
Membership
  ↓
Membership Status
  ├── DISABLED → Access denied
  └── ACTIVE
      ↓
Role
  ↓
Resource Authorization
  ↓
Allow / Deny
```

The authorization checks must be evaluated in this order:

1. Validate the session.
2. Resolve the authenticated user.
3. Resolve the active organization context.
4. Resolve the user's membership in that organization.
5. Reject the request when the membership is `DISABLED` or missing.
6. Resolve the current membership role.
7. Check authorization for the requested resource and operation.

`Membership = DISABLED` must prevent access, even when the session itself is valid.

## 10. Roles

The MVP defines the following organization roles:

### OWNER

The owner has full control over the organization.

Possible permissions include:

- Manage organization
- Manage members
- Manage roles
- Manage services
- Manage incidents
- Manage postmortems

### ADMIN

Administrators can manage operational resources.

Possible permissions include:

- Manage services
- Create incidents
- Update incidents
- Assign incidents
- Manage comments
- Create postmortems

Organization ownership and membership management may be restricted depending on the final authorization matrix.

### MEMBER

Members can participate in incident management.

Possible permissions include:

- View incidents
- Create incidents
- Add comments
- Update incidents within permitted operations
- View postmortems

## 11. Authorization Matrix

The exact permissions are maintained as an explicit matrix.

Initial MVP proposal:

| Action              | OWNER | ADMIN | MEMBER |
| ------------------- | :---: | :---: | :----: |
| View incidents      |   ✓   |   ✓   |   ✓    |
| Create incident     |   ✓   |   ✓   |   ✓    |
| Update incident     |   ✓   |   ✓   |   ✓    |
| Change severity     |   ✓   |   ✓   |   ✓    |
| Change status       |   ✓   |   ✓   |   ✓    |
| Assign incident     |   ✓   |   ✓   |   ✓    |
| Add comment         |   ✓   |   ✓   |   ✓    |
| Create postmortem   |   ✓   |   ✓   |   ✓    |
| Publish postmortem  |   ✓   |   ✓   |   -    |
| Manage services     |   ✓   |   ✓   |   -    |
| Manage members      |   ✓   |   ✓   |   -    |
| Manage organization |   ✓   |   -   |   -    |

This matrix must be validated against the final MVP requirements before implementation.

## 12. Tenant Isolation

FlowOps is a multi-tenant application.

An organization represents the primary security boundary.

The active organization is resolved through the authenticated user's membership.
Membership status must be checked before any organization-owned resource is accessed.

The membership model uses the following statuses:

- `ACTIVE`: access is evaluated according to the membership role.
- `DISABLED`: access to the organization and its resources is denied.

Organization-owned resources contain an organization_id.

Examples:

- services
- incidents
- incident_events
- comments
- postmortems

The organization context must come from the authenticated session and the user's active membership.

It must never be trusted solely from client-provided data.

An authenticated session alone does not authorize access to an organization.

## 13. Cross-Tenant Access Protection

Every resource lookup must enforce organization ownership.

**Unsafe:**

```sql
SELECT *
FROM incidents
WHERE id = ?;
```

**Safer:**

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

The organization ID must be derived from the authenticated user context.

The same principle applies to:

- Services
- Incidents
- Comments
- Events
- Postmortems

## 14. Cross-Tenant Relationship Validation

It is not sufficient to validate only the organization of the primary resource.

Related resources must also belong to the same organization.

Example:

```text
Incident
    │
    ├── organization_id = Organization A
    │
    └── service_id = Service B
                         │
                         └── organization_id = Organization B
```

This relationship must be rejected.

The application must verify:

```text
Incident.organization_id
==
Service.organization_id
```

The same rule applies when assigning users to incidents.

## 15. Resource Enumeration Protection

The API must avoid exposing information about resources belonging to other organizations.

For example, `GET /api/incidents/{id}`

must not allow a user to determine whether an incident exists in another organization.

Resource access checks must therefore be performed together with organization filtering.

## 16. Input Validation

All input received from the client is considered untrusted.

Validation occurs on the server.

The API validates:

- Required fields
- Data types
- String lengths
- Enum values
- IDs
- Relationships
- State transitions
- Request body structure

Invalid requests return `400 Bad Request`.

## 17. SQL Injection Protection

All database queries must use parameterized statements.

**Unsafe:**

```sql
SELECT * FROM users WHERE email = '${email}'
```

**Safe:**

```sql
SELECT * FROM users WHERE email = ?
```

User-controlled input must never be directly concatenated into SQL statements.

## 18. XSS Protection

User-generated content exists in several areas of FlowOps.

Examples:

- Comments
- Incident descriptions
- Postmortems

User-generated content must be treated as untrusted.

The application must ensure that user content cannot execute arbitrary JavaScript in another user's browser.

The frontend must use safe rendering mechanisms and must not render untrusted HTML without explicit sanitization.

## 19. CSRF Protection

Because authentication uses cookies, cross-site request forgery must be considered.

The initial protection strategy includes:

- Secure cookies
- Appropriate SameSite configuration
- Origin checks where appropriate
- Avoiding state-changing operations through GET requests

The final CSRF strategy will be documented before authentication is implemented.

## 20. Rate Limiting

Authentication endpoints are especially sensitive to automated attacks.

### 20.1 Functional MVP Rules

The following rate limits are functional security requirements for the MVP:

| Endpoint                  | Limit                                    | Purpose                                             |
| ------------------------- | ---------------------------------------- | --------------------------------------------------- |
| `POST /api/auth/register` | 5 requests per IP per 15 minutes         | Reduce automated account creation.                  |
| `POST /api/auth/login`    | 10 failed attempts per IP per 15 minutes | Reduce brute-force and credential-stuffing attacks. |

Password reset is outside the MVP. If it is introduced later, the initial rule is 5 requests per IP per 15 minutes.

These limits are security requirements, not a prescription for a specific infrastructure implementation.

The rules protect against:

- brute-force attacks
- credential stuffing
- automated account creation

### 20.2 Technical Implementation

The concrete implementation will be decided during development for the Hono API running on Cloudflare Workers.
The implementation must enforce the functional rules above and must define the rate-limit key, storage mechanism, response headers, and behavior when the limit is exceeded.

The API must return `429 Too Many Requests` when a request is rejected because the applicable limit has been exceeded.

## 21. API Security

All protected API routes must perform authentication and authorization checks.

Example: `GET /api/incidents`

Requires:

- Valid session
- Active user
- Organization membership

Example: `PATCH /api/incidents/:id`

Requires:

- Valid session
- Active user
- Organization membership
- Required role
- Incident belongs to the user's organization
- Requested state transition is valid

## 22. State Transition Security

Incident state changes are treated as business operations.

The client must not be allowed to arbitrarily modify the status field.

For example, the API should not blindly accept:

```json
{
  "status": "CLOSED"
}
```

Instead, the application validates whether the transition is allowed.

Example:

```text
OPEN -> INVESTIGATING -> MITIGATED -> RESOLVED -> CLOSED
```

Invalid transitions are rejected.

Every valid transition generates an incident event.

## 23. Audit Trail

Security-relevant and operationally relevant actions should be traceable.

Examples include:

- Incident creation
- Status changes
- Severity changes
- Assignment changes
- Comments
- Postmortem creation
- Postmortem publication

Each event stores:

- Actor
- Incident
- Event type
- Timestamp
- Relevant event data

Events are append-only.

## 24. Sensitive Data Handling

The application must identify and protect sensitive information.

Sensitive information includes:

- Passwords
- Password hashes
- Session identifiers
- Secrets
- API keys
- Environment variables

Sensitive information must not be exposed through:

- API responses
- logs
- error messages
- frontend state
- source control

## 25. Logging

Logging is required for debugging and operational visibility.

However, logs must not contain sensitive information.

The application must never log:

- `password`
- `password_hash`
- `session_id`
- `authentication_token`
- `secret`
- `api_key`

Security-relevant events may be logged without exposing sensitive values.

## 26. Error Handling

Unexpected errors must not expose internal implementation details.

Production responses must not contain:

- Stack traces
- SQL errors
- File paths
- Environment variables
- Internal database information

Unexpected errors return `500 Internal Server Error` with a generic error response.

Detailed information may be logged server-side where appropriate.

## 27. Secrets Management

Secrets must never be committed to Git.

Examples:

- `DATABASE_PASSWORD`
- `API_KEY`
- `SESSION_SECRET`
- `PRIVATE_KEY`

Environment-specific secrets must be provided through the deployment environment.

The repository may contain example configuration files such as `.env.example`, but must never contain real credentials.

## 28. Environment Separation

The project distinguishes between:

- Development
- Test
- Production

Production credentials and data must never be used for local development or automated tests.

## 29. Dependency Security

Project dependencies should be reviewed regularly.

The project should use:

- Lock files
- Automated dependency checks
- Dependabot or equivalent tooling where appropriate
- Minimal dependencies

Dependencies should only be added when they provide clear value.

## 30. Security Headers

The production application should use appropriate HTTP security headers.

Potential headers include:

- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security`

The exact configuration will be finalized during deployment.

## 31. Transport Security

All production communication must use HTTPS.

Sensitive information must never be transmitted over unencrypted HTTP.

The application should redirect HTTP traffic to HTTPS where the infrastructure supports it.

## 32. Account Security

Users can have an active/inactive account state.

Deactivated users must not be able to authenticate or access protected resources.

Existing sessions belonging to a deactivated user should be invalidated.

## 33. Session Expiration

The MVP defines the following session expiration policy:

- Maximum session lifetime: **30 days** from `created_at`
- Idle expiration: **7 days** from `last_used_at`
- Logout: immediate server-side revocation
- Password change: revoke all active sessions for the user

Each successful authenticated request updates `last_used_at`.

The session is invalid when its maximum lifetime or idle expiration is exceeded.

The application must reject expired sessions.

Expired sessions should be removed or invalidated during normal session cleanup.

## 34. Data Retention

Operational data should not be deleted simply because an incident has been closed.

Incident history provides value for:

- debugging
- postmortems
- historical analysis
- learning
- auditing

The MVP therefore favors retaining historical incident data.

A formal retention policy may be introduced later.

## 35. Security Testing

Security requirements must be tested automatically where practical.

### Authentication Tests

Examples:

- Unauthenticated request → `401`
- Invalid credentials → authentication failure
- Expired session → `401`
- Deactivated user → `401`
- Logout → session invalidated

### Authorization Tests

Examples:

- Insufficient role → `403`
- Non-member → access denied
- Cross-organization resource → access denied

### Validation Tests

Examples:

- Invalid input → `400`
- Invalid enum → `400`
- Invalid ID → `400`
- Missing required field → `400`

### Tenant Isolation Tests

Examples:

```text
Organization A user
  ↓
Organization B incident
  ↓
Access denied
```

### State Transition Tests

Examples:

- `OPEN → INVESTIGATING` → allowed
- `OPEN → CLOSED` → rejected

## 36. Security Testing Matrix

| Security area    | Test                                   |
| ---------------- | -------------------------------------- |
| Authentication   | Unauthenticated request                |
| Authentication   | Invalid credentials                    |
| Authentication   | Expired session                        |
| Authentication   | Deactivated account                    |
| Authorization    | Invalid role                           |
| Authorization    | Missing membership                     |
| Tenant Isolation | Cross-organization incident            |
| Tenant Isolation | Cross-organization service             |
| Tenant Isolation | Cross-organization user assignment     |
| Validation       | Invalid request body                   |
| Validation       | Invalid enum                           |
| Injection        | Parameterized SQL queries              |
| XSS              | Malicious comment content              |
| CSRF             | Unauthorized state-changing request    |
| Session          | Logout invalidation                    |
| Session          | Session expiration                     |
| State Machine    | Invalid status transition              |
| Error Handling   | Internal error does not expose details |

## 37. Security Principles

The implementation follows these principles.

### Principle 1 – Never Trust the Client

All security-sensitive information must be verified server-side.

### Principle 2 – Least Privilege

Users should only receive the permissions required for their role.

### Principle 3 – Defense in Depth

Security should not depend on a single protection mechanism.

Example:

```text
Authentication
      +
Authorization
      +
Tenant Isolation
      +
Input Validation
      +
Database Constraints
```

### Principle 4 – Secure by Default

New endpoints and resources should require explicit authorization.

### Principle 5 – Fail Securely

When security checks fail, access must be denied.

### Principle 6 – Minimize Sensitive Data

Only required sensitive information should be stored.

### Principle 7 – Make Security Testable

Security rules should be represented by automated tests whenever practical.

## 38. Security Responsibilities by Layer

| Layer             | Responsibility                            |
| ----------------- | ----------------------------------------- |
| Frontend          | UX-level permission handling              |
| API               | Authentication, authorization, validation |
| Application Layer | Business rules and state transitions      |
| Data Layer        | Parameterized queries and data access     |
| Database          | Constraints and relationships             |
| Infrastructure    | HTTPS, secrets, deployment security       |

Security is therefore not implemented in one single component.

## 39. Known Risks

The following security risks require additional attention during implementation:

- Brute-force login attempts
- Credential stuffing
- Session theft
- CSRF
- XSS through user-generated content
- Cross-tenant data access
- SQL injection
- Incorrect authorization checks
- Sensitive information in logs
- Misconfigured production environment

These risks are tracked in the project risk documentation.

## 40. Open Security Decisions

The following decisions must be finalized before authentication is implemented:

- Password hashing algorithm
- Session identifier format
- Session cleanup strategy
- SameSite cookie configuration
- CSRF protection strategy
- Technical rate limiting implementation
- Validation library
- XSS handling strategy
- Security header configuration
- Secret management strategy

These decisions should be documented as Architecture Decision Records where appropriate.

## 41. Security Status

**Status:** Draft

### Completed

- Security goals defined
- Initial threat model defined
- Authentication requirements defined
- Authorization model defined
- Tenant isolation strategy defined
- Session security requirements defined
- Input validation requirements defined
- Security testing strategy defined
- Final authorization matrix
- Technical rate limiting implementation

### Open

- Authentication implementation
- Session implementation
- Password hashing decision
- CSRF implementation
- Security headers

### Next Steps

1. Finalize security-related architecture decisions.
2. Create ADRs for significant security decisions.
3. Validate the security model against the API and database schema.
4. Add security requirements to the implementation backlog.
5. Implement authentication and authorization.
6. Add automated security tests.

## Rate Limiting

The MVP applies rate limiting to authentication endpoints to reduce
brute-force attacks and abuse.

The following limits apply:

| Endpoint                  |       Limit |            Window |
| ------------------------- | ----------: | ----------------: |
| `POST /api/auth/register` |  5 requests | 15 minutes per IP |
| `POST /api/auth/login`    | 10 requests | 15 minutes per IP |

Requests exceeding the configured limit are rejected with
`429 Too Many Requests`.

The limits apply server-side and must not depend on frontend behavior.

## Production Error Logging

FlowOps uses server-side structured error logging for production
diagnostics.

Production logs must not contain:

- Passwords
- Session identifiers
- Session cookies
- Authentication tokens
- API keys
- Secrets
- Complete request bodies containing user credentials or other sensitive data

Logged errors should contain enough context to diagnose problems without
exposing sensitive information.

The minimum context for an application error is:

- Timestamp
- Log level
- Request ID
- HTTP method
- Route
- HTTP status
- Error type or internal error code

Unexpected server-side errors are logged as errors.

Client responses must not expose internal stack traces, database errors,
or other implementation details.

Clients receive a generic error response for unexpected server errors.

A request or correlation ID should be returned to the client where
appropriate so that a production error can be correlated with the
corresponding server-side log entry.

For the MVP, no external logging or monitoring service is required.
Logging must remain compatible with the Cloudflare Workers runtime.
