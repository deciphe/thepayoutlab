import React, { useMemo, useRef, useState } from "react";
import { ArrowUpRight, X, ArrowLeft } from "lucide-react";
import { certificates } from "./data";

const ordered = [...certificates].sort((a, b) => b.amountNum - a.amountNum || a.id.localeCompare(b.id));
const firms = [...new Set(certificates.map(c => c.firm))];
const groups = firms.map(firm => ordered.filter(c => c.firm === firm));
const previewCards = Array.from({ length: Math.max(...groups.map(g => g.length)) }, (_, i) => groups.map(g => g[i]).filter(Boolean)).flat();
const total = Math.round(certificates.reduce((sum, c) => sum + c.amountNum, 0)).toLocaleString("en-US");

export default function PayoutVault() {
  const dialog = useRef(null);
  const [active, setActive] = useState(null);
  const [firm, setFirm] = useState("All");
  const openVault = () => { setActive(null); setFirm("All"); dialog.current.showModal(); };
  const visible = useMemo(() => firm === "All" ? ordered : ordered.filter(c => c.firm === firm), [firm]);

  return (
    <section id="vault" className="bg-void px-6 py-10 md:px-12 md:py-12">
      <div className="relative mx-auto max-w-[1404px] overflow-hidden rounded-xl border border-border bg-prism/20">
        <div className="relative z-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="shrink-0">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-spectral">Payout vault.</h2>
            <p className="mt-2 font-mono-lab text-[11px] text-muted-foreground">{certificates.length} records · ${total}</p>
          </div>
          <div aria-hidden="true" className="relative h-24 min-w-0 flex-1 overflow-hidden sm:mx-4" style={{maskImage: "linear-gradient(to right, transparent, black 6%, black 62%, transparent 100%)"}}>
            {previewCards.filter(c => c.firm !== "Breakout").slice(0, 12).map((c, i) => (
              <img key={c.id} src={c.url} alt="" loading="lazy" className="absolute top-2 h-20 w-24 rounded border border-white/10 object-cover shadow-lg" style={{ left: `${i * 12}%`, zIndex: 12 - i, opacity: 1 - i / 24, filter: `blur(${Math.max(0, i - 2) / 3}px)` }} />
            ))}
          </div>
          <button onClick={openVault} className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-lg border border-lucid/30 bg-lucid/5 px-5 py-3 font-mono-lab text-xs text-lucid transition-colors hover:bg-lucid/10 sm:self-center">Open vault <ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </div>

      <dialog aria-label="gigaprop payout vault" ref={dialog} onClose={() => setActive(null)} className="m-auto max-h-[92vh] w-[min(1240px,96vw)] max-w-none overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0b0d]/95 p-0 text-spectral shadow-2xl backdrop:bg-black/80 backdrop:backdrop-blur-md">
        <div className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#0b0b0d]/90 px-5 py-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-5">
            <div className="flex items-baseline gap-4">
              <h2 className="font-display text-xl font-semibold">Payout vault</h2>
              <span className="font-mono-lab text-[10px] text-muted-foreground">{certificates.length} · ${total}</span>
            </div>
            <button autoFocus onClick={() => dialog.current.close()} aria-label="Close vault" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-spectral"><X className="h-5 w-5" /></button>
          </div>
          {!active && <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {["All", ...firms].map(name => <button key={name} onClick={() => setFirm(name)} className={`shrink-0 rounded-full px-3 py-1.5 font-mono-lab text-[10px] uppercase tracking-wider transition-colors ${firm === name ? "bg-spectral text-void" : "bg-white/[0.035] text-muted-foreground hover:bg-white/[0.07] hover:text-spectral"}`}>{name}</button>)}
          </div>}
        </div>

        <div className="max-h-[calc(92vh-82px)] overflow-y-auto">
          {active ? <div className="p-5 md:p-8">
            <button onClick={() => setActive(null)} className="mb-6 flex items-center gap-2 font-mono-lab text-[11px] text-muted-foreground transition-colors hover:text-lucid"><ArrowLeft className="h-4 w-4" />Back</button>
            <div className="mx-auto max-w-4xl">
              <img src={active.url} alt={`${active.firm} payout of ${active.amount}`} className="mx-auto max-h-[66vh] max-w-full rounded-lg object-contain" />
              <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4 font-mono-lab text-[11px]"><span className="text-muted-foreground">{active.firm} · {active.date}</span><span className="text-lucid">{active.amount}</span></div>
            </div>
          </div> : <div className="columns-2 gap-3 p-3 sm:columns-3 md:columns-4 md:gap-4 md:p-5 lg:columns-5">
            {visible.map(c => <button key={c.id} onClick={() => setActive(c)} className="group mb-3 block w-full break-inside-avoid text-left md:mb-4">
              <div className="overflow-hidden rounded-lg bg-white/[0.025] transition-all duration-300 group-hover:bg-white/[0.05] group-hover:ring-1 group-hover:ring-white/[0.10]"><img src={c.url} alt={`${c.firm} payout of ${c.amount}`} loading="lazy" className="block h-auto w-full object-contain transition-transform duration-300 group-hover:scale-[1.015]" /></div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5 font-mono-lab text-[9px]"><span className="truncate text-muted-foreground">{c.firm}</span><span className="shrink-0 text-lucid">{c.amount}</span></div>
            </button>)}
          </div>}
        </div>
      </dialog>
    </section>
  );
}
