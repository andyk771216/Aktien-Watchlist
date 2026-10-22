# Aktien-Watchlist
## Webseite

Persönliche Aktien-Watchlist für GitHub Pages. `index.html` öffnen oder mit einem statischen HTTP-Server bereitstellen. Kein Build und kein API-Schlüssel erforderlich.

- Aktien per Unternehmensname suchen, anhand von Börse und Währung auswählen und mit einem Klick hinzufügen oder entfernen (maximal 30). Die Suche nutzt den öffentlichen TradingView-Scanner mit einer lokalen Vorschlagsliste als Ausweichlösung.
- Auswahl wird geprüft im localStorage des jeweiligen Browsers gespeichert. Ein dauerhafter Status zeigt Speicherprobleme an. Bestehende v1-Daten werden übernommen, auch eine leere Watchlist.
- Zusätzlich trägt die URL die Auswahl im Fragment `#watchlist=…`. „Watchlist-Link kopieren“ sichert einen transportierbaren Stand als Lesezeichen, auch bei gesperrtem oder gelöschtem Browserspeicher. Der Link ist eine Momentaufnahme: nach Änderungen neu sichern. Fragmente werden nicht an GitHub übermittelt; wer den Link erhält, sieht die darin enthaltene Auswahl.
- Ohne Browserspeicher und ohne persönlichen Link lässt sich eine frühere Auswahl nicht wiederherstellen. Es gibt keine Konten oder automatische geräteübergreifende Synchronisierung.
- Die eigene Kurstabelle ruft alle 60 Sekunden TradingViews öffentlichen Scanner-Endpunkt ab (Kurs, Währung, Änderung Tag/Woche/Monat, 52-Wochen-Hoch und -Tief). Dieser Endpunkt ist keine vertraglich garantierte API und kann sich ändern; bei Fehlern wird ein Hinweis angezeigt. Datenverfügbarkeit, Handelswährung und Verzögerung hängen vom Handelsplatz ab; Echtzeitkurse werden nicht für jede Börse garantiert.
- Drittanbieter: TradingView (Marktdaten und Widget), Google Fonts (Schriftarten). Beim Seitenaufruf werden Verbindungen zu diesen Diensten hergestellt; ausgewählte Symbole werden an TradingView übermittelt.

Veröffentlichung: GitHub Pages, Branch `main`, Verzeichnis `/`.
