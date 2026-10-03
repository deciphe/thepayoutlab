import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalTraderWallet } from '../src/lib/trader-wallets.js';
import { weeklySources, rankWeekly } from '../src/lib/weekly-leaderboard.js';
import { seasonBoard, seasonKey, seasonNumber, seasonStart } from '../src/lib/season-leaderboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const DATA_ROOT = 'https://raw.githubusercontent.com/deciphe/thepayoutlab/vestflow-data/';
const SITE = 'https://gigaprop.xyz/';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith('--')) continue;
    const [rawKey, inline] = value.slice(2).split('=', 2);
    if (inline !== undefined) out[rawKey] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[rawKey] = argv[++i];
    else out[rawKey] = true;
  }
  return out;
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function usd(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

function accentForRank(rank) {
  if (rank === 1) return { line: '#c9b06d', glow: 'rgba(201,176,109,.16)', label: 'GOLD / NO. 01' };
  if (rank === 2) return { line: '#d4d5d7', glow: 'rgba(212,213,215,.12)', label: 'PLATINUM / NO. 02' };
  if (rank === 3) return { line: '#b9aa8e', glow: 'rgba(185,170,142,.12)', label: 'PODIUM / NO. 03' };
  return { line: '#7f8682', glow: 'rgba(127,134,130,.10)', label: 'GIGAPROP / RANKED' };
}

async function loadLocalEnv() {
  try {
    const raw = await fs.readFile(path.join(projectRoot, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index < 1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {}
}

async function readJson(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'gigaprop-leaderboard-mailer/1.0' } });
  if (!response.ok) throw new Error(`Could not read ${url} (${response.status})`);
  return response.json();
}

async function currentVestSeason() {
  const start = seasonStart();
  const key = seasonKey(start);
  const sources = weeklySources('vest');
  const snapshots = Object.fromEntries(await Promise.all(
    sources.map(async source => [source.slug, await readJson(`${DATA_ROOT}${source.slug}.json`)])
  ));
  let prior = null;
  try { prior = await readJson(`${DATA_ROOT}seasons/${key}.json`); } catch {}
  const board = seasonBoard(snapshots, start, Date.now(), prior, 'vest');
  if (!board?.available) throw new Error(`Vest season board is unavailable: ${(board?.missing || ['unknown reason']).join(', ')}`);
  return { key, number: seasonNumber(start), ranked: rankWeekly(board, 'vest') };
}

async function traderForWallet(wallet) {
  const raw = await fs.readFile(path.join(projectRoot, 'src/data/traders.json'), 'utf8');
  const traders = JSON.parse(raw);
  const canonical = canonicalTraderWallet(wallet);
  const trader = traders.find(item => canonicalTraderWallet(item.wallet) === canonical);
  if (!trader) throw new Error('That wallet is not in src/data/traders.json yet. Add/approve the trader first, then send the confirmation.');
  return { ...trader, wallet: canonical };
}

function emailHtml({ trader, row, season, seasonNumber: seasonNo }) {
  const username = trader.twitter.replace(/^@/, '');
  const displayName = trader.name || username;
  const avatar = new URL(`traders/${trader.image}`, SITE).href;
  const profileUrl = `${SITE}#leaderboard?season=${encodeURIComponent(season)}&firm=vest&wallet=${encodeURIComponent(trader.wallet)}`;
  const accent = accentForRank(row.rank);
  const tag = trader.tag
    ? `<span style="display:inline-block;margin-top:10px;padding:7px 11px;border:1px solid #2a2c2b;border-radius:999px;color:#a9aca9;font-size:11px;font-style:italic;letter-spacing:.04em;">${escapeHtml(trader.tag)}</span>`
    : '';

  return `<!doctype html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:#070807;color:#f2f2ef;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#070807;margin:0;padding:0;">
<tr><td align="center" style="padding:34px 14px 44px;">
<table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;border-collapse:separate;">
<tr><td style="padding:0 2px 24px;font-size:13px;font-weight:700;letter-spacing:.24em;color:#d7d9d6;">GP.</td></tr>
<tr><td style="padding:0 2px 8px;font-size:12px;letter-spacing:.18em;color:#7c817d;">GIGAPROP / TRADER LEAGUE</td></tr>
<tr><td style="padding:0 2px 8px;font-size:46px;line-height:.98;font-weight:700;letter-spacing:-.05em;color:#f3f4f1;">YOU’RE LIVE.</td></tr>
<tr><td style="padding:0 2px 30px;font-size:16px;line-height:1.65;color:#9fa39f;">Your profile is now live on <strong style="color:#eef0ed;font-weight:600;">gigaprop.xyz/#leaderboard</strong>. Names worth knowing.</td></tr>
<tr><td style="border:1px solid #222522;border-radius:20px;overflow:hidden;background:#0b0d0c;box-shadow:0 24px 80px ${accent.glow};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
<tr><td colspan="2" style="height:3px;background:${accent.line};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr>
<td style="padding:24px 28px 12px;color:#858a86;font-size:10px;letter-spacing:.2em;">${accent.label}</td>
<td align="right" style="padding:24px 28px 12px;color:#858a86;font-size:10px;letter-spacing:.18em;">SEASON ${String(seasonNo).padStart(2, '0')}</td>
</tr>
<tr>
<td width="62%" valign="bottom" style="padding:12px 10px 30px 28px;">
<div style="font-size:12px;color:#858a86;letter-spacing:.15em;margin-bottom:8px;">VEST / SEASON RANK</div>
<div style="font-size:104px;line-height:.82;font-weight:700;letter-spacing:-.08em;color:${accent.line};">#${String(row.rank).padStart(2, '0')}</div>
<div style="margin-top:25px;font-size:22px;line-height:1.1;font-weight:700;color:#f2f3f0;">${escapeHtml(displayName)}</div>
<div style="margin-top:5px;font-size:13px;color:#8f948f;">@${escapeHtml(username)}</div>
${tag}
</td>
<td width="38%" align="right" valign="bottom" style="padding:12px 28px 30px 8px;">
<img src="${escapeHtml(avatar)}" width="132" height="132" alt="${escapeHtml(displayName)}" style="display:block;width:132px;height:132px;object-fit:cover;border-radius:18px;border:1px solid #292c2a;background:#121412;">
</td>
</tr>
<tr><td colspan="2" style="padding:0 28px;"><div style="height:1px;background:#202321;font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr>
<td style="padding:20px 28px 24px;">
<div style="font-size:10px;letter-spacing:.15em;color:#727773;margin-bottom:6px;">ELIGIBLE USDC RECEIVED</div>
<div style="font-size:27px;line-height:1.1;font-weight:700;letter-spacing:-.03em;color:#f1f2ef;">${usd(row.total)}</div>
</td>
<td align="right" style="padding:20px 28px 24px;">
<div style="font-size:10px;letter-spacing:.15em;color:#727773;margin-bottom:6px;">PAYOUTS</div>
<div style="font-size:27px;line-height:1.1;font-weight:700;color:#f1f2ef;">${row.count.toLocaleString()}</div>
</td>
</tr>
</table>
</td></tr>
<tr><td align="center" style="padding:30px 0 16px;">
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:999px;background:#eff1ed;">
<a href="${escapeHtml(profileUrl)}" style="display:inline-block;padding:15px 25px;color:#080908;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.13em;">VIEW YOUR RANK →</a>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:3px 15px 0;font-size:11px;line-height:1.7;color:#5e635f;">Public payouts. Independently ranked.<br>Rankings move as new eligible payouts are recorded.</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function emailText({ trader, row, season }) {
  const username = trader.twitter.replace(/^@/, '');
  const profileUrl = `${SITE}#leaderboard?season=${encodeURIComponent(season)}&firm=vest&wallet=${encodeURIComponent(trader.wallet)}`;
  return `YOU'RE LIVE.\n\n@${username} is now live on the GIGAPROP Trader League.\nVest season rank: #${row.rank}\nEligible USDC received: ${usd(row.total)}\nPayouts: ${row.count}\n\nView your rank: ${profileUrl}\n\nNames worth knowing.\nGIGAPROP`;
}

async function main() {
  await loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));

  if (!args.to || !args.wallet) {
    console.error('Usage: npm run leaderboard:email -- --to trader@example.com --wallet 0x... [--preview]');
    process.exit(1);
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(args.wallet)) throw new Error('Invalid 0x wallet address.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(args.to)) throw new Error('Invalid recipient email address.');

  const trader = await traderForWallet(args.wallet);
  const { key, number, ranked } = await currentVestSeason();
  const row = ranked.find(item => item.address === trader.wallet);
  if (!row) throw new Error('Approved trader is not currently ranked on the Vest season board.');

  const html = emailHtml({ trader, row, season: key, seasonNumber: number });
  const text = emailText({ trader, row, season: key });

  if (args.preview) {
    const outDir = path.join(projectRoot, 'output');
    await fs.mkdir(outDir, { recursive: true });
    const file = path.join(outDir, `leaderboard-live-${trader.twitter.replace(/^@/, '')}.html`);
    await fs.writeFile(file, html);
    console.log(`Preview written to ${path.relative(projectRoot, file)}`);
    console.log(`Rank resolved: #${row.rank} · ${usd(row.total)} · ${row.count} payouts`);
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set. Add it to your local .env/shell; never commit it.');

  const from = process.env.GIGAPROP_FROM || 'GIGAPROP <gp@gigaprop.xyz>';
  const subject = args.subject || `You’re live — #${row.rank} on GIGAPROP`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ from, to: [args.to], subject, html, text }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Resend rejected the email (${response.status}): ${body.message || JSON.stringify(body)}`);
  console.log(`Sent to ${args.to} · #${row.rank} · email ${body.id || 'accepted'}`);
}

main().catch(error => {
  console.error(`Leaderboard email failed: ${error.message}`);
  process.exit(1);
});
