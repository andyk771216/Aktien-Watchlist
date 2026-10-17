# Aktien-Watchlist
## Webseite

Persönliche Aktien-Watchlist für GitHub Pages. `index.html` öffnen oder mit einem statischen HTTP-Server bereitstellen. Kein Build und kein API-Schlüssel erforderlich.

- Aktien per Unternehmensname suchen, anhand von Börse und Währung auswählen und mit einem Klick hinzufügen oder entfernen (maximal 30). Die Suche nutzt den öffentlichen TradingView-Scanner mit einer lokalen Vorschlagsliste als Ausweichlösung.
- Auswahl wird im localStorage des jeweiligen Browsers gespeichert, ohne geräteübergreifende Synchronisierung.
- Die eigene Kurstabelle ruft alle 60 Sekunden TradingViews öffentlichen Scanner-Endpunkt ab (Kurs, Währung, Änderung Tag/Woche/Monat). Dieser Endpunkt ist keine vertraglich garantierte API und kann sich ändern; bei Fehlern wird ein Hinweis angezeigt. Datenverfügbarkeit, Handelswährung und Verzögerung hängen vom Handelsplatz ab; Echtzeitkurse werden nicht für jede Börse garantiert.
- Drittanbieter: TradingView (Marktdaten und Widget), Google Fonts (Schriftarten). Beim Seitenaufruf werden Verbindungen zu diesen Diensten hergestellt; ausgewählte Symbole werden an TradingView übermittelt.

Veröffentlichung: GitHub Pages, Branch `main`, Verzeichnis `/`.
