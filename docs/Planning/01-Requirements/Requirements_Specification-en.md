# Requirements Specification: FlowOps

> **Project objective:** Develop a realistic, production-oriented web application as a publicly documented engineering journey.

| Project detail   | Description                                      |
| ---------------- | ------------------------------------------------ |
| **Project**      | FlowOps                                          |
| **Project type** | Incident management platform for technical teams |
| **Version**      | 1.0                                              |
| **Date**         | August 2026                                      |
| **Budget**       | €0                                               |

## 1. Project Description

FlowOps is a web-based incident management platform for small technical teams.

The application is intended to help teams record, prioritize, manage, and subsequently document technical incidents in a central and traceable manner.

The focus of the project is not limited to the finished product. The entire development process will be documented in a multi-week blog series.

The following aspects should be made visible in particular:

- Requirements analysis
- Technical planning
- Architecture decisions
- Data modeling
- Implementation
- Testing
- Troubleshooting
- Security
- Deployment
- Technical documentation
- Reflection and lessons learned

The project should demonstrate how a mid-level developer independently develops a software project from the initial idea to a working application.

## 2. Project Goals

### 2.1 Primary Goal

Develop a functioning incident management platform that can represent a complete incident lifecycle.

For example, a user should be able to:

- create an incident,
- set its severity,
- assign an owner,
- change its status,
- document comments and events,
- resolve the incident,
- and subsequently document a postmortem.

### 2.2 Secondary Goals

The project should also demonstrate that the developer can:

- analyze requirements in a structured way,
- define a meaningful MVP,
- justify architecture decisions,
- use modern web technologies appropriately,
- write clean and maintainable code,
- use automated tests,
- analyze errors systematically,
- deploy an application,
- and document technical decisions in an understandable way.

## 3. Target Audience

FlowOps is primarily aimed at small to medium-sized technical teams.

Examples:

Software development teams
IT departments
DevOps teams
Small SaaS companies
Technical project teams

The application is deliberately not designed as a complete enterprise solution.

## 4. User Roles

Three roles are planned for the MVP.

### 4.1 OWNER

OWNERs can:

Manage organizations
Manage users
Manage user roles
Manage incidents
View all incidents within the organization
Manage systems or services

### 4.2 ADMIN

ADMINs can:

Create incidents
View incidents
Edit incidents
Assign themselves or other users
Add comments
Change status
Change severity
Resolve incidents
Edit postmortems

### 4.3 MEMBER

MEMBERs can:

View incidents
View incident details
Read comments and events

MEMBERs may not change critical data.

## 5. Functional Requirements

### FR-001 – Registration

Users should be able to create an account.

Registration requires at least:

Name
Email address
Password

After successful registration, the user should be authenticated.

### FR-002 – Login

Users should be able to log in with their credentials.

After a successful login, an authenticated session is created.

### FR-003 – Logout

Users must be able to actively log out.

The session must be terminated server-side or by means of another suitable secure mechanism.

### FR-004 – Organization

Users should be assigned to an organization.

An organization represents the logical tenant of the application.

Data belonging to one organization must not be visible to users from another organization.

### FR-005 – User Management

OWNERs and ADMINs should be able to manage the members of their organization.

At minimum, the following is required:

View users
Change roles
Deactivate users

## 6. Incident Management

### FR-006 – Create Incident

An authorized user should be able to create an incident.

An incident requires at least:

Title
Description
Severity
Status
Creator
Creation date

### FR-007 – Incident Status

An incident has a defined lifecycle.

Proposed statuses:

```text
OPEN -> INVESTIGATING -> MITIGATED -> RESOLVED -> CLOSED
```

Not every status change should be possible arbitrarily.

The allowed transitions are defined by the business logic.

### FR-008 – Severity

Every incident has a severity.

Proposed values:

| Value    | Meaning  |
| -------- | -------- |
| **SEV1** | Critical |
| **SEV2** | High     |
| **SEV3** | Medium   |
| **SEV4** | Low      |

The severity must be changeable after creation.

### FR-009 – Assignee

An incident can be assigned to a user.

The assignment should be changeable at any time.

### FR-010 – Incident Overview

Users should receive an overview of all incidents visible to them.

The overview should contain at least the following information:

Title
Status
Severity
Assignee
Creator
Creation date

### FR-011 – Incident Filters

The incident list should be filterable.

At minimum:

Status
Severity
Assignee

Optional:

Time period
Creator

### FR-012 – Incident Search

Users should be able to search for incidents by their title or description.

## 7. Incident Timeline

### FR-013 – Events

Changes to an incident should be traceable.

Examples:

Incident created
Severity changed
Status changed
Assignee changed
Comment added
Incident resolved

These events are displayed as a timeline.

### FR-014 – Comments

Authorized users should be able to add comments to an incident.

Where possible, comments should not simply be deleted without leaving a trace.

### FR-015 – Audit Trail

Critical changes should be logged.

At minimum:

Who made the change?
What was changed?
When was it changed?

Example:

Dominik changed severity
SEV3 -> SEV2

25 August 2026 14:32

## 8. Postmortem

### FR-016 – Create Postmortem

After an incident has been resolved, it should be possible to create a postmortem.

The postmortem should contain at least:

Summary
Impact
Root cause
Resolution
Lessons learned
Action items

### FR-017 – Postmortem Status

A postmortem may have the following states, for example:

DRAFT
↓
REVIEW
↓
PUBLISHED

## 9. Services / Systems

### FR-018 – Manage Services

OWNERs and ADMINs should be able to define technical services or systems.

Examples:

API
Web application
Database
Authentication service
Payment service

An incident can be assigned to a service.

## 10. Dashboard

### FR-019 – Dashboard

After logging in, the user should see a dashboard.

The dashboard should provide a quick overview of the current state.

At minimum:

Open incidents
Critical incidents
Incidents in progress
Recently resolved incidents

Optional:

Average resolution time
Incidents per severity
Incidents per service

## 11. Permissions

### FR-020 – Authorization

The application must check server-side whether a user is allowed to perform an action.

Permissions must not be implemented exclusively in the frontend.

Example:

MEMBER
↓
GET /incidents ✓
POST /incidents ✗
PATCH /incidents ✗

## 12. Technical Requirements

### TR-001 – Frontend

The frontend will be developed with modern React and TypeScript technologies.

Planned stack:

React
TypeScript
Tailwind CSS

### TR-002 – Backend

The API will be implemented with TypeScript.

Planned:

Hono
Cloudflare Workers

### TR-003 – Database

Cloudflare D1 will be used as the relational database.

The data model should be managed using migrations.

### TR-004 – API

The application should provide a clearly structured HTTP API.

The API should:

Accept validated input
Return errors consistently
Take authentication into account
Check authorization server-side

### TR-005 – TypeScript

TypeScript should be used in both the frontend and backend.

The use of `any` should be avoided wherever reasonably possible.

## 13. Authentication & Security

### TR-006 – Password Storage

Passwords must never be stored in plain text.

A suitable password hashing mechanism must be used.

### TR-007 – Sessions

Authenticated users should be identified through secure sessions.

Suitable cookie security mechanisms should be used for this purpose.

### TR-008 – Access Protection

Protected API endpoints may only be used by authenticated and appropriately authorized users.

### TR-009 – Tenant Isolation

A user must not be able to retrieve or modify data belonging to another organization.

This check must be performed server-side.

### TR-010 – Input Validation

User input must be validated server-side.

Invalid data must not be transferred to the database without validation.

## 14. Testing

### TR-011 – Unit Tests

Critical business logic should be covered by unit tests.

In particular:

Status transitions
Permissions
Validations
Incident logic

### TR-012 – Integration Tests

API endpoints and their interaction with the database should be tested.

### TR-013 – End-to-End Tests

At least one complete critical user flow should be covered by an E2E test.

Example:

Login
↓
Create incident
↓
Edit incident
↓
Change status
↓
Add comment
↓
Resolve incident
↓
Create postmortem

## 15. Quality

### TR-014 – Linting

The source code should be automatically checked for known problems.

### TR-015 – Formatting

The code should be formatted consistently.

### TR-016 – Type Checking

TypeScript errors should be part of the CI process.

### TR-017 – CI

At least the following checks should run automatically on a pull request or push:

Install
↓
Lint
↓
Typecheck
↓
Tests
↓
Build

## 16. Deployment

### TR-018 – Deployment

FlowOps should be deployed so that it is publicly accessible.

The deployment should be automated or reproducible.

### TR-019 – Costs

The entire project should operate without ongoing infrastructure costs.

Target budget: €0

Only free or free-tier services should be used, as long as they are sufficient for the MVP.

## 17. Non-Functional Requirements

### NFR-001 – Performance

The application should respond efficiently for a small user base.

Particularly important pages:

Login
Dashboard
Incident list
Incident detail page

### NFR-002 – Usability

The user interface should be:

Understandable
Consistent
Responsive
Keyboard-friendly

### NFR-003 – Accessibility

The application should follow basic accessibility principles.

In particular:

Semantic HTML
Sufficient contrast
Keyboard operation
Understandable forms
Visible focus states

### NFR-004 – Maintainability

The code should be structured modularly.

Business logic should not be directly coupled to UI components wherever possible.

### NFR-005 – Documentation

Important technical decisions should be documented.

These include, for example:

- Architecture decisions
- Data model
- Authentication
- Testing strategy
- Deployment

## 18. MVP Scope

To keep the project realistic, only a clearly defined MVP will be implemented initially.

> **Version 1.0:** The following features will deliberately not be implemented and remain possible extensions for later versions.

### Must be included

- Registration
- Login / logout
- Organizations
- User roles
- Create and edit incidents
- Incident lifecycle
- Severity and assignment
- Comments, timeline, and audit events
- Incident list and filters
- Dashboard
- Postmortem
- Server-side authorization
- Tests, CI, and deployment

### Can be added later

- Email notifications
- Slack integration
- Webhooks
- File uploads
- Complex analytics
- Service health checks
- Automatic incident creation
- External monitoring integrations
- SSO
- 2FA

### Explicitly out of scope for the MVP

- Mobile app
- Native desktop application
- Enterprise SSO
- Complex billing
- Multi-region infrastructure
- Highly available enterprise architecture
- AI-based incident analysis

## 19. Definition of Success

The project is considered successful when a user can complete the following flow from start to finish:

```text
Create account
	-> Create or join organization
	-> Login
	-> Create incident
	-> Set severity
	-> Select service
	-> Assign employee
	-> Investigate incident
	-> Add comments
	-> Change status
	-> Resolve incident
	-> Create postmortem
```

All critical actions must be:

- authorized,
- validated,
- tested
- and logged in a traceable manner.

## 20. Engineering Journal

An important part of the project is the public documentation of the development process.

Each major development phase will be documented in a weekly blog post.

The posts should show not only the result, but also the actual decision-making process.

Where possible, each post should cover the following points:

Initial situation

What was the current state?

Goal

What was intended to be achieved that week?

Approach

How was the problem addressed?

Decisions

Which technical decisions were made?

Alternatives

Which other solutions were considered?

Problems

What did not work?

Solution

How was the problem solved?

Result

What was created in the end?

Learnings

What was learned from the work?

Next steps

What will be done the following week?

## 21. Planned Development Phases

| Phase | Topic               | Result                  |
| ----- | ------------------- | ----------------------- |
| 01    | Idea & Scope        | Requirements            |
| 02    | Architecture        | Technical concept       |
| 03    | Data model          | Database schema         |
| 04    | Foundation          | Development environment |
| 05    | Authentication      | Login & sessions        |
| 06    | Incident management | Core functionality      |
| 07    | Timeline & audit    | Traceability            |
| 08    | Postmortems         | Incident closure        |
| 09    | Testing             | Test strategy           |
| 10    | Deployment          | Production version      |
| 11    | Retrospective       | Lessons learned         |

## 22. Most Important Project Principle

FlowOps should not become as large as possible.

The most important principle is:

Build only what is necessary, but build it properly.

The project should preferably have a manageable scope with clean architecture, tests, security, and traceable decisions rather than a large number of superficial features.

This keeps the focus not only on the product, but also on the actual goal of the project:

To demonstrate how I work as a software developer.
