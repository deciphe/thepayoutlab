// Editorial wallet groups supplied by GIGAPROP. Grouping is not signature verification.
// Keep the first address stable: it is the profile/link key. Transfers retain their actual recipient.
export const TRADER_WALLET_GROUPS=[
 ['0x2f2c91a08aa283359b41850adb9ea3d65b36f3d3','0x35ef3c419ec40173f42a64ac65c26d9dbd405bea']
];
const owners=new Map();
for(const group of TRADER_WALLET_GROUPS){
 for(const address of group){
  if(!/^0x[a-f0-9]{40}$/.test(address)||owners.has(address))throw Error('Invalid or overlapping trader wallet group');
  owners.set(address,group[0]);
 }
}
export const canonicalTraderWallet=address=>owners.get(address?.toLowerCase())||address?.toLowerCase();
export const traderWallets=address=>{
 const primary=canonicalTraderWallet(address);
 return TRADER_WALLET_GROUPS.find(group=>group[0]===primary)||[primary];
};
