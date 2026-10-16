# Aktien-Watchlist
## Webseite

Persönliche Aktien-Watchlist für GitHub Pages. `index.html` öffnen oder mit einem statischen HTTP-Server bereitstellen. Kein Build und kein API-Schlüssel erforderlich.

- Aktien aus der Vorschlagsliste oder über `BÖRSE:SYMBOL` hinzufügen und entfernen (maximal 30).
- Auswahl wird im localStorage des jeweiligen Browsers gespeichert, ohne geräteübergreifende Synchronisierung.
- TradingView-Marktwidget aktualisiert Kurse automatisch. Datenverfügbarkeit, Handelswährung und Verzögerung hängen vom Handelsplatz ab; Echtzeitkurse werden nicht für jede Börse garantiert.
- Drittanbieter: TradingView (Marktdaten und Widget), Google Fonts (Schriftarten). Beim Seitenaufruf werden Verbindungen zu diesen Diensten hergestellt; ausgewählte Symbole werden an TradingView übermittelt.

Veröffentlichung: GitHub Pages, Branch `main`, Verzeichnis `/`.
