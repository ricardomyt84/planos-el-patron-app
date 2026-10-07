/* Voz natural (Google TTS vía Supabase). Si no hay clave, sesión o internet, devuelve false y la app usa la voz del teléfono. */
(function(){
const SB="https://ldgsmzplpdnxdqqphgtm.supabase.co",KEY="sb_publishable_vQkO_JZaEnO311i_9SrsYw_jYD_jE_4",SESS="planos-sesion-v1",CACHE="voz-v1";
const VN={on:true,disabled:false,audio:null,cancelFn:null,pend:new Map(),
  get pref(){try{return localStorage.getItem("planos-vn")!=="0"}catch(e){return true}},
  set pref(v){try{localStorage.setItem("planos-vn",v?"1":"0")}catch(e){}},
  get voz(){try{return localStorage.getItem("planos-vn-voz")==="hombre"?"hombre":"mujer"}catch(e){return"mujer"}},
  set voz(v){try{localStorage.setItem("planos-vn-voz",v==="hombre"?"hombre":"mujer")}catch(e){}}};
VN.estado="";VN.ultimoError="";
function sesion(){try{return JSON.parse(localStorage.getItem(SESS)||"null")}catch(e){return null}}
async function token(){let s=sesion();if(!s)return null;
  if(s.expires_at&&s.expires_at*1000<Date.now()+30000){try{const r=await fetch(SB+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:s.refresh_token})});if(r.ok){s=await r.json();localStorage.setItem(SESS,JSON.stringify(s))}else return null}catch(e){return null}}
  return s.access_token}
const norm=t=>String(t).replace(/\s+/g," ").trim().slice(0,600);
const kq=(t,vel,voz)=>`https://voz.cache/${voz}/${vel}/${encodeURIComponent(t)}`;
async function conseguir(texto,vel){
  texto=norm(texto);vel=Math.round(Math.min(1.3,Math.max(0.7,vel))*20)/20;const voz=VN.voz,k=kq(texto,vel,voz);
  if(VN.pend.has(k))return VN.pend.get(k);
  const p=(async()=>{
    let cache=null;try{cache=await caches.open(CACHE);const hit=await cache.match(k);if(hit)return await hit.blob()}catch(e){}
    const tk=await token();if(!tk){VN.estado="sin_sesion";return null}
    let r;try{r=await fetch(SB+"/functions/v1/voz",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+tk,"Content-Type":"application/json"},body:JSON.stringify({texto,voz,velocidad:vel})})}catch(e){VN.estado="sin_red";return null}
    if(!r.ok){let j={};try{j=await r.json()}catch(e){}VN.estado=j.error||("http_"+r.status);VN.ultimoError=j.detalle||"";if(r.status===503||r.status===401||r.status===403||r.status===502)VN.disabled=true;return null}
    const blob=await r.blob();VN.estado="ok";
    try{if(cache)await cache.put(k,new Response(blob,{headers:{"Content-Type":"audio/mpeg"}}))}catch(e){}
    return blob})();
  VN.pend.set(k,p);p.finally(()=>setTimeout(()=>VN.pend.delete(k),60000));return p}
VN.prefetch=(texto,vel)=>{if(!VN.pref||VN.disabled||!texto)return;conseguir(texto,vel||1).catch(()=>{})};
/* Desbloquea el audio en iOS: llamar dentro de un toque del usuario. */
VN.unlock=()=>{try{if(!VN.audio){VN.audio=new Audio();VN.audio.preload="auto";VN.audio.playsInline=true}
  VN.audio.src="data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAnEGhbmOAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
  const pr=VN.audio.play();if(pr&&pr.catch)pr.catch(()=>{})}catch(e){}};
VN.stop=()=>{try{if(VN.audio){VN.audio.onended=null;VN.audio.onerror=null;VN.audio.pause()}}catch(e){}if(VN.cancelFn){const f=VN.cancelFn;VN.cancelFn=null;f()}};
/* Habla un texto. Resuelve true si lo habló con voz natural, false si no se pudo (usar voz del teléfono). */
VN.say=async function(texto,vel){
  if(!VN.pref||VN.disabled||!texto)return false;
  const blob=await conseguir(texto,vel||1);if(!blob)return false;
  if(!VN.audio){VN.audio=new Audio();VN.audio.playsInline=true}
  return await new Promise(res=>{
    const a=VN.audio,url=URL.createObjectURL(blob);let hecho=false;
    const fin=ok=>{if(hecho)return;hecho=true;a.onended=null;a.onerror=null;VN.cancelFn=null;try{URL.revokeObjectURL(url)}catch(e){}res(ok)};
    VN.cancelFn=()=>{try{a.pause()}catch(e){}fin(true)};
    a.onended=()=>fin(true);a.onerror=()=>fin(false);a.src=url;
    const pr=a.play();if(pr&&pr.catch)pr.catch(()=>fin(false))})};
/* Prueba de conexión para mostrar el estado. */
VN.probar=async function(){VN.disabled=false;VN.estado="";const ok=await VN.say("Hola. Esta es la voz natural de Google.",1);return{ok,estado:VN.estado,detalle:VN.ultimoError}};
VN.mensaje=e=>({ok:"✅ Voz natural activa",sin_clave:"⏳ Falta pegar la clave de Google en Supabase",sin_sesion:"🔐 Entra en ⚙️ Más para usar la voz natural",sin_red:"📶 Sin internet: uso la voz del teléfono",clave_sin_permiso:"🔑 La clave de Google no tiene permiso para Text-to-Speech",voz_invalida:"🗣️ El nombre de la voz no es válido"})[e]||("⚠️ "+(e||"Sin respuesta"));
window.VN=VN;
})();
