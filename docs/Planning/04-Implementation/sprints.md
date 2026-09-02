# FlowOps – Sprintplanung

## Gesamtübersicht

Die Sprintplanung ordnet die vorhandenen User Stories nach ihren fachlichen und technischen Abhängigkeiten.

Sprint 0 bildet dabei keine fachliche Funktionalität ab, sondern schafft die technische Grundlage für die anschließende Implementierung.

Die folgenden Sprints bauen grundsätzlich aufeinander auf. Einzelne technische Aufgaben können dabei bereits während eines früheren Sprints vorbereitet werden, die fachliche Fertigstellung der jeweiligen User Stories erfolgt jedoch in dem dafür vorgesehenen Sprint.

|  Sprint | Schwerpunkt            |                     User Stories | Ergebnis                                             |
| ------: | ---------------------- | -------------------------------: | ---------------------------------------------------- |
|       0 | Foundation             |                                – | Lauffähige technische Projektbasis                   |
|       1 | Authentication         |          US-001 – US-004, US-061 | Registrierung, Login, Logout und geschützte Bereiche |
|       2 | Organizations          |                  US-005 – US-007 | Organisationen und grundlegende Mandantentrennung    |
|       3 | Users & Roles          |                  US-008 – US-011 | Mitgliederverwaltung und Rollen                      |
|       4 | Services               |                  US-012 – US-015 | Verwaltbare Services                                 |
|       5 | Incident Core          |          US-016 – US-020, US-026 | Erster vollständiger Incident-Flow                   |
|       6 | Incident Lifecycle     |                  US-021 – US-025 | Vollständiger Incident-Lifecycle                     |
|       7 | Timeline & Audit       |                  US-031 – US-033 | Nachvollziehbare Incident-Historie                   |
|       8 | Search & Filter        |                  US-027 – US-030 | Incidents suchen und filtern                         |
|       9 | Postmortem             |                  US-034 – US-037 | Vollständige Incident-Aufarbeitung                   |
|      10 | Dashboard & UX         | US-038 – US-041, US-055 – US-057 | Nutzbare Übersicht und Benutzeroberfläche            |
|      11 | Security, Testing & CI |                  US-042 – US-051 | Qualitätssicherung und automatisierte Prüfungen      |
|      12 | Deployment             |                  US-052 – US-054 | Öffentlich erreichbare Anwendung                     |
| laufend | Dokumentation          |                  US-058 – US-060 | Technische Dokumentation und Projektdokumentation    |

---

# Sprint 0 – Foundation

## User Stories

Keine.

Sprint 0 ist bewusst von den fachlichen User Stories getrennt.

## Ziel

Eine leere, aber technisch funktionierende Projektbasis, auf der die folgenden Sprints umgesetzt werden können.

## Inhalt

- Repository und Projektstruktur vorbereiten
- Entwicklungsumgebung einrichten
- Grundlegende Projektkonfiguration erstellen
- Abhängigkeiten und Build-Prozess einrichten
- Entwicklungs- und Produktionsumgebung vorbereiten
- Grundlegende Code-Struktur festlegen
- Basis für spätere Tests und CI schaffen

## Ergebnis

Am Ende des Sprints lässt sich das Projekt lokal starten, bauen und weiterentwickeln.

Es existiert noch keine fachliche FlowOps-Funktionalität.

---

# Sprint 1 – Authentication

## User Stories

- US-001 – Create an account
- US-002 – Log in
- US-003 – Log out
- US-004 – Protect unauthenticated areas
- US-061 – Session Management

## Ziel

Ein Benutzer kann einen Account erstellen, sich anmelden, geschützte Bereiche verwenden und sich wieder abmelden.

Der grundlegende Flow lautet:

```text
Register
   ↓
Login
   ↓
Authenticated Session
   ↓
Protected Area
   ↓
Logout
```

## Schwerpunkte

- Benutzerregistrierung
- Login
- Logout
- Session-Erstellung
- Session-Validierung
- Schutz geschützter Bereiche
- Session-Lifetime
- Inaktivitäts-Timeout
- sofortige Session-Invalidierung beim Logout

## Ergebnis

Ein nicht authentifizierter Benutzer kann keine geschützten Bereiche der Anwendung verwenden.

Ein authentifizierter Benutzer besitzt eine gültige Session und kann sich sicher abmelden.

---

# Sprint 2 – Organizations

## User Stories

- US-005 – Create an organization
- US-006 – View organization
- US-007 – Update organization

## Ziel

FlowOps erhält das Organisationskonzept.

Benutzer arbeiten nicht global mit Daten, sondern innerhalb einer Organisation.

## Schwerpunkte

- Organisation erstellen
- Organisationsdaten anzeigen
- Organisationsdaten bearbeiten
- Zuordnung von Benutzern zu Organisationen
- Trennung von Organisationsdaten

## Ergebnis

Eine Organisation kann erstellt und verwaltet werden.

Die Grundlage für die spätere Benutzer-, Rollen- und Ressourcenverwaltung ist vorhanden.

---

# Sprint 3 – Users & Roles

## User Stories

- US-008
- US-009
- US-010
- US-011

## Ziel

Benutzer können innerhalb einer Organisation verwaltet werden und besitzen definierte Rollen.

## Schwerpunkte

- Mitglieder einer Organisation
- Rollen
- Rollenbasierte Berechtigungen
- Aktivierung und Deaktivierung von Mitgliedschaften
- Verwaltung der Organisationsmitglieder

## Ergebnis

Ein Benutzer gehört zu einer Organisation und besitzt innerhalb dieser Organisation eine definierte Rolle.

Damit ist die Grundlage für die spätere Autorisierung der einzelnen Funktionen vorhanden.

---

# Sprint 4 – Services

## User Stories

- US-012
- US-013
- US-014
- US-015

## Ziel

Services können innerhalb einer Organisation verwaltet und später Incidents zugeordnet werden.

## Schwerpunkte

- Services erstellen
- Services anzeigen
- Services bearbeiten
- Services deaktivieren
- Organisationszugehörigkeit der Services

## Ergebnis

Eine Organisation verfügt über verwaltbare Services.

Diese Services können anschließend als Bezugspunkt für Incidents verwendet werden.

---

# Sprint 5 – Incident Core

## User Stories

- US-016
- US-017
- US-018
- US-019
- US-020
- US-026

## Ziel

Der erste echte End-to-End-Flow von FlowOps wird funktionsfähig.

```text
Login
   ↓
Incident erstellen
   ↓
Incident anzeigen
   ↓
Incident bearbeiten
   ↓
Incidents auflisten
```

## Schwerpunkte

- Incident erstellen
- Incident anzeigen
- Incident bearbeiten
- Incident einer Organisation zuordnen
- Incident einem Service zuordnen
- Ersteller und Verantwortlichkeiten
- Incident-Liste
- Grundlegende Incident-Daten

## Ergebnis

Ein authentifizierter Benutzer kann einen Incident erstellen und anschließend anzeigen und bearbeiten.

Incidents sind ausschließlich innerhalb des eigenen Organisationskontexts sichtbar.

Dieser Sprint stellt damit den ersten wichtigen funktionierenden Produktfluss dar.

---

# Sprint 6 – Incident Lifecycle

## User Stories

- US-021 – Investigate an incident
- US-022 – Mitigate an incident
- US-023 – Resolve an incident
- US-024 – Close an incident
- US-025 – Prevent invalid status transitions

## Ziel

Incidents erhalten einen definierten und kontrollierten Lebenszyklus.

```text
OPEN
  ↓
INVESTIGATING
  ↓
MITIGATED
  ↓
RESOLVED
  ↓
CLOSED
```

## Schwerpunkte

- Incident untersuchen
- Incident mitigieren
- Incident lösen
- Incident schließen
- erlaubte Statusübergänge
- Verhindern ungültiger Statusübergänge
- Berechtigungsprüfung bei Statusänderungen

## Ergebnis

Ein Incident kann den vollständigen definierten Lifecycle durchlaufen.

Ungültige oder nicht autorisierte Statusänderungen werden abgelehnt.

---

# Sprint 7 – Timeline & Audit

## User Stories

- US-031 – View the incident timeline
- US-032 – Add a comment
- US-033 – Trace changes

## Ziel

Die Bearbeitung eines Incidents wird nachvollziehbar.

## Schwerpunkte

- Incident-Timeline
- Kommentare
- automatische Speicherung des Autors
- automatische Zeitstempel
- relevante Änderungen dokumentieren
- alte und neue Werte nachvollziehbarer Änderungen
- Zuordnung von Änderungen zu Benutzern

## Ergebnis

Die Geschichte eines Incidents kann nachvollzogen werden.

Nicht nur der aktuelle Zustand ist sichtbar, sondern auch relevante Ereignisse während der Bearbeitung.

---

# Sprint 8 – Search & Filter

## User Stories

- US-027 – Filter incidents by status
- US-028 – Filter incidents by severity
- US-029 – Filter incidents by assignee
- US-030 – Search incidents

## Ziel

Auch bei einer größeren Anzahl von Incidents können relevante Einträge schnell gefunden werden.

## Schwerpunkte

- Filter nach Status
- Filter nach Severity
- Filter nach Verantwortlichem
- Suche nach Incidents
- Suche innerhalb von Titel und Beschreibung
- Berücksichtigung des Organisationskontexts

## Ergebnis

Benutzer können Incidents gezielt suchen und nach relevanten Eigenschaften filtern.

---

# Sprint 9 – Postmortem

## User Stories

- US-034
- US-035
- US-036
- US-037

## Ziel

Nach der operativen Bearbeitung eines Incidents kann dieser strukturiert aufgearbeitet und als Postmortem dokumentiert werden.

## Schwerpunkte

- Postmortem erstellen
- Postmortem bearbeiten
- Postmortem-Inhalte verwalten
- Postmortem veröffentlichen
- Berechtigungen für Erstellung und Veröffentlichung

## Ergebnis

Der vollständige fachliche Incident-Prozess ist abgebildet:

```text
Incident
   ↓
Investigation
   ↓
Mitigation
   ↓
Resolution
   ↓
Postmortem
   ↓
Closure
```

---

# Sprint 10 – Dashboard & UX

## User Stories

- US-038
- US-039
- US-040
- US-041
- US-055
- US-056
- US-057

## Ziel

Die bisher implementierte Funktionalität wird zu einer zusammenhängenden und nutzbaren Anwendung.

## Schwerpunkte

- Dashboard
- relevante Kennzahlen
- Übersicht über Incidents
- Navigation
- Benutzerführung
- UX-Verbesserungen
- Accessibility
- responsive Darstellung

## Ergebnis

FlowOps ist nicht mehr nur eine Sammlung einzelner Funktionen, sondern bietet eine zusammenhängende Benutzeroberfläche.

---

# Sprint 11 – Security, Testing & CI

## User Stories

- US-042
- US-043
- US-044
- US-045
- US-046
- US-047
- US-048
- US-049
- US-050
- US-051

## Ziel

Die bisher implementierte Anwendung wird systematisch überprüft und automatisiert abgesichert.

## Schwerpunkte

- Security-Anforderungen überprüfen
- serverseitige Autorisierung
- Organisations- und Tenant-Isolation
- Eingabevalidierung
- automatisierte Tests
- Integrationstests
- Fehlerfälle
- Code Quality
- Continuous Integration

## Ergebnis

Änderungen am Projekt werden automatisiert geprüft.

Die wichtigsten fachlichen und sicherheitsrelevanten Funktionen sind durch Tests abgesichert.

---

# Sprint 12 – Deployment

## User Stories

- US-052
- US-053
- US-054

## Ziel

FlowOps wird als öffentlich erreichbare Anwendung bereitgestellt.

## Schwerpunkte

- Produktionsumgebung
- Deployment
- Umgebungsvariablen und Secrets
- Datenbankbereitstellung
- Build und Release
- Erreichbarkeit der Anwendung

## Ergebnis

Die Anwendung ist öffentlich erreichbar und kann in einer produktionsnahen Umgebung verwendet werden.

---

# Dokumentation – laufend

## User Stories

- US-058
- US-059
- US-060

## Ziel

Die Entwicklung von FlowOps wird nicht erst am Ende dokumentiert.

Entscheidungen, technische Erkenntnisse und relevante Änderungen werden während des gesamten Projekts festgehalten.

## Schwerpunkte

- technische Dokumentation
- Architekturentscheidungen
- Entwicklungsdokumentation
- relevante Entscheidungen
- Lessons Learned
- Aktualisierung der Projektdokumentation

## Ergebnis

Die Dokumentation entwickelt sich gemeinsam mit dem Projekt und bildet nachvollziehbar ab, wie FlowOps entstanden ist.

---

# Sprint-Prinzipien

Die Sprintplanung folgt einigen grundlegenden Prinzipien.

## 1. Fachliche Abhängigkeiten zuerst

Ein Sprint soll grundsätzlich auf bereits vorhandenen Grundlagen aufbauen.

Beispielsweise kann ein Incident erst sinnvoll einem Benutzer, einer Organisation und einem Service zugeordnet werden, wenn diese Konzepte bereits vorhanden sind.

Daher kommt der Incident Core erst nach Authentication, Organizations, Users & Roles und Services.

## 2. Foundation ist kein fachlicher Sprint

Sprint 0 enthält bewusst keine User Stories.

Er schafft lediglich die technische Grundlage für die Umsetzung.

Dadurch wird verhindert, dass technische Setup-Arbeiten künstlich als Produktfunktionalität dargestellt werden.

## 3. Security wird nicht erst am Ende berücksichtigt

Obwohl Security und die entsprechenden User Stories einen eigenen Schwerpunkt in Sprint 11 bilden, müssen Sicherheitsanforderungen bereits bei der Implementierung der jeweiligen Funktionen berücksichtigt werden.

Sprint 11 dient daher vor allem der systematischen Überprüfung, Absicherung und Automatisierung.

## 4. Tests begleiten die Entwicklung

Testing wird nicht ausschließlich als abschließende Tätigkeit verstanden.

Während der Entwicklung sollen relevante Funktionen bereits getestet werden.

Sprint 11 bündelt anschließend die umfassende Qualitätssicherung und die Integration in CI.

## 5. Dokumentation läuft parallel

Dokumentation ist kein letzter Schritt nach der Implementierung.

Entscheidungen sollen möglichst dann dokumentiert werden, wenn sie getroffen werden.

Dadurch bleibt nachvollziehbar, warum FlowOps an bestimmten Stellen auf eine bestimmte Weise umgesetzt wurde.

---

# Definition eines abgeschlossenen Sprints

Ein Sprint gilt als abgeschlossen, wenn:

- die vorgesehenen User Stories umgesetzt wurden,
- deren Acceptance Criteria erfüllt sind,
- die relevanten Tests erfolgreich sind,
- keine bekannten kritischen Fehler offen sind,
- die Änderungen in das Repository übernommen wurden,
- relevante Dokumentation aktualisiert wurde,
- und die Definition of Done erfüllt ist.

Die konkrete Prüfung erfolgt anhand der bestehenden `Definition-of-Done.md`.

---

# Gesamtziel

Die Sprintplanung führt von einer leeren technischen Grundlage schrittweise zu einer vollständigen MVP-Anwendung.

```text
Foundation
    ↓
Authentication
    ↓
Organizations
    ↓
Users & Roles
    ↓
Services
    ↓
Incident Core
    ↓
Incident Lifecycle
    ↓
Timeline & Audit
    ↓
Search & Filter
    ↓
Postmortem
    ↓
Dashboard & UX
    ↓
Security / Testing / CI
    ↓
Deployment
```

Das Ziel ist dabei nicht, möglichst schnell möglichst viele Features umzusetzen.

Jeder Sprint soll einen nachvollziehbaren Schritt auf dem Weg zu einem funktionierenden MVP darstellen.
