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
 renderFeed();
}
function renderFeed(){
 const mount=$('market');mount.replaceChildren();$('feed-status').textContent='';
 if(!items.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='Deine Watchlist wartet auf die erste Aktie. Füge rechts eine Aktie hinzu.';mount.append(empty);return;}
 const wrapper=document.createElement('div');wrapper.className='tradingview-widget-container';const widget=document.createElement('div');widget.className='tradingview-widget-container__widget';wrapper.append(widget);
 const credit=document.createElement('div');credit.className='tradingview-widget-copyright';const link=document.createElement('a');link.href='https://www.tradingview.com/markets/stocks/';link.target='_blank';link.rel='noopener nofollow';link.textContent='Marktdaten von TradingView';credit.append(link);wrapper.append(credit);
 const script=document.createElement('script');script.src='https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js';script.async=true;script.textContent=JSON.stringify({title:'Meine Watchlist',width:'100%',height:Math.max(350,items.length*50+100),locale:'de_DE',showSymbolLogo:true,colorTheme:'light',isTransparent:true,symbolsGroups:[{name:'Aktien',symbols:items.map(x=>({name:x.symbol,displayName:x.label}))}]});
 script.onerror=()=>{$('feed-status').textContent='Kursdaten konnten nicht geladen werden. Prüfe die Verbindung oder einen Inhaltsblocker und klicke auf „Neu laden“.';};wrapper.append(script);mount.append(wrapper);
}
$('add-form').addEventListener('submit',event=>{event.preventDefault();const value=$('symbol').value.trim();const known=catalog.find(([label,symbol])=>label.toLowerCase()===value.toLowerCase()||symbol===value.toUpperCase()||symbol.split(':')[1]===value.toUpperCase());const symbol=known?known[1]:value.toUpperCase();if(!/^[A-Z0-9_]+:[A-Z0-9._-]+$/.test(symbol)){$('message').textContent='Bitte eine Aktie aus der Liste oder ein Kürzel im Format BÖRSE:SYMBOL wählen.';return;}if(items.some(x=>x.symbol===symbol)){$('message').textContent='Diese Aktie ist schon in deiner Watchlist.';return;}if(items.length>=30){$('message').textContent='Deine Watchlist kann bis zu 30 Aktien enthalten.';return;}items.push({label:known?known[0]:symbol.split(':')[1],symbol});$('symbol').value='';$('message').textContent=known?'Aktie hinzugefügt.':'Symbol hinzugefügt. Falls TradingView keine Daten findet, prüfe Börse und Kürzel.';save();render();});
$('refresh').addEventListener('click',renderFeed);
window.addEventListener('online',renderFeed);
window.addEventListener('offline',()=>{$('feed-status').textContent='Du bist offline. Kursupdates werden fortgesetzt, sobald die Verbindung wieder verfügbar ist.';});
render();
