'use strict';
/* =====================================================================
   EL PATRÓN KART · v4  — modos, ajustes, voces, logros, eventos,
   fantasma, pistas propias, personalización y 2 jugadores.
   Se carga después del juego principal (index.html).
   ===================================================================== */
(function(){
const PTS=[10,7,5,3,1];
const THEMES=()=>TRACKS.filter(t=>!t.custom);
/* ---------------------------- ajustes y calidad ---------------------------- */
const saveSet=()=>lsSet('kart_set',SET);
const GFX={ultra:{pr:3,f:2,bil:true,glow:true,shadow:true,dust:true},alta:{pr:3,f:1.25,bil:true,glow:true,shadow:true,dust:true},media:{pr:2,f:1,bil:true,glow:true,shadow:true,dust:true},baja:{pr:1.5,f:1,bil:false,glow:false,shadow:false,dust:false}};
const GFX_ORDER=['ultra','alta','media','baja'];
let gfxLevel='alta',emaDt=0.016,slowN=0;
function setGfx(level){const c=GFX[level]||GFX.alta;gfxLevel=level;PR=c.pr;FSS=c.f;Q.bil=c.bil;Q.glow=c.glow;Q.shadow=c.shadow;Q.dust=c.dust;cv.width=Math.round(W0*PR);cv.height=Math.round(H*PR);skyCv=null}
function applyGfx(){setGfx(GFX[SET.gfx]?SET.gfx:'alta')}
function setMusVol(){MUSVOL=MUSLV[SET.music]!=null?MUSLV[SET.music]:.55;if(AC)for(const g of MUSG){try{g.gain.setTargetAtTime(MUSVOL,AC.currentTime,.05)}catch(e){}}}
function duck(dur){if(!AC)return;const t0=AC.currentTime;for(const g of MUSG){try{g.gain.cancelScheduledValues(t0);g.gain.setTargetAtTime(MUSVOL*.4,t0,.04);g.gain.setTargetAtTime(MUSVOL,t0+dur+.2,.3)}catch(e){}}}
function autoQuality(dt){if(SET.gfx!=='auto'||state!=='race'||raceT<2.5)return;emaDt=emaDt*0.97+dt*0.03;
  if(emaDt>0.027){slowN++;if(slowN>90){const i=GFX_ORDER.indexOf(gfxLevel);if(i<GFX_ORDER.length-1){setGfx(GFX_ORDER[i+1]);say('⚙️ Bajé un poco los gráficos para que corra suave',2600)}slowN=0;emaDt=0.016}}else slowN=Math.max(0,slowN-2)}
const SEGS=[
 {k:'tilt',t:'🎯 Sensibilidad al inclinar',o:[['Suave',34],['Normal',26],['Sensible',20],['Muy sensible',14]]},
 {k:'assist',t:'🧭 Ayuda de dirección',o:[['Sin ayuda',0],['Poca',1],['Mucha',2]]},
 {k:'speed',t:'🚀 Velocidad del juego',o:[['Relajado',0.85],['Normal',1],['Rápido',1.12]]},
 {k:'gfx',t:'🖼️ Gráficos',o:[['Ultra','ultra'],['Alta','alta'],['Media','media'],['Baja','baja']]},
 {k:'music',t:'🎵 Volumen de la música',o:[['Sin música','off'],['Bajo','bajo'],['Medio','medio'],['Alto','alto']]},
 {k:'vvol',t:'🗣️ Volumen de las voces',o:[['Bajo','bajo'],['Medio','medio'],['Alto','alto'],['Muy alto','max']]},
 {k:'voz',t:'🗣️ Voces y comentarista',o:[['Sí',true],['No',false]]}
];
function buildSettings(){const b=$('setBody');b.innerHTML='';
  for(const row of SEGS){const d=document.createElement('div');d.className='setrow';d.innerHTML='<b>'+row.t+'</b>';const sg=document.createElement('div');sg.className='seg';
    for(const[lab,val]of row.o){const bt=document.createElement('button');bt.className='sec'+(SET[row.k]===val?' on':'');bt.textContent=lab;bt.onclick=()=>{SET[row.k]=val;saveSet();if(row.k==='speed')SPEEDK=val;if(row.k==='gfx')applyGfx();if(row.k==='music')setMusVol();if(row.k==='vvol'||row.k==='voz')speak('first',true,true);else beep(660,.06);buildSettings()};sg.appendChild(bt)}
    d.appendChild(sg);b.appendChild(d)}
  const u=document.createElement('div');u.className='setrow';u.innerHTML='<b>🔄 ¿Algo raro o no se actualiza?</b>';const ub=document.createElement('button');ub.className='sec';ub.textContent='Actualizar el juego';ub.style.fontSize='14px';ub.onclick=async()=>{try{const rs=await navigator.serviceWorker.getRegistrations();for(const r of rs)await r.unregister();const ks=await caches.keys();for(const k of ks)if(k.startsWith('kart-'))await caches.delete(k)}catch(e){}location.reload()};u.appendChild(ub);b.appendChild(u);const e=document.createElement('div');e.className='setrow';e.innerHTML='<b>😀 Emojis de los personajes</b>';const eb=document.createElement('button');eb.className='sec';eb.textContent='Ver y guardar stickers';eb.style.fontSize='14px';eb.onclick=()=>{location.href='emojis.html'};e.appendChild(eb);b.appendChild(e)}
/* ---------------------------- voces y comentarista ---------------------------- */
const VOX={table:{},buf:{},nat:{},lastT:0,playing:false,clips:false};
async function loadVoices(){try{VOX.table=await(await fetch('voces/voices.json')).json()}catch(e){VOX.table={}}}
function loadClips(){if(!AC||VOX.clips)return;VOX.clips=true;
  for(const k in VOX.table)VOX.table[k].forEach((t,i)=>{fetch('voces/'+k+'_'+i+'.m4a').then(r=>r.arrayBuffer()).then(b=>{try{const pr=AC.decodeAudioData(b,buf=>{VOX.buf[k+'_'+i]=buf},()=>{});if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}).catch(()=>{})})}
const NV=1.1,natKey=t=>`https://voz.cache/${window.VN?VN.voz:'mujer'}/${NV}/${encodeURIComponent(String(t).replace(/\s+/g,' ').trim().slice(0,600))}`;
function prefetchNatural(){if(!window.VN||!VN.sesionOk||!VN.sesionOk()||!VN.pref||VN.disabled)return;let n=0;for(const k in VOX.table)if(k!=='coin5')for(const t of VOX.table[k]){setTimeout(()=>{try{VN.prefetch(t,1.08)}catch(e){}},400*(n++))}}
async function natBuffer(text){if(VOX.nat[text]!==undefined)return VOX.nat[text];VOX.nat[text]=null;
  try{const c=await caches.open('voz-v1'),hit=await c.match(natKey(text));if(!hit)return null;const ab=await(await hit.blob()).arrayBuffer();VOX.nat[text]=await new Promise((res,rej)=>{const pr=AC.decodeAudioData(ab,res,rej);if(pr&&pr.catch)pr.catch(()=>{})})}catch(e){VOX.nat[text]=null}
  return VOX.nat[text]}
let voxBus=null;const VVOL={bajo:1,medio:1.8,alto:2.8,max:4};
function bus(){if(!voxBus){const g=AC.createGain(),c=AC.createDynamicsCompressor();c.threshold.value=-12;c.knee.value=8;c.ratio.value=8;c.attack.value=.003;c.release.value=.15;g.connect(c);c.connect(AC.destination);voxBus=g}return voxBus}
function playBuf(b,vol){if(!b||!AC)return;duck(b.duration||2);const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=(vol||1)*(VVOL[SET.vvol]||2.8)/1.6;s.buffer=b;s.connect(g);g.connect(bus());VOX.playing=true;s.onended=()=>{VOX.playing=false};s.start()}
function speak(key,force,noFx){if(key&&!noFx)fx(key);if(!key||!SET.voz||muted||!AC||!VOX.table[key])return;const now=performance.now();if(!force&&(VOX.playing||now-VOX.lastT<2200))return;
  const lst=VOX.table[key],i=(Math.random()*lst.length)|0;VOX.lastT=now;if(key==='coin5')setTimeout(()=>playVox(key,i,lst[i]),140);else playVox(key,i,lst[i])}
async function playVox(key,i,text){if(key!=='coin5'&&VOX.nat[text])return playBuf(VOX.nat[text],1.6);
  if(key!=='coin5')natBuffer(text);   // la próxima vez sale con la voz natural
  playBuf(VOX.buf[key+'_'+i],1.7)}
/* ---------------------------- efectos en el cielo: emojis y dinero que cae ---------------------------- */
const FXL=[],fxCool={};let FXB=null;
const FXMAP={
 coin5:[['💵','💰','🪙','🤑','💸'],48,'rain',['¡CHA-CHING!','RENTA COBRADA 💰']],
 hit:[['💫','🧱','⭐'],10,'burst',null],
 rent_hit:[['📄','💸','😭'],24,'rain',['¡NO TENGO PARA LA RENTA!','']],
 cement:[['🪣','💧'],12,'rain',null],
 first:[['👑','⭐','🎉'],28,'rain',['¡AQUÍ MANDA EL PATRÓN!','👑']],
 up:[['📈','🚀','💪'],14,'rise',null],
 back:[['🐌','😴','🔧'],10,'rain',null],
 lastlap:[['🏠','🏁','🧱'],26,'rain',['¡ÚLTIMA VUELTA!','A poner el techo 🏠']],
 go:[['🏗️','🔨','🧱'],16,'rise',['¡ARRANCA LA OBRA!','']],
 taco:[['🌮','🔥','🌶️'],28,'rain',['¡TACOS DEL ALBAÑIL!','']],
 star:[['⭐','✨','🌟'],26,'burst',null],
 win:[['🏆','🎉','💰','👑'],64,'rain',null],
 trophy:[['🏆','👑','🎉','⭐'],64,'rain',null],
 slab:[['⚠️','🧱'],10,'rain',null],
 rain:[['☔','💧','🌧️'],26,'rain',null],
 barrow:[['🛒','😱'],8,'rise',null],
 rata:[['🐀','🧀','🐁'],34,'rain',['¡YA CHILLÓ LA RATA!','🐀']]};
function fx(key){if(P2||state==='menu')return;const sp=FXMAP[key];if(!sp)return;const now=performance.now();if(now-(fxCool[key]||0)<1400)return;fxCool[key]=now;
  const[em,n,mode,ban]=sp;if(key==='coin5'&&AC&&!muted)SFX.cash();
  for(let i=0;i<n;i++){const e=em[(Math.random()*em.length)|0];let x,y,vx,vy;
    if(mode==='rain'){x=rnd(10,W-10);y=rnd(-70,-6);vx=rnd(-14,14);vy=rnd(80,160)}
    else if(mode==='burst'){const a=rnd(0,TAU),s2=rnd(60,170);x=W/2;y=H*.45;vx=Math.cos(a)*s2;vy=Math.sin(a)*s2-40}
    else{x=rnd(W*.25,W*.75);y=H*.72;vx=rnd(-30,30);vy=rnd(-150,-70)}
    FXL.push({e,x,y,vx,vy,r:rnd(-.6,.6),vr:rnd(-3,3),life:rnd(1.9,2.9),t:mode==='rain'?-(i*0.03):0,sz:rnd(17,31),g:mode==='rain'?0:mode==='burst'?120:-25})}
  if(ban)FXB={t:0,a:ban[0],b:ban[1]}}
function fxUpdate(dt){for(const p of FXL){p.t+=dt;if(p.t<0)continue;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.g*dt;p.r+=p.vr*dt}
  for(let i=FXL.length-1;i>=0;i--)if(FXL[i].t>FXL[i].life||FXL[i].y>H+40)FXL.splice(i,1);if(FXB){FXB.t+=dt;if(FXB.t>2.6)FXB=null}}
function fxDraw(){if(!FXL.length&&!FXB)return;ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
  for(const p of FXL){if(p.t<0)continue;ctx.globalAlpha=Math.max(0,Math.min(1,Math.min(p.t*4,(p.life-p.t)*2)));ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.font=p.sz+'px serif';ctx.fillText(p.e,0,0);ctx.restore()}
  ctx.globalAlpha=1;
  if(FXB){const t=FXB.t,a=Math.min(1,t*6)*Math.min(1,(2.6-t)*3),sc=1+.35*Math.exp(-t*7)*Math.cos(t*14);ctx.save();ctx.translate(W/2,88);ctx.scale(sc,sc);ctx.globalAlpha=a;ctx.lineJoin='round';
    ctx.font='bold 40px "Arial Black",Arial';ctx.lineWidth=8;ctx.strokeStyle='#5a3a00';ctx.strokeText(FXB.a,0,0);const gr=ctx.createLinearGradient(0,-22,0,22);gr.addColorStop(0,'#fff6a8');gr.addColorStop(.5,'#ffd43b');gr.addColorStop(1,'#e67700');ctx.fillStyle=gr;ctx.fillText(FXB.a,0,0);
    if(FXB.b){ctx.font='bold 20px "Arial Black",Arial';ctx.lineWidth=5;ctx.strokeStyle='#000';ctx.strokeText(FXB.b,0,34);ctx.fillStyle='#fff';ctx.fillText(FXB.b,0,34)}ctx.restore()}
  ctx.restore()}
/* ---------------------------- logros ---------------------------- */
const ACH=[
 {id:'first',e:'🥇',n:'Primer lugar',d:'Gana una carrera'},
 {id:'coins20',e:'🪙',n:'Cobrador',d:'Junta 20 monedas en una carrera'},
 {id:'cement5',e:'🪣',n:'Maestro del cemento fresco',d:'Quédate pegado en el cemento 5 veces'},
 {id:'rentist',e:'📄',n:'¡Se cobra!',d:'Pégale con un recibo al que va primero'},
 {id:'tacos3',e:'🌮',n:'Taquero oficial',d:'Usa 3 tacos del albañil'},
 {id:'turbo',e:'🔥',n:'Turbo máximo',d:'Haz un derrape de turbo máximo'},
 {id:'clean',e:'✨',n:'Obra limpia',d:'Termina una carrera sin que te peguen'},
 {id:'last',e:'🐌',n:'Como el albañil',d:'Termina en último lugar'},
 {id:'champ',e:'🏆',n:'Patrón de patrones',d:'Gana un campeonato'},
 {id:'ghost',e:'👻',n:'Más rápido que tu fantasma',d:'Gánale a tu fantasma en contrarreloj'},
 {id:'two',e:'👥',n:'En familia',d:'Juega una carrera de 2 jugadores'},
 {id:'pension',e:'🏠',n:'Arquitecto de pistas',d:'Crea la pista de tu pensión'},
 {id:'slab',e:'🏗️',n:'Casco puesto',d:'Esquiva una loza que cae'},
 {id:'rain',e:'🌧️',n:'Aguas con la lluvia',d:'Termina una carrera bajo la lluvia'},
 {id:'ten',e:'🎮',n:'Veterano de obra',d:'Corre 10 carreras'},
 {id:'jump',e:'🛫',n:'Rampa lista',d:'Salta una rampa'},
 {id:'draw',e:'✏️',n:'Pista a mano',d:'Dibuja tu propia pista con el dedo'},
 {id:'night',e:'🌙',n:'Hasta que anocheció',d:'Termina Atardecer en la Colonia'},
 {id:'team',e:'🤝',n:'Equipo ganador',d:'Gana una carrera por equipos'},
 {id:'survivor',e:'🧟',n:'Sobreviviente',d:'Gana un torneo de eliminación'}
];
const APODOS=[[0,'Inquilino nuevo'],[3,'Maestro de obra'],[6,'Capataz'],[9,'Patrón'],[12,'Patrón de patrones']];
const ST=()=>lsGet('kart_stats',{});const getAch=()=>lsGet('kart_ach',{});
function unlock(id){const a=getAch();if(a[id])return;a[id]=Date.now();lsSet('kart_ach',a);const d=ACH.find(x=>x.id===id);if(d){say('🎖️ ¡Logro: '+d.n+'!',3400);[784,988,1175,1568].forEach((f,i)=>beep(f,.1,'square',.2,0,i*.08))}updApodo()}
function apodo(){const n=Object.keys(getAch()).length;let ap=APODOS[0][1];for(const[k,v]of APODOS)if(n>=k)ap=v;return{n,ap}}
function updApodo(){const{n,ap}=apodo();const e=$('apodo');if(e)e.textContent='🎖️ '+ap+' · '+n+'/'+ACH.length+' logros'}
function buildAch(){const a=getAch(),{n,ap}=apodo();$('achHead').textContent='Apodo: '+ap+' · '+n+' de '+ACH.length+' logros';$('achBody').innerHTML=ACH.map(x=>`<div class="ach ${a[x.id]?'on':'off'}"><i>${a[x.id]?x.e:'🔒'}</i><div><b>${x.n}</b>${x.d}</div></div>`).join('')}
/* ---------------------------- fantasma y contrarreloj ---------------------------- */
const GH={rec:[],tNext:0,best:null,wpi:0};
const ghostKey=()=>'kart_gh_'+TRK.id;
function ghostPos(tm){const d=GH.best&&GH.best.d;if(!d)return null;const n=d.length/3-1;let f=tm*10;if(f<0)f=0;if(f>=n)return null;const i=f|0,u=f-i;const a0=d[i*3+2]/100,a1=d[i*3+5]/100;return{x:lerp(d[i*3],d[i*3+3],u),y:lerp(d[i*3+1],d[i*3+4],u),a:a0+angDiff(a0,a1)*u}}
/* ---------------------------- eventos en la pista ---------------------------- */
const EV={list:[],timer:13,rain:0,rainEver:false,hits:0,narT:18,boxT:6,lapSeen:0};
function evSpawnFrom(d){
  if(d.k==='barrow'){const w=WP[d.idx%WPN];EV.list.push({k:'barrow',x:w.x-w.nx*120,y:w.y-w.ny*120,vx:w.nx*100,vy:w.ny*100,life:3.2,hit:{}});say('🛒 ¡Ahí va la carretilla loca!',2200);speak('barrow',true)}
  else if(d.k==='cardbox'){const w=WP[d.idx%WPN];EV.list.push({k:'cardbox',x:w.x-w.nx*110,y:w.y-w.ny*110,vx:w.nx*130,vy:w.ny*130,life:2.4,hit:{}});say('📦 ¡Se cayó una caja del camión!',1800)}
  else if(d.k==='slab'){const w=WP[d.idx%WPN];EV.list.push({k:'slab',x:w.x+w.nx*d.o,y:w.y+w.ny*d.o,t:0,warn:1.8,done:false,seen:false});say('⚠️ ¡Cuidado, cae la loza!',2200);speak('slab',true)}
  else if(d.k==='rain'&&EV.rain<=0){EV.rain=15;EV.rainEver=true;GRIPK=0.8;say('🌧️ ¡Aguas! Se mojó el asfalto',2600);speak('rain',true);noiseHit(.5,.12,2500)}}
function evSpawn(){const online=MODE==='online'&&window.NETG&&NETG.on;if(online&&!NETG.host)return;const r=Math.random(),ref=player;if(!ref)return;let d;
  if(r<0.38)d={k:'barrow',idx:(ref.wpi+26+((Math.random()*14)|0))%WPN};
  else if(r<0.78)d={k:'slab',idx:(ref.wpi+30+((Math.random()*10)|0))%WPN,o:Math.round(rnd(-48,48))};
  else if(EV.rain<=0)d={k:'rain'};else return;
  evSpawnFrom(d);if(online)NETG.send({t:'ev',d})}
function evTick(dt){
  if(EV.rain>0){EV.rain-=dt;if(EV.rain<=0){GRIPK=1;say('☀️ Salió el sol, ya se secó',2000)}}
  if(MODE!=='tt'){EV.timer-=dt;if(EV.timer<=0){evSpawn();EV.timer=rnd(14,22)}}
  for(const e of EV.list){
    if(e.k==='barrow'||e.k==='cardbox'){const rad=e.k==='cardbox'?13:17;e.life-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;for(const k of karts){if(e.hit[k.slot]||k.fin||k.air>0)continue;if((k.x-e.x)**2+(k.y-e.y)**2<rad*rad){e.hit[k.slot]=1;hit(k)}}}
    else if(e.k==='slab'){e.t+=dt;if(!e.done&&e.t>=e.warn){e.done=true;shake=Math.max(shake,.25);SFX.hit();
        for(const k of karts){const d2=(k.x-e.x)**2+(k.y-e.y)**2;if(d2<30*30)hit(k);else if(k.isPlayer&&d2<95*95)e.near=true}
        for(let i=0;i<10;i++)parts.push({x:e.x+rnd(-12,12),y:e.y+rnd(-12,12),z:rnd(1,6),vz:rnd(20,50),life:.6,max:.6,r:rnd(3,6),k:'dust',c:'170,170,176'});
        if(e.near)unlock('slab')}}}
  if(TRK.weather==='cardbox'&&state==='race'&&player){EV.boxT-=dt;if(EV.boxT<=0){EV.boxT=rnd(6,9);const online=MODE==='online'&&window.NETG&&NETG.on;if(!online||NETG.host){const d={k:'cardbox',idx:(player.wpi+22+((Math.random()*14)|0))%WPN};evSpawnFrom(d);if(online)NETG.send({t:'ev',d})}}}
  EV.list=EV.list.filter(e=>(e.k==='barrow'||e.k==='cardbox')?e.life>0:e.t<e.warn+.7)}
/* obstáculos que cambian cada vuelta: el albañil tapa un carril y el plomero abre una zanja */
function lapObstacles(L){hazards=hazards.filter(h=>!h.keep);RAMPS=RAMPS.filter(r=>!r.tmp);
  const R=rng(parseInt(hashStr(TRK.id),16)+L*7919),sBar=Math.floor(WPN*(.16+R()*.26)),sTr=Math.floor(WPN*(.56+R()*.28)),side=R()<.5?-1:1,wB=WP[sBar],wT=WP[sTr];
  for(const o of[72,48,24])hazards.push({x:wB.x+wB.nx*side*o,y:wB.y+wB.ny*side*o,life:1e9,kind:'barrier',keep:true,r:19});
  for(let o=-78;o<=78;o+=19.5)hazards.push({x:wT.x+wT.nx*o,y:wT.y+wT.ny*o,life:1e9,kind:'trench',keep:true,r:15});
  const wR=WP[(sTr-9+WPN)%WPN],ro=(R()-.5)*60;RAMPS.push({x:wR.x+wR.nx*ro,y:wR.y+wR.ny*ro,a:wR.a,tmp:true});
  say('🧱 El albañil tapó un carril · 🪠 El plomero abrió una zanja: ¡salta con la rampa!',3800)}
/* ---------------------------- pistas de tu pensión ---------------------------- */
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function trackCheck(pts){const w=resample(catmull(pts,16),14),n=w.length;
  for(const p of w)if(p[0]<170||p[0]>1880||p[1]<170||p[1]>1880)return 'se sale del mapa';
  const L=n*14;if(L<2600)return 'es muy corta';if(L>6400)return 'es muy larga';
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const gap=Math.min(j-i,n-(j-i));if(gap<32)continue;if((w[i][0]-w[j][0])**2+(w[i][1]-w[j][1])**2<270*270)return 'se cruza o queda muy pegada a sí misma'}
  for(let i=0;i<n;i++){const a=w[i],b=w[(i+5)%n],c=w[(i+10)%n];const ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),ac=Math.hypot(c[0]-a[0],c[1]-a[1]);const cr=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));if(ab*bc*ac/(2*cr+1e-6)<95)return 'tiene curvas muy cerradas'}
  return ''}
function okTrack(pts){return trackCheck(pts)===''}
function fromDrawing(raw){if(raw.length<25)return{err:'Dibuja un circuito más grande 🙂'};
  const pts=raw.slice();pts.push(raw[0]);let L=0;const cum=[0];for(let i=1;i<pts.length;i++){L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);cum.push(L)}
  if(L<400)return{err:'Dibuja un circuito más grande 🙂'};
  const M=140;let cur=[],j=0;for(let k=0;k<M;k++){const d=L*k/M;while(j<cum.length-2&&cum[j+1]<d)j++;const u=(d-cum[j])/((cum[j+1]-cum[j])||1);cur.push([pts[j][0]+(pts[j+1][0]-pts[j][0])*u,pts[j][1]+(pts[j+1][1]-pts[j][1])*u])}
  const smooth=(a,win)=>{const n=a.length;return a.map((_,i)=>{let x=0,y=0;for(let d=-win;d<=win;d++){const q=a[(i+d+n)%n];x+=q[0];y+=q[1]}return[x/(2*win+1),y/(2*win+1)]})};
  for(let pass=0;pass<4;pass++)cur=smooth(cur,3);
  const fit=a=>{let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const p of a){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])}const sc=Math.min(1560/(x1-x0||1),1560/(y1-y0||1)),cx=(x0+x1)/2,cy=(y0+y1)/2;return a.map(p=>[1024+(p[0]-cx)*sc,1024+(p[1]-cy)*sc])};
  let why='';for(let pass=0;pass<9;pass++){const f=fit(cur),N=16,ctl=[];for(let i=0;i<N;i++)ctl.push(f[Math.floor(i*f.length/N)].map(Math.round));const r=trackCheck(ctl);if(r==='')return{pts:ctl};why=r;cur=smooth(cur,4)}
  return{err:'Tu pista '+why+'. Haz curvas más abiertas y sin cruzarte.'}}
function genPts(seed){for(let att=0;att<200;att++){const R=rng(seed+att*7919),n=9+((R()*4)|0),pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(R()-.5)*.35,rr=.5+R()*.5;pts.push([1024+Math.cos(a)*rr*830,1024+Math.sin(a)*rr*830*(.8+R()*.2)])}if(okTrack(pts))return pts}
  return THEMES()[0].pts.map(p=>p.slice())}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function mkCustom(c){const th=THEMES()[c.theme%THEMES().length];const t=Object.assign({},th,{id:c.id,n:c.n,d:(c.pts?'Dibujada a mano':'Tu pensión')+' · '+th.n,pts:c.pts?c.pts.map(p=>p.slice()):genPts(c.seed),pension:c.n,custom:true,cseed:c.seed,cpts:c.pts,ctheme:c.theme,img:c.img||null});if(c.img){const im=new Image();im.src=c.img;t.imgEl=im}return t}
function loadPensions(){for(let i=TRACKS.length-1;i>=0;i--)if(TRACKS[i].custom)TRACKS.splice(i,1);for(const c of lsGet('kart_pens',[]).slice(0,5))TRACKS.push(mkCustom(c))}
let PEN={seed:1,theme:0,pts:null,img:null};
function drawPenPrev(){const cn=$('penCv'),g=cn.getContext('2d'),th=THEMES()[PEN.theme];const pts=catmull(PEN.pts||genPts(PEN.seed),10);g.fillStyle=th.grass[0];g.fillRect(0,0,240,140);let a=1e9,b=1e9,c2=-1e9,e=-1e9;for(const p of pts){a=Math.min(a,p[0]);c2=Math.max(c2,p[0]);b=Math.min(b,p[1]);e=Math.max(e,p[1])}
  const sc=Math.min(210/(c2-a),118/(e-b)),ox=120-(a+c2)/2*sc,oy=70-(b+e)/2*sc;g.lineJoin='round';const pa=()=>{g.beginPath();pts.forEach((p,j)=>{const x=p[0]*sc+ox,y=p[1]*sc+oy;j?g.lineTo(x,y):g.moveTo(x,y)});g.closePath()};pa();g.lineWidth=12;g.strokeStyle=th.kerb;g.stroke();pa();g.lineWidth=8;g.strokeStyle=th.road;g.stroke()}
function openPension(){PEN={seed:(Math.random()*1e6)|0,theme:0,pts:null,img:null};$('penPhotoSt').textContent='';$('penName').value='';const sg=$('penTheme');sg.innerHTML='';THEMES().forEach((t,i)=>{const b=document.createElement('button');b.className='sec'+(i===PEN.theme?' on':'');b.textContent=t.n.replace('Circuito ','');b.onclick=()=>{PEN.theme=i;openPensionTheme()};sg.appendChild(b)});drawPenPrev();showScreen('pension')}
function openPensionTheme(){[...$('penTheme').children].forEach((b,i)=>b.classList.toggle('on',i===PEN.theme));drawPenPrev()}
$('penDice').onclick=()=>{PEN.seed=(Math.random()*1e6)|0;PEN.pts=null;drawPenPrev()};
$('penCancel').onclick=()=>{buildTracks();showScreen('tracks')};
$('penOk').onclick=()=>{const n=($('penName').value||'').trim().slice(0,18);if(n.length<2){alert('Ponle nombre a tu pensión 🏠');return}
  const list=lsGet('kart_pens',[]);if(list.length>=5){alert('Máximo 5 pistas. Borra una con la ✖');return}
  const c={id:'p'+hashStr(n+PEN.seed+PEN.theme+(PEN.pts?PEN.pts.join():'')).slice(0,8),n,theme:PEN.theme,seed:PEN.seed};if(PEN.pts)c.pts=PEN.pts;if(PEN.img)c.img=PEN.img;list.push(c);lsSet('kart_pens',list);loadPensions();unlock('pension');buildTracks();showScreen('tracks')};
/* dibujar la pista con el dedo */
const dc=$('drawCv');let dpts=[],drawing=false;
function redrawDraw(){const g=dc.getContext('2d');g.fillStyle='#2f7d45';g.fillRect(0,0,520,300);g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=1;for(let x=0;x<520;x+=40){g.beginPath();g.moveTo(x,0);g.lineTo(x,300);g.stroke()}for(let y=0;y<300;y+=40){g.beginPath();g.moveTo(0,y);g.lineTo(520,y);g.stroke()}
  if(dpts.length>1){g.lineJoin=g.lineCap='round';g.strokeStyle='#4a4d55';g.lineWidth=20;g.beginPath();dpts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.strokeStyle='#ffe066';g.lineWidth=2;g.setLineDash([8,8]);g.stroke();g.setLineDash([]);g.fillStyle='#fff';g.beginPath();g.arc(dpts[0][0],dpts[0][1],6,0,TAU);g.fill()}}
const dpt=e=>{const r=dc.getBoundingClientRect();return[(e.clientX-r.left)*520/r.width,(e.clientY-r.top)*300/r.height]};
dc.addEventListener('pointerdown',e=>{e.preventDefault();drawing=true;dpts=[dpt(e)];try{dc.setPointerCapture(e.pointerId)}catch(_){}$('drawMsg').textContent='';redrawDraw()});
dc.addEventListener('pointermove',e=>{if(!drawing)return;const p=dpt(e),l=dpts[dpts.length-1];if(Math.hypot(p[0]-l[0],p[1]-l[1])>4){dpts.push(p);redrawDraw()}});
['pointerup','pointercancel'].forEach(ev=>dc.addEventListener(ev,()=>{drawing=false}));
$('drawClear').onclick=()=>{dpts=[];$('drawMsg').textContent='';redrawDraw()};
$('drawCancel').onclick=()=>showScreen('pension');
$('drawOk').onclick=()=>{const r=fromDrawing(dpts);if(r.err){$('drawMsg').textContent='😕 '+r.err;return}PEN.pts=r.pts;unlock('draw');drawPenPrev();showScreen('pension')};
$('penDraw').onclick=()=>{dpts=[];$('drawMsg').textContent='';redrawDraw();showScreen('drawt')};
$('penPhoto').onclick=()=>$('penFile').click();
$('penFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=220;c.height=150;const g=c.getContext('2d'),sc=Math.max(220/im.width,150/im.height),w=im.width*sc,h=im.height*sc;g.drawImage(im,110-w/2,75-h/2,w,h);PEN.img=c.toDataURL('image/jpeg',.8);$('penPhotoSt').textContent='✅ Foto lista';URL.revokeObjectURL(im.src)};im.onerror=()=>alert('No pude abrir esa foto 😕');im.src=URL.createObjectURL(f);e.target.value=''};
function shareCode(t){const o={n:t.n,th:t.ctheme||0};if(t.cpts)o.p=t.cpts;else o.s=t.cseed;return 'PK1.'+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
async function shareTrack(t){const txt='🏎️ Mi pista "'+t.n+'" para El Patrón Kart. Entra a Elegir pista → 📥 Importar y pega este código:\n'+shareCode(t);try{if(navigator.share)await navigator.share({text:txt});else{await navigator.clipboard.writeText(txt);alert('Código copiado. Pégalo en WhatsApp 📲')}}catch(e){}}
function importTrack(){const raw=prompt('Pega aquí el código de la pista (empieza con PK1.)');if(!raw)return;const m=/PK1\.([A-Za-z0-9+/=]+)/.exec(raw);if(!m){alert('Ese código no parece válido 😕');return}
  try{const o=JSON.parse(decodeURIComponent(escape(atob(m[1]))));const n=String(o.n||'Pista').slice(0,18),th=(o.th|0)%THEMES().length;let pts=null,seed=0;
    if(Array.isArray(o.p)){pts=o.p.slice(0,24).map(q=>[+q[0],+q[1]]);if(pts.length<8||pts.some(q=>!isFinite(q[0])||!isFinite(q[1]))||trackCheck(pts)!==''){alert('La pista del código no es válida 😕');return}}else seed=(+o.s)|0;
    const list=lsGet('kart_pens',[]);if(list.length>=5){alert('Máximo 5 pistas. Borra una con la ✖');return}const c={id:'p'+hashStr(n+seed+th+(pts?pts.join():'')).slice(0,8),n,theme:th,seed};if(pts)c.pts=pts;if(!list.some(x=>x.id===c.id)){list.push(c);lsSet('kart_pens',list);loadPensions()}buildTracks();alert('¡Pista "'+n+'" importada! 🏁')}catch(e){alert('Ese código no parece válido 😕')}}
/* ---------------------------- personalizar el kart ---------------------------- */
const COLORS=['','#e03131','#f08c00','#fab005','#2f9e44','#1c7ed6','#7048e8','#e64980','#343a40'],LOGOS=['','🏠','🧱','⭐','🔑','👑','🌮'];
function buildPaint(){const d=$('paintDots'),l=$('logoBtns');if(!d||!l)return;d.innerHTML='🎨';l.innerHTML=' ';
  COLORS.forEach(c=>{const s=document.createElement('span');s.style.background=c||'conic-gradient(#e03131,#fab005,#2f9e44,#1c7ed6,#e03131)';s.className=(PAINT.c||'')===c?'on':'';s.onclick=()=>{PAINT.c=c||null;lsSet('kart_paint',PAINT);buildSelect()};d.appendChild(s)});
  LOGOS.forEach(g=>{const s=document.createElement('span');s.textContent=g||'∅';s.className=(PAINT.l||'')===g?'on':'';s.onclick=()=>{PAINT.l=g;lsSet('kart_paint',PAINT);buildSelect()};l.appendChild(s)})}
const _bs=buildSelect;buildSelect=function(){_bs();buildPaint()};
/* ---------------------------- pistas: pantalla con las tuyas ---------------------------- */
buildTracks=function(){const row=$('tkRow');row.innerHTML='';const best=lsGet('kart_best',{});
  TRACKS.forEach((t,i)=>{const d=document.createElement('div');d.className='tk';const cn=document.createElement('canvas');cn.width=200;cn.height=120;const g=cn.getContext('2d');g.fillStyle=t.grass[0];g.fillRect(0,0,200,120);const pts=catmull(t.pts,10);let a=1e9,b=1e9,c2=-1e9,e=-1e9;for(const p of pts){a=Math.min(a,p[0]);c2=Math.max(c2,p[0]);b=Math.min(b,p[1]);e=Math.max(e,p[1])}const sc=Math.min(176/(c2-a),96/(e-b)),ox=100-(a+c2)/2*sc,oy=60-(b+e)/2*sc;
    g.lineJoin='round';const path=()=>{g.beginPath();pts.forEach((p,j)=>{const x=p[0]*sc+ox,y=p[1]*sc+oy;j?g.lineTo(x,y):g.moveTo(x,y)});g.closePath()};path();g.lineWidth=11;g.strokeStyle=t.kerb;g.stroke();path();g.lineWidth=7;g.strokeStyle=t.road;g.stroke();
    d.appendChild(cn);d.insertAdjacentHTML('beforeend',`<b>${esc(t.n)}</b><small>${esc(t.d)}</small><small>${best[t.id]?'⏱️ '+fmt(best[t.id]/1000):'sin tiempo aún'}</small>`);
    if(t.custom){const sh=document.createElement('span');sh.textContent='📤';sh.style.cssText='position:absolute;top:2px;left:6px;font:700 15px system-ui;padding:3px 6px';sh.onclick=ev=>{ev.stopPropagation();shareTrack(t)};d.appendChild(sh);const x=document.createElement('span');x.className='x';x.textContent='✖';x.style.cssText='position:absolute;top:2px;right:6px;color:#ff8787;font:700 15px system-ui;padding:3px 6px';x.onclick=ev=>{ev.stopPropagation();if(!confirm('¿Borrar la pista "'+t.n+'"?'))return;lsSet('kart_pens',lsGet('kart_pens',[]).filter(p=>p.id!==t.id));loadPensions();buildTracks()};d.appendChild(x)}
    d.style.position='relative';d.onclick=()=>pickTrack(i);row.appendChild(d)});
  if(lsGet('kart_pens',[]).length<5){const d=document.createElement('div');d.className='tk';d.style.justifyContent='center';d.innerHTML='<div style="font-size:44px;line-height:1">🏠</div><b>Tu pensión</b><small>Crea una pista con su nombre</small>';d.onclick=openPension;row.appendChild(d);const d2=document.createElement('div');d2.className='tk';d2.style.justifyContent='center';d2.innerHTML='<div style="font-size:44px;line-height:1">📥</div><b>Importar pista</b><small>Pega el código de un amigo</small>';d2.onclick=importTrack;row.appendChild(d2)}}
function mkBoard(img,name){return iconSprite((g,w,h)=>{g.fillStyle='#4a3b1c';g.fillRect(w*.2,h*.62,8,h*.38);g.fillRect(w*.78,h*.62,8,h*.38);const bg=g.createLinearGradient(0,0,0,h*.66);bg.addColorStop(0,'#1c1c1c');bg.addColorStop(1,'#050505');g.fillStyle=bg;rrect(g,0,0,w,h*.66,8);g.fill();g.save();rrect(g,6,6,w-12,h*.66-26,5);g.clip();const sc=Math.max((w-12)/img.width,(h*.66-26)/img.height);g.drawImage(img,w/2-img.width*sc/2,6+(h*.66-26)/2-img.height*sc/2,img.width*sc,img.height*sc);g.restore();g.strokeStyle='#e8cd85';g.lineWidth=3;rrect(g,3,3,w-6,h*.66-6,6);g.stroke();g.fillStyle='#e8cd85';let fs=13;g.font=`bold ${fs}px "Arial Black",Arial`;g.textAlign='center';while(g.measureText(name).width>w-16&&fs>7){fs--;g.font=`bold ${fs}px "Arial Black",Arial`}g.fillText(name,w/2,h*.66-9)},190,120)}
/* ---------------------------- campeonato ---------------------------- */
function startChamp(){MODE='champ';P2=false;const long=confirm('¿Copa larga con las 6 pistas?\n\nAceptar = 6 pistas\nCancelar = 4 pistas');CH={i:0,tracks:TRACKS.filter(t=>!t.custom&&(long||!t.extra)).map(t=>TRACKS.indexOf(t)),pts:{},others:null,counted:{}};nextChampRace()}
function nextChampRace(){showScreen(null);setTimeout(()=>{curTrack=CH.tracks[CH.i];buildTrack(TRACKS[curTrack]);state='menu';karts=[];startRace()},30)}
function champTable(hl){const arr=Object.keys(CH.pts).map(ci=>({ci:+ci,p:CH.pts[ci]})).sort((a,b)=>b.p-a.p);return'<table>'+arr.map((x,i)=>`<tr class="${x.ci===picked?'me':''}"><td>${i+1}°</td><td>${esc(CHARS[x.ci].n)}</td><td>${x.p} pts</td></tr>`).join('')+'</table>'}
function showChamp(){const last=CH.i>=CH.tracks.length-1;const arr=Object.keys(CH.pts).map(ci=>({ci:+ci,p:CH.pts[ci]})).sort((a,b)=>b.p-a.p);
  if(!last){$('champT').textContent='📊 Clasificación · pista '+(CH.i+1)+' de '+CH.tracks.length;$('champBody').innerHTML=champTable();$('champGo').textContent='➡️ '+TRACKS[CH.tracks[CH.i+1]].n;$('champGo').onclick=()=>{CH.i++;nextChampRace()}}
  else{const me=arr.findIndex(x=>x.ci===picked)+1;const won=me===1;$('champT').textContent=won?'🏆 ¡CAMPEÓN! Patrón de patrones':me===2?'🥈 Subcampeón (casi cobras la renta)':'😅 Quedaste '+me+'° en el campeonato';
    $('champBody').innerHTML=(won?'<div style="font-size:64px;line-height:1.1">🏆</div>':'')+champTable();$('champGo').textContent='🏠 Menú';$('champGo').onclick=()=>$('bMenu').onclick();if(won){unlock('champ');speak('trophy',true);SFX.win()}}
  showScreen('champ')}
$('champExit').onclick=()=>$('bMenu').onclick();
/* ---------------------------- flujo de menús ---------------------------- */
let selStage=1,picked1=0;
function openSelect(){audioUnlock();beep(880,.1);setMusic('cancion');selStage=1;$('selTitle').textContent=P2?'JUGADOR 1: ELIGE TU PILOTO':MODE==='champ'?'CAMPEONATO: ELIGE A TU PILOTO':MODE==='tt'?'CONTRARRELOJ: ELIGE A TU PILOTO':'ELIGE A TU PILOTO';$('bGo').textContent=MODE==='champ'?'🏆 ¡EMPEZAR!':'🗺️ ELEGIR PISTA';buildSelect();showScreen('select');loadClips();prefetchNatural()}
$('mRace').onclick=()=>{MODE='race';P2=false;openSelect()};
$('mChamp').onclick=()=>{MODE='champ';P2=false;openSelect()};
$('mTT').onclick=()=>{MODE='tt';P2=false;openSelect()};
$('m2P').onclick=()=>{MODE='race';P2=true;openSelect()};
$('bGo').onclick=()=>{audioUnlock();
  if(P2&&selStage===1){picked1=picked;selStage=2;$('selTitle').textContent='JUGADOR 2: ELIGE TU PILOTO';picked=(picked1+1)%CHARS.length;buildSelect();return}
  if(P2&&selStage===2){if(picked===picked1){alert('Elige un piloto distinto al del Jugador 1 😉');return}picked2=picked;picked=picked1}
  if(MODE==='champ'){startChamp();return}
  buildTracks();showScreen('tracks')};
$('bBack').onclick=()=>{if(P2&&selStage===2){selStage=1;picked=picked1;$('selTitle').textContent='JUGADOR 1: ELIGE TU PILOTO';buildSelect();return}showScreen('title')};
$('bBack2').onclick=()=>{selStage=1;if(P2)picked=picked1,selStage=2;showScreen('select')};
$('bSet').onclick=()=>{audioUnlock();buildSettings();showScreen('settings')};$('setBack').onclick=()=>showScreen('title');
$('bAch').onclick=()=>{audioUnlock();buildAch();showScreen('ach')};$('achBack').onclick=()=>showScreen('title');
$('bAgain').onclick=()=>{audioUnlock();if(MODE==='champ'){showChamp();return}showScreen(null);startRace()};
const _menu=$('bMenu').onclick;$('bMenu').onclick=()=>{_menu();P2=false;MODE='race';updApodo()};
bindHold('b2L',()=>input2.left=true,()=>input2.left=false);bindHold('b2R',()=>input2.right=true,()=>input2.right=false);
$('b2I').addEventListener('pointerdown',e=>{e.preventDefault();input2.item=true;$('b2I').classList.add('down')});['pointerup','pointercancel'].forEach(ev=>$('b2I').addEventListener(ev,()=>$('b2I').classList.remove('down')));
addEventListener('keydown',e=>{if(e.key==='j')input2.left=true;if(e.key==='l')input2.right=true;if(e.key==='k')input2.item=true});addEventListener('keyup',e=>{if(e.key==='j')input2.left=false;if(e.key==='l')input2.right=false});
/* ---------------------------- API hacia el juego ---------------------------- */
const TINT=[[0,[255,255,255]],[.3,[255,214,170]],[.62,[170,140,215]],[1,[111,127,200]]],FOGS=[[0,[200,230,255]],[.3,[255,205,150]],[.62,[120,100,170]],[1,[34,34,84]]],SKYO=[[0,[0,0,0,0]],[.3,[255,140,80,.38]],[.62,[70,50,130,.6]],[1,[8,12,48,.82]]];
function mixStops(st,p){for(let i=0;i<st.length-1;i++){const[a,ca]=st[i],[b,cb]=st[i+1];if(p<=b){const t=(p-a)/(b-a||1);return ca.map((x,j)=>x+(cb[j]-x)*t)}}return st[st.length-1][1].slice()}
let stars=null;
const todP=()=>{if(!TRK.cycle)return TRK.night?1:0;if(state==='menu'||!player)return 0;return Math.max(0,Math.min(1,(player.prog-WPN)/(WPN*LAPS)))};
function scoreRows(){if(MODE==='champ'&&CH)return Object.keys(CH.pts).map(ci=>[CHARS[+ci].n,CH.pts[ci]]).sort((a,b)=>b[1]-a[1]);if(MODE==='online'&&window.NETG&&NETG.on&&NETG.lob.mode!=='race'&&NETG.standings)return NETG.standings();return null}
window.V4={
  tod:todP,unlock,fxBusy:()=>!!FXB,raceStats(){return{c:(player&&player.coins)||0,m:EV.cem||0,h:EV.hits||0}},
  pre(){if(!TRK.cycle||state==='menu')return;const p=todP(),t=mixStops(TINT,p).map(Math.round);TRK.tint='rgb('+t.join(',')+')';const f=mixStops(FOGS,p).map(Math.round);FOG=f;fogC=(255<<24)|(f[2]<<16)|(f[1]<<8)|f[0]},
  skyOver(){if(!TRK.cycle||state==='menu')return;const p=todP(),c=mixStops(SKYO,p);if(c[3]>0.01){ctx.fillStyle=`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${c[3]})`;ctx.fillRect(0,0,W,HOR+2)}
    const sa=Math.max(0,Math.min(1,(p-.5)/.3));if(sa>0.02){if(!stars){stars=[];for(let i=0;i<140;i++)stars.push([Math.random()*SKW,Math.random()*HOR*.8,Math.random()<.12?1.6:.9,Math.random()])}const o=skyOff();ctx.fillStyle='#fff';for(const s of stars){let x=s[0]-o;if(x<0)x+=SKW;if(x>W)continue;ctx.globalAlpha=sa*(.4+.6*s[3]);ctx.fillRect(x,s[1],s[2],s[2])}ctx.globalAlpha=1}},
  gfx:()=>gfxLevel,
  mkCustom,evFrom:evSpawnFrom,
  prepTrack(trk){if(!SPR.mkSign)return;const pn=trk.pension?trk.pension.toUpperCase():'';const ph=(trk.imgEl&&trk.imgEl.complete&&trk.imgEl.naturalWidth)?trk.imgEl:null;const key=pn+(ph?'1':'0');
    if(SPR._signKey!==key){const extra=pn?[[pn,'¡TU PENSIÓN FAVORITA!'],[pn,'DEPA LIBRE · ¡PREGUNTE!'],[pn,'AQUÍ SE VIVE BIEN'],['BIENVENIDO A',pn]]:[];const base=SIGN_TXT.map(x=>SPR.mkSign(x)),ex=extra.map(x=>SPR.mkSign(x,ph));
      const boards=ph?[mkBoard(ph,pn),mkBoard(ph,pn)]:[];SPR.signs=base.concat(ex,ex,ex,boards,boards,boards);SPR._signKey=key}},
  raceStart(){EV.list=[];EV.timer=13;EV.rain=0;EV.rainEver=false;EV.hits=0;EV.cem=0;EV.narT=rnd(16,24);GRIPK=1;SPEEDK=SET.speed;applyGfx();EV.boxT=rnd(5,8);EV.lapSeen=0;RAMPS=RAMPS.filter(r=>!r.tmp);if(TRK.weather==='rain'){EV.rain=1e9;EV.rainEver=true;GRIPK=.85}
    GH.rec=[];GH.tNext=0;GH.wpi=Math.max(0,WPN-3);GH.lap=0;GH.best=lsGet(ghostKey(),null);emaDt=0.016;slowN=0;loadClips()},
  go(){if(player&&player.isPlayer&&player.ch&&player.ch.id==='chino')speak('rata',true);else speak('go',true)},
  speak,
  tick(dt){fxUpdate(dt);if(state!=='race'&&state!=='finish')return;
    if(state==='race'){evTick(dt);autoQuality(dt);if(player&&player.isPlayer&&player.lap>=1&&player.lap<=LAPS&&player.lap!==EV.lapSeen){EV.lapSeen=player.lap;lapObstacles(player.lap)}
      EV.narT-=dt;if(EV.narT<=0&&VOX.table.nar){EV.narT=rnd(16,26);const l=VOX.table.nar,i=(Math.random()*l.length)|0;say('🎙️ '+l[i],3000);if(SET.voz&&!VOX.playing&&!muted&&AC){VOX.lastT=performance.now();playVox('nar',i,l[i])}}
      if(!P2&&raceT>=GH.tNext){GH.rec.push(Math.round(player.x),Math.round(player.y),Math.round(player.a*100));GH.tNext+=0.1}
      if(MODE==='tt'&&GH.best){const g=ghostPos(raceT);if(g){let best=GH.wpi,bd=1e12;for(let o=-3;o<=10;o++){const i=(GH.wpi+o+WPN)%WPN,w=WP[i],d=(w.x-g.x)**2+(w.y-g.y)**2;if(d<bd){bd=d;best=i}}if(best!==GH.wpi){if(GH.wpi>WPN*0.8&&best<WPN*0.2)GH.lap=(GH.lap||0)+1;GH.wpi=best}}}}},
  ev(name,k,x){const st=ST();
    if(name==='hit')EV.hits++;
    else if(name==='coin'){if(k.coins>=20)unlock('coins20')}
    else if(name==='cement'){EV.cem=(EV.cem||0)+1;st.cement=(st.cement||0)+1;lsSet('kart_stats',st);if(st.cement>=5)unlock('cement5')}
    else if(name==='use'&&x==='taco'){st.tacos=(st.tacos||0)+1;lsSet('kart_stats',st);if(st.tacos>=3)unlock('tacos3')}
    else if(name==='shothit'){const sh=k,tg=x;if(sh&&sh.kind==='rent'&&tg&&tg.prog>=Math.max(...karts.map(q=>q.prog))-0.5)unlock('rentist')}
    else if(name==='turbomax')unlock('turbo')
    else if(name==='jump')unlock('jump')},
  addSprites(list){
    for(const e of EV.list){const p=proj(e.x,e.y);if(!p)continue;
      if(e.k==='barrow')list.push({p,img:SPR.wheelbarrow,wu:30,sh:true});
      else if(e.k==='cardbox')list.push({p,img:SPR.cardbox,wu:20,sh:true});
      else{const tt=e.t;list.push({p,draw:(c,pp)=>{const r=30*pp.sc;
        if(tt<e.warn){const a=.35+.3*Math.sin(t*14);c.save();c.fillStyle=`rgba(230,40,40,${a})`;c.beginPath();c.ellipse(pp.sx,pp.sy,r,r*.22,0,0,TAU);c.fill();c.strokeStyle='#ff3030';c.lineWidth=2;c.stroke();c.font=`${Math.max(10,r*.7)}px serif`;c.textAlign='center';c.fillText('⚠️',pp.sx,pp.sy-r*.45);const left=e.warn-tt;if(left<.45){const fy=-(left/.45)*pp.sc*160;c.fillStyle='#9aa0a8';c.fillRect(pp.sx-r*.6,pp.sy-r*.5+fy,r*1.2,r*.45);c.fillStyle='#6a7078';c.fillRect(pp.sx-r*.6,pp.sy-r*.1+fy,r*1.2,r*.1)}c.restore()}
        else{const k=(tt-e.warn)/.7;c.save();c.globalAlpha=1-k;c.fillStyle='#9aa0a8';c.fillRect(pp.sx-r*.6,pp.sy-r*.4,r*1.2,r*.4);c.fillStyle='#6a7078';c.fillRect(pp.sx-r*.6,pp.sy-r*.05,r*1.2,r*.08);c.restore()}}})}}
    if(MODE==='tt'&&GH.best&&state!=='menu'){const g=ghostPos(raceT);if(g){const p=proj(g.x,g.y);if(p)list.push({p,draw:(c,pp)=>{const w=26*pp.sc,img=kartSprite(player.ci,0,PAINT),h=w*img.height/img.width;c.save();c.globalAlpha=.42;c.drawImage(img,pp.sx-w/2,pp.sy-h+h*.04,w,h);c.globalAlpha=.9;c.font=`${Math.max(10,w*.28)}px serif`;c.textAlign='center';c.fillText('👻',pp.sx,pp.sy-h-2);c.restore()}})}}},
  overlay(pl){fxDraw();const w=TRK.weather;if(w&&state!=='menu'){ctx.save();
    if(w==='wind'){ctx.font='15px serif';ctx.textAlign='center';for(let i=0;i<12;i++){const x=((i*173+t*(70+i*9))%(W+80))-40,y=48+((i*57)%170)+Math.sin(t*3+i)*14;ctx.globalAlpha=.85;ctx.fillText(i%3?'📄':'🍃',x,y)}}
    else if(w==='dust'){ctx.fillStyle='rgba(214,180,120,.10)';ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(235,205,150,.55)';for(let i=0;i<40;i++){ctx.fillRect(((i*131+t*120)%(W+20))-10,(i*79+t*18)%H,2,1.5)}}
    else if(w==='butterflies'&&!isNight()){ctx.font='16px serif';ctx.textAlign='center';for(let i=0;i<3;i++)ctx.fillText('🦋',W*(.25+.25*i)+Math.sin(t*.7+i*2)*70,70+Math.sin(t*1.3+i)*22)}
    ctx.restore()}
    if(EV.rain>0){ctx.save();ctx.fillStyle='rgba(20,34,70,.20)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(200,220,255,.45)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<70;i++){const x=((i*97.3+t*140)%(W+20))-10,y=((i*61.7+t*620)%(H+30))-15;ctx.moveTo(x,y);ctx.lineTo(x-4,y+13)}ctx.stroke();ctx.restore()}},
  hud(txt){
    const lab=MODE==='champ'&&CH?'🏆 CAMPEONATO '+(CH.i+1)+'/'+CH.tracks.length:MODE==='tt'?'⏱️ CONTRARRELOJ':null;if(lab)txt(lab,8,156,11,'#ffd9a0');
    if(MODE==='tt'&&GH.best&&state==='race'){const g=ghostPos(raceT);if(g){const gp=(GH.lap||0)*WPN+GH.wpi,pp=player.prog,d=Math.round((gp-pp)*14*0.1);txt(d>=0?'👻 va '+d+' m adelante':'👻 vas '+(-d)+' m adelante',8,170,11,d>=0?'#ff8787':'#8ce99a')}else txt('👻 fantasma: '+fmt(GH.best.t/1000),8,170,11,'#ddd')}
    if(EV.rain>0)txt('🌧️ lluvia',W-8,H-22,12,'#9ec5ff','right');
    const sb=scoreRows();if(sb&&state==='race'){txt('📊 PUNTOS',8,186,10,'#ffd9a0');sb.slice(0,3).forEach((r,i)=>txt((i+1)+'° '+String(r[0]).slice(0,10)+' '+r[1],8,198+i*13,10,i?'#ddd':'#ffd43b'))}},
  results(X){const st=ST();st.races=(st.races||0)+1;const pl=player,pos=X.pos;
    if(!P2&&pl.fin){
      if(TRK.cycle)unlock('night');
      if(MODE!=='tt'&&karts.length>1){if(pos===1)unlock('first');if(pos===karts.length)unlock('last')}
      if(EV.hits===0)unlock('clean');if(EV.rainEver)unlock('rain');if(st.races>=10)unlock('ten');
      const key=ghostKey(),old=lsGet(key,null),ms=Math.round(pl.finT*1000);
      if(MODE==='tt'){X.title=old?(ms<old.t?'⏱️ '+fmt(pl.finT)+' · ¡Le ganaste a tu fantasma! 👻':'⏱️ '+fmt(pl.finT)+' · Tu fantasma fue más rápido ('+fmt(old.t/1000)+')'):'⏱️ '+fmt(pl.finT)+' · ¡Fantasma guardado! 👻';if(old&&ms<old.t)unlock('ghost')}
      if(!old||ms<old.t)lsSet(key,{t:ms,d:GH.rec})}
    if(P2)unlock('two');
    if(MODE==='champ'&&CH&&!CH.counted[CH.i]){CH.counted[CH.i]=1;X.r.forEach((k,i)=>{CH.pts[k.ci]=(CH.pts[k.ci]||0)+PTS[i]});X.body.push(`<div class="hint" style="color:#ffd9a0;margin:2px">🏆 Campeonato: +${PTS[Math.min(4,pos-1)]} puntos</div>`);$('bAgain').textContent=CH.i>=CH.tracks.length-1?'🏆 Ver trofeo':'📊 Clasificación'}
    else $('bAgain').textContent=MODE==='tt'?'🔁 Otra vez':'🔁 Otra carrera';
    lsSet('kart_stats',st);
    if(!P2)speak(pos===1&&karts.length>1?'win':pos>=4?'lose':null,true)}
};
/* ---------------------------- arranque ---------------------------- */
loadPensions();updApodo();loadVoices().then(()=>{loadClips()});
applyGfx();
SPEEDK=SET.speed;
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
const TIPS2=['💡 Con la lluvia el kart se resbala: ¡suave con el volante!','💡 La loza avisa con una sombra roja: ¡sal de ahí!','💡 Gánale a tu fantasma en Contrarreloj 👻','💡 Crea la pista de tu pensión en "Elegir pista"','💡 Dos jugadores en el mismo iPhone: ¡cada quien su lado!'];
if(typeof TIPS!=='undefined')TIPS2.forEach(x=>TIPS.push(x));
window.__started=1;window.__boot();
})();
