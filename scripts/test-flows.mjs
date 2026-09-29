import assert from 'node:assert/strict';
import {rankRecipients} from '../src/lib/flow-metrics.js';
import {fetchFlow} from '../src/lib/flow-data.js';
import {FLOW_CONFIGS} from '../src/lib/flow-config.js';
const c=FLOW_CONFIGS.breakout,other='0x1111111111111111111111111111111111111111',second='0x2222222222222222222222222222222222222222';
const now=Date.now(),at=ms=>new Date(now-ms).toISOString();
const row=(to,raw,direction='out')=>({from:c.wallet,to,raw,direction,timestamp:at(1000)});
const ranking=rankRecipients([row(other,'2000000'),row(other.toUpperCase(),'3000001'),row(second,'4000000'),row(c.wallet,'99000000','self'),row(other,'99000000','in')]);
assert.equal(ranking.rows[0].address,other);assert.equal(ranking.rows[0].raw,'5000001');assert.equal(ranking.rows[0].count,2);assert.equal(ranking.total,9.000001);assert.equal(ranking.count,2);
assert.equal(rankRecipients(Array.from({length:12},(_,i)=>row('0x'+String(i+1).padStart(40,'0'),String((i+1)*1000000)))).rows.length,10);
const transfer=(id,to,raw,age,token=c.token)=>({transaction_hash:'0x'+String(id).padStart(64,'0'),log_index:id,block_number:100-id,timestamp:at(age),token:{address_hash:token},from:{hash:c.wallet},to:{hash:to},total:{value:raw,decimals:'6'}});
const first=transfer(1,other,'2000000',1000),old=transfer(2,second,'3000000',86400000),outside=transfer(3,other,'9000000',31*86400000);
const realFetch=globalThis.fetch;let calls=[];
globalThis.fetch=async url=>{calls.push(url);return {ok:true,json:async()=>url.includes('token-balances')?[{token:{address_hash:c.token,decimals:'6'},value:'777000000'}]:url.includes('index=1')?{items:[old,outside],next_page_params:{index:2}}:{items:[first,first,transfer(4,other,'1000000',1000,FLOW_CONFIGS.vest.token)],next_page_params:{index:1}}}};
try{
 const d=await fetchFlow(c);assert.equal(d.chain,'Ethereum');assert.equal(d.balance,777);assert.equal(d.transfers.length,2);assert.ok(calls.some(u=>u.includes('index=1')));assert.ok(calls.every(u=>u.startsWith(c.api)));assert.equal(d.complete,true);
 // Incremental refresh must retain older recipients and replace the overlap without double counting.
 calls=[];const previous={...d,updatedAt:at(1800000),periodStart:at(31*86400000)};
 const refreshed=await fetchFlow(c,{previous});assert.equal(refreshed.transfers.length,2);assert.equal(rankRecipients(refreshed.transfers).total,5);
}finally{globalThis.fetch=realFetch;}
console.log('Flow chain, pagination, token filtering, deduplication, incremental refresh, and recipient ranking checks passed.');

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
 const html=renderToString(React.createElement(mod.exports.default,{firm:config.id}));
 assert.ok(html.includes(config.referral.replaceAll('&','&amp;')));
 assert.ok(html.includes(config.explorer+'/address/'+config.wallet));
 assert.ok(html.includes(config.eyebrow));
 assert.ok(html.includes('Top recipients'));
 assert.ok(html.includes('#novaflow'));
 const rows=Array.from({length:12},(_,i)=>row('0x'+String(i+1).padStart(40,'0'),String((i+1)*1000000)));
 const rankingHtml=renderToString(React.createElement(mod.exports.TopRecipients,{rows,ready:true,days:30,config,onSelect:()=>{}}));
 assert.equal((rankingHtml.match(/class="vf-recipient-row"/g)||[]).length,10);
 assert.ok(rankingHtml.includes(config.explorer+'/address/'));
}
console.log('All three tracker views and top-10 lists render with the correct referral and explorer links.');
