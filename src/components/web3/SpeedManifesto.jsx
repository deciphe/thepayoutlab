export default function SpeedManifesto(){
  const cycles=[
    {id:"01",nodes:["PASS","PAYOUT","WITHDRAW"]},
    {id:"02",nodes:["FAIL","RETRY","PASS"]},
    {id:"03",nodes:["PAYOUT","WITHDRAW","RELOAD"]},
    {id:"04",nodes:["PASS","PAYOUT","WITHDRAW"]}
  ];

  const proofs=[
    {firm:"BREAKOUT",signal:"AUTO-UPGRADE",value:"0 MIN DAYS",detail:"Target hit → funded. 24/7 on-demand payout rail."},
    {firm:"VEST",signal:"SAME-DAY LOOP",value:"IMMEDIATE",detail:"Fast evaluation flow, same-day funded path and wallet-native withdrawals."},
    {firm:"HYPERPNL",signal:"CODE-ENFORCED",value:"NO QUEUE",detail:"Smart-contract payout logic instead of a manual approval queue."}
  ];

  return <section className="speed-manifesto" id="speed">
    <div className="speed-kicker"><span>00</span><i/> THE MODEL SHIFT</div>

    <div className="speed-title-grid">
      <div><h2>THE CLOCK<br/>IS <em>CAPITAL.</em></h2></div>
      <div className="speed-thesis-copy">
        <p>A challenge fee is obvious. Waiting is not.</p>
        <p>Minimum days, activation delays, funded-day requirements, payout windows, manual reviews and settlement lag all reduce how quickly the same bankroll can turn again.</p>
        <strong>Price tells you the cost to enter. <u>Velocity tells you the cost to operate.</u></strong>
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
        <span>THE SHIFT</span>
        <strong>WAITING USED TO BE PART OF THE PRODUCT.</strong>
        <strong className="is-green">NOW THE PRODUCT CAN BE THE LOOP ITSELF.</strong>
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
