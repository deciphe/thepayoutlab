import React, { useState } from "react";
import { certificates, waterfallRecords } from "./data";
import PayoutWaterfall from "./PayoutWaterfall";
import "./payout-gallery.css";

const firms = [...new Set(certificates.map(c => c.firm))];
export default function PayoutVault() {
  const [firm, setFirm] = useState("All firms");
  const records = waterfallRecords.filter(c => firm === "All firms" || c.firm === firm);
  const total = records.reduce((sum, c) => sum + (Number.isFinite(c.amountNum) ? c.amountNum : 0), 0);
  return <section id="vault" className="payout-gallery"><div className="payout-gallery-inner">
    <header className="payout-gallery-heading"><div><p className="payout-eyebrow">02 / THE PAYOUT VAULT</p><h2>Proof, not promises.</h2><p className="payout-intro">Take your time. Pause the flow or open any record for a closer look.</p></div>
      <div className="payout-summary" aria-live="polite"><div><strong>{records.length}</strong><span>Payout records</span></div><div><strong>{new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(total)}</strong><span>Recorded amount</span></div></div>
    </header>
    <div className="payout-filters" role="group" aria-label="Filter payout records by firm">
      {["All firms", ...firms].map(name => <button type="button" key={name} aria-pressed={firm === name} onClick={() => setFirm(name)}>{name}</button>)}
    </div>
    <PayoutWaterfall key={firm} records={records} />
  </div></section>;
}
