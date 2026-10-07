'use strict';
/* =====================================================================
   EL PATRÓN KART · modo en línea (varios celulares) + torneos
   Transporte: Supabase Realtime (broadcast). Con ?net=mock se usa
   BroadcastChannel (solo para pruebas entre pestañas).
   ===================================================================== */
(function(){
const SBURL='https://ldgsmzplpdnxdqqphgtm.supabase.co',SBKEY='sb_publishable_vQkO_JZaEnO311i_9SrsYw_jYD_jE_4';
const PTS8=[10,8,6,5,4,3,2,1],MAXP=8,ALIVE_MS=7000;
const N=window.NETG={on:false,host:false,code:'',me:{id:'',name:'',ci:0,pc:null,pl:''},peers:new Map(),lob:{mode:'race',ti:0,tracks:[],pts:{},st:'lobby'}};
const rid=()=>Math.random().toString(36).slice(2,8)+Math.random().toString(36).slice(2,6);
const num=(v,d=0)=>Number.isFinite(+v)?+v:d;
const clean=s=>String(s==null?'':s).replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,12);
const mock=/[?&]net=mock/.test(location.search);
let tr=null,timers=[],racing=false,order=[],startInfo=null,lastRes=null,resRecv=false,holdSince=0,firstFinRaceT=-1,sendAcc=0,hiN=0,resSent=false,hostSeen=0;
{const q=/[?&]id=([a-z0-9]{3,16})/i.exec(location.search);let id=q?q[1]:lsGet('kart_net_id','');if(!id){id=rid();lsSet('kart_net_id',id)}N.me.id=id}
/* ---------------- transporte ---------------- */
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('No cargó '+src));document.head.appendChild(s)})}
async function openTransport(code,onMsg){
  if(mock){const bc=new BroadcastChannel('kartmock-'+code);bc.onmessage=e=>onMsg(e.data);return{send:m=>bc.postMessage(m),close:()=>bc.close()}}
  if(!window.supabase)await loadScript('vendor/supabase.js');
  const sb=window.supabase.createClient(SBURL,SBKEY,{realtime:{params:{eventsPerSecond:30}}});
  const ch=sb.channel('kart-'+code,{config:{broadcast:{self:false,ack:false}}});
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
const trackDesc=t=>t.custom?{id:t.id,n:t.n,theme:Math.max(0,THEMESIDX(t)),seed:t.cseed}:{id:t.id};
const THEMESIDX=t=>TRACKS.filter(x=>!x.custom).findIndex(x=>x.grass[0]===t.grass[0]);
function resolveTrack(d){let t=TRACKS.find(x=>x.id===d.id);if(t)return t;if(d.seed!=null&&window.V4&&V4.mkCustom){t=V4.mkCustom({id:String(d.id).slice(0,24),n:clean(d.n)||'Pista',theme:num(d.theme),seed:num(d.seed)});TRACKS.push(t);return t}return TRACKS[0]}
function hello(){send({t:'hi',n:N.me.name,c:N.me.ci,pc:N.me.pc,pl:N.me.pl,h:N.host?1:0})}
function sendLobby(){if(!N.host)return;send({t:'lobby',mode:N.lob.mode,tr:N.lob.tracks,ti:N.lob.ti,pts:N.lob.pts,st:racing?'racing':'lobby'})}
function setDefaultLobby(){N.lob={mode:'race',ti:0,tracks:[trackDesc(TRACKS[0])],pts:{},st:'lobby'}}
async function connect(code,host){
  N.code=code;N.host=host;N.peers.clear();hostSeen=Date.now();hiN=0;
  if(host)setDefaultLobby();
  tr=await openTransport(code,onMsg);N.on=true;hello();if(host)sendLobby();
  timers.push(setInterval(()=>{hello();sendLobby();prune();renderLobbyIfOpen()},2000));
}
function prune(){const now=Date.now();let changed=false;for(const[id,p]of N.peers)if(now-p.seen>ALIVE_MS){N.peers.delete(id);changed=true;const k=kartById(id);if(k){const i=karts.indexOf(k);if(i>=0)karts.splice(i,1)}}
  // si el anfitrión desaparece, el de menor id toma el mando
  if(!N.host&&now-hostSeen>ALIVE_MS+2500){const ids=[N.me.id,...alive().map(p=>p.id)].sort();if(ids[0]===N.me.id){N.host=true;if(!N.lob.tracks.length)setDefaultLobby();renderLobbyIfOpen()}}
  return changed}
function leave(){try{send({t:'bye'})}catch(e){}for(const t of timers)clearInterval(t);timers=[];if(tr){try{tr.close()}catch(e){}}tr=null;N.on=false;N.host=false;N.peers.clear();racing=false;MODE='race'}
N.leave=leave;
/* ---------------- mensajes ---------------- */
function onMsg(m){
  if(!m||typeof m!=='object'||typeof m.t!=='string'||!m.i||m.i===N.me.id)return;
  const id=String(m.i).slice(0,24);
  switch(m.t){
    case'hi':{let p=N.peers.get(id);if(!p){if(N.peers.size>=MAXP+1)return;p={id,first:Date.now(),net:null};N.peers.set(id,p)}
      p.seen=Date.now();p.name=clean(m.n)||'Jugador';p.ci=Math.max(0,Math.min(BASE-1,num(m.c)|0));p.pc=(typeof m.pc==='string'&&/^#[0-9a-f]{6}$/i.test(m.pc))?m.pc:null;p.pl=typeof m.pl==='string'?m.pl.slice(0,4):'';p.host=!!m.h;if(m.h)hostSeen=Date.now();if(N.host&&p.first>Date.now()-300){hello();sendLobby()}renderLobbyIfOpen();break}
    case'lobby':{const p=N.peers.get(id);if(p){p.seen=Date.now();p.host=true}hostSeen=Date.now();if(N.host&&id<N.me.id){N.host=false}
      N.lob.mode=m.mode==='torneo'?'torneo':'race';N.lob.tracks=Array.isArray(m.tr)?m.tr.slice(0,8).map(d=>({id:String(d.id||'').slice(0,24),n:clean(d.n),theme:num(d.theme),seed:d.seed==null?null:num(d.seed)})):[];N.lob.ti=num(m.ti)|0;N.lob.pts=(m.pts&&typeof m.pts==='object')?m.pts:{};renderLobbyIfOpen();break}
    case'start':{if(N.on&&!N.host||N.on&&m.i<N.me.id)startLocal(m);break}
    case'tolobby':{if(N.on){racing=false;N.lob.pts=(m.pts&&typeof m.pts==='object')?m.pts:{};showLobby()}break}
    case's':{const p=N.peers.get(id);const k=kartById(id);if(!k||!Array.isArray(m.p))break;const a=m.p;
      k.net={x:num(a[0]),y:num(a[1]),a:num(a[2])/100,v:num(a[3]),l:Math.max(0,num(a[4])|0),w:Math.max(0,Math.min(WPN-1,num(a[5])|0)),f:num(a[6])|0,t:performance.now()};
      if(!k._seen){k._seen=1;k.x=k.net.x;k.y=k.net.y;k.a=k.net.a}if(p)p.seen=Date.now();break}
    case'hz':{if(!racing||!Array.isArray(m.p))break;hazards.push({x:num(m.p[0]),y:num(m.p[1]),life:20,kind:m.k==='cement'?'cement':'brick',id:String(m.d||'').slice(0,12)});break}
    case'hzx':{for(const h of hazards)if(h.id&&h.id===m.d)h.dead=true;break}
    case'sh':{if(!racing||!Array.isArray(m.p))break;shots.push({x:num(m.p[0]),y:num(m.p[1]),a:num(m.p[2])/100,tg:kartById(String(m.g||'')),life:6,owner:kartById(id),kind:m.k==='rent'?'rent':'wrench',spd:num(m.v,380),id:String(m.d||'').slice(0,12)});break}
    case'shx':{for(const s of shots)if(s.id&&s.id===m.d)s.life=0;break}
    case'ev':{if(racing&&m.d&&window.V4&&V4.evFrom)V4.evFrom({k:m.d.k,idx:num(m.d.idx)|0,o:num(m.d.o)});break}
    case'fin':{const k=kartById(id);if(k){k.fin=true;k.finT=num(m.ft);if(firstFinRaceT<0)firstFinRaceT=raceT}break}
    case'res':{onRes(m);break}
    case'bye':{N.peers.delete(id);const k=kartById(id);if(k){const i=karts.indexOf(k);if(i>=0)karts.splice(i,1)}renderLobbyIfOpen();break}
  }}
/* ---------------- carrera ---------------- */
function hostStart(){if(!N.host)return;
  const ids=[N.me.id,...alive().sort((a,b)=>a.first-b.first).map(p=>p.id)].slice(0,MAXP);
  const ti=N.lob.mode==='torneo'?0:0;N.lob.ti=ti;N.lob.pts={};
  const d=N.lob.tracks[ti]||trackDesc(TRACKS[0]);
  const msg={t:'start',trk:d,order:ids,ti,mode:N.lob.mode,pts:{}};send(msg);startLocal(msg)}
function startLocal(m){
  racing=true;resRecv=false;resSent=false;lastRes=null;firstFinRaceT=-1;order=(Array.isArray(m.order)?m.order:[]).map(x=>String(x).slice(0,24)).slice(0,MAXP);if(!order.includes(N.me.id))order.push(N.me.id);
  N.lob.ti=num(m.ti)|0;N.lob.mode=m.mode==='torneo'?'torneo':'race';N.lob.pts=(m.pts&&typeof m.pts==='object')?m.pts:{};
  const d=m.trk||{id:'colonia'},trk=resolveTrack({id:String(d.id||'colonia'),n:d.n,theme:d.theme,seed:d.seed});
  MODE='online';P2=false;showScreen(null);
  setTimeout(()=>{buildTrack(trk);state='menu';karts=[];startRace()},30)}
N.makeKarts=function(){const ks=[];order.forEach((id,i)=>{const me=id===N.me.id,info=me?N.me:(N.peers.get(id)||{name:'Jugador',ci:0});
  const k=newKart(Math.max(0,Math.min(BASE-1,info.ci|0)),i,me);k.rid=id;
  if(!me){k.remote=true;k.ai=false;k.human=false;k.name=info.name;k.paint=(info.pc||info.pl)?{c:info.pc||null,l:info.pl||''}:null}
  ks.push(k)});return ks};
N.remoteStep=function(k,dt){const n=k.net;if(!n)return;const age=Math.min(.45,(performance.now()-n.t)/1000);
  const tx=n.x+Math.cos(n.a)*n.v*age,ty=n.y+Math.sin(n.a)*n.v*age,f=Math.min(1,dt*9),pa=k.a;
  k.x+=(tx-k.x)*f;k.y+=(ty-k.y)*f;k.a+=angDiff(k.a,n.a)*f;k.spd=n.v;
  const turn=angDiff(pa,k.a)/Math.max(dt,1e-3);k.lean=turn>0.6?1:turn<-0.6?-1:0;
  k.boost=(n.f&1)?0.2:0;k.star=(n.f&2)?1:0;k.spin=(n.f&4)?0.3:0;if(k.spin>0)k.spinA+=dt*13;k.drift=(n.f&8)?1:0;
  k.wpi=n.w;k.lap=n.l;if(n.f&16)k.fin=true;k.prog=progressOf(k)};
const flags=k=>(k.boost>0?1:0)|(k.star>0?2:0)|(k.spin>0?4:0)|(k.drift?8:0)|(k.fin?16:0);
N.tick=function(dt){if(!N.on||!racing||!player)return;
  const rate=alive().length>4?6:8;sendAcc+=dt;if(sendAcc>=1/rate){sendAcc=0;const k=player;send({t:'s',p:[Math.round(k.x),Math.round(k.y),Math.round(k.a*100),Math.round(k.spd),k.lap,k.wpi,flags(k)]})}
  if(N.host&&!resSent&&state!=='count'){const hum=karts.filter(k=>k.rid);const fin=hum.filter(k=>k.fin);
    if(hum.length&&(fin.length===hum.length||(firstFinRaceT>=0&&raceT-firstFinRaceT>14)||raceT>420)){hostResults()}}};
N.finish=function(k){if(!N.on)return;holdSince=performance.now();if(firstFinRaceT<0)firstFinRaceT=raceT;send({t:'fin',ft:k.finT})};
N.hold=function(){return N.on&&racing&&!resRecv&&(performance.now()-holdSince<38000)};
N.gone=function(kind,o){if(!o||!o.id)return;send({t:kind,d:o.id})};
function hostResults(){resSent=true;
  const hum=karts.filter(k=>k.rid);const fin=hum.filter(k=>k.fin).sort((a,b)=>a.finT-b.finT),rest=hum.filter(k=>!k.fin).sort((a,b)=>b.prog-a.prog);
  const rank=fin.concat(rest).map(k=>({id:k.rid,ft:k.fin?+k.finT.toFixed(2):0,n:k.rid===N.me.id?N.me.name:k.name}));
  const pts=Object.assign({},N.lob.pts);rank.forEach((r,i)=>{pts[r.id]=(pts[r.id]||0)+(PTS8[i]||0)});
  const last=N.lob.mode!=='torneo'||N.lob.ti>=3;
  const msg={t:'res',rank,pts,ti:N.lob.ti,last,mode:N.lob.mode};send(msg);onRes(Object.assign({i:N.me.id},msg))}
function onRes(m){if(resRecv)return;resRecv=true;lastRes={rank:(m.rank||[]).slice(0,MAXP).map(r=>({id:String(r.id).slice(0,24),ft:num(r.ft),n:clean(r.n)})),pts:m.pts||{},last:!!m.last,mode:m.mode};N.lob.pts=lastRes.pts;
  if(state!=='results'){state='results';showResults()}}
/* resultados en pantalla */
N.results=function(X){const me=N.me.id;const R=lastRes;
  if(!R){X.title='🏁 Carrera terminada';return}
  const pos=R.rank.findIndex(r=>r.id===me)+1;
  const tor=R.mode==='torneo';
  const rows=R.rank.map((r,i)=>`<tr class="${r.id===me?'me':''}"><td>${i+1}°</td><td>${esc(r.id===me?N.me.name:(r.n||nameOf(r.id)))}</td><td>${r.ft?fmt(r.ft):'—'}</td>${tor?`<td>${R.pts[r.id]||0} pts</td>`:''}</tr>`).join('');
  X.body.length=0;X.body.push('<table>'+rows+'</table>');
  if(R.last&&tor){const top=Object.keys(R.pts).sort((a,b)=>R.pts[b]-R.pts[a])[0];X.title=top===me?'🏆 ¡CAMPEÓN DEL TORNEO!':'🏁 Torneo terminado · ganó '+esc(nameOf(top));if(top===me&&window.V4){V4.speak&&V4.speak('trophy',true)}}
  else X.title=pos===1?'🏆 ¡Ganaste la carrera en línea!':pos?'🏁 Terminaste '+pos+'° en línea':'🏁 Carrera terminada';
  X.body.push(N.host?`<div class="hint" style="margin:2px">${tor&&!R.last?'Toca "Siguiente pista" para continuar el torneo':'Toca "Volver a la sala" para jugar otra'}</div>`:'<div class="hint" style="margin:2px">⏳ Esperando al anfitrión…</div>');
  const ag=$('bAgain');ag.style.display=N.host?'':'none';ag.textContent=(tor&&!R.last)?'➡️ Siguiente pista':'🏠 Volver a la sala'};
function hostNext(){if(!N.host||!lastRes)return;
  if(lastRes.mode==='torneo'&&!lastRes.last){const ti=N.lob.ti+1,d=N.lob.tracks[ti]||trackDesc(TRACKS[Math.min(ti,3)]);N.lob.ti=ti;const ids=[N.me.id,...alive().sort((a,b)=>a.first-b.first).map(p=>p.id)].slice(0,MAXP);const msg={t:'start',trk:d,order:ids,ti,mode:'torneo',pts:N.lob.pts};send(msg);startLocal(msg)}
  else{racing=false;N.lob.pts={};send({t:'tolobby',pts:{}});showLobby()}}
/* ---------------- pantallas ---------------- */
const onMsgEl=t=>{$('onMsg').textContent=t};
N.openOnline=function(){$('onName').value=lsGet('kart_name','')||N.me.name||'';onMsgEl('');showScreen('online')};
function me2(){const nm=clean($('onName').value)||CHARS[picked<BASE?picked:0].n.split(' ')[0];lsSet('kart_name',nm);N.me.name=nm;N.me.ci=picked<BASE?picked:0;N.me.pc=PAINT.c||null;N.me.pl=PAINT.l||''}
function newCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=A[(Math.random()*A.length)|0];return c}
async function go(code,host){me2();$('onCreate').disabled=$('onJoin').disabled=true;onMsgEl('🔌 Conectando…');
  try{await connect(code,host)}catch(e){$('onCreate').disabled=$('onJoin').disabled=false;onMsgEl('😕 No pude conectar ('+(e.message||e)+'). Revisa tu internet. Si sigue, hay que activar "Allow public access" en Realtime (Supabase).');leave();return}
  $('onCreate').disabled=$('onJoin').disabled=false;
  if(!host){onMsgEl('🔎 Buscando la sala…');const t0=Date.now();const w=setInterval(()=>{if(Date.now()-hostSeen<3000&&[...N.peers.values()].some(p=>p.host)){clearInterval(w);showLobby()}else if(Date.now()-t0>7000){clearInterval(w);leave();onMsgEl('😕 No encontré la sala '+code+'. Revisa el código.')}},400)}
  else showLobby()}
$('onCreate').onclick=()=>go(newCode(),true);
$('onJoin').onclick=()=>{const c=($('onCode').value||'').toUpperCase().replace(/[^A-Z]/g,'');if(c.length!==4){onMsgEl('Escribe el código de 4 letras');return}go(c,false)};
$('onBack').onclick=()=>showScreen('select');
function showLobby(){renderLobby();showScreen('lobby')}
function renderLobbyIfOpen(){if($('lobby').classList.contains('on'))renderLobby()}
function seg(items,cur,cb){const d=document.createElement('div');d.className='seg';items.forEach(([lab,val])=>{const b=document.createElement('button');b.className='sec'+(val===cur?' on':'');b.textContent=lab;b.onclick=()=>cb(val);d.appendChild(b)});return d}
function renderLobby(){const el=$('lobbyBody');if(!el)return;el.innerHTML='';
  const head=document.createElement('div');head.innerHTML=`<div class="title" style="font-size:clamp(14px,3.4vw,22px)!important;color:#fff">SALA</div><div class="lcode">${esc(N.code)}</div><div class="hint" style="margin:0">Pásale este código a tus amigos 📲</div>`;el.appendChild(head);
  const roster=[{...N.me,host:N.host,me:true},...alive().map(p=>({...p}))];
  const pl=document.createElement('div');pl.className='lplayers';roster.forEach(p=>{const d=document.createElement('div');d.className='lp';const col=p.pc||CHARS[Math.min(BASE-1,p.ci|0)].col;d.innerHTML=`<span class="dot" style="background:${col}"></span>${p.host?'👑 ':''}${esc(p.name)}${p.me?' (tú)':''}`;pl.appendChild(d)});el.appendChild(pl);
  const cnt=document.createElement('div');cnt.className='hint';cnt.textContent=roster.length+' jugador'+(roster.length>1?'es':'')+' · máximo '+MAXP;el.appendChild(cnt);
  const L=N.lob;
  if(N.host){
    el.appendChild(seg([['🏁 Carrera',"race"],['🏆 Torneo (4 pistas)',"torneo"]],L.mode,v=>{L.mode=v;L.tracks=v==='torneo'?TRACKS.filter(t=>!t.custom).map(trackDesc):[L.tracks[0]||trackDesc(TRACKS[0])];L.ti=0;sendLobby();renderLobby()}));
    if(L.mode==='race'){const row=seg(TRACKS.map(t=>[t.n.replace('Circuito ','').replace('Noche en la Colonia','Noche'),t.id]),(L.tracks[0]||{}).id,v=>{const t=TRACKS.find(x=>x.id===v);L.tracks=[trackDesc(t)];sendLobby();renderLobby()});row.style.marginTop='6px';el.appendChild(row)}
    else{const h=document.createElement('div');h.className='hint';h.textContent='🗺️ '+TRACKS.filter(t=>!t.custom).map(t=>t.n).join(' → ');el.appendChild(h)}
  }else{const h=document.createElement('div');h.className='hint';h.style.color='#ffd9a0';const tn=(L.tracks[0]||{}).id;const t=TRACKS.find(x=>x.id===tn);h.textContent=(L.mode==='torneo'?'🏆 Torneo de 4 pistas':'🏁 Carrera · '+(t?t.n:((L.tracks[0]||{}).n||'pista')))+' · esperando al anfitrión…';el.appendChild(h)}
  $('lbStart').style.display=N.host?'':'none'}
$('lbStart').onclick=hostStart;
$('lbLeave').onclick=()=>{leave();showScreen('title')};
$('lbShare').onclick=async()=>{const txt='🏎️ ¡Juega conmigo El Patrón Kart en línea! Entra a '+location.origin+location.pathname.replace(/index\.html$/,'')+' → En línea → Unirme, y escribe el código: '+N.code;try{if(navigator.share)await navigator.share({text:txt});else{await navigator.clipboard.writeText(txt);alert('Texto copiado. Pégalo en WhatsApp 📲')}}catch(e){}};
$('mOnline').onclick=()=>{MODE='online';P2=false;audioUnlock();beep(880,.1);setMusic('cancion');$('selTitle').textContent='EN LÍNEA: ELIGE TU PILOTO';$('bGo').textContent='🌐 SEGUIR';buildSelect();showScreen('select')};
/* ---------------- enganches con el juego ---------------- */
const _go=$('bGo').onclick;$('bGo').onclick=()=>{if(MODE==='online'){audioUnlock();N.openOnline();return}_go()};
const _ag=$('bAgain').onclick;$('bAgain').onclick=()=>{if(MODE==='online'&&N.on){hostNext();return}_ag()};
const _mn=$('bMenu').onclick;$('bMenu').onclick=()=>{if(N.on)leave();_mn()};
if(window.V4){const _r=V4.results;V4.results=function(X){if(MODE==='online'&&N.on){N.results(X);return}return _r(X)};const _t=V4.tick;V4.tick=function(dt){_t(dt);if(N.on)N.tick(dt)}}
const _use=useItem;useItem=function(k){const hn=hazards.length,sn=shots.length;_use(k);
  if(N.on&&racing&&k.isPlayer){for(let i=hn;i<hazards.length;i++){const h=hazards[i];h.id=h.id||rid().slice(0,8);send({t:'hz',p:[Math.round(h.x),Math.round(h.y)],k:h.kind,d:h.id})}
    for(let i=sn;i<shots.length;i++){const s=shots[i];s.id=s.id||rid().slice(0,8);send({t:'sh',p:[Math.round(s.x),Math.round(s.y),Math.round(s.a*100)],k:s.kind,v:s.spd,g:s.tg?s.tg.rid:'',d:s.id})}}};
addEventListener('pagehide',()=>{if(N.on)leave()});
})();
