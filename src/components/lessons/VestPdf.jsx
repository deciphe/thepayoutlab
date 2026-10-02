import {useEffect} from 'react';
import {ArrowUpRight,Download,ArrowLeft} from 'lucide-react';
import './vest-pdf.css';
export default function VestPdf(){
 useEffect(()=>{const prior=document.title;document.title='VestATM · The 30-point payout playbook | GIGAPROP';return()=>{document.title=prior}},[]);
 return <main className="vp"><header className="vp-nav"><a className="vp-brand" href="#">GP.</a><span>COLLECTOR EDITION / VESTATM</span><a className="vp-download" href="/lessons/VestATM-GIGAPROP.pdf?v=2" download><Download size={15}/>Download PDF</a></header>
 <section className="vp-heading"><div><span>THE EXECUTION SERIES / 01</span><h1>Small target. Repeatable process.</h1><p>Trade. Realize. Claim. Withdraw. A two-page VestATM playbook.</p></div><a href="#leaderboard">Trader league <ArrowUpRight size={15}/></a></section>
 <div className="vp-pages"><figure><img src="/lessons/vestatm-1.svg?v=2" width="900" height="1273" alt="VestATM page 1: layered illustrative 250 USDC payout cards, benefits of repeat claims, and the setup, realize, claim, withdraw cycle. Vest lists 24-hour claim processing; external withdrawal is separate."/></figure><figure><img src="/lessons/vestatm-2.svg?v=2" width="900" height="1273" alt="VestATM page 2: a long at 30,000 targets 30,030 with a stop at 29,970. 250 gross profit requires approximately 8.33 dollars per point. An illustrative 250 payout after an 80 percent split and 8 dollars in costs requires about 10.68 dollars per point. Claim from Live, then withdraw from Primary."/></figure></div>
 <footer className="vp-footer"><a href="#"><ArrowLeft size={14}/>Back to GIGAPROP</a><a className="vp-download" href="/lessons/VestATM-GIGAPROP.pdf?v=2" download><Download size={15}/>Keep the two-page lesson</a><p>Educational plan, not a guaranteed payout. Account rules and execution costs apply.</p></footer></main>;
}
