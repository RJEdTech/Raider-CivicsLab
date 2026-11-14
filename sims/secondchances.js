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
/* Second chances: what happens after prison, and what helps (Tattoos on the Heart; Fr. Greg Boyle, S.J., Homeboy Industries).
   BJS, Recidivism of Prisoners Released in 34 States in 2012 (July 2021; about 408,300 released): 62% arrested within 3 years, 71% within 5;
   46% returned to prison within 5 years; by age 81% (24 or younger), 74% (25-39), 61% (40+); yearly arrest share fell from 37% (year 1) to 26% (year 5).
   Colorado (Common Sense Institute, from CDOC): 3-year return rate 51.8% (2019) -> 30.6% (2022); FY2022 average cost $56,766 per person per year;
   people who kept a job one year after release returned at 16%. Milwaukee Prisoner Reentry Initiative (randomized; Braga, Cook, Kang, Ludwig,
   O'Brien; J-PAL): raised employment and lowered re-arrest, but no clear difference in reincarceration. Homeboy Industries: about 9,000 people a
   year; paid 18-month program; its STAR evaluation got a low causal-evidence rating (DOL CLEAR). Catechism 2266; USCCB, Responsibility,
   Rehabilitation, and Restoration (2000). */
const REL=408300,A5=71,A3=62;
const f0=v=>Math.round(v).toLocaleString('en-US');
const SIM={
 id:'secondchances',hash:'secondchances',apUnit:3,order:8,tab:'Second chances',kind:'Learning tool',prereq:['crimecount'],next:['pitcount'],
 skills:{bio:'Percent of a large group, and reading a rate that changes with age · Algebra 1 (Unit 2), Junior Theology (Unit 4: Tattoos on the Heart), Sociology (Deviance)',
  honors:'Correlation vs. a randomized test: does a job lower re-arrest, or do people who would stay out find jobs? · Statistics (Chapter 4)',
  ap:'Expected cost: turning a change in a rate into dollars · Statistics (Chapter 5), AP Microeconomics (Unit 6)'},
 card:'Guess how many people released from prison are arrested again within five years, then see what changes the odds and what the evidence on jobs and programs like Homeboy Industries can and cannot show.',
 title:'Second chances',
 lede:{bio:'Fr. Greg Boyle, S.J., built Homeboy Industries on one idea: nothing stops a bullet like a job. See what happens after people leave prison, and what helps.',
  honors:'People with jobs return to prison less often. But is that the job, or the person? Compare a simple comparison with a randomized test.',
  ap:'If a program lowers the return rate, how much does that save? Turn a change in a rate into an expected cost.'},
 scale:'United States (34 states, 2012 releases) and Colorado. Bureau of Justice Statistics, Colorado Department of Corrections and program evaluations; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: of 100 people released from state prison, how many are arrested again within 5 years?',type:'range',min:0,max:100,step:1,def:30,unit:''},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'a5',label:'Arrested within 5 years (2012 releases)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?A5:null},
  {id:'a3',label:'Arrested within 3 years',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?A3:null},
  {id:'p5',label:'Returned to prison within 5 years',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?46:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  txt(ctx,'100 people released',20,18,{s:14*k,w:700,b:'middle'});
  const c=24,gx=22,gy=44;
  for(let i=0;i<100;i++){const x=gx+(i%10)*c+10,y=gy+Math.floor(i/10)*c+12;let cc=PAL['cv-bg2'];
   if(sh&&s!==1){if(i<46)cc='#c8102e';else if(i<A5)cc='#e0a10b';}else if(!sh&&gv!=null&&i<gv)cc=PAL['s4'];
   ctx.fillStyle=cc;ctx.beginPath();ctx.arc(x,y-5,4.3,0,7);ctx.fill();rr(ctx,x-5,y,10,9,3);ctx.fill();}
  let ly=gy+10*c+16*k;
  if(sh&&s!==1){txt(ctx,big?'● back in prison: 46':'● back in prison in 5 years: 46',gx,ly,{s:12*k,w:700,c:'#c8102e',b:'middle'});ly+=18*k;txt(ctx,big?'● arrested only: 25':'● arrested, not reimprisoned: 25',gx,ly,{s:12*k,w:700,c:'#b5650d',b:'middle'});ly+=20*k;txt(ctx,'71 of 100 arrested',gx,ly,{s:14*k,w:700,c:PAL['s1'],b:'middle'});}
  else if(gv!=null&&!sh)txt(ctx,'your gut: '+gv+' of 100',gx,ly,{s:12.5*k,w:700,c:PAL['s4'],b:'middle'});
  if(s===2&&ONT)ring(ctx,gx-6,gy-6,10*c+12,10*c+12+62*k);
  const RX=292,RW=W-RX-14,PY=14,PH=H-28;
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'Tattoos on the Heart');y=lines(ctx,k,RX+12,y,RW-24,big?['Fr. Greg Boyle, S.J., founded Homeboy Industries in 1988.','About 9,000 people a year come through its doors.']:['Fr. Greg Boyle, S.J., founded Homeboy Industries in Los Angeles in 1988. About 9,000 people a year come through its doors; trainees work in a paid 18-month program.','His conviction: people are more than the worst thing they have done. What do the numbers say about life after prison?']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'After prison','BJS','#2b5fb3');y=lines(ctx,k,RX+12,y,RW-24,big?['62% arrested within 3 years; 71% within 5.','46% back in prison within 5 years.']:['The Bureau of Justice Statistics followed about 408,300 people released from state prisons in 2012.','62% were arrested within 3 years and 71% within 5. 46% were back in prison within 5 years, for a new crime or a parole violation.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Age and time matter');y=hbars(ctx,k,RX+12,y+4,RW-24,[['24 or younger',81,'#c8102e'],['25 to 39',74,'#e0a10b'],['40 or older',61,'#2b5fb3']],90,'#2b5fb3');
   lines(ctx,k,RX+12,y+8,RW-24,big?['Year 1: 37% arrested; year 5: 26%.']:['Arrested within 5 years, by age at release. The risk is highest in the first year (37% arrested) and falls each year after (26% in year 5): the first months home matter most.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'Colorado');y=lines(ctx,k,RX+12,y,RW-24,big?['3-year return: 51.8% (2019) → 30.6% (2022).','Cost: $56,766 per person per year.','With a job for a year: 16% returned.']:['Colorado’s 3-year return-to-prison rate fell from 51.8% (2019) to 30.6% (2022).','A year in prison cost about $56,766 per person (FY2022).','People who kept a job for a year after release returned at just 16%.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Is it the job?');y=lines(ctx,k,RX+12,y,RW-24,big?['16% vs. 31% compares different people.','Milwaukee lottery: jobs up, re-arrests down.']:['The 16% compares people who kept jobs with everyone else; people who kept jobs may have differed in other ways.','A randomized test in Milwaukee gave some people jobs, training and support by lottery: employment rose and re-arrests fell, though returns to prison did not clearly change.','Homeboy’s own studies are promising but not randomized.']);}
  else if(s===6&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'What would it save?','model','#b5650d');y=lines(ctx,k,RX+12,y,RW-24,big?['1,000 released; returns 31% → 16%.','150 fewer × $56,766 ≈ $8.5M a year.']:['Suppose 1,000 people are released and a program cut returns from 31% to 16%: 150 fewer people in prison.','150 × $56,766 ≈ $8.5 million a year, before counting what they earn and pay in taxes. A model: it assumes the program causes the drop.']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'Punishment that heals');y=lines(ctx,k,RX+12,y,RW-24,big?['CCC 2266: punishment should help correct the offender.','Discuss: what would a second chance look like?']:['The Catechism (2266) teaches that punishment protects the common good and should, as far as possible, contribute to the correction of the offender. The U.S. bishops call for responsibility, rehabilitation and restoration.','Discuss: from these numbers, where would a second chance help most?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,170,'After prison (2012 releases)');lines(ctx,k,RX+12,y,RW-24,['71% arrested within 5 years; 46% back in prison.','Highest risk: the first year, and the youngest.']);}
 },
 narrate(sim){if(!shown(sim))return `Of every 100 people released from state prison, how many are arrested again within 5 years? Your gut: ${sim.p.guess}.`;
  return `<b>71 of 100</b> people released in 2012 were arrested within 5 years, and 46 were back in prison. The risk is highest in the first year, which is why jobs and support right after release matter.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Think of 100 people released from state prison. How many do you think are arrested again within 5 years? Drag to your gut guess, then lock it in.',honors:'Drag to your gut guess: of 100 people released, how many are arrested within 5 years?'},
  hint:{bio:'Lock in your gut. Then you will scale the rate up to everyone released.'},
  lock(sim){return {v:Math.abs(sim.p.guess-A5),guess:sim.p.guess,label:`${sim.p.guess} of 100`};},
  solve(sim){sim.p.guess=A5;return {v:0,guess:A5,label:'71 of 100 (BJS, 2012 releases)'};},
  calc:{unit:'people',d:0,tol:500,
   prompt:{bio:'The BJS study represents about <b>408,300</b> people released in 2012. <b>71%</b> were arrested within 5 years. About how many people is that? Round to the nearest thousand.',ap:'408,300 released; 71% arrested within 5 years. How many people, to the nearest thousand?'},
   answer:()=>Math.round(REL*0.71/1000)*1000,hint:'0.71 × 408,300.',
   steps:()=>['0.71 × 408,300 = 289,893.',`About <b>${f0(Math.round(REL*0.71/1000)*1000)}</b> people, each with a family and a neighborhood.`]},
  formula:()=>'0.71 × 408,300 ≈ 290,000 people arrested within 5 years'+(atLeast('honors')?'<br>AP model: 150 fewer returns × $56,766 ≈ $8.5M a year':''),
  how:{bio:'Multiply a percent by the total to find how many people.',honors:'Ask whether a comparison is between similar people, or whether a lottery made them similar.'},
  compare(sim,g){const off=Math.abs(g.guess-A5);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You scaled it up yourself.':'';
   return (off<=5?'Close: about 7 in 10.':`You guessed ${g.guess} of 100. BJS found <b>71 of 100</b>.`)+' Most people guess lower. The first months after release are when help matters most.'+self;},
  again(sim){sim.p.guess=30;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'62% were arrested within 3 years and 71% within 5. How many more of every 100 were arrested in years 4 and 5?',answer:9,tol:0,unit:'people',d:0,hint:'71 − 62.',explain:'9 more of every 100: most arrests come early.'},
  {lvl:'bio',kind:'num',q:'Colorado’s 3-year return rate fell from 51.8% to 30.6%. Of every 1,000 people released, how many fewer return?',answer:212,tol:1,unit:'people',d:0,hint:'(51.8 − 30.6) × 10.',explain:'21.2 points × 10 = 212 fewer of every 1,000.'},
  {lvl:'bio',instant:true,q:'People who kept a job for a year returned to prison at 16%, far below average. What can you conclude?',choices:['Jobs alone cause the whole difference','Jobs may help, but people who keep jobs may differ in other ways; a randomized test is stronger','Jobs make no difference'],correct:1,explain:'A comparison of different people is not a test. The Milwaukee lottery is stronger evidence.'},
  {lvl:'honors',kind:'num',q:'81% of people 24 or younger were arrested within 5 years, vs. 61% of those 40 or older. How many percentage points higher?',answer:20,tol:0,unit:'points',d:0,hint:'81 − 61.',explain:'20 points: the youngest are at highest risk, which is why Homeboy focuses on young people.'},
  {lvl:'ap',kind:'num',q:'A program serving 500 released people cuts returns from 30% to 20%. At $56,766 per person per year, about how much a year does that save? Round to the nearest thousand dollars.',answer:50*56766,tol:1000,unit:'$',d:0,hint:'500 × 0.10 = 50 fewer people; × $56,766.',explain:'50 × $56,766 ≈ $2,838,000 a year, if the program causes the drop.'}
 ],
 tour:[
  {title:'Tattoos on the Heart',text:'Fr. Greg Boyle, S.J., founded Homeboy Industries in Los Angeles in 1988. About 9,000 people a year come through its doors, and trainees work in a paid 18-month program. What do the numbers say about life after prison?',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'After prison',text:'The Bureau of Justice Statistics followed about 408,300 people released from state prisons in 2012. 62% were arrested within 3 years and 71% within 5; 46% were back in prison within 5 years.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Age and time matter',text:'The youngest were most likely to be arrested again (81% of those 24 or younger, vs. 61% of those 40 or older). The risk is highest in the first year after release and falls each year.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Colorado',text:'Colorado’s 3-year return rate fell from 51.8% (2019) to 30.6% (2022). A year in prison cost about $56,766 per person. People who kept a job for a year after release returned at 16%.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Is it the job?',text:'The 16% compares different people. In Milwaukee, a lottery decided who got jobs, training and support: employment rose and re-arrests fell, though returns to prison did not clearly change. Homeboy’s own studies are promising but not randomized.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'What would it save?',text:'Suppose 1,000 people are released and a program cuts returns from 31% to 16%: 150 fewer people in prison, about $8.5 million a year at $56,766 each. That model assumes the program causes the drop.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Punishment that heals',text:'The Catechism (2266) teaches that punishment should protect the common good and, as far as possible, contribute to the correction of the offender. The U.S. bishops call for responsibility, rehabilitation and restoration. Discuss: from these numbers, where would a second chance help most?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What happens after prison?</p><ol><li>Lock in your gut, then scale 71% up to everyone released in 2012.</li><li>Read the rates by age.</li></ol><p>Write one sentence on when help after release matters most, and why.</p>',
  honors:'<p><b>Question:</b> Do jobs lower re-arrest?</p><ol><li>Compare the Colorado 16% with the Milwaukee lottery.</li><li>Explain what each can and cannot show.</li></ol>',
  ap:'<p><b>Question:</b> What is a second chance worth?</p><ol><li>Build the expected-cost model for a program of your choice.</li><li>Name the assumption that matters most.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Recidivism',d:'Returning to crime after a sentence, measured by re-arrest, reconviction or return to prison.'},
  {t:'Reentry',d:'The return home from prison: housing, work, family and parole.'},
  {t:'Randomized test',d:'A study that uses a lottery to decide who gets a program, so the groups are alike otherwise.',lvl:'honors'},
  {t:'Expected cost',d:'Probability × cost, added up over people.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Bureau of Justice Statistics, <i>Recidivism of Prisoners Released in 34 States in 2012: A 5-Year Follow-Up Period (2012–2017)</i> (July 2021). Common Sense Institute, Colorado recidivism and incarceration reports (2025), from Colorado Department of Corrections data. Braga, Cook, Kang, Ludwig and O’Brien, Milwaukee Prisoner Reentry Initiative (J-PAL summary). Homeboy Industries fact sheet; U.S. Department of Labor CLEAR review of the STAR program. Gregory Boyle, S.J., <i>Tattoos on the Heart</i> (2010). <i>Catechism of the Catholic Church</i>, 2266; USCCB, <i>Responsibility, Rehabilitation, and Restoration</i> (2000).</p>'+
  '<p><b>What this number hides.</b></p><ul><li>An arrest is not a conviction; some arrests are for parole rules, not new crimes.</li><li>States measure recidivism differently, so compare rates with care.</li><li>Each number is a person coming home to a family and a neighborhood.</li></ul>'
};
BioLab.register(SIM);
})();
