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
    <section className="relative border-y border-white/[0.055] bg-[#050505] py-10 md:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 18% 45%, rgba(155,135,245,.09), transparent 30%), radial-gradient(circle at 82% 60%, rgba(182,255,74,.028), transparent 28%)" }}
      />
      <div className="relative mx-auto grid max-w-[980px] gap-6 px-6 md:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="max-w-[390px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-violetglow/20 bg-violetglow/[0.04] px-3 py-1.5 font-mono-lab text-[8px] font-semibold uppercase tracking-[0.18em] text-violetglow">
            <BadgeCheck className="h-3 w-3" /> Public receipt
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[0.96] tracking-[-0.05em] text-spectral md:text-4xl">The firm said it.</h2>
          <p className="mt-3 max-w-sm font-mono-lab text-[10px] leading-5 text-white/40">Maven's CEO quoting my payout history on his own feed.</p>
          <a href={TWEET_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 font-mono-lab text-[9px] font-semibold uppercase tracking-[0.14em] text-lucid transition-colors hover:text-white">
            Open original on X <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="mx-auto w-full max-w-[410px] overflow-hidden rounded-xl border border-white/[0.07] bg-[#080808] p-2.5 shadow-xl shadow-black/25 lg:mx-0">
          <div className="mb-2 flex items-center justify-between px-1 font-mono-lab text-[7px] uppercase tracking-[0.16em] text-white/22">
            <span>@traderjon</span><span>Maven · external proof</span>
          </div>
          <div ref={embedRef} className="mx-auto max-w-[390px] overflow-hidden rounded-lg">
            <blockquote className="twitter-tweet" data-theme="dark" data-dnt="true" data-align="center" data-width="390">
              <a href={TWEET_URL}>View the Maven CEO post on X</a>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
