import React, { useState } from "react";
import { ArrowUpRight, Send } from "lucide-react";
import { track } from "../../lib/analytics";

const TELEGRAM_URL = "https://t.me/+ioeT_HyGyJs1NzNh";

export default function DirectAccess() {
  const [handle, setHandle] = useState("");
  const [stage, setStage] = useState("Getting payouts");
  const [focus, setFocus] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const application = [
      "gigaprop. 1:1 application",
      `Telegram: ${handle || "—"}`,
      `Stage: ${stage}`,
      `Focus: ${focus || "—"}`,
    ].join("\n");

    try { await navigator.clipboard.writeText(application); } catch {}
    track("direct_access_apply", { stage });
    setSent(true);
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="access" className="relative overflow-hidden border-t border-white/[0.06] bg-[#050505] px-6 py-16 md:px-12 md:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(155,135,245,.08), transparent 34%), radial-gradient(circle at 58% 54%, rgba(182,255,74,.04), transparent 26%)" }} />

      <div className="relative mx-auto max-w-[760px]">
        <div className="mb-7 text-center">
          <div className="font-mono-lab text-[9px] font-semibold uppercase tracking-[0.22em] text-lucid">1:1 direct access</div>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] text-spectral md:text-5xl">Apply on Telegram.</h2>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
              <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">Telegram @</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" className="mt-1.5 w-full bg-transparent font-display text-base text-spectral outline-none placeholder:text-white/18" />
            </label>

            <label className="block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
              <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">Stage</span>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1.5 w-full bg-transparent font-display text-base text-spectral outline-none">
                <option className="bg-[#0a0a0a]">Getting payouts</option>
                <option className="bg-[#0a0a0a]">Already getting payouts</option>
                <option className="bg-[#0a0a0a]">Scaling</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block rounded-xl border border-white/[0.06] bg-black/25 px-4 py-3">
            <span className="font-mono-lab text-[8px] uppercase tracking-[0.15em] text-white/30">What do you want help with?</span>
            <textarea value={focus} onChange={(e) => setFocus(e.target.value)} rows={3} placeholder="Keep it short." className="mt-1.5 w-full resize-none bg-transparent font-display text-base leading-6 text-spectral outline-none placeholder:text-white/18" />
          </label>

          <button type="submit" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-lucid px-5 py-4 font-mono-lab text-[11px] font-semibold uppercase tracking-[0.14em] text-void transition-all hover:glow-lucid">
            <Send className="h-4 w-4" /> Apply on Telegram <ArrowUpRight className="h-4 w-4" />
          </button>

          <div className="mt-3 text-center font-mono-lab text-[8px] uppercase tracking-[0.13em] text-white/22">
            {sent ? "Application copied — paste it into Telegram." : "Your answers are copied locally, then Telegram opens."}
          </div>
        </form>
      </div>
    </section>
  );
}
