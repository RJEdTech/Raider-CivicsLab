(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Abortion, poverty and support: a pro-life reading of the evidence (Jason, Nov 13, 2026: present abortion from a pro-life stance,
   without hiding the other view; show poverty, access to health care and what reduces abortions).
   Catechism 2270. USCCB, Walking with Moms in Need (Archbishop Naumann: 75% of women who choose abortion are low income).
   Guttmacher (supports abortion rights), Characteristics of U.S. Abortion Patients in 2014: 75% poor or low-income; 49% below the federal
   poverty level, 26% at 100-199%. Biggs, Gould and Foster, BMC Women's Health 2013 (Turnaway Study, 954 women): financial reasons 40% (386),
   timing 36%, partner 31%, other children 29%; 64% gave several reasons. March of Dimes, Nowhere to Go (2024): 35% of counties (1,104) are
   maternity care deserts; 2.3 million women of reproductive age live in them; Medicaid covered 41% of births in 2022.
   Gonzalez, AEJ: Economic Policy 2013: Spain's 2007 universal 2,500-euro child benefit increased births, in part through fewer abortions.
   Charlotte Lozier Institute (pro-life), 2025 National Pregnancy Center Report: 2,775 centers, over 1 million new clients, over $452 million
   in services and goods (2024). Reardon, Rafferty and Longbons, Cureus 2023 (226 women with a history of abortion; Charlotte Lozier
   Institute): 60% would have preferred to give birth with more support or financial security.
   Dench, Pineda-Torres and Myers (IZA 2023 / 2024): total bans increased births 2.3% (about 30,000 a year) in ban states; about a fifth
   to a fourth of people seeking abortions there did not obtain one. Society of Family Planning #WeCount (June 2026): 1,126,760 abortions
   in 2025; telehealth 97-100% of abortions in states with total bans. Catholic Charities of Denver: Marisol Homes, Marisol Health. */
const POOR=49,LOW=26,SHARE=POOR+LOW;
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
function woman(ctx,x,y,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-6,4.3,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(x-6,y+9);ctx.lineTo(x,y-2);ctx.lineTo(x+6,y+9);ctx.closePath();ctx.fill();}

const SIM={
 id:'walkwithmoms',hash:'walkwithmoms',apUnit:3,order:7,tab:'Abortion, poverty and support',kind:'Learning tool',prereq:['claims'],next:['pitcount'],
 skills:{bio:'Percent of a group, and reading a bar chart of survey reasons · Algebra 1 (Unit 2), Social Justice (Life), Junior Theology (Unit 3: Ought)',
  honors:'Who counted? Weighing sources by their method and their stance · Statistics (Chapter 4: collecting data), Sociology (Unit 3: stratification)',
  ap:'Natural experiments: what a sudden policy change can show about cause · Statistics (Chapter 4), AP Statistics (Unit 3)'},
 card:'The Church teaches that every human life is sacred from conception and asks us to walk with mothers in need. See who faces abortion decisions, why, and what the evidence says reduces abortions.',
 title:'Abortion, poverty and support',
 lede:{bio:'The Church teaches that human life must be protected from the moment of conception (Catechism 2270). Pro-life work starts with knowing the mothers who face the hardest choices: most are poor, and most name money among their reasons.',
  honors:'Many of the numbers here come from groups with a stance on abortion. Read each one for its method and its source, and see which findings sources on both sides agree on.',
  ap:'Some of the strongest evidence on what reduces abortions comes from natural experiments: a child benefit that started on a set date, laws that changed overnight.'},
 scale:'United States (and Spain, 2007). Guttmacher Institute, the Turnaway Study, March of Dimes, Charlotte Lozier Institute and peer-reviewed economics studies; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: percent of abortion patients who are poor or low-income',type:'range',min:0,max:100,step:1,def:30,unit:'%'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'poor',label:'Abortion patients below the poverty line (2014)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?POOR:null},
  {id:'share',label:'Poor or low-income, all together',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?SHARE:null},
  {id:'fin',label:'Women naming financial reasons (Turnaway)',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?40:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  txt(ctx,big?'100 abortion patients':'100 abortion patients (2014 survey)',20,18,{s:14*k,w:700,b:'middle'});
  const c=24,gx=22,gy=44,col=s===1?false:sh;
  for(let i=0;i<100;i++){const x=gx+(i%10)*c+10,y=gy+Math.floor(i/10)*c+12;let cc=PAL['cv-bg2'];
   if(col&&i<POOR)cc='#c8102e';else if(col&&i<SHARE)cc='#e0a10b';else if(!sh&&gv!=null&&i<gv)cc=PAL['s4'];woman(ctx,x,y,cc);}
  let ly=gy+10*c+16*k;
  if(col){txt(ctx,'● below poverty: 49',gx,ly,{s:12.5*k,w:700,c:'#c8102e',b:'middle'});ly+=18*k;txt(ctx,big?'● low-income: 26':'● low-income (100–199%): 26',gx,ly,{s:12.5*k,w:700,c:'#b5650d',b:'middle'});ly+=20*k;
   txt(ctx,'49 + 26 = 75 of 100',gx,ly,{s:14*k,w:700,c:PAL['s1'],b:'middle'});}
  else if(gv!=null&&!sh)txt(ctx,'your gut: '+gv+' of 100',gx,ly,{s:12.5*k,w:700,c:PAL['s4'],b:'middle'});
  if(s===2&&ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,gx-6,gy-6,10*c+12,10*c+12+62*k,7);ctx.stroke();}
  /* right: one panel per step */
  const RX=292,RW=W-RX-14,PY=14,PH=H-28;
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church teaches');
   y=lines(ctx,k,RX+12,y,RW-24,big?['Human life must be protected from conception (CCC 2270).','The bishops ask every parish to walk with mothers in need.']:['Human life must be respected and protected absolutely from the moment of conception (Catechism 2270).','The U.S. bishops ask every parish to “walk with moms in need,” because most women who choose abortion are low-income.','Being pro-life means protecting the child and helping the mother. The numbers show where help is needed.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Most are poor','survey','#8a4fbf');
   y=lines(ctx,k,RX+12,y,RW-24,big?['49 of 100: below the poverty line.','26 more: low-income.','75 of 100 in all.']:['In a national survey of 8,380 abortion patients (Guttmacher, 2014), 49 of every 100 lived below the federal poverty line ($15,730 for a family of two).','26 more were low-income: 75 of 100 in all.','Pro-life groups and abortion-rights groups both cite this number.']);}
  else if(s===3||(s===99&&sh)){let y=panel(ctx,k,RX,PY,RW,s===99?230:PH,big?'Reasons women gave':'Reasons women gave (954 women, 2008–2010)','survey','#8a4fbf');
   y=hbars(ctx,k,RX+12,y+4,RW-24,[['Money',40,'#c8102e'],['Timing',36],['Partner',31],['Other children',29]],45,'#2b5fb3');
   if(s!==99)lines(ctx,k,RX+12,y+8,RW-24,big?['Most named several reasons (64%).']:['Most women named several reasons (64%). Money came first.','A pro-life response answers these reasons: money, a partner who leaves, children already at home.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'Health care for mothers','March of Dimes','#2b5fb3');
   y=lines(ctx,k,RX+12,y,RW-24,big?['35% of counties: no birthing hospital or OB.','2.3M women live there.','Medicaid paid for 41% of births (2022).']:['35% of U.S. counties (1,104) are “maternity care deserts”: no birthing hospital and no obstetric clinician.','2.3 million women of childbearing age live in them.','Medicaid paid for 41% of U.S. births in 2022.','Prenatal and birth care close to home is part of supporting a mother who chooses life.']);}
  else if(s===5){let y=panel(ctx,k,RX,PY,RW,PH,'Support changes choices');
   const row=(t,tag,tc,body)=>{ctx.font='700 '+(11*k)+'px '+FONT;const tw=ctx.measureText(tag).width+11*k*1.1;pill(ctx,tag,RX+12+tw/2,y,tc,'#fff',11*k);txt(ctx,t,RX+20+tw,y,{s:12.5*k,w:700,b:'middle'});y+=18*k;y+=wrap(ctx,body,RX+12,y,RW-24,{s:12*k,b:'middle'})+10*k;};
   row('Spain, 2007','natural experiment','#e0a10b',big?'A €2,500 baby payment meant more births and fewer abortions.':'A €2,500 payment for every new baby raised births, partly through fewer abortions (González, 2013).');
   row('Pregnancy centers, 2024','report','#2f9e44',big?'2,775 centers; over 1M new clients; $452M in help.':'2,775 centers saw over 1 million new clients and gave over $452 million in care and goods (Charlotte Lozier Institute).');
   row('A survey of 226 women','survey','#8a4fbf',big?'60% would have preferred birth with more support.':'60% of women who had abortions said they would have preferred to give birth with more support or money (small, pro-life study).');}
  else if(s===6){let y=panel(ctx,k,RX,PY,RW,PH,'What laws did after 2022');
   y=lines(ctx,k,RX+12,y,RW-24,big?['States with total bans: births +2.3% (~30,000 a year).','U.S. total, 2025: 1.13 million abortions.','In ban states, 97–100% came by mail.']:['In states with total bans, births rose about 2.3%: roughly 30,000 more babies a year (Dench, Pineda-Torres and Myers).','But U.S. abortions totaled 1.13 million in 2025, more than before 2022 (#WeCount).','In ban states, 97–100% of abortions counted were pills sent by mail from other states.','Laws protected some children; on their own they did not lower the national total.']);}
  else if(s===7&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Who counted?');
   y=lines(ctx,k,RX+12,y,RW-24,big?['Guttmacher, Turnaway: support abortion rights.','Lozier Institute: pro-life.','Economists: natural experiments.','All agree: most patients are poor.']:['Guttmacher and the Turnaway Study researchers support abortion rights. The Charlotte Lozier Institute is pro-life. The Spain and post-2022 studies are by academic economists.','Read every number with its source in mind. Where sources on both sides agree (most patients are poor; money is the top reason), the finding is strongest.']);}
  else if(s===8&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'The other viewpoint');
   y=lines(ctx,k,RX+12,y,RW-24,big?['Others call abortion health care and say denial deepens poverty.','The pro-life answer: help mother and child.']:['Supporters of legal abortion call it health care and point to Turnaway findings that women denied abortions faced more financial hardship.','The pro-life answer: poverty is a reason to help the mother and child, not to end a life. The Spain and pregnancy-center numbers show help can change outcomes.']);}
  else if(s===9){let y=panel(ctx,k,RX,PY,RW,PH,'Walking with moms');
   y=lines(ctx,k,RX+12,y,RW-24,big?['Walking with Moms in Need: every parish.','Catholic Charities Denver: Marisol Homes and Marisol Health.','Which help would you grow first?']:['Walking with Moms in Need asks every parish to know where to send a pregnant woman for help.','In Denver, Catholic Charities runs Marisol Homes (shelter for pregnant women and moms) and Marisol Health (life-affirming medical care).','Discuss: from these numbers, which kind of help would reduce abortions most, and how would you measure it?']);}
 },
 narrate(sim){if(!shown(sim))return `Of every 100 women who had an abortion, how many do you think were poor or low-income? Your gut: ${sim.p.guess}.`;
  return `<b>75 of 100</b> abortion patients were poor or low-income in 2014: 49 below the poverty line and 26 just above it. Money was the most common reason women gave. That is why the Church’s pro-life work includes walking with mothers in need.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Think of 100 women who had an abortion in the U.S. How many do you think were poor or low-income? Drag to your gut guess, then lock it in.',honors:'Drag to your gut guess: of 100 abortion patients, how many were poor or low-income?'},
  hint:{bio:'Lock in your gut. Then you will work it out from the survey.'},
  lock(sim){return {v:Math.abs(sim.p.guess-SHARE),guess:sim.p.guess,label:`${sim.p.guess} of 100`};},
  solve(sim){sim.p.guess=SHARE;return {v:0,guess:SHARE,label:'75 of 100 (2014 patient survey)'};},
  calc:{unit:'patients',d:0,tol:0.5,
   prompt:{bio:'In the 2014 survey, <b>49%</b> of abortion patients were below the poverty line and <b>26%</b> were low-income (just above it). Out of <b>1,000</b> patients, how many were poor or low-income?',ap:'49% below poverty, 26% at 100–199% of poverty. Of 1,000 patients, how many were poor or low-income?'},
   answer:()=>750,hint:'Add the two percents, then take that percent of 1,000.',
   steps:()=>['49% + 26% = 75%.','75% of 1,000 = 0.75 × 1,000 = <b>750</b> patients: 3 in every 4.']},
  formula:()=>'0.49 × 1,000 + 0.26 × 1,000 = 750 of 1,000'+(atLeast('honors')?'<br>Bans: +2.3% births ≈ 30,000 a year in ban states':''),
  how:{bio:'Add the parts of a group, then take that percent of the total.',honors:'Check who produced each number and how; trust most what sources on both sides agree on.'},
  compare(sim,g){const off=Math.abs(g.guess-SHARE);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the count yourself.':'';
   return (off<=5?'Close: about 3 in 4.':`You guessed ${g.guess} of 100. The survey found <b>75 of 100</b>.`)+' Poverty is the single biggest pattern in who has abortions, which is why helping mothers is at the center of pro-life work.'+self;},
  again(sim){sim.p.guess=30;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In the Turnaway Study, 386 of 954 women named financial reasons. What percent is that? Round to the nearest whole percent.',answer:100*386/954,tol:0.6,unit:'%',d:0,hint:'386 ÷ 954 × 100.',explain:'386 ÷ 954 × 100 ≈ 40%: money was the most common reason.'},
  {lvl:'bio',kind:'num',q:'35.1% of about 3,145 U.S. counties are maternity care deserts. About how many counties is that?',answer:0.351*3145,tol:3,unit:'counties',d:0,hint:'0.351 × 3,145.',explain:'0.351 × 3,145 ≈ 1,104 counties with no birthing hospital and no obstetric clinician.'},
  {lvl:'bio',instant:true,q:'Which response fits both the Church’s teaching and what the reasons data show?',choices:['Protect the child and help the mother with money, housing, health care and support','Only change laws','Ignore the reasons women give'],correct:0,explain:'Walking with Moms in Need asks parishes to meet the needs women name, while the Church teaches life must be protected from conception.'},
  {lvl:'honors',kind:'num',q:'About 30,000 extra births a year was a 2.3% increase in ban states. About how many births a year were there in those states? Round to the nearest thousand.',answer:30000/0.023,tol:1000,unit:'births',d:0,hint:'If 2.3% is 30,000, the whole is 30,000 ÷ 0.023.',explain:'30,000 ÷ 0.023 ≈ 1,304,000 births a year.'},
  {lvl:'honors',kind:'num',q:'About 300,000 of the 1.13 million abortions counted in 2025 were by telehealth (pills by mail). What percent is that? Round to the nearest whole percent.',answer:100*300000/1126760,tol:0.6,unit:'%',d:0,hint:'300,000 ÷ 1,126,760 × 100.',explain:'About 27%. Laws that close clinics do not reach pills sent across state lines.'},
  {lvl:'ap',instant:true,q:'Spain started paying €2,500 for every baby born on or after July 1, 2007. Why is that a strong test of whether support reduces abortions?',choices:['Because Spain is large','Because families just before and just after the date were alike except for the payment','Because the payment was small'],correct:1,explain:'A sharp start date works almost like a lottery, so a change right at the date points to the payment as the cause.'}
 ],
 tour:[
  {title:'What the Church teaches',text:'The Catechism (2270) teaches that human life must be respected and protected absolutely from the moment of conception. The U.S. bishops add that pro-life work means walking with mothers in need, because most women who choose abortion are low-income.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Most are poor',text:'In a national survey of abortion patients (Guttmacher, 2014), 49 of every 100 lived below the poverty line and 26 more were low-income: 75 of 100 in all.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'The reasons women give',text:'In the Turnaway Study (954 women), money was the most common reason (40%), then timing (36%), a partner (31%) and caring for children already at home (29%). Most named several reasons.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Health care for mothers',text:'March of Dimes found 35% of U.S. counties have no birthing hospital and no obstetric clinician; 2.3 million women of childbearing age live in them. Medicaid paid for 41% of births in 2022. Care close to home helps a mother choose life.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Support changes choices',text:'When Spain began paying €2,500 for every new baby in 2007, births rose, partly because abortions fell (González, 2013). U.S. pregnancy centers served over 1 million new clients in 2024. In one small pro-life survey, 60% of women who had abortions said they would have preferred to give birth with more support.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'What laws did',text:'After 2022, states with total bans saw births rise about 2.3%, roughly 30,000 babies a year. But U.S. abortions totaled 1.13 million in 2025, mostly because pills were mailed across state lines. Laws protected some children; support for mothers matters too.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'honors',title:'Who counted?',text:'Guttmacher and the Turnaway researchers support abortion rights; the Charlotte Lozier Institute is pro-life; the Spain and post-2022 studies are by academic economists. Findings that sources on both sides share (most patients are poor, money is the top reason) are the strongest.',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'ap',title:'The other viewpoint',text:'Supporters of legal abortion call it health care and point to Turnaway findings that women denied abortions faced more financial hardship. The pro-life answer is that poverty calls for helping mother and child, not ending a life; the Spain and pregnancy-center evidence shows help can change outcomes.',pause:true,setup:sim=>{sim.tst=8;}},
  {title:'Walking with moms',text:'Walking with Moms in Need asks every parish to know where to send a pregnant woman for help. In Denver, Catholic Charities runs Marisol Homes and Marisol Health. Discuss: from these numbers, which kind of help would reduce abortions most, and how would you measure it?',pause:true,setup:sim=>{sim.tst=9;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> Who faces abortion decisions, and why?</p><ol><li>Lock in your gut, then work out how many of 1,000 patients are poor or low-income.</li><li>Read the reasons chart and name the top two.</li></ol><p>Write one sentence on a kind of help that answers the top reason.</p>',
  honors:'<p><b>Question:</b> Which numbers can you trust most?</p><ol><li>For each source, name its method and its stance.</li><li>List two findings that sources on both sides agree on.</li></ol>',
  ap:'<p><b>Question:</b> What does the evidence say reduces abortions?</p><ol><li>Compare the Spain child benefit with the post-2022 bans: method, size of effect and limits.</li><li>Design a study that would measure whether a parish support program reduces abortions.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Federal poverty level',d:'An income line set each year by the government; in 2014 it was $15,730 for a family of two.'},
  {t:'Maternity care desert',d:'A county with no hospital or birth center offering obstetric care and no obstetric clinician.'},
  {t:'Natural experiment',d:'A real-world change, like a payment that starts on a set date, that sorts people almost as a lottery would.',lvl:'honors'},
  {t:'Source stance',d:'Whether the group that produced a number supports a side of the issue; check it, then check the method.',lvl:'honors'}
 ],
 about:'<p><b>Sources.</b> <i>Catechism of the Catholic Church</i>, 2270. USCCB, Walking with Moms in Need. Guttmacher Institute (supports abortion rights), Jerman, Jones and Onda, <i>Characteristics of U.S. Abortion Patients in 2014</i> (2016): 49% below poverty, 26% at 100–199%. Biggs, Gould and Foster, <i>BMC Women’s Health</i> 13:29 (2013), Turnaway Study. March of Dimes, <i>Nowhere to Go: Maternity Care Deserts Across the US</i> (2024). Libertad González, <i>American Economic Journal: Economic Policy</i> 5(3) (2013). Charlotte Lozier Institute (pro-life), <i>2025 National Pregnancy Center Report</i>. Reardon, Rafferty and Longbons, <i>Cureus</i> (2023), 226 women. Dench, Pineda-Torres and Myers, “The Effects of Post-Dobbs Abortion Bans on Fertility” (2024). Society of Family Planning, #WeCount report (June 2026). Catholic Charities of the Archdiocese of Denver, Marisol Services.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>The patient survey is from 2014; the share who are poor may have changed since.</li><li>Survey reasons are what women chose to say; pressure from others may be under-reported.</li><li>Counts after 2022 miss pills ordered from outside the U.S. health system.</li><li>Each number is a person: a mother and a child.</li></ul>'
};
BioLab.register(SIM);
})();
