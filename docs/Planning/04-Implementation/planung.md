## Die Wochenplanung

Umsetzung in ungefähr 10 Wochen.

## WEEK 01 — Why am I building this?

### Thema

Von der Idee zu konkreten Anforderungen.

### Du erklärst:

- Warum ein Incident-Management-System?
- Was soll FlowOps lösen?
- Wer benutzt es?
- Was ist MVP?
- Was gehört explizit nicht zum MVP?
- Welche Constraints gibt es?
- Warum €0 Budget?

Du kannst beispielsweise eine kleine Tabelle zeigen:

| Constraint     | Decision            |
| -------------- | ------------------- |
| Budget         | €0                  |
| Deployment     | Free tier           |
| Database       | D1                  |
| Frontend       | React               |
| Backend        | Hono                |
| Authentication | Session based       |
| Testing        | Vitest + Playwright |
| CI/CD          | GitHub Actions      |

Budget €0
Deployment Free tier
Database D1
Frontend React
Backend Hono
Authentication Session based
Testing Vitest + Playwright
CI/CD GitHub Actions

### Das zeigt

Anforderungsanalyse und Scope Management.

## WEEK 02 — From requirements to architecture

Jetzt entwirfst du die Architektur.

### Zeige:

```text
Browser
│
▼
React Application
│
▼
API
│
▼
D1
```

Aber viel wichtiger:

### Warum?

Diskutiere Alternativen.

Zum Beispiel:

### Backend

**Option A – verworfen**

Next.js API Routes

**Option B – ausgewählt**

Hono

**Option C – verworfen für das MVP**

separate Node API

Dann:

> I chose Hono because …

Und anschließend:

> What I am giving up by choosing this.

Diese letzte Frage ist wichtig.

## WEEK 03 — Designing the data model

Hier geht es um Datenmodellierung.

Zeige dein erstes ER-Diagramm.

Dann vielleicht:

### Version 1

```text
users
incidents
comments
```

Dann stellst du fest:

I need organizations and memberships.

Also:

```text
organizations
users
memberships
incidents
comments
events
```

Dann erklärst du, warum.

Zeige ruhig die Entwicklung.

Das ist interessanter als nur das fertige Schema.

## WEEK 04 — Building the foundation

Jetzt beginnt richtiges Coding.

### Zeige:

- Repository
- Branching
- Linting
- Formatting
- TypeScript
- Environment
- Database migrations
- API skeleton
- CI

Screenshot von GitHub Actions.

Beispielsweise:

```text
Push
↓
Lint
↓
Typecheck
↓
Tests
↓
Build
```

Und schreibe:

> Before implementing the first feature, I wanted the project to have a reliable development loop.

Das ist eine sehr gute Midlevel-Signalwirkung.

## WEEK 05 — Authentication & authorization

Jetzt baust du Login.

### Zeige:

```text
Register
↓
Password hashing
↓
Session
↓
HttpOnly cookie
↓
Authenticated request
```

Dann Rollen:

```text
ADMIN
MEMBER
VIEWER
```

### Und vor allem:

#### Security Decisions

Nicht nur:

> „I implemented authentication.“

Sondern:

> „I deliberately don't store authentication tokens in localStorage because …“

Solche Dinge zeigen Wissen.

## WEEK 06 — Building the incident lifecycle

Jetzt kommt das Herzstück.

```text
OPEN
↓
INVESTIGATING
↓
MITIGATED
↓
RESOLVED
↓
POSTMORTEM
```

Du erklärst:

- State Machine
- Validierung
- Permissions
- Audit Events

Und zeigst Code-Ausschnitte.

Zum Beispiel:

`OPEN → RESOLVED`

ist vielleicht nicht erlaubt.

Warum?

Das ist eine gute Engineering-Frage.

## WEEK 07 — Testing what actually matters

Jetzt nicht einfach schreiben:

„I added tests.“

Sondern erklären:

### Was teste ich?

```text
Unit
↓
Business Logic

Integration
↓
API + Database

E2E
↓
Critical User Journey
```

Dann zeigst du einen echten Test.

Beispielsweise:

```text
Create Incident
↓
Assign Engineer
↓
Change Severity
↓
Resolve
↓
Verify Audit Log
```

Und erklärst:

> I don't want 100% coverage just for the number. I want confidence around critical behavior.

Das ist genau die Art von Aussage, die du später im Bewerbungsgespräch verwenden kannst.

## WEEK 08 — Something went wrong

Diese Woche würde ich absichtlich nicht vorher festlegen.

Du dokumentierst einen echten Fehler.

### Das kann sein:

- Race Condition
- falsche Authorization
- Datenbankproblem
- schlechter Query
- UI-State-Bug
- Performanceproblem
- Deployment-Problem

Der Artikel:

> „The bug I didn't see coming“

### Struktur:

```text
The symptom

↓

How I reproduced it

↓

What I initially thought

↓

What was actually happening

↓

The fix

↓

The test I added

↓

What I learned
```

Das könnte einer der stärksten Artikel des gesamten Blogs werden.

## WEEK 09 — Deployment & Observability

Jetzt geht es darum:

„Kann ich Software nicht nur lokal laufen lassen, sondern tatsächlich veröffentlichen?“

### Zeige:

```text
GitHub
↓
CI
↓
Build
↓
Deploy
↓
Production
```

Dann:

- Logging
- Errors
- Request IDs
- Performance
- strukturierte Logs

Und natürlich:

€0 Budget.

### Zeige konkret:

#### Infrastructure cost

|                     |     |
| ------------------- | --- |
| Hosting             | €0  |
| Database            | €0  |
| CI/CD               | €0  |
| Domain              | €0  |
| Monitoring (später) | €0  |

**Total €0**

## WEEK 10 — Looking back

Der letzte Artikel ist keine Feature-Demo.

Sondern:

> „10 weeks of building FlowOps — what I learned“

Hier wirst du kritisch.

- Was ist gut geworden?
- Was würde ich anders machen?
- Was war Overengineering?
- Wo habe ich Zeit verschwendet?
- Welche Architektur würde ich bei einem echten Kunden ändern?
- Was würde ich als Nächstes bauen?
- Was habe ich über meine eigene Arbeitsweise gelernt?

Dieser Artikel zeigt Reflexionsfähigkeit.
