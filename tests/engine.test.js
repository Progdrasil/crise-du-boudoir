const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Game,LEVELS}=require('../engine');
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function advance(g,seconds){for(let t=0;t<seconds;t+=.05)g.step(.05);}
function guest(g,changes={}){const p=g.spawn();Object.assign(p,{skipping:false,valid:true,attire:g.theme,theme:g.theme,coat:true,type:'regular',patience:100},changes);return p;}
test('entry requires scan, stamp and coat; stations run concurrently',()=>{const g=new Game(0,rng(2));g.nextSpawn=999;const a=guest(g),b=guest(g);assert.match(g.action('stamp',a.id),/Scannez/);assert.equal(g.action('scan',a.id),null);advance(g,1.7);assert.equal(g.action('stamp',a.id),null);assert.equal(g.action('scan',b.id),null);advance(g,1.7);assert(a.stamped&&b.scanned);assert.equal(g.served,0);g.action('coat',a.id);advance(g,2.6);assert.equal(g.served,1);assert(!g.get(a.id));});
test('false tickets and wrong themes penalize entry; justified refusals reward',()=>{for(const changes of [{valid:false},{attire:'Disco'},{skipping:true}]){const g=new Game(0,rng(1));g.nextSpawn=999;const a=guest(g,{...changes,coat:false,scanned:true});g.action('stamp',a.id);advance(g,1.3);assert.equal(g.served,0);assert(g.mood<100);const b=guest(g,{...changes,scanned:true});g.action('reject',b.id);assert.equal(g.guests.length,0);assert(g.score>=80);}});
test('coat retrieval needs the correct receipt and wrong choice costs mood',()=>{const g=new Game(6,rng(3));g.nextSpawn=999;const a=guest(g,{type:'exit',lost:true});assert.equal(g.action('coat',a.id),'choose-coat');const before=g.mood;g.wrongCoat();assert(g.mood<before);assert.equal(g.action('coat',a.id,a.receipt),null);advance(g,2.2);assert.equal(g.served,1);});
test('pause freezes all clocks; low mood induces complaints and skippers',()=>{const g=new Game(2,rng(2));g.nextSpawn=999;const a=guest(g,{patience:20});g.paused=true;advance(g,5);assert.equal(g.elapsed,0);assert.equal(a.patience,20);g.paused=false;g.mood=40;g.skipCooldown=0;g.step(.1);assert(a.skipping);advance(g,19);assert(g.mood<40);assert(g.events.some(e=>e.type==='bad'));});
test('scanner jams and repairs; theme changes only for new visitors',()=>{const g=new Game(7,rng(4));g.nextSpawn=999;const a=guest(g);g.scans=6;g.action('scan',a.id);advance(g,1.7);assert(g.jammed);g.action('scan');advance(g,2.4);assert(!g.jammed);const old=a.theme;g.elapsed=g.config.duration/2;g.step(.1);assert.notEqual(g.theme,old);assert.equal(a.theme,old);assert.equal(g.spawn().theme,g.theme);});
test('every level is winnable by a careful player across 100 seeded nights',()=>{
  for(let level=0;level<LEVELS.length;level++)for(let seed=1;seed<=100;seed++){
    const g=new Game(level,rng(seed));
    for(let t=0;t<2000&&!g.finished;t++){
      if(g.jammed&&!g.jobs.scan)g.action('scan');
      const queue=[...g.guests].sort((a,b)=>a.patience-b.patience);
      for(const p of queue){if(p.busy)continue;if(p.skipping||p.attire!==p.theme||(p.scanned&&!p.valid)){g.action('reject',p.id);continue;}if(p.type==='exit'){if(!g.jobs.coat)g.action('coat',p.id,p.receipt);}else if(!p.scanned){if(!g.jobs.scan&&!g.jammed)g.action('scan',p.id);}else if(!p.stamped){if(!g.jobs.stamp)g.action('stamp',p.id);}else if(p.coat&&!g.jobs.coat)g.action('coat',p.id);}
      g.step(.1);
    }
    assert(g.won,`level ${level+1}, seed ${seed}: served ${g.served}/${g.config.target}, mood ${g.mood}, arrivals ${g.spawned}`);
  }
});
