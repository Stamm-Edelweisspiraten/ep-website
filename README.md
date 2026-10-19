# Stammeswebsite Edelweißpiraten

Öffentliche Website des Stammes (SvelteKit 2, Svelte 5, Tailwind 4, adapter-node). Eigenständige App
in diesem Repo – sie importiert nichts aus dem Intern-Bereich (`../src`), sondern holt Termine,
Galerien, Ämter und Gruppen **serverseitig** über dessen Website-API
(`/api/v1/modules/<modul>/website/…`) mit einem API-Key.

## Start

```bash
cp .env.example .env   # INTERN_API_URL, INTERN_API_KEY, PUBLIC_SITE_URL, ORIGIN setzen
npm install
npm run dev            # http://localhost:3001
```

API-Key im Intern-Bereich unter **Administration → API-Keys** anlegen, Scopes:
`events.website.read galleries.website.read offices.website.read members.website.read`.
Ohne Konfiguration startet die Seite trotzdem und zeigt Hinweise statt Inhalten.

## Befehle

| Befehl          | Zweck                                  |
| --------------- | -------------------------------------- |
| `npm run check` | `svelte-kit sync` + `svelte-check`     |
| `npm run lint`  | ESLint + Prettier-Prüfung              |
| `npm test`      | Unit-Tests (vitest)                    |
| `npm run build` | Produktions-Build nach `build/`        |
| `npm start`     | Build starten (`PORT=3001 node build`) |

## Aufbau

- `src/lib/server/intern.ts` – API-Client (Cache 60 s, Stale-on-Error, Zusammenlegung) und
  typisierte Abfragen; `types.ts` – Datenverträge (aus dem Intern-Bereich dupliziert).
- `src/routes/bilder/…` – Bild-Proxys (der API-Key bleibt auf dem Server).
- `src/lib/components/` – Layout und Bausteine, `src/lib/format.ts` – Datumsformate,
  `src/lib/images.ts` – Bild-URLs.

Deployment: siehe `docs/deployment.md` → „Stammeswebsite“ und `Dockerfile`.
