'use strict';
/* Personajes nuevos: dibujos vectoriales (g ya está centrado en la cara; s = ancho de referencia) */
const NEWCH={};
(function(){
const T=Math.PI*2;
function eye(g,x,y,rx,ry,px,py,pr,col){g.fillStyle='#fff';g.beginPath();g.ellipse(x,y,rx,ry,0,0,T);g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=rx*.12;g.stroke();g.fillStyle=col||'#2a1a10';g.beginPath();g.arc(x+px,y+py,pr,0,T);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+px-pr*.3,y+py-pr*.35,pr*.32,0,T);g.fill()}
function brow(g,x1,y1,x2,y2,w,col){g.strokeStyle=col||'#2a1a10';g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function face(g,R,skin){const gr=g.createRadialGradient(-R*.3,-R*.35,R*.1,0,0,R*1.1);gr.addColorStop(0,shade(skin,.18));gr.addColorStop(1,shade(skin,-.12));g.fillStyle=gr;g.beginPath();g.arc(0,0,R,0,T);g.fill();g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=R*.05;g.stroke()}
function cheeks(g,R,col){g.fillStyle=col||'rgba(230,90,90,.35)';g.beginPath();g.arc(-R*.62,R*.3,R*.2,0,T);g.arc(R*.62,R*.3,R*.2,0,T);g.fill()}

/* 🐶 EL PERRO: orejas de perrito, nariz negra y lengua; el chiste está en el apodo */
NEWCH.perro=(g,s)=>{const R=s*.34;
  g.fillStyle='#7a4a22';for(const sx of[-1,1]){g.save();g.translate(sx*R*1.02,-R*.05);g.rotate(sx*.28);g.beginPath();g.ellipse(0,R*.5,R*.4,R*.82,0,0,T);g.fill();g.fillStyle='#5a3416';g.beginPath();g.ellipse(0,R*.55,R*.2,R*.55,0,0,T);g.fill();g.fillStyle='#7a4a22';g.restore()}
  face(g,R,'#efc59d');
  g.fillStyle='#231b16';g.beginPath();g.arc(0,-R*.2,R*1.04,Math.PI*1.03,Math.PI*1.97);g.quadraticCurveTo(R*.4,-R*.62,0,-R*.5);g.quadraticCurveTo(-R*.4,-R*.62,-R*.98,-R*.3);g.fill();
  g.fillStyle='#2f9e44';g.fillRect(-R*1.05,-R*.5,R*2.1,R*.2);g.fillStyle='#8ce99a';g.fillRect(-R*1.05,-R*.5,R*2.1,R*.05);
  brow(g,-R*.6,-R*.28,-R*.2,-R*.34,R*.1);brow(g,R*.2,-R*.34,R*.6,-R*.28,R*.1);
  eye(g,-R*.38,-R*.05,R*.2,R*.24,0,R*.02,R*.12);eye(g,R*.38,-R*.05,R*.2,R*.24,0,R*.02,R*.12);
  cheeks(g,R);
  g.fillStyle='#1b1b1b';g.beginPath();g.ellipse(0,R*.2,R*.2,R*.14,0,0,T);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-R*.06,R*.15,R*.06,R*.03,0,0,T);g.fill();
  g.strokeStyle='#5a2a1a';g.lineWidth=R*.07;g.lineCap='round';g.beginPath();g.moveTo(0,R*.32);g.lineTo(0,R*.42);g.stroke();g.beginPath();g.arc(-R*.17,R*.42,R*.17,0,Math.PI*.9);g.arc(R*.17,R*.42,R*.17,Math.PI*.1,Math.PI);g.stroke();
  g.fillStyle='#ff6b81';g.beginPath();g.ellipse(0,R*.7,R*.14,R*.22,0,0,T);g.fill();g.strokeStyle='#d6336c';g.lineWidth=R*.03;g.beginPath();g.moveTo(0,R*.55);g.lineTo(0,R*.8);g.stroke();
  g.fillStyle='#e03131';g.fillRect(-R*.55,R*.95,R*1.1,R*.14)};

/* 👴 EL VIEJO DECRÉPITO: joven pero muy acabado (ojeras, canas, un solo diente) */
NEWCH.viejo=(g,s)=>{const R=s*.34;
  face(g,R,'#dcc2a6');
  g.fillStyle='#c9ccd1';g.beginPath();g.arc(0,-R*.25,R*1.02,Math.PI*1.05,Math.PI*1.95);g.lineTo(R*.9,-R*.2);g.quadraticCurveTo(0,-R*.62,-R*.9,-R*.2);g.fill();
  g.strokeStyle='#aeb2b8';g.lineWidth=R*.04;for(let i=-3;i<=3;i++){g.beginPath();g.moveTo(i*R*.3,-R*.9);g.quadraticCurveTo(i*R*.35,-R*1.15,i*R*.5+R*.1,-R*1.3);g.stroke()}
  g.strokeStyle='rgba(120,90,70,.55)';g.lineWidth=R*.04;for(const y of[-.55,-.45])g.beginPath(),g.moveTo(-R*.5,R*y),g.quadraticCurveTo(0,R*(y-.08),R*.5,R*y),g.stroke();
  // ojeras y ojos caídos
  g.fillStyle='rgba(110,80,130,.55)';g.beginPath();g.ellipse(-R*.38,R*.1,R*.26,R*.15,0,0,T);g.ellipse(R*.38,R*.1,R*.26,R*.15,0,0,T);g.fill();
  eye(g,-R*.38,-R*.02,R*.2,R*.2,R*.02,R*.05,R*.09,'#3a2a1a');eye(g,R*.38,-R*.02,R*.2,R*.2,R*.02,R*.05,R*.09,'#3a2a1a');
  g.fillStyle='#dcc2a6';g.beginPath();g.rect(-R*.6,-R*.28,R*.45,R*.24);g.rect(R*.15,-R*.28,R*.45,R*.24);g.fill();g.strokeStyle='rgba(60,40,30,.8)';g.lineWidth=R*.05;g.beginPath();g.moveTo(-R*.6,-R*.04);g.lineTo(-R*.17,-R*.04);g.moveTo(R*.17,-R*.04);g.lineTo(R*.6,-R*.04);g.stroke();
  brow(g,-R*.6,-R*.33,-R*.2,-R*.28,R*.07,'#8a8f96');brow(g,R*.2,-R*.28,R*.6,-R*.33,R*.07,'#8a8f96');
  // barba de varios días
  g.fillStyle='rgba(110,110,115,.35)';g.beginPath();g.arc(0,R*.1,R*.98,Math.PI*.12,Math.PI*.88);g.fill();
  g.fillStyle='#7b3f2a';g.beginPath();g.ellipse(0,R*.55,R*.26,R*.17,0,0,T);g.fill();g.fillStyle='#fff6d6';g.fillRect(-R*.05,R*.4,R*.1,R*.12);
  g.strokeStyle='rgba(120,90,70,.6)';g.lineWidth=R*.04;g.beginPath();g.moveTo(-R*.7,R*.3);g.quadraticCurveTo(-R*.6,R*.45,-R*.5,R*.5);g.moveTo(R*.7,R*.3);g.quadraticCurveTo(R*.6,R*.45,R*.5,R*.5);g.stroke();
  // gafas de leer caídas
  g.strokeStyle='#555';g.lineWidth=R*.06;g.beginPath();g.ellipse(-R*.32,R*.26,R*.2,R*.13,0,0,T);g.ellipse(R*.32,R*.26,R*.2,R*.13,0,0,T);g.moveTo(-R*.12,R*.26);g.lineTo(R*.12,R*.26);g.stroke()};

/* ⚔️ LA GUERREPÚ: hombre vestido de guerrera vikinga */
NEWCH.guerrepu=(g,s)=>{const R=s*.34;
  g.fillStyle='#f2c94c';for(const sx of[-1,1]){g.beginPath();g.ellipse(sx*R*1.02,R*.5,R*.2,R*.7,sx*.08,0,T);g.fill();g.strokeStyle='#c99a1a';g.lineWidth=R*.05;for(let y=0;y<4;y++){g.beginPath();g.moveTo(sx*R*.84,R*(.1+y*.28));g.lineTo(sx*R*1.2,R*(.18+y*.28));g.stroke()}g.fillStyle='#e03131';g.beginPath();g.arc(sx*R*1.02,R*1.22,R*.12,0,T);g.fill();g.fillStyle='#f2c94c'}
  face(g,R,'#e2a97a');
  g.fillStyle='#c0501a';g.beginPath();g.moveTo(-R*.95,R*.1);g.quadraticCurveTo(-R*.9,R*1.05,0,R*1.12);g.quadraticCurveTo(R*.9,R*1.05,R*.95,R*.1);g.quadraticCurveTo(R*.5,R*.5,0,R*.4);g.quadraticCurveTo(-R*.5,R*.5,-R*.95,R*.1);g.fill();
  g.fillStyle='#d9631f';g.beginPath();g.ellipse(-R*.28,R*.38,R*.4,R*.14,-.2,0,T);g.ellipse(R*.28,R*.38,R*.4,R*.14,.2,0,T);g.fill();
  g.strokeStyle='#e03131';g.lineWidth=R*.08;g.lineCap='round';g.beginPath();g.moveTo(-R*.75,R*.1);g.lineTo(-R*.5,R*.2);g.moveTo(-R*.75,R*.28);g.lineTo(-R*.5,R*.36);g.moveTo(R*.75,R*.1);g.lineTo(R*.5,R*.2);g.moveTo(R*.75,R*.28);g.lineTo(R*.5,R*.36);g.stroke();
  eye(g,-R*.36,-R*.08,R*.19,R*.2,0,0,R*.1,'#1c7ed6');eye(g,R*.36,-R*.08,R*.19,R*.2,0,0,R*.1,'#1c7ed6');
  brow(g,-R*.62,-R*.2,-R*.16,-R*.3,R*.12,'#8a3a10');brow(g,R*.16,-R*.3,R*.62,-R*.2,R*.12,'#8a3a10');
  g.fillStyle='#fff';g.beginPath();g.arc(0,R*.5,R*.22,0,Math.PI);g.fill();g.strokeStyle='#5a1a0a';g.lineWidth=R*.04;g.stroke();
  // casco con cuernos
  const hg=g.createLinearGradient(0,-R*1.3,0,-R*.3);hg.addColorStop(0,'#e9ecef');hg.addColorStop(1,'#868e96');g.fillStyle=hg;g.beginPath();g.arc(0,-R*.3,R*1.06,Math.PI,0);g.lineTo(R*1.06,-R*.22);g.lineTo(-R*1.06,-R*.22);g.fill();g.strokeStyle='#495057';g.lineWidth=R*.05;g.stroke();
  g.fillStyle='#f5b800';g.fillRect(-R*1.06,-R*.34,R*2.12,R*.14);g.fillStyle='#f5b800';g.beginPath();g.arc(0,-R*.27,R*.12,0,T);g.fill();
  g.fillStyle='#f8f0d8';for(const sx of[-1,1]){g.beginPath();g.moveTo(sx*R*.95,-R*.55);g.quadraticCurveTo(sx*R*1.75,-R*.55,sx*R*1.55,-R*1.35);g.quadraticCurveTo(sx*R*1.4,-R*.85,sx*R*.9,-R*.85);g.fill();g.strokeStyle='#b8a878';g.lineWidth=R*.04;g.stroke()}};

/* 😴 EL PRIMO FLOJO: dormido, con gorro y baba */
NEWCH.primo=(g,s)=>{const R=s*.34;
  face(g,R,'#dba46e');
  g.fillStyle='#3a2a1c';g.beginPath();g.arc(0,-R*.2,R*1.04,Math.PI*1.02,Math.PI*1.98);g.fill();
  g.fillStyle='#4dabf7';g.beginPath();g.moveTo(-R*1.05,-R*.28);g.quadraticCurveTo(-R*.9,-R*1.4,R*.2,-R*1.35);g.quadraticCurveTo(R*1.5,-R*1.3,R*1.55,-R*.5);g.quadraticCurveTo(R*.9,-R*.9,R*1.05,-R*.28);g.closePath();g.fill();g.strokeStyle='#1c7ed6';g.lineWidth=R*.05;g.stroke();
  g.fillStyle='#fff';g.fillRect(-R*1.08,-R*.36,R*2.16,R*.18);g.beginPath();g.arc(R*1.55,-R*.45,R*.2,0,T);g.fill();
  g.strokeStyle='#2a1a10';g.lineWidth=R*.08;g.lineCap='round';g.beginPath();g.arc(-R*.38,-R*.02,R*.2,.1*Math.PI,.9*Math.PI);g.stroke();g.beginPath();g.arc(R*.38,-R*.02,R*.2,.1*Math.PI,.9*Math.PI);g.stroke();
  brow(g,-R*.6,-R*.2,-R*.2,-R*.16,R*.08);brow(g,R*.2,-R*.16,R*.6,-R*.2,R*.08);
  cheeks(g,R,'rgba(230,90,90,.4)');
  g.fillStyle='#8a4a3a';g.beginPath();g.ellipse(-R*.05,R*.5,R*.22,R*.16,.15,0,T);g.fill();g.fillStyle='#ff8fa3';g.beginPath();g.ellipse(-R*.05,R*.55,R*.12,R*.07,0,0,T);g.fill();
  g.fillStyle='rgba(120,200,255,.85)';g.beginPath();g.moveTo(R*.12,R*.55);g.quadraticCurveTo(R*.3,R*.9,R*.14,R*1.15);g.quadraticCurveTo(R*.02,R*.95,R*.1,R*.6);g.fill();
  g.fillStyle='#fff';g.font=`bold ${R*.55}px Arial Black,Arial`;g.textAlign='center';g.strokeStyle='#1c7ed6';g.lineWidth=R*.1;g.strokeText('Z',R*1.1,-R*1.25);g.fillText('Z',R*1.1,-R*1.25);g.font=`bold ${R*.4}px Arial Black,Arial`;g.strokeText('z',R*1.6,-R*1.65);g.fillText('z',R*1.6,-R*1.65)};

/* 😱 SOCANÍBAL: muy miedoso (olla de casco, sudor, dientes que castañean) */
NEWCH.socanibal=(g,s)=>{const R=s*.34;
  face(g,R,'#f2d3b0');
  g.fillStyle='#4a2c17';g.beginPath();g.arc(0,-R*.2,R*1.03,Math.PI*1.04,Math.PI*1.96);g.fill();
  g.strokeStyle='#4a2c17';g.lineWidth=R*.12;g.lineCap='round';for(const x of[-.5,-.15,.2,.55]){g.beginPath();g.moveTo(R*x,-R*.9);g.lineTo(R*(x+.1),-R*1.2);g.stroke()}
  // olla de casco
  const pg=g.createLinearGradient(-R,-R*1.3,R,-R*.3);pg.addColorStop(0,'#ced4da');pg.addColorStop(1,'#6c757d');g.fillStyle=pg;g.beginPath();g.moveTo(-R*.8,-R*.52);g.quadraticCurveTo(-R*.95,-R*1.5,0,-R*1.5);g.quadraticCurveTo(R*.95,-R*1.5,R*.8,-R*.52);g.closePath();g.fill();g.strokeStyle='#343a40';g.lineWidth=R*.05;g.stroke();
  g.fillStyle='#495057';g.fillRect(-R*.95,-R*.58,R*1.9,R*.14);g.fillStyle='#212529';g.fillRect(-R*1.25,-R*1.0,R*.3,R*.12);g.fillRect(R*.95,-R*1.0,R*.3,R*.12);
  g.strokeStyle='#8b5a2b';g.lineWidth=R*.1;g.beginPath();g.moveTo(R*.2,-R*1.5);g.lineTo(R*.8,-R*2.0);g.stroke();g.fillStyle='#8b5a2b';g.beginPath();g.ellipse(R*.9,-R*2.05,R*.22,R*.13,.6,0,T);g.fill();
  // ojos enormes
  eye(g,-R*.38,-R*.04,R*.3,R*.34,R*.03,R*.04,R*.07);eye(g,R*.38,-R*.04,R*.3,R*.34,-R*.03,R*.04,R*.07);
  brow(g,-R*.7,-R*.5,-R*.2,-R*.68,R*.09);brow(g,R*.2,-R*.68,R*.7,-R*.5,R*.09);
  // boca abierta con dientes castañeando
  g.fillStyle='#7a1f2a';g.beginPath();g.ellipse(0,R*.55,R*.36,R*.26,0,0,T);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.3,R*.42);for(let i=0;i<=6;i++)g.lineTo(-R*.3+i*R*.1,R*(.42+(i%2?.12:0)));g.lineTo(R*.3,R*.38);g.lineTo(-R*.3,R*.38);g.fill();
  g.fillStyle='rgba(90,190,255,.9)';for(const[x,y,r]of[[-1.15,-.3,.13],[1.2,-.1,.12],[-1.05,.35,.1],[1.1,.5,.1]]){g.beginPath();g.moveTo(R*x,R*(y-r*1.6));g.quadraticCurveTo(R*(x+r),R*y,R*x,R*(y+r*.8));g.quadraticCurveTo(R*(x-r),R*y,R*x,R*(y-r*1.6));g.fill()}
  g.strokeStyle='rgba(60,60,60,.55)';g.lineWidth=R*.05;for(const sx of[-1,1]){g.beginPath();g.moveTo(sx*R*1.35,R*.0);g.lineTo(sx*R*1.5,R*.05);g.moveTo(sx*R*1.35,R*.25);g.lineTo(sx*R*1.5,R*.3);g.stroke()}};

/* 🌾 EL AGRICULTOR: fuerte y aguerrido, sombrero de paja y espiga */
NEWCH.agricultor=(g,s)=>{const R=s*.34;
  face(g,R,'#c58a55');
  g.fillStyle='rgba(60,40,25,.5)';g.beginPath();g.arc(0,R*.05,R*.99,Math.PI*.1,Math.PI*.9);g.fill();
  g.fillStyle='#3a2515';g.beginPath();g.ellipse(-R*.3,R*.4,R*.45,R*.14,-.15,0,T);g.ellipse(R*.3,R*.4,R*.45,R*.14,.15,0,T);g.fill();
  brow(g,-R*.68,-R*.16,-R*.14,-R*.34,R*.17,'#2a1a10');brow(g,R*.14,-R*.34,R*.68,-R*.16,R*.17,'#2a1a10');
  eye(g,-R*.36,-R*.07,R*.17,R*.14,R*.01,0,R*.09);eye(g,R*.36,-R*.07,R*.17,R*.14,-R*.01,0,R*.09);
  g.strokeStyle='rgba(60,30,20,.7)';g.lineWidth=R*.05;g.beginPath();g.moveTo(-R*.55,R*.0);g.lineTo(-R*.8,R*.12);g.stroke();
  g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.3,R*.5);g.quadraticCurveTo(0,R*.75,R*.3,R*.5);g.quadraticCurveTo(0,R*.55,-R*.3,R*.5);g.fill();
  g.strokeStyle='#d9b45a';g.lineWidth=R*.07;g.beginPath();g.moveTo(R*.2,R*.52);g.lineTo(R*.95,R*.15);g.stroke();g.fillStyle='#e3be5a';for(let i=0;i<4;i++){g.beginPath();g.ellipse(R*(.78+i*.06),R*(.24-i*.07),R*.1,R*.045,-.5,0,T);g.fill()}
  // sombrero de paja
  const sg=g.createLinearGradient(0,-R*1.3,0,-R*.4);sg.addColorStop(0,'#f1d37a');sg.addColorStop(1,'#c9a13a');g.fillStyle=sg;g.beginPath();g.ellipse(0,-R*.55,R*1.95,R*.5,0,0,T);g.fill();g.beginPath();g.ellipse(0,-R*1.15,R*.82,R*.62,0,0,T);g.fill();
  g.strokeStyle='rgba(120,80,20,.45)';g.lineWidth=R*.04;for(let i=-5;i<=5;i++){g.beginPath();g.moveTo(i*R*.3,-R*.55);g.lineTo(i*R*.34,-R*.2);g.stroke()}
  g.fillStyle='#8a3a1a';g.fillRect(-R*.82,-R*.85,R*1.64,R*.2)};

/* 🔧 VIDA: mantenimiento que no sabe de mantenimiento */
NEWCH.vida=(g,s)=>{const R=s*.34;
  g.fillStyle='#4a2c17';g.beginPath();g.arc(-R*1.05,R*.15,R*.32,0,T);g.fill();
  face(g,R,'#e2b07c');
  g.fillStyle='#4a2c17';g.beginPath();g.arc(0,-R*.2,R*1.02,Math.PI*1.04,Math.PI*1.96);g.fill();
  g.fillStyle='#212529';g.fillRect(-R*.9,-R*.55,R*.82,R*.3);g.fillRect(R*.08,-R*.55,R*.82,R*.3);g.fillStyle='rgba(120,200,255,.8)';g.fillRect(-R*.84,-R*.5,R*.7,R*.2);g.fillRect(R*.14,-R*.5,R*.7,R*.2);
  g.fillStyle='#fcc419';g.save();g.rotate(-.35);g.beginPath();g.arc(0,-R*.55,R*1.05,Math.PI,0);g.lineTo(R*1.05,-R*.5);g.lineTo(-R*1.05,-R*.5);g.fill();g.fillStyle='#e67700';g.fillRect(-R*.1,-R*1.6,R*.2,R*1.05);g.fillStyle='#fcc419';g.fillRect(-R*1.3,-R*.55,R*2.6,R*.14);g.restore();
  eye(g,-R*.38,R*.0,R*.22,R*.26,R*.05,-R*.03,R*.11);eye(g,R*.38,R*.02,R*.15,R*.16,-R*.04,R*.02,R*.07);
  brow(g,-R*.62,-R*.2,-R*.18,-R*.36,R*.09);brow(g,R*.2,-R*.18,R*.6,-R*.1,R*.09);
  g.fillStyle='rgba(30,30,30,.45)';g.beginPath();g.ellipse(R*.55,R*.38,R*.14,R*.09,.4,0,T);g.fill();
  g.fillStyle='#c8cdd2';g.save();g.translate(R*.2,R*.5);g.rotate(.3);g.fillRect(-R*.5,-R*.06,R*1.0,R*.12);g.restore();g.fillStyle='#dee2e6';g.beginPath();g.arc(R*.62,R*.58,R*.17,0,T);g.fill();g.fillStyle='#e2b07c';g.beginPath();g.arc(R*.7,R*.58,R*.09,0,T);g.fill();
  g.strokeStyle='#6c757d';g.lineWidth=R*.05;g.stroke();
  g.fillStyle='#7a1f2a';g.beginPath();g.ellipse(-R*.1,R*.6,R*.2,R*.12,.2,0,T);g.fill();
  g.fillStyle='#adb5bd';g.fillRect(-R*.9,R*.28,R*.35,R*.13);g.fillStyle='#868e96';g.fillRect(-R*.9,R*.33,R*.35,R*.03)};
/* 🐀 EL CHINO: pelo chino (rizado) y una rata que chilla en la cabeza: «¡Ya chilló la rata!» */
NEWCH.chino=(g,s)=>{const R=s*.34;
  g.fillStyle='#2a1a12';for(let i=0;i<15;i++){const a=Math.PI*(1.0+i/14*1.0);g.beginPath();g.arc(Math.cos(a)*R*1.02,-R*.12+Math.sin(a)*R*1.0,R*.27,0,T);g.fill()}
  for(let i=0;i<6;i++){g.beginPath();g.arc(-R*.62+i*R*.25,-R*.86+Math.sin(i*1.7)*R*.06,R*.27,0,T);g.fill()}
  g.beginPath();g.arc(-R*1.02,R*.12,R*.2,0,T);g.arc(R*1.02,R*.12,R*.2,0,T);g.fill();
  face(g,R,'#e6b88e');
  g.fillStyle='#2a1a12';for(let i=0;i<8;i++){g.beginPath();g.arc(-R*.82+i*R*.235,-R*.6+(i%2?R*.07:0),R*.2,0,T);g.fill()}
  brow(g,-R*.62,-R*.3,-R*.18,-R*.4,R*.1);brow(g,R*.18,-R*.4,R*.62,-R*.3,R*.1);
  eye(g,-R*.38,-R*.08,R*.2,R*.24,R*.03,R*.02,R*.12);eye(g,R*.38,-R*.08,R*.2,R*.24,-R*.03,R*.02,R*.12);
  cheeks(g,R,'rgba(230,90,90,.4)');
  g.fillStyle='#d49a70';g.beginPath();g.ellipse(0,R*.12,R*.09,R*.07,0,0,T);g.fill();
  g.fillStyle='#7a1f2a';g.beginPath();g.moveTo(-R*.5,R*.36);g.quadraticCurveTo(0,R*.98,R*.5,R*.36);g.quadraticCurveTo(0,R*.5,-R*.5,R*.36);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.44,R*.38);g.quadraticCurveTo(0,R*.55,R*.44,R*.38);g.quadraticCurveTo(0,R*.46,-R*.44,R*.38);g.fill();
  // la rata
  g.save();g.translate(R*.0,-R*1.12);
  g.strokeStyle='#f0a5b8';g.lineWidth=R*.08;g.lineCap='round';g.beginPath();g.moveTo(R*.5,R*.12);g.quadraticCurveTo(R*1.1,R*.1,R*1.0,-R*.25);g.quadraticCurveTo(R*.95,-R*.45,R*1.2,-R*.4);g.stroke();
  const rg=g.createLinearGradient(0,-R*.4,0,R*.4);rg.addColorStop(0,'#bfc4ca');rg.addColorStop(1,'#7d838b');g.fillStyle=rg;g.beginPath();g.ellipse(R*.1,R*.02,R*.55,R*.36,0,0,T);g.fill();
  g.beginPath();g.ellipse(-R*.42,R*.02,R*.32,R*.26,0,0,T);g.fill();
  g.fillStyle='#a3a9b0';g.beginPath();g.arc(-R*.22,-R*.32,R*.2,0,T);g.arc(R*.12,-R*.34,R*.2,0,T);g.fill();g.fillStyle='#f4a6bb';g.beginPath();g.arc(-R*.22,-R*.32,R*.12,0,T);g.arc(R*.12,-R*.34,R*.12,0,T);g.fill();
  g.fillStyle='#f4a6bb';g.beginPath();g.arc(-R*.72,R*.04,R*.07,0,T);g.fill();g.fillStyle='#111';g.beginPath();g.arc(-R*.46,-R*.06,R*.05,0,T);g.fill();g.fillStyle='#7a1f2a';g.beginPath();g.ellipse(-R*.6,R*.18,R*.1,R*.06,0,0,T);g.fill();
  g.strokeStyle='#555';g.lineWidth=R*.025;for(const dy of[-.04,.04,.12]){g.beginPath();g.moveTo(-R*.62,R*(.05+dy));g.lineTo(-R*1.0,R*(dy*2+.0));g.stroke()}
  g.fillStyle='#ffe066';g.font=`bold ${R*.36}px Arial Black,Arial`;g.textAlign='center';g.strokeStyle='#e03131';g.lineWidth=R*.09;g.strokeText('¡iii!',R*.95,-R*.62);g.fillText('¡iii!',R*.95,-R*.62);
  g.restore()};
NEWCH.has=id=>!!NEWCH[id]&&typeof NEWCH[id]==='function';
})();
