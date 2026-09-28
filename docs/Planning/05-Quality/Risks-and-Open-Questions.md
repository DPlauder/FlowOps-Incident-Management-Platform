# FlowOps - Risks and Open Questions

## Purpose

This document records known risks, technical uncertainties, product decisions, and open questions for the FlowOps MVP.

The purpose is to make unresolved decisions visible before implementation and to prevent important assumptions from remaining undocumented.

The document is reviewed during sprint planning and updated whenever a significant architectural, technical, security, or product decision is made.

---

## 1. Risk Classification

Risks are classified using the following levels:

| Level    | Meaning                                                             |
| -------- | ------------------------------------------------------------------- |
| Critical | Could compromise security, data integrity, or the core MVP          |
| High     | Could significantly affect functionality, architecture, or delivery |
| Medium   | Could cause implementation problems or additional work              |
| Low      | Limited impact or mainly future improvement                         |

Risk status:

| Status    | Meaning                                  |
| --------- | ---------------------------------------- |
| Open      | Risk has not yet been addressed          |
| Mitigated | Measures exist to reduce the risk        |
| Accepted  | Risk is consciously accepted for the MVP |
| Resolved  | Risk is no longer considered relevant    |

---

## 2. Risk Register

| ID       | Risk                                                                               | Impact                                | Likelihood | Level    | Mitigation                                                                           | Status    |
| -------- | ---------------------------------------------------------------------------------- | ------------------------------------- | ---------- | -------- | ------------------------------------------------------------------------------------ | --------- |
| RISK-001 | Incorrect tenant isolation could expose data between organizations                 | Data breach / critical security issue | Medium     | Critical | Enforce organization filtering server-side and test cross-tenant access extensively  | Mitigated |
| RISK-002 | Incorrect authorization could allow users to perform privileged actions            | Security / data integrity             | Medium     | Critical | Centralize permission checks and test every role boundary                            | Mitigated |
| RISK-003 | Session handling could allow unauthorized access after logout or expiration        | Security                              | Medium     | High     | Use server-managed sessions, secure cookies, expiration and revocation checks        | Mitigated |
| RISK-004 | Invalid incident state transitions could corrupt incident lifecycle data           | Data integrity                        | Medium     | High     | Centralize lifecycle transition validation and test valid and invalid transitions    | Mitigated |
| RISK-005 | API and frontend could implement different business rules                          | Maintenance / inconsistent behavior   | Medium     | High     | Keep business rules server-side and derive API behavior from documented requirements | Open      |
| RISK-006 | Database schema changes could break existing application behavior                  | Development / deployment              | Medium     | High     | Use controlled migrations and test schema changes before deployment                  | Open      |
| RISK-007 | MVP scope could grow during implementation                                         | Delivery delay                        | High       | High     | Treat deferred features as out of scope and require explicit backlog changes         | Mitigated |
| RISK-008 | Insufficient automated testing could allow regressions                             | Reliability                           | Medium     | High     | Require unit, integration and critical E2E tests in CI                               | Mitigated |
| RISK-009 | Authentication endpoints could be abused through repeated requests                 | Security / availability               | Medium     | High     | Apply rate limiting and monitor authentication failures                              | Mitigated |
| RISK-010 | Unexpected runtime errors could expose internal implementation details             | Security                              | Medium     | High     | Use centralized error handling and generic production error responses                | Mitigated |
| RISK-011 | External platform limitations could affect infrastructure behavior                 | Availability / implementation         | Medium     | Medium   | Keep platform-specific code isolated and document provider dependencies              | Open      |
| RISK-012 | Insufficient observability could make production incidents difficult to diagnose   | Operations                            | Medium     | Medium   | Implement structured logging and meaningful error/event information                  | Open      |
| RISK-013 | Postmortem workflow could become inconsistent with incident lifecycle              | Data integrity                        | Low        | Medium   | Validate postmortem creation and publication against incident state                  | Mitigated |
| RISK-014 | Large incident timelines could negatively affect query performance                 | Performance                           | Low        | Medium   | Add pagination and appropriate database indexes                                      | Open      |
| RISK-015 | Incorrect pagination or filtering could expose resources from another organization | Security / data integrity             | Medium     | High     | Apply tenant filtering before pagination, filtering and sorting                      | Mitigated |

---

## 3. Critical Security Risks

Security is a primary concern because FlowOps is a multi-tenant application.

The following risks are considered critical and must be addressed before MVP release.

## 3.1 Cross-Tenant Data Access

A user must never be able to access resources belonging to another organization.

This applies to:

- organizations
- members
- services
- incidents
- events
- comments
- postmortems
- dashboard data

The organization must be determined from the authenticated session and server-side membership information.

The client must never be trusted to define the organization boundary.

### Required protection

```text
Authenticated Session
        |
        v
User
        |
        v
Organization Membership
        |
        v
Authorized Organization
        |
        v
Resource Query
```

A request such as:

GET /api/incidents/:id

must not simply query by id.

The query must also verify organization membership.

## 4. Authorization Risks

FlowOps currently defines the following roles:

- `OWNER`
- `ADMIN`
- `MEMBER`

Authorization must be performed server-side.

The client must not be able to escalate privileges by sending a different role.

For example:

{
"role": "OWNER"
}

must never be sufficient to grant OWNER permissions.

The server must determine the user's actual role from the authenticated membership.

## 5. Authentication and Session Risks

Authentication depends on secure session management.

authentication endpoints must be protected against abuse
The following requirements apply:

- passwords are never stored in plain text
- session identifiers must be unpredictable
- session cookies must use appropriate security attributes
- logout must invalidate the session
- expired sessions must be rejected
- protected routes must verify authentication
- authentication endpoints must be protected against abuse

The implementation must not expose sensitive authentication information through API responses.

## 6. Data Integrity Risks

### 6.1 Incident Lifecycle

Incidents follow a defined lifecycle:

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

Invalid transitions must be rejected.

The transition logic should be implemented centrally rather than duplicated across multiple API endpoints.

### 6.2 Postmortem Lifecycle

The postmortem workflow depends on the incident lifecycle.

Expected flow:

Incident
|
v
RESOLVED
|
v
Postmortem Created
|
v
Postmortem Edited
|
v
Review
|
v
Published

A postmortem must not be created or published when the required prerequisites are not fulfilled.

## 7. API Consistency Risk

The API is used by the frontend and represents the application's external contract.

Changes to API behavior can affect:

documentation

- frontend implementation
- integration tests
- E2E tests
- documentation
- future clients

Therefore, API changes should update the following together:

API.md

- User Stories
- Tests
- Implementation

No undocumented API behavior should be introduced during implementation.

## 8. Database and Migration Risks

The database schema is a critical dependency for the application.

Potential risks include:

- incorrect foreign keys
- missing indexes
- inconsistent constraints
- migration failures
- incompatible schema changes
- accidental data loss

Database changes should therefore be introduced through controlled migrations.

Destructive schema changes should not be performed without explicit review.

## 9. Performance Risks

Performance is not the primary MVP objective, but several areas require attention.

dashboard aggregation
Potential hotspots include:

- incident listing
- incident timeline queries
- dashboard aggregation
- comments
- filtering
- sorting
- pagination

Tenant filtering must happen before returning data to the application.

Pagination must be applied consistently to potentially large collections.

## 10. Infrastructure Risks

FlowOps uses Cloudflare-based infrastructure.

Platform-specific behavior may affect:

database access
deployment
sessions
runtime APIs
environment variables
logging
local development

Provider-specific code should therefore remain isolated where practical.

The application should avoid unnecessary coupling to platform-specific implementation details.

## 11. Testing Risks

A low test coverage level could allow critical regressions.

authorization
tenant isolation
events
dashboard
The following areas require automated coverage:

- authentication
- sessions
- authorization
- tenant isolation
- incident lifecycle
- severity validation
- comments
- events
- postmortems
- dashboard
- API error handling

Critical E2E workflows must run before an MVP release.

## 12. Scope Risks

The MVP must remain limited to the functionality defined in the MVP backlog.

The following principle applies:

A feature that is not required for the MVP should not be implemented simply because it would be useful.

Deferred functionality should remain documented in the backlog.

Examples include:

service deactivation
advanced notification systems
advanced analytics
external integrations
complex invitation systems
additional reporting features

These features may be considered after the MVP.

## 13. Open Questions

The following questions are currently open or require validation during implementation.

| ID    | Question                                                                    | Impact                                                    | Decision Needed By                       | Status                             | Decision                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
|       | Q-001                                                                       | What exact mechanism is used for joining an organization? | Medium                                   | Before organization implementation | Open                                                                                                                                                                                                                  | The API currently defines `POST /api/organization/join`, but the exact joining mechanism (for example invitation, join code, or another controlled flow) is not yet finalized. |     |
| Q-002 | Can a user belong to multiple organizations?                                | High                                                      | Before organization implementation       | Resolved                           | See ADR-007                                                                                                                                                                                                           |
| Q-003 | What happens when a user's membership is disabled?                          | Medium                                                    | Before authorization implementation      | Resolved                           | Access is immediately revoked while the membership remains stored for auditability.                                                                                                                                   |
| Q-004 | Can an OWNER leave an organization?                                         | Medium                                                    | Before organization implementation       | Resolved                           | Only if another OWNER remains.                                                                                                                                                                                        |
| Q-005 | What is the exact authorization model for the available organization roles? | High                                                      | Before authorization implementation      | Resolved                           | Defined in Authorization-Matrix.md                                                                                                                                                                                    |
| Q-006 | Which roles can create services?                                            | Medium                                                    | Before service implementation            | Resolved                           | defined in Authorization-Matrix.md                                                                                                                                                                                    |
| Q-007 | Which roles can create and publish postmortems?                             | Medium                                                    | Before postmortem implementation         | Resolved                           | defined in Authorization-Matrix.md                                                                                                                                                                                    |
| Q-008 | Which roles can change incident severity?                                   | Medium                                                    | Before incident implementation           | Resolved                           | defined in Authorization-Matrix.md                                                                                                                                                                                    |
| Q-009 | Which roles can perform incident state transitions?                         | Medium                                                    | Before incident lifecycle implementation | Resolved                           | defined in Authorization-Matrix.md                                                                                                                                                                                    |
| Q-010 | How long should sessions remain valid?                                      | Medium                                                    | Before authentication implementation     | Resolved                           | Maximum lifetime: 30 days; idle expiration: 7 days. Logout immediately revokes the session. See Security.md and ADR-006.                                                                                              |
| Q-011 | What exact rate limits should authentication endpoints use?                 | Medium                                                    | Before authentication implementation     | Resolved                           | Defined in Security.md                                                                                                                                                                                                |
| Q-012 | How should application errors be logged in production?                      | Medium                                                    | Before release                           | Resolved                           | Defined in Security.md                                                                                                                                                                                                |
| Q-013 | How should very large incident timelines be paginated?                      | Low                                                       | Before production-scale testing          | Resolved                           | Defined in API.md                                                                                                                                                                                                     |
| Q-014 | What dashboard metrics are required for the MVP?                            | Medium                                                    | Before dashboard implementation          | Open                               | The API currently defines `GET /api/dashboard`, but the exact metrics and response structure are not yet finalized. At minimum, the dashboard is expected to support open, critical, and recently resolved incidents. |
| Q-015 | Which fields are required before a postmortem can be published?             | Medium                                                    | Before postmortem implementation         | Open                               | The API defines a DRAFT → REVIEW → PUBLISHED workflow, but the exact validation requirements for review and publication are not yet finalized.                                                                        |

## 14. MVP Decisions

The following decisions are intentionally made to keep the MVP focused.

### 14.1 No Incident Deletion

Incidents are not deleted as part of the MVP.

Reason:

incident history should remain traceable
events and postmortems depend on historical data
deletion introduces additional data integrity questions

Incident deletion is therefore outside the MVP scope.

### 14.2 No Service Deactivation

Service deactivation is marked as deferred.

The MVP focuses on:

creating services
viewing services
updating services
assigning incidents to services

Deactivation can be implemented later if required.

### 14.3 No Advanced Notification System

The MVP does not require a complete notification infrastructure.

Potential future features:

- email notifications
- webhook notifications
- Slack integration
- Microsoft Teams integration
- escalation policies

These remain outside the MVP.

### 14.4 No External Monitoring Integration

The MVP does not depend on external monitoring platforms.

Incidents are created through the FlowOps application itself.

Future integrations may include:

- monitoring systems
- uptime monitoring
- alerting platforms
- deployment systems

## 15. Assumptions

The following assumptions are currently used during planning.

| ID    | Assumption                                                                       |
| ----- | -------------------------------------------------------------------------------- |
| A-001 | Users must be authenticated before accessing protected application functionality |
| A-002 | Every protected resource belongs to an organization                              |
| A-003 | Every user accessing an organization has an explicit membership                  |
| A-004 | A membership has one defined role                                                |
| A-005 | Authorization is always enforced server-side                                     |
| A-006 | Organization membership is the basis for tenant isolation                        |
| A-007 | Incident lifecycle transitions are centrally validated                           |
| A-008 | Important incident changes generate timeline events                              |
| A-009 | Postmortems belong to incidents                                                  |
| A-010 | Postmortems follow the defined review and publication workflow                   |
| A-011 | The MVP does not require external monitoring integrations                        |
| A-012 | The MVP prioritizes correctness and security over advanced scalability           |

## 16. Decision Rules

When an open question is encountered during implementation, the following rules apply.

Rule 1 - Security First

If a decision affects authentication, authorization, or tenant isolation, the more restrictive behavior should be preferred until the requirement is clarified.

Rule 2 - MVP Scope

If a feature is not required by the MVP backlog, it should not automatically be added.

Rule 3 - Server Authority

Business-critical decisions must be enforced by the server.

Rule 4 - Explicit Decisions

Important architectural or product decisions should be documented rather than remaining implicit in code.

Rule 5 - Update Documentation

When an open question is resolved, update this document and the affected specification.

Potentially affected documents include:

- `API.md`
- `Datenmodell.md`
- `Architecture.md`
- `Security.md`
- User Stories
- MVP Backlog
- Testing Matrix
- ADRs

## 17. Risk Review Process

Risks and open questions are reviewed:

- before starting a new sprint
- when an architectural decision changes
- when a security-sensitive feature is implemented
- when a major defect is discovered
- before MVP release

Resolved questions should not simply be deleted.

Instead, the decision should be recorded in the relevant documentation or ADR.

## 18. MVP Risk Acceptance Criteria

The MVP must not be released while any of the following conditions remain unresolved:

authentication bypass

- critical tenant isolation vulnerability
- privilege escalation vulnerability
- authentication bypass
- session invalidation failure
- critical data integrity issue
- critical incident lifecycle defect
- critical postmortem workflow defect
- failing critical security tests

Medium and low-level risks may be accepted for the MVP if they are documented and do not compromise security or core functionality.
