import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  SlidersHorizontal,
  X
} from "lucide-react";
import { firms, shortBalance } from "./firmCatalog";
import SpeedManifesto from "./SpeedManifesto";
import { executionMetrics } from "./executionMetrics";
import "./web3-hub.css";
import "./speed-manifesto.css";
import "./comparison-deck.css";

const OUTCOME_TARGET = 10;
const RISK_BUDGET = 3;
const NQ_REFERENCE = 27000;
const points = n => n == null ? "—" : new Intl.NumberFormat("en-US",{maximumFractionDigits:1}).format(n);
const percent = n => n == null ? "Unavailable" : Number(n.toFixed(3)) + "%";
const CORE_FIRM_IDS = ["vest","hypernova","propr","breakout","vanta"];
const coreFirms = CORE_FIRM_IDS.map(id=>firms.find(f=>f.id===id)).filter(Boolean);

const marketProfiles = {indices:{label:"NQ"},crypto:{label:"BTC"}};
const marketLeverage = {
  vest:{indices:50,crypto:10}, hypernova:{indices:10,crypto:5},
  propr:{indices:10,crypto:10}, breakout:{indices:10,crypto:10},
  vanta:{indices:2.5,crypto:1.5}
};
// Per-side taker percentages. Snapshot inputs, not a live quote feed.
const takerFees = {
  indices:{vest:.0025,hypernova:.005,propr:.009,breakout:.04,vanta:0},
  crypto:{vest:.01,hypernova:.04,propr:.045,breakout:.04,vanta:.03}
};

const cardSignals = {
  vest:{
    value:"50x",
    label:"NQ leverage",
    tone:"leverage",
    edge:"50x NQ gives materially more notional per unit of margin."
  },
  hypernova:{
    value:"~6s",
    label:"Avg. payout*",
    tone:"speed",
    edge:"Firm-published average payout time is measured in seconds."
  },
  propr:{
    value:"SUPPORT",
    label:"Hands-on team",
    tone:"infra",
    edge:"Strong hands-on support is the standout."
  },
  breakout:{
    value:"$60M+",
    label:"Paid to traders",
    tone:"price",
    edge:"Kraken-backed with a large public payout history."
  },
  vanta:{
    value:"$1M",
    label:"Pro scaling",
    tone:"split",
    edge:"Pro accounts can scale to very large balances."
  }
};

function money(n){
  if(n==null) return "—";
  const decimals=Number.isInteger(Number(n))?0:2;
  return new Intl.NumberFormat("en-US",{
    style:"currency",
    currency:"USD",
    minimumFractionDigits:decimals,
    maximumFractionDigits:2
  }).format(n);
}

function pctNumber(value){
  const m=String(value??"").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function defaultProgram(firm){
  return firm.programs.find(p=>p.id===firm.defaultProgram) || firm.programs[0];
}

function firstToken(value){
  return String(value??"—").split(" ")[0];
}

function FirmLogo({firm,className=""}) {
  const [failed,setFailed]=useState(false);
  return <span className={"gp-logo gp-logo-"+firm.id+" "+className+(failed?" is-fallback":"")} aria-hidden="true">
    {failed ? <span className="gp-logo-fallback">{firm.mark}</span> : <img src={firm.logo} alt="" loading="lazy" onError={()=>setFailed(true)}/>}
  </span>;
}

function FirmCard({firm,onOpen,index}){
  const program=defaultProgram(firm);
  const signal=cardSignals[firm.id] || {value:"WEB3",label:"PROP",tone:"default"};


  return <article
    className={"firm-card firm-card-"+firm.id}
    data-tone={signal.tone}
    style={{"--deck-index":index}}
  >
    <div className="firm-card-glow"/>
    <div className="firm-card-head">
      <div className="firm-card-brand">
        <FirmLogo firm={firm}/>
        <div><h3>{firm.name}</h3></div>
      </div>

      <a href={firm.url} target="_blank" rel={firm.referral?"sponsored noopener noreferrer":"noopener noreferrer"} onClick={e=>e.stopPropagation()} aria-label={"Visit "+firm.name}>
        <ArrowUpRight size={16}/>
      </a>
    </div>

    <div className="firm-card-signal">
      <div className="firm-card-caption"><span>{signal.label}</span>{firm.id==="vest" && <small>MY PICK</small>}</div>
      <strong>{signal.value}</strong>
      <span className="firm-card-trace" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></span>
    </div>

    <div className="firm-card-stats">
      <div><span>25K ENTRY</span><b>{money(firm.price)}</b></div>
      <div><span>MAX DD</span><b>{firstToken(program.drawdown)}</b></div>
      <div><span>SPLIT</span><b>{firstToken(firm.id==="vanta"?firm.split:program.split)}</b></div>
    </div>

    <button type="button" className="firm-card-foot" onClick={()=>onOpen(firm.id)} aria-label={"Open "+firm.name+" program details"}>
      <span>{firm.id==="hypernova"?"*Firm-published · Details":"Explore programs"}</span>
      <ChevronRight size={16}/>
    </button>
  </article>;
}

function FirmDrawer({firm,onClose}){
  const drawerRef=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    drawerRef.current?.querySelector('button')?.focus();
    const handleKey=(e)=>{
      if(e.key==="Escape") onClose();
      if(e.key!=="Tab") return;
      const nodes=[...drawerRef.current.querySelectorAll('button:not(:disabled), a[href]')];
      const first=nodes[0],last=nodes.at(-1);
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown',handleKey);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',handleKey);previous?.focus();};
  },[]);
  const initial=defaultProgram(firm);
  const [programId,setProgramId]=useState(initial.id);
  const [sizeIndex,setSizeIndex]=useState(()=>{
    const idx=initial.sizes.findIndex(s=>s.balance===25000 && !s.disabled);
    return idx>=0?idx:Math.max(0,initial.sizes.findIndex(s=>!s.disabled));
  });

  const program=firm.programs.find(p=>p.id===programId) || initial;
  const size=program.sizes[Math.min(sizeIndex,program.sizes.length-1)] || program.sizes[0];

  function selectProgram(id){
    const next=firm.programs.find(p=>p.id===id) || firm.programs[0];
    setProgramId(next.id);
    const preferred=next.sizes.findIndex(s=>s.balance===25000 && !s.disabled);
    const firstLive=next.sizes.findIndex(s=>!s.disabled);
    setSizeIndex(preferred>=0?preferred:Math.max(0,firstLive));
  }

  return <div className="firm-drawer-shell" role="dialog" aria-modal="true" aria-label={firm.name+" details"} onClick={onClose}>
    <aside ref={drawerRef} className="firm-drawer" onClick={e=>e.stopPropagation()}>
      <div className="firm-drawer-top">
        <div className="firm-drawer-brand"><FirmLogo firm={firm}/><div><span>{firm.status}</span><h2>{firm.name}</h2></div></div>
        <button type="button" onClick={onClose} aria-label="Close firm details"><X size={18}/></button>
      </div>

      <p className="firm-drawer-note">{firm.note}</p>

      <div className="firm-drawer-tabs" aria-label="Programs">
        {firm.programs.map(p=><button type="button" key={p.id} aria-pressed={p.id===program.id} className={p.id===program.id?"is-active":""} onClick={()=>selectProgram(p.id)}>
          <span>{p.label}</span><small>{p.badge}</small>
        </button>)}
      </div>

      <div className="firm-drawer-sizes">
        <span>ACCOUNT</span>
        <div>{program.sizes.map((s,i)=><button
          type="button"
          key={(s.balance??"na")+"-"+i}
          disabled={s.disabled}
          aria-pressed={i===sizeIndex} className={i===sizeIndex?"is-active":""}
          onClick={()=>setSizeIndex(i)}
        >{s.balance!=null?shortBalance(s.balance):"—"}</button>)}</div>
      </div>

      <div className="firm-drawer-price">
        <span>ENTRY · {size?.balance!=null?shortBalance(size.balance):"—"}</span>
        <strong>{size?.fee!=null?money(size.fee):(size?.feeLabel||"—")}</strong>
        {size?.listFee!=null && <small>LIST {money(size.listFee)}</small>}
      </div>

      <div className="firm-drawer-grid">
        <div><span>TARGET</span><strong>{program.target}</strong></div>
        <div><span>MAX DD</span><strong>{program.drawdown}</strong></div>
        <div><span>DAILY</span><strong>{program.daily}</strong></div>
        <div><span>SPLIT</span><strong>{program.split}</strong></div>
        <div><span>LEVERAGE</span><strong>{program.leverage}</strong></div>
        <div><span>PAYOUT</span><strong>{program.payout}</strong></div>
      </div>

      <div className="firm-drawer-meta">
        <div><span>MIN DAYS</span><strong>{program.minDays}</strong></div>
        <div><span>TIME LIMIT</span><strong>{program.timeLimit}</strong></div>
        <div><span>VENUE</span><strong>{firm.venue}</strong></div>
      </div>

      <div className="firm-drawer-tags">
        {[...(program.tags||[]),...(program.extras||[])].map(tag=><span key={tag}>{tag}</span>)}
      </div>

      <a className="firm-drawer-cta" href={firm.url} target="_blank" rel={firm.referral?"sponsored noopener noreferrer":"noopener noreferrer"}>
        {firm.id==="vest"?"Open Vest · 5% off":"Open "+firm.name} <ArrowUpRight size={16}/>
      </a>
      {firm.referral && <p className="firm-drawer-note">Referral link. I may earn a commission.{firm.id==="vest"?" 5% off through this link.":""}</p>}
    </aside>
  </div>;
}

function CompactMatrix(){
  return <details className="raw-matrix">
    <summary><span><SlidersHorizontal size={14}/> Compare all rules</span><small>+</small></summary>
    <div className="gp-matrix-wrap"><table className="gp-matrix"><thead><tr>
      <th>Firm</th><th>25K</th><th>Default</th><th>Target</th><th>Daily</th><th>Max DD</th><th>Split</th><th>NQ</th><th>Payout</th>
    </tr></thead><tbody>
      {coreFirms.map(f=>{
        const p=defaultProgram(f);
        return <tr key={f.id}><td className="gp-matrix-name">{f.name}</td><td>{money(f.price)}</td><td>{f.plan}</td><td>{p.target}</td><td>{p.daily}</td><td>{p.drawdown}</td><td>{p.split}</td><td>{f.indexLev?f.indexLev+"x":"—"}</td><td>{p.payout}</td></tr>;
      })}
    </tbody></table></div>
  </details>;
}

export default function Web3Hub(){
  const [detailId,setDetailId]=useState(null);

  const [sort,setSort]=useState("signal");
  const [nqPrice,setNqPrice]=useState(NQ_REFERENCE);
  const asset="indices";

  const visibleFirms=useMemo(()=>{
    let list=[...coreFirms];
    if(sort==="entry") list.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
    if(sort==="leverage") list.sort((a,b)=>(b.indexLev||0)-(a.indexLev||0));
    if(sort==="dd") list.sort((a,b)=>(pctNumber(b.drawdown)||0)-(pctNumber(a.drawdown)||0));
    return list;
  },[sort]);

  const feeRows=useMemo(()=>coreFirms.map(f=>{
    const fee=takerFees[asset][f.id] ?? null;
    const leverage=marketLeverage[f.id]?.[asset] ?? null;
    return {...f,fee,marketLev:leverage,...executionMetrics(fee,leverage,OUTCOME_TARGET)};
  }).sort((a,b)=>{
    if(a.requiredMove==null && b.requiredMove==null) return a.name.localeCompare(b.name);
    if(a.requiredMove==null) return 1;
    if(b.requiredMove==null) return -1;
    return a.requiredMove-b.requiredMove;
  }),[asset]);
  const rankedRows=feeRows.filter(f=>f.requiredMove!=null);
  const leader=rankedRows[0], slowest=rankedRows.at(-1);
  const travelRatio=leader && slowest ? slowest.requiredMove/leader.requiredMove : null;

  const detailFirm=coreFirms.find(f=>f.id===detailId);

  function openFirm(id){
    setDetailId(id);
  }

  return <main className="gp-site" id="top">
    <header className="gp-nav">
      <a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a>
      <nav className="gp-nav-links">
        <a href="#speed">Speed</a><a href="#field">Firms</a><a href="#degen">Execution</a>
      </nav>
    </header>

    <SpeedManifesto />

    <section className="firm-deck-section" id="field">
      <div className="firm-deck-header">
        <div>
          <span className="gp-section-no">01</span>
          <div><h2>Firm deck</h2><p>Five picks. One clear reason for each.</p></div>
        </div>
        <label className="firm-sort-select">Sort <select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort firms"><option value="signal">My picks</option><option value="entry">Entry price</option><option value="leverage">NQ leverage</option><option value="dd">Drawdown</option></select></label>
      </div>

      <div className="firm-card-grid">
        {visibleFirms.map((firm,index)=><FirmCard key={firm.id} firm={firm} index={index} onOpen={openFirm}/>)}
      </div>

      <CompactMatrix />
    </section>

    <section className="gp-degen-section" id="degen">
      <div className="gp-section-head gp-velocity-head">
        <div><span className="gp-section-no">02</span><div><h2>True R velocity</h2><p className="gp-section-note">A full-size NQ trade: 3% net risk, 10% net winner.</p></div></div>
        <div className="gp-degen-controls">
          <label className="gp-nq-input">NQ reference <input type="number" inputMode="decimal" min="1" step="100" value={nqPrice} onChange={e=>setNqPrice(e.target.value)} aria-label="NQ reference price" /></label>
          <span className="gp-taker-label">Taker fees · entry + exit</span>

        </div>
      </div>

      {leader && <div className="gp-outcome-story">
        <div><span className="gp-eyebrow">NQ AT {Number(nqPrice)>0?Number(nqPrice).toLocaleString("en-US"):"—"} · +{OUTCOME_TARGET}% NET WINNER</span><h3>{leader.name}: <em>{Number(nqPrice)>0?points(nqPrice*leader.requiredMove/100):"—"} points</em>.<br/>{slowest.name}: {Number(nqPrice)>0?points(nqPrice*slowest.requiredMove/100):"—"} points.</h3></div>
        <div className="gp-outcome-ratio"><strong>{travelRatio.toFixed(1)}×</strong><span>the NQ point distance at {slowest.name}</span><small>Same 10% net account gain. This is price distance, not elapsed time.</small></div>
      </div>}
      <div className="gp-fee-board gp-outcome-board">
        <div className="gp-fee-board-head">
          <div><span>FIRM / LEVERAGE</span><strong>NQ · full equity position</strong></div>
          <div><span>REACH</span><strong>Less distance = longer bar</strong></div>
          <div><span>FEES / 3% STOP</span><strong>Equity cost / NQ points</strong></div>
          <div><span>+{OUTCOME_TARGET}% NET WIN</span><strong>NQ points</strong></div>
        </div>
        {feeRows.map((f,index)=><div className={"gp-fee-row gp-fee-row-v2"+(index===0 && f.reach!=null?" is-velocity-leader":"")} key={f.id}>
          <div className="gp-fee-name">
            <span className="gp-fee-rank">{f.reach==null?"—":String(index+1).padStart(2,"0")}</span>
            <FirmLogo firm={f}/>
            <span><b>{f.name}</b><small>{f.marketLev?f.marketLev+"× "+marketProfiles[asset].label:"Not listed"}</small></span>
          </div>
          <div className="gp-outcome-reach">
            <div className="gp-rbar" aria-label={f.requiredMove==null?"Market unavailable":percent(f.requiredMove)+" market move needed for a net "+OUTCOME_TARGET+"% account gain"}><div className="gp-rbar-fill" style={{width:f.reach==null?"0%":(f.reach/leader.reach*100)+"%"}}/></div>
            <small>{percent(f.requiredMove)} market move · {f.payout}</small>
          </div>
          <div className="gp-fee-number"><b>{percent(f.feeDrag)}</b><small>{f.stopMove==null?"Fee exceeds 3% risk":Number(nqPrice)>0?points(nqPrice*f.stopMove/100)+" pt stop":"— pt stop"}</small></div>
          <div className="gp-fee-cash"><b>{f.requiredMove==null||Number(nqPrice)<=0?"—":points(nqPrice*f.requiredMove/100)}</b><small>pt win · 10% net</small></div>
        </div>)}
      </div>
      <p className="gp-outcome-caption">At 27,000 NQ, Vest needs 55.4 points up for +10% net; its 3% net risk stop is 14.9 points down. Vanta needs 1,080 points up and a 324-point stop. Change the reference price to scale the points.</p>
      <details className="gp-model-note"><summary>Model & inputs</summary><p>Illustrative full-equity position at each firm’s listed NQ leverage. Round-trip fee drag (% of equity) = 2 × taker fee (% of notional) × leverage. Win distance (% of NQ) = (10% net target + fee drag) ÷ leverage. Stop distance (% of NQ) = (3% net risk − fee drag) ÷ leverage. Multiply either distance by the NQ reference price for points. For Vest: 0.0025% taker per side × 2 × 50 = 0.25% equity in fees; (10 + 0.25) ÷ 50 = 0.205% of NQ. Vanta: 10 ÷ 2.5 = 4%. Their win-distance ratio is 4 ÷ 0.205 = 19.5×.</p><p>These are the site’s September 2026 scenario inputs, not live quotes. The fee drag is weighted by position size through leverage; the 19.5× compares NQ point distance, not time, win probability, or trading edge. It assumes constant notional and the same fee on entry and exit. Spreads, slippage, funding, profit split, and payout rules are excluded. If costs exceed the 3% risk budget, no valid stop remains.</p><p>Vanta uses base leverage without boosts or Pro. Account limits and notional caps may restrict full-equity positions. Check current contract prices and firm rules before purchasing.</p></details>
    </section>

    <footer className="gp-footer"><a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a><p>Firm terms and fees can change. Check before purchasing.</p><a href="#top">Back to top ↑</a></footer>

    {detailFirm && <FirmDrawer key={detailFirm.id} firm={detailFirm} onClose={()=>setDetailId(null)}/>}
  </main>;
}
