import React, { useState } from "react";
import { ArrowUpRight, Send, Zap, MessageCircle, TicketCheck } from "lucide-react";
import { track } from "../../lib/analytics";

const TELEGRAM_URL = "https://t.me/+ioeT_HyGyJs1NzNh";

const offer = [
  { icon: Zap, top: "M1 METHOD", bottom: "intuition speedrun" },
  { icon: MessageCircle, top: "UNLIMITED DM", bottom: "direct access" },
  { icon: TicketCheck, top: "FIRST EVAL", bottom: "on me" },
];

export default function DirectAccess() {
  const [handle, setHandle] = useState("");
  const [stage, setStage] = useState("Never funded");
  const [focus, setFocus] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const application = [
      "gigaprop. — intuition speedrun application",
      `Telegram: ${handle || "—"}`,
      `Stage: ${stage}`,
      `Why now: ${focus || "—"}`,
    ].join("\n");

    try { await navigator.clipboard.writeText(application); } catch {}
    track("direct_access_apply", { stage, offer: "intuition_speedrun" });
    setSent(true);
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="access" className="relative overflow-hidden border-t border-white/[0.06] bg-[#050505] px-6 py-16 md:px-12 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 45% 44%, rgba(155,135,245,.11), transparent 29%), radial-gradient(circle at 62% 58%, rgba(182,255,74,.055), transparent 24%)" }} />

      <div className="relative mx-auto max-w-[820px]">
        <div className="text-center">
          <div className="font-mono-lab text-[9px] font-semibold uppercase tracking-[0.24em] text-violetglow">1:1 training · by application</div>
          <h2 className="mt-3 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-spectral md:text-6xl">
            INTUITION<br /><span className="text-lucid">SPEEDRUN.</span>
          </h2>
          <div className="mx-auto mt-5 h-px w-16 bg-gradient-to-r from-transparent via-lucid/70 to-transparent" />
        </div>

        <div className="mt-8 grid gap-2 sm:grid-cols-3">
          {offer.map(({ icon: Icon, top, bottom }) => (
            <div key={top} className="rounded-xl border border-white/[0.07] bg-white/[0.018] px-4 py-4 text-center">
              <Icon className="mx-auto h-4 w-4 text-lucid" />
              <div className="mt-3 font-display text-lg font-semibold tracking-[-0.03em] text-spectral">{top}</div>
              <div className="mt-1 font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/28">{bottom}</div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
              <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">Telegram @</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" className="mt-1.5 w-full bg-transparent font-display text-base text-spectral outline-none placeholder:text-white/18" />
            </label>

            <label className="block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
              <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">Stage</span>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1.5 w-full bg-transparent font-display text-base text-spectral outline-none">
                <option className="bg-[#0a0a0a]">Never funded</option>
                <option className="bg-[#0a0a0a]">Passing evals, no payouts</option>
                <option className="bg-[#0a0a0a]">Already getting payouts</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
            <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">Why now?</span>
            <textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={2} placeholder="One sentence." className="mt-1.5 w-full resize-none bg-transparent font-display text-base leading-6 text-spectral outline-none placeholder:text-white/18" />
          </label>

          <button type="submit" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-lucid px-5 py-4 font-mono-lab text-[11px] font-semibold uppercase tracking-[0.14em] text-void transition-all hover:glow-lucid">
            <Send className="h-4 w-4" /> Apply for 1:1 <ArrowUpRight className="h-4 w-4" />
          </button>

          <div className="mt-3 text-center font-mono-lab text-[8px] uppercase tracking-[0.13em] text-white/22">
            {sent ? "Application copied — paste into Telegram." : "Accepted applicants only."}
          </div>
        </form>
      </div>
    </section>
  );
}
