# Leaderboard “You’re live” email

This repo includes a private local sender for the GIGAPROP leaderboard confirmation email.

It does **not** store claimant email addresses in the public repository. You pass the email only when you send.

## One-time setup

1. Create a Resend account.
2. Add and verify `gigaprop.xyz` as a sending domain. Keep the existing IONOS mail records intact; only add the DNS records Resend specifically asks for.
3. Create a Resend API key.
4. Copy `.env.example` to `.env` and paste the key there. `.env` is already gitignored.

```
RESEND_API_KEY=re_...
GIGAPROP_FROM="GIGAPROP <gp@gigaprop.xyz>"
```

## Preview before sending

The trader must already be approved in `src/data/traders.json`.

```bash
npm run leaderboard:email -- --to trader@example.com --wallet 0xTHEIRWALLET --preview
```

That resolves the trader’s current **Vest season rank from the same live payout snapshots used by the site** and writes a local HTML preview into `output/`.

## Send

```bash
npm run leaderboard:email -- --to trader@example.com --wallet 0xTHEIRWALLET
```

The email contains:
- “YOU’RE LIVE.”
- the trader’s current Vest season rank
- their profile image, display name, X handle and optional tag
- eligible USDC received and payout count
- a direct button to their leaderboard profile

No rank-card attachment is sent. The rank card is rendered directly inside the HTML email.

## Workflow after approving a claim

1. Review the claimant email from the existing leaderboard form.
2. Add the approved trader/profile image to the repo as usual.
3. Let the site deploy.
4. Run the sender with the claimant’s contact email and payout wallet.

The contact email exists only in your inbox/terminal command and is never added to `traders.json`.
