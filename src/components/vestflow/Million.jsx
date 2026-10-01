import {useEffect,useRef,useState} from 'react';
import {ArrowUpRight,ArrowLeft,Download,RefreshCw} from 'lucide-react';
import {VEST_CHAINS} from '../../lib/flow-config.js';
import {fetchFlow} from '../../lib/flow-data.js';
import {combineFlows} from '../../lib/flow-metrics.js';
import {vestMilestone} from '../../lib/vest-milestone.js';
import './million.css';
const money=n=>new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
export default function Million(){
 const [data,setData]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(null);
 const refresh=useRef(()=>{});
 useEffect(()=>{
  const controller=new AbortController();let running=false,previous=[];
  const title=document.title;document.title='One million · Vest × GIGAPROP';
  fetch('/data/vest-million.json',{cache:'no-store',signal:controller.signal}).then(r=>r.ok?r.json():null).then(d=>{if(d?.crossing)setSaved(d.crossing)}).catch(()=>{});
  async function run(){
   if(running||controller.signal.aborted)return;running=true;setBusy(true);
   try{
    if(!previous.length){previous=await Promise.all(VEST_CHAINS.map(async c=>{
     for(const root of ['https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/','/data/']){
      try{const r=await fetch(root+c.slug+'.json?t='+Date.now(),{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(12000)])});if(!r.ok)continue;const d=await r.json();if(d.complete&&d.wallet===c.wallet&&d.chain===c.chain&&d.token===c.token)return d;}catch{}
     }return null;
    }));if(previous.every(Boolean))setData(combineFlows(previous,VEST_CHAINS));}
    const fresh=await Promise.all(VEST_CHAINS.map((c,i)=>fetchFlow(c,{previous:previous[i],signal:AbortSignal.any([controller.signal,AbortSignal.timeout(55000)])})));
    if(!controller.signal.aborted){previous=fresh;setData(combineFlows(fresh,VEST_CHAINS));setError('');}
   }catch{if(!controller.signal.aborted)setError('Live refresh delayed. Showing the last available snapshot.');}
   finally{running=false;if(!controller.signal.aborted)setBusy(false);}
  }
  refresh.current=run;run();const timer=setInterval(()=>{if(document.visibilityState==='visible')run()},60000);
  const visible=()=>{if(document.visibilityState==='visible')run()};document.addEventListener('visibilitychange',visible);
  return()=>{controller.abort();clearInterval(timer);document.removeEventListener('visibilitychange',visible);document.title=title};
 },[]);
 const result=data?vestMilestone(data,VEST_CHAINS):null,crossing=saved||result?.crossing;
 const address=crossing?.to;
 async function download(){
  await document.fonts.ready;
  const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=1500;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#090c0b';ctx.fillRect(0,0,2000,1500);
  ctx.strokeStyle='#29342c';ctx.lineWidth=2;ctx.strokeRect(60,60,1880,1380);
  const text=(s,x,y,size,color='#f3f5f0',weight=400,font='Manrope')=>{ctx.font=weight+' '+size+'px '+font;ctx.fillStyle=color;ctx.fillText(s,x,y)};
  const line=y=>{ctx.beginPath();ctx.moveTo(120,y);ctx.lineTo(1880,y);ctx.stroke()};
  text('GP.',120,170,66,'#f3f5f0',800);text('VESTMARKETS',1470,160,32,'#aab7a3',500);line(220);
  text(crossing?'THE FIRST MILLION.':'THE ROAD TO ONE MILLION.',120,355,25,'#b6ff4a',500);
  text('$1,000,000',110,620,230,'#f3f5f0',800);
  text('30-day payout flow',125,695,40,'#aab7a3');line(780);
  text(crossing?'THE CROSSING WALLET':'CROSSING WALLET / AWAITING THE MILESTONE',120,875,23,'#aab7a3',500);
  text(address||'To be recorded onchain.',120,962,address?43:55,'#f3f5f0',500,address?'monospace':'Manrope');
  text(crossing?'+'+money(crossing.amount)+' USDC  /  '+crossing.chain:'PREVIEW — milestone not yet confirmed',120,1040,29,'#b6ff4a',500);
  if(crossing){text(new Date(crossing.timestamp).toISOString(),120,1100,22,'#aab7a3');text(crossing.hash,120,1155,21,'#aab7a3',400,'monospace');}
  line(1250);text('Independently tracked by GIGAPROP',120,1320,26,'#aab7a3');text('gigaprop.xyz/#1milli',1440,1320,24,'#f3f5f0');
  text('Tracked USDC outflow · known internal wallets, bridges and dust excluded.',120,1380,19,'#879581');
  canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=crossing?'vest-one-million-certificate.png':'vest-one-million-preview.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)},'image/png');
 }
 return <main className="mm"><div className="mm-shell">
 <nav className="mm-nav"><a className="mm-brand" href="#">GP.</a><span>MILESTONES / 001</span><a href="#vestflow"><ArrowLeft size={13}/> Vestflow</a></nav>
 <div className="mm-intro"><span>VESTMARKETS × GIGAPROP</span><p>A million. One payout at a time.</p></div>
 <section className="mm-certificate">
 <header><span><img src="/brands/vest.ico" alt=""/> vest<span className="mm-light">markets</span></span><small>{crossing?'MILESTONE RECORDED':'THE ROAD TO ONE MILLION'}</small></header>
 <div className="mm-hero"><span className="mm-kicker">{crossing?'ONE MILLION. ONCHAIN.':'NEXT MILESTONE'}</span><h1>$1,000,000<span>.</span></h1><p>30-day payout flow</p></div>
 <div className="mm-recipient"><span className="mm-kicker">{crossing?'THE CROSSING WALLET':'THE CROSSING WALLET / PENDING'}</span>
 {address?<a className="mm-address" href={crossing.explorer+'/address/'+address} target="_blank" rel="noopener noreferrer">{address}<ArrowUpRight size={16}/></a>:<p className="mm-await">The next chapter has an address<span>.</span></p>}
 {crossing?<div className="mm-proof"><strong>+{money(crossing.amount)} USDC</strong><span>{crossing.chain}</span><a href={crossing.explorer+'/tx/'+crossing.hash} target="_blank" rel="noopener noreferrer">View the transaction <ArrowUpRight size={12}/></a></div>:<p className="mm-sub">Recorded here when the tracked total crosses $1 million.</p>}
 </div>
 <footer><b>GP.</b><span>Independently tracked.<br/><strong>GIGAPROP</strong></span><span className="mm-edition">VEST / 001<br/>USDC · 30 DAYS</span></footer>
 </section>
 <div className="mm-live"><div><span>{crossing?'TOTAL AT CROSSING':'TRACKED NOW'}</span><strong>{crossing?'$'+money(crossing.after):result?'$'+money(result.total):'—'}</strong></div><div><span>{crossing?'CROSSING PAYOUT':'TO THE MILESTONE'}</span><strong>{crossing?'$'+money(crossing.amount):result?'$'+money(Math.max(0,1000000-result.total)):'—'}</strong></div><button onClick={()=>refresh.current()} disabled={busy} aria-label="Refresh milestone"><RefreshCw size={16}/></button></div>
 <div className="mm-actions"><button onClick={download}><Download size={15}/>{crossing?'Download certificate':'Download preview'} <small>PNG / 2000 × 1500</small></button><a href="#vestflow">Explore Vestflow <ArrowUpRight size={14}/></a></div>
 <p className="mm-note" role="status">{error||'Refreshes every 60 seconds while this page is open.'}{data&&' Snapshot: '+new Date(data.updatedAt).toLocaleString()+'.'}</p>
 <p className="mm-note">Rolling 30-day tracked USDC outflow across Vest’s three wallets. Known internal wallets, bridges and dust excluded. Recipient identity is not independently verified. This is payout-wallet activity, not total firm finances or evaluation sales.</p>
 </div></main>;
}
