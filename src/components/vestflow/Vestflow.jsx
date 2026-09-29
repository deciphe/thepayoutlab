import {useEffect,useMemo,useState} from 'react';
import {ArrowDownLeft,ArrowUpRight,RefreshCw,ExternalLink,Copy,Check,Pause,Play,Activity} from 'lucide-react';
import './vestflow.css';
const WALLET='0xb2f86eae1197032fa85389cc6c0f3b06b58dd1ea';
const EXPLORER='https://arbiscan.io';
const SOURCE='https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/vestflow.json';
const money=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2,minimumFractionDigits:2}).format(n);
const compact=n=>new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:1}).format(n);
const short=a=>a.slice(0,6)+'…'+a.slice(-4);
function FlowScene({data,summary,onSelect,selected,paused}) {
 const groups=useMemo(()=>{
  return ['in','out'].map(direction=>{
   const map=new Map();
   for(const t of summary?.rows||[]){if(t.direction!==direction)continue;const address=direction==='in'?t.from:t.to;const item=map.get(address)||{address,total:0,count:0,direction};item.total+=t.amount;item.count++;map.set(address,item);}
   const ranked=[...map.values()].sort((a,b)=>b.total-a.total);
   const top=ranked.slice(0,3);if(ranked.length>3)top.push({address:null,total:ranked.slice(3).reduce((a,b)=>a+b.total,0),count:ranked.slice(3).reduce((a,b)=>a+b.count,0),direction,others:ranked.length-3,excluded:ranked.slice(0,3).map(g=>g.address)});
   return top;
  });
 },[summary]);
 const total=(summary?.incoming||0)+(summary?.outgoing||0),share=total?(summary.incoming/total)*100:0;
 return <section className={'vf-network'+(paused?' is-paused':'')} aria-label="Wallet transfer flow map">
  <div className="vf-scene-grid" aria-hidden="true"/>
  <div className="vf-network-top"><span><Activity size={13}/> TRANSFER MAP</span><span>ARBITRUM ONE <i/> USDC</span></div>
  <div className="vf-flow-stage">
   <svg className="vf-connections" viewBox="0 0 1000 380" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="vf-in-path"><stop stopColor="#b6ff4a" stopOpacity=".6"/><stop offset="1" stopColor="#b6ff4a" stopOpacity=".1"/></linearGradient><linearGradient id="vf-out-path"><stop stopColor="#9b87f5" stopOpacity=".1"/><stop offset="1" stopColor="#9b87f5" stopOpacity=".6"/></linearGradient></defs>{groups.flatMap((group,side)=>group.map((g,i)=>{const y=62+i*84;const path=side===0?`M 200 ${y} C 320 ${y}, 325 190, 405 190`:`M 595 190 C 675 190, 680 ${y}, 800 ${y}`;return <g key={side+'-'+i} className={'vf-wire '+(side?'out':'in')}><path d={path} className="vf-track"/><path d={path} className="vf-signal" style={{animationDelay:(-i*1.3)+'s',animationDuration:(5+i*.8)+'s'}}/></g>}))}</svg>
   {groups.map((group,side)=><div className={'vf-node-column '+(side?'out':'in')} key={side}><div className="vf-side-label">{side?'DESTINATIONS':'SOURCES'}<span>{group.reduce((a,g)=>a+(g.others||1),0)} wallets</span></div>{group.map((g,i)=><button key={g.address||'others'} className={'vf-node'+(selected===g.address&&g.address?' selected':'')} onClick={()=>onSelect(g)} aria-label={`${g.address?short(g.address):g.others+' other wallets'}, ${money(g.total)} USDC ${side?'outgoing':'incoming'}`}><span className="vf-node-dot"/><span className="vf-node-info"><span>{g.address?short(g.address):`+${g.others} other wallets`}</span><strong>{compact(g.total)}<small> USDC</small></strong></span><span className="vf-node-count">{g.count}<small>TX</small></span></button>)}{!group.length&&<div className="vf-node-empty">{data?'No transfers':'Reading chain…'}</div>}</div>)}
   <div className="vf-core"><svg viewBox="0 0 300 300" className="vf-orbits" aria-hidden="true"><circle cx="150" cy="150" r="145" className="vf-orbit-outer"/><circle cx="150" cy="150" r="133" className="vf-orbit-dashes"/><circle cx="150" cy="150" r="120" className="vf-ring-base"/><circle cx="150" cy="150" r="120" className="vf-ring-in" pathLength="100" strokeDasharray={`${share} ${100-share}`} transform="rotate(-90 150 150)"/><circle cx="150" cy="150" r="107" className="vf-orbit-inner"/></svg><div className="vf-core-copy"><span className="vf-core-symbol">$</span><span>WALLET BALANCE</span><strong>{data?money(data.balance):'—'}</strong><small>USDC</small><a href={`${EXPLORER}/address/${WALLET}`} target="_blank" rel="noreferrer">{short(WALLET)} <ExternalLink size={10}/></a></div></div>
  </div>
  <div className="vf-network-bottom"><span><i/> Incoming <b>{total?(share).toFixed(1):'0'}%</b></span><p>Top counterparties · tap a wallet to filter</p><span>Outgoing <b>{total?(100-share).toFixed(1):'0'}%</b><i/></span></div>
 </section>;
}
function TransferStrip({rows,onInspect,active}){
 return <div className="vf-strip"><div className="vf-strip-label"><span>RECENT</span><b>Transfers</b></div><div className="vf-strip-scroll">{rows.slice(0,12).map(t=><button key={t.id} onClick={()=>onInspect(t)} className={'vf-ticket '+t.direction+(active?.id===t.id?' active':'')}><span>{t.direction==='in'?<ArrowDownLeft size={13}/>:<ArrowUpRight size={13}/>} {t.direction==='in'?'RECEIVED':'SENT'}</span><strong>{t.direction==='in'?'+':'−'}{money(t.amount)}<small> USDC</small></strong><span>{short(t.direction==='in'?t.from:t.to)}<small>{new Date(t.timestamp).toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'})}</small></span></button>)}{!rows.length&&<span className="vf-empty-strip">No transfers in this selection</span>}</div></div>;
}
function WalletGlyph({address}){
 const bits=Array.from({length:15},(_,i)=>parseInt(address.slice(2+i,3+i),16)%2===0);
 return <span className="vf-glyph" aria-hidden="true">{Array.from({length:25},(_,i)=>{const x=i%5,y=Math.floor(i/5);return <i key={i} className={bits[y*3+(x>2?4-x:x)]?'on':''}/>;})}</span>;
}
function TransferGallery({rows,limit,direction}){
 const [expanded,setExpanded]=useState(null);
 useEffect(()=>setExpanded(null),[rows.map(t=>t.id).join('|')]);
 const incoming=rows.filter(t=>t.direction==='in'),outgoing=rows.filter(t=>t.direction==='out');
 const sum=items=>Number(items.reduce((n,t)=>n+BigInt(t.raw),0n))/1e6;
 const total=sum(rows),largest=Math.max(0,...rows.map(t=>t.amount));
 return <div className={'vf-transfer-gallery '+direction}>
  {rows.length>0&&<div className="vf-gallery-summary"><div className="vf-gallery-emblem">{direction==='in'?<ArrowDownLeft size={26}/>:direction==='out'?<ArrowUpRight size={26}/>:<Activity size={24}/>}</div><div className="vf-gallery-total"><span>{direction==='in'?'RECEIVED':direction==='out'?'SENT':'TRANSFER VOLUME'}</span><strong>{money(total)} <small>USDC</small></strong></div><div className="vf-gallery-split"><span><i/>{incoming.length} incoming</span><span><i/>{outgoing.length} outgoing</span><div className="vf-gallery-ratio"><b style={{width:(total?sum(incoming)/total*100:0)+'%'}}/></div></div><div className="vf-gallery-note"><strong>{rows.length}</strong><span>transfers in this view</span></div></div>}
  <div className="vf-transfer-grid">{rows.slice(0,limit).map(t=>{
   const isIn=t.direction==='in',peer=isIn?t.from:t.to,open=expanded===t.id;
   return <article className={'vf-transfer-card '+t.direction+(open?' is-open':'')} key={t.id}>
    <button className="vf-transfer-face" aria-expanded={open} aria-label={`Inspect ${isIn?'incoming':'outgoing'} ${money(t.amount)} USDC transfer ${short(t.hash)}`} onClick={()=>setExpanded(open?null:t.id)}>
     <div className="vf-transfer-top"><span className="vf-transfer-badge">{isIn?<ArrowDownLeft size={13}/>:<ArrowUpRight size={13}/>} {isIn?'INCOMING':'OUTGOING'}</span><time dateTime={t.timestamp}>{new Date(t.timestamp).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></div>
     <div className="vf-transfer-value"><span>{isIn?'+':'−'}</span>{money(t.amount)}<small>USDC</small></div>
     <div className="vf-transfer-route"><div className="vf-route-end">{isIn?<WalletGlyph address={peer}/>:<span className="vf-wallet-mark">V</span>}<span>{isIn?short(peer):'Vest wallet'}<small>FROM</small></span></div><div className="vf-route-wire"><i/><b>›</b></div><div className="vf-route-end">{isIn?<span className="vf-wallet-mark">V</span>:<WalletGlyph address={peer}/>}<span>{isIn?'Vest wallet':short(peer)}<small>TO</small></span></div></div>
     <div className="vf-transfer-bottom"><span>{short(t.hash)}</span><span>{open?'Close details':'Inspect transfer'} <b>{open?'−':'+'}</b></span></div>
     <div className="vf-transfer-scale" title="Amount relative to the largest transfer in this view"><i style={{width:(largest?t.amount/largest*100:0)+'%'}}/></div>
    </button>
    {open&&<div className="vf-transfer-details"><div><span>FROM</span><a href={`${EXPLORER}/address/${t.from}`} target="_blank" rel="noreferrer">{t.from}<ExternalLink size={12}/></a></div><div><span>TO</span><a href={`${EXPLORER}/address/${t.to}`} target="_blank" rel="noreferrer">{t.to}<ExternalLink size={12}/></a></div><div className="vf-transfer-meta"><span>Block {new Intl.NumberFormat().format(t.block)}</span><span>{new Date(t.timestamp).toLocaleString()}</span></div><a className="vf-transfer-explorer" href={`${EXPLORER}/tx/${t.hash}`} target="_blank" rel="noreferrer">View on Arbiscan <ExternalLink size={13}/></a></div>}
   </article>;
  })}</div>
 </div>;
}
export default function Vestflow(){
 const [data,setData]=useState(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[days,setDays]=useState(7),[direction,setDirection]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(12),[copied,setCopied]=useState(false),[clock,setClock]=useState(Date.now()),[paused,setPaused]=useState(false),[inspected,setInspected]=useState(null),[bucket,setBucket]=useState(null),[excluded,setExcluded]=useState([]);
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
 useEffect(()=>{setLimit(12);setInspected(null);},[days,direction,query,excluded]);
 useEffect(()=>{setBucket(null);setExcluded([]);},[days]);
 const summary=useMemo(()=>{
  if(!data)return null;
  const end=Date.parse(data.updatedAt),start=Math.max(end-days*86400000,Date.parse(data.periodStart));
  const rows=data.transfers.filter(t=>Date.parse(t.timestamp)>=start&&t.direction!=='self');
  const incoming=rows.filter(t=>t.direction==='in'),outgoing=rows.filter(t=>t.direction==='out');
  const sum=rs=>Number(rs.reduce((a,t)=>a+BigInt(t.raw),0n))/1e6;
  const count=days===1?24:days;
  const buckets=Array.from({length:count},(_,i)=>({start:start+(end-start)*i/count,in:0,out:0}));
  for(const t of rows){const i=Math.min(count-1,Math.floor((Date.parse(t.timestamp)-start)/(end-start)*count));if(i>=0)buckets[i][t.direction]+=t.amount;}
  return {rows,incoming:sum(incoming),outgoing:sum(outgoing),inCount:incoming.length,outCount:outgoing.length,recipients:new Set(outgoing.map(t=>t.to)).size,buckets};
 },[data,days]);
 const rows=summary?.rows.filter(t=>(direction==='all'||t.direction===direction)&&!excluded.includes(t.direction==='in'?t.from:t.to)&&[t.from,t.to,t.hash].some(v=>v.includes(query.trim().toLowerCase())))||[];
 const age=data?Math.max(0,Math.floor((clock-Date.parse(data.updatedAt))/60000)):0,stale=age>30;
 const max=Math.max(1,...(summary?.buckets.flatMap(b=>[b.in,b.out])||[]));
 async function copy(){try{await navigator.clipboard.writeText(WALLET);setCopied(true);setTimeout(()=>setCopied(false),2000);}catch{setError('Copy unavailable. The full wallet address is shown below.');}}
 return <main className="vf">
  <header className="vf-top"><a href="#" className="vf-brand">GP.</a><span>GIGAPROP <i>/</i> ONCHAIN</span><a className="vf-back" href="#">Back to GIGAPROP <ArrowUpRight size={16}/></a></header>
  <section className="vf-heading"><div><div className="vf-eyebrow">VEST EXCHANGE</div><h1>vest<span>flows</span><i>.</i></h1><p>Every transfer. One clear view.</p></div><div className="vf-status"><span className={stale||error?'vf-warning':''}>{busy?'Updating snapshot…':data?(stale?'Snapshot delayed · ':'Updated · ')+age+'m ago':'Waiting for data'}</span><button onClick={refresh} disabled={busy}><RefreshCw size={14} className={busy?'vf-spin':''}/> Refresh</button><small>Scheduled every 15 minutes</small></div></section>
  {error&&<p className="vf-alert" role="status">{error}</p>}
  {stale&&<p className="vf-alert">The latest snapshot is over 30 minutes old. Values below are as of {new Date(data.updatedAt).toLocaleString()}.</p>}
  <div className="vf-period"><div className="vf-view-label"><span className="vf-status-dot"/> SNAPSHOT FLOW <button className="vf-pause" onClick={()=>setPaused(v=>!v)} aria-label={paused?"Play flow animation":"Pause flow animation"}>{paused?<Play size={12}/>:<Pause size={12}/>}</button></div><div role="group" aria-label="Time range">{[1,7,30].map(n=><button key={n} onClick={()=>setDays(n)} aria-pressed={days===n}>{n===1?'24H':n+'D'}</button>)}</div></div>
  <FlowScene data={data} summary={summary} paused={paused} selected={query} onSelect={g=>{setQuery(g.address||'');setExcluded(g.excluded||[]);setDirection(g.direction);}}/>
  <section className="vf-stats"><article className="vf-in"><span><ArrowDownLeft size={16}/> Total incoming</span><strong>{summary?'+'+money(summary.incoming):'—'}<small> USDC</small></strong><div className="vf-mini-bars" aria-hidden="true">{summary?.buckets.map((b,i)=><i key={i} style={{height:Math.max(2,b.in/max*27)+'px'}}/>)}</div><p>{summary?.inCount??'—'} transfers</p></article><article className="vf-out"><span><ArrowUpRight size={16}/> Total outgoing</span><strong>{summary?'−'+money(summary.outgoing):'—'}<small> USDC</small></strong><div className="vf-mini-bars" aria-hidden="true">{summary?.buckets.map((b,i)=><i key={i} style={{height:Math.max(2,b.out/max*27)+'px'}}/>)}</div><p>{summary?.outCount??'—'} transfers · {summary?.recipients??'—'} recipients</p></article><article className="vf-net"><span>Net flow</span><strong>{summary?(summary.incoming>=summary.outgoing?'+':'−')+money(Math.abs(summary.incoming-summary.outgoing)):'—'}<small> USDC</small></strong><div className="vf-ratio"><i style={{width:(summary?(summary.incoming/(summary.incoming+summary.outgoing||1)*100):0)+'%'}}/></div><p>Incoming minus outgoing · {days===1?'24 hours':days+' days'}</p></article></section>
  <TransferStrip rows={rows} onInspect={setInspected} active={inspected}/>
  {inspected&&<section className="vf-inspector"><div><span>{inspected.direction==='in'?'RECEIVED':'SENT'}</span><strong className={inspected.direction}>{money(inspected.amount)} <small>USDC</small></strong></div><div><span>FROM</span><a href={`${EXPLORER}/address/${inspected.from}`} target="_blank" rel="noreferrer">{short(inspected.from)}</a></div><div><span>TO</span><a href={`${EXPLORER}/address/${inspected.to}`} target="_blank" rel="noreferrer">{short(inspected.to)}</a></div><a href={`${EXPLORER}/tx/${inspected.hash}`} target="_blank" rel="noreferrer">View transaction <ExternalLink size={13}/></a><button onClick={()=>setInspected(null)} aria-label="Close transfer detail">×</button></section>}
  <section className="vf-chart-panel"><div className="vf-panel-head"><h2>Flow pulse <small>{days===1?"HOURLY":"DAILY"}</small></h2><div className="vf-legend"><span>Incoming</span><span>Outgoing</span></div></div><div className="vf-chart" aria-label="USDC inflows and outflows by time bucket">{summary?summary.buckets.map((b,i)=><button type="button" className={"vf-bar-group"+(bucket===i?" is-selected":"")} key={i} onClick={()=>setBucket(bucket===i?null:i)} aria-label={`${new Date(b.start).toLocaleString(undefined,days===1?{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}:{month:'short',day:'numeric'})}: incoming ${money(b.in)}, outgoing ${money(b.out)} USDC`}><div className="vf-bar-up"><span style={{height:(b.in/max*100)+'%'}}/></div><div className="vf-bar-down"><span style={{height:(b.out/max*100)+'%'}}/></div><div className="vf-tooltip">{new Date(b.start).toLocaleString(undefined,days===1?{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}:{month:'short',day:'numeric'})}<br/>In +{compact(b.in)}<br/>Out −{compact(b.out)}</div></button>):<p className="vf-empty">{busy?'Loading onchain activity…':'Data currently unavailable. Try refresh.'}</p>}</div><div className="vf-chart-axis"><span>{summary?new Date(summary.buckets[0].start).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'}</span><span>{bucket!==null&&summary?.buckets[bucket]?`In +${money(summary.buckets[bucket].in)} / Out −${money(summary.buckets[bucket].out)}`:days===1?'24 hourly buckets · USDC':'Tap a bar to inspect · USDC'}</span><span>{data?new Date(data.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'—'}</span></div></section>
  <section className="vf-feed"><div className="vf-panel-head"><h2>All activity <span>{rows.length}</span></h2><input aria-label="Search address or transaction" placeholder="Search address or transaction" value={query} onChange={e=>{setQuery(e.target.value);setExcluded([]);}}/></div>{(query||excluded.length>0)&&<div className="vf-filter-chip">{excluded.length?"Other counterparties":"Wallet filter: "+short(query)} <button onClick={()=>{setQuery('');setExcluded([]);setDirection('all');}}>Clear ×</button></div>}<div className="vf-tabs" role="group" aria-label="Transfer direction">{[['all','All transfers'],['in','Incoming'],['out','Outgoing']].map(([v,label])=><button key={v} aria-pressed={direction===v} onClick={()=>{setDirection(v);setExcluded([]);}}>{v==='in'?<ArrowDownLeft size={14}/>:v==='out'?<ArrowUpRight size={14}/>:<Activity size={14}/>} {label}</button>)}</div><TransferGallery rows={rows} limit={limit} direction={direction}/>{!rows.length&&<p className="vf-empty">{busy?'Loading transfers…':!data?'No snapshot available.':query?'No matching transfers.':'No transfers in this period.'}</p>}{rows.length>limit&&<button className="vf-more" onClick={()=>setLimit(n=>n+24)}>Show more · {rows.length-limit} remaining</button>}</section>
  <div className="vf-wallet"><span>TRACKED CONTRACT</span><a href={`${EXPLORER}/address/${WALLET}#tokentxns`} target="_blank" rel="noreferrer">{WALLET}</a><button onClick={copy} aria-label="Copy wallet address">{copied?<Check size={15}/>:<Copy size={15}/>}</button></div><footer className="vf-footer"><span>GIGAPROP <b> / </b> VESTFLOWS</span><p>Native USDC transfers on Arbitrum · Rolling 30-day history · Source: <a href={`https://arbitrum.blockscout.com/address/${WALLET}`} target="_blank" rel="noreferrer">Blockscout</a>.<br/>Wallet selected by GIGAPROP. Transfers alone do not establish payouts, revenue, or reserves. Not affiliated with Vest.</p>{data&&<small>Snapshot: {new Date(data.updatedAt).toLocaleString()}</small>}</footer>
 </main>;
}
