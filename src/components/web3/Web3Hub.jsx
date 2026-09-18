import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, Circle, ExternalLink } from "lucide-react";
import "./web3-hub.css";

const firms = [
  {
    id: "hypernova",
    name: "Hypernova",
    mark: "HN",
    domain: "hypernova.xyz",
    logo: "https://hypernova.xyz/favicon.ico",
    url: "https://hypernova.xyz/",
    status: "ON-CHAIN",
    venue: "Hyperliquid",
    account: "$25K Low Risk",
    price: 275,
    target: "10%",
    daily: "3%",
    drawdown: "6% static",
    split: "80%",
    payout: "Instant / on-chain",
    execution: "Hyperliquid liquidity",
    api: "—",
    note: "Configurable risk tiers, public payout reserve, on-chain trader state and programmatic payouts.",
    signal: "Infrastructure-first",
    orbit: { x: "49%", y: "8%", delay: "-1.5s" }
  },
  {
    id: "propr",
    name: "Propr",
    mark: "PR",
    domain: "propr.xyz",
    logo: "https://www.propr.xyz/favicon.ico",
    url: "https://www.propr.xyz/",
    status: "ON-CHAIN",
    venue: "Hyperliquid",
    account: "$25K Classic",
    price: 275,
    target: "10%",
    daily: "3%",
    drawdown: "6% static",
    split: "80%",
    payout: "On-chain",
    execution: "HL fees passed through",
    api: "REST + Python / JS",
    note: "Public rule changelog with a production API beta aimed directly at agentic and automated trading.",
    signal: "Automation-first",
    orbit: { x: "78%", y: "20%", delay: "-4.2s" }
  },
  {
    id: "doji",
    name: "DojiFunded",
    mark: "DJ",
    domain: "dojifunded.com",
    logo: "https://www.dojifunded.com/favicon.ico",
    url: "https://www.dojifunded.com/",
    status: "ARBITRUM",
    venue: "On-chain",
    account: "$25K 1-Step",
    price: 198,
    target: "10%",
    daily: "3%",
    drawdown: "6%",
    split: "Configurable",
    payout: "On-chain",
    execution: "Auditable execution",
    api: "SDK / automation",
    note: "Arbitrum-native funded trading protocol built around verifiable trades, vault-native capital and developer tooling.",
    signal: "Protocol-native",
    orbit: { x: "91%", y: "50%", delay: "-2.8s" }
  },
  {
    id: "vanta",
    name: "Vanta",
    mark: "VA",
    domain: "vantatrading.io",
    logo: "https://www.vantatrading.io/favicon.ico",
    url: "https://www.vantatrading.io/",
    status: "DECENTRALIZED",
    venue: "Multi-asset",
    account: "$25K Classic",
    price: 169,
    target: "10%",
    daily: "5%",
    drawdown: "5% static",
    split: "100%",
    payout: "Weekly",
    execution: "API-enabled",
    api: "Trading API",
    note: "One-step evaluation with a 100% reward split, transparent rules and a strong API / decentralized infrastructure angle.",
    signal: "Value + scale",
    orbit: { x: "75%", y: "80%", delay: "-5.4s" }
  },
  {
    id: "vest",
    name: "Vest",
    mark: "VE",
    domain: "vestmarkets.com",
    logo: "https://www.vestmarkets.com/favicon.ico",
    url: "https://www.vestmarkets.com/",
    status: "PERPS",
    venue: "Vest Markets",
    account: "$25K 1-Step",
    price: 198,
    target: "10%",
    daily: "3%",
    drawdown: "6%",
    split: "80%",
    payout: "USDC / instant",
    execution: "Up to 100x",
    api: "—",
    note: "24/7 multi-asset derivatives with wallet-native access, high leverage and instant USDC withdrawals.",
    signal: "Leverage + breadth",
    orbit: { x: "43%", y: "91%", delay: "-3.6s" }
  },
  {
    id: "hyperpnl",
    name: "HyperPNL",
    mark: "HP",
    domain: "hyperpnl.com",
    logo: "https://hyperpnl.com/favicon.ico",
    url: "https://hyperpnl.com/",
    status: "ON-CHAIN",
    venue: "Hyperliquid + Ostium",
    account: "$25K Flex",
    price: 215,
    target: "10%",
    daily: "3%",
    drawdown: "5% static",
    split: "80%",
    payout: "Smart-contract",
    execution: "Multi-venue",
    api: "—",
    note: "Smart-contract payout model with Hyperliquid and Ostium market access across crypto, FX and commodities.",
    signal: "Payout rails",
    orbit: { x: "13%", y: "70%", delay: "-6.1s" }
  },
  {
    id: "breakout",
    name: "Breakout",
    mark: "BR",
    domain: "breakoutprop.com",
    logo: "https://www.breakoutprop.com/favicon.ico",
    url: "https://www.breakoutprop.com/",
    status: "ESTABLISHED",
    venue: "Breakout / DXtrade",
    account: "$25K Classic",
    price: 215,
    target: "10%",
    daily: "3%",
    drawdown: "6% static",
    split: "80% / 90%",
    payout: "On-demand USDC",
    execution: "0.04% / side",
    api: "—",
    note: "Mature crypto prop stack with simple rules and fast payouts, but execution cost is a material part of True R.",
    signal: "Baseline benchmark",
    orbit: { x: "10%", y: "30%", delay: "-.7s" }
  }
];

const matrixRows = [
  ["Hypernova", "$275", "10%", "3%", "6% static", "80%", "Hyperliquid"],
  ["Propr", "$275", "10%", "3%", "6% static", "80%", "Hyperliquid"],
  ["DojiFunded", "$198", "10%", "3%", "6%", "Config.", "On-chain"],
  ["Vanta", "$169", "10%", "5%", "5% static", "100%", "Multi-asset"],
  ["Vest", "$198", "10%", "3%", "6%", "80%", "Vest"],
  ["HyperPNL", "$215", "10%", "3%", "5% static", "80%", "HL + Ostium"],
  ["Breakout", "$215", "10%", "3%", "6% static", "80% / 90%", "Breakout"]
];

function money(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
}

function FirmLogo({ firm, className = "" }) {
  return (
    <span className={"gp-logo " + className} aria-hidden="true">
      <span className="gp-logo-fallback">{firm.mark}</span>
      <img
        src={firm.logo}
        alt=""
        loading="lazy"
        onError={(event) => {
          const img = event.currentTarget;
          if (!img.dataset.fallback) {
            img.dataset.fallback = "1";
            img.src = `https://www.google.com/s2/favicons?domain=${firm.domain}&sz=128`;
            return;
          }
          img.style.display = "none";
        }}
      />
    </span>
  );
}

export default function Web3Hub() {
  const [activeId, setActiveId] = useState("hypernova");
  const [notional, setNotional] = useState(100000);
  const [fee, setFee] = useState(0.04);
  const [slippage, setSlippage] = useState(0.01);
  const [risk, setRisk] = useState(1000);

  const active = firms.find((firm) => firm.id === activeId) || firms[0];

  const friction = useMemo(() => {
    const safeNotional = Math.max(0, Number(notional) || 0);
    const safeFee = Math.max(0, Number(fee) || 0) / 100;
    const safeSlip = Math.max(0, Number(slippage) || 0) / 100;
    const safeRisk = Math.max(0.01, Number(risk) || 0.01);
    const roundTrip = safeNotional * (safeFee + safeSlip) * 2;
    return {
      roundTrip,
      rDrag: roundTrip / safeRisk,
      retained: Math.max(0, 1 - roundTrip / safeRisk)
    };
  }, [notional, fee, slippage, risk]);

  function inspectFirm(id, move = false) {
    setActiveId(id);
    if (move) {
      window.setTimeout(() => {
        document.getElementById("index")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  }

  return (
    <main className="gp-site">
      <header className="gp-nav">
        <a className="gp-wordmark" href="#top" aria-label="GIGAPROP home">
          GIGAPROP<span>.</span>
        </a>
        <nav className="gp-nav-links" aria-label="Primary">
          <a href="#index">Index</a>
          <a href="#compare">Compare</a>
          <a href="#friction">Friction</a>
        </nav>
        <div className="gp-nav-meta">
          <span>WEB3 PROP INTELLIGENCE</span>
          <i />
          <span>SEP 2026</span>
        </div>
      </header>

      <section className="gp-hero" id="top">
        <div className="gp-hero-copy">
          <div className="gp-eyebrow">
            <Circle size={7} fill="currentColor" />
            PROP FIRMS · PERPETUALS · ON-CHAIN
          </div>
          <h1>
            Web3 prop trading,
            <br />
            <span>mapped.</span>
          </h1>
          <p>
            One clean index for the firms, rails and execution details shaping the next
            generation of funded trading.
          </p>
          <div className="gp-hero-actions">
            <a className="gp-primary-link" href="#index">
              Explore the index <ChevronRight size={16} />
            </a>
            <a className="gp-quiet-link" href="#friction">
              Why execution matters
            </a>
          </div>
        </div>

        <div className="gp-orbit" aria-label="Web3 prop firm orbit">
          <div className="gp-orbit-halo" aria-hidden="true" />
          <div className="gp-orbit-core" aria-hidden="true">
            <span>GP</span>
          </div>
          <div className="gp-orbit-ring gp-ring-a" aria-hidden="true" />
          <div className="gp-orbit-ring gp-ring-b" aria-hidden="true" />
          <div className="gp-orbit-ring gp-ring-c" aria-hidden="true" />

          {firms.map((firm) => (
            <button
              type="button"
              key={firm.id}
              className={"gp-orbit-firm" + (firm.id === activeId ? " is-active" : "")}
              style={{
                "--node-x": firm.orbit.x,
                "--node-y": firm.orbit.y,
                "--node-delay": firm.orbit.delay
              }}
              data-name={firm.name}
              aria-label={`Inspect ${firm.name}`}
              onClick={() => inspectFirm(firm.id, true)}
            >
              <FirmLogo firm={firm} className="gp-orbit-logo" />
            </button>
          ))}
        </div>
      </section>

      <section className="gp-index-section" id="index">
        <div className="gp-section-head">
          <div>
            <span className="gp-section-no">01</span>
            <h2>The index</h2>
          </div>
          <p>
            Seven firms to start. No referral links. Data gets replaced as official
            rulebooks and live products move.
          </p>
        </div>

        <div className="gp-index-layout">
          <div className="gp-firm-list" role="list">
            {firms.map((firm, index) => (
              <button
                type="button"
                key={firm.id}
                className={"gp-firm-row" + (firm.id === activeId ? " is-active" : "")}
                onClick={() => inspectFirm(firm.id)}
              >
                <span className="gp-rank">{String(index + 1).padStart(2, "0")}</span>
                <span className="gp-firm-mark"><FirmLogo firm={firm} /></span>
                <span className="gp-firm-name">
                  <strong>{firm.name}</strong>
                  <small>{firm.status}</small>
                </span>
                <span className="gp-firm-price">{money(firm.price)}</span>
                <span className="gp-firm-size">25K</span>
                <ChevronRight className="gp-row-arrow" size={16} />
              </button>
            ))}
          </div>

          <aside className="gp-detail">
            <div className="gp-detail-top">
              <div className="gp-detail-identity">
                <FirmLogo firm={active} className="gp-detail-logo" />
                <div>
                  <span className="gp-detail-kicker">{active.signal}</span>
                  <h3>{active.name}</h3>
                </div>
              </div>
              <a href={active.url} target="_blank" rel="noreferrer" aria-label={"Open " + active.name}>
                <ArrowUpRight size={18} />
              </a>
            </div>

            <p className="gp-detail-note">{active.note}</p>

            <dl className="gp-detail-grid">
              <div><dt>25K entry</dt><dd>{money(active.price)}</dd></div>
              <div><dt>Profit target</dt><dd>{active.target}</dd></div>
              <div><dt>Daily loss</dt><dd>{active.daily}</dd></div>
              <div><dt>Max drawdown</dt><dd>{active.drawdown}</dd></div>
              <div><dt>Reward split</dt><dd>{active.split}</dd></div>
              <div><dt>Payout rail</dt><dd>{active.payout}</dd></div>
            </dl>

            <div className="gp-detail-bottom">
              <span>{active.venue}</span>
              <span>{active.execution}</span>
              {active.api !== "—" && <span>{active.api}</span>}
            </div>
          </aside>
        </div>
      </section>

      <section className="gp-compare-section" id="compare">
        <div className="gp-section-head">
          <div>
            <span className="gp-section-no">02</span>
            <h2>25K benchmark</h2>
          </div>
          <p>
            Same nominal size. Very different economics. Price is only the first column.
          </p>
        </div>

        <div className="gp-matrix-wrap">
          <table className="gp-matrix">
            <thead>
              <tr>
                <th>Firm</th>
                <th>Entry</th>
                <th>Target</th>
                <th>Daily</th>
                <th>Max DD</th>
                <th>Split</th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) => (
                    <td key={i} className={i === 0 ? "gp-matrix-name" : ""}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="gp-source-line">
          <span>Research snapshot · 17 Sep 2026</span>
          <span>Prices and rules can move. Official rulebooks remain the source of truth.</span>
        </div>
      </section>

      <section className="gp-friction-section" id="friction">
        <div className="gp-friction-copy">
          <span className="gp-section-no">03</span>
          <h2>
            Not all R
            <br />
            is R.
          </h2>
          <p>
            A cheap challenge can still be expensive to trade. Fees and slippage reduce
            the actual risk/reward you keep. This is the layer GIGAPROP will measure.
          </p>
          <div className="gp-friction-rule">
            <span>GROSS EDGE</span>
            <i />
            <span>EXECUTION</span>
            <i />
            <strong>TRUE R</strong>
          </div>
        </div>

        <div className="gp-friction-tool">
          <div className="gp-tool-head">
            <span>ROUND-TRIP FRICTION</span>
            <strong>{friction.rDrag.toFixed(2)}R drag</strong>
          </div>
          <div className="gp-tool-result">
            <span>{friction.retained.toFixed(2)}R</span>
            <small>left from a 1R move after modeled friction</small>
          </div>
          <div className="gp-tool-fields">
            <label>
              <span>Position notional</span>
              <input type="number" value={notional} onChange={(e) => setNotional(e.target.value)} />
            </label>
            <label>
              <span>Fee / side %</span>
              <input step="0.001" type="number" value={fee} onChange={(e) => setFee(e.target.value)} />
            </label>
            <label>
              <span>Slippage / side %</span>
              <input step="0.001" type="number" value={slippage} onChange={(e) => setSlippage(e.target.value)} />
            </label>
            <label>
              <span>Planned risk $</span>
              <input type="number" value={risk} onChange={(e) => setRisk(e.target.value)} />
            </label>
          </div>
          <div className="gp-tool-foot">
            <span>Modeled round-trip cost</span>
            <strong>{money(friction.roundTrip)}</strong>
          </div>
        </div>
      </section>

      <section className="gp-thesis">
        <div className="gp-thesis-line" />
        <p>
          GIGAPROP tracks what actually changes the trade:
          <span> rules, execution, payout rails, transparency and cost.</span>
        </p>
        <a href="#index">
          Back to index <ExternalLink size={14} />
        </a>
      </section>

      <footer className="gp-footer">
        <a className="gp-wordmark" href="#top">GIGAPROP<span>.</span></a>
        <p>Independent Web3 prop & perpetuals research.</p>
        <span>v0.1 · research build</span>
      </footer>
    </main>
  );
}
