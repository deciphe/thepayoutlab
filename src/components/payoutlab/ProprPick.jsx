import React from "react";
import { ArrowUpRight } from "lucide-react";
import { track } from "../../lib/analytics";

const REFERRAL_URL = "https://app.propr.xyz/r/7gJmpEjv";
const RULES_URL = "https://www.propr.xyz/rules";
const FEES_URL = "https://hyperliquid.gitbook.io/hyperliquid-docs/trading/fees";

const accounts = [
  ["5K", "$60"],
  ["10K", "$110"],
  ["25K", "$275"],
  ["50K", "$495"],
  ["100K", "$999"],
  ["200K", "$1,998"],
];

const model = {
  account: "$100K",
  margin: "97%",
  leverage: "10×",
  notional: "$970K",
  intendedRisk: "$2,000",
  roundTripFees: "$873",
  trueRisk: "$2,873",
  trueRiskPct: "2.87%",
  dailyUsed: "95.8%",
  trueStop: "0.116%",
};

export default function ProprPick() {
  const outbound = () => track("firm_outbound_click", { firm: "Propr", plan: "Classic 1-Step", market: "Perps", source: "propr_spotlight" });

  return (
    <section className="relative bg-void py-14 md:py-16">
      <div className="mx-auto max-w-[1180px] px-6 md:px-12">
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]">
          <div className="grid lg:grid-cols-[.92fr_1.08fr]">
            <div className="border-b border-white/[0.06] p-6 md:p-8 lg:border-b-0 lg:border-r">
              <div className="font-mono-lab text-[9px] font-semibold uppercase tracking-[0.2em] text-violetglow">MY PERPS PICK · PROPR</div>
              <div className="mt-4 flex items-end justify-between gap-5">
                <div>
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.045em] text-spectral">Classic 1-Step</h3>
                  <p className="mt-1 font-mono-lab text-[10px] text-white/34">One structure. Every size.</p>
                </div>
                <div className="flex gap-1.5 font-display text-2xl font-semibold tracking-[-0.04em] text-spectral"><span>10</span><span className="text-white/20">/</span><span>6</span><span className="text-white/20">/</span><span>3</span></div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[['TARGET','10%'],['MAX DD','6%'],['DAILY','3%']].map(([label,value]) => <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-3 sm:col-span-2"><div className="font-mono-lab text-[7px] uppercase tracking-[0.16em] text-white/24">{label}</div><div className="mt-1 font-display text-lg font-semibold text-spectral">{value}</div></div>)}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {accounts.map(([size, fee]) => <div key={size} className="rounded-lg border border-white/[0.055] bg-white/[0.012] px-2.5 py-2.5 text-center"><div className="font-mono-lab text-[8px] uppercase tracking-[0.12em] text-white/28">{size}</div><div className="mt-1 font-mono-lab text-[10px] font-semibold text-white/72">{fee}</div></div>)}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-lab text-[8px] uppercase tracking-[0.14em] text-white/28">
                <span>80% split</span><span>no minimum days</span><span>static drawdown</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a href={REFERRAL_URL} onClick={outbound} target="_blank" rel="sponsored noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-lucid px-4 py-2.5 font-mono-lab text-[9px] font-semibold uppercase tracking-[0.14em] text-void transition-opacity hover:opacity-90">Open Propr <ArrowUpRight className="h-3.5 w-3.5" /></a>
                <a href={RULES_URL} target="_blank" rel="noopener noreferrer" className="font-mono-lab text-[9px] uppercase tracking-[0.14em] text-white/34 hover:text-white">Rules ↗</a>
              </div>
              <p className="mt-3 font-mono-lab text-[8px] leading-4 text-white/22">Referral link. I may earn a commission if you use it.</p>
            </div>

            <div className="relative p-6 md:p-8">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 100% 0%, rgba(155,135,245,.11), transparent 34%)" }} />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div><div className="font-mono-lab text-[9px] font-semibold uppercase tracking-[0.2em] text-lucid">TRUE R · FEE CHECK</div><div className="mt-2 font-display text-2xl font-semibold tracking-[-0.035em] text-spectral">2% isn't 2%.</div></div>
                  <div className="text-right font-mono-lab text-[8px] uppercase leading-4 tracking-[0.12em] text-white/25">100K<br />10× market<br />97% margin</div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Metric label="Notional" value={model.notional} />
                  <Metric label="Planned risk" value={model.intendedRisk} />
                  <Metric label="Fees · in/out" value={model.roundTripFees} />
                  <Metric label="True loss" value={model.trueRisk} accent />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-lucid/15 bg-lucid/[0.025] px-4 py-4">
                  <div><div className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/26">Actual account risk</div><div className="mt-1 font-display text-3xl font-semibold tracking-[-0.045em] text-lucid">{model.trueRiskPct}</div></div>
                  <div className="text-right"><div className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/26">3% daily limit used</div><div className="mt-1 font-display text-xl font-semibold text-spectral">{model.dailyUsed}</div></div>
                </div>

                <p className="mt-4 font-mono-lab text-[9px] leading-5 text-white/34">At 97% margin on a 10× market, the position is {model.notional}. A base-tier taker entry + taker exit costs about {model.roundTripFees}. If the directional stop itself loses {model.intendedRisk}, total account damage is {model.trueRisk}.</p>
                <p className="mt-2 font-mono-lab text-[9px] leading-5 text-white/28">To keep the <span className="text-spectral">entire trade</span> inside a true 2% cap, only $1,127 is left for price movement — roughly a {model.trueStop} stop on that notional.</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono-lab text-[8px] uppercase tracking-[0.12em] text-white/23"><span>Hyperliquid base perps</span><span>maker 0.015%</span><span>taker 0.045%</span><a href={FEES_URL} target="_blank" rel="noopener noreferrer" className="text-white/38 hover:text-white">fee schedule ↗</a></div>
                <p className="mt-2 font-mono-lab text-[8px] leading-4 text-white/18">Model uses base taker fees both ways, excludes funding and slippage, and assumes a Propr market with 10× leverage. Actual fee tiers can be lower.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, accent = false }) {
  return <div className="rounded-xl border border-white/[0.06] bg-white/[0.014] p-3"><div className="font-mono-lab text-[7px] uppercase tracking-[0.14em] text-white/23">{label}</div><div className={`mt-1.5 font-display text-lg font-semibold ${accent ? "text-lucid" : "text-spectral"}`}>{value}</div></div>;
}
