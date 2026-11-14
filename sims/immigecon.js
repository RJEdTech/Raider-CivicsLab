(function(){
'use strict';
const {txt,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function panel(ctx,k,x,y,w,h,title){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
function worker(ctx,x,y,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y-7,4.2,0,7);ctx.fill();rr(ctx,x-5,y-2,10,11,3);ctx.fill();}
/* Immigration and the economy: what actually happens (Jason, Nov 14: "not what politicians tell us. what actually happens").
   BLS, Foreign-born Workers: Labor Force Characteristics 2024 (May 20, 2025): foreign born 19.2% of the civilian labor force (32.1M of
   about 168.0M); 18.1% of the foreign-born labor force 25+ had not finished high school vs. 3.2% of native born; bachelor's or higher 41.3%
   vs. 45.3%. National Academies, The Economic and Fiscal Consequences of Immigration (2016/2017): over 10+ years the effect on native wages
   overall is very small; negative effects, where found, fall mostly on prior immigrants and native workers without a high school diploma;
   little evidence of effects on native employment levels; positive effect on long-run growth; first generation more costly to state and
   local governments (mainly educating children); the second generation among the strongest fiscal contributors.
   CBO, Effects of the Immigration Surge on the Federal Budget and the Economy (July 2024): +$1.2T revenues, +$0.3T mandatory outlays and
   interest, deficits $0.9T lower over 2024–2034; nominal GDP +$8.9T over 2024–2034; through 2026 slows wage growth for people with 12 or
   fewer years of education; raises state and local costs more than revenues; "very uncertain."
   Mariel (1980): about 125,000 Cubans; Miami labor force +7% (Card 1990: virtually no effect); Borjas (2017): wages of the least-skilled fell
   10–30%; Peri and Yasenov (2017) and Clemens and Hunt (2017): Borjas's small sample changed composition; little to no effect. CCC 2241. */
const FB=32.1,NB=135.9,SH=100*FB/(FB+NB);
const f1=v=>(+v).toFixed(1);
const SIM={
 id:'immigecon',hash:'immigecon',apUnit:5,order:4,tab:'Immigration and the economy',kind:'Learning tool',prereq:['claims'],next:['remittances'],
 skills:{bio:'Percent of a whole; reading a two-sided ledger · Algebra 1 (Unit 2), US Government, Sociology',
  honors:'Natural experiments and comparison groups: why two careful studies of one event disagreed · Statistics (Chapter 4)',
  ap:'Labor supply and demand; who gains and who bears the cost when supply grows · AP Microeconomics (Unit 5), AP Macroeconomics (Unit 2)'},
 card:'Guess what share of U.S. workers were born abroad, then see what the research finds about wages, jobs, taxes and growth, including where costs fall.',
 title:'Immigration and the economy: what actually happens',
 lede:{bio:'You hear a lot of claims about immigrants and the economy. Here is what the biggest studies, from the National Academies and the Congressional Budget Office, actually find.',
  honors:'Economists agree on more than the arguments suggest, and disagree in specific places. See both, and see how one 1980 event became a test case.',
  ap:'Add workers to a market and the supply curve shifts. But workers are also customers. Weigh the total gains against where the costs fall.'},
 scale:'United States. BLS 2024, National Academies (2016), CBO (2024), Mariel studies; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: % of U.S. workers born in another country',type:'range',min:0,max:50,step:1,def:8,unit:'%'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){return {};},step(){},
 metrics:[
  {id:'sh',label:'Foreign-born share of the labor force, 2024',unit:'%',d:1,min:0,max:50,get:s=>shown(s)?19.2:null},
  {id:'fb',label:'Foreign-born workers',unit:'M',d:1,min:0,max:200,get:s=>shown(s)?FB:null},
  {id:'all',label:'All workers (labor force)',unit:'M',d:1,min:0,max:200,get:s=>FB+NB}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  txt(ctx,big?'100 U.S. workers':'If the U.S. had 100 workers',20,18,{s:14*k,w:700,b:'middle'});
  const n=sh?19:(gv!=null?Math.round(gv):0);
  for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=34+c*25,y=54+r*30;const fb=i>=100-n;worker(ctx,x,y,fb?(sh?'#2d6bd2':PAL['s4']):'#b9b9b4');}
  let ly=54+10*30+4;
  if(sh){ctx.fillStyle='#2d6bd2';ctx.fillRect(22,ly-5,12,10);txt(ctx,big?'Born abroad: 19':'Born in another country: about 19',40,ly,{s:12*k,w:700,b:'middle'});}
  else if(gv!=null){txt(ctx,'Your gut: '+gv+' of 100',22,ly,{s:12*k,w:700,b:'middle',c:PAL['s4']});}
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'Who works');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?120:170),w=(RW-(big?175:225))*v/50;ctx.fillStyle=c;rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,f1(v)+'%',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=22*k;};
   txt(ctx,big?'No diploma:':'No high school diploma:',RX+12,y,{s:12*k,w:700,b:'middle',c:PAL['cv-soft']});y+=20*k;bar(big?'Born abroad':'Born abroad',18.1,'#2d6bd2');bar(big?'U.S.-born':'Born in the U.S.',3.2,'#b9b9b4');
   txt(ctx,big?'College degree:':'Bachelor’s degree or more:',RX+12,y,{s:12*k,w:700,b:'middle',c:PAL['cv-soft']});y+=20*k;bar('Born abroad',41.3,'#2d6bd2');bar(big?'U.S.-born':'Born in the U.S.',45.3,'#b9b9b4');
   lines(ctx,k,RX+12,y+4,RW-24,big?['Both ends of the skill ladder.']:['Immigrant workers cluster at both ends: far more without a diploma, and nearly as many with a degree. That matters for who competes with whom.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Wages: small overall, not zero for all');y=lines(ctx,k,RX+12,y,RW-24,big?['Over 10+ years: very small effect.','Costs, where found: workers without a diploma, earlier immigrants.']:['The National Academies’ review of the evidence: over 10 years or more, the effect of immigration on native-born workers’ wages overall is very small.','Where negative effects show up, they fall mostly on earlier immigrants and native workers without a high school diploma, the closest competitors.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Jobs: not a fixed pie');y=lines(ctx,k,RX+12,y,RW-24,big?['Little effect on native employment.','Workers are also customers.','Growth: positive in the long run.']:['There is little evidence that immigration changes how many native-born people have jobs.','Why? New workers also rent, buy groceries and start businesses, creating demand for more work. The number of jobs isn’t fixed. Over the long run, immigration raises economic growth.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'Taxes: depends on which budget');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?130:180),w=(RW-(big?190:240))*v/1.3;ctx.fillStyle=c;rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,'$'+v+'T',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=22*k;};
   bar(big?'Revenue':'Added federal revenue',1.2,'#1b7339');bar(big?'Spending':'Added federal spending',0.3,'#C11430');bar(big?'Deficit cut':'Lower federal deficits',0.9,'#2d6bd2');
   lines(ctx,k,RX+12,y+4,RW-24,big?['CBO, 2024–2034 (very uncertain).','States and towns: costs exceed taxes.']:['The CBO projects the 2021–2026 immigration surge lowers federal deficits by $0.9 trillion over 2024–2034, while warning the estimate is very uncertain.','But states and towns, which pay for schools, usually see costs rise more than revenue. The children of immigrants later become among the strongest taxpayers.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'One event, two answers: Mariel, 1980');y=lines(ctx,k,RX+12,y,RW-24,big?['125,000 Cubans; Miami workforce +7%.','Card: virtually no effect.','Borjas: least-skilled wages −10 to −30%.','Rechecks: little to no effect.']:['In 1980 about 125,000 Cubans arrived in Miami in a few months, adding about 7% to its workforce. David Card (1990) found virtually no effect on less-skilled workers’ wages.','George Borjas (2017) looked at a narrower group and found their wages fell 10–30%. Rechecks found his small sample changed makeup in 1980; corrected, little to no effect. Same event, different comparison groups.']);}
  else if(s===6&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'Gains spread, costs concentrated');y=lines(ctx,k,RX+12,y,RW-24,big?['Total wages and GDP rise.','Short run: slower wage growth, 12 or fewer years of school.','A policy choice, not a math answer.']:['CBO: the surge raises total wages and GDP (+$8.9 trillion over 2024–2034), but through 2026 it slightly slows wage growth for people with 12 or fewer years of school.','Economics can say where gains and costs land. How many to admit, and how to help those who bear the costs, is a judgment for citizens.']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church teaches');y=lines(ctx,k,RX+12,y,RW-24,big?['Welcome, to the extent able.','Nations may regulate for the common good.','Immigrants respect the laws.']:['The Catechism (2241) holds both: more prosperous nations are obliged, to the extent they are able, to welcome the foreigner in search of security and livelihood.','Public authorities may set conditions for the common good, and immigrants are obliged to respect the laws and heritage of the country that receives them.']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,230,'What the research finds');lines(ctx,k,RX+12,y,RW-24,['About 19 in 100 U.S. workers were born abroad (BLS 2024).','Native wages overall: very small effect over 10+ years; costs fall mostly on workers without a diploma.','Federal budget: helped; state and local budgets: costs exceed taxes in the short run.']);}
 },
 narrate(sim){if(!shown(sim))return `What share of U.S. workers were born in another country? Your gut: ${sim.p.guess}%.`;
  return `In 2024, <b>19.2%</b> of U.S. workers, <b>32.1 million</b> people, were born abroad. The research finds very small effects on native wages overall, with costs concentrated on workers without a diploma, and a federal budget gain alongside state and local costs.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'What percent of U.S. workers do you think were born in another country? Drag to your gut, then lock it in.',honors:'Percent of the U.S. labor force born abroad, 2024? Drag to your gut, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the share.'},
  lock(sim){return {v:Math.abs(sim.p.guess-19.2),guess:sim.p.guess,label:`${sim.p.guess}%`};},
  solve(sim){sim.p.guess=19;return {v:0,guess:19.2,label:'19.2%'};},
  calc:{unit:'%',d:1,tol:0.2,
   prompt:{bio:'In 2024, <b>32.1 million</b> foreign-born and <b>135.9 million</b> U.S.-born people were in the labor force. What percent were born abroad? One decimal place.',ap:'32.1M ÷ (32.1M + 135.9M), as a percent.'},
   answer:()=>+SH.toFixed(1),hint:'Part ÷ whole × 100. The whole is both groups added.',
   steps:()=>['32.1 + 135.9 = 168.0 million workers.',`32.1 ÷ 168.0 × 100 = <b>${f1(SH)}%</b> (BLS reports 19.2% from unrounded counts): about 1 in 5.`]},
  formula:()=>`32.1 ÷ (32.1 + 135.9) × 100 ≈ ${f1(SH)}%`+(atLeast('honors')?'<br>CBO 2024–2034: +$1.2T revenue − $0.3T spending = $0.9T lower deficits':''),
  how:{bio:'Add the parts to get the whole first.',honors:'Ask which budget, which workers and which time frame.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';
   return (Math.abs(g.guess-19.2)<=3?'Close.':`You guessed ${g.guess}%. It was <b>19.2%</b> in 2024.`)+' About 1 in 5 workers.'+self;},
  again(sim){sim.p.guess=8;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'CBO: the surge adds $1.2 trillion in federal revenue and $0.3 trillion in spending over 2024–2034. Net effect on deficits, in trillions?',answer:0.9,tol:0.01,unit:'$T',d:1,hint:'1.2 − 0.3.',explain:'$0.9 trillion lower deficits, a very uncertain projection that leaves out state and local budgets.'},
  {lvl:'bio',instant:true,q:'Who is most likely to face lower wages when many low-skilled immigrants arrive?',choices:['College graduates','Earlier immigrants and native workers without a high school diploma','Retirees'],correct:1,explain:'The closest competitors bear most of the cost, per the National Academies.'},
  {lvl:'bio',instant:true,q:'“Every job an immigrant takes is one less for a native-born worker.” What does this miss?',choices:['Nothing','New workers are also customers who create demand for more work','Immigrants don’t work'],correct:1,explain:'The number of jobs isn’t fixed; the evidence shows little effect on native employment.'},
  {lvl:'honors',kind:'num',q:'125,000 Cubans added about 7% to Miami’s workforce. About how large was Miami’s workforce before? Round to the nearest 100,000.',answer:1800000,tol:100000,unit:'workers',d:0,hint:'125,000 ÷ 0.07.',explain:'About 1.8 million workers.'},
  {lvl:'honors',instant:true,q:'Card and Borjas studied the same event and disagreed. What mostly explains it?',choices:['One lied','Different comparison groups and a small sample that changed makeup','Different years'],correct:1,explain:'Rechecks traced Borjas’s result to a change in who was in his small sample.'},
  {lvl:'ap',instant:true,q:'Total wages rise but wage growth slows for some workers. Which describes it?',choices:['Gains spread widely, costs concentrated on close competitors','Everyone loses','Everyone gains equally'],correct:0,explain:'Policy can weigh total gains against help for those who bear the costs.'}
 ],
 tour:[
  {title:'Who works',text:'In 2024, 19.2% of U.S. workers were born abroad. They cluster at both ends: 18.1% lack a high school diploma (vs. 3.2% of U.S.-born workers), and 41.3% have a bachelor’s degree or more (vs. 45.3%).',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Wages: small overall, not zero for all',text:'The National Academies found that over 10 years or more, immigration’s effect on native-born wages overall is very small. Where costs appear, they fall mostly on earlier immigrants and native workers without a diploma.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Jobs: not a fixed pie',text:'There is little evidence immigration changes how many native-born people have jobs. New workers are also customers, and immigration raises long-run growth.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Taxes: depends on which budget',text:'The CBO projects the 2021–2026 surge lowers federal deficits by $0.9 trillion over 2024–2034 (very uncertain). States and towns, which pay for schools, usually see costs rise more than revenue at first; the children of immigrants become among the strongest taxpayers.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'One event, two answers: Mariel, 1980',text:'About 125,000 Cubans added 7% to Miami’s workforce. Card found virtually no wage effect; Borjas found the least-skilled lost 10–30%; rechecks traced that to a small sample that changed makeup. Same event, different comparison groups.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'Gains spread, costs concentrated',text:'The surge raises total wages and GDP but, through 2026, slightly slows wage growth for people with 12 or fewer years of school. Economics shows where gains and costs land; how to weigh them is a judgment for citizens.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'What the Church teaches',text:'The Catechism (2241) holds both: prosperous nations should welcome the foreigner seeking security and livelihood, to the extent they are able; authorities may set conditions for the common good; immigrants should respect the laws of the country that receives them.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What does immigration actually do to the economy?</p><ol><li>Lock in your gut, then work out the share.</li><li>Write one finding about wages, one about jobs, one about taxes.</li></ol>',
  honors:'<p><b>Question:</b> Why did two careful studies of Mariel disagree?</p><ol><li>Describe each study’s comparison group.</li><li>Explain what the rechecks found.</li></ol>',
  ap:'<p><b>Question:</b> Who gains and who bears the cost?</p><ol><li>Draw the labor market for workers without a diploma when supply rises.</li><li>Add the demand side: what do new workers buy?</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Labor force',d:'People working or looking for work.'},
  {t:'Foreign born',d:'Born outside the U.S. to non-citizen parents; includes citizens, permanent residents, visa holders and the undocumented.'},
  {t:'Natural experiment',d:'An event that changes one place and not a similar one, letting researchers compare.',lvl:'honors'},
  {t:'Complements and substitutes',d:'Workers who help each other’s output (complements) vs. compete for the same jobs (substitutes).',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> U.S. Bureau of Labor Statistics, “Foreign-born Workers: Labor Force Characteristics — 2024” (May 2025). National Academies of Sciences, Engineering, and Medicine, <i>The Economic and Fiscal Consequences of Immigration</i> (2016; published 2017). Congressional Budget Office, “Effects of the Immigration Surge on the Federal Budget and the Economy” (July 2024). David Card, “The Impact of the Mariel Boatlift on the Miami Labor Market” (1990); George Borjas, “The Wage Impact of the Marielitos: A Reappraisal” (2017); Giovanni Peri and Vasil Yasenov (2017/2019); Michael Clemens and Jennifer Hunt (2017). <i>Catechism of the Catholic Church</i>, 2241.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>“Foreign born” mixes citizens, green-card holders, visa workers and the undocumented, whose effects differ.</li><li>National averages hide big differences between places and industries.</li><li>Projections like CBO’s depend on assumptions about the future.</li></ul>'
};
BioLab.register(SIM);
})();
