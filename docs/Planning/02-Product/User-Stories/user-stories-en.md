# FlowOps – User Stories

## Overview

The backlog currently contains **60 user stories** across 16 epics.

|      Epic | Area                   | Stories |
| --------: | ---------------------- | ------: |
|         1 | Authentication         |       4 |
|         2 | Organizations          |       3 |
|         3 | Users & Roles          |       4 |
|         4 | Services               |       4 |
|         5 | Incident Management    |       5 |
|         6 | Incident Lifecycle     |       5 |
|         7 | Incident List & Search |       5 |
|         8 | Timeline & Audit       |       3 |
|         9 | Postmortems            |       4 |
|        10 | Dashboard              |       4 |
|        11 | Security               |       3 |
|        12 | Testing                |       3 |
|        13 | Code Quality & CI      |       4 |
|        14 | Deployment             |       3 |
|        15 | Accessibility & UX     |       3 |
|        16 | Documentation          |       3 |
| **Total** |                        |  **60** |

## Epic 1 – Authentication

### US-001 – Create an account

As a new user
I want to be able to create an account,
so that I can use FlowOps.

Acceptance Criteria:

The user can enter a name, email address, and password.
The email address must be valid.
The password must meet the defined minimum requirements.
The email address must not already be registered.
The password is not stored in plain text.
A user account is created after successful registration.
The user receives a valid session or is logged in.

Reference: FR-001, TR-006

### US-002 – Log in

As a registered user
I want to be able to log in,
so that I can access my organization and its data.

Acceptance Criteria:

The user can enter an email address and password.
Valid credentials result in a successful login.
Invalid credentials result in an understandable error message.
A secure session is created.
Protected areas are accessible after a successful login.

Reference: FR-002, TR-007, TR-008

### US-003 – Log out

As a logged-in user
I want to be able to log out,
so that my session is ended.

Acceptance Criteria:

The user can log out.
The session becomes invalid.
Protected areas are no longer accessible afterwards.
The user is redirected to the login page.

Reference: FR-003

### US-004 – Protect unauthenticated areas

As the application operator
I want protected areas to be accessible only to authenticated users,
so that unauthorized people cannot access data.

Acceptance Criteria:

Unauthenticated requests to protected endpoints are rejected.
Users are redirected to the login page on protected UI pages.
Authorization is checked server-side.

Reference: TR-008

### Authentication – Session Management

> **Additional Security Requirement**
>
> Session management is an additional security requirement for the authentication flow. It does not represent a separate user-facing feature, but defines how authenticated sessions must behave.

The authentication system must implement the following session policy:

- Sessions are stored server-side.
- Sessions are identified through secure HTTP-only cookies.
- A session has a maximum lifetime of 30 days from `created_at`.
- A session expires after 7 days of inactivity based on `last_used_at`.
- Logout immediately revokes the current session.
- Expired sessions cannot access protected resources.
- Revoked sessions cannot access protected resources.
- Changing a user's password revokes all active sessions.
- Each successful authenticated request updates `last_used_at`.
- Expired sessions are removed or invalidated during normal session cleanup.

The detailed security requirements are defined in `Security.md`.

Reference: Security.md, ADR-006 – Session Management

## Epic 2 – Organizations

### US-005 – Create an organization

As a new user
I want to be able to create an organization,
so that I can set up FlowOps for my team.

Acceptance Criteria:

The user can enter an organization name.
An organization is created.
The creating user receives the **OWNER** role.
The organization can be uniquely identified.
An **ACTIVE** membership is created for the user who creates the organization.

Reference: FR-004

### US-006 – Join an organization

As a user
I want to be able to join an organization,
so that I can work together with my team.

Acceptance Criteria:

The user can join an intended organization.
A user may belong to multiple organizations.
An **ACTIVE** membership is created for the user.
The membership receives a defined organization-specific role.
The user can subsequently access the organization data released for them.

### US-007 – Isolate organization data

As the platform operator
I want organizations to be completely isolated from one another,
so that users can never see data belonging to other organizations.

Acceptance Criteria:

Every relevant resource is assigned to an organization.
API requests take the user's organization into account.
Direct access to foreign resources is prevented server-side.
A user cannot modify data belonging to another organization.

Reference: FR-004, TR-009

## Epic 3 – Users & Roles

### US-008 – View members

As an administrator
I want to be able to see all members of my organization,
so that I have an overview of my team.

Acceptance Criteria:

Members are displayed.
Name and role are visible.
Membership status is visible.
Only members of the user's own organization are displayed.

Reference: FR-005

### US-009 – Change a user role

As an administrator
I want to be able to change a member's role,
so that I can manage their permissions.

Acceptance Criteria:

The administrator can change a member's organization-specific role.
Available roles are defined.
Changes are saved.
The new permissions take effect immediately.

Reference: FR-005

### US-010 – Deactivate a user

As an administrator
I want to be able to deactivate a user's membership,
so that former team members no longer have access to the organization.

Acceptance Criteria:

The administrator can deactivate a user's membership.
The membership status is set to **DISABLED**.
Access to the organization and its resources ends immediately, even if the session is still valid.
Historical actions by the user are retained.

Reference: FR-005

### US-011 – Apply permissions according to the role

As an administrator
I want each user role to be able to perform only its intended actions,
so that sensitive functions are protected.

Acceptance Criteria:

OWNERs can manage the organization and its members.
ADMINs can manage operational resources and incidents.
MEMBERs can participate in incident management according to the defined permissions.
Unauthorized actions are rejected server-side.

Reference: FR-020

## Epic 4 – Services

### US-012 – Create a service

As an administrator
I want to be able to create a technical service,
so that incidents can be assigned to a specific system.

Acceptance Criteria:

The administrator can enter a name.
The service is assigned to the organization.
The service can subsequently be selected.

Reference: FR-018

### US-013 – View services

As a team member
I want to be able to see my organization's services,
so that I can assign incidents to the correct system.

### US-014 – Edit a service

As an administrator
I want to be able to edit a service,
so that its information remains up to date.

### US-015 – Deactivate a service

As an administrator
I want to be able to deactivate a service,
so that systems no longer in use are not offered for new incidents.

## Epic 5 – Incident Management

### US-016 – Create an incident

As a team member
I want to be able to create an incident,
so that I can document a technical disruption.

Acceptance Criteria:

The title is required.
The description is required.
The severity is required.
The initial status is OPEN.
The creator is assigned automatically.
The creation timestamp is stored automatically.
The incident is assigned to the current organization.

Reference: FR-006

### US-017 – View an incident

As a team member
I want to be able to see the details of an incident,
so that I can understand its current state and history.

Acceptance Criteria:

The title is displayed.
The description is displayed.
The status is displayed.
The severity is displayed.
The service is displayed.
The assignee is displayed.
The timeline is displayed.
The postmortem is displayed if one exists.

### US-018 – Edit an incident

As an authorized team member
I want to be able to edit an incident,
so that changing information can be updated.

Acceptance Criteria:

The title can be changed.
The description can be changed.
The service can be changed.
Changes are saved.
Changes are logged in a traceable manner.

### US-019 – Set incident severity

As a team member
I want to be able to set an incident's severity,
so that the urgency of the problem is visible.

Acceptance Criteria:

The API currently supports the values `low`, `medium`, `high`, and `critical`.
The binding mapping to the data model values `SEV1` through `SEV4` must be defined before implementation.
The severity can be changed.
The change is logged as an event.

Reference: FR-008

### US-020 – Assign an incident

As a team member
I want to be able to assign an incident to a user,
so that it is clear who is responsible for handling it.

Acceptance Criteria:

Users from the organization can be selected.
The assignee is saved.
The change is logged in the timeline.

Reference: FR-009

## Epic 6 – Incident Lifecycle

### US-021 – Investigate an incident

As a team member
I want to be able to set an incident to INVESTIGATING,
so that it is visible that the team is actively looking for the cause.

### US-022 – Mitigate an incident

As a team member
I want to be able to set an incident to MITIGATED,
so that it is visible that the impact has initially been reduced.

### US-023 – Resolve an incident

As a team member
I want to be able to set an incident to RESOLVED,
so that it is documented that the disruption has been fixed.

### US-024 – Close an incident

As an authorized user
I want to be able to close a resolved incident,
so that the incident lifecycle is completed.

### US-025 – Prevent invalid status transitions

As the application operator
I want only allowed status transitions to be possible,
so that incidents have a consistent lifecycle.

Acceptance Criteria:

For example:

OPEN -> INVESTIGATING ✓
INVESTIGATING -> MITIGATED ✓
MITIGATED -> RESOLVED ✓
RESOLVED -> CLOSED ✓

Unauthorized transitions are rejected.

Reference: FR-007

## Epic 7 – Incident List & Search

### US-026 – View incidents

As a team member
I want to be able to see all incidents visible to me,
so that I have an overview of current and past disruptions.

Acceptance Criteria:

Incidents from the user's own organization are displayed.
The title is displayed.
The status is displayed.
The severity is displayed.
The assignee is displayed.
The creator is displayed.
The creation date is displayed.

Reference: FR-010

### US-027 – Filter incidents by status

As a team member
I want to be able to filter incidents by status,
so that I can see, for example, only open incidents.

### US-028 – Filter incidents by severity

As a team member
I want to be able to filter incidents by severity,
so that I can quickly find critical problems.

### US-029 – Filter incidents by assignee

As a team member
I want to be able to filter incidents by assignee,
so that I can see the tasks assigned to a specific person.

### US-030 – Search incidents

As a team member
I want to be able to search for incidents,
so that I can quickly find specific problems again.

Acceptance Criteria:

The search includes the title at minimum.
The description can also be searched.
Results belong exclusively to the user's own organization.

Reference: FR-012

## Epic 8 – Incident Timeline & Audit

### US-031 – View the incident timeline

As a team member
I want to be able to see an incident's timeline,
so that I can understand what happened during its handling.

### US-032 – Add a comment

As a team member
I want to be able to add a comment to an incident,
so that I can share information and observations with the team.

Acceptance Criteria:

The comment requires content.
The author is stored automatically.
The timestamp is stored automatically.
The comment appears in the timeline.

Reference: FR-014

### US-033 – Trace changes

As a team member
I want to be able to trace important changes to an incident,
so that it is always clear what happened.

Acceptance Criteria:

The change includes the user.
The change includes the timestamp.
The change includes the affected property.
The old and new values are stored for relevant changes.

Reference: FR-013, FR-015

## Epic 9 – Postmortems

### US-034 – Create a postmortem

As a team member
I want to be able to create a postmortem after an incident,
so that the cause and the resulting insights are documented.

Acceptance Criteria:

A postmortem can be created for a completed incident.
A summary can be entered.
The impact can be documented.
The root cause can be documented.
The resolution can be documented.
Lessons learned can be documented.
Action items can be documented according to the current API contract.

Reference: FR-016

### US-035 – Edit a postmortem

As an authorized team member
I want to be able to edit a postmortem,
so that missing information can be added.

### US-036 – Submit a postmortem for review

As an authorized team member
I want to be able to submit a postmortem for review,
so that other team members can check it.

### US-037 – Publish a postmortem

As an authorized team member
I want to be able to publish a reviewed postmortem,
so that the incident results are documented permanently.

Reference: FR-017

## Epic 10 – Dashboard

### US-038 – View the dashboard

As a team member
I want to see a dashboard after logging in,
so that I can quickly get an overview of the current situation.

### US-039 – View open incidents

As a team member
I want to see the number of open incidents,
so that I can assess the current workload.

### US-040 – View critical incidents

As a team member
I want critical incidents to be displayed prominently,
so that urgent problems are not overlooked.

### US-041 – View recently resolved incidents

As a team member
I want to see recently resolved incidents,
so that I have an overview of the latest completed disruptions.

## Epic 11 – Security

### US-042 – Validate input

As the application operator
I want user input to be validated,
so that invalid or unexpected data is not processed.

Acceptance Criteria:

Input is validated server-side.
Required fields are checked.
Data types are checked.
Invalid values are rejected.
Validation errors are returned in an understandable way.

Reference: TR-010

### US-043 – Protect foreign resources

As the application operator
I want users to be unable to access resources belonging to other organizations,
so that sensitive customer data remains protected.

Acceptance Criteria:

Direct access to foreign resources fails.
Foreign resources cannot be edited.
Foreign resources cannot become visible through search or filter functions.

Reference: TR-009

### US-044 – Check authorization server-side

As the application operator
I want authorization to be checked server-side for every protected action,
so that a user cannot bypass frontend restrictions.

Reference: FR-020

## Epic 12 – Quality & Testing

These stories are less typical end-user user stories, but they are extremely important for this application project.

### US-045 – Test business logic

As a developer
I want to test critical business logic automatically,
so that changes do not unknowingly break existing functionality.

Acceptance Criteria:

Status transitions are tested.
Permissions are tested.
Validations are tested.
Critical incident logic is tested.

Reference: TR-011

### US-046 – Test the API

As a developer
I want to test the API automatically,
so that the interaction between the API, business logic, and database works reliably.

Reference: TR-012

### US-047 – Test the critical user flow

As a developer
I want to test a complete user workflow automatically,
so that I can ensure the most important functions work together.

Example:

Login
↓
Create incident
↓
Edit incident
↓
Add comment
↓
Change status
↓
Resolve incident
↓
Create postmortem

Reference: TR-013

## Epic 13 – Code Quality & CI

### US-048 – Lint code automatically

As a developer
I want my code to be checked automatically for known problems,
so that errors are detected early.

Reference: TR-014

### US-049 – Format code automatically

As a developer
I want to use consistent code formatting,
so that the code remains consistent and easier to read.

Reference: TR-015

### US-050 – Check TypeScript automatically

As a developer
I want TypeScript errors to be detected automatically,
so that faulty code is not passed on unnoticed.

Reference: TR-016

### US-051 – Run the CI pipeline

As a developer
I want every push or pull request to be checked automatically,
so that only verified code is developed further or deployed.

Pipeline:

Install
↓
Lint
↓
Typecheck
↓
Tests
↓
Build

Reference: TR-017

## Epic 14 – Deployment

### US-052 – Deploy the application

As a user
I want to be able to access FlowOps over the internet,
so that I can use the application independently of my local development environment.

Reference: TR-018

### US-053 – Reproducible deployment

As a developer
I want to be able to perform deployments reproducibly,
so that I can reliably deploy the application again.

### US-054 – Enable cost-free operation

As a developer
I want to operate the application without ongoing costs,
so that the project can remain available free of charge in the long term.

Acceptance Criteria:

No paid infrastructure is required.
Used free-tier limits are documented.
No hidden paid services are necessary.

Reference: TR-019

## Epic 15 – Accessibility & UX

### US-055 – Use the application with a keyboard

As a user who prefers working with a keyboard
I want to be able to use the application entirely with a keyboard,
so that I am not dependent on a mouse.

### US-056 – Understandable forms

As a user
I want to see understandable forms with clear error messages,
so that I know which input is expected.

### US-057 – Responsive interface

As a user
I want to use FlowOps on different screen sizes,
so that the application remains useful on smaller displays.

## Epic 16 – Documentation

### US-058 – Document technical decisions

As a developer
I want to document important technical decisions,
so that it remains traceable why particular solutions were chosen.

### US-059 – Document the development process

As a developer
I want to document my development steps weekly,
so that others can understand my working process.

### US-060 – Document lessons learned

As a developer
I want to document problems, wrong decisions, and insights,
so that the development shows not only the result but also the learning process.

### US-061 – Manage session lifetime

As an authenticated user

I want my session to expire automatically and be revoked when required,

so that my account remains protected even if I forget to log out.

Acceptance Criteria:

A successful login creates a server-side session.

A session is valid for a maximum of 30 days from its creation.

A session expires after 7 days of inactivity.

Logging out immediately invalidates the current session.

Expired sessions cannot access protected resources.

Revoked sessions cannot access protected resources.

Changing the user's password revokes all active sessions.

Each successful authenticated request updates `last_used_at`.

Expired sessions are removed or invalidated during session cleanup.

Session cookies use the required security attributes.

Reference: TR-008
