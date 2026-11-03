(function (root) {
  'use strict';
  const THEMES = ['Néon', 'Disco', 'Gothique', 'Paillettes', 'Tout en blanc'];
  const LEVELS = [
    { name:'Première nuit', theme:'Néon', total:12, target:8, duration:90, interval:5.5, patience:47, bad:.16, feature:'Bienvenue à la porte', description:'Scannez chaque billet, comparez la tenue au thème Néon, puis tamponnez. Déposez les manteaux au vestiaire. Refusez les fraudeurs.' },
    { name:'Un dernier verre', theme:'Disco', total:16, target:11, duration:100, interval:4.8, patience:44, bad:.17, exits:true, feature:'Les premières sorties', description:'Les sortants partagent le vestiaire avec les entrants. Sélectionnez leur numéro de manteau pour les laisser repartir.' },
    { name:'La file s’agite', theme:'Gothique', total:19, target:12, duration:105, interval:4.2, patience:42, bad:.2, exits:true, skippers:true, feature:'Les resquilleurs débarquent', description:'Les cartes en pointillés rouges sont des resquilleurs. Refusez-les avant qu’ils forcent le passage. Une file mécontente en attire davantage.' },
    { name:'Très important', theme:'Paillettes', total:22, target:14, duration:115, interval:4, patience:40, bad:.18, exits:true, skippers:true, vip:true, feature:'Ouverture de la file VIP', description:'Les VIP attendent deux fois moins longtemps. Après 12 secondes, leur impatience pèse sur toute la file. Faites-les passer en priorité.' },
    { name:'Vestiaire complet', theme:'Tout en blanc', total:25, target:16, duration:120, interval:3.8, patience:38, bad:.2, exits:true, skippers:true, vip:true, coats:true, feature:'La ruée sur les manteaux', description:'Presque tous les entrants ont un manteau et les sorties se multiplient. Gardez le vestiaire occupé, tout en contrôlant les deux files d’entrée.' },
    { name:'Erreur de lecture', theme:'Néon', total:27, target:17, duration:130, interval:3.7, patience:38, bad:.2, exits:true, skippers:true, vip:true, coats:true, jams:true, feature:'Un scanner capricieux', description:'Toutes les 7 lectures, le scanner se bloque. Cliquez sur le poste pour le relancer pendant que le tampon et le vestiaire continuent à tourner.' },
    { name:'Ticket perdu', theme:'Disco', total:29, target:18, duration:135, interval:3.5, patience:36, bad:.2, exits:true, skippers:true, vip:true, coats:true, jams:true, lost:true, feature:'« J’ai perdu mon ticket… »', description:'Certains sortants ont perdu leur reçu. Retrouvez leur manteau grâce à la couleur indiquée dans leur description. Un mauvais manteau fait chuter l’humeur.' },
    { name:'Changement de décor', theme:'Gothique', total:32, target:20, duration:145, interval:3.5, patience:35, bad:.22, exits:true, skippers:true, vip:true, coats:true, jams:true, lost:true, rotate:true, feature:'Deux thèmes dans la même nuit', description:'À mi-parcours, le thème change pour les nouveaux arrivants. La fiche de chaque visiteur conserve le thème qui s’appliquait à son arrivée.' },
    { name:'La liste de la liste', theme:'Paillettes', total:35, target:22, duration:150, interval:3.2, patience:34, bad:.22, exits:true, skippers:true, vip:true, coats:true, jams:true, lost:true, rotate:true, vipRate:.42, feature:'Les VIP prennent leurs aises', description:'La liste VIP s’allonge, les habitués se pressent et le rythme accélère. Alternez les postes : trois opérations peuvent avancer en parallèle.' },
    { name:'Le grand Boudoir', theme:'Tout en blanc', total:40, target:25, duration:165, interval:3, patience:31, bad:.23, exits:true, skippers:true, vip:true, coats:true, jams:true, lost:true, rotate:true, vipRate:.4, feature:'La nuit de tous les défis', description:'Tous les problèmes se rencontrent à la porte. Maintenez l’humeur au-dessus de zéro et satisfaites 25 visiteurs pour devenir la légende du Boudoir.' }
  ];
  const NAMES=['Camille','Sacha','Lou','Alex','Charlie','Noa','Jules','Léa','Sam','Inès','Malo','Zoé','Nino','Romy','Max','Lola','Eden','Nour','Alix','Léon','Mia','Robin','Iris','Eli'];
  const COLORS=['Lilas','Corail','Menthe','Sable','Bleu'];
  const PALETTE=['#bba3e7','#f59d94','#a4cfb1','#ddc18f','#91b4db'];
  class Game {
    constructor(level=0, random=Math.random) {
      this.level=level; this.config=LEVELS[level]; this.random=random; this.guests=[]; this.jobs={scan:null,stamp:null,coat:null}; this.elapsed=0; this.nextSpawn=1; this.spawned=0; this.served=0; this.score=0; this.mood=100; this.combo=0; this.mistakes=0; this.waitTotal=0; this.selected=null; this.events=[]; this.finished=false; this.paused=false; this.jammed=false; this.scans=0; this.theme=this.config.theme; this.rotated=false; this.serial=0; this.generatedFrauds=0; this.skipCooldown=8; this.addEvent('La porte est ouverte. Bonne nuit !','good');
    }
    addEvent(message,type='normal'){this.events.unshift({message,type,time:this.elapsed});this.events=this.events.slice(0,5);}
    get(id){return this.guests.find(g=>g.id===id);}
    spawn(){
      const c=this.config,r=this.random; this.spawned++; const id=++this.serial;
      const exit=!!c.exits && this.spawned>2 && r()<(c.coats?.34:.25);
      const vip=!exit && !!c.vip && r()<(c.vipRate||.26);
      const fraudBudget=this.generatedFrauds<c.total-c.target;
      const skipping=fraudBudget && !exit && !!c.skippers && r()<(this.mood<45?.26:.1);
      const bad=fraudBudget && !exit && !skipping && r()<c.bad;
      const badTheme=bad && r()<.5;
      if(skipping||bad)this.generatedFrauds++;
      const color=Math.floor(r()*COLORS.length);
      const guest={id,name:NAMES[Math.floor(r()*NAMES.length)],type:exit?'exit':vip?'vip':'regular',skipping,valid:!bad||badTheme,theme:this.theme,attire:badTheme?THEMES[(THEMES.indexOf(this.theme)+1)%THEMES.length]:this.theme,coat:exit||r()<(c.coats?.92:.6),color:COLORS[color],palette:PALETTE[color],receipt:100+id, lost:exit&&!!c.lost&&r()<.5,scanned:false,stamped:false,stored:false,arrived:this.elapsed,patience:c.patience*(vip?.6:1)*(skipping?.55:1),busy:null,complained:false};
      this.guests.push(guest); if(skipping)this.addEvent(`${guest.name} essaie de griller la file !`,'bad');
      return guest;
    }
    action(action,id,coatChoice){
      if(this.finished||this.paused)return 'La partie est en pause.';
      if(action==='scan'&&this.jammed){if(this.jobs.scan)return 'Le scanner est occupé.';this.jobs.scan={id:null,action:'repair',remaining:2.3,total:2.3};return null;}
      const g=this.get(id);if(!g)return 'Sélectionnez un visiteur dans une file.';
      if(g.busy)return `${g.name} est déjà à un poste.`;
      if(action==='reject'){
        if(g.type==='exit')return 'Ce visiteur veut simplement récupérer son manteau.';
        const justified=g.skipping||g.attire!==g.theme||(g.scanned&&!g.valid);
        if(justified){this.score+=80;this.mood=Math.min(100,this.mood+2);this.addEvent(`${g.name} : refus justifié. +80`,'good');}
        else{this.penalty(`Refus injustifié pour ${g.name}.`,9);}
        this.remove(g);return null;
      }
      if(!this.jobs.hasOwnProperty(action))return 'Poste inconnu.';
      if(this.jobs[action])return 'Ce poste est occupé. Essayez un autre poste.';
      if(action==='scan'&&(g.type==='exit'||g.scanned))return 'Ce visiteur n’a pas besoin de scan.';
      if(action==='stamp'&&(g.type==='exit'||!g.scanned||g.stamped))return 'Scannez le billet avant de tamponner.';
      if(action==='coat'){
        if(g.type!=='exit'&&(!g.stamped||!g.coat||g.stored))return 'Le vestiaire attend un visiteur tamponné avec un manteau.';
        if(g.type==='exit'&&coatChoice!==g.receipt)return 'choose-coat';
      }
      const duration={scan:1.6,stamp:1.15,coat:g.type==='exit'?2.1:2.5}[action];
      g.busy=action;this.jobs[action]={id:g.id,action,remaining:duration,total:duration};return null;
    }
    wrongCoat(){this.penalty('Mauvais manteau ! Vérifiez le reçu ou la couleur.',6);}
    penalty(message,amount){this.mood=Math.max(0,this.mood-amount);this.score=Math.max(0,this.score-40);this.combo=0;this.mistakes++;this.addEvent(message,'bad');}
    remove(g){this.guests=this.guests.filter(x=>x.id!==g.id);if(this.selected===g.id)this.selected=null;}
    complete(job){
      if(job.action==='repair'){this.jammed=false;this.addEvent('Scanner relancé. On reprend !','good');return;}
      const g=this.get(job.id);if(!g)return;g.busy=null;
      if(job.action==='scan'){g.scanned=true;this.scans++;this.addEvent(`${g.name} : billet ${g.valid?'valide':'INVALIDE'}.`,g.valid?'normal':'bad');if(this.config.jams&&this.scans%7===0){this.jammed=true;this.addEvent('Scanner bloqué ! Cliquez dessus pour le relancer.','bad');}}
      if(job.action==='stamp'){g.stamped=true;if(!g.coat)this.admit(g);}
      if(job.action==='coat'){g.stored=true;this.admit(g);}
    }
    admit(g){
      if(g.type!=='exit'&&(!g.valid||g.attire!==g.theme||g.skipping)){this.penalty(`${g.name} est entré sans respecter les règles !`,12);this.remove(g);return;}
      const wait=this.elapsed-g.arrived;this.waitTotal+=wait;this.served++;this.combo++;const points=Math.round(100+Math.max(0,45-wait)*2+Math.min(this.combo,10)*10+(g.type==='vip'?50:0));this.score+=points;this.mood=Math.min(100,this.mood+2.5);this.addEvent(`${g.name} ${g.type==='exit'?'a récupéré son manteau':'rejoint la piste'}. +${points}`,'good');this.remove(g);
    }
    step(dt){
      if(this.paused||this.finished)return;dt=Math.min(dt,.25);this.elapsed+=dt;
      if(this.config.rotate&&!this.rotated&&this.elapsed>=this.config.duration/2){this.rotated=true;this.theme=THEMES[(THEMES.indexOf(this.theme)+1)%THEMES.length];this.addEvent(`Nouveau thème : ${this.theme.toUpperCase()} ! Les personnes déjà en file gardent leur ancien thème.`,'bad');}
      if(this.spawned<this.config.total&&this.elapsed>=this.nextSpawn&&this.guests.length<13){this.spawn();this.nextSpawn=this.elapsed+this.config.interval*(.84+this.random()*.28);}
      for(const action of Object.keys(this.jobs)){const job=this.jobs[action];if(job){job.remaining-=dt;if(job.remaining<=0){this.jobs[action]=null;this.complete(job);}}}
      for(const g of [...this.guests]){
        // Service at a station suspends the visitor's personal impatience.
        if(!g.busy)g.patience-=dt*(this.mood<35?1.22:1);
        if(g.patience<12&&!g.complained){g.complained=true;this.addEvent(`${g.name} : « Ça fait une éternité ! »`,'bad');}
        if(g.patience<12)this.mood=Math.max(0,this.mood-dt*.22);
        if(g.type==='vip'&&this.elapsed-g.arrived>12&&!g.busy)this.mood=Math.max(0,this.mood-dt*.12);
        if(g.patience<=0&&!g.busy){this.penalty(g.skipping?`${g.name} force le passage !`:`${g.name} quitte la file en colère.`,g.skipping?10:7);this.remove(g);}
      }
      this.skipCooldown-=dt;
      if(this.config.skippers&&this.mood<45&&this.skipCooldown<=0){this.skipCooldown=10;const candidates=this.guests.filter(g=>g.type==='regular'&&!g.busy&&!g.scanned&&!g.skipping);if(candidates.length){candidates[0].skipping=true;candidates[0].patience=Math.min(candidates[0].patience,17);this.addEvent(`${candidates[0].name} profite du chaos pour doubler !`,'bad');}}
      if(this.mood<=0||this.elapsed>=this.config.duration||(this.spawned===this.config.total&&this.guests.length===0))this.finished=true;
    }
    get won(){return this.finished&&this.mood>0&&this.served>=this.config.target;}
  }
  const api={Game,LEVELS,THEMES,COLORS,PALETTE};if(typeof module!=='undefined')module.exports=api;else root.Boudoir=api;
})(typeof window!=='undefined'?window:globalThis);
