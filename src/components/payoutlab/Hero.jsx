import WispMark from "./WispMark";
import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { certificates } from "./data";
import CardWheel from "./CardWheel";

export default function Hero() {
  // duplicate the drift track so it loops seamlessly
  const paidFirms = new Set(certificates.map(c => c.firm)).size;

  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      <header className="relative z-20 mx-auto flex max-w-[1500px] items-center justify-between border-b border-border px-6 py-6 md:px-12">
        <a href="#hero" className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight"><WispMark className="h-5 w-5 text-lucid" />the payout lab<span className="text-lucid">.</span></a>
        <nav aria-label="Main navigation" className="flex gap-5 font-mono-lab text-[10px] uppercase tracking-widest text-muted-foreground">
          <a href="#vault" className="hover:text-lucid">Proof</a><a href="#rankings" className="hover:text-lucid">Rankings</a><a href="#lesson" className="hidden hover:text-lucid sm:block">The method</a>
        </nav>
      </header>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 14% 38%, rgba(138,43,226,0.09), transparent 52%), radial-gradient(ellipse at 78% 65%, rgba(210,255,0,0.065), transparent 48%)" }} />

      <div className="relative z-10 mx-auto grid min-h-[75vh] max-w-[1500px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:gap-12 md:px-12">
        {/* LEFT — static narrative */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex w-fit items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
          >
            <WispMark className="h-3.5 w-3.5 text-lucid" />
            01 / Real money. Real experience.
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display font-bold leading-[0.92] tracking-tight text-spectral"
            style={{ fontSize: "clamp(3.5rem, 8.5vw, 8rem)" }}
          >
            NOT ALL <br />
            <span className="text-lucid">R</span> IS <span className="text-lucid">R</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-7 max-w-md font-display text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Real payouts. Personal reviews. Prop firms ranked by <span className="text-spectral">True R</span> — the full cost of getting paid.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4"
          >
            <a
              href="#rankings"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-lucid px-6 py-3.5 font-mono-lab text-sm font-semibold uppercase tracking-wider text-void transition-all hover:glow-lucid"
            >
              Explore rankings
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#vault"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3.5 font-mono-lab text-sm font-medium uppercase tracking-wider text-spectral transition-colors hover:border-lucid/60 hover:text-lucid"
            >
              See the payouts
            </a>
          </motion.div>


        </div>

        <CardWheel />
      </div>
      <div className="relative z-10 mx-auto grid max-w-[1404px] grid-cols-3 gap-4 border-y border-border px-6 py-8 font-mono-lab md:mx-12 md:px-0">
        {[
          ["$" + Math.round(certificates.reduce((sum, c) => sum + c.amountNum, 0)).toLocaleString("en-US"), "Total paid out"],
          [certificates.length, "Verified payouts"],
          [paidFirms, "Firms paid"],
        ].map(([value, label]) => <div key={label} className="text-center"><div className="font-display text-2xl tracking-tight text-spectral md:text-4xl">{value}</div><div className="mt-2 text-[9px] uppercase tracking-widest text-muted-foreground md:text-[10px]">{label}</div></div>)}
      </div>
    </section>
  );
}
