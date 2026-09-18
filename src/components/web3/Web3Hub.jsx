import { useState } from "react";
import { ArrowUpRight, ChevronRight, Circle, ExternalLink } from "lucide-react";
import { firms, shortBalance } from "./firmCatalog";
import "./web3-hub.css";

const NQ = 29679;
const BAR_MIN = 0.98;

const EQ_BASE = 100000;

const marketProfiles = {
  indices:{label:"NQ",name:"Nasdaq 100",entry:29043,precision:0,unit:"pts",snapshot:"SEP 18"},
  crypto:{label:"BTC",name:"Bitcoin",entry:77370,precision:0,unit:"$",snapshot:"SEP 18"},
  commodities:{label:"CL",name:"WTI Crude",entry:98.76,precision:2,unit:"$",snapshot:"SEP 18"},
  fx:{label:"EURUSD",name:"EUR / USD",entry:1.1463,precision:4,unit:"",snapshot:"SEP 18"}
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

function pctNumber(value){
  const m=String(value??"").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function defaultProgram(firm){
  return firm.programs.find(p=>p.id===firm.defaultProgram) || firm.programs[0];
}

function maxLiveBalance(firm){
  return Math.max(0,...firm.programs.flatMap(p=>p.sizes||[]).filter(x=>!x.disabled && x.balance).map(x=>x.balance));
}

function accountEquivalent(firm){
  const max=maxLiveBalance(firm);
  if(!max) return "100K EQ";
  if(max>=EQ_BASE) return "100K";
  const units=Math.round(EQ_BASE/max);
  return units+"×"+shortBalance(max)+" EQ";
}

function priceText(value,precision){
  if(value==null) return "—";
  return Number(value).toLocaleString("en-US",{minimumFractionDigits:precision,maximumFractionDigits:precision});
}

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

const leaders = [
  {metric:"LOWEST 25K ENTRY",firm:"Breakout",firmId:"breakout",value:"$95",detail:"Turbo"},
  {metric:"LOWEST 1-STEP TARGET",firm:"Hypernova + Breakout",firmId:null,value:"9%",detail:"Tight / Turbo"},
  {metric:"WIDEST 1-STEP DD",firm:"Hypernova",firmId:"hypernova",value:"7%",detail:"Medium · static"},
  {metric:"HIGHEST DEFAULT SPLIT",firm:"Vanta",firmId:"vanta",value:"100%",detail:"Classic"},
  {metric:"NQ LEVERAGE",firm:"Vest",firmId:"vest",value:"50x",detail:"NQ"},
  {metric:"PAYOUT SPEED",firm:"Hypernova",firmId:"hypernova",value:"~6.1s",detail:"average"}
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
  const [asset,setAsset]=useState("indices");

  const leverageRows=firms.map(f=>({
    ...f,
    marketLev:marketLeverage[f.id]?.[asset] ?? null
  })).sort((a,b)=>{
    if(a.marketLev==null && b.marketLev==null) return a.name.localeCompare(b.name);
    if(a.marketLev==null) return 1;
    if(b.marketLev==null) return -1;
    if(b.marketLev!==a.marketLev) return b.marketLev-a.marketLev;
    return a.name.localeCompare(b.name);
  });

  const maxLeverage=Math.max(1,...leverageRows.filter(f=>f.marketLev!=null).map(f=>f.marketLev));

  function inspectFirm(id,scroll=false){
    setActiveId(id);
    if(scroll) setTimeout(()=>document.getElementById("firm-"+id)?.scrollIntoView({behavior:"smooth",block:"center"}),100);
  }

  return <main className="gp-site">
    <header className="gp-nav">
      <a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a>
      <nav className="gp-nav-links">
        <a href="#field">Programs</a><a href="#degen">Leverage</a><a href="#matrix">Matrix</a>
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
          <a className="gp-quiet-link" href="#degen">Compare leverage</a>
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
      <div className="gp-section-head compact">
        <div><span className="gp-section-no">02</span><h2>Leverage map</h2></div>
      </div>

      <div className="gp-leverage-map">
        <div className="gp-leverage-tabs" aria-label="Market">
          {Object.entries(marketProfiles).map(([key,m])=><button type="button" key={key} className={asset===key?"is-active":""} onClick={()=>setAsset(key)}>
            <strong>{m.label}</strong>
            <span>{m.name}</span>
          </button>)}
        </div>

        <div className="gp-leverage-board">
          {leverageRows.map((f,index)=>{
            const pct=f.marketLev==null ? 0 : (f.marketLev/maxLeverage)*100;
            return <div className={"gp-leverage-row"+(index===0 && f.marketLev!=null?" is-top":"")} key={f.id}>
              <div className="gp-leverage-firm">
                <span className="gp-leverage-rank">{String(index+1).padStart(2,"0")}</span>
                <FirmLogo firm={f}/>
                <strong>{f.name}</strong>
              </div>

              <div className="gp-leverage-track">
                <div style={{width:pct+"%"}}/>
              </div>

              <div className="gp-leverage-value">
                <strong>{f.marketLev==null?"—":f.marketLev+"x"}</strong>
                <span>{f.marketLev==null?"NOT PUBLISHED":marketProfiles[asset].label}</span>
              </div>
            </div>;
          })}
        </div>
      </div>
    </section>

    <section className="gp-standouts">
      <div className="gp-section-head compact"><div><span className="gp-section-no">03</span><h2>Review board</h2></div></div>

      <div className="gp-review-board">
        <div className="gp-review-head">
          <span>METRIC</span>
          <span>LEADER</span>
          <span>BEST VALUE</span>
        </div>

        {leaders.map((item,index)=>{
          const leaderFirm=item.firmId ? firms.find(f=>f.id===item.firmId) : null;
          return <div className="gp-review-row" key={item.metric}>
            <div className="gp-review-metric">
              <span className="gp-review-no">{String(index+1).padStart(2,"0")}</span>
              <strong>{item.metric}</strong>
            </div>

            <div className="gp-review-firm">
              {leaderFirm && <FirmLogo firm={leaderFirm}/>}
              <span>{item.firm}</span>
            </div>

            <div className="gp-review-value">
              <strong>{item.value}</strong>
              <span>{item.detail}</span>
            </div>
          </div>;
        })}
      </div>
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
      <a href="#degen">Leverage map <ExternalLink size={14}/></a>
    </section>

    <footer className="gp-footer"><a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a><p>Perpetual prop intelligence.</p><span>SEP 2026</span></footer>
  </main>;
}
