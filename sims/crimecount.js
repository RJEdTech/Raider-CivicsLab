(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* The dark figure of crime: what police records count and what victims report.
   BJS, Criminal Victimization, 2024 (NCJ 310547, Sept 2025), legacy NCVS: 23.3 violent victimizations per 1,000 persons age 12+,
   11.2 per 1,000 reported to police, 6.7 million violent victimizations. Reported to police, 2024: robbery 73%, aggravated
   assault 69%, simple assault 40%, rape/sexual assault 24%. Redesigned NCVS, 2024: 28.7 per 1,000 (23% higher).
   FBI, Reported Crimes in the Nation, 2024: 359.1 violent crimes per 100,000; murder 5.0 per 100,000 (6.7 in 2020, 4.4 in 2014). */
const N={vic:23.3,rep:11.2,count:6.7,redesign:28.7,fbi:359.1,mur24:5.0,mur20:6.7,mur14:4.4};
const TYPES=[['Robbery',73],['Aggravated assault',69],['Simple assault',40],['Rape or sexual assault',24]];
const SHARE=100*N.rep/N.vic;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;
 lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}

const SIM={
 id:'crimecount',hash:'crimecount',apUnit:3,order:4,tab:'The dark figure of crime',kind:'Learning tool',next:['claims','whatmoved'],
 skills:{bio:'Percent of a whole and “total = reported ÷ share” · Algebra 1 (Unit 2: proportions), Sociology (Unit 5: deviance and crime)',
  honors:'Rates per 1,000 and per 100,000, and checking that two numbers count the same thing · Algebra 1 (Unit 2), Sociology (Unit 5), Statistics (Chapter 1)',
  ap:'Measurement: how the survey question changes the estimate · Statistics (Chapter 4: collecting data), AP Statistics (Unit 3)'},
 card:'Guess how many violent crimes are ever reported to police, then work out the share from the national victim survey and see what the police count misses.',
 title:'The dark figure of crime',
 lede:{bio:'Police can only count crimes they hear about. A national survey asks people directly whether they were victims. Compare the two and find the “dark figure”: crime that never reaches a police record.',
  honors:'Two national measures disagree because they count different crimes, different people and different units. Put both on the same scale before you compare them.',
  ap:'A survey’s answer depends on its questions. The same year measured with a redesigned questionnaire gave a different rate. Ask what each number really measures.'},
 scale:'United States, 2024. Victim survey: people age 12 and older (BJS). Police records: FBI.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: of every 100 violent crimes, how many are reported to police?',type:'range',min:0,max:100,step:1,def:80,unit:''},
  {id:'reveal',label:'Show the survey numbers now',type:'toggle',def:false,noGut:true,help:'Normally the numbers appear once you lock in your gut and work it out.'}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'vic',label:'Violent victimizations per 1,000 people (survey)',unit:'',d:1,min:0,max:40,get:s=>shown(s)?N.vic:null},
  {id:'rep',label:'Reported to police, per 1,000 people',unit:'',d:1,min:0,max:40,get:s=>shown(s)?N.rep:null},
  {id:'share',label:'Share reported to police',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?SHARE:null},
  {id:'per100k',label:'Survey rate per 100,000',unit:'',d:0,lvl:'honors',min:0,max:4000,get:s=>shown(s)?N.vic*100:null},
  {id:'fbi',label:'FBI violent crime rate per 100,000',unit:'',d:1,lvl:'honors',min:0,max:4000,get:s=>N.fbi},
  {id:'redesign',label:'Redesigned survey, same year (per 1,000)',unit:'',d:1,lvl:'ap',min:0,max:40,get:s=>N.redesign}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3,inTour=sim.tour&&sim.tour.on;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: 100 squares = 100 violent victimizations */
  txt(ctx,big?'100 violent crimes, 2024':'100 violent crimes against people, 2024',20,18,{s:14*k,w:700,b:'middle'});
  const cs=big?24:28,gx=24,gy=40,nRep=Math.round(SHARE),S=sim.gutS,gv=inTour?null:(S&&S.g?S.g.guess:sim.p.guess);
  for(let i=0;i<100;i++){const c=i%10,r=(i/10)|0,x=gx+c*(cs+4),y=gy+r*(cs+4);
   const rep=(sh&&s>=2)&&i<nRep;ctx.fillStyle=rep?PAL['s2']:PAL['line'];rr(ctx,x,y,cs,cs,4);ctx.fill();
   if(gv!=null&&!sh&&i<gv){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;rr(ctx,x+1,y+1,cs-2,cs-2,4);ctx.stroke();}}
  const gw=10*(cs+4)-4,gh=gw;let ly=gy+gh+16*k;
  if(sh&&s>=2){txt(ctx,`■ ${nRep} reported to police`,gx,ly,{s:12*k,w:700,c:PAL['s2'],b:'middle'});txt(ctx,`■ ${100-nRep} never reported`,big?gx:gx+gw/2+4,big?ly+16*k:ly,{s:12*k,w:700,c:PAL['cv-soft'],b:'middle'});
   if(s===2)ring(ctx,gx-5,gy-5,gw+10,((nRep/10|0)+1)*(cs+4)+6);}
  else if(gv!=null)txt(ctx,`Your gut: ${gv} of 100 reported (orange outlines)`,gx,ly,{s:12*k,w:700,c:PAL['s4'],b:'middle'});
  /* right panel */
  const RX=gx+gw+30,RW=W-RX-18;let y=24;
  if(s>=3&&sh){txt(ctx,big?'Reported, by crime':'Share reported to police, by crime',RX,y,{s:14*k,w:700,b:'middle'});y+=20*k;
   TYPES.forEach(([l,v])=>{txt(ctx,l,RX,y,{s:12*k,w:700,b:'middle'});txt(ctx,v+'%',RX+RW,y,{s:12*k,w:700,a:'right',b:'middle',c:PAL['s2']});y+=10*k;
    ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW,10,4);ctx.fill();ctx.fillStyle=PAL['s2'];rr(ctx,RX,y,RW*v/100,10,4);ctx.fill();y+=24*k;});
   if(s===3)ring(ctx,RX-6,24+10*k,RW+12,y-24-12*k);}
  else if(!sh){txt(ctx,'The survey asks people directly',RX,y,{s:14*k,w:700,b:'middle'});y+=22*k;
   y+=wrap(ctx,'Every year the Bureau of Justice Statistics interviews about 240,000 people age 12 and older and asks whether they were victims of crime, and whether they told the police.',RX,y,RW,{s:12.5*k,b:'middle'});}
  /* lower right: the step's numbers */
  const by=Math.max(y+8,250),bh=H-by-14;
  if(s===4)box(ctx,k,RX,by,RW,bh,'Total = reported ÷ share reported',['If police record 730 robberies and 73% of robberies are reported, about 730 ÷ 0.73 = 1,000 happened.','A rise in police counts can mean more crime, or more reporting.']);
  else if(s===5&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'Same scale first',[`Survey: 23.3 per 1,000 = 2,330 per 100,000.`,'FBI: 359.1 per 100,000, counting only crimes reported to police, plus murder, and not simple assault.','Different crimes, people and units: convert, then compare.']);
  else if(s===6&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'Same year, new questions',['Old questionnaire: 23.3 per 1,000.','Redesigned questionnaire: 28.7 per 1,000, 23% higher.','28.7 ÷ 23.3 = 1.23.']);
  else if(s===7)box(ctx,k,RX,by,RW,bh,'The best-counted crime',['Murder: 6.7 per 100,000 in 2020, 5.0 in 2024 (FBI).','Nearly every killing is found and recorded, so murder is the most reliable trend.']);
  else if(s===99&&sh)box(ctx,k,RX,by,RW,bh,'The survey’s math',[`11.2 ÷ 23.3 = ${f1(SHARE)}% reported to police.`,'The rest is the dark figure: crime no police record shows.']);
 },
 narrate(sim){if(!shown(sim))return `Police records count only crimes someone reports. Of every 100 violent crimes against people, how many do you think are reported? Your gut right now: <b>${sim.p.guess}</b>.`;
  return `The national victim survey found <b>23.3</b> violent victimizations per 1,000 people in 2024, and <b>11.2</b> per 1,000 were reported to police: about <b>${f1(SHARE)}%</b>. Robbery is reported most often (73%); rape and sexual assault least (24%).`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Police records only count crimes someone reports. Out of every 100 violent crimes against people in 2024 (robbery, assault, rape), how many do you think were reported to police? Drag the slider to your gut guess, then lock it in.',
   honors:'Drag the slider to your gut guess: of every 100 violent victimizations in 2024, how many were reported to police? Then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the real share from the survey’s two rates.'},
  lock(sim){return {v:Math.abs(sim.p.guess-SHARE),guess:sim.p.guess,label:`${sim.p.guess} of 100`};},
  solve(sim){sim.p.guess=Math.round(SHARE);return {v:0,guess:SHARE,label:`${f1(SHARE)} of 100 (BJS survey)`};},
  calc:{unit:'%',d:1,tol:0.6,
   prompt:{bio:'The 2024 national victim survey found <b>23.3</b> violent victimizations per 1,000 people age 12 and older. <b>11.2</b> per 1,000 were reported to police. What percent of violent victimizations were reported?',
    ap:'Violent victimization rate: 23.3 per 1,000. Rate reported to police: 11.2 per 1,000. Same people, same year. What share was reported, as a percent?'},
   answer:()=>+SHARE.toFixed(1),hint:'Part ÷ whole × 100: 11.2 ÷ 23.3 × 100.',
   steps:()=>['Both rates are per 1,000 of the same people, so divide them: 11.2 ÷ 23.3 = 0.481.',`× 100 = <b>${f1(SHARE)}%</b>: about half.`,'The other half, about 52 of every 100, never reached a police record.']},
  formula:()=>`Share reported = 11.2 ÷ 23.3 × 100 = ${f1(SHARE)}%`+(atLeast('honors')?'<br>Total ≈ reported ÷ share reported (for example 730 ÷ 0.73 = 1,000)':''),
  how:{bio:'Divide the reported rate by the total rate. Both are per 1,000 of the same people, so the units cancel.',honors:'Rates can only be divided or compared when they count the same thing per the same base. Convert per 1,000 to per 100,000 by multiplying by 100.'},
  compare(sim,g){const off=Math.abs(g.guess-SHARE);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';
   return (off<=5?`Close: within ${f0(off)} of the survey’s ${f1(SHARE)}.`:`You guessed ${g.guess} of 100. The survey says about <b>${f1(SHARE)}</b>, so you were off by ${f0(off)}.`)+(g.guess>SHARE?' Most people guess high: police records feel complete, but about half of violent crime never reaches them.':' Robbery is reported most (73%), rape and sexual assault least (24%).')+self;},
  again(sim){sim.p.guess=80;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Police in a city record 730 robberies. The survey says 73% of robberies are reported. About how many robberies actually happened?',answer:1000,tol:10,unit:'robberies',d:0,hint:'Total = reported ÷ share reported = 730 ÷ 0.73.',explain:'730 ÷ 0.73 = 1,000. About 270 robberies never reached a police record.'},
  {lvl:'bio',instant:true,q:'Reported robberies rose 10% in a year. Which is the best conclusion?',choices:['Robberies definitely rose 10%','Robberies, reporting, or both rose; you need the victim survey to tell which','Robberies fell'],correct:1,explain:'A police count is crimes × share reported. Either part can change.'},
  {lvl:'bio',instant:true,q:'Why is murder the most reliable crime trend?',choices:['It is the most common crime','Nearly every killing is found and recorded, so almost none is in the dark figure','The survey asks about it'],correct:1,explain:'The victim survey cannot ask murder victims, but police records catch nearly every killing.'},
  {lvl:'honors',kind:'num',q:'The survey’s reported rate is 11.2 per 1,000 people. What is that per 100,000?',answer:1120,tol:1,unit:'per 100,000',d:0,hint:'Per 100,000 is 100 times per 1,000.',explain:'11.2 × 100 = 1,120 per 100,000. The FBI’s 359.1 is lower partly because it leaves out simple assault.'},
  {lvl:'honors',instant:true,q:'The survey says 2,330 violent victimizations per 100,000; the FBI says 359.1. What is the main reason they differ?',choices:['One is wrong','They count different crimes (simple assault vs. murder), different people (12+ vs. everyone) and reported vs. all crimes','The FBI rounds down'],correct:1,explain:'Before comparing two numbers, check that they count the same thing, for the same people, per the same base.'},
  {lvl:'ap',kind:'num',q:'The redesigned survey measured 28.7 violent victimizations per 1,000 in 2024; the old one measured 23.3. By what percent is the new estimate higher?',answer:100*(28.7/23.3-1),tol:0.5,unit:'%',d:1,hint:'(new ÷ old − 1) × 100.',explain:'28.7 ÷ 23.3 = 1.232, so about 23% higher. Same year, same country: the questions changed the number.'},
  {lvl:'ap',instant:true,q:'BJS ran both questionnaires on split samples in 2024. Why is that a good design?',choices:['It doubles the sample size','Comparing them in the same year separates the effect of the new questions from any real change in crime','It hides the change'],correct:1,explain:'A split sample holds the year and the population fixed, so the difference measures the questionnaire.'}
 ],
 tour:[
  {title:'100 violent crimes',text:'Each square is 1 of every 100 violent crimes against people in 2024: robberies, assaults, rapes and sexual assaults, as counted by the national victim survey.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'About half reach the police',text:'The survey found 23.3 violent victimizations per 1,000 people and 11.2 per 1,000 reported to police. 11.2 ÷ 23.3 ≈ 48%. The blue squares were reported. The rest are the “dark figure.”',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'It depends on the crime',text:'Robbery is reported 73% of the time and aggravated assault 69%. Simple assault is reported 40% of the time, and rape and sexual assault only 24%.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'From a police count to a real total',text:'Total = reported ÷ share reported. If police record 730 robberies, about 730 ÷ 0.73 = 1,000 happened. And a police count can rise because more people report, not only because there is more crime.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Same scale before you compare',text:'23.3 per 1,000 is 2,330 per 100,000. The FBI’s 359.1 per 100,000 counts only crimes reported to police, includes murder and leaves out simple assault. Convert, then check what each counts.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'The question changes the answer',text:'In 2024 BJS also tested a redesigned questionnaire on part of the sample. It measured 28.7 per 1,000: 23% higher in the same year. How you ask changes what you count.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'The best-counted crime',text:'Murder is the exception: nearly every killing is found and recorded. The FBI’s murder rate fell from 6.7 per 100,000 in 2020 to 5.0 in 2024. Ask of any crime number: who counted it, and what did they miss?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How much of violent crime is in the dark figure?</p><ol><li>Lock in your gut, then work out the share reported from the two rates.</li><li>For each crime type, work out how many of every 100 were never reported.</li></ol><p>Write one sentence about which crime type a police count misses most, and why that matters.</p>',
  honors:'<p><b>Question:</b> Can you compare the survey rate with the FBI rate?</p><ol><li>Convert 23.3 per 1,000 and 11.2 per 1,000 to per 100,000.</li><li>List three differences in what the two measures count.</li></ol>',
  ap:'<p><b>Question:</b> How much does measurement change the estimate?</p><ol><li>Compute the percent difference between the two 2024 questionnaires.</li><li>Explain why a split-sample design is needed to measure it.</li></ol><p><b>CER:</b> Claim, evidence and reasoning about whether a reported rise in crime is real.</p>'},
 terms:[
  {t:'Victimization survey',d:'A survey that asks people whether they were victims of crime, whether or not they told the police (the National Crime Victimization Survey).'},
  {t:'Dark figure of crime',d:'Crime that happens but never appears in police records.'},
  {t:'Rate per 1,000',d:'A count divided by the population, times 1,000. Per 100,000 is 100 times larger.'},
  {t:'Unit of comparison',d:'Two rates can be compared only if they count the same thing per the same base.',lvl:'honors'},
  {t:'Split sample',d:'Giving two versions of a survey to random halves of the same sample, so differences come from the versions.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Bureau of Justice Statistics, <i>Criminal Victimization, 2024</i> (NCJ 310547, September 2025; <a href="https://bjs.ojp.gov/document/cv24.pdf" target="_blank" rel="noopener">PDF</a>): 23.3 violent victimizations per 1,000 persons age 12 or older, 11.2 per 1,000 reported to police, 6.7 million violent victimizations; and the BJS key findings sheet: robbery 73%, aggravated assault 69%, simple assault 40% and rape or sexual assault 24% reported (<a href="https://bjs.ojp.gov/document/NCVSKeyFindings_2024.pdf" target="_blank" rel="noopener">PDF</a>). BJS, first estimates from the redesigned NCVS, 2024: 28.7 per 1,000, 23% higher (<a href="https://bjs.ojp.gov/document/verncvsi24.pdf" target="_blank" rel="noopener">PDF</a>). FBI, <i>Reported Crimes in the Nation, 2024</i>: 359.1 violent crimes and 5.0 murders per 100,000; murder 6.7 in 2020 and 4.4 in 2014.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>The survey is a sample, so each rate has a margin of error. Small year-to-year changes may not be real.</li><li>The survey cannot ask murder victims, and it leaves out children under 12 and people in prisons, nursing homes and shelters.</li><li>A national rate hides big differences between places and between groups of people.</li></ul>'+
  '<p>This is a simplified teaching tool. Both measures are official federal statistics; they answer different questions.</p>'
};
BioLab.register(SIM);
})();
