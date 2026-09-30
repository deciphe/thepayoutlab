import {useEffect,useState} from 'react';
import {ArrowUpRight,Copy,Check,ArrowLeft} from 'lucide-react';
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
 useEffect(()=>{const controller=new AbortController(); async function fetchSource(source){for(const url of [`https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/${source.slug}.json`,`/data/${source.slug}.json`]){try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)continue;const d=await response.json();if(d.complete&&d.wallet?.toLowerCase()===source.wallet.toLowerCase()&&d.token?.toLowerCase()===source.token.toLowerCase()&&d.chain===source.chain&&Array.isArray(d.transfers))return d;}catch{if(controller.signal.aborted)return null;}}return null;}
 Promise.all(firms.map(async firm=>{const ds=await Promise.all(sourcesFor(firm.id).map(fetchSource));if(!controller.signal.aborted)setSnapshots(old=>({...old,[firm.id]:ds.every(Boolean)?ds:null}));}));return()=>controller.abort();},[]);
 const [copied,setCopied]=useState(false),[copyError,setCopyError]=useState(false);
 useEffect(()=>{const old=document.title;document.title='Flow · GIGAPROP';return()=>{document.title=old;};},[]);
 async function copy(){try{await navigator.clipboard.writeText('https://gigaprop.xyz/#flow');setCopied(true);setCopyError(false);}catch{setCopyError(true);}}
 return <main className="fh"><div className="fh-shell"><header className="fh-nav"><a href="#" className="fh-brand">GP<span>.</span></a><span>THE FLOW DIRECTORY</span><a href="#"><ArrowLeft size={12}/> GigaProp</a></header>
 <section className="fh-intro"><span className="fh-eyebrow">FOUR FIRMS / ONE PLACE</span><h1>Follow the <em>flow.</em></h1><p>Explore the wallets. Follow the transfers.<br/>Go deeper into the numbers behind each firm.</p><div className="fh-share"><button onClick={copy}>{copied?<Check size={13}/>:<Copy size={13}/>} {copied?'Link copied':'gigaprop.xyz/#flow'}</button><span aria-live="polite">{copyError?'Copy this link from your address bar.':'Your shortcut to every tracker.'}</span></div></section>
 <div className="fh-glance-controls"><em>at a glance</em><span>USDC · filtered outflow</span><div role="group" aria-label="Outflow period">{[7,30].map(n=><button key={n} aria-pressed={days===n} onClick={()=>setDays(n)}>{n}D</button>)}</div></div>
 <section className="fh-grid" aria-label="Choose a firm tracker">{firms.map((f,i)=>{const stats=glance(snapshots[f.id],sourcesFor(f.id),days);return <a key={f.id} className="fh-card" href={f.route} style={{'--firm-color':f.color}}><div className="fh-card-top"><span className="fh-logo"><img src={f.logo} alt=""/></span><span>{f.name}</span><small>{String(i+1).padStart(2,'0')}</small><ArrowUpRight size={20}/></div><div className="fh-card-main"><span className="fh-tag">{f.tag}</span><h2>{f.title}<span>flow</span><i>.</i></h2><p>{f.description}</p></div><svg className="fh-signal" viewBox="0 0 280 80" aria-hidden="true"><path d="M0 20H280 M0 40H280 M0 60H280" className="fh-gridlines"/><polyline points={f.points}/><polyline className="fh-signal-glow" points={f.points}/></svg><div className="fh-glance"><div><em>balance</em><strong>{stats?cash(stats.balance):'—'}</strong></div><div><em>{days}d outflow</em><strong>{stats?.outgoing!=null?cash(stats.outgoing):'—'}</strong></div><small>{stats?`As of ${new Date(stats.updatedAt).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`:snapshots[f.id]===null?'Snapshot unavailable':'Loading snapshot…'}</small></div><div className="fh-card-foot"><span>{f.detail}</span><b>Explore <ArrowUpRight size={12}/></b></div></a>;})}</section>
 <footer className="fh-footer"><span>ONCHAIN ACTIVITY. IN CONTEXT.</span><p>Outflow excludes known internal wallets and identified bridges; it is not verified trader payouts. Tracked USDC wallet activity, not a firm’s complete financial position. Program metrics are dated, firm-reported snapshots.</p><a href="#">Independent tracking by GIGAPROP ↗</a></footer></div></main>;
}
