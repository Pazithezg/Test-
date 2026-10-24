const ACT={"ดำน้ำ":["🤿","#0A8FB5","#064560"],"พายเรือคายัค":["🛶","#14A38B","#0A6E8F"],"เดินป่า":["🥾","#3E9B63","#145A47"],"ล่องเรือ":["⛵","#2F7FD1","#0A4A7A"],"เล่นเซิร์ฟ":["🏄","#12A7C9","#0A5C99"],"เที่ยวทะเล":["🏝️","#2CC1C9","#0A7F9A"]};
// ราคาและข้อมูลเป็นตัวอย่างสำหรับออกแบบหน้าจอ ต้องแทนด้วยข้อมูลจริงที่ตรวจสอบได้
const D=[
["ดำน้ำ","ดำน้ำเกาะเต่า","สุราษฎร์ธานี",1200,10.10,99.84,4.7,860,95,0,"4 ชม."],
["ดำน้ำ","ดำน้ำหมู่เกาะสิมิลัน","พังงา",1500,8.65,97.64,4.8,1240,100,0,"1 วัน"],
["ดำน้ำ","ดำน้ำเกาะหลีเป๊ะ","สตูล",1000,6.49,99.30,4.6,730,88,0,"5 ชม."],
["ดำน้ำ","ดำน้ำหมู่เกาะพีพี","กระบี่",1300,7.74,98.77,4.7,1510,98,0,"6 ชม."],
["ดำน้ำ","ดำน้ำตื้นเกาะกระดาน","ตรัง",900,7.43,99.31,4.5,64,35,1,"4 ชม."],
["ดำน้ำ","ดำน้ำตื้นหมู่เกาะลิบง ชุมชนบ้านปากบาง","ตรัง",750,7.25,99.38,0,0,12,1,"3 ชม."],
["พายเรือคายัค","พายคายัคอ่าวท่าเลน","กระบี่",800,8.20,98.85,4.8,970,90,0,"3 ชม."],
["พายเรือคายัค","พายคายัคป่าชายเลนบ้านคลองประสงค์","กระบี่",650,8.07,99.00,4.9,28,20,1,"2.5 ชม."],
["พายเรือคายัค","พายคายัคเกาะยาวน้อย","พังงา",900,8.07,98.62,4.6,210,50,1,"3 ชม."],
["เดินป่า","เดินป่าเขาสก","สุราษฎร์ธานี",600,8.92,98.53,4.7,520,75,0,"1 วัน"],
["เดินป่า","เดินป่าเขาหลวง","นครศรีธรรมราช",700,8.42,99.72,4.6,95,40,1,"2 วัน"],
["เดินป่า","เดินป่าบาลา-ฮาลา","นราธิวาส",900,5.80,101.80,0,0,8,1,"2 วัน"],
["ล่องเรือ","ล่องเรือทะเลน้อย ชมนกและบัวแดง","พัทลุง",350,7.80,100.20,4.7,140,45,1,"2 ชม."],
["ล่องเรือ","ล่องเรืออ่าวพังงา","พังงา",1400,8.27,98.50,4.7,1100,92,0,"6 ชม."],
["ล่องเรือ","ล่องเรืออุทยานหมู่เกาะอ่างทอง","สุราษฎร์ธานี",1600,9.63,99.68,4.8,640,80,0,"1 วัน"],
["เล่นเซิร์ฟ","เล่นเซิร์ฟหาดกะตะ","ภูเก็ต",1500,7.82,98.30,4.6,430,70,0,"2 ชม."],
["เล่นเซิร์ฟ","เล่นเซิร์ฟเขาหลัก","พังงา",1300,8.64,98.24,4.5,120,42,1,"2 ชม."],
["เที่ยวทะเล","เที่ยวทะเลหาดสิเกา","ตรัง",450,7.50,99.25,4.4,52,25,1,"ครึ่งวัน"],
["เที่ยวทะเล","เที่ยวทะเลเกาะสมุย","สุราษฎร์ธานี",900,9.51,100.03,4.6,1380,96,0,"1 วัน"],
["เที่ยวทะเล","เที่ยวทะเลเกาะยาวใหญ่ ชุมชนบ้านท่าเขา","พังงา",600,7.99,98.60,0,0,10,1,"1 วัน"],
["ดำน้ำ","ดำน้ำตื้นเกาะไหง","ตรัง",800,7.40,99.35,4.6,41,22,1,"4 ชม."],
["ดำน้ำ","ดำน้ำตื้นเกาะอาดัง-ราวี","สตูล",950,6.50,99.30,4.7,77,38,1,"5 ชม."],
["พายเรือคายัค","พายคายัคทะเลสาบสงขลา ชุมชนเกาะยอ","สงขลา",650,7.17,100.53,0,0,9,1,"2.5 ชม."],
["พายเรือคายัค","พายคายัคป่าพรุควนเคร็ง","นครศรีธรรมราช",500,8.00,100.00,4.8,18,14,1,"2 ชม."],
["พายเรือคายัค","พายคายัคคลองท่อม","กระบี่",600,7.92,99.17,4.5,33,18,1,"3 ชม."],
["เดินป่า","เดินป่าอุทยานแห่งชาติทะเลบัน","สตูล",700,6.72,100.17,4.7,60,30,1,"4 ชม."],
["เดินป่า","เดินป่าเขาพนมเบญจา","กระบี่",500,8.25,98.88,4.6,110,48,1,"3 ชม."],
["เดินป่า","เดินป่าชุมชนบ้านคีรีวง","นครศรีธรรมราช",450,8.40,99.70,4.8,85,36,1,"ครึ่งวัน"],
["ล่องเรือ","ล่องเรือชมหิ่งห้อยแม่น้ำตาปี","สุราษฎร์ธานี",400,9.13,99.33,0,0,11,1,"2 ชม."],
["ล่องเรือ","ล่องเรือชมโลมาสีชมพู ขนอม","นครศรีธรรมราช",800,9.20,99.85,4.6,72,34,1,"3 ชม."],
["ล่องเรือ","ล่องเรือทะเลสาบสงขลา ชมวิถีประมง","สงขลา",400,7.25,100.50,4.5,25,15,1,"2.5 ชม."],
["เล่นเซิร์ฟ","เล่นเซิร์ฟหาดบางเทา","ภูเก็ต",1400,8.00,98.29,4.4,66,32,1,"2 ชม."],
["เล่นเซิร์ฟ","เล่นเซิร์ฟหาดคลองดาว เกาะลันตา","กระบี่",1000,7.62,99.04,0,0,10,1,"2 ชม."],
["เที่ยวทะเล","เที่ยวทะเลเกาะตะรุเตา","สตูล",1100,6.65,99.65,4.8,150,55,1,"2 วัน"],
["เที่ยวทะเล","เที่ยวทะเลเกาะสุกร ชุมชนบ้านหมู","ตรัง",550,7.30,99.28,4.7,30,16,1,"1 วัน"],
["เที่ยวทะเล","เที่ยวทะเลหาดทรายแก้ว","ปัตตานี",400,6.87,101.30,0,0,6,1,"ครึ่งวัน"]
].map((r,i)=>({id:i,act:r[0],name:r[1],prov:r[2],price:r[3],lat:r[4],lng:r[5],rate:r[6],rev:r[7],pop:r[8],gem:r[9],dur:r[10]}));
const PROV=[["ผู้ให้บริการชุมชน",1,["อุปกรณ์พื้นฐาน","ไกด์ท้องถิ่น","น้ำดื่ม"]],["ทัวร์มาตรฐาน",1.2,["อุปกรณ์ครบ","ไกด์","อาหารว่าง","ประกันอุบัติเหตุ"]],["แพ็กเกจพรีเมียม",1.55,["อุปกรณ์ครบ","ไกด์ส่วนตัว","อาหารกลางวัน","ประกันอุบัติเหตุ","รับส่งโรงแรม"]]];
const HL={"ดำน้ำ":["น้ำใสและแนวปะการังสมบูรณ์","มีผู้สอนดูแลตลอดการดำน้ำ","เหมาะกับมือใหม่"],"พายเรือคายัค":["พายผ่านป่าชายเลนและถ้ำหินปูน","เรือเสถียร เหมาะทุกวัย","มีช่วงให้ว่ายน้ำและถ่ายรูป"],"เดินป่า":["เส้นทางธรรมชาติร่มรื่น","มีไกด์ท้องถิ่นนำทาง","ชมน้ำตกและสัตว์ป่า"],"ล่องเรือ":["ชมวิวทะเลและเกาะรอบด้าน","เรือมีเสื้อชูชีพครบ","แวะจุดชมวิวหลายจุด"],"เล่นเซิร์ฟ":["มีครูสอนตัวต่อตัว","เช่าบอร์ดได้","คลื่นเหมาะกับผู้เริ่มต้น"],"เที่ยวทะเล":["ชายหาดสงบ","เหมาะกับครอบครัว","มีร้านอาหารพื้นถิ่น"]};
let CUR=null;const S={q:"",cat:"",prefs:[],gem:false,sort:"near",sel:null,u:{lat:9.14,lng:99.33,label:"สุราษฎร์ธานี (ค่าเริ่มต้น)"}};
const $=s=>document.querySelector(s),fmt=n=>n.toLocaleString("th-TH");
const km=(a,b)=>{const R=6371,r=x=>x*Math.PI/180,dl=r(b.lat-a.lat),dg=r(b.lng-a.lng),h=Math.sin(dl/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dg/2)**2;return Math.round(2*R*Math.asin(Math.sqrt(h)))};
const dist=p=>km(S.u,p);
const wave='<svg viewBox="0 0 400 36" preserveAspectRatio="none"><path d="M0 18Q50 4 100 18T200 18T300 18T400 18V36H0Z" fill="rgba(255,255,255,.28)"/><path d="M0 26Q50 14 100 26T200 26T300 26T400 26V36H0Z" fill="rgba(255,255,255,.5)"/></svg>';
const scene=p=>{const i=p.id,r=k=>((i*9301+k*49297+7)%233280)/233280,sk=[['#7FD3EE','#E6F7FB'],['#FF9E6D','#FFE2B8'],['#8FB8E8','#F5D9E8']][i%3],sx=40+r(1)*220,sy=30+r(2)*22,kx=110+r(5)*80,bx=90+r(8)*100,px=200+r(9)*60,pa=60+r(6)*40,pb=160+r(7)*40;
const def=`<defs><linearGradient id='s${i}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${sk[0]}'/><stop offset='1' stop-color='${sk[1]}'/></linearGradient><linearGradient id='u${i}' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#2CC1C9'/><stop offset='1' stop-color='#064560'/></linearGradient></defs>`;
const sky=`<rect width='300' height='160' fill='url(#s${i})'/><circle cx='${sx}' cy='${sy}' r='${14+r(3)*8}' fill='#FFF3C4' opacity='.9'/>`;let g=sky;
if(p.act==='ดำน้ำ'){g=`<rect width='300' height='160' fill='url(#u${i})'/>`+[0,1,2].map(k=>`<polygon points='${40+k*90},0 ${70+k*90},0 ${20+k*90+r(k+4)*40},160 ${k*90},160' fill='#fff' opacity='.07'/>`).join('')+Array.from({length:8},(_,k)=>{const x=8+k*37+r(k+10)*12,h=24+r(k+20)*44;return `<rect x='${x}' y='${160-h}' width='${12+r(k+30)*8}' height='${h}' rx='7' fill='${k%2?'#FF6F4D':'#FF9E7A'}'/>`}).join('')+[0,1,2].map(k=>{const x=40+r(k+40)*220,y=40+r(k+50)*60;return `<g fill='#FFD166'><ellipse cx='${x}' cy='${y}' rx='9' ry='5'/><path d='M${x+8} ${y}l8-5v10z'/></g>`}).join('')+[0,1,2,3].map(k=>`<circle cx='${30+r(k+60)*240}' cy='${20+r(k+70)*90}' r='${2+r(k+80)*3}' fill='none' stroke='#fff' opacity='.6'/>`).join('')}
else if(p.act==='พายเรือคายัค'){g=sky+`<path d='M0 105V50Q25 12 55 55L75 28Q105 0 135 62V105Z' fill='#6B8A78'/><path d='M190 105V60Q215 20 245 52L265 34Q290 20 300 48V105Z' fill='#587A68'/><path d='M0 105Q20 90 45 100T95 98T150 104H0Z' fill='#2F7A4F'/><rect y='102' width='300' height='58' fill='#1FA3A8'/><path d='M0 125Q40 118 80 126T160 124T300 126V160H0Z' fill='#0A6E8F' opacity='.5'/><ellipse cx='${kx}' cy='128' rx='30' ry='5' fill='#FF6F4D'/><circle cx='${kx}' cy='116' r='5' fill='#FFE0B2'/><rect x='${kx-4}' y='120' width='8' height='8' rx='2' fill='#12303B'/><path d='M${kx-26} 112L${kx+26} 124' stroke='#12303B' stroke-width='2'/>`}
else if(p.act==='เดินป่า'){g=sky+`<path d='M0 115L${pa} 48L${pa+50} 100L${pb} 40L${pb+70} 105L300 70V160H0Z' fill='#3E9B63'/><path d='M${pb} 44V96' stroke='#fff' stroke-width='3' opacity='.85'/><path d='M0 135L${pa+20} 88L${pa+90} 125L${pb+10} 92L300 128V160H0Z' fill='#1F6B4A'/>`+Array.from({length:9},(_,k)=>`<path d='M${k*36+r(k+11)*14} 160l8-26 8 26z' fill='#145A47'/>`).join('')+`<path d='M150 160Q130 140 160 128T150 105' stroke='#F2D7A6' stroke-width='4' fill='none'/>`}
else if(p.act==='ล่องเรือ'){g=sky+`<path d='M0 96Q40 70 70 92Q90 78 120 96Z' fill='#2F6F5A'/><path d='M190 96Q220 60 250 88Q275 74 300 96Z' fill='#2A5F4D'/><rect y='94' width='300' height='66' fill='#1B8FC0'/><path d='M0 120Q40 112 80 120T160 120T240 120T300 120V160H0Z' fill='#0A6E8F' opacity='.55'/><path d='M${bx} 124h70l-10 14h-50z' fill='#fff'/><path d='M${bx+35} 124V76l28 48z' fill='#FF6F4D'/><path d='M${bx+35} 76V124' stroke='#12303B' stroke-width='2'/>`}
else if(p.act==='เล่นเซิร์ฟ'){g=sky+`<rect y='90' width='300' height='70' fill='#0A6E8F'/><path d='M0 160V108Q70 30 150 66Q205 92 180 128Q130 96 80 130Q40 150 0 160Z' fill='#12A7C9'/><path d='M150 66Q205 92 180 128Q176 100 150 84Z' fill='#fff' opacity='.85'/><path d='M0 160Q100 125 220 150T300 140V160Z' fill='#fff' opacity='.3'/><ellipse cx='112' cy='117' rx='18' ry='3' fill='#FF6F4D' transform='rotate(-15 112 117)'/><circle cx='112' cy='101' r='4' fill='#FFE0B2'/><path d='M112 105V114' stroke='#12303B' stroke-width='4'/>`}
else if(p.act==='เที่ยวทะเล'){g=sky+`<rect y='90' width='300' height='30' fill='#2CC1C9'/><path d='M0 108Q75 98 150 108T300 106V120H0Z' fill='#fff' opacity='.5'/><path d='M0 118Q100 108 300 124V160H0Z' fill='#F4DFA8'/><path d='M${px} 150Q${px-6} 110 ${px-14} 82' stroke='#8B5E3C' stroke-width='5' fill='none'/>`+[-70,-25,25,70].map(a=>`<ellipse cx='${px+4}' cy='82' rx='20' ry='6' fill='#2F9B5A' transform='rotate(${a} ${px-14} 82)'/>`).join('')}
return `<svg class='sc' viewBox='0 0 300 160' preserveAspectRatio='xMidYMid slice' aria-hidden='true'>${def}${g}</svg>`};
const photo=p=>{return `<div class="ph" role="img" aria-label="ภาพประกอบ ${p.name}">${scene(p)}${p.gem?'<span class="tag">ค้นพบใหม่</span>':''}</div>`};
const ratingTxt=p=>p.rev?`⭐ ${p.rate} (${fmt(p.rev)} รีวิว)`:"ยังไม่มีรีวิว";
function list(){let r=D.filter(p=>{const q=S.q.trim();return(!S.cat||p.act===S.cat)&&(S.cat||S.q.trim()||!S.prefs.length||S.prefs.includes(p.act))&&(!S.gem||p.gem)&&(!q||(p.act+p.name+p.prov).includes(q))});
const f={near:(a,b)=>dist(a)-dist(b),low:(a,b)=>a.price-b.price,high:(a,b)=>b.price-a.price,pop:(a,b)=>b.pop-a.pop,new:(a,b)=>b.gem-a.gem||a.rev-b.rev||dist(a)-dist(b)};
return r.sort(f[S.sort])}
function home(){const r=list(),F=feat(r),sorts=[["near","ใกล้ฉัน"],["low","ราคาถูกที่สุด"],["high","ราคาแพงที่สุด"],["pop","ยอดนิยม"],["new","ค้นพบที่ใหม่"]];
$("#app").innerHTML=`<header><div class="wrap"><div class="brand">SOUTH <b>SEEK</b></div><p class="sub">ค้นหากิจกรรมท่องเที่ยวทั่วภาคใต้ เทียบราคา แล้วเลือกที่ใช่</p>
<div class="search"><input id="q" value="${S.q}" placeholder="ค้นหา เช่น ดำน้ำ พายเรือคายัค เดินป่า" aria-label="ค้นหากิจกรรม"><button id="go">ค้นหา</button></div></div>${wave.replace('rgba(255,255,255,.28)','var(--bg)').replace('rgba(255,255,255,.5)','var(--bg)')}</header>
<main class="wrap"><div class="chips" role="group" aria-label="ประเภทกิจกรรม"><button class="chip" aria-pressed="${!S.cat&&!S.prefs.length}" data-c="">ทั้งหมด</button>${Object.keys(ACT).map(c=>`<button class="chip" aria-pressed="${S.cat===c}" data-c="${c}">${ACT[c][0]} ${c}</button>`).join("")}</div>
<div class="chips sorts" role="group" aria-label="เรียงลำดับ">${sorts.map(s=>`<button class="chip" aria-pressed="${S.sort===s[0]}" data-s="${s[0]}">${s[1]}</button>`).join("")}</div>
<div class="chips"><button class="chip" id="gem" aria-pressed="${S.gem}">🌱 เฉพาะที่ยังไม่ค่อยมีคนรู้จัก</button></div>
<div class="loc note"><span>ระยะทางคำนวณจาก: ${S.u.label}</span><button id="gps">ใช้ตำแหน่งของฉัน</button></div>
<div class="count">พบ ${r.length} กิจกรรมในภาคใต้${S.prefs.length&&!S.cat&&!S.q.trim()?" ตามความสนใจของคุณ":""}${S.q?` สำหรับ “${S.q}”`:""}</div>
${F.html}${r.length?`${F.html&&F.rest.length?'<h2 style="margin-top:20px">ตัวเลือกอื่น ๆ</h2>':''}<div class="grid">${F.rest.map(card).join("")}</div>`:'<div class="empty">ไม่พบกิจกรรมที่ตรงกัน ลองค้นหาด้วยคำอื่น เช่น ดำน้ำ หรือเลือกประเภทด้านบน</div>'}
<footer>ราคาและคะแนนในต้นแบบนี้เป็นข้อมูลตัวอย่างสำหรับออกแบบหน้าจอ ต้องเปลี่ยนเป็นข้อมูลจริงที่ตรวจสอบได้ก่อนใช้งาน ภาพประกอบเป็นกราฟิกชั่วคราว รอแทนด้วยรูปจริงของสถานที่</footer></main>`;
$("#go").onclick=()=>{S.q=$("#q").value;home()};$("#q").onkeydown=e=>{if(e.key==="Enter"){S.q=e.target.value;home()}};
document.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>{S.cat=b.dataset.c;S.prefs=[];home()});
document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{S.sort=b.dataset.s;home()});
document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{S.sel=+b.dataset.id;detail()});
$("#gem").onclick=()=>{S.gem=!S.gem;home()};$("#gps").onclick=()=>{if(!navigator.geolocation){alert("อุปกรณ์นี้ไม่รองรับการระบุตำแหน่ง");return}
navigator.geolocation.getCurrentPosition(p=>{S.u={lat:p.coords.latitude,lng:p.coords.longitude,label:"ตำแหน่งของคุณ"};home()},()=>alert("ไม่สามารถระบุตำแหน่งได้ จึงใช้สุราษฎร์ธานีเป็นจุดเริ่มต้นต่อไป"))};}
const card=p=>`<article class="card">${photo(p)}<div class="body"><h3>${p.name}</h3><div class="meta">📍 ${p.prov} · ห่างจากคุณ ${fmt(dist(p))} กม.</div><div class="meta">${ratingTxt(p)}</div>
<div class="row"><div class="price">เริ่มต้น<br><b>${fmt(p.price)}</b> บาท/คน</div><button class="btn" data-id="${p.id}" aria-label="ดูรายละเอียดและเปรียบเทียบราคา ${p.name}">ดูราคา</button></div></div></article>`;
function detail(){const p=D[S.sel],pv=PROV.map(x=>({n:x[0],pr:Math.round(p.price*x[1]/50)*50,inc:x[2]}));
const min=Math.min(...pv.map(x=>x.pr));CUR={p,pv};
const near=D.filter(o=>o.id!==p.id).map(o=>({o,d:km(p,o)})).filter(x=>x.d<=250).sort((a,b)=>a.d-b.d).slice(0,4);
$("#app").innerHTML=`<div class="wrap det"><button class="back" id="bk">← กลับไปผลการค้นหา</button>${photo(p)}
<h2 style="font-size:24px;margin-bottom:2px">${p.name}</h2><div class="meta">📍 ${p.prov} · ${ratingTxt(p)}</div>
<div class="facts"><span>เริ่มต้น <b style="color:var(--coral)">${fmt(p.price)}</b> บาท/คน</span><span>ระยะเวลา ${p.dur}</span><span>ห่างจากคุณ ${fmt(dist(p))} กม.</span></div>
${INFO[p.name]?`<div class="meet"><b>✅ ข้อมูลที่ตรวจสอบแล้ว</b><ul class="hl">${INFO[p.name].map(s=>`<li>${s}</li>`).join("")}</ul><span class="note">อ้างอิงข่าวและข้อมูลสาธารณะ ควรยืนยันกับผู้ให้บริการอีกครั้งก่อนจอง</span></div>`:""}<h2>จุดเด่น</h2><ul class="hl">${HL[p.act].map(x=>`<li>${x}</li>`).join("")}</ul>
<h2>เงื่อนไขการใช้บริการ</h2><ul class="hl"><li>จองล่วงหน้าอย่างน้อย 1 วัน</li><li>ยกเลิกฟรีก่อนวันเดินทาง 48 ชั่วโมง</li><li>กิจกรรมอาจเลื่อนหรือยกเลิกหากสภาพอากาศไม่เหมาะสม</li></ul>
<h2>เปรียบเทียบผู้ให้บริการ</h2><div class="tw"><table><thead><tr><th>ผู้ให้บริการ</th><th>ราคา/คน</th><th>สิ่งที่รวมอยู่ในแพ็กเกจ</th><th></th></tr></thead><tbody>
${pv.map((x,i)=>`<tr class="${x.pr===min?"best":""}"><td>${x.n}${x.pr===min?'<span class="badge">ถูกที่สุด</span>':""}</td><td><b>${fmt(x.pr)}</b> บาท</td><td>${x.inc.join(" · ")}</td><td><button class="btn ghost" onclick="pkg(${i})">ดูรายละเอียด</button> <button class="btn" onclick="book(${i})">จอง</button></td></tr>`).join("")}</tbody></table></div>
<h2>ตำแหน่ง</h2><div class="map"><div>พิกัด ${p.lat.toFixed(3)}, ${p.lng.toFixed(3)}</div><a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noopener">เปิดในแผนที่</a><a href="https://www.google.com/maps/search/${encodeURIComponent(p.name+' '+p.prov)}" target="_blank" rel="noopener">📷 ดูรูปจริงบน Google Maps</a><a href="https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(p.name)}&ns6=1" target="_blank" rel="noopener">🖼️ ดูรูปสาธารณะบน Wikimedia Commons</a></div>
<h2>สถานที่ใกล้เคียง</h2><div class="grid">${near.map(x=>`<article class="card"><div class="body"><h3>${x.o.name}</h3><div class="meta">📍 ${x.o.prov} · ห่างจากที่นี่ ${fmt(x.d)} กม.</div><div class="row"><div class="price">เริ่มต้น <b>${fmt(x.o.price)}</b> บาท</div><button class="btn ghost" data-id="${x.o.id}">ดูรายละเอียด</button></div></div></article>`).join("")}</div>
<footer>ข้อมูลผู้ให้บริการและราคาเป็นตัวอย่างสำหรับต้นแบบ</footer></div>`;
$("#bk").onclick=home;document.querySelectorAll("[data-id]").forEach(b=>b.onclick=()=>{S.sel=+b.dataset.id;detail();scrollTo(0,0)});scrollTo(0,0)}
const TI=[{n:'ชุมชน',c:'#2F9B5A',who:'กลุ่มท่องเที่ยวโดยชุมชนท้องถิ่น',grp:'กลุ่มเล็ก 4–8 คน',meet:'จุดนัดพบที่ท่าเรือหรือศูนย์ชุมชนท้องถิ่น (เดินทางไปเอง)',why:['รายได้กลับเข้าชุมชนและผู้ประกอบการรายเล็กโดยตรง','ไกด์เป็นคนในพื้นที่ รู้จักจุดลับที่ทัวร์ใหญ่ไม่พาไป','กลุ่มเล็ก เงียบสงบ ไม่แออัด','ได้ลองอาหารและวิถีชีวิตพื้นถิ่น'],note:'สิ่งอำนวยความสะดวกเรียบง่าย ไม่มีรถรับส่ง และควรจองล่วงหน้า'},{n:'มาตรฐาน',c:'#0A6E8F',who:'บริษัททัวร์ที่ได้รับอนุญาต',grp:'กลุ่ม 10–20 คน',meet:'ท่าเรือหลักหรือจุดนัดพบของพื้นที่ (เวลาเดินเรือแน่นอน)',why:['ตารางเวลาชัดเจนและมีผู้ให้บริการประจำ','อุปกรณ์ครบและมีประกันอุบัติเหตุ','ราคาคุ้มค่า เหมาะกับกลุ่มเพื่อนและครอบครัว'],note:'กลุ่มใหญ่ จุดชมวิวอาจมีผู้คนเยอะในช่วงไฮซีซัน'},{n:'พรีเมียม',c:'#FF6F4D',who:'ผู้ให้บริการระดับพรีเมียม',grp:'กลุ่มส่วนตัว 2–6 คน',meet:'รับถึงโรงแรมหรือที่พัก แล้วไปลงเรือด้วยกัน',why:['ไกด์ส่วนตัวดูแลใกล้ชิด','ยืดหยุ่นเวลาและเส้นทางตามที่ต้องการ','รวมอาหารกลางวันและรับส่งโรงแรม'],note:'ราคาสูงกว่าแพ็กเกจอื่น'}];
const ST={'ดำน้ำ':['พบไกด์ รับอุปกรณ์ และฟังคำแนะนำความปลอดภัย','ลงเรือไปยังจุดดำน้ำ','ดำน้ำชมปะการังและฝูงปลา','กลับเข้าฝั่งและส่งคืนอุปกรณ์'],'พายเรือคายัค':['พบไกด์ รับเรือคายัคและเสื้อชูชีพ','ฝึกพายสั้น ๆ แล้วออกเดินทาง','พายผ่านป่าชายเลนหรือหน้าผา แวะถ่ายรูป','กลับสู่จุดเริ่มต้น'],'เดินป่า':['พบไกด์ที่จุดเริ่มต้นเส้นทาง','เดินตามเส้นทางธรรมชาติ','พักชมน้ำตกหรือจุดชมวิว','เดินกลับสู่จุดเริ่มต้น'],'ล่องเรือ':['ขึ้นเรือที่ท่าเรือ','ล่องเรือชมวิวและเกาะรอบข้าง','แวะจุดชมวิวหรือจุดพัก','กลับเข้าท่าเรือ'],'เล่นเซิร์ฟ':['พบครูที่ชายหาด รับบอร์ด','เรียนพื้นฐานบนทราย','ลงน้ำฝึกเล่นคลื่น','พักและสรุปบทเรียน'],'เที่ยวทะเล':['พบไกด์ที่ท่าเรือหรือชายหาด','เดินทางไปยังหาดหรือเกาะ','เล่นน้ำ พักผ่อน ถ่ายรูป','กลับสู่ท่าเรือ']};
function pkg(i){const{p,pv}=CUR,x=pv[i],t=TI[i],st=[...ST[p.act]];
if(i===0)st.splice(2,0,'แวะชมวิถีชีวิตและชิมอาหารพื้นถิ่นกับคนในชุมชน');
if(i===2){st.unshift('รถรับถึงโรงแรมหรือที่พัก');st.push('รับประทานอาหารกลางวัน แล้วรถส่งกลับที่พัก')}
const o=document.createElement('div');o.className='ov';const gal=[0,1,2].map(k=>`<div class='gi'>${scene({...p,id:p.id*7+i*3+k})}</div>`).join('');
o.innerHTML=`<div class='sheet' role='dialog' aria-modal='true' aria-label='รายละเอียดแพ็กเกจ ${t.n}'><button class='x' aria-label='ปิด'>✕</button><span class='pill' style='background:${t.c}'>${t.n}</span><h2 style='margin:8px 0 2px'>${p.name}</h2><div class='meta'>${t.who} · ${fmt(x.pr)} บาท/คน</div><div class='gal'>${gal}</div><p class='note'>ภาพประกอบ จะแทนด้วยรูปจริงจากผู้ให้บริการเมื่อได้รับรูป</p>
<h2>ข้อมูลโดยย่อ</h2><div class='facts'><span>👥 ${t.grp}</span><span>⏱️ ${p.dur}</span></div><div class='meet'><b>จุดนัดพบ/ขึ้นเรือ</b><br>${t.meet}</div>
<h2>โปรแกรมการเดินทาง</h2><ol class='tl'>${st.map(s=>`<li>${s}</li>`).join('')}</ol>
<h2>สิ่งที่รวมอยู่ในแพ็กเกจ</h2><ul class='hl'>${x.inc.map(s=>`<li>${s}</li>`).join('')}</ul>
<h2>ทำไมต้องเลือกแพ็กเกจ${t.n}</h2><ul class='hl'>${t.why.map(s=>`<li>${s}</li>`).join('')}</ul>
<h2>ข้อควรรู้</h2><p style='margin:4px 0'>${t.note}</p>
<button class='btn pay' id='pk'>จองแพ็กเกจนี้ · ${fmt(x.pr)} บาท/คน</button><p class='note'>ข้อมูลผู้ให้บริการและจุดนัดพบเป็นตัวอย่างสำหรับต้นแบบ</p></div>`;
document.body.appendChild(o);const close=()=>{o.remove();document.removeEventListener('keydown',esk)},esk=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',esk);
o.querySelector('.x').onclick=close;o.onclick=e=>{if(e.target===o)close()};o.querySelector('#pk').onclick=()=>{close();book(i)}}
const INFO={'ดำน้ำหมู่เกาะสิมิลัน':['เปิดฤดูท่องเที่ยว 15 ต.ค. 2569 ถึง 15 พ.ค. 2570 ปิดนอกฤดูเพื่อฟื้นฟูธรรมชาติ','ติดต่ออุทยานแห่งชาติหมู่เกาะสิมิลัน โทร 076-453272','เรือนำเที่ยวต้องได้รับอนุญาตจากอุทยาน เลือกผู้ให้บริการที่มีใบอนุญาต','ตามรายงานข่าว ทุกทัวร์แวะเกาะเมียง (เกาะ 4) ซึ่งเป็นที่ทำการอุทยาน'],'ดำน้ำเกาะหลีเป๊ะ':['เกาะหลีเป๊ะอยู่นอกเขตควบคุมของอุทยานตะรุเตา แต่จุดดำน้ำรอบ ๆ เช่น อาดัง-ราวี อยู่ในเขตอุทยาน','จุดดำน้ำตื้นที่พบในโปรแกรมทัวร์: เกาะหินซ้อน เกาะผึ้ง เกาะไผ่ หมู่เกาะดง เกาะรอกลอย','เคยมีการจำกัดจำนวนนักท่องเที่ยวต่อจุด เช่น กองหินจาบัง 100 คนต่อช่วงเวลา (ข้อมูลปี 2561) เช็กกฎล่าสุดก่อนไป'],'ดำน้ำตื้นเกาะอาดัง-ราวี':['อยู่ในอุทยานแห่งชาติตะรุเตา จ.สตูล','เกาะหินงามเป็นจุดชมที่ได้รับความนิยม ห้ามเก็บหินกลับ และห้ามเรียงหินต่อกัน','เคยมีการจำกัดจำนวนนักท่องเที่ยวต่อจุด (ข้อมูลปี 2561) เช็กกฎล่าสุดก่อนไป'],'ดำน้ำเกาะเต่า':['ทัศนวิสัยมักเกิน 20 เมตร ดำน้ำได้ตลอดปี (ตามเว็บดำน้ำ SSI)']};
function feat(r){if(S.gem||!(S.q.trim()||S.cat||S.prefs.length))return{html:'',rest:r};
const g=r.filter(p=>p.gem).sort((a,b)=>(b.rate||4.4)-(a.rate||4.4)||a.pop-b.pop).slice(0,3);if(!g.length)return{html:'',rest:r};
const avg=Math.round(r.reduce((s,p)=>s+p.price,0)/r.length);
const html=`<section class='feat'><h2 style='margin:0'>🌱 แนะนำก่อน: ยังเงียบ แต่น่าไป</h2><p class='note' style='margin:2px 0 10px'>เลือกจากสถานที่ที่มีนักท่องเที่ยวน้อย แต่คะแนนดีหรือมีจุดเด่น การจองที่นี่ช่วยกระจายรายได้ไปสู่ผู้ประกอบการรายเล็กในพื้นที่</p><div class='grid'>${g.map(p=>fc(p,avg)).join('')}</div></section>`;
return{html,rest:r.filter(p=>!g.includes(p))}}
function fc(p,avg){const w=[p.rev?`⭐ ${p.rate} จาก ${fmt(p.rev)} รีวิว`:'เป็นหน้าใหม่ รอรีวิวแรก'];
if(p.price<avg)w.push(`ถูกกว่าเฉลี่ย ${Math.round((1-p.price/avg)*100)}%`);w.push(HL[p.act][0],'นักท่องเที่ยวน้อย');
return `<article class='card'>${photo(p)}<div class='body'><h3>${p.name}</h3><div class='meta'>📍 ${p.prov} · ห่างจากคุณ ${fmt(dist(p))} กม.</div><div class='why'>${w.slice(0,4).map(x=>`<span>${x}</span>`).join('')}</div><div class='row'><div class='price'>เริ่มต้น<br><b>${fmt(p.price)}</b> บาท/คน</div><button class='btn' data-id='${p.id}' aria-label='ดูราคา ${p.name}'>ดูราคา</button></div></div></article>`}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function book(i){const{p,pv}=CUR,x=pv[i];let n=2;const t=new Date(Date.now()+864e5).toISOString().slice(0,10);
const o=document.createElement("div");o.className="ov";
o.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="จอง ${p.name}"><button class="x" aria-label="ปิด">✕</button><h2 style="margin-top:0">จอง ${p.name}</h2><div class="meta">${x.n} · ${fmt(x.pr)} บาท/คน</div>
<label>วันที่เดินทาง<input type="date" id="bd" min="${t}" value="${t}"></label>
<label>จำนวนคน<div class="step"><button id="mn" aria-label="ลดจำนวนคน">−</button><b id="nn">2</b><button id="pl" aria-label="เพิ่มจำนวนคน">+</button></div></label>
<label>ชื่อผู้จอง<input id="bn" placeholder="ชื่อ-นามสกุล"></label>
<label>เบอร์โทร<input id="bt" inputmode="tel" placeholder="08x-xxx-xxxx"></label>
<label>ชำระเงินด้วย<select id="bp"><option>พร้อมเพย์</option><option>บัตรเครดิต/เดบิต</option><option>TrueMoney Wallet</option></select></label>
<div class="sum" id="sm"></div><p id="er" class="note" style="color:var(--coral)"></p><button class="btn pay" id="okb">ยืนยันและชำระเงิน</button><p class="note">จำลองการจองเพื่อทดสอบ ยังไม่ตัดเงินจริงและยังไม่เชื่อมระบบผู้ให้บริการ</p></div>`;
document.body.appendChild(o);const q=s=>o.querySelector(s),close=()=>{o.remove();document.removeEventListener("keydown",esk)},esk=e=>{if(e.key==="Escape")close()};document.addEventListener("keydown",esk);
const calc=()=>{const s=x.pr*n,sv=Math.round(s*.1),fe=Math.round(s*.07);q("#nn").textContent=n;q("#sm").innerHTML=`<div><span>${fmt(x.pr)} × ${n} คน</span><span>${fmt(s)}</span></div><div><span>ค่าบริการ (10%)</span><span>${fmt(sv)}</span></div><div><span>ค่าธรรมเนียมแพลตฟอร์ม (7%)</span><span>${fmt(fe)}</span></div><div class="tot"><span>ยอดรวม</span><span>${fmt(s+sv+fe)} บาท</span></div>`;return s+sv+fe};calc();
q(".x").onclick=close;o.onclick=e=>{if(e.target===o)close()};q("#mn").onclick=()=>{if(n>1){n--;calc()}};q("#pl").onclick=()=>{if(n<20){n++;calc()}};
q("#okb").onclick=()=>{const nm=q("#bn").value.trim(),tel=q("#bt").value.replace(/\D/g,""),d=q("#bd").value;
if(!d||d<t){q("#er").textContent="เลือกวันที่เดินทางตั้งแต่พรุ่งนี้เป็นต้นไป";return}
if(!nm){q("#er").textContent="กรอกชื่อผู้จอง";return}if(tel.length<9){q("#er").textContent="กรอกเบอร์โทรให้ครบอย่างน้อย 9 หลัก";return}
const tot=calc(),ref="SS-"+Math.random().toString(36).slice(2,8).toUpperCase();
q(".sheet").innerHTML=`<div class="ok"><div class="big">✅</div><h2>จองสำเร็จ</h2><div class="ref">${ref}</div><p>${p.name}<br>${x.n} · ${n} คน<br>วันที่ ${esc(new Date(d).toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"}))}</p><p>ผู้จอง ${esc(nm)} · ชำระด้วย ${esc(q("#bp")?q("#bp").value:"")}</p><p><b style="color:var(--coral);font-size:20px">${fmt(tot)} บาท</b><br><span class="note">รวมค่าบริการ 10% และค่าธรรมเนียมแพลตฟอร์ม 7% แล้ว</span></p><button class="btn pay" id="dn">กลับไปค้นหากิจกรรม</button><p class="note">การจองนี้เป็นการจำลอง ยังไม่มีการตัดเงินจริง</p></div>`;
q("#dn").onclick=()=>{close();home();scrollTo(0,0)}}}
function intro(n){const P=[{act:'เที่ยวทะเล',t:'ยินดีต้อนรับสู่ภาคใต้',s:'ทะเลสองฝั่ง ภูเขาเขียว และป่าชายเลน ภาคใต้มีมากกว่าที่ในโปสการ์ด เราชวนคุณไปพบมุมที่ยังไม่ค่อยมีใครรู้จัก'},{act:'ล่องเรือ',t:'ทุกทริปมีเรื่องราวของคนในพื้นที่',s:'หลายคนมักไปแหล่งดังที่เดิม ๆ ขณะที่ชุมชนและผู้ประกอบการรายเล็กที่พาเที่ยวได้ลึกซึ้งกลับยังไม่เป็นที่รู้จัก SOUTH SEEK ช่วยให้คุณเจอพวกเขา'},{act:'ดำน้ำ',t:'คุณสนใจเที่ยวแบบไหน?',s:'เลือกได้มากกว่าหนึ่งอย่าง เราจะแนะนำที่ที่ยังเงียบแต่น่าไปให้ก่อน'}],g=P[n];
$('#app').innerHTML=`<div class='in'><div class='inv'>${scene({act:g.act,id:n*5+2})}</div><div class='inb'><div class='dots'>${P.map((_,i)=>`<i class='${i===n?'on':''}'></i>`).join('')}</div><h1>${g.t}</h1><p>${g.s}</p>${n===1?`<ul class='pts'><li>🌱 ค้นพบที่ที่คนยังไม่ค่อยไป</li><li>💸 เทียบราคาแพ็กเกจชุมชน มาตรฐาน พรีเมียม</li><li>🤝 ช่วยกระจายรายได้ไปสู่ผู้ประกอบการรายเล็ก</li></ul>`:''}${n===2?`<div class='opts'>${Object.keys(ACT).map(c=>`<button class='opt' aria-pressed='${S.prefs.includes(c)}' data-p='${c}'>${ACT[c][0]} ${c}</button>`).join('')}</div><p style='font-size:12.5px;opacity:.75'>ต้นแบบสำหรับทดลอง ข้อมูลและราคาส่วนใหญ่เป็นตัวอย่าง</p>`:''}<div class='inn'><button class='sk' id='sk'>ข้าม</button><button class='btn nx' id='nx'>${n<2?'ถัดไป':'เริ่มค้นหา'}</button></div></div></div>`;
$('#sk').onclick=()=>{home();scrollTo(0,0)};
$('#nx').onclick=()=>{if(n<2){intro(n+1)}else{if(S.prefs.length===1){S.cat=S.prefs[0];S.prefs=[]}home()}scrollTo(0,0)};
document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{const c=b.dataset.p,i=S.prefs.indexOf(c);if(i<0)S.prefs.push(c);else S.prefs.splice(i,1);intro(2)})}
intro(0);
