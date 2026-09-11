import React, { useRef, useState } from "react";
import { ArrowUpRight, X, ArrowLeft } from "lucide-react";
import { certificates } from "./data";

const ordered = [...certificates].sort((a, b) => b.amountNum - a.amountNum || a.id.localeCompare(b.id));
const groups = [...new Set(certificates.map(c => c.firm))].map(firm => ordered.filter(c => c.firm === firm));
const previewCards = Array.from({ length: Math.max(...groups.map(g => g.length)) }, (_, i) => groups.map(g => g[i]).filter(Boolean)).flat();
const total = Math.round(certificates.reduce((sum, c) => sum + c.amountNum, 0)).toLocaleString("en-US");

export default function PayoutVault() {
  const dialog = useRef(null);
  const [active, setActive] = useState(null);
  const openVault = () => { setActive(null); dialog.current.showModal(); };

  return (
    <section id="vault" className="bg-void px-6 py-10 md:px-12 md:py-12">
      <div className="relative mx-auto max-w-[1404px] overflow-hidden rounded-xl border border-border bg-prism/20">
        <div className="relative z-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <div className="shrink-0">
            <div className="font-mono-lab text-[10px] uppercase tracking-[0.25em] text-lucid">02 / Proof archive</div>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-spectral">Proof before pitch.</h2>
            <p className="mt-2 font-mono-lab text-[11px] text-muted-foreground">{certificates.length} records · ${total} recorded value</p>
          </div>
          <div aria-hidden="true" className="relative h-24 min-w-0 flex-1 overflow-hidden sm:mx-4" style={{maskImage: "linear-gradient(to right, transparent, black 6%, black 62%, transparent 100%)"}}>
            {previewCards.filter(c => c.firm !== "Breakout").slice(0, 12).map((c, i) => (
              <img key={c.id} src={c.url} alt="" loading="lazy" className="absolute top-2 h-20 w-24 rounded border border-white/10 object-cover shadow-lg" style={{ left: `${i * 12}%`, zIndex: 12 - i, opacity: 1 - i / 24, filter: `blur(${Math.max(0, i - 2) / 3}px)` }} />
            ))}
          </div>
          <button onClick={openVault} className="inline-flex shrink-0 items-center justify-center gap-3 self-start rounded-lg border border-lucid/30 bg-lucid/5 px-5 py-3 font-mono-lab text-xs text-lucid transition-colors hover:bg-lucid/10 sm:self-center">Open the vault <ArrowUpRight className="h-4 w-4" /></button>
        </div>
      </div>

      <dialog aria-label="gigaprop payout vault" ref={dialog} onClose={() => setActive(null)} className="m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-y-auto rounded-xl border border-border bg-void p-0 text-spectral backdrop:bg-black/80 backdrop:backdrop-blur-md">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-void/95 px-6 py-5 backdrop-blur">
          <div>
            <h2 className="font-display text-xl font-semibold">gigaprop payout vault</h2>
            <p className="mt-1 font-mono-lab text-[10px] text-muted-foreground">{certificates.length} records · ${total} recorded value · Largest first</p>
          </div>
          <button autoFocus onClick={() => dialog.current.close()} aria-label="Close vault" className="rounded p-2 text-muted-foreground hover:text-lucid"><X className="h-5 w-5" /></button>
        </div>
        {active ? <div className="p-6">
          <button onClick={() => setActive(null)} className="mb-5 flex items-center gap-2 font-mono-lab text-xs text-lucid"><ArrowLeft className="h-4 w-4" />All payouts</button>
          <img src={active.url} alt={`${active.firm} payout of ${active.amount}`} className="mx-auto max-h-[60vh] max-w-full object-contain" />
          <p className="mt-5 text-center font-mono-lab text-xs text-muted-foreground">{active.firm} · {active.amount} · {active.date}</p>
        </div> : <div className="grid grid-cols-2 gap-5 p-6 sm:grid-cols-3 lg:grid-cols-4">
          {ordered.map(c => <button key={c.id} onClick={() => setActive(c)} className="group min-w-0 text-left">
            <div className="flex h-32 items-center justify-center rounded-md border border-border bg-prism/20 p-2 transition-colors group-hover:border-lucid/40"><img src={c.url} alt={`${c.firm} payout of ${c.amount}`} loading="lazy" className="h-full w-full object-contain" /></div>
            <div className="mt-3 flex flex-wrap justify-between gap-1 font-mono-lab text-[10px]"><span>{c.firm}</span><span className="text-lucid">{c.amount}</span></div>
            <p className="mt-1 font-mono-lab text-[9px] text-muted-foreground">{c.date}</p>
          </button>)}
        </div>}
      </dialog>
    </section>
  );
}
