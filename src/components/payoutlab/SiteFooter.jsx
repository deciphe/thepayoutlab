import React from "react";
import { tickerItems } from "./data";

export default function SiteFooter() {
  const ticker = [...tickerItems, ...tickerItems];
  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-void pt-20">
      <div className="relative mb-20 border-y border-border py-4">
        <div className="mask-fade-x overflow-hidden">
          <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-mono-lab text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {ticker.map((t, i) => <span key={i} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-lucid" />{t}</span>)}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="flex flex-col items-center text-center">
          <div className="font-display text-2xl font-semibold tracking-tight text-spectral">gigaprop<span className="text-lucid">.</span></div>
          <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-spectral md:text-5xl">Proof doesn't need a pitch.</h3>
          <p className="mt-4 max-w-md font-mono-lab text-sm leading-relaxed text-muted-foreground">Payout history first. Personal rankings second. Read the rules, inspect the receipts, make your own decision.</p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border py-10 font-mono-lab text-xs uppercase tracking-widest text-muted-foreground md:grid-cols-4">
          <div><div className="text-spectral">gigaprop</div><ul className="mt-4 space-y-2"><li><a href="#hero" className="transition-colors hover:text-lucid">Home</a></li><li><a href="#vault" className="transition-colors hover:text-lucid">Payout vault</a></li><li><a href="#rankings" className="transition-colors hover:text-lucid">True R index</a></li></ul></div>
          <div><div className="text-spectral">Evidence</div><ul className="mt-4 space-y-2"><li><a href="#vault" className="transition-colors hover:text-lucid">All payouts</a></li><li><a href="?lesson=true-r" className="transition-colors hover:text-lucid">True R handbook</a></li><li><a href="./maven/" className="transition-colors hover:text-lucid">Maven edition ↗</a></li></ul></div>
          <div><div className="text-spectral">Method</div><ul className="mt-4 space-y-2"><li><span className="text-lucid">Not all R is R.</span></li><li><span>Costs matter.</span></li><li><span>Time matters.</span></li></ul></div>
          <div><div className="text-spectral">Note</div><p className="mt-4 max-w-xs normal-case leading-relaxed tracking-normal">Personal experience and payout records. Affiliate relationships are disclosed where applicable.</p></div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 font-mono-lab text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} gigaprop</div>
          <div>Not financial advice. Trade your own risk.</div>
        </div>
      </div>
    </footer>
  );
}
