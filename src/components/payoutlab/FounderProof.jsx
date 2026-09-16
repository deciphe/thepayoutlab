import React, { useEffect, useRef } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";

const TWEET_URL = "https://x.com/traderjon/status/1887921772009255296";

export default function FounderProof() {
  const embedRef = useRef(null);

  useEffect(() => {
    const render = () => window.twttr?.widgets?.load?.(embedRef.current);
    if (window.twttr?.widgets) {
      render();
      return undefined;
    }

    let script = document.getElementById("twitter-wjs");
    if (!script) {
      script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    }
    script.addEventListener("load", render, { once: true });
    return () => script?.removeEventListener?.("load", render);
  }, []);

  return (
    <section className="relative border-y border-white/[0.055] bg-[#050505] py-16 md:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 18% 45%, rgba(155,135,245,.10), transparent 30%), radial-gradient(circle at 82% 60%, rgba(182,255,74,.035), transparent 28%)" }}
      />
      <div className="relative mx-auto grid max-w-[1180px] gap-8 px-6 md:px-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-violetglow/20 bg-violetglow/[0.04] px-3 py-1.5 font-mono-lab text-[9px] font-semibold uppercase tracking-[0.18em] text-violetglow">
            <BadgeCheck className="h-3 w-3" /> Public receipt
          </div>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-spectral md:text-5xl">The firm said it.</h2>
          <p className="mt-4 max-w-sm font-mono-lab text-[11px] leading-6 text-white/42">Maven's CEO quoting my payout history on his own feed. That's the proof layer I actually want public.</p>
          <a href={TWEET_URL} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-mono-lab text-[10px] font-semibold uppercase tracking-[0.15em] text-lucid transition-colors hover:text-white">
            Open original on X <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080808] p-3 shadow-2xl shadow-black/30 md:p-5">
          <div className="mb-3 flex items-center justify-between px-1 font-mono-lab text-[8px] uppercase tracking-[0.18em] text-white/24">
            <span>@traderjon</span><span>Maven · external proof</span>
          </div>
          <div ref={embedRef} className="mx-auto max-w-[560px] overflow-hidden rounded-xl">
            <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true" data-align="center">
              <a href={TWEET_URL}>View the Maven CEO post on X</a>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
