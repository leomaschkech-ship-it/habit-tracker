# Habit Tracker

Lokale, offline-fähige PWA zum Verfolgen täglicher Routinen. Keine Daten verlassen das Gerät (localStorage).

## Entwicklung

```
npm install
npm run dev
```

## Installation als PWA

Für die volle Funktionalität (Service Worker, `crypto.randomUUID`) muss die App über HTTPS oder `localhost` ausgeliefert werden — reines HTTP im lokalen Netzwerk (z.B. `npm run preview -- --host`) reicht nicht aus.

## Garmin-Import

Unter „Verwalten“ → „Garmin-Import“ lassen sich Aktivitäten von der Garmin-Uhr übernehmen, ohne dass Daten an einen Server gehen:

1. In Garmin Connect (Web oder App) die Aktivität öffnen und über das Zahnrad „Original exportieren“ wählen (liefert eine `.zip` mit der `.fit`-Datei). „Als TCX/GPX exportieren“ funktioniert ebenfalls.
2. Die Datei(en) im Habit Tracker auswählen – mehrere auf einmal sind möglich.
3. Läufe werden automatisch dem geplanten Lauf des Wochentags im Trainingsplan zugeordnet; andere Aktivitäten lassen sich einer Routine zuweisen (Ja/Nein wird abgehakt, Minuten-Routinen bekommen die Dauer gutgeschrieben, Zähl-Routinen +1). Die Zuordnung pro Sportart wird für den nächsten Import gemerkt.

Bereits importierte Aktivitäten werden beim erneuten Import übersprungen.
