(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Redlined: a loan, a house and 50 years of growth.
   HOLC graded Denver's neighborhoods in 1938: A green "Best", B blue "Still desirable", C yellow "Definitely declining", D red "Hazardous".
   Census of Housing: median home value $7,354 in 1950 and $119,600 in 2000 ($44,600 in 1950 expressed in 2000 dollars).
   Census Housing Vacancy Survey, Q4 2025 homeownership: non-Hispanic White 75.1%, Black 44.2%, Hispanic 48.7%, Asian/NHPI 63.1%.
   Federal Reserve Survey of Consumer Finances 2022 median family net worth: White $285,000, Black $44,900, Hispanic $61,600.
   NCRC (2018), 115 cities: 74% of HOLC "hazardous" areas are low-to-moderate income today and about 64% are majority-minority. */
const V50=7354,V00=119600,V50R=44600,G=V00/V50,RATE=100*(Math.pow(G,1/50)-1),REAL=V00/V50R;
const OWN=[['White (non-Hispanic)',75.1,'#2b5fb3','White'],['Asian or Pacific Islander',63.1,'#2f9e44','Asian/PI'],['Hispanic',48.7,'#e0a10b','Hispanic'],['Black',44.2,'#8a4fbf','Black']];
const NW=[['White',285000,'#2b5fb3'],['Hispanic',61600,'#e0a10b'],['Black',44900,'#8a4fbf']];
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f1=v=>(+v).toFixed(1),$=v=>'$'+Math.round(v).toLocaleString('en-US');
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function house(ctx,x,y,w,col){const h=w*0.8;ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y+h*0.42);ctx.lineTo(x+w/2,y);ctx.lineTo(x+w,y+h*0.42);ctx.closePath();ctx.fill();ctx.fillRect(x+w*0.12,y+h*0.42,w*0.76,h*0.58);
 ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x+w*0.42,y+h*0.66,w*0.16,h*0.34);}
const GR=[['A','Best','#3a9a4a'],['B','Still desirable','#3f6fb0'],['C','Declining','#d7b23a'],['D','Hazardous','#c8102e']];

const SIM={
 id:'redlining',hash:'redlining',apUnit:1,order:4,tab:'Redlined: a loan and 50 years',kind:'Learning tool',prereq:['polygons'],next:['propertytax','measurewealth'],
 skills:{bio:'Growth factor: new ÷ old, and comparing two groups · Algebra 1 (Unit 2), Black History (Unit 1), Sociology (Unit 3: social class)',
  honors:'Growth factors, inflation-adjusted dollars and percentage-point gaps · Algebra 1 (Units 2 and 8), Sociology (Units 3 and 4), AP US Government (Unit 3)',
  ap:'From a growth factor to a yearly rate: r = G^(1/n) − 1 · Algebra 2 (exponents), AP Precalculus (Unit 2), AP Macroeconomics (Unit 4)'},
 card:'Two families, two 1950 houses, and one loan turned down. Guess how much a house grew in value by 2000, work out the growth factor, and follow it to today’s gaps.',
 title:'Redlined: a loan and 50 years',
 lede:{bio:'In 1938 a federal agency graded Denver’s neighborhoods for home loans, and colored the lowest grade red. Follow what a house could be worth 50 years later, for a family that got the loan and a family that did not.',
  honors:'Home equity is how most American families build wealth. Compare a house’s growth with and without inflation, then compare homeownership and wealth today.',
  ap:'Turn a 50-year growth factor into a yearly rate, then ask what compounding does to a head start, or to a missing one.'},
 scale:'United States median home values, 1950 and 2000 (Census). Today: homeownership 2025, family wealth 2022.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: how many times more was the median home worth in 2000 than in 1950?',type:'range',min:1,max:30,step:0.5,def:3,unit:'×',d:1},
  {id:'reveal',label:'Show the values now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'g',label:'Growth factor, 1950 to 2000',unit:'×',d:1,min:0,max:30,get:s=>shown(s)?G:null},
  {id:'real',label:'Growth factor after inflation',unit:'×',d:1,lvl:'honors',min:0,max:30,get:s=>shown(s)?REAL:null},
  {id:'rate',label:'Yearly rate',unit:'%',d:1,lvl:'ap',min:0,max:10,get:s=>shown(s)?RATE:null},
  {id:'gap',label:'Homeownership gap, White − Black (2025)',unit:'points',d:1,min:0,max:50,get:s=>75.1-44.2}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3,inTour=sim.tour&&sim.tour.on;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* left: the four grades as a schematic city */
  txt(ctx,'1938: a federal agency grades Denver for home loans',20,18,{s:14*k,w:700,b:'middle'});
  const gx=20,gy=36,cw=big?40:46;const plan=['AABBC','ABBCC','BBCCD','BCCDD','CCDDD'];
  plan.forEach((row,r)=>row.split('').forEach((g,c)=>{const gi='ABCD'.indexOf(g);ctx.fillStyle=GR[gi][2];ctx.globalAlpha=.85;rr(ctx,gx+c*(cw+3),gy+r*(cw*0.62+3),cw,cw*0.62,4);ctx.fill();ctx.globalAlpha=1;
   txt(ctx,g,gx+c*(cw+3)+cw/2,gy+r*(cw*0.62+3)+cw*0.31,{s:12*k,w:700,a:'center',b:'middle',c:'#fff'});}));
  const mw=5*(cw+3),mh=5*(cw*0.62+3);txt(ctx,'A schematic, not the real map',gx,gy+mh+10*k,{s:11*k,c:PAL['cv-soft'],b:'middle'});
  GR.forEach((g,i)=>txt(ctx,`${g[0]}: “${g[1]}”`,gx+mw+12,gy+12+i*17*k,{s:12*k,w:700,c:g[2],b:'middle'}));
  if(s===1&&inTour)ring(ctx,gx-5,gy-5,mw+150,mh+10);
  /* right: two families */
  const RX=430,RW=W-RX-20;let y=40;
  if(s>=2){txt(ctx,big?'Two families, 1950':'Two families, 1950: the same $7,354 house',RX,y,{s:13*k,w:700,b:'middle'});y+=16*k;
   const hw=big?36:44;house(ctx,RX,y,hw,'#3f6fb0');txt(ctx,big?'Gets the loan (B)':'Gets the loan (area graded B)',RX+hw+10,y+hw*0.4,{s:12*k,w:700,b:'middle'});
   house(ctx,RX,y+hw*0.9+6,hw,PAL['line']);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(RX,y+hw*0.9+6);ctx.lineTo(RX+hw,y+hw*1.7+6);ctx.stroke();
   txt(ctx,big?'Turned down (D): rents':'Turned down (area graded D): rents',RX+hw+10,y+hw*1.3+6,{s:12*k,w:700,b:'middle',c:PAL['s1']});
   if(s===2)ring(ctx,RX-6,y-4,RW+12,hw*1.8+16);y+=hw*1.9+14;}
  if(s>=3||s===99){const S0=sim.gutS,gv=inTour?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
   txt(ctx,'The house, 1950 to 2000',RX,y,{s:13*k,w:700,b:'middle'});y+=14*k;const sc=(RW-110)/V00;
   [['1950',V50,'#3f6fb0'],['2000',V00,'#3f6fb0']].forEach(([l,v,c],i)=>{txt(ctx,l,RX,y+7,{s:12*k,w:700,b:'middle'});const showV=i===0||sh;ctx.fillStyle=showV?c:PAL['cv-bg2'];rr(ctx,RX+52,y,showV?Math.max(3,v*sc):RW-52,14,4);ctx.fill();
    txt(ctx,showV?$(v):'?',showV?RX+56+v*sc:RX+52+(RW-52)/2,y+7,{s:12*k,w:700,b:'middle',a:showV?'left':'center'});y+=22*k;});
   if(gv!=null&&!sh){txt(ctx,`Your gut: ${f1(gv)} × $7,354 = ${$(gv*V50)}`,RX,y+4,{s:12*k,w:700,c:PAL['s4'],b:'middle'});y+=18*k;}
   if(sh){txt(ctx,`$119,600 ÷ $7,354 = ${f1(G)}×`,RX,y+4,{s:13*k,w:700,c:PAL['s1'],b:'middle'});if(s===3)ring(ctx,RX-6,y-72*k,RW+12,84*k);y+=20*k;}}
  /* lower band across the bottom: today */
  const by=Math.max(gy+mh+30*k,220),bh=H-by-12,BX=20,BW=RX-40;
  if(s===4||(s===99&&sh)){txt(ctx,'Homeownership, end of 2025',BX,by+10,{s:13*k,w:700,b:'middle'});OWN.forEach((o,i)=>{const yy=by+28*k+i*24*k;txt(ctx,big?o[3]:o[0],BX,yy,{s:11.5*k,w:700,b:'middle'});const bx=BX+(big?80:150),bw=BW-(big?130:200);
   ctx.fillStyle=PAL['cv-bg2'];rr(ctx,bx,yy-6,bw,12,4);ctx.fill();ctx.fillStyle=o[2];rr(ctx,bx,yy-6,bw*o[1]/100,12,4);ctx.fill();txt(ctx,f1(o[1])+'%',bx+bw*o[1]/100+5,yy,{s:12*k,w:700,b:'middle'});});
   if(s===4)ring(ctx,BX-6,by-4,BW+12,4*24*k+34*k);}
  if(s===5){txt(ctx,'Median family wealth, 2022',BX,by+10,{s:13*k,w:700,b:'middle'});NW.forEach((o,i)=>{const yy=by+28*k+i*26*k;txt(ctx,o[0],BX,yy,{s:12*k,w:700,b:'middle'});const bx=BX+80,bw=BW-150;
   ctx.fillStyle=o[2];rr(ctx,bx,yy-6,bw*o[1]/285000,12,4);ctx.fill();txt(ctx,$(o[1]),bx+bw*o[1]/285000+5,yy,{s:12*k,w:700,b:'middle'});});
   txt(ctx,'285,000 ÷ 44,900 ≈ 6.3 times',BX,by+28*k+3*26*k,{s:12*k,w:700,c:PAL['s1'],b:'middle'});ring(ctx,BX-6,by-4,BW+12,4*26*k+30*k);}
  const card=(t,ls)=>{const cy=Math.max(by,y+8),ch=H-cy-12;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,cy,RW,ch,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,RX,cy,RW,ch,10);ctx.stroke();}let yy=cy+18*k;txt(ctx,t,RX+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;ls.forEach(l=>{yy+=wrap(ctx,l,RX+12,yy,RW-24,{s:(big?11:12.5)*k,b:'middle'})+4;});};
  if(s===6&&atLeast('honors'))card('After inflation, and 80 years later',[`In 2000 dollars, 1950’s $7,354 is $44,600: ${f1(REAL)}× real growth.`,'NCRC (2018): 74% of “hazardous” areas are low-to-moderate income today; about 64% are majority-minority.']);
  else if(s===7&&atLeast('ap'))card('From growth factor to yearly rate',[`r = G^(1/n) − 1 = ${f1(G)}^(1/50) − 1 ≈ ${f1(RATE)}% a year.`,'A family that starts 20 years later, at the same rate, ends with about a third as much.']);
  else if(s===8)card('The law changed in 1968',['The Fair Housing Act outlawed racial discrimination in home sales, rentals and lending.','The U.S. bishops (2018): racism is a sin. How to repair gaps that began before 1968 is a prudential question. Discuss: which remedy, and why?']);
 },
 narrate(sim){if(!shown(sim))return `In 1950 the median U.S. home was worth <b>$7,354</b>. How many times more was it worth in 2000? Your gut right now: ${f1(sim.p.guess)}×.`;
  return `$119,600 ÷ $7,354 ≈ <b>${f1(G)}×</b> in 50 years (${f1(REAL)}× after inflation). A family turned away from a loan in 1950 missed that growth. Today the White–Black homeownership gap is <b>${f1(75.1-44.2)} points</b>.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In 1950 the median U.S. home was worth $7,354. By 2000, how many times more do you think the median home was worth? Drag to your gut guess, then lock it in.',honors:'Median home value: $7,354 in 1950. Drag to your gut guess of the growth factor to 2000, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the growth factor yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-G),guess:sim.p.guess,label:`${f1(sim.p.guess)} times`};},
  solve(sim){sim.p.guess=+G.toFixed(1);return {v:0,guess:G,label:`${f1(G)} times ($7,354 → $119,600)`};},
  calc:{unit:'×',d:1,tol:0.1,
   prompt:{bio:'The Census Bureau found the median home value was <b>$7,354</b> in 1950 and <b>$119,600</b> in 2000. How many times bigger is the 2000 value? Round to one decimal place.',ap:'Median home value: $7,354 (1950), $119,600 (2000). Find the growth factor G, to one decimal place.'},
   answer:()=>+G.toFixed(1),hint:'Growth factor = new ÷ old = 119,600 ÷ 7,354.',
   steps:()=>['Growth factor = new ÷ old.',`119,600 ÷ 7,354 = <b>${f1(G)}</b>.`,`So the house was worth about ${Math.round(G)} times as much 50 years later. After inflation, ${f1(REAL)} times.`]},
  formula:()=>`G = $119,600 ÷ $7,354 = ${f1(G)}`+(atLeast('honors')?`<br>After inflation: $119,600 ÷ $44,600 = ${f1(REAL)}`:'')+(atLeast('ap')?`<br>Yearly rate: ${f1(G)}^(1/50) − 1 = ${f1(RATE)}%`:''),
  how:{bio:'Growth factor = new value ÷ old value.',honors:'Compare in the same year’s dollars before you call growth “real.”',ap:'A 50-year factor G means (1 + r)^50 = G, so r = G^(1/50) − 1.'},
  compare(sim,g){const off=Math.abs(g.guess-G);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the growth factor yourself.':'';
   return (off<=1.5?`Close: within ${f1(off)}.`:`You guessed ${f1(g.guess)}×. The median home grew <b>${f1(G)}×</b>, so you were off by ${f1(off)}.`)+` A family that could not get a loan in a red-graded area missed that growth, and the wealth it would pass on.`+self;},
  again(sim){sim.p.guess=3;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Homeownership at the end of 2025: 75.1% of White households and 44.2% of Black households. What is the gap in percentage points?',answer:30.9,tol:0.05,unit:'points',d:1,hint:'75.1 − 44.2.',explain:'75.1 − 44.2 = 30.9 percentage points.'},
  {lvl:'bio',instant:true,q:'Why does a gap in homeownership become a gap in wealth?',choices:['Renters pay no rent','Homeowners build equity as they pay down the loan and the home’s value grows; renters’ payments build no ownership','Houses never change in value'],correct:1,explain:'Home equity is the largest asset for most American families (Federal Reserve SCF).'},
  {lvl:'honors',kind:'num',q:'Median family wealth in 2022: White $285,000, Black $44,900. How many times larger is the first? Round to one decimal place.',answer:+(285000/44900).toFixed(1),tol:0.1,unit:'times',d:1,hint:'285,000 ÷ 44,900.',explain:'285,000 ÷ 44,900 ≈ 6.3. A ratio of medians compares typical families.'},
  {lvl:'honors',instant:true,q:'In 2000 dollars, 1950’s median home was $44,600. What was the growth from 1950 to 2000 after inflation?',choices:['16.3 times','About 2.7 times','No growth'],correct:1,explain:'119,600 ÷ 44,600 ≈ 2.7. Most of the 16.3× was inflation, but 2.7× real growth is still large.'},
  {lvl:'ap',kind:'num',q:'A growth factor of 16.3 over 50 years. What yearly growth rate, in percent, gives that? Round to one decimal place.',answer:+RATE.toFixed(1),tol:0.1,unit:'%',d:1,hint:'r = 16.3^(1/50) − 1.',explain:`16.3^(1/50) ≈ 1.057, so about ${f1(RATE)}% a year.`},
  {lvl:'ap',instant:true,q:'Two families buy the same kind of house; one in 1950 and one in 1970. Both grow at 5.7% a year until 2000. About how many times more does the first family’s house grow?',choices:['About the same','About 1.057^20 ≈ 3 times more','Twice as much'],correct:1,explain:'The 20-year head start compounds: 1.057^20 ≈ 3.0.'}
 ],
 tour:[
  {title:'1938: four grades',text:'The federal Home Owners’ Loan Corporation graded Denver’s neighborhoods for mortgage lending: A green “Best” to D red “Hazardous.” Areas with Black, Latino and immigrant families were often graded D. Lenders followed the grades.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Two families, 1950',text:'Picture two families buying the same $7,354 house, the median value in 1950. One gets a loan. The other is turned down because the neighborhood was graded D, and rents.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'50 years later',text:'By 2000 the median home was worth $119,600. $119,600 ÷ $7,354 ≈ 16.3: the owning family’s house grew about 16 times. The renting family’s rent built no ownership.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Homeownership today',text:'At the end of 2025, 75.1% of White households owned their homes, and 44.2% of Black households: a gap of 30.9 percentage points.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Wealth today',text:'In 2022 the median White family had $285,000 in wealth and the median Black family $44,900: about 6.3 times as much. For most families, a home is the biggest part of wealth.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'After inflation, and 80 years later',text:'In 2000 dollars, 1950’s $7,354 is $44,600, so real growth was 2.7×. A 2018 study of 115 cities found 74% of areas graded “hazardous” are low-to-moderate income today, and about 64% are majority-minority.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'A yearly rate',text:'A growth factor of 16.3 over 50 years is 16.3^(1/50) − 1 ≈ 5.7% a year. A family that starts 20 years later at the same rate ends with about a third as much: a head start compounds.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'The law changed',text:'The Fair Housing Act of 1968 outlawed racial discrimination in housing and lending. The U.S. Catholic bishops teach that racism is a sin that denies the equal dignity of every person (<i>Open Wide Our Hearts</i>, 2018). How best to repair gaps that began before 1968 is a prudential question, and Catholics of good will propose different remedies. Discuss: which would you propose, and what numbers would you want first?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What did a loan in 1950 mean 50 years later?</p><ol><li>Lock in your gut, then work out the growth factor from 1950 to 2000.</li><li>Find your neighborhood on the 1938 Denver map at Mapping Inequality. What grade did it get?</li></ol><p>Write one sentence connecting a 1950 loan to a family’s wealth today.</p>',
  honors:'<p><b>Question:</b> How much of the growth was real?</p><ol><li>Compute the growth factor in plain dollars and in 2000 dollars.</li><li>Compute the homeownership gap and the wealth ratio today.</li></ol>',
  ap:'<p><b>Question:</b> How does a head start compound?</p><ol><li>Compute the yearly rate from the 50-year growth factor.</li><li>Compare a 1950 start with a 1970 start at the same rate.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Redlining',d:'Refusing loans, or charging more, because of where a home is, often based on who lives there. HOLC maps colored the lowest grade red.'},
  {t:'Home equity',d:'A home’s value minus what is still owed on it.'},
  {t:'Growth factor',d:'New value ÷ old value.'},
  {t:'Real (inflation-adjusted) value',d:'A past amount converted to another year’s dollars so prices are comparable.',lvl:'honors'},
  {t:'Yearly growth rate',d:'r = G^(1/n) − 1 for a growth factor G over n years.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Home Owners’ Loan Corporation, Denver residential security map (1938), digitized by Mapping Inequality (University of Richmond; <a href="https://dsl.richmond.edu/panorama/redlining/#loc=12/39.71/-105.084&city=denver-co" target="_blank" rel="noopener">Denver</a>); the Denver Public Library holds a copy. The grid here is a schematic, not the real map. U.S. Census Bureau, Historical Census of Housing Tables: median home value $7,354 in 1950 and $119,600 in 2000; $44,600 for 1950 in 2000 dollars (<a href="https://www.census.gov/data/tables/time-series/dec/coh-values.html" target="_blank" rel="noopener">link</a>). Census Housing Vacancies and Homeownership, Q4 2025: 75.1% (non-Hispanic White), 63.1% (Asian, Native Hawaiian and Pacific Islander), 48.7% (Hispanic), 44.2% (Black). Federal Reserve, Survey of Consumer Finances 2022: median net worth $285,000 (White), $61,600 (Hispanic), $44,900 (Black). National Community Reinvestment Coalition (2018), 115 cities: 74% of HOLC “hazardous” areas are low-to-moderate income today and about 64% majority-minority.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>The two families are an illustration built on national medians. Real home values varied by city and neighborhood, and some redlined areas later gained value through gentrification.</li><li>Gaps today have many causes; this tool shows one channel (home equity), not all of them.</li><li>Medians describe typical families, not every family.</li></ul>'+
  '<p><b>What the Church teaches, and where Catholics differ.</b> The U.S. Catholic bishops’ pastoral letter against racism, <i>Open Wide Our Hearts</i> (USCCB, 2018), teaches that racism is a sin. Remedies are a prudential question, and people of good will disagree: some favor targeted programs such as down-payment help for affected neighborhoods, others favor broad policies open to everyone, and some argue enforcement of the 1968 law is enough. The math shows the size of the gap; it does not choose the remedy.</p>'
};
BioLab.register(SIM);
})();
