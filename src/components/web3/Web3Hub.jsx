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

const BAR_MIN = 0;
const CORE_FIRM_IDS = ["vest","hypernova","propr","breakout","vanta"];
const coreFirms = CORE_FIRM_IDS.map(id=>firms.find(f=>f.id===id)).filter(Boolean);

const marketProfiles = {
  indices:{label:"NQ",name:"Nasdaq 100"},
  crypto:{label:"BTC",name:"Bitcoin"},
  commodities:{label:"CL",name:"WTI Crude"},
  fx:{label:"EURUSD",name:"EUR / USD"}
};

const marketLeverage = {
  hypernova:{indices:10,crypto:5,commodities:10,fx:null},
  propr:{indices:10,crypto:10,commodities:8,fx:25},
  doji:{indices:10,crypto:5,commodities:null,fx:25},
  vanta:{indices:2.5,crypto:1.5,commodities:1.5,fx:10},
  vest:{indices:50,crypto:10,commodities:null,fx:null},
  hyperpnl:{indices:null,crypto:null,commodities:null,fx:null},
  breakout:{indices:10,crypto:10,commodities:5,fx:null}
};

const fees = {
  crypto: {
    hypernova:[.01,.04], vanta:[.03,.03], propr:[.015,.045], doji:[.02,.02], vest:[.01,.01], hyperpnl:[.015,.045], breakout:[.04,.04]
  },
  fx: {
    hypernova:[0,.005], vanta:[0,0], propr:[.003,.009], doji:[.005,.005], vest:[.01,.01], hyperpnl:[.015,.03], breakout:[null,null]
  },
  indices: {
    hypernova:[0,.005], vanta:[0,0], propr:[.003,.009], doji:[.007,.007], vest:[.0025,.0025], hyperpnl:[.015,.03], breakout:[.04,.04]
  },
  commodities: {
    hypernova:[0,.005], vanta:[.005,.005], propr:[.003,.009], doji:[.006,.006], vest:[.01,.01], hyperpnl:[.015,.03], breakout:[.04,.04]
  }
};

const cardSignals = {
  vest:{
    value:"50x",
    label:"NQ LEVERAGE",
    tone:"leverage",
    edge:"50x NQ gives materially more notional per unit of margin."
  },
  hypernova:{
    value:"~6s",
    label:"AVG PAYOUT · FIRM-PUBLISHED",
    tone:"speed",
    edge:"Firm-published average payout time is measured in seconds."
  },
  propr:{
    value:"SUPPORT",
    label:"RESPONSIVE TEAM",
    tone:"infra",
    edge:"Strong hands-on support is the standout."
  },
  breakout:{
    value:"$60M+",
    label:"PAID TO TRADERS",
    tone:"price",
    edge:"Kraken-backed with a large public payout history."
  },
  vanta:{
    value:"$1M",
    label:"PRO SCALE",
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
        <div><h3>{firm.name}</h3><span>{firm.status}</span></div>
      </div>
      {firm.id==="vest" && <span className="firm-card-pick">TOP PICK</span>}
      <a href={firm.url} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} aria-label={"Visit "+firm.name}>
        <ArrowUpRight size={16}/>
      </a>
    </div>

    <div className="firm-card-signal">
      <small>{signal.label}</small>
      <strong>{signal.value}</strong>
    </div>

    <div className="firm-card-stats">
      <div><span>25K ENTRY</span><b>{money(firm.price)}</b></div>
      <div><span>MAX DD</span><b>{firstToken(program.drawdown)}</b></div>
      <div><span>SPLIT</span><b>{firstToken(program.split)}</b></div>
    </div>

    <button type="button" className="firm-card-foot" onClick={()=>onOpen(firm.id)} aria-label={"Open "+firm.name+" program details"}>
      <span>Programs & details</span>
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

      <a className="firm-drawer-cta" href={firm.url} target="_blank" rel="noreferrer">
        Open {firm.name} <ArrowUpRight size={16}/>
      </a>
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
  const [asset,setAsset]=useState("indices");
  const [feeMode,setFeeMode]=useState("taker");

  const visibleFirms=useMemo(()=>{
    let list=[...coreFirms];
    if(sort==="entry") list.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
    if(sort==="leverage") list.sort((a,b)=>(b.indexLev||0)-(a.indexLev||0));
    if(sort==="dd") list.sort((a,b)=>(pctNumber(b.drawdown)||0)-(pctNumber(a.drawdown)||0));
    return list;
  },[sort]);

  const feeRows=useMemo(()=>coreFirms.map(f=>{
    const pair=fees[asset][f.id];
    const raw=pair?.[feeMode==="maker"?0:1];
    const fee=feeMode==="avg" ? (pair && pair[0]!=null && pair[1]!=null ? (pair[0]+pair[1])/2 : null) : raw;
    const leverage=marketLeverage[f.id]?.[asset] ?? null;
    const {retained,timeFactor,velocity}=executionMetrics(fee,leverage);
    const barPct=retained==null ? 0 : Math.max(0,Math.min(100,((retained-BAR_MIN)/(1-BAR_MIN))*100));
    return {...f,fee,retained,barPct,marketLev:leverage,timeFactor,velocity};
  }).sort((a,b)=>{
    if(a.velocity==null && b.velocity==null) return a.name.localeCompare(b.name);
    if(a.velocity==null) return 1;
    if(b.velocity==null) return -1;
    if(b.velocity!==a.velocity) return b.velocity-a.velocity;
    return a.name.localeCompare(b.name);
  }),[asset,feeMode]);

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
        <div><span className="gp-section-no">02</span><div><h2>True R velocity</h2><p className="gp-section-note">What fees leave you, weighted by buying power.</p></div></div>
        <div className="gp-degen-controls">
          <div className="gp-segment">
            {["crypto","fx","indices","commodities"].map(x=><button type="button" key={x} aria-pressed={asset===x} className={asset===x?"is-active":""} onClick={()=>setAsset(x)}>{marketProfiles[x].label}</button>)}
          </div>
          <div className="gp-segment mini gp-execution-segment">
            {["maker","taker","avg"].map(x=><button type="button" key={x} aria-pressed={feeMode===x} className={feeMode===x?"is-active":""} onClick={()=>setFeeMode(x)}>{x}</button>)}
          </div>
        </div>
      </div>

      <div className="gp-fee-board gp-fee-board-clean">
        <div className="gp-fee-board-head">
          <div><span>VELOCITY RANK</span><strong>{marketProfiles[asset].label} · {feeMode.toUpperCase()}</strong></div>
          <div className="gp-fee-scale"><span>0R</span><i/><span>0.5R</span><i/><span>1R KEPT</span></div>
          <div><span>LEVERAGE FACTOR</span><strong>10x = 1.00</strong></div>
          <div><span>VELOCITY INDEX</span><strong>R × FACTOR</strong></div>
        </div>

        {feeRows.map((f,index)=><div className={"gp-fee-row gp-fee-row-v2"+(index===0 && f.velocity!=null?" is-velocity-leader":"")} key={f.id}>
          <div className="gp-fee-name">
            <span className="gp-fee-rank">{f.velocity==null?"—":String(index+1).padStart(2,"0")}</span>
            <FirmLogo firm={f}/>
            <span><b>{f.name}</b><small>{f.marketLev?f.marketLev+"x "+marketProfiles[asset].label:"LEVERAGE —"}</small></span>
          </div>

          <div className="gp-rbar" aria-label={f.retained==null?"fee unavailable":f.retained.toFixed(3)+" R retained"}>
            <div className="gp-rbar-grid"/>
            <div className="gp-rbar-fill" style={{width:f.retained==null?"0%":f.barPct+"%"}}/>
            {f.retained!=null && <div className="gp-rbar-cut" style={{width:(100-f.barPct)+"%"}}/>}
            {f.retained!=null && <i className="gp-rbar-marker" style={{left:f.barPct+"%"}}/>}
          </div>

          <div className="gp-fee-number">
            <b>{f.timeFactor==null?"—":f.timeFactor.toFixed(2)+"×"}</b>
            <small>leverage factor</small>
          </div>

          <div className="gp-fee-cash gp-velocity-number">
            <b>{f.velocity==null?"—":f.velocity.toFixed(3)+"×"}</b>
            <small>{f.retained==null?"Unavailable":f.retained.toFixed(3)+"R kept"}</small>
          </div>
        </div>)}
      </div>
      <details className="gp-model-note"><summary>How this comparison works</summary><p>Illustration: 1R = 1% of account equity, using each market’s listed maximum leverage. R kept = 1 − round-trip fee ÷ 1R. Index = R kept × leverage ÷ 10. Higher leverage increases losses as well as buying power; it does not measure actual time to payout.</p><p>Fee inputs are the existing September 2026 snapshot, per side. Spreads, slippage, funding, profit splits and payout waiting time are excluded. A zero commission is not zero total cost. Unavailable markets remain unranked. Confirm current instrument terms with the firm.</p></details>
    </section>

    <footer className="gp-footer"><a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a><p>Firm terms and fees can change. Check before purchasing.</p><a href="#top">Back to top ↑</a></footer>

    {detailFirm && <FirmDrawer key={detailFirm.id} firm={detailFirm} onClose={()=>setDetailId(null)}/>}
  </main>;
}
