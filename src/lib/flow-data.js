export async function fetchFlow(config,{signal,previous,onProgress}={}){
const {wallet:WALLET,token:TOKEN,api:API}=config;
async function get(path){
  for(let attempt=0;attempt<4;attempt++){
    try { const r=await fetch(API+path,{cache:'no-store',signal:AbortSignal.any([signal,AbortSignal.timeout(20000)].filter(Boolean))}); if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json(); }
    catch(e){if(signal?.aborted||attempt===3)throw e;await new Promise(r=>setTimeout(r,1500*(attempt+1)));}
  }
}
const startedAt=Date.now(),cutoff=startedAt-30*86400000, transfers=new Map();
const reusable=previous?.complete&&previous.wallet===WALLET&&previous.token===TOKEN&&previous.chain===config.chain&&Array.isArray(previous.transfers)&&Date.parse(previous.periodStart)<=cutoff&&Date.parse(previous.updatedAt)>cutoff&&Date.parse(previous.updatedAt)<=Date.now();
// Re-read a recent overlap, then merge the already complete older history.
const overlap=reusable?Math.max(cutoff,Date.parse(previous.updatedAt)-3600000):cutoff;
if(reusable)for(const t of previous.transfers)if(BigInt(t.raw)>=10000n&&Date.parse(t.timestamp)>=cutoff&&Date.parse(t.timestamp)<overlap)transfers.set(t.id,t);
let params={type:'ERC-20',token:TOKEN}, complete=false;
for(let page=0;page<300;page++){
  onProgress?.(page+1);
  const data=await get(`/addresses/${WALLET}/token-transfers?${new URLSearchParams(params)}`);
  if(!Array.isArray(data.items))throw Error('Invalid transfer response');
  for(const t of data.items){
    if(t.token?.address_hash?.toLowerCase()!==TOKEN)continue;
    const from=t.from.hash.toLowerCase(),to=t.to.hash.toLowerCase();
    if(from!==WALLET&&to!==WALLET)continue;
    const timestamp=Date.parse(t.timestamp);if(!Number.isFinite(timestamp))throw Error('Invalid timestamp');
    if(timestamp<cutoff)continue;
    if(!/^\d+$/.test(t.total?.value)||Number(t.total.decimals)!==6)throw Error('Invalid USDC amount');
    // Ignore zero-value and sub-cent dust transfers.
    if(BigInt(t.total.value)<10000n)continue;
    const row={id:`${t.transaction_hash}:${t.log_index}`,hash:t.transaction_hash,logIndex:t.log_index,block:t.block_number,timestamp:t.timestamp,from,to,raw:t.total.value,amount:Number(t.total.value)/1e6,direction:from===WALLET?(to===WALLET?'self':'out'):'in'};
    transfers.set(row.id,row);
  }
  if(!data.next_page_params||data.items.some(t=>Date.parse(t.timestamp)<overlap)){complete=true;break;}
  params={type:'ERC-20',token:TOKEN,...data.next_page_params};
}
if(!complete)throw Error('30-day history exceeded page limit; preserving prior snapshot');
const balances=await get(`/addresses/${WALLET}/token-balances`);
if(!Array.isArray(balances))throw Error('Invalid balances');
const balance=balances.find(b=>b.token.address_hash.toLowerCase()===TOKEN);
if(balance&&(!/^\d+$/.test(balance.value)||Number(balance.token.decimals)!==6))throw Error('Invalid USDC balance');
return {schema:1,wallet:WALLET,token:TOKEN,chain:config.chain,updatedAt:new Date().toISOString(),windowEnd:new Date(startedAt).toISOString(),periodStart:new Date(cutoff).toISOString(),complete,balance:Number(balance?.value||0)/1e6,transfers:[...transfers.values()].sort((a,b)=>b.block-a.block||b.logIndex-a.logIndex)};

}
