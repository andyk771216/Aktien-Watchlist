const {test} = require('node:test');
const assert = require('node:assert/strict');
const store = require('../watchlist-storage.js');
const defaults = [{label:'Apple',symbol:'NASDAQ:AAPL'}];
const custom = [{label:'Siemens Energy AG',symbol:'XETR:ENR'}, {label:'L’Oréal',symbol:'EURONEXT:OR'}];
function memory(initial) {
 const values=new Map(initial === undefined ? [] : [[store.KEY,JSON.stringify(initial)]]);
 return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}
test('add, delete and restore in a later page session using the existing v1 key',()=>{
 const storage=memory(defaults);
 assert.equal(store.write(storage,custom),true);
 assert.deepEqual(store.read(storage,'',defaults).items,custom);
 assert.equal(store.write(storage,custom.slice(1)),true);
 assert.deepEqual(store.read(storage,'',defaults).items,custom.slice(1));
});
test('empty watchlist stays empty rather than restoring initial stocks',()=>{
 const storage=memory();store.write(storage,[]);
 assert.deepEqual(store.read(storage,'',defaults).items,[]);
 assert.deepEqual(store.read(memory(),store.hash([]),defaults).items,[]);
});
test('personal link restores selection after all browser storage is cleared',()=>{
 const result=store.read(memory(),store.hash(custom),defaults);
 assert.equal(result.source,'link');assert.deepEqual(result.items,custom);
});
test('link restores even if localStorage getter throws',()=>{
 const blocked={getItem(){throw new Error('blocked')},setItem(){throw new Error('blocked')}};
 assert.deepEqual(store.read(blocked,store.hash(custom),defaults).items,custom);
 assert.equal(store.write(blocked,custom),false);
});
test('storage write failures and silent no-op storage are detected',()=>{
 assert.equal(store.write({getItem:()=>null,setItem:()=>{}},custom),false);
});
test('invalid link falls back to saved selection and gives a visible warning',()=>{
 const result=store.read(memory(custom),'#watchlist=broken',defaults);
 assert.deepEqual(result.items,custom);assert.ok(result.warning);
});
test('invalid data is reported rather than silently dropping individual saved stocks',()=>{
 const result=store.read(memory([{symbol:'bad',label:'bad'}]),'',defaults);
 assert.equal(result.source,'example');assert.ok(result.warning);
});
test('international symbols and names survive URL and storage round trips',()=>{
 const data=[{symbol:'BMV:SIE/N',label:'Siemens AG México'},{symbol:'HKEX:700',label:'腾讯控股'}];
 assert.deepEqual(store.read(memory(),store.hash(data),defaults).items,data);
});
