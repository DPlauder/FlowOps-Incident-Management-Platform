# FlowOps - Release-Plan

## Release-Ziel

Der MVP ist releasebereit, wenn ein Benutzer den vollstaendigen Incident-Lifecycle von der Registrierung bis zum Postmortem durchlaufen kann.

## Release-Gates

- Alle P0-Stories sind abgeschlossen.
- Der kritische E2E-Test ist erfolgreich.
- Linting, Typechecking und Build sind erfolgreich.
- Tenant Isolation und serverseitige Authorization sind getestet.
- Datenbankmigrationen laufen reproduzierbar.
- Produktionskonfiguration und Secrets sind geprueft.
- Minimale Fehlerlogs ohne sensible Daten sind verfuegbar.
- Free-Tier-Limits und laufende Kosten sind dokumentiert.
- Ein Rollback- oder Wiederherstellungsweg ist beschrieben.

## Deployment-Ablauf

```text
Pull Request
  -> CI
  -> Review
  -> Merge
  -> Production Build
  -> Database Migrations
  -> Deploy
  -> Smoke Test
  -> Release Tag
```

## Smoke Test

1. Registrierung oder Testkonto verwenden.
2. Einloggen und geschuetzten Bereich oeffnen.
3. Organisation, Service und Incident anlegen.
4. Status aendern und Kommentar hinzufuegen.
5. Postmortem erstellen.
6. Logout ausfuehren.
7. Geschuetzten Zugriff ohne Session pruefen.
