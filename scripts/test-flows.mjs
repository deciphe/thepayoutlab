import assert from 'node:assert/strict';
import {sortTransfers} from '../src/lib/flow-metrics.js';
import {fetchFlow} from '../src/lib/flow-data.js';
import {FLOW_CONFIGS} from '../src/lib/flow-config.js';
const c=FLOW_CONFIGS.breakout,other='0x1111111111111111111111111111111111111111',second='0x2222222222222222222222222222222222222222';
const now=Date.now(),at=ms=>new Date(now-ms).toISOString();
const row=(to,raw,direction='out')=>({from:c.wallet,to,raw,direction,timestamp:at(1000)});
const sortRows=[{raw:'9007199254740993',block:2,logIndex:1},{raw:'9007199254740992',block:3,logIndex:0},{raw:'100',block:1,logIndex:0}];
assert.equal(sortTransfers(sortRows,'largest')[0].raw,'9007199254740993');
assert.equal(sortTransfers(sortRows,'smallest')[0].raw,'100');
assert.equal(sortTransfers(sortRows,'newest')[0].block,3);
assert.equal(sortTransfers(sortRows,'oldest')[0].block,1);
assert.equal(sortRows[0].block,2);
const transfer=(id,to,raw,age,token=c.token)=>({transaction_hash:'0x'+String(id).padStart(64,'0'),log_index:id,block_number:100-id,timestamp:at(age),token:{address_hash:token},from:{hash:c.wallet},to:{hash:to},total:{value:raw,decimals:'6'}});
const first=transfer(1,other,'2000000',1000),old=transfer(2,second,'3000000',86400000),outside=transfer(3,other,'9000000',31*86400000);
const realFetch=globalThis.fetch;let calls=[];
globalThis.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>url.includes('token-balances')?[{token:{address_hash:c.token,decimals:'6'},value:'777000000'}]:url.includes('index=1')?{items:[old,outside],next_page_params:{index:2}}:{items:[first,first,transfer(5,other,'0',1000),transfer(6,other,'1',1000),transfer(4,other,'1000000',1000,FLOW_CONFIGS.vest.token)],next_page_params:{index:1}}}};
try{
 const d=await fetchFlow(c);assert.equal(d.chain,'Ethereum');assert.equal(d.balance,777);assert.equal(d.transfers.length,2);assert.ok(calls.some(u=>u.includes('index=1')));assert.ok(calls.every(u=>u.startsWith(c.api)));assert.equal(d.complete,true);
 // Incremental refresh must retain older recipients and replace the overlap without double counting.
 calls=[];const previous={...d,updatedAt:at(1800000),periodStart:at(31*86400000)};
 const refreshed=await fetchFlow(c,{previous});assert.equal(refreshed.transfers.length,2);assert.equal(refreshed.transfers.reduce((n,t)=>n+BigInt(t.raw),0n),5000000n);
}finally{globalThis.fetch=realFetch;}
console.log('Flow chain, pagination, token filtering, deduplication, incremental refresh, and transaction sorting checks passed.');

// Render the actual shared UI for each chain to catch wrong explorer/referral wiring.
const {build}=await import('vite');
const {createRequire}=await import('node:module');
const require=createRequire(import.meta.url);
const result=await build({configFile:false,esbuild:{jsx:'automatic'},ssr:{noExternal:['lucide-react']},logLevel:'error',build:{ssr:'src/components/vestflow/Vestflow.jsx',write:false,minify:false,rollupOptions:{output:{format:'cjs'}}}});
const output=Array.isArray(result)?result[0]:result;
const chunk=output.output.find(x=>x.type==='chunk'&&x.isEntry),mod={exports:{}};
new Function('require','module','exports',chunk.code)(require,mod,mod.exports);
const React=require('react'),{renderToString}=require('react-dom/server');
for(const config of Object.values(FLOW_CONFIGS)){
 const html=renderToString(React.createElement(mod.exports.default||mod.exports,{firm:config.id}));
 assert.ok(html.includes(config.referral.replaceAll('&','&amp;')));
 assert.ok(html.includes(config.explorer+'/address/'+config.wallet));
 assert.ok(html.includes(config.eyebrow));
 assert.ok(!html.includes('Top recipients'));
 assert.ok(html.includes('Sort transfers'));
 for(const label of ['Newest first','Oldest first','Largest amount','Smallest amount'])assert.ok(html.includes(label));
 for(const tracker of Object.values(FLOW_CONFIGS))assert.ok(html.includes('#'+tracker.slug));

}
console.log('All tracker views render with sorting controls and the correct referral and explorer links.');
const {combineFlows}=await import('../src/lib/flow-metrics.js');
const {VEST_CHAINS}=await import('../src/lib/flow-config.js');
const snapshots=VEST_CHAINS.map((c,i)=>({wallet:c.wallet,chain:c.chain,complete:true,balance:i+0.1,updatedAt:at(1000),periodStart:at(30*86400000),transfers:[{id:'same-log',raw:'1000000',block:100-i,logIndex:0,timestamp:at((3-i)*10000)}]}));
const combined=combineFlows(snapshots,VEST_CHAINS);
assert.equal(combined.balance,3.3);assert.equal(new Set(combined.transfers.map(t=>t.id)).size,3);
assert.equal(combined.transfers[0].chain,'Ethereum');assert.equal(combined.transfers[0].explorer,'https://etherscan.io');
assert.throws(()=>combineFlows(snapshots.slice(1),VEST_CHAINS));
console.log('Combined balances, chain-qualified transfer IDs, chronological sorting, and completeness checks passed.');
