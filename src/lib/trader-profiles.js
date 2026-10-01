import traders from '../data/traders.json';
// One editorial identity per payout wallet; never grants a wallet-signature badge.
export const FEATURED_TRADERS=Object.fromEntries(traders.map(t=>{
 const username=t.twitter.trim().replace(/^@/,'');
 return [t.wallet.toLowerCase(),{username,displayName:t.name||username,avatar:'/traders/'+t.image,social:'https://x.com/'+username,tag:t.tag||'',editorial:true}];
}));
export const featuredTrader=address=>FEATURED_TRADERS[address?.toLowerCase()]||null;
