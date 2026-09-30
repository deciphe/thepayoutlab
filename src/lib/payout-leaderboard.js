import {isPayoutRecipientTransfer} from './flow-classification.js';
export function payoutLeaderboard(rows,sources,windowEnd){
 const end=Date.parse(windowEnd);
 const wallets=new Map();
 for(const t of rows){
  if(!isPayoutRecipientTransfer(t,sources))continue;
  const address=t.to.toLowerCase();
  const item=wallets.get(address)||{address,raw:0n,raw24h:0n,count:0,explorers:new Map()};
  item.raw+=BigInt(t.raw);item.count++;
  const timestamp=Date.parse(t.timestamp);
  if(timestamp>end-86400000&&timestamp<=end)item.raw24h+=BigInt(t.raw);
  const source=sources.find(s=>s.chain===t.chain)||sources[0];
  item.explorers.set(t.chain||source.chain,t.explorer||source.explorer);
  wallets.set(address,item);
 }
 return [...wallets.values()].sort((a,b)=>a.raw===b.raw?a.address.localeCompare(b.address):a.raw>b.raw?-1:1).slice(0,10).map(w=>({...w,total:Number(w.raw)/1e6,raw:String(w.raw),received24h:Number(w.raw24h)/1e6,raw24h:String(w.raw24h),explorers:[...w.explorers]}));
}
