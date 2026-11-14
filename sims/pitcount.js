(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Counting on one night: what a point-in-time count sees, and what it misses.
   HUD, 2025 AHAR Part 1 (May 29, 2026): 745,652 people experiencing homelessness on a single night in January 2025, 479,332 sheltered and
   266,320 unsheltered; down 25,828 (about 3.3%) from 771,480 in 2024; 230,366 people in families with children; about 22 per 10,000 people.
   Metro Denver Homeless Initiative: one-night counts 9,997 (2024), 10,774 (2025), 9,950 (2026); Colorado's State of Homelessness
   Report 2025 counted 35,601 people in metro Denver across the year. National Center for Homeless Education: public schools
   identified 1,374,537 students who experienced homelessness in school year 2022-23, a definition that includes families doubled up. */
const N={tot:745652,sh:479332,un:266320,y24:771480,fam:230366,rate:22,pop:340e6},DEN={p24:9997,p25:10774,p26:9950,yr:35601},STU=1374537;
const RATIO=DEN.yr/DEN.p25;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}

const SIM={
 id:'pitcount',hash:'pitcount',apUnit:3,order:6,tab:'Counting on one night',kind:'Learning tool',prereq:['hiddenends'],next:['foodmath'],
 skills:{bio:'Ratios and parts of a whole: one night vs. a whole year · Algebra 1 (Unit 2), Social Justice (Homelessness), Sociology (Unit 3)',
  honors:'Rates per 10,000, percent change and how a definition changes a count · Algebra 1 (Unit 2), Statistics (Chapter 4)',
  ap:'Stock vs. flow: a one-night count and a yearly count of a population that turns over · Statistics (Chapter 4), AP Macroeconomics (Unit 2: measurement)'},
 card:'Guess how many people a metro Denver count of a whole year finds compared with one January night, then work out the ratio and see what each count misses.',
 title:'Counting on one night',
 lede:{bio:'Every January, volunteers count everyone experiencing homelessness on a single night. Compare that one-night count with a count of the whole year, and see why the two are so different.',
  honors:'Who counts as homeless depends on the definition. HUD counts shelters and the street; schools also count families staying with others. Same country, different numbers.',
  ap:'A one-night count is a stock; a yearly count is a flow. When people move in and out of homelessness, the yearly number is several times the one-night number.'},
 scale:'United States, January 2025 (HUD). Metro Denver, 2025 (Metro Denver Homeless Initiative).',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: people counted across all of 2025 in metro Denver',type:'range',min:10000,max:60000,step:500,def:12000,unit:' people'},
  {id:'reveal',label:'Show the counts now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'night',label:'Metro Denver, one night (Jan 2025)',unit:'people',d:0,min:0,max:60000,get:s=>DEN.p25},
  {id:'year',label:'Metro Denver, across 2025',unit:'people',d:0,min:0,max:60000,get:s=>shown(s)?DEN.yr:null},
  {id:'ratio',label:'Year ÷ one night',unit:'×',d:1,min:0,max:10,get:s=>shown(s)?RATIO:null},
  {id:'us',label:'U.S., one night in January 2025',unit:'people',d:0,lvl:'honors',min:0,max:1e6,get:s=>N.tot},
  {id:'unsh',label:'U.S. unsheltered share',unit:'%',d:1,lvl:'honors',min:0,max:100,get:s=>100*N.un/N.tot}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: the U.S. one-night count as dots, 1 dot = 1,000 people */
  txt(ctx,big?'U.S., one night, Jan 2025':'United States, one night in January 2025',20,18,{s:14*k,w:700,b:'middle'});
  const cols=30,cs=big?9:10,gx=20,gy=38,nd=Math.round(N.tot/1000),nsh=Math.round(N.sh/1000);
  for(let i=0;i<nd;i++){const c=i%cols,r=(i/cols)|0;ctx.fillStyle=s>=2&&i>=nsh?PAL['s1']:PAL['s2'];ctx.beginPath();ctx.arc(gx+c*(cs+2)+cs/2,gy+r*(cs+2)+cs/2,cs/2,0,7);ctx.fill();}
  const gw=cols*(cs+2),gh=Math.ceil(nd/cols)*(cs+2);let ly=gy+gh+12*k;
  txt(ctx,'Each dot = 1,000 people: 745,652 in all',gx,ly,{s:12*k,w:700,b:'middle'});ly+=16*k;
  if(s>=2){txt(ctx,'● sheltered 479,332',gx,ly,{s:12*k,w:700,c:PAL['s2'],b:'middle'});txt(ctx,'● unsheltered 266,320 (36%)',gx+(big?0:150),big?ly+16*k:ly,{s:12*k,w:700,c:PAL['s1'],b:'middle'});
   if(s===2&&ONT)ring(ctx,gx-5,gy+((nsh/cols)|0)*(cs+2)-4,gw+10,gh-((nsh/cols)|0)*(cs+2)+8);}
  if(s===1&&ONT)ring(ctx,gx-5,gy-5,gw+10,gh+10);
  /* right: Denver, one night vs. the year */
  const RX=gx+gw+30,RW=W-RX-18;let y=24;
  txt(ctx,big?'Metro Denver, 2025':'Metro Denver, 2025: one night vs. the whole year',RX,y,{s:14*k,w:700,b:'middle'});y+=22*k;
  const sc=(RW-90)/60000,S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const bar=(l,v,c,show)=>{txt(ctx,l,RX,y,{s:12*k,w:700,b:'middle'});y+=10*k;if(show){ctx.fillStyle=c;rr(ctx,RX,y,Math.max(3,v*sc),16,4);ctx.fill();txt(ctx,f0(v),RX+v*sc+6,y+8,{s:12*k,w:700,b:'middle'});}
   else{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW-60,16,4);ctx.fill();txt(ctx,'?',RX+(RW-60)/2,y+8,{s:12*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});}y+=30*k;};
  if(s>=3||s===99){bar('One night in January',DEN.p25,PAL['s2'],true);
   if(gv!=null&&!sh)bar('Your gut: across the year',gv,PAL['s4'],true);
   bar('Everyone counted across the year',DEN.yr,PAL['s1'],sh);
   if(sh)txt(ctx,`${f0(DEN.yr)} ÷ ${f0(DEN.p25)} = ${f1(RATIO)} times`,RX,y,{s:13*k,w:700,c:PAL['s1'],b:'middle'});
   if(s===3&&ONT)ring(ctx,RX-6,24+10*k,RW+12,y-24+4*k);y+=20*k;}
  const by=Math.max(y,230),bh=H-by-14;
  if(s===4)box(ctx,k,RX,by,RW,bh,'Why the year is bigger',['People move in and out of homelessness. One night catches only those homeless that night.','Across 2025, about 3.3 people were counted for every 1 on the January night.']);
  else if(s===5&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'A different definition',['Schools counted 1,374,537 students who experienced homelessness in 2022-23.','Their definition includes families staying with others (“doubled up”), which HUD’s count leaves out.']);
  else if(s===6&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'A rate and a change',['745,652 ÷ 340 million × 10,000 ≈ 22 per 10,000 people.','2024 → 2025: 771,480 → 745,652, down about 3.3%, the first drop since 2016.']);
  else if(s===7&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'Stock and flow',['One night (a stock) × how often people turn over ≈ people over a year (a flow).','If a typical stay lasts about 4 months, a year sees about 3 times the one-night number.']);
  else if(s===8)box(ctx,k,RX,by,RW,bh,'Who responds',['Catholic Charities’ Samaritan House (Denver, 1986) was the first U.S. building designed as a homeless shelter.','FY2025: 277,000 nights of shelter on the Front Range. 277,000 ÷ 365 ≈ 759 people a night.']);
 },
 narrate(sim){if(!shown(sim))return `On one January night in 2025, metro Denver counted <b>${f0(DEN.p25)}</b> people experiencing homelessness. How many were counted across the whole year? Your gut: ${f0(sim.p.guess)}.`;
  return `Across 2025, metro Denver counted <b>${f0(DEN.yr)}</b> people: about <b>${f1(RATIO)} times</b> the one-night count of ${f0(DEN.p25)}. Nationally, HUD counted 745,652 people on one night in January 2025, 36% of them unsheltered.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'On one night in January 2025, metro Denver counted 10,774 people experiencing homelessness. A count of everyone who experienced homelessness at any time in 2025 found how many? Drag to your gut guess, then lock it in.',honors:'One night in January 2025: 10,774 people in metro Denver. Drag to your gut guess of the count for the whole year, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out how many times bigger the year count is.'},
  lock(sim){return {v:Math.abs(sim.p.guess-DEN.yr),guess:sim.p.guess,label:`${f0(sim.p.guess)} people`};},
  solve(sim){sim.p.guess=DEN.yr;return {v:0,guess:DEN.yr,label:`${f0(DEN.yr)} people (State of Homelessness Report)`};},
  calc:{unit:'times',d:1,tol:0.05,
   prompt:{bio:'Metro Denver counted <b>10,774</b> people on one night in January 2025 and <b>35,601</b> across the whole year. How many times bigger is the year count? Round to one decimal place.',ap:'One-night count 10,774; yearly count 35,601. Find the ratio of the yearly count to the one-night count, to one decimal place.'},
   answer:()=>+RATIO.toFixed(1),hint:'Divide the bigger count by the smaller: 35,601 ÷ 10,774.',
   steps:()=>['Ratio = year count ÷ one-night count.','35,601 ÷ 10,774 = 3.30…',`About <b>${f1(RATIO)} times</b>: for every person counted on one night, about 3 more were homeless at some point in the year.`]},
  formula:()=>`Year ÷ night = 35,601 ÷ 10,774 = ${f1(RATIO)}`+(atLeast('honors')?'<br>U.S. rate, Jan 2025: 745,652 ÷ 340 million × 10,000 ≈ 22 per 10,000':''),
  how:{bio:'Divide one count by the other to see how many times bigger it is.',honors:'Before comparing two counts, check their definitions and their time windows.'},
  compare(sim,g){const off=Math.abs(g.guess-DEN.yr);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the ratio yourself.':'';
   return (off<=3000?`Close: within ${f0(off)}.`:`You guessed ${f0(g.guess)}. The year count was <b>${f0(DEN.yr)}</b>, so you were off by ${f0(off)}.`)+' Most people picture the one-night number as the whole story. People move in and out of homelessness, so a year sees about 3 times as many.'+self;},
  again(sim){sim.p.guess=12000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Nationally, 266,320 of the 745,652 people counted on one night were unsheltered (on the street, in cars, in encampments). What percent is that? Round to the nearest whole percent.',answer:100*N.un/N.tot,tol:0.6,unit:'%',d:0,hint:'Part ÷ whole × 100.',explain:'266,320 ÷ 745,652 × 100 ≈ 36%. The other 64% were in shelters or transitional housing.'},
  {lvl:'bio',instant:true,q:'Why is the one-night count smaller than the count for the whole year?',choices:['The year count is wrong','People move in and out of homelessness; one night only catches those homeless that night','The January count happens in summer'],correct:1,explain:'A one-night count is a snapshot. Over a year, many more people pass through homelessness.'},
  {lvl:'bio',instant:true,q:'Metro Denver’s one-night count went from 10,774 (2025) to 9,950 (2026). What should you check before saying homelessness fell?',choices:['Nothing; it fell','Whether the count method, weather or volunteers changed, and what other data show','Whether the number is even'],correct:1,explain:'One-night counts can move with weather and methods. MDHI notes the count is a snapshot, not the full picture.'},
  {lvl:'bio',kind:'num',q:'Catholic Charities of Denver provided 277,000 nights of shelter on the Front Range in fiscal 2025. About how many people is that on an average night? Round to the nearest whole number.',answer:277000/365,tol:1,unit:'people',d:0,hint:'Nights of shelter ÷ nights in a year.',explain:'277,000 ÷ 365 ≈ 759 people a night, about 1 in 13 of metro Denver’s one-night count (though the shelters also serve Fort Collins and Greeley).'},
  {lvl:'honors',kind:'num',q:'HUD counted 771,480 people in January 2024 and 745,652 in January 2025. What was the percent change? Round to one decimal place (use a negative sign for a drop).',answer:100*(N.tot/N.y24-1),tol:0.1,unit:'%',d:1,hint:'(new − old) ÷ old × 100.',explain:'(745,652 − 771,480) ÷ 771,480 × 100 ≈ −3.3%, the first national drop since 2016.'},
  {lvl:'honors',instant:true,q:'Schools counted about 1.37 million students who experienced homelessness in 2022-23, far more than HUD’s one-night count of children. Why?',choices:['Schools over-count','Schools count a whole year, and their definition includes families doubled up with others','HUD does not count children'],correct:1,explain:'Two differences: a year instead of a night, and a broader definition.'},
  {lvl:'ap',kind:'num',q:'Suppose 10,000 people are homeless on any given night and a typical stay lasts 3 months. About how many different people experience homelessness in a year?',answer:40000,tol:500,unit:'people',d:0,hint:'Each “seat” turns over 12 ÷ 3 = 4 times a year.',explain:'10,000 × (12 ÷ 3) = 40,000. Shorter stays mean a bigger gap between the night count and the year count.'}
 ],
 tour:[
  {title:'One night, the whole country',text:'Every January, communities count everyone experiencing homelessness on a single night. In January 2025, HUD’s count was 745,652 people. Each dot is 1,000 people.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Sheltered and unsheltered',text:'479,332 were in shelters or transitional housing. 266,320 (36%) were unsheltered: on the street, in cars or in encampments. The red dots are unsheltered.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'One night vs. the whole year',text:'Metro Denver counted 10,774 people on one night in January 2025. Its State of Homelessness Report counted 35,601 across the year: 35,601 ÷ 10,774 ≈ 3.3 times as many.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Why the year is bigger',text:'People move in and out of homelessness: a job loss, an eviction, a stay with family that ends. One night catches only the people homeless that night.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'A different definition',text:'Public schools identified 1,374,537 students who experienced homelessness in 2022-23. Schools count families staying with others because they lost housing (“doubled up”); HUD’s count does not.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'A rate and a change',text:'745,652 ÷ 340 million × 10,000 ≈ 22 per 10,000 people. From 771,480 in 2024 to 745,652 in 2025 is a drop of about 3.3%, the first since 2016.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Stock and flow',text:'A one-night count is a stock. The yearly count is a flow: the stock times how often people turn over. If a typical stay lasts about 4 months, a year sees about 3 times the one-night number.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'Who responds',text:'Counts decide how many beds, outreach workers and dollars a community gets. In 1986 Catholic Charities opened Samaritan House in Denver, the first building in the nation designed as a homeless shelter. In fiscal 2025 its shelters gave 277,000 nights of shelter on the Front Range: 277,000 ÷ 365 ≈ 759 people on an average night. Dorothy Day’s Catholic Worker houses took people in without counting them. Discuss: what does a community owe the people its counts miss?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How much does a one-night count miss?</p><ol><li>Lock in your gut, then work out the ratio of the year count to the one-night count.</li><li>Work out the unsheltered share of the national count.</li></ol><p>Write one sentence about who a one-night count is most likely to miss.</p>',
  honors:'<p><b>Question:</b> How do definitions change a count?</p><ol><li>Compare HUD’s one-night count with the schools’ count of students.</li><li>Compute the national rate per 10,000 and the change from 2024 to 2025.</li></ol>',
  ap:'<p><b>Question:</b> How are a one-night count and a yearly count related?</p><ol><li>Use stock × turnover ≈ flow to estimate the yearly count for stays of 2, 4 and 6 months.</li><li>Compare with metro Denver’s 3.3 ratio. What typical stay does it suggest?</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Point-in-time (PIT) count',d:'A count of everyone experiencing homelessness on one night, done each January by local Continuums of Care for HUD.'},
  {t:'Sheltered / unsheltered',d:'In a shelter or transitional housing, or in a place not meant for living, like the street or a car.'},
  {t:'Doubled up',d:'Staying with other people because of losing housing or hardship. Schools count this as homelessness; HUD’s count does not.',lvl:'honors'},
  {t:'Stock vs. flow',d:'A stock is how many at one moment; a flow is how many pass through over a period.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> U.S. Department of Housing and Urban Development, <i>2025 Annual Homelessness Assessment Report to Congress, Part 1</i> (May 29, 2026): 745,652 people on a single night in January 2025, 479,332 sheltered and 266,320 unsheltered, down 25,828 from 2024 and the first decrease since 2016; 230,366 people in families with children. USAFacts: nearly 22 of every 10,000 Americans. Metro Denver Homeless Initiative point-in-time counts: 9,997 (2024), 10,774 (2025) and 9,950 (2026); the MDHI <i>State of Homelessness Report 2025</i> counted 35,601 people in metro Denver (reported by Colorado Politics, May 20, 2026). National Center for Homeless Education: 1,374,537 students identified in school year 2022-23. Catholic Charities of the Archdiocese of Denver, <i>Impact Report 2025</i> (<a href="https://ccdenver.org/wp-content/uploads/2025/12/IMPACT-REPORT-2025-112525.pdf" target="_blank" rel="noopener">PDF</a>): 277,000 nights of shelter and 166,000 people assisted in FY2025; Samaritan House opened in 1986 as the first building in the nation designed to serve people experiencing homelessness. Jesuit Refugee Service, <i>Annual Report 2025</i>: 1,086,269 forcibly displaced people served in 57 countries.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>One-night counts miss people who are hard to find, and they change with weather, volunteers and methods.</li><li>HUD’s count leaves out people in jail or the hospital that night and families staying with others.</li><li>A count is a number of people. It says nothing about each person’s story or what would help.</li></ul>'+
  '<p>The 4-month stay in the stock-and-flow step is an illustration, not a measured average.</p>'
};
BioLab.register(SIM);
})();
