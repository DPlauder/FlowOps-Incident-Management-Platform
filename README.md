# FlowOps – Incident Management Platform

**A web-based incident management platform built with React, TypeScript, Hono, and Cloudflare.**

FlowOps is a software project focused on the structured management of IT incidents. It aims to provide a central place to record incidents, track their status, manage responsibilities, and document the knowledge gained from incident resolution.

The project combines a documented product development process with a serverless architecture built on Cloudflare. Requirements, user stories, acceptance criteria, implementation tasks, and technical documentation are maintained alongside the source code.

**Project links:** [GitHub Repository](https://github.com/DPlauder/FlowOps-Incident-Management-Platform) · [FlowOps Development Blog](https://dominikplauder.at/blog/flowops)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development Workflow](#development-workflow)
- [Blog and Development Insights](#blog-and-development-insights)
- [Project Status](#project-status)
- [Contributing](#contributing)
- [License](#license)

## Overview

Effective incident management is essential for maintaining reliable IT services. Teams need a structured way to record incidents, coordinate responses, track progress, and learn from service disruptions.

FlowOps is designed to support this process through a dedicated incident management platform. The project emphasizes clear requirements, traceable implementation decisions, testable acceptance criteria, and maintainable technical documentation.

The application follows a serverless architecture, using Cloudflare Workers for backend execution and Cloudflare D1 for persistent data storage.

## Features

The planned and documented product scope includes:

- **Service Management** – View, edit, and deactivate services.
- **Incident Management** – Create, view, edit, and track incidents.
- **Status Tracking** – Manage incident status according to the defined workflow.
- **Filtering and Search** – Find incidents using supported search and filtering options.
- **Assignment and Escalation** – Manage incident ownership and escalate incidents where appropriate.
- **Incident History** – Keep relevant changes and events traceable.
- **Postmortems** – Document incident reviews and lessons learned.
- **Metrics and Overview** – Present defined metrics and relevant incident information.
- **Quality Assurance** – Integrate automated checks into the development workflow.
- **Technical Documentation** – Maintain requirements, implementation guidance, and development documentation.

The actual availability of individual features depends on the current implementation. Planned functionality should not be interpreted as completed functionality.

## Technology Stack

| Component | Technology | Responsibility |
|---|---|---|
| Frontend | React + TypeScript | User interface |
| API | Hono | HTTP API |
| Runtime | Cloudflare Workers | Backend execution |
| Database | Cloudflare D1 | Persistent data storage |
| Version Control | GitHub | Source code and collaboration |
| CI | GitHub Actions | Automated quality checks |
| Deployment | Cloudflare | Production hosting |

### Frontend

React and TypeScript provide the foundation for the user interface. React supports a component-based UI architecture, while TypeScript adds static type checking to help maintain consistency across the frontend codebase.

### API and Backend Runtime

Hono provides the HTTP API layer, running on Cloudflare Workers. This serverless execution model allows backend functionality to run on Cloudflare's infrastructure without requiring a separately managed application server.

### Database

Cloudflare D1 provides persistent relational data storage for the application. It is designed to integrate with the Cloudflare Workers environment.

### CI and Deployment

GitHub hosts the source code and GitHub Actions runs the quality checks configured for the repository. Cloudflare provides the hosting and deployment environment.

## Architecture

At a high level, the application follows this request flow:

```text
User
  |
  v
React + TypeScript Frontend
  |
  v
Hono HTTP API
  |
  v
Cloudflare Workers
  |
  v
Cloudflare D1
```

The frontend communicates with the HTTP API. Hono handles API routing within the Cloudflare Workers runtime, while Cloudflare D1 provides persistent storage.

The source code and development workflow are managed through GitHub, with GitHub Actions supporting automated quality checks and Cloudflare handling production hosting.

## Project Structure

The repository contains the application source code and the documentation used to plan and guide development.

| Directory | Purpose |
|---|---|
| `docs/Planning/01-Requirements/` | Requirements and functional specifications |
| `docs/Planning/02-Product/` | Product planning and user stories |
| `docs/Planning/04-Implementation/` | Implementation planning and delivery criteria |
| `docs/Development/` | Technical and developer documentation |

The repository's actual files and configuration remain the source of truth for the current project structure.

## Documentation

Documentation is an integral part of the FlowOps development process.

- [Requirements Specification](docs/Planning/01-Requirements/Anforderungsblatt-de.md) – Functional requirements and project constraints.
- [User Stories](docs/Planning/02-Product/User-Stories/user-stories-de.md) – User needs and expected application behavior.
- [Definition of Ready](docs/Planning/04-Implementation/Definition-of-Ready.md) – Conditions that should be met before implementation begins.
- [Definition of Done](docs/Planning/04-Implementation/Definition-of-Done.md) – Conditions that must be met before a user story is considered complete.

User stories and their acceptance criteria connect functional requirements with implementation and testing. This helps make expected behavior explicit and progress easier to track.

## Development Workflow

FlowOps follows a documentation-driven, incremental development process:

1. Define requirements and user needs.
2. Create user stories and establish testable acceptance criteria.
3. Identify dependencies, technical constraints, and unresolved decisions.
4. Implement functionality in manageable increments.
5. Run relevant tests and the quality checks configured in CI.
6. Review the implementation and update affected documentation.

The Definition of Ready helps identify unclear requirements and missing prerequisites before implementation. The Definition of Done provides a consistent basis for evaluating whether a story is complete.

GitHub Issues are used to track work and connect implementation tasks to the documented requirements.

## Blog and Development Insights

The development of FlowOps is also documented on my blog.

The blog complements the source code and technical documentation by sharing the thinking behind the project: its goals, planning decisions, architecture, implementation challenges, and lessons learned throughout development.

While the repository focuses on the code, requirements, and implementation details, the blog provides additional context about the development journey and the reasoning behind selected approaches.

Topics may include:

- Project goals and requirements engineering
- User stories and acceptance criteria
- Serverless architecture with Cloudflare Workers and D1
- Frontend and API development with React, TypeScript, and Hono
- Automated quality checks and deployment
- Technical challenges, lessons learned, and future improvements

**Follow the development of FlowOps on my blog:**

[dominikplauder.at/blog/flowops](https://dominikplauder.at/blog/flowops)

## Project Status

FlowOps is developed incrementally against its documented requirements and user stories.

The current implementation, open work items, and completed changes can be explored through the repository and its GitHub Issues.

- [Source Code](https://github.com/DPlauder/FlowOps-Incident-Management-Platform)
- [GitHub Issues](https://github.com/DPlauder/FlowOps-Incident-Management-Platform/issues)
- [Development Blog](https://dominikplauder.at/blog/flowops)

Feature descriptions in this README represent the intended and documented scope; the current codebase determines which capabilities are implemented and available.

## Contributing

Feedback, bug reports, and improvement suggestions can be submitted through GitHub Issues.

When reporting an issue, please include:

- A clear description of the problem or proposed improvement.
- The expected behavior.
- Steps to reproduce the problem, where applicable.
- Relevant technical details or error messages.

Contributions should follow the project's documented requirements, acceptance criteria, and existing development conventions.

## License

License terms are determined by the license included in the repository. If no license has been provided, do not assume that the source code may be freely reused, modified, or redistributed.
