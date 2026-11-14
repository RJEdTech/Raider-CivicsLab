(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Debt and the Jubilee: why the popes asked rich nations to forgive poor countries' debts.
   Pope Francis, Spes non confundit (bull for the Jubilee Year 2025), 16: wealthier nations should "forgive the debts of countries that will never
   be able to repay them," calling it more a matter of justice than generosity, and naming an "ecological debt" between North and South.
   Pope Leo XIV repeated the appeal (2025). UNCTAD, A World of Debt 2025: developing countries' public debt $31 trillion (2024); net interest
   $921 billion (2024, up 10%); a record 61 developing countries spent 10% or more of government revenue on interest; 3.4 billion people live in
   countries that spend more on interest than on health or education; since 2020 developing regions have borrowed at rates 2 to 4 times
   those of the United States; developing countries paid $25 billion more to external creditors than they received in new loans.
   Jubilee Report (Jubilee Commission led by Joseph Stiglitz and Martin Guzman, June 2025): 3.3 billion live where interest exceeds health spending.
   World Bank (via Devex): HIPC and MDRI relieved 37 countries of about $100 billion. East Asia Forum (2024): 13 of the 37 are now at high risk of
   debt distress and 5 are in distress. Critics (IMF, 1998; William Easterly): moral hazard, higher borrowing costs, relief without conditions
   can be wasted. World population about 8.2 billion (2025). */
const PEOPLE=3.4,WORLD=8.2,SHARE=100*PEOPLE/WORLD;
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
function person(ctx,x,y,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-6,4.5,0,7);ctx.fill();rr(ctx,x-5.5,y-0.5,11,10,4);ctx.fill();}

const SIM={
 id:'jubileedebt',hash:'jubileedebt',apUnit:5,order:6,tab:'Debt and the Jubilee',kind:'Learning tool',prereq:['northsouth'],next:['remittances'],
 skills:{bio:'Percent of a whole, and interest as rate × amount · Algebra 1 (Unit 2), Social Justice (Poverty), Junior Theology (Unit 3: Ought)',
  honors:'Interest as a share of revenue: how the rate changes the burden · Algebra 1 (Unit 4: linear functions), AP Macroeconomics (Unit 6: open economy)',
  ap:'Weighing a policy by its track record: what happened after the last debt relief · AP Macroeconomics (Unit 6), AP Comparative Government (Unit 1)'},
 card:'Guess how many people live in countries that spend more on interest than on health or education, then see why Pope Francis and Pope Leo XIV asked for debt relief in the Jubilee Year.',
 title:'Debt and the Jubilee',
 lede:{bio:'For the Jubilee Year 2025, Pope Francis asked rich nations to forgive the debts of poor countries that can never repay them. See how big those debts are and what paying them crowds out.',
  honors:'A country’s interest bill is its debt times its interest rate. Many poorer countries borrow at rates two to four times the U.S. rate; see what that does to their budgets.',
  ap:'Debt relief has been tried before. Weigh what it achieved and what critics warn about, alongside the Church’s call.'},
 scale:'Developing countries, 2024 and 2025. UNCTAD A World of Debt 2025, the Jubilee Report and the World Bank; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: billions of people in countries that spend more on interest than on health or education',type:'range',min:0,max:8,step:0.1,def:1,unit:'B'},
  {id:'reveal',label:'Show the numbers now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'ppl',label:'People in countries where interest > health or education',unit:'billion',d:1,min:0,max:8.2,get:s=>shown(s)?PEOPLE:null},
  {id:'share',label:'Share of the world',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?SHARE:null},
  {id:'int',label:'Developing countries’ interest, 2024',unit:'$B',d:0,min:0,max:2000,get:s=>shown(s)?921:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  txt(ctx,'The world as 100 people',20,18,{s:14*k,w:700,b:'middle'});
  const n=Math.round(SHARE),gn=gv!=null?Math.round(100*gv/WORLD):null,cx=22,c=24,gy=44;
  for(let i=0;i<100;i++){const x=cx+(i%10)*c+10,y=gy+Math.floor(i/10)*c+12;let col=PAL['cv-bg2'];
   if(sh&&s!==1&&i<n)col='#c8102e';else if(!sh&&gn!=null&&i<gn)col=PAL['s4'];person(ctx,x,y,col);}
  let ly=gy+10*c+16*k;
  if(sh&&s!==1){txt(ctx,big?`${n} of 100 people`:`${n} of 100 (1 ≈ 82 million people)`,cx,ly,{s:12.5*k,w:700,c:'#c8102e',b:'middle'});ly+=20*k;
   txt(ctx,`3.4 ÷ 8.2 = ${f1(SHARE)}%`,cx,ly,{s:14*k,w:700,c:PAL['s1'],b:'middle'});}
  else if(gn!=null)txt(ctx,`your gut: ${f1(gv)} billion ≈ ${gn} of 100`,cx,ly,{s:12.5*k,w:700,c:PAL['s4'],b:'middle'});
  if(s===2&&ONT)ring(ctx,cx-6,gy-6,10*c+12,10*c+12+44*k);
  /* right */
  const RX=290,RW=W-RX-16;let y=16;
  const row=(h,on,title,tg,tc)=>{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW,h,8);ctx.fill();if(on&&ONT)ring(ctx,RX-4,y-4,RW+8,h+8);txt(ctx,title,RX+10,y+14*k,{s:12.5*k,w:700,b:'middle'});
   if(tg){ctx.font='700 '+(11*k)+'px '+FONT;const w=ctx.measureText(tg).width+11*k*1.1;pill(ctx,tg,RX+RW-8-w/2,y+14*k,tc,'#fff',11*k);}};
  const vis=m=>s===99?sh:s>=m;
  if(vis(1)){const h=big?50:56;row(h,s===1,big?'The Jubilee call (2024–25)':'The Jubilee call (Pope Francis, 2024; Pope Leo XIV, 2025)');
   wrap(ctx,big?'Forgive debts that can never be repaid: “a matter of justice.”':'Rich nations should “forgive the debts of countries that will never be able to repay them,” as a matter of justice (Spes non confundit, 16).',RX+10,y+31*k,RW-20,{s:11.5*k,b:'middle'});y+=h+6;}
  if(vis(3)){const h=big?50:56;row(h,s===3,'Developing countries, 2024','UNCTAD','#2b5fb3');
   wrap(ctx,big?'Debt $31 trillion; interest $921 billion (+10%).':'Public debt: $31 trillion. Interest paid: $921 billion, up 10% in a year. 61 countries spent 10% or more of revenue on interest.',RX+10,y+31*k,RW-20,{s:11.5*k,b:'middle'});y+=h+6;}
  if(vis(4)){const h=big?110:92;row(h,s===4,big?'Same debt, different rate':'Same debt (3 × yearly revenue), different interest rate','model','#b5650d');
   const rates=[[3,'U.S.-like rate 3%'],[6,'2× the rate: 6%'],[12,'4× the rate: 12%']],bx=RX+(big?120:130),bw=RW-(big?175:190);
   rates.forEach((r,i)=>{const yy=y+(34+i*17)*k,share=3*r[0];txt(ctx,big?r[0]+'%':r[1],RX+10,yy,{s:11*k,w:700,b:'middle'});ctx.fillStyle=i===0?'#2f9e44':i===1?'#e0a10b':'#c8102e';rr(ctx,bx,yy-5,bw*share/52,10,3);ctx.fill();
    txt(ctx,share+(big?'%':'% of revenue'),bx+bw*share/52+5,yy,{s:11*k,w:700,b:'middle'});});y+=h+6;}
  const by=Math.max(y,200),bh=H-by-12;
  if(s===5&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'Money flowing out',big?['Paid $25B more to foreign lenders than received in new loans.']:['Developing countries paid $25 billion more to foreign lenders than they received in new loans.','That is money leaving poorer countries, the opposite of aid.']);
  else if(s===6&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'The last Jubilee (2000)',big?['37 countries relieved of ~$100B.','Today 13 are at high risk again; 5 in distress.']:['Debt relief programs (HIPC and MDRI) relieved 37 countries of about $100 billion.','Today 13 of the 37 are at high risk of debt distress again, and 5 are in distress.']);
  else if(s===7&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'Two cases to weigh',['Critics: relief can reward poor management, raise future borrowing costs and be wasted without conditions.','Jubilee Report (2025): a bankruptcy process for countries, lower rates and relief tied to health and education.']);
  else if(s===8)box(ctx,k,RX,by,RW,bh,'What the Church asks',big?['Forgive debts that can never be repaid: justice, not just generosity.','How (cancel, restructure, conditions) is prudential.']:['The popes ask rich nations to forgive debts poor countries can never repay, as justice and not only generosity (Leviticus 25; Spes non confundit, 16).','How to do it (cancel, restructure, attach conditions) is a prudential question. Discuss: what would you propose?']);
 },
 narrate(sim){if(!shown(sim))return `How many people live in countries that spend more on interest than on health or education? Your gut: ${f1(sim.p.guess)} billion.`;
  return `<b>3.4 billion people</b>, about <b>${f1(SHARE)}%</b> of the world, live in countries that spend more on interest than on health or education. Developing countries paid <b>$921 billion</b> in interest in 2024.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Some countries spend more paying interest on their debts than on health or education. How many people, worldwide, do you think live in those countries? Drag to your gut guess (in billions), then lock it in.',honors:'Drag to your gut guess: billions of people in countries that spend more on interest than on health or education.'},
  hint:{bio:'Lock in your gut. The world has about 8.2 billion people.'},
  lock(sim){return {v:Math.abs(sim.p.guess-PEOPLE),guess:sim.p.guess,label:`${f1(sim.p.guess)} billion`};},
  solve(sim){sim.p.guess=PEOPLE;return {v:0,guess:PEOPLE,label:'3.4 billion (UNCTAD)'};},
  calc:{unit:'%',d:1,tol:0.3,
   prompt:{bio:'UNCTAD counts <b>3.4 billion</b> people in countries that spend more on interest than on health or education. The world has about <b>8.2 billion</b> people. What percent is that? Round to one decimal place.',ap:'3.4 billion of 8.2 billion people. Compute the percent to one decimal place.'},
   answer:()=>+SHARE.toFixed(1),hint:'Part ÷ whole × 100: 3.4 ÷ 8.2 × 100.',
   steps:()=>['3.4 ÷ 8.2 = 0.415.',`× 100 = <b>${f1(SHARE)}%</b>: about 2 in every 5 people on earth.`]},
  formula:()=>`3.4 ÷ 8.2 × 100 = ${f1(SHARE)}%`+(atLeast('honors')?'<br>Interest ÷ revenue = (debt ÷ revenue) × rate: 3 × 12% = 36%':''),
  how:{bio:'Part ÷ whole × 100.',honors:'Interest = debt × rate, so the same debt costs far more at a higher rate.'},
  compare(sim,g){const off=Math.abs(g.guess-PEOPLE);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';
   return (off<=0.5?'Close: within half a billion.':`You guessed ${f1(g.guess)} billion. UNCTAD counts <b>3.4 billion</b>.`)+' That is why the Jubilee call focused on debt: interest is money a country cannot spend on clinics or schools.'+self;},
  again(sim){sim.p.guess=1;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A country owes $40 billion at 9% interest a year. How many billions of dollars is its yearly interest?',answer:3.6,tol:0.05,unit:'$B',d:1,hint:'Interest = debt × rate: 40 × 0.09.',explain:'40 × 0.09 = $3.6 billion a year.'},
  {lvl:'bio',kind:'num',q:'Same $40 billion debt, but at 3%. How much less interest does the country pay each year than at 9%? Answer in billions.',answer:2.4,tol:0.05,unit:'$B',d:1,hint:'40 × 0.09 − 40 × 0.03.',explain:'3.6 − 1.2 = $2.4 billion a year that could go elsewhere.'},
  {lvl:'bio',instant:true,q:'Pope Francis described forgiving the debts of countries that can never repay them as mainly what?',choices:['A favor rich countries can choose to do','A matter of justice, more than generosity','A bad idea'],correct:1,explain:'Spes non confundit, 16: more than a question of generosity, a matter of justice.'},
  {lvl:'honors',kind:'num',q:'A country’s debt is 2.5 times its yearly revenue and its interest rate is 8%. What percent of its revenue goes to interest?',answer:20,tol:0.1,unit:'%',d:0,hint:'(debt ÷ revenue) × rate = 2.5 × 8%.',explain:'2.5 × 8% = 20% of revenue on interest alone.'},
  {lvl:'honors',kind:'num',q:'Developing countries’ interest rose 10% in a year to $921 billion. About what was it the year before? Round to the nearest billion.',answer:921/1.1,tol:1,unit:'$B',d:0,hint:'Before × 1.10 = 921, so divide by 1.10.',explain:'921 ÷ 1.10 ≈ $837 billion.'},
  {lvl:'ap',instant:true,q:'13 of 37 countries that got debt relief around 2000 are at high risk of debt distress again. What does this suggest?',choices:['Relief never helps','Relief alone may not prevent new crises; rules for future borrowing and lending matter too','The numbers must be wrong'],correct:1,explain:'Both the Jubilee Report and critics argue for reforms beyond a one-time write-off.'}
 ],
 tour:[
  {title:'A Jubilee',text:'In the Bible, a jubilee year forgave debts (Leviticus 25). For the Jubilee Year 2025, Pope Francis asked rich nations to forgive the debts of countries that will never be able to repay them, calling it a matter of justice (<i>Spes non confundit</i>, 16). Pope Leo XIV repeated the appeal.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'2 in 5 people',text:'UNCTAD counts 3.4 billion people, out of about 8.2 billion, living in countries that spend more on interest than on health or education: 3.4 ÷ 8.2 ≈ 41%.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'How big the debt is',text:'In 2024, developing countries owed $31 trillion in public debt and paid $921 billion in interest, up 10% in a year. A record 61 of them spent 10% or more of their government revenue on interest.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'The rate matters',text:'Interest = debt × rate. Since 2020, developing regions have borrowed at rates 2 to 4 times the U.S. rate. In this model, a country whose debt is 3 times its yearly revenue spends 9% of revenue on interest at 3%, but 36% at 12%.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Money flowing out',text:'In 2023, developing countries paid $25 billion more to foreign lenders than they received in new loans: money leaving poorer countries, the opposite of aid.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'The last Jubilee',text:'After the Jubilee 2000 campaign, debt relief programs (HIPC and MDRI) relieved 37 countries of about $100 billion. Today 13 of those 37 are at high risk of debt distress again and 5 are in distress.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Two cases to weigh',text:'Critics, including IMF officials and the economist William Easterly, warn that relief can reward poor management, raise future borrowing costs and be wasted without conditions. The Jubilee Report (2025), by economists led by Joseph Stiglitz, proposes a bankruptcy process for countries, lower borrowing costs and relief tied to health and education.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'What the Church asks',text:'The popes ask rich nations to forgive debts that poor countries can never repay, as a matter of justice. How to do it (cancel outright, restructure, attach conditions) is a prudential question that economists and Catholics debate. Discuss: what would you propose, and what numbers would you watch?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How heavy is debt for the world’s poorer countries?</p><ol><li>Lock in your gut, then work out the share of the world living where interest beats health or education.</li><li>Compute the interest on a $40 billion debt at 3% and at 9%.</li></ol><p>Write one sentence on what a lower rate would free up.</p>',
  honors:'<p><b>Question:</b> How does the rate change the burden?</p><ol><li>For debt equal to 3 times revenue, find interest as a share of revenue at 3%, 6% and 12%.</li><li>Explain why that relationship is linear.</li></ol>',
  ap:'<p><b>Question:</b> What does the last round of debt relief teach?</p><ol><li>Use the HIPC numbers to argue one side.</li><li>Name one reform that could make relief last.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Jubilee',d:'In the Bible, a year of release: debts forgiven and land restored (Leviticus 25). The Church holds Jubilee Years, most recently 2025.'},
  {t:'Interest',d:'The cost of borrowing: debt × rate, paid every year.'},
  {t:'Debt service',d:'What a country pays each year on its debt: interest plus repayment.',lvl:'honors'},
  {t:'Moral hazard',d:'When protection from a risk (like the hope of relief) makes people take more of that risk.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Pope Francis, <i>Spes non confundit</i> (May 9, 2024), 16. UNCTAD, <i>A World of Debt 2025: It Is Time for Reform</i> (<a href="https://unctad.org/publication/world-of-debt" target="_blank" rel="noopener">report</a>): $31 trillion; $921 billion (+10%); 61 countries at 10% or more of revenue; 3.4 billion people; rates 2 to 4 times the U.S.; $25 billion net outflow. The Jubilee Report (Jubilee Commission led by Joseph Stiglitz and Martín Guzmán, June 2025). World Bank figures on HIPC and MDRI (37 countries, about $100 billion) as reported by Devex; East Asia Forum (2024) on 13 at high risk and 5 in distress. IMF, “Hazards of Debt Cancellation” (1998); William Easterly on HIPC. World population about 8.2 billion (UN). The interest-rate rows are a model country, not a real one.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>“Developing countries” includes China and India alongside very poor countries; their situations differ.</li><li>Who the lenders are matters: other governments, the World Bank and IMF, China, bondholders and banks each have different rules for relief.</li><li>A count of people says nothing about how much any family feels the squeeze.</li></ul>'
};
BioLab.register(SIM);
})();
