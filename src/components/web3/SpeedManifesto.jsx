import {ArrowUpRight} from 'lucide-react';
export default function SpeedManifesto({about,firms,onOpen}){
  return <section className="review-hero gp-hero-console" id="speed">
    <div className="review-hero-copy"><span className="gp-eyebrow">GIGAPROP / WEB3 PROP FIRM REVIEWS</span>
      <h1>Choose the firm.<br/><em>Know the trade-off.</em></h1>
      <p>My shortlist for buying power, trading costs and getting paid. The upside, the catch, and the rules that matter.</p>
      <div className="review-hero-actions"><a className="gp-primary-link" href="#field">Compare the firms <ArrowUpRight size={16}/></a>{about}</div>
    </div>
    <aside className="gp-firm-radar" aria-label="Explore the shortlist"><div className="gp-radar-heading"><span>THE FIELD</span><span>05 / FIRMS</span></div><div className="gp-radar-stage"><svg viewBox="0 0 400 340" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="200" cy="168" rx="145" ry="118"/><ellipse cx="200" cy="168" rx="88" ry="74"/>{[[90,60],[310,60],[60,221],[340,221],[200,289]].map(([x,y],i)=><path key={i} d={`M 200 168 Q ${x} 168 ${x} ${y}`}/>)}</svg><a href="#field" className="gp-radar-core" aria-label="Compare all five firms">GP<span>.</span></a>{firms.map((firm,i)=><button key={firm.id} className={'gp-radar-firm gp-radar-firm-'+i} onClick={()=>onOpen(firm.id)} aria-label={'Explore '+firm.name+' from the overview'}><span className="gp-radar-logo"><img src={firm.logo} alt=""/></span><span>{firm.name}</span><ArrowUpRight size={11}/></button>)}</div><div className="gp-radar-foot"><span>Independent perspective.</span><span>Tap to explore <ArrowUpRight size={11}/></span></div></aside>
  </section>;
}
