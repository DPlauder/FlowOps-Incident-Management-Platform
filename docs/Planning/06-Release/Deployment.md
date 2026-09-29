# FlowOps – Deployment

## 1. Zweck

Dieses Dokument beschreibt den technischen Deployment-Ablauf für FlowOps.

Der aktuelle technische Stack basiert auf:

* Next.js-kompatibler Anwendung mit Vinext
* Vite/Vinext Build
* Cloudflare Workers
* Cloudflare D1
* Wrangler
* GitHub Actions für CI

Der Deployment-Prozess wird schrittweise aufgebaut. Sprint 0 stellt zunächst die technische Grundlage für einen reproduzierbaren Build und späteren Release bereit.

---

## 2. Voraussetzungen

Für die lokale Entwicklung und den Build werden benötigt:

* Node.js
* npm
* Wrangler
* Zugriff auf das FlowOps Repository
* konfigurierte Cloudflare-Ressourcen für einen tatsächlichen Production-Deploy

Die Dependencies werden über `package-lock.json` reproduzierbar installiert:

```powershell
npm ci
```

---

## 3. Quality Gate vor einem Deployment

Vor einem Deployment müssen die lokalen Quality Checks erfolgreich sein:

```powershell
npm run lint
npx tsc --noEmit
npm test
npm run test:integration
npm run build:vinext
```

Die Checks prüfen:

1. **Lint** – statische Codequalität
2. **Typecheck** – TypeScript-Korrektheit
3. **Unit Tests** – isolierte Tests
4. **Integration Tests** – Zusammenspiel mit der Cloudflare-Testumgebung und D1
5. **Build** – reproduzierbarer Vinext-Produktionsbuild

Ein Deployment soll nicht erfolgen, wenn eines dieser Gates fehlschlägt.

---

## 4. Produktions-Build

Der aktuell definierte Produktions-Build erfolgt über:

```powershell
npm run build:vinext
```

Der Build erzeugt die für den Cloudflare-Deployment-Prozess benötigten Artefakte unter `dist/`.

Die Produktionskonfiguration wird dabei aus der Vinext-/Cloudflare-Konfiguration für den Deployment-Prozess erzeugt.

Der Build ist erfolgreich, wenn Vinext alle Build-Stufen abschließt und die benötigten Routes erzeugt.

---

## 5. Deployment

Der aktuell definierte Deployment-Befehl ist:

```powershell
npm run deploy:vinext
```

Das Script verwendet den Vinext-Cloudflare-Deployment-Prozess:

```text
vinext-cloudflare deploy
```

mit der erzeugten Deployment-Konfiguration:

```text
dist/server/wrangler.json
```

Der Production-Deploy wird erst nach erfolgreichem Quality Gate durchgeführt.

### Öffentliche Worker-Adresse

Für einen öffentlichen Production-Deploy muss für den Cloudflare Worker eine erreichbare Route beziehungsweise eine Workers.dev-Adresse konfiguriert sein.

Während der ersten Deployment-Ausführung war noch keine öffentliche Worker-Route verfügbar. Nach der Einrichtung der Workers.dev-Subdomain konnte der Production-Deploy erfolgreich durchgeführt werden.

Die konkrete öffentliche Adresse wird nicht als feste Projektkonfiguration in dieser Dokumentation hinterlegt, da sie Bestandteil der Cloudflare-Umgebung ist.

---

## 6. Datenbank-Migrationen

FlowOps verwendet Cloudflare D1.

Die Datenbank-Migrationen liegen im Repository unter:

```text
migrations/
```

Aktuell existiert die initiale Migration:

```text
0001_initial_schema.sql
```

### Lokale Datenbank

Die lokale D1-Datenbank wird für Entwicklung und Integrationstests verwendet.

Der lokale Migrationsstand kann mit Wrangler überprüft werden:

```powershell
npx wrangler d1 migrations list flowops-db --local
```

### Production-Datenbank

Production-Migrationen werden getrennt vom lokalen Testlauf behandelt.

Vor einem Production-Deploy muss geprüft werden, welche Migrationen auf der Remote-D1-Datenbank noch ausstehen:

```powershell
npx wrangler d1 migrations list flowops-db --remote
```

Remote-Migrationen werden nicht automatisch während der normalen Testausführung durchgeführt.

Eine Production-Migration darf erst im Rahmen des geplanten Release-Prozesses ausgeführt werden.

---

## 7. Smoke Test

Nach einem Production-Deployment muss mindestens geprüft werden, ob die Anwendung erreichbar ist und die Health-Route funktioniert:

```text
GET /api/health
```

Erwartetes Ergebnis:

```json
{
  "status": "ok",
  "database": "connected"
}
```

Damit wird sowohl die Erreichbarkeit der Anwendung als auch die Verbindung zur D1-Datenbank überprüft.

Mit dem Ausbau der Anwendung wird der Smoke Test erweitert.

Für die vollständige MVP-Anwendung sind insbesondere folgende Abläufe vorgesehen:

1. Registrierung eines Testkontos
2. Login
3. Zugriff auf einen geschützten Bereich
4. Organisation anlegen bzw. verwenden
5. Service anlegen
6. Incident anlegen
7. Incident-Status ändern
8. Kommentar hinzufügen
9. Postmortem anlegen
10. Logout
11. Zugriff auf geschützte Bereiche ohne Session prüfen

---

## 8. Rollback und Recovery

Der Deployment-Prozess muss zwischen Anwendung und Datenbank unterscheiden.

### Anwendung

Bei einem fehlerhaften Application Deployment muss eine vorherige bekannte funktionierende Version erneut deploybar sein.

Deshalb werden Releases und Deployments versioniert und nachvollziehbar gehalten.

### Datenbank

D1-Migrationen sind gesondert zu behandeln.

Vor Production-Migrationen muss geprüft werden:

* welche Migrationen bereits angewendet wurden
* welche Migrationen ausstehen
* ob die Migration mit der aktuell deployten Anwendung kompatibel ist
* wie bei einem Fehler eine Wiederherstellung erfolgen kann

Datenbankänderungen dürfen nicht als automatisch reversibel angenommen werden.

---

## 9. CI/CD

Der GitHub-Actions-Workflow führt aktuell folgende Quality Gates aus:

```text
npm ci
    ↓
npm run lint
    ↓
npx tsc --noEmit
    ↓
npm run test
    ↓
npm run test:integration
    ↓
npm run build:vinext
```

Die CI prüft damit vor einem Merge beziehungsweise Release, ob der aktuelle technische Stand gebaut und getestet werden kann.

Production-Datenbankmigrationen sind kein Bestandteil dieses CI-Testlaufs.

---

## 10. Sprint-0-Status

Sprint 0 stellt die technische Grundlage für den späteren Release-Prozess bereit.

### Bereits verifiziert

* lokaler Build funktioniert
* TypeScript Typecheck funktioniert
* Lint funktioniert ohne Fehler oder Warnungen
* Unit Tests funktionieren
* Integration Tests funktionieren
* D1-Testverbindung funktioniert
* Vinext Production Build funktioniert
* CI enthält die Quality Gates
* erzeugter Worker kann lokal gestartet werden
* lokaler Production Health Check funktioniert
* initiale Remote-D1-Migration wurde erfolgreich ausgeführt
* Cloudflare Worker wurde erfolgreich deployed
* Production Health Check funktioniert
* Production Worker kann auf die Remote-D1-Datenbank zugreifen
* Remote-Datenbank ist nach dem Deployment auf dem aktuellen Migrationsstand

### Tatsächlich verifizierter Deployment-Ablauf

Der technische Sprint-0-Deployment-Ablauf wurde vollständig ausgeführt:

```text
Quality Gate
    ↓
Production Build
    ↓
Remote Database Migration
    ↓
Cloudflare Worker Deployment
    ↓
Production Health Check
    ↓
Remote Migration Verification

```

Der Production Health Check liefert:

```
{
  "status": "ok",
  "database": "connected"
}
```