import {useEffect} from 'react';
import {ArrowUpRight,Download,ArrowLeft} from 'lucide-react';
import './vest-pdf.css';
export default function VestPdf(){
 useEffect(()=>{const prior=document.title;document.title='VestATM · The 30-point payout playbook | GIGAPROP';return()=>{document.title=prior}},[]);
 return <main className="vp"><header className="vp-nav"><a className="vp-brand" href="#">GP.</a><span>FIELD NOTES / VESTATM</span><a className="vp-download" href="/lessons/VestATM-GIGAPROP.pdf" download><Download size={15}/>Download PDF</a></header>
 <section className="vp-heading"><div><span>THE EXECUTION SERIES / 01</span><h1>The 30-point playbook.</h1><p>Two setups. Defined exits. The math behind a 250 USDC payout target.</p></div><a href="#leaderboard">Trader league <ArrowUpRight size={15}/></a></section>
 <div className="vp-pages"><figure><img src="/lessons/vestatm-1.svg" width="900" height="1273" alt="VestATM page 1: a 30-point take-profit and stop-loss plan using impulse retests or rejection at a pre-marked level. Long setups illustrated; reverse for shorts. These templates do not establish a profitable edge."/></figure><figure><img src="/lessons/vestatm-2.svg" width="900" height="1273" alt="VestATM page 2: a long at 30,000 targets 30,030 with a stop at 29,970. 250 gross profit requires approximately 8.33 dollars per point. An illustrative 250 payout after an 80 percent split and 8 dollars in costs requires about 10.68 dollars per point. Claim from Live, then withdraw from Primary."/></figure></div>
 <footer className="vp-footer"><a href="#"><ArrowLeft size={14}/>Back to GIGAPROP</a><a className="vp-download" href="/lessons/VestATM-GIGAPROP.pdf" download><Download size={15}/>Keep the two-page lesson</a><p>Educational plan, not a guaranteed payout. Account rules and execution costs apply.</p></footer></main>;
}
