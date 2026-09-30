import {useEffect,useState,useRef} from 'react';
import {ArrowUpRight,Copy,Check,ArrowLeft,RefreshCw} from 'lucide-react';
import './flow-hub.css';
import {FLOW_CONFIGS,VEST_CHAINS,NOVA_WALLETS} from '../../lib/flow-config.js';
import {combineFlows} from '../../lib/flow-metrics.js';
import {isPayoutRecipientTransfer} from '../../lib/flow-classification.js';
const firms=[
 {id:'vest',name:'Vest',title:'vest',logo:'/brands/vest.ico',route:'#vestflow',tag:'03 NETWORKS',description:'One view. Three chains.',detail:'Arbitrum · Base · Ethereum',color:'#b7c89d',points:'16,48 42,48 60,26 91,26 115,61 142,61 163,36 205,36 225,19 260,19'},
 {id:'breakout',name:'Breakout',title:'breakout',logo:'/brands/breakout.ico',route:'#breakoutflow',tag:'ETHEREUM',description:'Follow the wallet activity.',detail:'USDC flow · recipient rankings',color:'#b6b7d0',points:'16,59 40,59 66,38 90,38 113,49 144,49 171,24 203,24 223,36 260,36'},
 {id:'nova',name:'Hypernova',title:'nova',logo:'/brands/hypernova.ico',route:'#novaflow',tag:'RESERVE + SETTLEMENT',description:'Two wallets. A wider picture.',detail:'Reserve split · NovaPulse · pass rates',color:'#bda5d2',points:'16,55 43,55 68,31 99,31 119,47 148,47 175,17 211,17 234,29 260,29'},
 {id:'propr',name:'Propr',title:'propr',logo:'/brands/propr-icon.svg',route:'#proprflow',tag:'FLOW + PROGRAM STATS',description:'From assessment to payout.',detail:'Propr Pulse · outcomes · payout timing',color:'#9ebdb3',points:'16,60 45,60 66,43 96,43 122,24 153,24 175,38 210,38 236,15 260,15'},
];
const sourcesFor=id=>id==='vest'?VEST_CHAINS:id==='nova'?NOVA_WALLETS:[FLOW_CONFIGS[id]];
const cash=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:1}).format(n);
function glance(snapshots,sources,days){
 if(!snapshots)return null;
 const data=sources.length>1?combineFlows(snapshots,sources):snapshots[0];
 const end=Date.parse(data.windowEnd||data.updatedAt),start=end-days*86400000;
 if(Date.parse(data.periodStart)>start+60000)return {balance:data.balance,updatedAt:data.updatedAt,outgoing:null};
 const outgoing=Number(data.transfers.filter(t=>Date.parse(t.timestamp)>=start&&Date.parse(t.timestamp)<=end&&isPayoutRecipientTransfer(t,sources)).reduce((sum,t)=>sum+BigInt(t.raw),0n))/1e6;
 return {balance:data.balance,outgoing,updatedAt:data.updatedAt};
}
export default function FlowHub(){
 const [days,setDays]=useState(7),[snapshots,setSnapshots]=useState({});
 const [busy,setBusy]=useState(false),[errors,setErrors]=useState({}),[clock,setClock]=useState(Date.now());
 const refreshRef=useRef(()=>{});
 useEffect(()=>{
  const controller=new AbortController();let running=false;
  async function fetchSource(source){
   let fallback=null;
   for(const url of [`https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/${source.slug}.json`,`/data/${source.slug}.json`]){
    try{const response=await fetch(url+'?t='+Date.now(),{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(12000)])});if(!response.ok)continue;const d=await response.json();if(d.complete&&d.wallet?.toLowerCase()===source.wallet.toLowerCase()&&d.token?.toLowerCase()===source.token.toLowerCase()&&d.chain===source.chain&&Array.isArray(d.transfers)&&Number.isFinite(d.balance)&&Number.isFinite(Date.parse(d.updatedAt))){fallback=d;break;}}catch{if(controller.signal.aborted)return null;}
   }
   return fallback;
  }
  async function refresh(){
   if(running||controller.signal.aborted)return;running=true;setBusy(true);
   try{await Promise.all(firms.map(async firm=>{
    const ds=await Promise.all(sourcesFor(firm.id).map(fetchSource));
    if(controller.signal.aborted)return;
    const complete=ds.every(Boolean);
    setErrors(old=>({...old,[firm.id]:!complete}));
    setSnapshots(old=>{if(!complete)return {...old,[firm.id]:old[firm.id]||null};const previous=old[firm.id];if(previous&&ds.some((d,i)=>Date.parse(d.updatedAt)<Date.parse(previous[i].updatedAt)))return old;return {...old,[firm.id]:ds};});
   }));}finally{running=false;if(!controller.signal.aborted){setBusy(false);setClock(Date.now());}}
  }
  refreshRef.current=refresh;refresh();
  const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh();},15*60*1000);
  const ticker=setInterval(()=>setClock(Date.now()),60000);
  const visible=()=>{if(document.visibilityState==='visible')refresh();};
  document.addEventListener('visibilitychange',visible);
  return()=>{controller.abort();clearInterval(timer);clearInterval(ticker);document.removeEventListener('visibilitychange',visible);refreshRef.current=()=>{};};
 },[]);
 const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 useEffect(()=>{const old=document.title;document.title='Flow · GIGAPROP';return()=>{document.title=old;};},[]);
 async function copy(){try{await navigator.clipboard.writeText('https://gigaprop.xyz/#flow');setCopied(true);setCopyError(false);}catch{setCopyError(true);}}
 return <main className="fh"><div className="fh-shell"><header className="fh-nav"><a href="#" className="fh-brand">GP<span>.</span></a><span>THE FLOW DIRECTORY</span><a href="#"><ArrowLeft size={12}/> GigaProp</a></header>
 <section className="fh-intro"><span className="fh-eyebrow">FOUR FIRMS / ONE PLACE</span><h1>Follow the <em>flow.</em></h1><p>Explore the wallets. Follow the transfers.<br/>Go deeper into the numbers behind each firm.</p><div className="fh-share"><button onClick={copy}>{copied?<Check size={13}/>:<Copy size={13}/>} {copied?'Link copied':'gigaprop.xyz/#flow'}</button><span aria-live="polite">{copyError?'Copy this link from your address bar.':'Your shortcut to every tracker.'}</span></div></section>
 <div className="fh-glance-controls"><em>at a glance</em><span>USDC · filtered outflow</span><button className="fh-refresh" onClick={()=>refreshRef.current()} disabled={busy} title="Refresh snapshots · automatically every 15 minutes and when returning to this tab" aria-label="Refresh all firm snapshots"><RefreshCw size={12} className={busy?'fh-spin':''}/>{busy?'Refreshing…':'Refresh'}</button><div role="group" aria-label="Outflow period">{[7,30].map(n=><button key={n} aria-pressed={days===n} onClick={()=>setDays(n)}>{n}D</button>)}</div></div>
 <p className="fh-refresh-note" role="status">{busy?'Checking latest snapshots…':'Auto-refresh every 15 minutes · refreshes when you return to this tab'}</p>
 <section className="fh-grid" aria-label="Choose a firm tracker">{firms.map((f,i)=>{const stats=glance(snapshots[f.id],sourcesFor(f.id),days);return <a key={f.id} className="fh-card" href={f.route} style={{'--firm-color':f.color}}><div className="fh-card-top"><span className="fh-logo"><img src={f.logo} alt=""/></span><span>{f.name}</span><small>{String(i+1).padStart(2,'0')}</small><ArrowUpRight size={20}/></div><div className="fh-card-main"><span className="fh-tag">{f.tag}</span><h2>{f.title}<span>flow</span><i>.</i></h2><p>{f.description}</p></div><svg className="fh-signal" viewBox="0 0 280 80" aria-hidden="true"><path d="M0 20H280 M0 40H280 M0 60H280" className="fh-gridlines"/><polyline points={f.points}/><polyline className="fh-signal-glow" points={f.points}/></svg><div className="fh-glance"><div><em>balance</em><strong>{stats?cash(stats.balance):'—'}</strong></div><div><em>{days}d outflow</em><strong>{stats?.outgoing!=null?cash(stats.outgoing):'—'}</strong></div><small>{errors[f.id]?'Refresh unavailable · ':stats&&clock-Date.parse(stats.updatedAt)>30*60*1000?'Delayed snapshot · ':''}{stats?`As of ${new Date(stats.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:snapshots[f.id]===null?'Snapshot unavailable':'Loading snapshot…'}</small></div><div className="fh-card-foot"><span>{f.detail}</span><b>Explore <ArrowUpRight size={12}/></b></div></a>;})}</section>
 <footer className="fh-footer"><span>ONCHAIN ACTIVITY. IN CONTEXT.</span><p>Outflow excludes known internal wallets and identified bridges; it is not verified trader payouts. Tracked USDC wallet activity, not a firm’s complete financial position. Program metrics are dated, firm-reported snapshots.</p><a href="#">Independent tracking by GIGAPROP ↗</a></footer></div></main>;
}
