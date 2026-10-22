'use strict';
const catalog = [
 ['Apple','NASDAQ:AAPL'],['Microsoft','NASDAQ:MSFT'],['NVIDIA','NASDAQ:NVDA'],['Alphabet','NASDAQ:GOOGL'],['Amazon','NASDAQ:AMZN'],['Meta','NASDAQ:META'],['Tesla','NASDAQ:TSLA'],['Berkshire Hathaway','NYSE:BRK.B'],['Visa','NYSE:V'],['SAP','XETR:SAP'],['Siemens','XETR:SIE'],['Allianz','XETR:ALV'],['Rheinmetall','XETR:RHM'],['Deutsche Telekom','XETR:DTE'],['BMW','XETR:BMW'],['Mercedes-Benz','XETR:MBG'],['Volkswagen','XETR:VOW3'],['BASF','XETR:BAS'],['Adidas','XETR:ADS'],['ASML','EURONEXT:ASML'],['Novo Nordisk','OMXCOP:NOVO_B']
];
// Access to localStorage itself may throw in restricted browser contexts.
const browserStorage = {
 getItem: key => window.localStorage.getItem(key),
 setItem: (key, value) => window.localStorage.setItem(key, value)
};
const restored = WatchlistStorage.read(browserStorage, location.hash, catalog.slice(0,5).map(([label,symbol])=>({label,symbol})));
let items = restored.items;
const $ = id=>document.getElementById(id);
$('today').textContent=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
$('restore-status').textContent = restored.warning || (restored.source === 'example' ? 'Keine gespeicherte Watchlist gefunden. Du siehst eine Beispielauswahl. Sichere deine eigene Auswahl über „Watchlist-Link kopieren“ als Lesezeichen.' : '');
function save(){
 const stored = WatchlistStorage.write(browserStorage, items);
 let linked = false;
 const url = new URL(location.href); url.hash = WatchlistStorage.hash(items);
 try { history.replaceState(null, '', url); linked = true; } catch { /* Link remains available for copying. */ }
 $('watchlist-link').href = url.href;
 $('storage-status').textContent = stored
  ? '✓ Auswahl in diesem Browser gespeichert. Für andere Browser oder gelöschte Websitedaten: persönlichen Link als Lesezeichen sichern.'
  : 'Speichern im Browser ist blockiert. Sichere den persönlichen Watchlist-Link als Lesezeichen, damit deine Auswahl erhalten bleibt.';
 if (!linked && !stored) $('storage-status').textContent += ' Nutze dafür „Watchlist-Link kopieren“.';
}
function render(){
 $('count').textContent=items.length;$('selection-count').textContent=`${items.length} / 30`;$('selection').replaceChildren();
 for(const item of items){const li=document.createElement('li');const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=item.label;const small=document.createElement('small');small.textContent=item.symbol;text.append(strong,small);const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`${item.label} entfernen`);remove.onclick=()=>{items=items.filter(x=>x.symbol!==item.symbol);$('restore-status').textContent='';save();render();showResults(lastResults);};li.append(text,remove);$('selection').append(li);}
 $('market').replaceChildren();
 renderFeed();
}
let activeRequest;
let refreshTimer;
const number = new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2, minimumFractionDigits: 2});
function valueCell(value, percent = false) {
 const cell = document.createElement('td');
 if (typeof value !== 'number' || !Number.isFinite(value)) { cell.textContent = '–'; return cell; }
 cell.textContent = `${percent && value > 0 ? '+' : ''}${number.format(value)}${percent ? ' %' : ''}`;
 if (percent) cell.className = value > 0 ? 'positive' : value < 0 ? 'negative' : '';
 return cell;
}
async function renderFeed(){
 clearTimeout(refreshTimer);
 if(activeRequest) activeRequest.abort();
 const controller = new AbortController(); activeRequest = controller;
 const mount=$('market');
 if(!items.length){mount.replaceChildren();const empty=document.createElement('p');empty.className='empty';empty.textContent='Deine Watchlist wartet auf die erste Aktie. Füge eine Aktie hinzu.';mount.append(empty);$('feed-status').textContent='';return;}
 $('feed-status').textContent='Kursdaten werden aktualisiert …';
 const timeout=setTimeout(()=>controller.abort(),15000);
 try {
  const response=await fetch('https://scanner.tradingview.com/global/scan', {method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({symbols:{tickers:items.map(x=>x.symbol)},columns:['name','close','currency','change','Perf.W','Perf.1M','price_52_week_high','price_52_week_low']}),signal:controller.signal});
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload=await response.json();
  if(!Array.isArray(payload.data)) throw new Error('Ungültige Antwort');
  const quotes=new Map(payload.data.map(row=>[row.s,row.d]));
  const scroll=document.createElement('div');scroll.className='quote-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Aktienkurse, auf kleinen Bildschirmen horizontal scrollbar');
  const table=document.createElement('table');table.className='quote-table';
  const caption=document.createElement('caption');caption.className='sr-only';caption.textContent='Aktienkurse und Kursänderungen in Prozent';table.append(caption);
  const head=document.createElement('thead');const header=document.createElement('tr');
  for(const title of ['Aktie','Kurs','Währung','Tag','Woche','Monat','52-Wochen-Hoch','52-Wochen-Tief']){const th=document.createElement('th');th.scope='col';th.textContent=title;header.append(th);}head.append(header);table.append(head);
  const body=document.createElement('tbody');let missing=0;
  for(const item of items){
   const data=quotes.get(item.symbol);if(!data)missing++;
   const row=document.createElement('tr');const name=document.createElement('th');name.scope='row';const link=document.createElement('a');link.textContent=item.label;link.href=`https://www.tradingview.com/symbols/${encodeURIComponent(item.symbol.replace(':','-'))}/`;link.target='_blank';link.rel='noopener';const symbol=document.createElement('small');symbol.textContent=item.symbol;name.append(link,symbol);row.append(name,valueCell(data?.[1]));const currency=document.createElement('td');currency.textContent=data?.[2]||'–';row.append(currency,valueCell(data?.[3],true),valueCell(data?.[4],true),valueCell(data?.[5],true),valueCell(data?.[6]),valueCell(data?.[7]));body.append(row);
  }
  table.append(body);scroll.append(table);mount.replaceChildren(scroll);
  $('feed-status').textContent=`Abgerufen um ${new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())} · Aktualisierung alle 60 Sekunden.${missing?' Für '+missing+' Symbol(e) sind keine Daten verfügbar.':''}`;
 } catch(error) {
  if(activeRequest!==controller)return;
  $('feed-status').textContent='Kursdaten konnten nicht aktualisiert werden. Vorhandene Werte können veraltet sein. Nächster Versuch in 60 Sekunden; alternativ „Neu laden“ wählen.';
 } finally {
  clearTimeout(timeout);
  if(activeRequest===controller) refreshTimer=setTimeout(renderFeed,60000);
 }
}
let searchTimer;
let searchRequest;
let searchVersion = 0;
const preferredExchanges=['XETR','NASDAQ','NYSE','EURONEXT','LSE','SIX'];
function addStock(stock){
 if(items.some(x=>x.symbol===stock.symbol)){$('message').textContent='Diese Aktie ist schon in deiner Watchlist.';return;}
 if(items.length>=30){$('message').textContent='Deine Watchlist kann bis zu 30 Aktien enthalten.';return;}
 items.push({label:stock.label,symbol:stock.symbol});$('restore-status').textContent='';save();render();
 $('message').textContent=`${stock.label} wurde hinzugefügt.`;
 showResults(lastResults);
}
let lastResults=[];
function showResults(results){
 lastResults=results;$('search-results').replaceChildren();
 for(const stock of results){
  const li=document.createElement('li');const button=document.createElement('button');button.type='button';button.className='search-result';
  const name=document.createElement('strong');name.textContent=stock.label;
  const detail=document.createElement('small');detail.textContent=`${stock.symbol.split(':')[0]} · ${stock.currency || 'Handelswährung siehe Kurs'} · ${stock.symbol.split(':')[1]}`;
  const action=document.createElement('span');const added=items.some(x=>x.symbol===stock.symbol);action.textContent=added?'✓ In Watchlist':'＋ Hinzufügen';
  button.disabled=added;button.setAttribute('aria-label',`${stock.label}, ${detail.textContent}, ${action.textContent}`);
  const text=document.createElement('div');text.append(name,detail);button.append(text,action);button.onclick=()=>addStock(stock);li.append(button);$('search-results').append(li);
 }
}
async function searchStocks(query,version){
 const controller=new AbortController();searchRequest=controller;const timeout=setTimeout(()=>controller.abort(),12000);
 try{
  const response=await fetch('https://scanner.tradingview.com/global/scan',{method:'POST',headers:{'Content-Type':'text/plain'},signal:controller.signal,body:JSON.stringify({filter:[{left:'type',operation:'equal',right:'stock'},{left:'description',operation:'match',right:query}],columns:['name','description','exchange','currency'],range:[0,200]})});
  if(!response.ok)throw new Error('Suche fehlgeschlagen');const payload=await response.json();if(!Array.isArray(payload.data))throw new Error('Ungültige Antwort');
  if(version!==searchVersion)return;
  const rank=s=>{const index=preferredExchanges.indexOf(s.symbol.split(':')[0]);return index<0?99:index;};
  const results=payload.data.filter(row=>row && typeof row.s==='string' && Array.isArray(row.d)).map(row=>({symbol:row.s,label:row.d[1]||row.d[0],currency:row.d[3]})).sort((a,b)=>rank(a)-rank(b)||a.label.localeCompare(b.label,'de')).slice(0,20);
  showResults(results);$('search-status').textContent=results.length?`${results.length} Treffer${payload.totalCount>20?' (Auswahl)':''} · Zum Hinzufügen anklicken.`:'Keine Aktie gefunden. Versuche einen kürzeren Namen oder die internationale Schreibweise.';
 }catch{
  if(version!==searchVersion)return;
  $('search-status').textContent=lastResults.length?'Online-Suche gerade nicht verfügbar. Bekannte Aktien werden unten angezeigt.':'Suche gerade nicht verfügbar. Bitte prüfe deine Verbindung und versuche es erneut.';
 }finally{clearTimeout(timeout);}
}
$('symbol').addEventListener('input',()=>{
 clearTimeout(searchTimer);if(searchRequest)searchRequest.abort();const version=++searchVersion;const query=$('symbol').value.trim();$('message').textContent='';
 if(query.length<2){showResults([]);$('search-status').textContent=query?'Bitte mindestens zwei Buchstaben eingeben.':'';return;}
 const local=catalog.filter(([name])=>name.toLocaleLowerCase('de').includes(query.toLocaleLowerCase('de'))).map(([label,symbol])=>({label,symbol,currency:symbol.startsWith('XETR:')?'EUR':undefined}));
 showResults(local);$('search-status').textContent='Aktien werden gesucht …';searchTimer=setTimeout(()=>searchStocks(query,version),400);
});
$('add-form').addEventListener('submit',event=>{event.preventDefault();clearTimeout(searchTimer);const query=$('symbol').value.trim();if(query.length<2){$('search-status').textContent='Bitte mindestens zwei Buchstaben eingeben.';return;}if(searchRequest)searchRequest.abort();searchStocks(query,++searchVersion);});
$('copy-watchlist').addEventListener('click', async()=>{
 try { await navigator.clipboard.writeText($('watchlist-link').href); $('link-status').textContent='Link kopiert. Speichere ihn als Lesezeichen. Nach späteren Änderungen kannst du den Link erneut kopieren.'; }
 catch { $('link-status').textContent='Kopieren nicht möglich. Halte „Persönlichen Link öffnen“ gedrückt oder klicke mit rechts, um den Link zu kopieren oder als Lesezeichen zu speichern.'; }
});
window.addEventListener('hashchange',()=>{
 const state=WatchlistStorage.read(browserStorage,location.hash,items);
 if(state.source==='link'){items=state.items;$('restore-status').textContent='Watchlist aus deinem persönlichen Link geladen.';save();render();showResults(lastResults);}
});
window.addEventListener('storage',event=>{
 if(event.key!==WatchlistStorage.KEY || event.newValue===null)return;
 try{items=WatchlistStorage.validate(JSON.parse(event.newValue));save();render();showResults(lastResults);$('restore-status').textContent='Watchlist aus einem anderen geöffneten Tab übernommen.';}catch{/* Keep current selection if another tab wrote invalid data. */}
});
$('refresh').addEventListener('click',renderFeed);
window.addEventListener('online',renderFeed);
window.addEventListener('offline',()=>{$('feed-status').textContent='Du bist offline. Kursupdates werden fortgesetzt, sobald die Verbindung wieder verfügbar ist.';});
save();
render();
