import {useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,Wallet,ShieldCheck,Check,ChevronRight,RotateCcw,Target,MousePointerClick,LockKeyhole} from 'lucide-react';
import './vest-pdf.css';

const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(n);
const stages=[
 ['Load the risk.','$250 goes into the machine.','Decide the dollar risk before the trade exists. This example uses $250 of planned price risk over a 30-point invalidation. If the remaining drawdown cannot absorb it, the machine stays off.'],
 ['Run the setup.','One setup. One invalidation.','Wait for the trade you actually planned. Entry, stop and target are mapped before execution. The account is not an ATM if you force trades just because you want a withdrawal.'],
 ['Lock the exit.','Make green become realized.','Open P&L is still live risk. When price reaches the planned take-profit area, a resting reduce-only limit can define the exit price you will accept. Confirm the fill before you count a dollar.'],
 ['Dispense it.','Live → Primary → wallet.','Eligible realized profit gets claimed from the funded portfolio, lands in Primary, then leaves the platform to your wallet. The wallet is the finish line.']
];

const winBars=[
 {o:18304,c:18309,h:18313,l:18299},{o:18309,c:18316,h:18319,l:18306},{o:18316,c:18312,h:18320,l:18308},
 {o:18312,c:18322,h:18325,l:18310},{o:18322,c:18330,h:18334,l:18319},{o:18330,c:18326,h:18333,l:18322},
 {o:18326,c:18320,h:18329,l:18316},{o:18320,c:18318,h:18324,l:18314},{o:18318,c:18324,h:18327,l:18316},
 {o:18324,c:18331,h:18334,l:18322},{o:18331,c:18337,h:18340,l:18329},{o:18337,c:18343,h:18346,l:18334},
 {o:18343,c:18348,h:18351,l:18340},{o:18348,c:18352,h:18355,l:18345}
];
const lossBars=[
 {o:18304,c:18309,h:18313,l:18299},{o:18309,c:18316,h:18319,l:18306},{o:18316,c:18312,h:18320,l:18308},
 {o:18312,c:18322,h:18325,l:18310},{o:18322,c:18330,h:18334,l:18319},{o:18330,c:18326,h:18333,l:18322},
 {o:18326,c:18320,h:18329,l:18316},{o:18320,c:18318,h:18324,l:18314},{o:18318,c:18314,h:18320,l:18311},
 {o:18314,c:18308,h:18317,l:18304},{o:18308,c:18301,h:18311,l:18297},{o:18301,c:18295,h:18304,l:18291},
 {o:18295,c:18289,h:18298,l:18286}
];

function TerminalChart({outcome='win',compact=false,showFill=true}){
 const bars=outcome==='loss'?lossBars:winBars;
 const min=18282,max=18358,top=34,bottom=318,left=54,right=676,width=right-left;
 const y=p=>top+(max-p)/(max-min)*(bottom-top);
 const x=i=>left+i*(width/(bars.length-1));
 const entry=18320,target=18350,stop=18290;
 return <div className={'atm-terminal-chart '+(compact?'compact':'')}>
  <div className="atm-chart-toolbar"><span><i/> NQ / ATM FEED</span><b>{outcome==='loss'?'STOP SCENARIO':'TAKE-PROFIT SCENARIO'}</b><span>SIMULATION</span></div>
  <svg viewBox="0 0 720 350" role="img" aria-label={outcome==='loss'?'Illustrative NQ trade reaching the stop':'Illustrative NQ trade reaching a resting take-profit limit'}>
   <defs>
    <linearGradient id={'atm-profit-'+outcome} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#d6c69e" stopOpacity=".16"/><stop offset="1" stopColor="#d6c69e" stopOpacity="0"/></linearGradient>
    <linearGradient id={'atm-loss-'+outcome} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a87580" stopOpacity=".10"/><stop offset="1" stopColor="#a87580" stopOpacity="0"/></linearGradient>
   </defs>
   {[18290,18305,18320,18335,18350].map(p=><g key={p}><line x1={left} x2={right} y1={y(p)} y2={y(p)} className="atm-grid-line"/><text x="9" y={y(p)+4} className="atm-axis">{p.toFixed(0)}</text></g>)}
   <rect x={x(6)-16} y={y(target)} width={right-(x(6)-16)} height={y(entry)-y(target)} fill={'url(#atm-profit-'+outcome+')'}/>
   <rect x={x(6)-16} y={y(entry)} width={right-(x(6)-16)} height={y(stop)-y(entry)} fill={'url(#atm-loss-'+outcome+')'}/>
   <line x1={x(6)-20} x2={right} y1={y(entry)} y2={y(entry)} className="atm-level entry"/>
   <line x1={x(6)-20} x2={right} y1={y(target)} y2={y(target)} className="atm-level target"/>
   <line x1={x(6)-20} x2={right} y1={y(stop)} y2={y(stop)} className="atm-level stop"/>
   <g className="atm-chart-label entry-label"><rect x={right-122} y={y(entry)-13} width="118" height="25" rx="2"/><text x={right-111} y={y(entry)+4}>ENTRY 18,320</text></g>
   <g className="atm-chart-label target-label"><rect x={right-145} y={y(target)-13} width="141" height="25" rx="2"/><text x={right-134} y={y(target)+4}>LIMIT TP 18,350</text></g>
   <g className="atm-chart-label stop-label"><rect x={right-129} y={y(stop)-13} width="125" height="25" rx="2"/><text x={right-118} y={y(stop)+4}>STOP 18,290</text></g>
   {bars.map((b,i)=>{const xi=x(i),up=b.c>=b.o;return <g key={i} className={up?'atm-candle up':'atm-candle down'}><line x1={xi} x2={xi} y1={y(b.h)} y2={y(b.l)}/><rect x={xi-6} y={Math.min(y(b.o),y(b.c))} width="12" height={Math.max(2,Math.abs(y(b.c)-y(b.o)))} rx="1"/></g>})}
   <circle cx={x(7)} cy={y(entry)} r="5" className="atm-entry-dot"/>
   <text x={x(7)-35} y={y(entry)+31} className="atm-note">RETEST / ENTRY</text>
   {outcome==='win'&&showFill&&<g className="atm-fill-badge"><circle cx={x(12)} cy={y(target)} r="12"/><path d={'M'+(x(12)-5)+' '+y(target)+' l4 4 8 -9'}/><rect x={x(12)-50} y={y(target)-52} width="100" height="24" rx="2"/><text x={x(12)-37} y={y(target)-36}>LIMIT FILLED</text></g>}
   {outcome==='loss'&&<g className="atm-stop-badge"><circle cx={x(12)} cy={y(stop)} r="11"/><path d={'M'+(x(12)-4)+' '+(y(stop)-4)+' l8 8 M'+(x(12)+4)+' '+(y(stop)-4)+' l-8 8'}/><text x={x(12)-39} y={y(stop)+31}>STOP FILLED</text></g>}
  </svg>
  <div className="atm-chart-tape"><span>RISK <b>$250</b></span><span>RANGE <b>30 PT</b></span><span>EXPOSURE <b>$8.33 / PT</b></span><span className={outcome==='loss'?'loss':'win'}>{outcome==='loss'?'−1.00R':'REALIZED +1.00R'}</span></div>
 </div>
}

function ExitCompare(){
 return <div className="atm-exit-compare">
  <div className="atm-compare-head"><span>PROFIT EXIT / SAME TRADE</span><b>HOW YOU LEAVE MATTERS</b></div>
  <div className="atm-compare-track"><span className="atm-compare-entry">ENTRY</span><span className="atm-compare-run"/><span className="atm-compare-target">TARGET</span></div>
  <div className="atm-compare-row limit"><div><Target size={17}/><span>RESTING LIMIT</span></div><strong>18,350.00</strong><small>Defines the minimum sell price. Fill still required.</small><b>PRICE CONTROL</b></div>
  <div className="atm-compare-row market"><div><MousePointerClick size={17}/><span>MARKET EXIT</span></div><strong>BEST AVAILABLE</strong><small>Prioritizes getting flat now. Fill can differ from screen.</small><b>EXECUTION CONTROL</b></div>
 </div>
}

function CashRail(){
 const nodes=[
  ['01','LIVE FUNDED','Realized profit'],
  ['02','CLAIM PROFIT','Eligible amount requested'],
  ['03','PRIMARY','USDC arrives'],
  ['04','YOUR WALLET','Funds leave the machine']
 ];
 return <div className="atm-cash-rail"><div className="atm-rail-line"/>{nodes.map((n,i)=><div className={'atm-rail-node '+(i===3?'final':'')} key={n[0]}><span className="atm-rail-index">{n[0]}</span><div className="atm-rail-port">{i===3?<Wallet size={22}/>:<Check size={18}/>}</div><strong>{n[1]}</strong><small>{n[2]}</small>{i<3&&<ArrowRight size={16} className="atm-rail-arrow"/>}</div>)}</div>
}

export default function VestPdf(){
 const [step,setStep]=useState(0),[split,setSplit]=useState(80),[outcome,setOutcome]=useState('win');
 const gross=outcome==='win'?250:-250,net=gross-8,claim=Math.max(0,net)*split/100;
 useEffect(()=>{const old=document.title;document.title='Lesson 01 · Vest ATM | GIGAPROP';return()=>{document.title=old}},[]);
 function begin(){document.getElementById('atm-playbook')?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 return <main className="atm"><div className="atm-shell">
  <nav className="atm-nav"><a className="atm-gp" href="#">GP.</a><span>THE FIELD GUIDE <i>/</i> LESSON 01</span><a href="#leaderboard">Trader league <ArrowUpRight size={14}/></a></nav>

  <section className="atm-hero">
   <div className="atm-hero-art" aria-hidden="true"><span>01</span><img src="/brands/vest-symbol.svg" alt=""/></div>
   <div className="atm-eyebrow"><span/> GIGAPROP EDUCATION <i>×</i> VEST</div>
   <div className="atm-hero-copy"><h1>VEST<br/><em>ATM.</em></h1><p className="atm-manifesto">Risk goes in.<br/>Realized profit comes out.<br/><strong>Dispense to wallet.</strong></p><p className="atm-intro">Treat the funded account like a machine:<br/>one planned trade, one verified exit,<br/>then extract eligible profit.</p><button className="atm-primary" onClick={begin}>Enter the machine <ArrowRight size={17}/></button></div>
   <div className="atm-hero-receipt"><div className="atm-machine-status"><span><i/> ATM ONLINE</span><b>VEST / FUNDED</b></div><div className="atm-receipt-top"><img src="/brands/vest-symbol.svg" alt="Vest"/><span>WITHDRAWAL ENGINE / 001</span><ShieldCheck size={18}/></div><small>PLANNED INPUT / MAX PRICE RISK</small><div className="atm-risk"><span>$</span>250<span>.00</span></div><div className="atm-receipt-line"><span>Invalidation</span><b>30 PT</b></div><div className="atm-receipt-line"><span>Exposure</span><b>≈ $8.33 / PT</b></div><div className="atm-receipt-line"><span>Profit exit</span><b>REDUCE-ONLY LIMIT</b></div><div className="atm-receipt-bottom"><span>OPEN P&L IS NOT CASH.<br/>FILLED P&L IS.</span><span>GP / ATM</span></div><div className="atm-card-slot"><span/></div></div>
   <div className="atm-hero-bottom"><span>01 / THE VEST ATM METHOD</span><span>TRADE → FILL → CLAIM → WALLET</span><span>SCROLL TO DISPENSE ↓</span></div>
  </section>

  <div className="atm-principles">
   <div><span>01</span><p>Load the risk.<strong>Decide the loss before the trade.</strong></p></div>
   <div><span>02</span><p>Lock the exit.<strong>Green means nothing until filled.</strong></p></div>
   <div><span>03</span><p>Dispense it.<strong>The wallet is the finish line.</strong></p></div>
  </div>

  <section className="atm-playbook" id="atm-playbook">
   <div className="atm-section-head"><span className="atm-label">THE MACHINE / FOUR MOVES</span><h2>Stop trading the balance.<br/><em>Operate the machine.</em></h2><p>The ATM idea is deliberately simple: define the risk, wait for the setup, realize the exit, then move eligible profit away from the trading account.</p></div>
   <div className="atm-workspace">
    <div className="atm-step-list" role="tablist" aria-label="The Vest ATM process">{stages.map((s,i)=><button id={'atm-tab-'+i} role="tab" aria-selected={step===i} aria-controls="atm-panel" key={s[0]} onClick={()=>setStep(i)} className={step===i?'active':''}><span>0{i+1}</span><b>{s[0]}</b><ChevronRight size={18}/></button>)}</div>
    <div id="atm-panel" className="atm-step-panel" role="tabpanel" aria-labelledby={'atm-tab-'+step}><span className="atm-panel-number" aria-hidden="true">0{step+1}</span><div className="atm-panel-status"><span className="atm-label">{step===3?'DISPENSE RAIL':'MACHINE SCREEN'}</span><b>{['RISK LOADED','SETUP ARMED','EXIT ARMED','CASH ROUTE'][step]}</b></div><h3>{stages[step][1]}</h3><p>{stages[step][2]}</p>{step<3?<TerminalChart outcome={step===0?'loss':'win'} compact showFill={step===2}/>:<CashRail/>}<button className="atm-text-button" onClick={()=>setStep((step+1)%4)}>{step===3?'Cycle the machine':'Next move'} <ArrowRight size={15}/></button></div>
   </div>
  </section>

  <section className="atm-exit-school">
   <div className="atm-section-head"><span className="atm-label">THE PROFIT SLOT / EXIT DISCIPLINE</span><h2>Do not admire the green.<br/><em>Extract it.</em></h2><p>The trade is not finished because the screen looks good. Your exit method determines whether that green P&amp;L becomes a clean realized number or gets chewed up while you leave.</p></div>
   <div className="atm-exit-grid">
    <article className="atm-exit-card atm-exit-card-limit"><div className="atm-exit-icon"><Target size={22}/></div><span className="atm-label">THE CLEAN EXIT</span><h3>Rest the reduce-only limit.</h3><p>Put the take-profit where the trade thesis says it belongs. Let price come to the order instead of automatically crossing the spread when the screen turns green.</p><div className="atm-order-ticket"><div><small>POSITION</small><b>LONG</b></div><div><small>ORDER</small><b>LIMIT SELL</b></div><div><small>REDUCE ONLY</small><b>YES</b></div><div><small>ENTRY</small><b>18,320</b></div><div><small>TARGET</small><b>18,350</b></div><div><small>STATUS</small><b>RESTING</b></div></div><div className="atm-exit-callout"><LockKeyhole size={17}/><p><strong>What it does:</strong> controls the minimum sell price you accept. What it does not do: guarantee a fill.</p></div></article>
    <article className="atm-exit-card"><ExitCompare/><div className="atm-exit-callout subtle"><p><strong>Machine rule:</strong> a resting limit is still just an instruction. Until it fills, the position is live and the P&amp;L can move.</p></div></article>
   </div>
   <div className="atm-exit-rule"><span>GP / CASH EXTRACTION SEQUENCE</span><strong>Target trades → limit fills → position reads flat → P&amp;L is realized → only then does the ATM have something to dispense.</strong><p>No fill, no cash. Partial fill, partial exit. Always verify the actual position before mentally spending the profit.</p></div>
  </section>

  <section className="atm-lab">
   <div className="atm-section-head"><span className="atm-label">SETTLEMENT CONSOLE</span><h2>The trade is one number.<br/><em>Your cash is another.</em></h2><p>Flip the outcome and watch the machine settle the trade through execution costs and your selected split.</p></div>
   <div className="atm-lab-grid">
    <div className="atm-trade-terminal"><div className="atm-terminal-top"><span><span className="atm-live-dot"/> NQ / LIVE SIMULATION</span><span>ATM CONSOLE / 01</span></div><div className="atm-outcomes" aria-label="Trade outcome">{['win','loss'].map(x=><button key={x} aria-pressed={outcome===x} className={outcome===x?'active':''} onClick={()=>setOutcome(x)}>{x==='win'?'TAKE PROFIT · +30 PT':'STOP · −30 PT'}</button>)}</div><TerminalChart outcome={outcome}/><div className="atm-terminal-stats"><div><small>PLANNED RISK</small><b>$250</b></div><div><small>EXPOSURE</small><b>$8.33<span> / PT</span></b></div><div><small>GROSS RESULT</small><b className={outcome==='win'?'atm-positive':'atm-negative'}>{money(gross)}</b></div></div><p>Stops and limits control instructions, not guaranteed final dollars. Fees, slippage, partial fills and fast markets can change the realized result.</p></div>
    <div className="atm-settlement"><div className="atm-settlement-head"><span className="atm-label">ATM SETTLEMENT RECEIPT</span><b>{outcome==='win'?'APPROVED':'NO DISPENSE'}</b></div><img className="atm-settlement-mark" src="/brands/vest-symbol.svg" alt=""/><div className="atm-split"><span>Profit split</span><div>{[80,90,95].map(n=><button key={n} aria-pressed={split===n} onClick={()=>setSplit(n)} className={split===n?'active':''}>{n}%</button>)}</div></div><dl><div><dt>Gross trade result</dt><dd>{money(gross)}</dd></div><div><dt>Illustrative execution costs</dt><dd>−$8.00</dd></div><div className="major"><dt>Net realized result</dt><dd>{money(net)}</dd></div><div><dt>{outcome==='win'?'Your share · '+split+'%':'Claimable from this trade'}</dt><dd>{money(claim)}</dd></div></dl><div className={'atm-takehome '+(outcome==='loss'?'disabled':'')} aria-live="polite"><small>{outcome==='win'?'DISPENSABLE / ILLUSTRATIVE':'MACHINE LOCKED'}</small><strong>{money(claim)}<span> USDC</span></strong><p>{outcome==='win'?'Realize it. Claim it. Move it to your wallet.':'A losing trade does not create claimable profit. The machine waits.'}</p><div className="atm-dispense-slot"><i/><i/><i/></div></div><small className="atm-assumption">Illustration assumes an eligible funded account, no prior deficit and $8 total trading costs. Actual realized P&amp;L, split and claimable balance govern.</small></div>
   </div>
  </section>

  <section className="atm-cashout">
   <img src="/brands/vest-symbol.svg" alt=""/><span className="atm-cashout-ghost" aria-hidden="true">OUT.</span>
   <div className="atm-section-head"><span className="atm-label">THE DISPENSE RAIL</span><h2>The account is the machine.<br/><em>Your wallet is the cash tray.</em></h2><p>The ATM metaphor only makes sense if realized profit actually leaves the trading account. The end state is funds you control outside the funded portfolio.</p></div>
   <CashRail/>
   <div className="atm-benefits">
    <article><RotateCcw size={22}/><span>01 / RELOAD</span><h3>Another claim starts with another valid trade.</h3><p>The machine does not need constant action. It needs eligible profit and a process you can repeat without forcing setups.</p></article>
    <article><Wallet size={22}/><span>02 / DISPENSE</span><h3>Platform balance is not the finish line.</h3><p>Primary is a staging point. The cleanest mental model ends with USDC in the wallet you control.</p></article>
    <article><ShieldCheck size={22}/><span>03 / SEPARATE</span><h3>Withdrawn funds leave account risk behind.</h3><p>Money already withdrawn is outside the funded account. The next trade only works with whatever drawdown remains inside the machine.</p></article>
   </div>
   <div className="atm-timing"><span>CLAIM TIMING</span><p>Vest currently lists <b>24 hours per profit claim.</b> Claiming from Live Funded and withdrawing from Primary are separate actions.</p><a href="https://docs.vestmarkets.com/vest-capital/claiming-profit" target="_blank" rel="noopener noreferrer">Read Vest’s rules <ArrowUpRight size={14}/></a></div>
  </section>

  <section className="atm-finish"><div className="atm-finish-machine" aria-hidden="true"><span/><span/><span/></div><span className="atm-label">LESSON 01 / MACHINE LOGIC</span><h2>One clean win.<br/><em>One clean extraction.</em><br/>Then wait.</h2><p>Win: verify the fill, check what is eligible, claim, withdraw.<br/>Lose: the machine dispenses nothing. Protect what remains.<br/>Either way, do not manufacture another trade just to make the ATM move.</p><a className="atm-primary" href="https://next.vestmarkets.com/r/isgigaprop" target="_blank" rel="sponsored noopener noreferrer">Open Vest · 5% off <ArrowUpRight size={17}/></a><small>GP referral · GIGAPROP may earn a commission.</small></section>

  <footer className="atm-footer"><a className="atm-gp" href="#">GP.</a><span>THE FIELD GUIDE / VEST ATM</span><p>Educational illustration, not a proven trading edge or guaranteed payout. Size against your account’s actual drawdown and execution conditions.</p><a href="#leaderboard">Enter the league <ArrowUpRight size={14}/></a></footer>
 </div></main>;
}
