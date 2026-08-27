# ADR-007: Multi-Organization Membership

## Status

Accepted

## Date

2026-08

## Context

FlowOps is a multi-tenant incident management platform.

A user may need to work with multiple organizations. The system therefore needs a clear membership model that defines how users are associated with organizations and how access is controlled.

## Decision

A user may belong to multiple organizations.

Organization membership is represented through a dedicated membership relationship between users and organizations.

A membership contains the user's role and membership status within the organization.

A user may therefore have different roles in different organizations.

For example:

User A:

- Organization A → OWNER
- Organization B → MEMBER

Organizations may have multiple OWNER users.

A user cannot leave an organization if doing so would leave the organization without an OWNER.

Disabled memberships immediately lose access to the organization's resources. The membership record itself remains stored for auditability.

## Consequences

### Positive

- Supports realistic multi-tenant SaaS usage.
- Allows users to work with multiple organizations.
- Roles can differ between organizations.
- Multiple owners prevent unnecessary single-owner dependencies.
- Disabled memberships remain auditable.

### Negative

- Authorization logic becomes more complex.
- The active organization must be resolved for each authenticated request.
- Membership status must be checked in addition to authentication.
- Additional database relationships are required.

## Alternatives Considered

### Single organization per user

Rejected because it limits the platform to users belonging to only one organization.

### One global role per user

Rejected because roles need to be organization-specific.

### Hard-delete disabled memberships

Rejected because membership history should remain available for auditability.

## Related Decisions

- [ADR-004 – Authentication Strategy](ADR-004-Authentication-Strategy.md)
- [ADR-005 – Multi-Tenant Architecture](ADR-005-Multi-Tenant-Architecture.md)
- [ADR-006 – Session Management](ADR-006-Session-Management.md)

## Related Documentation

- [Data-Model.md](../Data-Model.md)
- [API.md](../API.md)
- [Security.md](../Security.md)
