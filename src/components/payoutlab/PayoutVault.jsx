import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import { certificates, firms } from "./data";

// Repeat the full set several times to convey sheer volume in the stream.
const REPEAT = 4;
const stream = Array.from({ length: certificates.length * REPEAT }, (_, i) => {
  const c = certificates[i % certificates.length];
  return { ...c, uid: `${c.id}-${i}` };
});

const totalVolume = certificates.reduce((s, c) => s + c.amountNum, 0);
const fmtVolume = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(totalVolume);

export default function PayoutVault() {
  const [active, setActive] = useState(null);

  const trueRFor = (firmName) => firms.find((f) => f.name === firmName)?.trueR ?? "—";

  return (
    <section id="vault" className="relative w-full bg-void py-24 md:py-32">
      <div className="mx-auto mb-10 max-w-[1500px] px-6 md:px-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono-lab text-xs uppercase tracking-[0.3em] text-lucid">02 / The Payout Vault</div>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-spectral md:text-6xl">
              Proof, not promises.
            </h2>
          </div>
          <div className="flex items-center gap-6 font-mono-lab">
            <div>
              <div className="text-2xl font-semibold text-spectral md:text-3xl">{certificates.length}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Verified payouts</div>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <div className="text-2xl font-semibold text-lucid md:text-3xl">${fmtVolume}</div>
              <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Total verified</div>
            </div>
          </div>
        </div>
        <p className="mt-5 max-w-xl font-mono-lab text-sm leading-relaxed text-muted-foreground">
          Real certificates across every firm I trust. Scroll the stream, tap
          any frame to enter the audit view. Every one cleared after the money
          landed.
        </p>
      </div>

      {/* horizontal payout stream */}
      <div className="relative">
        <div className="mask-fade-x overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-4 px-6 pb-6 md:px-12">
            {stream.map((c, i) => (
              <button
                key={c.uid}
                onClick={() => setActive(c)}
                className="group relative shrink-0"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="refractive-border overflow-hidden rounded-lg p-1 transition-all duration-500 group-hover:glow-lucid"
                  style={{ width: "clamp(170px, 19vw, 250px)" }}
                >
                  <div className="relative overflow-hidden rounded-md">
                    <img
                      src={c.url}
                      alt={`${c.firm} payout certificate — ${c.amount}`}
                      loading="lazy"
                      className="w-full object-cover transition-all duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="grain-overlay pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-0" />
                    <div className="pointer-events-none absolute inset-0 bg-void/10 transition-opacity duration-500 group-hover:opacity-0" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono-lab text-[9px] uppercase tracking-widest text-muted-foreground">
                  <span className="truncate pr-2">{c.firm}</span>
                  <span className="text-lucid">{c.amount}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit view modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 p-4 backdrop-blur-md md:p-10"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl"
            >
              <button
                onClick={() => setActive(null)}
                className="absolute -top-12 right-0 inline-flex items-center gap-2 font-mono-lab text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-lucid"
              >
                Close <X className="h-4 w-4" />
              </button>
              <div className="refractive-border glow-lucid overflow-hidden rounded-xl p-2">
                <img src={active.url} alt={`${active.firm} payout certificate — ${active.amount}`} className="w-full rounded-lg" />
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-lucid/40 bg-lucid/10 px-3 py-1.5 font-mono-lab text-[11px] uppercase tracking-widest text-lucid">
                  <ShieldCheck className="h-4 w-4" /> Verified by TPL
                </div>
                <div className="font-mono-lab text-xs uppercase tracking-widest text-muted-foreground">
                  {active.firm} · {active.date} · True R {trueRFor(active.firm)}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}