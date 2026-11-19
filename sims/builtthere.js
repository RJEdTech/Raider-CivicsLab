(function(){
'use strict';
const {txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Invented here, built there (Jason, Nov 19, 2026: "we fund something, but we do not have a market demand for it, someone else sees the
   future and invests"; "what happens when we do not invest in renewables?"; "like with solar energy"; budgets as moral documents).
   Solar: Bell Labs, Murray Hill NJ, first practical silicon solar cell, Apr 25, 1954 (APS News; about 6% efficient). Japan led solar
   electricity until 2005, then Germany. IEA Special Report on Solar PV Global Supply Chains (July 7, 2022): China's share of every
   manufacturing stage exceeds 80%; China invested over $50B in new PV supply capacity since 2011, ten times Europe, and created over
   300,000 manufacturing jobs; China's policies helped cut solar costs by more than 80%; Xinjiang alone about 40% of polysilicon; solar
   exports over $30B in 2021. Canary Media on the IEA report: coal is over 60% of China's power supply.
   LFP: discovered 1995, John Goodenough's team, UT Austin. A123 (MIT spinout, 2001) got a $249M DOE grant (June 2009) for two Michigan
   factories; weak EV demand, Chrysler closed its EV unit, GM chose LG; 2012 recall; bankruptcy Oct 16, 2012; Wanxiang bought it 2013.
   China's 2013 plan: electric city buses, buyer tax breaks, support for battery firms (Bloomberg Businessweek via Autoblog, June 11, 2023).
   BNEF (Dec 2025): pack prices $108/kWh, China $84; North America 44% and Europe 56% higher.
   Sodium-ion: Natron Energy (Stanford spinout, 2012; plant in Holland, MI; $19.8M from ARPA-E) closed Sept 3, 2025 over funding
   (IEEE Spectrum). CATL and Changan unveiled the first mass-produced sodium-ion passenger car, Feb 2026 (CnEVPost).
   Public money risk: Solyndra, $535M loan guarantee, bankrupt 2011. DOE Loan Programs Office: losses about $780M vs. $810M interest by
   late 2014, about 2.3% of over $35B lent (Reuters via Newsweek; PV Tech). Tesla repaid its $465M loan in May 2013, nine years early.
   2025: E2 (a business group that advocates for clean energy), year-end memo (Feb 2026): $34.8B of clean-energy projects cancelled,
   closed or downsized in 2025, 38,031 jobs; $12.3B announced, the lowest since tracking began; nearly $3 abandoned per $1 announced.
   Church: USCCB, letters to Congress (e.g. May 19, 2017; 2018): "the federal budget is a moral document"; Laudato Si' 26 and 165
   (fossil fuels to be progressively replaced without delay; develop renewable sources); 188 (the Church does not settle scientific
   questions or replace politics). */
const SOLAR=80,ANN=12.3,ABN=34.8,RATIO=ABN/ANN;
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,8);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();
 let yy=y+17*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}
const WHO={US:['U.S.','#1f5fbf'],CN:['China','#c8102e'],EU:['Japan, Germany','#6b7079'],NO:['Few buyers','#8a6d3b']};
/* three technologies × four steps: [who, short line, long line] */
const STEPS=['1. Invent it','2. Fund it','3. Buyers','4. Build at scale'];
const ROWS=[
 ['Solar panels',[['US','Bell Labs, 1954','Bell Labs (NJ), 1954'],['US','U.S. research and space','U.S. research, then satellites'],['EU','Japan, then Germany','Japan led to 2005, then Germany'],['CN','China: over 80%','China: over 80% of every stage']]],
 ['LFP car batteries',[['US','UT Austin, 1995','UT Austin, 1995 (Goodenough)'],['US','Grant + investors','$249M DOE grant + $380M stock sale, 2009'],['NO','EV sales weak','Weak EV sales; bankrupt 2012'],['CN','CATL, BYD','China: buses, tax breaks, CATL, BYD']]],
 ['Sodium-ion batteries',[['US','Natron (Stanford)','Natron (Stanford spinout)'],['US','Investors + ARPA-E','Private investors + $19.8M ARPA-E'],['NO','Closed Sept 2025','Closed Sept 2025 over funding'],['CN','CATL cars, 2026','CATL: first mass-made car, 2026']]]
];

const SIM={
 id:'builtthere',hash:'builtthere',apUnit:2,order:8,tab:'Invented here, built there',kind:'Learning tool',prereq:['budget'],next:['milspend'],
 skills:{bio:'Percent of a whole and ratios · Algebra 1 (Unit 2), US Government (Unit 2: the power of the purse), AP Environmental Science (Unit 6: energy), Social Justice (Care for creation)',
  honors:'Reading an advocacy group’s numbers, and weighing a loss rate · Statistics (Chapter 1), AP Macroeconomics (Unit 5: long-run growth)',
  ap:'Expected value of a portfolio of risky bets · AP Statistics (Unit 4), AP Macroeconomics (Unit 5)'},
 card:'The solar cell and the cheap car battery were invented in the U.S. Follow each one from the lab to the factory and find the step where the industry moved to China. Then weigh what public money should bet on.',
 title:'Invented here, built there: solar panels and batteries',
 lede:{bio:'A new technology needs four things: someone to invent it, money to develop it, buyers, and factories that build it cheaply. The U.S. invented solar cells and the cheapest car batteries. Find which step went somewhere else.',
  honors:'Public money funded the invention; private buyers and patient factory investment built the industry. Compare the U.S. and China step by step, and weigh the case against government bets.',
  ap:'Treat public research and loans as a portfolio of risky bets. Compare the losses on the failures with the returns on the whole.'},
 scale:'United States and China, 1954 to 2026. IEA, BloombergNEF, Bloomberg Businessweek, IEEE Spectrum, the Department of Energy, E2 and the USCCB; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: China’s share of the world’s solar panel manufacturing',type:'range',min:0,max:100,step:5,def:40,unit:'%'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'solar',label:'China’s share of each solar manufacturing stage (IEA, 2022)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?SOLAR:null},
  {id:'ratio',label:'2025: clean-energy dollars abandoned per dollar announced (E2)',unit:'',d:1,min:0,max:5,get:s=>shown(s)?RATIO:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.25;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* the four-step grid */
  const X0=14,LW=big?112:120,CW=(W-X0-LW-14)/4,Y0=8,HH=24*k,RH=big?70:70;
  STEPS.forEach((t,j)=>{const on=s===99?sh||j===0:s>=j+1;txt(ctx,t,X0+LW+CW*j+CW/2,Y0+HH/2,{s:14.5*k,w:700,a:'center',b:'middle',c:on?PAL['cv-ink']:PAL['cv-soft']});
   if(j<3)txt(ctx,'→',X0+LW+CW*(j+1),Y0+HH/2,{s:14*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});});
  ROWS.forEach((r,i)=>{const y=Y0+HH+6+i*(RH+6);
   wrap(ctx,r[0],X0,y+18,LW-8,{s:14.5*k,w:700,b:'middle'});
   r[1].forEach((c,j)=>{const on=s===99?(sh||j===0):s>=j+1,x=X0+LW+CW*j+3,w=CW-6;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,RH,8);ctx.fill();
    if(!on){txt(ctx,'?',x+w/2,y+RH/2,{s:16*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});return;}
    const who=WHO[c[0]];ctx.fillStyle=who[1];rr(ctx,x,y,6,RH,3);ctx.fill();
    txt(ctx,who[0],x+12,y+15*k,{s:13*k,w:800,c:who[1],b:'middle'});
    wrap(ctx,big?c[1]:c[2],x+12,y+34*k,w-18,{s:(big?12.5:12.5)*k,b:'middle',lh:14.5*k});});
   if(s===3&&ONT&&i>0)ring(ctx,X0+LW+CW*2,y-3,CW,RH+6);
   if(s===4&&ONT)ring(ctx,X0+LW+CW*3,y-3,CW,RH+6);});
  if(s===1&&ONT)ring(ctx,X0+LW,Y0+HH+3,CW,3*(RH+6));
  if(s===2&&ONT)ring(ctx,X0+LW+CW,Y0+HH+3,CW,3*(RH+6));
  /* lower panel */
  const by=Y0+HH+6+3*(RH+6)+6,bh=H-by-10,half=(W-2*X0-10)/2;
  const gauge=(x,w)=>{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,by,w,bh,10);ctx.fill();txt(ctx,'Solar panels: share made in China',x+12,by+18*k,{s:14*k,w:700,b:'middle'});
   const gx=x+14,gw=w-28,gy=by+56*k;ctx.fillStyle=PAL['cv-bg'];rr(ctx,gx,gy-9,gw,18,6);ctx.fill();
   const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
   if(sh){ctx.fillStyle='#c8102e';rr(ctx,gx,gy-9,gw*SOLAR/100,18,6);ctx.fill();txt(ctx,'over 80% of every stage',gx+gw*SOLAR/100-6,gy,{s:11.5*k,w:800,c:'#fff',a:'right',b:'middle'});}
   if(gv!=null){const gxp=gx+gw*gv/100;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gxp,gy-15);ctx.lineTo(gxp,gy+15);ctx.stroke();txt(ctx,'your gut: '+gv+'%',gxp,gy+26*k,{s:11.5*k,w:700,c:PAL['s4'],a:'center',b:'middle'});}
   [0,50,100].forEach(v=>txt(ctx,v+'%',gx+gw*v/100,gy-18*k,{s:10.5*k,a:'center',b:'middle',c:PAL['cv-soft']}));
   if(sh)wrap(ctx,big?'The cell was invented in New Jersey in 1954.':'The first practical silicon solar cell was made at Bell Labs in New Jersey in 1954. China has invested over $50 billion in solar factories since 2011, ten times Europe (IEA).',gx,gy+46*k,gw,{s:12*k,b:'middle'});};
  const bars=(x,w)=>{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,by,w,bh,10);ctx.fill();txt(ctx,'2025: U.S. clean-energy factories and projects',x+12,by+18*k,{s:13.5*k,w:700,b:'middle'});
   const bx=x+(big?100:116),bw=w-(big?150:170),mx=40,row=(lab,v,col,yy)=>{txt(ctx,lab,x+12,yy,{s:12*k,w:700,b:'middle'});ctx.fillStyle=col;rr(ctx,bx,yy-9,bw*v/mx,18,5);ctx.fill();txt(ctx,'$'+v+'B',bx+bw*v/mx+6,yy,{s:12*k,w:800,b:'middle'});};
   row('Announced',ANN,'#2f9e44',by+48*k);row('Abandoned',ABN,'#c8102e',by+74*k);
   wrap(ctx,big?'≈ $2.8 lost per $1 announced; 38,031 jobs (E2).':'Nearly $3 abandoned for every $1 announced; 38,031 planned jobs (E2, a business group that backs clean energy). Many tax credits were phased out by a July 2025 law.',x+12,by+96*k,w-24,{s:11.5*k,b:'middle'});
   if(s===6&&ONT)ring(ctx,x-4,by-4,w+8,bh+8);};
  if(s===99||s<=5){gauge(X0,half);if(s===99&&sh)bars(X0+half+10,half);
   else if(s===5)box(ctx,k,X0+half+10,by,half,bh,'The missing step',big?['Invention and early money were in the U.S.','Buyers and factories were not.']:['In all three rows, U.S. inventors, government and private investors paid for the early work. The step that moved was buyers and patient factory building.','China paid to create buyers (electric buses, tax breaks) and its companies kept building for a decade.']);
   else box(ctx,k,X0+half+10,by,half,bh,'Four things a new technology needs',big?['Invent, fund, buyers, factories.']:['Someone to invent it, money to develop it, buyers willing to pay, and factories that learn to build it cheaply.','Watch each column fill in.']);
   if(s===4&&ONT)ring(ctx,X0-4,by-4,half+8,bh+8);}
  else if(s===6){bars(X0,half);box(ctx,k,X0+half+10,by,half,bh,'What happens when investment stops?',big?['Projects close; jobs go.','Panels still arrive, made abroad.']:['Projects and jobs were cancelled (left). Solar and batteries keep getting cheaper, so buyers still get them, mostly made in China.','Supporters of the cuts said the credits cost too much and favored some energy sources over others.']);}
  else if(s===7)box(ctx,k,X0,by,W-2*X0,bh,'The case against government bets (honors)',big?['Solyndra lost $535M in 2011.','Loan program losses: about 2.3%.','Cheap imports helped buyers; supply risk.']:['Public money can be lost: Solyndra failed in 2011 after a $535 million loan guarantee. Critics say markets, not governments, should pick technologies.','The whole Energy Department loan program lost about $780 million by 2014, about 2.3% of over $35 billion lent, while earning $810 million in interest. Tesla repaid its $465 million loan nine years early.','China’s spending cut solar costs over 80% for everyone, but about 40% of the world’s solar-grade silicon came from one region, Xinjiang, which U.S. law treats as at risk of forced labor.']);
  else if(s===8)box(ctx,k,X0,by,W-2*X0,bh,'One question, many subjects',big?['Chemistry: which metals hold electrons.','Earth: mining, water, coal-made panels.','Government and economy: who pays, who builds.']:['Chemistry: why lithium, iron phosphate and sodium make good batteries (how hard each holds its electrons).','Biology and Earth science: mining lithium uses water; coal is over 60% of China’s electricity, so making panels there has its own emissions.','Government and economics: tax credits, budgets, buyers and the cost that falls as factories scale up. APES asks all of these at once.']);
  else if(s===9)box(ctx,k,X0,by,W-2*X0,bh,'A budget is a moral document',big?['USCCB: the budget is a moral document.','Laudato Si’ 165: replace fossil fuels without delay.','How to do it is a prudential judgment.']:['The U.S. bishops call the federal budget “a moral document”: it shows what a nation values, especially for “the least of these.”','Laudato Si’ (165) asks that fossil fuels be “progressively replaced without delay” and (188) leaves the means to science and politics.','Discuss: who pays now, who benefits later, and who loses a job either way?']);
 },
 narrate(sim){if(!shown(sim))return `The first practical solar cell was invented at Bell Labs in New Jersey in 1954. What share of the world’s solar panel manufacturing do you think happens in China today? Your gut: ${sim.p.guess}%.`;
  return `China makes <b>over 80%</b> of every stage of the world’s solar panels (IEA). The U.S. invented solar cells (1954), LFP batteries (1995) and an early sodium-ion battery, and funded each one. The step that moved was <b>buyers and factories</b>. In 2025, about <b>$${RATIO.toFixed(1)}</b> of U.S. clean-energy projects were abandoned for every $1 announced (E2).`;},
 gut:{better:'higher',controls:['guess'],
  ask:{bio:'The solar cell was invented in New Jersey in 1954. Today, what share of the world’s solar panel manufacturing happens in China? Drag to your gut, then lock it in.',honors:'Drag to your gut guess of China’s share of world solar panel manufacturing, then lock it in.'},
  hint:{bio:'Lock in your gut. The International Energy Agency measured every stage, from raw silicon to finished panels.'},
  lock(sim){return {v:Math.abs(sim.p.guess-SOLAR),guess:sim.p.guess,label:`${sim.p.guess}%`};},
  solve(sim){sim.p.guess=SOLAR;return {v:0,guess:SOLAR,label:'over 80% (IEA)'};},
  calc:{unit:'dollars',d:1,tol:0.06,
   prompt:{bio:'In 2025, companies announced <b>$12.3 billion</b> in new U.S. clean-energy factories and projects and abandoned <b>$34.8 billion</b>. How many dollars were abandoned for every dollar announced? Round to one decimal place.',ap:'2025: $12.3B announced, $34.8B abandoned (E2). Dollars abandoned per dollar announced, to one decimal place.'},
   answer:()=>+RATIO.toFixed(1),hint:'Divide abandoned by announced: 34.8 ÷ 12.3.',
   steps:()=>['34.8 ÷ 12.3 = 2.83.',`About <b>$${RATIO.toFixed(1)}</b> abandoned for every $1 announced (E2 rounds to “nearly $3”).`]},
  formula:()=>`$34.8B ÷ $12.3B ≈ ${RATIO.toFixed(1)} abandoned per $1 announced`+(atLeast('honors')?'<br>Loan program: $780M lost ÷ $35B lent ≈ 2.2%':''),
  how:{bio:'Compare two amounts with a ratio: divide one by the other.',honors:'Judge a risky program by its whole portfolio, not only its biggest failure.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the 2025 ratio yourself.':'';
   return (g.guess>=75?'Close: China makes over 80% of every stage.':`You guessed ${g.guess}%. China makes <b>over 80%</b> of every stage, from silicon to panels.`)+' The cell itself was invented at Bell Labs in New Jersey in 1954.'+self;},
  again(sim){sim.p.guess=40;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'In all three technologies, which step happened mostly outside the U.S.?',choices:['Inventing it','Paying for early research','Buyers and factories at large scale'],correct:2,explain:'The U.S. invented and funded all three. China built the buyers (buses, tax breaks) and the factories.'},
  {lvl:'bio',kind:'num',q:'In 2025, $34.8 billion of U.S. clean-energy projects were abandoned and $12.3 billion announced. How many dollars abandoned per dollar announced? One decimal place.',answer:+RATIO.toFixed(1),tol:0.06,unit:'dollars',d:1,hint:'34.8 ÷ 12.3.',explain:'34.8 ÷ 12.3 ≈ 2.8.'},
  {lvl:'bio',kind:'num',q:'China invested over $50 billion in solar factories since 2011, about ten times Europe. About how much did Europe invest, in billions?',answer:5,tol:0.2,unit:'billion dollars',d:0,hint:'50 ÷ 10.',explain:'$50B ÷ 10 = about $5B.'},
  {lvl:'honors',kind:'num',q:'The Energy Department’s loan program lost about $780 million out of $35 billion lent. What percent is that? One decimal place.',answer:100*0.78/35,tol:0.1,unit:'%',d:1,hint:'0.78 ÷ 35 × 100.',explain:'0.78 ÷ 35 × 100 ≈ 2.2% (reported as about 2.3% of a slightly smaller total).'},
  {lvl:'honors',instant:true,q:'E2 reports the 2025 cancellations. What should a careful reader note about the source?',choices:['Nothing; numbers are numbers','E2 is a business group that advocates for clean energy, so check how it counts and compare with other trackers','It must be false because it is an advocacy group'],correct:1,explain:'Name the source and its point of view, then check the method. Advocacy does not make a number wrong, but it is a reason to look closely.'},
  {lvl:'ap',instant:true,q:'A program makes 30 risky loans. One loses $535 million; the rest repay with interest. What is the right way to judge it?',choices:['By the biggest failure','By total losses against total returns and what the successes built','By how many companies it funded'],correct:1,explain:'A portfolio of bets is judged by its total: losses, interest earned, and what the winners went on to build.'}
 ],
 tour:[
  {title:'Step 1: invent it',text:'Three technologies, all invented in the U.S.: the first practical silicon solar cell (Bell Labs, New Jersey, 1954), the lithium iron phosphate (LFP) battery chemistry (Goodenough’s lab at UT Austin, 1995) and Natron’s sodium-ion battery (a Stanford spinout).',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Step 2: fund it',text:'Public and private money paid for early work. Solar cells first powered U.S. satellites. In 2009 the battery startup A123 got a $249 million Energy Department grant for two Michigan factories and raised $380 million from private investors in a stock sale. Natron had private investors plus $19.8 million from ARPA-E, an Energy Department program.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Step 3: buyers',text:'Here the stories split. Few Americans were buying electric cars in 2009–2012; Chrysler closed its electric-car unit, GM chose LG for the Volt, and A123 went bankrupt in 2012. Natron closed in September 2025, citing funding. Solar’s first big buyers were in Japan, then Germany.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Step 4: build at scale',text:'China bought A123 in 2013 and that year began building a market for electric cars: electric city buses, tax breaks for buyers, support for battery companies. It invested over $50 billion in solar factories since 2011, ten times Europe. Today China makes over 80% of every stage of the world’s solar panels, and CATL began making sodium-ion car batteries in 2026.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'The missing step',text:'Inventing and funding are not enough. A technology also needs buyers willing to pay, and factories that keep building until costs fall. Whether the money is public or private, the investor who sees the future and keeps building through the early losses ends up with the industry, the jobs and the exports.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'What happens when investment stops?',text:'In 2025 Congress phased out many clean-energy tax credits. E2, a business group that advocates for clean energy, counted $34.8 billion in U.S. clean-energy projects cancelled, closed or downsized that year, with 38,031 planned jobs, against $12.3 billion announced. Supporters of the change argued the credits cost taxpayers too much and favored some energy sources over others. Solar panels and batteries keep getting cheaper, so Americans still buy them, mostly made abroad.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'The case against government bets',text:'Public bets can fail: Solyndra went bankrupt in 2011 after a $535 million loan guarantee, as cheap silicon panels undercut it. Critics argue markets should choose technologies. Yet the whole loan program lost about $780 million by 2014, about 2.3% of over $35 billion lent, while earning $810 million in interest, and Tesla repaid its $465 million loan nine years early. China’s spending also cut solar costs for everyone, though much solar silicon comes from Xinjiang, which U.S. law treats as at risk of forced labor.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'One question, many subjects',text:'Which energy to build is not only a chemistry question. Chemistry explains why lithium, iron phosphate and sodium make good batteries. Biology and Earth science ask what mining lithium does to water and land, and what it means that coal makes over 60% of China’s electricity, where most panels are made. Government and economics ask who pays, who buys and who builds. AP Environmental Science puts all of these in one question.',pause:true,setup:sim=>{sim.tst=8;}},
  {title:'A budget is a moral document',text:'The U.S. Catholic bishops call the federal budget “a moral document”: where a nation puts its money shows what it values, especially for “the least of these.” In <i>Laudato Si’</i>, Pope Francis asks that fossil fuels be “progressively replaced without delay” (165), while leaving the means to science and politics (188). Discuss: who pays now, who benefits later, and whose jobs depend on the choice?',pause:true,setup:sim=>{sim.tst=9;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> Where did each technology’s industry end up, and why?</p><ol><li>Lock in your gut, then fill in the four steps for all three rows.</li><li>Circle the step where each story left the U.S.</li></ol><p>Write one sentence: what does a new technology need besides an inventor?</p>',
  honors:'<p><b>Question:</b> Should public money bet on new energy technology?</p><ol><li>Give the strongest argument for and against, each with a number from this tool.</li><li>Compute the loan program’s loss rate and compare it with its biggest failure.</li></ol><p>Name each source and its point of view.</p>',
  ap:'<p><b>Question:</b> How should a portfolio of public bets be judged?</p><ol><li>Model 30 loans where 3 fail completely and the rest repay with 3% interest.</li><li>Compare the result with the actual loan program numbers.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Scale',d:'Making something in huge amounts, which usually drives its cost down.'},
  {t:'Demand',d:'Buyers willing and able to pay for something.'},
  {t:'Tax credit',d:'Money taken off a tax bill, used by governments to encourage buying or building something.'},
  {t:'Loan guarantee',d:'A government promise to repay a lender if a borrower cannot.',lvl:'honors'},
  {t:'Portfolio',d:'A group of investments judged by their combined result.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> APS News, “April 25, 1954: Bell Labs Demonstrates the First Practical Silicon Solar Cell.” International Energy Agency, <i>Special Report on Solar PV Global Supply Chains</i> (July 7, 2022): China’s share of every manufacturing stage over 80%; over $50 billion invested since 2011, ten times Europe; over 300,000 jobs; costs down over 80%; Xinjiang about 40% of polysilicon. Bloomberg Businessweek, “A U.S. startup’s failure paved the way for China’s EV battery dominance” (June 2023; via Autoblog, June 11, 2023): LFP discovered at UT Austin in 1995; A123’s $249 million DOE grant (2009), bankruptcy (2012) and sale to Wanxiang (2013); China’s 2013 market-building plan. IEEE Spectrum (September 2025) on Natron Energy’s closure and its $19.8 million ARPA-E award. CnEVPost (February 5, 2026) on the first mass-produced sodium-ion passenger car. Reuters via Newsweek and PV Tech (November 2014) on Loan Programs Office losses ($780 million) and interest ($810 million); Fortune (June 13, 2013) on Tesla’s repayment. E2, <i>Clean Economy Works</i> year-end memo (February 2026): $34.8 billion abandoned, $12.3 billion announced, 38,031 jobs. USCCB letters to Congress on the federal budget (2017, 2018). Pope Francis, <i>Laudato Si’</i> (2015), 26, 165, 188.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>“Over 80%” is from 2022; China’s share of key stages was projected to pass 95%.</li><li>E2 tracks large announced projects only and advocates for clean energy; other trackers count differently.</li><li>A123 also had a 2012 recall and other troubles; weak demand was not the only cause.</li><li>The U.S. still leads in other energy: in 2025 it produced more oil and natural gas than any other country.</li></ul>'
};
BioLab.register(SIM);
})();
