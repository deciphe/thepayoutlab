import { lazy, Suspense, useEffect, useState } from "react";
import Web3Hub from "./components/web3/Web3Hub";

const VestPdf = lazy(() => import("./components/lessons/VestPdf"));
const Weekly = lazy(() => import("./components/weekly/Weekly"));
const Million = lazy(() => import("./components/vestflow/Million"));
const FlowHub = lazy(() => import("./components/vestflow/FlowHub"));
const Vestflow = lazy(() => import("./components/vestflow/Vestflow"));
export default function App() {
  const [hash, setHash] = useState(() => typeof window === "undefined" ? "" : window.location.hash);
  useEffect(() => {
    const change = () => { setHash(window.location.hash); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  if(hash.split("?")[0] === "#vestpdf")return <Suspense fallback={<div style={{background:"#090a0e",minHeight:"100vh"}}/>}><VestPdf/></Suspense>;
  const flow=hash === "#vestflow" ? "vest" : hash === "#breakoutflow" ? "breakout" : hash === "#novaflow" ? "nova" : hash === "#proprflow" ? "propr" : null;
  if(hash.split("?")[0] === "#leaderboard")return <Suspense fallback={<div style={{background:"#0a0e0c",minHeight:"100vh"}}/>}><Weekly/></Suspense>;
  if(hash === "#1milli")return <Suspense fallback={<div style={{background:"#090b0a",minHeight:"100vh"}}/>}><Million/></Suspense>;
  if(hash === "#flow")return <Suspense fallback={<div style={{background:"#090b0a",minHeight:"100vh"}}/>}><FlowHub/></Suspense>;
  return flow ? <Suspense fallback={<div style={{background:'#090b0a',color:'#b6ff4a',minHeight:'100vh',padding:40}}>Loading flow…</div>}><Vestflow key={flow} firm={flow}/></Suspense> : <Web3Hub />;
}

/*
  Legacy payout/application experience is intentionally parked, not deleted.
  Components remain under src/components/payoutlab and the exact pre-pivot
  site is preserved on branch: archive/payout-site-2026-09-17
*/
