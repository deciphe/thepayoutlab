import React from "react";

export default function SiteFooter() {
  return (
    <footer className="relative w-full border-t border-border bg-void pt-14">
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="font-display text-2xl font-semibold tracking-tight text-spectral">gigaprop<span className="text-lucid">.</span></div>

        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-border py-10 font-mono-lab text-xs uppercase tracking-widest text-muted-foreground md:grid-cols-3">
          <div><div className="text-spectral">Navigate</div><ul className="mt-4 space-y-2"><li><a href="#vault" className="transition-colors hover:text-lucid">Payout vault</a></li><li><a href="#rankings" className="transition-colors hover:text-lucid">True R</a></li><li><a href="./maven/" className="transition-colors hover:text-lucid">Maven Edition ↗</a></li></ul></div>
          <div><div className="text-spectral">Method</div><ul className="mt-4 space-y-2"><li><a href="?lesson=true-r" className="transition-colors hover:text-lucid">How I score True R ↗</a></li><li><a href="#hero" className="transition-colors hover:text-lucid">Top</a></li></ul></div>
          <div className="col-span-2 md:col-span-1"><div className="text-spectral">Disclosure</div><p className="mt-4 max-w-xs normal-case leading-relaxed tracking-normal">Personal payout records and opinions. If a link is affiliate, it will be disclosed. Rankings do not depend on link status.</p></div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 font-mono-lab text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} gigaprop</div>
          <div>Not financial advice.</div>
        </div>
      </div>
    </footer>
  );
}
