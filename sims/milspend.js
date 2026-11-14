(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* The world's military spending: totals, shares, burden and per person.
   SIPRI fact sheet, April 2026: world military expenditure $2,887 billion in 2025, up 2.9% in real terms, 2.5% of world GDP.
   United States $954B (−7.5%, 3.1% of GDP, 33% of the world total); China about $336B (+7.4%, about 1.7% of GDP, 12%);
   Russia $190B (6.6% of the world, 7.5% of GDP); Germany $114B (3.9%); India $92B (3.2%); United Kingdom 3.1% and France 2.4%
   of the world total; Saudi Arabia $83.2B; Israel 7.8% of GDP. Outside the U.S., spending grew 9.2%; the U.S. share in 2024 was 37%.
   Populations (about, 2025) for per-person figures: world 8.2B, U.S. 342M, China 1,410M, Russia 144M, Germany 84M, India 1,460M. */
const WORLD=2887;
const C=[['United States',954,'#2b5fb3',342],['China',336,'#c8102e',1410],['Russia',190,'#8a4fbf',144],['Germany',114,'#e0a10b',84],['India',92,'#2f9e44',1460],['United Kingdom',+(0.031*WORLD).toFixed(0),'#14a3b8',null],['Saudi Arabia',83.2,'#8c6d3f',null],['France',+(0.024*WORLD).toFixed(0),'#6b7c93',null]];
const BURDEN=[['Israel',7.8],['Russia',7.5],['United States',3.1],['World',2.5],['China',1.7]];
const SH=100*954/WORLD;
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
 id:'milspend',hash:'milspend',apUnit:2,order:5,tab:'The world’s military spending',kind:'Learning tool',prereq:['budget'],next:['northsouth'],
 skills:{bio:'Percent of a whole and per-person rates · Algebra 1 (Unit 2), Social Justice (Just war and military spending)',
  honors:'Three ways to rank: total, share of GDP and per person · Algebra 1 (Unit 2), AP Comparative Government (Unit 1: indicators), AP Macroeconomics (Unit 2)',
  ap:'A weighted average of growth rates: how the world total can rise while the largest spender falls · Statistics (Chapter 1), AP Macroeconomics (Unit 5)'},
 card:'Guess the U.S. share of the world’s $2.9 trillion in military spending, work it out, then rank countries three ways and see the order change.',
 title:'The world’s military spending',
 lede:{bio:'In 2025 the world spent $2,887 billion on militaries. See who spends it, what share each country has, and what that is per person.',
  honors:'Who is the “biggest” spender depends on the measure: total dollars, share of the economy (the burden) or dollars per person. Each answers a different question.',
  ap:'The world total rose 2.9% while the largest spender cut 7.5%. A weighted average of growth rates shows how both can be true.'},
 scale:'World, 2025, in U.S. dollars. Stockholm International Peace Research Institute (SIPRI), April 2026.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: the U.S. share of world military spending',type:'range',min:0,max:80,step:1,def:15,unit:'%'},
  {id:'reveal',label:'Show the spending now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'world',label:'World military spending, 2025',unit:'$B',d:0,min:0,max:4000,get:s=>WORLD},
  {id:'us',label:'U.S. military spending, 2025',unit:'$B',d:0,min:0,max:2000,get:s=>shown(s)?954:null},
  {id:'share',label:'U.S. share of the world',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?SH:null},
  {id:'pp',label:'World per person',unit:'$',d:0,lvl:'honors',min:0,max:5000,get:s=>WORLD*1e9/8.2e9}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  txt(ctx,big?'Military spending, 2025':'Military spending, 2025: $2,887 billion worldwide',20,18,{s:14*k,w:700,b:'middle'});
  /* left: top 8 by total */
  const LX=20,LW=430,lab=big?92:118,sc=(LW-lab-60)/1000,S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);let y=44;
  const SHN={'United States':'U.S.','United Kingdom':'U.K.','Saudi Arabia':'Saudi Ar.'};C.forEach((c,i)=>{if(s===1&&i>0&&ONT)return;const showV=sh||i>0;txt(ctx,big?(SHN[c[0]]||c[0]):c[0],LX,y,{s:12*k,w:700,b:'middle'});
   if(showV&&!(i===0&&!sh)){ctx.fillStyle=c[2];rr(ctx,LX+lab,y-7,Math.max(3,c[1]*sc),14,4);ctx.fill();txt(ctx,'$'+f0(c[1])+'B',LX+lab+c[1]*sc+6,y,{s:12*k,w:700,b:'middle'});}
   else{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,LX+lab,y-7,LW-lab-60,14,4);ctx.fill();txt(ctx,'?',LX+lab+(LW-lab-60)/2,y,{s:12*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});}
   y+=27*k;});
  if(s===2&&ONT)ring(ctx,LX-6,44-14,LW+12,8*27*k+6);
  /* right: share of the world */
  const RX=470,RW=W-RX-18;let ry=40;
  if(s>=3||s===99){txt(ctx,'Share of the world total',RX,ry,{s:13*k,w:700,b:'middle'});ry+=18*k;
   const bw=RW,sx=v=>bw*v/100;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,ry,bw,22,5);ctx.fill();
   if(sh){let x=RX;[['U.S.',SH,'#2b5fb3'],['China',100*336/WORLD,'#c8102e'],['Russia',100*190/WORLD,'#8a4fbf']].forEach(([l,v,c])=>{ctx.fillStyle=c;ctx.fillRect(x,ry,sx(v),22);ctx.font='700 '+(11*k)+'px '+FONT;if(sx(v)>ctx.measureText(l).width+8)txt(ctx,l,x+4,ry+11,{s:11*k,w:700,b:'middle',c:'#fff'});x+=sx(v);});}
   if(gv!=null&&!sh){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(RX+sx(gv),ry-6);ctx.lineTo(RX+sx(gv),ry+28);ctx.stroke();txt(ctx,'your gut '+gv+'%',RX+sx(gv),ry+40,{s:11*k,w:700,a:'center',c:PAL['s4'],b:'middle'});}
   ry+=34*k;if(sh)txt(ctx,big?`U.S. ${f1(SH)}%; top 3: 51%`:`U.S.: 954 ÷ 2,887 = ${f1(SH)}%. Top 3: 51%.`,RX,ry,{s:12.5*k,w:700,c:PAL['s1'],b:'middle'});
   if(s===3&&ONT)ring(ctx,RX-6,40-12,RW+12,ry-40+24);ry+=22*k;}
  const by=Math.max(ry,180),bh=H-by-14;
  if(s===4){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,by,RW,bh,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,RX,by,RW,bh,10);ctx.stroke();}
   txt(ctx,'Share of the economy (burden)',RX+12,by+18*k,{s:14*k,w:700,b:'middle'});
   BURDEN.forEach((b,i)=>{const yy=by+(40+i*22)*k;txt(ctx,big&&b[0]==='United States'?'U.S.':b[0],RX+12,yy,{s:12*k,w:700,b:'middle'});const bx=RX+110,bw2=RW-170;ctx.fillStyle=b[0]==='World'?PAL['cv-soft']:PAL['s2'];rr(ctx,bx,yy-6,bw2*b[1]/8,12,4);ctx.fill();txt(ctx,f1(b[1])+'%',bx+bw2*b[1]/8+5,yy,{s:12*k,w:700,b:'middle'});});}
  else if(s===5&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'Per person (about)',['U.S.: $954B ÷ 342 million ≈ $2,790.','Russia ≈ $1,320; China ≈ $240; India ≈ $63.','World: $2,887B ÷ 8.2 billion ≈ $352 per person.']);
  else if(s===6&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'A weighted average',['U.S. (37% of 2024 spending) fell 7.5%; everyone else (63%) rose 9.2%.','0.37 × (−7.5%) + 0.63 × 9.2% ≈ +3.0%, close to the world’s +2.9%.']);
  else if(s===7)box(ctx,k,RX,by,RW,bh,'Two teachings to weigh',big?['Legitimate defense is allowed (CCC 2308–2310).','Piling up arms is not a sure way to keep peace (2315).','Discuss: how much is enough?']:['The Catechism allows legitimate defense and calls on leaders to defend their people (2308–2310).','It also warns that piling up arms is not a sure way to keep peace (2315). Discuss: how much is enough?']);
 },
 narrate(sim){if(!shown(sim))return `The world spent <b>$2,887 billion</b> on militaries in 2025. What share of that was the United States? Your gut: ${sim.p.guess}%.`;
  return `The U.S. spent <b>$954 billion</b>: ${f1(SH)}% of the world total. The U.S., China and Russia together spent 51%. As a share of the economy, Israel (7.8%) and Russia (7.5%) spend more than the U.S. (3.1%).`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In 2025 the world spent $2,887 billion on militaries. What share of that do you think was spent by the United States? Drag to your gut guess, then lock it in.',honors:'World military spending, 2025: $2,887 billion. Drag to your gut guess of the U.S. share, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the real share yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-SH),guess:sim.p.guess,label:`${sim.p.guess}%`};},
  solve(sim){sim.p.guess=Math.round(SH);return {v:0,guess:SH,label:`${f1(SH)}% ($954B of $2,887B)`};},
  calc:{unit:'%',d:1,tol:0.2,
   prompt:{bio:'SIPRI estimates the U.S. spent <b>$954 billion</b> of the world’s <b>$2,887 billion</b> in 2025. What percent is that?',ap:'U.S.: $954B. World: $2,887B. Compute the U.S. share to one decimal place.'},
   answer:()=>+SH.toFixed(1),hint:'Part ÷ whole × 100: 954 ÷ 2,887 × 100.',
   steps:()=>['954 ÷ 2,887 = 0.330.',`× 100 = <b>${f1(SH)}%</b>: about a third of the world’s military spending.`]},
  formula:()=>`U.S. share = 954 ÷ 2,887 × 100 = ${f1(SH)}%`+(atLeast('honors')?'<br>Per person: $954B ÷ 342 million ≈ $2,790; world ≈ $352':''),
  how:{bio:'Part ÷ whole × 100.',honors:'Rank by total, by share of the economy and by person, and say which question each one answers.'},
  compare(sim,g){const off=Math.abs(g.guess-SH);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';
   return (off<=4?`Close: within ${Math.round(off)} points.`:`You guessed ${g.guess}%. The U.S. share was <b>${f1(SH)}%</b>, so you were off by ${Math.round(off)} points.`)+' The U.S. spends more than the next several countries combined. As a share of its economy, though, it is not the highest.'+self;},
  again(sim){sim.p.guess=15;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'The U.S., China and Russia spent $954B, $336B and $190B. What share of the world’s $2,887B is that together? Round to the nearest whole percent.',answer:100*(954+336+190)/WORLD,tol:0.6,unit:'%',d:0,hint:'Add the three, then divide by 2,887 and × 100.',explain:'1,480 ÷ 2,887 × 100 ≈ 51%: half the world’s military spending.'},
  {lvl:'bio',instant:true,q:'The U.S. spends the most dollars, but Russia spends a bigger share of its economy (7.5% vs 3.1%). Which is true?',choices:['One of the numbers is wrong','Both are true; they measure different things','Russia spends more dollars'],correct:1,explain:'Total dollars and share of GDP answer different questions.'},
  {lvl:'honors',kind:'num',q:'India spent about $92 billion with about 1,460 million people. About how many dollars per person is that?',answer:92e9/1460e6,tol:2,unit:'$',d:0,hint:'92 billion ÷ 1.46 billion.',explain:'92 ÷ 1.46 ≈ $63 per person, compared with about $2,790 in the U.S.'},
  {lvl:'honors',instant:true,q:'Which measure best compares how much of its economy a country puts into its military?',choices:['Total dollars','Share of GDP (the military burden)','Dollars per soldier'],correct:1,explain:'The burden divides spending by the size of the economy.'},
  {lvl:'ap',kind:'num',q:'In 2024 the U.S. was 37% of world spending and fell 7.5% in 2025; everyone else rose 9.2%. What world growth does the weighted average give, to one decimal place?',answer:0.37*-7.5+0.63*9.2,tol:0.15,unit:'%',d:1,hint:'0.37 × (−7.5) + 0.63 × 9.2.',explain:'−2.775 + 5.796 ≈ 3.0%, close to SIPRI’s 2.9% (rounding and real-terms adjustments explain the gap).'}
 ],
 tour:[
  {title:'$2,887 billion',text:'SIPRI estimates the world spent $2,887 billion on militaries in 2025, the 11th year in a row of growth: 2.5% of the world economy. That is about $352 for every person on Earth.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'The biggest spenders',text:'The U.S. spent $954 billion, China about $336 billion, Russia $190 billion, Germany $114 billion and India $92 billion.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Share of the world',text:'954 ÷ 2,887 ≈ 33%: a third of the world total. The U.S., China and Russia together spent 51%.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'A different ranking',text:'Divide spending by the size of each economy and the order changes: Israel 7.8% of GDP, Russia 7.5%, the U.S. 3.1%, China about 1.7%. The world average is 2.5%.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Per person',text:'$954 billion ÷ 342 million people ≈ $2,790 per American. India: about $63 per person. Per-person figures show a different picture again.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'Up while the biggest goes down',text:'The U.S. cut spending 7.5% while everyone else raised theirs 9.2%. Weighted by 2024 shares: 0.37 × (−7.5%) + 0.63 × 9.2% ≈ +3.0%, close to the world’s +2.9%.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Two teachings to weigh',text:'The Catechism holds both: nations may defend themselves, and leaders have a duty to protect their people (2308–2310); and the arms race is not a sure way to keep peace (2315). How much defense spending is enough is a prudential judgment, and NATO allies agreed in 2025 to raise their targets. Discuss: how much is enough, and what should the math above add to that judgment?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How concentrated is the world’s military spending?</p><ol><li>Lock in your gut, then work out the U.S. share.</li><li>Work out the combined share of the top three.</li></ol><p>Write one sentence comparing the total ranking with the share-of-economy ranking.</p>',
  honors:'<p><b>Question:</b> Who spends the most? It depends.</p><ol><li>Rank five countries by total, by share of GDP and by person.</li><li>For each ranking, write the question it answers.</li></ol>',
  ap:'<p><b>Question:</b> How can the world total rise when the biggest spender cuts?</p><ol><li>Compute the weighted average of growth rates.</li><li>Explain why the weights must be last year’s shares.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Share of the world total',d:'One country’s spending ÷ world spending × 100.'},
  {t:'Military burden',d:'Military spending as a share of a country’s GDP.',lvl:'honors'},
  {t:'Per person',d:'Spending ÷ population.',lvl:'honors'},
  {t:'Weighted average',d:'An average where each part counts in proportion to its size.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Stockholm International Peace Research Institute, <i>Trends in World Military Expenditure, 2025</i> (fact sheet, April 2026; <a href="https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf" target="_blank" rel="noopener">PDF</a>) and press release (April 27, 2026): world $2,887B, +2.9%, 2.5% of world GDP; U.S. $954B (−7.5%, 3.1% of GDP, 33%); China about $336B (+7.4%, about 1.7% of GDP, 12%); Russia $190B (6.6%; 7.5% of GDP); Germany $114B; India $92B; United Kingdom 3.1% and France 2.4% of the world total (dollar values here are those shares of $2,887B); Saudi Arabia $83.2B; Israel 7.8% of GDP; spending outside the U.S. +9.2%. Per-person figures use rounded 2025 populations and are approximate. <i>Catechism of the Catholic Church</i>, 2308–2310 and 2315.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Some countries’ figures (China’s, for example) are SIPRI estimates, because not all spending is published.</li><li>Dollar comparisons depend on exchange rates; a dollar buys more in some countries than others.</li><li>Spending says nothing about what the money buys or how it is used.</li></ul>'
};
BioLab.register(SIM);
})();
