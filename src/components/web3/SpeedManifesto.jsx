import { certificates } from "../payoutlab/data";
export default function SpeedManifesto(){
  const total = certificates.reduce((sum,c)=>sum+c.amountNum,0);
  return <section className="review-hero" id="speed">
    <div className="review-hero-copy"><span className="gp-eyebrow">GIGAPROP / WEB3 PROP FIRM REVIEWS</span>
      <h1>Choose the firm.<br/><em>Know the trade-off.</em></h1>
      <p>My shortlist for buying power, trading costs and getting paid. The upside, the catch, and the rules that matter.</p>
      <div className="review-hero-actions"><a className="gp-primary-link" href="#field">Compare the firms <span aria-hidden="true">↗</span></a><a href="#reviewer">Meet the trader behind it <span aria-hidden="true">→</span></a></div>
    </div>
    <aside className="hero-editor-note proof-headline"><span className="gp-eyebrow">MY PAYOUT ARCHIVE</span><strong className="proof-grand">${Math.floor(total).toLocaleString("en-US")}</strong><p>{certificates.length} payout records. Six firms.</p><div className="hero-proof-list">{['Maven','Topstep','Tradeify','Lucid Trading','FundedNext','Breakout'].map(firm=><span key={firm}>{firm}<b>${certificates.filter(c=>c.firm===firm).reduce((s,c)=>s+c.amountNum,0).toLocaleString("en-US",{maximumFractionDigits:2})}</b></span>)}</div><a href="#reviewer">Explore the payout proof</a><small>Recorded certificate amounts, not net profit.</small></aside>
  </section>;
}
