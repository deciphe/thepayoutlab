import {weeklyBoard,weekKey,validSnapshot} from './weekly-leaderboard.js';
import {FLOW_SOURCES} from './flow-config.js';
export const SEASON=30*86400000;
export const SEASON_ONE=Date.parse('2026-09-15T00:00:00Z');
export const seasonStart=(time=Date.now())=>SEASON_ONE+Math.max(0,Math.floor((time-SEASON_ONE)/SEASON))*SEASON;
export const seasonKey=weekKey;
export const seasonNumber=start=>Math.floor((start-SEASON_ONE)/SEASON)+1;
export const validSeasonKey=key=>/^\d{4}-\d{2}-\d{2}$/.test(key)&&Date.parse(key+'T00:00:00Z')>=SEASON_ONE&&(Date.parse(key+'T00:00:00Z')-SEASON_ONE)%SEASON===0;
export function seasonBoard(snapshots,start,now=Date.now(),prior=null){
 if(start<SEASON_ONE||(start-SEASON_ONE)%SEASON!==0)return {available:false,missing:['Valid season boundary']};
 if(FLOW_SOURCES.some(s=>!validSnapshot(snapshots[s.slug],s)))return {available:false,missing:['Complete source snapshots']};
 const coverageStart=Math.max(start,...FLOW_SOURCES.map(s=>Date.parse(snapshots[s.slug].periodStart)));
 const end=start+SEASON;
 if(prior?.closed&&prior.start===start&&prior.duration===SEASON)return prior;
 if(coverageStart>start&&(!prior?.available||prior.start!==start||prior.duration!==SEASON||prior.end<Math.min(coverageStart,end)))return {available:false,missing:['Complete season history; archive coverage has a gap']};
 if(coverageStart>=end){if(prior?.end>=end)return {...prior,closed:true};return {available:false,missing:['Season closing snapshot']};}
 const fresh=weeklyBoard(snapshots,coverageStart,now,end-coverageStart);
 if(!fresh.available)return fresh;
 const transfers=[...(coverageStart>start?prior.transfers.filter(t=>Date.parse(t.timestamp)<coverageStart):[]),...fresh.transfers];
 const unique=[...new Map(transfers.map(t=>[t.id,t])).values()];
 return {...fresh,version:2,start,end:fresh.end,week:weekKey(start),season:seasonNumber(start),duration:SEASON,closed:fresh.end>=end,transfers:unique};
}
