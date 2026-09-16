import React, { useMemo, useState } from "react";
import { Check, ChevronRight, Copy, Fingerprint, ShieldCheck } from "lucide-react";
import { certificates } from "./data";
import { track } from "../../lib/analytics";

const proofMeta = {
  "maven-011": { proofHash: "d4be45a9bca6bc74badf15df50d2ad57f87005d7cb42d502552c2021f5f3d8ee" },
  "maven-020": { proofHash: "f306b06cb34c3d018bc62298be91cd30d3fe5e6375dd25a92932794b963b1de9" },
  "maven-002": { proofHash: "198ddb7a139bac870ca97e17c6aa26ae8ec45adb702a0db110c7e51391698c1e" },
  "maven-017": { proofHash: "3ec860cf034954eb24bb662ccaebe593b49665cd3127757763162015cb58dcf0" },
  "maven-023": { proofHash: "c5a1a27cf67497988932b8a1dd72a85517e846b06f1050b04d83e4fab1d49947" },
  "lucid-trading-004": { proofHash: "66d79f2d1c306b6505ce306f71ced598859616cfdf3d6954badc40443efd570e" },
  "lucid-trading-001": { proofHash: "9510057b73ca7cbf9522fd85604cb4452629ebf39ee2489e237cb7565e67bd7f" },
  "lucid-trading-002": { proofHash: "02a3e59d0b4511bddf84ac3c4303a28336ea3a2d0d39f60d45458e71bc77876e" },
  "lucid-trading-005": { proofHash: "21faea778fddbdfe468e9f92a8b2ad458ef1230a40407c045ebbbc9cf54aecea" },
  "lucid-trading-003": { proofHash: "e36582dcf88068b11688de24eaa2360f4f291699d17b5144f94e05a1ba9c974b" },
};

const topMavenIds = ["maven-011", "maven-020", "maven-002", "maven-017", "maven-023"];
const topLucidIds = ["lucid-trading-004", "lucid-trading-001", "lucid-trading-002", "lucid-trading-005", "lucid-trading-003"];
const rankIds = [...topMavenIds, ...topLucidIds];

const money = (value, decimals = 2) => Number(value || 0).toLocaleString("en-US", {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
});
const shortHash = hash => `${hash.slice(0, 8)}...${hash.slice(-6)}`;
const mavenSettlement = amount => Math.round(amount * 0.8 * 100) / 100;

function buildRows() {
  const byId = Object.fromEntries(certificates.map(cert => [cert.id, cert]));
  return rankIds.map((id, index) => {
    const cert = byId[id];
    const isMaven = cert.firm === "Maven";
    return {
      ...cert,
      rank: index + 1,
      proofHash: proofMeta[id].proofHash,
      type: isMaven ? "wallet" : "certificate",
      status: isMaven ? "MATCHED USDC" : "PAYOUT VERIFIED",
      displayAmount: isMaven ? mavenSettlement(cert.amountNum) : cert.amountNum,
      unit: isMaven ? "USDC" : "USD",
      splitReference: cert.firm === "Lucid Trading" ? Math.round(cert.amountNum * 0.9 * 100) / 100 : null,
    };
  });
}

function ProofRow({ row, active, onSelect }) {
  const matched = row.type === "wallet";
  return (
    <button type="button" onClick={() => onSelect(row)} className={`group grid w-full grid-cols-[34px_92px_1fr_auto] items-center gap-3 border-b border-white/[0.055] px-4 py-4 text-left transition-all md:grid-cols-[42px_110px_1fr_130px_170px] md:px-5 ${active ? "bg-[linear-gradient(90deg,rgba(139,92,246,.88),rgba(139,92,246,.46),rgba(255,255,255,.035))] shadow-[inset_2px_0_0_rgba(198,160,255,.9)]" : "bg-white/[0.012] hover:bg-white/[0.035]"}`}>
      <div className="font-display text-xs text-white/35">{String(row.rank).padStart(2, "0")}</div>
      <div><div className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-spectral">{row.firm === "Lucid Trading" ? "Lucid" : row.firm}</div><div className="mt-1 font-display text-[10px] text-white/28">{row.date}</div></div>
      <div className={`font-display text-base font-semibold tracking-tight md:text-lg ${active ? "text-white" : matched ? "text-lucid" : "text-violetglow"}`}>+{money(row.displayAmount)} <span className="text-[0.6em] font-medium text-white/38">{row.unit}</span></div>
      <div className="hidden font-display text-[11px] text-white/36 md:block">{shortHash(row.proofHash)}</div>
      <div className="flex items-center justify-end gap-2"><span className={`hidden rounded-full border px-2.5 py-1 font-display text-[9px] font-semibold uppercase tracking-[0.12em] sm:inline-flex ${matched ? "border-lucid/20 bg-lucid/[0.05] text-lucid" : "border-violetglow/25 bg-violetglow/[0.08] text-violetglow"}`}>{row.status}</span><ChevronRight className="h-3.5 w-3.5 text-white/22 transition-transform group-hover:translate-x-0.5 group-hover:text-white/60" /></div>
    </button>
  );
}

function DetailPanel({ row, total }) {
  const matched = row.type === "wallet";
  const copyHash = async () => { try { await navigator.clipboard.writeText(row.proofHash); } catch {} track("proof_hash_copy", { firm: row.firm, id: row.id }); };
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808] p-6 md:p-8">
      <div aria-hidden="true" className="absolute inset-0" style={{ background: "radial-gradient(circle at 90% 0%, rgba(139,92,246,.14), transparent 34%), radial-gradient(circle at 0% 100%, rgba(210,255,0,.055), transparent 30%)" }} />
      <div className="relative">
        <div className="flex items-start justify-between gap-5"><div><div className="font-display text-[11px] text-violetglow">{String(row.rank).padStart(2, "0")} / {String(total).padStart(2, "0")}</div><div className="mt-6 font-display text-2xl font-semibold tracking-[-0.03em] text-spectral">{row.firm === "Lucid Trading" ? "Lucid payout" : "Maven settlement"}</div><div className="mt-1 font-display text-xs text-white/35">{row.date}</div></div><div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-display text-[9px] font-semibold uppercase tracking-[0.12em] ${matched ? "border-lucid/20 bg-lucid/[0.045] text-lucid" : "border-violetglow/25 bg-violetglow/[0.075] text-violetglow"}`}>{matched ? <Check className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}{row.status}</div></div>
        <div className={`mt-12 font-display text-5xl font-semibold leading-none tracking-[-0.065em] md:text-6xl ${matched ? "text-spectral" : "text-violetglow"}`}>+{money(row.displayAmount)}<span className="ml-2 text-[0.25em] font-medium tracking-normal text-white/34">{row.unit}</span></div>
        <div className="mt-12"><div className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-white/28">Proof hash · SHA-256</div><button onClick={copyHash} className="mt-3 flex w-full items-center gap-3 rounded-xl border border-white/[0.075] bg-white/[0.018] px-4 py-4 text-left transition-colors hover:bg-white/[0.035]"><Fingerprint className="h-4 w-4 shrink-0 text-violetglow" /><span className="min-w-0 flex-1 break-all font-display text-[11px] leading-relaxed text-white/62">{row.proofHash}</span><Copy className="h-3.5 w-3.5 shrink-0 text-white/25" /></button></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-white/[0.065] bg-white/[0.014] p-4"><div className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-white/26">{matched ? "Payout certificate" : "Certificate payout"}</div><div className="mt-2 font-display text-xl font-semibold text-spectral">{row.amount}</div></div><div className="rounded-xl border border-white/[0.065] bg-white/[0.014] p-4"><div className="font-display text-[9px] font-semibold uppercase tracking-[0.14em] text-white/26">{matched ? "Settlement rail" : "90% split reference"}</div><div className="mt-2 font-display text-xl font-semibold text-spectral">{matched ? "USDC" : `$${money(row.splitReference)}`}</div></div></div>
        <div className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-4 ${matched ? "border-lucid/15 bg-lucid/[0.025]" : "border-violetglow/15 bg-violetglow/[0.025]"}`}><span className={`h-2 w-2 shrink-0 rounded-full ${matched ? "bg-lucid shadow-[0_0_16px_rgba(210,255,0,.65)]" : "bg-violetglow shadow-[0_0_16px_rgba(139,92,246,.55)]"}`} /><div className="font-display text-[10px] uppercase tracking-[0.12em] text-white/44">{matched ? "Certificate + USDC deposit matched" : "Certificate verified · wallet-side deposit not in archive"}</div></div>
      </div>
    </div>
  );
}

export default function OnChainProof() {
  const rows = useMemo(buildRows, []);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(rows[0]);
  const visibleRows = filter === "All" ? rows : rows.filter(row => row.firm === filter);
  const matchedCount = rows.filter(row => row.type === "wallet").length;
  const choose = row => { setSelected(row); track("proof_rail_select", { firm: row.firm, id: row.id, type: row.type }); };
  const switchFilter = next => { setFilter(next); const nextRows = next === "All" ? rows : rows.filter(row => row.firm === next); if (nextRows.length) setSelected(nextRows[0]); track("proof_rail_filter", { firm: next }); };

  return (
    <section id="onchain" className="relative overflow-hidden border-y border-white/[0.055] bg-[#050505] py-24 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 18% 22%, rgba(139,92,246,.12), transparent 28%), radial-gradient(circle at 82% 68%, rgba(210,255,0,.04), transparent 28%)" }} />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="grid gap-10 border-b border-white/[0.055] pb-12 lg:grid-cols-[1.35fr_.65fr] lg:items-end"><div><div className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-violetglow">USDC settlements</div><h2 className="mt-5 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-spectral md:text-7xl">Verified proof.</h2><div className="mt-4 font-display text-lg text-white/42 md:text-2xl">5 matched USDC settlements. 5 Lucid payout proofs.</div></div><div className="lg:text-right"><div className="font-display text-[10px] uppercase leading-6 tracking-[0.13em] text-white/28">Maven · wallet matched<br />Lucid · certificate verified<br />10 proofs shown</div><div className="mt-5 h-px w-14 bg-violetglow/70 lg:ml-auto" /></div></div>
        <div className="mt-7 flex flex-wrap items-center justify-between gap-4"><div className="flex gap-2">{[["All","All"],["Maven","Maven"],["Lucid Trading","Lucid"]].map(([value,label]) => <button key={value} onClick={() => switchFilter(value)} className={`rounded-lg border px-5 py-3 font-display text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${filter === value ? "border-violetglow/70 bg-violetglow text-white shadow-[0_0_28px_rgba(139,92,246,.18)]" : "border-white/[0.075] bg-white/[0.012] text-white/38 hover:text-white/72"}`}>{label}</button>)}</div><div className="flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30"><span className="h-1.5 w-1.5 rounded-full bg-lucid shadow-[0_0_14px_rgba(210,255,0,.7)]" /><span className="text-lucid">{matchedCount} matched</span><span>/</span><span>10 shown</span></div></div>
        <div className="mt-6 grid overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808]/92 shadow-2xl shadow-black/30 lg:grid-cols-[1.1fr_.9fr]"><div className="border-b border-white/[0.07] lg:border-b-0 lg:border-r"><div className="grid grid-cols-[34px_92px_1fr_auto] gap-3 border-b border-white/[0.055] px-4 py-3 font-display text-[8px] font-semibold uppercase tracking-[0.14em] text-white/22 md:grid-cols-[42px_110px_1fr_130px_170px] md:px-5"><span>#</span><span>Firm</span><span>Amount</span><span className="hidden md:block">Proof</span><span className="text-right">Status</span></div><div>{visibleRows.map(row => <ProofRow key={row.id} row={row} active={selected?.id === row.id} onSelect={choose} />)}</div></div><div className="min-h-[560px] p-4 md:p-6">{selected && <DetailPanel row={selected} total={rows.length} />}</div></div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 font-display text-[9px] uppercase tracking-[0.13em] text-white/24"><span>gigaprop.xyz</span><span>real payouts · real proof</span></div>
      </div>
    </section>
  );
}
