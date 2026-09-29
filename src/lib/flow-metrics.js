export function sortTransfers(rows,sort='newest'){
 return [...rows].sort((a,b)=>{
  if(sort==='largest'||sort==='smallest'){
   const av=BigInt(a.raw),bv=BigInt(b.raw);
   if(av!==bv)return (av>bv?1:-1)*(sort==='largest'?-1:1);
  }
  return ((Date.parse(a.timestamp)-Date.parse(b.timestamp))||a.block-b.block||a.logIndex-b.logIndex)*(sort==='oldest'?1:-1);
 });
}

export function combineFlows(snapshots,sources){
 if(snapshots.length!==sources.length||snapshots.some((s,i)=>!s?.complete||s.wallet!==sources[i].wallet||s.chain!==sources[i].chain))throw Error('Incomplete combined snapshot');
 return {complete:true,balance:snapshots.reduce((sum,s)=>sum+Math.round(s.balance*1e6),0)/1e6,
 updatedAt:new Date(Math.min(...snapshots.map(s=>Date.parse(s.updatedAt)))).toISOString(),
 windowEnd:new Date(Math.max(...snapshots.map(s=>Date.parse(s.updatedAt)))).toISOString(),
 periodStart:new Date(Math.max(...snapshots.map(s=>Date.parse(s.periodStart)))).toISOString(),
 transfers:sortTransfers(snapshots.flatMap((s,i)=>s.transfers.map(t=>({...t,id:sources[i].chainKey+':'+t.id,chain:sources[i].chain,explorer:sources[i].explorer,explorerName:sources[i].explorerName}))))
 };
}
