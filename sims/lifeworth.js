(function(){
'use strict';
const {clamp,txt,rr,pill,PAL,axes,legend,atLeast,FONT}=BioLab.h;
/* Value of a statistical life (VSL), in millions of dollars. DOT 2025 base year; HHS central estimate and range. */
const VSL={dot:{v:14.2,l:'DOT $14.2M'},lo:{v:6.6,l:'HHS low $6.6M'},mid:{v:14.1,l:'HHS central $14.1M'},hi:{v:21.5,l:'HHS high $21.5M'}};
/* Example projects near a school. Costs, lifetimes and expected deaths prevented are assumptions for illustration. */
const PROJ={
 signal:{l:'Traffic signal at the school crosswalk',s:'Crosswalk signal',cost:0.75,yrs:20,rate:0.004},
 rails:{l:'Guardrails on the curve near school',s:'Curve guardrails',cost:0.40,yrs:25,rate:0.0008},
 beacon:{l:'Flashing school-zone beacons',s:'School-zone beacons',cost:0.06,yrs:10,rate:0.001}};
const vsl=sim=>sim.p.vsl==='mine'?sim.p.wtp*1e4/1e6:(VSL[sim.p.vsl]||VSL.dot).v;
const vslName=sim=>sim.p.vsl==='mine'?`your value, $${vsl(sim).toFixed(1)}M`:(VSL[sim.p.vsl]||VSL.dot).l;
const lives=sim=>sim.p.rate*sim.p.yrs;
const benefit=sim=>lives(sim)*vsl(sim);
const net=sim=>benefit(sim)-sim.p.cost;
const be=sim=>sim.p.cost/lives(sim);
const chance=sim=>1-Math.exp(-lives(sim));
const pass=sim=>benefit(sim)>=sim.p.cost;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* The benefit and break-even stay hidden while the student works them out ("Your turn"). */
const shown=sim=>!pend(sim)&&!!(sim.p.show||(GS(sim)&&GS(sim).g));
const lv3=v=>v.toFixed(4).replace(/0+$/,'').replace(/\.$/,'');
const r2=v=>Math.round(v*100)/100,r1=v=>Math.round(v*10)/10;
const calcBE=()=>atLeast('honors');
const M=v=>(v<0?'−':'')+'$'+Math.abs(v).toFixed(2)+'M';
const M1=v=>'$'+v.toFixed(1)+'M';
const custom=sim=>{const P=PROJ[sim.p.proj];return !P||Math.abs(P.cost-sim.p.cost)>1e-9||P.yrs!==sim.p.yrs||Math.abs(P.rate-sim.p.rate)>1e-12;};
const pname=sim=>(custom(sim)?'Your version of the ':'')+(custom(sim)?PROJ[sim.p.proj].l.charAt(0).toLowerCase()+PROJ[sim.p.proj].l.slice(1):PROJ[sim.p.proj].l);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function setProj(sim){const P=PROJ[sim.p.proj];BioLab.setValues(sim,{cost:P.cost,yrs:P.yrs,rate:P.rate});clearGut(sim);}
const pick=(sim,c)=>({v:c==='build'?net(sim):0,call:c,label:c==='build'?`build it (net ${M(net(sim))})`:'skip it (net $0.00M)'});
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
function lay(k){const top=k>1.4?78:96,lineY=Math.round(450-26-36*k),fy=Math.round(top+50*k+40);return {top,lineY,fy};}

function draw(sim,ctx,vdt,k){const W=800,H=450,sh=shown(sim),Q=lay(k),V=vsl(sim),ph=k>1.4;sim._k=k;
 ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
 /* 1. what a statistical life is: 100 figures, each standing for 100 people */
 ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,6,784,Q.top-12,10);ctx.fill();
 const fx=22,fyy=16,cols=25,sp=ph?8.4:9.6,rows=4;
 for(let i=0;i<100;i++){const c=i%cols,r=Math.floor(i/cols),x=fx+c*sp,y=fyy+r*(ph?14:17);ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(x+3,y+3,2.6,0,7);ctx.fill();ctx.fillRect(x+0.8,y+6.5,4.4,(ph?6:8));}
 const wtp=V*1e6/1e4,tx=fx+cols*sp+16,tw=W-tx-18;
 if(ph){txt(ctx,`10,000 people × $${Math.round(wtp).toLocaleString('en-US')} = ${M1(V)}`,tx,30,{s:13*k,w:700});txt(ctx,'per statistical life saved',tx,30+18*k,{s:12*k,c:PAL['cv-soft']});}
 else{txt(ctx,`10,000 people each pay $${Math.round(wtp).toLocaleString('en-US')} for a 1-in-10,000 cut in their risk.`,tx,30,{s:13*k,w:700});
  txt(ctx,`Together that is ${M1(V)} for one expected life saved: a statistical life.`,tx,30+19*k,{s:12*k});
  txt(ctx,'Each figure stands for 100 people. No one is named; no one is priced.',tx,30+37*k,{s:12*k,c:PAL['cv-soft']});}
 /* 2. the balance: cost against benefit */
 const cx=400,fy=Q.fy,arm=ph?220:230,cost=sim.p.cost,ben=benefit(sim);
 const tilt=sh?clamp((ben-cost)/Math.max(ben,cost,1e-9),-1,1)*0.12:0;
 const lx=cx-arm*Math.cos(tilt),ly=fy+arm*Math.sin(tilt),rx=cx+arm*Math.cos(tilt),ry=fy-arm*Math.sin(tilt);
 txt(ctx,pname(sim),cx,Q.top+14*k,{s:14*k,w:700,a:'center'});
 if(!ph)txt(ctx,`Over ${sim.p.yrs} years it is expected to prevent ${lives(sim).toFixed(3).replace(/0+$/,'')} deaths: about a 1-in-${Math.round(1/chance(sim))} chance of saving a life.`,cx,Q.top+32*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
 else txt(ctx,`${lives(sim).toFixed(3).replace(/0+$/,'')} expected lives saved in ${sim.p.yrs} years`,cx,Q.top+32*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
 ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(cx,fy);ctx.lineTo(cx-22,fy+34);ctx.lineTo(cx+22,fy+34);ctx.closePath();ctx.fill();
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(rx,ry);ctx.stroke();
 const pan=(x,y,col,l1,l2,up)=>{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-40,y+26);ctx.moveTo(x,y);ctx.lineTo(x+40,y+26);ctx.stroke();
  ctx.fillStyle=col;rr(ctx,x-56,y+26,112,10,5);ctx.fill();
  txt(ctx,l1,x,y+36+16*k,{s:13*k,w:700,a:'center',c:col});if(l2)txt(ctx,l2,x,y+36+33*k,{s:12*k,a:'center',c:PAL['cv-soft']});};
 pan(lx,ly,PAL['s1'],`Cost ${M(cost)}`,ph?'':'to build and keep up');
 pan(rx,ry,PAL['s3'],sh?`Benefit ${M(ben)}`:'Benefit ?',sh?(ph?`${lv3(lives(sim))} × ${M1(V)}`:`${lv3(lives(sim))} lives × ${M1(V)}`):(ph?'':(pend(sim)?'work it out first':'lock in your gut first')));
 if(sh){const ok=pass(sim);pill(ctx,ok?'Passes the cost-benefit test':'Fails the cost-benefit test',cx,fy+58,ok?'#2f7d5b':'#b23a3a','#fff',13*Math.min(k,1.4));}
 const G=GS(sim);if(G&&G.g)txt(ctx,`Your gut: ${G.g.call==='build'?'build it':'skip it'}`,cx,fy+(sh?84:52)+8*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});
 /* 3. the value line, $0 to $25M per statistical life */
 const y=Q.lineY,x0=60,x1=740,X=v=>x0+v/25*(x1-x0),b=be(sim);
 if(sh&&b<25){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.14;ctx.fillRect(x0,y-7,X(b)-x0,14);ctx.fillStyle=PAL['s3'];ctx.fillRect(X(b),y-7,x1-X(b),14);ctx.globalAlpha=1;}
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
 txt(ctx,'$0',x0,y+36*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'$25M',x1,y+36*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const tick=(v,lab,row)=>{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(v),y-6);ctx.lineTo(X(v),y+6);ctx.stroke();txt(ctx,lab,X(v),y+(row?36:19)*k,{s:12*k,c:PAL['cv-soft'],a:'center'});};
 tick(6.6,'HHS low $6.6M',0);tick(21.5,'HHS high $21.5M',0);tick(14.15,ph?'DOT $14.2M, HHS $14.1M':'HHS central $14.1M · DOT $14.2M',1);
 ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(Math.min(V,25)),y,7,0,7);ctx.fill();
 if(sh){const bx=X(Math.min(b,25));ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(bx,y-8);ctx.lineTo(bx-7,y-20);ctx.lineTo(bx+7,y-20);ctx.closePath();ctx.fill();
  const bl=b<25?`Break-even ${M1(b)}`:'Break-even above $25M';ctx.font='700 '+(12*k)+'px '+FONT;const bw=ctx.measureText(bl).width;
  txt(ctx,bl,clamp(bx,x0+bw/2,x1-bw/2),y-26,{s:12*k,w:700,a:'center'});}}

/* The two views and the discussion question now live in About; the last tour step asks the question. */
const VIEWS=`<p><b>A statistical life and a real person.</b> The Catechism teaches that every person has a dignity rooted in being made in the image of God (Catechism of the Catholic Church, “The Dignity of the Human Person,” 1700 and following). Agencies say the VSL is not a price on anyone: it adds up what people pay for small cuts in risk.</p>
 <p><b>One view:</b> with a shared number, a city or agency spends its limited money where it saves the most lives. Without one, it might spend $50M to save one life in one program and refuse $1M to save one in another.</p>
 <p><b>Another view:</b> any dollar figure can make a life look tradeable. What people are willing to pay depends on what they can afford, so a value built from it could count some people’s safety for less.</p>
 <p><b>Discuss:</b> Can a community honor every person’s dignity and still have to choose which safety projects to fund? What should guide that choice? There is no answer key for this question.</p>`;

const SIM={
 id:'lifeworth',hash:'lifeworth',apUnit:2,order:2,tab:'What is a life worth?',kind:'Simulation',
 skills:{bio:'Expected value: rate × time × value · Algebra 1 (Unit 2), Statistics (Chapter 6)',honors:'A linear function and its break-even point (cost ÷ lives) · Algebra 1 (Unit 4), Statistics (Chapter 6)',ap:'A linear net-benefit function and the Poisson model · Algebra 1 (Unit 4), AP Statistics (Unit 4)'},
 card:'Decide by feel whether a safety project near a school is worth building, then run the government’s cost-benefit test and see how the answer depends on one number.',
 title:'What is a life worth?',
 lede:{bio:'Cities cannot build every safety project. To choose, governments compare what a project costs with the lives it is expected to save, valued at about $14 million each. That number is not a price on a person. So what is it?',
  honors:'The value of a statistical life (VSL) adds up what many people pay for a small cut in risk. DOT uses $14.2M; HHS uses $14.1M, with a range of $6.6M to $21.5M. Change the value, and some decisions flip.',
  ap:'Benefit = expected lives saved × VSL. A project passes when benefit ≥ cost, so its break-even value is cost ÷ expected lives saved: the cost per statistical life saved.'},
 scale:'One safety project near a high school, over its whole working life. Money in millions of dollars.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The decision',
 controls:[
  {id:'proj',label:'The project',type:'seg',def:'signal',noGut:true,onChange:setProj,options:[{v:'signal',l:'Crosswalk signal'},{v:'rails',l:'Curve guardrails'},{v:'beacon',l:'School-zone beacons'}],help:'Example projects. Their costs and expected lives saved are assumptions for illustration.'},
  {id:'call',label:'Your call',type:'seg',def:'build',options:[{v:'build',l:'Build it'},{v:'skip',l:'Skip it'}]},
  {id:'show',label:'Show the cost-benefit math',type:'toggle',def:false,help:'Off: you decide by feel first.'},
  {id:'vsl',label:'Value of a statistical life',type:'seg',def:'dot',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'dot',l:'DOT $14.2M'},{v:'lo',l:'HHS low $6.6M'},{v:'mid',l:'HHS central $14.1M'},{v:'hi',l:'HHS high $21.5M'},{v:'mine',l:'From what you would pay',lvl:'ap'}]},
  {id:'cost',label:'Cost over its life, in millions of dollars',type:'range',min:0.02,max:2,step:0.01,def:0.75,unit:'',d:2,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'rate',label:'Expected deaths prevented per year',type:'range',min:0.0002,max:0.01,step:0.0001,def:0.004,d:4,lvl:'honors',noGut:true,onChange:clearGut,help:'An expected value: 0.004 means about 4 deaths prevented per 1,000 years, on average.'},
  {id:'yrs',label:'Years it lasts',type:'range',min:5,max:40,step:1,def:20,unit:' years',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'wtp',label:'What would you pay for a 1-in-10,000 cut in your risk of dying?',type:'range',min:100,max:3000,step:10,def:1420,unit:' dollars',lvl:'ap',noGut:true,onChange:clearGut,help:'Used when the value is set to “From what you would pay”. Your answer × 10,000 is your VSL. It stays on this device.'}
 ],
 actions:[{id:'decide',label:'Make the cost-benefit call',lvl:'honors',run(sim){BioLab.setValues(sim,{call:pass(sim)?'build':'skip',show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cost',label:'Cost',unit:'$ millions',d:2,min:0,max:2,get:sim=>sim.p.cost},
  {id:'lives',label:'Expected lives saved over its life',unit:'statistical lives',d:3,min:0,max:null,get:lives},
  {id:'vslv',label:'Value of a statistical life used',unit:'$ millions',d:1,min:0,max:30,get:vsl},
  {id:'benefit',label:'Benefit: lives × VSL',unit:'$ millions',d:2,min:0,max:null,get:sim=>shown(sim)?benefit(sim):null},
  {id:'net',label:'Benefit minus cost',unit:'$ millions',d:2,min:null,max:null,get:sim=>shown(sim)?net(sim):null},
  {id:'be',label:'Cost per statistical life saved (break-even VSL)',unit:'$ millions',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?be(sim):null},
  {id:'bcr',label:'Benefit-cost ratio',unit:'',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?benefit(sim)/sim.p.cost:null},
  {id:'pchance',label:'Chance it prevents at least one death',unit:'%',d:2,lvl:'ap',min:0,max:100,get:sim=>100*chance(sim)}
 ],
 graphs:[{id:'netv',label:'Benefit minus cost vs. the VSL',custom:true}],defaultGraph:'netv',
 plot(sim,ctx,box){const l=lives(sim),c=sim.p.cost,top=Math.max(0.5,l*25-c),bot=Math.min(-0.2,-c);
  const ax=axes(ctx,box,{xmin:0,xmax:25,ymin:bot,ymax:top,xl:'Value of a statistical life ($ millions)',yl:'Benefit − cost ($M)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the math',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(-c));ctx.lineTo(ax.X(25),ax.Y(l*25-c));ctx.stroke();
  [[6.6,'HHS low'],[14.2,'DOT'],[21.5,'HHS high']].forEach(([v,n],i)=>{ctx.fillStyle=PAL['s'+(i+2)];ctx.beginPath();ctx.arc(ax.X(v),ax.Y(l*v-c),5,0,7);ctx.fill();txt(ctx,n,ax.X(v),ax.Y(l*v-c)+(i===1?18:-10),{s:12,c:PAL['fg'],a:'center',w:600});});
  const b=be(sim);if(b<=25){ctx.fillStyle=PAL['fg'];ctx.beginPath();ctx.arc(ax.X(b),ax.Y(0),4,0,7);ctx.fill();txt(ctx,'Break-even',ax.X(b)+6,ax.Y(0)+16,{s:12,c:PAL['fg']});}},
 draw,
 narrate(sim){const l=lives(sim),c=sim.p.cost;
  if(pend(sim))return atLeast('honors')?'Your turn: <b>break-even = cost ÷ expected lives</b>. Work it out, then check it.':'Your turn: <b>benefit = deaths per year × years × value</b>. Work it out, then check it.';
  if(!shown(sim))return `The project costs ${M(c)} and is expected to prevent ${l.toFixed(3).replace(/0+$/,'')} deaths over ${sim.p.yrs} years. <b>Is that worth it?</b> Make your call by feel first.`;
  const b=benefit(sim),n=b-c;
  return `At ${vslName(sim)} per statistical life, the benefit is ${l.toFixed(3).replace(/0+$/,'')} × ${M1(vsl(sim))} = ${M(b)}. ${n>=0?`<b>It passes:</b> the benefit beats the cost by ${M(n)}.`:`<b>It fails:</b> the cost beats the benefit by ${M(-n)}.`} It would flip at ${M1(be(sim))} per statistical life.`;},
 gut:{better:'higher',controls:['call'],
  ask:{bio:'You are on your city’s youth advisory council. Should the city build this project near your school? Pick <b>Build it</b> or <b>Skip it</b> here, by feel, then lock it in.',
   honors:'Before you see the math: does this project pass a cost-benefit test at DOT’s $14.2M per statistical life? Pick <b>Build it</b> or <b>Skip it</b>, then lock it in.'},
  lock(sim){return pick(sim,sim.p.call);},
  solve(sim){const c=pass(sim)?'build':'skip';sim.p.call=c;sim.p.show=true;return pick(sim,c);},
  hint:{bio:'Lock in your call. Then you will work out the benefit in dollars yourself.',honors:'Lock in your call. Then you will work out the project’s cost per statistical life saved yourself.'},
  calc:{unit:'million dollars',d:2,tol:a=>Math.max(0.01,0.005*Math.abs(a)),after:'lock',
   prompt:{bio:sim=>`The project is expected to prevent <b>${lv3(sim.p.rate)}</b> deaths a year for <b>${sim.p.yrs}</b> years. The value used is <b>${M1(vsl(sim))}</b> per statistical life. Work out the benefit, in millions of dollars: expected lives = deaths per year × years, then benefit = lives × value.`,
    honors:sim=>`The project costs <b>${M(sim.p.cost)}</b> and is expected to prevent ${lv3(sim.p.rate)} deaths a year for ${sim.p.yrs} years. Find its <b>cost per statistical life saved</b> (the break-even value), in millions of dollars.`},
   answer:sim=>calcBE()?r2(be(sim)):r2(benefit(sim)),
   hint:{bio:'First multiply deaths per year by years to get expected lives. Then multiply by the value in millions.',honors:'Find the expected lives first (deaths per year × years), then divide the cost by it.'},
   steps(sim){const l=lives(sim);if(calcBE())return [`Expected lives = ${lv3(sim.p.rate)} × ${sim.p.yrs} = ${lv3(l)}.`,`Break-even = cost ÷ lives = ${M(sim.p.cost)} ÷ ${lv3(l)} = <b>${M(r2(be(sim)))}</b> per statistical life.`,`At ${vslName(sim)} the project ${pass(sim)?'passes':'fails'}: the value is ${vsl(sim)>=be(sim)?'at or above':'below'} the break-even.`];
    return [`Expected lives = ${lv3(sim.p.rate)} × ${sim.p.yrs} = ${lv3(l)}.`,`Benefit = ${lv3(l)} × ${M1(vsl(sim))} = <b>${M(r2(benefit(sim)))}</b>.`,`Against a cost of ${M(sim.p.cost)}, the project ${pass(sim)?'passes':'fails'} the test.`];}},
  formula(sim){const l=lives(sim);return `Benefit = ${lv3(sim.p.rate)} × ${sim.p.yrs} × ${M1(vsl(sim))} = ${lv3(l)} × ${M1(vsl(sim))} = ${M(benefit(sim))}, against a cost of ${M(sim.p.cost)}`+(atLeast('honors')?`<br>Break-even = ${M(sim.p.cost)} ÷ ${lv3(l)} = ${M1(be(sim))} per statistical life`:'');},
  how:{bio:'The math multiplies the expected lives saved by the value of a statistical life to get the benefit in dollars. If the benefit is at least the cost, the project passes.',
   honors:'Benefit = (deaths prevented per year × years) × VSL. Compare it with the cost, or compare the VSL with the break-even value, cost ÷ lives.',
   ap:'Net benefit N(V) = L·V − C is a line in the VSL V with slope L (expected lives) and intercept −C. It crosses zero at V* = C ÷ L.'},
  compare(sim,g,m){const l=lives(sim),b=be(sim),V=vsl(sim),lv=l.toFixed(3).replace(/0+$/,'');
   const tail=` Its cost per statistical life saved is ${M1(b)}, against ${vslName(sim)}.`;
   if(g.call===m.call)return `Your gut was right on: ${m.call==='build'?'build it':'skip it'}. The project is expected to save ${lv} statistical lives, worth ${M(l*V)}, for ${M(sim.p.cost)}.${tail}`;
   if(m.call==='build')return `Skipping it leaves <b>${M(m.v)} of net benefit</b> on the table: ${lv} expected lives saved, worth ${M(l*V)}, for only ${M(sim.p.cost)}.${tail}`;
   return `Building it spends <b>${M(-g.v)} more than its expected benefit</b>. By this test, that money would save more lives in a project with a lower cost per life saved.${tail}`;},
  again(sim){const ks=Object.keys(PROJ);sim.p.proj=ks[Math.floor(Math.random()*3)];const P=PROJ[sim.p.proj];sim.p.cost=P.cost;sim.p.yrs=P.yrs;sim.p.rate=P.rate;sim.p.call='build';sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A new example: a speed hump costs $0.30M and is expected to prevent 0.002 deaths a year for 15 years. At $14.2M per statistical life, what is its benefit, in millions of dollars?',answer:0.426,tol:0.005,unit:'million dollars',d:3,hint:'Expected lives = 0.002 × 15. Then multiply by 14.2.',explain:'Expected lives = 0.002 × 15 = 0.03. Benefit = 0.03 × $14.2M = $0.426M, more than the $0.30M cost, so it passes. Its break-even value is $0.30M ÷ 0.03 = $10.0M.'},
  {lvl:'bio',instant:true,q:'DOT uses $14.2M as the value of a statistical life. What does that number mean?',choices:['The government thinks a person is worth $14.2M','It adds up what many people pay for small cuts in risk: 10,000 people paying $1,420 each for a 1-in-10,000 risk cut','It is the average life insurance payout'],correct:1,explain:'10,000 × $1,420 = $14.2M, and a 1-in-10,000 risk cut across 10,000 people prevents one death on average. The VSL is a total of small risk choices, not a price on any person.'},
  {lvl:'bio',instant:true,q:'The crosswalk signal costs $0.75M and is expected to save 0.08 statistical lives. The guardrails cost less, $0.40M, but are expected to save 0.02. At $14.2M, which passes?',choices:['Both','Only the signal','Only the guardrails','Neither'],correct:1,explain:'Signal: 0.08 × $14.2M = $1.14M, more than $0.75M, so it passes. Guardrails: 0.02 × $14.2M = $0.28M, less than $0.40M, so they fail. The cheaper project is not always the better buy: what matters is cost per life saved ($9.4M against $20.0M).'},
  {lvl:'honors',instant:true,q:'Use HHS’s low estimate, $6.6M, instead of DOT’s $14.2M. What happens to the crosswalk signal?',choices:['It still passes','It now fails: 0.08 × $6.6M = $0.53M, less than $0.75M','Nothing changes, since the cost is the same'],correct:1,explain:'The signal’s break-even value is $0.75M ÷ 0.08 = $9.4M. Any VSL below that makes it fail, and $6.6M is below it.'},
  {lvl:'honors',instant:true,q:'The guardrails’ break-even value is $20.0M per statistical life. Which value makes them pass?',choices:['DOT $14.2M','HHS central $14.1M','HHS high $21.5M','None of these'],correct:2,explain:'They pass only when the VSL is at least $0.40M ÷ 0.02 = $20.0M, and only HHS’s high estimate, $21.5M, is that high.'},
  {lvl:'ap',instant:true,q:'The signal is expected to save 0.08 lives over 20 years. Treating deaths prevented as random (Poisson), what is the chance it prevents at least one death?',choices:['0.08%','About 8% (1 − e^−0.08 ≈ 7.7%)','About 50%','100%'],correct:1,explain:'P(at least one) = 1 − e^−λ with λ = 0.08: 1 − 0.923 = 0.077. Most likely, the signal never visibly saves anyone, which is why expected value, not a single story, drives the decision.'},
  {lvl:'ap',instant:true,q:'You would pay $500 for a 1-in-10,000 cut in your risk. Using that as your VSL, does the crosswalk signal pass?',choices:['Yes: $500 × 10,000 = $5.0M, and 0.08 × $5.0M beats the cost','No: your VSL is $5.0M, and 0.08 × $5.0M = $0.40M is less than $0.75M','It cannot be computed'],correct:1,explain:'VSL = $500 × 10,000 = $5.0M. Benefit = 0.08 × $5.0M = $0.40M < $0.75M. The signal needs a willingness to pay of at least $9.375M ÷ 10,000 = $937.50.'}
 ],
 tour:[
  {title:'The project',text:'A traffic signal at the school crosswalk costs $0.75M to build and keep up for 20 years. In this example it is expected to prevent 0.004 deaths a year: 0.08 over its life.',pause:true,setup:sim=>BioLab.setValues(sim,{proj:'signal',show:false,vsl:'dot'}),focus:sim=>{const Q=lay(sim._k||1);return [120,Q.top-4,560,Q.fy-Q.top+90];}},
  {title:'Not a price on a person',text:'Suppose 10,000 people each pay $1,420 for a 1-in-10,000 cut in their risk. On average that prevents one death, and together they paid $14.2M. That total is the value of a statistical life (VSL).',pause:true,focus:sim=>[8,6,784,lay(sim._k||1).top-12]},
  {title:'Benefit = lives × VSL',text:'0.08 expected lives × $14.2M = $1.14M of benefit, against $0.75M of cost. The scale tips toward the benefit: the signal passes.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'The break-even value',text:'$0.75M ÷ 0.08 = $9.4M. That is the cost per statistical life saved. The signal passes with any VSL above $9.4M and fails below it: look for the black triangle on the line.',pause:true,focus:sim=>{const y=lay(sim._k||1).lineY;return [30,y-50,740,96];}},
  {lvl:'honors',title:'Change the value, change the decision',text:'With HHS’s low estimate, $6.6M, the benefit is 0.08 × $6.6M = $0.53M. Now the cost wins and the signal fails. Agencies use ranges because the right value is uncertain.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,vsl:'lo'})},
  {title:'A cheaper project is not always a better buy',text:'The guardrails cost only $0.40M, but they are expected to save 0.02 lives: $20.0M per statistical life. At $14.2M they fail.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,vsl:'dot',proj:'rails'})},
  {lvl:'ap',title:'Expected is not certain',text:'0.08 expected lives does not mean the signal saves 0.08 of a person. With deaths prevented treated as random, the chance it prevents at least one is 1 − e^−0.08 ≈ 7.7%.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,vsl:'dot',proj:'signal'})},
  {stnSet:{proj:'signal',show:true,vsl:'dot'},stn:{rings:[[8,8,784,84]],card:{x:100,y:262,w:600,title:'A values question, with no answer key',lines:['The math: 0.08 lives × $14.2M = $1.14M of benefit vs. $0.75M of cost.','The question: can a community honor every person’s dignity and still have to choose which projects to fund?']}},title:'Dignity and the dollar',text:'The math can tell you what a VSL implies. Whether and how to use one is a question of values. Discuss: can a community honor every person’s dignity and still have to choose which safety projects to fund? What should guide that choice? About gives two views and the Catechism as a named source. There is no answer key for this question.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Which projects pass the cost-benefit test?</p><ol><li>Turn on <b>Show the cost-benefit math</b>.</li><li>For each project, record a trial and note whether it passes.</li><li>Rank the projects by cost per statistical life saved.</li></ol><p>Write two sentences: which project would you fund first, and why?</p>',
  honors:'<p><b>Question:</b> How much does the decision depend on the VSL?</p><ol><li>For each project, record the benefit at HHS low, DOT and HHS high.</li><li>Find each project’s break-even value and check it against <b>Cost per statistical life saved</b>.</li><li>Change <b>Expected deaths prevented per year</b> by half for one project. What happens?</li></ol><p>Which number is the city least sure of: the cost, the lives saved, or the VSL? Explain.</p>',
  ap:'<p><b>Question:</b> When does the choice of VSL matter?</p><ol><li>Plot benefit − cost against the VSL for each project from the graph.</li><li>Set <b>What would you pay</b> to your own answer and choose <b>From what you would pay</b>. Which projects pass?</li><li>Compute the chance each project prevents at least one death.</li></ol><p><b>CER:</b> Make a claim about how a city should use the VSL, with evidence from your data. Your claim about values is your own; the math must be right.</p>'},
 terms:[
  {t:'Cost-benefit analysis',d:'Comparing what a choice costs with the value of what it is expected to deliver.'},
  {t:'Value of a statistical life (VSL)',d:'What a group of people would pay, in total, for small risk cuts that together prevent one death on average. Not a price on a person.'},
  {t:'Expected value',d:'The long-run average outcome. 0.08 expected lives saved is an average over many places like this one.'},
  {t:'Break-even value',d:'The VSL at which benefit equals cost: cost ÷ expected lives saved. Also called the cost per statistical life saved.',lvl:'honors'},
  {t:'Benefit-cost ratio',d:'Benefit ÷ cost. Above 1 means the benefit is bigger.',lvl:'honors'},
  {t:'Poisson model',d:'A model for counts of rare events. If the expected count is λ, the chance of at least one is 1 − e^−λ.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning.</b> Benefit = expected deaths prevented per year × years × VSL. A project passes when benefit ≥ cost. The tool does not discount future years, and it counts only deaths prevented. Real analyses also value injuries (as fractions of the VSL), property damage and travel time, and they discount the future, so real answers can differ.</p><p><b>Values of a statistical life:</b> U.S. Department of Transportation, $14.2M (2025 base year), <a href="https://www.transportation.gov/office-policy/transportation-policy/revised-departmental-guidance-on-valuation-of-a-statistical-life-in-economic-analysis" target="_blank" rel="noopener">DOT guidance</a>. U.S. Department of Health and Human Services: central estimate $14.1M, range $6.6M to $21.5M. The 10,000 × $1,420 example shows how a VSL is built from small risk choices.</p><p><b>The three projects are made up for illustration.</b> Their costs, lifetimes and expected deaths prevented are assumptions, not data from any real city. The “From what you would pay” value stays in your browser and is never sent anywhere.</p><p><b>Vaccines:</b> CDC, MMWR, August 2024, children born 1994–2023: about 508 million illnesses, 32 million hospitalizations and 1,129,000 deaths prevented; societal benefit-cost ratio 10.9 (<a href="https://www.cdc.gov/mmwr/volumes/73/wr/mm7331a2.htm" target="_blank" rel="noopener">MMWR 73(31)</a>).</p><p><b>A real case: childhood vaccines.</b> The CDC estimated that routine childhood vaccines given to children born 1994–2023 prevented about 508 million illnesses, 32 million hospitalizations and 1,129,000 deaths, with a benefit-cost ratio of 10.9 from a societal view (MMWR, August 2024). That ratio is the CDC’s own estimate of costs saved; it does not use a VSL.</p>'+VIEWS+'<p>The tool presents the tension between the Catechism’s teaching and cost-benefit analysis as a question to discuss, not a verdict.</p>'+'<p><b>What this number hides.</b> A benefit in dollars hides who is protected and who pays, injuries and fear that are not deaths, and the uncertainty in the expected lives saved: 0.08 is an average over many places like this one, not a promise.</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
