(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Two claims heard from different directions in the immigration debate, checked with one method:
   divide a published total by the number of people it covers (rate = total ÷ people), and compare rates, not totals.
   Every total is a published estimate (see About). The tool computes the per-person rates, ratios and shares. */
const ITEP={tax:96.7,pop:10.9,fed:59.4,sl:37.3,ss:25.7,med:6.4,co:427};   /* $B, million people; co in $M */
const FAIR={cost:182,tax:31,net:150.7,pop:15.5};                          /* $B, million people */
const NAS={avg:279,marg:43};                                              /* $B, 2013, all first-generation immigrants */
const CBO={rev:1.2,def:0.9,yrs:11};                                       /* $T over fiscal years 2024 to 2034 */
const rate=(tot,pop)=>tot*1e9/(pop*1e6);
const ppI=()=>rate(ITEP.tax,ITEP.pop),ppF=()=>rate(FAIR.tax,FAIR.pop),cpF=()=>rate(FAIR.cost,FAIR.pop);
const CLAIM={none:'“Undocumented immigrants pay no taxes.”',more:'“Undocumented immigrants pay more in taxes than they cost.”'};
const MAXV=15000;
let REF=null;
/* the case the student computes: taxes per person from the chosen estimate, or FAIR's costs per person */
function cs(sim){const p=sim.p;if(p.claim==='more')return {id:'fair_c',who:'FAIR',what:'costs',tot:FAIR.cost,pop:FAIR.pop,v:cpF()};
 return p.src==='itep'?{id:'itep_t',who:'ITEP',what:'taxes',tot:ITEP.tax,pop:ITEP.pop,v:ppI()}:{id:'fair_t',who:'FAIR',what:'taxes',tot:FAIR.tax,pop:FAIR.pop,v:ppF()};}
const taxPP=sim=>sim.p.src==='itep'?ppI():ppF(),taxWho=sim=>sim.p.src==='itep'?'ITEP':'FAIR';
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
function shown(sim){if(BioLab.stepFlag&&BioLab.stepFlag(sim,'hide'))return false;if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
/* The first Big-picture challenge asks for FAIR's costs per person. Until it is answered, that one rate stays hidden,
   unless the student already worked it out as their own "Your turn" case, or asked to see the rates. */
const curCh=sim=>{if(!sim.ch)return null;const L=(sim.def.challenges||[]).filter(c=>atLeast(c.lvl||'bio'));return L[sim.ch.idx]||null;};
function hideCost(sim){if((sim.tour&&sim.tour.on)||sim.p.reveal)return false;const c=curCh(sim);if(!(c&&c.hide&&sim.ch.phase!=='done'))return false;const S=sim.gutS;return !(S&&S.g&&S.g.claim==='more'&&!pend(sim));}
const costOK=sim=>shown(sim)&&!hideCost(sim);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
const $=v=>'$'+f0(v);
const bil=v=>'$'+(Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)):f1(v))+'B';
const mil=v=>(Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)):f1(v))+' million';
function clearGut(sim){const S=sim.gutS;if(S&&!(sim.guide&&sim.guide.keep)&&(S.g||S.m)){S.g=null;S.m=null;if(sim.ui)sim.ui.calc=null;if(BioLab.gutRender)BioLab.gutRender(sim);}sim.infoDirty=true;}
const divLine=c=>`${bil(c.tot)} ÷ ${mil(c.pop)} people = ${$(c.v)} a year`;

const SIM={
 id:'claims',hash:'claims',apUnit:3,order:1,tab:'Does the math hold up?',kind:'Learning tool',next:['budget','whatmoved'],
 skills:{bio:'Per-person rates: total ÷ people, with the right denominator · Algebra 1 (Unit 2: proportions), US Government (Unit 3: media and sourcing)',
  honors:'Rates and rate × people: is a gap the headcount or the method? · Algebra 1 (Unit 2), US Government (Unit 3)',
  ap:'Rates, ratios and shares from published estimates · Algebra 1 (Unit 2), Statistics (Chapter 1), AP Macroeconomics (Unit 5)'},
 card:'Two claims heard from different sides of the immigration debate, one method: divide each published total by the people it covers, then check the claim.',
 title:'Does the math hold up?',
 lede:{bio:'A total in billions sounds huge or tiny until you divide it by the people it covers. Work out the per-person rate from published totals, then check the claim against it.',
  honors:'Two estimates can disagree because they count different numbers of people or because they use different methods. Per-person rates tell the two apart: the same rate times more people gives a bigger total.',
  ap:'Rate = total ÷ people, and total = rate × people. Use both to test whether a headcount or a method explains a gap, and check that the top and bottom of each fraction count the same people.'},
 scale:'Dollars per person for one year. ITEP: 2022 taxes. FAIR: 2023 report. B = billion.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'The claim',
 controls:[
  {id:'guess',label:'Your gut: dollars per person, per year',type:'range',min:0,max:MAXV,step:100,def:0,unit:' dollars'},
  {id:'claim',label:'Claim to check',type:'seg',def:'none',noGut:true,onChange:clearGut,options:[{v:'none',l:'“No taxes”'},{v:'more',l:'“More than they cost”'}]},
  {id:'src',label:'Tax estimate to use',type:'seg',def:'fair',noGut:true,onChange:clearGut,options:[{v:'fair',l:'FAIR: $31B, 15.5M people'},{v:'itep',l:'ITEP: $96.7B, 10.9M people'}],help:'FAIR advocates lower immigration. ITEP is a tax research group that leans left. Each publishes a total and a headcount.'},
  {id:'pop',label:'Headcount to apply ITEP’s rate to',type:'range',min:10,max:16,step:0.1,def:15.5,unit:' million',d:1,lvl:'honors',noGut:true,help:'ITEP counts 10.9 million people. FAIR counts 15.5 million.'},
  {id:'reveal',label:'Show the per-person rates now',type:'toggle',def:false,noGut:true,help:'Normally the rates appear once you lock in your gut and work it out.'}
 ],
 actions:[{id:'swap',label:'Check the other claim',run(sim){BioLab.setValues(sim,{claim:sim.p.claim==='none'?'more':'none'});}}],
 init(sim){REF=sim;return {};},step(){},
 onChallenge(sim,ch,phase){if(ch&&phase==='ask'&&ch.card&&sim.p.claim!==ch.card)BioLab.setValues(sim,{claim:ch.card});sim.infoDirty=true;},
 metrics:[
  {id:'ppF',label:'FAIR: taxes per person',unit:'$ a year',d:0,min:0,max:MAXV,get:sim=>shown(sim)?ppF():null},
  {id:'ppI',label:'ITEP: taxes per person',unit:'$ a year',d:0,min:0,max:MAXV,get:sim=>shown(sim)?ppI():null},
  {id:'cpF',label:'FAIR: costs per person',unit:'$ a year',d:0,min:0,max:MAXV,get:sim=>costOK(sim)?cpF():null},
  {id:'off',label:'Your gut is off by',unit:'$ a year',d:0,min:0,max:MAXV,get:sim=>{if(!shown(sim)||!costOK(sim)&&sim.p.claim==='more')return null;const S=sim.gutS;if(S&&S.g&&S.g.claim!==sim.p.claim)return null;const g=S&&S.g?S.g.guess:sim.p.guess;return Math.abs(g-cs(sim).v);}},
  {id:'atpop',label:'ITEP’s rate × your headcount',unit:'$B',d:1,lvl:'honors',min:0,max:150,get:sim=>shown(sim)?ppI()*sim.p.pop*1e6/1e9:null},
  {id:'ratio',label:'ITEP’s rate ÷ FAIR’s rate',unit:'×',d:1,lvl:'ap',min:0,max:10,get:sim=>shown(sim)?ppI()/ppF():null},
  {id:'ssm',label:'Share of ITEP’s total to Social Security and Medicare',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>shown(sim)?100*(ITEP.ss+ITEP.med)/ITEP.tax:null}
 ],
 draw(sim,ctx,vdt,k){const W=800,H=450,p=sim.p,sh=shown(sim),S=GS(sim),C=cs(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* the claim */
  ctx.font='700 '+(12*k)+'px '+FONT;const pt='A claim you might hear',pw=ctx.measureText(pt).width+14*k;pill(ctx,pt,20+pw/2,12+10*k,PAL['s2'],'#fff',12*k);
  const hs=Math.max(16,13*k),hh=wrap(ctx,CLAIM[p.claim],20,30+20*k+hs*0.5,760,{s:hs,w:700,max:2,b:'middle'});
  let y=30+20*k+hh+6*k;
  /* axis: dollars per person */
  const LX=big?190:200,RX=740,X=v=>LX+(RX-LX)*clamp(v,0,MAXV)/MAXV;
  txt(ctx,'Dollars per person, per year',20,y+7*k,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});y+=28*k+4;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,5000,10000,15000].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),y+2);ctx.lineTo(X(v),y+8);ctx.stroke();
   txt(ctx,v?'$'+(v/1000)+'k':'$0',X(v),y,{s:12*k,c:PAL['cv-soft'],a:v===0?'left':v===MAXV?'right':'center',b:'bottom'});});
  y+=10;
  const rows=[{id:'gut'}];if(p.claim==='more')rows.push({id:'fair_c',who:'FAIR',what:'costs',tot:FAIR.cost,pop:FAIR.pop,v:cpF(),col:PAL['s1']});
  rows.push({id:'fair_t',who:'FAIR',what:'taxes',tot:FAIR.tax,pop:FAIR.pop,v:ppF(),col:PAL['s5']},{id:'itep_t',who:'ITEP',what:'taxes',tot:ITEP.tax,pop:ITEP.pop,v:ppI(),col:PAL['s2']});
  const foot=atLeast('honors')?52*k:30*k,avail=H-y-foot-8,rh=avail/rows.length,bh=Math.min(22,rh*0.36);
  const gridTop=y,gridBot=y+rh*rows.length;
  /* the claim's benchmark */
  if(p.claim==='none'){ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(0),gridTop);ctx.lineTo(X(0),gridBot);ctx.stroke();ctx.setLineDash([]);}
  else if(sh&&costOK(sim)){ctx.strokeStyle=PAL['s1'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(cpF()),gridTop+rh);ctx.lineTo(X(cpF()),gridBot);ctx.stroke();ctx.setLineDash([]);}
  rows.forEach((r,i)=>{const yc=y+i*rh+bh/2+4,mine=r.id===C.id,sh=shown(sim)&&(r.id!=='fair_c'||costOK(sim));
   if(r.id==='gut'){const gv=S&&S.g?S.g.guess:p.guess;
    txt(ctx,'Your gut',LX-10,yc,{s:12*k,w:700,c:PAL['s4'],a:'right',b:'middle'});
    ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.85;rr(ctx,X(0),yc-bh/2,Math.max(3,X(gv)-X(0)),bh,4);ctx.fill();ctx.globalAlpha=1;
    vlab(ctx,X(gv),yc,$(gv),k,PAL['s4']);
    if(p.claim==='none')txt(ctx,'The claim: $0',X(0)+4,yc+bh/2+10*k,{s:12*k,w:700,c:PAL['cv-ink'],b:'middle'});
    return;}
   txt(ctx,(big?r.who+' '+r.what:r.who+': '+r.what),LX-10,yc,{s:12*k,w:700,c:mine?PAL['s4']:PAL['cv-ink'],a:'right',b:'middle'});
   if(sh){ctx.fillStyle=r.col;rr(ctx,X(0),yc-bh/2,Math.max(3,X(r.v)-X(0)),bh,4);ctx.fill();vlab(ctx,X(r.v),yc,$(r.v),k,PAL['cv-ink']);}
   else{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,X(0),yc-bh/2,RX-X(0),bh,4);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();
    txt(ctx,'?',(X(0)+RX)/2,yc,{s:13*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});}
   if(mine){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;rr(ctx,X(0)-3,yc-bh/2-3,RX-X(0)+6,bh+6,6);ctx.stroke();}
   /* the division, under the bar */
   const dl=sh?(big?`${bil(r.tot)} ÷ ${mil(r.pop)} = ${$(r.v)}`:divLine(r)):(big?`${bil(r.tot)} ÷ ${mil(r.pop)} = ?`:`${bil(r.tot)} ÷ ${mil(r.pop)} people = ?`);
   txt(ctx,dl,X(0)+6,yc+bh/2+10*k,{s:12*k,w:mine?700:400,c:mine?PAL['cv-ink']:PAL['cv-soft'],b:'middle'});
   if(sh&&BioLab.stepFlag(sim,'divring')){ctx.font=(mine?'700 ':'400 ')+(12*k)+'px '+FONT;const tw=ctx.measureText(dl).width;ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,X(0)+1,yc+bh/2+1,tw+12,18*k,5);ctx.stroke();}});
  /* footer: the formula */
  let fy=H-foot+12*k;
  if(sh&&p.claim==='more'&&!costOK(sim))txt(ctx,'Rate = total ÷ people. Work out FAIR’s costs per person in the question below.',20,fy,{s:13*k,w:700,c:PAL['cv-ink'],b:'middle'});
  else if(sh){const line=p.claim==='none'?`Rate = total ÷ people. Lowest estimate: ${$(ppF())} a person, not $0.`:(big?`Costs ${$(cpF())} vs. taxes ${$(taxPP(sim))} a person (${taxWho(sim)})`:`Rate = total ÷ people. FAIR’s costs, ${$(cpF())} a person, vs. ${taxWho(sim)}’s taxes, ${$(taxPP(sim))}.`);
   txt(ctx,line,20,fy,{s:13*k,w:700,c:PAL['cv-ink'],b:'middle'});
   if(atLeast('honors')){fy+=20*k;txt(ctx,`Total = rate × people: ${$(ppI())} × ${f1(p.pop)} million = ${bil(+(ppI()*p.pop/1e3).toFixed(1))}${big?'':' (ITEP’s rate)'}`,20,fy,{s:12*k,c:PAL['cv-soft'],b:'middle'});}}
  else txt(ctx,BioLab.stepFlag(sim,'hide')?'Two totals, two headcounts. Next step: divide each total by its own headcount.':S&&S.g?'Work out the rate to see the bars.':'Lock in your gut to see the rates.',20,fy,{s:13*k,c:PAL['cv-soft'],b:'middle'});},
 narrate(sim){const p=sim.p,C=cs(sim);
  if(!shown(sim)){if(p.claim==='none')return `The claim says <b>$0</b>. ${C.who} publishes a total of ${bil(C.tot)} in taxes and counts ${mil(C.pop)} people. <b>How many dollars is that per person?</b> Your gut right now: ${$(p.guess)}.`;
   return `To test this claim, put taxes and costs on the same footing: <b>dollars per person</b>. FAIR counts ${bil(FAIR.cost)} in costs for ${mil(FAIR.pop)} people. Your gut right now: ${$(p.guess)} a person.`;}
  if(p.claim==='none')return `Per person, FAIR’s estimate is <b>${$(ppF())}</b> a year and ITEP’s is <b>${$(ppI())}</b>. Both are far above the claim’s $0. The two totals differ by ${bil(ITEP.tax-FAIR.tax)}, and the rates show it is mostly method, not headcount.`;
  if(!costOK(sim))return `Same method for this claim: FAIR counts ${bil(FAIR.cost)} in costs for ${mil(FAIR.pop)} people. Work out the costs per person in the question below, then compare it with the tax rates: ${$(ppF())} and ${$(ppI())}.`;
  return `FAIR’s costs come to <b>${$(cpF())}</b> a person, above both tax rates (${$(ppF())} and ${$(ppI())}). Those costs include U.S.-born children’s schooling, and CBO finds the federal budget comes out ahead. <b>Which budget you divide matters.</b>`;},
 gut:{better:'lower',controls:['guess'],
  get ask(){const sim=REF,C=sim&&sim.p?cs(sim):{who:'FAIR',what:'taxes',tot:FAIR.tax,pop:FAIR.pop},T=bil(C.tot).replace('B',' billion');
   if(C.what==='costs')return {bio:`FAIR counts ${T} in costs for ${mil(C.pop)} undocumented immigrants. Drag the slider here to how many dollars of cost you think that is per person, per year. Go with your gut, then lock it in.`,
    honors:`Before you divide: drag the slider here to your gut guess of FAIR’s costs per person, per year, from ${T} for ${mil(C.pop)} people. Then lock it in.`};
   return {bio:`The claim says $0. ${C.who} counts ${T} in taxes from ${mil(C.pop)} people. Drag the slider here to how many dollars you think that is per person, per year. Go with your gut, then lock it in.`,
    honors:`Before you divide: drag the slider here to your gut guess of the taxes per person, per year, from ${C.who}’s total of ${T} for ${mil(C.pop)} people. Then lock it in.`};},
  hint:{bio:'Lock in your gut. Then you will work out the real rate yourself from the published total.'},
  lock(sim){const C=cs(sim);return {v:Math.abs(sim.p.guess-C.v),guess:sim.p.guess,claim:sim.p.claim,label:`${$(sim.p.guess)} a person`};},
  solve(sim){const C=cs(sim);sim.p.guess=Math.round(C.v);return {v:Math.abs(sim.p.guess-C.v),guess:C.v,claim:sim.p.claim,label:`${$(C.v)} a person (${C.who} ${C.what})`};},
  calc:{unit:'$',d:0,tol:a=>Math.max(20,0.01*a),
   prompt:{bio:sim=>{const C=cs(sim);return C.what==='costs'?`FAIR estimates governments spent <b>$182 billion</b> a year on undocumented immigrants and their U.S.-born children, and counts <b>15.5 million</b> undocumented immigrants. How many dollars of cost is that <b>per person, per year</b>?`:`${C.who} estimates undocumented immigrants paid <b>${bil(C.tot).replace('B',' billion')}</b> in taxes in a year, and counts <b>${mil(C.pop)}</b> people. How many dollars is that <b>per person, per year</b>?`;},
    ap:sim=>{const C=cs(sim);return `${C.who}: ${bil(C.tot).replace('B',' billion')} in ${C.what}, ${mil(C.pop)} people. Write both numbers in powers of ten and find the ${C.what} per person, per year.`;}},
   answer:sim=>cs(sim).v,
   hint:'Divide the total by the number of people. A billion ÷ a million = 1,000, so divide the two numbers you see, then multiply by 1,000.',
   steps(sim){const C=cs(sim),q=C.tot/C.pop,out=[];
    if(atLeast('ap'))out.push(`${bil(C.tot).replace('B',' billion')} = ${C.tot} × 10⁹ and ${mil(C.pop)} = ${C.pop} × 10⁶, so the rate is (${C.tot} ÷ ${C.pop}) × 10³.`);
    out.push(`Rate = total ÷ people = ${bil(C.tot)} ÷ ${mil(C.pop)}.`);
    out.push(`Billions ÷ millions = thousands: ${C.tot} ÷ ${C.pop} = ${q.toFixed(4)} thousand.`);
    out.push(`That is <b>${$(C.v)}</b> per person, per year.`);
    out.push(C.what==='costs'?`Compare it with taxes per person: ${$(ppF())} (FAIR) or ${$(ppI())} (ITEP). Both are lower.`:`Check: ${$(C.v)} × ${mil(C.pop)} = ${bil(+(C.v*C.pop/1e3).toFixed(1))}, the published total.`);
    return out;}},
  formula(sim){const C=cs(sim),L=`${C.what==='costs'?'Costs':'Taxes'} per person = ${bil(C.tot)} ÷ ${mil(C.pop)} people = ${$(C.v)} a year`;
   const cmp=C.what==='costs'?`<br>Taxes per person: ${bil(FAIR.tax)} ÷ ${mil(FAIR.pop)} = ${$(ppF())} (FAIR); ${bil(ITEP.tax)} ÷ ${mil(ITEP.pop)} = ${$(ppI())} (ITEP)`:'';
   return L+cmp+(atLeast('honors')?`<br>Total = rate × people: ${$(ppI())} × ${mil(FAIR.pop)} = ${bil(+(ppI()*FAIR.pop/1e3).toFixed(1))} at ITEP’s rate`:'');},
  how:{bio:'Divide each published total by the number of people it covers. Then compare the rates, not the totals, because the two groups count different numbers of people.',
   honors:'Rate = total ÷ people. Multiplying a rate by a headcount rebuilds a total, so you can test whether a gap between two totals comes from the headcount or from the method.'},
  compare(sim,g,m){const C=cs(sim),off=Math.abs(g.guess-C.v),tot=off*C.pop/1e3;const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also worked out the rate yourself, so you can check any total this way.':'';
   let s=off<=Math.max(100,0.05*C.v)?`Your gut was right on: within ${$(off)} a person.`:`Your gut was off by <b>${$(off)} a person</b>: you guessed ${$(g.guess)}, and ${C.who}’s ${C.what} come to <b>${$(C.v)}</b>. Across ${mil(C.pop)} people, that gap is about ${bil(+tot.toFixed(1))} a year.`;
   if(C.what==='taxes')s+=C.who==='FAIR'?` That is the lower of the two estimates, and it is far above the claim’s $0. ITEP’s comes to ${$(ppI())}.`:` FAIR’s lower estimate, ${$(ppF())} a person, is also far above the claim’s $0.`;
   else s+=` FAIR’s costs per person are above both tax rates (${$(ppF())} and ${$(ppI())}), counting U.S.-born children’s costs and state and local budgets. CBO, looking only at the federal budget, finds the 2021 to 2026 surge lowers deficits.`;
   return s+self;},
  again(sim){const cur=cs(sim).id,opts=[['none','fair'],['none','itep'],['more','fair'],['more','itep']].filter(o=>{const t=o[0]==='more'?'fair_c':o[1]==='itep'?'itep_t':'fair_t';return t!==cur;});
   const o=opts[Math.floor(Math.random()*opts.length)];sim.p.claim=o[0];sim.p.src=o[1];sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',card:'more',hide:true,q:'Now check the other claim the same way. FAIR counts $182 billion in costs for 15.5 million people. About how many dollars of cost is that per person, per year?',answer:182e9/15.5e6,tol:120,unit:'$',d:0,hint:'Divide 182 by 15.5, then multiply by 1,000 (billions ÷ millions = thousands).',explain:'182 ÷ 15.5 = 11.742 thousand, so about $11,742 a person. That is above both tax rates, $2,000 (FAIR) and $8,872 (ITEP). FAIR’s costs include U.S.-born children’s schooling, and CBO finds the federal budget comes out ahead, so the answer depends on which budget you count.'},
  {lvl:'bio',instant:true,q:'ITEP’s total is $96.7B and FAIR’s is $31B. Why compare per-person rates instead of the two totals?',choices:['Totals are always wrong','They count different numbers of people (10.9 million and 15.5 million), so totals alone hide the rate','Per-person numbers always come out bigger'],correct:1,explain:'A total depends on both the rate and the headcount. Dividing by each source’s own headcount puts them on the same footing: $8,872 and $2,000 a person.'},
  {lvl:'bio',instant:true,q:'A post says: “$96.7 billion vs. $31 billion. One side must be lying.” What should you check first?',choices:['Which side posted it','How many people each total covers, and what each one counts','Which number is rounder'],correct:1,explain:'The totals cover different headcounts and different methods. Divide first: $8,872 and $2,000 a person. Then ask what each one counts.'},
  {lvl:'honors',kind:'num',q:'At ITEP’s rate of about $8,872 a person, what total in taxes would FAIR’s 15.5 million people pay? Answer in billions of dollars.',answer:ITEP.tax/ITEP.pop*15.5,tol:0.6,unit:'$B',d:1,hint:'Total = rate × people. Multiply 8,872 by 15.5 million, then write it in billions.',explain:'$8,871.56 × 15.5 million ≈ $137.5B. A bigger headcount at ITEP’s rate makes the gap with FAIR’s $31B wider, so the two sources differ mainly in method.'},
  {lvl:'honors',instant:true,q:'FAIR counts more people (15.5 million) than ITEP (10.9 million). Is that why FAIR’s total is lower?',choices:['Yes: more people means a lower total','No: FAIR’s rate is about $2,000 a person and ITEP’s about $8,872, so the methods differ','They agree once you adjust for headcount'],correct:1,explain:'$31B ÷ 15.5 million = $2,000. $96.7B ÷ 10.9 million ≈ $8,872, about 4.4 times as much. More people at the same rate would raise a total, not lower it.'},
  {lvl:'ap',instant:true,q:'The National Academies found the 2013 net cost of all first-generation immigrants was about $279B when each person is charged an average share of public goods like defense, and about $43B when only the added cost is charged. About how many times larger is the high end?',choices:['About 2.5 times','About 6.5 times','About 65 times'],correct:1,explain:'279 ÷ 43 ≈ 6.5. One accounting choice in the top of the fraction moves the answer more than six-fold. The same study found the second generation among the strongest fiscal contributors.'},
  {lvl:'ap',instant:true,q:'ITEP estimates $25.7B to Social Security and $6.4B to Medicare, out of $96.7B in total taxes. What share of the total is that?',choices:['About 13%','About 33%','About 61%'],correct:1,explain:'(25.7 + 6.4) ÷ 96.7 = 32.1 ÷ 96.7 ≈ 33%. The 61% figure is ITEP’s federal share: $59.4B of $96.7B.'},
  {lvl:'ap',kind:'num',q:'CBO found the 2021 to 2026 immigration surge lowers federal deficits by about $0.9 trillion over the 11 fiscal years 2024 through 2034. About how many billions of dollars a year is that, on average?',answer:900/11,tol:1,unit:'$B',d:1,hint:'A trillion is 1,000 billion. Divide 900 billion by 11 years.',explain:'$900B ÷ 11 ≈ $81.8B a year. A ten-year total and a one-year figure need the same denominator before you compare them. CBO’s estimate covers everyone in the surge, not only undocumented immigrants, and only the federal budget.'}
 ],
 tour:[
  {title:'A claim is a number',text:'“Undocumented immigrants pay no taxes” is a claim about a number: $0. A number can be checked. Two groups on opposite sides of the immigration debate published estimates.',focus:[0,0,800,90],pause:true,setup:sim=>BioLab.setValues(sim,{claim:'none',src:'fair',pop:15.5})},
  {stn:{hide:true},title:'Two totals, two headcounts',text:'FAIR, which advocates lower immigration, estimates $31B in taxes and counts 15.5 million people. ITEP, which leans left, estimates $96.7B and counts 10.9 million. The totals cover different numbers of people.',pause:true},
  {stn:{divring:true},title:'Divide by the right people',text:'Divide each total by its own headcount. FAIR: $31B ÷ 15.5 million = $2,000 a person. ITEP: $96.7B ÷ 10.9 million ≈ $8,872. Both are far above the claim’s $0.',pause:true},
  {title:'The other claim',text:'“Undocumented immigrants pay more in taxes than they cost” is checked the same way. FAIR’s costs: $182B ÷ 15.5 million ≈ $11,742 a person, above both tax rates.',pause:true,setup:sim=>BioLab.setValues(sim,{claim:'more'})},
  {stn:{card:{x:588,y:192,w:204,title:'Same people, different budgets',lines:['FAIR’s $182B: federal, state and local costs, including school for U.S.-born children (citizens).','CBO, federal budget only: the 2021–26 surge cuts deficits about $0.9T over 2024–2034.']}},title:'What the top counts',text:'FAIR’s costs include school for U.S.-born children, who are citizens. CBO, looking only at the federal budget, finds the 2021 to 2026 surge lowers deficits about $0.9T over 2024 to 2034. Same people, different budgets.',pause:true},
  {lvl:'honors',title:'Headcount or method?',text:'Total = rate × people. At ITEP’s rate, FAIR’s 15.5 million people would pay about $137.5B. A bigger headcount widens the gap with $31B, so the sources differ mainly in method.',pause:true,setup:sim=>BioLab.setValues(sim,{claim:'none',src:'itep',pop:15.5})},
  {stn:{card:{x:588,y:140,w:204,title:'National Academies, 2013',lines:['Same people, same year, two ways to share the cost of roads, defense and other public goods.'],bars:[{l:'Average share',v:279,max:279,t:'$279B',c:'#c8102e'},{l:'Only the added cost',v:43,max:279,t:'$43B'}]}},lvl:'ap',title:'One choice, six times the answer',text:'The National Academies put the 2013 net cost of all first-generation immigrants at about $279B with an average share of public goods, or $43B counting only the added cost: 279 ÷ 43 ≈ 6.5.',pause:true}
 ],
 onTourExit(sim){BioLab.setValues(sim,{claim:'none',src:'fair'});},
 lab:{bio:'<p><b>Question:</b> Does each claim hold up when you divide by the right people?</p><ol><li>Lock in your gut, then work out the rate for the claim on screen.</li><li>Press <b>Check the other claim</b> and do it again.</li><li>Record each total, each headcount and each rate in a table.</li></ol><p>Write one sentence for each claim: what does the per-person rate show, and what would you still want to know?</p>',
  honors:'<p><b>Question:</b> Is the gap between the two tax estimates about headcount or method?</p><ol><li>Set the headcount for ITEP’s rate to 10.9, 13 and 15.5 million. Record the total each time.</li><li>Compare each total with FAIR’s $31B.</li></ol><p>Explain your result with total = rate × people.</p>',
  ap:'<p><b>Question:</b> Pick one claim and write the strongest case for each side using only rates from this tool.</p><ol><li>Name each source, its numerator and its denominator.</li><li>Compute one rate, ratio or share a headline would not show.</li></ol><p><b>CER:</b> Claim, evidence, and reasoning that separates what the math settles from what it cannot.</p>'},
 terms:[
  {t:'Rate (per person)',d:'A total divided by the number of people it covers. It lets you compare groups of different sizes.'},
  {t:'Denominator',d:'The bottom of a fraction: here, the number of people a total is divided by. The right denominator counts the same people as the total.'},
  {t:'Net fiscal impact',d:'Taxes a group pays minus the cost of government services it uses. It depends on which taxes, costs and budgets you count.'},
  {t:'Public goods',d:'Things government provides to everyone at once, like national defense. One more resident barely changes their cost.',lvl:'honors'},
  {t:'Average vs. marginal cost',d:'Average cost splits a total evenly among everyone. Marginal cost counts only what one more person adds.',lvl:'ap'}
 ],
 about:'<p><b>The method.</b> Rate = total ÷ people. Each per-person figure here is a published total divided by the same source’s own headcount, computed in this page. Total = rate × people rebuilds a total from a rate. The tool does not invent a net figure for any combination of assumptions no source has published.</p>'+
  '<p><b>Sources.</b> ITEP (Institute on Taxation and Economic Policy, 2024 report; ITEP leans left): $96.7B in federal, state and local taxes in 2022 ($59.4B federal, $37.3B state and local; $25.7B to Social Security, $6.4B to Medicare), about $427M in Colorado, 10.9 million people (itep.org/undocumented-immigrants-taxes-2024/). FAIR (Federation for American Immigration Reform, 2023 report; FAIR advocates lower immigration): gross cost $182B, taxes $31B, net cost $150.7B, counting U.S.-born children’s costs, 15.5 million people. FAIR’s figures are rounded as published, so $182B − $31B does not exactly equal $150.7B. National Academies of Sciences, Engineering, and Medicine (2016–17): for all first-generation immigrants, legal and not, the net cost falls mainly on state and local governments, through children’s education; the second generation is among the strongest fiscal contributors; the 2013 first-generation net cost was about $279B or about $43B under different public-goods assumptions. CBO (2024): the 2021–2026 immigration surge adds $1.2T in federal revenue and lowers federal deficits about $0.9T over 2024–2034, while raising state and local costs (cbo.gov/publication/60165).</p>'+
  '<p><b>What this number hides.</b></p><ul><li>An average spreads a total evenly over everyone. Real people pay very different amounts, and some pay none.</li><li>The denominator is itself an estimate. No one has an exact count of people living in the country without legal status, and the two sources differ by 4.6 million.</li><li>The two claims ask different questions. Taxes paid is one number; net cost also depends on which costs count (U.S.-born children’s schooling, a share of defense) and which budget you check (federal, or state and local).</li></ul>'+
  '<p><b>Two claims, one method.</b> Both claims are heard in the immigration debate, from different directions. The tool checks each with the same per-person method and names programs and sources, not parties. Whether a nation should admit more or fewer people is a value question the rates do not settle.</p>'+
  '<p><b>A named source.</b> In a Special Message (Nov 12, 2025), the U.S. Conference of Catholic Bishops affirmed that nations may regulate their borders and opposed “indiscriminate mass deportation.” Question for discussion: what could rates like these tell you about that statement, and what could they not?</p>'+
  '<p>This is a simplified teaching tool, not financial or legal advice.</p>'
};

/* ---------- drawing ---------- */
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.25,L=lines.slice(0,o.max||99);L.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return L.length*lh;}
function vlab(ctx,x,y,s,k,col){ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(s).width;if(x+8+w<792)txt(ctx,s,x+8,y,{s:12*k,w:700,c:col||PAL['cv-ink'],b:'middle'});else txt(ctx,s,x-8,y,{s:12*k,w:700,c:'#fff',a:'right',b:'middle'});}
BioLab.register(BioLab.stepWrap(SIM));
})();
