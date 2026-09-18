import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Circle, ExternalLink } from "lucide-react";
import { firms, shortBalance } from "./firmCatalog";
import "./web3-hub.css";

const NQ = 29679;
const BAR_MIN = 0.98;

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

const standouts = [
  ["25K ENTRY","Vest","$198 observed"],
  ["SPLIT","Vanta","100% default"],
  ["NQ LEVERAGE","Vest","50x"],
  ["AUTOMATION","Propr","REST + Python / JS"],
  ["PAYOUT SPEED","Hypernova","~6.1s avg"],
  ["ON-DEMAND","Breakout","24/7"],
  ["CODE PAYOUTS","HyperPNL","smart-contract"],
  ["LOWEST ENTRY","DojiFunded","$10 · 1K"]
];

function money(n){
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
}

function FirmLogo({firm,className=""}) {
  return <span className={"gp-logo "+className} aria-hidden="true">
    <span className="gp-logo-fallback">{firm.mark}</span>
    <img src={firm.logo} alt="" loading="lazy" onError={(e)=>{
      const img=e.currentTarget;
      if(!img.dataset.fallback){
        img.dataset.fallback="1";
        img.src=`https://www.google.com/s2/favicons?domain=${firm.domain}&sz=128`;
      } else {
        img.style.display="none";
      }
    }}/>
  </span>;
}

function preferredSizeIndex(program){
  if(!program?.sizes?.length) return 0;
  const preferred=program.sizes.findIndex(s=>s.balance===25000 && !s.disabled);
  if(preferred>=0) return preferred;
  const live=program.sizes.findIndex(s=>!s.disabled);
  return live>=0?live:0;
}

function FirmProfile({firm,isActive,onActive}){
  const initialProgram=firms.find(x=>x.id===firm.id)?.defaultProgram || firm.programs[0].id;
  const [programId,setProgramId]=useState(initialProgram);
  const initial=firm.programs.find(p=>p.id===initialProgram) || firm.programs[0];
  const [sizeIndex,setSizeIndex]=useState(()=>preferredSizeIndex(initial));

  const program=firm.programs.find(p=>p.id===programId) || firm.programs[0];
  const size=program.sizes[Math.min(sizeIndex,program.sizes.length-1)] || program.sizes[0];

  function chooseProgram(id){
    const next=firm.programs.find(p=>p.id===id) || firm.programs[0];
    setProgramId(next.id);
    setSizeIndex(preferredSizeIndex(next));
    onActive(firm.id);
  }

  const price=size?.fee!=null ? money(size.fee) : (size?.feeLabel || "—");
  const account=size?.balance!=null ? shortBalance(size.balance) : "—";
  const hasList=size?.listFee!=null && size.listFee!==size.fee;

  return <article id={"firm-"+firm.id} className={"gp-profile"+(isActive?" is-active":"")} onMouseEnter={()=>onActive(firm.id)}>
    <div className="gp-profile-head">
      <div className="gp-profile-id">
        <span className="gp-profile-logo"><FirmLogo firm={firm}/></span>
        <div>
          <div className="gp-profile-name-line"><h3>{firm.name}</h3><span>{firm.status}</span></div>
          <p>{firm.edge}</p>
        </div>
      </div>

      <div className="gp-profile-actions">
        <div className="gp-program-tabs" role="tablist" aria-label={firm.name+" programs"}>
          {firm.programs.map(p=><button type="button" role="tab" aria-selected={program.id===p.id} key={p.id}
            className={program.id===p.id?"is-active":""} onClick={()=>chooseProgram(p.id)}>
            <span>{p.label}</span><small>{p.badge}</small>
          </button>)}
        </div>
        <a href={firm.url} target="_blank" rel="noreferrer" aria-label={"Open "+firm.name}><ArrowUpRight size={18}/></a>
      </div>
    </div>

    <div className="gp-size-row">
      <span>ACCOUNT SIZE</span>
      <div className="gp-size-tabs">
        {program.sizes.map((s,i)=><button type="button" key={(s.balance??"na")+"-"+i}
          className={(i===sizeIndex?"is-active ":"")+(s.disabled?"is-disabled":"")}
          onClick={()=>{setSizeIndex(i);onActive(firm.id);}}>
          <b>{s.balance!=null?shortBalance(s.balance):"—"}</b>
          {s.feeLabel && <small>{s.feeLabel}</small>}
        </button>)}
      </div>
    </div>

    <div className="gp-profile-metrics">
      <div className="gp-profile-price">
        <span>ENTRY · {account}</span>
        <strong>{price}</strong>
        <small>{hasList?"was "+money(size.listFee):program.label}</small>
      </div>
      <div className="gp-profile-metric">
        <span>TARGET</span>
        <strong>{program.target}</strong>
      </div>
      <div className="gp-profile-metric">
        <span>MAX DD</span>
        <strong>{program.drawdown}</strong>
      </div>
      <div className="gp-profile-metric">
        <span>SPLIT</span>
        <strong>{program.split}</strong>
      </div>
      <div className="gp-profile-metric">
        <span>DAILY</span>
        <strong>{program.daily}</strong>
      </div>
      <div className="gp-profile-metric gp-profile-leverage">
        <span>LEVERAGE</span>
        <strong>{program.leverage}</strong>
      </div>
    </div>

    <div className="gp-profile-foot gp-profile-foot-deep">
      <div><span>PAYOUT</span><strong>{program.payout}</strong></div>
      <div><span>MIN DAYS</span><strong>{program.minDays}</strong></div>
      <div><span>TIME LIMIT</span><strong>{program.timeLimit}</strong></div>
      <div><span>VENUE</span><strong>{firm.venue}</strong></div>
    </div>

    <div className="gp-rule-strip">
      {[...(program.tags||[]),...(program.extras||[])].map(tag=><span key={tag}>{tag}</span>)}
    </div>
  </article>;
}

export default function Web3Hub(){
  const [activeId,setActiveId]=useState("vest");
  const [degenId,setDegenId]=useState("vest");
  const [asset,setAsset]=useState("indices");
  const [feeMode,setFeeMode]=useState("taker");

  const feeRows=useMemo(()=>firms.map(f=>{
    const pair=fees[asset][f.id];
    const raw=pair?.[feeMode==="maker"?0:1];
    const fee=feeMode==="avg" ? (pair && pair[0]!=null && pair[1]!=null ? (pair[0]+pair[1])/2 : null) : raw;
    const retained=fee==null ? null : 1-((fee/100)*2*10);
    const barPct=retained==null ? 0 : Math.max(0,Math.min(100,((retained-BAR_MIN)/(1-BAR_MIN))*100));
    return {...f,fee,retained,barPct};
  }),[asset,feeMode]);

  const degenFirm=firms.find(f=>f.id===degenId)||firms[4];
  const degenFee=feeRows.find(f=>f.id===degenFirm.id);
  const targetMove=degenFirm.indexLev ? degenFirm.target/degenFirm.indexLev : null;
  const targetPoints=targetMove==null ? null : NQ*(targetMove/100);

  function inspectFirm(id,scroll=false){
    setActiveId(id);
    if(scroll) setTimeout(()=>document.getElementById("firm-"+id)?.scrollIntoView({behavior:"smooth",block:"center"}),100);
  }

  return <main className="gp-site">
    <header className="gp-nav">
      <a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a>
      <nav className="gp-nav-links">
        <a href="#field">Programs</a><a href="#degen">Fullport</a><a href="#matrix">Matrix</a>
      </nav>
      <div className="gp-nav-meta"><span>PERPETUAL PROP INTELLIGENCE</span><i/><span>SEP 2026</span></div>
    </header>

    <section className="gp-hero" id="top">
      <div className="gp-hero-copy">
        <div className="gp-eyebrow"><Circle size={7} fill="currentColor"/> PROP FIRMS · PERPETUALS · ON-CHAIN</div>
        <h1>Perpetual props,<br/><span>mapped.</span></h1>
        <p>Prices, plans, leverage, execution and payout rails across the new Web3 prop stack.</p>
        <div className="gp-hero-actions">
          <a className="gp-primary-link" href="#field">Explore programs <ChevronRight size={16}/></a>
          <a className="gp-quiet-link" href="#degen">Open fullport map</a>
        </div>
      </div>

      <div className="gp-orbit" aria-label="Web3 prop firm orbit">
        <div className="gp-orbit-ring gp-ring-a"/><div className="gp-orbit-ring gp-ring-b"/><div className="gp-orbit-ring gp-ring-c"/>
        <div className="gp-wisp-core" aria-hidden="true">
          <div className="gp-core-glow"/><div className="gp-core-pulse-ring"/><img src="./wisp.webp" alt=""/>
        </div>
        {firms.map(f=><button type="button" key={f.id}
          className={"gp-orbit-firm"+(f.id===activeId?" is-active":"")}
          style={{"--node-x":f.orbit.x,"--node-y":f.orbit.y,"--node-delay":f.orbit.delay}}
          data-name={f.name} onClick={()=>inspectFirm(f.id,true)} aria-label={`Inspect ${f.name}`}>
          <FirmLogo firm={f} className="gp-orbit-logo"/>
        </button>)}
      </div>
    </section>

    <section className="gp-index-section" id="field">
      <div className="gp-section-head compact">
        <div><span className="gp-section-no">01</span><h2>Programs</h2></div>
      </div>

      <div className="gp-profile-stack">
        {firms.map(f=><FirmProfile key={f.id} firm={f} isActive={f.id===activeId} onActive={setActiveId}/>)}
      </div>
    </section>

    <section className="gp-degen-section" id="degen">
      <div className="gp-section-head">
        <div><span className="gp-section-no">02</span><h2>Fullport map</h2></div>
        <div className="gp-degen-controls">
          <div className="gp-segment">{["crypto","fx","indices","commodities"].map(x=><button key={x} className={asset===x?"is-active":""} onClick={()=>setAsset(x)}>{x}</button>)}</div>
          <div className="gp-segment mini">{["maker","taker","avg"].map(x=><button key={x} className={feeMode===x?"is-active":""} onClick={()=>setFeeMode(x)}>{x}</button>)}</div>
        </div>
      </div>

      <div className="gp-firm-switcher" aria-label="Select fullport firm">
        {firms.map(f=><button type="button" key={f.id} className={degenId===f.id?"is-active":""} onClick={()=>setDegenId(f.id)}>
          <FirmLogo firm={f}/><span>{f.name}</span>
        </button>)}
      </div>

      <div className="gp-degen-hero">
        <div>
          <span className="gp-kicker">{degenFirm.name.toUpperCase()} · {degenFirm.leverage.toUpperCase()}</span>
          <strong>{targetMove==null?"—":targetMove.toFixed(2)+"%"}</strong>
          <p>{targetMove==null?"market-specific leverage":"underlying move to hit a "+degenFirm.target+"% target"}</p>
        </div>
        <div className="gp-nq-points">
          <span>{targetPoints==null?"—":"≈"+Math.round(targetPoints)}</span><small>{targetPoints==null?"NQ leverage not published":"NQ points @ 29.7K"}</small>
        </div>
        <div className="gp-vs">
          <span>{asset.toUpperCase()} · {feeMode.toUpperCase()} · ROUND TRIP</span>
          <b>{degenFee?.retained==null?"n/a":degenFee.retained.toFixed(3)+"R"}</b>
          <small>{degenFee?.fee==null?"fee data unavailable":degenFee.fee.toFixed(degenFee.fee<.01?4:3)+"% / side · 10x reference"}</small>
        </div>
      </div>

      <div className="gp-fee-head">
        <span>FIRM</span>
        <div className="gp-rbar-axis" aria-label="Shared R scale from 0.980R to 1.000R">
          <span>0.980</span><span>0.985</span><span>0.990</span><span>0.995</span><span>1.000R</span>
        </div>
        <span>R KEPT</span>
      </div>
      <div className="gp-fee-map">
        {feeRows.map(f=><button type="button" className={"gp-fee-row"+(degenId===f.id?" is-active":"")} key={f.id} onClick={()=>setDegenId(f.id)}>
          <div className="gp-fee-name"><FirmLogo firm={f}/><span><b>{f.name}</b><small>{f.leverage}</small></span></div>
          <div className="gp-rbar" aria-label={f.retained==null?"fee unavailable":f.retained.toFixed(3)+" R retained on a 0.980 to 1.000 R scale"}>
            <div className="gp-rbar-grid"/>
            <div className="gp-rbar-fill" style={{width:f.retained==null?"0%":f.barPct+"%"}}/>
            {f.retained!=null && <div className="gp-rbar-cut" style={{width:(100-f.barPct)+"%"}}/>}
            {f.retained!=null && <i className="gp-rbar-marker" style={{left:f.barPct+"%"}}/>}
          </div>
          <div className="gp-fee-number">
            <b>{f.retained==null?"n/a":f.retained.toFixed(3)+"R"}</b>
            <small>{f.fee==null?"—":f.fee.toFixed(f.fee<.01?4:3)+"% / side"}</small>
          </div>
        </button>)}
      </div>
    </section>

    <section className="gp-standouts">
      <div className="gp-section-head compact"><div><span className="gp-section-no">03</span><h2>Standouts</h2></div></div>
      <div className="gp-standout-grid">{standouts.map(([k,n,v])=><div className="gp-standout" key={k}><span>{k}</span><strong>{n}</strong><small>{v}</small></div>)}</div>
    </section>

    <section className="gp-compare-section" id="matrix">
      <div className="gp-section-head compact"><div><span className="gp-section-no">04</span><h2>25K baseline</h2></div></div>
      <div className="gp-matrix-wrap"><table className="gp-matrix"><thead><tr>
        <th>Firm</th><th>25K</th><th>Default</th><th>Target</th><th>Daily</th><th>Max DD</th><th>Split</th><th>Leverage</th><th>Payout</th>
      </tr></thead><tbody>
        {firms.map(f=><tr key={f.id}><td className="gp-matrix-name">{f.name}</td><td>{money(f.price)}</td><td>{f.plan}</td><td>{f.target}%</td><td>{f.daily}</td><td>{f.drawdown}</td><td>{f.split}</td><td>{f.leverage}</td><td>{f.payout}</td></tr>)}
      </tbody></table></div>
    </section>

    <section className="gp-thesis">
      <div className="gp-thesis-line"/><p>Price is the ticket. <span>Leverage and execution decide how much edge survives.</span></p>
      <a href="#degen">Fullport map <ExternalLink size={14}/></a>
    </section>

    <footer className="gp-footer"><a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a><p>Perpetual prop intelligence.</p><span>SEP 2026</span></footer>
  </main>;
}
