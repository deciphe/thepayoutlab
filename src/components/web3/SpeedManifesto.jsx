export default function SpeedManifesto(){
  return <section className="speed-manifesto" id="speed">
    <div className="speed-copy">
      <span className="gp-eyebrow">WEB3 PROP TRADING</span>
      <h1>SAME CLOCK.<br/><em>MORE TURNS.</em></h1>
      <p>Less time waiting. More time trading.<br/>Compare the firms that get capital moving.</p>
      <a className="gp-primary-link" href="#field">Explore the firms <span aria-hidden="true">↗</span></a>
    </div>
    <figure className="speed-visual" aria-label="Illustration comparing payout waiting periods with shorter payout cycles">
      <div className="speed-visual-head"><span>TIME TO CASH</span><span>THE DIFFERENCE</span></div>
      <div className="speed-track slow">
        <div className="speed-track-title"><b>Traditional</b><span>The waiting adds up</span></div>
        <div className="speed-delays">{['Minimum days','Activation','Payout window','Review'].map((step,i)=><span key={step} style={{'--step':i}}>{step}</span>)}</div>
        <div className="speed-rail"><i/></div>
        <div className="speed-end"><span>Trade</span><span>Payout</span></div>
      </div>
      <div className="speed-track fast">
        <div className="speed-track-title"><b>Web3</b><span>A shorter path back to cash</span></div>
        <div className="speed-rounds">{[0,1,2].map(i=><div key={i} style={{'--cycle':i}}><span>Trade</span><i aria-hidden="true">→</i><strong>Payout</strong><i aria-hidden="true">↻</i></div>)}</div>
      </div>
      <figcaption>Illustrative flow. Passing, profit and each firm’s payout rules still apply.</figcaption>
    </figure>
  </section>;
}
