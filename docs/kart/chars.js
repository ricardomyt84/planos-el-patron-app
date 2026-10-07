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
/* 🐀 EL CHINO: cara de rasgos asiáticos (ojos almendrados), pelo negro lacio y una rata que chilla en la cabeza */
NEWCH.chino=(g,s)=>{const R=s*.34;
  face(g,R,'#ecc79b');
  g.fillStyle='#16110f';g.beginPath();g.arc(0,-R*.12,R*1.07,Math.PI*0.97,Math.PI*2.03);g.lineTo(R*1.03,R*.18);g.lineTo(R*.9,-R*.02);g.quadraticCurveTo(R*.5,-R*.38,0,-R*.36);g.quadraticCurveTo(-R*.5,-R*.38,-R*.9,-R*.02);g.lineTo(-R*1.03,R*.18);g.closePath();g.fill();
  g.fillRect(-R*.96,-R*.66,R*1.92,R*.3);g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-R*.35,-R*.78,R*.35,R*.07,-.2,0,T);g.fill();
  brow(g,-R*.72,-R*.34,-R*.2,-R*.3,R*.09,'#16110f');brow(g,R*.2,-R*.3,R*.72,-R*.34,R*.09,'#16110f');
  for(const sx of[-1,1]){const ix=sx*R*.14,ox=sx*R*.66;g.fillStyle='#fff';g.beginPath();g.moveTo(ix,R*.04);g.quadraticCurveTo(sx*R*.4,-R*.2,ox,-R*.12);g.quadraticCurveTo(sx*R*.42,R*.1,ix,R*.04);g.fill();
    g.fillStyle='#2a1a10';g.beginPath();g.arc(sx*R*.4,-R*.03,R*.1,0,T);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(sx*R*.37,-R*.07,R*.035,0,T);g.fill();
    g.strokeStyle='#16110f';g.lineWidth=R*.06;g.lineCap='round';g.beginPath();g.moveTo(ix,R*.04);g.quadraticCurveTo(sx*R*.4,-R*.2,ox,-R*.12);g.stroke()}
  cheeks(g,R,'rgba(230,100,100,.38)');
  g.fillStyle='#d49a70';g.beginPath();g.ellipse(0,R*.14,R*.08,R*.06,0,0,T);g.fill();
  g.fillStyle='#7a1f2a';g.beginPath();g.moveTo(-R*.5,R*.38);g.quadraticCurveTo(0,R*.98,R*.5,R*.38);g.quadraticCurveTo(0,R*.52,-R*.5,R*.38);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.44,R*.4);g.quadraticCurveTo(0,R*.57,R*.44,R*.4);g.quadraticCurveTo(0,R*.48,-R*.44,R*.4);g.fill();
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
/* 👑 EL PATRÓN DORADO (personaje secreto): la cara del Patrón bañada en oro y con corona */
NEWCH.dorado=(g,s)=>{const w=s*1.5,im=(typeof IMG!=='undefined')?IMG.head:null;
  if(im){const h=w*im.height/im.width,t=document.createElement('canvas');t.width=Math.ceil(w);t.height=Math.ceil(h);const tg=t.getContext('2d');tg.drawImage(im,0,0,w,h);tg.globalCompositeOperation='source-atop';const gr=tg.createLinearGradient(0,0,w,h);gr.addColorStop(0,'rgba(255,236,120,.62)');gr.addColorStop(.5,'rgba(255,190,0,.5)');gr.addColorStop(1,'rgba(214,150,0,.6)');tg.fillStyle=gr;tg.fillRect(0,0,w,h);g.drawImage(t,-w/2,-h*0.62,w,h)}
  const R=s*.34;g.fillStyle='#ffd43b';g.strokeStyle='#8a5a00';g.lineWidth=R*.05;g.beginPath();g.moveTo(-R*.8,-R*1.34);g.lineTo(-R*.8,-R*1.9);g.lineTo(-R*.4,-R*1.55);g.lineTo(0,-R*2.0);g.lineTo(R*.4,-R*1.55);g.lineTo(R*.8,-R*1.9);g.lineTo(R*.8,-R*1.34);g.closePath();g.fill();g.stroke();
  g.fillStyle='#e03131';for(const x of[-.8,0,.8]){g.beginPath();g.arc(R*x,-R*1.78,R*.09,0,Math.PI*2);g.fill()}g.fillStyle='rgba(255,255,255,.8)';for(const[x,y]of[[-.5,-.9],[.55,-.7],[.1,-.3]]){g.beginPath();g.arc(R*x,R*y,R*.06,0,Math.PI*2);g.fill()}};
/* 👨‍👧‍👦 LA FAMILIA CHON: Julián Chon (el guapechón), Clon Chon (el bebé) y Luchi Lon (el grandulón) */
(function(){
const T=Math.PI*2;
const eyeC=(g,R,x,col,ry)=>{g.fillStyle='#fff';g.beginPath();g.ellipse(x,-R*.04,R*.2,R*(ry||.22),0,0,T);g.fill();g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=R*.025;g.stroke();g.fillStyle=col;g.beginPath();g.arc(x+R*.02,-R*.02,R*.12,0,T);g.fill();g.fillStyle='#111';g.beginPath();g.arc(x+R*.02,-R*.02,R*.06,0,T);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x-R*.02,-R*.08,R*.045,0,T);g.fill()};
const spark=(g,x,y,r,col)=>{g.fillStyle=col||'#fff';g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*.18,y-r*.18,x+r,y);g.quadraticCurveTo(x+r*.18,y+r*.18,x,y+r);g.quadraticCurveTo(x-r*.18,y+r*.18,x-r,y);g.quadraticCurveTo(x-r*.18,y-r*.18,x,y-r);g.fill()};
const faceB=(g,R,skin,sy)=>{const gr=g.createRadialGradient(-R*.3,-R*.35,R*.1,0,0,R*1.1);gr.addColorStop(0,'#fff3e4');gr.addColorStop(.35,skin);gr.addColorStop(1,'#d9a67a');g.fillStyle=gr;g.save();g.scale(1,sy||1);g.beginPath();g.arc(0,0,R,0,T);g.fill();g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=R*.05;g.stroke();g.restore()};
const cheekB=(g,R,y,a)=>{g.fillStyle=`rgba(236,110,110,${a||.35})`;g.beginPath();g.arc(-R*.62,y,R*.2,0,T);g.arc(R*.62,y,R*.2,0,T);g.fill()};
const brw=(g,x1,y1,x2,y2,w,col)=>{g.strokeStyle=col;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
/* 😎 JULIÁN CHON, EL GUAPECHÓN: pelo castaño rojizo de lado, ceja levantada, sonrisa de galán y brillito en el diente */
NEWCH.julian=(g,s)=>{const R=s*.34;
  faceB(g,R,'#f4d2b2');
  // pelo: castaño rojizo, copete peinado hacia un lado
  g.fillStyle='#8c4a22';g.beginPath();g.arc(0,-R*.1,R*1.08,Math.PI*.96,Math.PI*2.04);g.lineTo(R*.98,-R*.18);g.quadraticCurveTo(R*.55,-R*.62,-R*.05,-R*.5);g.quadraticCurveTo(-R*.62,-R*.46,-R*1.0,-R*.1);g.closePath();g.fill();
  g.fillStyle='#a85d2e';g.beginPath();g.moveTo(-R*.95,-R*.6);g.quadraticCurveTo(-R*.2,-R*1.35,R*.95,-R*.65);g.quadraticCurveTo(R*.2,-R*.8,-R*.95,-R*.6);g.fill();
  g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(-R*.3,-R*.95,R*.38,R*.07,-.25,0,T);g.fill();
  eyeC(g,R,-R*.38,'#6b3a1c');eyeC(g,R,R*.38,'#6b3a1c');
  brw(g,-R*.66,-R*.36,-R*.18,-R*.3,R*.09,'#6e3a18');brw(g,R*.16,-R*.38,R*.66,-R*.5,R*.09,'#6e3a18'); // ceja izquierda normal, derecha levantada
  cheekB(g,R,R*.3,.38);
  g.fillStyle='#d9a07c';g.beginPath();g.ellipse(0,R*.16,R*.07,R*.05,0,0,T);g.fill();
  // sonrisa ladeada de galán
  g.fillStyle='#7a2a2a';g.beginPath();g.moveTo(-R*.46,R*.4);g.quadraticCurveTo(-R*.05,R*.95,R*.52,R*.34);g.quadraticCurveTo(R*.05,R*.56,-R*.46,R*.4);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.4,R*.43);g.quadraticCurveTo(0,R*.6,R*.46,R*.37);g.quadraticCurveTo(R*.04,R*.7,-R*.4,R*.43);g.fill();
  spark(g,R*.34,R*.52,R*.2,'#fff');spark(g,R*.78,-R*.05,R*.12,'#ffe066');
  // pulsera de estrellitas: "el guapechón"
  g.fillStyle='#ffe066';g.font=`bold ${R*.3}px Arial Black,Arial`;g.textAlign='center';g.strokeStyle='#c92a2a';g.lineWidth=R*.07;g.strokeText('★',-R*.95,-R*1.0);g.fillText('★',-R*.95,-R*1.0)};
/* 🍼 CLON CHON, EL BEBÉ: rizos color fresa-miel, moño rojo de lentejuelas, ojotes y mejillas de bebé */
NEWCH.clon=(g,s)=>{const R=s*.34;
  // rizos detrás de la cara
  g.fillStyle='#c97a34';for(let i=0;i<16;i++){const a=Math.PI*.82+i*(Math.PI*1.36/15),rr=R*(1.0+.12*Math.sin(i*2.3));g.beginPath();g.arc(Math.cos(a)*rr*1.02,Math.sin(a)*rr*1.0-R*.04,R*.3,0,T);g.fill()}
  for(const sx of[-1,1])for(let k=0;k<3;k++){g.beginPath();g.arc(sx*R*(.98+.06*(k%2)),R*(.05+k*.3),R*.27,0,T);g.fill()}
  faceB(g,R,'#f8dcc2',.98);
  // fleco rizado
  g.fillStyle='#d98d3f';for(let i=0;i<9;i++){const x=-R*.82+i*R*.205,y=-R*.62+Math.abs(i-4)*R*.05;g.beginPath();g.arc(x,y,R*.22,0,T);g.fill()}
  g.fillStyle='rgba(255,236,190,.5)';g.beginPath();g.arc(-R*.45,-R*.78,R*.1,0,T);g.arc(R*.15,-R*.82,R*.09,0,T);g.fill();
  // moño rojo de lentejuelas
  g.save();g.translate(R*.08,-R*1.12);g.fillStyle='#d6212a';g.strokeStyle='#8c0f16';g.lineWidth=R*.05;
  for(const sx of[-1,1]){g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(sx*R*.6,-R*.55,sx*R*.95,-R*.12);g.quadraticCurveTo(sx*R*.7,R*.42,0,R*.06);g.closePath();g.fill();g.stroke()}
  g.beginPath();g.arc(0,R*.02,R*.18,0,T);g.fill();g.stroke();
  g.fillStyle='rgba(255,255,255,.75)';for(const[x,y]of[[-.55,-.1],[-.75,-.02],[.55,-.12],[.72,-.02],[-.4,.1],[.4,.08]]){g.beginPath();g.arc(R*x,R*y,R*.045,0,T);g.fill()}g.restore();
  // ojotes de bebé con pestañas
  eyeC(g,R,-R*.36,'#7a4a22',.27);eyeC(g,R,R*.36,'#7a4a22',.27);
  g.strokeStyle='#5a3418';g.lineWidth=R*.05;g.lineCap='round';for(const sx of[-1,1]){g.beginPath();g.moveTo(sx*R*.56,-R*.18);g.lineTo(sx*R*.7,-R*.26);g.moveTo(sx*R*.5,-R*.24);g.lineTo(sx*R*.6,-R*.36);g.stroke()}
  brw(g,-R*.6,-R*.4,-R*.18,-R*.44,R*.06,'#a8642a');brw(g,R*.18,-R*.44,R*.6,-R*.4,R*.06,'#a8642a');
  cheekB(g,R,R*.3,.5);
  g.fillStyle='#e0a98a';g.beginPath();g.ellipse(0,R*.14,R*.06,R*.045,0,0,T);g.fill();
  g.fillStyle='#8a2a30';g.beginPath();g.moveTo(-R*.34,R*.4);g.quadraticCurveTo(0,R*.88,R*.34,R*.4);g.quadraticCurveTo(0,R*.5,-R*.34,R*.4);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(-R*.3,R*.42);g.quadraticCurveTo(0,R*.52,R*.3,R*.42);g.quadraticCurveTo(0,R*.5,-R*.3,R*.42);g.fill();g.fillStyle='#ff8fa3';g.beginPath();g.ellipse(0,R*.66,R*.14,R*.08,0,0,T);g.fill();
  g.font=`${R*.55}px serif`;g.textAlign='center';g.fillText('🍼',R*1.05,R*.95)};
/* 🚚 LUCHI LON, EL GRANDULÓN: cara larga, pelo ondulado rubio oscuro y la camioneta roja de su playera */
NEWCH.luchi=(g,s)=>{const R=s*.34;
  faceB(g,R,'#f2d0ac',1.14);
  // pelo ondulado, largo hacia atrás y hacia los lados
  g.fillStyle='#b98f4c';g.beginPath();g.arc(0,-R*.08,R*1.12,Math.PI*.93,Math.PI*2.07);g.lineTo(R*1.12,R*.22);g.quadraticCurveTo(R*.9,-R*.1,R*.7,-R*.55);g.quadraticCurveTo(R*.2,-R*.35,-R*.3,-R*.62);g.quadraticCurveTo(-R*.8,-R*.3,-R*1.0,R*.22);g.closePath();g.fill();
  g.fillStyle='#d1a85e';for(let i=0;i<6;i++){const x=-R*.85+i*R*.34;g.beginPath();g.ellipse(x,-R*1.0+Math.abs(i-2.5)*R*.06,R*.26,R*.18,.5*Math.sin(i),0,T);g.fill()}
  g.fillStyle='rgba(255,246,214,.45)';g.beginPath();g.ellipse(-R*.2,-R*1.0,R*.4,R*.07,-.15,0,T);g.fill();
  eyeC(g,R,-R*.38,'#4a78a8',.2);eyeC(g,R,R*.38,'#4a78a8',.2);
  brw(g,-R*.66,-R*.34,-R*.18,-R*.34,R*.085,'#8a6a32');brw(g,R*.18,-R*.34,R*.66,-R*.34,R*.085,'#8a6a32');
  cheekB(g,R,R*.36,.3);
  g.fillStyle='#d6a07c';g.beginPath();g.ellipse(0,R*.2,R*.07,R*.05,0,0,T);g.fill();
  g.strokeStyle='#8a2a2a';g.lineWidth=R*.08;g.lineCap='round';g.beginPath();g.arc(0,R*.42,R*.34,.2*Math.PI,.8*Math.PI);g.stroke();
  // la camioneta roja con arbolito de su playera
  g.save();g.translate(R*1.0,R*1.0);g.fillStyle='#fff';g.beginPath();g.arc(0,0,R*.46,0,T);g.fill();g.strokeStyle='#d6212a';g.lineWidth=R*.06;g.stroke();
  g.fillStyle='#d6212a';g.fillRect(-R*.32,-R*.02,R*.64,R*.2);g.fillRect(-R*.06,-R*.2,R*.26,R*.2);g.fillStyle='#2f9e44';g.beginPath();g.moveTo(-R*.2,-R*.02);g.lineTo(-R*.12,-R*.26);g.lineTo(-R*.04,-R*.02);g.fill();
  g.fillStyle='#222';g.beginPath();g.arc(-R*.18,R*.2,R*.07,0,T);g.arc(R*.18,R*.2,R*.07,0,T);g.fill();g.restore()};
})();
