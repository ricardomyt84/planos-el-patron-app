'use strict';
/* =====================================================================
   EL PATRÓN KART · modo en línea (varios celulares), torneos, equipos,
   eliminación, contraseña y estadísticas.
   Transporte: Supabase Realtime (broadcast). Con ?net=mock se usa
   BroadcastChannel (solo para pruebas entre pestañas).
   ===================================================================== */
(function(){
const SBURL='https://ldgsmzplpdnxdqqphgtm.supabase.co',SBKEY='sb_publishable_vQkO_JZaEnO311i_9SrsYw_jYD_jE_4';
const PTS8=[10,8,6,5,4,3,2,1],MAXP=8,ALIVE_MS=7000;
const TEAMS=['🏠 Inquilinos','🧱 Albañiles'];
const N=window.NETG={on:false,host:false,spectator:false,code:'',pass:'',me:{id:'',name:'',ci:0,pc:null,pl:''},peers:new Map(),lob:{mode:'race',ti:0,tracks:[],pts:{},tp:{0:0,1:0},teams:false,long:false,out:[],st:'lobby'}};
const rid=()=>Math.random().toString(36).slice(2,8)+Math.random().toString(36).slice(2,6);
const num=(v,d=0)=>Number.isFinite(+v)?+v:d;
const clean=s=>String(s==null?'':s).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,12);
const hash8=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36).slice(0,6)};
const mock=/[?&]net=mock/.test(location.search);
let tr=null,timers=[],racing=false,order=[],lastRes=null,resRecv=false,holdSince=0,firstFinRaceT=-1,sendAcc=0,resSent=false,hostSeen=0,specN=-1,STAT={},statSeen={};
{const q=/[?&]id=([a-z0-9]{3,16})/i.exec(location.search);let id=q?q[1]:lsGet('kart_net_id','');if(!id){id=rid();lsSet('kart_net_id',id)}N.me.id=id}
/* ---------------- transporte ---------------- */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('No cargó '+src));document.head.appendChild(s)})}
async function openTransport(chan,onMsg){
  if(mock){const bc=new BroadcastChannel('kartmock-'+chan);bc.onmessage=e=>onMsg(e.data);return{send:m=>bc.postMessage(m),close:()=>bc.close()}}
  if(!window.supabase)await loadScript('vendor/supabase.js');
  const sb=window.supabase.createClient(SBURL,SBKEY,{realtime:{params:{eventsPerSecond:30}}});
  const ch=sb.channel('kart-'+chan,{config:{broadcast:{self:false,ack:false}}});
  ch.on('broadcast',{event:'m'},p=>{try{onMsg(p.payload)}catch(e){}});
  await new Promise((res,rej)=>{let done=false;const to=setTimeout(()=>{if(!done){done=true;rej(new Error('TIMED_OUT'))}},12000);
    ch.subscribe((st,err)=>{if(st==='SUBSCRIBED'){if(!done){done=true;clearTimeout(to);res()}}else if(st==='CHANNEL_ERROR'||st==='TIMED_OUT'||st==='CLOSED'){if(!done){done=true;clearTimeout(to);rej(new Error(st+(err&&err.message?': '+err.message:'')))}}})});
  return{send:m=>{try{ch.send({type:'broadcast',event:'m',payload:m})}catch(e){}},close:()=>{try{sb.removeChannel(ch)}catch(e){}}}}
function send(m){if(tr){m.i=N.me.id;try{tr.send(m)}catch(e){}}}
N.send=send;
/* ---------------- sala ---------------- */
const alive=()=>[...N.peers.values()].filter(p=>Date.now()-p.seen<ALIVE_MS);
const kartById=id=>karts.find(k=>k.rid===id);
const nameOf=id=>id===N.me.id?N.me.name:(N.peers.get(id)||{}).name||'Jugador';
const THEMESIDX=t=>TRACKS.filter(x=>!x.custom).findIndex(x=>x.grass[0]===t.grass[0]);
const trackDesc=t=>t.custom?{id:t.id,n:t.n,theme:Math.max(0,THEMESIDX(t)),seed:t.cseed,p:t.cpts||null}:{id:t.id};
function resolveTrack(d){let t=TRACKS.find(x=>x.id===d.id);if(t)return t;if(window.V4&&V4.mkCustom&&(d.seed!=null||Array.isArray(d.p))){const c={id:String(d.id).slice(0,24),n:clean(d.n)||'Pista',theme:num(d.theme),seed:num(d.seed)};if(Array.isArray(d.p))c.pts=d.p.slice(0,24).map(q=>[num(q[0]),num(q[1])]);t=V4.mkCustom(c);TRACKS.push(t);return t}return TRACKS[0]}
const tracksFor=(mode,long)=>mode==='race'?[N.lob.tracks[0]||trackDesc(TRACKS[0])]:TRACKS.filter(t=>!t.custom&&(long||!t.extra)).map(trackDesc);
const teamOf=id=>N.lob.teams?Math.max(0,order.indexOf(id))%2:-1;
function hello(){send({t:'hi',n:N.me.name,c:N.me.ci,pc:N.me.pc,pl:N.me.pl,h:N.host?1:0})}
function sendLobby(){if(!N.host)return;const L=N.lob;send({t:'lobby',mode:L.mode,tr:L.tracks,ti:L.ti,pts:L.pts,tp:L.tp,teams:L.teams?1:0,long:L.long?1:0,out:L.out,st:racing?'racing':'lobby'})}
function setDefaultLobby(){N.lob={mode:'race',ti:0,tracks:[trackDesc(TRACKS[0])],pts:{},tp:{0:0,1:0},teams:false,long:false,out:[],st:'lobby'}}
async function connect(code,host,pass){
  N.code=code;N.host=host;N.pass=pass||'';N.peers.clear();hostSeen=Date.now();
  if(host)setDefaultLobby();
  tr=await openTransport(code+(N.pass?'-'+hash8(N.pass):''),onMsg);N.on=true;hello();if(host)sendLobby();
  timers.push(setInterval(()=>{hello();sendLobby();prune();renderLobbyIfOpen()},2000));
}
function prune(){const now=Date.now();for(const[id,p]of N.peers)if(now-p.seen>ALIVE_MS){N.peers.delete(id);const k=kartById(id);if(k){const i=karts.indexOf(k);if(i>=0)karts.splice(i,1)}}
  if(!N.host&&now-hostSeen>ALIVE_MS+2500){const ids=[N.me.id,...alive().map(p=>p.id)].sort();if(ids[0]===N.me.id){N.host=true;if(!N.lob.tracks.length)setDefaultLobby();renderLobbyIfOpen()}}}
function leave(){try{send({t:'bye'})}catch(e){}for(const t of timers)clearInterval(t);timers=[];if(tr){try{tr.close()}catch(e){}}tr=null;N.on=false;N.host=false;N.spectator=false;N.peers.clear();racing=false;MODE='race'}
N.leave=leave;
/* ---------------- mensajes ---------------- */
function onMsg(m){
  if(!m||typeof m!=='object'||typeof m.t!=='string'||!m.i||m.i===N.me.id)return;
  const id=String(m.i).slice(0,24);
  switch(m.t){
    case'hi':{let p=N.peers.get(id);if(!p){if(N.peers.size>=MAXP+1)return;p={id,first:Date.now(),net:null};N.peers.set(id,p)}
      p.seen=Date.now();p.name=clean(m.n)||'Jugador';p.ci=Math.max(0,Math.min(BASE-1,num(m.c)|0));p.pc=(typeof m.pc==='string'&&/^#[0-9a-f]{6}$/i.test(m.pc))?m.pc:null;p.pl=typeof m.pl==='string'?m.pl.slice(0,4):'';p.host=!!m.h;if(m.h)hostSeen=Date.now();if(N.host&&p.first>Date.now()-300){hello();sendLobby()}renderLobbyIfOpen();break}
    case'lobby':{const p=N.peers.get(id);if(p){p.seen=Date.now();p.host=true}hostSeen=Date.now();if(N.host&&id<N.me.id){N.host=false}
      const L=N.lob;L.mode=['torneo','elim'].includes(m.mode)?m.mode:'race';L.tracks=Array.isArray(m.tr)?m.tr.slice(0,8).map(d=>({id:String(d.id||'').slice(0,24),n:clean(d.n),theme:num(d.theme),seed:d.seed==null?null:num(d.seed),p:Array.isArray(d.p)?d.p.slice(0,24):null})):[];L.ti=num(m.ti)|0;L.pts=(m.pts&&typeof m.pts==='object')?m.pts:{};L.tp=(m.tp&&typeof m.tp==='object')?m.tp:{0:0,1:0};L.teams=!!m.teams;L.long=!!m.long;L.out=Array.isArray(m.out)?m.out.slice(0,8).map(x=>String(x).slice(0,24)):[];renderLobbyIfOpen();break}
    case'start':{if(N.on&&(!N.host||m.i<N.me.id))startLocal(m);break}
    case'tolobby':{if(N.on){racing=false;resetTournament();showLobby()}break}
    case's':{const p=N.peers.get(id);const k=kartById(id);if(!k||!Array.isArray(m.p))break;const a=m.p;
      k.net={x:num(a[0]),y:num(a[1]),a:num(a[2])/100,v:num(a[3]),l:Math.max(0,num(a[4])|0),w:Math.max(0,Math.min(WPN-1,num(a[5])|0)),f:num(a[6])|0,t:performance.now()};
      if(!k._seen){k._seen=1;k.x=k.net.x;k.y=k.net.y;k.a=k.net.a}if(p)p.seen=Date.now();break}
    case'hz':{if(!racing||!Array.isArray(m.p))break;hazards.push({x:num(m.p[0]),y:num(m.p[1]),life:20,kind:m.k==='cement'?'cement':'brick',id:String(m.d||'').slice(0,12)});break}
    case'hzx':{for(const h of hazards)if(h.id&&h.id===m.d)h.dead=true;break}
    case'sh':{if(!racing||!Array.isArray(m.p))break;shots.push({x:num(m.p[0]),y:num(m.p[1]),a:num(m.p[2])/100,tg:kartById(String(m.g||'')),life:6,owner:kartById(id),kind:m.k==='rent'?'rent':'wrench',spd:num(m.v,380),id:String(m.d||'').slice(0,12)});break}
    case'shx':{for(const s of shots)if(s.id&&s.id===m.d)s.life=0;break}
    case'ev':{if(racing&&m.d&&window.V4&&V4.evFrom)V4.evFrom({k:String(m.d.k),idx:num(m.d.idx)|0,o:num(m.d.o)});break}
    case'fin':{const k=kartById(id);if(k){k.fin=true;k.finT=num(m.ft);if(firstFinRaceT<0)firstFinRaceT=raceT}break}
    case'stat':{const key=id+':'+num(m.r);if(statSeen[key])break;statSeen[key]=1;const S=STAT[id]||(STAT[id]={c:0,m:0,h:0});S.c+=num(m.c);S.m+=num(m.m);S.h+=num(m.h);renderStats();break}
    case'res':{onRes(m);break}
    case'bye':{N.peers.delete(id);const k=kartById(id);if(k){const i=karts.indexOf(k);if(i>=0)karts.splice(i,1)}renderLobbyIfOpen();break}
  }}
function resetTournament(){const L=N.lob;L.pts={};L.tp={0:0,1:0};L.out=[];L.ti=0;STAT={};statSeen={};N.spectator=false}
/* ---------------- carrera ---------------- */
function activeIds(){return[N.me.id,...alive().sort((a,b)=>a.first-b.first).map(p=>p.id)].filter(id=>!N.lob.out.includes(id)).slice(0,MAXP)}
function hostStart(){if(!N.host)return;const L=N.lob;resetTournament();if(!L.tracks.length)L.tracks=tracksFor(L.mode,L.long);
  const ids=activeIds(),d=L.tracks[0]||trackDesc(TRACKS[0]);
  const msg={t:'start',trk:d,order:ids,ti:0,mode:L.mode,pts:{},tp:{0:0,1:0},teams:L.teams?1:0,out:[]};send(msg);startLocal(msg)}
function startLocal(m){
  racing=true;resRecv=false;resSent=false;lastRes=null;firstFinRaceT=-1;specN=-1;
  order=(Array.isArray(m.order)?m.order:[]).map(x=>String(x).slice(0,24)).slice(0,MAXP);
  const L=N.lob;L.ti=num(m.ti)|0;L.mode=['torneo','elim'].includes(m.mode)?m.mode:'race';L.pts=(m.pts&&typeof m.pts==='object')?m.pts:{};L.tp=(m.tp&&typeof m.tp==='object')?m.tp:{0:0,1:0};L.teams=!!m.teams;L.out=Array.isArray(m.out)?m.out.slice(0,8).map(x=>String(x).slice(0,24)):[];
  if(L.ti===0){STAT={};statSeen={}}
  N.spectator=!order.includes(N.me.id);
  const d=m.trk||{id:'colonia'},trk=resolveTrack({id:String(d.id||'colonia'),n:d.n,theme:d.theme,seed:d.seed,p:d.p});
  MODE='online';P2=false;showScreen(null);
  setTimeout(()=>{buildTrack(trk);state='menu';karts=[];startRace()},30)}
N.makeKarts=function(){const ks=[];order.forEach((id,i)=>{const me=id===N.me.id,info=me?N.me:(N.peers.get(id)||{name:'Jugador',ci:0});
  const k=newKart(Math.max(0,Math.min(BASE-1,info.ci|0)),i,me);k.rid=id;k.team=N.lob.teams?i%2:-1;
  if(!me){k.remote=true;k.ai=false;k.human=false;k.name=info.name;k.paint=(info.pc||info.pl)?{c:info.pc||null,l:info.pl||''}:null}
  ks.push(k)});return ks};
N.remoteStep=function(k,dt){const n=k.net;if(!n)return;const age=Math.min(.45,(performance.now()-n.t)/1000);
  const tx=n.x+Math.cos(n.a)*n.v*age,ty=n.y+Math.sin(n.a)*n.v*age,f=Math.min(1,dt*9),pa=k.a;
  k.x+=(tx-k.x)*f;k.y+=(ty-k.y)*f;k.a+=angDiff(k.a,n.a)*f;k.spd=n.v;
  const turn=angDiff(pa,k.a)/Math.max(dt,1e-3);k.lean=turn>0.6?1:turn<-0.6?-1:0;
  k.boost=(n.f&1)?0.2:0;k.star=(n.f&2)?1:0;k.spin=(n.f&4)?0.3:0;if(k.spin>0)k.spinA+=dt*13;k.drift=(n.f&8)?1:0;
  if(n.f&32){k.air=.4;k.airT=Math.min(.85,(k.airT||0)+dt)}else{k.air=0;k.airT=0}
  k.wpi=n.w;k.lap=n.l;if(n.f&16)k.fin=true;k.prog=progressOf(k)};
const flags=k=>(k.boost>0?1:0)|(k.star>0?2:0)|(k.spin>0?4:0)|(k.drift?8:0)|(k.fin?16:0)|(k.air>0?32:0);
N.tick=function(dt){if(!N.on||!racing||!player)return;
  if(N.spectator){const s=(performance.now()/1500)|0;if(s!==specN){specN=s;const L=karts.slice().sort((a,b)=>b.prog-a.prog)[0];if(L)player=L}}
  else{const rate=alive().length>4?6:8;sendAcc+=dt;if(sendAcc>=1/rate){sendAcc=0;const k=player;send({t:'s',p:[Math.round(k.x),Math.round(k.y),Math.round(k.a*100),Math.round(k.spd),k.lap,k.wpi,flags(k)]})}}
  if(N.host&&!resSent&&state!=='count'){const hum=karts.filter(k=>k.rid),fin=hum.filter(k=>k.fin);
    if(hum.length&&(fin.length===hum.length||(firstFinRaceT>=0&&raceT-firstFinRaceT>14)||raceT>420))hostResults()}};
N.finish=function(k){if(!N.on)return;holdSince=performance.now();if(firstFinRaceT<0)firstFinRaceT=raceT;send({t:'fin',ft:k.finT})};
N.hold=function(){return N.on&&racing&&!resRecv&&(performance.now()-holdSince<38000)};
N.gone=function(kind,o){if(!o||!o.id)return;send({t:kind,d:o.id})};
N.teamLabel=()=>N.lob.teams&&player&&player.team>=0?TEAMS[player.team]:'';
N.standings=()=>{const L=N.lob;if(L.teams)return[[TEAMS[0],L.tp[0]||0],[TEAMS[1],L.tp[1]||0]].sort((a,b)=>b[1]-a[1]);return Object.keys(L.pts).map(id=>[nameOf(id),L.pts[id]]).sort((a,b)=>b[1]-a[1])};
function hostResults(){resSent=true;const L=N.lob;
  const hum=karts.filter(k=>k.rid),fin=hum.filter(k=>k.fin).sort((a,b)=>a.finT-b.finT),rest=hum.filter(k=>!k.fin).sort((a,b)=>b.prog-a.prog);
  const rank=fin.concat(rest).map(k=>({id:k.rid,ft:k.fin?+k.finT.toFixed(2):0,n:k.rid===N.me.id?N.me.name:k.name}));
  const pts=Object.assign({},L.pts),tp={0:L.tp[0]||0,1:L.tp[1]||0};
  rank.forEach((r,i)=>{const p=PTS8[i]||0;pts[r.id]=(pts[r.id]||0)+p;if(L.teams)tp[Math.max(0,order.indexOf(r.id))%2]+=p});
  let elim='',out=L.out.slice();
  if(L.mode==='elim'&&rank.length>1){elim=rank[rank.length-1].id;out.push(elim)}
  const lastTrack=L.ti>=Math.max(0,L.tracks.length-1);
  const last=L.mode==='race'||lastTrack||(L.mode==='elim'&&rank.length-1<=1);
  const msg={t:'res',rank,pts,tp,ti:L.ti,last,mode:L.mode,teams:L.teams?1:0,elim,out};send(msg);onRes(Object.assign({i:N.me.id},msg))}
function onRes(m){if(resRecv)return;resRecv=true;const L=N.lob;
  lastRes={rank:(m.rank||[]).slice(0,MAXP).map(r=>({id:String(r.id).slice(0,24),ft:num(r.ft),n:clean(r.n)})),pts:m.pts||{},tp:m.tp||{0:0,1:0},last:!!m.last,mode:['torneo','elim'].includes(m.mode)?m.mode:'race',teams:!!m.teams,elim:String(m.elim||'').slice(0,24),out:Array.isArray(m.out)?m.out.slice(0,8).map(x=>String(x).slice(0,24)):[],ti:num(m.ti)|0};
  L.pts=lastRes.pts;L.tp=lastRes.tp;L.out=lastRes.out;
  if(!N.spectator&&window.V4&&V4.raceStats){const s=V4.raceStats();const S=STAT[N.me.id]||(STAT[N.me.id]={c:0,m:0,h:0});S.c+=s.c;S.m+=s.m;S.h+=s.h;statSeen[N.me.id+':'+lastRes.ti]=1;send({t:'stat',r:lastRes.ti,c:s.c,m:s.m,h:s.h})}
  if(state!=='results'){state='results';showResults()}}
/* ---------------- estadísticas de la noche ---------------- */
function renderStats(){const el=$('netStats');if(!el)return;const ids=Object.keys(STAT);if(!ids.length){el.innerHTML='';return}
  const best=k=>ids.reduce((b,id)=>STAT[id][k]>(b?STAT[b][k]:0)?id:b,null);const rows=[];
  const c=best('c'),m=best('m'),h=best('h');
  if(c&&STAT[c].c>0)rows.push('💰 Más renta cobrada: <b>'+esc(nameOf(c))+'</b> ($'+(STAT[c].c*500).toLocaleString('en-US')+')');
  if(m&&STAT[m].m>0)rows.push('🪣 Maestro del cemento fresco: <b>'+esc(nameOf(m))+'</b> ('+STAT[m].m+' veces)');
  if(h&&STAT[h].h>0)rows.push('🤕 El más golpeado: <b>'+esc(nameOf(h))+'</b> ('+STAT[h].h+' golpes)');
  el.innerHTML=rows.length?'<div style="color:#ffd9a0;margin-top:4px">🌙 <b>Estadísticas de la noche</b></div>'+rows.map(r=>'<div>'+r+'</div>').join(''):''}
/* resultados en pantalla */
N.results=function(X){const me=N.me.id,R=lastRes;
  if(!R){X.title='🏁 Carrera terminada';return}
  const pos=R.rank.findIndex(r=>r.id===me)+1,tor=R.mode!=='race';
  const showPts=tor;
  const rows=R.rank.map((r,i)=>{const tm=R.teams?(Math.max(0,order.indexOf(r.id))%2):-1;return`<tr class="${r.id===me?'me':''}"><td>${i+1}°</td><td>${tm>=0?(tm?'🧱 ':'🏠 '):''}${esc(r.id===me?N.me.name:(r.n||nameOf(r.id)))}</td><td>${r.ft?fmt(r.ft):'—'}</td>${showPts?`<td>${R.pts[r.id]||0} pts</td>`:''}</tr>`}).join('');
  X.body.length=0;X.body.push('<table>'+rows+'</table>');
  const myTeam=R.teams?(Math.max(0,order.indexOf(me))%2):-1;
  if(R.teams){const rt=[0,0];R.rank.forEach((r,i)=>{rt[Math.max(0,order.indexOf(r.id))%2]+=PTS8[i]||0});const win=rt[0]===rt[1]?-1:(rt[0]>rt[1]?0:1);
    X.body.push(`<div class="hint" style="color:#fff;margin:2px">${TEAMS[0]}: <b>${rt[0]}</b> esta carrera · ${R.tp[0]||0} total &nbsp;|&nbsp; ${TEAMS[1]}: <b>${rt[1]}</b> esta carrera · ${R.tp[1]||0} total</div>`);
    if(win>=0&&win===myTeam&&window.V4&&!N.spectator)setTimeout(()=>{try{V4.unlock('team')}catch(e){}},300)}
  if(R.mode==='elim'&&R.elim)X.body.push(`<div class="hint" style="color:#ff8787;margin:2px">🧟 Eliminado: <b>${esc(nameOf(R.elim))}</b></div>`);
  let title;
  if(R.last&&R.mode!=='race'){
    if(R.teams){const t0=R.tp[0]||0,t1=R.tp[1]||0;title=t0===t1?'🤝 ¡Empate entre equipos!':'🏆 ¡Ganó el equipo '+TEAMS[t0>t1?0:1]+'!'}
    else if(R.mode==='elim'){const alive2=R.rank.filter(r=>r.id!==R.elim);const champ=(alive2.length===1?alive2[0]:alive2.sort((a,b)=>(R.pts[b.id]||0)-(R.pts[a.id]||0))[0]||{}).id;title=champ===me?'🏆 ¡ERES EL ÚLTIMO EN PIE!':'🏁 Torneo terminado · ganó '+esc(nameOf(champ));if(champ===me&&window.V4)setTimeout(()=>{try{V4.unlock('survivor')}catch(e){}},300)}
    else{const top=Object.keys(R.pts).sort((a,b)=>R.pts[b]-R.pts[a])[0];title=top===me?'🏆 ¡CAMPEÓN DEL TORNEO!':'🏁 Torneo terminado · ganó '+esc(nameOf(top));if(top===me&&window.V4&&V4.speak)V4.speak('trophy',true)}
    X.body.push('<div id="netStats" class="hint" style="margin:2px"></div>');setTimeout(renderStats,50)}
  else if(N.spectator)title='👀 Mirabas la carrera';
  else if(R.mode==='elim'&&R.elim===me)title='🧟 Quedaste eliminado';
  else title=pos===1?'🏆 ¡Ganaste la carrera en línea!':pos?'🏁 Terminaste '+pos+'° en línea':'🏁 Carrera terminada';
  X.title=title;
  const more=!(R.last||R.mode==='race');
  X.body.push(N.host?`<div class="hint" style="margin:2px">${more?'Toca "Siguiente pista" para continuar':'Toca "Volver a la sala" para jugar otra'}</div>`:'<div class="hint" style="margin:2px">⏳ Esperando al anfitrión…</div>');
  const ag=$('bAgain');ag.style.display=N.host?'':'none';ag.textContent=more?'➡️ Siguiente pista':'🏠 Volver a la sala'};
function hostNext(){if(!N.host||!lastRes)return;const L=N.lob;
  if(!lastRes.last&&lastRes.mode!=='race'){const ti=L.ti+1,d=L.tracks[ti]||trackDesc(TRACKS[Math.min(ti,3)]);L.ti=ti;
    const ids=order.filter(id=>id===N.me.id||alive().some(p=>p.id===id)).filter(id=>!L.out.includes(id));
    const msg={t:'start',trk:d,order:ids,ti,mode:L.mode,pts:L.pts,tp:L.tp,teams:L.teams?1:0,out:L.out};send(msg);startLocal(msg)}
  else{racing=false;resetTournament();send({t:'tolobby'});showLobby()}}
/* ---------------- pantallas ---------------- */
const onMsgEl=t=>{$('onMsg').textContent=t};
N.openOnline=function(){$('onName').value=lsGet('kart_name','')||N.me.name||'';onMsgEl('');showScreen('online')};
function me2(){const nm=clean($('onName').value)||CHARS[picked<BASE?picked:0].n.split(' ')[0];lsSet('kart_name',nm);N.me.name=nm;N.me.ci=picked<BASE?picked:0;N.me.pc=PAINT.c||null;N.me.pl=PAINT.l||''}
function newCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=A[(Math.random()*A.length)|0];return c}
async function go(code,host){me2();const pass=($('onPass').value||'').trim().slice(0,12);$('onCreate').disabled=$('onJoin').disabled=true;onMsgEl('🔌 Conectando…');
  try{await connect(code,host,pass)}catch(e){$('onCreate').disabled=$('onJoin').disabled=false;onMsgEl('😕 No pude conectar ('+(e.message||e)+'). Revisa tu internet. Si sigue, hay que activar "Allow public access" en Realtime (Supabase).');leave();return}
  $('onCreate').disabled=$('onJoin').disabled=false;
  if(!host){onMsgEl('🔎 Buscando la sala…');const t0=Date.now();const w=setInterval(()=>{if(Date.now()-hostSeen<3000&&[...N.peers.values()].some(p=>p.host)){clearInterval(w);showLobby()}else if(Date.now()-t0>7000){clearInterval(w);leave();onMsgEl('😕 No encontré la sala '+code+'. Revisa el código'+(pass?' y la contraseña':'')+'.')}},400)}
  else showLobby()}
$('onCreate').onclick=()=>go(newCode(),true);
$('onJoin').onclick=()=>{const c=($('onCode').value||'').toUpperCase().replace(/[^A-Z]/g,'');if(c.length!==4){onMsgEl('Escribe el código de 4 letras');return}go(c,false)};
$('onBack').onclick=()=>showScreen('select');
function showLobby(){renderLobby();showScreen('lobby')}
function renderLobbyIfOpen(){if($('lobby').classList.contains('on'))renderLobby()}
function seg(items,cur,cb){const d=document.createElement('div');d.className='seg';items.forEach(([lab,val])=>{const b=document.createElement('button');b.className='sec'+(val===cur?' on':'');b.textContent=lab;b.onclick=()=>cb(val);d.appendChild(b)});return d}
function renderLobby(){const el=$('lobbyBody');if(!el)return;el.innerHTML='';const L=N.lob;
  const head=document.createElement('div');head.innerHTML=`<div class="title" style="font-size:clamp(14px,3.4vw,22px)!important;color:#fff">SALA ${N.pass?'🔒':''}</div><div class="lcode">${esc(N.code)}</div><div class="hint" style="margin:0">Pásale este código${N.pass?' y la contraseña':''} a tus amigos 📲</div>`;el.appendChild(head);
  const roster=[{...N.me,host:N.host,me:true},...alive().map(p=>({...p}))];
  const pl=document.createElement('div');pl.className='lplayers';roster.forEach((p,i)=>{const d=document.createElement('div');d.className='lp';const col=p.pc||CHARS[Math.min(BASE-1,p.ci|0)].col;const tm=L.teams?(i%2?'🧱 ':'🏠 '):'';d.innerHTML=`<span class="dot" style="background:${col}"></span>${p.host?'👑 ':''}${tm}${esc(p.name)}${p.me?' (tú)':''}`;pl.appendChild(d)});el.appendChild(pl);
  const cnt=document.createElement('div');cnt.className='hint';cnt.textContent=roster.length+' jugador'+(roster.length>1?'es':'')+' · máximo '+MAXP;el.appendChild(cnt);
  if(N.host){
    el.appendChild(seg([['🏁 Carrera','race'],['🏆 Torneo','torneo'],['🧟 Eliminación','elim']],L.mode,v=>{L.mode=v;L.tracks=tracksFor(v,L.long);L.ti=0;sendLobby();renderLobby()}));
    const r2=seg([['👤 Individual',false],['🤝 Equipos',true]],!!L.teams,v=>{L.teams=v;sendLobby();renderLobby()});r2.style.marginTop='6px';el.appendChild(r2);
    if(L.mode==='race'){const row=seg(TRACKS.map(t=>[t.n.replace('Circuito ','').replace('Noche en la Colonia','Noche').replace('Atardecer en la Colonia','Atardecer').replace('Calle de la ','').replace('La ',''),t.id]),(L.tracks[0]||{}).id,v=>{const t=TRACKS.find(x=>x.id===v);L.tracks=[trackDesc(t)];sendLobby();renderLobby()});row.style.marginTop='6px';el.appendChild(row)}
    else{const r3=seg([['Corto (4 pistas)',false],['Largo (6 pistas)',true]],!!L.long,v=>{L.long=v;L.tracks=tracksFor(L.mode,v);sendLobby();renderLobby()});r3.style.marginTop='6px';el.appendChild(r3);const h=document.createElement('div');h.className='hint';h.textContent=L.mode==='elim'?'🧟 En cada carrera se va el último lugar. ¡Gana el último en pie!':'🏆 Puntos por lugar y trofeo al final';el.appendChild(h)}
  }else{const h=document.createElement('div');h.className='hint';h.style.color='#ffd9a0';const t=TRACKS.find(x=>x.id===(L.tracks[0]||{}).id);const mname={race:'🏁 Carrera',torneo:'🏆 Torneo',elim:'🧟 Eliminación'}[L.mode];h.textContent=mname+(L.teams?' · 🤝 Equipos':'')+(L.mode==='race'?' · '+(t?t.n:((L.tracks[0]||{}).n||'pista')):' · '+L.tracks.length+' pistas')+' · esperando al anfitrión…';el.appendChild(h)}
  $('lbStart').style.display=N.host?'':'none'}
$('lbStart').onclick=hostStart;
$('lbLeave').onclick=()=>{leave();showScreen('title')};
$('lbShare').onclick=async()=>{const txt='🏎️ ¡Juega conmigo El Patrón Kart en línea! Entra a '+location.origin+location.pathname.replace(/index\.html$/,'')+' → En línea → Unirme, y escribe el código: '+N.code+(N.pass?' (contraseña: '+N.pass+')':'');try{if(navigator.share)await navigator.share({text:txt});else{await navigator.clipboard.writeText(txt);alert('Texto copiado. Pégalo en WhatsApp 📲')}}catch(e){}};
$('mOnline').onclick=()=>{MODE='online';P2=false;audioUnlock();beep(880,.1);setMusic('cancion');$('selTitle').textContent='EN LÍNEA: ELIGE TU PILOTO';$('bGo').textContent='🌐 SEGUIR';buildSelect();showScreen('select')};
/* ---------------- enganches con el juego ---------------- */
const _go=$('bGo').onclick;$('bGo').onclick=()=>{if(MODE==='online'){audioUnlock();N.openOnline();return}_go()};
const _ag=$('bAgain').onclick;$('bAgain').onclick=()=>{if(MODE==='online'&&N.on){hostNext();return}_ag()};
const _mn=$('bMenu').onclick;$('bMenu').onclick=()=>{if(N.on)leave();_mn()};
if(window.V4){const _r=V4.results;V4.results=function(X){if(MODE==='online'&&N.on){N.results(X);return}return _r(X)};
  const _t=V4.tick;V4.tick=function(dt){_t(dt);if(N.on)N.tick(dt)};
  const _rs=V4.raceStart;V4.raceStart=function(){_rs();if(MODE==='online'&&N.spectator){$('pad').classList.remove('on');$('tiltBar').classList.remove('on');setTimeout(()=>say('👀 Estás eliminado: ¡mira la carrera!',3500),600)}}}
const _use=useItem;useItem=function(k){const hn=hazards.length,sn=shots.length;_use(k);
  if(N.on&&racing&&k.isPlayer){for(let i=hn;i<hazards.length;i++){const h=hazards[i];h.id=h.id||rid().slice(0,8);send({t:'hz',p:[Math.round(h.x),Math.round(h.y)],k:h.kind,d:h.id})}
    for(let i=sn;i<shots.length;i++){const s=shots[i];s.id=s.id||rid().slice(0,8);send({t:'sh',p:[Math.round(s.x),Math.round(s.y),Math.round(s.a*100)],k:s.kind,v:s.spd,g:s.tg?s.tg.rid:'',d:s.id})}}};
addEventListener('pagehide',()=>{if(N.on)leave()});
})();
