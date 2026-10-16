'use strict';
const catalog = [
 ['Apple','NASDAQ:AAPL'],['Microsoft','NASDAQ:MSFT'],['NVIDIA','NASDAQ:NVDA'],['Alphabet','NASDAQ:GOOGL'],['Amazon','NASDAQ:AMZN'],['Meta','NASDAQ:META'],['Tesla','NASDAQ:TSLA'],['Berkshire Hathaway','NYSE:BRK.B'],['Visa','NYSE:V'],['SAP','XETR:SAP'],['Siemens','XETR:SIE'],['Allianz','XETR:ALV'],['Rheinmetall','XETR:RHM'],['Deutsche Telekom','XETR:DTE'],['BMW','XETR:BMW'],['Mercedes-Benz','XETR:MBG'],['Volkswagen','XETR:VOW3'],['BASF','XETR:BAS'],['Adidas','XETR:ADS'],['ASML','EURONEXT:ASML'],['Novo Nordisk','OMXCOP:NOVO_B']
];
const key = 'aktien-watchlist-v1';
let items = catalog.slice(0,5).map(([label,symbol])=>({label,symbol}));
let storageOK = true;
try { const saved=JSON.parse(localStorage.getItem(key)); if(Array.isArray(saved)) items=saved.filter(x=>x && typeof x.symbol==='string' && /^[A-Z0-9_]+:[A-Z0-9._-]+$/.test(x.symbol) && typeof x.label==='string').slice(0,30); } catch { storageOK=false; }
const $ = id=>document.getElementById(id);
$('today').textContent=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
for(const [label,symbol] of catalog){const option=document.createElement('option');option.value=label;option.label=symbol;$('stocks').append(option);}
function save(){try{localStorage.setItem(key,JSON.stringify(items));}catch{storageOK=false;} if(!storageOK)$('message').textContent='Speichern im Browser ist nicht verfügbar. Deine Auswahl gilt für diese Sitzung.';}
function render(){
 $('count').textContent=items.length;$('selection-count').textContent=`${items.length} / 30`;$('selection').replaceChildren();
 for(const item of items){const li=document.createElement('li');const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=item.label;const small=document.createElement('small');small.textContent=item.symbol;text.append(strong,small);const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label',`${item.label} entfernen`);remove.onclick=()=>{items=items.filter(x=>x.symbol!==item.symbol);save();render();};li.append(text,remove);$('selection').append(li);}
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
  const response=await fetch('https://scanner.tradingview.com/global/scan', {method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({symbols:{tickers:items.map(x=>x.symbol)},columns:['name','close','currency','change','Perf.W','Perf.1M']}),signal:controller.signal});
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload=await response.json();
  if(!Array.isArray(payload.data)) throw new Error('Ungültige Antwort');
  const quotes=new Map(payload.data.map(row=>[row.s,row.d]));
  const scroll=document.createElement('div');scroll.className='quote-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Aktienkurse, auf kleinen Bildschirmen horizontal scrollbar');
  const table=document.createElement('table');table.className='quote-table';
  const caption=document.createElement('caption');caption.className='sr-only';caption.textContent='Aktienkurse und Kursänderungen in Prozent';table.append(caption);
  const head=document.createElement('thead');const header=document.createElement('tr');
  for(const title of ['Aktie','Kurs','Währung','Tag','Woche','Monat']){const th=document.createElement('th');th.scope='col';th.textContent=title;header.append(th);}head.append(header);table.append(head);
  const body=document.createElement('tbody');let missing=0;
  for(const item of items){
   const data=quotes.get(item.symbol);if(!data)missing++;
   const row=document.createElement('tr');const name=document.createElement('th');name.scope='row';const link=document.createElement('a');link.textContent=item.label;link.href=`https://www.tradingview.com/symbols/${encodeURIComponent(item.symbol.replace(':','-'))}/`;link.target='_blank';link.rel='noopener';const symbol=document.createElement('small');symbol.textContent=item.symbol;name.append(link,symbol);row.append(name,valueCell(data?.[1]));const currency=document.createElement('td');currency.textContent=data?.[2]||'–';row.append(currency,valueCell(data?.[3],true),valueCell(data?.[4],true),valueCell(data?.[5],true));body.append(row);
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
$('add-form').addEventListener('submit',event=>{event.preventDefault();const value=$('symbol').value.trim();const known=catalog.find(([label,symbol])=>label.toLowerCase()===value.toLowerCase()||symbol===value.toUpperCase()||symbol.split(':')[1]===value.toUpperCase());const symbol=known?known[1]:value.toUpperCase();if(!/^[A-Z0-9_]+:[A-Z0-9._-]+$/.test(symbol)){$('message').textContent='Bitte eine Aktie aus der Liste oder ein Kürzel im Format BÖRSE:SYMBOL wählen.';return;}if(items.some(x=>x.symbol===symbol)){$('message').textContent='Diese Aktie ist schon in deiner Watchlist.';return;}if(items.length>=30){$('message').textContent='Deine Watchlist kann bis zu 30 Aktien enthalten.';return;}items.push({label:known?known[0]:symbol.split(':')[1],symbol});$('symbol').value='';$('message').textContent=known?'Aktie hinzugefügt.':'Symbol hinzugefügt. Falls TradingView keine Daten findet, prüfe Börse und Kürzel.';save();render();});
$('refresh').addEventListener('click',renderFeed);
window.addEventListener('online',renderFeed);
window.addEventListener('offline',()=>{$('feed-status').textContent='Du bist offline. Kursupdates werden fortgesetzt, sobald die Verbindung wieder verfügbar ist.';});
render();
