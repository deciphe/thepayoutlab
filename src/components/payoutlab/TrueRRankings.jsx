import "./handbook.css";
import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { firms, unscoredFirms, certificates } from "./data";

function ScoreMeter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, value]);
  return <div ref={ref} className="flex items-center gap-3"><div className="relative h-2 w-28 overflow-hidden rounded-full bg-prism"><motion.div initial={{ width: 0 }} animate={inView ? { width: `${(value / 10) * 100}%` } : {}} transition={{ duration: 1.4 }} className="absolute inset-y-0 left-0 rounded-full bg-lucid" /></div><span className="font-mono-lab text-sm font-semibold text-lucid tabular-nums">{display.toFixed(1)}</span></div>;
}

const reviewLens = {
  "Maven": "My most proven prop firm by a wide margin. This is the deepest payout history in the archive, the relationship I trust most, and the firm behind my biggest body of realized payout proof.",
  "Lucid Trading": "Speed is central to my rating. I compare the full time to cash with the account's drawdown and withdrawal conditions, not just the transfer step.",
  "FundedNext": "My receipt history is the starting point. Costs, execution, eligibility and payout windows all belong in the decision.",
  "Tradeify": "I judge the account on what remains after the journey. Account cost and withdrawal conditions matter alongside the payouts.",
  "Breakout": "Higher trading costs can still make sense when access is faster. Smaller payouts matter when they reach me sooner; repetition is never assumed.",
  "Topstep": "My history spans multiple payouts. The economics still depend on subscriptions, resets, loss limits and the payout path for the specific account."
};

const mavenFirm = {
  rank: 1,
  name: "Maven",
  logoText: "M",
  trueR: 9.9,
  avgTime: "Proven over time",
  notes: "My #1. Most trusted, most proven, and the deepest payout record in the archive. Maven is the benchmark the rest of the list has to beat.",
};

const rankedFirms = [
  mavenFirm,
  ...firms.filter(f => f.name !== "Maven").map((firm, index) => ({ ...firm, rank: index + 2 })),
];

function FirmPlate({ firm }) {
  const records = certificates.filter(c => c.firm === firm.name);
  const total = records.reduce((sum,c) => sum + c.amountNum,0);
  const largest = records.length ? Math.max(...records.map(c => c.amountNum)) : 0;
  const isMaven = firm.name === "Maven";

  return <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className={`group relative grid grid-cols-1 gap-6 border-t border-border p-6 transition-colors hover:bg-prism/40 md:grid-cols-12 md:items-center md:gap-4 md:p-8 ${isMaven ? "bg-lucid/[0.035]" : ""}`}>
    <div className="md:col-span-1"><div className="font-display font-bold leading-none text-transparent" style={{fontSize:"clamp(2.5rem, 5vw, 4rem)",WebkitTextStroke:isMaven ? "1px rgba(255,255,255,0.9)" : "1px rgba(247,247,247,0.5)"}}>{String(firm.rank).padStart(2,"0")}</div></div>
    <div className="md:col-span-3"><div className="flex items-center gap-3">{firm.logo ? <div className="min-w-0"><img src={firm.logo} alt={firm.name} className="mb-3 h-auto w-44 max-w-full" /><div className="font-mono-lab text-[10px] uppercase tracking-wider text-muted-foreground">{records.length} payout records · {firm.avgTime}</div></div> : <><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-prism font-display text-sm font-bold text-spectral">{firm.logoText}</div><div><div className="font-display text-xl font-semibold text-spectral">{firm.name}</div><div className="font-mono-lab text-[11px] uppercase tracking-widest text-muted-foreground">{records.length} payout records · {firm.avgTime}</div>{isMaven && <div className="mt-2 font-mono-lab text-[9px] uppercase tracking-[0.24em] text-lucid">gigaprop #1 / flagship pick</div>}</div></>}</div></div>
    <div className="md:col-span-4"><div className="font-mono-lab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">True R / personal score</div><div className="mt-2"><ScoreMeter value={firm.trueR} /></div><p className="mt-3 max-w-sm font-mono-lab text-xs leading-relaxed text-muted-foreground">{firm.notes}</p><div className="firm-evidence"><span>${total.toLocaleString("en-US",{maximumFractionDigits:2})} recorded</span><span>Largest ${largest.toLocaleString("en-US",{maximumFractionDigits:2})}</span></div><details className="firm-review"><summary>My review / what matters</summary><p>{reviewLens[firm.name]}</p><p>Personal True R: {firm.trueR}/10. {records.length} payout records. Payout totals are not net profit.</p>{isMaven ? <a href={`${import.meta.env.BASE_URL}maven/`}>Open Maven Edition ↗</a> : <a href="#vault">See payout evidence ↗</a>}</details></div>
    <div className="md:col-span-4"><div className={`rounded-lg border p-4 transition-colors ${isMaven ? "border-lucid/60 bg-lucid/10" : "border-lucid/30 bg-lucid/5 group-hover:border-lucid/60"}`}><div className="font-mono-lab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{isMaven ? "Preferred partner code" : "gigaprop code"}</div><div className="mt-2 font-mono-lab text-2xl font-bold text-lucid">CODE GIGA</div><div className="mt-1 font-mono-lab text-[10px] uppercase tracking-[0.26em] text-spectral">COMING SOON</div><p className="mt-3 font-mono-lab text-[10px] leading-relaxed text-muted-foreground">No placeholder discount. When a real gigaprop offer is live, it will appear here.</p>{isMaven && <a href={`${import.meta.env.BASE_URL}maven/`} className="mt-3 inline-flex items-center gap-1 font-mono-lab text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-lucid">See the Maven proof <ChevronRight className="h-3 w-3" /></a>}</div></div>
  </motion.div>;
}

export default function TrueRRankings() {
  return <section id="rankings" className="relative w-full bg-void py-24 md:py-32"><div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lucid/40 to-transparent" /><div className="mx-auto max-w-[1500px] px-6 md:px-12"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="font-mono-lab text-xs uppercase tracking-[0.3em] text-lucid">03 / True R index</div><h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-spectral md:text-6xl">The firms behind the receipts.</h2></div><p className="max-w-sm font-mono-lab text-sm leading-relaxed text-muted-foreground">My own True R score blends payout experience, friction, rules and time to cash. It is a personal ranking—not a guarantee.</p></div><p className="rankings-trust"><strong>Maven is my #1: the most trusted and most proven firm in my own record.</strong> Every scored firm below has paid me. The archive is the evidence; the score is my judgment.</p><div className="mt-12 rounded-2xl border border-border bg-prism/20"><div className="hidden grid-cols-12 gap-4 border-b border-border px-8 py-4 font-mono-lab text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:grid"><div className="col-span-1">Rank</div><div className="col-span-3">Firm</div><div className="col-span-4">True R</div><div className="col-span-4">Status</div></div>{rankedFirms.map(f => <FirmPlate key={f.name} firm={f} />)}<div className="border-t border-border px-6 py-5 md:px-8"><div className="font-mono-lab text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Unscored / no personal payout on record</div></div>{unscoredFirms.map(f => <div key={f.name} className="flex flex-wrap items-center justify-between gap-6 border-t border-border px-6 py-7 md:px-8"><img src={f.logo} alt={f.name} className="h-7 w-40 object-contain object-left" /><span className="font-mono-lab text-xs text-muted-foreground">True R — not yet rated</span><a href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono-lab text-xs text-spectral hover:text-lucid">Visit {f.name}<ChevronRight className="h-3 w-3" /></a></div>)}</div></div></section>;
}
