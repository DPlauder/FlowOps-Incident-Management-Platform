# ADR-004 – Authentication Strategy

## Status

Accepted

## Date

2026-08

## Decision

FlowOps will use server-side session-based authentication for the MVP.

Users will authenticate using an email address and password.

After a successful login, the server will create a session and send a secure session cookie to the browser.

The browser will use this cookie for subsequent authenticated requests.

The authentication architecture is:

```text
Browser
   │
   │ Email + Password
   ▼
## Authentication API
   │
   ├── Validate Input
   │
   ├── Find User
   │
   ├── Verify Password Hash
   │
   └── Create Session
   │
   ▼
D1
   │
   └── Session
   │
   ▼
Secure HTTP-only Cookie
```

Subsequent requests follow:

```text
Browser
   │
   │ Session Cookie
   ▼
API
   │
   ├── Validate Session
   ├── Load User
   ├── Load Organization Membership
   └── Check Permissions
   │
   ▼
Application Logic
```

The MVP will not use JWT-based browser authentication.

Authentication and authorization will remain explicit application responsibilities rather than being delegated to a third-party authentication platform.

## Context

FlowOps is a multi-tenant incident management application.

Users must be able to:

- Create an account
- Log in
- Log out
- Access protected resources
- Belong to an organization
- Have a role within an organization
- Access only resources belonging to their organization

Authentication is therefore a central security concern.

The authentication strategy must work together with:

- Multi-tenant architecture
- Session management
- Role-based authorization
- API security
- Database access
- Secure cookies
- Password storage
- Rate limiting
- Testing

The project is also intended to demonstrate real-world backend engineering practices.

## Requirements

The authentication system must satisfy the following requirements.

### Account Registration

Users must be able to create an account.

The registration process must:

- Validate input
- Ensure email uniqueness
- Hash the password
- Create the user
- Create or associate the user with an organization according to the product rules
- Avoid returning sensitive information

### Login

Users must be able to authenticate using their credentials.

The login process must:

- Validate input
- Find the user
- Verify the password
- Create a session
- Set a secure session cookie
- Return an appropriate response

Invalid credentials must not reveal whether an email address exists.

### Logout

Users must be able to invalidate their current session.

Logout must:

- Invalidate the server-side session
- Remove or expire the session cookie
- Prevent the session from being reused

### Session Persistence

Authenticated users should remain logged in across normal browser requests until:

They log out
The session expires
The session is revoked
Security-related invalidation occurs

### Authorization

Authentication alone is not sufficient.

After authentication, FlowOps must determine:

Who is the user?
│
▼
Which organization does the user belong to?
│
▼
Which role does the user have?
│
▼
What is the user allowed to do?

Authorization is therefore a separate concern from authentication.

### Multi-Tenant Security

A valid session must never grant unrestricted access to application data.

Every protected request must establish the user's organization context.

The application must prevent:

User from Organization A
│
X
▼
Incident belonging to Organization B

### Secure Password Storage

Passwords must never be stored in plaintext.

Only a secure password hash may be stored in the database.

The application must use an established password hashing algorithm designed for password storage.

The exact algorithm and configuration are documented in:

../Security.md

### Secure Session Cookies

Session identifiers will be stored in secure cookies.

The production cookie must use appropriate security attributes:

- `HttpOnly`
- `Secure`
- `SameSite`

The exact values depend on the deployment environment and application requirements.

### Session Revocation

The server must be able to invalidate sessions.

This is one of the main reasons for choosing server-side sessions over purely stateless browser authentication.

### Rate Limiting

Authentication endpoints are sensitive to brute-force attacks.

The following endpoints require rate limiting or an explicitly documented MVP mitigation:

```text
POST /api/auth/register
POST /api/auth/login
```

## Authentication Model

FlowOps will use the following model:

User
│
▼
Credentials
│
▼
Password Verification
│
▼
Session Creation
│
▼
Session Cookie
│
▼
Authenticated Requests

The session represents the authenticated browser context.

The session does not contain the complete authorization state.

Authorization information is resolved from the server-side application and database.

## Session-Based Authentication

The server will create a session after successful authentication.

Conceptually:

```text
sessions
├── id
├── user_id
├── expires_at
├── created_at
├── last_used_at
└── ...
```

The exact database schema is defined in:

../Data-Model.md

The session identifier is sent to the browser through a secure cookie.

### Session Cookie

The browser receives a cookie containing the session identifier.

Conceptually:

```http
Set-Cookie:
session=<opaque-session-value>;
HttpOnly;
Secure;
SameSite=Lax;
Path=/
```

The exact configuration will be finalized during implementation.

The session cookie must not contain sensitive user information.

The cookie should contain only an opaque identifier or equivalent non-sensitive session reference.

### HttpOnly

The session cookie must use:

HttpOnly

This prevents client-side JavaScript from directly reading the session cookie.

This reduces the impact of certain cross-site scripting scenarios.

HttpOnly does not prevent XSS itself.

The application must still implement appropriate XSS protections.

### Secure

Production session cookies must use:

Secure

This ensures that the browser sends the cookie only over HTTPS.

Local development may require a different configuration depending on the development environment.

### SameSite

The session cookie must use an appropriate:

SameSite

configuration.

The initial approach will prefer:

SameSite=Lax

unless the application's final authentication flow requires another setting.

The configuration must be reviewed together with the CSRF protection strategy.

### Session Identifier

The session identifier must be:

- Cryptographically unpredictable
- Sufficiently long
- Generated using a secure random source
- Unrelated to the user ID
- Unrelated to predictable database IDs

timestamp
The application must not use values such as:

- `user_id`
- `email`
- `timestamp`
- incrementing database ID

as session identifiers.

### Session Storage

Sessions will be stored in Cloudflare D1.

The intended relationship is:

User
│
└──< Sessions

This allows the application to revoke sessions centrally.

### Session Lookup

A protected request follows this process:

HTTP Request
│
▼
Read Session Cookie
│
▼
Validate Session Identifier
│
▼
Find Session
│
▼
Check Expiration
│
▼
Load User
│
▼
Load Organization Membership
│
▼
Authorization

If any required authentication step fails, the request must not reach protected application logic.

### Session Expiration

Sessions must have an expiration policy.

A session should not remain valid indefinitely.

The database should therefore store an expiration timestamp.

Conceptually:

expires_at

The application must reject expired sessions.

### Session Renewal

Session renewal may be implemented to improve usability without creating unnecessarily long-lived sessions.

If renewal is implemented, the new expiration must remain within the security policy defined in Security.md.

The MVP does not require sophisticated token rotation.

The implementation should remain simple and understandable.

### Session Revocation

A session can be revoked by deleting or invalidating its server-side database record.

For example:

Logout
│
▼
Delete / Invalidate Session
│
▼
Expire Cookie

After revocation:

Old Session Cookie
│
▼
Session Lookup
│
X
▼
401 Unauthorized

### Multiple Sessions

The database model should allow a user to have multiple sessions.

For example:

User
├── Session A
├── Session B
└── Session C

This allows different browser sessions or devices to authenticate independently.

The MVP does not require a user interface for managing all active sessions.

Such functionality may be added later.

## Password Authentication

The MVP uses email and password authentication.

The authentication flow is:

User
│
│ Email + Password
▼
API
│
├── Validate Input
│
├── Find User
│
└── Verify Password Hash
│
▼
Create Session

The password itself must never be persisted.

### Password Hashing

Passwords must be hashed using a password-specific hashing algorithm.

The application must not use:

- MD5
- SHA-1
- SHA-256

directly as password hashing algorithms.

A password hashing algorithm such as Argon2id or another appropriate password hashing mechanism should be used according to the runtime capabilities and security requirements.

The selected implementation must be documented in:

../Security.md

### Password Verification

During login:

Submitted Password
│
▼
Password Verification
│
▼
Stored Password Hash

The application must use the password hashing library's verification mechanism.

The application must not attempt to reproduce password hashing logic manually.

## Registration

The registration endpoint is:

```text
POST /api/auth/register
```

The expected flow is:

Request
│
▼
Validate Input
│
▼
Normalize Email
│
▼
Check Account Rules
│
▼
Hash Password
│
▼
Create User
│
▼
Create / Associate Organization
│
▼
Create Session
│
▼
Set Cookie
│
▼
Response

The exact organization creation behavior is defined by the product requirements.

### Email Normalization

Email addresses should be normalized consistently before account lookup and uniqueness checks.

At minimum, the application should:

- Remove accidental surrounding whitespace
- Use a consistent representation for comparison
- Store the normalized representation

The application should avoid unnecessarily transforming valid email addresses beyond what is required.

### Duplicate Accounts

Email addresses must be unique according to the application's account model.

The database should enforce uniqueness rather than relying exclusively on application-level checks.

This prevents race conditions such as:

Request A ──┐
├── Create same email
Request B ──┘

A unique database constraint provides an additional integrity boundary.

## Login

The login endpoint is:

```text
POST /api/auth/login
```

The flow is:

Request
│
▼
Validate Input
│
▼
Normalize Email
│
▼
Find User
│
▼
Verify Password
│
├── Invalid ──▶ Generic Authentication Error
│
▼
Create Session
│
▼
Set Secure Cookie
│
▼
Return Success

### Login Error Messages

The login endpoint must avoid revealing whether an account exists.

The application should use a generic authentication error such as:

Invalid email or password.

It should not return different messages such as:

User does not exist.

or:

Password is incorrect.

This reduces account enumeration risk.

## Logout

The logout endpoint is:

```text
POST /api/auth/logout
```

The flow is:

Request
│
▼
Read Session
│
▼
Invalidate Session
│
▼
Expire Cookie
│
▼
Return Success

Logout should be safe to call multiple times.

An already-invalid session should not cause sensitive information to be exposed.

## Protected Requests

Every protected API request must validate the session.

Example:

GET /api/incidents

The request lifecycle is:

Request
│
▼
Session Authentication
│
├── Invalid ──▶ 401
│
▼
User Context
│
▼
Organization Context
│
▼
Authorization
│
├── Forbidden ──▶ 403
│
▼
Business Logic

## Authentication vs Authorization

Authentication answers:

Who are you?

Authorization answers:

What are you allowed to do?

These concerns must remain separate.

Example:

Authentication
│
└── User 123 is authenticated.

Authorization
│
├── User belongs to Organization A.
├── User has role MEMBER.
└── User may create incidents.

A valid session alone must never grant unrestricted access.

## Organization Membership

A user must be associated with an organization through an explicit membership relationship.

Conceptually:

User
│
▼
Organization Membership
│
├── organization_id
├── user_id
└── role

This allows the application to determine:

Which organization the user belongs to
Which role the user has
Which resources the user may access

## Role-Based Authorization

FlowOps will use role-based authorization for the MVP.

The exact roles are defined by the product requirements.

Conceptually:

Organization
│
├── OWNER
├── ADMIN
└── MEMBER

The exact role names and permissions must remain consistent across:

- Requirements
- Data model
- API
- Security documentation
- Implementation
- Tests

### Authorization Check

A protected operation should follow:

Authenticated User
│
▼
Organization Membership
│
▼
User Role
│
▼
Requested Resource
│
▼
Permission Check
│
├── Allowed ──▶ Continue
│
└── Denied ───▶ 403

### Resource Authorization

Authorization must be checked against the actual resource.

The application must not assume that knowing an ID is sufficient permission.

For example:

GET /api/incidents/:id

must verify:

The session is valid.
The user belongs to an organization.
The incident belongs to that organization.
The user's role allows the requested action.

### IDOR Protection

The application must protect against insecure direct object references.

An attacker must not be able to access another organization's incident by changing:

/api/incidents/123

to:

/api/incidents/124

The database query must include the authenticated organization context.

Example:

```sql
SELECT *
FROM incidents
WHERE id = ?
AND organization_id = ?;
```

## Authentication Middleware

Authentication should be implemented in a reusable server-side mechanism.

The goal is to avoid duplicating authentication logic across every API route.

Conceptually:

Protected API Route
│
▼
Authentication Middleware
│
▼
Authenticated Context
│
▼
Route Handler

The authentication context should provide the relevant user and organization information.

### Authentication Context

A protected request should receive a server-side context similar to:

```ts
type AuthContext = {
  userId: string;
  organizationId: string;
  role: string;
  sessionId: string;
};
```

The exact type will be defined during implementation.

The context must be created server-side.

Client-provided values must not override authenticated context.

### Client-Supplied Organization IDs

The client must not be trusted to determine the organization context for protected operations.

Unsafe:

```json
{
  "organizationId": "organization-b"
}
```

The application must not assume that the authenticated user belongs to that organization simply because the request contains the ID.

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
Organization Context

must determine the organization.

## CSRF Protection

Because authentication uses cookies, Cross-Site Request Forgery must be considered.

The application will use appropriate cookie configuration and request protections.

The initial approach includes:

SameSite=Lax

combined with appropriate request handling.

For state-changing requests, the final implementation must evaluate whether an explicit CSRF token mechanism is required.

This decision must be documented before the authentication system is considered complete.

## XSS Considerations

HttpOnly cookies reduce the ability of injected JavaScript to directly steal the session cookie.

However, XSS remains a critical security concern.

The application must therefore:

- Escape user-generated content
- Avoid unsafe HTML rendering
- Sanitize content where HTML is intentionally supported
- Configure appropriate security headers
- Avoid unnecessary use of `dangerouslySetInnerHTML`

Authentication security must not rely solely on HttpOnly.

## Brute-Force Protection

Login attempts must be protected against automated brute-force attacks.

The MVP requires rate limiting or another explicitly documented mitigation.

The primary target is:

POST /api/auth/login

Registration should also receive abuse protection.

### Rate Limiting Strategy

The MVP functional rate limits are:

- Registration: 5 requests per IP per 15 minutes
- Login: 10 failed attempts per IP per 15 minutes
- Password reset: 5 requests per IP per 15 minutes if password reset is introduced later

Password reset is outside the MVP.

The technical implementation will be determined during implementation based on the available Cloudflare Workers capabilities.

Possible dimensions include:

- IP address
- Email address
- IP + email combination

A single dimension should not be relied upon exclusively because IP-based controls can affect legitimate shared networks.

## Account Enumeration

The authentication system should minimize information that allows attackers to determine whether an account exists.

Examples:

Registration
Login
Password reset

should use carefully designed error responses.

The MVP does not necessarily include password reset functionality.

If password reset is introduced later, it must follow the same anti-enumeration principle.

### Password Reset

Password reset functionality is outside the MVP unless explicitly added to the product requirements.

The authentication architecture does not assume that password reset exists.

If implemented later, it will require a separate security review.

### Email Verification

Email verification is outside the initial MVP scope.

The application may accept accounts without verified email addresses during the MVP.

If email verification is introduced later, it should be documented in a new ADR or update to the authentication architecture.

### Social Login

OAuth-based authentication such as:

- Google
- GitHub
- Microsoft

is outside the MVP scope.

The project intentionally keeps authentication self-contained to demonstrate the underlying authentication architecture.

Social login can be introduced later if there is a product requirement.

## JWT Authentication

JWT-based browser authentication was considered.

It was rejected for the MVP.

The primary reasons are:

- Server-side session revocation is straightforward.
- Browser authentication does not require stateless tokens.
- JWT introduces additional token lifecycle considerations.
- Session cookies integrate naturally with browser requests.
- The application requires explicit server-side authorization anyway.

JWT may become appropriate if FlowOps later exposes an external API for third-party clients.

## OAuth / OpenID Connect

OAuth and OpenID Connect were considered.

They were not selected because the MVP does not require external identity providers.

Introducing an identity provider would also reduce the amount of authentication architecture implemented directly by the project.

This is undesirable for a portfolio project intended to demonstrate backend security knowledge.

## Managed Authentication Services

Services such as managed authentication providers were considered.

They were rejected for the MVP because authentication itself is an important part of the engineering demonstration.

The project should demonstrate understanding of:

- Password hashing
- Sessions
- Cookies
- Authentication flows
- Authorization
- Tenant isolation
- Security boundaries

## Session Fixation Protection

A new session must be created after successful authentication.

The application must not reuse an unauthenticated or attacker-controlled session identifier after login.

The intended flow is:

Unauthenticated Request
│
▼
Login
│
▼
Create New Session
│
▼
Authenticated Session

## Session Theft Considerations

A stolen valid session identifier may allow impersonation of the associated user.

The architecture therefore relies on:

- HTTPS
- Secure cookies
- HttpOnly cookies
- SameSite protection
- Short-lived sessions
- Session revocation
- XSS protection
- Appropriate logging restrictions

The application must never log session identifiers.

## Session Expiration

The session expiration policy must balance usability and security.

The MVP should define:

- Session lifetime
- Expiration behavior
- Renewal behavior
- Logout behavior

These values will be documented in Security.md once implementation-specific decisions have been finalized.

## Authentication Errors

Authentication-related errors must not expose internal implementation details.

Examples of internal details that must never be returned:

Database errors
Password hashing errors
Stack traces
SQL statements
Internal identifiers
Session implementation details

The API should return controlled error responses.

HTTP Status Codes

Authentication endpoints use the following general conventions:

Situation Status
Invalid request 400
Missing / invalid authentication 401
Authenticated but not authorized 403
Resource not found 404
Unexpected server failure 500

The exact endpoint behavior is defined in the API documentation.

Authentication API

The MVP authentication endpoints are:

Method Route Purpose
POST /api/auth/register Create an account
POST /api/auth/login Create a session
POST /api/auth/logout End the current session

Additional authentication endpoints are outside the MVP unless required.

### Registration Response

The registration response must not expose:

- Password
- Password hash
- Session identifier
- Internal security information

If registration automatically creates a session, the session is communicated through the secure cookie mechanism.

### Login Response

The login response must not expose the raw session identifier in the JSON response.

The session should be represented through the secure cookie.

### Logout Response

Logout should invalidate the server-side session and expire the browser cookie.

The response should not reveal sensitive session information.

## Database Model

The authentication architecture requires at least the following logical entities:

users
sessions
organizations
organization_members

Conceptually:

users
│
├──────────< sessions
│
└──────────< organization_members >──────── organizations

The exact schema is documented in:

../Data-Model.md

### User Table

The user record should contain information required for authentication and application identity.

Conceptually:

users
├── id
├── email
├── password_hash
├── created_at
└── updated_at

Additional fields may be introduced as product requirements evolve.

### Session Table

The session record should contain enough information to validate the session.

Conceptually:

sessions
├── id
├── user_id
├── expires_at
├── created_at
└── last_used_at

Additional metadata may be added later if required.

### Organization Membership

Organization membership is kept separate from the user record.

Conceptually:

organization_members
├── id
├── organization_id
├── user_id
├── role
└── created_at

This provides a clear boundary between:

Identity

and:

Organization Access

## Authentication Flow

### Registration

1. Client submits registration data.
2. API validates the request.
3. Email is normalized.
4. Application checks account rules.
5. Password is securely hashed.
6. User is created.
7. Organization membership is created where required.
8. Session is created if registration logs the user in.
9. Secure cookie is returned.
10. API returns a controlled response.

### Login

1. Client submits credentials.
2. API validates the request.
3. Email is normalized.
4. User is looked up.
5. Password hash is verified.
6. New session is created.
7. Secure cookie is returned.
8. API returns a controlled response.

### Authenticated Request

1. Client sends session cookie.
2. API reads the cookie.
3. Session is looked up.
4. Session expiration is checked.
5. User is loaded.
6. Organization membership is loaded.
7. Authorization is evaluated.
8. Application logic executes.

### Logout

1. Client sends logout request.
2. Session is identified.
3. Session is invalidated.
4. Cookie is expired.
5. API returns success.

## Security Boundary

The authentication system defines the following trust boundaries:

┌──────────────────────┐
│ Browser │
│ Untrusted │
└──────────┬───────────┘
│
│ HTTPS
▼
┌──────────────────────┐
│ API / Worker │
│ Trusted Boundary │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│ Authentication Logic │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│ Session │
│ Database │
└──────────────────────┘

The browser must never be trusted to provide:

User identity
Organization identity
Role
Permissions

These values must be derived server-side.

## Logging Rules

Authentication logs must never contain:

- Passwords
- Password hashes
- Session identifiers
- Session cookies
- Authentication tokens
- Secrets

Logs may contain non-sensitive operational information such as:

Authentication attempt
Timestamp
Result
Endpoint
Non-sensitive request metadata

Care must be taken to avoid logging personally identifiable information unnecessarily.

## Audit Events

Security-sensitive authentication events should be available for audit purposes where appropriate.

Potential events include:

- `USER_REGISTERED`
- `LOGIN_SUCCEEDED`
- `LOGIN_FAILED`
- `LOGOUT`
- `SESSION_REVOKED`

The exact audit event model is outside the initial authentication implementation unless required by the MVP.

## Testing Requirements

Authentication must be tested at multiple levels.

### Unit Tests

Unit tests should cover:

- Password validation
- Email normalization
- Session validation
- Session expiration
- Authorization rules
- Role checks

### Integration Tests

Integration tests should cover:

- Registration
- Login
- Logout
- Session creation
- Session invalidation
- Database constraints
- Organization membership

### Security Tests

Security tests should cover:

- Invalid credentials
- Expired sessions
- Revoked sessions
- Cross-organization access
- Unauthorized role access
- Missing session cookie
- Invalid session cookie
- Session fixation attempts
- Input validation
- Brute-force protection behavior

### End-to-End Tests

The main authentication workflow should be tested through the browser.

Example:

Register
↓
Login
↓
Access Dashboard
↓
Create Incident
↓
Logout
↓
Attempt Protected Request
↓
Unauthorized

## Consequences

### Positive Consequences

#### Server-Side Session Control

Sessions can be revoked immediately.

#### Simple Browser Integration

Cookies are automatically sent with requests to the application.

#### Clear Security Model

The authentication flow is straightforward:

Credentials
↓
Session
↓
Authenticated Request

#### Explicit Backend Knowledge

The project demonstrates understanding of authentication rather than relying entirely on a managed provider.

#### Multi-Tenant Compatibility

Server-side sessions integrate naturally with organization membership and role-based authorization.

#### Easy Logout

Logout can invalidate the session on the server.

### Negative Consequences

#### Session Storage Required

Every authenticated request may require a session lookup.

This introduces database access compared with purely stateless authentication.

#### Cookie Security Requirements

Cookie-based authentication requires careful consideration of:

CSRF
SameSite
Secure
HttpOnly
Domain
Path

#### Authentication Implementation Responsibility

The project is responsible for securely implementing:

Password hashing
Session management
Login
Logout
Authorization
Rate limiting

This increases development responsibility.

#### Scaling Considerations

A session lookup may become a performance consideration at larger scale.

The MVP does not require sophisticated distributed session infrastructure.

## Alternative: JWT

JWT was rejected for the MVP.

JWT could be useful for:

- Public APIs
- Mobile clients
- Distributed services
- Stateless authentication

However, these requirements are not currently part of FlowOps.

Server-side sessions provide simpler revocation and are a better fit for the browser-based MVP.

## Alternative: OAuth

OAuth was rejected for the MVP because external identity providers are not required.

It may be introduced later.

## Alternative: Managed Authentication

Managed authentication services were rejected because authentication is an important engineering area of this project.

The goal is to demonstrate understanding of the underlying mechanisms.

## Future Extensions

The authentication architecture may later support:

- Password reset
- Email verification
- OAuth
- OpenID Connect
- Multi-factor authentication
- Session management UI
- Device/session history
- Security notifications
- Account lockout policies

Each major addition should be evaluated for its security implications.

## When to Reconsider This Decision

This ADR should be revisited if:

FlowOps introduces mobile clients.
A public third-party API is introduced.
Multiple independent backend services require authentication.
External identity providers become a product requirement.
Multi-factor authentication becomes mandatory.
Session scalability becomes a significant issue.
Regulatory requirements introduce additional authentication requirements.

A new ADR should document a major authentication strategy change.

## Implementation Requirements

The following requirements result from this ADR.

### Requirement 1

Authentication uses email and password for the MVP.

### Requirement 2

Passwords are stored only as secure password hashes.

### Requirement 3

Successful authentication creates a server-side session.

### Requirement 4

The browser receives the session through a secure cookie.

### Requirement 5

Session cookies use HttpOnly.

### Requirement 6

Production session cookies use Secure.

### Requirement 7

The session cookie uses an appropriate SameSite configuration.

### Requirement 8

Sessions are stored server-side in D1.

### Requirement 9

Sessions have an expiration time.

### Requirement 10

Logout invalidates the server-side session.

### Requirement 11

Protected routes validate the session before executing business logic.

### Requirement 12

Authorization is separate from authentication.

### Requirement 13

Organization context is derived server-side.

### Requirement 14

Client-provided organization identifiers must not override authenticated context.

### Requirement 15

Authentication endpoints require brute-force protection or a documented MVP mitigation.

### Requirement 16

Authentication errors must not expose sensitive internal information.

### Requirement 17

Login errors must not unnecessarily reveal whether an account exists.

### Requirement 18

Session identifiers must never be logged.

### Requirement 19

Production secrets must never be committed to Git.

### Requirement 20

Authentication behavior must be covered by automated tests.

## Verification Checklist

Before considering authentication complete, verify:

- [ ] User registration works
- [ ] Registration validates input
- [ ] Email uniqueness is enforced
- [ ] Passwords are securely hashed
- [ ] Password hashes are never returned to the client
- [ ] Login works
- [ ] Invalid credentials return a generic error
- [ ] Successful login creates a session
- [ ] Session identifier is generated securely
- [ ] Session is stored in D1
- [ ] Session cookie uses HttpOnly
- [ ] Production session cookie uses Secure
- [ ] Appropriate SameSite configuration is implemented
- [ ] Session expiration is enforced
- [ ] Logout invalidates the session
- [ ] Logout expires the cookie
- [ ] Protected routes require authentication
- [ ] Organization context is derived server-side
- [ ] Role-based authorization is implemented
- [ ] Cross-organization access is prevented
- [ ] Authentication endpoints have rate limiting or documented mitigation
- [ ] Authentication secrets are not stored in source control
- [ ] Authentication data is not written to logs
- [ ] Authentication unit tests exist
- [ ] Authentication integration tests exist
- [ ] Authentication end-to-end tests exist

## Related Decisions

This ADR is related to:

- ADR-001 – Technology Stack
- ADR-002 – Cloudflare Architecture
- ADR-003 – Database Selection: Cloudflare D1
- ADR-005 – Multi-Tenant Architecture
- ADR-006 – Session Management

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

FlowOps will use server-side session-based authentication for the MVP.

Users authenticate using email and password. Passwords are stored exclusively as secure password hashes.

Successful authentication creates a server-side session stored in Cloudflare D1. The browser receives an opaque session identifier through a secure HTTP-only cookie.

Authentication and authorization remain separate concerns.

The authenticated user's organization and role are derived server-side and are never trusted from client-provided values.

The decision intentionally avoids JWT-based browser authentication, OAuth, and managed authentication services for the MVP.

The selected approach provides:

- Straightforward browser authentication
- Server-side session revocation
- Clear authorization boundaries
- Strong compatibility with the multi-tenant architecture
- Good portfolio value
- Full control over the authentication implementation

The project accepts the additional responsibility of implementing authentication securely as a deliberate trade-off for the architectural transparency and learning value of the project.
