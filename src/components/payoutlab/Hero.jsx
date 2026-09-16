import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, Zap } from "lucide-react";
import { certificates } from "./data";
import { track } from "../../lib/analytics";
import CardWheel from "./CardWheel";

export default function Hero() {
  const recordedValue = Math.round(certificates.reduce((sum, c) => sum + c.amountNum, 0)).toLocaleString("en-US");
  const largestPayout = Math.round(Math.max(...certificates.map(c => c.amountNum))).toLocaleString("en-US");

  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <header className="relative z-20 mx-auto flex max-w-[1500px] items-center justify-between border-b border-border px-6 py-6 md:px-12">
        <a href="#hero" className="font-display text-lg font-semibold tracking-tight text-spectral">gigaprop<span className="text-lucid">.</span></a>
        <nav aria-label="Main navigation" className="flex gap-5 font-mono-lab text-[10px] uppercase tracking-widest text-muted-foreground">
          <a href="#vault" className="hover:text-lucid">Vault</a>
          <a href="#drops" className="hover:text-lucid">Free drops</a>
          <a href="#access" className="text-lucid hover:text-white">1:1 training</a>
        </nav>
      </header>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 14% 38%, rgba(155,135,245,0.10), transparent 52%), radial-gradient(ellipse at 78% 65%, rgba(182,255,74,0.07), transparent 48%)" }} />

      <div className="relative z-10 mx-auto grid min-h-[75vh] max-w-[1500px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:gap-12 md:px-12">
        <div className="flex flex-col justify-center">
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }} className="font-display font-bold leading-[0.92] tracking-tight text-spectral" style={{ fontSize: "clamp(3.5rem, 8.5vw, 8rem)" }}>
            PAYOUTS.<br />
            <span className="text-lucid">PROOF.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.14 }} className="mt-4 font-mono-lab text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Receipts first.</motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#vault" onClick={() => track("hero_cta_click", { target: "vault" })} className="group inline-flex items-center justify-center gap-2 rounded-md bg-lucid px-6 py-3.5 font-mono-lab text-sm font-semibold uppercase tracking-wider text-void transition-all hover:glow-lucid">
              Open payout vault <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="#access" onClick={() => track("hero_cta_click", { target: "access" })} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3.5 font-mono-lab text-sm font-medium uppercase tracking-wider text-spectral transition-colors hover:border-violetglow/60 hover:text-violetglow">
              Intuition speedrun <Zap className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        <CardWheel />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1404px] grid-cols-3 gap-4 border-y border-border px-6 py-8 font-mono-lab md:mx-12 md:px-0">
        {[
          ["$" + recordedValue, "Recorded payout value"],
          [certificates.length, "Payout records"],
          ["$" + largestPayout, "Largest payout"],
        ].map(([value, label]) => <div key={label} className="text-center"><div className="font-display text-2xl tracking-tight text-spectral md:text-4xl">{value}</div><div className="mt-2 text-[9px] uppercase tracking-widest text-muted-foreground md:text-[10px]">{label}</div></div>)}
      </div>
    </section>
  );
}
