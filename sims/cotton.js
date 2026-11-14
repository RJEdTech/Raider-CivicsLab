(function(){
'use strict';
const {txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function panel(ctx,k,x,y,w,h,title,tag,tagc){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});
 if(tag){ctx.font='700 '+(11*k)+'px '+FONT;const tw=ctx.measureText(tag).width+11*k*1.1;pill(ctx,tag,x+w-10-tw/2,y+18*k,tagc,'#fff',11*k);}
 return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
/* 100 squares: n filled */
function grid(ctx,x,y,w,n,col,lab,k){const c=Math.min(14,(w-9*3)/10),g=3;for(let i=0;i<100;i++){const r=Math.floor(i/10),q=i%10;
  ctx.fillStyle=i<Math.floor(n)?col:(i<n?col+'88':PAL['g-grid']);rr(ctx,x+q*(c+g),y+r*(c+g),c,c,2);ctx.fill();}
 if(lab)txt(ctx,lab,x,y+10*(c+g)+10*k,{s:12*k,w:700,b:'middle'});return y+10*(c+g)+22*k;}
/* Cotton: how big was it? (Jason, Nov 14: the 1619 podcast on cotton buoying the economy; show it visually with the numbers.)
   Bales, 1790–1860: EH.net Encyclopedia (William H. Phillips, "Cotton Gin"), from Gray / USDA Atlas: 3,135 (1790) ... 3,837,402 (1860).
   Enslaved people: U.S. census (as in slaveryfounding). Cotton share of U.S. exports: 32.0% (1820), 51.6% (1840), 57.5% (1860), Treasury
   export records as charted in standard U.S. history texts; the American Yawp puts 1860 above 60% counting differently.
   Share of the economy: the cotton crop was about 5% of GDP (Baptist's own figure for 1836, $77 million; Hansen; Olmstead and Rhode;
   Magness, AIER, 5–6%). Baptist summed inputs on top to reach "almost half"; economic historians call that double counting.
   Picking: Olmstead and Rhode (JEH 2008; NBER w16494): daily picking per enslaved worker about quadrupled 1801–1862, 2.3% a year;
   1811 ~39–42 lb/day; 1861 126 lb (New South), 83 lb (Old South). They credit new cotton varieties; Baptist credits a violent
   "pushing system." Gavin Wright (2020): slavery slowed growth. Gregory XVI, In supremo apostolatus (1839); Catechism 2414. */
const BALES=[[1790,3135],[1800,73145],[1810,177638],[1820,334378],[1830,731452],[1840,1346232],[1850,2133851],[1860,3837402]];
const ENSL=[697681,893602,1191362,1538022,2009043,2487355,3204313,3953760];
const EXP=[[1820,32.0],[1840,51.6],[1860,57.5]];
const X60=3837402/3135;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1),fm=v=>(v/1e6).toFixed(2)+'M';
const SIM={
 id:'cotton',hash:'cotton',apUnit:7,order:6,tab:'Cotton',kind:'Learning tool',prereq:['slaveryfounding'],next:['mutuality'],
 skills:{bio:'Growth factors and reading two series on one chart · Algebra 1 (Unit 2), US Government (Unit 1), Black History (background before 1865)',
  honors:'Share of a part vs. share of a whole; checking a claim against its own numbers · Statistics (Chapter 4), AP US Government (Unit 1)',
  ap:'GDP vs. gross sales: why you can’t add the inputs to the output · AP Macroeconomics (Unit 2)'},
 card:'Guess how much the cotton crop grew from 1790 to 1860, then see it beside the number of enslaved people, its share of exports and its share of the whole economy.',
 title:'Cotton: how big was it?',
 lede:{bio:'Cotton grown by enslaved people became the country’s biggest export. See how fast it grew, and who was forced to grow it.',
  honors:'The 1619 Project’s podcast argued cotton powered the American economy. Two numbers are both true: most of the exports, a small slice of the whole economy. See both.',
  ap:'Cotton was 57% of exports and about 5% of GDP. Why do serious writers get “almost half,” and what does the difference teach about measuring an economy?'},
 scale:'United States, 1790 to 1860. EH.net, the U.S. census and economic historians; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: how many times more cotton in 1860 than 1790?',type:'range',min:1,max:2000,step:1,def:10,unit:'×'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){return {};},step(){},
 metrics:[
  {id:'b60',label:'Bales of cotton, 1860',unit:'',d:0,min:0,max:5e6,get:s=>shown(s)?3837402:null},
  {id:'x',label:'Times as much as 1790',unit:'×',d:0,min:0,max:2000,get:s=>shown(s)?X60:null},
  {id:'b90',label:'Bales of cotton, 1790',unit:'',d:0,min:0,max:5e6,get:s=>3135}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  /* left chart: bales (bars) and enslaved people (red line), same scale in millions */
  txt(ctx,big?'Cotton and slavery':'Cotton bales and enslaved people',20,18,{s:14*k,w:700,b:'middle'});
  const L=34,B=300,T=50,Wb=250,bw=Wb/8-8,Y=v=>B-(B-T)*v/4.4e6,XC=i=>L+i*(Wb/8)+bw/2;
  [0,1,2,3,4].forEach(m=>{const y=Y(m*1e6);ctx.strokeStyle=PAL['g-grid'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L-4,y);ctx.lineTo(L+Wb,y);ctx.stroke();txt(ctx,m+'M',L-8,y,{s:10*k,a:'right',b:'middle',c:PAL['cv-soft']});});
  const showB=sh||s===1;
  BALES.forEach((b,i)=>{const x=L+i*(Wb/8),last=i===7;
   if(showB&&(last?sh:true)){ctx.fillStyle=last?'#6b4f2a':'#a8916b';rr(ctx,x,Y(b[1]),bw,B-Y(b[1]),3);ctx.fill();}
   else if(last){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,T,bw,B-T,3);ctx.fill();txt(ctx,'?',x+bw/2,(T+B)/2,{s:13*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});}
   txt(ctx,"'"+String(b[0]).slice(2),x+bw/2,B+12*k,{s:10.5*k,a:'center',b:'middle',c:PAL['cv-soft']});});
  if(sh&&(s>=2)){ctx.strokeStyle='#c8102e';ctx.lineWidth=3;ctx.beginPath();ENSL.forEach((v,i)=>{const x=XC(i),y=Y(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
   ENSL.forEach((v,i)=>{ctx.fillStyle='#c8102e';ctx.beginPath();ctx.arc(XC(i),Y(v),4,0,7);ctx.fill();});}
  if(gv!=null&&!sh){const v=3135*gv,y=Y(Math.min(v,4.4e6));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(L-4,y);ctx.lineTo(L+Wb,y);ctx.stroke();
   txt(ctx,'your gut: '+f0(gv)+'× = '+f0(v)+' bales',L,y-9,{s:11.5*k,w:700,c:PAL['s4'],b:'middle'});}
  let ly=B+32*k;
  if(sh){ctx.fillStyle='#6b4f2a';ctx.fillRect(L,ly-5,12,10);txt(ctx,big?'Bales: 3.84M (1860)':'Bales of cotton: 3,837,402 in 1860',L+18,ly,{s:12*k,w:700,b:'middle'});ly+=20*k;
   if(s>=2){ctx.fillStyle='#c8102e';ctx.fillRect(L,ly-5,12,10);txt(ctx,big?'Enslaved: 3.95M (1860)':'Enslaved people: 3,953,760 in 1860',L+18,ly,{s:12*k,w:700,b:'middle',c:'#c8102e'});}}
  else txt(ctx,big?'1790: 3,135 bales':'1790: 3,135 bales of cotton',L,ly,{s:12.5*k,w:700,b:'middle'});
  if(s===1&&ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,L-30,T-8,Wb+36,B-T+30,7);ctx.stroke();}
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'From 3,135 bales');y=lines(ctx,k,RX+12,y,RW-24,big?['1790: 3,135 bales.','1860: 3,837,402 bales.','About 1,224 times as much.']:['In 1790, before the cotton gin spread, the U.S. grew 3,135 bales of cotton.','By 1860 it grew 3,837,402 bales: about 1,224 times as much. Most was short-staple cotton grown on new land in Alabama, Mississippi, Louisiana and Texas.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Who grew it');y=lines(ctx,k,RX+12,y,RW-24,big?['Red line: enslaved people.','697,681 → 3,953,760.','Both rose together.']:['The red line is the number of enslaved people: 697,681 in 1790, 3,953,760 in 1860.','As cotton spread west, about a million people were forcibly moved from the Upper South to the cotton states. The two lines rose together.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Most of the exports');
   EXP.forEach((e,i)=>{txt(ctx,String(e[0]),RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?70:60),w=(RW-(big?140:120))*e[1]/100;ctx.fillStyle=i===2?'#6b4f2a':'#a8916b';rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,f1(e[1])+'%',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=24*k;});
   lines(ctx,k,RX+12,y+6,RW-24,big?['1860: 57.5 of every $100 exported.','Most went to British mills.']:['By 1860, cotton was 57.5 of every $100 the U.S. sold abroad: more than everything else combined.','Most went to textile mills in Britain; the rest to mills in New England.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'A small slice of everything');const gw=big?(RW-36)/2:(RW-40)/2;
   const y1=grid(ctx,RX+12,y,gw,57.5,'#6b4f2a',big?'Exports: 57.5':'Of exports: 57.5 in 100',k);grid(ctx,RX+24+gw,y,gw,5,'#a8916b',big?'Economy: ~5':'Of the economy: about 5 in 100',k);
   lines(ctx,k,RX+12,y1+4,RW-24,big?['Both are true.']:['Both are true. Most Americans farmed food, built, made and traded things that never left the country.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Checking “almost half”');y=lines(ctx,k,RX+12,y,RW-24,big?['Crop in 1836: $77M ≈ 5% of GDP.','Adding inputs on top → “almost half.”','That counts dollars twice.']:['Historian Edward Baptist, whose work the 1619 Project used, found the 1836 crop was worth $77 million: about 5% of the economy.','He then added the cost of land, loans, food and tools on top to reach “almost half.” Economists call that double counting: those costs are already inside other parts of GDP.']);}
  else if(s===6&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Four times as much a day');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?90:140),w=(RW-(big?150:200))*v/130;ctx.fillStyle=c;rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,v+' lb',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=24*k;};
   bar('1811',40,'#a8916b');bar(big?'1861':'1861, Deep South',126,'#6b4f2a');
   lines(ctx,k,RX+12,y+6,RW-24,big?['Why? Two answers:','Better seed (Olmstead and Rhode).','More violence (Baptist).']:['Pounds picked per person per day roughly quadrupled. Why? Olmstead and Rhode, using 142 plantations’ records, credit new cotton varieties that were easier to pick.','Baptist credits a “pushing system” of quotas and whipping. Both agree the work was forced. Students: which evidence would settle it?']);}
  else if(s===7&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'Did slavery build the economy?');y=lines(ctx,k,RX+12,y,RW-24,big?['Cotton: big export, ~5% of GDP.','Wright: slavery slowed growth.','Enslavers, banks, shippers profited.']:['Enslavers, and the banks, insurers and shippers in the North and in Britain who financed and carried the crop, profited enormously.','Economist Gavin Wright argues slavery still slowed the country’s growth: the South built fewer towns, schools and factories. Profit for some is not growth for all.']);}
  else if(s===8){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church said');y=lines(ctx,k,RX+12,y,RW-24,big?['1839: Pope Gregory XVI condemned the slave trade.','CCC 2414: no one may be bought or sold.']:['In 1839, Pope Gregory XVI condemned the slave trade in In supremo apostolatus. Many American Catholics, including Jesuits, still held people in slavery.','The Catechism (2414) teaches that enslaving people or buying and selling them is a sin against their dignity. Every bale had names behind it.']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,200,'1790 → 1860');lines(ctx,k,RX+12,y,RW-24,['Cotton: 3,135 → 3,837,402 bales (about 1,224×).','Enslaved people: 697,681 → 3,953,760.','Cotton was 57.5% of 1860 exports, and about 5% of the whole economy.']);}
 },
 narrate(sim){if(!shown(sim))return `In 1790 the U.S. grew 3,135 bales of cotton. Your gut: ${f0(sim.p.guess)} times as much by 1860.`;
  return `The 1860 crop was <b>3,837,402</b> bales, about <b>${f0(X60)}</b> times the 1790 crop, grown mostly by the <b>3,953,760</b> people enslaved that year. Cotton was 57.5% of exports and about 5% of the whole economy.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In 1790 the U.S. grew 3,135 bales of cotton. How many times as much do you think it grew in 1860? Drag to your gut, then lock it in.',honors:'1790: 3,135 bales. Drag to your gut for how many times as much in 1860, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the real factor.'},
  lock(sim){return {v:Math.abs(Math.log(sim.p.guess/X60)),guess:sim.p.guess,label:`${f0(sim.p.guess)}×`};},
  solve(sim){sim.p.guess=Math.round(X60);return {v:0,guess:X60,label:'about 1,224×'};},
  calc:{unit:'×',d:0,tol:1,
   prompt:{bio:'The U.S. grew <b>3,135</b> bales in 1790 and <b>3,837,402</b> in 1860. How many times as much is that? Round to the nearest whole number.',ap:'3,837,402 ÷ 3,135, to the nearest whole number.'},
   answer:()=>Math.round(X60),hint:'New ÷ old.',
   steps:()=>['3,837,402 ÷ 3,135 = 1,224.1.','About <b>1,224 times</b> as much cotton.']},
  formula:()=>`3,837,402 ÷ 3,135 ≈ ${f0(X60)}×`+(atLeast('honors')?'<br>Exports: 57.5 of every $100 (1860) · Economy: about 5 of every $100':''),
  how:{bio:'Growth factor = new ÷ old.',honors:'A share of exports and a share of the whole economy answer different questions.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the factor yourself.':'';
   return (g.guess>=800&&g.guess<=1700?'Close.':`You guessed ${f0(g.guess)}×. The real factor was about <b>1,224×</b>.`)+' Almost all of it was grown by enslaved people, whose number rose more than five times.'+self;},
  again(sim){sim.p.guess=10;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In 1860 cotton was 57.5% of U.S. exports. Out of $100 of exports, how many dollars were not cotton?',answer:42.5,tol:0.05,unit:'$',d:1,hint:'100 − 57.5.',explain:'$42.50: everything else the country sold abroad, combined, was less than cotton.'},
  {lvl:'bio',kind:'num',q:'Bales grew from 1,346,232 (1840) to 3,837,402 (1860). How many times as much, to one decimal place?',answer:3837402/1346232,tol:0.05,unit:'×',d:1,hint:'New ÷ old.',explain:'About 2.9 times in just 20 years.'},
  {lvl:'bio',instant:true,q:'Cotton was 57.5% of exports but about 5% of the whole economy. Which is true?',choices:['Only the 57.5%','Only the 5%','Both: they measure different wholes'],correct:2,explain:'Exports were a small part of the whole economy. Always ask: percent of what?'},
  {lvl:'honors',instant:true,q:'A writer adds the cotton crop ($77M), plus the land, loans and food used to grow it, and calls the total cotton’s share of GDP. What’s wrong?',choices:['Nothing','Those inputs are already counted elsewhere in GDP: it double counts','GDP doesn’t include crops'],correct:1,explain:'GDP counts final output once. Adding the inputs again inflates the share.'},
  {lvl:'honors',kind:'num',q:'Picking rose from about 40 lb a day (1811) to 126 lb (1861). How many times as much, to one decimal place?',answer:126/40,tol:0.05,unit:'×',d:1,hint:'126 ÷ 40.',explain:'About 3.2 times; across all regions Olmstead and Rhode find about four times.'},
  {lvl:'ap',instant:true,q:'Gavin Wright argues slavery slowed U.S. growth even though enslavers profited. Which fits his argument?',choices:['The South built fewer towns, schools and factories','Cotton prices fell to zero','Enslaved people were paid wages'],correct:0,explain:'Profit for a few owners is not the same as growth for the whole economy.'}
 ],
 tour:[
  {title:'From 3,135 bales',text:'In 1790 the U.S. grew 3,135 bales of cotton. By 1860 it grew 3,837,402: about 1,224 times as much, mostly on new land in the Deep South.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Who grew it',text:'The red line is the number of enslaved people: 697,681 in 1790, 3,953,760 in 1860. As cotton moved west, about a million people were forcibly moved to the cotton states. The two lines rose together.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Most of the exports',text:'Cotton went from 32% of U.S. exports in 1820 to 57.5% in 1860: more than everything else the country sold abroad, combined. Most of it fed British textile mills.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'A small slice of everything',text:'Cotton was 57.5 of every 100 export dollars but about 5 of every 100 dollars of everything the country produced. Both numbers are true; they measure different wholes.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Checking “almost half”',text:'The 1619 Project drew on historian Edward Baptist, who found the 1836 crop worth $77 million, about 5% of the economy, then added the cost of land, loans and supplies to reach “almost half.” Economic historians call that double counting.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'Four times as much a day',text:'Each enslaved picker harvested about four times as much a day in 1862 as in 1801. Olmstead and Rhode credit new cotton varieties; Baptist credits a violent quota system. Both agree the labor was forced. What evidence would settle why?',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Did slavery build the economy?',text:'Enslavers, and the banks, insurers and shippers who financed and carried the crop, profited. Economist Gavin Wright argues slavery still slowed overall growth: the South built fewer towns, schools and factories.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'What the Church said',text:'In 1839 Pope Gregory XVI condemned the slave trade. Many American Catholics, Jesuits included, still held people in slavery. The Catechism (2414) teaches that enslaving or selling human beings is a sin against their dignity.',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How fast did cotton grow, and who grew it?</p><ol><li>Lock in your gut, then work out the growth factor.</li><li>Compare the bales line with the enslaved-people line.</li></ol><p>Write one sentence that uses both numbers.</p>',
  honors:'<p><b>Question:</b> Did cotton “power” the economy?</p><ol><li>Give the export number and the economy number.</li><li>Explain why “almost half” double counts.</li></ol>',
  ap:'<p><b>Question:</b> Was slavery an engine of growth?</p><ol><li>Make the case from exports and profits.</li><li>Make Wright’s case that it slowed growth.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Bale',d:'A pressed bundle of cotton, about 400–500 pounds by 1860.'},
  {t:'Export share',d:'Part of everything a country sells abroad.'},
  {t:'GDP',d:'The value of all final goods and services produced in a year, each counted once.',lvl:'honors'},
  {t:'Double counting',d:'Adding the cost of inputs on top of the final product they went into.',lvl:'honors'}
 ],
 about:'<p><b>Sources.</b> Cotton bales, 1790–1860: William H. Phillips, “Cotton Gin,” EH.net Encyclopedia (from L. C. Gray and the USDA Atlas of American Agriculture). Enslaved people: U.S. census. Cotton’s share of exports (32.0%, 51.6%, 57.5%): Treasury export records as charted in standard U.S. history texts; some counts put 1860 above 60%. The 1619 Project (<i>New York Times</i>, 2019) and Matthew Desmond’s essay and podcast episode on the economy slavery built; Edward Baptist, <i>The Half Has Never Been Told</i> (2014). On the 5% figure and double counting: Bradley Hansen (2014); Olmstead and Rhode, “Cotton, Slavery, and the New History of Capitalism” (2018); Phillip Magness (AIER). Picking rates: Olmstead and Rhode, <i>Journal of Economic History</i> (2008) and NBER Working Paper 16494. Gavin Wright, “Slavery and Anglo-American Capitalism Revisited,” <i>Economic History Review</i> (2020). Gregory XVI, <i>In supremo apostolatus</i> (1839). <i>Catechism of the Catholic Church</i>, 2414.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>A bale was counted; the person who picked it usually was not, by name.</li><li>Picking rates come from enslavers’ own record books.</li><li>“About 5% of GDP” measures the crop, not the suffering or the wealth that passed to enslavers’ heirs.</li></ul>'
};
BioLab.register(SIM);
})();
