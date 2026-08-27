# ADR-006 – Session Management

## Status

Accepted

## Date

2026-08

## Decision

FlowOps uses server-side sessions with cryptographically secure, randomly generated session IDs.

The session ID is transmitted to the browser exclusively through a secure HTTP cookie.

The actual session data is stored server-side in Cloudflare D1.

The browser only stores the session identifier. Sensitive authentication and authorization data is not stored in the client.

The general authentication flow is:

```text
Browser
   │
   │ HttpOnly Cookie
   ▼
Session ID
   │
   ▼
FlowOps API
   │
   ▼
Session Store
   │
   ├── user_id
   ├── organization_id
   ├── created_at
   ├── expires_at
   └── revoked_at
```

## Context

FlowOps requires authenticated access to protected functionality.

Users must be able to:

- register an account
- log in
- remain authenticated between requests
- log out
- have their sessions expire
- have sessions revoked when necessary

Session management must also integrate with the multi-tenant architecture defined in ADR-005-Multi-Tenant-Architecture.md.

An authenticated request must be associated with a specific user and their current organization membership.

The session therefore acts as the authentication link between the HTTP request and the authenticated user.

HTTP Request
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
Role
│
▼
Authorization

## Goals

The session management system must:

- provide secure authentication
- support server-side session control
- support logout
- support session revocation
- support session expiration
- prevent session fixation
- prevent session ID guessing
- avoid exposing session credentials to client-side JavaScript
- integrate with Cloudflare Workers
- integrate with Cloudflare D1
- support the multi-tenant architecture
- require minimal additional infrastructure
- be straightforward to test

## Non-Goals

The MVP does not implement:

- social login
- OAuth
- OpenID Connect
- single sign-on
- passkeys
- multi-factor authentication
- advanced device management
- user-facing session management
- external session stores such as Redis
- persistent "remember me" sessions

These features may be considered in future iterations.

## Selected Strategy

FlowOps uses:

Server-Side Sessions +
Cryptographically Secure Session IDs +
HttpOnly Cookies +
Secure Cookies +
SameSite Protection +
Session Expiration +
Server-Side Revocation

JWTs are not used for the primary browser authentication mechanism.

## Why Server-Side Sessions?

Server-side sessions provide FlowOps with centralized control over authenticated sessions.

A session can be invalidated immediately by changing its server-side state.

For example:

User
│
▼
Logout
│
▼
Session revoked
│
▼
Future requests
│
└── 401 Unauthorized

This provides a simple and reliable logout and revocation mechanism.

The application does not have to wait until a stateless token naturally expires before access is revoked.

## Why Not JWT?

JWT-based authentication was rejected for the MVP.

JWTs can be useful for distributed APIs and stateless authentication, but they introduce additional considerations such as:

token expiration
refresh tokens
token rotation
token revocation
refresh token storage
logout behavior
stolen token handling

For the current FlowOps architecture, these additional mechanisms do not provide enough benefit to justify the additional complexity.

Server-side sessions provide a simpler model for the browser-based application.

## Session Storage

Sessions are stored in Cloudflare D1.

The conceptual structure is:

```text
sessions
├── id
├── user_id
├── organization_id
├── created_at
├── expires_at
├── revoked_at
└── last_used_at
```

The final database schema is defined in the data model and database migrations.

The session table must not contain passwords or other unnecessary sensitive user data.

## Session ID

Every session receives a cryptographically secure random identifier.

The identifier must not be:

sequential
predictable
derived from a user ID
derived from a timestamp
derived from an email address
derived from an organization ID

Unsafe example:

```text
session-10001
session-10002
session-10003
```

Another unsafe example:

```text
user-123-2026-08-25
```

Instead, the session ID must be generated using a cryptographically secure random source provided by the runtime.

Conceptually:

```ts
const sessionId = generateSecureRandomValue();
```

Session ID Entropy

The session ID must contain sufficient cryptographic entropy to make guessing or brute-force attacks impractical.

The exact encoding and length will be defined during implementation.

The implementation must use a cryptographically secure random number generator rather than application-level randomness such as Math.random().

## Session Cookie

The session ID is transmitted using a cookie.

A production cookie should conceptually look like:

```http
Set-Cookie:
__Host-session=<random-session-id>;
HttpOnly;
Secure;
SameSite=Lax;
Path=/
```

The final cookie name and attributes are defined during implementation based on the deployment architecture.

### HttpOnly

The session cookie must use the HttpOnly attribute.

This prevents client-side JavaScript from directly reading the session cookie through browser APIs such as:

document.cookie

The intended security boundary is:

Browser JavaScript
│
X
│
Session Cookie

HttpOnly does not prevent XSS itself.

It reduces the ability of injected JavaScript to directly extract the session credential.

### Secure

The session cookie must use the Secure attribute in production.

This ensures that the cookie is only transmitted over HTTPS.

Production:

HTTPS
│
▼
Secure Cookie

Production authentication must never rely on unencrypted HTTP traffic.

Local development may require a development-specific cookie configuration, but production security requirements must not be weakened to accommodate local development.

### SameSite

The session cookie uses a restrictive SameSite policy.

The default MVP configuration is:

SameSite=Lax

This provides protection against many cross-site request scenarios while allowing normal browser navigation.

If the final architecture requires a different setting, the change must be documented and justified.

### Cookie Path

The cookie uses:

Path=/

This allows the authentication cookie to be sent to both application routes and API routes under the same host.

### Cookie Domain

The cookie should not specify a Domain attribute unless the deployment architecture explicitly requires it.

Keeping the cookie host-scoped reduces the number of hosts that can receive the credential.

### \_\_Host- Cookie Prefix

The implementation should use the \_\_Host- cookie prefix if the deployment architecture allows it.

Example:

\_\_Host-session

The \_\_Host- prefix requires:

Secure
Path=/
No Domain attribute

This strengthens the host binding of the session cookie.

## Session Lifecycle

A session can conceptually exist in the following states:

Created
│
▼
Active
│
├───────────────┐
│ │
▼ ▼
Expired Revoked

Only active sessions may authenticate protected requests.

### Session Creation

A new session is created after successful authentication.

The login flow is:

Login Request
│
▼
Validate Request
│
▼
Find User
│
▼
Verify Password
│
▼
Resolve Membership
│
▼
Generate Session ID
│
▼
Store Session
│
▼
Set Cookie
│
▼
Authenticated Response

### Session Fixation Protection

A new session must be created after successful authentication.

A pre-authentication session must not simply become the authenticated session.

Unsafe:

Anonymous Session
│
▼

## Login

      │
      ▼

Same Session

Safe:

Anonymous Session
│
▼
Login
│
▼
New Session ID

This prevents session fixation attacks.

Login

The login endpoint is:

POST /api/auth/login

The expected flow is:

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
Resolve Organization Membership
│
▼
Create Session
│
▼
Set Session Cookie
│
▼
200 OK

### Login Failures

Authentication failures must not reveal whether a user account exists.

The API should return a generic response such as:

{
"error": {
"code": "INVALID_CREDENTIALS",
"message": "Invalid credentials."
}
}

The API must not expose information such as:

User does not exist.

or:

Password is incorrect.

This reduces the risk of user enumeration.

## Session Lookup

Every protected request must validate the current session.

The process is:

Request
│
▼
Read Session Cookie
│
▼
Find Session
│
▼
Check Revocation
│
▼
Check Expiration
│
▼
Load User
│
▼
Resolve Membership
│
▼
Authorize Request

Only after these checks may the request access protected resources.

### Missing Session

If a protected endpoint is requested without a session cookie, the API returns:

401 Unauthorized

Example:

{
"error": {
"code": "UNAUTHENTICATED",
"message": "Authentication is required."
}
}

### Invalid Session

If the session ID does not exist or is otherwise invalid:

401 Unauthorized

The response must not reveal internal information about the session.

### Expired Session

A session is invalid when:

expires_at < current_time

The request must return:

401 Unauthorized

An expired session must not automatically become valid again.

### Revoked Session

A session is invalid when:

revoked_at IS NOT NULL

Requests using a revoked session must return:

401 Unauthorized

## Session Expiration

Every session must have a maximum lifetime.

Conceptually:

created_at
│
├──────── Session Lifetime ────────┐
│ │
▼ ▼
Created Expired

The MVP session lifetime is **30 days** from `created_at`.

The session must also use an idle expiration of **7 days** based on `last_used_at`.
Each successful authenticated request updates `last_used_at`.

The session is invalid when either the maximum lifetime or the idle expiration is exceeded.

The MVP must not use indefinitely valid sessions.

### Idle Timeout

The MVP uses a 7-day idle expiration based on `last_used_at`.

Conceptually:

No Activity
│
▼
Idle Timeout
│
▼
Session Invalid

The initial MVP uses a fixed maximum lifetime of 30 days together with the 7-day idle expiration.

### Session Refresh

A dedicated refresh-token mechanism is not required.

An active session remains valid until it expires or is revoked.

A future implementation may introduce session rotation or sliding expiration if required.

### Session Rotation

Session rotation may be introduced for security-sensitive events.

Examples include:

Successful Login

## Password Change

Privilege Change

The general pattern is:

Existing Session
│
▼
Revoke
│
▼
Create New Session

## Logout

Logout is implemented through:

POST /api/auth/logout

The logout flow is:

Logout Request
│
▼
Read Session
│
▼
Revoke Session
│
▼
Clear Cookie
│
▼
204 No Content

### Session Revocation

A session is revoked by setting its server-side revocation state.

Conceptually:

revoked_at = current timestamp

Once revoked, the session cannot be used for authentication.

### Cookie Deletion

Logout must also remove the browser cookie.

Conceptually:

Set-Cookie:
\_\_Host-session=;
Max-Age=0;
Path=/;
Secure;
HttpOnly;
SameSite=Lax

The deletion attributes must match the original cookie configuration.

### Logout All Sessions

Logout from all devices is not required for the MVP.

The underlying architecture supports this feature.

Conceptually:

User
├── Session A
├── Session B
└── Session C

A future "Logout All Sessions" operation would revoke all sessions belonging to the user.

Password Change

When a user changes their password, all active sessions for that user must be revoked.

The intended flow is:

Password Changed
│
▼
Revoke All Active Sessions
│
▼
Create New Session

This reduces the impact of potentially compromised existing sessions.

## Account Deactivation

When a user account is disabled, existing sessions must no longer provide access.

Conceptually:

User Disabled
│
▼
Session Validation
│
▼
Access Denied

Existing sessions may additionally be explicitly revoked during account deactivation.

## Role Changes

Authorization decisions must be based on the current organization membership.

The role must not be treated as permanently trusted session data.

Preferred model:

Session
│
▼
User
│
▼
Current Membership
│
▼
Current Role
│
▼
Authorization

This ensures that role changes take effect without requiring the user to manually log in again.

## Organization Membership Changes

If a user's organization membership is removed or disabled, the user must no longer be able to access that organization's resources.

The session itself does not override current membership state.

Session
│
▼
User
│
▼
Membership Revoked
│
▼
Access Denied

## Session Data Minimization

The session record must contain only the data required for authentication and session management.

The session must not contain:

- `password`
- `password_hash`
- incident data
- full user profile
- unnecessary personal information

References should be used instead.

Example:

user_id

rather than duplicating user data inside the session.

## Sensitive Session Data

Session IDs must be treated as secrets.

Session IDs must never:

- be included in URLs
- be included in query parameters
- be written to application logs
- be returned in API responses
- be exposed to client-side JavaScript
- be sent to analytics systems
- be included in error messages

### Session IDs in URLs

Session IDs must never be transmitted through URLs.

Unsafe:

/api/profile?session=abc123

Safe:

Cookie:
\_\_Host-session=abc123

## CSRF Protection

Because authentication uses cookies, Cross-Site Request Forgery must be considered.

The primary MVP protection consists of:

```text
SameSite Cookie
+
Same-Origin API Architecture
+
Origin / Referer Validation where appropriate
+
Restricted Content Types
```

If the architecture later requires cross-site authenticated requests, an explicit CSRF token mechanism must be introduced.

### Same-Origin Preference

The preferred application architecture is:

Browser
│
▼
FlowOps Application
│
├── Web UI
│
└── /api

Keeping the frontend and API under the same origin reduces:

CORS complexity
cookie configuration complexity
CSRF attack surface
deployment complexity

### CORS

The API must not use unnecessarily permissive CORS policies.

The following configuration must not be used for authenticated requests:

Access-Control-Allow-Origin: \*

when combined with credential-based authentication.

If CORS is required, allowed origins must be explicitly configured.

## Rate Limiting

Authentication endpoints must be protected against automated abuse.

At minimum, the following endpoints require the documented MVP rate limits:

POST /api/auth/login
POST /api/auth/register

The functional limits are:

- Registration: 5 requests per IP per 15 minutes
- Login: 10 failed attempts per IP per 15 minutes
- Password reset: 5 requests per IP per 15 minutes if password reset is introduced later

Password reset is outside the MVP.

The concrete technical mechanism will be defined during implementation for Hono on Cloudflare Workers.

### Brute Force Protection

Repeated failed login attempts must not be unlimited.

Possible mechanisms include:

- IP-based rate limiting
- account-based rate limiting
- progressive delays
- Cloudflare-based protection

The selected mechanism will be documented in the security implementation.

## Session Enumeration

Session IDs must not contain information that allows an attacker to identify:

users
organizations
timestamps
roles

Unsafe:

user-123-org-5

Safe:

cryptographically-random-session-id

## Session Database Access

Session data is accessible only from the server-side application.

The browser must never have direct database access.

The browser interacts with:

Browser
│
▼
FlowOps API
│
▼
Session Store

and never:

Browser
│
▼
Database

## Session Cleanup

Expired sessions should be periodically removed from the database.

Example:

```sql
DELETE FROM sessions
WHERE expires_at < current_timestamp;
```

The exact cleanup mechanism depends on the Cloudflare architecture.

Cleanup is an operational concern and is separate from session validity.

### Cleanup vs. Validity

A session does not have to be physically deleted immediately after expiration.

The important security rule is:

Expired Session = Invalid Session

Physical deletion can happen later during a cleanup process.

## Session Storage and Cloudflare D1

Cloudflare D1 is used as the session store.

This follows the database decision defined in:

ADR-003-Database-D1.md

Benefits include:

- no additional database infrastructure
- no additional third-party service
- simple local development
- centralized session storage
- integration with the existing Cloudflare architecture

## Performance Considerations

Protected requests require session validation.

The typical flow is:

Request
│
▼
Session Lookup
│
▼
User / Membership Lookup
│
▼
Resource Query

Session lookups must therefore be efficient.

The session ID must be indexed and uniquely identifiable.

Example:

```sql
CREATE UNIQUE INDEX idx_sessions_id
ON sessions(id);
```

The exact migration will be defined with the final database schema.

### Session Lookup Index

The most common session operation is:

Find session by session ID

Therefore the session ID must have an efficient unique lookup path.

### Expiration Index

If the cleanup process regularly queries expired sessions, an index on:

expires_at

may be appropriate.

The final decision will depend on the actual cleanup implementation and database behavior.

## Concurrency

Multiple requests may use the same session simultaneously.

The session system must support normal concurrent requests.

No global session lock is required.

### Logout Race Conditions

Multiple requests may occur at approximately the same time.

Example:

Request A → authenticated
Request B → logout

The system guarantees that once the session is revoked, future session validation attempts will reject it.

A request that already passed authentication before revocation may continue depending on its execution state.

This is an accepted property of request-based authentication.

## Security Boundary

A valid session establishes authentication.

It does not automatically grant permission to perform every operation.

The distinction is:

# Authentication

Who is the user?

and:

# Authorization

What may the user do?

Session management handles authentication.

Authorization is handled separately.

## Multi-Tenant Relationship

Session management integrates with the multi-tenant architecture defined in ADR-005-Multi-Tenant-Architecture.md.

The authorization chain is:

Session
│
▼
User
│
▼
Membership
│
▼
Organization
│
▼
Role
│
▼
Authorization
│
▼
Resource

The session alone must never be treated as sufficient proof that a user may access a specific organization.

### Organization Context

Users may belong to multiple organizations. The active organization is resolved from the authenticated user's active membership for each request.

Example:

User
│
└── Membership
│
├── organization_id
└── role

If multi-organization users are introduced later, an explicit active-organization mechanism must be designed.

### Request Authentication Context

After successful authentication, the server may create an internal authentication context.

Example:

```ts
type AuthContext = {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
};
```

This context is internal to the request lifecycle and is never exposed as authentication credentials to the client.

## Protected Routes

Authentication must be implemented centrally for protected endpoints.

Conceptually:

GET /api/incidents
│
▼
requireAuth()
│
▼
AuthContext
│
▼
Authorization
│
▼
Incident Query

Individual endpoints must not implement independent and inconsistent authentication logic.

### Public Routes

Public routes do not require an authenticated session.

Examples:

POST /api/auth/register
POST /api/auth/login

Protected routes must explicitly require authentication.

### Authentication Middleware / Guard

A centralized authentication mechanism should be used.

Conceptually:

```ts
const authContext = await requireAuth(request);

if (!authContext) {
  return unauthorized();
}
```

The exact implementation depends on the application framework and Cloudflare runtime.

### Session Validation Order

The recommended validation order is:

1. Read session cookie
2. Validate session ID format
3. Look up session
4. Check revocation
5. Check expiration
6. Load user
7. Check user status
8. Resolve organization membership
9. Resolve current role
10. Perform authorization
11. Execute request

## User Status

A user account may be disabled or otherwise prevented from accessing the application.

A valid session must not bypass the current user status.

Example:

Session valid
│
▼
User disabled
│
▼
Access denied

## Organization Membership Status

The current organization membership must also be respected.

Example:

Session valid
│
▼
Membership revoked
│
▼
Access denied

This prevents users from retaining access to an organization after their membership has been removed.

## Stolen Session Mitigation

If an attacker obtains a valid session ID, they may be able to impersonate the user until the session expires or is revoked.

The architecture reduces this risk through:

- HTTPS
- Secure cookies
- HttpOnly cookies
- SameSite protection
- session expiration
- session revocation
- XSS prevention
- CSRF protection
- centralized authentication

## Session Binding

Sessions are not hard-bound to an IP address or user-agent in the MVP.

Hard binding can cause legitimate users to lose access when:

their IP address changes
they use mobile networks
they use a VPN
they change networks
their browser environment changes

Risk-based detection may be considered in a future version.

### IP Address Storage

IP addresses are not required as part of the authentication mechanism.

If IP addresses are later stored for security logging or rate limiting, the decision must be documented separately.

### User-Agent Storage

The user-agent is not used as an authentication factor.

It may be stored in the future for device or session management interfaces.

### Session Metadata

device_label
Future versions may store additional metadata such as:

- `created_at`
- `last_used_at`
- `user_agent`
- `ip_hash`
- `device_label`

The MVP stores only data required for session management.

## Security Event Revocation

Sessions may be revoked after security-sensitive events.

Examples:

- Password Changed
- User Disabled
- Organization Membership Removed
- Account Compromised
- Manual Logout
- Password Reset

If password reset functionality is introduced, all existing sessions should be revoked after a successful password reset.

This prevents previously issued sessions from remaining valid after a potentially compromised account has been recovered.

## Multiple Sessions

A user may have multiple active sessions.

Example:

User
├── Session A – Laptop
├── Session B – Smartphone
└── Session C – Browser

Each session has its own unique session ID.

## Session Management UI

A user-facing session management interface is not part of the MVP.

A future implementation may provide:

Active Sessions

Chrome – Windows
Last active: Today

Safari – iPhone
Last active: Yesterday

[Revoke]

### Session Revocation API

An API for manually revoking individual sessions is not part of the MVP.

If introduced later, users must only be able to revoke their own sessions unless an administrative permission explicitly allows otherwise.

## Database Failure

If the session store is unavailable, the application must not assume that the user is authenticated.

Fail-safe behavior:

Session Store Unavailable
│
▼
Authentication Cannot Be Verified
│
▼
Request Denied

The system must never use:

Database unavailable
│
▼
Assume authenticated

### Availability Trade-Off

Server-side sessions introduce a dependency on the availability of the session store.

This is an intentional trade-off in exchange for:

immediate session revocation
centralized control
simple logout
straightforward session management
predictable authentication behavior

## Error Handling

Authentication failures use the existing API error format.

Example:

{
"error": {
"code": "UNAUTHENTICATED",
"message": "Authentication is required."
}
}

Internal database or infrastructure errors must not be exposed to clients.

## Logging

Full session IDs must never be logged.

Unsafe:

session=abc123xyz456

If session-related logging is required, only a non-sensitive technical reference or appropriately derived identifier may be logged.

## Audit Logging

Security-relevant authentication events should be auditable.

Examples:

LOGIN_SUCCESS
LOGIN_FAILURE
LOGOUT
SESSION_REVOKED
PASSWORD_CHANGED
ACCOUNT_DISABLED

The complete audit logging strategy is defined separately in the security documentation.

## Testing Strategy

Session management must be covered by automated tests.

disabled users cannot access protected resources
The test suite must cover at least:

- successful login creates a session
- session cookie is created correctly
- session cookie is HttpOnly
- session cookie is Secure in production
- session cookie has the expected SameSite policy
- valid sessions allow protected access
- missing sessions return 401
- invalid sessions return 401
- expired sessions return 401
- revoked sessions return 401
- logout revokes the session
- logout clears the cookie
- session fixation is prevented
- disabled users cannot access protected resources
- removed memberships cannot access protected resources
- cross-tenant access is denied
- session IDs are not exposed in URLs
- session IDs are not written to logs

### Login Test

Test:

POST /api/auth/login

Expected:

200 OK

- Set-Cookie
- Server-side session exists

### Logout Test

Test:

POST /api/auth/logout

Expected:

204 No Content

- Session revoked
- Cookie cleared

A subsequent request using the same session must return:

401 Unauthorized

### Expiration Test

A session with an expiration timestamp in the past is used.

Expected:

401 Unauthorized

### Revocation Test

A session is explicitly revoked.

A subsequent protected request must return:

401 Unauthorized

### Cross-Tenant Session Test

A user belonging to Organization A must not access resources belonging to Organization B.

Example:

User A
│
▼
Session A
│
▼
Request Resource B

Expected:

Access Denied

## Security Checklist

Before completing the implementation:

- [ ] Sessions are stored server-side
- [ ] Session IDs are cryptographically random
- [ ] Session IDs contain no user or organization information
- [ ] Session cookies use HttpOnly
- [ ] Session cookies use Secure in production
- [ ] Session cookies use an appropriate SameSite policy
- [ ] Session cookies use Path=/
- [ ] \_\_Host- cookie prefix has been evaluated
- [ ] Session IDs are never included in URLs
- [ ] Session IDs are never logged
- [ ] Session fixation is prevented
- [ ] Sessions have an expiration time
- [ ] Logout revokes the session
- [ ] Logout clears the cookie
- [ ] Revoked sessions are rejected
- [ ] Expired sessions are rejected
- [ ] Disabled users are rejected
- [ ] Removed memberships are rejected
- [ ] Authentication is implemented centrally
- [ ] Authentication and authorization remain separate
- [ ] Tenant isolation is enforced
- [ ] CSRF protection is implemented
- [ ] CORS is not unnecessarily permissive
- [ ] Login is protected against brute-force attacks
- [ ] Session lookups are indexed
- [ ] Cross-tenant tests exist
- [ ] Logout tests exist
- [ ] Expiration tests exist
- [ ] Revocation tests exist

## Consequences

### Positive Consequences

#### Centralized Session Control

The server can revoke sessions immediately.

#### Simple Logout

Logout can be implemented through server-side revocation and cookie deletion.

#### No JWT Infrastructure

The MVP does not require refresh tokens or JWT revocation mechanisms.

#### Strong Multi-Tenant Integration

The session can identify the authenticated user, while the current organization membership determines organizational access.

#### Clear Security Boundary

Authentication remains centralized and independent from authorization.

### Negative Consequences

#### Database Dependency

Protected requests require access to the session store.

#### Session Storage

The application must maintain session records.

#### Cleanup

Expired sessions should be periodically cleaned up.

#### Scalability

Session lookups must remain efficient as the application grows.

## Alternatives Considered

### JWT Access Tokens

Rejected for MVP.

Reasons:

- additional token lifecycle complexity
- more difficult revocation
- additional client-side credential management
- refresh mechanism would be required for longer sessions
- no significant benefit for the current browser-based architecture

### JWT Access Tokens + Refresh Tokens

Rejected for MVP.

Reasons:

The additional complexity of access token expiration, refresh tokens, token rotation, revocation, and secure token storage is not justified for the current architecture.

### Client-Side Session Storage

Rejected.

Examples include:

- `localStorage`
- `sessionStorage`

The primary authentication credential must not be stored there.

Reasons:

- increased impact of XSS
- unnecessary client-side responsibility
- weaker security boundary
- easier accidental exposure

### In-Memory Sessions

Rejected for production.

Reasons:

- not reliable across Worker instances
- sessions can be lost
- not suitable for persistent session management
- difficult to scale consistently

### External Redis Session Store

Rejected for MVP.

Reasons:

- additional infrastructure
- additional operational complexity
- additional external dependency
- unnecessary for the initial scale of the project

This option may be reconsidered if future performance or scaling requirements justify it.

## Future Improvements

Potential future improvements include:

- multi-device session management
- logout from all devices
- idle timeout
- session rotation
- multi-factor authentication
- passkeys
- OAuth
- OpenID Connect
- single sign-on
- device tracking
- security notifications
- risk-based authentication
- suspicious session detection

Each future security feature should be evaluated through its own architectural decision where appropriate.

## Implementation Requirements

### Requirement 1

Sessions must be stored server-side.

### Requirement 2

Session IDs must be cryptographically random.

### Requirement 3

Session IDs must not contain sensitive or predictable information.

### Requirement 4

Session cookies must use HttpOnly.

### Requirement 5

Session cookies must use Secure in production.

### Requirement 6

Session cookies must use an appropriate SameSite policy.

### Requirement 7

Sessions must have a defined expiration time.

### Requirement 8

Logout must revoke the server-side session.

### Requirement 9

Logout must clear the session cookie.

### Requirement 10

Expired sessions must not provide access.

### Requirement 11

Revoked sessions must not provide access.

### Requirement 12

Disabled users must not gain access through existing sessions.

### Requirement 13

Removed organization memberships must not provide access to organization resources.

### Requirement 14

Session fixation must be prevented.

### Requirement 15

Session IDs must never be transmitted through URLs.

### Requirement 16

Session IDs must never be written to logs.

### Requirement 17

Protected API endpoints must use centralized authentication.

### Requirement 18

Authentication and authorization must remain separate concerns.

### Requirement 19

Tenant isolation must be enforced according to ADR-005-Multi-Tenant-Architecture.md.

### Requirement 20

Session management must be covered by automated tests.

## Related Decisions

This ADR is directly related to:

- `ADR-001-Technology-Stack.md`
- `ADR-002-Cloudflare-Architecture.md`
- `ADR-003-Database-D1.md`
- `ADR-004-Authentication-Strategy.md`
- `ADR-005-Multi-Tenant-Architecture.md`

## Related Documentation

- `Architecture.md`
- `Data-Model.md`
- `Security.md`
- `API.md`

```text
01-Anforderungen/
├── Anforderungsblatt-de.md
└── Requirements-Specification-en.md

02-Produktplanung/
├── MVP-Core.md
├── MVP-Backlog-de.md
└── User-Stories/
    ├── user-stories-de.md
    └── user-stories-en.md

04-Umsetzung/
├── Definition-of-Done.md
├── sprints.md
└── planung.md

05-Qualitaet/
├── Testing-Matrix.md
   └── Risks-and-Open-Questions.md
```

## Decision Summary

FlowOps uses server-side sessions with cryptographically secure, randomly generated session IDs.

The session ID is transmitted exclusively through a secure, HttpOnly, SameSite-protected cookie.

Session data is stored server-side in Cloudflare D1.

Authentication and authorization remain separate concerns.

The session identifies the authenticated user.

The current organization membership determines organizational access and role.

Authorization then determines whether the user may access or modify a specific resource.

The resulting security model is:

```text
Cookie
   │
   ▼
Session
   │
   ▼
User
   │
   ▼
Membership
   │
   ▼
Organization
   │
   ▼
Role
   │
   ▼
Authorization
   │
   ▼
Resource
```

This approach provides FlowOps with centralized, revocable, and testable session management while remaining compatible with the Cloudflare Workers, Cloudflare D1, and multi-tenant architecture.
