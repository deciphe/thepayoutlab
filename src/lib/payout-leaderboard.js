export function payoutLeaderboard(rows,sources){
 const tracked=new Set(sources.map(s=>s.wallet.toLowerCase()));
 const wallets=new Map();
 for(const t of rows){
  if(t.direction!=='out'||BigInt(t.raw)<10000n||tracked.has(t.to.toLowerCase()))continue;
  const address=t.to.toLowerCase();
  const item=wallets.get(address)||{address,raw:0n,count:0,explorers:new Map()};
  item.raw+=BigInt(t.raw);item.count++;
  const source=sources.find(s=>s.chain===t.chain)||sources[0];
  item.explorers.set(t.chain||source.chain,t.explorer||source.explorer);
  wallets.set(address,item);
 }
 return [...wallets.values()].sort((a,b)=>a.raw===b.raw?a.address.localeCompare(b.address):a.raw>b.raw?-1:1).slice(0,10).map(w=>({...w,total:Number(w.raw)/1e6,raw:String(w.raw),explorers:[...w.explorers]}));
}
