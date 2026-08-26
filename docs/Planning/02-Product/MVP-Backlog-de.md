# FlowOps – MVP-Backlog

> Für die Story Points wird eine Fibonacci-Skala benutzt: **1 → 2 → 3 → 5 → 8 → 13**.  
> Die Bewertung bezieht sich ausschließlich auf die voraussichtliche Komplexität, nicht auf die benötigte Zeit.

> **Statusregel:** Alle Stories in diesem Backlog sind für die Planung erfasst. US-015 ist als **Deferred** markiert und wird nicht in die aktive MVP-Schätzung einbezogen.

> **Version 1.0 - bewusst ausgeschlossen:** E-Mail-Benachrichtigungen, Slack-Integration, Webhooks, Datei-Uploads, erweiterte Analytics, Health Checks, automatische Incident-Erstellung, Monitoring-Integrationen, SSO, 2FA, Mobile App, Billing, Multi-Region-Infrastruktur und KI-Funktionen werden nicht implementiert.

> **API-Abgleich:** Die aktuelle `API.md` beschreibt die Kern-Routen für Authentifizierung, Organisation, Membership-Verwaltung, Services, Incidents, Events, Kommentare, Postmortems und Dashboard. US-015 bleibt als `Deferred` außerhalb des initialen MVP. Die konkreten Request- und Berechtigungsregeln der einzelnen Routen müssen vor der Implementierung weiterhin mit den Stories und dem Datenmodell abgeglichen werden.

## Prioritäten

| Kürzel                | Bedeutung                                    |
| --------------------- | -------------------------------------------- |
| **P0 – Must Have**    | Ohne diese Story funktioniert der MVP nicht. |
| **P1 – Important**    | Für einen guten MVP sehr sinnvoll.           |
| **P2 – Nice to Have** | Kann bei Zeitdruck entfallen.                |

## Epic 1 – Projektgrundlage

| ID     | User Story                                          | Priorität |  SP | Abhängigkeiten         |
| ------ | --------------------------------------------------- | :-------: | --: | ---------------------- |
| US-061 | Projektstruktur und Entwicklungsumgebung einrichten |    P0     |   3 | –                      |
| US-062 | TypeScript-Konfiguration einrichten                 |    P0     |   2 | US-061                 |
| US-063 | Frontend-Grundstruktur einrichten                   |    P0     |   3 | US-061, US-062         |
| US-064 | Backend/API-Grundstruktur einrichten                |    P0     |   3 | US-061, US-062         |
| US-065 | Datenbank und Migrationen einrichten                |    P0     |   3 | US-064                 |
| US-066 | Linting und Formatting einrichten                   |    P0     |   2 | US-061                 |
| US-067 | CI-Grundpipeline einrichten                         |    P1     |   3 | US-062, US-064, US-066 |

**Epic-Aufwand: 19 SP**

## Epic 2 – Authentication

| ID     | User Story          | Priorität |  SP | Abhängigkeiten |
| ------ | ------------------- | :-------: | --: | -------------- |
| US-001 | Account erstellen   |    P0     |   5 | US-065         |
| US-002 | Einloggen           |    P0     |   5 | US-001         |
| US-003 | Ausloggen           |    P0     |   2 | US-002         |
| US-004 | Geschützte Bereiche |    P0     |   3 | US-002, US-011 |

**Epic-Aufwand: 15 SP**

## Epic 3 – Organisationen & Benutzer

| ID     | User Story                                           | Priorität |  SP | Abhängigkeiten         |
| ------ | ---------------------------------------------------- | :-------: | --: | ---------------------- |
| US-005 | Organisation erstellen                               |    P0     |   3 | US-001                 |
| US-006 | Organisation beitreten                               |    P1     |   5 | US-002, US-005         |
| US-007 | Organisationen voneinander trennen                   |    P0     |   5 | US-006, US-011, US-064 |
| US-008 | Mitglieder anzeigen                                  |    P1     |   3 | US-006, US-011         |
| US-009 | Benutzerrolle ändern                                 |    P1     |   3 | US-008, US-011         |
| US-010 | Membership deaktivieren                              |    P1     |   3 | US-008, US-011         |
| US-011 | Rollenbasierte Berechtigungen (OWNER, ADMIN, MEMBER) |    P0     |   5 | US-006                 |

**Epic-Aufwand: 27 SP**

## Epic 4 – Services

| ID     | User Story           | Priorität |  SP | Abhängigkeiten |
| ------ | -------------------- | :-------: | --: | -------------- |
| US-012 | Service erstellen    |    P0     |   3 | US-007, US-011 |
| US-013 | Services anzeigen    |    P0     |   2 | US-012, US-007 |
| US-014 | Service bearbeiten   |    P1     |   2 | US-012, US-007 |
| US-015 | Service deaktivieren |    P2     |   2 | US-012         |

**Epic-Aufwand: 9 SP**

> **MVP-Entscheidung:** US-015 wird zunächst gestrichen.

Ein Service kann stattdessen vorerst einfach bearbeitet werden.

## Epic 5 – Incident Core

> **Priorität:** Das ist der wichtigste Teil von FlowOps.

| ID     | User Story          | Priorität |  SP | Abhängigkeiten         |
| ------ | ------------------- | :-------: | --: | ---------------------- |
| US-016 | Incident erstellen  |    P0     |   5 | US-007, US-011, US-012 |
| US-017 | Incident anzeigen   |    P0     |   3 | US-016, US-007         |
| US-018 | Incident bearbeiten |    P0     |   3 | US-017, US-011         |
| US-019 | Severity festlegen  |    P0     |   2 | US-016                 |
| US-020 | Incident zuweisen   |    P0     |   3 | US-008, US-011, US-016 |

**Epic-Aufwand: 16 SP**

## Epic 6 – Incident Lifecycle

| ID     | User Story                           | Priorität |  SP | Abhängigkeiten |
| ------ | ------------------------------------ | :-------: | --: | -------------- |
| US-021 | Incident auf Investigating setzen    |    P0     |   2 | US-016         |
| US-022 | Incident auf Mitigated setzen        |    P0     |   2 | US-021         |
| US-023 | Incident lösen                       |    P0     |   2 | US-022         |
| US-024 | Incident schließen                   |    P0     |   2 | US-023         |
| US-025 | Ungültige Statusübergänge verhindern |    P0     |   5 | US-021–024     |

**Epic-Aufwand: 13 SP**

## Epic 7 – Incident Übersicht

| ID     | User Story                    | Priorität |  SP | Abhängigkeiten |
| ------ | ----------------------------- | :-------: | --: | -------------- |
| US-026 | Incidents anzeigen            |    P0     |   5 | US-016, US-007 |
| US-027 | Nach Status filtern           |    P1     |   3 | US-026         |
| US-028 | Nach Severity filtern         |    P1     |   2 | US-026         |
| US-029 | Nach Verantwortlichem filtern |    P1     |   2 | US-026         |
| US-030 | Incidents suchen              |    P1     |   3 | US-026         |

**Epic-Aufwand: 15 SP**

## Epic 8 – Timeline & Audit

| ID     | User Story                 | Priorität |  SP | Abhängigkeiten |
| ------ | -------------------------- | :-------: | --: | -------------- |
| US-031 | Incident Timeline anzeigen |    P0     |   3 | US-016, US-007 |
| US-032 | Kommentar hinzufügen       |    P0     |   3 | US-031         |
| US-033 | Änderungen nachvollziehen  |    P0     |   5 | US-031         |

**Epic-Aufwand: 11 SP**

## Epic 9 – Postmortem

| ID     | User Story                      | Priorität |  SP | Abhängigkeiten |
| ------ | ------------------------------- | :-------: | --: | -------------- |
| US-034 | Postmortem erstellen            |    P0     |   5 | US-023, US-011 |
| US-035 | Postmortem bearbeiten           |    P0     |   3 | US-034, US-011 |
| US-036 | Postmortem zur Review freigeben |    P1     |   3 | US-035, US-011 |
| US-037 | Postmortem veröffentlichen      |    P1     |   3 | US-036, US-011 |

**Epic-Aufwand: 14 SP**

> **MVP-Entscheidung:** Für den ersten MVP werden Review und Publishing vereinfacht.

## Epic 10 – Dashboard

| ID     | User Story                          | Priorität |  SP | Abhängigkeiten |
| ------ | ----------------------------------- | :-------: | --: | -------------- |
| US-038 | Dashboard anzeigen                  |    P1     |   3 | US-026, US-007 |
| US-039 | Offene Incidents anzeigen           |    P1     |   2 | US-038         |
| US-040 | Kritische Incidents anzeigen        |    P1     |   2 | US-038         |
| US-041 | Kürzlich gelöste Incidents anzeigen |    P1     |   2 | US-038         |

**Epic-Aufwand: 9 SP**

## Epic 11 – Security

> **Wichtiger Punkt:** Security sollte vorrangig behandelt werden und gehört in die Implementierung der jeweiligen Features.

| ID     | User Story                         | Priorität |  SP | Abhängigkeiten |
| ------ | ---------------------------------- | :-------: | --: | -------------- |
| US-042 | Eingaben validieren                |    P0     |   3 | US-064         |
| US-043 | Fremde Ressourcen schützen         |    P0     |   5 | US-007         |
| US-044 | Berechtigungen serverseitig prüfen |    P0     |   5 | US-011         |

**Epic-Aufwand: 13 SP**

## Epic 12 – Testing

| ID     | User Story                  | Priorität |  SP | Abhängigkeiten |
| ------ | --------------------------- | :-------: | --: | -------------- |
| US-045 | Business Logic testen       |    P0     |   5 | US-025         |
| US-046 | API testen                  |    P0     |   5 | US-016         |
| US-047 | Kritischen User Flow testen |    P0     |   5 | US-034         |

**Epic-Aufwand: 15 SP**

## Epic 13 – Code Quality & CI

| ID     | User Story    | Priorität |  SP | Abhängigkeiten                 |
| ------ | ------------- | :-------: | --: | ------------------------------ |
| US-048 | Linting       |    P0     |   2 | US-066                         |
| US-049 | Formatting    |    P0     |   1 | US-066                         |
| US-050 | Type Checking |    P0     |   2 | US-062                         |
| US-051 | CI Pipeline   |    P0     |   3 | US-045, US-046, US-048, US-050 |

**Epic-Aufwand: 8 SP**

## Epic 14 – Deployment

| ID     | User Story                       | Priorität |  SP | Abhängigkeiten |
| ------ | -------------------------------- | :-------: | --: | -------------- |
| US-052 | Anwendung deployen               |    P0     |   5 | US-051         |
| US-053 | Reproduzierbares Deployment      |    P0     |   3 | US-052         |
| US-054 | Kostenfreien Betrieb ermöglichen |    P0     |   3 | US-052         |

**Epic-Aufwand: 11 SP**

## Epic 15 – UX & Accessibility

| ID     | User Story              | Priorität |  SP | Abhängigkeiten |
| ------ | ----------------------- | :-------: | --: | -------------- |
| US-055 | Tastaturbedienung       |    P1     |   3 | US-063         |
| US-056 | Verständliche Formulare |    P0     |   3 | US-063         |
| US-057 | Responsive Oberfläche   |    P0     |   3 | US-063         |

**Epic-Aufwand: 9 SP**

## Epic 16 – Dokumentation

| ID     | User Story                              | Priorität |  SP | Abhängigkeiten |
| ------ | --------------------------------------- | :-------: | --: | -------------- |
| US-058 | Technische Entscheidungen dokumentieren |    P0     |   3 | US-061         |
| US-059 | Entwicklungsprozess dokumentieren       |    P0     |   3 | US-061         |
| US-060 | Lessons Learned dokumentieren           |    P0     |   3 | US-061         |

**Epic-Aufwand: 9 SP**

---

## Gesamtaufwand

**Gesamtschätzung aktiv: 211 SP**  
**Gesamtschätzung inklusive US-015 (Deferred): 213 SP**
