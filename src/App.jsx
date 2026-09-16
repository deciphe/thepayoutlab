import { useEffect } from "react";
import TrueRGuide from "./components/payoutlab/TrueRGuide";
import Hero from "./components/payoutlab/Hero";
import PayoutVault from "./components/payoutlab/PayoutVault";
import FounderProof from "./components/payoutlab/FounderProof";
import TrueRRankings from "./components/payoutlab/TrueRRankings";
import ProprPick from "./components/payoutlab/ProprPick";
import SiteFooter from "./components/payoutlab/SiteFooter";
import FloatingDock from "./components/payoutlab/FloatingDock";
import { captureAttribution } from "./lib/analytics";

export default function App() {
  useEffect(() => captureAttribution(), []);

  if (new URLSearchParams(window.location.search).get("lesson") === "true-r") return <TrueRGuide />;
  return (
    <main className="relative min-h-screen w-full bg-void text-spectral selection:bg-lucid selection:text-void">
      <Hero />
      <PayoutVault />
      <FounderProof />
      <TrueRRankings />
      <ProprPick />
      <SiteFooter />
      <FloatingDock />
    </main>
  );
}
