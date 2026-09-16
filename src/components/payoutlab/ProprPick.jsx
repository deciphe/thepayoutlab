import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { track } from "../../lib/analytics";

const ACCOUNT = 100000;
const MARGIN = 0.97;
const LEVERAGE = 5;
const NOTIONAL = ACCOUNT * MARGIN * LEVERAGE;
const PLANNED_RISK = 2000;

const firms = [
  {
    rank: 1,
    name: "Hypernova",
    plan: "Low Risk",
    rules: "10 / 6 / 3",
    maker: 0,
    taker: 0.005,
    avgMaker: "0%",
    gold: true,
    exact: true,
  },
  {
    rank: 2,
    name: "Vanta",
    plan: "2-Step · P2 5%",
    rules: "10 / 6 / 3",
    maker: 0,
    taker: 0,
    avgMaker: "0.0017%",
    exact: true,
  },
  {
    rank: 3,
    name: "Propr",
    plan: "Classic 1-Step",
    rules: "10 / 6 / 3",
    maker: 0.003,
    taker: 0.009,
    avgMaker: "0.003%",
    exact: true,
  },
  {
    rank: 4,
    name: "Doji",
    plan: "1-Step config",
    rules: "10 / 6 / 3",
    maker: 0.007,
    taker: 0.007,
    avgMaker: "0.006%",
    exact: true,
  },
  {
    rank: 5,
    name: "Vest",
    plan: "Evaluation",
    rules: "10 / 6 / 3",
    maker: 0.0025,
    taker: 0.0025,
    avgMaker: "0.0075%",
    exact: true,
  },
  {
    rank: 6,
    name: "HyperPNL",
    plan: "Flex · closest live",
    rules: "10 / 5 / 3",
    maker: 0.015,
    taker: 0.03,
    avgMaker: "0.015%",
    exact: false,
  },
  {
    rank: 7,
    name: "Breakout",
    plan: "Classic 1-Step",
    rules: "10 / 6 / 3",
    maker: 0.04,
    taker: 0.04,
    avgMaker: "0.04%",
    exact: true,
  },
];

const money = value => `$${value.toLocaleString("en-US", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
const pct = value => `${value.toFixed(2)}%`;
const roundTrip = rate => NOTIONAL * (rate / 100) * 2;
const trueRisk = rate => PLANNED_RISK + roundTrip(rate);
const trueRiskPct = rate => (trueRisk(rate) / ACCOUNT) * 100;

export default function ProprPick() {
  const openHypernova = () => track("firm_outbound_click", { firm: "Hypernova", plan: "Low Risk", market: "Perps", source: "fee_story" });
  const openPropr = () => track("firm_outbound_click", { firm: "Propr", plan: "Classic 1-Step", market: "Perps", source: "fee_story" });

  return (
    <section className="relative overflow-hidden bg-void py-16 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 12% 22%, rgba(182,255,74,.055), transparent 25%), radial-gradient(circle at 88% 74%, rgba(155,135,245,.08), transparent 30%)" }} />
      <div className="relative mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-col justify-between gap-5 border-b border-white/[0.06] pb-7 md:flex-row md:items-end">
          <div>
            <div className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-lucid">WEB3 EXECUTION</div>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.055em] text-spectral md:text-5xl">Fees change R.</h2>
          </div>
          <div className="font-display text-[10px] leading-5 text-white/32 md:text-right">100K · 97% margin · 5× index benchmark<br /><span className="text-white/52">$485K position · $2K directional risk</span></div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.02fr_.98fr]">
          <div className="relative overflow-hidden rounded-2xl border border-lucid/25 bg-lucid/[0.028] p-6 md:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 100% 0%, rgba(182,255,74,.12), transparent 34%)" }} />
            <div className="relative">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-lucid/20 bg-lucid/[0.06] px-3 py-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-lucid"><Sparkles className="h-3 w-3" /> Gold standard</div>
                  <div className="mt-5 font-display text-3xl font-semibold tracking-[-0.045em] text-spectral">Hypernova</div>
                  <div className="mt-1 font-display text-[11px] text-white/35">Low Risk · <span className="text-white/65">MY CHOICE · 10 / 6 / 3</span></div>
                </div>
                <div className="text-right"><div className="font-display text-[8px] uppercase tracking-[0.15em] text-white/24">NON-CRYPTO MAKER AVG</div><div className="mt-1 font-display text-2xl font-semibold text-lucid">0%</div></div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-3">
                <FeeCard label="Limit round trip" fee={roundTrip(0)} risk={trueRiskPct(0)} note="0% maker / side" accent />
                <FeeCard label="Market round trip" fee={roundTrip(0.005)} risk={trueRiskPct(0.005)} note="0.005% taker / side" />
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-white/[0.065] bg-black/20 px-4 py-3.5">
                <div><div className="font-display text-[8px] uppercase tracking-[0.14em] text-white/24">True risk · limit</div><div className="mt-1 font-display text-xl font-semibold text-lucid">$2,000 · 2.00%</div></div>
                <div className="text-right"><div className="font-display text-[8px] uppercase tracking-[0.14em] text-white/24">True risk · market</div><div className="mt-1 font-display text-xl font-semibold text-spectral">$2,048.50 · 2.05%</div></div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <a href="https://hn.xyz/r/4sjg1b" onClick={openHypernova} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-lucid px-4 py-2.5 font-display text-[9px] font-semibold uppercase tracking-[0.13em] text-void transition-opacity hover:opacity-90">Hypernova <ArrowUpRight className="h-3.5 w-3.5" /></a>
                <span className="font-display text-[9px] text-white/25">0% maker across FX · indices · commodities in the supplied schedule</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/[0.055] px-4 py-3 font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-white/22 md:px-5"><span>Firm / structure</span><span>Limit</span><span>Market</span></div>
            {firms.map(firm => <FirmRow key={firm.name} firm={firm} onPropr={openPropr} />)}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-white/[0.045] pt-4 font-display text-[8px] leading-4 text-white/22 md:flex-row md:items-start md:justify-between">
          <span>Fee rates: supplied Sep 15, 2026 comparison · indices · per side. Limit = maker. Market = taker.</span>
          <span className="md:text-right">Benchmark normalizes at 5×. Funding + slippage excluded. 100K math does not imply every firm currently sells a 100K account.</span>
        </div>
      </div>
    </section>
  );
}

function FeeCard({ label, fee, risk, note, accent = false }) {
  return <div className={`rounded-xl border p-4 ${accent ? "border-lucid/15 bg-lucid/[0.025]" : "border-white/[0.06] bg-white/[0.014]"}`}><div className="font-display text-[8px] uppercase tracking-[0.14em] text-white/24">{label}</div><div className={`mt-2 font-display text-3xl font-semibold tracking-[-0.045em] ${accent ? "text-lucid" : "text-spectral"}`}>{money(fee)}</div><div className="mt-1 font-display text-[9px] text-white/30">{note}</div><div className="mt-3 font-display text-[10px] text-white/50">$2K stop → <span className={accent ? "text-lucid" : "text-spectral"}>{pct(risk)}</span></div></div>;
}

function FirmRow({ firm, onPropr }) {
  const limitFee = roundTrip(firm.maker);
  const marketFee = roundTrip(firm.taker);
  return <div className={`grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/[0.045] px-4 py-3.5 last:border-b-0 md:px-5 ${firm.gold ? "bg-lucid/[0.022]" : "hover:bg-white/[0.018]"}`}>
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><span className="font-display text-[9px] text-white/22">{String(firm.rank).padStart(2, "0")}</span><span className={`font-display text-sm font-semibold ${firm.gold ? "text-lucid" : "text-spectral"}`}>{firm.name}</span>{firm.exact ? <span className="rounded-full border border-white/[0.07] px-2 py-0.5 font-display text-[7px] uppercase tracking-[0.12em] text-white/35">MY CHOICE</span> : <span className="rounded-full border border-violetglow/15 px-2 py-0.5 font-display text-[7px] uppercase tracking-[0.12em] text-violetglow">CLOSEST LIVE</span>}</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[8px] text-white/26"><span>{firm.plan}</span><span>{firm.rules}</span><span>avg maker {firm.avgMaker}</span>{firm.name === "Propr" && <a href="https://app.propr.xyz/r/7gJmpEjv" onClick={onPropr} target="_blank" rel="sponsored noopener noreferrer" className="text-white/42 hover:text-lucid">open ↗</a>}</div>
    </div>
    <Cost value={limitFee} risk={trueRiskPct(firm.maker)} />
    <Cost value={marketFee} risk={trueRiskPct(firm.taker)} />
  </div>;
}

function Cost({ value, risk }) {
  return <div className="w-[76px] text-right md:w-[88px]"><div className="font-display text-sm font-semibold tabular-nums text-spectral">{money(value)}</div><div className="mt-0.5 font-display text-[8px] tabular-nums text-white/25">true {pct(risk)}</div></div>;
}
