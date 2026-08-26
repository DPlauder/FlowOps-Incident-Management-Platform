# FlowOps – MVP Core

> Die folgende Übersicht zeigt den funktionalen Kern des FlowOps-MVP. Sie beschreibt die Bereiche, die für eine erste produktionsnahe Version(1.0) zwingend zusammenarbeiten müssen.

## Scope-Übersicht

| Bereich            | Schwerpunkt                                             |
| ------------------ | ------------------------------------------------------- |
| **Authentication** | Registrierung, Login und Logout, Session                |
| **Organization**   | Organisationen, Mitglieder und Rollen                   |
| **Services**       | Verwaltung technischer Services                         |
| **Incidents**      | Erfassung, Bearbeitung und Suche von Incidents          |
| **Timeline**       | Kommentare und Audit Events                             |
| **Postmortem**     | Dokumentation und Veröffentlichung von Erkenntnissen    |
| **Dashboard**      | Kompakter Überblick über den aktuellen Zustand          |
| **Security**       | Authentifizierung, Berechtigungen und Mandantentrennung |
| **Quality**        | Tests, Linting, Typechecking und CI                     |
| **Deployment**     | Öffentliche Produktionsbereitstellung                   |

## Feature-Baum

```text
AUTH
├── Registration
├── Login
├── Logout
└── Session Management

ORGANIZATION
├── Create Organization
├── Members
└── Roles

SERVICES
└── Service Management

INCIDENTS
├── Create
├── View
├── Edit
├── Assign
├── Severity
├── Status
├── List
├── Filter
└── Search

TIMELINE
├── Comments
└── Audit Events

POSTMORTEM
├── Create
├── Edit
└── Publish

DASHBOARD
└── Basic Overview

SECURITY
├── Authentication
├── Authorization
├── Tenant Isolation
└── Input Validation

QUALITY
├── Unit Tests
├── Integration Tests
├── E2E Test
├── Lint
├── Typecheck
└── CI

DEPLOYMENT
└── Production Deployment
```

## MVP-Fokus

Der Kernablauf des MVP verbindet:

1. Benutzer authentifizieren
2. Organisation und Rollen verwalten
3. Services und Incidents bearbeiten
4. Incident-Verlauf und Audit Events dokumentieren
5. Incidents mit einem Postmortem abschließen
6. Qualität und Security durchgehend berücksichtigen
7. Die Anwendung reproduzierbar deployen

## Nicht Bestandteil von Version 1.0

Die folgenden Funktionen werden für die erste Version bewusst nicht implementiert:

- E-Mail-Benachrichtigungen
- Slack-Integration
- Webhooks
- Datei-Uploads
- Erweiterte Analytics
- Health Checks
- Automatische Incident-Erstellung
- Monitoring-Integrationen
- SSO
- 2FA
- Mobile App
- Billing
- Multi-Region-Infrastruktur
- KI-Funktionen

Diese Themen bleiben mögliche Erweiterungen für eine spätere Version.
