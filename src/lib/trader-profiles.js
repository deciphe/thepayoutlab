// Editorial mappings supplied by GIGAPROP, not wallet-signature claims.
export const FEATURED_TRADERS={
 '0x097fd586fe2938653dfd8f404387436bedede596':{username:'kaiweeen',displayName:'kaiwen',avatar:'/traders/kaiweeen.jpg',social:'https://x.com/kaiweeen',editorial:true},
 '0x823e8e82b64370a8345c34e42599be2f252ebbcd':{username:'okalanqt',displayName:'Okala',avatar:'/traders/okalanqt.jpg',social:'https://x.com/OkalaNQT',tag:'#8020GANG',editorial:true},
};
export const featuredTrader=address=>FEATURED_TRADERS[address?.toLowerCase()]||null;
