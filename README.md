# Stammeswebsite der Edelweißpiraten

Öffentliche Website (SvelteKit, `adapter-node`, Port 3001). Termine, Galerien, Gruppen, Ämter, Blog, FAQ, Banner und
Kontaktformulare kommen **serverseitig** aus dem Intern-Bereich (Kalypzo Atrium mit den Modulen aus `ep-intern-modules`)
über dessen Website-Endpunkte.

Eigenes Repo seit 2026-11-01 (vorher Ordner `website/` im Intern-Repo, Historie übernommen).

## Konfiguration

| Variable | Zweck |
|---|---|
| `WEBSITE_API_URL` | Adresse des Intern-Bereichs, z. B. `https://intern.edelweisspiraten-bremen.de` (Pflicht) |
| `WEBSITE_API_KEY` | API-Key aus dem Intern-Bereich (Administration → API-Keys) mit den Website-Scopes, z. B. `events.website.read`, `galleries.website.read`, `offices.website.read`, `website.content.read`, `messages.website.contact` |
| `ORIGIN` / `WEBSITE_ORIGIN` | Öffentliche Adresse der Website |
| `CONTACT_TO`, `SMTP_*` | Rückfall für Kontaktformulare, falls das Backend nicht erreichbar ist |

## Entwickeln

```bash
npm ci
npm run dev        # http://localhost:5173 (WEBSITE_API_URL/KEY in .env)
npm test           # Unit-Tests (tests/)
npm run check      # Typprüfung (muss fehlerfrei sein)
node scripts/audit.mjs  # Sicherheitsprüfung aller Pakete (Ausnahmen mit Begründung im Skript)
npm run build && node --env-file=.env build   # :3001
```

## Deployment (Dokploy)

Eigener Compose-Stack `docker-compose.dokploy.yml`, Domain auf Service `website`, Port 3001. Variablen wie oben.
