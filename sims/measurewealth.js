(function(){
'use strict';
const {clamp,txt,rr,pill,PAL,FONT,axes,atLeast}=BioLab.h;
/* Seven countries, north and south. Sources are listed in `about`.
   gdp, ppp: World Bank WDI, GDP per capita, 2024 (current US$ and current international $, PPP).
   le, eys, mys, gni, hdi: UNDP Human Development Report 2025, Table 1 (data year 2023). gni is GNI per capita, 2021 PPP $.
   hap: World Happiness Report 2026, life evaluation (Cantril ladder, 0 to 10), 2023 to 2025 average. Bhutan is not in it.
   gini, q: World Bank Gini index and income or consumption shares by fifth (quintile), latest year shown in gy. */
const C=[
 {id:'nor',n:'Norway',gdp:89889,ppp:105657,le:83.3,eys:18.8,mys:13.1,gni:112710,hdi:0.970,hap:7.242,gini:26.5,gy:2023,wt:'income',q:[9.1,14.4,18.0,22.7,35.8]},
 {id:'usa',n:'United States',gdp:86170,ppp:86170,le:79.3,eys:15.9,mys:13.9,gni:73650,hdi:0.938,hap:6.816,gini:41.8,gy:2024,wt:'income',q:[5.1,10.0,15.1,22.6,47.1]},
 {id:'cri',n:'Costa Rica',gdp:18853,ppp:31552,le:80.8,eys:16.3,mys:8.8,gni:23417,hdi:0.833,hap:7.439,gini:45.5,gy:2025,wt:'income',q:[4.7,9.0,13.8,21.5,50.9]},
 {id:'ecu',n:'Ecuador',gdp:6827,ppp:15848,le:77.4,eys:14.9,mys:9.0,gni:13986,hdi:0.777,hap:6.144,gini:45.9,gy:2025,wt:'income',q:[4.8,8.9,13.7,21.2,51.5]},
 {id:'btn',n:'Bhutan',gdp:4228,ppp:17762,le:73.0,eys:13.2,mys:5.8,gni:13843,hdi:0.698,hap:null,gini:28.5,gy:2022,wt:'consumption',q:[8.8,13.5,17.6,22.8,37.3]},
 {id:'ind',n:'India',gdp:2592,ppp:10719,le:72.0,eys:13.0,mys:6.9,gni:9047,hdi:0.685,hap:4.536,gini:23.0,gy:2023,wt:'consumption',q:[11.1,14.8,17.9,22.0,34.2]},
 {id:'nga',n:'Nigeria',gdp:1084,ppp:9100,le:54.5,eys:10.5,mys:7.6,gni:5569,hdi:0.560,hap:4.788,gini:33.9,gy:2022,wt:'consumption',q:[7.5,12.0,16.4,22.6,41.6]}];
const CB=id=>C.find(c=>c.id===id);
const usd=v=>'$'+Math.round(v).toLocaleString('en-US');
const MEAS={
 gdp:{l:'GDP per person (US dollars)',h:'By GDP per person',get:c=>c.gdp,f:usd,hi:true,unit:'dollars'},
 ppp:{l:'GDP per person at local prices (PPP)',h:'By GDP, local prices',get:c=>c.ppp,f:usd,hi:true,unit:'dollars'},
 le:{l:'Life expectancy at birth',h:'By life expectancy',get:c=>c.le,f:v=>v.toFixed(1)+' yr',hi:true,unit:'years'},
 sch:{l:'Years of school (adults 25+, average)',h:'By years of school',get:c=>c.mys,f:v=>v.toFixed(1)+' yr',hi:true,unit:'years'},
 hdi:{l:'Human Development Index',h:'By HDI',get:c=>c.hdi,f:v=>v.toFixed(3),hi:true,unit:'index points'},
 hap:{l:'Life evaluation (0 to 10 ladder)',h:'By happiness ladder',get:c=>c.hap,f:v=>v.toFixed(2)+' of 10',hi:true,unit:'ladder points'},
 eq:{l:'Equality (lowest Gini first)',h:'By equality (Gini)',get:c=>c.gini,f:v=>'Gini '+v.toFixed(1),hi:false,unit:'Gini points'}};
const ranked=m=>{const M=MEAS[m];return C.filter(c=>M.get(c)!=null).sort((x,y)=>M.hi?M.get(y)-M.get(x):M.get(x)-M.get(y));};
const rankOf=(id,m)=>{const i=ranked(m).findIndex(c=>c.id===id);return i<0?null:i+1;};
const ord=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');
/* The gut questions: one country, one new measure. */
const GQ={
 cr_le:{c:'cri',m:'le',l:'Costa Rica, by life expectancy'},
 us_le:{c:'usa',m:'le',l:'United States, by life expectancy'},
 cr_hap:{c:'cri',m:'hap',l:'Costa Rica, by happiness ladder'},
 ng_eq:{c:'nga',m:'eq',l:'Nigeria, by equality'},
 bt_ppp:{c:'btn',m:'ppp',l:'Bhutan, by GDP at local prices',lvl:'honors'},
 us_hdi:{c:'usa',m:'hdi',l:'United States, by HDI',lvl:'honors'},
 bt_sch:{c:'btn',m:'sch',l:'Bhutan, by years of school',lvl:'ap'}};
const Q=sim=>GQ[sim.p.gq]||GQ.cr_le;
const truth=sim=>rankOf(Q(sim).c,Q(sim).m);
/* A family's year. Every dollar and hour here is an assumption for illustration. */
const EV=[
 {id:'e_ill',l:'Grandpa’s cancer treatment (chemotherapy)',s:'Grandpa’s chemo',gdp:50000,hd:-90,fr:-120,up:0},
 {id:'e_hail',l:'Hail wrecks the roof and car: you pay for repairs',s:'Hail repairs',gdp:18000,hd:0,fr:-30,up:0},
 {id:'e_smoke',l:'Wildfire smoke: air purifiers, filters, an inhaler',s:'Smoke: air filters',gdp:700,hd:-12,fr:0,up:0},
 {id:'e_comm',l:'A parent’s commute grows 40 minutes a day',s:'Longer commute',gdp:1800,hd:0,fr:-160,up:0},
 {id:'e_care',l:'Your family cares for Grandma at home, unpaid',s:'Care for Grandma at home',gdp:0,hd:0,fr:0,up:730},
 {id:'e_tutor',l:'You tutor kids at your parish for 60 hours',s:'You tutor 60 hours',gdp:0,hd:0,fr:0,up:60},
 {id:'e_flu',l:'Nobody in your family gets the flu',s:'No flu this year',gdp:-400,hd:28,fr:0,up:0},
 {id:'e_4day',l:'A parent moves to a 4-day week, with less pay',s:'4-day work week',gdp:-12000,hd:0,fr:400,up:0}];
const on=sim=>EV.filter(e=>sim.p[e.id]);
const sum=(sim,k)=>on(sim).reduce((a,e)=>a+e[k],0);
const lifeSign=e=>Math.sign(e.hd+e.fr+e.up);
const worseUp=sim=>on(sim).filter(e=>e.gdp>0&&lifeSign(e)<0).length;
const betterMissed=sim=>on(sim).filter(e=>e.gdp<=0&&lifeSign(e)>0).length;
/* A street of 10 households, in thousands of dollars a year: an illustration, not real data. */
const STREET=[24,32,40,48,56,65,75,88,105];
const street=sim=>STREET.concat([sim.p.top]).sort((a,b)=>a-b);
const meanOf=a=>a.reduce((s,x)=>s+x,0)/a.length;
const medOf=a=>{const b=a.slice().sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
const giniOf=a=>{const n=a.length,mu=meanOf(a);let s=0;for(const x of a)for(const y of a)s+=Math.abs(x-y);return s/(2*n*n*mu);};
const lorenzStreet=a=>{const b=a.slice().sort((x,y)=>x-y),T=b.reduce((s,x)=>s+x,0);let c=0;const p=[[0,0]];b.forEach((x,i)=>{c+=x;p.push([(i+1)/b.length,c/T]);});return p;};
const lorenzQ=q=>{const T=q.reduce((s,x)=>s+x,0);let c=0;const p=[[0,0]];q.forEach((x,i)=>{c+=x;p.push([(i+1)/5,c/T]);});return p;};
const giniPts=p=>1-p.slice(1).reduce((s,pt,i)=>s+(pt[0]-p[i][0])*(pt[1]+p[i][1]),0);
/* Index dimensions, each scaled 0 to 1 with fixed goalposts (UNDP's for income, health and education). */
const DIM={
 inc:c=>Math.min(1,(Math.log(c.gni)-Math.log(100))/(Math.log(75000)-Math.log(100))),
 hea:c=>(c.le-20)/65,
 edu:c=>(Math.min(c.eys,18)/18+Math.min(c.mys,15)/15)/2,
 hap:c=>c.hap==null?null:c.hap/10,
 eq:c=>1-c.gini/100};
const WK=[['inc','w_inc','Income'],['hea','w_hea','Health'],['edu','w_edu','Education'],['hap','w_hap','Happiness'],['eq','w_eq','Equality']];
const hdiCalc=c=>Math.cbrt(DIM.inc(c)*DIM.hea(c)*DIM.edu(c));
function idx(sim,c){let W=0,a=0,g=0,miss=false;WK.forEach(([d,w])=>{const wt=sim.p[w],v=DIM[d](c);if(!wt)return;if(v==null){miss=true;return;}W+=wt;a+=wt*v;g+=wt*Math.log(Math.max(v,1e-6));});
 if(!W)return {v:0,miss};return {v:sim.p.comb==='geo'?Math.exp(g/W):a/W,miss};}
const idxRank=sim=>C.map(c=>({c,r:idx(sim,c)})).sort((x,y)=>y.r.v-x.r.v);
const idxRankOf=(sim,id)=>idxRank(sim).findIndex(o=>o.c.id===id)+1;
const movers=sim=>idxRank(sim).filter((o,i)=>rankOf(o.c.id,'gdp')!==i+1).length;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
const revealed=sim=>!!(GS(sim)&&GS(sim).m);
/* "Your turn": the place on the new list = 1 + the number of countries that beat it on that measure. */
const fmtV=(m,v)=>m==='gdp'||m==='ppp'?usd(v):v.toFixed(m==='hdi'?3:m==='hap'?2:1);
const listed=m=>C.filter(c=>MEAS[m].get(c)!=null);
const beaters=sim=>{const q=Q(sim),M=MEAS[q.m],v=M.get(CB(q.c));return listed(q.m).filter(c=>c.id!==q.c&&(M.hi?M.get(c)>v:M.get(c)<v));};
const hdiParts=c=>[DIM.hea(c),DIM.edu(c),DIM.inc(c)];
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function setQ(sim){const q=Q(sim);BioLab.setValues(sim,{measure:q.m,grank:rankOf(q.c,'gdp'),show:false});clearGut(sim);}
/* Show only the controls for the current view. */
const VIEWCTL={gq:'rank',grank:'rank',show:'rank',measure:'rank',wage:'ledger',top:'spread',w_inc:'build',w_hea:'build',w_edu:'build',w_hap:'build',w_eq:'build',comb:'build'};
EV.forEach(e=>VIEWCTL[e.id]='ledger');
function syncVis(sim){const u=sim.ui;if(!u||!u.ctlW)return;
 Object.keys(VIEWCTL).forEach(id=>{const w=u.ctlW[id];if(!w||w._home)return;const c=SIM.controls.find(x=>x.id===id);const hide=!atLeast(c.lvl)||VIEWCTL[id]!==sim.p.view;if(w.hidden!==hide)w.hidden=hide;});}

/* ---------- drawing ---------- */
const W=800,H=500;
function drawRank(sim,ctx,k){const q=Q(sim),m=sim.p.measure,M=MEAS[m],sh=shown(sim),G=GS(sim),ph=k>1.4;
 const L0=24,R0=476,cw=300,top=Math.round(44+16*k),rh=(H-top-10)/7;
 txt(ctx,MEAS.gdp.h,L0,30,{s:14*k,w:700});txt(ctx,sh?M.h:M.h+': ?',R0,30,{s:14*k,w:700,c:sh?PAL['cv-ink']:PAL['s4']});
 if(!ph){txt(ctx,'US dollars, 2024',L0,30+17*k,{s:12*k,c:PAL['cv-soft']});{const c0=CB(q.c),hp=hdiParts(c0);txt(ctx,sh&&m==='hdi'&&revealed(sim)?`${c0.n}: (${hp.map(x=>x.toFixed(3)).join(' × ')})^(1/3) = ${hdiCalc(c0).toFixed(3)}`:sh?(m==='eq'?'Lower Gini = more equal':m==='hap'?'Average answer, 0 to 10':'Highest first'):'Lock in your guess first',R0,30+17*k,{s:12*k,c:sh&&m==='hdi'&&revealed(sim)?PAL['rj']:PAL['cv-soft'],w:sh&&m==='hdi'&&revealed(sim)?700:400});}}
 const ry=i=>top+i*rh+rh/2;
 const gl=ranked('gdp'),rl=ranked(m),gpos=id=>gl.findIndex(c=>c.id===id),rpos=id=>{const i=rl.findIndex(c=>c.id===id);return i<0?6:i;};
 /* connecting lines */
 C.forEach(c=>{const f=c.id===q.c;if(!sh&&!f)return;const y1=ry(gpos(c.id));let y2;
  if(sh)y2=ry(rpos(c.id));else if(G&&G.g)y2=ry(G.g.r-1);else y2=ry(sim.p.grank-1);
  ctx.strokeStyle=f?(sh?PAL['rj']:PAL['s4']):PAL['cv-soft'];ctx.globalAlpha=f?1:.45;ctx.lineWidth=f?3:1.5;if(!sh)ctx.setLineDash([7,5]);
  ctx.beginPath();ctx.moveTo(L0+cw+8,y1);ctx.bezierCurveTo(L0+cw+70,y1,R0-70,y2,R0-8,y2);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;});
 /* left column */
 gl.forEach((c,i)=>{const y=ry(i),f=c.id===q.c;if(f){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,L0-8,y-rh/2+3,cw+14,rh-6,6);ctx.fill();}
  txt(ctx,(i+1)+'. '+c.n,L0,y,{s:13*k,w:f?700:400,b:'middle',c:f?PAL['rj']:PAL['cv-ink']});txt(ctx,usd(c.gdp),L0+cw,y,{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
 /* right column */
 if(sh){rl.forEach((c,i)=>{const y=ry(i),f=c.id===q.c;if(f){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,R0-8,y-rh/2+3,cw+14,rh-6,6);ctx.fill();}
   txt(ctx,(i+1)+'. '+c.n,R0,y,{s:13*k,w:f?700:400,b:'middle',c:f?PAL['rj']:PAL['cv-ink']});txt(ctx,M.f(M.get(c)),R0+cw,y,{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
  C.filter(c=>M.get(c)==null).forEach(c=>{txt(ctx,c.n+': not surveyed',R0,ry(6),{s:12*k,b:'middle',c:PAL['cv-soft']});});
  if(G&&G.g&&G.g.r!==rpos(q.c)+1){const gy=ry(G.g.r-1),gc=rl[G.g.r-1];ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(R0-8,gy-rh/2+3,cw+14,rh-6);ctx.setLineDash([]);
   if(gc){ctx.font='400 '+(13*k)+'px '+FONT;const nw=ctx.measureText((G.g.r)+'. '+gc.n).width;txt(ctx,'your gut',R0+nw+10,gy,{s:12*k,w:700,b:'middle',c:PAL['s4']});}}}
 else{for(let i=0;i<7;i++){const y=ry(i);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(R0-4,y-rh/2+5,cw+6,rh-10);txt(ctx,(i+1)+'.',R0+4,y,{s:13*k,b:'middle',c:PAL['cv-soft']});}
  const gi=(G&&G.g?G.g.r:sim.p.grank)-1;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.strokeRect(R0-4,ry(gi)-rh/2+5,cw+6,rh-10);
  txt(ctx,CB(q.c).n+(G&&G.g?' (your gut)':' ?'),R0+34*k,ry(gi),{s:13*k,w:700,b:'middle',c:PAL['s4']});}}

function drawLedger(sim,ctx,k){const ph=k>1.4,x0=16,x1=468,top=Math.round(36+16*k),rh=(H-top-8)/8;sim._lg={top,rh};
 txt(ctx,'Your family’s year',x0,28,{s:15*k,w:700});if(!ph)txt(ctx,'Click an event to add it. Right: its effect on GDP.',x0+150*k,28,{s:12*k,c:PAL['cv-soft']});
 EV.forEach((e,i)=>{const y=top+i*rh+rh/2,o=!!sim.p[e.id];
  if(o){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x0-4,y-rh/2+3,x1-x0+8,rh-6,6);ctx.fill();}
  const b=14*Math.min(k,1.4);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.strokeRect(x0+2,y-b/2,b,b);if(o){ctx.fillStyle=PAL['rj'];ctx.fillRect(x0+5,y-b/2+3,b-6,b-6);}
  txt(ctx,ph?e.s:e.l,x0+b+12,y,{s:(ph?13:12.5)*k,w:o?700:400,b:'middle'});
  const g=e.gdp;txt(ctx,o?(g>0?'+':g<0?'−':'')+usd(Math.abs(g)):'',x1,y,{s:12*k,w:700,a:'right',b:'middle',c:g>0?PAL['s2']:g<0?PAL['s1']:PAL['cv-soft']});
  if(o&&g===0)txt(ctx,'$0',x1,y,{s:12*k,w:700,a:'right',b:'middle',c:PAL['cv-soft']});});
 ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(488,14);ctx.lineTo(488,H-14);ctx.stroke();
 const rx=502,rw=284,cx=rx+rw/2,half=rw/2-6;
 const rows=[['GDP change',sum(sim,'gdp'),82000,v=>(v>0?'+':v<0?'−':'')+usd(Math.abs(v)),true],['Healthy days',sum(sim,'hd'),120,v=>(v>0?'+':v<0?'−':'')+Math.abs(v)+' days'],['Free hours',sum(sim,'fr'),600,v=>(v>0?'+':v<0?'−':'')+Math.abs(v)+' h'],[ph?'Unpaid care':'Unpaid care and help',sum(sim,'up'),800,v=>(v>0?'+':'')+v+' h']];
 const hon=atLeast('honors');if(hon)rows.push([ph?'GDP + unpaid':'GDP + unpaid work',sum(sim,'gdp')+sum(sim,'up')*sim.p.wage,82000,v=>(v>0?'+':v<0?'−':'')+usd(Math.abs(v))]);
 const bh=(H-24)/rows.length;
 rows.forEach(([l,v,mx,f,big],i)=>{const y=14+i*bh,money=i===0||i===4,col=money?(v?PAL['s2']:PAL['cv-soft']):v>0?PAL['s3']:v<0?PAL['s1']:PAL['cv-soft'];txt(ctx,l,rx,y+16*k,{s:13*k,w:700});txt(ctx,f(v),rx+rw,y+16*k,{s:(big?14:13)*k,w:700,a:'right',c:col});
  const by=y+24*k+6;ctx.fillStyle=PAL['line'];ctx.fillRect(rx,by,rw,10);ctx.fillStyle=PAL['cv-soft'];ctx.fillRect(cx-1,by-3,2,16);
  const w=clamp(v/mx,-1,1)*half;ctx.fillStyle=money?PAL['s2']:v>=0?PAL['s3']:PAL['s1'];ctx.fillRect(Math.min(cx,cx+w),by,Math.abs(w),10);
  if(i===0&&!ph&&bh>70){const gs=on(sim).map(e=>e.gdp);const s=!gs.length?'GDP counts money spent, good or bad':gs.length>4?`Sum of ${gs.length} events = ${usd(v)}`:gs.map((x,j)=>(j?(x<0?' − ':' + '):(x<0?'−':''))+Math.abs(x).toLocaleString('en-US')).join('')+' = '+(v<0?'−':'')+Math.abs(v).toLocaleString('en-US');txt(ctx,s,rx,by+28,{s:12*k,c:gs.length?PAL['s2']:PAL['cv-soft'],w:gs.length?700:400});}
  if(i===4&&!ph&&bh>70)txt(ctx,`Unpaid hours at $${sim.p.wage.toFixed(2)} an hour`,rx,by+28,{s:12*k,c:PAL['cv-soft']});});}

function drawSpread(sim,ctx,k){const a=street(sim),mu=meanOf(a),md=medOf(a),ph=k>1.4;
 txt(ctx,'A street of 10 households',20,28,{s:15*k,w:700});
 txt(ctx,`Mean (average): $${mu.toFixed(1)}k`,20,28+20*k,{s:13*k,w:700,c:PAL['s1']});txt(ctx,`Median (middle): $${md.toFixed(1)}k`,20,28+38*k,{s:13*k,w:700,c:PAL['s3']});
 const bx=24,bw=380,base=H-36,ht=base-(70+40*k),cap=Math.max(200,mu*1.2),sc=ht/cap,step=bw/10;
 a.forEach((v,i)=>{const h=Math.min(v,cap)*sc,x=bx+i*step+4;ctx.fillStyle=i===9?PAL['rj']:'#3f6fb0';ctx.fillRect(x,base-h,step-8,h);
  if(v>cap){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x-1,base-h+18,step-6,6);txt(ctx,'$'+Math.round(v).toLocaleString('en-US')+'k',x+(step-8)/2,base-h-8,{s:12*k,w:700,a:'center',c:PAL['rj']});}});
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx,base);ctx.lineTo(bx+bw,base);ctx.stroke();
 txt(ctx,ph?'Lowest to highest':'Each bar is one household, lowest to highest income',bx,base+20,{s:12*k,c:PAL['cv-soft']});
 const line=(v,col)=>{const y=base-Math.min(v,cap)*sc;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx+bw,y);ctx.stroke();ctx.setLineDash([]);};
 line(mu,PAL['s1']);line(md,PAL['s3']);
 /* the two computations, step by step */
 const LX=440,tot=a.reduce((s,x)=>s+x,0),f1=v=>(Math.round(v*10)/10).toLocaleString('en-US');let yy=Math.round(110+20*k);const lh=22*k;
 txt(ctx,'Mean: add all 10, divide by 10',LX,yy,{s:13*k,w:700,c:PAL['s1']});yy+=lh;
 txt(ctx,`Sum = ${f1(tot)}k`,LX,yy,{s:13*k});yy+=lh;txt(ctx,`${f1(tot)} ÷ 10 = $${mu.toFixed(1)}k`,LX,yy,{s:13*k,w:700});yy+=lh*1.6;
 txt(ctx,'Median: the middle of the sorted list',LX,yy,{s:13*k,w:700,c:PAL['s3']});yy+=lh;
 txt(ctx,ph?'5th and 6th households':'10 values: average the 5th and 6th',LX,yy,{s:13*k});yy+=lh;txt(ctx,`(${a[4]} + ${a[5]}) ÷ 2 = $${md.toFixed(1)}k`,LX,yy,{s:13*k,w:700});yy+=lh*1.6;
 if(yy<H-20)txt(ctx,`Mean − median = $${(mu-md).toFixed(1)}k`,LX,yy,{s:13*k,w:700,c:PAL['rj']});}

function drawBuild(sim,ctx,k){const R=idxRank(sim),ph=k>1.4,q=Q(sim),top=Math.round(56+18*k),rh=(H-top-(ph?8:30))/7,nx=20,bx=Math.round(150+50*k),bw=W-bx-110*k;
 txt(ctx,'Your index',20,28,{s:15*k,w:700});
 const ws=WK.map(([d,w,l])=>`${l} ${sim.p[w]}`).join(' · ');txt(ctx,(ph?'':'Weights: ')+ws,20,28+20*k,{s:12*k,c:PAL['cv-soft']});
 txt(ctx,sim.p.comb==='geo'?'Geometric mean':'Weighted average',W-20,28,{s:12*k,a:'right',c:PAL['cv-soft']});
 let anyMiss=false;
 R.forEach((o,i)=>{const y=top+i*rh+rh/2,f=o.c.id===q.c,g=rankOf(o.c.id,'gdp'),d=g-(i+1);if(o.r.miss)anyMiss=true;
  txt(ctx,(i+1)+'. '+o.c.n+(o.r.miss?'*':''),nx,y,{s:13*k,w:f?700:400,b:'middle',c:f?PAL['rj']:PAL['cv-ink']});
  ctx.fillStyle=PAL['line'];ctx.fillRect(bx,y-7,bw,14);ctx.fillStyle=f?PAL['rj']:'#3f6fb0';ctx.fillRect(bx,y-7,bw*clamp(o.r.v,0,1),14);
  txt(ctx,o.r.v.toFixed(3),bx+bw+8,y,{s:12*k,b:'middle'});
  txt(ctx,d>0?'▲'+d:d<0?'▼'+(-d):'=',W-14,y,{s:12*k,w:700,a:'right',b:'middle',c:d>0?PAL['s3']:d<0?PAL['s1']:PAL['cv-soft']});});
 if(!ph)txt(ctx,anyMiss?'* No 2023 to 2025 happiness survey: its index uses the other measures.   ▲▼ = places vs. GDP rank':'▲▼ = places up or down compared with the GDP per person ranking',20,H-12,{s:12*k,c:PAL['cv-soft']});}

function draw(sim,ctx,vdt,k){sim._k=k;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);syncVis(sim);
 const v=sim.p.view;if(v==='ledger')drawLedger(sim,ctx,k);else if(v==='spread')drawSpread(sim,ctx,k);else if(v==='build')drawBuild(sim,ctx,k);else drawRank(sim,ctx,k);}

/* Context that used to sit under the picture; it now lives in About. */
const CONTEXT=`<p><b>Bhutan’s Gross National Happiness.</b> Bhutan measures progress with a Gross National Happiness (GNH) Index built from a survey: 9 domains (psychological wellbeing, health, education, time use, cultural diversity and resilience, good governance, community vitality, ecological diversity and resilience, living standards) and 33 indicators. A person counts as happy when they reach sufficiency in at least 66% of the weighted indicators.</p>
<p>The index is GNH = 1 − H × A, where H is the share of people not yet happy and A is the average share of indicators they still fall short in. In the 2022 survey, H = 51.9% and A ≈ 42.1%, so GNH ≈ 1 − 0.519 × 0.421 ≈ 0.781 (it was 0.756 in 2015 and 0.743 in 2010). Unlike GDP, the GNH Index counts people, not dollars, and it looks at who is falling short.</p>
<p><b>What the Church says about progress.</b> Pope Paul VI wrote in <i>Populorum Progressio</i> (1967, no. 14) that development “cannot be restricted to economic growth alone.” It must foster “the development of each man and of the whole man.” Pope Francis, in <i>Laudato Si’</i> (2015, no. 194), says “it is a matter of redefining our notion of progress.”</p>
<p><b>A warning from GDP’s architect.</b> Simon Kuznets, who built the first U.S. national income accounts, told the Senate in 1934 that a nation’s welfare “can, therefore, scarcely be inferred” from a measure of national income.</p>
<p><b>Which measure is right?</b> This tool does not say. Each measure answers a different question: how much is bought and sold, how long people live, how much schooling they get, how they rate their own lives, how evenly income is shared. Choosing weights means deciding what a good life includes, and that is a question of values, not math. <b>Discuss:</b> what would you add that none of these measures count?</p>`;

const SIM={
 id:'measurewealth',hash:'measurewealth',apUnit:5,order:1,tab:'What counts as wealth?',kind:'Simulation',next:['northsouth'],
 skills:{bio:'Adding what GDP counts, and ranking data by a measure · Statistics (Chapter 1), AP Macroeconomics (Unit 2)',honors:'Mean vs. median, and the geometric mean (HDI) · Statistics (Chapter 1), Algebra 2 (Unit 4)',ap:'Normalizing to 0 to 1 and weighted means: building an index · Statistics (Chapter 1), Algebra 2 (Unit 5)'},
 card:'Guess how a country’s rank changes when you stop measuring money, then see what GDP counts, what it misses, and build your own index.',
 title:'What counts as wealth?',
 lede:{bio:'When a family pays for chemotherapy, GDP goes up. When a parent cares for Grandma at home, GDP does not move. So is the country with the biggest GDP the best place to live? Rank seven countries a few different ways and see.',
  honors:'The Human Development Index (HDI) combines health, education and income with a geometric mean, which punishes a country that is strong in one area and weak in another. The mean and the median of incomes can tell very different stories.',
  ap:'Every index is a choice: which dimensions, how to scale each one to 0 to 1, how to weight them and how to combine them. Change the weights and the rankings move. The math is checkable; the weights are a question of values.'},
 scale:'Seven countries, north and south, with data from 2022 to 2025. One family’s year for the GDP ledger. One street of 10 households for mean and median.',
 aspect:1.6,timeless:true,trials:true,graph:true,
 controlsTitle:'Your measures',
 controls:[
  {id:'view',label:'What to look at',type:'seg',def:'rank',noGut:true,onChange:syncVis,options:[{v:'rank',l:'Rank the countries'},{v:'ledger',l:'What GDP counts'},{v:'spread',l:'Average vs. typical',lvl:'honors'},{v:'build',l:'Build your own index',lvl:'ap'}]},
  {id:'gq',label:'The question',type:'select',def:'cr_le',noGut:true,onChange:setQ,options:Object.keys(GQ).map(k=>({v:k,l:GQ[k].l,lvl:GQ[k].lvl}))},
  {id:'grank',label:'Your guess: its rank on the new list',type:'seg',def:3,options:[1,2,3,4,5,6,7].map(n=>({v:n,l:ord(n)})),help:'It starts at its rank by GDP per person. Move it if you think the new measure changes things.'},
  {id:'show',label:'Show the real ranking',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'measure',label:'Rank by',type:'select',def:'le',noGut:true,options:[{v:'le',l:'Life expectancy'},{v:'hap',l:'Happiness ladder (0 to 10)'},{v:'eq',l:'Equality (Gini)'},{v:'ppp',l:'GDP per person at local prices (PPP)',lvl:'honors'},{v:'sch',l:'Years of school',lvl:'honors'},{v:'hdi',l:'Human Development Index',lvl:'honors'},{v:'gdp',l:'GDP per person'}]},
  ...EV.map(e=>({id:e.id,label:e.l,type:'toggle',def:false,noGut:true})),
  {id:'wage',label:'Value unpaid hours at this wage',type:'range',min:10,max:40,step:0.5,def:17,unit:' $/h',d:2,lvl:'honors',noGut:true,help:'BEA values household work at what a paid household worker would earn. $17 an hour is an assumption for illustration.'},
  {id:'top',label:'Richest household’s income, in thousands of dollars',type:'range',min:110,max:2000,step:10,def:150,unit:'k',lvl:'honors',noGut:true},
  {id:'w_inc',label:'Weight: income',type:'range',min:0,max:10,step:1,def:1,lvl:'ap',noGut:true},
  {id:'w_hea',label:'Weight: health (life expectancy)',type:'range',min:0,max:10,step:1,def:1,lvl:'ap',noGut:true},
  {id:'w_edu',label:'Weight: education',type:'range',min:0,max:10,step:1,def:1,lvl:'ap',noGut:true},
  {id:'w_hap',label:'Weight: happiness ladder',type:'range',min:0,max:10,step:1,def:1,lvl:'ap',noGut:true},
  {id:'w_eq',label:'Weight: equality',type:'range',min:0,max:10,step:1,def:1,lvl:'ap',noGut:true},
  {id:'comb',label:'Combine with',type:'seg',def:'arith',lvl:'ap',noGut:true,options:[{v:'arith',l:'Weighted average'},{v:'geo',l:'Geometric mean'}]}
 ],
 actions:[
  {id:'sick',label:'Try it: a hard year',run(sim){const v={view:'ledger'};EV.forEach(e=>v[e.id]=['e_ill','e_hail','e_comm'].includes(e.id));BioLab.setValues(sim,v);}},
  {id:'clear',label:'Clear the year',run(sim){const v={};EV.forEach(e=>v[e.id]=false);BioLab.setValues(sim,v);}},
  {id:'hdiw',label:'Use the HDI recipe',lvl:'ap',run(sim){BioLab.setValues(sim,{view:'build',w_inc:1,w_hea:1,w_edu:1,w_hap:0,w_eq:0,comb:'geo'});}},
  {id:'eqw',label:'Equal weights',lvl:'ap',run(sim){BioLab.setValues(sim,{view:'build',w_inc:1,w_hea:1,w_edu:1,w_hap:1,w_eq:1,comb:'arith'});}}
 ],
 init(){return {};},step(){},
 onLevel:syncVis,
 metrics:[
  {id:'gdprank',label:'Its rank by GDP per person',unit:'of 7',d:0,min:1,max:7,get:sim=>rankOf(Q(sim).c,'gdp')},
  {id:'truerank',label:'Its real rank on the new list',unit:'',d:0,min:1,max:7,get:sim=>shown(sim)?truth(sim):null},
  {id:'gdpchg',label:'Your family’s year: GDP change',unit:'dollars',d:0,min:null,max:null,get:sim=>sum(sim,'gdp')},
  {id:'healthy',label:'Healthy days (family of 4)',unit:'days',d:0,min:null,max:null,get:sim=>sum(sim,'hd')},
  {id:'free',label:'Free hours',unit:'hours',d:0,min:null,max:null,get:sim=>sum(sim,'fr')},
  {id:'unpaid',label:'Unpaid care and help',unit:'hours',d:0,min:0,max:null,get:sim=>sum(sim,'up')},
  {id:'worse',label:'Events that raised GDP but made life worse',unit:'',d:0,min:0,max:8,get:worseUp},
  {id:'missed',label:'Events that made life better while GDP stayed flat or fell',unit:'',d:0,min:0,max:8,get:betterMissed},
  {id:'extgdp',label:'GDP + unpaid work, valued at your wage',unit:'dollars',d:0,lvl:'honors',min:null,max:null,get:sim=>sum(sim,'gdp')+sum(sim,'up')*sim.p.wage},
  {id:'smean',label:'Street mean income',unit:'$ thousands',d:1,lvl:'honors',min:0,max:null,get:sim=>meanOf(street(sim))},
  {id:'median',label:'Street median income',unit:'$ thousands',d:1,lvl:'honors',min:0,max:null,get:sim=>medOf(street(sim))},
  {id:'hdicalc',label:'HDI from the formula, this country',unit:'',d:3,lvl:'honors',min:0,max:1,get:sim=>hdiCalc(CB(Q(sim).c))},
  {id:'irank',label:'This country’s rank on your index',unit:'of 7',d:0,lvl:'ap',min:1,max:7,get:sim=>idxRankOf(sim,Q(sim).c)},
  {id:'moved',label:'Countries ranked differently than by GDP',unit:'of 7',d:0,lvl:'ap',min:0,max:7,get:movers}
 ],
 graphs:[{id:'preston',label:'Life expectancy vs. income per person',custom:true}],defaultGraph:'preston',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:0,xmax:110,ymin:50,ymax:90,xl:'GDP per person at local prices (PPP), thousands of dollars, 2024',yl:'Life expectancy (years)'});const q=Q(sim);
  const side={ind:-1,nga:1,btn:1,ecu:-1,cri:1,usa:-1,nor:-1};
  C.forEach(c=>{const x=ax.X(c.ppp/1000),y=ax.Y(c.le),f=c.id===q.c;ctx.fillStyle=f?PAL['rj']:PAL['g-dot']||PAL['s2'];ctx.beginPath();ctx.arc(x,y,f?7:5,0,7);ctx.fill();
   txt(ctx,c.n,x+side[c.id]*10,y+(c.id==='ecu'?-10:c.id==='ind'?12:4),{s:12,w:f?700:400,a:side[c.id]>0?'left':'right',c:PAL['fg']});});
  txt(ctx,'More income buys a lot of life at first, then much less.',box.L+8,box.T+box.H-10,{s:12,c:PAL['muted']});},
 draw,
 onClick(sim,x,y){if(sim.p.view!=='ledger'||!sim._lg||x>480)return;const i=Math.floor((y-sim._lg.top)/sim._lg.rh);if(i>=0&&i<EV.length)BioLab.setValues(sim,{[EV[i].id]:!sim.p[EV[i].id]});},
 narrate(sim){const v=sim.p.view;
  if(v==='ledger'){const n=on(sim).length,g=sum(sim,'gdp');if(!n)return 'Add events to your family’s year. <b>GDP adds up money spent on goods and services</b>, whether the spending fixes a disaster or buys something new.';
   const w=worseUp(sim),b=betterMissed(sim);return `GDP ${g>=0?'rose':'fell'} by <b>${usd(Math.abs(g))}</b>. ${w?`${w} event${w>1?'s':''} raised GDP while making life harder: the money repaired or treated a loss.`:''} ${b?`${b} good thing${b>1?'s':''} left GDP flat or lower, because nobody was paid for ${b>1?'them':'it'}.`:''}`;}
  if(v==='spread'){const a=street(sim),mu=meanOf(a),md=medOf(a);return `The mean is $${mu.toFixed(1)}k and the median is $${md.toFixed(1)}k. <b>One very rich household pulls the mean up</b>, but the household in the middle earns the same as before. (For the Lorenz curve and the Gini index, open the North and South tool.)`;}
  if(v==='build'){const R=idxRank(sim),mv=movers(sim);return `On your index, <b>${R[0].c.n} ranks first</b>, and ${mv} of 7 countries sit in a different place than on GDP per person. Change one weight and watch who moves.`;}
  const q=Q(sim),c=CB(q.c),g=rankOf(q.c,'gdp');if(BioLab.calcPending&&BioLab.calcPending(sim))return `Your turn: count the countries that beat ${c.n} on ${MEAS[q.m].l.toLowerCase()}, then add 1.`;
  if(!shown(sim))return `${c.n} ranks ${ord(g)} of 7 by GDP per person. <b>Guess where it lands by ${MEAS[q.m].l.toLowerCase()}</b>, then lock it in.`;
  const m=sim.p.measure,r=rankOf(q.c,m);if(r==null)return `${c.n} is not in the 2023 to 2025 World Happiness Report survey, so it has no rank on this list.`;
  return `${c.n}: ${ord(g)} by GDP per person, <b>${ord(r)} by ${MEAS[m].l.toLowerCase()}</b> (${MEAS[m].f(MEAS[m].get(c))}). ${r===g?'Same place: this measure agrees with GDP here.':r<g?'It does better here than its income alone suggests.':'It does worse here than its income alone suggests.'}`;},
 gut:{better:'lower',controls:['grank'],
  ask:{bio:'The orange box is the country in the question. Pick the rank you think it gets on the new list (1st is the top), then lock it in.',
   honors:'Before you look: pick the rank you think the orange country gets on the new list, then lock it in.'},
  lock(sim){const q=Q(sim);return {v:Math.abs(sim.p.grank-truth(sim)),r:sim.p.grank,q:sim.p.gq,label:`${CB(q.c).n} ${ord(sim.p.grank)} by ${MEAS[q.m].l.toLowerCase()}`};},
  solve(sim){const q=Q(sim),t=truth(sim);sim.p.grank=t;sim.p.measure=q.m;sim.p.show=true;sim.p.view='rank';return {v:0,r:t,q:sim.p.gq,label:`${CB(q.c).n} ${ord(t)} by ${MEAS[q.m].l.toLowerCase()}`};},
  hint:{bio:'Lock in your guess. Then you will work out the real place yourself from the numbers.'},
  calc:{unit:'',d:0,tol:0.4,after:'lock',nextLabel:'Continue',
   prompt:sim=>{const q=Q(sim),M=MEAS[q.m],c=CB(q.c),L=listed(q.m);return `${c.n} has <b>${M.f(M.get(c))}</b> for ${M.l.toLowerCase()}. The others: ${L.filter(x=>x.id!==q.c).map(x=>`${x.n} ${M.f(M.get(x))}`).join(', ')}. ${M.hi?'Highest':'Lowest'} is 1st${q.m==='eq'?' (a lower Gini is more equal)':''}. What place is ${c.n} on this list of ${L.length}?`;},
   answer:sim=>truth(sim),
   hint:'Count how many countries beat it on this measure, then add 1.',
   steps(sim){const q=Q(sim),M=MEAS[q.m],c=CB(q.c),b=beaters(sim),L=ranked(q.m);
    return [`${M.hi?'Higher':'Lower'} than ${c.n}’s ${M.f(M.get(c))}: ${b.length?b.map(x=>`${x.n} (${M.f(M.get(x))})`).join(', '):'no one'}. That is ${b.length} countr${b.length===1?'y':'ies'}.`,
     `Place = ${b.length} + 1 = <b>${ord(truth(sim))}</b> of ${L.length}.`,
     `By GDP per person it is ${ord(rankOf(q.c,'gdp'))}.`];}},
  formula(sim){const q=Q(sim),M=MEAS[q.m],c=CB(q.c),b=beaters(sim),L=ranked(q.m);
   const base=`Place = 1 + (countries ${M.hi?'above':'below'} ${M.f(M.get(c))}) = 1 + ${b.length} = ${ord(truth(sim))} of ${L.length}`;
   if(q.m==='hdi'){const hp=hdiParts(c);return base+`<br>HDI = (health × education × income)^(1/3) = (${hp.map(x=>x.toFixed(3)).join(' × ')})^(1/3) = ${hdiCalc(c).toFixed(3)}`;}
   return base;},
  how:{bio:'The math sorts the seven countries by the new measure, highest first (lowest first for the Gini, where lower means more equal), and reads off the place.',
   honors:'Sort by the new measure and read the place. HDI is a geometric mean: HDI = (health index × education index × income index)^(1/3), each index scaled from 0 to 1.'},
  compare(sim,g,m){const q=GQ[g.q]||Q(sim),c=CB(q.c),M=MEAS[q.m],gr=rankOf(q.c,'gdp'),off=Math.abs(g.r-m.r),list=ranked(q.m);
   const nb=list[m.r===1?1:m.r-2],val=M.get(c),dv=Math.abs(val-M.get(nb)),dvs=q.m==='gdp'||q.m==='ppp'?usd(dv):dv.toFixed(q.m==='hdi'?3:q.m==='hap'?2:1)+' '+M.unit;
   const rel=`${c.n}: ${M.f(val)}, ${dvs} ${m.r===1?'ahead of':'behind'} ${nb.n}${m.r===1?' in 2nd':` in ${ord(m.r-1)}`}.`;
   const inc=q.m==='le'||q.m==='hap'?(c.gdp<nb.gdp?` It gets there on ${Math.round(c.gdp/nb.gdp*100)}% of ${nb.n}’s GDP per person.`:` That is with ${(c.gdp/nb.gdp).toFixed(1)} times ${nb.n}’s GDP per person.`):'';
   const note=q.m==='eq'?' One caution: Nigeria’s Gini measures spending (consumption), and the U.S. and Costa Rica measure income, which is usually less equal.':'';
   if(off===0)return `Your gut was right on: ${c.n} goes from ${ord(gr)} by GDP per person to <b>${ord(m.r)}</b>. ${rel}${inc}${note}`;
   return `You guessed ${ord(g.r)}; ${c.n} is really <b>${ord(m.r)}</b>, ${off} place${off>1?'s':''} ${g.r>m.r?'higher':'lower'} than your guess (it is ${ord(gr)} by GDP per person). ${rel}${inc}${note}`;},
  again(sim){const ks=Object.keys(GQ).filter(k=>atLeast(GQ[k].lvl)&&k!==sim.p.gq),k=ks[Math.floor(Math.random()*ks.length)];const q=GQ[k];sim.p.gq=k;sim.p.measure=q.m;sim.p.grank=rankOf(q.c,'gdp');sim.p.show=false;sim.p.view='rank';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different family’s year: a $9,000 car repair after a crash, a $1,200 emergency room visit, 300 hours of unpaid care for a cousin, and no flu, so $400 less spent on medicine. By how many dollars does GDP change?',answer:9800,tol:1,unit:'$',d:0,hint:'Add the money that changed hands. Unpaid hours add $0. Money not spent counts as a minus.',explain:'$9,000 + $1,200 + $0 − $400 = $9,800. The crash and the ER visit raise GDP; the 300 hours of care and the healthy year do not show up as gains.'},
  {lvl:'bio',instant:true,q:'Grandpa needs $50,000 of chemotherapy. What happens to GDP?',choices:['It goes up by $50,000','It goes down, because the family is worse off','It does not change'],correct:0,explain:'GDP adds up money paid for goods and services. Treatment is a service, so GDP rises by $50,000, even though nobody wished for the illness. A bigger number is not always a better year.'},
  {lvl:'bio',instant:true,q:'A parent moves to a 4-day week, earns $12,000 less and gets 400 more hours at home. What does GDP show?',choices:['A gain, because the family has more time','A loss of about $12,000','No change'],correct:1,explain:'GDP only sees the paid work that stopped: about $12,000 less output. The 400 hours of family time are real, but GDP gives them no value.'},
  {lvl:'honors',instant:true,q:'Country A has health, education and income indices of 0.8, 0.8 and 0.8. Country B has 1.0, 1.0 and 0.4. Both average 0.8. Which has the higher HDI?',choices:['Country A','Country B','They tie'],correct:0,explain:'HDI uses a geometric mean. A: (0.8 × 0.8 × 0.8)^(1/3) = 0.800. B: (1.0 × 1.0 × 0.4)^(1/3) ≈ 0.737. A geometric mean punishes imbalance: strength in two areas cannot fully make up for weakness in a third.'},
  {lvl:'honors',instant:true,q:'On the street of 10 households, the richest income jumps from $150k to $1,500k. What happens to the median?',choices:['It rises a lot','It stays at $60.5k','It falls'],correct:1,explain:'The median is the middle: the average of the 5th and 6th households, ($56k + $65k) ÷ 2 = $60.5k. The mean jumps from $68.3k to $203.3k. That is why reports on typical incomes use the median.'},
  {lvl:'ap',instant:true,q:'U.S. inputs: life expectancy 79.3, expected schooling 15.9 years, mean schooling 13.9 years, GNI per person $73,650 (PPP). Health index = (79.3 − 20) ÷ 65, education = average of 15.9 ÷ 18 and 13.9 ÷ 15, income = (ln 73,650 − ln 100) ÷ (ln 75,000 − ln 100). What HDI does the formula give?',choices:['About 0.905','About 0.937','About 0.950','About 0.997'],correct:1,explain:'Health 0.912, education 0.905, income 0.997. Geometric mean: (0.912 × 0.905 × 0.997)^(1/3) ≈ 0.937. UNDP publishes 0.938; the small gap is rounding in the inputs.'},
  {lvl:'ap',instant:true,q:'In Bhutan’s 2022 survey, 51.9% of people were not yet happy, and on average they fell short in about 42.1% of indicators. What is GNH = 1 − H × A?',choices:['About 0.219','About 0.481','About 0.781','About 0.939'],correct:2,explain:'H × A = 0.519 × 0.421 ≈ 0.218, so GNH ≈ 1 − 0.218 ≈ 0.781, the value Bhutan reported for 2022. GNH rises if fewer people fall short or if those who do fall short in fewer areas.'},
  {lvl:'ap',instant:true,q:'With equal weights on all five measures, Costa Rica ranks 3rd. You put all the weight on happiness. Where does it go?',choices:['It stays 3rd','It rises to 1st','It falls to 5th'],correct:1,explain:'Costa Rica has the highest ladder score of the six surveyed countries (7.44). An index ranking says as much about the weights as about the countries.'}
 ],
 tour:[
  {title:'What GDP counts',text:'GDP (gross domestic product) adds up the money paid for goods and services. Here is your family’s year. No events yet, so GDP has not moved.',pause:true,setup:sim=>{const v={view:'ledger',show:false};EV.forEach(e=>v[e.id]=false);BioLab.setValues(sim,v);}},
  {title:'GDP up, life worse',text:'Grandpa gets chemotherapy ($50,000) and hail wrecks the roof ($18,000). GDP rises $68,000. But Grandpa is sick and the roof is only back to where it was. This is the broken window idea (Bastiat, 1850): paying to fix a loss is not a gain.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'ledger',e_ill:true,e_hail:true})},
  {title:'Good things GDP misses',text:'Now your family cares for Grandma at home (730 unpaid hours), you tutor 60 hours, and a parent takes a 4-day week. Life gets 790 hours of care and help and 400 free hours. GDP sees none of the care, and the 4-day week shows up as $12,000 less.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'ledger',e_ill:false,e_hail:false,e_care:true,e_tutor:true,e_4day:true})},
  {title:'Rank by money',text:'The left list ranks seven countries by GDP per person. Norway and the United States are far ahead; Nigeria is last.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'rank',gq:'cr_le',show:false}),focus:[0,0,460,500]},
  {title:'Rank by how long people live',text:'Now the right list ranks them by life expectancy. Costa Rica moves up to 2nd: its people live 80.8 years, 1.5 more than in the United States. The crossing lines show where money and health part ways.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'rank',measure:'le',show:true})},
  {title:'Rank by how people rate their lives',text:'On the World Happiness Report’s 0 to 10 ladder, Costa Rica is 1st of these six (7.44), ahead of Norway (7.24) and the United States (6.82). Bhutan was not surveyed in 2023 to 2025.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'rank',measure:'hap',show:true})},
  {lvl:'honors',title:'Average vs. typical',text:'One street, 10 households. Drag the richest income up to $1,500k: the sum jumps to $2,033k, so the mean jumps to $2,033k ÷ 10 = $203.3k. The median stays at ($56k + $65k) ÷ 2 = $60.5k, because the middle two households did not change.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'spread',top:1500})},
  {lvl:'ap',title:'Build your own index',text:'Pick weights for income, health, education, happiness and equality. With the HDI recipe (the first three, geometric mean), your index matches UNDP’s HDI to within 0.002. Shift the weights and see who moves.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'build',w_inc:1,w_hea:1,w_edu:1,w_hap:0,w_eq:0,comb:'geo'})}
 ],
 lab:{bio:'<p><b>Question:</b> Does a bigger GDP always mean a better year?</p><ol><li>Open <b>What GDP counts</b>. Add one event at a time. Record a trial after each.</li><li>Sort your events into two lists: GDP up but life worse, and life better but GDP flat or down.</li><li>Switch to <b>Rank the countries</b>. Turn on <b>Show the real ranking</b> and try each measure.</li></ol><p>Write two sentences: which country moves the most when you stop ranking by money, and what might explain it?</p>',
  honors:'<p><b>Question:</b> What does each measure hide?</p><ol><li>In <b>Average vs. typical</b>, set the richest income to $150k, $500k, $1,000k and $2,000k. Record the mean and median each time.</li><li>For one setting, compute the mean and the median by hand and check them against the readouts.</li><li>In <b>Rank the countries</b>, compare GDP per person with GDP at local prices (PPP). Which countries move?</li></ol><p>Explain why a news story about “average income” could mislead.</p>',
  ap:'<p><b>Question:</b> How sensitive is a ranking to its weights?</p><ol><li>Press <b>Use the HDI recipe</b> and check that the ranking matches UNDP’s HDI order.</li><li>Raise one weight at a time from 0 to 10 and record the rank of one country.</li><li>Switch between a weighted average and a geometric mean. Which countries move, and why?</li></ol><p><b>CER:</b> Make a claim about how much the ranking depends on the weights, with evidence from your trials and reasoning about normalization and the mean you used. Your weights are your own choice; the math must be right.</p>'},
 terms:[
  {t:'GDP (gross domestic product)',d:'The market value of all final goods and services produced in a country in a year.'},
  {t:'GDP per person (per capita)',d:'GDP divided by the population.'},
  {t:'Broken window fallacy',d:'Bastiat’s point (1850): money spent repairing a broken window shows up as activity, but it only restores what was lost, and it could have bought something new.'},
  {t:'Life expectancy',d:'How many years a newborn would live on average if today’s death rates stayed the same.'},
  {t:'Life evaluation (Cantril ladder)',d:'A survey question: picture a ladder from 0 (worst possible life) to 10 (best possible life). Which step are you on now?'},
  {t:'PPP (purchasing power parity)',d:'Converts incomes using what money buys at local prices, rather than market exchange rates.',lvl:'honors'},
  {t:'Mean and median',d:'The mean adds every value and divides by how many there are. The median is the middle value when they are sorted.',lvl:'honors'},
  {t:'Gini index',d:'A measure of how evenly income is shared: 0 means everyone has the same, 100 means one person has it all. The North and South tool shows how it is computed from a Lorenz curve.'},
  {t:'Human Development Index (HDI)',d:'UNDP’s index: the geometric mean of a health index, an education index and an income index, each from 0 to 1.',lvl:'honors'},
  {t:'Geometric mean',d:'The nth root of the product of n numbers. It is lower than the ordinary average whenever the numbers are unequal.',lvl:'honors'},
  {t:'Normalization',d:'Rescaling a measure to a common range, such as 0 to 1, using fixed goalposts: (value − minimum) ÷ (maximum − minimum).',lvl:'ap'},
  {t:'Gross National Happiness (GNH)',d:'Bhutan’s survey-based index of 9 domains: GNH = 1 − H × A, from the share of people not yet happy and how far they fall short.',lvl:'ap'}
 ],
 about:`<p><b>This is a simplified model for learning, not financial advice.</b> Every country figure is stored in this page, not fetched live.</p>
<p><b>GDP per person</b> (current US$) and <b>GDP per person, PPP</b> (current international $): World Bank World Development Indicators, 2024, indicators NY.GDP.PCAP.CD and NY.GDP.PCAP.PP.CD (<a href="https://data.worldbank.org/indicator/NY.GDP.PCAP.CD" target="_blank" rel="noopener">data.worldbank.org</a>, updated Oct 2026). Nigeria 2023 figures ($2,139 and $8,712) are from the same series.</p>
<p><b>HDI and its parts</b> (life expectancy, expected and mean years of schooling, GNI per person in 2021 PPP $): UNDP Human Development Report 2025, Table 1, data year 2023 (<a href="https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Statistical_Annex_HDI_Table.pdf" target="_blank" rel="noopener">hdr.undp.org</a>). The formula uses UNDP’s goalposts: life expectancy 20 to 85 years, expected schooling 0 to 18, mean schooling 0 to 15, income $100 to $75,000 on a log scale. With these inputs the formula reproduces the published HDI to within 0.002.</p>
<p><b>Life evaluations</b>: World Happiness Report 2026, ranking of the 2023 to 2025 average Cantril ladder score (<a href="https://files.worldhappiness.report/WHR26_Statistical_Appendix.pdf" target="_blank" rel="noopener">worldhappiness.report</a>): Costa Rica 7.439, Norway 7.242, United States 6.816, Ecuador 6.144, Nigeria 4.788, India 4.536. Bhutan is not in the 2023 to 2025 ranking, so its happiness is left blank rather than estimated; in your index it uses only the other measures.</p>
<p><b>Gini and income shares by fifth</b>: World Bank, indicators SI.POV.GINI and SI.DST (latest year: Norway 2023, U.S. 2024, Costa Rica and Ecuador 2025, India 2023, Nigeria and Bhutan 2022) (<a href="https://data.worldbank.org/indicator/SI.POV.GINI" target="_blank" rel="noopener">data.worldbank.org</a>). For India, Nigeria and Bhutan the survey measures consumption (spending); for the others it measures income. Consumption is usually more equal than income, so compare across that line with care. Lorenz curves drawn from fifths are approximate.</p>
<p><b>Unpaid household work</b>: BEA’s household production research estimates that household production value added was 16 percent of “extended GDP” (GDP with household production added) in 2024 (BEA Research Spotlight, July 2026, <a href="https://apps.bea.gov/scb/spotlights/2026/0726-household-production.htm" target="_blank" rel="noopener">apps.bea.gov</a>). BEA values household work at the wage of general-purpose domestic workers (BEA, 2019). The $17 an hour default here is an assumption for illustration.</p>
<p><b>Your family’s year</b> is an illustration: every dollar and hour in the ledger (chemotherapy $50,000, roof and car $18,000, 730 hours of care, and so on) is an assumption, not data. For scale, U.S. health spending was $5.3 trillion in 2024, 18.0% of GDP (CMS National Health Expenditure fact sheet, <a href="https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/nhe-fact-sheet" target="_blank" rel="noopener">cms.gov</a>). The street of 10 households is also made up.</p>
<p><b>Gross National Happiness</b>: Centre for Bhutan Studies and GNH Research, 2022 GNH Index results (9 domains, 33 indicators, 66% sufficiency cutoff; GNH 0.781 in 2022, 0.756 in 2015, 0.743 in 2010; 51.9% not yet happy), via OPHI (<a href="https://ophi.org.uk/sites/default/files/2023-07/Bhutan_GNH_2022_press_release.pdf" target="_blank" rel="noopener">2022 press release</a>, <a href="https://ophi.org.uk/node/3258" target="_blank" rel="noopener">ophi.org.uk</a>). A ≈ 42.1% is computed here from the published group shares and sufficiency levels.</p>
<p><b>Quotations</b>: Paul VI, <i>Populorum Progressio</i> (1967), no. 14 (<a href="https://www.vatican.va/content/paul-vi/en/encyclicals/documents/hf_p-vi_enc_26031967_populorum.html" target="_blank" rel="noopener">vatican.va</a>); Francis, <i>Laudato Si’</i> (2015), no. 194 (<a href="https://www.vatican.va/content/francesco/en/encyclicals/documents/papa-francesco_20150524_enciclica-laudato-si.html" target="_blank" rel="noopener">vatican.va</a>); Simon Kuznets (1934), as quoted by BEA in <i>Survey of Current Business</i>, June 2020 (<a href="https://apps-fd.bea.gov/scb/issues/2020/06-june/pdf/0620-beyond-gdp-berndt.pdf" target="_blank" rel="noopener">apps-fd.bea.gov</a>). The broken window is from Frédéric Bastiat, “That Which Is Seen, and That Which Is Not Seen” (1850).</p>
<p><b>No measure here is the right one.</b> Rankings are math; which measure matters most is a question of values, and the tool never scores it.</p>`+CONTEXT+'<p><b>What this number hides.</b> A rank hides how far apart the countries are: by life expectancy, Bhutan is 1.0 year ahead of India and India is 17.5 years ahead of Nigeria, and each gap is one place. It also hides how income and health are shared inside each country, and anyone a survey does not reach.</p>'
};
BioLab.register(SIM);
})();
