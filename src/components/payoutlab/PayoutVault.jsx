import React from "react";
import { certificates } from "./data";

const privateNameIds = new Set(["fundednext-004", "fundednext-005"]);

const grouped = [...new Set(certificates.map(c => c.firm))]
  .map(firm => ({
    firm,
    all: certificates.filter(c => c.firm === firm).sort((a, b) => b.amountNum - a.amountNum || a.id.localeCompare(b.id)),
  }))
  .sort((a, b) => b.all.length - a.all.length || a.firm.localeCompare(b.firm));

function ProofImage({ certificate }) {
  const privateName = privateNameIds.has(certificate.id);
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.02]">
      <img
        src={certificate.url}
        alt={`${certificate.firm} payout ${certificate.amount}`}
        loading="lazy"
        className="block h-auto w-full object-contain"
      />
      {privateName && (
        <div
          aria-label="Last name censored"
          className="pointer-events-none absolute left-[51.5%] top-[31.7%] h-[8.7%] w-[45%] bg-[#1a1a1b]/92 backdrop-blur-md"
          style={{ maskImage: "linear-gradient(to right, transparent 0%, black 9%, black 100%)" }}
        />
      )}
    </div>
  );
}

export default function PayoutVault() {
  return (
    <section id="vault" className="relative overflow-hidden bg-void px-6 py-14 md:px-12 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 8% 8%, rgba(155,135,245,.075), transparent 24%), radial-gradient(circle at 90% 34%, rgba(182,255,74,.05), transparent 22%)" }} />

      <div className="relative mx-auto max-w-[1404px]">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-mono-lab text-[9px] font-semibold uppercase tracking-[0.22em] text-violetglow">Selected proof</div>
            <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.055em] text-spectral md:text-5xl">Payout vault.</h2>
          </div>
          <p className="max-w-md font-mono-lab text-[9px] uppercase leading-5 tracking-[0.12em] text-white/28 md:text-right">
            Top 5 from each firm. The full stack stays off the page.
          </p>
        </div>

        <div className="space-y-10">
          {grouped.map(({ firm, all }) => {
            const shown = all.slice(0, 5);
            const revealCount = firm === "Maven" || firm === "Topstep";
            return (
              <div key={firm}>
                <div className="mb-3 flex items-end justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <div>
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.035em] text-spectral">{firm}</h3>
                    <div className="mt-1 font-mono-lab text-[8px] uppercase tracking-[0.13em] text-white/24">Top {Math.min(5, all.length)} shown</div>
                  </div>
                  {revealCount && (
                    <div className="font-mono-lab text-[8px] uppercase tracking-[0.13em] text-lucid/70">
                      {all.length} payouts on file
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {shown.map(c => (
                    <div key={c.id} className="min-w-0">
                      <ProofImage certificate={c} />
                      <div className="mt-2 flex items-center justify-between gap-2 px-0.5 font-mono-lab text-[8px] uppercase tracking-[0.1em] text-white/22">
                        <span>{c.date}</span>
                        <span className="text-white/14">#{c.id.split("-").at(-1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
