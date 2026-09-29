export function sortTransfers(rows,sort='newest'){
 return [...rows].sort((a,b)=>{
  if(sort==='largest'||sort==='smallest'){
   const av=BigInt(a.raw),bv=BigInt(b.raw);
   if(av!==bv)return (av>bv?1:-1)*(sort==='largest'?-1:1);
  }
  return (a.block-b.block||a.logIndex-b.logIndex)*(sort==='oldest'?1:-1);
 });
}
