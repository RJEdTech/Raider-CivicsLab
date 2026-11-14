(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* The death penalty by the numbers: counts, ratios and a hidden rate.
   DPIC fact sheet (April 30, 2026): 1,661 executions since 1977 (7 of them in 2026), 202 death-row exonerations since 1973,
   8,256 death sentences 1972 to 2025, 23 new death sentences in 2025, 2,024 people on death row on Oct 1, 2025.
   Executions by year 1977 to 2025 are DPIC's series (they add to 1,654). Gross et al., PNAS 2014: of 7,482 people sentenced
   to death 1973 to 2004, 117 (1.6%) were exonerated; at least 4.1% would be if all stayed under sentence of death. */
const Y0=1977,EX=[1,0,2,0,1,2,5,21,18,18,25,11,16,23,14,31,38,31,56,45,74,68,98,85,66,71,65,59,60,53,42,37,52,46,43,43,39,35,28,20,23,25,22,17,11,18,24,25,47];
const D={exec:1661,exon:202,sent:8256,new25:23,row:2024,fl25:19,
 g:{sent:7482,exon:117,est:4.1}};
const RATIO=D.exec/D.exon;
const MAXG=600;let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}

const SIM={
 id:'deathpenalty',hash:'deathpenalty',apUnit:3,order:3,tab:'The death penalty by the numbers',kind:'Learning tool',next:['claims','whatmoved'],
 skills:{bio:'Ratios as “1 for every n” and percent change · Algebra 1 (Unit 2: proportions), Sociology (Unit 5: deviance), Social Justice',
  honors:'Ratios, percents and comparing shares of two groups · Algebra 1 (Unit 2), Statistics (Chapter 1), US Government (Unit 2: civil liberties)',
  ap:'Observed vs. estimated rates: why a count of what was found understates what happened · Statistics (Chapter 1), AP Statistics (Unit 1), AP US Government (Unit 3)'},
 card:'Guess how many people sentenced to death have been exonerated, then work out the ratio to executions and see what the counts can and cannot tell you.',
 title:'The death penalty by the numbers',
 lede:{bio:'The death penalty is argued about with numbers: how many, how often, how sure. Put the published counts side by side and turn them into a ratio you can read.',
  honors:'A count is only as good as what was counted. Compare executions with exonerations, then compare who the victims were in the cases that led to execution with all homicide victims.',
  ap:'An exoneration count only includes the errors someone found. Compare the observed share with a published statistical estimate of the hidden rate, and ask what the data cannot decide.'},
 scale:'United States, 1973 to April 30, 2026. Counts from the Death Penalty Information Center (DPIC).',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: people exonerated from death row since 1973',type:'range',min:0,max:MAXG,step:2,def:0,unit:' people'},
  {id:'reveal',label:'Show the counts now',type:'toggle',def:false,noGut:true,help:'Normally the counts appear once you lock in your gut and work it out.'}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'exec',label:'Executions since 1977',unit:'people',d:0,min:0,max:2000,get:s=>shown(s)?D.exec:null},
  {id:'exon',label:'Exonerated from death row since 1973',unit:'people',d:0,min:0,max:400,get:s=>shown(s)?D.exon:null},
  {id:'ratio',label:'Executions for every exoneration',unit:'',d:1,min:0,max:20,get:s=>shown(s)?RATIO:null},
  {id:'row',label:'On death row, Oct 1, 2025',unit:'people',d:0,lvl:'honors',min:0,max:4000,get:s=>D.row},
  {id:'obs',label:'Exonerated, sentenced 1973 to 2004 (observed)',unit:'%',d:1,lvl:'ap',min:0,max:10,get:s=>100*D.g.exon/D.g.sent},
  {id:'est',label:'Estimated false-conviction rate (at least)',unit:'%',d:1,lvl:'ap',min:0,max:10,get:s=>D.g.est}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: executions by year */
  const L=46,R=big?470:440,T=58,B=220;txt(ctx,'Executions in the U.S., by year',20,18,{s:14*k,w:700,b:'middle'});
  const mx=100,X=i=>L+(i+0.5)*(R-L)/EX.length,Yv=v=>B-(B-T)*v/mx,bw=(R-L)/EX.length*0.72;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,50,100].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Yv(v));ctx.lineTo(R,Yv(v));ctx.stroke();txt(ctx,String(v),L-6,Yv(v),{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
  EX.forEach((v,i)=>{ctx.fillStyle=(Y0+i===1999||Y0+i===2025)&&s>=2?PAL['s1']:PAL['s2'];ctx.fillRect(X(i)-bw/2,Yv(v),bw,B-Yv(v));});
  [1977,1990,2000,2010,2025].forEach(y=>txt(ctx,String(y),X(y-Y0),B+13*k,{s:12*k,a:'center',c:PAL['cv-soft']}));
  if(s>=2){txt(ctx,'98 in 1999',X(1999-Y0),Yv(98)-9,{s:12*k,w:700,a:'center',c:PAL['s1']});txt(ctx,'47',X(2025-Y0),Yv(47)-9,{s:12*k,w:700,a:'center',c:PAL['s1']});
   if(s===2){ring(ctx,X(1999-Y0)-10,Yv(98)-4,20,B-Yv(98)+6);ring(ctx,X(2021-Y0)-8,Yv(47)-22,X(2025-Y0)-X(2021-Y0)+18,B-Yv(47)+24);}}
  /* right: counts */
  const RX=big?490:470,RW=W-RX-20;let y=24;
  txt(ctx,big?'Counts':'Counts since the modern era began',RX,y,{s:14*k,w:700,b:'middle'});y+=22*k;
  const S=sim.gutS,gv=(sim.tour&&sim.tour.on)?null:(S&&S.g?S.g.guess:sim.p.guess);
  const rows=[];if(gv!=null)rows.push({l:'Your gut: exonerated',v:gv,c:PAL['s4']});
  if(s>=3){rows.push({l:'Executed since 1977',v:D.exec,c:PAL['s2'],ok:sh},{l:'Exonerated since 1973',v:D.exon,c:PAL['s3'],ok:sh});}
  const sc=RW/2000;rows.forEach(r=>{txt(ctx,r.l,RX,y,{s:12*k,w:700,b:'middle',c:r.c===PAL['s4']?PAL['s4']:PAL['cv-ink']});y+=10*k;
   if(r.ok===false){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW,14,4);ctx.fill();txt(ctx,'?',RX+RW/2,y+7,{s:12*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});}
   else{ctx.fillStyle=r.c;rr(ctx,RX,y,Math.max(3,r.v*sc),14,4);ctx.fill();txt(ctx,f0(r.v),RX+Math.max(3,r.v*sc)+6,y+7,{s:12*k,w:700,b:'middle'});}
   y+=26*k;});
  if(s===3&&sim.tour&&sim.tour.on)ring(ctx,RX-6,y-3*36*k+8*k,RW+12,2*36*k);
  if(s>=4){const t=big?(sh?`1 per ${f1(RATIO)} executions`:'1 per ? executions'):(sh?`1 exoneration for every ${f1(RATIO)} executions`:'1 exoneration for every ? executions');
   pill(ctx,t,RX+RW/2,y+8*k,PAL['s1'],'#fff',13*k);if(s===4)ring(ctx,RX-4,y-6*k,RW+8,28*k);y+=26*k;
   if(sh)txt(ctx,`${f0(D.exec)} ÷ ${f0(D.exon)} = ${f1(RATIO)}`,RX+RW/2,y+4*k,{s:12*k,a:'center',c:PAL['cv-soft'],b:'middle'});y+=18*k;}
  /* lower band */
  const by=Math.max(250,B+34*k);
  if(s>=5&&s<99&&s===5){colorado(ctx,k,20,by);}
  else if(s===6&&atLeast('honors'))victims(ctx,k,20,by);
  else if(s===7&&atLeast('ap'))hidden(ctx,k,20,by,true);
  else if(s===8&&atLeast('honors'))deter(ctx,k,20,by);
  else if(s===9)views(ctx,k,20,by);
  else if(s===99){if(atLeast('ap'))hidden(ctx,k,20,by,false);else if(atLeast('honors'))victims(ctx,k,20,by);else colorado(ctx,k,20,by);}
 },
 narrate(sim){if(!shown(sim))return `Since 1977, the U.S. has carried out <b>${f0(D.exec)}</b> executions. How many people sentenced to death have later been exonerated since 1973? Your gut right now: ${f0(sim.p.guess)}.`;
  return `DPIC counts <b>${f0(D.exon)}</b> people exonerated from death row since 1973: about <b>1 for every ${f1(RATIO)} executions</b>. Executions peaked at 98 in 1999 and rose to 47 in 2025, while new death sentences fell to ${D.new25}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Since 1977, the U.S. has carried out 1,661 executions. Since 1973, how many people sentenced to death have later been exonerated: cleared and released? Drag the slider to your gut guess, then lock it in.',
   honors:'1,661 executions since 1977. Drag the slider to your gut guess of how many people sentenced to death since 1973 were later exonerated, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will turn the two counts into a ratio yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-D.exon),guess:sim.p.guess,label:`${f0(sim.p.guess)} people`};},
  solve(sim){sim.p.guess=D.exon;return {v:0,guess:D.exon,label:`${f0(D.exon)} people (DPIC)`};},
  calc:{unit:'executions',d:1,tol:0.1,
   prompt:{bio:'DPIC counts <b>1,661</b> executions since 1977 and <b>202</b> people exonerated from death row since 1973. For every 1 exoneration, how many executions have there been? Round to one decimal place.',
    ap:'Executions: 1,661. Exonerations: 202. Find the ratio of executions to exonerations, n, so the counts read “1 exoneration for every n executions.” Round to one decimal place.'},
   answer:()=>RATIO,hint:'Divide the executions by the exonerations: 1,661 ÷ 202.',
   steps:()=>['“1 for every n” means n = executions ÷ exonerations.','1,661 ÷ 202 = 8.22…',`About <b>${f1(RATIO)}</b> executions for every exoneration.`,'Check: 8.2 × 202 ≈ 1,661.']},
  formula:()=>`Executions per exoneration = 1,661 ÷ 202 = ${f1(RATIO)}`+(atLeast('ap')?'<br>Observed share exonerated (sentenced 1973–2004) = 117 ÷ 7,482 = 1.6%; estimated rate: at least 4.1%':''),
  how:{bio:'Divide one count by the other to get a ratio you can read: 1 exoneration for every n executions.',honors:'A ratio compares two counts. A percent compares a part with its whole. Use the one that answers the question you are asking.'},
  compare(sim,g){const off=Math.abs(g.guess-D.exon);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the ratio yourself.':'';
   return (off<=20?`Close: you were within ${off} of DPIC’s count.`:`You guessed ${f0(g.guess)}. DPIC counts <b>${f0(D.exon)}</b>, so you were off by ${f0(off)}.`)+` That is about 1 exoneration for every ${f1(RATIO)} executions. The count only includes errors someone found and proved.`+self;},
  again(sim){sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'The U.S. carried out 25 executions in 2024 and 47 in 2025. What was the percent increase?',answer:88,tol:1,unit:'%',d:0,hint:'Percent change = (new − old) ÷ old × 100.',explain:'(47 − 25) ÷ 25 × 100 = 88%. Florida carried out 19 of the 47.'},
  {lvl:'bio',instant:true,q:'“1 exoneration for every 8.2 executions” means:',choices:['8.2% of executed people were innocent','For every 8.2 executions in this period, 1 person sentenced to death was later exonerated','8.2 people are exonerated each year'],correct:1,explain:'It is a ratio of two counts. Most exonerated people were never executed; they were freed. The ratio compares the size of the two counts.'},
  {lvl:'bio',instant:true,q:'Executions peaked at 98 in 1999. New death sentences fell to 23 in 2025. Which is true?',choices:['Fewer executions always means fewer death sentences the same year','Executions in a year mostly reflect sentences given many years earlier','The two numbers measure the same thing'],correct:1,explain:'People executed in 2025 had spent about 27 years on death row on average (DPIC), so executions lag sentences by decades.'},
  {lvl:'honors',kind:'num',q:'Florida carried out 19 of the 47 executions in 2025. What percent is that?',answer:100*19/47,tol:0.6,unit:'%',d:0,hint:'Part ÷ whole × 100.',explain:'19 ÷ 47 × 100 ≈ 40%. One state can drive a national total.'},
  {lvl:'honors',instant:true,q:'States without the death penalty have had lower murder rates than states with it. Does that prove the death penalty does not deter murder?',choices:['Yes: lower rates prove it','No: the states differ in many other ways, so a difference between them cannot show cause','Yes, if the gap is large enough'],correct:1,explain:'This is a correlation. The National Research Council (2012) found the research does not show whether the death penalty raises, lowers or has no effect on homicide rates.'},
  {lvl:'ap',kind:'num',q:'Gross et al. (2014) estimate at least 4.1% of people sentenced to death are falsely convicted. Of the 7,482 people sentenced from 1973 to 2004, how many is that, at least?',answer:7482*0.041,tol:3,unit:'people',d:0,hint:'4.1% of 7,482 = 0.041 × 7,482.',explain:'0.041 × 7,482 ≈ 307 people, compared with 117 who were actually exonerated. The rest of the estimated errors were never found or proved.'},
  {lvl:'ap',instant:true,q:'Why is 117 ÷ 7,482 = 1.6% probably lower than the true rate of false convictions?',choices:['Some of the people exonerated were guilty','Once a sentence is reduced to life, far fewer resources go to reinvestigating it, so many errors are never found','The 7,482 count is too small'],correct:1,explain:'Gross et al. found exonerations are far likelier while a person is still under sentence of death. The observed share counts only errors that someone found.'}
 ],
 tour:[
  {title:'Executions, year by year',text:'Each bar is one year of executions in the U.S., from 1977, when executions resumed, to 2025. The modern death penalty began after the Supreme Court’s 1976 decision in Gregg v. Georgia.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'A peak and a rise',text:'Executions peaked at 98 in 1999 and fell to 11 in 2021. In 2025 they rose to 47, the most since 2009, and Florida carried out 19 of them. New death sentences fell to 23 in 2025.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Two counts',text:'DPIC counts 1,661 executions since 1977, through April 30, 2026. It also counts 202 people who were sentenced to death and later exonerated: cleared of the crime and released.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'A ratio you can read',text:'1,661 ÷ 202 ≈ 8.2. For every 8.2 executions there has been 1 exoneration. Most exonerated people were freed, not executed: the ratio compares two counts, not a rate of executing innocent people.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Colorado',text:'Colorado abolished the death penalty in 2020. Since 1972 it handed down 24 death sentences and carried out 1 execution, in 1997. In 27 states, the death penalty is still law.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'Whose cases end in execution?',text:'In cases that led to an execution, about 76% of the victims were white (DPIC). Among all U.S. homicide victims from 1985 to 2023, about half were white (FBI). Comparing the two shares is a question the counts let you ask.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'The hidden rate',text:'Of 7,482 people sentenced to death from 1973 to 2004, 117 were exonerated: 1.6%. Gross et al. (2014) estimate at least 4.1% would be, if every case got the scrutiny a death sentence gets. Each square is 1 of 1,000 sentences.',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'honors',title:'What the data cannot settle',text:'Does the death penalty deter murder? The National Research Council (2012) reviewed the studies and found they do not show whether it raises, lowers or has no effect on homicide rates.',pause:true,setup:sim=>{sim.tst=8;}},
  {title:'What the Church teaches',text:'The Catechism (2267, revised 2018) teaches that the death penalty is inadmissible because it is an attack on the dignity of the person, and that the Church works for its abolition worldwide. In public debate, supporters argue that the worst crimes deserve the most serious punishment and that it brings justice to victims’ families. Discuss: which numbers here (exonerations, the 4.1% estimate, what deterrence studies cannot show) bear on that debate, and how?',pause:true,setup:sim=>{sim.tst=9;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What do the counts say, and what do they leave out?</p><ol><li>Lock in your gut, then work out the ratio of executions to exonerations.</li><li>From the bars, find the peak year and the 2025 count. Work out the percent change from 2024 (25) to 2025 (47).</li></ol><p>Write two sentences: one fact the numbers show, and one question they cannot answer.</p>',
  honors:'<p><b>Question:</b> Do the cases that end in execution look like all homicides?</p><ol><li>Compare the share of white victims in cases that led to execution (about 76%) with the share among all homicide victims (about half).</li><li>Explain why a difference in shares is not, by itself, proof of a cause.</li></ol>',
  ap:'<p><b>Question:</b> How far below the true rate could the observed exoneration rate be?</p><ol><li>Compute 117 ÷ 7,482 and 4.1% of 7,482.</li><li>Explain, from the study design, why exonerations happen more often under a death sentence than after a sentence is reduced.</li></ol><p><b>CER:</b> Claim, evidence and reasoning about what a count of found errors can tell you.</p>'},
 terms:[
  {t:'Exoneration',d:'A person convicted of a crime is officially cleared, based on new evidence of innocence, and released.'},
  {t:'Ratio',d:'A comparison of two counts, such as 1 exoneration for every 8.2 executions.'},
  {t:'Percent change',d:'(new − old) ÷ old × 100.'},
  {t:'Correlation vs. cause',d:'Two things moving together does not show that one causes the other.',lvl:'honors'},
  {t:'Observed vs. estimated rate',d:'An observed rate counts only the cases found. An estimate uses a model to account for the cases not found.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Death Penalty Information Center (DPI), Facts About the Death Penalty, updated April 30, 2026: 1,661 executions since 1977 (7 in 2026), 202 exonerations since 1973, 8,256 death sentences from 1972 to 2025, 23 new death sentences in 2025, 2,024 people on death row on October 1, 2025, Colorado abolished in 2020 with 1 execution and 24 death sentences since 1972, and about 76% of victims in cases that led to execution were white (<a href="https://files.deathpenaltyinfo.org/documents/pdf/FactSheet-2026-04-30.pdf" target="_blank" rel="noopener">fact sheet PDF</a>). Executions by year 1977 to 2025 are DPI’s annual counts (they add to 1,654). DPI’s 2025 list: 47 executions in 11 states, 19 in Florida (<a href="https://deathpenaltyinfo.org/executions/2025" target="_blank" rel="noopener">DPI 2025</a>). DPI opposes the death penalty’s current use; its counts are the standard source and are cited by researchers on all sides.</p>'+
  '<p>Samuel R. Gross, Barbara O’Brien, Chen Hu and Edward H. Kennedy, “Rate of false conviction of criminal defendants who are sentenced to death,” <i>PNAS</i> 111(20), 2014 (<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4034186" target="_blank" rel="noopener">PMC4034186</a>): 7,482 sentenced 1973 to 2004, 117 exonerated, and an estimate that at least 4.1% would be exonerated if all remained under sentence of death. National Research Council, <i>Deterrence and the Death Penalty</i> (2012): studies to date do not show whether capital punishment decreases, increases or has no effect on homicide rates.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>An exoneration count includes only errors someone found and proved. It is a floor, not the true number.</li><li>The ratio compares two counts over slightly different periods (1973 and 1977 starts). It is not the share of executed people who were innocent.</li><li>National totals hide that a few states carry out most executions.</li></ul>'+
  '<p><b>What the Church teaches.</b> The <i>Catechism of the Catholic Church</i>, 2267 (revised 2018), teaches that the death penalty is “inadmissible because it is an attack on the inviolability and dignity of the person,” and that the Church works for its abolition worldwide. In public debate, supporters argue that some crimes deserve the most serious punishment, that it brings justice to victims’ families, and that it may deter; opponents point to wrongful convictions, cost, delays and unequal treatment by race and place. The math here informs that debate. The Church’s teaching rests on human dignity.</p>'+
  '<p>This is a simplified teaching tool, not legal advice.</p>'
};
function card(ctx,k,x,y,w,title,lines){ctx.font='700 '+(13*k)+'px '+FONT;let h=0;
 ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,450-y-12,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,450-y-12,10);ctx.stroke();}let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;
 lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}
function colorado(ctx,k,x,y){card(ctx,k,x,y,760,'Colorado',['Abolished the death penalty in 2020. Since 1972: 24 death sentences, 1 execution (1997).','27 states still have the death penalty; 23 states have abolished it.']);}
function victims(ctx,k,x,y){const w=760;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,450-y-12,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,450-y-12,10);ctx.stroke();}
 txt(ctx,'Share of victims who were white',x+12,y+18*k,{s:14*k,w:700,b:'middle'});const bx=x+300,bw=w-360;
 [['Cases that led to an execution (DPI)',76,PAL['s1']],['All homicide victims, 1985–2023 (FBI)',49,PAL['s2']]].forEach((r,i)=>{const yy=y+(44+i*30)*k;
  txt(ctx,r[0],x+12,yy,{s:12*k,w:700,b:'middle'});ctx.fillStyle=PAL['cv-bg'];rr(ctx,bx,yy-7,bw,14,4);ctx.fill();ctx.fillStyle=r[2];rr(ctx,bx,yy-7,bw*r[1]/100,14,4);ctx.fill();
  txt(ctx,(i?'about ':'about ')+r[1]+'%',bx+bw*r[1]/100+6,yy,{s:12*k,w:700,b:'middle'});});}
function hidden(ctx,k,x,y,ringIt){const w=760;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,450-y-12,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,450-y-12,10);ctx.stroke();}
 txt(ctx,'Per 1,000 death sentences (1973–2004)',x+12,y+18*k,{s:14*k,w:700,b:'middle'});
 const cols=50,rows=20,cs=Math.min(7,(450-y-12-34*k)/rows-1),gx=x+12,gy=y+30*k;
 for(let i=0;i<1000;i++){const c=i%cols,r=Math.floor(i/cols);ctx.fillStyle=i<16?PAL['s1']:i<41?PAL['s4']:PAL['line'];ctx.fillRect(gx+c*(cs+1),gy+r*(cs+1),cs,cs);}
 const tx=gx+cols*(cs+1)+16;txt(ctx,'■ found and exonerated: 16 of 1,000 (1.6%)',tx,gy+10,{s:12*k,w:700,c:PAL['s1'],b:'middle'});
 txt(ctx,'■ more estimated: at least 41 in all (4.1%)',tx,gy+10+20*k,{s:12*k,w:700,c:PAL['s4'],b:'middle'});
 wrap(ctx,'117 ÷ 7,482 = 1.6% observed. 4.1% × 7,482 ≈ 307. A count of found errors is a floor.',tx,gy+10+46*k,w-(tx-x)-12,{s:12*k,b:'middle'});
 if(ringIt){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,gx-4,gy-4,cols*(cs+1)+8,2*(cs+1)+8,5);ctx.stroke();}}
function deter(ctx,k,x,y){card(ctx,k,x,y,760,'What the studies cannot settle',['National Research Council (2012): research to date does not show whether the death penalty decreases, increases or has no effect on homicide rates.','States with and without it differ in many ways, so comparing their murder rates cannot show cause.']);}
function views(ctx,k,x,y){card(ctx,k,x,y,760,'What the Church teaches (Catechism 2267, 2018)',['The death penalty is “inadmissible”: it attacks the dignity of the person. The Church works for its abolition worldwide.','In public debate, supporters cite the gravest crimes, justice for victims’ families and deterrence.','Discuss: which numbers here bear on that debate, and how?']);}
BioLab.register(SIM);
})();
