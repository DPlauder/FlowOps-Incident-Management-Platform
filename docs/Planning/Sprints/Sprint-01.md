# FlowOps – Sprint 1: Authentication

## 1. Einordnung

**Schwerpunkt:** Authentication  
**Zugehörige User Stories:** US-001 bis US-004 und US-061  
**Voraussetzung:** Sprint 0 – Foundation  
**Status:** Geplant

Sprint 1 baut auf der vorhandenen technischen Grundlage aus Sprint 0 auf. Im Mittelpunkt stehen Registrierung, Anmeldung, Abmeldung und der Schutz nicht öffentlicher Anwendungsbereiche.

Die fachliche Fertigstellung der fünf vorgesehenen User Stories erfolgt innerhalb dieses Sprints. Die Umsetzung berücksichtigt bereits die bestehenden Sicherheitsanforderungen und die festgelegte Architektur.

## 2. Sprint-Ziel

Ein Benutzer kann einen Account erstellen, sich anmelden, eine authentifizierte Session verwenden, auf geschützte Bereiche zugreifen und sich sicher abmelden.

Der vollständige Ablauf lautet:

```text
Account erstellen
       ↓
Anmelden
       ↓
Session erstellen und validieren
       ↓
Geschützten Bereich verwenden
       ↓
Abmelden
       ↓
Session ungültig
```

Der Sprint gilt fachlich erst dann als abgeschlossen, wenn dieser Ablauf funktioniert und die vorgesehenen Sicherheits- und Fehlerfälle geprüft wurden.

## 3. Umfang

| User Story | Inhalt | Ergebnis |
|---|---|---|
| US-001 | Create an account | Benutzer kann einen Account erstellen |
| US-002 | Log in | Benutzer kann sich anmelden |
| US-003 | Log out | Benutzer kann sich abmelden |
| US-004 | Protect unauthenticated areas | Nicht authentifizierte Benutzer erhalten keinen Zugriff auf geschützte Bereiche |
| US-061 | Session Management | Sessions werden erstellt, validiert, zeitlich begrenzt und widerrufen |

Die konkreten Acceptance Criteria der jeweiligen User Stories bleiben maßgeblich. Diese Sprintplanung ersetzt weder die User Stories noch deren Akzeptanzkriterien.

## 4. Geplante Umsetzungsreihenfolge

Die Umsetzung folgt den fachlichen und technischen Abhängigkeiten. Eine User Story kann bereits vorbereitet werden, bevor die vorherige vollständig abgeschlossen ist. Der integrierte Authentifizierungsablauf muss jedoch am Ende funktionieren.

### Phase 1 – US-001: Registrierung

**Ziel:** Ein neuer Benutzer kann einen Account anlegen.

Aufgaben:

- Registrierungsformular und zugehörige Eingabefelder umsetzen.
- Name, E-Mail-Adresse und Passwort serverseitig validieren.
- Festgelegte Passwortanforderungen anwenden.
- Prüfen, ob die E-Mail-Adresse bereits registriert ist.
- Passwort ausschließlich mit einem geeigneten Passwort-Hashing-Verfahren speichern.
- Benutzer in der vorhandenen D1-Datenbank anlegen.
- Fehlerfälle für ungültige Eingaben und bereits registrierte E-Mail-Adressen behandeln.
- Registrierung gegen übermäßige Anfragen absichern.
- Unit- und Integrationstests für erfolgreiche und fehlerhafte Registrierungen ergänzen.

**Abgrenzung:** Die Registrierung erstellt weder eine Organisation noch eine Organisationsmitgliedschaft. Diese Funktionalität gehört zu Sprint 2 beziehungsweise Sprint 3.

**Ergebnis:** Ein Benutzer kann gemäß den Acceptance Criteria registriert werden, ohne dass das Passwort im Klartext gespeichert wird.

### Phase 2 – US-002: Anmeldung

**Ziel:** Ein registrierter Benutzer kann sich mit seinen Zugangsdaten anmelden.

Aufgaben:

- Anmeldeformular umsetzen.
- E-Mail-Adresse und Passwort serverseitig prüfen.
- Passwort anhand des gespeicherten Passwort-Hashes verifizieren.
- Ungültige Zugangsdaten sicher und nachvollziehbar behandeln.
- Nach erfolgreicher Authentifizierung eine Session erstellen.
- Session-ID über ein entsprechend abgesichertes Cookie bereitstellen.
- Fehlgeschlagene Anmeldeversuche begrenzen.
- Tests für erfolgreiche Anmeldung, ungültige Zugangsdaten und relevante Fehlerfälle ergänzen.

**Ergebnis:** Ein registrierter und aktiver Benutzer kann eine authentifizierte Session erhalten.

### Phase 3 – US-061: Session Management

**Ziel:** Sessions werden serverseitig verwaltet und zuverlässig auf Gültigkeit geprüft.

Aufgaben:

- Vorhandenes Session-Datenmodell verwenden und bei nachgewiesenem Bedarf erweitern.
- Kryptografisch sichere Session-IDs erzeugen.
- Sessions serverseitig in D1 speichern.
- Session-Cookies mit `HttpOnly`, `Secure` und einer geeigneten `SameSite`-Einstellung konfigurieren.
- Ablaufzeit und letzte Aktivität einer Session berücksichtigen.
- Abgelaufene oder widerrufene Sessions ablehnen.
- Die Session bei authentifizierten Anfragen gemäß den Anforderungen aktualisieren.
- Regeln für maximale Lebensdauer und Inaktivitäts-Timeout umsetzen.
- Tests für gültige, abgelaufene und widerrufene Sessions ergänzen.

**Festgelegte Session-Grenzen:**

- Maximale Lebensdauer: 30 Tage ab Erstellung.
- Inaktivitäts-Timeout: 7 Tage seit der letzten Aktivität.
- Abmeldung: sofortiger Widerruf der betreffenden Session.

Die Session-Prüfung muss serverseitig erfolgen. Ein Cookie allein gilt nicht als Nachweis einer gültigen Session.

### Phase 4 – US-004: Schutz geschützter Bereiche

**Ziel:** Geschützte Bereiche und Endpunkte können nur mit gültiger Authentifizierung verwendet werden.

Aufgaben:

- Zentrale serverseitige Session-Prüfung bereitstellen.
- Geschützte Bereiche und Endpunkte entsprechend absichern.
- Fehlende, ungültige und abgelaufene Sessions erkennen.
- Nicht authentifizierte Zugriffe gemäß dem vorgesehenen Anwendungskontext ablehnen oder zur Anmeldung weiterleiten.
- Sicherstellen, dass die Autorisierung nicht ausschließlich im Frontend erfolgt.
- Tests für authentifizierte und nicht authentifizierte Zugriffe ergänzen.

**Ergebnis:** Eine nicht authentifizierte Anfrage kann keine geschützten Funktionen über einen direkten API-Aufruf umgehen.

### Phase 5 – US-003: Abmeldung

**Ziel:** Ein Benutzer kann seine aktive Session sicher beenden.

Aufgaben:

- Abmeldeaktion in der Benutzeroberfläche bereitstellen.
- Serverseitigen Widerruf der aktuellen Session implementieren.
- Session-Cookie beim Abmelden löschen.
- Nach der Abmeldung geschützte Bereiche erneut gegen die Session prüfen.
- Tests für Abmeldung, erneuten Zugriff und ungültige Sessions ergänzen.

**Ergebnis:** Eine abgemeldete Session kann nicht weiter für authentifizierte Zugriffe verwendet werden.

## 5. Übergreifende technische Anforderungen

Die folgenden Anforderungen gelten für die betroffenen User Stories und sind nicht als separate fachliche User Stories zu verstehen.

### Sicherheit

- Passwörter dürfen niemals im Klartext gespeichert werden.
- Das Passwort-Hashing-Verfahren muss zur Cloudflare-Workers-Laufzeit passen und den Architekturentscheidungen entsprechen.
- Zugangsdaten, Passwort-Hashes und Session-Geheimnisse dürfen nicht unnötig in Logs oder API-Antworten erscheinen.
- Authentifizierungs- und Session-Prüfungen erfolgen serverseitig.
- Registrierung und Anmeldung erhalten die in der Sicherheitsdokumentation vorgesehenen Rate-Limits.
- Fehlerantworten dürfen keine unnötigen Informationen über interne Implementierungsdetails preisgeben.

### Rate-Limits

Für die Registrierung ist gemäß der Sicherheitsdokumentation ein Limit von fünf Anfragen pro IP-Adresse innerhalb von 15 Minuten vorgesehen. Bei Überschreitung ist eine entsprechende `429`-Antwort vorzusehen.

Für die Anmeldung ist das vorgesehene Limit von zehn fehlgeschlagenen Versuchen pro IP-Adresse innerhalb von 15 Minuten zu berücksichtigen.

Die konkrete Speicherung der Zähler und das Verhalten bei Ausfällen müssen zur gewählten Implementierung passen und dokumentiert werden.

### Datenbank

- Das vorhandene D1-Schema und die bestehende Migrationsstruktur verwenden.
- Neue Migrationen nur dann ergänzen, wenn die Implementierung eine tatsächliche Schemaänderung erfordert.
- Keine redundanten Session-Felder oder zusätzlichen Tabellen ohne fachliche beziehungsweise technische Begründung einführen.

### Dokumentation

- Technische Entscheidungen mit den bestehenden ADRs und der Sicherheitsdokumentation abgleichen.
- Noch offene Entscheidungen, insbesondere zum Passwort-Hashing, nachvollziehbar festhalten.
- Architektur- und Sicherheitsdokumentation aktualisieren, wenn die tatsächliche Implementierung Entscheidungen konkretisiert oder ändert.

## 6. Testplanung

Die Tests werden während der Umsetzung der jeweiligen Funktion ergänzt.

| Bereich | Zu prüfende Fälle |
|---|---|
| Registrierung | Erfolgreiche Registrierung, ungültige Eingaben, ungültige E-Mail-Adresse, doppelte E-Mail-Adresse |
| Passwortspeicherung | Kein Klartextpasswort in der Datenbank; korrekte Verifikation des Hashes |
| Anmeldung | Gültige Zugangsdaten, ungültige Zugangsdaten, inaktiver Benutzer |
| Session-Erstellung | Session nach erfolgreicher Authentifizierung, sichere Cookie-Eigenschaften |
| Session-Validierung | Gültige, fehlende, abgelaufene und widerrufene Session |
| Session-Laufzeit | Inaktivitäts-Timeout und maximale Lebensdauer |
| Geschützte Bereiche | Zugriff mit gültiger Session und Ablehnung ohne gültige Session |
| Abmeldung | Session-Widerruf, Cookie-Löschung und Ablehnung nachfolgender Zugriffe |
| Rate-Limits | Grenzwerte und Ablehnung weiterer Anfragen |
| Integration | Vollständiger Registrierungs-, Anmelde-, Zugriffs- und Abmeldeablauf |

Die vorhandenen Testwerkzeuge aus Sprint 0 werden weiterverwendet. Die bestehende Qualitätsprüfung mit Linting, Typecheck, Unit-Tests, Integrationstests und Production Build bleibt bestehen.

## 7. Abnahmekriterien für den Sprint

Sprint 1 ist fachlich abgeschlossen, wenn:

- [ ] US-001 bis US-004 und US-061 gemäß ihren Acceptance Criteria umgesetzt sind.
- [ ] Ein neuer Benutzer kann einen Account erstellen.
- [ ] Ein registrierter Benutzer kann sich anmelden.
- [ ] Eine gültige Session wird serverseitig verwaltet und geprüft.
- [ ] Geschützte Bereiche sind ohne gültige Session nicht zugänglich.
- [ ] Ein Benutzer kann sich abmelden und die betreffende Session wird widerrufen.
- [ ] Session-Laufzeit und Inaktivitäts-Timeout entsprechen den festgelegten Anforderungen.
- [ ] Passwortspeicherung und Cookie-Konfiguration erfüllen die vorgesehenen Sicherheitsanforderungen.
- [ ] Die vorgesehenen Rate-Limits sind umgesetzt und getestet.
- [ ] Relevante Unit- und Integrationstests sind erfolgreich.
- [ ] Linting, Typecheck und Production Build sind erfolgreich.
- [ ] Die relevante Dokumentation ist aktualisiert.
- [ ] Die Definition of Done aus `docs/Planning/04-Implementation/Definition-of-Done.md` ist erfüllt.

## 8. Abgrenzung zu späteren Sprints

Nicht Bestandteil von Sprint 1 sind:

- Erstellung und Verwaltung von Organisationen – Sprint 2.
- Verwaltung von Organisationsmitgliedern und Rollen – Sprint 3.
- Services und Incident-Management – Sprint 4 und folgende.
- Die umfassende, sprintübergreifende Sicherheits- und Qualitätssicherungsrunde – Sprint 11.

Sicherheitsanforderungen und notwendige Tests für die in Sprint 1 implementierten Funktionen werden dadurch nicht aufgeschoben.

## 9. Referenzen

### Sprint- und Produktplanung

- `docs/Planning/04-Implementation/sprints.md`
- `docs/Planning/02-Product/MVP-Backlog-de.md`
- `docs/Planning/02-Product/Backlog-Matrix.md`
- `docs/Planning/02-Product/User-Stories/user-stories-de.md`

### Architektur und Sicherheit

- `docs/Planning/03-Architecture/ADR/ADR-004-Authentication-Strategy.md`
- `docs/Planning/03-Architecture/ADR/ADR-006-Session-Management.md`
- `docs/Planning/03-Architecture/Security.md`
- `docs/Planning/03-Architecture/Data-Model.md`
- `docs/Planning/03-Architecture/API.md`

### Qualitätssicherung

- `docs/Planning/04-Implementation/Definition-of-Ready.md`
- `docs/Planning/04-Implementation/Definition-of-Done.md`
- `docs/Planning/05-Quality/Testing-Strategy.md`
- `docs/Planning/05-Quality/Testing-Matrix.md`

### Verknüpfte Issues

- [US-001 – Account erstellen](https://github.com/DPlauder/FlowOps-Incident-Management-Platform/issues/1)
- [US-002 - Einloggen](https://github.com/DPlauder/FlowOps-Incident-Management-Platform/issues/2)
- [US-003 - Ausloffen](https://github.com/DPlauder/FlowOps-Incident-Management-Platform/issues/3)
- [US-004 - Nicht authentifizierte Bereiche schützen](https://github.com/DPlauder/FlowOps-Incident-Management-Platform/issues/4)

Die zugehörigen Issues für US-002, US-003, US-004 und US-061 sind im Repository beziehungsweise GitHub-Projekt zu verknüpfen. Weitere Issue-Nummern werden erst eingetragen, wenn sie verifiziert sind.
