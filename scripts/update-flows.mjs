import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fetchFlow} from '../src/lib/flow-data.js';
import {FLOW_CONFIGS} from '../src/lib/flow-config.js';
const dest=process.argv[2]||'public/data';
await mkdir(dest,{recursive:true});
const results=await Promise.allSettled(Object.values(FLOW_CONFIGS).map(async config=>{
 let previous;
 try{
  const response=await fetch(`https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/${config.slug}.json`,{signal:AbortSignal.timeout(15000)});
  if(response.ok)previous=await response.json();
 }catch{}
 try{const bundled=JSON.parse(await readFile(new URL(`../public/data/${config.slug}.json`,import.meta.url),'utf8'));if(!previous||Date.parse(bundled.updatedAt)>Date.parse(previous.updatedAt))previous=bundled;}catch{}
 const snapshot=await fetchFlow(config,{previous,onProgress:page=>{if(page%10===0)console.log(`${config.title}: page ${page}`);}});
 await writeFile(`${dest}/${config.slug}.json`,JSON.stringify(snapshot));
 console.log(`${config.title}: ${snapshot.transfers.length} transfers; balance ${snapshot.balance} USDC`);
}));
for(const [i,result] of results.entries())if(result.status==='rejected')console.error(`${Object.values(FLOW_CONFIGS)[i].title}:`,result.reason);
if(results.every(result=>result.status==='rejected'))process.exitCode=1;
