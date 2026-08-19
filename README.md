# Habit Tracker

Lokale, offline-fähige PWA zum Verfolgen täglicher Routinen. Keine Daten verlassen das Gerät (localStorage).

## Entwicklung

```
npm install
npm run dev
```

## Installation als PWA

Für die volle Funktionalität (Service Worker, `crypto.randomUUID`) muss die App über HTTPS oder `localhost` ausgeliefert werden — reines HTTP im lokalen Netzwerk (z.B. `npm run preview -- --host`) reicht nicht aus.
