import "./handbook.css";
import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ChevronRight, Copy, Check } from "lucide-react";
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
  "Maven": "DEEPEST RECEIPT STACK / FLAGSHIP RAIL",
  "Lucid Trading": "FAST RAIL / CLEAN CASH CYCLE",
  "FundedNext": "PROVEN RAIL / CODE GIGA LIVE",
  "Tradeify": "FAST RAIL / PAYOUT PROVEN",
  "Breakout": "HIGH VELOCITY / REPEAT PAYOUT RAIL",
  "Topstep": "LEGACY RAIL / PAYOUT PROVEN"
};

const mavenFirm = {
  rank: 1,
  name: "Maven",
  logoText: "M",
  trueR: 9.9,
  avgTime: "PROVEN RAIL",
  notes: "FLAGSHIP / MOST PROVEN / BIGGEST WINNER",
};

const rankedFirms = [mavenFirm, ...firms.filter(f => f.name !== "Maven").map((firm, index) => ({ ...firm, rank: index + 2 }))];

function HazardStatus({ live = false, onCopy, copied, maven = false }) {
  return <div className={`prop-status ${live ? "prop-status-live" : "prop-status-build"}`}>
    <div className="prop-hazard" aria-hidden="true" />
    <div className="prop-status-kicker">{live ? "● LIVE RAIL" : "/// PROP LINK IN DEVELOPMENT ///"}</div>
    <div className="prop-status-code">CODE GIGA</div>
    <div className="prop-status-state">{live ? "ACTIVE" : "COMING SOON"}</div>
    {live && <button onClick={onCopy} className="prop-copy">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "COPIED" : "COPY GIGA"}</button>}
    {maven && <a href={`${import.meta.env.BASE_URL}maven/`} className="prop-proof-link">MAVEN PROOF <ChevronRight className="h-3 w-3" /></a>}
    <div className="prop-hazard prop-hazard-bottom" aria-hidden="true" />
  </div>;
}

function FirmPlate({ firm }) {
  const records = certificates.filter(c => c.firm === firm.name);
  const total = records.reduce((sum,c) => sum + c.amountNum,0);
  const largest = records.length ? Math.max(...records.map(c => c.amountNum)) : 0;
  const isMaven = firm.name === "Maven";
  const isFundedNext = firm.name === "FundedNext";
  const [copied, setCopied] = useState(false);
  const copyGiga = async () => { try { await navigator.clipboard.writeText("GIGA"); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } };

  return <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5 }} className={`group relative grid grid-cols-1 gap-6 border-t border-border p-6 transition-colors hover:bg-prism/40 md:grid-cols-12 md:items-center md:gap-4 md:p-8 ${isMaven ? "bg-lucid/[0.035]" : ""}`}>
    <div className="md:col-span-1"><div className="font-display font-bold leading-none text-transparent" style={{fontSize:"clamp(2.5rem, 5vw, 4rem)",WebkitTextStroke:isMaven ? "1px rgba(255,255,255,0.9)" : "1px rgba(247,247,247,0.5)"}}>{String(firm.rank).padStart(2,"0")}</div></div>
    <div className="md:col-span-3"><div className="flex items-center gap-3">{firm.logo ? <div className="min-w-0"><img src={firm.logo} alt={firm.name} className="mb-3 h-auto w-44 max-w-full" /><div className="font-mono-lab text-[10px] uppercase tracking-wider text-muted-foreground">{records.length} RECEIPTS · {firm.avgTime}</div></div> : <><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-prism font-display text-sm font-bold text-spectral">{firm.logoText}</div><div><div className="font-display text-xl font-semibold text-spectral">{firm.name}</div><div className="font-mono-lab text-[11px] uppercase tracking-widest text-muted-foreground">{records.length} RECEIPTS · {firm.avgTime}</div>{isMaven && <div className="mt-2 font-mono-lab text-[9px] uppercase tracking-[0.24em] text-lucid">#01 / FLAGSHIP PROP</div>}</div></>}</div></div>
    <div className="md:col-span-4"><div className="font-mono-lab text-[10px] uppercase tracking-[0.25em] text-muted-foreground">TRUE R / PROP SCORE</div><div className="mt-2"><ScoreMeter value={firm.trueR} /></div><p className="mt-3 max-w-sm font-mono-lab text-xs uppercase tracking-wider text-muted-foreground">{firm.notes}</p><div className="firm-evidence"><span>${total.toLocaleString("en-US",{maximumFractionDigits:2})} RECEIPTS</span><span>MAX ${largest.toLocaleString("en-US",{maximumFractionDigits:2})}</span></div><details className="firm-review"><summary>PROP NOTES +</summary><p>{reviewLens[firm.name]}</p><p>TRUE R {firm.trueR}/10 · {records.length} RECEIPTS</p>{isMaven ? <a href={`${import.meta.env.BASE_URL}maven/`}>OPEN MAVEN EDITION ↗</a> : <a href="#vault">OPEN PROOF ↗</a>}</details></div>
    <div className="md:col-span-4"><HazardStatus live={isFundedNext} onCopy={copyGiga} copied={copied} maven={isMaven} /></div>
  </motion.div>;
}

export default function TrueRRankings() {
  return <section id="rankings" className="relative w-full bg-void py-24 md:py-32"><div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lucid/40 to-transparent" /><div className="mx-auto max-w-[1500px] px-6 md:px-12"><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="font-mono-lab text-xs uppercase tracking-[0.3em] text-lucid">03 / PROP INDEX</div><h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-spectral md:text-6xl">The firms behind the receipts.</h2></div><p className="max-w-sm font-mono-lab text-sm uppercase leading-relaxed tracking-wider text-muted-foreground">RECEIPTS / RULES / FRICTION / TIME TO CASH</p></div><p className="rankings-trust"><strong>MAVEN // #01 // FLAGSHIP PROP // MOST PROVEN</strong></p><div className="mt-12 rounded-2xl border border-border bg-prism/20"><div className="hidden grid-cols-12 gap-4 border-b border-border px-8 py-4 font-mono-lab text-[10px] uppercase tracking-[0.25em] text-muted-foreground md:grid"><div className="col-span-1">RANK</div><div className="col-span-3">PROP</div><div className="col-span-4">TRUE R</div><div className="col-span-4">GIGA RAIL</div></div>{rankedFirms.map(f => <FirmPlate key={f.name} firm={f} />)}<div className="border-t border-border px-6 py-5 md:px-8"><div className="font-mono-lab text-[10px] uppercase tracking-[0.2em] text-muted-foreground">WATCHLIST // NO GIGAPROP RECEIPT YET</div></div>{unscoredFirms.map(f => <div key={f.name} className="grid gap-5 border-t border-border px-6 py-7 md:grid-cols-12 md:items-center md:px-8"><div className="md:col-span-4">{f.logo ? <img src={f.logo} alt={f.name} className="h-7 w-40 object-contain object-left" /> : <div className="font-display text-xl text-spectral">{f.name}</div>}</div><div className="font-mono-lab text-xs uppercase tracking-widest text-muted-foreground md:col-span-3">TRUE R // UNRATED</div><div className="md:col-span-5"><a href={f.url} target="_blank" rel="noopener noreferrer" className="block"><HazardStatus /></a></div></div>)}</div></div></section>;
}
