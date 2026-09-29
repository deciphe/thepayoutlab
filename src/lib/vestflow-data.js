export const WALLET='0xb2f86eae1197032fa85389cc6c0f3b06b58dd1ea';
export const TOKEN='0xaf88d065e77c8cc2239327c5edb3a432268e5831';
const API='https://arbitrum.blockscout.com/api/v2';
export async function fetchVestflow({signal}={}){
async function get(path){
  for(let attempt=0;attempt<4;attempt++){
    try { const r=await fetch(API+path,{signal:AbortSignal.any([signal,AbortSignal.timeout(20000)].filter(Boolean))}); if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json(); }
    catch(e){if(signal?.aborted||attempt===3)throw e;await new Promise(r=>setTimeout(r,1500*(attempt+1)));}
  }
}
const cutoff=Date.now()-30*86400000, transfers=new Map();
let params={type:'ERC-20',token:TOKEN}, complete=false;
for(let page=0;page<100;page++){
  const data=await get(`/addresses/${WALLET}/token-transfers?${new URLSearchParams(params)}`);
  if(!Array.isArray(data.items))throw Error('Invalid transfer response');
  for(const t of data.items){
    if(t.token?.address_hash?.toLowerCase()!==TOKEN)continue;
    const from=t.from.hash.toLowerCase(),to=t.to.hash.toLowerCase();
    if(from!==WALLET&&to!==WALLET)continue;
    const timestamp=Date.parse(t.timestamp);if(!Number.isFinite(timestamp))throw Error('Invalid timestamp');
    if(timestamp<cutoff)continue;
    if(!/^\d+$/.test(t.total?.value)||Number(t.total.decimals)!==6)throw Error('Invalid USDC amount');
    const row={id:`${t.transaction_hash}:${t.log_index}`,hash:t.transaction_hash,logIndex:t.log_index,block:t.block_number,timestamp:t.timestamp,from,to,raw:t.total.value,amount:Number(t.total.value)/1e6,direction:from===WALLET?(to===WALLET?'self':'out'):'in'};
    transfers.set(row.id,row);
  }
  if(!data.next_page_params||data.items.some(t=>Date.parse(t.timestamp)<cutoff)){complete=true;break;}
  params={type:'ERC-20',token:TOKEN,...data.next_page_params};
}
if(!complete)throw Error('30-day history exceeded page limit; preserving prior snapshot');
const balances=await get(`/addresses/${WALLET}/token-balances`);
if(!Array.isArray(balances))throw Error('Invalid balances');
const balance=balances.find(b=>b.token.address_hash.toLowerCase()===TOKEN);
return {schema:1,wallet:WALLET,token:TOKEN,chain:'Arbitrum One',updatedAt:new Date().toISOString(),periodStart:new Date(cutoff).toISOString(),complete,balance:Number(balance?.value||0)/1e6,transfers:[...transfers.values()].sort((a,b)=>b.block-a.block||b.logIndex-a.logIndex)};

}
