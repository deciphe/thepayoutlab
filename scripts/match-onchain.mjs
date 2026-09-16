import { mkdir, writeFile } from 'node:fs/promises';
import { certificates } from '../src/components/payoutlab/data.js';

const WALLET = '0xc802972bc2ebe0514e928ae0e4cc1d10db271912'.toLowerCase();
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase();
const API = `https://eth.blockscout.com/api/v2/addresses/${WALLET}/token-transfers`;
const OUT = new URL('../src/components/payoutlab/onchainMatches.json', import.meta.url);

const targetIds = [
  'maven-011', 'maven-020', 'maven-002', 'maven-017', 'maven-023',
  'lucid-trading-004', 'lucid-trading-001', 'lucid-trading-002', 'lucid-trading-005', 'lucid-trading-003',
];

const known = {
  'lucid-trading-001': '0xd3120cbcfcabaa6271a8ab02845a3167f933ff8900d16c7f585cbef8b4583d9e',
};

function dateOnly(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function certDate(value) {
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return null;
}

function amountOf(item) {
  const decimals = Number(item?.token?.decimals ?? item?.total?.decimals ?? 6);
  const raw = Number(item?.total?.value ?? 0);
  return raw / (10 ** decimals);
}

async function fetchTransfers() {
  const all = [];
  let next = null;
  for (let page = 0; page < 30; page += 1) {
    const url = new URL(API);
    url.searchParams.set('type', 'ERC-20');
    url.searchParams.set('filter', 'to');
    url.searchParams.set('token', USDC);
    if (next) Object.entries(next).forEach(([k, v]) => v != null && url.searchParams.set(k, String(v)));
    const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'gigaprop-build/1.0' } });
    if (!response.ok) throw new Error(`Blockscout ${response.status}`);
    const data = await response.json();
    const items = Array.isArray(data.items) ? data.items : [];
    all.push(...items);
    next = data.next_page_params || null;
    if (!next || items.length === 0) break;
  }
  return all.filter(item => {
    const symbol = String(item?.token?.symbol || '').toUpperCase();
    const token = String(item?.token?.address_hash || '').toLowerCase();
    const to = String(item?.to?.hash || '').toLowerCase();
    return symbol === 'USDC' && token === USDC && to === WALLET;
  });
}

function expectedAmounts(cert) {
  if (cert.firm === 'Maven') return [cert.amountNum * 0.8, cert.amountNum];
  if (cert.firm === 'Lucid Trading') return [cert.amountNum * 0.9, cert.amountNum];
  return [cert.amountNum];
}

function score(cert, tx) {
  const txDate = dateOnly(tx.timestamp);
  const cDate = certDate(cert.date);
  if (txDate == null || cDate == null) return null;
  const days = Math.abs(txDate - cDate) / 86400000;
  if (days > 5) return null;
  const got = amountOf(tx);
  let best = null;
  for (const expected of expectedAmounts(cert)) {
    const delta = Math.abs(got - expected);
    const pct = expected ? delta / expected : Infinity;
    const tolerance = Math.max(12, expected * 0.035);
    if (delta > tolerance) continue;
    const candidate = { expected, delta, pct, days, score: days * 10 + pct * 100 };
    if (!best || candidate.score < best.score) best = candidate;
  }
  return best;
}

function txRecord(tx, cert, match) {
  return {
    txHash: tx.transaction_hash,
    txUrl: `https://etherscan.io/tx/${tx.transaction_hash}`,
    receivedAmount: Math.round(amountOf(tx) * 1e6) / 1e6,
    timestamp: tx.timestamp,
    expectedAmount: Math.round(match.expected * 100) / 100,
    amountDelta: Math.round(match.delta * 100) / 100,
    dayDelta: match.days,
    confidence: match.days === 0 && match.pct <= 0.02 ? 'high' : 'matched',
  };
}

const targets = targetIds.map(id => certificates.find(c => c.id === id)).filter(Boolean);
let transfers = [];
try {
  transfers = await fetchTransfers();
} catch (error) {
  console.error('[onchain] unable to fetch Blockscout:', error.message);
}

const matches = {};
const used = new Set();

for (const cert of targets) {
  const hash = known[cert.id];
  if (!hash) continue;
  const tx = transfers.find(item => String(item.transaction_hash).toLowerCase() === hash.toLowerCase());
  if (tx) {
    const match = score(cert, tx) || { expected: expectedAmounts(cert)[0], delta: Math.abs(amountOf(tx) - expectedAmounts(cert)[0]), pct: 0, days: 0 };
    matches[cert.id] = txRecord(tx, cert, match);
    used.add(hash.toLowerCase());
  } else {
    matches[cert.id] = {
      txHash: hash,
      txUrl: `https://etherscan.io/tx/${hash}`,
      receivedAmount: null,
      timestamp: null,
      expectedAmount: Math.round(expectedAmounts(cert)[0] * 100) / 100,
      amountDelta: null,
      dayDelta: 0,
      confidence: 'confirmed',
    };
    used.add(hash.toLowerCase());
  }
}

const candidates = [];
for (const cert of targets) {
  if (matches[cert.id]) continue;
  for (const tx of transfers) {
    const hash = String(tx.transaction_hash || '').toLowerCase();
    if (!hash || used.has(hash)) continue;
    const match = score(cert, tx);
    if (match) candidates.push({ cert, tx, match });
  }
}

candidates.sort((a, b) => a.match.score - b.match.score);
for (const candidate of candidates) {
  const { cert, tx, match } = candidate;
  const hash = String(tx.transaction_hash).toLowerCase();
  if (matches[cert.id] || used.has(hash)) continue;
  matches[cert.id] = txRecord(tx, cert, match);
  used.add(hash);
}

await mkdir(new URL('../src/components/payoutlab/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify(matches, null, 2) + '\n', 'utf8');

console.log(`[onchain] fetched ${transfers.length} incoming USDC transfers for ${WALLET}`);
for (const cert of targets) {
  const m = matches[cert.id];
  if (!m) {
    console.log(`[onchain] NO MATCH  ${cert.id} ${cert.date} ${cert.amount}`);
    const cDate = certDate(cert.date);
    const expected = expectedAmounts(cert)[0];
    const nearby = transfers
      .map(tx => ({
        tx,
        amount: amountOf(tx),
        days: cDate == null || dateOnly(tx.timestamp) == null ? Infinity : Math.abs(dateOnly(tx.timestamp) - cDate) / 86400000,
      }))
      .filter(x => x.days <= 30)
      .sort((a, b) => (a.days - b.days) || (Math.abs(a.amount - expected) - Math.abs(b.amount - expected)))
      .slice(0, 15);
    for (const x of nearby) {
      console.log(`[onchain] NEARBY    ${cert.id} day=${x.days} expected=${expected.toFixed(2)} got=${x.amount.toFixed(6)} at=${x.tx.timestamp} tx=${x.tx.transaction_hash}`);
    }
    continue;
  }
  console.log(`[onchain] MATCH     ${cert.id} ${cert.date} ${cert.amount} -> ${m.receivedAmount ?? '?'} USDC ${m.txHash}`);
}
