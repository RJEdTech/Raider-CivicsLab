(function(){
'use strict';
const {txt,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function panel(ctx,k,x,y,w,h,title){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
function house(ctx,x,y,w,col,roof){ctx.fillStyle=roof;ctx.beginPath();ctx.moveTo(x-4,y+w*0.45);ctx.lineTo(x+w/2,y);ctx.lineTo(x+w+4,y+w*0.45);ctx.closePath();ctx.fill();
 ctx.fillStyle=col;rr(ctx,x,y+w*0.45,w,w*0.6,3);ctx.fill();ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(x+w*0.15,y+w*0.58,w*0.22,w*0.18);ctx.fillRect(x+w*0.63,y+w*0.58,w*0.22,w*0.18);
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x+w*0.42,y+w*0.72,w*0.16,w*0.33);}
/* Two homes, one subsidy (Jason, Nov 14: the FHA "formed intentionally for white families"; Ferguson; white families got cheap loans,
   sold to Black families who could not, and used the wealth to move to the suburbs).
   Rothstein, The Color of Law (2017) and Fresh Air (May 3, 2017): Levittown homes sold for about $8,000 (about $75,000 today) in 1947–48 on
   FHA/VA loans, for whites only; one-bath homes now sell for $350,000 and up; white families gained more than $200,000 over three
   generations; the 1968 Fair Housing Act came after the homes were no longer affordable. Rothstein, "The Making of Ferguson" (EPI, 2014):
   the FHA required covenants against selling to Black families in St. Louis County and financed white-only subdivisions; Ferguson was
   under 1% Black in 1970, 14% (1980), 25% (1990), 52% (2000), 67% (2010).
   Duke Cook Center, UIC and Loyola, "The Plunder of Black Wealth in Chicago" (2019): 75–95% of homes sold to Black families in the 1950s–60s
   were sold on contract; average markup 84% (a $12,000 house resold for $22,000); buyers paid about $587 more a month (2019 dollars);
   $3.2–4.0 billion taken over two decades. Federal Reserve SCF 2022 medians: white $285,000, Black $44,900.
   CCC 2409 (forcing up prices by taking advantage of the hardship of another); USCCB Open Wide Our Hearts (2018). */
const BUY=8000,NOW=350000,REAL=75000;
const f0=v=>Math.round(v).toLocaleString('en-US'),fk=v=>'$'+(v>=1e6?(v/1e6).toFixed(1)+'M':Math.round(v/1000)+'K');
const SIM={
 id:'twohomes',hash:'twohomes',apUnit:1,order:8,tab:'Two homes',kind:'Learning tool',prereq:['redlining'],next:['mutuality'],
 skills:{bio:'Growth and markups: comparing what two families paid and what they kept · Algebra 1 (Unit 2), Black History (Unit 1: covenants and redlining)',
  honors:'Percent markup and the difference between payments and equity · Personal Finance, Sociology',
  ap:'Wealth as a stock, income as a flow: how a subsidy compounds across generations · AP Macroeconomics (Unit 2)'},
 card:'Follow two families after World War II: one buys a suburban home with a federally insured loan, one buys a city home on contract. Guess what each home built.',
 title:'Two homes, one subsidy',
 lede:{bio:'After World War II, the federal government helped millions of families buy homes. Follow two of them and see who the help reached.',
  honors:'The FHA made cheap, long mortgages normal, for white buyers. Black buyers shut out of those loans often bought on contract. Compare what each kept.',
  ap:'A home bought in 1948 is a grandchild’s college fund in 2000. Trace how one subsidy, given to some and not others, still shapes the wealth gap.'},
 scale:'United States, 1934 to today. Rothstein, the Duke Cook Center and the Federal Reserve; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: what an $8,000 Levittown home (1948) sells for today',type:'range',min:0,max:1000000,step:5000,def:100000,unit:'$'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){return {};},step(){},
 metrics:[
  {id:'now',label:'A one-bath Levittown home today',unit:'$',d:0,min:0,max:1e6,get:s=>shown(s)?NOW:null},
  {id:'gain',label:'Wealth beyond inflation',unit:'$',d:0,min:0,max:1e6,get:s=>shown(s)?NOW-REAL:null},
  {id:'buy',label:'Price in 1948',unit:'$',d:0,min:0,max:1e6,get:s=>BUY}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  /* left: two homes and what each built */
  txt(ctx,big?'Two homes':'Two homes after the war',20,18,{s:14*k,w:700,b:'middle'});
  const showB=s>=4||s===99,B=380,T=150,Y=v=>B-(B-T)*Math.min(v,400000)/400000;
  house(ctx,40,48,72,'#4f7cac','#2c4a6b');txt(ctx,big?'Suburb, FHA':'Suburb, FHA loan',76,138,{s:11.5*k,w:700,a:'center',b:'middle'});
  if(showB){house(ctx,170,48,72,'#a8916b','#6b4f2a');txt(ctx,big?'City, contract':'City, on contract',206,138,{s:11.5*k,w:700,a:'center',b:'middle'});}
  ctx.strokeStyle=PAL['g-axis'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(26,B);ctx.lineTo(270,B);ctx.stroke();
  const bar=(x,v,c,lab)=>{ctx.fillStyle=c;rr(ctx,x,Y(v),60,B-Y(v),4);ctx.fill();txt(ctx,lab,x+30,Y(v)-10,{s:11.5*k,w:700,a:'center',b:'middle'});};
  if(sh){bar(46,NOW,'#4f7cac',big?'$350K':'$350,000');txt(ctx,big?'today':'today’s value',76,B+14*k,{s:11*k,a:'center',b:'middle',c:PAL['cv-soft']});}
  else{bar(46,BUY,'#4f7cac','$8,000');txt(ctx,'1948',76,B+14*k,{s:11*k,a:'center',b:'middle',c:PAL['cv-soft']});
   if(gv!=null){const y=Y(gv);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(36,y);ctx.lineTo(120,y);ctx.stroke();txt(ctx,'gut: '+fk(gv),124,y,{s:11.5*k,w:700,b:'middle',c:PAL['s4']});}}
  if(showB){ctx.strokeStyle='#C11430';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(176,B-34,60,30);ctx.setLineDash([]);
   txt(ctx,'$0',206,B-19,{s:12*k,w:700,a:'center',b:'middle',c:'#C11430'});txt(ctx,big?'equity':'equity until paid off',206,B+14*k,{s:11*k,a:'center',b:'middle',c:PAL['cv-soft']});}
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'A New Deal for home buyers');y=lines(ctx,k,RX+12,y,RW-24,big?['1934: the FHA is created.','Small down payments, 30 years.','Built the middle class.']:['In 1934 Congress created the Federal Housing Administration. It insured long, low-cost mortgages with small down payments, so banks would lend to working families.','After the war, the FHA and the GI Bill helped millions of families buy their first homes. Home equity became the main way American families built wealth.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'For white families only');y=lines(ctx,k,RX+12,y,RW-24,big?['Levittown, 1947–48: about 17,000 homes.','$8,000 each.','Sold only to white buyers.']:['The FHA judged loans in mixed or Black neighborhoods too risky, and it financed whole suburbs on the condition that no homes be sold to Black families.','Levittown, New York, built about 17,000 homes in 1947–48 for about $8,000 each, affordable to Black and white workers alike. Only white buyers were allowed.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'What the home built');y=lines(ctx,k,RX+12,y,RW-24,big?['$8,000 ≈ $75,000 today.','Now: $350,000 and up.','Paid for college, passed to kids.']:['$8,000 in 1948 is about $75,000 in today’s dollars. A one-bath Levittown home now sells for $350,000 and up.','Families used that equity to send children to college, weather emergencies and help the next generation buy homes: more than $200,000 of wealth over three generations.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'The other side of the sale');y=lines(ctx,k,RX+12,y,RW-24,big?['Shut out of FHA loans,','Black buyers bought “on contract.”','No equity; miss a payment, lose it all.']:['When white families moved to the suburbs, speculators bought their city homes and resold them to Black families, who couldn’t get FHA loans, “on contract.”','A contract wasn’t a mortgage: the buyer built no equity until the last payment. Miss one payment and the family could be evicted and lose everything they had paid.']);}
  else if(s===5){let y=panel(ctx,k,RX,PY,RW,PH,'Chicago: the bill');
   const bar2=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?110:160),w=(RW-(big?190:250))*v/22000;ctx.fillStyle=c;rr(ctx,x0,y-8,w,16,4);ctx.fill();txt(ctx,'$'+f0(v),x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=26*k;};
   bar2(big?'Bought at':'Speculator paid',12000,'#a8916b');bar2(big?'Sold for':'Sold on contract for',22000,'#C11430');
   lines(ctx,k,RX+12,y+6,RW-24,big?['84% markup on average.','75–95% of Black buyers.','$3.2–4.0 billion taken.']:['The average markup was 84%. Between 75% and 95% of homes sold to Black families in 1950s–60s Chicago were sold on contract, costing about $587 more a month (2019 dollars).','Researchers estimate contracts took $3.2 to $4.0 billion from Chicago’s Black families in two decades.']);}
  else if(s===6&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Ferguson, Missouri');
   const yrs=[[1970,1],[1980,14],[1990,25],[2000,52],[2010,67]];yrs.forEach(r=>{txt(ctx,String(r[0]),RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+60,w=(RW-110)*r[1]/100;ctx.fillStyle='#a8916b';rr(ctx,x0,y-7,Math.max(3,w),14,4);ctx.fill();txt(ctx,(r[0]===1970?'<1':r[1])+'%',x0+Math.max(3,w)+5,y,{s:12*k,w:700,b:'middle'});y+=22*k;});
   lines(ctx,k,RX+12,y+6,RW-24,big?['% Black. FHA-backed suburbs were white.','Then whites moved farther out.']:['Share of Ferguson residents who were Black. The FHA required covenants against selling to Black families in St. Louis County.','As Black families moved into inner suburbs like Ferguson, many white families sold and moved farther out, taking their equity with them.']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'1968, and today');y=lines(ctx,k,RX+12,y,RW-24,big?['1968: Fair Housing Act.','By then: homes unaffordable.','Wealth today: $285K vs. $44.9K.']:['The Fair Housing Act of 1968 banned discrimination, but the homes once sold for $8,000 had climbed out of reach for working families.','Today the typical white family has about $285,000 in wealth; the typical Black family, about $44,900 (Federal Reserve, 2022). Home equity is most families’ biggest store of wealth.']);}
  else if(s===8){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church teaches');y=lines(ctx,k,RX+12,y,RW-24,big?['CCC 2409: no forcing up prices on others’ hardship.','USCCB 2018: racism is a sin.']:['The Catechism (2409) names “forcing up prices by taking advantage of the ignorance or hardship of another” as theft, even when the law allows it.','The U.S. bishops (Open Wide Our Hearts, 2018) call racism a sin and name housing discrimination. Discuss: what do we owe the families who paid twice?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,210,'Two homes');lines(ctx,k,RX+12,y,RW-24,['FHA suburb: $8,000 in 1948 (about $75,000 today) → $350,000 and up.','City contract: 84% markup, no equity until the last payment. Chicago: $3.2–4.0 billion taken.']);}
 },
 narrate(sim){if(!shown(sim))return `A Levittown home sold for $8,000 in 1948. Your gut for today: $${f0(sim.p.guess)}.`;
  return `A one-bath Levittown home now sells for about <b>$350,000</b>. Even after inflation ($8,000 ≈ $75,000), that’s about <b>$275,000</b> of wealth, open only to white buyers when it was built.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In 1948, a Levittown home sold for about $8,000 with a federally insured loan, to white buyers only. What do you think it sells for today? Drag to your gut, then lock it in.',honors:'$8,000 in 1948 (white buyers only). Drag to your gut for today’s price, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the wealth beyond inflation.'},
  lock(sim){return {v:Math.abs(sim.p.guess-NOW),guess:sim.p.guess,label:'$'+f0(sim.p.guess)};},
  solve(sim){sim.p.guess=NOW;return {v:0,guess:NOW,label:'$350,000'};},
  calc:{unit:'$',d:0,tol:0,
   prompt:{bio:'The home sells for <b>$350,000</b> today. Its 1948 price, <b>$8,000</b>, is about <b>$75,000</b> in today’s dollars. How much wealth did it build beyond inflation?',ap:'$350,000 − $75,000 = ?'},
   answer:()=>NOW-REAL,hint:'Today’s value − the price in today’s dollars.',
   steps:()=>['$350,000 − $75,000 = <b>$275,000</b>.','Wealth a family could borrow against, pass on, or use for college.']},
  formula:()=>'$350,000 − $75,000 = $275,000'+(atLeast('honors')?'<br>Contract markup: $22,000 ÷ $12,000 = 1.83 → 83–84%':''),
  how:{bio:'Compare in the same dollars: today’s value − the old price in today’s dollars.',honors:'Payments are not equity: what you own is what you keep.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the gain yourself.':'';
   return (Math.abs(g.guess-NOW)<=60000?'Close.':`You guessed $${f0(g.guess)}. It’s about <b>$350,000</b>.`)+' Black families who could have afforded it in 1948 were not allowed to buy.'+self;},
  again(sim){sim.p.guess=100000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A speculator bought a house for $12,000 and sold it on contract for $22,000. How much was the markup in dollars?',answer:10000,tol:0,unit:'$',d:0,hint:'22,000 − 12,000.',explain:'$10,000: nearly the price of the house again.'},
  {lvl:'bio',instant:true,q:'A family buying on contract has paid for 10 years and misses one payment. What happens?',choices:['They keep the equity they built','They can be evicted and lose everything paid','The bank refinances them'],correct:1,explain:'A contract builds no equity until the last payment, unlike a mortgage.'},
  {lvl:'honors',kind:'num',q:'$12,000 → $22,000. What percent markup? Round to the nearest whole percent.',answer:83,tol:1,unit:'%',d:0,hint:'(22,000 − 12,000) ÷ 12,000 × 100.',explain:'About 83%, close to the 84% average the researchers found.'},
  {lvl:'honors',kind:'num',q:'Ferguson went from under 1% Black (1970) to 67% (2010). About how many points did the Black share rise?',answer:66,tol:1,unit:'points',d:0,hint:'67 − 1.',explain:'About 66 points in 40 years, as white families sold and moved farther out.'},
  {lvl:'ap',instant:true,q:'Why does a 1948 housing subsidy still matter for a 2026 wealth gap?',choices:['It doesn’t','Home equity compounds and is passed on: wealth is a stock that builds across generations','Incomes are identical now'],correct:1,explain:'Income is a flow; wealth is a stock that grows and is inherited.'}
 ],
 tour:[
  {title:'A New Deal for home buyers',text:'In 1934 Congress created the Federal Housing Administration. It insured long, low-cost mortgages with small down payments. With the GI Bill, it helped millions of families buy their first homes.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'For white families only',text:'The FHA judged loans in mixed or Black neighborhoods too risky and financed suburbs on the condition that no homes be sold to Black families. Levittown’s roughly 17,000 homes sold for about $8,000 each, to white buyers only.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'What the home built',text:'$8,000 in 1948 is about $75,000 today. A one-bath Levittown home now sells for $350,000 and up: more than $200,000 of wealth over three generations, for college, emergencies and the next home.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'The other side of the sale',text:'When white families left for the suburbs, speculators bought their city homes and resold them to Black families, shut out of FHA loans, “on contract.” No equity until the last payment; miss one, and lose it all.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Chicago: the bill',text:'In 1950s–60s Chicago, 75–95% of homes sold to Black families were sold on contract, at an average 84% markup. Researchers estimate contracts took $3.2–4.0 billion from Black families.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'Ferguson, Missouri',text:'The FHA required covenants against selling to Black families in St. Louis County. Ferguson was under 1% Black in 1970 and 67% in 2010, as many white families sold and moved farther out.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'1968, and today',text:'The Fair Housing Act of 1968 banned discrimination after the homes were out of reach. Today the typical white family has about $285,000 in wealth; the typical Black family, about $44,900 (Federal Reserve, 2022).',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'What the Church teaches',text:'The Catechism (2409) calls forcing up prices by taking advantage of another’s hardship a form of theft, even when the law allows it. The U.S. bishops call racism a sin. What do we owe families who paid twice?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> Who did the federal home loan program reach?</p><ol><li>Lock in your gut, then work out the wealth beyond inflation.</li><li>Explain the difference between a mortgage and a contract.</li></ol>',
  honors:'<p><b>Question:</b> How did one program shape two neighborhoods?</p><ol><li>Compute the contract markup.</li><li>Use the Ferguson numbers to describe what happened next.</li></ol>',
  ap:'<p><b>Question:</b> Why does a subsidy from 1948 still shape the wealth gap?</p><ol><li>Explain stocks vs. flows with the Levittown numbers.</li><li>Use the 2022 medians as evidence.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'FHA',d:'The Federal Housing Administration (1934), which insures home mortgages.'},
  {t:'Equity',d:'The part of a home you actually own: its value minus what you still owe.'},
  {t:'Contract for deed',d:'A sale where the seller keeps the title until the last payment; the buyer builds no equity and can lose everything for one missed payment.'},
  {t:'Restrictive covenant',d:'A deed rule forbidding sale to certain groups; courts stopped enforcing them in 1948 (Shelley v. Kraemer).',lvl:'honors'},
  {t:'Stock vs. flow',d:'Wealth is a stock that builds and is inherited; income is a flow each year.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Richard Rothstein, <i>The Color of Law</i> (2017), and his <i>Fresh Air</i> interview (May 3, 2017); Rothstein, “The Making of Ferguson: Public Policies at the Root of Its Troubles,” Economic Policy Institute (2014). Samuel DuBois Cook Center (Duke), UIC Voorhees Center and Loyola CURL, “The Plunder of Black Wealth in Chicago” (2019). Ta-Nehisi Coates, “The Case for Reparations,” <i>The Atlantic</i> (2014). Federal Reserve, Survey of Consumer Finances 2022. <i>Catechism of the Catholic Church</i>, 2409; USCCB, <i>Open Wide Our Hearts</i> (2018).</p>'+
  '<p><b>What this number hides.</b></p><ul><li>$350,000 is one kind of Levittown home; values vary.</li><li>The Chicago totals are estimates from surviving records; the researchers say gaps in the data make them conservative.</li><li>Behind each contract was a family that worked to keep up the payments.</li></ul>'
};
BioLab.register(SIM);
})();
