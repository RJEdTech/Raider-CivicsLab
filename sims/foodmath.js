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
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.st&&sim.st.rev)return true;const S=sim.gutS;return !!(S&&S.g);}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
const homeLb=sim=>R.lbpp*share('home')/100*sim.p.family;

const SIM={
 id:'foodmath',hash:'foodmath',apUnit:4,order:2,tab:'Food math',kind:'Simulation',prereq:['claims'],
 card:'Follow 100 pounds of surplus U.S. food from farm to fork, guess where most of it is lost, then choose what to do about it.',
 title:'Food math: where 100 pounds of surplus food goes',
 lede:{bio:'Almost a third of U.S. food goes unsold or uneaten. Follow 100 pounds of it. Guess where most of it is lost, then see how much you can keep out of the trash.',
  honors:'EPA’s Wasted Food Scale ranks what to do with surplus food, from preventing it to landfilling it. Move pounds up the scale and watch the meals, dollars and emissions.',
  ap:'Scale your choices from 100 pounds to the whole U.S. with ReFED’s totals: 70 million tons, $380B and 219 million metric tons of CO₂e a year.'},
 scale:'100 pounds of U.S. surplus food, split by where it happens (ReFED, 2024 data). Nationally: 70 million tons a year, about 412 lb per person.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your choices',
 controls:[
  {id:'pick',label:'Where is the most surplus food?',type:'seg',def:'farm',options:ST.map(s=>({v:s.id,l:s.l}))},
  {id:'family',label:'People in your household',type:'range',min:1,max:8,step:1,def:4,unit:'',noGut:true,help:'Used only to size your household’s share. It stays in your browser.'},
  {id:'prevent',label:'Prevent at home: share of household surplus',type:'range',min:0,max:50,step:5,def:0,unit:'%',noGut:true,help:'Plan meals, buy what you will eat, eat leftovers.'},
  {id:'donate',label:'Donate: share of surplus at farms, factories, restaurants and stores',type:'range',min:0,max:30,step:5,def:0,unit:'%',lvl:'honors',noGut:true},
  {id:'compost',label:'Compost: share of what is left',type:'range',min:0,max:100,step:10,def:0,unit:'%',lvl:'honors',noGut:true}
 ],
 actions:[{id:'reveal',label:'Show the stages',run(sim){sim.st.rev=true;}}],
 init(){return {rev:false};},step(){},
 metrics:[
  {id:'kept',label:'Pounds kept out of landfill, of 100',unit:'lb',d:1,min:0,max:100,get:sim=>shown(sim)?flows(sim).kept:null},
  {id:'prev',label:'Prevented at home',unit:'lb',d:1,min:0,max:20,get:sim=>shown(sim)?flows(sim).prev:null},
  {id:'save',label:'Your household could save a year',unit:'$',d:0,min:0,max:2000,get:sim=>shown(sim)?homeLb(sim)*sim.p.prevent/100*USDLB:null},
  {id:'home',label:'Your household’s home surplus a year',unit:'lb',d:0,min:0,max:1200,get:sim=>shown(sim)?homeLb(sim):null},
  {id:'meals',label:'Meals from donated food, of 100 lb',unit:'meals',d:1,lvl:'honors',min:0,max:20,get:sim=>shown(sim)?flows(sim).don/LBMEAL:null},
  {id:'comp',label:'Composted instead of landfilled',unit:'lb',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?flows(sim).comp:null},
  {id:'co2',label:'CO₂e avoided by preventing, of 100 lb',unit:'lb',d:1,lvl:'ap',min:0,max:60,get:sim=>shown(sim)?flows(sim).prev*CO2LB:null},
  {id:'usKept',label:'Same choices, whole U.S.: kept out of landfill',unit:'million tons',d:1,lvl:'ap',min:0,max:70,get:sim=>shown(sim)?R.tons*flows(sim).kept/TOT:null},
  {id:'usCO2',label:'Whole U.S.: CO₂e avoided by preventing',unit:'MMT',d:1,lvl:'ap',min:0,max:50,get:sim=>shown(sim)?R.co2*flows(sim).prev/TOT:null}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const sh=shown(sim),S=GS(sim),F=flows(sim);
  /* left: where the 100 lb happens */
  txt(ctx,'100 lb of surplus, by stage',20,22,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  const L=20,LW=360,top=46+6*k,rh=(392-top)/5,bh=Math.min(22,rh*0.42),BX=L,BW=LW-70;
  ST.forEach((s,i)=>{const y=top+i*rh,isPick=sim.p.pick===s.id,isGut=S&&S.g&&S.g.pick===s.id;
   txt(ctx,s.l,L,y+12*k*0.5,{s:12*k,w:700,c:isPick?PAL['s4']:PAL['cv-ink'],b:'middle'});
   const by=y+12*k+6;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,BX,by,BW,bh,5);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
   if(sh){ctx.fillStyle=s.id==='home'?PAL['s1']:PAL['s6'];rr(ctx,BX,by,BW*s.p/40,bh,5);ctx.fill();txt(ctx,f1(s.p)+' lb',BX+BW*s.p/40+8,by+bh/2,{s:12*k,w:700,b:'middle'});}
   else txt(ctx,'?',BX+BW/2,by+bh/2,{s:13*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});
   if(isPick){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;rr(ctx,BX-3,by-3,BW+6,bh+6,7);ctx.stroke();}
   if(isGut&&!isPick){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([4,3]);ctx.lineWidth=2;rr(ctx,BX-3,by-3,BW+6,bh+6,7);ctx.stroke();ctx.setLineDash([]);}});
  /* right: the EPA Wasted Food Scale */
  const RX=410;txt(ctx,'EPA Wasted Food Scale',RX,22,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  txt(ctx,'best',788,22,{s:12*k,c:PAL['s3'],a:'right',b:'middle'});
  ctx.font='700 '+(12*k)+'px '+FONT;const lw=Math.max(...RUNGS.map(r=>ctx.measureText(r[1]).width))+10;
  const gt=46+6*k,gh=(392-gt)/RUNGS.length,gx=RX+lw,gw=780-gx-60*Math.min(k,1.4);
  RUNGS.forEach(([key,lab],i)=>{const y=gt+i*gh+gh/2,v=key?F[key]:0,col=key==='prev'?PAL['s3']:key==='don'?PAL['s2']:key==='comp'?PAL['s6']:key==='land'?PAL['s1']:PAL['cv-soft'];
   const live=key&&(key!=='don'&&key!=='comp'||atLeast('honors'));
   txt(ctx,lab,RX,y,{s:12*k,w:live?700:400,c:live?PAL['cv-ink']:PAL['cv-soft'],b:'middle'});
   ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(gx,y-gh*0.3,gw,gh*0.6);
   if(sh&&v>0.05){ctx.fillStyle=col;ctx.fillRect(gx,y-gh*0.3,Math.max(2,gw*v/TOT),gh*0.6);txt(ctx,f1(v),gx+Math.max(2,gw*v/TOT)+6,y,{s:12*k,w:700,b:'middle'});}});
  txt(ctx,'worst',788,392+4,{s:12*k,c:PAL['s1'],a:'right',b:'top'});
  /* footer */
  const fy=410+6*k;txt(ctx,sh?`Kept out of landfill: ${f1(F.kept)} lb of 100`:'Lock in your guess to see the pounds.',20,fy,{s:13*k,w:700,c:sh?PAL['s3']:PAL['cv-soft'],b:'middle'});},
 narrate(sim){const F=flows(sim),p=sim.p;
  if(!shown(sim))return `Of every 100 lb of U.S. surplus food, which stage loses the most? Your pick right now: <b>${NAME[p.pick]}</b>. Lock it in to see the pounds.`;
  if(F.kept<0.05)return `Homes lose the most: <b>33.5 lb of every 100</b>. With no changes, all of it lands at the bottom of the scale in this model. Landfilled food rots without oxygen and makes methane: food is 58% of landfill methane.`;
  let t=`You keep <b>${f1(F.kept)} lb of 100</b> out of landfill.`;if(F.prev>0)t+=` Preventing ${f1(F.prev)} lb at home saves its whole footprint, about ${f1(F.prev*CO2LB)} lb of CO₂e.`;
  if(F.don>0)t+=` Donating ${f1(F.don)} lb feeds people: about ${f1(F.don/LBMEAL)} meals.`;if(F.comp>0)t+=` Composting ${f1(F.comp)} lb keeps it out of the landfill, where it would make methane.`;return t;},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'Of all the U.S. food that goes unsold or uneaten, where do you think the most is lost? Pick one here, then lock it in.',honors:'Before you see ReFED’s numbers: which stage of the food system has the biggest share of surplus food? Pick one, then lock it in.'},
  lock(sim){return {pick:sim.p.pick,v:share(sim.p.pick),label:`${NAME[sim.p.pick]} (${f1(share(sim.p.pick))} lb of every 100)`};},
  solve(sim){const b=ST.reduce((a,s)=>s.p>a.p?s:a);sim.p.pick=b.id;sim.st.rev=true;return {pick:b.id,v:b.p,label:`${b.l}: ${f1(b.p)} lb of every 100`};},
  how:{bio:'ReFED adds up surplus food at every stage, from farm fields to your fridge. Homes are the biggest single stage: about a third of all of it.',ap:'ReFED stage shares (2024 data): homes 33.5%, farms 24.2%, manufacturing 18.8%, food service 17.9%, retail 5.7%.'},
  compare(sim,g,m){const fam=sim.p.family,hl=homeLb(sim),usd=hl*USDLB;
   if(g.pick===m.pick)return `Your gut was right on: homes, ${f1(m.v)} lb of every 100. For a household of ${fam}, that share is about <b>${f0(hl)} lb a year</b>, worth about <b>$${f0(usd)}</b> at the average value of surplus food. That is the part you control directly.`;
   return `You picked ${g.label.split(' (')[0].toLowerCase()}: ${f1(g.v)} lb of every 100. Homes lose <b>${f1(m.v)} lb</b>, ${f1(m.v-g.v)} lb more. For a household of ${fam}, the home share is about <b>${f0(hl)} lb a year</b>, worth about <b>$${f0(usd)}</b>. The biggest stage is the one you control directly.`;},
  again(sim){sim.p.pick=['farm','mfg','fs','retail'][Math.floor(Math.random()*4)];sim.p.family=1+Math.floor(Math.random()*6);sim.st.rev=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'ReFED estimates about 412 lb of surplus food per person per year, and 33.5% of surplus happens at home. About how much home surplus is that for a household of 4?',choices:['About 140 lb a year','About 550 lb a year','About 1,650 lb a year'],correct:1,explain:'412 × 0.335 ≈ 138 lb per person. Times 4 people ≈ 552 lb a year: more than a pound and a half a day.'},
  {lvl:'bio',instant:true,q:'On EPA’s Wasted Food Scale, which is the best thing to do with surplus food?',choices:['Compost it','Prevent it from becoming surplus at all','Send it to a landfill that captures gas'],correct:1,explain:'Prevention is at the top: food that is never wasted never needs land, water, fuel and labor to grow, ship and dispose of. Donating comes next. Landfill is near the bottom.'},
  {lvl:'honors',instant:true,q:'Why is food in a landfill worse for the climate than the same food in a compost pile?',choices:['In a landfill it is buried without oxygen, so microbes break it down into methane, a powerful greenhouse gas; compost piles get oxygen','Compost gives off no gases at all','Landfills burn food'],correct:0,explain:'Anaerobic decomposition makes methane. EPA reports food is 24% of what goes into landfills and 58% of landfill methane emissions.'},
  {lvl:'honors',instant:true,q:'Out of 100 lb of surplus, 66.6 lb happens at farms, factories, restaurants and stores. If 20% of that were donated, about how much food would go to people?',choices:['About 7 lb','About 13 lb','About 20 lb'],correct:1,explain:'66.6 × 0.20 ≈ 13.3 lb. At 1.2 lb per meal (an assumption), that is about 11 meals from every 100 lb of surplus.'},
  {lvl:'ap',instant:true,q:'ReFED: surplus food carries 219 million metric tons of CO₂e, from 70 million U.S. tons of food. About how many pounds of CO₂e per pound of surplus food?',choices:['About 0.3','About 3.4','About 34'],correct:1,explain:'70 million short tons × 0.907 = 63.5 million metric tons. 219 ÷ 63.5 ≈ 3.45 lb of CO₂e per lb of food, on average.'},
  {lvl:'ap',instant:true,q:'If U.S. homes prevented 25% of their surplus, about how many tons of food is that a year?',choices:['About 0.6 million tons','About 5.9 million tons','About 17.5 million tons'],correct:1,explain:'70 million × 0.335 × 0.25 ≈ 5.86 million tons. At the average footprint that is about 18 million metric tons of CO₂e.'}
 ],
 tour:[
  {title:'100 pounds',text:'Picture 100 pounds of U.S. food that goes unsold or uneaten. On the left, ReFED splits it by where it happens, from farm fields to home kitchens.',focus:[0,0,400,400],pause:true,setup:sim=>BioLab.setValues(sim,{prevent:0,donate:0,compost:0})},
  {title:'Homes lose the most',text:'Homes account for 33.5 lb of every 100, more than farms (24.2), food factories (18.8), restaurants and cafeterias (17.9) or grocery stores (5.7).',focus:[0,40,400,90],pause:true},
  {title:'The Wasted Food Scale',text:'EPA ranks what to do with surplus food, best at the top. In this model, with no changes, all of it lands at the bottom: landfill.',focus:[400,0,400,410],pause:true},
  {title:'Prevent at home',text:'Prevent a quarter of home surplus: 8.4 lb of every 100 never becomes waste. That saves its whole footprint, about 29 lb of CO₂e, and for a household of 4, about $375 a year.',pause:true,setup:sim=>BioLab.setValues(sim,{prevent:25})},
  {lvl:'honors',title:'Donate',text:'Donate 20% of the surplus at farms, factories, restaurants and stores: 13.3 lb goes to people, about 11 meals at 1.2 lb a meal.',pause:true,setup:sim=>BioLab.setValues(sim,{donate:20})},
  {lvl:'honors',title:'Compost the rest',text:'Compost half of what is left: 39.2 lb stays out of the landfill. Buried food rots without oxygen and makes methane; food is 58% of landfill methane.',pause:true,setup:sim=>BioLab.setValues(sim,{compost:50})},
  {title:'Care for creation',text:'Pope Francis’s Laudato Si’ (2015) calls us to care for our common home and warns against a “throwaway culture.” The math says the biggest single place to start is your own kitchen.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much can one household change?</p><ol><li>Set your household size. Record your home surplus a year.</li><li>Set prevention to 10%, 25% and 50%. Record the pounds prevented and the dollars saved.</li></ol><p>Write one sentence: what is one change your household could make this week?</p>',
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
  '<p><b>Faith and science.</b> Pope Francis’s encyclical Laudato Si’ (2015) frames care for creation as a moral duty and criticizes a “throwaway culture.” In APES terms: decomposition without oxygen makes methane, and preventing waste saves the land, water and energy used to grow it.</p>'
};
BioLab.register(SIM);
})();
