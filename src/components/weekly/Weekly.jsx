import {canonicalTraderWallet,traderWallets} from '../../lib/trader-wallets.js';
import NextMove from '../shared/NextMove';
import {useEffect,useMemo,useRef,useState} from 'react';
import {ArrowUpRight,ArrowLeft,Download,ShieldCheck,Wallet,Search,X,RefreshCw,ChevronRight,Copy,Check,Trophy} from 'lucide-react';
import {fetchFlow} from '../../lib/flow-data.js';
import {WEEK,WEEKLY_FIRMS,rankWeekly,validSnapshot,weeklySources,weekStart as calendarWeekStart,weeklyBoard as calendarWeeklyBoard} from '../../lib/weekly-leaderboard.js';
import {seasonDuration,seasonStart as weekStart,seasonKey as weekKey,seasonNumber,validSeasonKey,seasonBoard as weeklyBoard} from '../../lib/season-leaderboard.js';
import {FEATURED_TRADERS} from '../../lib/trader-profiles.js';
import WeeklyPoster,{range} from './WeeklyPoster';
import './weekly.css';
import './frequent-withdrawer.css';
import './profile-submission.css';
import './vest-league-offer.css';
import './daily-changes.css';
import {rankSeasonChanges} from '../../lib/season-changes.js';

const ROOT='https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/';
const API='https://gigaprop-profiles.johnhuska1260335.chatgpt.site/api';
const usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const short=a=>a.slice(0,6)+'…'+a.slice(-4);
const weekRange=s=>new Date(s).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'})+' — '+new Date(s+WEEK-1).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
function initial(){const p=new URLSearchParams(window.location.hash.split('?')[1]||'');const w=p.get('season')||p.get('week');return {week:w&&validSeasonKey(w)?w:weekKey(weekStart()),view:p.get('view')==='weekly'?'weekly':'season',wallet:canonicalTraderWallet(p.get('wallet')),firm:WEEKLY_FIRMS.some(f=>f.id===p.get('firm'))?p.get('firm'):'vest'};}
async function read(path,signal){for(const root of [ROOT,'/data/']){try{const r=await fetch(root+path+'?t='+Math.floor(Date.now()/60000),{signal,cache:'no-store'});if(r.ok)return await r.json();}catch{if(signal?.aborted)throw Error('Cancelled');}}throw Error('Snapshot unavailable');}
async function posterFonts(node){
 const chars=[...new Set(node.textContent)].sort().join('');
 const response=await fetch('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700;800&display=swap&text='+encodeURIComponent(chars));
 if(!response.ok)throw Error('Fonts unavailable');
 let css=await response.text();
 const urls=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(m=>m[1].replace(/["']/g,'')))];
 await Promise.all(urls.map(async url=>{const r=await fetch(url);if(!r.ok)throw Error('Font unavailable');const blob=await r.blob();const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});css=css.split(url).join(data)}));
 return css;
}
function Badges({firms}){return <span className="wk-badges">{WEEKLY_FIRMS.filter(f=>firms[f.id]).map(f=><span key={f.id} title={f.name+' · '+usd(firms[f.id])}><img src={f.logo} alt=""/>{f.name}</span>)}</span>}
const tagHref=profile=>profile?.tag&&/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(profile.tag)?'https://'+profile.tag:null;
const xProfileCache=new Map();
const cleanXHandle=value=>String(value||'').trim().replace(/^@/,'');
async function fetchXProfile(value,signal){
 const handle=cleanXHandle(value);
 if(!/^[A-Za-z0-9_]{1,15}$/.test(handle))return null;
 const key=handle.toLowerCase();
 if(xProfileCache.has(key))return xProfileCache.get(key);
 const fallback={username:handle,displayName:handle,avatar:'https://unavatar.io/x/'+encodeURIComponent(handle),social:'https://x.com/'+handle};
 try{
  const r=await fetch('https://api.fxtwitter.com/2/profile/'+encodeURIComponent(handle),{signal,headers:{Accept:'application/json'}});
  if(!r.ok){xProfileCache.set(key,fallback);return fallback}
  const d=await r.json(),u=d?.user;
  if(!u?.screen_name){xProfileCache.set(key,fallback);return fallback}
  const profile={username:u.screen_name,displayName:u.name||u.screen_name,avatar:u.avatar_url||fallback.avatar,social:'https://x.com/'+u.screen_name,xBio:u.description||'',xVerified:!!u.verification?.verified};
  xProfileCache.set(key,profile);return profile;
 }catch{
  if(signal?.aborted)throw Error('Cancelled');
  xProfileCache.set(key,fallback);return fallback;
 }
}
function TraderTag({profile,compact=false}){const href=tagHref(profile);if(!profile?.tag)return null;return href?<a className={'wk-trader-tag wk-tag-link'+(compact?' wk-tag-compact':'')} href={href} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} aria-label={'Visit '+profile.tag}><span>{profile.tag}</span><ArrowUpRight size={compact?10:13}/></a>:<span className={'wk-trader-tag'+(compact?' wk-tag-compact':'')}>{profile.tag}</span>}
function Spark({row,start,duration}){let total=0;const data=[...row.transfers].sort((a,b)=>Date.parse(a.timestamp)-Date.parse(b.timestamp));let line='0,46';for(const t of data){const x=(Date.parse(t.timestamp)-start)/duration*180;line+=` ${x},${46-total/row.total*40}`;total+=t.amount;line+=` ${x},${46-total/row.total*40}`;}return <svg viewBox="0 0 180 52" aria-hidden="true"><polyline points={line} fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>}
function DailyChange({row}){
 const label=!row.changeAvailable?'—':row.isNew?'NEW':row.rankChange>0?'↑'+row.rankChange:row.rankChange<0?'↓'+Math.abs(row.rankChange):'—';
 const tone=row.isNew||row.rankChange>0?'up':row.rankChange<0?'down':'flat';
 const detail=!row.changeAvailable?'A full 24 hours of this season is not available yet':row.isNew?'No eligible season payouts at the previous cutoff':'Rank #'+row.previousRank+' → #'+row.rank+' over 24 hours';
 return <span className="wk-daily"><span className={'wk-daily-cash '+(row.received24h===0?'wk-daily-zero':'')} title="Eligible USDC received in the 24 hours ending at the displayed data cutoff">+{usd(row.received24h)} <em>USDC · 24h</em></span><span className={'wk-daily-rank wk-daily-'+tone} title={detail} aria-label={detail}>{label} <em>rank · 24h</em></span></span>;
}
export default function Weekly(){
 const [route]=useState(initial),[week,setWeek]=useState(route.week),[view,setView]=useState(route.view),[firm,setFirm]=useState(route.firm),[snapshots,setSnapshots]=useState(null),[edition,setEdition]=useState(null),[weeks,setWeeks]=useState([]),[busy,setBusy]=useState(true),[error,setError]=useState(''),[query,setQuery]=useState(''),[selected,setSelected]=useState(route.wallet),[profiles,setProfiles]=useState(FEATURED_TRADERS),[profileError,setProfileError]=useState(false),[claim,setClaim]=useState(null),[poster,setPoster]=useState(null),[exporting,setExporting]=useState(false),[copied,setCopied]=useState(false),[history,setHistory]=useState(null);
 const posterRef=useRef(null),dialog=useRef(null),refresh=useRef(()=>{});
 const seasonStart=Date.parse(week+'T00:00:00Z'),currentWeekStart=calendarWeekStart(),start=view==='weekly'?currentWeekStart:seasonStart,live=view==='weekly'||week===weekKey(weekStart());
 useEffect(()=>{const title=document.title;document.title=(view==='weekly'?'Weekly Top 20':firm==='vest'?'Vest Top 100':'The Fifteen')+' · GIGAPROP Trader Rankings';return()=>{document.title=title}},[firm,view]);
 useEffect(()=>{const c=new AbortController();let running=false,previous={};const sources=weeklySources(firm);
 setSnapshots(null);
 async function run(){if(running)return;running=true;setBusy(true);
 try{
  const cached=await Promise.all(sources.map(async source=>{if(previous[source.slug])return previous[source.slug];try{const d=await read(source.slug+'.json',AbortSignal.any([c.signal,AbortSignal.timeout(15000)]));return validSnapshot(d,source)?d:null}catch{return null}}));
  if(c.signal.aborted)return;
  previous=Object.fromEntries(sources.map((s,i)=>[s.slug,cached[i]]));
  if(cached.every(Boolean))setSnapshots(previous);
  const fresh=await Promise.all(sources.map((source,i)=>fetchFlow(source,{previous:cached[i],signal:AbortSignal.any([c.signal,AbortSignal.timeout(55000)])})));
  if(!c.signal.aborted){previous=Object.fromEntries(sources.map((s,i)=>[s.slug,fresh[i]]));setSnapshots(previous);setError('');}
 }catch{if(!c.signal.aborted)setError('Live refresh unavailable. Showing the last complete payout record.');}
 finally{running=false;if(!c.signal.aborted)setBusy(false);}}
 read('season-index.json',c.signal).then(index=>{if(!c.signal.aborted)setWeeks((index.weeks||[]).filter(w=>validSeasonKey(w.week)))}).catch(()=>{});
 refresh.current=run;run();const onVisible=()=>{if(document.visibilityState==='visible')run()};document.addEventListener('visibilitychange',onVisible);const timer=setInterval(onVisible,60000);return()=>{c.abort();clearInterval(timer);document.removeEventListener('visibilitychange',onVisible)};
 },[firm]);
 useEffect(()=>{setEdition(previous=>previous?.week===week?previous:null);const c=new AbortController();read('seasons/'+week+'.json',AbortSignal.any([c.signal,AbortSignal.timeout(15000)])).then(d=>{if(d.available&&d.week===week&&!c.signal.aborted)setEdition(previous=>previous?.week===week&&Date.parse(previous.asOf)>Date.parse(d.asOf)?previous:d)}).catch(()=>{});return()=>c.abort()},[week,snapshots]);
 const computed=useMemo(()=>{
  if(!snapshots)return null;
  if(view==='weekly')return calendarWeeklyBoard(snapshots,currentWeekStart,Date.now(),WEEK,firm);
  return Number.isFinite(seasonStart)?weeklyBoard(snapshots,seasonStart,Date.now(),edition,firm):null;
 },[snapshots,view,currentWeekStart,seasonStart,edition,firm]);
 const board=view==='weekly'?computed:edition?.closed?edition:computed?.available&&(!edition||Date.parse(computed.asOf)>=Date.parse(edition.asOf))?computed:edition;
 const ranked=useMemo(()=>rankSeasonChanges(board,firm),[board,firm]);
 const vestFrequency=useMemo(()=>{
  const rows=rankWeekly(board,'vest').sort((a,b)=>b.count-a.count||b.total-a.total||a.address.localeCompare(b.address));
  return rows.length?{winner:rows[0],ties:rows.filter(r=>r.count===rows[0].count).length}:null;
 },[board]);
 const addresses=ranked.map(r=>r.address).join(',');
 useEffect(()=>{if(!addresses)return;const c=new AbortController(),all=addresses.split(','),chunks=[];for(let i=0;i<all.length;i+=100)chunks.push(all.slice(i,i+100));
 (async()=>{try{const found=[];for(let i=0;i<chunks.length;i+=4){const batch=await Promise.all(chunks.slice(i,i+4).map(async chunk=>{const r=await fetch(API+'/profiles?addresses='+encodeURIComponent(chunk.join(',')),{signal:c.signal});if(!r.ok)throw Error();const d=await r.json();if(!Array.isArray(d.profiles))throw Error();return d.profiles}));found.push(...batch.flat());}if(!c.signal.aborted){const rows=await Promise.all(found.map(async x=>{const address=x.address?.toLowerCase();let social=null;if(!FEATURED_TRADERS[address]&&x.username){try{social=await fetchXProfile(x.username,c.signal)}catch{}}return [address,{...x,...social,address,...FEATURED_TRADERS[address]}]}));const remote=Object.fromEntries(rows);setProfiles(p=>({...p,...remote,...FEATURED_TRADERS}));setProfileError(false)}}catch{if(!c.signal.aborted)setProfileError(true)}})();return()=>c.abort()},[addresses]);
 const limit=view==='weekly'?20:firm==='vest'?100:15;
 const filtered=query.trim()?ranked.filter(r=>traderWallets(r.address).some(a=>a.includes(query.trim().toLowerCase()))||profiles[r.address]?.username?.toLowerCase().includes(query.trim().replace('@','').toLowerCase())||profiles[r.address]?.displayName?.toLowerCase().includes(query.trim().toLowerCase())).slice(0,limit):ranked.slice(0,limit);
 const person=ranked.find(r=>r.address===selected),total=ranked.reduce((s,r)=>s+r.total,0),count=ranked.reduce((s,r)=>s+r.count,0),stale=board&&Date.now()-Date.parse(board.asOf)>3600000;
 useEffect(()=>{if((selected||poster||claim)&&dialog.current&&!dialog.current.open)dialog.current.showModal();else if(dialog.current?.open&&!selected&&!poster&&!claim)dialog.current.close()},[selected,poster,claim]);
 function close(){setSelected(null);setPoster(null);setClaim(null);setError('');}
 function linkFor(wallet){return location.origin+location.pathname+'#leaderboard?season='+week+'&firm='+firm+(view==='weekly'?'&view=weekly':'')+(wallet?'&wallet='+wallet:'');}
 async function copy(wallet){try{await navigator.clipboard.writeText(linkFor(wallet));setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{setError('Could not copy link. You can copy the wallet address below.')}}
 async function download(){if(!posterRef.current)return;setExporting(true);try{const {toJpeg}=await import('html-to-image');await document.fonts.ready;const fontEmbedCSS=await posterFonts(posterRef.current);const artwork=posterRef.current.querySelector('svg');const bounds=artwork?.viewBox.baseVal;if(!bounds?.width||!bounds?.height)throw Error('Missing card dimensions');const width=posterRef.current.getBoundingClientRect().width,height=width*bounds.height/bounds.width;const url=await toJpeg(posterRef.current,{quality:0.97,fontEmbedCSS,width,height,canvasWidth:width,canvasHeight:height,pixelRatio:(firm==='vest'&&!poster?.address?1800:3600)/width,backgroundColor:'#09090b',style:{margin:'0',padding:'0',border:'0',width:width+'px',height:height+'px',minHeight:'0',maxHeight:'none',maxWidth:'none',overflow:'hidden',transform:'none',boxSizing:'border-box'}});if(!url.startsWith('data:image/jpeg'))throw Error();const a=document.createElement('a');a.href=url;a.download=`gigaprop-season-${week}${poster?.address?'-rank-'+poster.rank:'-top'+limit}.jpg`;document.body.append(a);a.click();a.remove()}catch{setError('Image download failed. Please try again.')}finally{setExporting(false)}}
 useEffect(()=>{setHistory(null);if(!selected||view==='weekly')return;const c=new AbortController();const old=weeks.filter(w=>w.closed&&w.week!==week).slice(0,8);Promise.all(old.map(async w=>{try{const b=await read('seasons/'+w.week+'.json',c.signal),r=rankWeekly(b,firm).find(r=>r.address===selected);return {week:w.week,start:w.start,row:r,available:true}}catch{return {week:w.week,start:w.start,available:false}}})).then(d=>{if(!c.signal.aborted)setHistory(d)});return()=>c.abort()},[selected,weeks,week,firm,view]);
 const name=r=>profiles[r.address]?'@'+profiles[r.address].username:short(r.address);
 const options=[...new Set([weekKey(weekStart()),...weeks.map(w=>w.week),week])].sort().reverse();
 const weeklyRange=weekRange(currentWeekStart);
 return <main className="wk"><div className="wk-shell">
 <header className="wk-nav"><a href="#" className="wk-brand">GP.</a><a href="#leaderboard" className="wk-nav-title">TRADER LEAGUE</a><a href="#flow" className="wk-flow-link">Flow trackers <ArrowUpRight size={14}/></a><button onClick={()=>setClaim({address:''})}><Wallet size={14}/> Claim profile</button></header>
 <section className="wk-hero"><div className="wk-eyebrow"><span className="wk-dot"/> {view==='weekly'?'THIS WEEK · LIVE':board?.closed?'SEASON RESULTS LOCKED':'RANKED COMPETITION · LIVE'} <span>{view==='weekly'?'TOP 20':'SEASON '+String(seasonNumber(seasonStart)).padStart(2,'0')}</span></div><div className="wk-hero-line"><div className="wk-hero-copy"><div className="wk-league-kicker">{view==='weekly'?'GIGAPROP / WEEKLY LEADERBOARD':'GIGAPROP / QUARTERLY SEASONS'}</div><h1>THE TOP<br/><em>{view==='weekly'?'TWENTY.':firm==='vest'?'100.':'FIFTEEN.'}</em></h1><p>Names worth <strong>knowing.</strong></p><span className="wk-league-note">{view==='weekly'?'Ranked by eligible onchain payouts received this week.':'Ranked by onchain payouts. Earned every season.'}</span></div><div className="wk-editorial-side"><span className="wk-issue-number" style={view==='weekly'||firm==='vest'?{fontSize:'clamp(110px,18vw,240px)',letterSpacing:'-0.09em'}:undefined}>{limit}</span><div className="wk-league-seal"><span>FOUR FIRMS. ONE STANDARD.</span><div className="wk-firm-marks">{WEEKLY_FIRMS.map(f=><img key={f.id} src={f.logo} alt={f.name} title={f.name}/>)}</div><b>{view==='weekly'?'WEEK / '+weeklyRange:'SEASON '+String(seasonNumber(seasonStart)).padStart(2,'0')+' / '+range(seasonStart)}</b></div></div></div>
 <div className="wk-overview"><div><strong>{board?usd(total):'—'}</strong><span>eligible USDC received</span></div><div><strong>{board?ranked.length.toLocaleString():'—'}</strong><span>payout profiles</span></div><div><strong>{board?count.toLocaleString():'—'}</strong><span>individual payouts</span></div><div className="wk-week">{view==='weekly'?<><label>WEEK / UTC</label><strong className="wk-week-current">{weeklyRange}</strong></>:<><label htmlFor="wk-week">SEASON EDITIONS / UTC</label><select id="wk-week" value={week} onChange={e=>{setWeek(e.target.value);setSelected(null)}}>{options.map(w=><option key={w} value={w}>{range(Date.parse(w+'T00:00:00Z'))}{w===weekKey(weekStart())?' · Live':''}</option>)}</select></>}</div></div></section>
 <a className="wk-vest-offer" href="https://next.vestmarkets.com/r/isgigaprop" target="_blank" rel="sponsored noopener noreferrer" aria-label="Get 5% off Vest with the GIGAPROP referral link"><img src="/brands/vest-symbol.svg" alt=""/><span><strong>Your next place on the board.</strong><small>Vest · GP referral</small></span><b>5% OFF</b><ArrowUpRight size={16}/></a>
 <div className="wk-view-switch" aria-label="Leaderboard period"><button className={view==='season'?'active':''} onClick={()=>{setView('season');setSelected(null);setQuery('')}}>Season</button><button className={view==='weekly'?'active':''} onClick={()=>{setView('weekly');setSelected(null);setQuery('')}}>Weekly <span>Top 20</span></button></div>
 <div className="wk-controls"><div className="wk-tabs" aria-label="Filter by firm">{[...WEEKLY_FIRMS].sort((a,b)=>(b.id==='vest')-(a.id==='vest')).map(f=><button key={f.id} className={firm===f.id?'active':''} onClick={()=>{setFirm(f.id);setQuery('')}}>{f.name}</button>)}</div>{view==='season'&&<button className="wk-export" disabled={!board||!ranked.length} onClick={()=>setPoster({})}><Download size={14}/> Season image</button>}</div>
 {board?<><div className="wk-arena-title"><span>THE PODIUM</span><b>{board.closed?'SEASON FINALISTS':'THE RACE FOR #1'}</b><span>TOP 03</span></div><div className="wk-podium">{ranked.slice(0,3).map((r,i)=><div key={r.address} role="button" tabIndex={0} className={'wk-podium-card wk-place-'+(i+1)+' wk-house-'+Object.keys(r.firms).sort((a,b)=>r.firms[b]-r.firms[a])[0]} onClick={()=>setSelected(r.address)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(r.address)}}}><div className="wk-podium-top"><span>{i===0?<Trophy size={17}/>:null}{view==='weekly'?['WEEK LEADER','SECOND PLACE','THIRD PLACE'][i]:board.closed?['SEASON NO. 1','SECOND PLACE','THIRD PLACE'][i]:['SEASON LEADER','SECOND PLACE','THIRD PLACE'][i]}</span><b>{String(i+1).padStart(2,'0')}</b></div><div className="wk-card-art"><div className="wk-brand-watermarks">{WEEKLY_FIRMS.filter(f=>r.firms[f.id]).map(f=><img key={f.id} src={f.logo} alt=""/>)}</div>{profiles[r.address]?.avatar&&<img className="wk-trader-portrait" src={profiles[r.address].avatar} alt=""/>}<span className="wk-monument-rank">{String(r.rank).padStart(2,'0')}</span><span className="wk-card-edition">GIGAPROP<br/>{view==='weekly'?'WEEKLY / '+weekKey(currentWeekStart).slice(5):'SEASON SELECT / '+week.slice(5)}</span></div><div className="wk-wallet-name">{name(r)}{profiles[r.address]?.verifiedAt&&<ShieldCheck size={15}/>}</div><span className="wk-identity">{profiles[r.address]?.verifiedAt?'Wallet verified':profiles[r.address]?.editorial?'Featured trader':'Unclaimed wallet'}</span><TraderTag profile={profiles[r.address]}/><strong className="wk-podium-amount">{usd(r.total)}</strong><DailyChange row={r}/><Badges firms={r.firms}/><div className="wk-podium-foot"><span>{r.count} {r.count===1?'payout':'payouts'}</span><Spark row={r} start={start} duration={view==='weekly'?WEEK:seasonDuration(seasonStart)}/></div></div>)}</div>

 <div className="wk-table-title"><h2>{view==='weekly'?'WEEKLY TOP 20':'LEAGUE STANDINGS'} <span>{WEEKLY_FIRMS.find(f=>f.id===firm)?.name}</span></h2><label className="wk-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a wallet or claimed name" aria-label="Search payout wallets"/></label></div>
 <div className="wk-table"><div className="wk-table-head"><span>RANK</span><span>PAYOUT WALLET</span><span>FIRMS</span><span className="wk-daily-heading">24H MOMENTUM</span><span>{view==='weekly'?'WEEK PAYOUTS':'SEASON PAYOUTS'}</span><span/></div>{filtered.length?filtered.map(r=><div className="wk-row" role="button" tabIndex={0} key={r.address} onClick={()=>setSelected(r.address)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(r.address)}}}>{profiles[r.address]?.avatar&&<img className="wk-row-portrait" src={profiles[r.address].avatar} alt=""/>}<span className={'wk-rank '+(r.rank<=3?'wk-top-rank':'')}>{String(r.rank).padStart(2,'0')}</span><span className="wk-row-identity"><strong>{name(r)}{profiles[r.address]?.verifiedAt&&<ShieldCheck size={13}/>}</strong>{profiles[r.address]?.tag&&<TraderTag profile={profiles[r.address]} compact/>}<small>{traderWallets(r.address).length>1?traderWallets(r.address).length+' wallets combined':profiles[r.address]?short(r.address):'Claim this profile'} · {r.count} {r.count===1?'payout':'payouts'}</small></span><Badges firms={r.firms}/><DailyChange row={r}/><span className="wk-row-amount"><strong>{usd(r.total)}</strong></span><ChevronRight size={15}/></div>):<div className="wk-empty">{query?'No matching payout wallet in this edition.':'No eligible payouts in this period.'}</div>}</div>
</>:<div className="wk-empty"><RefreshCw size={20}/><h2>{busy?'Reading the payout record…':'This edition is unavailable'}</h2><p>{busy?'Reading the selected firm’s payout history.':computed?.missing?.join(', ')||(view==='weekly'?'A complete snapshot is needed before we can rank this week.':'A complete snapshot is needed before we can rank this season.')}</p><button onClick={()=>refresh.current()}>Refresh</button></div>}
 <section className="wk-claim-banner"><div className="wk-claim-mark"><ShieldCheck size={24}/></div><div><h2>YOUR RANK. YOUR REPUTATION.<br/><span>Put your name on the board.</span></h2><p>Sign the payout wallet for instant verification, or use withdrawal proof when the wallet cannot sign.</p></div><button onClick={()=>setClaim({address:''})}>Claim your profile <ArrowUpRight size={16}/></button></section>
 <NextMove league/>
 <details className="wk-method"><summary>How the rankings work <span>Transparent rules. Public evidence.</span></summary><div><h3>{view==='weekly'?'Money received this week':'Money received this season'}</h3><p>{view==='weekly'?'Weekly mode ranks eligible USDC received from Monday 00:00 UTC through the current data cutoff, capped at the Top 20. ':''}Ranked by eligible USDC sent from our tracked Vest, Breakout, Hypernova and Propr wallets, in calendar-quarter seasons. The extended launch season runs September 1 through December 31, 2026, ending January 1, 2027 at 00:00 UTC (exclusive). From 2027, seasons run January–March, April–June, July–September and October–December. Each firm refreshes directly from its tracked blockchain sources. Its standings use the oldest complete cutoff among that firm’s sources; other firms do not hold it back. Archived records preserve earlier season history. These are payout-recipient rankings, not trading PnL, ROI or a measure of skill.</p><h3>What is included</h3><p>Known internal firm wallets, identified bridges and transfers below 0.01 USDC are excluded. Refunds, affiliate payments, unidentified treasury transfers and custodial addresses may remain until their purpose is confirmed. Each entry exposes its transaction evidence. Equal totals are ordered by wallet address. The 24h USDC figure counts eligible payouts in the 24 hours ending at the displayed common data cutoff; it is not trading profit. Rank movement compares season-to-date standings with standings 24 hours earlier, within the selected firm filter and across all eligible wallets. NEW means no eligible payouts at the earlier cutoff. Rank movement is unavailable during the first 24 hours of a season. Closed editions show their final 24 hours.</p><h3>Wallets and names</h3><p>Each receiving address is one entry unless GIGAPROP explicitly groups multiple wallets under one owner-confirmed profile. Grouped profiles combine eligible payouts, payout counts and 24-hour changes across their listed wallets, supported chains and firms. Original receiving addresses and transactions remain visible. Grouping does not prove wallet control by signature. An address is not necessarily one person; shared or contract addresses can have different controllers. Wallet verified means a signature proved control on the listed chain at the verification time. It does not establish legal identity, firm endorsement or trading-account ownership. Profile submissions are reviewed manually by GIGAPROP against withdrawal confirmation and onchain payout records before publication. Submission does not automatically verify wallet control. Requested names and tags are subject to review. Featured names and social avatars are editorial mappings supplied by GIGAPROP; they do not receive a wallet-control badge without a signature. Unclaimed wallets remain eligible.</p><h3>Season editions</h3><p>Season records accumulate before source history rolls off. Closed editions preserve the recorded transactions; visible usernames may update as profiles are claimed. Historical editions at launch are reconstructed from available complete history. Rankings cover these four tracked firms only. No paid placement affects rank.</p><a href="mailto:gp@gigaprop.xyz?subject=Season%20leaderboard%20data%20correction">Report a data correction <ArrowUpRight size={13}/></a></div></details>
 {vestFrequency&&(firm==='all'||firm==='vest')&&<button className="wk-frequent" title={'Most eligible Vest payout transfers '+(view==='weekly'?'this week':'this season')+'. Equal counts are ordered by total USDC received, then wallet address.'} onClick={()=>{setFirm('vest');setSelected(vestFrequency.winner.address)}} aria-label={'View '+name(vestFrequency.winner)+', most Vest payouts '+(view==='weekly'?'this week':'this season')}>
 <img className="wk-frequent-mark" src="/brands/vest-symbol.svg" alt=""/>
 <span className="wk-frequent-copy"><span className="wk-frequent-kicker">VEST / SIDE QUEST{vestFrequency.ties>1?' / JOINT LEAD':''}</span><strong>Frequent Withdrawer.</strong><span className="wk-frequent-joke">The withdraw button knows them by name.</span></span>
 <span className="wk-frequent-person"><b>{name(vestFrequency.winner)}</b><span>{usd(vestFrequency.winner.total)} received · {view==='weekly'?'this week':'this season'}</span></span>
 <span className="wk-frequent-count"><b>{vestFrequency.winner.count.toLocaleString()}</b><span>individual payouts</span></span><ArrowUpRight size={17}/>
 </button>}
 <div className="wk-data-tools wk-data-footer" aria-live="polite"><div><span>{board?'Payout data as of '+new Date(board.asOf).toLocaleString():'Payout data unavailable'}{stale&&!board?.closed?' · awaiting a fresh snapshot':''}</span></div><button onClick={()=>refresh.current()} disabled={busy}><RefreshCw size={13}/>{busy?'Refreshing…':'Refresh payouts'}</button></div>
 {error&&<p className="wk-refresh-note" role="status">{error}</p>}
 <footer className="wk-footer"><a href="#">GP.</a><span>Public payouts. Independently ranked.</span><a href="#flow">Explore the evidence <ArrowUpRight size={13}/></a></footer>
 <dialog ref={dialog} className="wk-modal" onCancel={close} onClose={close}><button className="wk-close" onClick={close} aria-label="Close"><X size={20}/></button>
 {claim?<ClaimForm initialAddress={claim.address} onDone={close} onClaim={async raw=>{const address=raw.address?.toLowerCase();let social=null;try{social=await fetchXProfile(raw.username)}catch{}const profile={...raw,...social,address,...FEATURED_TRADERS[address]};setProfiles(v=>({...v,[address]:profile,...FEATURED_TRADERS}));setClaim(null);setSelected(address)}}/>:poster&&board?<><div ref={posterRef} className="wk-poster"><WeeklyPoster board={board} rows={ranked} profiles={profiles} firm={firm} person={poster.address?poster:null}/></div><button className="wk-primary" onClick={download} disabled={exporting}><Download size={15}/>{exporting?'Preparing PNG…':firm==='vest'&&!poster?.address?'Download top 100 JPG':'Download 3600px JPG'}</button></>:person?<><div className="wk-profile-label">{view==='weekly'?'WEEK RANK / '+weekKey(currentWeekStart):'SEASON RANK / '+week}</div>{profiles[person.address]?.avatar&&<img className="wk-profile-portrait" src={profiles[person.address].avatar} alt={profiles[person.address].displayName}/>}<div className="wk-profile-rank">#{String(person.rank).padStart(2,'0')}</div><h2>{profiles[person.address]?.displayName||name(person)}</h2>{profiles[person.address]?.username&&<span className="wk-profile-handle">@{profiles[person.address].username}</span>}<TraderTag profile={profiles[person.address]}/>{profiles[person.address]?.social&&<a className="wk-social" href={profiles[person.address].social} target="_blank" rel="noreferrer">View on X <ArrowUpRight size={12}/></a>}<div className="wk-profile-address">{traderWallets(person.address).length>1&&<strong>{traderWallets(person.address).length} wallets · combined payout record</strong>}{traderWallets(person.address).map(address=><div key={address}>{address}</div>)}</div><p className="wk-verification">{profiles[person.address]?.verifiedAt?<><ShieldCheck size={14}/> Wallet control verified · chain {profiles[person.address].chainId} · {new Date(profiles[person.address].verifiedAt).toLocaleDateString()}</>:profiles[person.address]?.editorial?'Featured by GIGAPROP · wallet ownership supplied by site owner':'Unclaimed wallet · public payout record'}</p><strong className="wk-profile-total">{usd(person.total)}</strong><DailyChange row={person}/><Badges firms={person.firms}/><div className="wk-profile-actions">{view==='season'&&<button onClick={()=>{setSelected(null);setPoster(person)}}><Download size={14}/> Rank card</button>}<button onClick={()=>copy(person.address)}>{copied?<Check size={14}/>:<Copy size={14}/>} Copy profile link</button><button onClick={()=>{setSelected(null);setClaim({address:person.address})}}><Wallet size={14}/>{profiles[person.address]?.verifiedAt?'Manage name':'Claim profile'}</button></div>{view==='season'&&<div className="wk-history"><h3>Previous editions</h3>{history===null?<p>Loading season record…</p>:history.length?history.map(h=><button key={h.week} onClick={()=>setWeek(h.week)}><span>{range(h.start)}</span><b>{!h.available?'Unavailable':h.row?'#'+h.row.rank+' · '+usd(h.row.total):'No eligible payouts'}</b></button>):<p>This is the earliest available edition.</p>}</div>}<h3 className="wk-evidence-title">Payout evidence <span>{person.count} transfers</span></h3><div className="wk-evidence">{person.transfers.map(t=><a key={t.id} href={t.explorer+'/tx/'+t.hash} target="_blank" rel="noopener noreferrer"><span>{WEEKLY_FIRMS.find(f=>f.id===t.firm)?.name}<small>{new Date(t.timestamp).toLocaleString()} · {t.chain}{traderWallets(person.address).length>1?' · to '+short(t.to):''}</small></span><b>{usd(t.amount)}</b><ArrowUpRight size={13}/></a>)}</div></>:selected?<div className="wk-empty">{busy?'Loading wallet…':'This wallet has no eligible payouts in the selected edition or filter.'}</div>:null}
 {profileError&&<p className="wk-alert">Profile names are temporarily unavailable. Wallet rankings are unaffected.</p>}{error&&<p className="wk-alert" role="status">{error}</p>}
 </dialog>
 </div></main>;
}
function ClaimForm({initialAddress,onDone,onClaim}){
 const [mode,setMode]=useState('wallet'),[address,setAddress]=useState(initialAddress||''),[twitter,setTwitter]=useState(''),[displayName,setDisplayName]=useState(''),[tag,setTag]=useState(''),[email,setEmail]=useState(''),[proof,setProof]=useState(''),[agree,setAgree]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[sent,setSent]=useState(false),[xProfile,setXProfile]=useState(null),[xBusy,setXBusy]=useState(false);
 const submitted=useRef(false);
 useEffect(()=>{const handle=cleanXHandle(twitter);if(!/^[A-Za-z0-9_]{1,15}$/.test(handle)){setXProfile(null);return}const c=new AbortController(),timer=setTimeout(()=>{setXBusy(true);fetchXProfile(handle,c.signal).then(p=>{if(!c.signal.aborted){setXProfile(p);if(p?.displayName&&!displayName)setDisplayName(p.displayName)}}).catch(()=>{}).finally(()=>{if(!c.signal.aborted)setXBusy(false)})},350);return()=>{clearTimeout(timer);c.abort()}},[twitter]);
 function submittedFrameLoaded(){
  if(!submitted.current)return;
  submitted.current=false;setBusy(false);setSent(true);setStatus('Submitted for review. GIGAPROP will check your withdrawal against the onchain record before publishing your profile.');
 }
 async function signClaim(e){
  e.preventDefault();if(!agree||busy)return;
  const handle=cleanXHandle(twitter).toLowerCase();
  if(!/^[a-z0-9_]{1,15}$/.test(handle)){setStatus('Enter a valid X handle.');return}
  setBusy(true);setStatus('Connecting payout wallet…');
  try{
   const wallet=window.ethereum;if(!wallet?.request)throw Error('A browser wallet is required for instant verification. Use withdrawal proof if this payout address cannot sign.');
   const accounts=await wallet.request({method:'eth_requestAccounts'}),account=accounts[0]?.toLowerCase();
   const expected=address.trim().toLowerCase();
   if(expected&&account!==expected)throw Error('Switch to the payout wallet shown on the leaderboard: '+expected);
   setAddress(account);
   const chainId=Number(await wallet.request({method:'eth_chainId'}));
   if(![1,8453,42161].includes(chainId))throw Error('Switch the wallet network to Ethereum, Base or Arbitrum.');
   setStatus('Preparing a one-time signature…');
   const r=await fetch(API+'/challenge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({address:account,username:handle,chainId})});
   const challenge=await r.json();if(!r.ok)throw Error(challenge.error||'Could not prepare the wallet claim.');
   setStatus('Sign the message. No transaction or token approval.');
   const hex='0x'+Array.from(new TextEncoder().encode(challenge.message),b=>b.toString(16).padStart(2,'0')).join('');
   const signature=await wallet.request({method:'personal_sign',params:[hex,account]});
   setStatus('Verifying wallet control…');
   const result=await fetch(API+'/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nonce:challenge.nonce,signature})});
   const d=await result.json();if(!result.ok)throw Error(d.error||'Could not verify the wallet claim.');
   const social=xProfile||await fetchXProfile(handle).catch(()=>null);
   setStatus('Verified. Publishing profile…');
   await onClaim?.({...d.profile,...social,username:d.profile?.username||handle,address:account});
  }catch(e){
   setStatus(e?.code===4001?'Signature cancelled. Nothing was changed.':e?.message||'Could not verify this wallet.');
  }finally{setBusy(false)}
 }
 async function submitProof(e){
  e.preventDefault();if(!agree||busy||sent)return;
  const form=e.currentTarget,input=form.elements.attachment,attachment=input?.files?.[0];
  if(form.elements._honey?.value)return;
  if(!attachment?.size){setStatus('Attach a screenshot of your Vest withdrawal confirmation email.');return;}
  if(attachment.size>10*1024*1024){setStatus('Please use an image under 10 MB.');return;}
  if(!['image/png','image/jpeg','image/webp'].includes(attachment.type)){setStatus('Use a PNG, JPG or WebP screenshot.');return;}
  setBusy(true);setStatus('Preparing your withdrawal proof…');
  try{
   const bitmap=await createImageBitmap(attachment);
   const maxSide=1800,scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
   const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Image conversion failed')),'image/jpeg',0.9));
   const safeName='gigaprop-withdrawal-'+Date.now()+'.jpg',safeFile=new File([blob],safeName,{type:'image/jpeg',lastModified:Date.now()});
   const transfer=new DataTransfer();transfer.items.add(safeFile);input.files=transfer.files;
   const addMeta=(name,value)=>{let hidden=form.querySelector('input[name="'+name+'"]');if(!hidden){hidden=document.createElement('input');hidden.type='hidden';hidden.name=name;form.appendChild(hidden)}hidden.value=String(value)};
   addMeta('attachment_filename',safeName);addMeta('attachment_bytes',safeFile.size);addMeta('attachment_type','image/jpeg');addMeta('original_attachment_type',attachment.type||'unknown');
   submitted.current=true;setStatus('Sending your screenshot and profile…');
   HTMLFormElement.prototype.submit.call(form);
  }catch{
   submitted.current=false;setBusy(false);setStatus('We could not prepare the screenshot. Please try a PNG or JPG image.');
  }
 }
 if(sent)return <div className="wk-claim-form wk-submission wk-submission-success" role="status" aria-live="polite"><div className="wk-success-mark"><Check size={32}/></div><span className="wk-profile-label">PROFILE CLAIM / RECEIVED</span><h2>Submission received.</h2><p>Your proof is in. GIGAPROP will cross-check it against the public payout record before publishing.</p><div className="wk-success-wallet"><span>Submitted wallet</span><strong>{address?short(address.trim().toLowerCase()):'—'}</strong></div><p className="wk-claim-note">Wallet-signature claims publish instantly. Screenshot claims stay available for custodial or non-signing payout addresses.</p><button className="wk-primary wk-success-done" type="button" onClick={onDone}><Check size={16}/> Done</button></div>;
 return <div className="wk-claim-shell"><ShieldCheck size={30}/><span className="wk-profile-label">CLAIM YOUR PROFILE</span><h2>Put your name on it.</h2><p className="wk-claim-intro">Use the payout wallet for instant verification. If that address cannot sign, use the withdrawal confirmation route.</p>
 <div className="wk-claim-tabs"><button type="button" className={mode==='wallet'?'active':''} onClick={()=>{setMode('wallet');setStatus('')}}><Wallet size={14}/> Wallet signature <span>Instant</span></button><button type="button" className={mode==='proof'?'active':''} onClick={()=>{setMode('proof');setStatus('')}}><ShieldCheck size={14}/> Withdrawal proof <span>Fallback</span></button></div>
 {mode==='wallet'?<form className="wk-claim-form wk-submission" onSubmit={signClaim}>
  <div className="wk-route-note"><strong>Cryptographic claim.</strong><span>No payment. No token approval. A message signature proves control of the payout wallet.</span></div>
  <label>Payout wallet address<input required={!!initialAddress} pattern="0x[a-fA-F0-9]{40}" maxLength={42} value={address} disabled={busy} onChange={e=>setAddress(e.target.value.trim())} placeholder="0x…"/></label>
  <label>Twitter / X @<input required pattern="@?[A-Za-z0-9_]{1,15}" maxLength={16} value={twitter} disabled={busy} onChange={e=>setTwitter(e.target.value)} placeholder="@yourhandle" autoComplete="off"/></label>
  {(xBusy||xProfile)&&<div className="wk-x-preview">{xProfile?.avatar&&<img src={xProfile.avatar} alt=""/>}<span><strong>{xBusy?'Reading X profile…':xProfile?.displayName}</strong>{xProfile&&<small>@{xProfile.username}</small>}</span>{xProfile&&<Check size={15}/>}</div>}
  <p className="wk-claim-note">Your X display name and profile photo are pulled from the public X profile. The @handle is the profile identity stored with the wallet claim.</p>
  <label className="wk-consent"><input type="checkbox" required checked={agree} disabled={busy} onChange={e=>setAgree(e.target.checked)}/>I want this X profile publicly linked to this payout wallet and its payout history.</label>
  <button className="wk-primary" disabled={!agree||busy} type="submit">{busy?'Verifying…':'Connect wallet & claim'}<ArrowUpRight size={15}/></button>
  <p role="status" className="wk-claim-status">{status}</p>
 </form>:<><iframe name="gigaprop-claim-submit" title="Profile claim submission" className="wk-claim-submit-frame" onLoad={submittedFrameLoaded}/>
 <form className="wk-claim-form wk-submission" onSubmit={submitProof} action="https://formsubmit.co/gp@gigaprop.xyz" method="POST" target="gigaprop-claim-submit" encType="multipart/form-data">
  <div className="wk-route-note"><strong>For wallets that cannot sign.</strong><span>Use a Vest withdrawal confirmation and the receiving address.</span></div>
  <input name="_honey" type="text" tabIndex={-1} autoComplete="off" style={{display:'none'}} aria-hidden="true"/>
  <input type="hidden" name="_captcha" value="false"/><input type="hidden" name="_subject" value={'GIGAPROP VEST PROFILE REVIEW — @'+cleanXHandle(twitter)}/><input type="hidden" name="source" value="gigaprop.xyz/#leaderboard"/><input type="hidden" name="consent" value="I agree to publication of the approved profile details and payout wallet."/><input type="hidden" name="payout_wallet" value={address.trim().toLowerCase()}/><input type="hidden" name="twitter" value={'@'+cleanXHandle(twitter)}/><input type="hidden" name="display_name" value={(xProfile?.displayName||displayName).trim()}/><input type="hidden" name="tag" value={tag.trim()}/><input type="hidden" name="email" value={email.trim()}/><input type="hidden" name="withdrawal_confirmation" value={proof.trim()}/>
  <label>Payout wallet address<input required pattern="0x[a-fA-F0-9]{40}" maxLength={42} value={address} disabled={busy||sent} onChange={e=>setAddress(e.target.value.trim())} placeholder="0x…" autoComplete="off"/></label>
  <label>Contact email<input required type="email" maxLength={254} value={email} disabled={busy||sent} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
  <label>Twitter / X @<input required pattern="@?[A-Za-z0-9_]{1,15}" maxLength={16} value={twitter} disabled={busy||sent} onChange={e=>setTwitter(e.target.value)} placeholder="@yourhandle" autoComplete="off"/></label>
  {(xBusy||xProfile)&&<div className="wk-x-preview">{xProfile?.avatar&&<img src={xProfile.avatar} alt=""/>}<span><strong>{xBusy?'Reading X profile…':xProfile?.displayName}</strong>{xProfile&&<small>@{xProfile.username}</small>}</span>{xProfile&&<Check size={15}/>}</div>}
  <label>Desired display name <small>optional override</small><input maxLength={40} value={displayName} disabled={busy||sent} onChange={e=>setDisplayName(e.target.value)} placeholder={xProfile?.displayName||'Pulled from X'}/></label>
  <label>Desired tag <small>optional</small><input maxLength={40} value={tag} disabled={busy||sent} onChange={e=>setTag(e.target.value)} placeholder="#YOURGANG or yourbrand.com"/></label>
  <label>Withdrawal email screenshot<input name="attachment" type="file" required accept="image/png,image/jpeg,image/webp" disabled={busy||sent}/><small>PNG, JPG or WebP · compacted automatically · up to 10 MB</small></label>
  <label>Additional payout details <small>optional</small><textarea maxLength={5000} rows={4} value={proof} disabled={busy||sent} onChange={e=>setProof(e.target.value)} placeholder="Amount, date, receiving address, or transaction hash."/></label>
  <label className="wk-consent"><input type="checkbox" required checked={agree} disabled={busy||sent} onChange={e=>setAgree(e.target.checked)}/>I agree to my approved X profile, tag and payout address appearing publicly.</label>
  <button className="wk-primary" disabled={!agree||busy||sent} type="submit">{busy?'Submitting…':'Submit withdrawal proof'}<ArrowUpRight size={15}/></button>
  <p className="wk-claim-note">This fallback currently enters GIGAPROP review. The instant route above is the fastest path whenever the payout wallet can sign.</p><p role="status" className="wk-claim-status">{status}</p>
 </form></>}</div>;
}
