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
const GFX={alta:{pr:2,bil:true,glow:true,shadow:true,dust:true},media:{pr:1.5,bil:false,glow:true,shadow:true,dust:true},baja:{pr:1,bil:false,glow:false,shadow:false,dust:false}};
const GFX_ORDER=['alta','media','baja'];
let gfxLevel='alta',emaDt=0.016,slowN=0;
function setGfx(level){const c=GFX[level]||GFX.alta;gfxLevel=level;PR=c.pr;Q.bil=c.bil;Q.glow=c.glow;Q.shadow=c.shadow;Q.dust=c.dust;cv.width=Math.round(W0*PR);cv.height=Math.round(H*PR);skyCv=null}
function applyGfx(){setGfx(SET.gfx==='auto'?(gfxLevel&&GFX[gfxLevel]?gfxLevel:'alta'):SET.gfx)}
function autoQuality(dt){if(SET.gfx!=='auto'||state!=='race'||raceT<2.5)return;emaDt=emaDt*0.97+dt*0.03;
  if(emaDt>0.027){slowN++;if(slowN>90){const i=GFX_ORDER.indexOf(gfxLevel);if(i<GFX_ORDER.length-1){setGfx(GFX_ORDER[i+1]);say('⚙️ Bajé un poco los gráficos para que corra suave',2600)}slowN=0;emaDt=0.016}}else slowN=Math.max(0,slowN-2)}
const SEGS=[
 {k:'tilt',t:'🎯 Sensibilidad al inclinar',o:[['Suave',30],['Normal',20],['Sensible',12]]},
 {k:'assist',t:'🧭 Ayuda de dirección',o:[['Sin ayuda',0],['Poca',1],['Mucha',2]]},
 {k:'speed',t:'🚀 Velocidad del juego',o:[['Relajado',0.85],['Normal',1],['Rápido',1.12]]},
 {k:'gfx',t:'🖼️ Gráficos',o:[['Auto','auto'],['Alta','alta'],['Media','media'],['Baja','baja']]},
 {k:'voz',t:'🗣️ Voces y comentarista',o:[['Sí',true],['No',false]]}
];
function buildSettings(){const b=$('setBody');b.innerHTML='';
  for(const row of SEGS){const d=document.createElement('div');d.className='setrow';d.innerHTML='<b>'+row.t+'</b>';const sg=document.createElement('div');sg.className='seg';
    for(const[lab,val]of row.o){const bt=document.createElement('button');bt.className='sec'+(SET[row.k]===val?' on':'');bt.textContent=lab;bt.onclick=()=>{SET[row.k]=val;saveSet();if(row.k==='speed')SPEEDK=val;if(row.k==='gfx'){if(val==='auto'){gfxLevel='alta'}applyGfx()}beep(660,.06);buildSettings()};sg.appendChild(bt)}
    d.appendChild(sg);b.appendChild(d)}
  const u=document.createElement('div');u.className='setrow';u.innerHTML='<b>🔄 ¿Algo raro o no se actualiza?</b>';const ub=document.createElement('button');ub.className='sec';ub.textContent='Actualizar el juego';ub.style.fontSize='14px';ub.onclick=async()=>{try{const rs=await navigator.serviceWorker.getRegistrations();for(const r of rs)await r.unregister();const ks=await caches.keys();for(const k of ks)if(k.startsWith('kart-'))await caches.delete(k)}catch(e){}location.reload()};u.appendChild(ub);b.appendChild(u)}
/* ---------------------------- voces y comentarista ---------------------------- */
const VOX={table:{},buf:{},nat:{},lastT:0,playing:false,clips:false};
async function loadVoices(){try{VOX.table=await(await fetch('voces/voices.json')).json()}catch(e){VOX.table={}}}
function loadClips(){if(!AC||VOX.clips)return;VOX.clips=true;
  for(const k in VOX.table)VOX.table[k].forEach((t,i)=>{fetch('voces/'+k+'_'+i+'.m4a').then(r=>r.arrayBuffer()).then(b=>{try{const pr=AC.decodeAudioData(b,buf=>{VOX.buf[k+'_'+i]=buf},()=>{});if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}}).catch(()=>{})})}
const NV=1.1,natKey=t=>`https://voz.cache/${window.VN?VN.voz:'mujer'}/${NV}/${encodeURIComponent(String(t).replace(/\s+/g,' ').trim().slice(0,600))}`;
function prefetchNatural(){if(!window.VN||!VN.sesionOk||!VN.sesionOk()||!VN.pref||VN.disabled)return;let n=0;for(const k in VOX.table)for(const t of VOX.table[k]){setTimeout(()=>{try{VN.prefetch(t,1.08)}catch(e){}},400*(n++))}}
async function natBuffer(text){if(VOX.nat[text]!==undefined)return VOX.nat[text];VOX.nat[text]=null;
  try{const c=await caches.open('voz-v1'),hit=await c.match(natKey(text));if(!hit)return null;const ab=await(await hit.blob()).arrayBuffer();VOX.nat[text]=await new Promise((res,rej)=>{const pr=AC.decodeAudioData(ab,res,rej);if(pr&&pr.catch)pr.catch(()=>{})})}catch(e){VOX.nat[text]=null}
  return VOX.nat[text]}
function playBuf(b,vol){if(!b||!AC||!master)return;const s=AC.createBufferSource(),g=AC.createGain();g.gain.value=vol||1;s.buffer=b;s.connect(g);g.connect(master);VOX.playing=true;s.onended=()=>{VOX.playing=false};s.start()}
function speak(key,force){if(!key||!SET.voz||muted||!AC||!VOX.table[key])return;const now=performance.now();if(!force&&(VOX.playing||now-VOX.lastT<2200))return;
  const lst=VOX.table[key],i=(Math.random()*lst.length)|0;VOX.lastT=now;playVox(key,i,lst[i])}
async function playVox(key,i,text){if(VOX.nat[text])return playBuf(VOX.nat[text],1.05);
  natBuffer(text);   // la próxima vez sale con la voz natural
  playBuf(VOX.buf[key+'_'+i],1.15)}
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
 {id:'ten',e:'🎮',n:'Veterano de obra',d:'Corre 10 carreras'}
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
const EV={list:[],timer:13,rain:0,rainEver:false,hits:0,narT:18};
function evSpawn(){const r=Math.random(),ref=player;if(!ref)return;
  if(r<0.38){const w=WP[(ref.wpi+26+((Math.random()*14)|0))%WPN];EV.list.push({k:'barrow',x:w.x-w.nx*120,y:w.y-w.ny*120,vx:w.nx*100,vy:w.ny*100,life:3.2,hit:{}});say('🛒 ¡Ahí va la carretilla loca!',2200);speak('barrow',true)}
  else if(r<0.78){const w=WP[(ref.wpi+30+((Math.random()*10)|0))%WPN],o=rnd(-48,48);EV.list.push({k:'slab',x:w.x+w.nx*o,y:w.y+w.ny*o,t:0,warn:1.8,done:false,seen:false});say('⚠️ ¡Cuidado, cae la loza!',2200);speak('slab',true)}
  else if(EV.rain<=0){EV.rain=15;EV.rainEver=true;GRIPK=0.8;say('🌧️ ¡Aguas! Se mojó el asfalto',2600);speak('rain',true);noiseHit(.5,.12,2500)}}
function evTick(dt){
  if(EV.rain>0){EV.rain-=dt;if(EV.rain<=0){GRIPK=1;say('☀️ Salió el sol, ya se secó',2000)}}
  if(MODE!=='tt'){EV.timer-=dt;if(EV.timer<=0){evSpawn();EV.timer=rnd(14,22)}}
  for(const e of EV.list){
    if(e.k==='barrow'){e.life-=dt;e.x+=e.vx*dt;e.y+=e.vy*dt;for(const k of karts){if(e.hit[k.slot]||k.fin)continue;if((k.x-e.x)**2+(k.y-e.y)**2<17*17){e.hit[k.slot]=1;hit(k)}}}
    else if(e.k==='slab'){e.t+=dt;if(!e.done&&e.t>=e.warn){e.done=true;shake=Math.max(shake,.25);SFX.hit();
        for(const k of karts){const d2=(k.x-e.x)**2+(k.y-e.y)**2;if(d2<30*30)hit(k);else if(k.isPlayer&&d2<95*95)e.near=true}
        for(let i=0;i<10;i++)parts.push({x:e.x+rnd(-12,12),y:e.y+rnd(-12,12),z:rnd(1,6),vz:rnd(20,50),life:.6,max:.6,r:rnd(3,6),k:'dust',c:'170,170,176'});
        if(e.near)unlock('slab')}}}
  EV.list=EV.list.filter(e=>e.k==='barrow'?e.life>0:e.t<e.warn+.7)}
/* ---------------------------- pistas de tu pensión ---------------------------- */
function rng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function okTrack(pts){const w=resample(catmull(pts,16),14),n=w.length;
  for(const p of w)if(p[0]<170||p[0]>1880||p[1]<170||p[1]>1880)return false;
  const L=n*14;if(L<2600||L>6400)return false;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const gap=Math.min(j-i,n-(j-i));if(gap<32)continue;if((w[i][0]-w[j][0])**2+(w[i][1]-w[j][1])**2<270*270)return false}
  for(let i=0;i<n;i++){const a=w[i],b=w[(i+5)%n],c=w[(i+10)%n];const ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),ac=Math.hypot(c[0]-a[0],c[1]-a[1]);const cr=Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]));if(ab*bc*ac/(2*cr+1e-6)<95)return false}
  return true}
function genPts(seed){for(let att=0;att<200;att++){const R=rng(seed+att*7919),n=9+((R()*4)|0),pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2+(R()-.5)*.35,rr=.5+R()*.5;pts.push([1024+Math.cos(a)*rr*830,1024+Math.sin(a)*rr*830*(.8+R()*.2)])}if(okTrack(pts))return pts}
  return THEMES()[0].pts.map(p=>p.slice())}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16).padStart(8,'0')}
function mkCustom(c){const th=THEMES()[c.theme%THEMES().length];return Object.assign({},th,{id:c.id,n:c.n,d:'Tu pensión · '+th.n,pts:genPts(c.seed),pension:c.n,custom:true,cseed:c.seed})}
function loadPensions(){for(let i=TRACKS.length-1;i>=0;i--)if(TRACKS[i].custom)TRACKS.splice(i,1);for(const c of lsGet('kart_pens',[]).slice(0,5))TRACKS.push(mkCustom(c))}
let PEN={seed:1,theme:0};
function drawPenPrev(){const cn=$('penCv'),g=cn.getContext('2d'),th=THEMES()[PEN.theme];const pts=catmull(genPts(PEN.seed),10);g.fillStyle=th.grass[0];g.fillRect(0,0,240,140);let a=1e9,b=1e9,c2=-1e9,e=-1e9;for(const p of pts){a=Math.min(a,p[0]);c2=Math.max(c2,p[0]);b=Math.min(b,p[1]);e=Math.max(e,p[1])}
  const sc=Math.min(210/(c2-a),118/(e-b)),ox=120-(a+c2)/2*sc,oy=70-(b+e)/2*sc;g.lineJoin='round';const pa=()=>{g.beginPath();pts.forEach((p,j)=>{const x=p[0]*sc+ox,y=p[1]*sc+oy;j?g.lineTo(x,y):g.moveTo(x,y)});g.closePath()};pa();g.lineWidth=12;g.strokeStyle=th.kerb;g.stroke();pa();g.lineWidth=8;g.strokeStyle=th.road;g.stroke()}
function openPension(){PEN={seed:(Math.random()*1e6)|0,theme:0};$('penName').value='';const sg=$('penTheme');sg.innerHTML='';THEMES().forEach((t,i)=>{const b=document.createElement('button');b.className='sec'+(i===PEN.theme?' on':'');b.textContent=t.n.replace('Circuito ','');b.onclick=()=>{PEN.theme=i;openPensionTheme()};sg.appendChild(b)});drawPenPrev();showScreen('pension')}
function openPensionTheme(){[...$('penTheme').children].forEach((b,i)=>b.classList.toggle('on',i===PEN.theme));drawPenPrev()}
$('penDice').onclick=()=>{PEN.seed=(Math.random()*1e6)|0;drawPenPrev()};
$('penCancel').onclick=()=>{buildTracks();showScreen('tracks')};
$('penOk').onclick=()=>{const n=($('penName').value||'').trim().slice(0,18);if(n.length<2){alert('Ponle nombre a tu pensión 🏠');return}
  const list=lsGet('kart_pens',[]);if(list.length>=5){alert('Máximo 5 pistas. Borra una con la ✖');return}
  const c={id:'p'+hashStr(n+PEN.seed+PEN.theme).slice(0,8),n,theme:PEN.theme,seed:PEN.seed};list.push(c);lsSet('kart_pens',list);loadPensions();unlock('pension');buildTracks();showScreen('tracks')};
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
    if(t.custom){const x=document.createElement('span');x.className='x';x.textContent='✖';x.style.cssText='position:absolute;top:2px;right:6px;color:#ff8787;font:700 15px system-ui;padding:3px 6px';x.onclick=ev=>{ev.stopPropagation();if(!confirm('¿Borrar la pista "'+t.n+'"?'))return;lsSet('kart_pens',lsGet('kart_pens',[]).filter(p=>p.id!==t.id));loadPensions();buildTracks()};d.appendChild(x)}
    d.style.position='relative';d.onclick=()=>pickTrack(i);row.appendChild(d)});
  if(lsGet('kart_pens',[]).length<5){const d=document.createElement('div');d.className='tk';d.style.justifyContent='center';d.innerHTML='<div style="font-size:44px;line-height:1">🏠</div><b>Tu pensión</b><small>Crea una pista con su nombre</small>';d.onclick=openPension;row.appendChild(d)}}
/* ---------------------------- campeonato ---------------------------- */
function startChamp(){MODE='champ';P2=false;CH={i:0,tracks:TRACKS.filter(t=>!t.custom).map(t=>TRACKS.indexOf(t)),pts:{},others:null,counted:{}};nextChampRace()}
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
window.V4={
  gfx:()=>gfxLevel,
  prepTrack(trk){if(!SPR.mkSign)return;const pn=trk.pension?trk.pension.toUpperCase():'';const extra=pn?[[pn,'¡TU PENSIÓN FAVORITA!'],[pn,'DEPA LIBRE · ¡PREGUNTE!'],[pn,'AQUÍ SE VIVE BIEN'],['BIENVENIDO A',pn]]:[];
    if(SPR._signKey!==pn){SPR.signs=SIGN_TXT.concat(extra,extra,extra).map(SPR.mkSign);SPR._signKey=pn}},
  raceStart(){EV.list=[];EV.timer=13;EV.rain=0;EV.rainEver=false;EV.hits=0;EV.narT=rnd(16,24);GRIPK=1;SPEEDK=SET.speed;applyGfx();
    GH.rec=[];GH.tNext=0;GH.wpi=Math.max(0,WPN-3);GH.lap=0;GH.best=lsGet(ghostKey(),null);emaDt=0.016;slowN=0;loadClips()},
  go(){speak('go',true)},
  speak,
  tick(dt){if(state!=='race'&&state!=='finish')return;
    if(state==='race'){evTick(dt);autoQuality(dt);
      EV.narT-=dt;if(EV.narT<=0&&VOX.table.nar){EV.narT=rnd(16,26);const l=VOX.table.nar,i=(Math.random()*l.length)|0;say('🎙️ '+l[i],3000);if(SET.voz&&!VOX.playing&&!muted&&AC){VOX.lastT=performance.now();playVox('nar',i,l[i])}}
      if(!P2&&raceT>=GH.tNext){GH.rec.push(Math.round(player.x),Math.round(player.y),Math.round(player.a*100));GH.tNext+=0.1}
      if(MODE==='tt'&&GH.best){const g=ghostPos(raceT);if(g){let best=GH.wpi,bd=1e12;for(let o=-3;o<=10;o++){const i=(GH.wpi+o+WPN)%WPN,w=WP[i],d=(w.x-g.x)**2+(w.y-g.y)**2;if(d<bd){bd=d;best=i}}if(best!==GH.wpi){if(GH.wpi>WPN*0.8&&best<WPN*0.2)GH.lap=(GH.lap||0)+1;GH.wpi=best}}}}},
  ev(name,k,x){const st=ST();
    if(name==='hit')EV.hits++;
    else if(name==='coin'){if(k.coins>=20)unlock('coins20')}
    else if(name==='cement'){st.cement=(st.cement||0)+1;lsSet('kart_stats',st);if(st.cement>=5)unlock('cement5')}
    else if(name==='use'&&x==='taco'){st.tacos=(st.tacos||0)+1;lsSet('kart_stats',st);if(st.tacos>=3)unlock('tacos3')}
    else if(name==='shothit'){const sh=k,tg=x;if(sh&&sh.kind==='rent'&&tg&&tg.prog>=Math.max(...karts.map(q=>q.prog))-0.5)unlock('rentist')}
    else if(name==='turbomax')unlock('turbo')},
  addSprites(list){
    for(const e of EV.list){const p=proj(e.x,e.y);if(!p)continue;
      if(e.k==='barrow')list.push({p,img:SPR.wheelbarrow,wu:30,sh:true});
      else{const tt=e.t;list.push({p,draw:(c,pp)=>{const r=30*pp.sc;
        if(tt<e.warn){const a=.35+.3*Math.sin(t*14);c.save();c.fillStyle=`rgba(230,40,40,${a})`;c.beginPath();c.ellipse(pp.sx,pp.sy,r,r*.22,0,0,TAU);c.fill();c.strokeStyle='#ff3030';c.lineWidth=2;c.stroke();c.font=`${Math.max(10,r*.7)}px serif`;c.textAlign='center';c.fillText('⚠️',pp.sx,pp.sy-r*.45);const left=e.warn-tt;if(left<.45){const fy=-(left/.45)*pp.sc*160;c.fillStyle='#9aa0a8';c.fillRect(pp.sx-r*.6,pp.sy-r*.5+fy,r*1.2,r*.45);c.fillStyle='#6a7078';c.fillRect(pp.sx-r*.6,pp.sy-r*.1+fy,r*1.2,r*.1)}c.restore()}
        else{const k=(tt-e.warn)/.7;c.save();c.globalAlpha=1-k;c.fillStyle='#9aa0a8';c.fillRect(pp.sx-r*.6,pp.sy-r*.4,r*1.2,r*.4);c.fillStyle='#6a7078';c.fillRect(pp.sx-r*.6,pp.sy-r*.05,r*1.2,r*.08);c.restore()}}})}}
    if(MODE==='tt'&&GH.best&&state!=='menu'){const g=ghostPos(raceT);if(g){const p=proj(g.x,g.y);if(p)list.push({p,draw:(c,pp)=>{const w=26*pp.sc,img=kartSprite(player.ci,0,PAINT),h=w*img.height/img.width;c.save();c.globalAlpha=.42;c.drawImage(img,pp.sx-w/2,pp.sy-h+h*.04,w,h);c.globalAlpha=.9;c.font=`${Math.max(10,w*.28)}px serif`;c.textAlign='center';c.fillText('👻',pp.sx,pp.sy-h-2);c.restore()}})}}},
  overlay(pl){if(EV.rain>0){ctx.save();ctx.fillStyle='rgba(20,34,70,.20)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(200,220,255,.45)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<70;i++){const x=((i*97.3+t*140)%(W+20))-10,y=((i*61.7+t*620)%(H+30))-15;ctx.moveTo(x,y);ctx.lineTo(x-4,y+13)}ctx.stroke();ctx.restore()}},
  hud(txt){
    const lab=MODE==='champ'&&CH?'🏆 CAMPEONATO '+(CH.i+1)+'/'+CH.tracks.length:MODE==='tt'?'⏱️ CONTRARRELOJ':null;if(lab)txt(lab,8,156,11,'#ffd9a0');
    if(MODE==='tt'&&GH.best&&state==='race'){const g=ghostPos(raceT);if(g){const gp=(GH.lap||0)*WPN+GH.wpi,pp=player.prog,d=Math.round((gp-pp)*14*0.1);txt(d>=0?'👻 va '+d+' m adelante':'👻 vas '+(-d)+' m adelante',8,170,11,d>=0?'#ff8787':'#8ce99a')}else txt('👻 fantasma: '+fmt(GH.best.t/1000),8,170,11,'#ddd')}
    if(EV.rain>0)txt('🌧️ lluvia',W-8,H-22,12,'#9ec5ff','right')},
  results(X){const st=ST();st.races=(st.races||0)+1;const pl=player,pos=X.pos;
    if(!P2&&pl.fin){
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
if(SET.gfx!=='auto')setGfx(SET.gfx);else setGfx('alta');
SPEEDK=SET.speed;
if('serviceWorker' in navigator&&location.protocol.startsWith('http')){addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}))}
const TIPS2=['💡 Con la lluvia el kart se resbala: ¡suave con el volante!','💡 La loza avisa con una sombra roja: ¡sal de ahí!','💡 Gánale a tu fantasma en Contrarreloj 👻','💡 Crea la pista de tu pensión en "Elegir pista"','💡 Dos jugadores en el mismo iPhone: ¡cada quien su lado!'];
if(typeof TIPS!=='undefined')TIPS2.forEach(x=>TIPS.push(x));
window.__started=1;window.__boot();
})();
