import WispMark from "./WispMark";
import React from "react";

import { tickerItems } from "./data";

export default function SiteFooter() {
  const ticker = [...tickerItems, ...tickerItems];
  return (
    <footer className="relative w-full overflow-hidden border-t border-border bg-void pt-20">
      {/* ticker tape */}
      <div className="relative mb-20 border-y border-border py-4">
        <div className="mask-fade-x overflow-hidden">
          <div className="ticker-track flex w-max gap-10 whitespace-nowrap font-mono-lab text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {ticker.map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-lucid" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="flex flex-col items-center text-center">
          <WispMark className="h-8 w-8 text-lucid" />
          <h3 className="mt-6 font-display text-3xl font-bold tracking-tight text-spectral md:text-5xl">
            The Lab Never Lies.
          </h3>
          <p className="mt-4 max-w-md font-mono-lab text-sm leading-relaxed text-muted-foreground">
            Not all R is R. These rankings are earned, not bought. Use code{" "}
            <span className="text-lucid">TPL</span> and trade with proof.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 border-t border-border py-10 font-mono-lab text-xs uppercase tracking-widest text-muted-foreground md:grid-cols-4">
          <div>
            <div className="text-spectral">The Lab</div>
            <ul className="mt-4 space-y-2">
              <li><a href="#hero" className="transition-colors hover:text-lucid">Manifesto</a></li>
              <li><a href="#vault" className="transition-colors hover:text-lucid">Payout Vault</a></li>
              <li><a href="#rankings" className="transition-colors hover:text-lucid">True R Rankings</a></li>
            </ul>
          </div>
          <div>
            <div className="text-spectral">Firms</div>
            <ul className="mt-4 space-y-2">
              <li><a href="#rankings" className="transition-colors hover:text-lucid">Lucid Trading</a></li>
              <li><a href="#rankings" className="transition-colors hover:text-lucid">FundedNext</a></li>
              <li><a href="#rankings" className="transition-colors hover:text-lucid">Tradeify</a></li>
            </ul>
          </div>
          <div>
            <div className="text-spectral">Protocol</div>
            <ul className="mt-4 space-y-2">
              <li><span className="text-lucid">Code: TPL</span></li>
              <li><a href="#rankings" className="transition-colors hover:text-lucid">How to Claim</a></li>
              <li><a href="#vault" className="transition-colors hover:text-lucid">Verification</a></li>
            </ul>
          </div>
          <div>
            <div className="text-spectral">Contact</div>
            <ul className="mt-4 space-y-2">
              <li><a href="mailto:lab@thepayoutlab.com" className="transition-colors hover:text-lucid">lab@thepayoutlab.com</a></li>
              <li><a href="#hero" className="transition-colors hover:text-lucid">Submit a Payout</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 font-mono-lab text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} The Payout Lab</div>
          <div>Not financial advice. Trade your own risk.</div>
        </div>
      </div>
    </footer>
  );
}