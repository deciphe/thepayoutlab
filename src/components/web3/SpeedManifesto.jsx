export default function SpeedManifesto(){
  const steps=[
    {n:"01",label:"PAY",value:"ONE CLICK",copy:"Buy the account. Start the clock."},
    {n:"02",label:"PASS",value:"NO CALENDAR",copy:"On the fastest programs, the target—not a day counter—is the gate."},
    {n:"03",label:"FUNDED",value:"SAME LOOP",copy:"Funding can happen as soon as the challenge is complete."},
    {n:"04",label:"PAYOUT",value:"WALLET",copy:"Move profit to USDC without building your month around a payout date."}
  ];

  const proofs=[
    {firm:"BREAKOUT",signal:"AUTO-UPGRADE",value:"0 MIN DAYS",detail:"Target hit → funded. 24/7 on-demand USDC payouts."},
    {firm:"VEST",signal:"SAME-DAY FUNDING",value:"IMMEDIATE",detail:"Pass the evaluation, get funded the same day; withdrawals settle to wallet."},
    {firm:"HYPERPNL",signal:"CODE-ENFORCED",value:"NO QUEUE",detail:"Smart-contract payouts with no manual approval queue."}
  ];

  return <section className="speed-manifesto" id="speed">
    <div className="speed-kicker"><span>00</span><i/> CAPITAL VELOCITY</div>

    <div className="speed-title-grid">
      <div>
        <h2>TIME<br/>IS A <em>FEE.</em></h2>
      </div>
      <div className="speed-thesis-copy">
        <p>A challenge fee is obvious. Waiting is not.</p>
        <p>Minimum trading days, payout windows, activation delays, manual reviews and slow settlement all lock capital in place. That lockup has a cost even when the sticker price looks cheap.</p>
        <strong>The game is not only return on risk. It is return on risk <u>per unit of time.</u></strong>
      </div>
    </div>

    <div className="speed-loop" aria-label="Web3 prop capital loop">
      {steps.map((step,index)=><div className="speed-step" key={step.label}>
        <div className="speed-step-top"><span>{step.n}</span><b>{step.label}</b></div>
        <strong>{step.value}</strong>
        <p>{step.copy}</p>
        {index<steps.length-1 && <i className="speed-arrow" aria-hidden="true">→</i>}
      </div>)}
    </div>

    <div className="speed-contrast">
      <article className="speed-old">
        <div className="speed-card-label">TRADITIONAL FRICTION STACK</div>
        <div className="speed-path">
          <span>BUY</span><i>→</i><span>EVAL DAYS</span><i>→</i><span>PASS</span><i>→</i><span>ACTIVATION</span><i>→</i><span>FUNDED DAYS</span><i>→</i><span>PAYOUT WINDOW</span><i>→</i><span>REVIEW</span><i>→</i><span>PAYMENT RAIL</span>
        </div>
        <div className="speed-cost">SAME P&amp;L. <b>MORE CALENDAR.</b></div>
      </article>

      <article className="speed-new">
        <div className="speed-card-label">WEB3 FAST LANE</div>
        <div className="speed-path">
          <span>BUY</span><i>→</i><span>TRADE</span><i>→</i><span>PASS</span><i>→</i><span>FUNDED</span><i>→</i><span>PROFIT</span><i>→</i><span>WALLET</span>
        </div>
        <div className="speed-cost">LESS DEAD TIME. <b>MORE CAPITAL TURNS.</b></div>
      </article>
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
      <p>Sticker price tells you what it costs to enter. Time-to-cash tells you what the entire machine costs to operate.</p>
    </div>
  </section>;
}
