// node tools/preview_lands.js [L1,L2,...] -> /tmp/.../lands_preview.json ; plus checks
const fs=require('fs'),vm=require('vm');
const ctx={console,Math,window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('src/world.js','utf8')+'\n'+fs.readFileSync('src/lands.js','utf8')+'\nthis.LANDS=LANDS;this.LandMaps=LandMaps;',ctx);
const G={ GROUND: 0, GROUND2: 1, PATH: 2, WALL: 3, WATER: 4, DECO: 5, GATE: 6, GATE_OPEN: 7, FIRE: 8, EDGE: 9 }, SOLID={3:1,4:1,6:1,9:1};
const want=(process.argv[2]||'').split(',').filter(Boolean);
const out={};
for(const L of ctx.LANDS){ if(want.length&&want.indexOf(L.id)<0) continue; if(!ctx.LandMaps.has(L.id)) continue;
  const m=ctx.LandMaps.build(L,{G,SOLID,theme:{}}); const W=m.w,H=m.h,t=m.tiles;
  // checks: reach with gate open and closed
  function flood(gateOpen){const d=new Int32Array(W*H).fill(-1),q=[m.spawn.x,m.spawn.y];d[m.spawn.y*W+m.spawn.x]=0;let h=0;while(h<q.length){const x=q[h++],y=q[h++];for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const v=t[ny*W+nx];if(SOLID[v]&&!(gateOpen&&v===6))continue;if(d[ny*W+nx]>=0)continue;d[ny*W+nx]=d[y*W+x]+1;q.push(nx,ny);}}return d;}
  const open=flood(true), shut=flood(false), I=(p)=>p.y*W+p.x;
  const pois=[...m.lairs,...(m.key?[m.key]:[]),...m.chests,...m.pages];
  const bad=pois.filter(p=>shut[I(p)]<0).map(p=>p.kind+'@'+p.x+','+p.y);
  const bossReachShut=shut[I(m.boss)]>=0, bossReachOpen=open[I(m.boss)]>=0;
  let floor=0; for(let i=0;i<W*H;i++) if(!SOLID[t[i]]) floor++;
  const fireNear=m.lairs.filter(p=>Math.hypot(p.x-m.spawn.x,p.y-m.spawn.y)<9).length;
  const tiers={BEG:[],PRG:[],MAS:[]}; m.lairs.forEach(p=>tiers[p.ref.level].push(shut[I(p)]));
  const avg=a=>a.length?Math.round(a.reduce((s,v)=>s+v,0)/a.length):0;
  console.log(L.id, m.name, W+'x'+H, 'floor%',Math.round(100*floor/(W*H)), 'lairs',m.lairs.length,'chests',m.chests.length,'pages',m.pages.length,
    '| unreachable',bad.length?bad.join(' '):0,'| boss sealed',!bossReachShut,'boss reachable via gate',bossReachOpen,'| near fire',fireNear,
    '| walk to gate',open[I(m.gate)],'key',m.key?shut[I(m.key)]:'none','| avg dist BEG/PRG/MAS',avg(tiers.BEG),avg(tiers.PRG),avg(tiers.MAS));
  out[L.id]={w:W,h:H,t:Array.from(t),spawn:m.spawn,gate:m.gate,boss:{x:m.boss.x,y:m.boss.y},key:m.key?{x:m.key.x,y:m.key.y}:null,lairs:m.lairs.map(p=>({x:p.x,y:p.y,lv:p.ref.level})),chests:m.chests.map(p=>({x:p.x,y:p.y})),pages:m.pages.map(p=>({x:p.x,y:p.y})),name:m.name};
}
fs.writeFileSync(process.env.OUT||'/tmp/lands_preview.json',JSON.stringify(out));
