import { useEffect } from "react";
import Hero from "./components/payoutlab/Hero";
import PayoutVault from "./components/payoutlab/PayoutVault";
import EmailCapture from "./components/payoutlab/EmailCapture";
import DirectAccess from "./components/payoutlab/DirectAccess";
import SiteFooter from "./components/payoutlab/SiteFooter";
import FloatingDock from "./components/payoutlab/FloatingDock";
import { captureAttribution } from "./lib/analytics";

export default function App() {
  useEffect(() => captureAttribution(), []);

  return (
    <main className="relative min-h-screen w-full bg-void text-spectral selection:bg-lucid selection:text-void">
      <Hero />
      <PayoutVault />
      <EmailCapture />
      <DirectAccess />
      <SiteFooter />
      <FloatingDock />
    </main>
  );
}
