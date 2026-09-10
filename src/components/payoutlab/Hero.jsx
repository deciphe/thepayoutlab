import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, FlaskConical } from "lucide-react";
import { certificates } from "./data";
import { heroHighlights } from "./heroHighlights";

export default function Hero() {
  // duplicate the drift track so it loops seamlessly
  const drift = [...heroHighlights, ...heroHighlights];

  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-void">
      {/* ambient prismatic glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-violetglow/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-lucid/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-0 px-6 py-24 md:grid-cols-2 md:px-12">
        {/* LEFT — static narrative */}
        <div className="flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-prism/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur"
          >
            <FlaskConical className="h-3.5 w-3.5 text-lucid" />
            The Payout Lab
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="font-display font-bold leading-[0.92] tracking-tight text-spectral"
            style={{ fontSize: "clamp(3.5rem, 11vw, 9.5rem)" }}
          >
            NOT ALL <br />
            <span className="text-lucid text-glow-lucid">R</span> IS <span className="text-lucid text-glow-lucid">R</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-7 max-w-md font-mono-lab text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            This isn't another comparison page. These are my real, verified
            reviews — ranked by my own score, <span className="text-spectral">True R</span> —
            issued only after a payout actually hit my account.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <a
              href="#rankings"
              className="group inline-flex items-center justify-center gap-2 rounded-md bg-lucid px-6 py-3.5 font-mono-lab text-sm font-semibold uppercase tracking-wider text-void transition-all hover:glow-lucid"
            >
              View the True R Rankings
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a
              href="#vault"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-3.5 font-mono-lab text-sm font-medium uppercase tracking-wider text-spectral transition-colors hover:border-lucid/60 hover:text-lucid"
            >
              Enter the Payout Vault
            </a>
          </motion.div>

          <div className="mt-14 flex items-center gap-8 font-mono-lab text-xs uppercase tracking-widest text-muted-foreground">
            <div>
              <div className="text-2xl font-semibold text-spectral">{certificates.length}</div>
              <div className="mt-1">Verified Payouts</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-spectral">5</div>
              <div className="mt-1">Firms Ranked</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-lucid">TPL</div>
              <div className="mt-1">Affiliate Code</div>
            </div>
          </div>
        </div>

        {/* RIGHT — drifting certificate waterfall */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 mask-fade-y overflow-hidden">
            <div className="drift-track flex flex-col gap-4 will-change-transform" style={{ animationDuration: `${40 * heroHighlights.length / 15}s` }}>
              {drift.map((c, i) => (
                <div
                  key={i}
                  className="refractive-border shrink-0 overflow-hidden rounded-lg p-1.5 shadow-2xl"
                  style={{ width: "78%", marginLeft: i % 2 ? "auto" : "0" }}
                >
                  <img
                    src={c.url}
                    alt={`${c.firm} ${c.kind === "lifetime" ? "lifetime payouts" : "payout record"} — ${c.amount}`}
                    loading="lazy"
                    className="w-full rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}