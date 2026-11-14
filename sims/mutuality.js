(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function panel(ctx,k,x,y,w,h,title,tag,tagc){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});
 if(tag){ctx.font='700 '+(11*k)+'px '+FONT;const tw=ctx.measureText(tag).width+11*k*1.1;pill(ctx,tag,x+w-10-tw/2,y+18*k,tagc,'#fff',11*k);}
 return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
function hbars(ctx,k,x,y,w,rows,max,col){const lab=w*0.42;rows.forEach((r,i)=>{const yy=y+i*22*k;txt(ctx,r[0],x,yy,{s:12*k,w:700,b:'middle'});const bw=(w-lab-46)*r[1]/max;
 ctx.fillStyle=r[2]||col;rr(ctx,x+lab,yy-6,bw,12,4);ctx.fill();txt(ctx,r[1]+'%',x+lab+bw+5,yy,{s:12*k,w:700,b:'middle'});});return y+rows.length*22*k;}
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
/* A web of mutuality: when one community is held back, everyone's economy is smaller (Jason, Nov 13; MLK, Letter from Birmingham Jail, 1963).
   Hsieh, Hurst, Jones and Klenow, Econometrica 87(5) (2019): in 1960, 94% of doctors and lawyers were white men; in 2010, 62%.
   Between 20% and 40% of growth in market output per person, 1960-2010, is explained by the improved allocation of talent; falling obstacles
   to building skills explain 36% of growth and falling labor-market discrimination 8% (main specification).
   Buckman, Choi, Daly and Seitelman, "The Economic Gains from Equity," FRBSF Working Paper 2021-11: race and gender gaps cost $2.6 trillion
   of GDP in 2019 and $70.8 trillion over 1990-2019 (model); closing them would add $3.1 trillion in 2029. U.S. GDP 2019 about $21.4 trillion;
   population about 328 million. Catechism 1939 (solidarity). */
const LOST=2.6,GDP19=21.4,POP=328,PCT=100*LOST/GDP19,PERP=LOST*1e12/(POP*1e6);
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
const SIM={
 id:'mutuality',hash:'mutuality',apUnit:5,order:7,tab:'A web of mutuality',kind:'Learning tool',prereq:['measurewealth'],next:['redlining'],
 skills:{bio:'Percent of a total and dividing a national total per person · Algebra 1 (Unit 2), Black History, Sociology (Gender and race)',
  honors:'Reading a range of estimates, and peer-reviewed vs. working papers · Statistics (Chapter 4), AP Macroeconomics (Unit 2: GDP)',
  ap:'Misallocation: why talent in the wrong place shrinks everyone’s output · AP Macroeconomics (Unit 2), AP Microeconomics (Unit 6)'},
 card:'Dr. King wrote that we are caught in a network of mutuality. Guess how much of U.S. growth came from opening jobs to women and Black Americans, then see what the gaps cost every American today.',
 title:'A web of mutuality',
 lede:{bio:'In his 1963 Letter from Birmingham Jail, Dr. Martin Luther King Jr. wrote that we are caught in an “inescapable network of mutuality.” Economists have measured one strand of that web: what everyone loses when some people are shut out.',
  honors:'Two kinds of estimates: a peer-reviewed study of 1960 to 2010, and a Federal Reserve working paper on today’s gaps. Read each with its method and its range.',
  ap:'When a talented person is kept out of the job they would do best, the whole economy produces less. Economists call it misallocation.'},
 scale:'United States, 1960 to 2029. Hsieh, Hurst, Jones and Klenow (Econometrica, 2019); Federal Reserve Bank of San Francisco (2021); see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: share of U.S. growth per person (1960–2010) from opening jobs to women and Black Americans',type:'range',min:0,max:80,step:1,def:5,unit:'%'},
  {id:'reveal',label:'Show the estimates now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'lo',label:'Share of growth from better use of talent (low)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?20:null},
  {id:'hi',label:'Share of growth from better use of talent (high)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?40:null},
  {id:'pp',label:'Cost of today’s gaps per American, 2019',unit:'$',d:0,min:0,max:20000,get:s=>shown(s)?PERP:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  /* left: doctors and lawyers, 1960 vs 2010, as 100 people each */
  txt(ctx,'Doctors and lawyers',20,18,{s:14*k,w:700,b:'middle'});
  const grid=(x0,y0,label,n,on)=>{txt(ctx,label,x0,y0-12,{s:12.5*k,w:700,b:'middle'});for(let i=0;i<100;i++){const x=x0+(i%10)*12+5,y=y0+Math.floor(i/10)*12+5;ctx.beginPath();ctx.arc(x,y,4.2,0,7);ctx.fillStyle=on?(i<n?'#6b7c93':'#c8102e'):PAL['cv-bg2'];ctx.fill();}
   txt(ctx,on?n+' of 100':'?',x0,y0+130,{s:12.5*k,w:700,b:'middle'});};
  grid(20,56,'1960',94,s!==1||true);grid(160,56,'2010',62,s>=2);
  txt(ctx,'● white men',20,214+12*k,{s:11*k,w:700,c:'#6b7c93',b:'middle'});txt(ctx,'● women and Black men',20,214+28*k,{s:11*k,w:700,c:'#c8102e',b:'middle'});
  if(s===2&&ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,150,36,135,170,7);ctx.stroke();}
  /* gut / range bar */
  const gy=big?305:280,gx=20,gw=250,X=v=>gx+gw*v/80;
  if(s>=3||s===99){txt(ctx,big?'Share of growth, 1960–2010':'Share of growth per person, 1960–2010',gx,gy-18,{s:12.5*k,w:700,b:'middle'});ctx.fillStyle=PAL['cv-bg2'];rr(ctx,gx,gy-6,gw,12,5);ctx.fill();
   if(sh){ctx.fillStyle='#2f9e44';rr(ctx,X(20),gy-6,X(40)-X(20),12,5);ctx.fill();txt(ctx,'20–40%',(X(20)+X(40))/2,gy+18*k,{s:12.5*k,w:700,a:'center',b:'middle',c:'#2f9e44'});}
   if(gv!=null&&!sh){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(X(gv),gy,7,0,7);ctx.fill();txt(ctx,'your gut: '+gv+'%',X(gv),gy+18*k,{s:11.5*k,w:700,a:'center',b:'middle',c:PAL['s4']});}
   if(s===3&&ONT)ring(ctx,gx-6,gy-30,gw+12,60*k);}
  if(sh&&s>=4){txt(ctx,big?`≈ $${f0(PERP)} per person`:`$2.6T ÷ 328M people ≈ $${f0(PERP)} each`,gx,gy+48*k,{s:13*k,w:700,c:PAL['s1'],b:'middle'});if(s===4&&ONT)ring(ctx,gx-6,gy+36*k,gw+30,26*k);}
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'A network of mutuality');y=lines(ctx,k,RX+12,y,RW-24,big?['Dr. King, 1963: we are caught in a network of mutuality.','What affects one community affects all.']:['Writing from a Birmingham jail in 1963, Dr. King said we are caught in an “inescapable network of mutuality”: whatever affects one directly affects all indirectly.','Economists can test one strand of that idea: when some people are shut out of jobs and schooling, does everyone’s economy shrink?']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Who held the top jobs');y=lines(ctx,k,RX+12,y,RW-24,big?['1960: 94% of doctors and lawyers were white men.','2010: 62%.']:['In 1960, 94 of every 100 doctors and lawyers were white men. By 2010, 62 were.','Talent did not change between groups. What changed were the doors: schools, colleges and employers that had kept women and Black Americans out.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Everyone’s growth','peer-reviewed','#2f9e44');y=lines(ctx,k,RX+12,y,RW-24,big?['20–40% of U.S. growth per person, 1960–2010, came from better use of talent.']:['Four economists (Econometrica, 2019) estimate that 20% to 40% of the growth in U.S. output per person from 1960 to 2010 came from putting talent where it fit best.','That growth raised incomes for everyone, not only for the people who got in the door.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'What today’s gaps cost','working paper','#b5650d');y=lines(ctx,k,RX+12,y,RW-24,big?['SF Fed (2021): gaps cost $2.6T of GDP in 2019.','About $7,900 per American.']:['Economists at the San Francisco Fed estimate that race and gender gaps in jobs, hours and schooling cost $2.6 trillion of GDP in 2019: about 12% of the economy.','Divided by 328 million people, that is about $7,900 for every American.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'How good are these numbers?');y=lines(ctx,k,RX+12,y,RW-24,big?['1960–2010 study: peer-reviewed, given as a range.','Fed estimate: a model in a working paper.']:['The 1960–2010 estimate was peer-reviewed and is given as a range (20% to 40%) because it depends on the model’s assumptions.','The $2.6 trillion is a model in a working paper: it assumes closed gaps would leave everything else the same. Treat it as a size, not a precise figure.']);}
  else if(s===6&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'Why: misallocation');y=lines(ctx,k,RX+12,y,RW-24,big?['A would-be doctor kept out produces less.','So does everyone who would have been her patient.']:['If a person who would be an excellent doctor is kept out of medical school, she produces less, and so does the economy around her: fewer patients treated, less income spent and taxed.','In the 2019 study, falling obstacles to schooling mattered more (36% of growth) than falling job discrimination (8%).']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'Solidarity');y=lines(ctx,k,RX+12,y,RW-24,big?['CCC 1939: solidarity is a demand of human brotherhood.','Discuss: where do you see the web in your own life?']:['The Catechism (1939) calls solidarity a direct demand of human and Christian brotherhood. Dr. King’s web and the economists’ numbers point the same way: no one prospers alone.','Discuss: where do you see the web of mutuality in Denver or at RJ?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,170,'The web in numbers');lines(ctx,k,RX+12,y,RW-24,['1960–2010: 20–40% of growth per person came from opening doors.','2019: gaps cost about $2.6 trillion, about $7,900 per American (model).']);}
 },
 narrate(sim){if(!shown(sim))return `From 1960 to 2010, what share of U.S. growth per person came from opening schools and jobs to women and Black Americans? Your gut: ${sim.p.guess}%.`;
  return `Economists estimate <b>20% to 40%</b> of U.S. growth per person from 1960 to 2010 came from better use of everyone’s talent. Today’s gaps cost about <b>$2.6 trillion</b> a year (a model), about $${f0(PERP)} per American.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'From 1960 to 2010, women and Black Americans moved into jobs like doctor and lawyer that had been closed to them. What share of the whole country’s growth per person do you think came from that? Drag to your gut guess, then lock it in.',honors:'Drag to your gut guess: share of U.S. growth per person, 1960–2010, from better use of talent.'},
  hint:{bio:'Lock in your gut. Then you will put today’s gaps into dollars per person.'},
  lock(sim){const g=sim.p.guess;return {v:g<20?20-g:g>40?g-40:0,guess:g,label:`${g}%`};},
  solve(sim){sim.p.guess=30;return {v:0,guess:30,label:'20% to 40% (Econometrica, 2019)'};},
  calc:{unit:'$',d:0,tol:60,
   prompt:{bio:'The San Francisco Fed estimates race and gender gaps cost <b>$2.6 trillion</b> of GDP in 2019. The U.S. had about <b>328 million</b> people. About how many dollars per person is that? Round to the nearest hundred.',ap:'Lost GDP 2019: $2.6 trillion. Population: 328 million. Compute dollars per person.'},
   answer:()=>Math.round(PERP/100)*100,hint:'2,600,000,000,000 ÷ 328,000,000.',
   steps:()=>['$2.6 trillion ÷ 328 million = 2,600,000 ÷ 328 dollars.',`≈ <b>$${f0(Math.round(PERP/100)*100)}</b> for every American, every year (a model estimate).`]},
  formula:()=>`$2.6 trillion ÷ 328 million ≈ $${f0(PERP)} per person`+(atLeast('honors')?'<br>As a share of 2019 GDP: 2.6 ÷ 21.4 ≈ '+f1(PCT)+'%':''),
  how:{bio:'Divide a national total by the population to get dollars per person.',honors:'Note whether an estimate is peer-reviewed or a working paper, and report its range.'},
  compare(sim,g){const v=g.guess;const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the cost per person yourself.':'';
   return (v>=20&&v<=40?'Inside the economists’ range.':`You guessed ${v}%. The estimate is <b>20% to 40%</b>.`)+' Most people guess far lower: opening doors to some people raised incomes for all.'+self;},
  again(sim){sim.p.guess=5;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In 1960, 94 of 100 doctors and lawyers were white men; in 2010, 62. By how many percentage points did that share fall?',answer:32,tol:0,unit:'points',d:0,hint:'94 − 62.',explain:'32 percentage points.'},
  {lvl:'bio',instant:true,q:'Why could opening jobs to women and Black Americans raise incomes for everyone, not only for them?',choices:['It cannot','Talented people in the right jobs produce more, and that output (care, products, taxes) reaches everyone','Because prices fall to zero'],correct:1,explain:'More output from better-used talent spreads through the whole economy.'},
  {lvl:'honors',kind:'num',q:'$2.6 trillion lost out of a $21.4 trillion economy. What percent is that? Round to one decimal place.',answer:PCT,tol:0.1,unit:'%',d:1,hint:'2.6 ÷ 21.4 × 100.',explain:`About ${f1(PCT)}% of GDP.`},
  {lvl:'honors',instant:true,q:'Which estimate should you treat as more certain?',choices:['The peer-reviewed 20–40% range for 1960–2010','The working paper’s exact $2.6 trillion','They are equally certain'],correct:0,explain:'Peer review and a stated range make the first more reliable; the second is a useful size, not a precise figure.'},
  {lvl:'ap',kind:'num',q:'Suppose growth per person averaged 2% a year from 1960 to 2010. If 30% of that came from better use of talent, how many percentage points a year is that?',answer:0.6,tol:0.01,unit:'points',d:1,hint:'0.30 × 2.',explain:'0.6 points of growth a year, compounding over 50 years.'}
 ],
 tour:[
  {title:'A network of mutuality',text:'In his 1963 Letter from Birmingham Jail, Dr. Martin Luther King Jr. wrote that we are caught in an “inescapable network of mutuality.” If shutting out one community hurts all, it should show up in the economy.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Who held the top jobs',text:'In 1960, 94 of every 100 doctors and lawyers were white men. By 2010, 62 were. Talent had not changed between groups; the doors had.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Everyone’s growth',text:'Four economists, writing in Econometrica (2019), estimate that 20% to 40% of the growth in U.S. output per person from 1960 to 2010 came from putting talent where it fit best. That growth raised incomes across the country.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'What today’s gaps cost',text:'Economists at the San Francisco Fed estimate that race and gender gaps in jobs, hours and schooling cost $2.6 trillion of GDP in 2019. Divided among 328 million people, that is about $7,900 each.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'How good are these numbers?',text:'The 1960–2010 estimate was peer-reviewed and given as a range because it depends on assumptions. The $2.6 trillion is a model in a working paper; treat it as a size, not an exact figure.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'Why: misallocation',text:'When someone who would be an excellent doctor is kept out of medical school, she produces less, and so does the economy around her. In the 2019 study, falling obstacles to schooling explained more growth (36%) than falling job discrimination (8%).',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Solidarity',text:'The Catechism (1939) calls solidarity a direct demand of human and Christian brotherhood. Dr. King’s web and the economists’ numbers point the same way: no one prospers alone. Discuss: where do you see the web of mutuality in Denver or at RJ?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> Does shutting some people out cost everyone?</p><ol><li>Lock in your gut, then work out today’s cost per American.</li><li>Compare 1960 and 2010 for doctors and lawyers.</li></ol><p>Write one sentence connecting Dr. King’s “network of mutuality” to one number here.</p>',
  honors:'<p><b>Question:</b> How sure are these estimates?</p><ol><li>For each estimate, name its method and whether it was peer-reviewed.</li><li>Report each with its range or limits.</li></ol>',
  ap:'<p><b>Question:</b> How does misallocation lower output?</p><ol><li>Explain with one example from your own life.</li><li>Why might schooling obstacles matter more than hiring discrimination?</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'GDP per person',d:'The value of everything an economy produces in a year, divided by its population.'},
  {t:'Allocation of talent',d:'How well people are matched to the work they would do best.'},
  {t:'Working paper',d:'Research shared before peer review; useful, but less settled.',lvl:'honors'},
  {t:'Misallocation',d:'Resources or people used where they produce less than they could elsewhere.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Martin Luther King Jr., “Letter from Birmingham Jail” (April 16, 1963). Chang-Tai Hsieh, Erik Hurst, Charles I. Jones and Peter J. Klenow, “The Allocation of Talent and U.S. Economic Growth,” <i>Econometrica</i> 87(5) (2019): 94% vs. 62%; 20% to 40% of growth; 36% and 8%. Shelby Buckman, Laura Choi, Mary Daly and Lily Seitelman, “The Economic Gains from Equity,” Federal Reserve Bank of San Francisco Working Paper 2021-11: $2.6 trillion (2019), $70.8 trillion (1990–2019). U.S. GDP 2019 about $21.4 trillion (BEA); population about 328 million (Census). <i>Catechism of the Catholic Church</i>, 1939.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>These are estimates from models; no one can observe the economy that did not happen.</li><li>Dollars capture only part of what exclusion costs; dignity has no price.</li><li>An average per person hides who bears the cost most.</li></ul>'
};
BioLab.register(SIM);
})();
