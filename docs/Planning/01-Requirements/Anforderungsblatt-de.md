# Anforderungsblatt: FlowOps

> **Projektziel:** Entwicklung einer realistischen, produktionsnahen Webanwendung als öffentlich dokumentierte Engineering Journey.

| Projektdetail  | Beschreibung                                       |
| -------------- | -------------------------------------------------- |
| **Projekt**    | FlowOps                                            |
| **Projekttyp** | Incident-Management-Plattform für technische Teams |
| **Version**    | 1.0                                                |
| **Stand**      | August 2026                                        |
| **Budget**     | 0 €                                                |

## 1. Projektbeschreibung

FlowOps ist eine webbasierte Incident-Management-Plattform für kleine technische Teams.

Die Anwendung soll Teams dabei unterstützen, technische Störungen zentral zu erfassen, zu priorisieren, zu bearbeiten und anschließend nachvollziehbar zu dokumentieren.

Der Schwerpunkt des Projekts liegt nicht ausschließlich auf dem fertigen Produkt. Der gesamte Entwicklungsprozess wird über eine mehrwöchige Blogserie dokumentiert.

Dabei sollen insbesondere folgende Aspekte sichtbar werden:

- Anforderungsanalyse
- Technische Planung
- Architekturentscheidungen
- Datenmodellierung
- Implementierung
- Testing
- Fehlerbehebung
- Security
- Deployment
- Technische Dokumentation
- Reflexion und Lessons Learned

Das Projekt soll zeigen, wie ein Midlevel-Entwickler ein Softwareprojekt selbstständig von der Idee bis zu einer lauffähigen Anwendung entwickelt.

## 2. Projektziele

### 2.1 Primäres Ziel

Entwicklung einer funktionierenden Incident-Management-Plattform, die einen vollständigen Incident-Lifecycle abbilden kann.

Ein Benutzer soll beispielsweise:

- einen Incident erstellen,
- dessen Schweregrad festlegen,
- einen Verantwortlichen zuweisen,
- den Bearbeitungsstatus ändern,
- Kommentare und Ereignisse dokumentieren,
- den Incident lösen,
- und anschließend ein Postmortem dokumentieren können.

### 2.2 Sekundäre Ziele

Das Projekt soll außerdem zeigen, dass der Entwickler:

- Anforderungen strukturiert analysieren kann,
- einen sinnvollen MVP definieren kann,
- Architekturentscheidungen begründen kann,
- moderne Webtechnologien sinnvoll einsetzen kann,
- sauberen und wartbaren Code schreiben kann,
- automatisierte Tests einsetzen kann,
- Fehler systematisch analysieren kann,
- eine Anwendung deployen kann,
- und technische Entscheidungen verständlich dokumentieren kann.

## 3. Zielgruppe

FlowOps richtet sich primär an kleine bis mittelgroße technische Teams.

Beispiele:

Softwareentwicklungsteams
IT-Abteilungen
DevOps-Teams
kleine SaaS-Unternehmen
technische Projektteams

Die Anwendung ist bewusst nicht als vollständige Enterprise-Lösung konzipiert.

## 4. Benutzerrollen

Für den MVP werden drei Rollen vorgesehen.

### 4.1 OWNER

OWNER können:

Organisationen verwalten
Benutzer verwalten
Benutzerrollen verwalten
Incidents verwalten
alle Incidents der Organisation einsehen
Systeme bzw. Services verwalten

### 4.2 ADMIN

ADMIN können:

Incidents erstellen
Incidents einsehen
Incidents bearbeiten
sich selbst oder andere Benutzer zuweisen
Kommentare hinzufügen
Status ändern
Severity ändern
Incidents lösen
Postmortems bearbeiten

### 4.3 MEMBER

MEMBER können:

Incidents einsehen
Incident-Details ansehen
Kommentare und Ereignisse lesen

MEMBER dürfen keine kritischen Daten verändern.

## 5. Funktionale Anforderungen

### FR-001 – Registrierung

Benutzer sollen ein Konto erstellen können.

Die Registrierung benötigt mindestens:

Name
E-Mail-Adresse
Passwort

Nach erfolgreicher Registrierung soll der Benutzer authentifiziert werden können.

### FR-002 – Login

Benutzer sollen sich mit ihren Zugangsdaten anmelden können.

Bei erfolgreicher Anmeldung wird eine authentifizierte Session erstellt.

### FR-003 – Logout

Benutzer müssen sich aktiv abmelden können.

Die Session muss dabei serverseitig bzw. über einen geeigneten sicheren Mechanismus beendet werden.

### FR-004 – Organisation

Benutzer sollen einer Organisation zugeordnet sein.

Eine Organisation stellt den logischen Mandanten der Anwendung dar.

Daten einer Organisation dürfen nicht für Benutzer einer anderen Organisation sichtbar sein.

### FR-005 – Benutzerverwaltung

OWNER und ADMIN sollen die Mitglieder ihrer Organisation verwalten können.

Mindestens erforderlich:

Benutzer anzeigen
Rolle ändern
Benutzer deaktivieren

## 6. Incident Management

### FR-006 – Incident erstellen

Ein berechtigter Benutzer soll einen Incident erstellen können.

Ein Incident benötigt mindestens:

Titel
Beschreibung
Severity
Status
Ersteller
Erstellungsdatum

### FR-007 – Incident Status

Ein Incident besitzt einen definierten Lifecycle.

Vorgeschlagene Stati:

```text
OPEN -> INVESTIGATING -> MITIGATED -> RESOLVED -> CLOSED
```

Nicht jede Statusänderung soll beliebig möglich sein.

Die erlaubten Übergänge werden durch die Business-Logik definiert.

### FR-008 – Severity

Jeder Incident besitzt eine Severity.

Vorgeschlagene Werte:

| Wert     | Bedeutung |
| -------- | --------- |
| **SEV1** | Critical  |
| **SEV2** | High      |
| **SEV3** | Medium    |
| **SEV4** | Low       |

Die Severity muss nachträglich geändert werden können.

### FR-009 – Verantwortlicher

Ein Incident kann einem Benutzer zugewiesen werden.

Die Zuweisung soll jederzeit geändert werden können.

### FR-010 – Incident Übersicht

Benutzer sollen eine Übersicht aller für sie sichtbaren Incidents erhalten.

Die Übersicht soll mindestens folgende Informationen enthalten:

Titel
Status
Severity
Verantwortlicher
Ersteller
Erstellungsdatum

### FR-011 – Incident Filter

Die Incident-Liste soll filterbar sein.

Mindestens:

Status
Severity
Verantwortlicher

Optional:

Zeitraum
Ersteller

### FR-012 – Incident Suche

Benutzer sollen Incidents anhand ihres Titels bzw. ihrer Beschreibung suchen können.

## 7. Incident Timeline

### FR-013 – Ereignisse

Änderungen an einem Incident sollen nachvollziehbar sein.

Beispiele:

Incident created
Severity changed
Status changed
Assignee changed
Comment added
Incident resolved

Diese Ereignisse werden als Timeline dargestellt.

### FR-014 – Kommentare

Berechtigte Benutzer sollen Kommentare zu einem Incident hinzufügen können.

Kommentare dürfen nach Möglichkeit nicht einfach spurlos gelöscht werden.

### FR-015 – Audit Trail

Kritische Änderungen sollen protokolliert werden.

Mindestens:

wer hat geändert?
was wurde geändert?
wann wurde geändert?

Beispiel:

Dominik changed severity
SEV3 → SEV2

25.08.2026 14:32

## 8. Postmortem

### FR-016 – Postmortem erstellen

Nach der Lösung eines Incidents soll ein Postmortem erstellt werden können.

Das Postmortem soll mindestens enthalten:

Zusammenfassung
Auswirkungen
Ursache
Lösung
Lessons Learned
Maßnahmen

### FR-017 – Postmortem Status

Ein Postmortem kann beispielsweise folgende Zustände besitzen:

DRAFT
↓
REVIEW
↓
PUBLISHED

## 9. Services / Systeme

### FR-018 – Services verwalten

OWNER und ADMIN sollen technische Services bzw. Systeme definieren können.

Beispiele:

API
Web Application
Database
Authentication Service
Payment Service

Ein Incident kann einem Service zugeordnet werden.

## 10. Dashboard

### FR-019 – Dashboard

Nach dem Login soll der Benutzer ein Dashboard sehen.

Das Dashboard soll einen schnellen Überblick über den aktuellen Zustand liefern.

Mindestens:

offene Incidents
kritische Incidents
Incidents in Bearbeitung
kürzlich gelöste Incidents

Optional:

durchschnittliche Lösungszeit
Incidents pro Severity
Incidents pro Service

## 11. Berechtigungen

### FR-020 – Authorization

Die Anwendung muss serverseitig überprüfen, ob ein Benutzer eine Aktion durchführen darf.

Berechtigungen dürfen nicht ausschließlich im Frontend umgesetzt werden.

Beispiel:

MEMBER
↓
GET /incidents ✓
POST /incidents ✗
PATCH /incidents ✗

## 12. Technische Anforderungen

### TR-001 – Frontend

Das Frontend wird mit modernen React-/TypeScript-Technologien entwickelt.

Vorgesehener Stack:

React
TypeScript
Tailwind CSS

### TR-002 – Backend

Die API soll mit TypeScript umgesetzt werden.

Vorgesehen:

Hono
Cloudflare Workers

### TR-003 – Datenbank

Als relationale Datenbank wird Cloudflare D1 verwendet.

Das Datenmodell soll migrationsbasiert verwaltet werden.

### TR-004 – API

Die Anwendung soll eine klar strukturierte HTTP-API bereitstellen.

Die API soll:

validierte Eingaben akzeptieren
Fehler konsistent zurückgeben
Authentifizierung berücksichtigen
Authorization serverseitig prüfen

### TR-005 – TypeScript

TypeScript soll sowohl im Frontend als auch im Backend verwendet werden.

Der Einsatz von any soll soweit sinnvoll vermieden werden.

## 13. Authentication & Security

### TR-006 – Passwortspeicherung

Passwörter dürfen niemals im Klartext gespeichert werden.

Es muss ein geeigneter Passwort-Hashing-Mechanismus verwendet werden.

### TR-007 – Sessions

Authentifizierte Benutzer sollen über sichere Sessions identifiziert werden.

Dabei sollen geeignete Cookie-Sicherheitsmechanismen verwendet werden.

### TR-008 – Zugriffsschutz

Geschützte API-Endpunkte dürfen nur von authentifizierten und entsprechend berechtigten Benutzern verwendet werden.

### TR-009 – Mandantentrennung

Ein Benutzer darf keine Daten einer anderen Organisation abrufen oder verändern können.

Diese Prüfung muss serverseitig erfolgen.

### TR-010 – Input Validation

Benutzereingaben müssen serverseitig validiert werden.

Ungültige Daten dürfen nicht ungeprüft in die Datenbank übernommen werden.

## 14. Testing

### TR-011 – Unit Tests

Kritische Business-Logik soll durch Unit Tests abgesichert werden.

Besonders:

Statusübergänge
Berechtigungen
Validierungen
Incident-Logik

### TR-012 – Integration Tests

API-Endpunkte und deren Zusammenspiel mit der Datenbank sollen getestet werden.

### TR-013 – End-to-End Tests

Mindestens ein vollständiger kritischer Benutzerablauf soll als E2E-Test abgedeckt werden.

Beispiel:

Login
↓
Incident erstellen
↓
Incident bearbeiten
↓
Status ändern
↓
Kommentar hinzufügen
↓
Incident lösen
↓
Postmortem erstellen

## 15. Qualität

### TR-014 – Linting

Der Quellcode soll automatisch auf bekannte Probleme geprüft werden.

### TR-015 – Formatting

Der Code soll einheitlich formatiert werden.

### TR-016 – Type Checking

TypeScript-Fehler sollen Bestandteil des CI-Prozesses sein.

### TR-017 – CI

Bei einem Pull Request bzw. Push sollen automatisiert mindestens folgende Prüfungen ausgeführt werden:

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

FlowOps soll öffentlich erreichbar deployed werden.

Das Deployment soll automatisiert bzw. reproduzierbar sein.

### TR-019 – Kosten

Das gesamte Projekt soll ohne laufende Infrastrukturkosten betrieben werden.

Zielbudget: 0 €

Es sollen ausschließlich kostenlose Angebote bzw. Free-Tier-Angebote verwendet werden, soweit diese für den MVP ausreichend sind.

## 17. Nicht-funktionale Anforderungen

### NFR-001 – Performance

Die Anwendung soll für eine kleine Benutzerbasis performant reagieren.

Besonders wichtige Seiten:

Login
Dashboard
Incident-Liste
Incident-Detailseite

### NFR-002 – Usability

Die Benutzeroberfläche soll:

verständlich
konsistent
responsive
keyboard-freundlich

sein.

### NFR-003 – Accessibility

Die Anwendung soll grundlegende Accessibility-Prinzipien berücksichtigen.

Insbesondere:

semantisches HTML
ausreichende Kontraste
Tastaturbedienung
verständliche Formulare
sichtbare Fokuszustände

### NFR-004 – Wartbarkeit

Der Code soll modular aufgebaut sein.

Business-Logik soll möglichst nicht direkt an UI-Komponenten gekoppelt werden.

### NFR-005 – Dokumentation

Wichtige technische Entscheidungen sollen dokumentiert werden.

Dazu gehören beispielsweise:

- Architekturentscheidungen
- Datenmodell
- Authentication
- Testing-Strategie
- Deployment

## 18. MVP-Scope

Um das Projekt realistisch zu halten, wird zunächst nur ein klar definierter MVP umgesetzt.

> **Version 1.0:** Die folgenden Funktionen werden bewusst nicht implementiert und bleiben möglichen späteren Versionen vorbehalten.

### Muss enthalten sein

- Registrierung
- Login / Logout
- Organisationen
- Benutzerrollen
- Incident erstellen und bearbeiten
- Incident-Lifecycle
- Severity und Zuweisung
- Kommentare, Timeline und Audit Events
- Incident-Liste und Filter
- Dashboard
- Postmortem
- serverseitige Authorization
- Tests, CI und Deployment

### Kann später ergänzt werden

- E-Mail-Benachrichtigungen
- Slack-Integration
- Webhooks
- Datei-Uploads
- komplexe Analytics
- Service Health Checks
- automatische Incident-Erstellung
- externe Monitoring-Integrationen
- SSO
- 2FA

### Explizit nicht Bestandteil des MVP

- Mobile App
- native Desktop-Anwendung
- Enterprise-SSO
- komplexes Billing
- Multi-Region-Infrastruktur
- hochverfügbare Enterprise-Architektur
- KI-basierte Incident-Analyse

## 19. Erfolgsdefinition

Das Projekt gilt als erfolgreich, wenn ein Benutzer den folgenden Ablauf vollständig durchführen kann:

```text
Account erstellen
	-> Organisation erstellen/beitreten
	-> Login
	-> Incident erstellen
	-> Severity festlegen
	-> Service auswählen
	-> Mitarbeiter zuweisen
	-> Incident untersuchen
	-> Kommentare hinzufügen
	-> Status verändern
	-> Incident lösen
	-> Postmortem erstellen
```

## 20. Engineering-Journal

Dabei müssen alle kritischen Aktionen:

- autorisiert,
- validiert,
- getestet
- und nachvollziehbar protokolliert

werden.

Ein besonderer Bestandteil des Projekts ist die öffentliche Dokumentation des Entwicklungsprozesses.

Jede größere Entwicklungsphase wird in einem wöchentlichen Blogbeitrag dokumentiert.

Die Beiträge sollen nicht nur das Ergebnis zeigen, sondern den tatsächlichen Entscheidungsprozess.

Jeder Beitrag soll nach Möglichkeit folgende Punkte enthalten:

Ausgangssituation

Was war der aktuelle Stand?

Ziel

Was sollte in dieser Woche erreicht werden?

Vorgehen

Wie wurde das Problem bearbeitet?

Entscheidungen

Welche technischen Entscheidungen wurden getroffen?

Alternativen

Welche anderen Lösungen wurden betrachtet?

Probleme

Was hat nicht funktioniert?

Lösung

Wie wurde das Problem gelöst?

Ergebnis

Was ist am Ende entstanden?

Learnings

Was wurde aus der Arbeit gelernt?

Nächste Schritte

Was wird in der nächsten Woche gemacht?

## 21. Geplante Entwicklungsphasen

| Phase | Thema               | Ergebnis             |
| ----- | ------------------- | -------------------- |
| 01    | Idee & Scope        | Anforderungen        |
| 02    | Architektur         | Technisches Konzept  |
| 03    | Datenmodell         | Datenbankschema      |
| 04    | Foundation          | Entwicklungsumgebung |
| 05    | Authentication      | Login & Sessions     |
| 06    | Incident Management | Kernfunktion         |
| 07    | Timeline & Audit    | Nachvollziehbarkeit  |
| 08    | Postmortems         | Incident-Abschluss   |
| 09    | Testing             | Teststrategie        |
| 10    | Deployment          | Production-Version   |
| 11    | Retrospektive       | Lessons Learned      |

## 22. Wichtigster Projektgrundsatz

FlowOps soll nicht möglichst groß werden.

Der wichtigste Grundsatz lautet:

Build only what is necessary, but build it properly.

Das Projekt soll lieber einen überschaubaren Funktionsumfang mit sauberer Architektur, Tests, Security und nachvollziehbaren Entscheidungen besitzen, als eine große Anzahl oberflächlicher Features.

Damit bleibt der Fokus nicht nur auf dem Produkt, sondern auf dem eigentlichen Ziel des Projekts:

Zu zeigen, wie ich als Softwareentwickler arbeite.
