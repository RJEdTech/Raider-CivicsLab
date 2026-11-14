(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Counting abortions: two counting systems, three ways to report.
   Guttmacher Institute counts (Abortion Provider Census, and the Monthly Abortion Provision Study from 2023): 1973 744,600 (rate 16.3);
   1980 1,545,170; 1985 1,578,800; 1990 1,608,600 (the peak); 2000 1,313,000 (rate 21.3); 2008 1,212,350; 2011 1,058,490 (16.9);
   2014 926,190 (14.6); 2017 862,320 (13.5, the lowest rate); 2020 930,160 (14.4); 2023 about 1,037,000 (about 15.9).
   CDC Abortion Surveillance (reporting areas only; California, Maryland and New Hampshire have not reported since 2011):
   1980 1,297,606; 1990 1,429,247; 2000 857,475; 2011 730,322; 2014 652,639; 2020 620,327; 2022 609,360.
   Births (NCHS): 3,613,647 in 2020. Guttmacher supports abortion rights; the CDC is a federal agency. */
const GUT=[[1973,744600],[1980,1545170],[1985,1578800],[1990,1608600],[2000,1313000],[2008,1212350],[2011,1058490],[2014,926190],[2017,862320],[2020,930160],[2023,1037000]];
const CDC=[[1980,1297606],[1985,1328570],[1990,1429247],[2000,857475],[2008,825564],[2011,730322],[2014,652639],[2020,620327],[2022,609360]];
const B20=3613647,A20=930160,RATIO=1000*A20/B20;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1),M=v=>(v/1e6).toFixed(2)+'M';
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}

const SIM={
 id:'abortiondata',hash:'abortiondata',apUnit:3,order:5,tab:'Counting abortions',kind:'Learning tool',next:['claims','turnout'],
 skills:{bio:'Count, rate and ratio: three ways to report one number · Algebra 1 (Unit 2: rates), Social Justice (Life), Sociology',
  honors:'Rates per 1,000 and why two counting systems disagree · Algebra 1 (Unit 2), Statistics (Chapter 4: collecting data)',
  ap:'Coverage error: what a count misses, and comparing methods across years · Statistics (Chapter 4), AP Statistics (Unit 3)'},
 card:'Two counting systems, three ways to report: work out the ratio of abortions to births, then see why the CDC and Guttmacher counts differ.',
 title:'Counting abortions',
 lede:{bio:'Abortion is debated with numbers. Learn to read them: a count, a rate per 1,000 women, and a ratio per 1,000 births. Then see why two respected sources report different counts.',
  honors:'Counts rise and fall with the population. Rates and ratios put each year on the same footing. Check which one you are reading.',
  ap:'Every count has coverage: who reported and who did not. Compare the two systems, and be careful when a method changes between years.'},
 scale:'United States, 1973 to 2023. Guttmacher Institute and CDC counts; births from the National Center for Health Statistics.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: abortions for every 1,000 live births in 2020',type:'range',min:0,max:600,step:5,def:100,unit:''},
  {id:'reveal',label:'Show the counts now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'a20',label:'Abortions, 2020 (Guttmacher)',unit:'',d:0,min:0,max:2e6,get:s=>shown(s)?A20:null},
  {id:'b20',label:'Live births, 2020 (NCHS)',unit:'',d:0,min:0,max:5e6,get:s=>B20},
  {id:'ratio',label:'Abortions per 1,000 live births, 2020',unit:'',d:0,min:0,max:600,get:s=>shown(s)?RATIO:null},
  {id:'rate',label:'Abortions per 1,000 women 15 to 44, 2020',unit:'',d:1,lvl:'honors',min:0,max:40,get:s=>shown(s)?14.4:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3,inTour=sim.tour&&sim.tour.on;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  txt(ctx,'Abortions counted in the U.S., by year',20,18,{s:14*k,w:700,b:'middle'});
  const L=70,R=500,T=46,B=260,X=y=>L+(y-1972)/(2025-1972)*(R-L),Y=v=>B-(B-T)*v/1.8e6;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,0.5e6,1e6,1.5e6].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();txt(ctx,v?(v/1e6)+'M':'0',L-6,Y(v),{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
  [1973,1990,2000,2010,2020].forEach(y=>txt(ctx,String(y),X(y),B+14*k,{s:12*k,a:'center',c:PAL['cv-soft']}));
  const line=(arr,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;if(dash)ctx.setLineDash([7,5]);ctx.beginPath();arr.forEach(([y,v],i)=>{i?ctx.lineTo(X(y),Y(v)):ctx.moveTo(X(y),Y(v));});ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=col;arr.forEach(([y,v])=>{ctx.beginPath();ctx.arc(X(y),Y(v),3.5,0,7);ctx.fill();});};
  const showG=sh||s<99;if(showG)line(GUT,'#2b5fb3',false);if(s>=3||s===99&&sh)line(CDC,'#e0a10b',true);
  txt(ctx,'— Guttmacher Institute',R+12,T+6,{s:12*k,w:700,c:'#2b5fb3',b:'middle'});if(s>=3||s===99&&sh)txt(ctx,'- - CDC (reporting areas only)',R+12,T+24*k,{s:12*k,w:700,c:'#e0a10b',b:'middle'});
  if(!sh&&s===99)txt(ctx,'Lock in your gut to see the counts.',(L+R)/2,(T+B)/2,{s:13*k,a:'center',c:PAL['cv-soft'],b:'middle'});
  if(s===2){txt(ctx,'1.61M in 1990',X(1990),Y(1608600)-34,{s:12*k,w:700,a:'center',c:PAL['s1']});txt(ctx,'862,320 in 2017',X(2017),Y(862320)+40,{s:12*k,w:700,a:'center',c:PAL['s1']});
   ring(ctx,X(1990)-12,Y(1608600)-26,24,30);ring(ctx,X(2017)-12,Y(862320)-12,24,40);}
  if(s===3)ring(ctx,X(2008)-14,Y(1212350)-14,X(2022)-X(2008)+28,Y(609360)-Y(1212350)+28);
  if(s===6&&atLeast('ap')){ctx.strokeStyle=PAL['s1'];ctx.setLineDash([4,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(2022.5),T);ctx.lineTo(X(2022.5),B);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'June 2022',X(2022.5),T-6,{s:11*k,w:700,a:'center',c:PAL['s1']});}
  /* lower: three ways to report 2020 */
  const by=B+30*k,S0=sim.gutS,gv=inTour?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const items=[['Count (2020)',sh?f0(A20):'?','abortions, Guttmacher'],['Ratio (2020)',sh?f0(RATIO):'?','per 1,000 live births'],['Rate (2020)',sh?'14.4':'?','per 1,000 women 15–44']];
  if(s>=4||s===99){const cw=(W-60)/3;items.forEach((it,i)=>{const x=20+i*(cw+10);ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,by,cw,H-by-14,10);ctx.fill();
    txt(ctx,it[0],x+12,by+16*k,{s:12*k,w:700,b:'middle',c:PAL['cv-soft']});txt(ctx,it[1],x+12,by+40*k,{s:20*k,w:700,b:'middle'});txt(ctx,it[2],x+12,by+62*k,{s:12*k,b:'middle',c:PAL['cv-soft']});
    if(i===1&&gv!=null&&!sh)txt(ctx,'your gut: '+gv,x+12,by+80*k,{s:12*k,w:700,b:'middle',c:PAL['s4']});});
   if(s===4)ring(ctx,20+(cw+10)-4,by-4,cw+8,H-by-6);}
  const RX=R+12,RW=W-RX-16,ry=T+48*k,card=(t,ls)=>{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,ry,RW,B-ry+10,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,RX,ry,RW,B-ry+10,10);ctx.stroke();}let yy=ry+16*k;txt(ctx,t,RX+10,yy,{s:13*k,w:700,b:'middle'});yy+=16*k;ls.forEach(l=>{yy+=wrap(ctx,l,RX+10,yy,RW-20,{s:12*k,b:'middle'})+3;});};
  if(s===3)card('Why the CDC count is lower',['States report to the CDC voluntarily.','California, Maryland and New Hampshire have not reported since 2011.','Guttmacher surveys every known provider.']);
  else if(s===5&&atLeast('honors'))card('Rate, not count',['1980: 29.3 per 1,000 women 15–44.','2017: 13.5, the lowest on record.','The rate fell by more than half.']);
  else if(s===6&&atLeast('ap'))card('A method changes',['After Dobbs (June 2022), some states banned abortion.','Guttmacher’s 2023 count, about 1.04M, comes from a new monthly study, so compare it with care.']);
  else if(s===7)card('A values question',['Catechism 2270: human life must be respected and protected from conception.','Others hold that women have a right to choose.','The counts inform; they do not decide.']);
 },
 narrate(sim){if(!shown(sim))return `In 2020 there were <b>${f0(B20)}</b> live births in the U.S. How many abortions were there for every 1,000 live births? Your gut right now: ${sim.p.guess}.`;
  return `Guttmacher counted <b>${f0(A20)}</b> abortions in 2020: about <b>${f0(RATIO)} for every 1,000 live births</b>, or 14.4 per 1,000 women age 15 to 44. The CDC’s count is lower because some states, including California, do not report to it.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In 2020 there were 3,613,647 live births in the U.S. For every 1,000 live births, how many abortions do you think there were? Drag to your gut guess, then lock it in.',honors:'2020: 3,613,647 live births. Drag to your gut guess of abortions per 1,000 live births, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the ratio yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-RATIO),guess:sim.p.guess,label:`${sim.p.guess} per 1,000 births`};},
  solve(sim){sim.p.guess=Math.round(RATIO/5)*5;return {v:0,guess:RATIO,label:`${f0(RATIO)} per 1,000 births`};},
  calc:{unit:'per 1,000 births',d:0,tol:1.5,
   prompt:{bio:'Guttmacher counted <b>930,160</b> abortions in 2020. NCHS counted <b>3,613,647</b> live births. How many abortions were there for every 1,000 live births?',ap:'Abortions: 930,160 (Guttmacher, 2020). Live births: 3,613,647 (NCHS). Compute the ratio per 1,000 live births.'},
   answer:()=>+RATIO.toFixed(1),hint:'Ratio per 1,000 = abortions ÷ births × 1,000.',
   steps:()=>['Ratio per 1,000 = abortions ÷ births × 1,000.','930,160 ÷ 3,613,647 = 0.2574.',`× 1,000 = <b>${f0(RATIO)}</b> per 1,000 live births: about 1 for every ${f1(B20/A20)} births.`]},
  formula:()=>`Ratio = 930,160 ÷ 3,613,647 × 1,000 = ${f0(RATIO)} per 1,000 live births`+(atLeast('honors')?'<br>Rate (2020) = 14.4 per 1,000 women age 15 to 44 (Guttmacher)':''),
  how:{bio:'A ratio compares two counts on a per-1,000 base. A rate divides by the people at risk.',honors:'Use a rate or ratio, not a count, to compare years: the population changes.'},
  compare(sim,g){const off=Math.abs(g.guess-RATIO);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the ratio yourself.':'';
   return (off<=25?`Close: within ${f0(off)}.`:`You guessed ${g.guess}. The ratio was about <b>${f0(RATIO)}</b> per 1,000 live births, so you were off by ${f0(off)}.`)+' The CDC reports a lower count because several states do not report to it.'+self;},
  again(sim){sim.p.guess=100;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'The CDC counted 620,327 abortions in 2020 and Guttmacher 930,160. How many more did Guttmacher count?',answer:930160-620327,tol:5,unit:'',d:0,hint:'Subtract the two counts.',explain:'930,160 − 620,327 = 309,833. Much of the gap is states that do not report to the CDC, California above all.'},
  {lvl:'bio',instant:true,q:'Why can’t you compare the CDC count with the Guttmacher count as if they measured the same thing?',choices:['One of them is made up','They cover different places: some states do not report to the CDC','They count different years'],correct:1,explain:'Check coverage first: who reported, and who did not.'},
  {lvl:'honors',kind:'num',q:'The abortion rate was 29.3 per 1,000 women age 15 to 44 in 1980 and 13.5 in 2017. By what percent did it fall?',answer:100*(29.3-13.5)/29.3,tol:0.6,unit:'%',d:0,hint:'(old − new) ÷ old × 100.',explain:'(29.3 − 13.5) ÷ 29.3 × 100 ≈ 54%: more than half.'},
  {lvl:'honors',instant:true,q:'The count of abortions was higher in 1985 than in 1973, but the U.S. also grew. Which number best compares the two years?',choices:['The count','The rate per 1,000 women 15 to 44','The number of clinics'],correct:1,explain:'A rate divides by the population at risk, so years with different populations can be compared.'},
  {lvl:'ap',instant:true,q:'Guttmacher’s 2023 figure comes from a new monthly study, and earlier figures from a census of providers. What should a careful reader do?',choices:['Treat them as identical','Compare them, but note that a change in method could explain part of a change in the number','Ignore all figures after 2020'],correct:1,explain:'When a method changes, part of a change can come from the method. Say so when you compare.'}
 ],
 tour:[
  {title:'Fifty years of counts',text:'The blue line is the Guttmacher Institute’s count of abortions each year, from a survey of every known provider. Guttmacher supports abortion rights; its counts are the most complete and are used by researchers on all sides.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'A peak and a low',text:'The count peaked at about 1.61 million in 1990 and fell to 862,320 in 2017, the lowest since the 1970s. It rose to 930,160 in 2020.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'A second count',text:'The dashed line is the CDC’s count. It is lower because states report to the CDC voluntarily, and California, Maryland and New Hampshire have not reported since 2011. Same subject, different coverage.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Three ways to report',text:'Count: 930,160 in 2020. Ratio: 930,160 ÷ 3,613,647 births × 1,000 ≈ 257 per 1,000 live births. Rate: 14.4 per 1,000 women age 15 to 44. Each answers a different question.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Rate, not count',text:'The rate was 29.3 per 1,000 women in 1980 and 13.5 in 2017: it fell by more than half. Rates let you compare years when the population has changed.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'When a method changes',text:'After the Dobbs decision in June 2022, some states banned abortion and others saw increases. Guttmacher’s 2023 figure, about 1.04 million, comes from a new monthly study, so compare it with earlier years carefully.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Counts inform; they do not decide',text:'The Catechism (2270) teaches that human life must be respected and protected absolutely from the moment of conception. Others hold that women have a right to choose. The math helps you read the evidence; the moral question is yours to discuss. There is no answer key.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How do count, ratio and rate tell the same story differently?</p><ol><li>Lock in your gut, then work out the 2020 ratio per 1,000 live births.</li><li>From the chart, find the peak year and the lowest year.</li></ol><p>Write one sentence about why the CDC and Guttmacher counts differ.</p>',
  honors:'<p><b>Question:</b> How much did the rate change?</p><ol><li>Compute the percent change in the rate from 1980 (29.3) to 2017 (13.5).</li><li>Explain why a rate is better than a count for comparing those years.</li></ol>',
  ap:'<p><b>Question:</b> What does each counting system miss?</p><ol><li>List the coverage limits of each source.</li><li>Explain how a change in method affects a comparison across years.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Count',d:'How many, with no base: 930,160 abortions in 2020.'},
  {t:'Ratio (per 1,000 live births)',d:'Abortions ÷ live births × 1,000.'},
  {t:'Rate (per 1,000 women 15 to 44)',d:'Abortions ÷ women age 15 to 44 × 1,000.',lvl:'honors'},
  {t:'Coverage',d:'Which places, people or cases a count includes. Missing coverage makes a count too low.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Guttmacher Institute (supports abortion rights): Abortion Provider Census counts, 1973 to 2020, including 1,608,600 in 1990 (the peak), 862,320 in 2017 (rate 13.5, the lowest) and 930,160 in 2020 (rate 14.4); 16.3 in 1973 and 29.3 around 1980 (<a href="https://www.guttmacher.org/fact-sheet/induced-abortion-united-states" target="_blank" rel="noopener">fact sheet</a>); Monthly Abortion Provision Study, about 1,037,000 in 2023. CDC Abortion Surveillance counts as compiled with Guttmacher’s by the Michigan Department of Health and Human Services (<a href="https://vitalstats.michigan.gov/osr/abortion/Tab_US.asp" target="_blank" rel="noopener">Table C</a>); CDC 2022: 609,360 (KFF). National Center for Health Statistics: 3,613,647 live births in 2020.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Neither source counts everything: the CDC misses non-reporting states, and Guttmacher counts the formal health care system.</li><li>A national number hides large differences between states, especially since 2022.</li><li>Each figure is a number of procedures. It says nothing about the people involved, their reasons or their circumstances.</li></ul>'+
  '<p><b>Two views.</b> The Catholic Church teaches that human life must be respected and protected absolutely from conception (<i>Catechism</i> 2270–2271). Others hold that women have a right to decide whether to continue a pregnancy. This tool teaches how to read the numbers; it does not settle the moral question.</p>'
};
BioLab.register(SIM);
})();
