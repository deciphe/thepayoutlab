import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Circle, ExternalLink } from "lucide-react";
import "./web3-hub.css";

const NQ = 29679;

const firms = [
  {
    id:"hypernova", name:"Hypernova", mark:"HN", domain:"hypernova.xyz", logo:"https://hypernova.xyz/favicon.ico", url:"https://hypernova.xyz/",
    status:"ON-CHAIN", venue:"Hyperliquid", price:275, plan:"Low Risk", target:10, daily:"3%", drawdown:"6% static", split:"80%",
    payout:"~6s avg on-chain", leverage:"5x", indexLev:5, leverageNote:"assessment max",
    plans:["Tight · $120","Low · $275","Medium · $365"],
    edge:"Fast on-chain payouts",
    note:"Hyperliquid liquidity, public reserve, instant on-chain settlement.",
    orbit:{x:"49%",y:"8%",delay:"-1.5s"}
  },
  {
    id:"propr", name:"Propr", mark:"PR", domain:"propr.xyz", logo:"https://www.propr.xyz/favicon.ico", url:"https://www.propr.xyz/",
    status:"ON-CHAIN", venue:"Hyperliquid", price:275, plan:"Classic", target:10, daily:"3%", drawdown:"6% static", split:"80%",
    payout:"On-chain USDC", leverage:"up to 10x", indexLev:10, leverageNote:"platform max",
    plans:["Classic · $275","1-Step","2-Step"],
    edge:"API / agent stack",
    note:"REST API plus Python and JavaScript SDKs, Hyperliquid execution.",
    orbit:{x:"78%",y:"20%",delay:"-4.2s"}
  },
  {
    id:"doji", name:"DojiFunded", mark:"DJ", domain:"dojifunded.com", logo:"https://www.dojifunded.com/favicon.ico", url:"https://www.dojifunded.com/",
    status:"ARBITRUM", venue:"On-chain", price:198, plan:"1-Step", target:10, daily:"3%", drawdown:"6%", split:"—",
    payout:"Instant on-chain", leverage:"5x shown", indexLev:null, leverageNote:"market-specific",
    plans:["1-Step · $198","Instant","2-Step"],
    edge:"Protocol-native",
    note:"On-chain execution, vault-native capital, SDKs and multi-asset venue.",
    orbit:{x:"91%",y:"50%",delay:"-2.8s"}
  },
  {
    id:"vanta", name:"Vanta", mark:"VA", domain:"vantatrading.io", logo:"https://www.vantatrading.io/favicon.ico", url:"https://www.vantatrading.io/",
    status:"DECENTRALIZED", venue:"Multi-asset", price:169, plan:"Tier II", target:10, daily:"5%", drawdown:"5% static", split:"100%",
    payout:"Weekly", leverage:"2.5x indices", indexLev:2.5, leverageNote:"base tier",
    plans:["25K · $169","Boost I · +$100","Boost II · +$200"],
    edge:"100% reward split",
    note:"One-step challenge, 100% rewards by default, API trading and scaling.",
    orbit:{x:"75%",y:"80%",delay:"-5.4s"}
  },
  {
    id:"vest", name:"Vest", mark:"VE", domain:"vestmarkets.com", logo:"https://www.vestmarkets.com/favicon.ico", url:"https://www.vestmarkets.com/",
    status:"PERPS", venue:"Vest Markets", price:198, plan:"1-Step", target:10, daily:"3%", drawdown:"6%", split:"80%",
    payout:"Instant USDC", leverage:"50x NQ", indexLev:50, leverageNote:"market-specific",
    plans:["25K · $198","Instant accounts","Evaluation"],
    edge:"50x NQ buying power",
    note:"24/7 multi-asset perps with unusually high market-specific leverage.",
    orbit:{x:"43%",y:"91%",delay:"-3.6s"}
  },
  {
    id:"hyperpnl", name:"HyperPNL", mark:"HP", domain:"hyperpnl.com", logo:"https://hyperpnl.com/favicon.ico", url:"https://hyperpnl.com/",
    status:"ON-CHAIN", venue:"Hyperliquid + Ostium", price:215, plan:"Flex", target:10, daily:"3%", drawdown:"5% static", split:"80%",
    payout:"Smart-contract", leverage:"market-specific", indexLev:null, leverageNote:"",
    plans:["5K · $42","10K · $86","25K · $215"],
    edge:"Code-enforced payouts",
    note:"Smart-contract payouts with Hyperliquid and Ostium market access.",
    orbit:{x:"13%",y:"70%",delay:"-6.1s"}
  },
  {
    id:"breakout", name:"Breakout", mark:"BR", domain:"breakoutprop.com", logo:"https://www.breakoutprop.com/favicon.ico", url:"https://www.breakoutprop.com/",
    status:"KRAKEN", venue:"Breakout Terminal", price:215, plan:"Classic", target:10, daily:"3%", drawdown:"6% static", split:"80–90%",
    payout:"24/7 on-demand", leverage:"10x NQ", indexLev:10, leverageNote:"Nasdaq",
    plans:["Classic","Pro","Turbo"],
    edge:"Mature payout rails",
    note:"Simple rule stack, on-demand USDC payouts and broad 24/7 market access.",
    orbit:{x:"10%",y:"30%",delay:"-.7s"}
  }
];

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
  ["ENTRY","Vanta","$169 · 25K"],
  ["SPLIT","Vanta","100% default"],
  ["NQ LEVERAGE","Vest","50x"],
  ["AUTOMATION","Propr","REST + Python / JS"],
  ["PAYOUT SPEED","Hypernova","~6s avg"],
  ["ON-DEMAND","Breakout","24/7 USDC"],
  ["CODE PAYOUTS","HyperPNL","smart-contract"],
  ["PROTOCOL","DojiFunded","Arbitrum-native"]
];

function money(n){ return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n); }

function FirmLogo({firm,className=""}) {
  return <span className={"gp-logo "+className} aria-hidden="true">
    <span className="gp-logo-fallback">{firm.mark}</span>
    <img src={firm.logo} alt="" loading="lazy" onError={(e)=>{
      const img=e.currentTarget;
      if(!img.dataset.fallback){ img.dataset.fallback="1"; img.src=`https://www.google.com/s2/favicons?domain=${firm.domain}&sz=128`; }
      else img.style.display="none";
    }}/>
  </span>;
}

export default function Web3Hub(){
  const [activeId,setActiveId]=useState("vest");
  const [asset,setAsset]=useState("indices");
  const [feeMode,setFeeMode]=useState("taker");
  const active=firms.find(f=>f.id===activeId)||firms[0];

  const feeRows=useMemo(()=>firms.map(f=>{
    const pair=fees[asset][f.id];
    const raw=pair?.[feeMode==="maker"?0:1];
    const fee=feeMode==="avg" ? (pair && pair[0]!=null && pair[1]!=null ? (pair[0]+pair[1])/2 : null) : raw;
    const retained=fee==null ? null : Math.max(.75,1-(fee*2));
    return {...f,fee,retained};
  }),[asset,feeMode]);

  function inspectFirm(id,scroll=false){
    setActiveId(id);
    if(scroll) setTimeout(()=>document.getElementById("field")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
  }

  return <main className="gp-site">
    <header className="gp-nav">
      <a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a>
      <nav className="gp-nav-links">
        <a href="#field">Plans</a><a href="#degen">Fullport</a><a href="#matrix">Matrix</a>
      </nav>
      <div className="gp-nav-meta"><span>PERPETUAL PROP INTELLIGENCE</span><i/><span>SEP 2026</span></div>
    </header>

    <section className="gp-hero" id="top">
      <div className="gp-hero-copy">
        <div className="gp-eyebrow"><Circle size={7} fill="currentColor"/> PROP FIRMS · PERPETUALS · ON-CHAIN</div>
        <h1>Perpetual props,<br/><span>mapped.</span></h1>
        <p>Prices, plans, leverage, execution and payout rails across the new Web3 prop stack.</p>
        <div className="gp-hero-actions">
          <a className="gp-primary-link" href="#degen">Open fullport map <ChevronRight size={16}/></a>
          <a className="gp-quiet-link" href="#field">Compare 25K plans</a>
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
        <div><span className="gp-section-no">01</span><h2>25K field</h2></div>
      </div>

      <div className="gp-index-layout">
        <div className="gp-firm-list">
          {firms.map(f=><button type="button" key={f.id}
            className={"gp-firm-row"+(f.id===activeId?" is-active":"")} onClick={()=>inspectFirm(f.id)}>
            <span className="gp-firm-mark"><FirmLogo firm={f}/></span>
            <span className="gp-firm-name"><strong>{f.name}</strong><small>{f.plan}</small></span>
            <span className="gp-firm-price">{money(f.price)}</span>
            <span className="gp-firm-metric"><b>{f.target}%</b><small>TARGET</small></span>
            <span className="gp-firm-metric"><b>{f.split}</b><small>SPLIT</small></span>
            <ChevronRight className="gp-row-arrow" size={16}/>
          </button>)}
        </div>

        <aside className="gp-detail">
          <div className="gp-detail-top">
            <div className="gp-detail-identity"><FirmLogo firm={active} className="gp-detail-logo"/><div><span className="gp-detail-kicker">{active.edge}</span><h3>{active.name}</h3></div></div>
            <a href={active.url} target="_blank" rel="noreferrer"><ArrowUpRight size={18}/></a>
          </div>
          <p className="gp-detail-note">{active.note}</p>
          <div className="gp-plan-chips">{active.plans.map(p=><span key={p}>{p}</span>)}</div>
          <dl className="gp-detail-grid">
            <div><dt>25K entry</dt><dd>{money(active.price)}</dd></div>
            <div><dt>Profit target</dt><dd>{active.target}%</dd></div>
            <div><dt>Daily loss</dt><dd>{active.daily}</dd></div>
            <div><dt>Max drawdown</dt><dd>{active.drawdown}</dd></div>
            <div><dt>Reward split</dt><dd>{active.split}</dd></div>
            <div><dt>Leverage</dt><dd>{active.leverage}</dd></div>
          </dl>
          <div className="gp-detail-bottom"><span>{active.venue}</span><span>{active.payout}</span></div>
        </aside>
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

      <div className="gp-degen-hero">
        <div>
          <span className="gp-kicker">VEST · NQ · 50X</span>
          <strong>0.20%</strong>
          <p>underlying move to hit a 10% target</p>
        </div>
        <div className="gp-nq-points">
          <span>≈59</span><small>NQ points @ 29.7K</small>
        </div>
        <div className="gp-vs">
          <span>VANTA BASE INDICES · 2.5X</span>
          <b>4.00%</b>
          <small>≈1,187 NQ points</small>
        </div>
      </div>

      <div className="gp-fee-head"><span>1.00R GROSS</span><span>10X REFERENCE NOTIONAL · ROUND TRIP</span><span>R KEPT</span></div>
      <div className="gp-fee-map">
        {feeRows.map(f=><div className="gp-fee-row" key={f.id}>
          <div className="gp-fee-name"><FirmLogo firm={f}/><span><b>{f.name}</b><small>{f.leverage}</small></span></div>
          <div className="gp-rbar">
            <div className="gp-rbar-fill" style={{width:f.retained==null?"0%":`${f.retained*100}%`}}/>
            {f.retained!=null && <div className="gp-rbar-cut" style={{width:`${(1-f.retained)*100}%`}}/>}
          </div>
          <div className="gp-fee-number">
            <b>{f.retained==null?"n/a":f.retained.toFixed(3)+"R"}</b>
            <small>{f.fee==null?"—":f.fee.toFixed(f.fee<.01?4:3)+"% / side"}</small>
          </div>
        </div>)}
      </div>
    </section>

    <section className="gp-standouts">
      <div className="gp-section-head compact"><div><span className="gp-section-no">03</span><h2>Standouts</h2></div></div>
      <div className="gp-standout-grid">{standouts.map(([k,n,v])=><div className="gp-standout" key={k}><span>{k}</span><strong>{n}</strong><small>{v}</small></div>)}</div>
    </section>

    <section className="gp-compare-section" id="matrix">
      <div className="gp-section-head compact"><div><span className="gp-section-no">04</span><h2>Plan matrix</h2></div></div>
      <div className="gp-matrix-wrap"><table className="gp-matrix"><thead><tr>
        <th>Firm</th><th>25K</th><th>Plan</th><th>Target</th><th>Daily</th><th>Max DD</th><th>Split</th><th>Leverage</th><th>Payout</th>
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
