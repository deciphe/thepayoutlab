import {useState} from 'react';
import {ArrowUpRight, ChevronDown} from 'lucide-react';
import './novapass.css';

// Observed on Hypernova's public assessment selector, 2026-09-30 UTC.
// A dated source snapshot, not a live or independently audited feed.
const programs = [
  {id:'tight',name:'Tight',rate:19.0,target:9,drawdown:3,daily:3},
  {id:'low',name:'Low',rate:19.5,target:10,drawdown:6,daily:3},
  {id:'medium',name:'Medium',rate:30.9,target:10,drawdown:7,daily:4},
];
export default function NovaPass(){
  const [open,setOpen]=useState(false);
  const [selected,setSelected]=useState('medium');
  const program=programs.find(p=>p.id===selected);
  return <div className={'nova-pass'+(open?' is-open':'')} id="novapass">
    <button className="np-toggle" aria-expanded={open} aria-controls="np-panel" onClick={()=>setOpen(!open)}>
      <span className="np-identity"><span className="np-mark" aria-hidden="true">N<span>↗</span></span><span><strong>NovaPass</strong><small>HYPERNOVA / PROGRAM STATS</small></span></span>
      <span className="np-teaser"><strong>30.9% <span>pass rate</span></strong><small>Medium Risk · more room to trade</small></span>
      <span className="np-open-label">Compare programs <ChevronDown size={16}/></span>
    </button>
    <div id="np-panel" className="np-collapse" inert={open?undefined:''} aria-hidden={!open}>
      <div className="np-panel-inner"><div className="np-content">
        <div className="np-programs" role="group" aria-label="Select a risk program">
          {programs.map(p=><button key={p.id} className={'np-program'+(selected===p.id?' is-selected':'')} aria-pressed={selected===p.id} onClick={()=>setSelected(p.id)}><span className="np-program-top"><span>{p.name} Risk</span><strong>{p.rate.toFixed(1)}<small>%</small></strong></span><span className="np-bar" aria-hidden="true"><i style={{width:`${p.rate/35*100}%`}}/></span><span className="np-program-note">{p.id==='medium'?'Highest reported pass rate':'Resolved assessments'}</span></button>)}
        </div>
        <div className="np-detail" aria-live="polite" aria-atomic="true">
          <div className="np-story"><span className="np-kicker">{program.name.toUpperCase()} RISK</span><h3>{selected==='medium'?'More breathing room.':'Your rules. At a glance.'}</h3><p>{selected==='medium'?<><b>+11.4 percentage points</b> above Low Risk’s reported pass rate.</>:'Compare the target and loss limits behind the pass rate.'}</p></div>
          <dl className="np-rules"><div><dt>Pass rate</dt><dd className="np-purple">{program.rate.toFixed(1)}%</dd></div><div><dt>Max drawdown</dt><dd>{program.drawdown}%</dd></div><div><dt>Daily loss limit</dt><dd>{program.daily}%</dd></div><div><dt>Profit target</dt><dd>{program.target}%</dd></div></dl>
        </div>
        <div className="np-bottom"><p>Reported by <a href="https://hypernova.xyz/" target="_blank" rel="noopener noreferrer">Hypernova ↗</a> · Snapshot Sep 29, 2026 (ET)<br/>Resolved assessments; historical outcomes, not individual odds.</p><div><a className="np-flow" href="#novaflow">Payout flow <ArrowUpRight size={12}/></a><a className="np-cta" href="https://hn.xyz/r/4sjg1b" target="_blank" rel="sponsored noopener noreferrer">Explore Hypernova <ArrowUpRight size={13}/><small>Referral link</small></a></div></div>
      </div></div>
    </div>
  </div>;
}
