(function(){
'use strict';
const {txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Prevention pays? Vaccines and the common good (Jason, Nov 19, 2026: "where we invest ... in disease prevention, vaccines, etc.").
   CDC, MMWR 73(31), Aug 8, 2024 (Zhou et al.): among about 117 million children born 1994–2023, routine childhood vaccination will have
   prevented about 508 million illnesses, 32 million hospitalizations and 1,129,000 deaths; net savings $540B direct and $2.7T societal.
   Measles vaccines: about 13.2 million hospitalizations prevented. CDC SchoolVaxView 2024–25: kindergarten MMR 92.5% (95.2% in 2019–20),
   exemptions 3.6% (record); about 286,000 kindergartners without documented MMR. Colorado (Axios Denver, Aug 4, 2025): MMR 88%,
   exemptions 4.2%. 95% coverage is the level that keeps measles from spreading.
   Measles cases: 285 in 2024 (PMC, 2025); 2,288 confirmed in 2025, 243 hospitalized, 3 deaths (KFF, Nov 2026); over 5,400 in 2026 by
   mid-November, and the U.S. lost its measles elimination status, held since 2000 (CNN, Nov 13, 2026; CBS, Nov 2026).
   Lancet (Apr 2024) / WHO EPI: 154 million lives saved worldwide since 1974; about 94 million by measles vaccines; Lancet Global Health:
   about $16 in benefits per $1 (1974–2024).
   mRNA: Karikó and Weissman (University of Pennsylvania) struggled for years to get funding ("We couldn't get funding," Weissman, NPR);
   NIH grantees; 2005 base-modification discovery; 2023 Nobel Prize. Karikó later joined BioNTech in Germany, which partnered with Pfizer.
   HHS (Aug 5, 2025): winding down 22 BARDA mRNA vaccine projects worth nearly $500 million, saying the data show they fail to protect
   effectively against upper respiratory infections; earlier (May 2025) a $766M Moderna pandemic-flu contract was cancelled (NPR).
   Church: CDF, Note on the morality of using some anti-Covid-19 vaccines (Dec 21, 2020), 5–6: vaccination is not, as a rule, a moral
   obligation and must be voluntary, yet the common good may call for it, especially to protect the weakest; Catechism 1906; Pope
   Francis (Aug 2021) called getting vaccinated an act of love. */
const DEATHS=1129,ILL=508,SOC=2.7e12,KIDS=117e6,PER=SOC/KIDS,USMMR=92.5,COMMR=88,TARGET=95;
const CASES=[['2024',285],['2025',2288],['2026*',5400]];
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,8);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();
 let yy=y+17*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=19*k;lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+5;});}
const usd=v=>'$'+Math.round(v).toLocaleString('en-US');

/* One body (Jason, Nov 19, 2026): Catholic social teaching is the true north; turning it into policy takes the moral (pope, bishops,
   priests), the technical (scientists, economists) and the policy (citizens, lawmakers) working together. 1 Cor 12:12-27; Gaudium et
   Spes 43 (pastors cannot give a concrete solution to every complicated problem; lay people bring expertise and a formed conscience). */
function oneBody(ctx,k,x,y,w,h,cols){const gap=26,cw=(w-2*gap)/3,big=k>1.25;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
 const heads=[['The moral','Church: what is right','#8a4fbf'],['The technical','Science: what works, what it costs','#1f5fbf'],['The policy','Citizens and lawmakers: what to do','#2f9e44']];
 heads.forEach((hd,i)=>{const cx=x+i*(cw+gap);ctx.fillStyle=PAL['cv-bg2'];rr(ctx,cx,y,cw,h-40*k,10);ctx.fill();ctx.fillStyle=hd[2];rr(ctx,cx,y,cw,6,3);ctx.fill();
  txt(ctx,hd[0],cx+10,y+24*k,{s:17*k,w:800,c:hd[2],b:'middle'});wrap(ctx,hd[1],cx+10,y+46*k,cw-20,{s:13*k,c:PAL['cv-soft'],b:'middle'});
  let yy=y+(big?84:80)*k;cols[i].forEach(t=>{yy+=wrap(ctx,'• '+t,cx+10,yy,cw-20,{s:14.5*k,b:'middle',lh:17.5*k})+7;});
  if(i<2){const ax=cx+cw+4,ay=y+(h-40*k)/2;ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(ax,ay-8);ctx.lineTo(ax+gap-8,ay);ctx.lineTo(ax,ay+8);ctx.fill();}});
 wrap(ctx,big?'Principles form consciences, not answers. One body (1 Cor 12).':'These principles do not hand out answers; they form consciences with the mind to make a difference and the heart to want to. One body, many parts (1 Corinthians 12): no one person can do all of this.',x+4,y+h-24*k,w-8,{s:13.5*k,w:700,b:'middle'});}
const SIM={
 id:'vaccinepays',hash:'vaccinepays',apUnit:8,order:2,tab:'Prevention pays? Vaccines',kind:'Learning tool',prereq:['budget'],next:['lifeworth','builtthere'],
 skills:{bio:'Large numbers, per-person rates and percent · Algebra 1 (Unit 2), Social Justice (Life and medical ethics), Health',
  honors:'Thresholds: why 95% and not 90% · Algebra 1 (Unit 6: functions), AP Microeconomics (Unit 6: positive externalities)',
  ap:'Herd immunity threshold 1 − 1/R₀, and benefits that spill over to others · AP Microeconomics (Unit 6), AP Statistics'},
 card:'Guess how many U.S. children’s deaths routine vaccines prevented, work out what prevention saved per child, then see what happened when measles coverage slipped below 95%.',
 title:'Prevention pays? Vaccines and the common good',
 lede:{bio:'Prevention is invisible: nobody sees the illness that never happened. Count what U.S. childhood vaccines prevented, then watch what happens when fewer children are vaccinated.',
  honors:'A vaccine protects the child who gets it and the people around them. Find the coverage line that stops measles, and compare the cost of prevention with the cost of outbreaks.',
  ap:'Vaccination has a positive externality: much of the benefit goes to others. Use 1 − 1/R₀ to find the threshold, and ask who should pay.'},
 scale:'United States, children born 1994–2023, and measles 2024–2026. CDC, KFF, the World Health Organization, HHS and the Church; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: U.S. children’s deaths prevented by routine vaccines (born 1994–2023), in thousands',type:'range',min:0,max:2000,step:50,def:200,unit:'k'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'deaths',label:'Deaths prevented, children born 1994–2023 (CDC)',unit:'',d:0,min:0,max:2e6,get:s=>shown(s)?DEATHS*1000:null},
  {id:'per',label:'Societal savings per child (CDC)',unit:'$',d:0,min:0,max:5e4,get:s=>shown(s)?PER:null},
  {id:'mmr',label:'Kindergartners with both MMR doses, 2024–25',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?USMMR:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.25;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const vis=n=>s===99?sh:s>=n;
  /* left: 100 kindergartners */
  const LX=16,LW=300;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,LX,12,LW,H-24,10);ctx.fill();
  if(!vis(3)||s===9){const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
   txt(ctx,'Deaths prevented (thousands)',LX+12,32,{s:14*k,w:700,b:'middle'});
   const bx=LX+40,bw=60,by=60,bh=H-120,Y=v=>by+bh-bh*v/2000;
   ctx.fillStyle=PAL['cv-bg'];rr(ctx,bx,by,bw,bh,6);ctx.fill();[0,500,1000,1500,2000].forEach(v=>txt(ctx,String(v),bx-6,Y(v),{s:10.5*k,a:'right',b:'middle',c:PAL['cv-soft']}));
   if(gv!=null){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx-4,Y(gv));ctx.lineTo(bx+bw+4,Y(gv));ctx.stroke();txt(ctx,'your gut: '+gv+'k',bx+bw+10,Y(gv),{s:12*k,w:700,c:PAL['s4'],b:'middle'});}
   if(sh){ctx.fillStyle='#2f9e44';rr(ctx,bx,Y(DEATHS),bw,bh*DEATHS/2000,6);ctx.fill();txt(ctx,'1,129k',bx+bw+10,Y(DEATHS)-14,{s:13*k,w:800,c:'#2f9e44',b:'middle'});txt(ctx,'(CDC)',bx+bw+10,Y(DEATHS)+4,{s:11*k,c:PAL['cv-soft'],b:'middle'});}
   if(s===1&&ONT)ring(ctx,LX-3,9,LW+6,H-18);}
  else{const yr=s===99||s>=3;txt(ctx,'100 kindergartners, 2024–25',LX+12,32,{s:14*k,w:700,b:'middle'});
   const c=24,gx=LX+30,gy=54;for(let i=0;i<100;i++){const x=gx+(i%10)*c,y=gy+Math.floor(i/10)*c;const cov=i<92?1:i===92?0.5:0;
    ctx.fillStyle=cov===1?'#2f9e44':cov===0.5?'#8fcf9f':(i<96?'#e0a10b':'#c8102e');ctx.beginPath();ctx.arc(x+c/2,y+c/2,c*0.36,0,7);ctx.fill();}
   /* the 95% line: after child 95 */
   const lx=gx+5*c,ly=gy+9*c;ctx.strokeStyle='#1f5fbf';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx,ly+c);ctx.moveTo(gx,ly);ctx.lineTo(lx,ly);ctx.stroke();
   let ty=gy+10*c+16*k;txt(ctx,'● vaccinated: 92.5',LX+14,ty,{s:12*k,w:700,c:'#2f9e44',b:'middle'});ty+=17*k;
   txt(ctx,'● exempt: 3.6   ● not up to date: 3.9',LX+14,ty,{s:12*k,w:700,c:'#b5650d',b:'middle'});ty+=17*k;
   txt(ctx,'blue line: 95% stops measles spreading',LX+14,ty,{s:12*k,w:700,c:'#1f5fbf',b:'middle'});ty+=17*k;
   if(!big)txt(ctx,'Colorado: 88% (12 of 100 not vaccinated)',LX+14,ty,{s:12*k,w:700,c:'#c8102e',b:'middle'});
   if(s===3&&ONT)ring(ctx,LX-3,9,LW+6,H-18);}
  /* right panel */
  const RX=LX+LW+12,RW=W-RX-16;
  if(s===99){if(sh){box(ctx,k,RX,12,RW,128,'Prevention, counted (CDC, born 1994–2023)',[`${ILL} million illnesses, 32 million hospital stays and 1,129,000 deaths prevented.`,`Society saved $2.7 trillion: about ${usd(PER)} per child.`]);
    cases(ctx,k,RX,150,RW,H-162,big);}
   else box(ctx,k,RX,12,RW,H-24,'Prevention is invisible',['Nobody sees the illness that never happened. Lock in your gut on the left, then the numbers appear.']);}
  else if(s<=2)box(ctx,k,RX,12,RW,H-24,s===1?'What routine vaccines prevented':'What prevention saved',s===1?['Among about 117 million U.S. children born 1994–2023, routine vaccines will have prevented about 508 million illnesses, 32 million hospital stays and 1,129,000 deaths (CDC, 2024).','Measles vaccines alone prevented about 13.2 million hospital stays.']:[`Net savings to society: $2.7 trillion (medical bills plus parents’ lost work).`,`$2,700,000,000,000 ÷ 117,000,000 children ≈ ${usd(PER)} per child.`,'Worldwide since 1974, vaccines saved about 154 million lives, and about $16 came back for every $1 spent (WHO-led studies, 2024).']);
  else if(s===9)box(ctx,k,RX,12,RW,H-24,'What does “pays” mean?',big?['“Pays” is a money word.','The savings count bills and lost earnings.','A person’s worth is not their earnings (CCC 1700).','Most medicine costs more than it saves.']:['“Pays” is a money word. The $2.7 trillion counts medical bills, parents’ lost work and the earnings a person would have made: it measures a life by what it costs and what it earns.','The Church teaches that every person’s dignity comes from being made in the image of God, not from what they earn (Catechism 1700).','Most medical care does not “pay”: most treatments and even most prevention cost more than they save, and we provide them anyway. Childhood vaccines are among the few that do both (New England Journal of Medicine, 2008).','So ask: if a vaccine cost more than it saved, would that settle the question?']);
  else if(s===3)box(ctx,k,RX,12,RW,H-24,'The 95% line',big?['92.5 of 100 U.S. kindergartners had both MMR doses.','Colorado: 88.','95 stops measles.']:['In 2024–25, 92.5 of every 100 U.S. kindergartners had both MMR doses, down from 95.2 in 2019–20. 3.6 had an exemption, a record.','Colorado: 88 of 100.','About 95 of 100 must be immune to keep measles from spreading. Below it, one case can start an outbreak.']);
  else if(s===4)box(ctx,k,RX,12,RW,H-24,'Why 95%? (honors)',big?['One case infects 12 to 18 others.','Threshold = 1 − 1/R₀.','1 − 1/15 ≈ 93%.']:['With no one immune, one measles case infects about 12 to 18 others (R₀).','To stop spread, each case must infect fewer than 1: the share immune must be at least 1 − 1/R₀.','For R₀ = 15: 1 − 1/15 ≈ 93.3%. The vaccine is about 97% effective, so coverage must be about 95%.']);
  else if(s===5){cases(ctx,k,RX,12,RW,H-24,big);if(ONT)ring(ctx,RX-3,9,RW+6,H-18);}
  else if(s===6)box(ctx,k,RX,12,RW,H-24,'Investing in the next vaccine',big?['mRNA: Penn, 1990s to 2005.','Nobel Prize, 2023.','2025: 22 projects ended.']:['mRNA vaccines grew from work by Katalin Karikó and Drew Weissman at the University of Pennsylvania, who for years could not get funding. NIH grants supported them; they won the 2023 Nobel Prize.','In 2025 HHS ended 22 BARDA mRNA vaccine projects worth nearly $500 million, saying the data show these vaccines do not protect well against infections like flu and COVID. Many public health and biosecurity experts objected.','Discuss: how should a government decide which research to fund?']);
  else if(s===7)box(ctx,k,RX,12,RW,H-24,'The common good',big?['A vaccine protects you and others.','Church: voluntary, but the common good may call for it.','Pope Francis: “an act of love.”']:['A vaccine protects the child who gets it and the people around them who cannot be vaccinated: newborns, cancer patients, the very old.','The Church teaches that vaccination must be voluntary, yet the common good may call for it, especially to protect the weakest (CDF, 2020). Pope Francis called getting vaccinated “an act of love.”','Budget question: what is prevention worth when its success is invisible?']);
  else if(s===8)oneBody(ctx,k,16,14,W-32,H-24,[['Life and dignity of every person','Option for the poor and vulnerable: newborns, the sick','Solidarity: my vaccine protects you','Subsidiarity and freedom: vaccination is voluntary'],['How well each vaccine works, and how safe it is','The 95% line for measles','What prevention saves, per child'],['Paying for vaccines (Vaccines for Children, 1994)','School rules and exemptions','Which research to fund next']]);
 },
 narrate(sim){if(!shown(sim))return `Routine vaccines were given to about 117 million U.S. children born 1994–2023. How many deaths do you think they prevented? Your gut: ${sim.p.guess.toLocaleString('en-US')} thousand.`;
  return `CDC estimates routine childhood vaccines prevented about <b>1,129,000 deaths</b> and saved society <b>$2.7 trillion</b>, about <b>${usd(PER)} per child</b>. In 2024–25 only <b>92.5%</b> of kindergartners had both MMR doses (95% stops measles); measles cases rose from 285 in 2024 to over 5,400 in 2026, and the U.S. lost its measles elimination status.`;},
 gut:{better:'higher',controls:['guess'],
  ask:{bio:'Routine vaccines were given to about 117 million U.S. children born from 1994 to 2023. How many deaths do you think they prevented? Drag to your gut (in thousands), then lock it in.',honors:'Drag to your gut guess of deaths prevented by U.S. routine childhood vaccines (born 1994–2023), then lock it in.'},
  hint:{bio:'Lock in your gut. A 2024 CDC study counted illnesses, hospital stays and deaths prevented.'},
  lock(sim){return {v:Math.abs(sim.p.guess-DEATHS),guess:sim.p.guess,label:`${sim.p.guess.toLocaleString('en-US')} thousand`};},
  solve(sim){sim.p.guess=1150;return {v:0,guess:1150,label:'about 1,129 thousand (CDC)'};},
  calc:{unit:'dollars',d:0,tol:300,
   prompt:{bio:'CDC estimates routine vaccines saved society <b>$2.7 trillion</b> across about <b>117 million</b> children. About how many dollars is that per child? Round to the nearest hundred.',ap:'$2.7 trillion saved across 117 million children. Dollars per child, to the nearest hundred.'},
   answer:()=>Math.round(PER/100)*100,hint:'2,700,000,000,000 ÷ 117,000,000. Cancel six zeros first: 2,700,000 ÷ 117.',
   steps:()=>['$2,700,000,000,000 ÷ 117,000,000 = 2,700,000 ÷ 117.',`≈ <b>${usd(Math.round(PER/100)*100)}</b> saved per child.`]},
  formula:()=>`$2.7 trillion ÷ 117 million ≈ ${usd(PER)} per child`+(atLeast('honors')?'<br>Herd immunity threshold: 1 − 1/R₀ = 1 − 1/15 ≈ 93%':''),
  how:{bio:'Divide a total by the number of people to get a per-person amount.',honors:'A threshold turns a small change in coverage into a big change in outcomes.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the savings per child yourself.':'';
   return (Math.abs(g.guess-DEATHS)<=150?'Close: about 1,129,000 deaths.':`You guessed ${g.guess.toLocaleString('en-US')} thousand. CDC estimates about <b>1,129 thousand</b>: more than a million children.`)+' Prevention is hard to see: nobody notices the illness that never happened.'+self;},
  again(sim){sim.p.guess=200;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Routine vaccines prevented about 1,129,000 deaths among 117 million children. About how many deaths per 1,000 children is that? One decimal place.',answer:+(1129000/117000).toFixed(1),tol:0.1,unit:'per 1,000',d:1,hint:'1,129,000 ÷ 117,000.',explain:'1,129,000 ÷ 117,000 ≈ 9.6 deaths prevented per 1,000 children: about 1 in 100.'},
  {lvl:'bio',kind:'num',q:'In 2025–26 U.S. measles cases went from 2,288 (2025) to over 5,400 (2026). About how many times bigger? One decimal place.',answer:+(5400/2288).toFixed(1),tol:0.1,unit:'times',d:1,hint:'5,400 ÷ 2,288.',explain:'5,400 ÷ 2,288 ≈ 2.4 times. From 2024 (285 cases) it is about 19 times.'},
  {lvl:'bio',instant:true,q:'92.5% of U.S. kindergartners had both MMR doses; 95% stops measles from spreading. What does the gap mean?',choices:['Nothing; 92.5% is close enough','Enough children are unprotected for one case to start an outbreak, especially where coverage is lower','It means the vaccine does not work'],correct:1,explain:'Below the threshold, measles finds enough unprotected people to keep spreading. Coverage is lower in some places (Colorado 88%).'},
  {lvl:'honors',kind:'num',q:'If one measles case would infect 18 others (R₀ = 18), what share must be immune to stop spread? Percent, one decimal place.',answer:+(100*(1-1/18)).toFixed(1),tol:0.1,unit:'%',d:1,hint:'1 − 1/18.',explain:'1 − 1/18 = 0.944 = 94.4%.'},
  {lvl:'honors',instant:true,q:'92.5% vaccinated and 3.6% exempt add to 96.1%. What might the other 3.9% mean?',choices:['Nothing','Children who are not exempt but not up to date: often missed appointments, paperwork or access','Children who are immune from having measles'],correct:1,explain:'Pediatricians point to this gap as a sign of access problems, not only of choice.'},
  {lvl:'honors',instant:true,q:'A new vaccine would save lives but cost more than it saves in dollars. What follows?',choices:['Do not fund it: it does not pay','The dollars are one input; a life’s worth is not its earnings, so weigh lives, costs and other needs together','Fund it no matter what it costs'],correct:1,explain:'Most medical care costs more than it saves. Cost-benefit math informs the choice; it does not decide what a person is worth.'},
  {lvl:'ap',instant:true,q:'Why might a free market buy fewer vaccines than is best for everyone?',choices:['Vaccines are too cheap','Part of the benefit goes to others (a positive externality), which the buyer does not count','People do not like shots'],correct:1,explain:'Each vaccinated person also protects others. Programs like Vaccines for Children (1994) pay for that spillover.'}
 ],
 tour:[
  {title:'What prevention prevented',text:'A 2024 CDC study followed about 117 million U.S. children born from 1994 to 2023. Routine vaccines will have prevented about 508 million illnesses, 32 million hospital stays and <b>1,129,000 deaths</b>. Measles vaccines alone prevented about 13.2 million hospital stays.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'What prevention saved',text:'Counting medical bills and parents’ lost work, society saved about $2.7 trillion: $2.7 trillion ÷ 117 million ≈ $23,000 per child. Worldwide, WHO-led studies estimate vaccines saved about 154 million lives since 1974, returning about $16 for every $1 spent.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'What does “pays” mean?',text:'“Prevention pays” uses a money word for a moral question. The $2.7 trillion counts medical bills, parents’ lost work and the earnings a person would have made, so the math measures a life by what it costs and earns. The Church teaches that every person’s dignity comes from being made in the image of God, not from earnings (Catechism 1700). And most medical care does not “pay”: most treatments and even most prevention cost more than they save, yet we provide them because people matter. Childhood vaccines happen to save lives and money. Ask: if a vaccine cost more than it saved, would that settle the question? (Go further: <b>What is a life worth?</b>)',pause:true,setup:sim=>{sim.tst=9;}},
  {title:'The 95% line',text:'Measles spreads so easily that about 95 of every 100 people must be immune to stop it. In 2024–25, 92.5 of every 100 U.S. kindergartners had both MMR doses, down from 95.2 in 2019–20. Exemptions reached a record 3.6%. In Colorado it was 88 of 100.',pause:true,setup:sim=>{sim.tst=3;}},
  {lvl:'honors',title:'Why 95%?',text:'With no one immune, one measles case infects about 12 to 18 others; that number is R₀. Spread stops when each case infects fewer than one more, which needs a share immune of at least 1 − 1/R₀. For R₀ = 15 that is about 93%. The vaccine is about 97% effective, so coverage must be about 95%.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'When coverage slips',text:'U.S. measles cases: 285 in 2024, 2,288 in 2025 (243 hospitalized, 3 deaths), and over 5,400 in 2026 by mid-November. In November 2026 the U.S. lost the measles elimination status it had held since 2000. Nearly all cases were in people who were unvaccinated or whose status was unknown.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Investing in the next vaccine',text:'mRNA vaccines grew from decades of work by Katalin Karikó and Drew Weissman at the University of Pennsylvania. “We couldn’t get funding,” Weissman said; NIH grants kept them going, and they won the 2023 Nobel Prize. In 2025 HHS ended 22 BARDA mRNA vaccine projects worth nearly $500 million, saying the data show these vaccines do not protect well against infections like flu and COVID; many public health and biosecurity experts objected. Like the battery story, an American discovery depends on someone continuing to invest.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'The common good',text:'A vaccine protects the child who gets it and the people around them who cannot be vaccinated: newborns, cancer patients, the very old. The Church teaches that vaccination must be voluntary, yet the common good may call for it, especially to protect the weakest (Congregation for the Doctrine of the Faith, 2020), and Pope Francis called getting vaccinated “an act of love.” Discuss: what is prevention worth in a budget when its success is invisible?',pause:true,setup:sim=>{sim.tst=7;}}
,
  {title:'One body: from principle to policy',text:'Catholic social teaching gives the true north: the life and dignity of every person, the option for the poor and vulnerable, solidarity and subsidiarity. It does not write the school vaccine rule. Doctors and scientists say how well a vaccine works and how safe it is. Citizens and lawmakers make the prudential choice about what to fund and require. The Second Vatican Council taught that pastors cannot hand out a concrete answer to every complicated problem; lay people bring their expertise and a formed conscience (<i>Gaudium et Spes</i> 43). The principles are not designed to give answers but to form consciences: the mind to make a difference and the heart to want to. Like the body in 1 Corinthians 12, each part needs the others: no one person can do all of this.',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What does prevention buy?</p><ol><li>Lock in your gut, then work out the savings per child.</li><li>Shade the 100 kindergartners for the U.S. and for Colorado, and mark the 95% line.</li></ol><p>Write one sentence: why is prevention hard to fund?</p>',
  honors:'<p><b>Question:</b> Where is the line?</p><ol><li>Compute 1 − 1/R₀ for R₀ = 12, 15 and 18.</li><li>Compare each with U.S. and Colorado coverage.</li></ol><p>Explain why a few points of coverage matter so much.</p>',
  ap:'<p><b>Question:</b> Who should pay for prevention?</p><ol><li>Name the positive externality.</li><li>Use the CDC savings to argue for or against public funding, and give the strongest objection.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Prevention',d:'Stopping an illness before it starts, so its success is the illness that never happens.'},
  {t:'Coverage',d:'The share of people who have received a vaccine.'},
  {t:'Herd immunity',d:'When enough people are immune that a disease cannot keep spreading, protecting those who are not.'},
  {t:'R₀',d:'How many people one case infects when no one is immune.',lvl:'honors'},
  {t:'Positive externality',d:'A benefit that goes to people other than the buyer.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Zhou and others, “Health and Economic Benefits of Routine Childhood Immunizations in the Era of the Vaccines for Children Program, United States, 1994–2023,” <i>MMWR</i> 73(31), August 8, 2024. CDC SchoolVaxView, kindergarten coverage 2024–25; Axios Denver (August 4, 2025) for Colorado. KFF, “Measles Elimination Status” (November 2026); CNN (November 13, 2026) and CBS News (November 2026) on the loss of elimination status and 2026 cases. WHO, UNICEF and Gavi on the 2024 <i>Lancet</i> study of 50 years of immunization; CIDRAP on the $16-per-$1 estimate (<i>Lancet Global Health</i>). Cohen, Neumann and Weinstein, “Does Preventive Care Save Money?” <i>New England Journal of Medicine</i> 358 (2008). <i>Catechism of the Catholic Church</i>, 1700. Penn Medicine, NIH Record and NPR (October 2023) on Karikó and Weissman. HHS press release, “HHS Winds Down mRNA Vaccine Development Under BARDA” (August 5, 2025); NPR (August 6, 2025). Congregation for the Doctrine of the Faith, <i>Note on the morality of using some anti-Covid-19 vaccines</i> (December 21, 2020); <i>Catechism of the Catholic Church</i>, 1906.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>“Deaths prevented” and “savings” come from models of what would have happened without vaccines; they are estimates, not counts.</li><li>Measles counts are confirmed cases; experts say many cases go unreported.</li><li>National coverage hides local gaps: one school or town far below 95% can have an outbreak while the state average looks fine.</li><li>Vaccines, like all medicines, can have side effects; serious ones are rare, and families weigh them with their doctors.</li></ul>'
};
function cases(ctx,k,x,y,w,h,big){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();txt(ctx,'U.S. measles cases',x+12,y+18*k,{s:14*k,w:700,b:'middle'});
 const bx=x+60,bw=w-120,mx=6000,top=y+40*k,bh=Math.min(28,(h-90*k)/3-8);
 CASES.forEach((c,i)=>{const yy=top+i*(bh+12);txt(ctx,c[0],x+12,yy+bh/2,{s:12.5*k,w:700,b:'middle'});ctx.fillStyle=i===2?'#c8102e':i===1?'#e0a10b':'#2f9e44';rr(ctx,bx,yy,Math.max(4,bw*c[1]/mx),bh,5);ctx.fill();
  txt(ctx,(i===2?'over ':'')+c[1].toLocaleString('en-US'),bx+Math.max(4,bw*c[1]/mx)+6,yy+bh/2,{s:12.5*k,w:800,b:'middle'});});
 wrap(ctx,big?'* by mid-Nov. U.S. lost measles elimination, Nov 2026.':'* through mid-November. In November 2026 the U.S. lost the measles elimination status it had held since 2000.',x+12,top+3*(bh+12)+8*k,w-24,{s:12*k,b:'middle'});}
BioLab.register(SIM);
})();
