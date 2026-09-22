export default function SpeedManifesto(){
  const cycles=[
    {id:"01",nodes:["PASS","PAYOUT","WITHDRAW"]},
    {id:"02",nodes:["FAIL","RETRY","PASS"]},
    {id:"03",nodes:["PAYOUT","WITHDRAW","RELOAD"]},
    {id:"04",nodes:["PASS","PAYOUT","WITHDRAW"]}
  ];

  const proofs=[
    {firm:"HYPERNOVA",signal:"PAYOUT SPEED",value:"~6 SEC",detail:"Firm-published average payout time. The wait has been compressed down to seconds."},
    {firm:"VEST CAPITAL",signal:"NQ LEVERAGE",value:"50x",detail:"The standout weapon: extreme NQ leverage inside a wallet-native funded stack."},
    {firm:"BREAKOUT",signal:"BACKING + HISTORY",value:"$60M+",detail:"Kraken-backed with more than $60M paid to traders since launch and a public payout history."}
  ];

  return <section className="speed-manifesto" id="speed">
    <div className="speed-kicker"><span>00</span><i/> THE MODEL SHIFT</div>

    <div className="speed-title-grid">
      <div><h2>SAME CLOCK.<br/><em>MORE TURNS.</em></h2></div>
      <div className="speed-thesis-copy">
        <p>Time is part of the cost.</p>
        <p>Minimum days, activation delays, funded-day requirements, payout windows, manual reviews and settlement lag all slow the return of usable capital.</p>
        <strong>Compare the fee, the rules and <u>time to cash.</u></strong>
      </div>
    </div>

    <div className="speed-race">
      <div className="speed-race-head">
        <span>SAME CLOCK</span>
        <strong>DIFFERENT OUTPUT</strong>
        <small>workflow illustration · rules vary by firm</small>
      </div>

      <div className="speed-lane speed-lane-old">
        <div className="speed-lane-label"><span>OLD MODEL</span><strong>ONE PAYOUT</strong></div>
        <div className="speed-old-track">
          {["BUY","MIN DAYS","PASS","ACTIVATE","FUNDED DAYS","PAYOUT WINDOW","REVIEW","PAYOUT"].map((node,index)=><div className="speed-old-node" key={node}>
            <i>{String(index+1).padStart(2,"0")}</i><span>{node}</span>
          </div>)}
          <div className="speed-old-progress"/>
        </div>
      </div>

      <div className="speed-lane speed-lane-new">
        <div className="speed-lane-label"><span>WEB3 FAST LANE</span><strong>MULTIPLE CAPITAL TURNS</strong></div>
        <div className="speed-cycle-stack">
          {cycles.map(cycle=><div className="speed-cycle" key={cycle.id}>
            <b>{cycle.id}</b>
            {cycle.nodes.map((node,index)=><span key={node+index} className={node==="PAYOUT"||node==="WITHDRAW"?"is-cash":node==="FAIL"?"is-fail":""}>{node}</span>)}
            <i>→</i>
          </div>)}
        </div>
      </div>

      <div className="speed-race-message">
        <span>TIME COST</span>
        <strong>TRADITIONAL: ONE LONGER PATH TO CASH.</strong>
        <strong className="is-green">WEB3: MORE CAPITAL TURNS IN THE SAME TIME.</strong>
      </div>
    </div>

    <div className="speed-loop-mini" aria-label="Compressed Web3 prop loop">
      {["PAY","TRADE","PASS","FUNDED","PAYOUT","WITHDRAW","REPEAT"].map((step,index)=><div key={step}>
        <span>{String(index+1).padStart(2,"0")}</span><strong>{step}</strong>{index<6&&<i>→</i>}
      </div>)}
    </div>

    <div className="speed-proof-grid">
      {proofs.map(proof=><article key={proof.firm}>
        <div><span>{proof.firm}</span><small>{proof.signal}</small></div>
        <strong>{proof.value}</strong>
        <p>{proof.detail}</p>
      </article>)}
    </div>

    <div className="speed-equation">
      <span>THE REAL PRICE OF A PROP ACCOUNT</span>
      <strong>FEE <i>+</i> FRICTION <i>+</i> TIME</strong>
      <p>The faster the loop can reset, the less capital sits idle waiting for the next gate to open.</p>
    </div>
  </section>;
}
