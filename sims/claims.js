(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,lvText}=BioLab.h;
/* Four claim cards. Each card has its own guess slider and its own assumption controls; only the current card's
   controls are shown. Every figure is a published estimate (see About); the tool computes per-person rates,
   shares, ratios and the gap between the student's guess and the published number. */
const ITEP={tot:96.7,fed:59.4,sl:37.3,ss:25.7,med:6.4,co:427,pop:10.9};
const FAIR={gross:182,tax:31,net:150.7,pop:15.5};
const NAS={avg:279,marg:43};
const AID={ia:48.0,out:7395.8};
const FOOD={pct:29,tons:70};
const CTC={y21:5.2,y22:12.4,y23:13.7,lo:410000,hi:1500000};
const aidPct=()=>100*AID.ia/AID.out;
const ppItep=()=>ITEP.tot*1e9/(ITEP.pop*1e6), ppFair=()=>FAIR.tax*1e9/(FAIR.pop*1e6);
const CARDS=['tax','aid','food','ctc'];
const GID={tax:'g_tax',aid:'g_aid',food:'g_food',ctc:'g_ctc'};
const OWN={tax:['g_tax','pop','kids','pg'],aid:['g_aid','bill'],food:['g_food','era','counts'],ctc:['g_ctc','evid']};
const TILES={tax:['pp_itep','pp_fair','atpop'],aid:['aidpct','aidbill'],food:['surplus'],ctc:['jump','perk','simgap']};
const CLAIM={tax:'“Undocumented immigrants pay no taxes.”',aid:'“Foreign aid is a big part of the federal budget.”',food:'“The government destroys food to keep prices up.”',ctc:'“The expanded Child Tax Credit cut child poverty.” “It cost too much and discouraged work.”'};
let REF=null;
const cur=sim=>sim.p.card;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1),f2=v=>(+v).toFixed(2);
const money=v=>'$'+f0(v);
const GS=sim=>sim.gutS;
function shown(sim){const c=cur(sim);if(sim.tour&&sim.tour.on)return true;if(sim.st&&sim.st.rev&&sim.st.rev[c])return true;const S=GS(sim);return !!(S&&S.g&&S.g.card===c);}
function guessOf(sim){const c=cur(sim),S=GS(sim);return (S&&S.g&&S.g.card===c)?S.g.val:sim.p[GID[c]];}
/* The published answer each guess is scored against. For taxes, two sources disagree, so any guess inside their range scores 0. */
function truthGap(c,g){if(c==='tax'){const lo=FAIR.tax,hi=ITEP.tot;return g<lo?lo-g:g>hi?g-hi:0;}
 if(c==='aid')return Math.abs(g-aidPct());if(c==='food')return Math.abs(g-FOOD.pct);return Math.abs(g-CTC.y22);}
function unitTxt(c,v){if(c==='tax')return '$'+f1(v)+'B';if(c==='aid')return '$'+f2(v)+' of every $100';if(c==='food')return f0(v)+'%';return f1(v)+'%';}

/* show only the current card's controls and tiles */
function syncVis(sim){const ui=sim.ui;if(!ui||!ui.ctlW)return;const c=cur(sim);
 (sim.def.controls||[]).forEach(ct=>{const own=Object.keys(OWN).find(k=>OWN[k].includes(ct.id));if(!own)return;const w=ui.ctlW[ct.id];if(!w)return;
  w.hidden=w._home?false:(own!==c||!atLeast(ct.lvl||'bio'));});
 Object.keys(TILES).forEach(k=>TILES[k].forEach(id=>{const t=ui.tiles&&ui.tiles[id];if(!t)return;const tile=t.num.closest('.tile');const m=sim.def.metrics.find(x=>x.id===id);if(tile)tile.hidden=k!==c||!atLeast(m.lvl||'bio');}));}
/* In the Guided gut step, swap which guess slider sits beside the prompt when the student picks another claim. */
function reparkGuided(sim){const dc=sim.ui&&sim.ui.donecard,box=dc&&dc.querySelector('.gs-ctl');if(!box)return;const want=GID[cur(sim)];
 Object.values(GID).forEach(id=>{const w=sim.ui.ctlW[id];if(w&&w._home&&id!==want){w._home.parentNode.insertBefore(w,w._home);w._home.remove();w._home=null;}});
 const w=sim.ui.ctlW[want];if(w&&!w._home&&w.parentNode){const ph=document.createComment('ctl '+want);w.parentNode.insertBefore(ph,w);w._home=ph;box.appendChild(w);}
 const x=dc.querySelector('.dc-x');if(x)x.innerHTML=lvText(ASK[cur(sim)]);}
function onCard(sim){const S=GS(sim),keep=sim.guide&&sim.guide.keep;
 if(S&&!keep&&(S.g||S.m)){S.g=null;S.m=null;}
 if(sim.mode==='guided'){if(sim.guide&&sim.guide.phase==='gut')reparkGuided(sim);}
 else if(BioLab.gutRender&&sim.ui&&sim.ui.gut)BioLab.gutRender(sim);
 syncVis(sim);sim.infoDirty=true;}
function clearGut(sim){const S=GS(sim);if(S&&!(sim.guide&&sim.guide.keep)&&(S.g||S.m)){S.g=null;S.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const ASK={
 tax:'Start with the first claim. How many <b>billions of dollars</b> in taxes do you think undocumented immigrants paid in 2022? The slider starts at the claim: $0. Drag it to your guess, then lock it in.',
 aid:'Out of every <b>$100</b> the federal government spends, how many dollars do you think go to foreign aid and everything else in international affairs? Drag the slider here to your guess, then lock it in.',
 food:'Out of all the food the U.S. produces in a year, what <b>percent</b> do you think ends up unsold or uneaten? Drag the slider here to your guess, then lock it in.',
 ctc:'In 2021, while the expanded Child Tax Credit was paid, 5.2% of U.S. children were in poverty. The expansion ended after 2021. What do you think the rate was in <b>2022</b>? Drag the slider, then lock it in.'};
const HOW={
 tax:'Two groups on opposite sides of the immigration debate both estimated it. ITEP, which leans left, found $96.7B in federal, state and local taxes for 2022. FAIR, which advocates lower immigration, found $31B. Any guess between them counts as on target.',
 aid:'Divide one budget line by the total: $48.0B for international affairs ÷ $7,395.8B in federal outlays for fiscal year 2026 = 0.65%, or 65 cents of every $100.',
 food:'ReFED, a food-waste research group, adds up surplus food at every stage from farm to fork: 70 million tons in 2024, 29% of the U.S. food supply.',
 ctc:'The Census Bureau’s Supplemental Poverty Measure counts tax credits as income. It showed child poverty at 5.2% in 2021 and 12.4% in 2022, after the expansion expired.'};

function verdict(sim){const c=cur(sim),p=sim.p;if(!shown(sim))return 'Lock in your guess first. Then the verdict appears.';
 if(c==='tax')return `False as stated: estimates from both sides find tens of billions of dollars a year ($31B to $96.7B). Whether they cost governments more than they pay is a separate question, and the answer depends on what you count.`;
 if(c==='aid')return `False: international affairs, which includes all foreign aid plus diplomacy, was ${f2(aidPct())}% of federal outlays in FY2026, about 65 cents of every $100.`;
 if(c==='food'){if(p.era==='1933')return 'True in 1933: under the Agricultural Adjustment Act, about 6 million young pigs were slaughtered and about 10 million acres of cotton plowed under to raise farm prices.';
  return p.counts==='destroy'?'Mostly false today. No program here destroys food to raise prices. The milk dumped in spring 2020 was a supply-chain breakdown, and Section 32 buys surplus food and gives it away.':'Partly true today, if you count price supports: the sugar program keeps U.S. sugar near twice the world price, but it does not destroy food.';}
 return `“Cut child poverty”: child poverty more than doubled, ${f1(CTC.y21)}% to ${f1(CTC.y22)}%, when the expansion ended, which fits the claim. “Discouraged work”: ${p.evid==='sims'?'simulations predict about 410,000 to 1.5 million parents leaving work':'some studies of actual 2021 jobs found no significant drop'}. “Cost too much” is a value judgment.`;}
function depends(sim){const c=cur(sim),p=sim.p;
 if(c==='tax'){let s=`Taxes paid depend on the method more than the headcount. Net cost depends on what you count: `;
  s+=p.kids?'you are counting U.S.-born children’s school costs, as FAIR and the National Academies do. ':'you left out U.S.-born children’s school costs. Every cost estimate here includes them, so the net cost would be lower, but no source here publishes that number. ';
  if(atLeast('honors'))s+=p.pg==='avg'?'Charging an average share of defense and other public goods gives the National Academies’ high end, about $279B for all first-generation immigrants in 2013. ':'Counting only the added cost of public goods gives the National Academies’ low end, about $43B for all first-generation immigrants in 2013. ';
  return s+'Federal and state budgets also differ: CBO finds the 2021–2026 surge lowers federal deficits while raising state and local costs.';}
 if(c==='aid')return 'It depends on the denominator. As a share of the whole budget it is under 1%. As dollars, $48.0B is a lot of money. Both are true; whether it is too much or too little is a value question.';
 if(c==='food')return p.counts==='destroy'?'It depends on what “destroy” means and when. Destroying food on purpose to raise prices happened in 1933. Today most lost food is ordinary waste: 29% of the supply, with homes the biggest single source.':'If “keep prices up” counts, the sugar program fits: GAO estimates it costs U.S. consumers $2.5B to $3.5B a year. It still destroys no food.';
 return p.evid==='sims'?'The work effect depends on assumptions about how parents respond. Two simulations differ by more than 3 times: about 410,000 (Niskanen Center) against about 1.5 million (Corinth, Meyer, Stadnicki and Wu, NBER).':'Studies of what actually happened in 2021 found no significant drop in parents’ work. The 2021 expansion was temporary, so critics argue a permanent credit could still change behavior.';}
function faith(sim){const c=cur(sim);
 if(c==='tax')return 'In a Special Message (Nov 12, 2025) the U.S. bishops affirm that nations may regulate their borders and oppose “indiscriminate mass deportation.” That is a moral claim about how to treat people. These tax numbers do not prove or disprove it, and the bishops’ case does not rest on them.';
 if(c==='ctc')return 'The U.S. bishops (USCCB) asked for a Child Tax Credit that reaches the poorest families. Math can test whether a design does that: the 2021 credit was fully refundable, so families who owed little or no income tax got it. Whether that is worth the cost is a value question.';
 if(c==='aid')return 'Catholic social teaching asks how a budget treats the poor, here and abroad. The share is a fact you can check. How much a nation should give is a value question this tool leaves to you.';
 return 'Pope Francis’s Laudato Si’ (2015) warns against a “throwaway culture.” The math shows most lost food today is waste, not policy. See Food math in this lab.';}

const SIM={
 id:'claims',hash:'claims',apUnit:3,order:1,tab:'Does the math hold up?',kind:'Learning tool',next:['whatmoved','foodmath'],
 card:'Guess the number behind four common claims, then see what the published estimates say and which assumptions change the answer.',
 title:'Does the math hold up?',
 lede:{bio:'You hear claims like these in your feed, in class debates and at the dinner table. Each one sounds like a number. Guess the number, then check it against the best published estimates.',
  honors:'Most fights over a number are fights over what to count. Change the assumptions on each card and watch which estimate your choices match.',
  ap:'Separate the factual claim (a number you can check) from the value claim (what we should do about it). Compare per-person rates, shares and ranges across sources that disagree.'},
 scale:'One claim at a time. Dollar figures are for one year unless a card says otherwise. B = billion, T = trillion.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'The claim',
 controls:[
  {id:'card',label:'Pick a claim',type:'seg',def:'tax',noGut:true,onChange:onCard,options:[{v:'tax',l:'No taxes?'},{v:'aid',l:'Foreign aid'},{v:'food',l:'Food destroyed?'},{v:'ctc',l:'Child Tax Credit'}]},
  {id:'g_tax',label:'Your guess: taxes they paid in 2022 (dollars)',type:'range',min:0,max:150,step:1,def:0,unit:' billion'},
  {id:'g_aid',label:'Your guess: dollars of every $100 of federal spending',type:'range',min:0,max:30,step:0.1,def:10,unit:' dollars'},
  {id:'g_food',label:'Your guess: percent of U.S. food unsold or uneaten',type:'range',min:0,max:60,step:1,def:10,unit:'%'},
  {id:'g_ctc',label:'Your guess: child poverty in 2022',type:'range',min:0,max:25,step:0.1,def:5.2,unit:'%'},
  {id:'pop',label:'How many undocumented immigrants? (estimate)',type:'range',min:10,max:16,step:0.1,def:10.9,unit:' million',noGut:true,onChange:clearGut,help:'ITEP uses 10.9 million. FAIR uses 15.5 million.'},
  {id:'kids',label:'Count U.S.-born children’s school costs',type:'toggle',def:true,noGut:true,help:'The children are citizens. Some studies count their school costs as a cost of their parents.'},
  {id:'pg',label:'Charge a share of public goods like defense',type:'seg',def:'avg',lvl:'honors',noGut:true,options:[{v:'avg',l:'Average share per person'},{v:'marg',l:'Only the added (marginal) cost'}],help:'An extra resident barely changes the cost of the Navy. Average-cost accounting charges everyone an equal share anyway.'},
  {id:'bill',label:'Your family’s federal tax bill (for illustration)',type:'range',min:1000,max:30000,step:500,def:5000,unit:' dollars',noGut:true,help:'Stays in your browser. Nothing is saved or sent.'},
  {id:'era',label:'When?',type:'seg',def:'today',noGut:true,options:[{v:'today',l:'Today'},{v:'1933',l:'1933'}]},
  {id:'counts',label:'What counts as the claim?',type:'seg',def:'destroy',noGut:true,options:[{v:'destroy',l:'Destroying food on purpose'},{v:'prices',l:'Any policy that keeps food prices up'}]},
  {id:'evid',label:'Evidence on work',type:'seg',def:'sims',noGut:true,options:[{v:'sims',l:'Simulations'},{v:'actual',l:'Studies of actual 2021 jobs'}]}
 ],
 actions:[
  {id:'show',label:'Show the numbers',run(sim){sim.st.rev[cur(sim)]=true;sim.infoDirty=true;}},
  {id:'next',label:'Next claim',run(sim){const i=CARDS.indexOf(cur(sim));BioLab.setValues(sim,{card:CARDS[(i+1)%4]});}}
 ],
 init(sim){REF=sim;return {rev:{}};},step(){},
 onLevel(sim){syncVis(sim);},
 onChallenge(sim,ch,phase){if(phase==='done'&&ch.card){if(cur(sim)!==ch.card)BioLab.setValues(sim,{card:ch.card});sim.st.rev[ch.card]=true;sim.infoDirty=true;}},
 metrics:[
  {id:'verdict',label:'Verdict',text:true,get:verdict},
  {id:'depends',label:'What the answer depends on',text:true,get:depends},
  {id:'faith',label:'Faith and scrutiny',text:true,get:faith},
  {id:'pp_itep',label:'ITEP: taxes per person',unit:'$ a year',d:0,min:0,max:10000,lvl:'honors',get:sim=>cur(sim)==='tax'&&shown(sim)?ppItep():null},
  {id:'pp_fair',label:'FAIR: taxes per person',unit:'$ a year',d:0,min:0,max:10000,lvl:'honors',get:sim=>cur(sim)==='tax'&&shown(sim)?ppFair():null},
  {id:'atpop',label:'ITEP’s per-person rate × your population',unit:'$B',d:1,min:0,max:150,lvl:'ap',get:sim=>cur(sim)==='tax'&&shown(sim)?ppItep()*sim.p.pop*1e6/1e9:null},
  {id:'aidpct',label:'International affairs share of federal outlays',unit:'%',d:2,min:0,max:5,get:sim=>cur(sim)==='aid'&&shown(sim)?aidPct():null},
  {id:'aidbill',label:'Your family’s tax bill × that share',unit:'$',d:0,min:0,max:200,get:sim=>cur(sim)==='aid'&&shown(sim)?sim.p.bill*aidPct()/100:null},
  {id:'surplus',label:'U.S. food supply unsold or uneaten (2024)',unit:'%',d:0,min:0,max:60,get:sim=>cur(sim)==='food'&&shown(sim)?FOOD.pct:null},
  {id:'jump',label:'Rise in child poverty, 2021 to 2022',unit:'points',d:1,min:0,max:10,get:sim=>cur(sim)==='ctc'&&shown(sim)?CTC.y22-CTC.y21:null},
  {id:'perk',label:'More children in poverty per 1,000',unit:'children',d:0,min:0,max:100,lvl:'honors',get:sim=>cur(sim)==='ctc'&&shown(sim)?Math.round(10*(CTC.y22-CTC.y21)):null},
  {id:'simgap',label:'High simulation ÷ low simulation',unit:'×',d:1,min:0,max:5,lvl:'ap',get:sim=>cur(sim)==='ctc'&&shown(sim)?CTC.hi/CTC.lo:null}
 ],
 draw(sim,ctx,vdt,k){const c=cur(sim),sh=shown(sim),W=800;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,450);
  /* header: who says it, then the claim */
  ctx.font='700 '+(12*k)+'px '+FONT;const pw=ctx.measureText('A common claim').width+13*k;pill(ctx,'A common claim',20+pw/2,12+10*k,PAL['s2'],'#fff',12*k);
  const hs=Math.max(16,13*k);const hh=wrap(ctx,CLAIM[c],20,30+22*k,760,{s:hs,w:700,max:2});
  const top=30+22*k+hh-8+6*k;
  if(c==='tax')drawTax(sim,ctx,k,top,sh);else if(c==='aid')drawAid(sim,ctx,k,top,sh);else if(c==='food')drawFood(sim,ctx,k,top,sh);else drawCtc(sim,ctx,k,top,sh);},
 narrate(sim){const c=cur(sim),g=guessOf(sim),p=sim.p;
  if(!shown(sim)){if(c==='tax')return `Your guess right now: <b>$${f0(g)}B</b>. The claim says $0. Lock in your guess, or press Show the numbers, to see what two groups on opposite sides estimated.`;
   if(c==='aid')return `Your guess right now: <b>$${f1(g)} of every $100</b> of federal spending. Lock it in to see the real share.`;
   if(c==='food')return `Your guess right now: <b>${f0(g)}%</b> of U.S. food goes unsold or uneaten. Lock it in, then check who or what is doing the wasting.`;
   return `Your guess right now: child poverty at <b>${f1(g)}%</b> in 2022, against 5.2% in 2021. Lock it in to see the measured rate.`;}
  if(c==='tax'){const at=ppItep()*p.pop/1e3;return `Both estimates are far above $0, so <b>“no taxes” is false.</b> ${Math.abs(p.pop-ITEP.pop)>0.05?`With ${f1(p.pop)} million people at ITEP’s rate of about ${money(ppItep())} each, the total would be $${f1(at)}B. `:''}The real argument is about the net, and that depends on what you count.`;}
  if(c==='aid')return `International affairs is <b>${f2(aidPct())}%</b> of federal outlays. On a ${money(p.bill)} federal tax bill, that share is about <b>${money(p.bill*aidPct()/100)}</b>.`;
  if(c==='food')return p.era==='1933'?`<b>In 1933 the claim was true:</b> the government paid to destroy crops and livestock to raise farm prices.`:`<b>Today the big loss is ordinary waste:</b> 29% of the U.S. food supply went unsold or uneaten in 2024. ${p.counts==='prices'?'The sugar program raises prices without destroying food.':'No current program here destroys food to raise prices.'}`;
  return `Child poverty went from <b>${f1(CTC.y21)}% to ${f1(CTC.y22)}%</b> when the expansion ended: ${Math.round(10*(CTC.y22-CTC.y21))} more children per 1,000. ${p.evid==='sims'?'Simulations disagree by more than 3 times on how many parents would leave work.':'Some studies of actual 2021 jobs found no significant drop in work.'}`;},
 gut:{better:'lower',
  get controls(){const c=REF&&REF.p?REF.p.card:'tax';return ['card',GID[c]];},
  get ask(){return ASK[REF&&REF.p?REF.p.card:'tax'];},
  get how(){return HOW[REF&&REF.p?REF.p.card:'tax'];},
  lock(sim){const c=cur(sim),g=sim.p[GID[c]];return {card:c,val:g,v:truthGap(c,g),label:unitTxt(c,g)};},
  solve(sim){const c=cur(sim),g=sim.p[GID[c]];let t,label;
   if(c==='tax'){t=clamp(g,FAIR.tax,ITEP.tot);label='$31B (FAIR) to $96.7B (ITEP)';}
   else if(c==='aid'){t=aidPct();label=`$${f2(t)} of every $100`;}else if(c==='food'){t=FOOD.pct;label='29%';}else{t=CTC.y22;label='12.4%';}
   sim.p[GID[c]]=t;sim.st.rev[c]=true;return {card:c,val:t,v:truthGap(c,t),label};},
  compare(sim,g,m){const c=g.card;
   if(c==='tax'){if(g.v<0.5)return `Your guess, $${f0(g.val)}B, sits inside the range of published estimates: $31B (FAIR) to $96.7B (ITEP). Groups on opposite sides of the debate agree it is tens of billions, not zero.`;
    const pp=g.val*1e9/(ITEP.pop*1e6);return `Your guess was <b>$${f1(g.v)}B ${g.val<FAIR.tax?'below the lowest':'above the highest'}</b> published estimate. Spread over ITEP’s 10.9 million people, $${f0(g.val)}B is about <b>${money(pp)} each</b>, against ITEP’s ${money(ppItep())} and FAIR’s ${money(ppFair())}.${g.val<FAIR.tax?' Even the estimate from the group that wants less immigration is far above zero.':''}`;}
   if(c==='aid'){const b=sim.p.bill,gb=b*g.val/100,mb=b*aidPct()/100;if(g.v<0.15)return `Your gut was right on: about 65 cents of every $100. On a ${money(b)} tax bill that is about ${money(mb)}.`;
    return `You guessed <b>$${f1(g.val)}</b> of every $100; the real figure is <b>$${f2(aidPct())}</b>. On a ${money(b)} family tax bill, your guess implies ${money(gb)} going to international affairs. The real share is about <b>${money(mb)}</b>: you were ${g.val>aidPct()?'about '+Math.round(g.val/aidPct())+' times too high':'too low'}.`;}
   if(c==='food'){if(g.v<1.5)return `Your gut was right on: about 29 pounds of every 100. Nationwide, that is 70 million tons a year.`;
    return `Out of every 100 pounds of food, you guessed <b>${f0(g.val)} lb</b> goes unsold or uneaten. ReFED measured <b>29 lb</b>: ${g.val<29?f0(29-g.val)+' lb more than you thought':f0(g.val-29)+' lb less than you thought'}. Nationwide that is 70 million tons in 2024, and most of it is ordinary waste, not a price policy.`;}
   const gk=Math.round(10*g.val),mk=Math.round(10*CTC.y22);if(g.v<0.5)return `Your gut was right on: about ${mk} children per 1,000 in poverty in 2022, up from 52 in 2021.`;
   return `Per 1,000 children, your guess means <b>${gk}</b> in poverty in 2022. The measured rate means <b>${mk}</b>, up from 52 in 2021. You were off by about ${Math.abs(mk-gk)} children per 1,000.${g.val<CTC.y22?' Many people expect a small change; the rate more than doubled.':''}`;},
  again(sim){const i=CARDS.indexOf(cur(sim)),n=CARDS[(i+1)%4];sim.p.card=n;const ct=sim.def.controls.find(x=>x.id===GID[n]);sim.p[GID[n]]=ct.def;if(sim.st&&sim.st.rev)sim.st.rev[n]=false;syncVis(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,card:'tax',q:'ITEP, which leans left, and FAIR, which advocates lower immigration, both estimated the taxes undocumented immigrants pay. What do their estimates agree on?',choices:['They pay almost nothing','They pay tens of billions of dollars a year','They pay more in taxes than they cost'],correct:1,explain:'ITEP: $96.7B in 2022. FAIR: $31B. They disagree about the net (FAIR finds a net cost of $150.7B), but both are far above zero.'},
  {lvl:'bio',instant:true,card:'aid',q:'About how much of every $100 the federal government spent in fiscal year 2026 went to international affairs, which includes all foreign aid?',choices:['About 65 cents','About $5','About $25'],correct:0,explain:'$48.0B ÷ $7,395.8B = 0.65%. That is 65 cents of every $100, and it also covers diplomacy and embassies, not only aid.'},
  {lvl:'bio',instant:true,card:'food',q:'In spring 2020, some dairy farmers dumped milk. Why?',choices:['A federal program paid them to destroy it to raise prices','Schools and restaurants closed, and the supply chain could not reroute the milk fast enough','Milk had spoiled because of a heat wave'],correct:1,explain:'It was a supply-chain breakdown, not a price policy. Milk bound for school cafeterias and restaurants suddenly had nowhere to go.'},
  {lvl:'honors',instant:true,card:'tax',q:'FAIR counts 15.5 million people and $31B in taxes. ITEP counts 10.9 million and $96.7B. Is the gap mostly about how many people each counts?',choices:['Yes: FAIR counts more people','No: per person, FAIR finds about $2,000 and ITEP about $8,872, so the method matters more','They agree once you adjust for headcount'],correct:1,explain:'$31B ÷ 15.5 million = $2,000. $96.7B ÷ 10.9 million ≈ $8,872. At ITEP’s rate, 15.5 million people would pay about $137.5B, so a bigger headcount would make the gap wider, not close it.'},
  {lvl:'honors',instant:true,card:'ctc',q:'Child poverty (SPM) went from 5.2% in 2021 to 12.4% in 2022. What does that comparison show by itself?',choices:['That the expansion was worth its cost','That child poverty more than doubled when the expansion ended, which fits the claim it cut poverty; whether it was worth the cost is still a value question','Nothing, because poverty is impossible to measure'],correct:1,explain:'The jump is 7.2 points, about 72 more children per 1,000. Other pandemic aid also wound down in 2022, so not all of it is the credit. Worth the cost? That weighs dollars, work and children’s needs: a value judgment.'},
  {lvl:'honors',instant:true,card:'food',q:'GAO found the sugar program keeps U.S. sugar prices about twice world prices. Does that make “the government destroys food to keep prices up” true today?',choices:['Yes, it destroys sugar','No: it keeps prices up without destroying food, costing consumers an estimated $2.5B to $3.5B a year','No: it lowers sugar prices'],correct:1,explain:'Raising prices and destroying food are different claims. The sugar program fits the first, not the second.'},
  {lvl:'ap',instant:true,card:'tax',q:'The National Academies found the 2013 net cost of all first-generation immigrants ranged from about $279B (average share of public goods) to about $43B (marginal cost only). About how many times larger is the high end?',choices:['About 2.5 times','About 6.5 times','About 65 times'],correct:1,explain:'279 ÷ 43 ≈ 6.5. One accounting choice, how to charge for things like defense, moves the answer more than six-fold. The same study found the second generation among the strongest fiscal contributors.'},
  {lvl:'ap',instant:true,card:'ctc',q:'Simulations predict about 410,000 to 1.5 million parents leaving work. Some studies of actual 2021 employment found no significant drop. What is the strongest reason the two can differ?',choices:['Simulations are always wrong','The 2021 expansion was temporary and short, so measured effects may not show what a permanent credit would do, while simulations rest on assumed responses to incentives','The studies counted adults without children'],correct:1,explain:'Both sides have a fair point. Measured data show what happened in one unusual year. Simulations project a permanent policy but depend on assumptions. The high simulation is about 3.7 times the low one.'},
  {lvl:'ap',instant:true,card:'tax',q:'ITEP estimates $25.7B to Social Security and $6.4B to Medicare, out of $96.7B in total taxes. What share of the total is that?',choices:['About 13%','About 33%','About 61%'],correct:1,explain:'(25.7 + 6.4) ÷ 96.7 = 32.1 ÷ 96.7 ≈ 33%. The 61% figure is ITEP’s federal share: $59.4B of $96.7B.'}
 ],
 tour:[
  {title:'The claim',text:'Each card starts with a common claim. This one is a number: $0 in taxes. A number can be checked.',focus:[0,0,800,80],pause:true,setup:sim=>BioLab.setValues(sim,{card:'tax',pop:10.9,kids:true,pg:'avg'})},
  {title:'Two estimates, two sides',text:'ITEP, which leans left, estimates $96.7B in 2022: $59.4B federal and $37.3B state and local. FAIR, which advocates lower immigration, estimates $31B. Both are far above $0, so “no taxes” is false.',focus:[0,80,800,150],pause:true},
  {lvl:'honors',title:'Headcount or method?',text:'FAIR counts more people, 15.5 million. Set the population to 15.5 million: at ITEP’s rate of about $8,872 each, the total would be $137.5B. A bigger headcount widens the gap. The two groups differ mainly in method.',focus:[0,80,800,150],pause:true,setup:sim=>BioLab.setValues(sim,{pop:15.5})},
  {title:'Taxes paid is not the net',text:'FAIR also counts costs, including school for U.S.-born children: $182B in costs minus $31B in taxes leaves a net cost of $150.7B. That is a different question from “no taxes.”',focus:[0,228,800,150],pause:true,setup:sim=>BioLab.setValues(sim,{pop:10.9})},
  {title:'What you count changes the answer',text:'The National Academies studied all first-generation immigrants, legal and not. Charge them an average share of things like defense and the 2013 net cost is about $279B. Count only the added cost and it is about $43B. Their children, the second generation, were among the strongest fiscal contributors.',focus:[0,228,800,150],pause:true},
  {title:'Federal or state?',text:'CBO found the 2021–2026 immigration surge adds $1.2T in federal revenue and lowers federal deficits about $0.9T over 2024–2034, while raising state and local costs. Which budget you look at matters.',focus:[0,370,800,80],pause:true},
  {title:'The bishops and the math',text:'The U.S. bishops affirm that nations may regulate their borders and oppose “indiscriminate mass deportation.” That is a moral claim. Apply the same test to it as to every claim: the math checks facts, and it cannot settle what we owe people. Three more claims wait in the full lab.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Which of these four claims are factual claims you can check, and which are value claims?</p><ol><li>For each card, set your guess and lock it in before you look.</li><li>Record your guess, the published number and the verdict.</li><li>Mark each claim: checkable fact, value judgment or both.</li></ol><p>Write one sentence for each: what would change your mind?</p>',
  honors:'<p><b>Question:</b> How much do assumptions move the answer?</p><ol><li>On the taxes card, compare per-person taxes for ITEP and FAIR. Then switch public goods between average and marginal.</li><li>On the Child Tax Credit card, switch the evidence between simulations and actual 2021 jobs.</li><li>List each assumption and which side it helps.</li></ol>',
  ap:'<p><b>Question:</b> Pick one claim and write the strongest case for each side using only numbers from this tool.</p><ol><li>Name each source and what it counts.</li><li>Compute one ratio or per-person figure that a reader would not see in a headline.</li></ol><p><b>CER:</b> Claim, evidence, and reasoning that separates what the math settles from what it cannot.</p>'},
 terms:[
  {t:'Net fiscal impact',d:'Taxes a group pays minus the cost of government services it uses. It depends on which taxes and costs you count.'},
  {t:'Federal outlays',d:'Money the federal government actually spends in a fiscal year. Fiscal year 2026 ran from October 2025 to September 2026.'},
  {t:'Supplemental Poverty Measure (SPM)',d:'A Census Bureau poverty measure that counts tax credits and benefits like SNAP as income, so it can show the effect of programs.'},
  {t:'Public goods',d:'Things government provides to everyone at once, like national defense. One more resident barely changes their cost.',lvl:'honors'},
  {t:'Average vs. marginal cost',d:'Average cost splits the total evenly among everyone. Marginal cost counts only what one more person adds.',lvl:'honors'},
  {t:'Refundable credit',d:'A tax credit paid even to families who owe little or no income tax. The 2021 Child Tax Credit was fully refundable.',lvl:'honors'},
  {t:'Simulation vs. observational study',d:'A simulation predicts behavior from assumptions. An observational study measures what actually happened. They can disagree for good reasons.',lvl:'ap'}
 ],
 about:'<p><b>How each card works.</b> You guess one number, then compare it with the published estimate. For taxes, two sources disagree, so any guess from $31B to $96.7B counts as on target. The tool computes per-person rates, shares and ratios from the figures below. It does not invent a net figure for combinations of assumptions no source has published.</p>'+
  '<p><b>Taxes.</b> ITEP (2024 report; ITEP leans left): $96.7B in federal, state and local taxes in 2022 ($59.4B federal, $37.3B state and local; $25.7B to Social Security, $6.4B to Medicare), about $427M in Colorado, 10.9 million people (itep.org/undocumented-immigrants-taxes-2024/). FAIR (2023 report; FAIR advocates lower immigration): gross cost $182B, taxes $31B, net cost $150.7B, counting U.S.-born children’s costs, 15.5 million people. National Academies of Sciences (2016–17): for all first-generation immigrants, net cost mainly to state and local governments through children’s education; the second generation among the strongest fiscal contributors; 2013 first-generation net cost about $279B to $43B under different public-goods assumptions. CBO (2024): the 2021–2026 surge adds $1.2T in federal revenue and lowers deficits about $0.9T over 2024–2034, but raises state and local costs (cbo.gov/publication/60165). USCCB Special Message, Nov 12, 2025.</p>'+
  '<p><b>Foreign aid.</b> International affairs $48.0B of $7,395.8B in FY2026 outlays (Treasury Monthly Treasury Statement). It includes diplomacy as well as aid. The family tax bill slider is for illustration only: taxes are not earmarked line by line, and the government also borrows.</p>'+
  '<p><b>Food.</b> Agricultural Adjustment Act, 1933: about 6 million young pigs slaughtered and about 10 million acres of cotton plowed under (historical, approximate). GAO-24-106144: U.S. sugar about twice world prices in 2022, costing consumers an estimated $2.5B to $3.5B a year. USDA Section 32 buys surplus food and donates it to food banks and school meals. Spring 2020 milk dumping: a supply-chain breakdown when schools and restaurants closed. ReFED (2026 report, 2024 data): 70 million tons of surplus food, 29% of the food supply.</p>'+
  '<p><b>Child Tax Credit.</b> SPM child poverty 5.2% in 2021 and 12.4% in 2022 (Columbia Center on Poverty and Social Policy, citing Census). Simulated parents leaving work: about 410,000 (Niskanen Center) to about 1.5 million (Corinth, Meyer, Stadnicki and Wu, NBER). Some studies of actual 2021 employment found no significant drop. The USCCB asked for a credit that reaches the poorest families.</p>'+
  '<p>This is a simplified teaching tool, not financial or legal advice. No political party is named on purpose: every claim here is made by people across the spectrum, and each card names programs, laws and sources instead.</p>'
};

/* ---------- drawing ---------- */
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.25,L=lines.slice(0,o.max||99);L.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return L.length*lh;}
function hbar(ctx,X,y,v,h,col,a){ctx.globalAlpha=a===undefined?1:a;ctx.fillStyle=col;rr(ctx,X(0),y-h/2,Math.max(2,X(v)-X(0)),h,4);ctx.fill();ctx.globalAlpha=1;}
function vlab(ctx,X,y,v,s,k,col,end){ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(s).width;const x=X(v)+8;if(x+w<(end||792))txt(ctx,s,x,y,{s:12*k,w:700,c:col||PAL['cv-ink'],b:'middle'});else txt(ctx,s,X(v)-8,y,{s:12*k,w:700,c:'#fff',a:'right',b:'middle'});}
function ticks(ctx,X,y,vals,k,fmt){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;vals.forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),y+4);ctx.lineTo(X(v),y+12);ctx.stroke();txt(ctx,fmt(v),X(v),y,{s:12*k,c:PAL['cv-soft'],a:'center',b:'bottom'});});}
function hidden(ctx,x,y,w,k,msg){ctx.font=(13*k)+'px '+FONT;const mw=ctx.measureText(msg).width+24;ctx.fillStyle=PAL['card'];rr(ctx,x+w/2-mw/2,y-14*k,mw,26*k,8);ctx.fill();txt(ctx,msg,x+w/2,y,{s:13*k,c:PAL['cv-soft'],a:'center',b:'middle'});}

function drawTax(sim,ctx,k,top,sh){const p=sim.p,g=guessOf(sim),hon=atLeast('honors');
 const LX=230,RX=740,X=v=>LX+v/150*(RX-LX),X2=v=>LX+v/300*(RX-LX);
 const rh=Math.max(28,18*k),bh=Math.min(20,rh-10);
 let y=top+14;txt(ctx,'Taxes paid in one year ($ billions)',20,y,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
 y+=16*k+8;ticks(ctx,X,y,[0,50,100,150],k,v=>'$'+v+'B');
 const r1=y+rh*0.75,r2=r1+rh,r3=r2+rh;
 /* the claim line at $0 */
 ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(0),y+6);ctx.lineTo(X(0),r3+bh/2+2);ctx.stroke();ctx.setLineDash([]);
 const lab=(s,yy,c)=>txt(ctx,s,LX-10,yy,{s:12*k,w:700,c:c||PAL['cv-ink'],a:'right',b:'middle'});
 lab('Your guess',r1,PAL['s4']);hbar(ctx,X,r1,clamp(g,0,150),bh,PAL['s4'],0.85);vlab(ctx,X,r1,clamp(g,0,150),'$'+f0(g)+'B',k,PAL['s4']);
 lab('ITEP',r2);lab('FAIR',r3);
 if(!sh){hidden(ctx,LX,(r2+r3)/2,RX-LX,k,'Lock in your guess to see the estimates');}
 else{hbar(ctx,X,r2,ITEP.fed,bh,PAL['s2']);ctx.fillStyle=PAL['s6'];rr(ctx,X(ITEP.fed),r2-bh/2,X(ITEP.tot)-X(ITEP.fed),bh,4);ctx.fill();
  if(k<1.3){txt(ctx,'federal',(X(0)+X(ITEP.fed))/2,r2,{s:12,w:700,c:'#fff',a:'center',b:'middle'});txt(ctx,'state, local',(X(ITEP.fed)+X(ITEP.tot))/2,r2,{s:12,w:700,c:'#fff',a:'center',b:'middle'});}
  vlab(ctx,X,r2,ITEP.tot,'$96.7B',k);hbar(ctx,X,r3,FAIR.tax,bh,PAL['s5']);vlab(ctx,X,r3,FAIR.tax,'$31B',k);
  if(hon&&Math.abs(p.pop-ITEP.pop)>0.05){const v=ppItep()*p.pop/1e3;ctx.strokeStyle=PAL['s2'];ctx.setLineDash([4,3]);ctx.lineWidth=2;ctx.strokeRect(X(0),r2-bh/2,Math.min(X(v),RX)-X(0),bh);ctx.setLineDash([]);}
  if(hon&&Math.abs(p.pop-FAIR.pop)>0.05){const v=ppFair()*p.pop/1e3;ctx.strokeStyle=PAL['s5'];ctx.setLineDash([4,3]);ctx.lineWidth=2;ctx.strokeRect(X(0),r3-bh/2,X(v)-X(0),bh);ctx.setLineDash([]);}}
 /* net cost panel */
 y=r3+bh/2+16+8*k;txt(ctx,'Net cost to governments in one year ($ billions)',20,y,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
 y+=16*k+8;ticks(ctx,X2,y,[0,100,200,300],k,v=>'$'+v+'B');
 const n1=y+rh*0.75,n2=n1+rh,n3=n2+rh;
 txt(ctx,'FAIR',LX-10,n1,{s:12*k,w:700,a:'right',b:'middle'});txt(ctx,hon?'NAS average':'NAS high',LX-10,n2,{s:12*k,w:700,a:'right',b:'middle'});txt(ctx,hon?'NAS marginal':'NAS low',LX-10,n3,{s:12*k,w:700,a:'right',b:'middle'});
 if(sh){const dim=p.kids?1:0.3;
  hbar(ctx,X2,n1,FAIR.net,bh,PAL['s5'],dim);vlab(ctx,X2,n1,FAIR.net,'$150.7B',k);
  const hiA=!hon||p.pg==='avg',loA=!hon||p.pg==='marg';
  hbar(ctx,X2,n2,NAS.avg,bh,PAL['s1'],dim*(hiA?1:0.3));vlab(ctx,X2,n2,NAS.avg,'$279B',k);
  hbar(ctx,X2,n3,NAS.marg,bh,PAL['s1'],dim*(loA?1:0.3));vlab(ctx,X2,n3,NAS.marg,'$43B',k);
  const ny=n3+bh/2+10+6*k;if(ny+2*15*k<452)wrap(ctx,p.kids?'NAS counts all first-generation immigrants (2013). CBO: the 2021–2026 surge lowers federal deficits about $0.9T over 2024–2034.':'Every cost estimate here counts children’s school costs. Leave them out and the net falls, but no source here publishes that number.',20,ny+6*k,760,{s:12*k,c:PAL['cv-soft'],max:2,b:'middle'});}
 else hidden(ctx,LX,n2,RX-LX,k,'Hidden until you guess');}

function drawAid(sim,ctx,k,top,sh){const p=sim.p,g=clamp(guessOf(sim),0,100),pct=aidPct();
 const n=10,gap=3,avail=Math.min(450-top-24,340),cell=(avail-gap*(n-1))/n,x0=30,y0=top+22;
 txt(ctx,'Every $100 of federal spending',x0,y0-10,{s:13*k,w:700,c:PAL['cv-soft']});
 for(let i=0;i<100;i++){const cx=x0+(i%n)*(cell+gap),cy=y0+Math.floor(i/n)*(cell+gap);ctx.fillStyle=PAL['cv-bg2'];rr(ctx,cx,cy,cell,cell,3);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
  const f=clamp(g-i,0,1);if(f>0){ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.55;ctx.fillRect(cx,cy,cell*f,cell);ctx.globalAlpha=1;}}
 if(sh){ctx.fillStyle=PAL['s1'];ctx.fillRect(x0,y0,cell*pct,cell);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.strokeRect(x0,y0,cell,cell);}
 const gx=x0+n*(cell+gap)+30,w=780-gx;let y=y0+6;
 txt(ctx,'Your guess',gx,y,{s:12*k,w:700,c:PAL['s4'],b:'top'});y+=16*k;
 txt(ctx,'$'+f1(g)+' of every $100',gx,y,{s:Math.max(18,14*k),w:700,c:PAL['s4'],b:'top'});y+=Math.max(18,14*k)+14;
 if(!sh){hidden(ctx,gx,y+40*k,w,k,'Lock in to see the real share');return;}
 txt(ctx,'International affairs, FY2026',gx,y,{s:12*k,w:700,c:PAL['s1'],b:'top'});y+=16*k;
 txt(ctx,'$'+f2(pct)+' of every $100',gx,y,{s:Math.max(18,14*k),w:700,c:PAL['s1'],b:'top'});y+=Math.max(18,14*k)+10;
 y+=wrap(ctx,'$48.0B of $7,395.8B. The red sliver in the first square is its size.',gx,y,w,{s:12*k,c:PAL['cv-soft'],b:'top',max:3})+8;
 if(y<420)wrap(ctx,'On a '+money(p.bill)+' tax bill: about '+money(p.bill*pct/100)+'.',gx,y,w,{s:12*k,w:700,b:'top',max:2});}

function drawFood(sim,ctx,k,top,sh){const p=sim.p,g=clamp(guessOf(sim),0,100);
 const L=20,R=780,X=v=>L+v/100*(R-L),by=top+18+14*k,bh=24;
 txt(ctx,'All U.S. food in a year',L,by-bh/2-8,{s:13*k,w:700,c:PAL['cv-soft']});
 ctx.fillStyle=PAL['card2'];rr(ctx,L,by-bh/2,R-L,bh,6);ctx.fill();
 if(sh){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.9;rr(ctx,L,by-bh/2,X(FOOD.pct)-L,bh,6);ctx.fill();ctx.globalAlpha=1;txt(ctx,'29% unsold or uneaten',X(FOOD.pct)+8,by,{s:12*k,w:700,b:'middle'});}
 ctx.strokeStyle=PAL['s4'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(X(g),by-bh/2-4);ctx.lineTo(X(g),by+bh/2+4);ctx.stroke();
 const gl='Your guess: '+f0(g)+'%';ctx.font='700 '+(12*k)+'px '+FONT;const gw=ctx.measureText(gl).width;txt(ctx,gl,clamp(X(g)-gw/2,L,R-gw),by+bh/2+8,{s:12*k,w:700,c:PAL['s4'],b:'top'});
 const EV=[
  {t:'1933: Agricultural Adjustment Act',b:'About 6M young pigs slaughtered, about 10M acres of cotton plowed under',d:1,pr:1,era:'1933'},
  {t:'Sugar program',b:'U.S. sugar about 2× world price (2022): $2.5–3.5B a year to consumers',d:0,pr:1,era:'today'},
  {t:'USDA Section 32',b:'Buys surplus food and donates it to food banks and school meals',d:0,pr:0,t2:'Food given away: yes',era:'today'},
  {t:'Spring 2020 milk dumping',b:'Schools and restaurants closed, supply chains broke: not a price policy',d:1,pr:0,era:'today'}];
 const gy=by+bh/2+16+16*k,ch=(445-gy-10)/2,cw=370;
 EV.forEach((e,i)=>{const cx=20+(i%2)*(cw+20),cy=gy+Math.floor(i/2)*(ch+10);
  const match=p.era===e.era&&(p.counts==='destroy'?(e.d&&e.pr):e.pr),on=!sh||match;
  ctx.globalAlpha=sh?(p.era===e.era?1:0.4):1;ctx.fillStyle=PAL['card'];rr(ctx,cx,cy,cw,ch,10);ctx.fill();
  ctx.strokeStyle=sh&&match?PAL['s1']:PAL['line'];ctx.lineWidth=sh&&match?3:1;rr(ctx,cx,cy,cw,ch,10);ctx.stroke();
  let yy=cy+10;yy+=wrap(ctx,e.t,cx+12,yy,cw-24,{s:12*k,w:700,b:'top',max:2});
  if(!sh){txt(ctx,'?',cx+cw/2,cy+ch/2+8*k,{s:20*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});ctx.globalAlpha=1;return;}
  const t1='Destroys food: '+(e.d?'yes':'no'),t2=e.t2||('Prices up: '+(e.pr?'yes':'no'));ctx.font='700 '+(12*k)+'px '+FONT;
  const one=ctx.measureText(t1+'   '+t2).width<=cw-24,lh=12*k*1.25,tagTop=cy+ch-10-(one?1:2)*lh;
  const nb=Math.floor((tagTop-yy-4)/lh);if(nb>0)wrap(ctx,e.b,cx+12,yy+2,cw-24,{s:12*k,c:PAL['cv-soft'],b:'top',max:nb});
  const tc=match?PAL['s1']:PAL['cv-soft'];if(one)txt(ctx,t1+'   '+t2,cx+12,cy+ch-10,{s:12*k,w:700,c:tc,b:'bottom'});else{txt(ctx,t1,cx+12,cy+ch-10-lh,{s:12*k,w:700,c:tc,b:'bottom'});txt(ctx,t2,cx+12,cy+ch-10,{s:12*k,w:700,c:tc,b:'bottom'});}
  ctx.globalAlpha=1;});}

function drawCtc(sim,ctx,k,top,sh){const p=sim.p,g=clamp(guessOf(sim),0,25);
 const L=70,R=360,T=top+34,B=410,Y=v=>B-v/16*(B-T);
 txt(ctx,'Child poverty (SPM)',20,top+16,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,5,10,15].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();txt(ctx,v+'%',L-8,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
 const yrs=[['2021',CTC.y21],['2022',CTC.y22],['2023',CTC.y23]],bw=(R-L)/3;
 yrs.forEach(([lab,v],i)=>{const cx=L+bw*i+bw/2;txt(ctx,lab,cx,B+6,{s:12*k,w:700,a:'center',b:'top'});
  const known=i===0||sh;if(known){ctx.fillStyle=i===0?PAL['s3']:PAL['s1'];rr(ctx,cx-bw*0.3,Y(v),bw*0.6,B-Y(v),4);ctx.fill();txt(ctx,f1(v)+'%',cx,Y(v)-6,{s:12*k,w:700,a:'center',b:'bottom'});}
  else{ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,4]);rr(ctx,cx-bw*0.3,Y(4),bw*0.6,B-Y(4),4);ctx.stroke();ctx.setLineDash([]);txt(ctx,'?',cx,Y(2),{s:16*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});}});
 const gx=L+bw*1.5,gy=Y(Math.min(g,16));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx-bw*0.42,gy);ctx.lineTo(gx+bw*0.42,gy);ctx.stroke();
 const below=sh&&g>10.5&&g<14.5;ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText('Your guess').width+8;const ly=below?gy+4:gy-4-14*k;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(gx-lw/2,ly,lw,14*k);ctx.globalAlpha=1;txt(ctx,'Your guess',gx,ly+7*k,{s:12*k,w:700,c:PAL['s4'],a:'center',b:'middle'});
 /* work effects */
 const WL=420,WR=760,WX=v=>WL+v/1.6e6*(WR-WL);let y=top+16;
 txt(ctx,'Did parents leave work?',WL-10,y,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
 if(!sh){hidden(ctx,WL-10,y+90,WR-WL+20,k,'Hidden until you guess');return;}
 y+=24+8*k;ticks(ctx,WX,y,[0,500000,1000000,1500000],k,v=>v?(v/1e6)+'M':'0');
 const sy=y+24+6*k,simOn=p.evid==='sims';
 ctx.globalAlpha=simOn?1:0.35;ctx.fillStyle=PAL['s5'];ctx.globalAlpha*=.3;ctx.fillRect(WX(CTC.lo),sy-8,WX(CTC.hi)-WX(CTC.lo),16);ctx.globalAlpha=simOn?1:0.35;
 [[CTC.lo,'410,000'],[CTC.hi,'1.5M']].forEach(([v,l])=>{ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(WX(v),sy,7,0,7);ctx.fill();});
 txt(ctx,'Simulations: 410,000 to 1.5M',WL-10,sy+16+4*k,{s:12*k,w:700,c:PAL['s5'],b:'top'});ctx.globalAlpha=1;
 const ay=sy+50+24*k;ctx.globalAlpha=simOn?0.35:1;ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(WX(0),ay,7,0,7);ctx.fill();
 wrap(ctx,'Some studies of actual 2021 jobs: no significant drop',WL-10,ay+14+4*k,WR-WL+30,{s:12*k,w:700,c:PAL['s3'],b:'top',max:2});ctx.globalAlpha=1;
 const ny=ay+30+40*k;if(ny<440)wrap(ctx,'Monthly payments ran July to December 2021.',WL-10,ny,WR-WL+30,{s:12*k,c:PAL['cv-soft'],b:'top',max:2});}

BioLab.register(SIM);
})();
