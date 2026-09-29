import {useEffect,useMemo,useState} from 'react';
import {ArrowDownLeft,ArrowUpRight,RefreshCw,ExternalLink,Copy,Check} from 'lucide-react';
import './vestflow.css';
const WALLET='0xb2f86eae1197032fa85389cc6c0f3b06b58dd1ea';
const EXPLORER='https://arbiscan.io';
const SOURCE='https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/vestflow.json';
const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2,minimumFractionDigits:2}).format(n);
const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const short=a=>a.slice(0,6)+'…'+a.slice(-4);
export default function Vestflow(){
 const [data,setData]=useState(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[days,setDays]=useState(7),[direction,setDirection]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(25),[copied,setCopied]=useState(false),[clock,setClock]=useState(Date.now());
 async function refresh(){
  setBusy(true);setError('');
  try{
   let snapshot;
   for(const url of [SOURCE,'/data/vestflow.json']){
    try{const r=await fetch(url+'?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();const d=await r.json();if(d.wallet!==WALLET||!d.complete||!Array.isArray(d.transfers))throw Error();snapshot=d;break;}catch{}
   }
   if(!snapshot)throw Error();
   setData(old=>!old||Date.parse(snapshot.updatedAt)>=Date.parse(old.updatedAt)?snapshot:old);
  }catch{setError('Refresh unavailable. Last successful snapshot is kept below.');}
  finally{setBusy(false);setClock(Date.now());}
 }
 useEffect(()=>{refresh();const timer=setInterval(refresh,15*60*1000),tick=setInterval(()=>setClock(Date.now()),30000);const visible=()=>{if(document.visibilityState==='visible')refresh();};document.addEventListener('visibilitychange',visible);const title=document.title;document.title='Vestflows · GIGAPROP';return()=>{clearInterval(timer);clearInterval(tick);document.removeEventListener('visibilitychange',visible);document.title=title;};},[]);
 useEffect(()=>setLimit(25),[days,direction,query]);
 const summary=useMemo(()=>{
  if(!data)return null;
  const end=Date.parse(data.updatedAt),start=Math.max(end-days*86400000,Date.parse(data.periodStart));
  const rows=data.transfers.filter(t=>Date.parse(t.timestamp)>=start&&t.direction!=='self');
  const incoming=rows.filter(t=>t.direction==='in'),outgoing=rows.filter(t=>t.direction==='out');
  const sum=rs=>Number(rs.reduce((a,t)=>a+BigInt(t.raw),0n))/1e6;
  const buckets=Array.from({length:days},(_,i)=>({start:start+(end-start)*i/days,in:0,out:0}));
  for(const t of rows){const i=Math.min(days-1,Math.floor((Date.parse(t.timestamp)-start)/(end-start)*days));if(i>=0)buckets[i][t.direction]+=t.amount;}
  return {rows,incoming:sum(incoming),outgoing:sum(outgoing),inCount:incoming.length,outCount:outgoing.length,recipients:new Set(outgoing.map(t=>t.to)).size,buckets};
 },[data,days]);
 const rows=summary?.rows.filter(t=>(direction==='all'||t.direction===direction)&&[t.from,t.to,t.hash].some(v=>v.includes(query.trim().toLowerCase())))||[];
 const age=data?Math.max(0,Math.floor((clock-Date.parse(data.updatedAt))/60000)):0,stale=age>30;
 const max=Math.max(1,...(summary?.buckets.flatMap(b=>[b.in,b.out])||[]));
 async function copy(){try{await navigator.clipboard.writeText(WALLET);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{setError('Copy unavailable. The full wallet address is shown below.');}}
 return <main className="vf">
  <header className="vf-top"><a href="#" className="vf-brand">GP.</a><span>ONCHAIN OBSERVATORY</span><a className="vf-back" href="#">Back to GIGAPROP <ArrowUpRight size={16}/></a></header>
  <section className="vf-heading"><div><div className="vf-eyebrow">VEST EXCHANGE / ARBITRUM ONE</div><h1>vest<span>flows</span><i>.</i></h1><p>Follow the USDC. In and out.</p></div><div className="vf-status"><span className={stale||error?'vf-warning':''}>{busy?'Updating snapshot…':data?(stale?'Snapshot delayed · ':'Updated · ')+age+'m ago':'Waiting for data'}</span><button onClick={refresh} disabled={busy}><RefreshCw size={14} className={busy?'vf-spin':''}/> Refresh</button><small>Scheduled every 15 minutes</small></div></section>
  <div className="vf-wallet"><span>TRACKED WALLET</span><a href={`${EXPLORER}/address/${WALLET}#tokentxns`} target="_blank" rel="noreferrer">{WALLET}</a><button onClick={copy} aria-label="Copy wallet address">{copied?<Check size={15}/>:<Copy size={15}/>}</button><span className="vf-token">USDC <span>·</span> ARB</span></div>
  {error&&<p className="vf-alert" role="status">{error}</p>}
  {stale&&<p className="vf-alert">The latest snapshot is over 30 minutes old. Values below are as of {new Date(data.updatedAt).toLocaleString()}.</p>}
  <div className="vf-period"><span>WALLET FLOW</span><div role="group" aria-label="Time range">{[1,7,30].map(n=><button key={n} onClick={()=>setDays(n)} aria-pressed={days===n}>{n===1?'24H':n+'D'}</button>)}</div></div>
  <section className="vf-stats"><article className="vf-balance"><span>Current balance <small>USDC</small></span><strong>{data?money(data.balance):'—'}</strong><p>At latest snapshot</p></article><article className="vf-in"><span><ArrowDownLeft size={17}/> Incoming</span><strong>{summary?'+'+money(summary.incoming):'—'}</strong><p>{summary?.inCount??'—'} transfers</p></article><article className="vf-out"><span><ArrowUpRight size={17}/> Outgoing</span><strong>{summary?'−'+money(summary.outgoing):'—'}</strong><p>{summary?.outCount??'—'} transfers · {summary?.recipients??'—'} recipients</p></article><article><span>Net flow <small>USDC</small></span><strong>{summary?(summary.incoming>=summary.outgoing?'+':'−')+money(Math.abs(summary.incoming-summary.outgoing)):'—'}</strong><p>Selected period</p></article></section>
  <section className="vf-chart-panel"><div className="vf-panel-head"><h2>Flow over time</h2><div className="vf-legend"><span>Incoming</span><span>Outgoing</span></div></div><div className="vf-chart" aria-label="USDC inflows and outflows by time bucket">{summary?summary.buckets.map((b,i)=><div className="vf-bar-group" key={i} tabIndex={0} aria-label={`${new Date(b.start).toLocaleDateString()}: incoming ${money(b.in)}, outgoing ${money(b.out)} USDC`}><div className="vf-bar-up"><span style={{height:(b.in/max*100)+'%'}}/></div><div className="vf-bar-down"><span style={{height:(b.out/max*100)+'%'}}/></div><div className="vf-tooltip">{new Date(b.start).toLocaleDateString()}<br/>In +{compact(b.in)}<br/>Out −{compact(b.out)}</div></div>):<p className="vf-empty">{busy?'Loading onchain activity…':'Data currently unavailable. Try refresh.'}</p>}</div><div className="vf-chart-axis"><span>{summary?new Date(summary.buckets[0].start).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'}</span><span>{days===1?'24-hour total':'Daily buckets'} · USDC</span><span>{data?new Date(data.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'}</span></div></section>
  <section className="vf-feed"><div className="vf-panel-head"><h2>Transfer ledger <span>{rows.length}</span></h2><input aria-label="Search address or transaction" placeholder="Search address or transaction" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="vf-tabs" role="group" aria-label="Transfer direction">{[['all','All transfers'],['in','Incoming'],['out','Outgoing']].map(([v,label])=><button key={v} aria-pressed={direction===v} onClick={()=>setDirection(v)}>{label}</button>)}</div><div className="vf-table-wrap"><table><thead><tr><th>Flow</th><th>Amount / USDC</th><th>Counterparty</th><th>Time</th><th>Transaction</th></tr></thead><tbody>{rows.slice(0,limit).map(t=><tr key={t.id}><td><span className={'vf-direction '+t.direction}>{t.direction==='in'?<ArrowDownLeft size={14}/>:<ArrowUpRight size={14}/>} {t.direction==='in'?'Incoming':'Outgoing'}</span></td><td className={'vf-amount '+t.direction}>{t.direction==='in'?'+':'−'}{money(t.amount)}</td><td><a href={`${EXPLORER}/address/${t.direction==='in'?t.from:t.to}`} target="_blank" rel="noreferrer" title={t.direction==='in'?t.from:t.to}>{short(t.direction==='in'?t.from:t.to)}</a></td><td title={new Date(t.timestamp).toISOString()}>{new Date(t.timestamp).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td><td><a href={`${EXPLORER}/tx/${t.hash}`} target="_blank" rel="noreferrer">{short(t.hash)} <ExternalLink size={12}/></a></td></tr>)}</tbody></table></div>{!rows.length&&<p className="vf-empty">{busy?'Loading transfers…':!data?'No snapshot available.':query?'No matching transfers.':'No transfers in this period.'}</p>}{rows.length>limit&&<button className="vf-more" onClick={()=>setLimit(n=>n+50)}>Show more · {rows.length-limit} remaining</button>}</section>
  <footer className="vf-footer"><span>GIGAPROP <b> / </b> VESTFLOWS</span><p>Native USDC transfers on Arbitrum · Rolling 30-day history · Source: <a href={`https://arbitrum.blockscout.com/address/${WALLET}`} target="_blank" rel="noreferrer">Blockscout</a>.<br/>Wallet selected by GIGAPROP. Transfers alone do not establish payouts, revenue, or reserves. Not affiliated with Vest.</p>{data&&<small>Snapshot: {new Date(data.updatedAt).toLocaleString()}</small>}</footer>
 </main>;
}
