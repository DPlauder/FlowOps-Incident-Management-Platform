# FlowOps - Definition of Done

A User Story is considered complete only when all applicable criteria have been fulfilled.

The Definition of Done ensures that an implemented User Story is not only functionally complete, but also tested, secure, documented, reviewed, and in a deployable state.

---

## 1. Functionality

- [ ] The functionality is fully implemented within the defined scope.
- [ ] All defined acceptance criteria are fulfilled.
- [ ] The expected success case works correctly.
- [ ] Relevant error cases are handled correctly.
- [ ] Invalid input is handled correctly.
- [ ] Non-existent resources are handled correctly.
- [ ] Unauthorized access is handled correctly.
- [ ] The implementation follows the defined business rules.
- [ ] No unplanned functionality was added without documentation.

---

## 2. API

If the User Story affects the API:

- [ ] The required HTTP endpoint is implemented.
- [ ] HTTP method and route match `API.md`.
- [ ] Request and response structures match the API specification.
- [ ] Validation errors use the defined error response format.
- [ ] Authentication failures return the expected status code.
- [ ] Authorization failures return the expected status code.
- [ ] Non-existent resources return the expected status code.
- [ ] Unexpected server errors do not expose internal implementation details.
- [ ] API changes have been documented in `API.md`.

---

## 3. Security

- [ ] All relevant input is validated server-side.
- [ ] Authentication is verified server-side.
- [ ] Authorization is verified server-side.
- [ ] Roles and permissions follow the defined role model.
- [ ] Tenant isolation is enforced.
- [ ] Resources are not authorized solely based on organization data supplied by the client.
- [ ] Protected API endpoints verify the required session.
- [ ] Sensitive data is not unnecessarily returned.
- [ ] Passwords are never stored in plain text.
- [ ] Passwords, session identifiers, and sensitive authentication data are not logged.
- [ ] Security-sensitive state transitions are validated.
- [ ] Relevant security tests are implemented.

---

## 4. Tenant Isolation

For all organization-related functionality:

- [ ] The organization is determined server-side from the authenticated session or membership.
- [ ] Relevant queries include the required organization filter.
- [ ] Resources belonging to another organization cannot be read.
- [ ] Resources belonging to another organization cannot be modified.
- [ ] Resources belonging to another organization cannot be searched or filtered.
- [ ] Cross-tenant access is covered by integration tests.

The tenant boundary must never be controlled solely by the client.

Example:

```text
User
  |
  v
Session
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

---

## 5. Business Rules

- [ ] All business rules relevant to the User Story are implemented.
- [ ] Valid state transitions work correctly.
- [ ] Invalid state transitions are rejected.
- [ ] Role-dependent actions are correctly restricted.
- [ ] Required fields are validated.
- [ ] Enums and status values match the data model.
- [ ] Relevant business events are generated.
- [ ] The implementation matches the User Stories and requirements.

## 6. Database

If the User Story involves persistent data:

- [ ] The implementation follows Data-Model.md.
- [ ] New tables or fields match the defined data model.
- [ ] Relationships and foreign keys are correctly implemented.
- [ ] Required constraints are present.
- [ ] Required indexes have been considered.
- [ ] Required database migrations are provided.
- [ ] Database migrations can be executed successfully.
- [ ] Existing data is not unintentionally corrupted.
- [ ] Database changes have been tested.

Destructive database changes must be explicitly reviewed and documented.

## 7. Testing

- [ ] Appropriate unit tests are implemented.
- [ ] Appropriate integration tests are implemented.
- [ ] Appropriate E2E tests are implemented where required.
- [ ] The successful execution path is tested.
- [ ] Relevant error cases are tested.
- [ ] Authorization behavior is tested.
- [ ] Tenant isolation is tested where applicable.
- [ ] Relevant business rules are tested.
- [ ] Existing tests continue to pass.
- [ ] Test coverage is consistent with the Testing Matrix.

At minimum, critical business rules must have both positive and negative test cases.

## 8. Code Quality

- [ ] The code follows the project's established conventions.
- [ ] The implementation is understandable and maintainable.
- [ ] No unnecessary code duplication was introduced.
- [ ] No unnecessary dependencies were added.
- [ ] No debug output or temporary test code remains.
- [ ] No secrets or credentials are stored in the repository.
- [ ] Linting passes successfully.
- [ ] Formatting passes successfully.
- [ ] Type checking passes successfully.

## 9. Build and CI

- [ ] The local production build succeeds.
- [ ] Type checking succeeds.
- [ ] Tests pass successfully.
- [ ] Linting passes successfully.
- [ ] The CI workflow completes successfully.
- [ ] No known build or CI errors were introduced by the User Story.
- [ ] The change does not introduce regressions in existing functionality.

The expected quality pipeline is:

```text
Lint
  ↓
Typecheck
  ↓
Unit Tests
  ↓
Integration Tests
  ↓
E2E Tests
  ↓
Build
  ↓
CI
```

## 10. Manual Verification

The functionality has been manually verified through the relevant user flow.

At minimum:

- [ ] The normal user flow works correctly.
- [ ] Relevant error cases were manually checked.
- [ ] Permissions behave correctly.
- [ ] The user interface displays relevant states correctly.
- [ ] API errors are handled appropriately by the frontend.
- [ ] No obvious regression was introduced in the affected area.

For purely technical changes, manual verification may be adapted or documented as not applicable.

## 11. Documentation

- [ ] Relevant technical decisions are documented.
- [ ] Relevant changes to API.md have been made.
- [ ] Relevant changes to Data-Model.md have been made.
- [ ] Relevant security requirements have been considered.
- [ ] User Story and implementation remain consistent.
- [ ] MVP Backlog and actual implementation scope remain consistent.
- [ ] Relevant ADRs have been updated or created.
- [ ] Open questions have been recorded in Risks-and-Open-Questions.md.
- [ ] No outdated documentation has intentionally been left behind.

## 12. Review

- [ ] The implementation has been reviewed.
- [ ] Review comments have been addressed.
- [ ] No known critical review issues remain open.
- [ ] The implementation matches the User Story.
- [ ] Security-sensitive changes received additional review.

For a solo project, the review may be performed as a documented self-review.

The self-review should cover at least:

```text
Requirements
     ↓
User Story
     ↓
Implementation
     ↓
Tests
     ↓
Security
     ↓
Documentation
```

## 13. Dependencies

- [ ] All required dependencies of the User Story are completed.
- [ ] No blocking User Stories remain incomplete.
- [ ] Required database changes are available.
- [ ] Required API infrastructure is available.
- [ ] Required authentication and authorization functionality is available.
- [ ] The User Story can be tested independently from incomplete non-blocking features.

## 14. Deployment Readiness

- [ ] The User Story is technically deployable.
- [ ] Required environment variables are documented.
- [ ] Required database migrations are documented.
- [ ] No local development-only dependencies are required.
- [ ] The application can start successfully after deployment.
- [ ] Relevant changes can be executed in the target environment.

If a User Story is intentionally not deployable, the reason must be explicitly documented.

## 15. Regression Check

Before the User Story is completed, existing functionality must be checked for unintended regressions.

- [ ] Existing relevant tests pass.
- [ ] Affected API endpoints continue to work.
- [ ] Affected user flows continue to work.
- [ ] Authentication continues to work.
- [ ] Authorization continues to work.
- [ ] Tenant isolation continues to work.
- [ ] No known regression was introduced.

## 16. Story Completion Checklist

A User Story may only be marked as Done when all applicable criteria have been fulfilled.

### Functionality

- [ ] Functionality fully implemented
- [ ] Acceptance criteria fulfilled
- [ ] Success case works
- [ ] Relevant error cases handled

### API

- [ ] API contract followed
- [ ] Error behavior correct
- [ ] API documentation updated

### Security

- [ ] Server-side validation
- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Tenant isolation verified
- [ ] No sensitive data logged

### Business Rules

- [ ] Business rules implemented
- [ ] State transitions validated
- [ ] Roles verified
- [ ] Required events generated

### Database

- [ ] Data model followed
- [ ] Migration provided where required
- [ ] Constraints correct
- [ ] Data integrity verified

### Testing

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests where required
- [ ] Positive tests
- [ ] Negative tests
- [ ] Security tests where required

### Code Quality

- [ ] Lint passes
- [ ] Formatting passes
- [ ] Typecheck passes
- [ ] No debug output
- [ ] No secrets

### CI / Build

- [ ] Tests pass
- [ ] Build succeeds
- [ ] CI succeeds

### Manual Verification

- [ ] Relevant user flow manually verified
- [ ] Error cases verified
- [ ] No obvious regression

### Documentation

- [ ] Requirements consistent
- [ ] User Story consistent
- [ ] Backlog consistent
- [ ] API documentation current
- [ ] Data model current
- [ ] ADRs current where required
- [ ] Open Questions updated

### Review

- [ ] Code reviewed
- [ ] Review comments addressed

### Dependencies

- [ ] Dependencies fulfilled

### Deployment

- [ ] Deployable
- [ ] Environment variables documented
- [ ] Migrations documented

## 17. Done / Not Done

A User Story receives one of the following states.

### DONE

All applicable Definition of Done criteria have been fulfilled.

```text
Implementation
      ↓
Testing
      ↓
Security
      ↓
Review
      ↓
Documentation
      ↓
CI / Build
      ↓
DEPLOYABLE
      ↓
DONE
```

### NOT DONE

At least one required criterion has not been fulfilled.

Examples:

❌ Tests are missing
❌ Security verification is missing
❌ Acceptance criteria are not fulfilled
❌ Build fails
❌ Critical review issue remains open
❌ Tenant isolation has not been verified
❌ API documentation is outdated
❌ Required migration is missing

The User Story must not be marked as completed while a required criterion remains unresolved.

## 18. Definition of Ready vs Definition of Done

The Definition of Ready and Definition of Done serve different purposes.

### Definition of Ready

Answers:

Can we start implementing this User Story?

```text
Requirements
     ↓
Acceptance Criteria
     ↓
Dependencies
     ↓
API
     ↓
Data Model
     ↓
Security
     ↓
Testing
     ↓
READY
```

### Definition of Done

Answers:

Is this User Story fully implemented and ready to be considered complete?

```text
READY
  ↓
Implementation
  ↓
Testing
  ↓
Security
  ↓
Review
  ↓
Documentation
  ↓
CI / Build
  ↓
DEPLOYABLE
  ↓
DONE
```

A User Story must satisfy the Definition of Ready before implementation begins and the Definition of Done before it can be considered completed.
