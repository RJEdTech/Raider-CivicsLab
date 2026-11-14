(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Apportionment. Huntington-Hill (method of equal proportions, in use since 1941): every state starts with 1 seat; each further seat goes
   to the state with the largest priority value P / sqrt(n(n+1)), where n = seats it already has. Hamilton (largest remainders, used after
   the 1850-1900 censuses): quota q = P / (total / H); each state gets floor(q) (at least 1), leftover seats go to the largest fractions.
   2020 data: Census Bureau, 2020 Census Apportionment Results, Table 1 (apportionment population). Running Huntington-Hill on them here
   reproduces the Census Bureau's seat counts and its priority values (seat 432 Colorado, seat 435 Minnesota, seat 436 New York). */
const US=[['Alabama',5030053],['Alaska',736081],['Arizona',7158923],['Arkansas',3013756],['California',39576757],['Colorado',5782171],['Connecticut',3608298],['Delaware',990837],['Florida',21570527],['Georgia',10725274],['Hawaii',1460137],['Idaho',1841377],['Illinois',12822739],['Indiana',6790280],['Iowa',3192406],['Kansas',2940865],['Kentucky',4509342],['Louisiana',4661468],['Maine',1363582],['Maryland',6185278],['Massachusetts',7033469],['Michigan',10084442],['Minnesota',5709752],['Mississippi',2963914],['Missouri',6160281],['Montana',1085407],['Nebraska',1963333],['Nevada',3108462],['New Hampshire',1379089],['New Jersey',9294493],['New Mexico',2120220],['New York',20215751],['North Carolina',10453948],['North Dakota',779702],['Ohio',11808848],['Oklahoma',3963516],['Oregon',4241500],['Pennsylvania',13011844],['Rhode Island',1098163],['South Carolina',5124712],['South Dakota',887770],['Tennessee',6916897],['Texas',29183290],['Utah',3275252],['Vermont',643503],['Virginia',8654542],['Washington',7715946],['West Virginia',1795045],['Wisconsin',5897473],['Wyoming',577719]];
const USP=US.map(s=>s[1]),USN=US.map(s=>s[0]),USTOT=USP.reduce((a,b)=>a+b,0),CO=USN.indexOf('Colorado');
const TOYN=['Alder','Birch','Cedar'],TOYC=['s2','s4','s6'];
const f0=v=>Math.round(v).toLocaleString('en-US');
const f1=v=>v.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const f2=v=>v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const ord=n=>n+(n%100>=11&&n%100<=13?'th':(['th','st','nd','rd'][n%10]||'th'));
const pv=(p,n)=>p/Math.sqrt(n*(n+1));
const pvTxt=(p,n)=>`${f0(p)} ÷ √(${n} × ${n+1}) = ${f0(pv(p,n))}`;
/* Huntington-Hill up to H seats: seats per state and the order of seats after the first one each. */
function hh(P,H){const s=P.map(()=>1),order=[];for(let k=P.length+1;k<=H;k++){let bi=0,bv=-1;P.forEach((p,i)=>{const v=pv(p,s[i]);if(v>bv){bv=v;bi=i;}});s[bi]++;order.push({k,i:bi,n:s[bi],v:bv});}return {s,order};}
function hamilton(P,H){const T=P.reduce((a,b)=>a+b,0),q=P.map(p=>p/T*H),f=q.map(x=>Math.max(1,Math.floor(x)));let left=H-f.reduce((a,b)=>a+b,0);
 const o=q.map((x,i)=>[x-Math.floor(x),i]).sort((a,b)=>b[0]-a[0]);for(let j=0;j<o.length&&left>0;j++){if(q[o[j][1]]<1)continue;f[o[j][1]]++;left--;}return f;}
const US_RUN=hh(USP,445),US435=hh(USP,435).s,US_HAM=hamilton(USP,435);
const cs=sim=>atLeast('honors')?sim.p.case:'toy';
const isUS=sim=>cs(sim)==='us';
const house=sim=>isUS(sim)?435:(atLeast('ap')?sim.p.house:10);
const popC=sim=>atLeast('honors')?Math.round(sim.p.popC*1e6):1400000;
const pops=sim=>isUS(sim)?USP:[5300000,3300000,popC(sim)];
const names=sim=>isUS(sim)?USN:TOYN;
const focus=sim=>isUS(sim)?CO:2;
const kMin=sim=>isUS(sim)?425:3;
const kMax=sim=>isUS(sim)?440:house(sim);
const total=sim=>pops(sim).reduce((a,b)=>a+b,0);
const ideal=sim=>total(sim)/house(sim);
let memo={key:'',r:null};
function runTo(sim,k){if(isUS(sim)){const s=USP.map(()=>1);US_RUN.order.forEach(o=>{if(o.k<=k)s[o.i]++;});return {s,order:US_RUN.order.filter(o=>o.k<=k)};}
 const key=pops(sim).join()+'|'+k;if(memo.key!==key)memo={key,r:hh(pops(sim),k)};return memo.r;}
const curK=sim=>clamp(sim.st.k,kMin(sim),kMax(sim));
const final=sim=>runTo(sim,house(sim)).s;
const ans=sim=>final(sim)[focus(sim)];
/* the calculation: the focus state's priority value for its next seat at the start (Cedar has 1 seat; Colorado has 7 after seat 425) */
const calcN=sim=>isUS(sim)?7:1;
const calcAns=sim=>pv(pops(sim)[focus(sim)],calcN(sim));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const inGutPhase=sim=>!!(sim.guide&&sim.guide.phase==='gut');
const shown=sim=>!pending(sim)&&!!(sim.p.reveal||(sim.tour&&sim.tour.on&&sim.st.peek)||(GS(sim)&&GS(sim).g)||curK(sim)>=house(sim));
const hideFocusPV=sim=>pending(sim)||(inGutPhase(sim)&&!sim.p.reveal);
const mathOn=sim=>!pending(sim)&&!!((GS(sim)&&GS(sim).m)||sim.p.reveal||(sim.tour&&sim.tour.on&&sim.st.peek===2));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const nm=sim=>names(sim)[focus(sim)];
/* who got the last seat, and who is next in line, at the full House */
function lastAndNext(sim){const H=house(sim);let r;if(isUS(sim))return {last:US_RUN.order.find(o=>o.k===435),next:US_RUN.order.find(o=>o.k===436)};
 r=hh(pops(sim),H+1);return {last:r.order.find(o=>o.k===H)||null,next:r.order.find(o=>o.k===H+1)};}
/* The formula with this case's numbers (reveal card and canvas). */
function formulaText(sim,short){const P=pops(sim),f=focus(sim),s=ans(sim),N=names(sim),H=house(sim),LN=lastAndNext(sim);
 const rank=(()=>{if(s<2)return null;if(isUS(sim)){const o=US_RUN.order.find(o=>o.i===f&&o.n===s);return o?o.k:null;}const o=hh(P,H).order.find(o=>o.i===f&&o.n===s);return o?o.k:null;})();
 if(short){return s>=2?`${N[f]}, ${ord(s)} seat: ${f0(P[f])} ÷ √(${s-1} × ${s}) = ${f0(pv(P[f],s-1))}, seat ${rank} of ${H}`:`${N[f]}'s 2nd seat: ${f0(P[f])} ÷ √2 = ${f0(pv(P[f],1))}, too small`;}
 let a=s>=2?`${N[f]}'s ${ord(s)} seat: ${pvTxt(P[f],s-1)}. That ranks seat ${rank} of ${H}, so ${N[f]} gets ${s} seat${s>1?'s':''}.`
  :`${N[f]}'s 2nd seat would need ${pvTxt(P[f],1)}, but that is below the last seat handed out, so ${N[f]} keeps 1 seat.`;
 const L=LN.last,X=LN.next;
 if(isUS(sim))a+=` Seat 435: Minnesota's 8th, ${f1(L.v)}. First left out: New York's 27th, ${f1(X.v)}.`;
 else if(X&&X.i!==f)a+=` First left out: ${N[X.i]}'s ${ord(X.n)} seat at ${pvTxt(P[X.i],X.n-1)}.`;
 else if(X)a+=` Next in line would be ${N[f]}'s ${ord(X.n)} seat at ${f0(X.v)}.`;
 return a;}
/* wrap text on the canvas; returns the y after the last line */
function wrap(ctx,s,x,y,maxW,size,o){o=o||{};ctx.font=(o.w||400)+' '+size+'px '+FONT;const words=s.split(' ');let line='',lines=[];
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}else line=t;});if(line)lines.push(line);
 lines.forEach((l,i)=>txt(ctx,l,x,y+i*size*1.35,{s:size,w:o.w||400,c:o.c}));return y+lines.length*size*1.35;}
function shape(ctx,i,x,y,r,col){ctx.fillStyle=col;ctx.beginPath();
 if(i===0){for(let j=0;j<6;j++){const a=Math.PI/3*j+Math.PI/6;ctx[j?'lineTo':'moveTo'](x+r*Math.cos(a),y+r*Math.sin(a));}ctx.closePath();}
 else if(i===1){rr(ctx,x-r*0.9,y-r*0.9,r*1.8,r*1.8,r*0.35);}
 else{ctx.moveTo(x,y-r);ctx.lineTo(x+r*0.95,y+r*0.75);ctx.lineTo(x-r*0.95,y+r*0.75);ctx.closePath();}
 ctx.fill();}
function seatIcons(ctx,x,y,n,col,sz,perRow){for(let j=0;j<n;j++){const cx=x+(j%perRow)*(sz+4),cy=y+Math.floor(j/perRow)*(sz+4);rr(ctx,cx,cy,sz,sz,3);ctx.fillStyle=col;ctx.fill();}}

function drawToy(sim,ctx,k){const big=k>1.3,P=pops(sim),H=house(sim),K=curK(sim),R=runTo(sim,K),s=R.s,G=GS(sim),hid=hideFocusPV(sim),ap=atLeast('ap');
 const T=total(sim),id=ideal(sim);
 txt(ctx,big?`${H} seats, ${f0(id)} people per seat`:`${H} seats for ${f0(T)} people: a fair share is ${f0(id)} people per seat`,20,26*k,{s:13*k,w:700});
 const cw=246,gap=11,cy=40*k;let cardB=0;
 const ham=ap?hamilton(P,H):null,hamPrev=ap&&H>3?hamilton(P,H-1):null;
 for(let i=0;i<3;i++){const x=16+i*(cw+gap);let y=cy+8;
  const lines=3+(ap?1:0),seatRows=Math.ceil(Math.max(1,Math.max(s[i],H>12?8:6))/(big?6:9));
  const ch=lines*18*k+seatRows*(big?20:16)+30;
  rr(ctx,x,cy,cw,ch,12);ctx.fillStyle=PAL['cv-bg2'];ctx.fill();ctx.strokeStyle=i===focus(sim)?PAL['rj']:PAL['line'];ctx.lineWidth=i===focus(sim)?2.5:1;ctx.stroke();
  shape(ctx,i,x+20,y+10*k,9*k,PAL[TOYC[i]]);txt(ctx,TOYN[i],x+36*k,y+15*k,{s:15*k,w:700});y+=18*k+10;
  txt(ctx,`${f0(P[i])} people`,x+12,y+8*k,{s:12*k});y+=18*k;
  txt(ctx,`Quota: ${f2(P[i]/id)} seats`,x+12,y+8*k,{s:12*k,c:PAL['cv-soft']});y+=18*k;
  if(ap){const hp=hamPrev?hamPrev[i]:null,para=hp!==null&&ham[i]<hp;txt(ctx,big?`Hamilton: ${ham[i]}`:`Hamilton's method: ${ham[i]} seat${ham[i]>1?'s':''}${para?` (down from ${hp})`:''}`,x+12,y+8*k,{s:12*k,w:para?700:400,c:para?PAL['rj']:PAL['cv-soft']});y+=18*k;}
  const showSeats=!(i===focus(sim)&&hid&&K>=H);
  seatIcons(ctx,x+12,y,showSeats?s[i]:0,PAL[TOYC[i]],big?16:12,big?6:9);
  if(!showSeats)txt(ctx,'? seats',x+12,y+12*k,{s:12*k,c:PAL['cv-soft']});
  else txt(ctx,`${s[i]}`,x+cw-14,y+10*k,{s:15*k,w:700,a:'right',c:PAL[TOYC[i]]});
  if(i===focus(sim)&&G&&G.g)pill(ctx,(big?'Gut: ':'Your gut: ')+G.g.guess,x+cw-(big?72:76),y+(big?8:6),PAL['s4'],'#111',12*Math.min(k,1.4));
  cardB=Math.max(cardB,cy+ch);}
 /* priority values for the next seat */
 let y=cardB+26*k;const done=K>=H;
 txt(ctx,done?(big?`All ${H} seats are out. Next in line:`:`All ${H} seats are handed out. Next in line, if there were one more seat:`):(big?`Seat ${K+1}: biggest value wins`:`Who gets seat ${K+1}? Priority value = population ÷ √(n × (n + 1))`),20,y,{s:13*k,w:700});y+=8*k;
 const vals=P.map((p,i)=>pv(p,s[i]));let best=0;vals.forEach((v,i)=>{if(v>vals[best])best=i;});
 const rh=21*k;
 for(let i=0;i<3;i++){y+=rh;const hideThis=i===focus(sim)&&hid;
  const lab=big?`${TOYN[i]}: ${hideThis?'? (work it out)':f0(vals[i])}`:`${TOYN[i]}, ${ord(s[i]+1)} seat: ${hideThis?`${f0(P[i])} ÷ √(${s[i]} × ${s[i]+1}) = ?`:pvTxt(P[i],s[i])}`;
  ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lab).width;
  if(i===best&&!hid){rr(ctx,14,y-15*k,lw+40,rh,6);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.5;ctx.stroke();}
  shape(ctx,i,26,y-5*k,6*k,PAL[TOYC[i]]);txt(ctx,lab,40,y,{s:12*k,w:i===best&&!hid?700:400});
  if(i===best&&!hid)txt(ctx,done?'first left out':'gets the next seat',lw+64,y,{s:12*k,w:700,c:PAL['rj']});}
 y+=16*k;
 if(mathOn(sim)&&y<430){const t=formulaText(sim,big);y=wrap(ctx,(big?'':'The math: ')+t,20,y+6*k,760,12*k,{w:700,c:PAL['rj']});}
 else if(ap&&!big&&y<430){const hp=hamPrev,para=hp&&ham.some((v,i)=>v<hp[i]);txt(ctx,para?`Alabama paradox: with ${H} seats instead of ${H-1}, Hamilton's method takes a seat away from ${TOYN[ham.findIndex((v,i)=>v<hp[i])]}.`:`Huntington–Hill: ${s.join(', ')} so far. Hamilton's method with ${H} seats: ${ham.join(', ')}.`,20,y+6*k,{s:12*k,c:para?PAL['rj']:PAL['cv-soft'],w:para?700:400});y+=20*k;}
 /* the order of seats so far: one box per seat */
 if(!big&&y<330){const by=Math.max(y+22,312),bw=Math.min(64,Math.floor(760/H)-6);txt(ctx,'The seats in the order they were handed out',20,by,{s:12*k,w:700});
  const ord0=R.order;for(let j=0;j<H;j++){const bx=20+j*(bw+6),bt=by+10;rr(ctx,bx,bt,bw,46,8);
   if(j<K){const st=j<3?j:ord0[j-3].i;ctx.fillStyle=PAL['cv-bg2'];ctx.fill();ctx.strokeStyle=PAL[TOYC[st]];ctx.lineWidth=2;ctx.stroke();shape(ctx,st,bx+bw/2,bt+15,8,PAL[TOYC[st]]);
    txt(ctx,j<3?'start':'seat '+(j+1),bx+bw/2,bt+40,{s:12*k,a:'center',c:PAL['cv-soft']});
    if(j>=3&&bw>=60){const hv=st===focus(sim)&&hid;txt(ctx,hv?'?':f0(ord0[j-3].v),bx+bw/2,bt+62,{s:12*k,a:'center',c:PAL['cv-ink']});}}
   else{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);txt(ctx,String(j+1),bx+bw/2,bt+28,{s:12*k,a:'center',c:PAL['cv-soft']});}}}}

function drawUS(sim,ctx,k){const big=k>1.3,K=curK(sim),G=GS(sim),hid=hideFocusPV(sim),ap=atLeast('ap');
 txt(ctx,big?'The priority list, 2020':'The priority list, 2020 Census: seats 426 to 440',16,26*k,{s:13*k,w:700});
 txt(ctx,big?'seat · state (its seat) · value':'Seat number · state (which of its seats) · priority value',16,26*k+17*k,{s:12*k,c:PAL['cv-soft']});
 const rh=23*k,top=26*k+30*k,rows=Math.max(5,Math.floor((388-top)/rh)),end=clamp(K+3,426+rows-1,440),start=end-rows+1,LW=big?470:462;
 for(let r=0;r<rows;r++){const sn=start+r,o=US_RUN.order.find(o=>o.k===sn),y=top+r*rh+rh*0.7,isCO=o.i===CO,hideRow=isCO&&hid;
  const out=sn>435,given=sn<=K&&!out;
  if(isCO||sn===435||sn===436){rr(ctx,10,y-rh*0.72,LW,rh-3,6);ctx.fillStyle=isCO?PAL['card']:PAL['cv-bg2'];ctx.fill();ctx.strokeStyle=isCO?PAL['rj']:PAL['s4'];ctx.lineWidth=1.5;ctx.stroke();}
  const c=out?PAL['cv-soft']:given?PAL['cv-ink']:PAL['cv-soft'];
  txt(ctx,String(sn),20,y,{s:12*k,w:700,c});
  txt(ctx,`${USN[o.i]} (${ord(o.n)})${out?(big?', out':', left out'):''}`,20+40*k,y,{s:12*k,c,w:given?700:400});
  txt(ctx,hideRow?'?':(big?f0(o.v):f1(o.v)),LW+2,y,{s:12*k,a:'right',c});}
 if(start<=435&&end>=436){const yl=top+(435-start+1)*rh-1;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(10,yl);ctx.lineTo(LW+12,yl);ctx.stroke();}
 /* right: Colorado */
 const X=LW+30,W=800-X-12,cardT=12;let y=cardT+26*k;
 const coSeats=runTo(sim,Math.min(K,435)).s[CO];
 rr(ctx,X,cardT,W,big?250:228,12);ctx.fillStyle=PAL['cv-bg2'];ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.stroke();
 txt(ctx,'Colorado',X+12,y,{s:15*k,w:700});y+=20*k;
 txt(ctx,`${f0(USP[CO])} people`,X+12,y,{s:12*k});y+=18*k;
 txt(ctx,big?`Quota: ${f2(USP[CO]/(USTOT/435))}`:`Quota: ${f2(USP[CO]/(USTOT/435))} seats`,X+12,y,{s:12*k,c:PAL['cv-soft']});y+=18*k;
 txt(ctx,big?`Seats so far: ${coSeats}`:`Seats after seat ${Math.min(K,435)}: ${coSeats}`,X+12,y,{s:12*k,w:700});y+=8*k;
 seatIcons(ctx,X+12,y,coSeats,PAL['rj'],big?15:12,big?8:10);y+=(big?20:16)*Math.ceil(Math.max(coSeats,1)/(big?8:10))+12*k;
 if(!big||y<240){const nx=coSeats;y=wrap(ctx,hid?`Its next seat: ${f0(USP[CO])} ÷ √(${nx} × ${nx+1}) = ?`:`Its next seat: ${pvTxt(USP[CO],nx)}`,X+12,y,W-22,12*k,{c:PAL['cv-soft']});}
 if(ap&&!big)txt(ctx,`Hamilton's method (computed here): ${US_HAM[CO]} seats`,X+12,Math.min(y+4*k,cardT+220),{s:12*k,c:PAL['cv-soft']});
 if(G&&G.g)pill(ctx,'Your gut: '+G.g.guess+' seats',X+W/2,(big?250:228)+cardT+22*k,PAL['s4'],'#111',12*Math.min(k,1.4));
 let by=(big?250:228)+cardT+48*k;
 if(!big&&by<380){by=wrap(ctx,'Seat 435 went to Minnesota. New York was next in line: the Census Bureau reported it would have needed 89 more people.',X+12,by,W-20,12*k,{c:PAL['cv-ink']});}
 if(mathOn(sim)){const t=formulaText(sim,big);wrap(ctx,(big?'':'The math: ')+t,16,big?404:398,big?768:770,12*k,{w:700,c:PAL['rj']});}}

const SIM={
 id:'apportion',hash:'apportion',apUnit:7,order:1,tab:'Who gets the 435 seats?',kind:'Simulation',next:['districts'],
 card:'Hand out House seats one at a time with priority values, by hand for three made-up states and then for all 50 states in the 2020 Census.',
 title:'Who gets the 435 seats?',
 skills:{bio:'Quotas, rounding and square roots · Algebra 1 · U.S. Government Unit 3 (reapportionment)',
  honors:'Ratios, square roots and the geometric mean · Algebra 1, Algebra 2 · U.S. Government Unit 3, AP U.S. Government (Congress)',
  ap:'Geometric means and comparing two algorithms · Algebra 2 · AP U.S. Government (Congress)'},
 lede:{bio:'Every ten years the census counts the people, and the 435 seats in the U.S. House are divided among the states by population. You cannot give a state 1.4 seats. So who gets the last seat? Start with three made-up states and 10 seats, and work it out by hand.',
  honors:'Since 1941 Congress has used the method of equal proportions, also called Huntington–Hill. Each state starts with 1 seat, and each next seat goes to the biggest priority value, population ÷ √(n × (n + 1)). Step through the last seats of the 2020 Census.',
  ap:'Two reasonable methods can give different answers. Hamilton’s method, used after the 1850 to 1900 censuses, rounds quotas by their remainders and can take a seat away when the House grows: the Alabama paradox. Compare the methods.'},
 scale:'Made-up states: 10 seats for 10 million people. Real states: 435 seats for the 2020 apportionment population of 331,108,434 (Census Bureau).',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The seats',
 controls:[
  {id:'guess',label:'Your gut: how many seats does the state in the red box get?',type:'range',min:1,max:12,step:1,def:1,unit:' seats',help:'Three made-up states: Cedar. The 50 states: Colorado.'},
  {id:'case',label:'Case',type:'seg',def:'toy',lvl:'honors',noGut:true,onChange:sim=>{sim.st.k=kMin(sim);clearGut(sim);},options:[{v:'toy',l:'Three made-up states'},{v:'us',l:'The 50 states, 2020'}]},
  {id:'popC',label:'Cedar’s population',type:'range',min:0.5,max:3,step:0.1,def:1.4,unit:' million',lvl:'honors',noGut:true,onChange:clearGut,help:'Only for the three made-up states.'},
  {id:'house',label:'Seats in the House (made-up states)',type:'range',min:6,max:15,step:1,def:10,lvl:'ap',noGut:true,onChange:sim=>{sim.st.k=clamp(sim.st.k,kMin(sim),kMax(sim));clearGut(sim);},help:'Try 10, then 11, and watch Hamilton’s method.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut and work out the number.'}
 ],
 actions:[
  {id:'next',label:'Hand out the next seat',primary:true,run(sim){sim.st.k=Math.min(kMax(sim),curK(sim)+1);}},
  {id:'back',label:'Take back the last seat',run(sim){sim.st.k=Math.max(kMin(sim),curK(sim)-1);}},
  {id:'all',label:'Hand out every seat',run(sim){sim.st.k=house(sim);}},
  {id:'start',label:'Start over',run(sim){sim.st.k=kMin(sim);}}
 ],
 init(sim){return {k:kMin(sim),peek:0};},step(){},
 metrics:[
  {id:'ideal',label:'Fair share: people per seat (total ÷ seats)',unit:'people',d:0,min:0,max:null,get:ideal},
  {id:'quota',label:'Quota for the state in the red box',unit:'seats',d:2,min:0,max:null,get:sim=>pops(sim)[focus(sim)]/ideal(sim)},
  {id:'k',label:'Seats handed out so far',unit:'',d:0,min:0,max:null,get:curK},
  {id:'next',label:'Its priority value for its next seat',unit:'',d:0,min:0,max:null,get:sim=>hideFocusPV(sim)?null:pv(pops(sim)[focus(sim)],runTo(sim,Math.min(curK(sim),house(sim))).s[focus(sim)])},
  {id:'seats',label:'Seats it gets (Huntington–Hill)',unit:'seats',d:0,min:0,max:null,get:sim=>shown(sim)?ans(sim):null},
  {id:'per',label:'People per representative there',unit:'people',d:0,min:0,max:null,get:sim=>shown(sim)?pops(sim)[focus(sim)]/ans(sim):null},
  {id:'last',label:'Priority value of the last seat handed out',unit:'',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?lastAndNext(sim).last.v:null},
  {id:'ham',label:'Seats it would get under Hamilton’s method',unit:'seats',d:0,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?(isUS(sim)?US_HAM:hamilton(pops(sim),house(sim)))[focus(sim)]:null},
  {id:'para',label:'Alabama paradox check (Hamilton, one seat fewer vs. now)',text:true,lvl:'ap',get:sim=>{if(isUS(sim))return 'Made-up states only';const H=house(sim);if(H<=3)return 'No';const a=hamilton(pops(sim),H-1),b=hamilton(pops(sim),H);const i=b.findIndex((v,j)=>v<a[j]);return i<0?`No state loses a seat going from ${H-1} to ${H}`:`Yes: ${TOYN[i]} drops from ${a[i]} to ${b[i]} seats when the House grows to ${H}`;}}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);if(isUS(sim))drawUS(sim,ctx,k);else drawToy(sim,ctx,k);},
 narrate(sim){const P=pops(sim),f=focus(sim),N=names(sim),K=curK(sim),H=house(sim),s=runTo(sim,Math.min(K,H)).s;
  if(pending(sim))return `Work out ${N[f]}’s priority value in the box above. The picture hides it until you check your answer.`;
  if(isUS(sim)){if(K<=435){const o=US_RUN.order.find(o=>o.k===K);return `Seat ${K} goes to <b>${USN[o.i]}</b>, its ${ord(o.n)} seat, at a priority value of ${f1(o.v)}. ${K<435?'Hand out the next seat to see who is next.':'That is the 435th and last seat. New York’s 27th seat was next, just 3.4 behind: about 89 people.'}`;}
   const o=US_RUN.order.find(o=>o.k===K);return `Seat ${K} would go to ${USN[o.i]}’s ${ord(o.n)} seat (${f1(o.v)}), but the House has only 435 seats. <b>${USN[o.i]} is left out.</b>`;}
  if(K<=3)return `Every state starts with 1 seat. ${N[f]} has ${f0(P[f])} people, a quota of ${f2(P[f]/ideal(sim))} seats. <b>Each next seat goes to the biggest priority value.</b>`;
  const o=runTo(sim,K).order.find(o=>o.k===K);
  return `Seat ${K} went to <b>${N[o.i]}</b> (its ${ord(o.n)} seat) at ${f0(o.v)}. ${K<H?`Now ${N.map((n,i)=>n+' '+s[i]).join(', ')}.`:`All ${H} seats are out: ${N.map((n,i)=>n+' '+s[i]).join(', ')}.`}${atLeast('ap')&&K>=H?` Hamilton’s method would give ${hamilton(P,H).join(', ')}.`:''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Three made-up states share 10 seats. Cedar, in the red box, has 1.4 million of the 10 million people. Drag the slider here to how many seats you think Cedar gets. Then lock it in.',
   honors:'Drag the slider here to how many seats you think the state in the red box gets: Cedar for the made-up states, Colorado for the 50 states. Then lock it in.'},
  lock(sim){const a=ans(sim);return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:`${sim.p.guess} seat${sim.p.guess>1?'s':''}`};},
  solve(sim){const a=ans(sim);sim.p.guess=a;sim.st.k=house(sim);return {v:0,guess:a,label:`${a} seat${a>1?'s':''} for ${nm(sim)}`};},
  calc:{d:0,tol:a=>Math.max(1,0.005*a),
   prompt:sim=>{const P=pops(sim)[focus(sim)],n=calcN(sim);return isUS(sim)
    ?`Colorado has <b>${f0(P)}</b> people and already has <b>${n}</b> seats. Its priority value for an 8th seat is population ÷ √(n × (n + 1)), with n = ${n}. Work it out.`
    :`Cedar has <b>${f0(P)}</b> people and starts with <b>${n}</b> seat, like every state. Its priority value for a 2nd seat is population ÷ √(n × (n + 1)), with n = ${n}. Work it out.`;},
   answer:calcAns,
   hint:'First multiply n × (n + 1). Take the square root of that. Then divide the population by it.',
   steps(sim){const P=pops(sim)[focus(sim)],n=calcN(sim),m=n*(n+1),r=Math.sqrt(m);
    return [`n × (n + 1) = ${n} × ${n+1} = ${m}.`,`√${m} ≈ ${r.toFixed(4)}.`,`${f0(P)} ÷ ${r.toFixed(4)} ≈ <b>${f0(calcAns(sim))}</b>.`,`Next: compare it with the other states’ values. The biggest value gets the next seat.`];}},
  formula:sim=>formulaText(sim,false),
  how:{bio:'Every state starts with 1 seat. For each next seat, compute population ÷ √(n × (n + 1)) for every state, where n is the seats it has now, and give the seat to the biggest value. Repeat until the seats run out.',
   ap:'Huntington–Hill gives the next seat to the largest P/√(n(n+1)): it rounds a state’s quota up past n exactly when the quota passes the geometric mean √(n(n+1)) for a common divisor.'},
  compare(sim,g,m){const P=pops(sim)[focus(sim)],a=m.guess,G=g.guess,N=nm(sim),per=v=>f0(P/v);
   const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also worked out the priority value yourself, which is the whole method.':'';
   if(G===a)return `Your gut was right on: <b>${a} seat${a>1?'s':''}</b>. ${N}’s ${f0(P)} people get one representative for every ${per(a)} people, against a fair share of ${f0(ideal(sim))}.${self}`;
   return `Your gut said <b>${G}</b>; the method gives <b>${a}</b>. In real terms: with ${G} seat${G>1?'s':''}, each of ${N}’s representatives would speak for ${per(G)} people; with ${a}, each speaks for ${per(a)}. The fair share is ${f0(ideal(sim))}. ${!isUS(sim)&&G<a?'Rounding 1.4 down to 1 feels natural, but rounded quotas add up to 9 seats, not 10. Someone has to get the leftover seat, and the priority values decide who.':''}${self}`;},
  again(sim){if(!isUS(sim)){const R=[0.6,0.8,0.9,1.1,1.4,1.7,2.1,2.4,2.8];sim.p.popC=R[Math.floor(Math.random()*R.length)];}sim.p.guess=1;sim.p.reveal=false;sim.st.k=kMin(sim);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Birch has 3,300,000 people and already has 3 seats. What is its priority value for a 4th seat, population ÷ √(3 × 4)? Round to the nearest whole number.',answer:952628,tol:1000,unit:'',d:0,hint:'3 × 4 = 12. Divide 3,300,000 by √12.',explain:'√12 ≈ 3.4641, and 3,300,000 ÷ 3.4641 ≈ 952,628. That is smaller than Cedar’s 989,949 for a 2nd seat, so Cedar gets seat 10 first.'},
  {lvl:'bio',instant:true,q:'The quotas are 5.3, 3.3 and 1.4 seats, and there are 10 seats. What goes wrong if you round each quota to the nearest whole number?',choices:['Nothing: 5 + 3 + 1 = 10','You hand out 9 seats, so one seat is left over','You hand out 11 seats'],correct:1,explain:'5 + 3 + 1 = 9. The quotas add to 10, but the rounded numbers do not. A method has to decide who gets the leftover seat.'},
  {lvl:'bio',instant:true,q:'Every state starts with 1 seat before any priority values are used. Why?',choices:['The Constitution guarantees each state at least one representative','Small states asked for it in 1941','It makes the math easier but is not required'],correct:0,explain:'Article I, Section 2 of the Constitution says each state shall have at least one representative. So the method starts at 1 each and hands out seats 51 through 435 by priority value.'},
  {lvl:'honors',kind:'num',q:'New York had 20,215,751 people and 26 seats. Find its priority value for a 27th seat, 20,215,751 ÷ √(26 × 27), to the nearest whole number.',answer:762994,tol:2,unit:'',d:0,hint:'26 × 27 = 702. Divide by √702.',explain:'√702 ≈ 26.4953, so 20,215,751 ÷ 26.4953 ≈ 762,994. Minnesota’s 8th seat was 762,998, just 3.4 higher, so Minnesota got seat 435 and New York got none.'},
  {lvl:'honors',instant:true,q:'Seat 435 had a priority value of 762,997.7 (Minnesota). New York’s next seat was 762,994.4 with √702 ≈ 26.495 in the divisor. About how many more people would New York have needed?',choices:['About 3','About 89','About 9,000'],correct:1,explain:'New York needed its value to rise by about 3.35. Each extra person adds 1 ÷ 26.495 to its value, so it needed about 3.35 × 26.495 ≈ 89 people. The Census Bureau reported 89.'},
  {lvl:'honors',instant:true,q:'Colorado had 5,782,171 people and 8 seats after the 2020 Census. How many people does each Colorado representative speak for?',choices:['About 722,771','About 761,169','About 826,024'],correct:0,explain:'5,782,171 ÷ 8 = 722,771. With 7 seats it would have been 826,024 each. The national fair share was 331,108,434 ÷ 435 = 761,169.'},
  {lvl:'ap',instant:true,q:'Made-up states with 5.3, 3.3 and 1.4 million people. Hamilton’s method gives Cedar 2 of 10 seats. What does it give Cedar if the House grows to 11 seats?',choices:['Still 2','1: Cedar loses a seat when the House grows','3'],correct:1,explain:'With 11 seats the quotas are 5.83, 3.63 and 1.54. Rounding down gives 5, 3, 1 (9 seats), and the 2 leftover seats go to the biggest fractions, .83 and .63. That is 6, 4, 1: the Alabama paradox. Huntington–Hill gives 6, 3, 2.'},
  {lvl:'ap',instant:true,q:'Run Hamilton’s method on the 2020 Census numbers. Compared with the actual Huntington–Hill result, which seats move?',choices:['None: the methods agree','Montana and Rhode Island drop from 2 seats to 1; New York and Ohio each gain 1','California gains 2 seats from Texas'],correct:1,explain:'Hamilton gives Montana (quota 1.43) and Rhode Island (quota 1.44) 1 seat each, and New York (26.56) and Ohio (15.51) one more each. Here Huntington–Hill favors the two small states. A 1984 CRS simulation found the smaller states persistently advantaged under equal proportions.'},
  {lvl:'ap',kind:'num',q:'Cedar has 1.4 million of the 10 million people. What is Cedar’s quota if the House has 11 seats? Give two decimals.',answer:1.54,tol:0.005,unit:'seats',d:2,hint:'Quota = Cedar’s share of the people × the number of seats.',explain:'1.4 ÷ 10 × 11 = 1.54 seats. Hamilton rounds it down to 1 and hands out the leftovers by remainder; .54 is smaller than .83 and .63, so Cedar gets no leftover.'}
 ],
 tour:[
  {title:'Ten seats, three states',text:'Alder has 5.3 million people, Birch 3.3 million and Cedar 1.4 million: 10 million in all. With 10 seats, a fair share is 1 seat for every 1,000,000 people. That makes the quotas 5.3, 3.3 and 1.4 seats.',pause:true,focus:[10,0,780,250],setup:sim=>{BioLab.setValues(sim,{case:'toy',popC:1.4,house:10,reveal:false});sim.st.k=3;sim.st.peek=1;}},
  {stnFocus:[10,0,780,330],stn:{rings:[[22,93,150,22],[282,93,150,22],[536,93,150,22]],card:{x:480,y:196,w:305,title:'Round each quota',lines:['5.30 → 5, 3.30 → 3, 1.40 → 1','5 + 3 + 1 = 9 seats, not 10.','Rounding alone does not add up.']}},title:'You cannot hand out 0.4 of a seat',text:'Round each quota and you get 5 + 3 + 1 = 9 seats, not 10. Rounding alone does not add up, so the law needs a method. Every state starts with 1 seat, because the Constitution guarantees each state at least one representative.',pause:true,focus:[10,0,780,250],setup:sim=>{sim.st.k=3;sim.st.peek=1;}},
  {title:'Priority values',text:'For each state’s next seat, divide its population by √(n × (n + 1)), where n is the seats it has now. Alder: 5,300,000 ÷ √(1 × 2) = 3,747,666. Birch: 2,333,452. Cedar: 989,949. The biggest value wins the next seat, so Alder gets seat 4.',pause:true,focus:[10,200,780,250],setup:sim=>{sim.st.k=3;sim.st.peek=1;}},
  {title:'Seat by seat',text:'Seats 4 to 9 go to Alder, Birch, Alder, Alder, Birch and Alder. Each seat a state wins makes its n bigger, so its next priority value shrinks, and the others catch up.',pause:true,focus:[10,200,780,250],setup:sim=>{sim.st.k=9;sim.st.peek=1;}},
  {title:'Seat 10',text:'For seat 10: Cedar’s 2nd seat is 1,400,000 ÷ √2 = 989,949, Alder’s 6th is 967,643 and Birch’s 4th is 952,628. Cedar’s is the biggest, so the seats end 5, 3 and 2.',pause:true,setup:sim=>{sim.st.k=10;sim.st.peek=2;}},
  {lvl:'honors',title:'The real 435',text:'In 2020 the same method handed out seats 51 through 435 to the 50 states. Colorado’s 8th seat: 5,782,171 ÷ √(7 × 8) = 772,675. It ranked seat 432, so Colorado grew from 7 seats to 8.',pause:true,setup:sim=>{BioLab.setValues(sim,{case:'us'});sim.st.k=432;sim.st.peek=1;}},
  {lvl:'honors',title:'The last seat',text:'Seat 435 went to Minnesota’s 8th seat at 762,997.7. New York’s 27th seat came next at 762,994.4. The Census Bureau reported that New York would have needed just 89 more people.',pause:true,setup:sim=>{BioLab.setValues(sim,{case:'us'});sim.st.k=436;sim.st.peek=1;}},
  {lvl:'ap',title:'Hamilton’s method and the Alabama paradox',text:'Hamilton’s method rounds each quota down and gives leftover seats to the biggest remainders. It was used after the 1850 to 1900 censuses. Grow this House to 11 seats: quotas 5.83, 3.63 and 1.54 give 6, 4 and 1, so Cedar loses a seat. In 1880, Alabama would have lost a seat if the House grew from 299 to 300.',pause:true,setup:sim=>{BioLab.setValues(sim,{case:'toy',popC:1.4,house:11});sim.st.k=11;sim.st.peek=1;}}
 ],
 onTourExit(sim){sim.st.peek=0;},
 infoPanel(sim){const us=isUS(sim);
  let h='<h3>What this number hides</h3><ul>';
  h+='<li><b>Who is counted.</b> The apportionment population is the residents of the 50 states plus U.S. military and federal civilian employees living overseas (and their dependents) who can be assigned a home state. Washington, D.C., and Puerto Rico are left out because they have no voting seats in the House.</li>';
  h+='<li><b>Unequal districts.</b> A seat cannot be split, so district sizes differ by state. In 2020, Montana’s 2 seats were 1,085,407 ÷ 2 = 542,704 people each, while Delaware’s single seat was 990,837 people. The national fair share was 761,169.</li>';
  h+='<li><b>A count is a count.</b> Any census can miss some people or count some twice, and the last seat came down to 89 people. Every person a household reports counts.</li></ul>';
  if(atLeast('ap'))h+='<p><b>Two methods, two answers.</b> Computed here from the same 2020 numbers, Hamilton’s method would give Montana and Rhode Island 1 seat each and New York and Ohio one more each. Neither method is wrong arithmetic; they define “closest to fair” differently. Choosing one is a decision for Congress, and the Congressional Research Service treats it as a policy choice.</p>';
  h+='<div style="border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:10px 0"><p style="margin:0 0 4px"><b>Questions to ask any number</b></p><ul style="margin:0;padding-left:1.3em"><li>Who counted, and how?</li><li>Who is missing?</li><li>Per what? (per person, per seat, per state?)</li><li>Compared to what?</li><li>What would change the answer?</li><li>What does this number hide?</li></ul></div>';
  return h;},
 lab:{bio:'<p><b>Question:</b> How big must Cedar be to earn a 2nd seat?</p><ol><li>Press <b>Hand out the next seat</b> until all 10 seats are out. Record each seat’s winner and priority value.</li><li>Press <b>Start over</b>. Work out each state’s first priority value by hand and check it against the canvas.</li></ol><p>Write one sentence: why did Cedar get seat 10 even though its quota, 1.4, rounds down to 1?</p>',
  honors:'<p><b>Question:</b> How close was the 2020 apportionment?</p><ol><li>Choose <b>The 50 states, 2020</b>. Step from seat 426 to 440 and record each state and value.</li><li>For the first state left out (seat 436), find how many more people it needed: (value of seat 435 × √(n(n + 1))) − its population.</li><li>Back with the made-up states, change Cedar’s population and find the smallest population that still earns a 2nd seat.</li></ol><p>Explain why a state’s next priority value always drops after it wins a seat.</p>',
  ap:'<p><b>Question:</b> When do Hamilton and Huntington–Hill disagree?</p><ol><li>With the made-up states, set the House from 6 to 15 seats. Record both methods’ seats and the Alabama paradox check.</li><li>Change Cedar’s population and look for other paradoxes.</li></ol><p><b>CER:</b> Huntington–Hill can never take a seat away when the House grows. Explain why from how it hands out seats one at a time. Then a discussion question with no single right answer: should the method favor keeping district sizes close, or keeping each state’s seats close to its quota? Give the strongest case for each.</p>'},
 terms:[
  {t:'Apportionment',d:'Dividing the 435 House seats among the states by population after each census.'},
  {t:'Quota',d:'A state’s exact fair share of seats: its population ÷ (total population ÷ seats). Usually not a whole number.'},
  {t:'Priority value',d:'Population ÷ √(n × (n + 1)), where n is the seats a state already has. The biggest value gets the next seat.'},
  {t:'Reapportionment',d:'Redoing the division of seats after a new census, so some states gain seats and some lose them.'},
  {t:'Huntington–Hill method',d:'The method of equal proportions, used by Congress since 1941. It hands out seats 51 to 435 by priority value.',lvl:'honors'},
  {t:'Geometric mean',d:'For two numbers a and b, √(a × b). Huntington–Hill rounds between n and n + 1 at √(n(n + 1)).',lvl:'honors'},
  {t:'Hamilton’s method',d:'Round every quota down, then give leftover seats to the largest fractional parts. Also called largest remainders.',lvl:'ap'},
  {t:'Alabama paradox',d:'A state loses a seat when the total number of seats goes up. Hamilton’s method can do this; Huntington–Hill cannot.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> U.S. Census Bureau, 2020 Census Apportionment Results (released April 2021), Table 1, apportionment population by state (<a href="https://www.census.gov/data/tables/2020/dec/2020-apportionment-data.html" target="_blank" rel="noopener">census.gov/data/tables/2020/dec/2020-apportionment-data.html</a>). Total apportionment population 331,108,434. Running Huntington–Hill on these numbers here reproduces the Census Bureau’s seat counts and its published priority values: Colorado’s 8th seat was seat 432 (772,675.1), Minnesota’s 8th was seat 435 (762,997.7), and New York’s 27th was first runner-up at seat 436 (762,994.4). Colorado gained 1 seat, going from 7 to 8. The Census Bureau’s Table B2 reports that New York needed 89 more people to gain a seat. Computed here: Minnesota would still have won with 25 fewer people.</p>'+
  '<p><b>History.</b> The Census Bureau states that Congress has used the method of equal proportions since 1941. The Congressional Research Service (David C. Huckabee, <i>The House Apportionment Formula in Theory and Practice</i>, RL30711, October 10, 2000) reports that the Hamilton-Vinton method was used after the 1850 to 1900 censuses and is subject to the Alabama paradox: in 1880, Alabama would have lost a seat if the House had grown from 299 to 300 seats. The same report cites a 1984 CRS simulation in which equal proportions persistently advantaged smaller states.</p>'+
  '<p><b>The model.</b> Alder, Birch and Cedar are made-up states with round populations chosen for hand calculation. The Hamilton results for 2020 are computed here for comparison, not an official result; this version of Hamilton also gives every state at least 1 seat. The tool shows the arithmetic. Which method is fairest is a question of what “fair” should mean, and the tool does not score it.</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
