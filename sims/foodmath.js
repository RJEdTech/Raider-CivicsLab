(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Follow 100 lb of U.S. surplus food (ReFED 2026 report, 2024 data) through the EPA Wasted Food Scale.
   Stage shares are ReFED's (they add to 100.1 because of rounding). Footprint and value per pound are computed
   from ReFED's totals: 219 MMT CO2e and $380B for 70 million (U.S. short) tons. */
const ST=[{id:'home',l:'Homes',p:33.5},{id:'farm',l:'Farms',p:24.2},{id:'mfg',l:'Food factories',p:18.8},{id:'fs',l:'Restaurants, cafeterias',p:17.9},{id:'retail',l:'Grocery stores',p:5.7}];
const TOT=ST.reduce((a,s)=>a+s.p,0);                      /* 100.1 */
const R={tons:70,lbpp:412,usd:380,co2:219,co2pct:3.5};
const CO2LB=R.co2*1e9/(R.tons*1e6*907.18474);            /* lb CO2e per lb of surplus, about 3.45 */
const USDLB=R.usd*1e9/(R.tons*1e6*2000);                 /* dollars per lb, about 2.71 */
const LBMEAL=1.2;                                         /* assumption for illustration */
const share=id=>ST.find(s=>s.id===id).p;
const NAME=Object.fromEntries(ST.map(s=>[s.id,s.l]));
function flows(sim){const p=sim.p,home=share('home'),rest=TOT-home,adv=atLeast('honors');
 const prev=home*p.prevent/100,don=adv?rest*p.donate/100:0,left=TOT-prev-don,comp=adv?left*p.compost/100:0;
 return {prev,don,comp,land:left-comp,kept:prev+don+comp};}
const RUNGS=[['prev','Prevent'],['don','Donate'],[null,'Upcycle'],[null,'Feed animals'],[null,'Leave unharvested'],[null,'Anaerobic digestion'],['comp','Compost'],[null,'Other options'],['land','Landfill'],[null,'Incinerate']];
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* shown: the household numbers the student works out. They stay hidden until the gut is locked and the calculation is checked. */
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.st&&sim.st.rev)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
function clearGut(sim){const S=sim.gutS;if(S&&!(sim.guide&&sim.guide.keep)&&(S.g||S.m)){S.g=null;S.m=null;if(sim.ui)sim.ui.calc=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
let REF=null;
const homeLb=sim=>R.lbpp*share('home')/100*sim.p.family;
const ppl=n=>n+(n===1?' person':' people');
const $0=v=>'$'+f0(v);

const SIM={
 id:'foodmath',hash:'foodmath',apUnit:4,order:2,tab:'Food math',kind:'Simulation',prereq:['claims'],
 skills:{bio:'Percent of a quantity and unit rates: 412 lb × 33.5% × people · Algebra 1 (Unit 2: proportions), AP Environmental Science',
  honors:'Percents of percents along a chain, and unit rates ($ per lb) · Algebra 1 (Unit 2), AP Environmental Science',
  ap:'Unit conversion and scaling from 100 lb to the whole U.S. · Algebra 1 (Unit 2), AP Environmental Science'},
 card:'Work out how many pounds of surplus food a household makes at home from ReFED’s per-person rate, then follow 100 pounds of it up the EPA Wasted Food Scale.',
 title:'Food math: where 100 pounds of surplus food goes',
 lede:{bio:'Almost a third of U.S. food goes unsold or uneaten: about 412 lb per person a year. A percent of that rate, times the people in a household, gives one household’s share. Estimate it, work it out, then see what keeps the most out of the trash.',
  honors:'EPA’s Wasted Food Scale ranks what to do with surplus food, from preventing it to landfilling it. Move pounds up the scale and watch the meals, dollars and emissions.',
  ap:'Scale your choices from 100 pounds to the whole U.S. with ReFED’s totals: 70 million tons, $380B and 219 million metric tons of CO₂e a year.'},
 scale:'100 pounds of U.S. surplus food, split by where it happens (ReFED, 2024 data). Nationally: 70 million tons a year, about 412 lb per person.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your choices',
 controls:[
  {id:'guess',label:'Your gut: home surplus for this household, lb a year',type:'range',min:0,max:1200,step:10,def:100,unit:' lb'},
  {id:'family',label:'People in the household',type:'range',min:1,max:8,step:1,def:4,unit:'',noGut:true,onChange:clearGut,help:'Used only to size the household’s share. It stays in your browser.'},
  {id:'prevent',label:'Prevent at home: share of household surplus',type:'range',min:0,max:50,step:5,def:0,unit:'%',noGut:true,help:'Prevention means food never becomes surplus: meals planned ahead, food bought that gets eaten, leftovers eaten.'},
  {id:'donate',label:'Donate: share of surplus at farms, factories, restaurants and stores',type:'range',min:0,max:30,step:5,def:0,unit:'%',lvl:'honors',noGut:true},
  {id:'compost',label:'Compost: share of what is left',type:'range',min:0,max:100,step:10,def:0,unit:'%',lvl:'honors',noGut:true}
 ],
 actions:[{id:'reveal',label:'Show the household numbers',run(sim){sim.st.rev=true;}}],
 init(sim){REF=sim;return {rev:false};},step(){},
 metrics:[
  {id:'kept',label:'Pounds kept out of landfill, of 100',unit:'lb',d:1,min:0,max:100,get:sim=>flows(sim).kept},
  {id:'prev',label:'Prevented at home, of 100',unit:'lb',d:1,min:0,max:20,get:sim=>flows(sim).prev},
  {id:'save',label:'The household could save a year',unit:'$',d:0,min:0,max:2000,get:sim=>shown(sim)?homeLb(sim)*sim.p.prevent/100*USDLB:null},
  {id:'home',label:'The household’s home surplus a year',unit:'lb',d:0,min:0,max:1200,get:sim=>shown(sim)?homeLb(sim):null},
  {id:'meals',label:'Meals from donated food, of 100 lb',unit:'meals',d:1,lvl:'honors',min:0,max:20,get:sim=>flows(sim).don/LBMEAL},
  {id:'comp',label:'Composted instead of landfilled',unit:'lb',d:1,lvl:'honors',min:0,max:100,get:sim=>flows(sim).comp},
  {id:'co2',label:'CO₂e avoided by preventing, of 100 lb',unit:'lb',d:1,lvl:'ap',min:0,max:60,get:sim=>flows(sim).prev*CO2LB},
  {id:'usKept',label:'Same choices, whole U.S.: kept out of landfill',unit:'million tons',d:1,lvl:'ap',min:0,max:70,get:sim=>R.tons*flows(sim).kept/TOT},
  {id:'usCO2',label:'Whole U.S.: CO₂e avoided by preventing',unit:'MMT',d:1,lvl:'ap',min:0,max:50,get:sim=>R.co2*flows(sim).prev/TOT}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const sh=shown(sim),S=GS(sim),F=flows(sim),big=k>1.3,BOT=big?318:352;
  /* left: where the 100 lb happens */
  txt(ctx,'100 lb of surplus, by stage',20,22,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  const L=20,LW=360,top=40+6*k,rh=(BOT-top)/5,bh=Math.min(20,rh*0.36),BX=L,BW=LW-70;
  ST.forEach((s,i)=>{const y=top+i*rh,home=s.id==='home';
   txt(ctx,s.l,L,y+12*k*0.5,{s:12*k,w:700,c:home?PAL['s1']:PAL['cv-ink'],b:'middle'});
   const by=y+12*k+5;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,BX,by,BW,bh,5);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
   ctx.fillStyle=home?PAL['s1']:PAL['s6'];rr(ctx,BX,by,BW*s.p/40,bh,5);ctx.fill();txt(ctx,f1(s.p)+' lb',BX+BW*s.p/40+8,by+bh/2,{s:12*k,w:700,b:'middle'});});
  /* right: the EPA Wasted Food Scale */
  const RX=410;txt(ctx,'EPA Wasted Food Scale',RX,22,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  txt(ctx,'best',788,22,{s:12*k,c:PAL['s3'],a:'right',b:'middle'});
  ctx.font='700 '+(12*k)+'px '+FONT;const lw=Math.max(...RUNGS.map(r=>ctx.measureText(r[1]).width))+10;
  const gt=40+6*k,gh=(BOT-gt)/RUNGS.length,gx=RX+lw,gw=780-gx-60*Math.min(k,1.4);
  RUNGS.forEach(([key,lab],i)=>{const y=gt+i*gh+gh/2,v=key?F[key]:0,col=key==='prev'?PAL['s3']:key==='don'?PAL['s2']:key==='comp'?PAL['s6']:key==='land'?PAL['s1']:PAL['cv-soft'];
   const live=key&&(key!=='don'&&key!=='comp'||atLeast('honors'));
   txt(ctx,lab,RX,y,{s:Math.min(12*k,gh*0.8),w:live?700:400,c:live?PAL['cv-ink']:PAL['cv-soft'],b:'middle'});
   ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(gx,y-gh*0.3,gw,gh*0.6);
   if(v>0.05){ctx.fillStyle=col;ctx.fillRect(gx,y-gh*0.3,Math.max(2,gw*v/TOT),gh*0.6);txt(ctx,f1(v),gx+Math.max(2,gw*v/TOT)+6,y,{s:Math.min(12*k,gh*0.8),w:700,b:'middle'});}});
  txt(ctx,'worst',RX-8,BOT-gh/2,{s:12*k,c:PAL['s1'],a:'right',b:'middle'});
  /* footer: the household calculation, then the scaling chain */
  const fam=sim.p.family,hl=homeLb(sim);let fy=BOT+20*k;
  const head=big?`${ppl(fam)}: 412 × 0.335 × ${fam}`:`This household (${ppl(fam)}): 412 lb × 33.5% × ${fam}`;
  if(sh)txt(ctx,`${head} = ${f0(hl)} lb a year, × $2.71/lb ≈ ${$0(hl*USDLB)}`,20,fy,{s:13*k,w:700,c:PAL['s1'],b:'middle'});
  else txt(ctx,`${head} = ? lb a year`+(S&&S.g?'':big?'':'  (lock in your gut first)'),20,fy,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  if(S&&S.g&&sh&&!big){const gl=`Your gut: ${f0(S.g.guess)} lb`;txt(ctx,gl,780,fy,{s:12*k,w:700,c:PAL['s4'],a:'right',b:'middle'});}
  fy+=22*k;
  const chain=F.prev>0.05?`Prevent ${f0(sim.p.prevent)}% at home: 33.5 × ${(sim.p.prevent/100).toFixed(2)} = ${f1(F.prev)} lb of 100, × 3.45 lb CO₂e/lb ≈ ${f0(F.prev*CO2LB)} lb CO₂e`:`Kept out of landfill: ${f1(F.kept)} lb of 100.`;
  txt(ctx,big&&F.prev>0.05?`Prevent ${f0(sim.p.prevent)}%: ${f1(F.prev)} lb of 100 ≈ ${f0(F.prev*CO2LB)} lb CO₂e`:chain,20,fy,{s:12*k,c:PAL['cv-ink'],b:'middle'});
  if(F.kept>0.05&&F.prev>0.05&&!big){fy+=18*k;if(fy<444)txt(ctx,`Kept out of landfill: ${f1(F.kept)} lb of 100`,20,fy,{s:12*k,c:PAL['s3'],w:700,b:'middle'});}},
 narrate(sim){const F=flows(sim),p=sim.p,hl=homeLb(sim);
  if(!shown(sim))return `ReFED counts about <b>412 lb of surplus food per person a year</b>, and <b>33.5%</b> of it happens at home. For ${ppl(p.family)}, how many pounds of home surplus is that a year? Your gut right now: <b>${f0(p.guess)} lb</b>.`;
  let t=`This household’s share: 412 × 0.335 × ${p.family} = <b>${f0(hl)} lb a year</b>, worth about ${$0(hl*USDLB)}.`;
  if(F.kept<0.05)return t+` With no changes, all 100 lb land at the bottom of the scale in this model, where food rots without oxygen and makes methane.`;
  if(F.prev>0)t+=` Preventing ${f1(F.prev)} lb of every 100 at home saves its whole footprint, about ${f1(F.prev*CO2LB)} lb of CO₂e.`;
  if(F.don>0)t+=` Donating ${f1(F.don)} lb feeds people: about ${f1(F.don/LBMEAL)} meals.`;if(F.comp>0)t+=` Composting ${f1(F.comp)} lb keeps it out of the landfill.`;return t;},
 gut:{better:'lower',controls:['guess'],
  get ask(){const n=REF&&REF.p?REF.p.family:4;return {bio:`ReFED counts about 412 lb of surplus food per person a year, and 33.5% of it happens at home. For a household of ${ppl(n)}, drag the slider here to your quick estimate of the pounds of home surplus a year. Then lock it in.`,
   honors:`Estimate first: ReFED’s 412 lb per person a year, 33.5% of it at home, for a household of ${ppl(n)}. Drag the slider to your estimate in pounds a year, then lock it in.`};},
  hint:{bio:'Lock in your estimate. Then you will work out the exact number yourself.'},
  lock(sim){return {guess:sim.p.guess,v:Math.abs(sim.p.guess-homeLb(sim)),label:`${f0(sim.p.guess)} lb a year`};},
  solve(sim){const h=homeLb(sim);sim.p.guess=Math.round(h/10)*10;sim.st.rev=true;return {guess:h,v:0,label:`${f0(h)} lb a year (412 × 0.335 × ${sim.p.family})`};},
  calc:{unit:'lb',d:0,tol:a=>Math.max(2,0.01*a),
   prompt:{bio:sim=>`ReFED: about <b>412 lb</b> of surplus food per person a year, and <b>33.5%</b> of all surplus happens at home. How many pounds of home surplus is that a year for a household of <b>${ppl(sim.p.family)}</b>?`,
    ap:sim=>`ReFED: 70 million tons of surplus a year is about 412 lb per person, and homes are 33.5 of every 100.1 lb by stage (the shares round to 100.1%). Using 412 lb and 33.5%, find a year’s home surplus for ${ppl(sim.p.family)}.`},
   answer:sim=>homeLb(sim),
   hint:'Write 33.5% as 0.335. Multiply 412 by 0.335 to get one person’s home share, then multiply by the number of people.',
   steps(sim){const n=sim.p.family,h=homeLb(sim);return [`One person’s home share: 412 × 0.335 = 138.02 lb a year.`,`For ${ppl(n)}: 138.02 × ${n} = <b>${f0(h)} lb</b> a year (${h.toFixed(2)}).`,`At ReFED’s average of $380B ÷ 140 billion lb ≈ $2.71 a pound, that is about ${$0(h*USDLB)} a year.`];}},
  formula(sim){const n=sim.p.family,h=homeLb(sim);let t=`Home surplus = 412 lb × 0.335 × ${n} = ${f0(h)} lb a year; × $2.71/lb ≈ ${$0(h*USDLB)}`;
   if(atLeast('ap'))t+=`<br>$ per lb = $380B ÷ (70 million tons × 2,000 lb) ≈ $2.71; CO₂e per lb = 219 MMT ÷ (70 million tons × 0.907) ≈ 3.45`;return t;},
  how:{bio:'Percent of a quantity, then a unit rate: one person’s home share is 412 × 0.335 lb, times the people in the household. Multiply by the dollars per pound to price it.',ap:'Home surplus = rate per person × home share × people. Dollars and CO₂e per pound are ReFED’s national totals divided by 70 million tons in pounds.'},
  compare(sim,g,m){const n=sim.p.family,h=homeLb(sim),off=Math.abs(g.guess-h);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also worked it out yourself, so you can size any household this way.':'';
   const tail=` Homes are the biggest single stage, 33.5 lb of every 100, ahead of farms (24.2 lb).`;
   if(off<=Math.max(20,0.05*h))return `Your estimate was right on: within ${f0(off)} lb of ${f0(h)} lb a year for ${ppl(n)}.`+tail+self;
   return `Your estimate was off by <b>${f0(off)} lb a year</b>: you said ${f0(g.guess)} lb, and 412 × 0.335 × ${n} = <b>${f0(h)} lb</b>. At $2.71 a pound, that gap is about <b>${$0(off*USDLB)}</b> worth of food.`+tail+self;},
  again(sim){sim.p.family=1+Math.floor(Math.random()*8);sim.p.guess=100;sim.st.rev=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Out of every 100 lb of surplus food, 33.5 lb happens at home. If homes prevented 25% of their surplus, how many pounds of every 100 would never become waste?',answer:33.5*0.25,tol:0.05,unit:'lb',d:2,hint:'25% is 0.25. Multiply 33.5 by 0.25.',explain:'33.5 × 0.25 = 8.375, about 8.4 lb of every 100. At about 3.45 lb of CO₂e per pound, that is about 29 lb of CO₂e that never happens.'},
  {lvl:'bio',instant:true,q:'A household of 4 makes about 552 lb of home surplus a year. ReFED’s average value of surplus food is about $2.71 a pound. About how much is that food worth?',choices:['About $150','About $1,500','About $15,000'],correct:1,explain:'552 × $2.71 ≈ $1,496, about $1,500 a year. $2.71 is a national average across all surplus, so a real household’s number can differ.'},
  {lvl:'honors',instant:true,q:'Out of 100 lb of surplus, 66.6 lb happens at farms, factories, restaurants and stores. If 20% of that were donated, about how much food would go to people?',choices:['About 7 lb','About 13 lb','About 20 lb'],correct:1,explain:'66.6 × 0.20 ≈ 13.3 lb. At 1.2 lb per meal (an assumption), that is about 11 meals from every 100 lb of surplus.'},
  {lvl:'honors',instant:true,q:'Why is food in a landfill worse for the climate than the same food in a compost pile?',choices:['In a landfill it is buried without oxygen, so microbes break it down into methane, a powerful greenhouse gas; compost piles get oxygen','Compost gives off no gases at all','Landfills burn food'],correct:0,explain:'Anaerobic decomposition makes methane. EPA reports food is 24% of what goes into landfills and 58% of landfill methane emissions.'},
  {lvl:'ap',instant:true,q:'ReFED: surplus food carries 219 million metric tons of CO₂e, from 70 million U.S. tons of food. About how many pounds of CO₂e per pound of surplus food?',choices:['About 0.3','About 3.4','About 34'],correct:1,explain:'70 million short tons × 0.907 = 63.5 million metric tons. 219 ÷ 63.5 ≈ 3.45 lb of CO₂e per lb of food, on average.'},
  {lvl:'ap',instant:true,q:'If U.S. homes prevented 25% of their surplus, about how many tons of food is that a year?',choices:['About 0.6 million tons','About 5.9 million tons','About 17.5 million tons'],correct:1,explain:'70 million × 0.335 × 0.25 ≈ 5.86 million tons. At the average footprint that is about 18 million metric tons of CO₂e.'}
 ],
 tour:[
  {title:'100 pounds',text:'Picture 100 pounds of U.S. food that goes unsold or uneaten. On the left, ReFED splits it by where it happens, from farm fields to home kitchens.',focus:[0,0,400,360],pause:true,setup:sim=>BioLab.setValues(sim,{prevent:0,donate:0,compost:0})},
  {title:'Homes are the biggest stage',text:'Homes account for 33.5 lb of every 100, more than farms (24.2), food factories (18.8), restaurants and cafeterias (17.9) or grocery stores (5.7). That 33.5% is the percent in your household calculation.',focus:[0,36,400,80],pause:true},
  {title:'From a rate to a household',text:'412 lb per person × 0.335 = 138.02 lb of home surplus per person a year. A household of 4: 138.02 × 4 ≈ 552 lb, worth about $1,500 at $2.71 a pound.',focus:[0,340,800,110],pause:true,setup:sim=>BioLab.setValues(sim,{family:4})},
  {title:'The Wasted Food Scale',text:'EPA ranks what to do with surplus food, best at the top. In this model, with no changes, all of it lands at the bottom: landfill.',focus:[400,0,400,360],pause:true},
  {title:'Prevent at home',text:'Prevent a quarter of home surplus: 33.5 × 0.25 ≈ 8.4 lb of every 100 never becomes waste. × 3.45 lb CO₂e per lb ≈ 29 lb of CO₂e saved. For a household of 4: 552 × 0.25 × $2.71 ≈ $375 a year.',pause:true,setup:sim=>BioLab.setValues(sim,{prevent:25})},
  {lvl:'honors',title:'Donate',text:'Donate 20% of the surplus at farms, factories, restaurants and stores: 13.3 lb goes to people, about 11 meals at 1.2 lb a meal.',pause:true,setup:sim=>BioLab.setValues(sim,{donate:20})},
  {lvl:'honors',title:'Compost the rest',text:'Compost half of what is left: 39.2 lb stays out of the landfill. Buried food rots without oxygen and makes methane; food is 58% of landfill methane.',pause:true,setup:sim=>BioLab.setValues(sim,{compost:50})},
  {stn:{rings:[[402,49,388,24],[402,79,388,24],[402,233,388,24]],card:{x:410,y:103,w:375,title:'Where could each one act?',lines:['Laudato Si’ (2015) names a “throwaway culture.”','A household: prevent (8.4 lb of every 100 here).','A school or business: donate (13.3 lb).','Anyone: compost instead of landfill (39.2 lb).']}},title:'A named source',text:'Pope Francis’s encyclical Laudato Si’ (2015) warns against a “throwaway culture.” Question for discussion: by this math, where in the food system could a household, a school or a business act on that?',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much can one household change?</p><ol><li>Set a household size. Work out the home surplus a year by hand (412 × 0.335 × people), then check it with the tile.</li><li>Set prevention to 10%, 25% and 50%. Record the pounds prevented and the dollars saved.</li></ol><p>Write one sentence: how do the pounds and the dollars change as prevention goes from 10% to 50%, and why is the change a straight line?</p>',
  honors:'<p><b>Question:</b> Which action keeps the most food out of landfill?</p><ol><li>Try each action alone at its maximum: prevent 50%, donate 30%, compost 100%.</li><li>Record pounds kept out of landfill and meals for each.</li><li>Explain why the scale ranks prevention above composting even when composting moves more pounds.</li></ol>',
  ap:'<p><b>Question:</b> What would a national goal take?</p><ol><li>Find a combination that keeps 25 million tons out of landfill nationally.</li><li>Record the CO₂e avoided by prevention and compare it with 219 MMT, 3.5% of U.S. emissions.</li></ol><p><b>CER:</b> Claim, evidence from the model, and reasoning about its assumptions.</p>'},
 terms:[
  {t:'Surplus food',d:'Food that goes unsold or uneaten, whether it is later donated, composted or thrown away. ReFED’s term.'},
  {t:'Wasted Food Scale',d:'EPA’s ranking of what to do with surplus food, from preventing it (best) to landfilling or incinerating it (worst).'},
  {t:'Methane',d:'A greenhouse gas made when organic matter breaks down without oxygen, as in a landfill.',lvl:'honors'},
  {t:'Anaerobic',d:'Without oxygen. Landfills and digesters are anaerobic; a well-turned compost pile is aerobic.',lvl:'honors'},
  {t:'CO₂e',d:'Carbon dioxide equivalent: greenhouse gases converted to the amount of CO₂ with the same warming effect.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> ReFED 2026 food waste report, 2024 data (refed.org/uploads/2026-food-waste-report-design-final-1.pdf): 70 million tons of surplus food, 29% of the U.S. food supply, about 412 lb per person, worth $380B, with 219 million metric tons of CO₂e (3.5% of U.S. emissions). Surplus by stage: households 33.5%, farms 24.2%, manufacturing 18.8%, food service 17.9%, retail 5.7% (they add to 100.1% because of rounding). EPA Wasted Food Scale, from most to least preferred: prevent; donate; upcycle; feed animals; leave unharvested; anaerobic digestion with use; compost; other options; landfill; incinerate. EPA: food is 24% of material landfilled and 58% of landfill methane emissions.</p>'+
  '<p><b>Model.</b> Prevention applies to home surplus. Donation applies to surplus at farms, factories, food service and stores. Composting applies to what is left. Everything else goes to the bottom of the scale; in reality some surplus already goes to animal feed, compost and digesters, so this overstates the landfill share. The footprint per pound (about 3.45 lb CO₂e) and value per pound (about $2.71) are ReFED’s totals divided by 70 million U.S. short tons, so they are averages across all surplus, not just home food. Only prevention is credited with avoiding that footprint. 1.2 lb per meal is an assumption for illustration. Household numbers stay in your browser.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>412 lb per person is a national average: total surplus divided by everyone. Real households range widely. The 412 lb also covers every stage, from farms to stores, so a household’s own share is the 33.5% that happens at home.</li><li>$2.71 a pound and 3.45 lb of CO₂e a pound average all surplus together. A pound of beef and a pound of lettuce differ a lot in both.</li><li>Surplus counts food that is later donated, composted or fed to animals, not only food thrown in the trash.</li></ul>'+
  '<p><b>A named source.</b> Pope Francis’s encyclical Laudato Si’ (2015) frames care for creation as a moral duty and criticizes a “throwaway culture.” In APES terms: decomposition without oxygen makes methane, and preventing waste saves the land, water and energy used to grow it. Question for discussion: which rungs of the scale could a household, a school and a business each reach?</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
