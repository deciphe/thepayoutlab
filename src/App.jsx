import TrueRGuide from "./components/payoutlab/TrueRGuide";
import Hero from "./components/payoutlab/Hero";
import PayoutVault from "./components/payoutlab/PayoutVault";
import TrueRLesson from "./components/payoutlab/TrueRLesson";
import TrueRRankings from "./components/payoutlab/TrueRRankings";
import MentorshipCTA from "./components/payoutlab/MentorshipCTA";
import SiteFooter from "./components/payoutlab/SiteFooter";
import FloatingDock from "./components/payoutlab/FloatingDock";

export default function App() {
  if (new URLSearchParams(window.location.search).get("lesson") === "true-r") return <TrueRGuide />;
  return (
    <main className="relative min-h-screen w-full bg-void text-spectral selection:bg-lucid selection:text-void">
      <Hero />
      <PayoutVault />
      <TrueRLesson />
      <TrueRRankings />
      <MentorshipCTA />
      <SiteFooter />
      <FloatingDock />
    </main>
  );
}
