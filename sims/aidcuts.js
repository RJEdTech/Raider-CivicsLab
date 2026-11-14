(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Cutting foreign aid: food and disease. Reading budget shares, measured effects and modeled projections.
   KFF Health Tracking Poll (Feb 2025, published Mar 4, 2025): on average adults guess foreign aid is 26% of the federal budget; it is about 1%;
   11% guess 1% or less. Cavalcanti et al., The Lancet (June 30, 2025): U.S. citizens contributed about 17 cents a day (about $64 a year) to
   USAID; in 133 countries, 2001-2021, high USAID funding was associated with 15% lower all-cause mortality and 32% lower under-5 mortality
   (HIV/AIDS -74%, malaria -53%, neglected tropical diseases -51%), an estimated 91 million deaths averted. Forecast: if the 2025 cuts
   (83% of programs) continue, more than 14 million additional deaths by 2030 (range about 8 to 19 million), 4.5 million of them children under 5.
   Impact Counter (Brooke Nichols, Boston University; modeled; as reported Jan 21, 2026): more than 750,000 deaths, over 500,000 of them children.
   KFF: about 80% of 770 USAID global health awards (about $12.7 billion) terminated. Disbursements more than halved, to about $32 billion, in 2025.
   USAID closed July 1, 2025; remaining programs moved to the State Department. America First Global Health Strategy (State Department,
   Sept 18, 2025): multi-year bilateral agreements with 71 countries, aimed at self-reliance; it says 60% of spending went to non-frontline costs.
   Center for Global Development: 63% of PEPFAR's 2024 funds directly enabled lifesaving treatment. Catechism 2439. */
const AVG=26,ACT=1,PERYR=64,CENTS=100*PERYR/365;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f1=v=>(+v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}
function tag(ctx,t,xr,y,bg,size){ctx.font='700 '+size+'px '+FONT;const w=ctx.measureText(t).width+size*1.1;pill(ctx,t,xr-w/2,y,bg,'#fff',size);}

const SIM={
 id:'aidcuts',hash:'aidcuts',apUnit:2,order:6,tab:'Cutting foreign aid',kind:'Learning tool',prereq:['budget'],next:['milspend'],
 skills:{bio:'Percent of a whole, and turning a yearly cost into a daily one · Algebra 1 (Unit 2), US Government (Unit 2: the power of the purse), Social Justice (Poverty)',
  honors:'Measured effects vs. modeled projections, and reading a range · Statistics (Chapter 4), AP Macroeconomics (Unit 3: fiscal policy)',
  ap:'Association vs. causation in a cross-country study · Statistics (Chapter 4), AP Statistics (Unit 3)'},
 card:'Guess what share of the federal budget went to foreign aid, then see what happened to food and disease programs after the 2025 cuts, and how good each estimate is.',
 title:'Cutting foreign aid: food and disease',
 lede:{bio:'In 2025 the U.S. cut most foreign aid programs and closed USAID. Start with how big foreign aid was, then read what the cuts meant for food and disease, and which numbers are counts and which are models.',
  honors:'The numbers on the effects of the 2025 aid cuts are mostly models. Learn to read a projection and its range, and to weigh the State Department’s case for a new approach.',
  ap:'The best-known estimate comes from comparing countries that got more or less aid. Ask what such a study can show about cause and effect.'},
 scale:'United States and 133 low- and middle-income countries, 2001 to 2030. KFF, The Lancet, Boston University and the State Department; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: foreign aid as a share of the federal budget',type:'range',min:0,max:40,step:1,def:10,unit:'%'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'act',label:'Foreign aid share of the federal budget (before 2025)',unit:'%',d:0,min:0,max:40,get:s=>shown(s)?ACT:null},
  {id:'avg',label:'Average adult’s guess (KFF poll)',unit:'%',d:0,min:0,max:40,get:s=>shown(s)?AVG:null},
  {id:'day',label:'Cost to each American per day (USAID)',unit:'¢',d:1,min:0,max:100,get:s=>shown(s)?CENTS:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  /* left: the federal budget as 100 squares */
  txt(ctx,'Federal budget: 100 squares',20,18,{s:14*k,w:700,b:'middle'});
  const c=24,gx=20,gy=38;
  for(let i=0;i<100;i++){const x=gx+(i%10)*c,y=gy+Math.floor(i/10)*c;ctx.fillStyle=(sh&&i===0)?'#c8102e':PAL['cv-bg2'];rr(ctx,x+1,y+1,c-3,c-3,3);ctx.fill();
   if(gv!=null&&!sh&&i<gv){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;rr(ctx,x+2,y+2,c-5,c-5,3);ctx.stroke();}
   if(s===1&&ONT&&i<AVG){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;rr(ctx,x+2,y+2,c-5,c-5,3);ctx.stroke();}}
  let ly=gy+10*c+14*k;
  if(sh){txt(ctx,big?'■ foreign aid ≈ 1%':'■ foreign aid ≈ 1% (1 square = 1%)',gx,ly,{s:12.5*k,w:700,c:'#c8102e',b:'middle'});ly+=18*k;txt(ctx,'□ average guess: 26%',gx,ly,{s:12.5*k,w:700,c:PAL['s4'],b:'middle'});ly+=22*k;}
  else if(gv!=null){txt(ctx,'outlined: your gut, '+gv+'%',gx,ly,{s:12.5*k,w:700,c:PAL['s4'],b:'middle'});ly+=22*k;}
  if(s===1&&ONT)ring(ctx,gx-6,gy-6,10*c+10,10*c+10);
  if(sh&&s>=2){txt(ctx,big?'$64 ÷ 365 ≈ 17.5¢ a day':'USAID: about $64 a year per American',gx,ly,{s:12.5*k,w:700,b:'middle'});ly+=18*k;
   if(!big){txt(ctx,`$64 ÷ 365 ≈ ${f1(CENTS)}¢ a day`,gx,ly,{s:14*k,w:700,c:PAL['s1'],b:'middle'});ly+=18*k;}
   if(s===2&&ONT)ring(ctx,gx-6,ly-(big?30:48)*k,250,(big?28:46)*k);}
  /* right: what happened and what the estimates say */
  const RX=290,RW=W-RX-16;let y=16;
  const rowBox=(h,on)=>{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW,h,8);ctx.fill();if(on&&ONT)ring(ctx,RX-4,y-4,RW+8,h+8);};
  const vis=n=>s===99?sh:s>=n;
  if(vis(3)){const h=big?52:58;rowBox(h,s===3);txt(ctx,'2025: what changed',RX+10,y+14*k,{s:12.5*k,w:700,b:'middle'});
   wrap(ctx,big?'Aid frozen in Jan.; 83% of USAID programs cut; USAID closed July 1.':'Aid frozen in January; 83% of USAID programs canceled in March; USAID closed July 1 and its remaining programs moved to the State Department.',RX+10,y+31*k,RW-20,{s:11.5*k,b:'middle'});y+=h+6;}
  if(vis(4)){const h=big?122:96;rowBox(h,s===4);txt(ctx,big?'Before: 2001–2021':'Before the cuts, 2001–2021 (measured association)',RX+10,y+14*k,{s:12.5*k,w:700,b:'middle'});tag(ctx,'study',RX+RW-8,y+14*k,'#8a4fbf',11*k);
   const bars=[['All deaths',15],['Under age 5',32],['Malaria',53],['HIV/AIDS',74]],bx=RX+(big?96:110),bw=RW-(big?150:170);
   bars.forEach((b,i)=>{const yy=y+(32+i*15)*k;txt(ctx,big&&b[0]==='Under age 5'?'Under 5':b[0],RX+10,yy,{s:11*k,w:700,b:'middle'});ctx.fillStyle='#2f9e44';rr(ctx,bx,yy-5,bw*b[1]/80,10,3);ctx.fill();txt(ctx,'−'+b[1]+'%',bx+bw*b[1]/80+5,yy,{s:11*k,w:700,b:'middle'});});
   y+=h+6;}
  if(vis(5)){const h=big?82:66;rowBox(h,s===5);txt(ctx,big?'Projection to 2030 (model)':'If the cuts continue: extra deaths by 2030 (model)',RX+10,y+14*k,{s:12.5*k,w:700,b:'middle'});tag(ctx,'model',RX+RW-8,y+14*k,'#b5650d',11*k);
   const ax=RX+16,aw=RW-60,X=v=>ax+aw*v/20,yy=y+36*k;ctx.fillStyle=PAL['cv-bg'];rr(ctx,ax,yy-5,aw,10,4);ctx.fill();ctx.fillStyle='#e0a10b';rr(ctx,X(8),yy-5,X(19)-X(8),10,4);ctx.fill();
   ctx.fillStyle='#c8102e';ctx.beginPath();ctx.arc(X(14),yy,6,0,7);ctx.fill();
   txt(ctx,'8M',X(8),yy+14*k,{s:10.5*k,a:'center',b:'middle'});txt(ctx,'14M',X(14),yy+14*k,{s:10.5*k,w:700,a:'center',b:'middle',c:'#c8102e'});txt(ctx,'19M',X(19),yy+14*k,{s:10.5*k,a:'center',b:'middle'});
   y+=h+6;}
  const by=Math.max(y,180),bh=H-by-12;
  if(s===5&&!big&&bh>60)box(ctx,k,RX,by,RW,bh,'Reading a projection',['The Lancet’s best estimate is 14 million, with a range of about 8 to 19 million; 4.5 million would be children under 5.','A model running from Boston University estimated more than 750,000 deaths by January 2026.']);
  else if(s===6&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'How good are these numbers?',big?['Most are models, not counts.','Other donors and continued programs may not be fully counted.']:['Most are models, not death counts. The modeler behind one tracker says the error bars are wide.','The Lancet study compares countries with more and less aid; other donors’ money can follow the same countries.']);
  else if(s===7&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'The State Department’s case',big?['New two-way deals with 71 countries, aimed at self-reliance.','Says 60% of spending was overhead.']:['America First Global Health Strategy (2025): multi-year agreements with 71 countries, aiming for self-reliance, focused on HIV, TB and malaria.','It says 60% of spending was overhead; one think tank found 63% of HIV-program money went directly to treatment.']);
  else if(s===8)box(ctx,k,RX,by,RW,bh,'What the Church teaches',big?['CCC 2439: rich nations have a grave responsibility to poorer ones.','How to give aid is a prudential question.']:['Catechism 2439: rich nations have a grave moral responsibility toward nations that cannot ensure their own development.','How aid is best delivered is a prudential question. Discuss: what would you want measured?']);
 },
 narrate(sim){if(!shown(sim))return `What share of the federal budget do you think went to foreign aid before 2025? Your gut: ${sim.p.guess}%.`;
  return `Foreign aid was about <b>1%</b> of the federal budget; the average adult guessed <b>26%</b>. USAID cost each American about $64 a year, about <b>${f1(CENTS)} cents a day</b>. Estimates of what the 2025 cuts mean for food and disease are mostly models.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Before 2025, what share of the federal budget do you think the U.S. spent on foreign aid? Drag to your gut guess, then lock it in.',honors:'Drag to your gut guess of foreign aid’s share of the federal budget before 2025, then lock it in.'},
  hint:{bio:'Lock in your gut. A 2025 poll asked adults the same question.'},
  lock(sim){return {v:Math.abs(sim.p.guess-ACT),guess:sim.p.guess,label:`${sim.p.guess}%`};},
  solve(sim){sim.p.guess=ACT;return {v:0,guess:ACT,label:'about 1% (KFF)'};},
  calc:{unit:'cents',d:1,tol:0.3,
   prompt:{bio:'The <i>Lancet</i> authors estimate USAID cost each American about <b>$64 a year</b>. About how many cents is that per day? Round to one decimal place.',ap:'USAID cost per American: about $64 a year. Convert to cents per day, to one decimal place.'},
   answer:()=>+CENTS.toFixed(1),hint:'$64 ÷ 365 days, then × 100 for cents.',
   steps:()=>['$64 ÷ 365 = $0.175 a day.',`× 100 = <b>${f1(CENTS)} cents</b> a day (the authors round to about 17 cents).`]},
  formula:()=>`$64 ÷ 365 × 100 = ${f1(CENTS)}¢ a day`+(atLeast('honors')?'<br>Projection: 14 million (range 8 to 19 million) extra deaths by 2030, a model':''),
  how:{bio:'Turn a yearly amount into a daily one by dividing by 365.',honors:'Ask whether a number is a count or a model, and read its range, not just its middle.'},
  compare(sim,g){const off=Math.abs(g.guess-ACT);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the daily cost yourself.':'';
   return (off<=2?'Close: foreign aid was about 1%.':`You guessed ${g.guess}%. It was about <b>1%</b>.`)+' In a 2025 KFF poll, the average adult guessed 26%, and only 11% guessed 1% or less.'+self;},
  again(sim){sim.p.guess=10;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In the KFF poll the average guess was 26%; the real share was about 1%. How many times too big was the average guess?',answer:26,tol:0.5,unit:'times',d:0,hint:'26 ÷ 1.',explain:'26 ÷ 1 = 26 times too big.'},
  {lvl:'bio',instant:true,q:'The Lancet estimate of 14 million extra deaths by 2030 is which kind of number?',choices:['A count of deaths that have been recorded','A projection from a model, with a range of about 8 to 19 million','A guess with no method'],correct:1,explain:'It projects what could happen if the cuts continue, using effects estimated from past data.'},
  {lvl:'bio',kind:'num',q:'The Lancet study projects 4.5 million of the 14 million extra deaths would be children under 5. What percent is that? Round to the nearest whole percent.',answer:100*4.5/14,tol:0.6,unit:'%',d:0,hint:'4.5 ÷ 14 × 100.',explain:'4.5 ÷ 14 × 100 ≈ 32%: about 1 in 3.'},
  {lvl:'honors',kind:'num',q:'Under new bilateral agreements, the U.S. committed $12.7 billion and partner governments $7.8 billion. What share did the partner countries put in? Round to the nearest whole percent.',answer:100*7.8/(12.7+7.8),tol:0.6,unit:'%',d:0,hint:'7.8 ÷ (12.7 + 7.8) × 100.',explain:'7.8 ÷ 20.5 × 100 ≈ 38%.'},
  {lvl:'honors',instant:true,q:'A projection says “14 million (8 to 19 million).” What is the best way to report it?',choices:['Exactly 14 million will die','Somewhere around 8 to 19 million, with 14 million the central estimate, if the cuts continue','The number is meaningless'],correct:1,explain:'Report the range and the condition, not just the middle.'},
  {lvl:'ap',instant:true,q:'The Lancet study found countries with more USAID money had lower death rates. What could make this association overstate USAID’s effect?',choices:['Other donors’ aid going to the same countries at the same time','Using data from 133 countries','Looking at 20 years'],correct:0,explain:'If other help rises with USAID funding, part of the effect could belong to it. The authors adjust for many factors, but not everything.'}
 ],
 tour:[
  {title:'How big was foreign aid?',text:'Picture the federal budget as 100 squares. In a 2025 KFF poll, the average adult guessed foreign aid took 26 of them (outlined). The real share was about 1 square: about 1% of the budget.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Per person, per day',text:'The <i>Lancet</i> authors estimate USAID cost each American about $64 a year. $64 ÷ 365 ≈ 17.5 cents a day.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'What changed in 2025',text:'Aid was frozen in January 2025. In March, 83% of USAID programs were canceled; KFF found about 80% of 770 global health awards (about $12.7 billion) ended. USAID closed July 1, 2025, and its remaining programs moved to the State Department. Clinics lost supplies of therapeutic food for malnourished children and malaria tests.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Before the cuts',text:'A study in <i>The Lancet</i> compared 133 countries from 2001 to 2021. Where USAID spent the most, deaths from all causes were 15% lower and deaths of children under 5 were 32% lower; malaria deaths 53% lower and HIV/AIDS deaths 74% lower. The authors estimate 91 million deaths were averted.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'A projection, with a range',text:'Using those effects, the authors projected that if the cuts continue, about 14 million more people could die by 2030 (range about 8 to 19 million), 4.5 million of them children under 5. A separate model from Boston University estimated more than 750,000 deaths by January 2026. These are models, not counts.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'How good are these numbers?',text:'The modeler behind the Boston University tracker says its error bars are wide and that it may overestimate in some ways. The <i>Lancet</i> study compares countries; if other donors gave more to the same places, part of the effect may be theirs. Some programs also continued under waivers.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'The State Department’s case',text:'The State Department argued the old system was wasteful and released the America First Global Health Strategy (September 2025): multi-year agreements with 71 countries, aiming for self-reliance, focused on HIV, TB, malaria and outbreaks. It says 60% of spending was overhead; the Center for Global Development found 63% of HIV-program money directly paid for treatment.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'What the Church teaches',text:'The Catechism (2439) teaches that rich nations have a grave moral responsibility toward nations unable to ensure their own development. How aid is best delivered (through which agency, with which conditions) is a prudential question. Discuss: what would you want measured before deciding?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How big was foreign aid, and what do the estimates say?</p><ol><li>Lock in your gut, then work out USAID’s cost per American per day.</li><li>Sort the numbers into counts, measured associations and models.</li></ol><p>Write one sentence reporting the 2030 projection with its range.</p>',
  honors:'<p><b>Question:</b> How good is each number?</p><ol><li>For the <i>Lancet</i> projection and the Boston University tracker, say how each was made.</li><li>Give one reason each could be too high and one reason it could be too low.</li></ol>',
  ap:'<p><b>Question:</b> What can a cross-country study show?</p><ol><li>State the association the <i>Lancet</i> study found.</li><li>Name a confounding variable and say which way it would push the estimate.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Foreign aid',d:'Money and goods a country gives or lends abroad for health, food, development and emergencies.'},
  {t:'Projection',d:'A model’s estimate of what will happen under stated conditions, usually with a range.'},
  {t:'Range',d:'The low and high ends a model considers likely, around a central estimate.',lvl:'honors'},
  {t:'Confounding',d:'When something else, linked to both the cause and the outcome, explains part of an association.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> KFF Health Tracking Poll, February 2025 (published March 4, 2025): average guess 26%, actual about 1%, 11% guessed 1% or less. Cavalcanti and others, “Evaluating the impact of two decades of USAID interventions and projecting the effects of defunding on mortality up to 2030,” <i>The Lancet</i> (June 30, 2025; <a href="https://doi.org/10.1016/S0140-6736(25)01186-9" target="_blank" rel="noopener">doi</a>): about 17 cents a day ($64 a year) per citizen; 15% and 32% lower mortality; HIV/AIDS 74%, malaria 53%; 91 million deaths averted; 14 million projected (range reported by NPR as 8 to 19 million), 4.5 million children under 5. Impact Counter, Brooke Nichols, Boston University (modeled; figures as reported January 21, 2026). KFF on terminated global health awards. State Department, <i>America First Global Health Strategy</i> (September 18, 2025); Center for Global Development on PEPFAR spending; World Finance on agreement amounts ($12.7 billion U.S., $7.8 billion co-financing). <i>Catechism of the Catholic Church</i>, 2439.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Death estimates are modeled; in most affected countries deaths are not recorded well enough to count directly.</li><li>A national budget share hides how much each program did; aid ranged from vaccines to military training.</li><li>Other donors also cut aid in 2025, which makes the U.S. share of any effect harder to separate.</li></ul>'
};
BioLab.register(SIM);
})();
