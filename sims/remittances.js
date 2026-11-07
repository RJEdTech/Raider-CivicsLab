(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Sending money home. Figures checked Nov 7, 2026; sources and years are in `about`.
   Costs: World Bank Remittance Prices Worldwide (RPW). Global average 6.36% is the figure on the RPW home page.
   The channel split is RPW Issue 51 (Q3 2024), the latest split we could open and check.
   Flows and shares of GDP: World Bank World Development Indicators (WDI), 2024, last updated Oct 8, 2026. */
const CH={avg:{l:'Global average',c:6.36},bank:{l:'Bank',c:13.64},mto:{l:'Money transfer company',c:5.40},dig:{l:'Digital service',c:4.95},sdg:{l:'UN target (3%)',c:3},custom:{l:'Your own provider',c:null}};
const TARGET=3;
/* Personal remittances received, 2024, US$ billions, and as % of GDP (WDI). */
const CTRY=[
 {id:'tjk',l:'Tajikistan',b:6.801890973,g:47.1531186},
 {id:'nic',l:'Nicaragua',b:5.2456,g:26.6323972},
 {id:'npl',l:'Nepal',b:11.254463372,g:25.9924856},
 {id:'hnd',l:'Honduras',b:9.520098228,g:25.7437915},
 {id:'slv',l:'El Salvador',b:8.488402967,g:24.3362061},
 {id:'gtm',l:'Guatemala',b:21.64452152,g:19.1179716},
 {id:'hti',l:'Haiti',b:4.111002566,g:16.9486338},
 {id:'ecu',l:'Ecuador',b:6.544355901,g:5.2861312},
 {id:'mex',l:'Mexico',b:67.908368512,g:3.7098479}];
const LMY={id:'lmy',l:'All low- and middle-income countries',b:664.568322904,g:null};
/* Low- and middle-income countries, US$ billions (WDI): personal remittances, FDI net inflows, net official development aid (2015 to 2023). */
const YR=[2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024];
const REM=[162.6,191.5,229.3,267.1,258.6,286.0,321.3,346.6,361.8,390.4,394.2,384.2,417.1,453.3,466.9,468.6,532.5,591.4,608.0,664.6];
const FDI=[271.4,331.5,462.4,525.0,381.1,576.2,671.9,623.8,671.5,615.2,599.2,516.7,504.5,580.7,528.0,518.6,724.0,588.0,407.5,462.3];
const ODA={2015:143.0,2016:154.2,2017:160.4,2018:161.9,2019:158.1,2020:188.4,2021:199.5,2022:239.3,2023:251.9};

const cty=sim=>sim.p.country==='lmy'?LMY:(CTRY.find(c=>c.id===sim.p.country)||CTRY[7]);
const destName=sim=>sim.p.dest==='own'?'a country with its own currency':'Ecuador';
/* Total cost as a percent of the amount sent: fee plus exchange-rate markup. */
function costPct(sim){const ch=sim.p.chan;if(ch!=='custom')return CH[ch]?CH[ch].c:CH.avg.c;
 const S=Math.max(1,sim.p.send),mk=sim.p.dest==='own'?sim.p.markup:0;return (sim.p.flat/S)*100+mk;}
const perMonth=sim=>sim.p.send*costPct(sim)/100;
const yearSent=sim=>sim.p.send*12;
const yearFee=sim=>yearSent(sim)*costPct(sim)/100;
const yearArrive=sim=>yearSent(sim)-yearFee(sim);
const natFee=(sim,c)=>cty(sim).b*1e9*(c===undefined?costPct(sim):c)/100;
const natSave=sim=>Math.max(0,natFee(sim)-natFee(sim,TARGET));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The cost stays hidden while the student works out the year's fees ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!pend(sim)));
const usd=(v,d)=>{d=d===undefined?2:d;return (v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});};
const big=v=>{const a=Math.abs(v);return a>=1e9?'$'+(a/1e9).toFixed(2)+'B':a>=1e6?'$'+(a/1e6).toFixed(1)+'M':usd(a,0);};
const pc=v=>(+v).toFixed(2)+'%';
const chLabel=sim=>sim.p.chan==='custom'?`your own provider (${pc(costPct(sim))})`:`${CH[sim.p.chan].l.toLowerCase()} (${pc(costPct(sim))})`;
const c2=v=>Math.round(v*100)/100;
const calcAns=sim=>c2(yearFee(sim));
const costWords=sim=>{if(sim.p.chan!=='custom')return `<b>${pc(costPct(sim))}</b> of each transfer (${CH[sim.p.chan].l.toLowerCase()})`;
 const mk=sim.p.dest==='own'?sim.p.markup:0;return `a flat fee of <b>${usd(sim.p.flat)}</b> per transfer`+(mk?` plus a <b>${pc(mk)}</b> exchange-rate markup`:' and no exchange-rate markup (the family uses U.S. dollars)');};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const view=sim=>{const v=sim.p.view;if(v==='gdp'||v==='flows')return atLeast('ap')?v:'family';if(v==='nation')return atLeast('honors')?v:'family';return 'family';};
function nice(v){const s=[100,200,250,500,600,800,1000,1500,2000,2500,5000];for(const x of s)if(v<=x)return x;return Math.ceil(v/1000)*1000;}

/* ---------- drawing ---------- */
function drawFamily(sim,ctx,k){const W=800,S=sim.p.send,on=shown(sim),c=costPct(sim),G=GS(sim);
 const tY=10+15*k,sY=tY+18*k,lY=sY+20*k,T=lY+10,B=290,H=B-T;
 txt(ctx,k>1.3?`${usd(S,0)} a month for a year`:`A year of sending ${usd(S,0)} a month ${sim.p.dest==='own'?'abroad':'to Ecuador'}`,240,tY,{s:15*k,w:700,a:'center'});
 txt(ctx,k>1.3?'Each column: one month':'Each column is one month. Red is lost to fees and markup.',240,sY,{s:12*k,c:PAL['cv-soft'],a:'center'});
 const x0=20,cw=(460-x0)/12,bw=Math.min(28,cw-8);
 txt(ctx,`${usd(S,0)} sent each month`,240,lY,{s:12*k,w:700,c:PAL['cv-soft'],a:'center'});
 const MON=['J','F','M','A','M','J','J','A','S','O','N','D'];
 for(let i=0;i<12;i++){const cx=x0+cw*i+cw/2,bx=cx-bw/2;
  ctx.fillStyle=on?PAL['s3']:PAL['line'];ctx.fillRect(bx,T,bw,H);
  if(on){const fh=Math.max(2,H*c/100);ctx.fillStyle=PAL['s1'];ctx.fillRect(bx,T,bw,fh);}
  else{ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.strokeRect(bx+.5,T+.5,bw-1,H-1);ctx.setLineDash([]);}
  txt(ctx,MON[i],cx,B+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
 /* right: the year's fees */
 const fee=yearFee(sim),gv=G&&G.g?G.g.guess:sim.p.guess,mx=nice(Math.max(600,on?fee*1.1:0,gv*1.05)),bx=560,bw2=50,bt=T,bh=H;
 txt(ctx,k>1.3?'Fees a year':'Fees in one year',bx+bw2/2+40,tY,{s:13*k,w:700,a:'center'});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(bx+.5,bt+.5,bw2,bh);
 txt(ctx,usd(mx,0),bx-6,bt+4,{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});txt(ctx,'$0',bx-6,bt+bh,{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});
 const Y=v=>bt+bh-clamp(v/mx,0,1)*bh;
 let realY=null;
 if(on){ctx.fillStyle=PAL['s1'];ctx.fillRect(bx+1,Y(fee),bw2-1,bt+bh-Y(fee));realY=Y(fee);}
 const gy=Y(gv);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(bx-4,gy);ctx.lineTo(bx+bw2+4,gy);ctx.stroke();ctx.setLineDash([]);
 const ls=12*k,gap=ls+4;let gLab=gy,rLab=realY;
 if(realY!==null&&Math.abs(gLab-rLab)<gap){if(gLab<rLab){gLab=rLab-gap;}else{gLab=rLab+gap;}}
 gLab=clamp(gLab,bt+ls/2,bt+bh+ls);
 txt(ctx,k>1.3?`Gut ${usd(gv,0)}`:`${G&&G.g?'Your gut':'Your guess'}: ${usd(gv,0)}`,bx+bw2+8,gLab,{s:ls,w:700,c:PAL['s4'],b:'middle'});
 if(realY!==null)txt(ctx,k>1.3?`Real ${usd(fee,0)}`:`Real: ${usd(fee)}`,bx+bw2+8,rLab,{s:ls,w:700,c:PAL['s1'],b:'middle'});
 /* bottom: the equation */
 let y=B+15*k+26*k;
 const eq=on?`${usd(yearSent(sim),0)} sent − ${usd(fee)} lost = ${usd(yearArrive(sim))} arrives`:`${usd(yearSent(sim),0)} sent − ? lost = ? arrives`;
 txt(ctx,eq,400,y,{s:14*k,w:700,a:'center'});
 const lines=[];
 if(!on)lines.push(pend(sim)?'Your turn: work out the year’s fees yourself.':'Lock in your guess to see the real cost.');
 else if(G&&G.m&&sim.p.chan!=='custom')lines.push(`The math: 12 × ${usd(sim.p.send,0)} × ${pc(c)} = ${usd(fee)}`);
 else if(G&&G.m)lines.push(`The math: 12 × ${usd(perMonth(sim))} per transfer = ${usd(fee)}`);
 else{const n=fee/sim.p.item;lines.push(k>1.3?`Fees = ${n.toFixed(1)} of your ${usd(sim.p.item,0)} items`:`The fees would buy ${n.toFixed(1)} of the ${usd(sim.p.item,0)} item you picked. ${sim.p.dest==='own'?'Part of the cost hides in the exchange rate.':'Ecuador uses U.S. dollars, so what arrives spends as dollars.'}`);
  if(atLeast('ap')){const m=sim.p.mpc;lines.push(k>1.3?`Re-spent at ${Math.round(m*100)}%: ${usd(yearArrive(sim)/(1-m),0)} (illustration)`:`If ${Math.round(m*100)}% of each dollar is re-spent locally: ${usd(yearArrive(sim)/(1-m),0)} of local spending (illustration)`);}}
 lines.forEach(s=>{y+=22*k;if(y<446)txt(ctx,s,400,y,{s:12*k,c:PAL['cv-soft'],a:'center'});});}

function drawNation(sim,ctx,k){const C=cty(sim),c=costPct(sim),f=natFee(sim),f3=natFee(sim,TARGET),sv=natSave(sim);
 const tY=10+15*k;
 txt(ctx,`${C.id==='lmy'?'Low- and middle-income countries':'Money sent home to '+C.l}, 2024`,400,tY,{s:15*k,w:700,a:'center'});
 txt(ctx,`Received: ${big(C.b*1e9)} (World Bank)`,400,tY+20*k,{s:13*k,c:PAL['cv-soft'],a:'center'});
 const L=40,Wb=520,top=tY+50*k,rh=Math.max(64,40+26*k),mx=Math.max(f,f3)*1.05||1;
 const row=(i,lab,v,col)=>{const y=top+i*rh;txt(ctx,lab,L,y,{s:13*k,w:700});ctx.fillStyle=col;rr(ctx,L,y+8,Math.max(3,v/mx*Wb),24,4);ctx.fill();txt(ctx,big(v),L+Math.max(3,v/mx*Wb)+8,y+20,{s:13*k,w:700,b:'middle'});};
 row(0,`Fees at ${pc(c)}, ${chLabel(sim).replace(/ \(.*\)$/,'')}`,f,PAL['s1']);
 row(1,'Fees at the 3% UN target',f3,PAL['s3']);
 const y=top+2*rh+10*k;
 if(sv>0){txt(ctx,`Families would keep ${big(sv)} more a year.`,L,y,{s:15*k,w:700,c:PAL['s3']});
  const fam=sv/yearSent(sim);
  txt(ctx,k>1.3?`About ${Math.round(fam).toLocaleString('en-US')} years of ${usd(sim.p.send,0)}/month`:`That equals a whole year of ${usd(sim.p.send,0)}-a-month transfers for about ${Math.round(fam).toLocaleString('en-US')} families.`,L,y+24*k,{s:13*k,c:PAL['cv-soft']});}
 else txt(ctx,'This cost is already at or below the 3% target.',L,y,{s:15*k,w:700,c:PAL['s3']});
 if(y+50*k<446)txt(ctx,'Simplified: one cost for every transfer. Real corridors differ.',L,y+48*k,{s:12*k,c:PAL['cv-soft']});}

function drawGDP(sim,ctx,k){const tY=10+15*k;
 txt(ctx,'Money sent home as a share of each economy (GDP), 2024',400,tY,{s:15*k,w:700,a:'center'});
 const top=tY+14*k,rh=(440-top)/CTRY.length,L=Math.round(80+40*k),Wb=430,mx=55;
 CTRY.forEach((c,i)=>{const y=top+i*rh,sel=c.id===sim.p.country,w=c.g/mx*Wb;
  txt(ctx,c.l,L-8,y+rh/2,{s:12*k,w:sel?700:400,a:'right',b:'middle'});
  ctx.fillStyle=sel?PAL['rj']:PAL['s2'];rr(ctx,L,y+rh*0.2,w,rh*0.6,3);ctx.fill();
  txt(ctx,`${c.g.toFixed(1)}%  (${big(c.b*1e9)})`,L+w+8,y+rh/2,{s:12*k,w:sel?700:400,b:'middle'});});}

function drawFlows(sim,ctx,k){const tY=10+15*k,ph=k>1.3;
 txt(ctx,ph?'Low- and middle-income countries ($B)':'Money into low- and middle-income countries ($ billions)',400,tY,{s:15*k,w:700,a:'center'});
 const L=Math.round(30+30*k),T=tY+30*k,B=420-14*k,R=ph?520:630,X=y=>L+(y-2005)/19*(R-L),Y=v=>B-v/800*(B-T);
 ctx.lineWidth=1;[0,200,400,600,800].forEach(v=>{ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,Y(v)+.5);ctx.lineTo(R,Y(v)+.5);ctx.stroke();txt(ctx,String(v),L-6,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
 [2005,2010,2015,2020,2024].forEach(y=>txt(ctx,String(y),X(y),B+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
 const line=(xs,ys,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();xs.forEach((x,i)=>{const px=X(x),py=Y(ys[i]);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.setLineDash([]);};
 line(YR,REM,PAL['s3']);line(YR,FDI,PAL['s2'],true);const oy=Object.keys(ODA).map(Number);line(oy,oy.map(y=>ODA[y]),PAL['s4']);
 const lx=X(2024)+8;
 txt(ctx,ph?'Sent home':'Money sent home',lx,Y(664.6)-6*k,{s:12*k,w:700,c:PAL['s3']});
 txt(ctx,ph?'Investment':'Foreign investment',lx,Y(462.3)+8*k,{s:12*k,w:700,c:PAL['s2']});
 txt(ctx,ph?'Aid':'Aid (to 2023)',X(2023)+8,Y(251.9)+4*k,{s:12*k,w:700,c:PAL['s4']});
 txt(ctx,ph?'2009: investment −27%, sent home −3%':'2008 to 2009: foreign investment fell 27%, money sent home fell 3%',L+8,T+4*k,{s:12*k,c:PAL['cv-soft'],b:'top'});
 if(!ph)txt(ctx,'World Bank data, one point per year.',L+8,444,{s:12*k,c:PAL['cv-soft']});}

function draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const v=view(sim);
 if(v==='nation')drawNation(sim,ctx,k);else if(v==='gdp')drawGDP(sim,ctx,k);else if(v==='flows')drawFlows(sim,ctx,k);else drawFamily(sim,ctx,k);}

/* yearly change statistics for the flows view */
const chg=a=>a.slice(1).map((v,i)=>(v/a[i]-1)*100);
const sd=a=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length-1));};

const SIM={
 id:'remittances',hash:'remittances',apUnit:5,order:2,tab:'Sending money home',kind:'Simulation',
 skills:{bio:'Percent of an amount and yearly totals · Algebra 1 (Unit 2), AP Macroeconomics (Unit 6)',honors:'Fixed vs. proportional costs: cost % = fee ÷ amount + markup · Algebra 1 (Units 2 and 3), AP Macroeconomics (Unit 6)',ap:'Shares of GDP, variability of flows, and a geometric-series multiplier · Algebra 2, AP Macroeconomics (Units 3 and 6)'},
 card:'Guess how much a year of $300 transfers loses to fees, then see what cheaper sending would mean for one family and a whole country.',
 title:'Sending money home',
 lede:{bio:'Millions of workers send part of every paycheck to family in another country. Fees and exchange-rate markups take a slice of every transfer. How big is that slice, and what does it cost a family over a year?',
  honors:'A provider’s cost has two parts: a flat fee and an exchange-rate markup. Cost % = flat fee ÷ amount + markup %. A flat fee hurts small transfers most, and sending to a dollar country like Ecuador has no exchange markup at all.',
  ap:'In 2024, money sent home equaled 47.2% of Tajikistan’s GDP and about a quarter of the GDP of Nicaragua, Nepal, Honduras and El Salvador (World Bank). From 2006 to 2024 it fell in only 2 years, while foreign investment fell in 10.'},
 scale:'One family’s year of transfers, then whole countries. Costs are the World Bank’s Remittance Prices Worldwide figures for sending $200; flows are World Bank data for 2024.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your transfer',
 controls:[
  {id:'guess',label:'Your guess: dollars lost to fees in one year ($)',type:'range',min:0,max:600,step:1,def:100,unit:'',d:0},
  {id:'send',label:'Sent each month ($)',type:'range',min:50,max:1000,step:10,def:300,unit:'',noGut:true,onChange:clearGut},
  {id:'chan',label:'How it is sent',type:'seg',def:'avg',noGut:true,onChange:clearGut,options:[{v:'avg',l:'Global average'},{v:'bank',l:'Bank'},{v:'mto',l:'Money transfer company'},{v:'dig',l:'Digital service'},{v:'sdg',l:'UN target 3%'},{v:'custom',l:'Your own provider',lvl:'honors'}],help:'World Bank averages for sending $200, fees plus exchange-rate markup. Banks cost the most.'},
  {id:'item',label:'Price of one thing the family buys, $ (your own number)',type:'range',min:5,max:200,step:1,def:40,unit:'',noGut:true,help:'Pick anything: a month of bus fare, school supplies, a doctor visit. It stays in this page’s memory and is never sent anywhere.'},
  {id:'show',label:'Show the real cost',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'view',label:'Look at',type:'seg',def:'family',lvl:'honors',noGut:true,options:[{v:'family',l:'One family'},{v:'nation',l:'Whole country'},{v:'gdp',l:'Share of GDP',lvl:'ap'},{v:'flows',l:'Compare flows',lvl:'ap'}]},
  {id:'country',label:'Country',type:'select',def:'ecu',lvl:'honors',noGut:true,options:[{v:'ecu',l:'Ecuador'},{v:'mex',l:'Mexico'},{v:'gtm',l:'Guatemala'},{v:'hnd',l:'Honduras'},{v:'slv',l:'El Salvador'},{v:'nic',l:'Nicaragua'},{v:'hti',l:'Haiti'},{v:'npl',l:'Nepal'},{v:'tjk',l:'Tajikistan'},{v:'lmy',l:'All low- and middle-income countries'}]},
  {id:'dest',label:'Family lives in',type:'seg',def:'usd',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'usd',l:'Ecuador (uses U.S. dollars)'},{v:'own',l:'A country with its own currency'}],help:'Matters for Your own provider: dollars sent to Ecuador arrive as dollars, so there is no exchange-rate markup.'},
  {id:'flat',label:'Your own provider: flat fee per transfer ($)',type:'range',min:0,max:15,step:0.5,def:5,unit:'',d:2,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'markup',label:'Your own provider: exchange-rate markup',type:'range',min:0,max:5,step:0.25,def:2,unit:'%',d:2,lvl:'honors',noGut:true,onChange:clearGut,help:'How far below the market exchange rate the provider converts your money. Applies only when the family uses another currency.'},
  {id:'mpc',label:'Share of each dollar re-spent locally (illustration)',type:'range',min:0,max:0.8,step:0.05,def:0.5,d:2,lvl:'ap',noGut:true,help:'An assumption for illustration, not a measured value. Real re-spending depends on how much is spent on imports, saved or taxed.'}
 ],
 actions:[{id:'cheap',label:'Try it: send through a digital service',lvl:'honors',run(sim){BioLab.setValues(sim,{chan:'dig',show:true,view:'family'});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cost',label:'Cost of each transfer',unit:'% of amount sent',d:2,min:0,max:null,get:sim=>shown(sim)?costPct(sim):null},
  {id:'fee',label:'Lost to fees in one year',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?yearFee(sim):null},
  {id:'arrive',label:'Arrives in one year',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?yearArrive(sim):null},
  {id:'items',label:'Fees, counted in your item',unit:'items',d:1,min:0,max:null,get:sim=>shown(sim)?yearFee(sim)/sim.p.item:null},
  {id:'save',label:'Kept each year if cost fell to 3%',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?Math.max(0,yearFee(sim)-yearSent(sim)*TARGET/100):null},
  {id:'natfee',label:'Whole country: fees a year at this cost',unit:'$ millions',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?natFee(sim)/1e6:null},
  {id:'natsave',label:'Whole country: kept a year at the 3% target',unit:'$ millions',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?natSave(sim)/1e6:null},
  {id:'gdpshare',label:'Money sent home, share of GDP (2024)',unit:'%',d:1,lvl:'ap',min:0,max:null,get:sim=>cty(sim).g},
  {id:'gdp',label:'GDP implied by those two numbers',unit:'$ billions',d:1,lvl:'ap',min:0,max:null,get:sim=>cty(sim).g?cty(sim).b/(cty(sim).g/100):null},
  {id:'local',label:'Local spending from one year, re-spent (illustration)',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?yearArrive(sim)/(1-sim.p.mpc):null}
 ],
 graphs:[{id:'chan',label:'Yearly fees by way of sending',custom:true},{id:'size',label:'Your own provider: cost % vs. amount sent',lvl:'honors',custom:true}],defaultGraph:'chan',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your guess to see the fees.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  if(id==='size'){const mk=sim.p.dest==='own'?sim.p.markup:0,f=sim.p.flat,cp=s=>f/s*100+mk,top=Math.max(5,Math.ceil(cp(50)/5)*5);
   const ax=axes(ctx,box,{xmin:0,xmax:1000,ymin:0,ymax:top,xl:'Amount sent in one transfer ($)',yl:'Cost (% of amount)'});
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let s=20;s<=1000;s+=10){const px=ax.X(s),py=ax.Y(Math.min(top,cp(s)));s===20?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
   ctx.strokeStyle=PAL['s3'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(3));ctx.lineTo(ax.X(1000),ax.Y(3));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'3% target',ax.X(1000)-4,ax.Y(3)-6,{s:12,c:PAL['s3'],a:'right',w:700});
   const s=sim.p.send;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(s),ax.Y(Math.min(top,cp(s))),6,0,7);ctx.fill();
   txt(ctx,`You: ${pc(cp(s))}`,ax.X(s)+8,ax.Y(Math.min(top,cp(s)))-10,{s:12,w:700,c:PAL['fg']});return;}
  const ks=['bank','avg','mto','dig','sdg'],S=yearSent(sim),vals=ks.map(x=>S*CH[x].c/100),mx=Math.max(...vals)*1.15;
  const ax=axes(ctx,box,{xmin:0,xmax:ks.length,ymin:0,ymax:mx,xcats:['Bank','Average','Transfer co.','Digital','3% target'],yl:'Fees in one year ($)'});
  vals.forEach((v,i)=>{const x0=ax.X(i+0.2),x1=ax.X(i+0.8);ctx.fillStyle=ks[i]===sim.p.chan?PAL['rj']:PAL['s2'];ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));txt(ctx,usd(v,0),(x0+x1)/2,ax.Y(v)-6,{s:12,w:700,c:PAL['fg'],a:'center'});});},
 draw,
 narrate(sim){const v=view(sim);
  if(!shown(sim)&&pend(sim))return `<b>Your turn:</b> ${usd(sim.p.send,0)} a month, 12 times a year, at ${pc(costPct(sim))} of each transfer. Work out the year’s fees.`;
  if(!shown(sim))return `You are guessing how much of ${usd(yearSent(sim),0)} a year (${usd(sim.p.send,0)} a month) is lost to fees. <b>No math yet:</b> go with your gut.`;
  if(v==='nation'){const C=cty(sim),sv=natSave(sim);return sv>0?`${C.id==='lmy'?'Low- and middle-income countries':C.l} received ${big(C.b*1e9)} in 2024. At ${pc(costPct(sim))}, sending it costs about ${big(natFee(sim))}. <b>At the 3% target, families would keep ${big(sv)} more a year.</b>`:`At ${pc(costPct(sim))}, this cost already meets the 3% target, so <b>nothing more would be saved</b> by reaching it.`;}
  if(v==='gdp'){const C=cty(sim);return C.g?`${C.l}: money sent home was ${C.g.toFixed(1)}% of GDP in 2024. <b>A big dollar total is not the same as a big share:</b> Mexico received the most dollars here, but they were only 3.7% of its economy.`:'Pick one country to compare its share of GDP.';}
  if(v==='flows'){const r=sd(chg(REM)),f=sd(chg(FDI));return `From 2006 to 2024, money sent home changed by a typical ${r.toFixed(1)} points a year (standard deviation of yearly % change), against ${f.toFixed(1)} for foreign investment. <b>Families keep sending when investors pull back.</b>`;}
  const c=costPct(sim);
  return `At ${pc(c)}, each ${usd(sim.p.send,0)} transfer loses ${usd(perMonth(sim))}. <b>Over a year that is ${usd(yearFee(sim))}</b>, about ${(yearFee(sim)/sim.p.send*100).toFixed(0)}% of one whole month’s transfer.${c>TARGET?` At the 3% target the family would keep ${usd(yearFee(sim)-yearSent(sim)*TARGET/100)} more.`:''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Ana works in Denver and sends money to her parents in Ecuador every month. The picture shows a year of her transfers. Drag <b>Your guess</b> to how many dollars you think fees take over the whole year, then lock it in.',
   honors:'Before you see any costs: how many dollars a year do fees take from the transfers in the picture? Set <b>Your guess</b> by feel, then lock it in.'},
  lock(sim){const T=yearFee(sim);return {v:Math.abs(sim.p.guess-T),guess:sim.p.guess,label:`${usd(sim.p.guess,0)} a year`};},
  solve(sim){const T=yearFee(sim);sim.p.guess=+T.toFixed(2);sim.p.show=true;return {v:0,guess:T,label:`${usd(T)} a year (${pc(costPct(sim))} of ${usd(yearSent(sim),0)})`};},
  hint:{bio:'Lock in your gut answer. Then you will work out the real number yourself from the cost of each transfer.'},
  calc:{unit:'$',d:2,tol:a=>Math.max(1,0.01*a),
   prompt:sim=>`Ana sends <b>${usd(sim.p.send,0)}</b> a month, 12 times a year. Sending costs ${costWords(sim)}. How many dollars do fees take over the whole year?`,
   answer:calcAns,
   hint:'First find the year’s total: 12 × the monthly amount. Then take the cost percent of it: divide the percent by 100 and multiply.',
   steps(sim){const S=sim.p.send,Y=yearSent(sim),F=calcAns(sim);
    if(sim.p.chan==='custom'){const mk=sim.p.dest==='own'?sim.p.markup:0,pm=perMonth(sim);
     return [`One transfer: ${usd(sim.p.flat)} fee`+(mk?` + ${pc(mk)} × ${usd(S,0)} = ${usd(sim.p.flat)} + ${usd(S*mk/100)}`:'')+` = ${usd(pm)}.`,`That is ${usd(pm)} ÷ ${usd(S,0)} = ${pc(costPct(sim))} of each transfer.`,`Twelve transfers: 12 × ${usd(pm)} = <b>${usd(F)}</b> a year.`];}
    const c=costPct(sim);return [`The year’s total: 12 × ${usd(S,0)} = ${usd(Y,0)}.`,`The cost: ${pc(c)} = ${(c/100).toFixed(4)}, so ${(c/100).toFixed(4)} × ${usd(Y,0)} = <b>${usd(F)}</b> a year.`,`Check: one transfer loses ${usd(perMonth(sim))}, and 12 × ${usd(perMonth(sim))} = ${usd(12*perMonth(sim))}. ${usd(Y-F)} arrives.`];}},
  formula(sim){const c=costPct(sim),F=calcAns(sim);return sim.p.chan==='custom'?`Yearly fees = 12 × (${usd(sim.p.flat)} + ${pc(sim.p.dest==='own'?sim.p.markup:0)} × ${usd(sim.p.send,0)}) = ${usd(F)}`:`Yearly fees = 12 × ${usd(sim.p.send,0)} × ${(c/100).toFixed(4)} = ${usd(F)}, so ${usd(yearArrive(sim))} arrives`;},
  how:{bio:'The math multiplies: 12 months × the amount sent = the year’s total. Then cost % × total = the year’s fees. For $300 a month at the 6.36% global average: 12 × $300 = $3,600, and 0.0636 × $3,600 = $228.96.',
   ap:'Yearly fees = 12 · S · c, where S is the monthly amount and c the total cost rate. For $300 at c = 0.0636: 12 × 300 × 0.0636 = $228.96.'},
  compare(sim,g,m){const T=m.guess,off=Math.abs(g.guess-T),c=costPct(sim),sv=Math.max(0,T-yearSent(sim)*TARGET/100),n=T/sim.p.item;
   const tail=c>TARGET?` At the UN’s 3% target, the family would keep <b>${usd(sv)} more each year</b>.`:' This cost already meets the UN’s 3% target.';
   if(off<10)return `Your gut was right on: ${usd(g.guess,0)} against the real ${usd(T)}. That is about ${(T/sim.p.send*100).toFixed(0)}% of one month’s transfer, or ${n.toFixed(1)} of your ${usd(sim.p.item,0)} items.${tail}`;
   return `You guessed ${usd(g.guess,0)}; the real cost is <b>${usd(T)} a year</b>, so you were off by <b>${usd(off)}</b> (${g.guess>T?'too high':'too low'}). The real fees are about ${(T/sim.p.send*100).toFixed(0)}% of one whole month’s transfer, or ${n.toFixed(1)} of the ${usd(sim.p.item,0)} item you picked.${tail}`;},
  again(sim){const S=[150,200,250,300,400,500];sim.p.send=S[Math.floor(Math.random()*S.length)];const C=['avg','bank','mto','dig'];sim.p.chan=C[Math.floor(Math.random()*C.length)];sim.p.guess=100;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You send $50 a month from a summer-job paycheck to a friend on a service year abroad, through a bank at the 13.64% bank average. How many dollars do fees take in a year?',answer:81.84,tol:0.5,unit:'$',d:2,hint:'12 × $50 is the year’s total. Then multiply by 0.1364.',explain:'12 × $50 = $600 a year, and 0.1364 × $600 = $81.84. A digital service at 4.95% would take $29.70, so the bank costs $52.14 more.'},
  {lvl:'bio',instant:true,q:'Same $300 a month. How much more a year does a bank (13.64%) cost than a digital service (4.95%)?',choices:['About $31','About $313','About $491','No difference'],correct:1,explain:'The gap is 13.64% − 4.95% = 8.69 points. 0.0869 × $3,600 ≈ $312.84 a year. The bank alone would take $491.04; the digital service $178.20.'},
  {lvl:'bio',instant:true,q:'If the cost of every transfer fell from 6.36% to the UN target of 3%, how much more of a year of $300 transfers would reach the family?',choices:['About $3.36','About $108','About $121','About $229'],correct:2,explain:'At 6.36%: $228.96. At 3%: 0.03 × $3,600 = $108. The family keeps $228.96 − $108 = $120.96 more.'},
  {lvl:'honors',instant:true,q:'A provider charges a flat $5 per transfer. Is it cheaper to send $300 once, or $100 three times?',choices:['Once: $5, or 1.67%','Three times: the fee is spread out','The same: $15 either way'],correct:0,explain:'Once: $5 ÷ $300 = 1.67%. Three times: 3 × $5 = $15, which is 5% of $300. A flat fee is a bigger share of a small transfer.'},
  {lvl:'honors',instant:true,q:'A “no fee” service sends $300 to a family that uses another currency, but converts at a rate 3% below the market rate. What does the transfer really cost?',choices:['Nothing','About $3','About $9','About $30'],correct:2,explain:'The markup is a cost too: 3% × $300 = $9 less arrives. To a dollar country like Ecuador there is no conversion, so that markup cannot happen.'},
  {lvl:'honors',instant:true,q:'Ecuador received $6.54 billion in 2024. If every dollar cost 6.36% to send instead of 3%, about how much more a year would the 3% target leave with families?',choices:['About $22 million','About $220 million','About $416 million','About $2.2 billion'],correct:1,explain:'The gap is 6.36% − 3% = 3.36 points. 0.0336 × $6.54B ≈ $0.22B, or about $220 million a year. (Simplified: real costs differ by corridor.)'},
  {lvl:'ap',instant:true,q:'Mexico received $67.9B in 2024 (3.7% of GDP). Tajikistan received $6.8B (47.2% of GDP). What does that tell you?',choices:['Mexico depends more on money sent home','Tajikistan’s economy is far smaller, so the money is a far bigger share of it','The two economies are about the same size'],correct:1,explain:'GDP ≈ amount ÷ share. Mexico: $67.9B ÷ 0.0371 ≈ $1,830B. Tajikistan: $6.80B ÷ 0.4715 ≈ $14.4B. Mexico gets 10 times the dollars, but Tajikistan depends on them about 13 times as much.'},
  {lvl:'ap',instant:true,q:'From 2008 to 2009, during a global recession, what happened to money flowing into low- and middle-income countries?',choices:['Both fell about the same','Foreign investment fell about 27%; money sent home fell about 3%','Money sent home fell more than foreign investment'],correct:1,explain:'World Bank data: FDI fell from $525.0B to $381.1B (−27.4%). Remittances fell from $267.1B to $258.6B (−3.1%). Over 2006 to 2024, remittances fell in only 2 years; FDI fell in 10.'},
  {lvl:'ap',instant:true,q:'A family receives $3,371.04 in a year. Suppose (for illustration) half of every dollar spent is re-spent locally, again and again. About how much local spending results in all?',choices:['$3,371','$5,057','$6,742','$33,710'],correct:2,explain:'Total = R × (1 + m + m² + …) = R ÷ (1 − m) = $3,371.04 ÷ 0.5 = $6,742.08. The re-spending share is an assumption; real values depend on imports, saving and taxes.'}
 ],
 tour:[
  {title:'A year of transfers',text:'Each column is one month: $300 Ana sends to her parents in Ecuador. Twelve columns make $3,600 a year.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,send:300,chan:'avg',view:'family',item:40}),focus:[14,40,500,280]},
  {title:'The red slice',text:'The red top of each column is the cost: the provider’s fee plus any exchange-rate markup. At the 6.36% global average, that is $19.08 of every $300.',pause:true,focus:[14,60,500,240]},
  {title:'Add it up',text:'Twelve slices: 0.0636 × $3,600 = $228.96 a year, and $3,371.04 arrives. That is about three-quarters of one whole month’s transfer, gone to fees.',pause:true,focus:[[520,20,270,290],[40,320,720,40]]},
  {title:'How you send matters',text:'Through a bank, at the 13.64% bank average, the year costs $491.04. A digital service at 4.95% costs $178.20. Same money sent, very different money received.',pause:true,setup:sim=>BioLab.setValues(sim,{chan:'bank'})},
  {title:'The world’s target',text:'UN Sustainable Development Goal target 10.c: cut costs below 3% by 2030 and end corridors above 5%. At 3%, the year costs $108, so the family keeps $120.96 more than at the average.',pause:true,setup:sim=>BioLab.setValues(sim,{chan:'sdg'})},
  {lvl:'honors',title:'A whole country',text:'Ecuador received $6.54B in 2024. At 6.36%, sending it costs about $416.2M a year. At 3%, about $196.3M: families would keep about $219.9M more.',pause:true,setup:sim=>BioLab.setValues(sim,{chan:'avg',view:'nation',country:'ecu'})},
  {lvl:'ap',title:'Share of the economy',text:'Money sent home was 47.2% of Tajikistan’s GDP in 2024, and about a quarter in Nicaragua, Nepal, Honduras and El Salvador. Mexico received the most dollars, but they were 3.7% of its GDP.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'gdp'})},
  {lvl:'ap',title:'Steadier than investment',text:'From 2006 to 2024, money sent home to low- and middle-income countries fell in only 2 years. Foreign investment fell in 10, including −27% in 2009 and −31% in 2023.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'flows'})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the way you send money change what arrives?</p><ol><li>Turn on <b>Show the real cost</b>. Keep $300 a month.</li><li>Pick each way of sending in turn and record a trial for each.</li><li>Change the amount to $150 and repeat.</li></ol><p>Write two sentences: which way left the most with the family, and how many of your items is the difference worth?</p>',
  honors:'<p><b>Question:</b> When does a flat fee beat a percentage?</p><ol><li>Pick <b>Your own provider</b>, with a $5 flat fee and a 2% markup, family in a country with its own currency.</li><li>Record the cost % for $50, $100, $200, $500 and $1,000 a month. Use the <b>cost % vs. amount sent</b> graph.</li><li>Switch the family to Ecuador and repeat.</li></ol><p>Explain why small transfers cost more as a share, and why Ecuador’s use of dollars changes the result.</p>',
  ap:'<p><b>Question:</b> How much do remittances matter to a country, and how steady are they?</p><ol><li>In <b>Whole country</b>, record the yearly savings at 3% for three countries.</li><li>In <b>Share of GDP</b>, record each one’s share and the implied GDP.</li><li>In <b>Compare flows</b>, find the years foreign investment fell and what money sent home did in those years.</li></ol><p><b>CER:</b> Claim how much cheaper sending would matter to one country, with evidence from the readouts and reasoning that weighs the caveats in About this model.</p>'},
 terms:[
  {t:'Remittance',d:'Money a worker sends to family or friends in another country.'},
  {t:'Transfer fee',d:'What the provider charges to send the money.'},
  {t:'Exchange-rate markup',d:'How far below the market rate the provider converts the money. It is a hidden cost: less arrives, even if the fee is $0.'},
  {t:'Total cost',d:'Fee plus exchange-rate markup, as a percent of the amount sent. This is what the World Bank measures.'},
  {t:'Corridor',d:'One sending country to one receiving country, such as the United States to Ecuador.',lvl:'honors'},
  {t:'Dollarization',d:'A country using the U.S. dollar as its own money. Ecuador has done so since 2000.',lvl:'honors'},
  {t:'GDP (gross domestic product)',d:'The value of everything a country produces in a year.',lvl:'ap'},
  {t:'Foreign direct investment (FDI)',d:'Money foreign companies invest in businesses in a country.',lvl:'ap'},
  {t:'Official development assistance (ODA)',d:'Aid from governments to developing countries.',lvl:'ap'},
  {t:'Multiplier',d:'Money spent locally becomes someone else’s income, and part of it is spent again. With re-spending share m, total ≈ amount ÷ (1 − m). Illustration only here.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> Yearly fees = 12 × monthly amount × total cost %. Your own provider: cost % = flat fee ÷ amount + exchange-rate markup (the markup is 0 when the family uses U.S. dollars, as in Ecuador). The named costs apply one average to every transfer; real costs vary by provider, corridor and amount.</p>'+
 '<p><b>Costs (World Bank Remittance Prices Worldwide, RPW).</b> RPW measures the total cost (fees plus exchange-rate margin) of sending $200. Global average: 6.36%, the current figure on the RPW home page (<a href="https://remittanceprices.worldbank.org/" target="_blank" rel="noopener">remittanceprices.worldbank.org</a>, checked Nov 2026). By channel, from RPW Issue 51, Q3 2024, the latest split we could open (<a href="https://documents1.worldbank.org/curated/en/099053025160028449/pdf/P179351-627082db-1078-448b-9b66-660ea3287ace.pdf" target="_blank" rel="noopener">report</a>): banks 13.64%, post offices 7.66%, money transfer operators 5.40%, mobile operators 2.84% (under 1% of the sample); digital 4.95% and non-digital 7.29%. The global average in that quarter was 6.62%. UN Sustainable Development Goal target 10.c: by 2030, cut remittance costs to less than 3% and end corridors costing more than 5% (<a href="https://worldbank.github.io/sdg-metadata/metadata/en/10-c-1" target="_blank" rel="noopener">SDG 10.c.1 metadata</a>).</p>'+
 '<p><b>Flows (World Bank World Development Indicators, 2024 data, updated Oct 8, 2026).</b> Personal remittances received and as % of GDP: Tajikistan $6.80B, 47.2%; Nicaragua $5.25B, 26.6%; Nepal $11.25B, 26.0%; Honduras $9.52B, 25.7%; El Salvador $8.49B, 24.3%; Guatemala $21.64B, 19.1%; Haiti $4.11B, 16.9%; Ecuador $6.54B, 5.3%; Mexico $67.91B, 3.7% (<a href="https://data.worldbank.org/indicator/BX.TRF.PWKR.DT.GD.ZS" target="_blank" rel="noopener">BX.TRF.PWKR.DT.GD.ZS</a>, <a href="https://data.worldbank.org/indicator/BX.TRF.PWKR.CD.DT" target="_blank" rel="noopener">BX.TRF.PWKR.CD.DT</a>). All low- and middle-income countries: $664.6B in 2024. For 2023, the latest year with all three: remittances $608.0B, foreign direct investment $407.5B (<a href="https://data.worldbank.org/indicator/BX.KLT.DINV.CD.WD" target="_blank" rel="noopener">BX.KLT.DINV.CD.WD</a>), net official development aid $251.9B (<a href="https://data.worldbank.org/indicator/DT.ODA.ODAT.CD" target="_blank" rel="noopener">DT.ODA.ODAT.CD</a>). The World Bank/KNOMAD Migration and Development Brief estimates $685B to these countries in 2024, using its own estimates, and says that is more than FDI and aid combined (<a href="https://blogs.worldbank.org/en/peoplemove/in-2024--remittance-flows-to-low--and-middle-income-countries-ar" target="_blank" rel="noopener">World Bank blog, Dec 18, 2024</a>). Recorded flows leave out informal channels. <b>National fee totals</b> treat the recorded flow as the amount sent and apply one cost to all of it: an illustration, not a measurement.</p>'+
 '<p><b>Steadiness.</b> From the same WDI series, 2006 to 2024: remittances fell in 2 years (2009 −3.1%, 2016 −2.5%), and FDI fell in 10 (2009 −27.4%, 2023 −30.7%). The standard deviation of yearly % change was 6.6 points for remittances and 22.5 for FDI. Values are in current U.S. dollars, not adjusted for inflation.</p>'+
 '<p><b>What the evidence says.</b> When the 1997 Asian financial crisis made the currencies of Filipino migrants’ host countries gain against the peso, remittances rose (elasticity 0.60), and households increased child schooling and education spending, reduced child labor and started more businesses (Yang, <i>Economic Journal</i> 118, 2008, <a href="https://econpapers.repec.org/RePEc:ecj:econjl:v:118:y:2008:i:528:p:591-630" target="_blank" rel="noopener">link</a>). In Philippine households with migrants, about 60% of income lost to rainfall shocks was replaced by remittances (Yang and Choi, <i>World Bank Economic Review</i> 21, 2007, <a href="https://econpapers.repec.org/RePEc:oup:wbecrv:v:21:y:2007:i:2:p:219-248" target="_blank" rel="noopener">link</a>).</p>'+
 '<p><b>The debates.</b> <i>Dependence and growth:</i> an IMF study found “a robust negative correlation between remittances and GDP growth,” and argued remittances are compensation for hard times, not investment capital (Chami, Fullenkamp and Jahjah, <i>IMF Staff Papers</i> 52, 2005, <a href="https://www.imf.org/External/Pubs/FT/staffp/2005/01/chami.htm" target="_blank" rel="noopener">link</a>). A correlation does not settle cause: money may flow toward countries because they are struggling, which is the insurance effect Yang and Choi measured. <i>Brain drain:</i> skilled workers leaving can cost a country their skills; Gibson and McKenzie review evidence that skilled migrants also remit, invest and share knowledge back home, and call the phrase “a loaded phrase implying serious loss” (<i>Journal of Economic Perspectives</i> 25, 2011, <a href="https://econpapers.repec.org/RePEc:aea:jecper:v:25:y:2011:i:3:p:107-28" target="_blank" rel="noopener">link</a>). This tool takes no position on migration policy: it is about families supporting families and the math of fees.</p>'+
 '<p><b>Assumptions.</b> The re-spending share and the multiplier R ÷ (1 − m) are an illustration, not a measured value: real effects depend on imports, saving and taxes. Ecuador has used the U.S. dollar as its official currency since 2000. The item price is your own number and stays in this page’s memory.</p>'+
 '<p><b>What this number hides.</b> The 6.36% is one average across providers, corridors and amounts, measured on a $200 transfer. It hides corridors that cost far more than the average, small transfers where a flat fee is a bigger share, and markups that never show up as a fee. It counts fees and the exchange-rate margin only, not the time or travel it takes to send.</p><p><b>Catholic social teaching.</b> “The family is the original cell of social life” (<a href="https://www.vatican.va/archive/ENG0015/__P7T.HTM" target="_blank" rel="noopener">Catechism 2207</a>). Saint John Paul II called solidarity “a firm and persevering determination to commit oneself to the common good” (<a href="https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_30121987_sollicitudo-rei-socialis.html" target="_blank" rel="noopener"><i>Sollicitudo Rei Socialis</i> 38</a>).</p>'
};
BioLab.register(SIM);
})();
