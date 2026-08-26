# FlowOps – User Stories

## Gesamtübersicht

Das Backlog umfasst aktuell **60 User Stories** in 16 Epics.

|       Epic | Bereich                | Stories |
| ---------: | ---------------------- | ------: |
|          1 | Authentication         |       4 |
|          2 | Organizations          |       3 |
|          3 | Users & Roles          |       4 |
|          4 | Services               |       4 |
|          5 | Incident Management    |       5 |
|          6 | Incident Lifecycle     |       5 |
|          7 | Incident List & Search |       5 |
|          8 | Timeline & Audit       |       3 |
|          9 | Postmortems            |       4 |
|         10 | Dashboard              |       4 |
|         11 | Security               |       3 |
|         12 | Testing                |       3 |
|         13 | Code Quality & CI      |       4 |
|         14 | Deployment             |       3 |
|         15 | Accessibility & UX     |       3 |
|         16 | Documentation          |       3 |
| **Gesamt** |                        |  **60** |

## Epic 1 – Authentication

### US-001 – Account erstellen

Als neuer Benutzer
möchte ich einen Account erstellen können,
damit ich FlowOps nutzen kann.

Acceptance Criteria:

Benutzer kann Name, E-Mail und Passwort eingeben.
E-Mail muss valide sein.
Passwort muss die definierten Mindestanforderungen erfüllen.
E-Mail darf nicht bereits registriert sein.
Passwort wird nicht im Klartext gespeichert.
Nach erfolgreicher Registrierung wird ein Benutzerkonto erstellt.
Der Benutzer erhält eine gültige Session bzw. wird eingeloggt.

Bezug: FR-001, TR-006

### US-002 – Einloggen

Als registrierter Benutzer
möchte ich mich anmelden können,
damit ich auf meine Organisation und deren Daten zugreifen kann.

Acceptance Criteria:

Benutzer kann E-Mail und Passwort eingeben.
Gültige Zugangsdaten führen zu einer erfolgreichen Anmeldung.
Ungültige Zugangsdaten führen zu einer verständlichen Fehlermeldung.
Eine sichere Session wird erstellt.
Geschützte Bereiche sind nach erfolgreichem Login erreichbar.

Bezug: FR-002, TR-007, TR-008

### US-003 – Ausloggen

Als angemeldeter Benutzer
möchte ich mich ausloggen können,
damit meine Session beendet wird.

Acceptance Criteria:

Benutzer kann Logout ausführen.
Session wird ungültig.
Geschützte Bereiche sind danach nicht mehr zugänglich.
Benutzer wird zur Login-Seite weitergeleitet.

Bezug: FR-003

### US-004 – Nicht authentifizierte Bereiche schützen

Als Betreiber der Anwendung
möchte ich, dass geschützte Bereiche nur authentifizierten Benutzern zugänglich sind,
damit keine unberechtigten Personen auf Daten zugreifen können.

Acceptance Criteria:

Nicht authentifizierte Requests auf geschützte Endpunkte werden abgelehnt.
Benutzer werden bei geschützten UI-Seiten zum Login weitergeleitet.
Authorization wird serverseitig geprüft.

Bezug: TR-008

## Epic 2 – Organizations

### US-005 – Organisation erstellen

Als neuer Benutzer
möchte ich eine Organisation erstellen können,
damit ich FlowOps für mein Team einrichten kann.

Acceptance Criteria:

Benutzer kann einen Organisationsnamen angeben.
Eine Organisation wird erstellt.
Die Organisation ist eindeutig identifizierbar.
Der erstellende Benutzer erhält die Rolle **OWNER**.
Für den erstellenden Benutzer wird eine Membership mit dem Status **ACTIVE** angelegt.

Bezug: FR-004

### US-006 – Organisation beitreten

Als Benutzer
möchte ich einer Organisation beitreten können,
damit ich gemeinsam mit meinem Team arbeiten kann.

Acceptance Criteria:

Benutzer kann einer vorgesehenen Organisation beitreten.
Ein Benutzer kann mehreren Organisationen angehören.
Für den Benutzer wird eine Membership mit dem Status **ACTIVE** angelegt.
Die Membership erhält eine definierte organisationsbezogene Rolle.
Benutzer kann anschließend auf die für ihn freigegebenen Organisationsdaten zugreifen.

### US-007 – Organisationsdaten voneinander trennen

Als Betreiber der Plattform
möchte ich, dass Organisationen vollständig voneinander getrennt sind,
damit Benutzer niemals Daten anderer Organisationen sehen können.

Acceptance Criteria:

Jede relevante Ressource ist einer Organisation zugeordnet.
API-Anfragen berücksichtigen die Organisation des Benutzers.
Direkter Zugriff auf fremde Ressourcen wird serverseitig verhindert.
Ein Benutzer kann keine Daten einer anderen Organisation verändern.

Bezug: FR-004, TR-009

## Epic 3 – User & Roles

### US-008 – Mitglieder anzeigen

Als Administrator
möchte ich alle Mitglieder meiner Organisation sehen können,
damit ich einen Überblick über mein Team habe.

Acceptance Criteria:

Mitglieder werden angezeigt.
Name und Rolle sind sichtbar.
Der Membership-Status ist sichtbar.
Nur Mitglieder der eigenen Organisation werden angezeigt.

Bezug: FR-005

### US-009 – Benutzerrolle ändern

Als Administrator
möchte ich die Rolle eines Mitglieds ändern können,
damit ich dessen Berechtigungen verwalten kann.

Acceptance Criteria:

Administrator kann die organisationsbezogene Rolle eines Mitglieds ändern.
Verfügbare Rollen sind definiert.
Änderungen werden gespeichert.
Die neuen Berechtigungen gelten unmittelbar.

Bezug: FR-005

### US-010 – Benutzer deaktivieren

Als Administrator
möchte ich die Membership eines Benutzers deaktivieren können,
damit ehemalige Teammitglieder keinen Zugriff mehr auf die Organisation haben.

Acceptance Criteria:

Administrator kann die Membership eines Benutzers deaktivieren.
Der Membership-Status wird auf **DISABLED** gesetzt.
Der Zugriff auf die Organisation und ihre Ressourcen endet sofort, auch bei einer gültigen Session.
Historische Aktionen des Benutzers bleiben erhalten.

Bezug: FR-005

### US-011 – Berechtigungen entsprechend der Rolle anwenden

Als Administrator
möchte ich, dass jede Benutzerrolle nur die vorgesehenen Aktionen ausführen kann,
damit sensible Funktionen geschützt sind.

Acceptance Criteria:

OWNER kann die Organisation und ihre Mitglieder verwalten.
ADMIN kann operative Ressourcen und Incidents verwalten.
MEMBER kann im Rahmen der definierten Berechtigungen an der Incident-Bearbeitung teilnehmen.
Nicht erlaubte Aktionen werden serverseitig abgelehnt.

Bezug: FR-020

## Epic 4 – Services

### US-012 – Service erstellen

Als Administrator
möchte ich einen technischen Service erstellen können,
damit Incidents einem konkreten System zugeordnet werden können.

Acceptance Criteria:

Administrator kann einen Namen angeben.
Service wird der Organisation zugeordnet.
Service kann anschließend ausgewählt werden.

Bezug: FR-018

### US-013 – Services anzeigen

Als Teammitglied
möchte ich die Services meiner Organisation sehen können,
damit ich Incidents dem richtigen System zuordnen kann.

### US-014 – Service bearbeiten

Als Administrator
möchte ich einen Service bearbeiten können,
damit Informationen aktuell bleiben.

### US-015 – Service deaktivieren

Als Administrator
möchte ich einen Service deaktivieren können,
damit nicht mehr verwendete Systeme nicht mehr für neue Incidents angeboten werden.

## Epic 5 – Incident Management

### US-016 – Incident erstellen

Als Teammitglied
möchte ich einen Incident erstellen können,
damit ich eine technische Störung dokumentieren kann.

Acceptance Criteria:

Titel ist erforderlich.
Beschreibung ist erforderlich.
Severity ist erforderlich.
Status wird initial auf OPEN gesetzt.
Ersteller wird automatisch gesetzt.
Erstellungszeitpunkt wird automatisch gespeichert.
Incident wird der aktuellen Organisation zugeordnet.

Bezug: FR-006

### US-017 – Incident anzeigen

Als Teammitglied
möchte ich die Details eines Incidents sehen können,
damit ich seinen aktuellen Zustand und seine Historie verstehen kann.

Acceptance Criteria:

Titel wird angezeigt.
Beschreibung wird angezeigt.
Status wird angezeigt.
Severity wird angezeigt.
Service wird angezeigt.
Verantwortlicher wird angezeigt.
Timeline wird angezeigt.
Postmortem wird angezeigt, sofern vorhanden.

### US-018 – Incident bearbeiten

Als berechtigtes Teammitglied
möchte ich einen Incident bearbeiten können,
damit sich ändernde Informationen aktualisiert werden können.

Acceptance Criteria:

Titel kann geändert werden.
Beschreibung kann geändert werden.
Service kann geändert werden.
Änderungen werden gespeichert.
Änderungen werden nachvollziehbar protokolliert.

### US-019 – Incident Severity festlegen

Als Teammitglied
möchte ich die Severity eines Incidents festlegen können,
damit die Dringlichkeit des Problems sichtbar ist.

Acceptance Criteria:

Die API unterstützt aktuell die Werte `low`, `medium`, `high` und `critical`.
Die verbindliche Zuordnung zu den Datenmodellwerten `SEV1` bis `SEV4` ist vor der Implementierung festzulegen.
Severity kann geändert werden.
Änderung wird als Event protokolliert.

Bezug: FR-008

### US-020 – Incident zuweisen

Als Teammitglied
möchte ich einen Incident einem Benutzer zuweisen können,
damit klar ist, wer für die Bearbeitung verantwortlich ist.

Acceptance Criteria:

Benutzer der Organisation können ausgewählt werden.
Verantwortlicher wird gespeichert.
Änderung wird in der Timeline protokolliert.

Bezug: FR-009

## Epic 6 – Incident Lifecycle

### US-021 – Incident untersuchen

Als Teammitglied
möchte ich einen Incident auf INVESTIGATING setzen können,
damit sichtbar ist, dass das Team aktiv nach der Ursache sucht.

### US-022 – Incident mitigieren

Als Teammitglied
möchte ich einen Incident auf MITIGATED setzen können,
damit sichtbar ist, dass die Auswirkungen zunächst reduziert wurden.

### US-023 – Incident lösen

Als Teammitglied
möchte ich einen Incident auf RESOLVED setzen können,
damit dokumentiert ist, dass die Störung behoben wurde.

### US-024 – Incident schließen

Als berechtigter Benutzer
möchte ich einen gelösten Incident schließen können,
damit der Incident-Lifecycle abgeschlossen ist.

### US-025 – Ungültige Statusübergänge verhindern

Als Betreiber der Anwendung
möchte ich, dass nur erlaubte Statusübergänge möglich sind,
damit Incidents einen konsistenten Lifecycle besitzen.

Acceptance Criteria:

Beispielsweise:

OPEN → INVESTIGATING ✓
INVESTIGATING → MITIGATED ✓
MITIGATED → RESOLVED ✓
RESOLVED → CLOSED ✓

Nicht erlaubte Übergänge werden abgelehnt.

Bezug: FR-007

## Epic 7 – Incident List & Search

### US-026 – Incidents anzeigen

Als Teammitglied
möchte ich alle für mich sichtbaren Incidents sehen können,
damit ich einen Überblick über aktuelle und vergangene Störungen habe.

Acceptance Criteria:

Incidents der eigenen Organisation werden angezeigt.
Titel wird angezeigt.
Status wird angezeigt.
Severity wird angezeigt.
Verantwortlicher wird angezeigt.
Ersteller wird angezeigt.
Erstellungsdatum wird angezeigt.

Bezug: FR-010

### US-027 – Incidents nach Status filtern

Als Teammitglied
möchte ich Incidents nach Status filtern können,
damit ich beispielsweise nur offene Incidents sehe.

### US-028 – Incidents nach Severity filtern

Als Teammitglied
möchte ich Incidents nach Severity filtern können,
damit ich kritische Probleme schnell finde.

### US-029 – Incidents nach Verantwortlichem filtern

Als Teammitglied
möchte ich Incidents nach Verantwortlichem filtern können,
damit ich die Aufgaben einer bestimmten Person sehen kann.

### US-030 – Incidents suchen

Als Teammitglied
möchte ich nach Incidents suchen können,
damit ich bestimmte Probleme schnell wiederfinde.

Acceptance Criteria:

Suche berücksichtigt mindestens den Titel.
Beschreibung kann ebenfalls durchsucht werden.
Ergebnisse gehören ausschließlich zur eigenen Organisation.

Bezug: FR-012

## Epic 8 – Incident Timeline & Audit

### US-031 – Incident Timeline anzeigen

Als Teammitglied
möchte ich die zeitliche Entwicklung eines Incidents sehen können,
damit ich nachvollziehen kann, was während der Bearbeitung passiert ist.

### US-032 – Kommentar hinzufügen

Als Teammitglied
möchte ich einen Kommentar zu einem Incident hinzufügen können,
damit ich Informationen und Beobachtungen mit dem Team teilen kann.

Acceptance Criteria:

Kommentar benötigt Inhalt.
Autor wird automatisch gespeichert.
Zeitpunkt wird automatisch gespeichert.
Kommentar erscheint in der Timeline.

Bezug: FR-014

### US-033 – Änderungen nachvollziehen

Als Teammitglied
möchte ich wichtige Änderungen an einem Incident nachvollziehen können,
damit jederzeit klar ist, was passiert ist.

Acceptance Criteria:

Änderung enthält Benutzer.
Änderung enthält Zeitpunkt.
Änderung enthält die betroffene Eigenschaft.
Alter und neuer Wert werden bei relevanten Änderungen gespeichert.

Bezug: FR-013, FR-015

## Epic 9 – Postmortems

### US-034 – Postmortem erstellen

Als Teammitglied
möchte ich nach einem Incident ein Postmortem erstellen können,
damit die Ursache und die daraus gewonnenen Erkenntnisse dokumentiert werden.

Acceptance Criteria:

Postmortem kann für einen abgeschlossenen Incident erstellt werden.
Summary kann angegeben werden.
Impact kann dokumentiert werden.
Root Cause kann dokumentiert werden.
Resolution kann dokumentiert werden.
Lessons Learned können dokumentiert werden.
Action Items können gemäß dem aktuellen API-Vertrag dokumentiert werden.

Bezug: FR-016

### US-035 – Postmortem bearbeiten

Als berechtigtes Teammitglied
möchte ich ein Postmortem bearbeiten können,
damit fehlende Informationen ergänzt werden können.

### US-036 – Postmortem zur Review freigeben

Als berechtigtes Teammitglied
möchte ich ein Postmortem zur Review freigeben können,
damit andere Teammitglieder es prüfen können.

### US-037 – Postmortem veröffentlichen

Als berechtigtes Teammitglied
möchte ich ein geprüftes Postmortem veröffentlichen können,
damit die Ergebnisse des Incidents dauerhaft dokumentiert sind.

Bezug: FR-017

## Epic 10 – Dashboard

### US-038 – Dashboard anzeigen

Als Teammitglied
möchte ich nach dem Login ein Dashboard sehen,
damit ich schnell einen Überblick über die aktuelle Situation bekomme.

### US-039 – Offene Incidents anzeigen

Als Teammitglied
möchte ich die Anzahl offener Incidents sehen,
damit ich die aktuelle Arbeitslast einschätzen kann.

### US-040 – Kritische Incidents anzeigen

Als Teammitglied
möchte ich kritische Incidents prominent sehen,
damit dringende Probleme nicht übersehen werden.

### US-041 – Kürzlich gelöste Incidents anzeigen

Als Teammitglied
möchte ich kürzlich gelöste Incidents sehen,
damit ich einen Überblick über die letzten abgeschlossenen Störungen bekomme.

## Epic 11 – Security

### US-042 – Eingaben validieren

Als Betreiber der Anwendung
möchte ich, dass Benutzereingaben validiert werden,
damit ungültige oder unerwartete Daten nicht verarbeitet werden.

Acceptance Criteria:

Eingaben werden serverseitig validiert.
Pflichtfelder werden geprüft.
Datentypen werden geprüft.
Ungültige Werte werden abgelehnt.
Validierungsfehler werden verständlich zurückgegeben.

Bezug: TR-010

### US-043 – Fremde Ressourcen schützen

Als Betreiber der Anwendung
möchte ich, dass Benutzer nicht auf Ressourcen anderer Organisationen zugreifen können,
damit sensible Kundendaten geschützt bleiben.

Acceptance Criteria:

Direkter Zugriff auf fremde Ressourcen schlägt fehl.
Fremde Ressourcen können nicht bearbeitet werden.
Fremde Ressourcen können nicht über Such- oder Filterfunktionen sichtbar werden.

Bezug: TR-009

### US-044 – Berechtigungen serverseitig prüfen

Als Betreiber der Anwendung
möchte ich, dass Berechtigungen bei jeder geschützten Aktion serverseitig geprüft werden,
damit ein Benutzer die Frontend-Beschränkungen nicht umgehen kann.

Bezug: FR-020

## Epic 12 – Quality & Testing

Diese Stories sind weniger klassische Endanwender-User-Stories, aber für dein Bewerbungsprojekt extrem wichtig.

### US-045 – Business Logic testen

Als Entwickler
möchte ich kritische Business-Logik automatisiert testen,
damit Änderungen keine bestehenden Funktionen unbemerkt beschädigen.

Acceptance Criteria:

Statusübergänge werden getestet.
Berechtigungen werden getestet.
Validierungen werden getestet.
Kritische Incident-Logik wird getestet.

Bezug: TR-011

### US-046 – API testen

Als Entwickler
möchte ich die API automatisiert testen,
damit das Zusammenspiel zwischen API, Business-Logik und Datenbank zuverlässig funktioniert.

Bezug: TR-012

### US-047 – Kritischen Benutzerfluss testen

Als Entwickler
möchte ich einen vollständigen Benutzerworkflow automatisiert testen,
damit ich sicherstellen kann, dass die wichtigsten Funktionen zusammen funktionieren.

Beispiel:

Login
↓
Incident erstellen
↓
Incident bearbeiten
↓
Kommentar hinzufügen
↓
Status ändern
↓
Incident lösen
↓
Postmortem erstellen

Bezug: TR-013

## Epic 13 – Code Quality & CI

### US-048 – Code automatisch linten

Als Entwickler
möchte ich, dass mein Code automatisch auf bekannte Probleme geprüft wird,
damit Fehler frühzeitig erkannt werden.

Bezug: TR-014

### US-049 – Code automatisch formatieren

Als Entwickler
möchte ich eine einheitliche Codeformatierung verwenden,
damit der Code konsistent und leichter lesbar bleibt.

Bezug: TR-015

### US-050 – TypeScript automatisch prüfen

Als Entwickler
möchte ich, dass TypeScript-Fehler automatisch erkannt werden,
damit fehlerhafter Code nicht unbemerkt weitergegeben wird.

Bezug: TR-016

### US-051 – CI Pipeline ausführen

Als Entwickler
möchte ich, dass jeder Push bzw. Pull Request automatisch geprüft wird,
damit nur geprüfter Code weiterentwickelt bzw. deployed wird.

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

Bezug: TR-017

## Epic 14 – Deployment

### US-052 – Anwendung deployen

Als Benutzer
möchte ich FlowOps über das Internet erreichen können,
damit ich die Anwendung unabhängig von meiner lokalen Entwicklungsumgebung verwenden kann.

Bezug: TR-018

### US-053 – Reproduzierbares Deployment

Als Entwickler
möchte ich das Deployment reproduzierbar durchführen können,
damit ich die Anwendung zuverlässig neu deployen kann.

### US-054 – Kostenfreien Betrieb ermöglichen

Als Entwickler
möchte ich die Anwendung ohne laufende Kosten betreiben können,
damit das Projekt dauerhaft kostenlos verfügbar bleiben kann.

Acceptance Criteria:

Keine kostenpflichtige Infrastruktur erforderlich.
Verwendete Free-Tier-Limits sind dokumentiert.
Keine versteckten kostenpflichtigen Services notwendig.

Bezug: TR-019

## Epic 15 – Accessibility & UX

### US-055 – Anwendung per Tastatur bedienen

Als Benutzer, der bevorzugt mit der Tastatur arbeitet
möchte ich die Anwendung vollständig per Tastatur bedienen können,
damit ich nicht auf eine Maus angewiesen bin.

### US-056 – Verständliche Formulare

Als Benutzer
möchte ich verständliche Formulare mit klaren Fehlermeldungen sehen,
damit ich weiß, welche Eingaben erwartet werden.

### US-057 – Responsive Oberfläche

Als Benutzer
möchte ich FlowOps auf unterschiedlichen Bildschirmgrößen verwenden können,
damit die Anwendung auch auf kleineren Displays sinnvoll nutzbar ist.

## Epic 16 – Documentation

### US-058 – Technische Entscheidungen dokumentieren

Als Entwickler
möchte ich wichtige technische Entscheidungen dokumentieren,
damit nachvollziehbar bleibt, warum bestimmte Lösungen gewählt wurden.

### US-059 – Entwicklungsprozess dokumentieren

Als Entwickler
möchte ich meine Entwicklungsschritte wöchentlich dokumentieren,
damit andere meinen Arbeitsprozess nachvollziehen können.

### US-060 – Lessons Learned dokumentieren

Als Entwickler
möchte ich Probleme, Fehlentscheidungen und Erkenntnisse dokumentieren,
damit die Entwicklung nicht nur das Ergebnis, sondern auch den Lernprozess zeigt.
