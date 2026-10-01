import assert from 'node:assert/strict';
import {SEASON,SEASON_ONE,seasonStart,seasonBoard,validSeasonKey} from '../src/lib/season-leaderboard.js';
import {rankWeekly} from '../src/lib/weekly-leaderboard.js';
import {FLOW_SOURCES} from '../src/lib/flow-config.js';
assert.equal(new Date(SEASON_ONE+SEASON).toISOString(),'2026-10-15T00:00:00.000Z');assert.equal(seasonStart(SEASON_ONE+SEASON-1),SEASON_ONE);assert.equal(seasonStart(SEASON_ONE+SEASON),SEASON_ONE+SEASON);assert(validSeasonKey('2026-09-15'));assert(!validSeasonKey('2026-09-28'));
const start=SEASON_ONE,end=start+SEASON,recipient='0x1111111111111111111111111111111111111111';
const snapshots=Object.fromEntries(FLOW_SOURCES.map(s=>[s.slug,{complete:true,wallet:s.wallet,token:s.token,chain:s.chain,updatedAt:new Date(end).toISOString(),windowEnd:new Date(end).toISOString(),periodStart:new Date(start).toISOString(),balance:0,transfers:[]}]));
const source=FLOW_SOURCES[0];let i=0;
function add(time){snapshots[source.slug].transfers.push({id:'tx'+i,hash:'0x'+String(++i).padStart(64,'0'),logIndex:1,block:1,timestamp:new Date(time).toISOString(),from:source.wallet,to:recipient,direction:'out',raw:'1000000',amount:1});}
add(start-1);add(start);add(start+SEASON/2);add(end-1);add(end);
let board=seasonBoard(snapshots,start,end);assert(board.closed);assert.equal(rankWeekly(board)[0].total,3);
let prior=seasonBoard(snapshots,start,start+SEASON/2);assert.equal(rankWeekly(prior)[0].total,2);
for(const d of Object.values(snapshots)){d.periodStart=new Date(start+SEASON/2).toISOString();d.transfers=d.transfers.filter(t=>Date.parse(t.timestamp)>=start+SEASON/2);}
assert.equal(seasonBoard(snapshots,start,end).available,false);
board=seasonBoard(snapshots,start,end,prior);assert(board.closed);assert.equal(rankWeekly(board)[0].total,3);assert.equal(board.transfers.length,3);
assert.equal(seasonBoard(snapshots,start,end,{...prior,end:start+1}).available,false);
console.log('PASS: fixed 30-day seasons, exclusive Oct 15 boundary, archival overlap/deduplication, retained early payouts and missing-history rejection');
