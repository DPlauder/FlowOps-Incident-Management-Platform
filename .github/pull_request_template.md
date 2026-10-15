
@'
## Zugehörige User Story

- User Story: US-XXX – Titel
- GitHub Issue: #XXX

## Änderungen

<!-- Was wurde implementiert und warum? -->

## Akzeptanzkriterien

- [ ] Alle relevanten Akzeptanzkriterien der User Story sind erfüllt.
- [ ] Fachliche und technische Anforderungen sind berücksichtigt.
- [ ] Fehler- und Sicherheitsfälle sind berücksichtigt.

## Tests

- [ ] Unit-Tests ergänzt oder angepasst
- [ ] Integrationstests ergänzt oder angepasst
- [ ] `npm run lint` erfolgreich
- [ ] `npx tsc --noEmit` erfolgreich
- [ ] `npm run test` erfolgreich
- [ ] `npm run test:integration` erfolgreich
- [ ] `npm run build:vinext` erfolgreich

## Dokumentation

- [ ] Relevante technische Dokumentation aktualisiert.
- [ ] Offene Punkte und bekannte Einschränkungen dokumentiert.

## Abschluss

<!-- Den zugehörigen Issue-Verweis prüfen.
     "Closes #XXX" nur verwenden, wenn dieser PR
     die gesamte User Story abschließt. -->
'@ | Set-Content -Path .github/pull_request_template.md -Encoding utf8