import {useMemo,useRef,useState} from 'react';
import {Download} from 'lucide-react';
import {VEST_CHAINS} from '../../lib/flow-config.js';
import {millionJourney} from '../../lib/million-journey.js';
import './million-journey.css';
const usd=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const date=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).toUpperCase();
export default function MillionJourney({data,crossing}){
 const map=useMemo(()=>millionJourney(data,VEST_CHAINS,crossing),[data,crossing]);
 const poster=useRef(null);const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function download(){
  if(busy||!poster.current)return;setBusy(true);setError('');
  try{
   const {toBlob}=await import('html-to-image');await document.fonts.ready;
   const blob=await toBlob(poster.current,{pixelRatio:6000/poster.current.getBoundingClientRect().width,backgroundColor:'#0c0e0c'});
   if(!blob)throw Error('No image');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vest-million-master.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch{setError('Download failed. Please try again.');}finally{setBusy(false);}
 }
 if(!map)return <section className="mj-loading">Preparing the million-dollar master image…</section>;
 const {points,total,start,end}=map,max=Math.max(1000000,total)*1.08;
 const x=p=>76+(p.time-start)/(end-start)*1028,y=n=>805-n/max*410;
 let path='M76,805';for(const p of points)path+=` H${x(p).toFixed(2)} V${y(p.total).toFixed(2)}`;
 const last=points.at(-1),largest=points.reduce((a,b)=>!a||b.amount>a.amount?b:a,null);
 const columns=96,tileRows=Math.ceil(points.length/columns),tileTop=1070,bottom=tileTop+tileRows*11.0+75,height=bottom+135;
 return <section className="mj-section">
 <div className="mj-poster" ref={poster}>
 <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 1200 ${height}`} role="img" aria-label={`Road to a million. ${points.length} individual payouts, ${usd(total)} in tracked USDC outflow from ${date(start)} to ${date(end)}. Every payout appears as a dot on the cumulative trail and as a tile below.`}>
 <defs>
 <linearGradient id="mj-bg" x2="1" y2="1"><stop stopColor="#1b180f"/><stop offset=".55" stopColor="#0c0f0d"/><stop offset="1" stopColor="#090b0a"/></linearGradient>
 <linearGradient id="mj-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff2cb"/><stop offset=".5" stopColor="#dfc18a"/><stop offset="1" stopColor="#8e713c"/></linearGradient>
 <linearGradient id="mj-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d9ad5a" stopOpacity=".22"/><stop offset="1" stopColor="#d9ad5a" stopOpacity="0"/></linearGradient>
 <radialGradient id="mj-halo"><stop stopColor="#c19747" stopOpacity=".19"/><stop offset="1" stopColor="#c19747" stopOpacity="0"/></radialGradient>
 <filter id="mj-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
 </defs>
 <rect width="1200" height={height} fill="url(#mj-bg)"/><ellipse cx="960" cy="470" rx="620" ry="510" fill="url(#mj-halo)"/>
 <rect x="24" y="24" width="1152" height={height-48} rx="3" fill="none" stroke="#b997513b"/>
 <g fill="#beaa7d" fontFamily="DM Mono,monospace" fontSize="12" letterSpacing="2"><text x="76" y="83">VEST MARKETS <tspan fill="#6c5e44"> × </tspan> GIGAPROP</text><text x="1124" y="83" textAnchor="end">MILLION / 001</text></g>
 <line x1="76" x2="1124" y1="111" y2="111" stroke="#bca06c30"/>
 <text x="73" y="224" fill="#eee7d7" fontSize="93" fontWeight="600" letterSpacing="-6">The road to</text>
 <text x="68" y="351" fill="url(#mj-gold)" fontSize="144" fontWeight="800" letterSpacing="-10">$1,000,000<tspan fontSize="90">.</tspan></text>
 <g fontFamily="DM Mono,monospace" fontSize="12" letterSpacing="2" fill="#b9a47b"><text x="78" y="394">30 DAYS. {points.length.toLocaleString()} PAYOUTS. EVERY SINGLE ONE.</text><text x="1124" y="394" textAnchor="end">{crossing?'MILESTONE REACHED':'THE APPROACH'}</text></g>
 {[0,250000,500000,750000,1000000].map(n=><g key={n}><line x1="76" x2="1104" y1={y(n)} y2={y(n)} stroke={n===1000000?'#dac18a70':'#ffffff0d'} strokeDasharray={n===1000000?'4 7':undefined}/><text x="1122" y={y(n)+4} fill={n===1000000?'#ead4a4':'#8e8778'} fontFamily="DM Mono,monospace" fontSize="11">{n===1000000?'$1M':n?'$'+n/1000+'K':'$0'}</text></g>)}
 <path d={`${path} H1104 V805 Z`} fill="url(#mj-fill)"/>
 {points.map(p=><line key={p.id} x1={x(p)} x2={x(p)} y1={y(p.total)} y2="805" stroke="#d9b56f" strokeOpacity=".065" strokeWidth=".65"/>)}
 <path d={path} fill="none" stroke="#e1bd73" strokeWidth="7" opacity=".45" filter="url(#mj-glow)"/>
 <path d={path} fill="none" stroke="url(#mj-gold)" strokeWidth="1.8"/>
 {points.map(p=><circle key={p.id} cx={x(p)} cy={y(p.total)} r={Math.min(5,1.2+Math.sqrt(p.amount)/70)} fill="#f6dfaa" opacity=".8"/>)}
 {last&&<g><circle cx={x(last)} cy={y(last.total)} r="23" fill="#f5d391" opacity=".09"/><circle cx={x(last)} cy={y(last.total)} r="12" fill="#f5d391" opacity=".18"/><circle cx={x(last)} cy={y(last.total)} r="5" fill="#fff1cc"/></g>}
 {[0,6,12,18,24,30].map(d=><g key={d}><line x1={76+d/30*1028} x2={76+d/30*1028} y1="815" y2="822" stroke="#82704f"/><text x={76+d/30*1028} y="846" textAnchor={d===0?'start':d===30?'end':'middle'} fill="#a79a80" fontFamily="DM Mono,monospace" fontSize="12">{date(start+d*86400000)}</text></g>)}
 <text x="76" y="883" fill="#8e826c" fontFamily="DM Mono,monospace" fontSize="11" letterSpacing="1">CUMULATIVE USDC OUTFLOW · EACH POINT IS ONE PAYOUT · TIME IN UTC</text>
 <line x1="76" x2="1124" y1="914" y2="914" stroke="#bca06c35"/>
 {[{value:usd(total),label:crossing?'AT THE CROSSING':'TRACKED OUTFLOW'},{value:points.length.toLocaleString(),label:'INDIVIDUAL PAYOUTS'},{value:map.wallets.toLocaleString(),label:'RECIPIENT WALLETS'},{value:usd(largest?.amount||0),label:'LARGEST PAYOUT'}].map((s,i)=><g key={s.label}><text x={76+i*275} y="969" fill="#e9d3a3" fontSize={i===0?35:39} letterSpacing="-1.8">{s.value}</text><text x={76+i*275} y="997" fill="#9e8e70" fontFamily="DM Mono,monospace" fontSize="10" letterSpacing="1.1">{s.label}</text></g>)}
 <text x="76" y="1048" fill="#bfaa7b" fontFamily="DM Mono,monospace" fontSize="11" letterSpacing="1.3">EVERY PAYOUT LEAVES A MARK.</text><text x="1124" y="1048" textAnchor="end" fill="#85765a" fontFamily="DM Mono,monospace" fontSize="10">CHRONOLOGICAL · FIRST TO LAST</text>
 {points.map((p,i)=><rect key={p.id} x={76+(i%columns)*11} y={tileTop+Math.floor(i/columns)*11} width="8" height="8" rx=".5" fill="#ebca8a" opacity={.2+.8*Math.sqrt(p.amount/(largest?.amount||1))}/>)}
 <text x="76" y={bottom-35} fill="#91836b" fontFamily="DM Mono,monospace" fontSize="10">ONE TILE = ONE PAYOUT. BRIGHTER = LARGER AMOUNT. NO SAMPLING.</text>
 <text x="1124" y={bottom-35} textAnchor="end" fill="#91836b" fontFamily="DM Mono,monospace" fontSize="10">{map.complete?'COMPLETE 30-DAY WINDOW':'AVAILABLE HISTORY · INCOMPLETE WINDOW'}</text>
 <line x1="76" x2="1124" y1={bottom} y2={bottom} stroke="#bca06c35"/>
 <text x="76" y={bottom+65} fill="#d9bd81" fontSize="47" fontWeight="800" letterSpacing="-4">GP.</text>
 <g fontFamily="DM Mono,monospace" fontSize="10" fill="#a18f6b"><text x="178" y={bottom+46} letterSpacing="2">INDEPENDENTLY TRACKED.</text><text x="178" y={bottom+67}>Known internal wallets, bridges and dust excluded.</text><text x="1124" y={bottom+46} textAnchor="end">gigaprop.xyz/#1milli</text><text x="1124" y={bottom+67} textAnchor="end">{new Date(end).toISOString().replace('T',' ').slice(0,16)} UTC</text></g>
 </svg>
 </div>
 <div className="mm-actions"><button className="mm-download" onClick={download} disabled={busy||!points.length}><Download size={15}/>{busy?'Preparing master image…':'Download master image'}<small>6000 PX PNG</small></button><span className="mj-export-note">The complete picture. Every payout.</span></div>
 {error&&<p role="status" className="mm-note">{error}</p>}
 </section>;
}
