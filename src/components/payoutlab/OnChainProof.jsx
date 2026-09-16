import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, CircleDollarSign, Link2 } from "lucide-react";
import { certificates } from "./data";
import { track } from "../../lib/analytics";

const mavenDepositOrder = [
  "maven-001", "maven-002", "maven-003", "maven-004", "maven-005", "maven-006", "maven-008",
  "maven-009", "maven-010", "maven-011", "maven-012", "maven-013", "maven-014", "maven-015",
  "maven-016", "maven-017", "maven-018", "maven-019", "maven-020", "maven-021", "maven-022",
  "maven-023", "maven-024", "maven-025", "maven-027", "maven-028",
];
const verifiedMavenIds = new Set(mavenDepositOrder);
const depositIndex = Object.fromEntries(mavenDepositOrder.map((id, index) => [id, index]));
const spriteUrl = `${import.meta.env.BASE_URL}onchain/maven-deposit-sprite.jpg`;
const filters = ["All", "Maven", "FundedNext", "Lucid Trading"];

const money = (value, decimals = 2) => Number(value || 0).toLocaleString("en-US", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});
const settlementAmount = (cert) => Math.round(cert.amountNum * 80) / 100;

function buildRows() {
  const verified = certificates
    .filter((cert) => cert.firm === "Maven" && verifiedMavenIds.has(cert.id))
    .map((cert) => ({ ...cert, settlement: settlementAmount(cert), state: "verified", rail: "USDC", depositIndex: depositIndex[cert.id] }));

  const matchReady = certificates
    .filter((cert) => cert.firm === "FundedNext" || cert.firm === "Lucid Trading")
    .map((cert) => ({ ...cert, settlement: cert.amountNum, state: "pending", rail: "USDC", depositIndex: null }));

  return [...verified, ...matchReady].sort((a, b) => b.amountNum - a.amountNum);
}

function SettlementRow({ row, active, onSelect, duplicate = false }) {
  const verified = row.state === "verified";
  return (
    <button
      type="button"
      tabIndex={duplicate ? -1 : 0}
      aria-hidden={duplicate ? "true" : undefined}
      onClick={() => !duplicate && onSelect(row)}
      className={`group grid w-full grid-cols-[1fr_auto] items-center gap-4 border-b border-white/[0.055] px-5 py-4 text-left transition-all ${active ? "bg-gradient-to-r from-violetglow/80 via-violetglow/45 to-white/8" : "bg-white/[0.012] hover:bg-white/[0.035]"}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${verified ? "bg-lucid shadow-[0_0_14px_rgba(210,255,0,.55)]" : "bg-white/20"}`} />
          <span className="truncate font-display text-[13px] font-medium tracking-tight text-spectral">{row.firm} <span className="text-white/35">·</span> {row.id.replace(/^.*-/, "#")}</span>
        </div>
        <div className="mt-1 pl-3.5 font-mono-lab text-[8px] uppercase tracking-[0.18em] text-white/35">{verified ? "VERIFIED ON-CHAIN" : "WALLET MATCH PENDING"} · {row.date}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className={`font-display text-lg font-semibold tracking-tight ${active ? "text-white" : verified ? "text-lucid" : "text-white/55"}`}>+${money(row.settlement)}</div>
          <div className="mt-0.5 font-mono-lab text-[8px] uppercase tracking-[0.16em] text-white/30">{row.rail}</div>
        </div>
        {!duplicate && <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-transform group-hover:translate-x-0.5 group-hover:text-white/55" />}
      </div>
    </button>
  );
}

function DepositSprite({ index }) {
  const pct = mavenDepositOrder.length <= 1 ? 0 : (index / (mavenDepositOrder.length - 1)) * 100;
  return (
    <div className="flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#030305] px-2">
      <div
        role="img"
        aria-label="Matching USDC deposit"
        className="w-full max-w-[520px] rounded-lg border border-white/[0.055] bg-no-repeat shadow-2xl shadow-black/40"
        style={{
          aspectRatio: "360 / 66",
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: "100% auto",
          backgroundPosition: `center ${pct}%`,
        }}
      />
    </div>
  );
}

function ReceiptCard({ row }) {
  return (
    <div className="relative flex min-h-[285px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808] p-6">
      <div aria-hidden="true" className="absolute inset-0 opacity-80" style={{ background: "radial-gradient(circle at 85% 5%, rgba(210,255,0,.11), transparent 32%), radial-gradient(circle at 12% 100%, rgba(138,43,226,.13), transparent 34%)" }} />
      <div className="relative flex items-start justify-between gap-4">
        <div><div className="font-mono-lab text-[8px] uppercase tracking-[0.22em] text-white/35">Wallet settlement</div><div className="mt-2 font-display text-xl font-semibold text-spectral">{row.firm}</div></div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 font-mono-lab text-[8px] uppercase tracking-[0.17em] text-white/40">pending</div>
      </div>
      <div className="relative mt-auto">
        <div className="font-display font-semibold leading-none tracking-[-0.065em] text-spectral" style={{ fontSize: "clamp(2.6rem,6vw,4.4rem)" }}>{money(row.settlement, 2)} <span className="text-[0.28em] font-medium tracking-normal text-white/35">USD</span></div>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.07] pt-4">
          <div><div className="font-mono-lab text-[8px] uppercase tracking-[0.16em] text-white/30">Payout proof</div><div className="mt-1 font-display text-sm text-white/75">{row.amount}</div></div>
          <div><div className="font-mono-lab text-[8px] uppercase tracking-[0.16em] text-white/30">Date</div><div className="mt-1 font-display text-sm text-white/75">{row.date}</div></div>
        </div>
      </div>
    </div>
  );
}

export default function OnChainProof() {
  const rows = useMemo(buildRows, []);
  const verifiedRows = rows.filter((row) => row.state === "verified");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(() => verifiedRows.find((row) => row.id === "maven-011") || verifiedRows[0]);
  const visibleRows = filter === "All" ? rows : rows.filter((row) => row.firm === filter);
  const verifiedTotal = verifiedRows.reduce((sum, row) => sum + row.settlement, 0);
  const tickerRows = [...verifiedRows, ...verifiedRows];

  const choose = (row) => { setSelected(row); track("onchain_proof_select", { firm: row.firm, id: row.id, state: row.state }); };
  const switchFilter = (next) => {
    setFilter(next);
    const nextRows = next === "All" ? rows : rows.filter((row) => row.firm === next);
    if (nextRows.length) setSelected(nextRows[0]);
    track("onchain_filter", { firm: next });
  };

  return (
    <section id="onchain" className="relative overflow-hidden border-y border-white/[0.055] bg-[#050505] py-24 md:py-32">
      <style>{`@keyframes gp-settlement-scroll{from{transform:translateY(0)}to{transform:translateY(-50%)}}.gp-settlement-track{animation:gp-settlement-scroll 34s linear infinite}.gp-settlement-log:hover .gp-settlement-track{animation-play-state:paused}@media(prefers-reduced-motion:reduce){.gp-settlement-track{animation:none}}`}</style>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 18% 32%, rgba(138,43,226,.10), transparent 30%), radial-gradient(circle at 78% 58%, rgba(210,255,0,.055), transparent 30%)" }} />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <div className="font-mono-lab text-[9px] uppercase tracking-[0.25em] text-lucid">Verified on-chain</div>
            <h2 className="mt-4 max-w-xl font-display text-5xl font-semibold leading-[0.92] tracking-[-0.055em] text-spectral md:text-7xl">USDC.<br /><span className="text-white/35">Received.</span></h2>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-full border border-white/[0.08] bg-white/[0.018] px-4 py-2 font-mono-lab text-[9px] uppercase tracking-[0.18em] text-white/55"><span className="text-spectral">{verifiedRows.length}</span> matched deposits</div>
              <div className="rounded-full border border-lucid/20 bg-lucid/[0.035] px-4 py-2 font-mono-lab text-[9px] uppercase tracking-[0.18em] text-lucid">${money(verifiedTotal, 0)} settled</div>
            </div>
          </div>

          <div className="gp-settlement-log relative h-[390px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]/90 shadow-2xl shadow-black/30">
            <div className="flex h-12 items-center justify-between border-b border-white/[0.06] px-5">
              <div className="font-display text-sm font-medium text-white/65">settlement log</div>
              <div className="flex items-center gap-2 font-mono-lab text-[8px] uppercase tracking-[0.18em] text-white/28"><span className="h-1.5 w-1.5 rounded-full bg-lucid shadow-[0_0_12px_rgba(210,255,0,.65)]" /> live archive</div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-12 z-10 h-16 bg-gradient-to-b from-[#080808] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#080808] to-transparent" />
            <div className="gp-settlement-track">{tickerRows.map((row, index) => <SettlementRow key={`${row.id}-${index}`} row={row} active={selected?.id === row.id && index < verifiedRows.length} onSelect={choose} duplicate={index >= verifiedRows.length} />)}</div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-2">{filters.map((name) => <button key={name} onClick={() => switchFilter(name)} className={`rounded-full px-4 py-2 font-mono-lab text-[9px] uppercase tracking-[0.18em] transition-colors ${filter === name ? "bg-spectral text-void" : "border border-white/[0.07] bg-white/[0.018] text-white/38 hover:text-white/75"}`}>{name === "Lucid Trading" ? "Lucid" : name}</button>)}</div>

        <div className="mt-5 grid overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.012] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="max-h-[560px] overflow-y-auto no-scrollbar border-b border-white/[0.07] lg:border-b-0 lg:border-r">{visibleRows.map((row) => <SettlementRow key={row.id} row={row} active={selected?.id === row.id} onSelect={choose} />)}</div>
          <div className="min-h-[500px] p-4 md:p-6">
            <AnimatePresence mode="wait">
              {selected && <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }} className="grid h-full gap-4 xl:grid-cols-2">
                <div className="flex min-h-[285px] items-center justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808] p-3"><img src={selected.url} alt={`${selected.firm} payout proof ${selected.amount}`} className="max-h-[410px] w-full rounded-xl object-contain" loading="lazy" /></div>
                {selected.state === "verified" ? <div className="flex min-h-[285px] flex-col rounded-2xl border border-lucid/15 bg-[#080808] p-4"><div className="mb-3 flex items-center justify-between"><div className="font-mono-lab text-[8px] uppercase tracking-[0.19em] text-white/35">USDC deposit</div><div className="flex items-center gap-1.5 font-mono-lab text-[8px] uppercase tracking-[0.16em] text-lucid"><Check className="h-3 w-3" /> matched</div></div><DepositSprite index={selected.depositIndex} /></div> : <ReceiptCard row={selected} />}
              </motion.div>}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-mono-lab text-[8px] uppercase tracking-[0.16em] text-white/28">
          <div className="flex items-center gap-2"><CircleDollarSign className="h-3.5 w-3.5" /> Maven · 26 matched certificate / USDC deposits</div>
          <div className="flex items-center gap-2"><Link2 className="h-3.5 w-3.5" /> FundedNext + Lucid · matching next</div>
        </div>
      </div>
    </section>
  );
}
