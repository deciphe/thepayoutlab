// Integer USDC units keep aggregation exact before display formatting.
export function rankRecipients(rows,limit=10){
 const wallets=new Map();
 for(const t of rows){
  if(t.direction!=='out'||t.from.toLowerCase()===t.to.toLowerCase()||BigInt(t.raw)<=0n)continue;
  const address=t.to.toLowerCase(),value=BigInt(t.raw);
  const row=wallets.get(address)||{address,raw:0n,count:0,largestRaw:0n,lastTimestamp:t.timestamp};
  row.raw+=value;row.count++;if(value>row.largestRaw)row.largestRaw=value;
  if(Date.parse(t.timestamp)>Date.parse(row.lastTimestamp))row.lastTimestamp=t.timestamp;
  wallets.set(address,row);
 }
 const ranked=[...wallets.values()].sort((a,b)=>a.raw===b.raw?a.address.localeCompare(b.address):a.raw>b.raw?-1:1);
 const total=ranked.reduce((n,r)=>n+r.raw,0n);
 return {count:ranked.length,total:Number(total)/1e6,rows:ranked.slice(0,limit).map(r=>({...r,raw:r.raw.toString(),largestRaw:r.largestRaw.toString(),total:Number(r.raw)/1e6,largest:Number(r.largestRaw)/1e6,share:total?Number(r.raw*10000n/total)/100:0}))};
}
