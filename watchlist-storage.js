/* Storage and a portable URL snapshot; no stock selections are uploaded to GitHub. */
(function (root) {
 'use strict';
 const KEY = 'aktien-watchlist-v1';
 const PREFIX = '#watchlist=';
 function validate(value) {
  if (!Array.isArray(value) || value.length > 30) throw new Error('Ungültige Watchlist');
  const symbols = new Set();
  return value.map(item => {
   if (!item || typeof item.symbol !== 'string' || !/^[A-Z0-9_]+:[^\s:<>"\\]+$/.test(item.symbol) || item.symbol.length > 100 || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 200 || symbols.has(item.symbol)) throw new Error('Ungültiger Eintrag');
   symbols.add(item.symbol);
   return { label: item.label, symbol: item.symbol };
  });
 }
 function read(storage, hash, defaults) {
  let warning = '';
  if (hash.startsWith(PREFIX)) {
   try { return { items: validate(JSON.parse(decodeURIComponent(hash.slice(PREFIX.length)))), source: 'link', warning }; }
   catch { warning = 'Der Watchlist-Link ist beschädigt. Die zuletzt im Browser gespeicherte Auswahl wird verwendet, sofern vorhanden.'; }
  }
  try {
   const saved = storage.getItem(KEY);
   if (saved !== null) return { items: validate(JSON.parse(saved)), source: 'browser', warning };
  } catch {
   warning += ' Gespeicherte Browserdaten konnten nicht gelesen werden. Nutze deinen persönlichen Watchlist-Link, um deine Auswahl wiederherzustellen.';
  }
  return { items: validate(defaults), source: 'example', warning: warning.trim() };
 }
 function write(storage, items) {
  const serialized = JSON.stringify(validate(items));
  try {
   storage.setItem(KEY, serialized);
   return storage.getItem(KEY) === serialized;
  } catch { return false; }
 }
 function hash(items) { return PREFIX + encodeURIComponent(JSON.stringify(validate(items))); }
 const api = { read, write, hash, validate, KEY };
 if (typeof module !== 'undefined' && module.exports) module.exports = api;
 else root.WatchlistStorage = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
