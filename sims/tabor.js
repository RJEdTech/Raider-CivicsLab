(function(){
'use strict';
const {clamp,txt,rr,pill,PAL,axes,legend,atLeast,FONT}=BioLab.h;
/* Colorado TABOR / Referendum C cap, in millions of dollars. FY2025-26 from the Legislative Council Staff September 2026 forecast:
   revenue came in $175.9M under the Referendum C cap of $20,011.3M. */
const CAP0=20011.3,UNDER0=175.9,REV0=+(CAP0-UNDER0).toFixed(1),N=5;
const HIST=[['21-22',3757.4],['22-23',3614.7],['23-24',1665.1],['24-25',306.1]];
const FC={surplus:826.8,oblig:463.7},GF=17440,TOTAL=49.60,EDSH=0.263,ED=GF*EDSH;
const FY=t=>{const a=25+t;return `${a}-${a+1}`;};
const g=sim=>(sim.p.infl+sim.p.pop)/100;
/* Run the cap for N years under both rules. Old rule: next limit = min(last revenue, last limit) × (1 + g). Ref C: next cap = last cap × (1 + g). */
function run(sim){const G=g(sim),out=[{t:0,rev:REV0,cap:CAP0,lim:CAP0,refC:0,refO:0}];let rev=REV0,cap=CAP0,lim=CAP0;
 for(let t=1;t<=N;t++){const r=(String(sim.p.rec)===String(t)?sim.p.drop:sim.p.rg)/100;const prev=rev;rev=rev*(1+r);lim=Math.min(prev,lim)*(1+G);cap=cap*(1+G);
  const keep=!!sim.p.keep;out.push({t,rev,cap,lim,refC:keep?0:Math.max(0,rev-cap),refO:keep?0:Math.max(0,rev-lim)});}
 return out;}
const orig=sim=>atLeast('honors')&&sim.p.rule==='orig';
const lim=(sim,y)=>orig(sim)?y.lim:y.cap;
const ref=(sim,y)=>orig(sim)?y.refO:y.refC;
const ref1=sim=>ref(sim,run(sim)[1]);
const tot=(sim,f)=>run(sim).slice(1).reduce((a,y)=>a+f(y),0);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* The years stay hidden while the student works out next year's refund ("Your turn"). */
const shown=sim=>!pend(sim)&&!!(sim.p.show||(GS(sim)&&GS(sim).g));
const revealed=sim=>!!(GS(sim)&&GS(sim).m);
const r1=v=>Math.round(v*10)/10;
const rp1=sim=>String(sim.p.rec)==='1'?sim.p.drop:sim.p.rg;
const base1=sim=>orig(sim)?Math.min(REV0,CAP0):CAP0;
const fG=sim=>(1+g(sim)).toFixed(3).replace(/0+$/,''),fR=sim=>(1+rp1(sim)/100).toFixed(3).replace(/0+$/,'');
const n1=v=>Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const M=v=>(v<0?'−':'')+'$'+n1(v)+'M';
const M0=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US')+'M';
const pc=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const ORDER=['Property-tax exemption reimbursements (the state pays local governments back for homestead exemptions)','A temporary income-tax rate cut','A temporary sales-tax rate cut, only if the surplus is very large','A six-tier sales tax refund'];

function lay(k){const strip=Math.round(26+20*k*4),cb=450-strip-14;return {T:Math.round(26+16*k),B:cb-Math.round(22*k),L:Math.round(30+44*k),R:780,stripY:cb+8};}
function draw(sim,ctx,vdt,k){const W=800,H=450,sh=shown(sim),Y=run(sim),Q=lay(k),ph=k>1.4,G=GS(sim),hon=atLeast('honors');sim._k=k;
 ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
 /* legend */
 let lx=Q.L;const leg=(c,l,d)=>{ctx.strokeStyle=c;ctx.lineWidth=3;ctx.setLineDash(d?[6,5]:[]);ctx.beginPath();ctx.moveTo(lx,14+3*k);ctx.lineTo(lx+22,14+3*k);ctx.stroke();ctx.setLineDash([]);txt(ctx,l,lx+28,14+3*k,{s:12*k,w:700,c,b:'middle'});ctx.font='700 '+(12*k)+'px '+FONT;lx+=28+ctx.measureText(l).width+18;};
 leg(PAL['rj'],ph?'Ref C cap':'Referendum C cap');leg(PAL['s2'],'Revenue');if(hon)leg(PAL['s5'],ph?'Old rule':'Old rule limit (what if)',true);
 /* scale */
 const vals=[];Y.forEach(y=>{vals.push(y.rev,y.cap);if(hon)vals.push(y.lim);});
 const lo=Math.floor(Math.min(...vals)/1000)*1000,hi=Math.ceil(Math.max(...vals)/1000)*1000;
 const X=t=>Q.L+20+t*(Q.R-Q.L-40)/N,YY=v=>Q.B-(v-lo)/(hi-lo)*(Q.B-Q.T);
 const step=hi-lo>6000?2000:1000;
 for(let v=lo;v<=hi+1;v+=step){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(Q.L,YY(v));ctx.lineTo(Q.R,YY(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,'$'+(v/1000).toFixed(0)+'B',Q.L-6,YY(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
 /* recession band */
 const rec=+sim.p.rec;if(rec>=1&&(sh||rec===1)){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.08;const w=(Q.R-Q.L-40)/N;ctx.fillRect(X(rec)-w/2,Q.T,w,Q.B-Q.T);ctx.globalAlpha=1;txt(ctx,'Recession',X(rec),Q.T+12*k,{s:12*k,w:700,c:PAL['s1'],a:'center'});}
 for(let t=0;t<=N;t++)txt(ctx,(ph?'':'FY')+FY(t),X(t),Q.B+17*k,{s:12*k,c:t===0?PAL['cv-ink']:PAL['cv-soft'],a:'center',w:t===0?700:400});
 const upto=sh?N:0;
 const line=(f,c,d,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w||3;ctx.setLineDash(d?[6,5]:[]);ctx.beginPath();for(let t=0;t<=upto;t++){const p=[X(t),YY(f(Y[t]))];t?ctx.lineTo(...p):ctx.moveTo(...p);}ctx.stroke();ctx.setLineDash([]);
  for(let t=0;t<=upto;t++){ctx.fillStyle=c;ctx.beginPath();ctx.arc(X(t),YY(f(Y[t])),4,0,7);ctx.fill();}};
 if(sh){/* refunds: the gap above the limit in use */
  for(let t=1;t<=N;t++){const y=Y[t],L=lim(sim,y),r=ref(sim,y);if(r>0||(sim.p.keep&&y.rev>L)){ctx.fillStyle=sim.p.keep?PAL['s4']:PAL['s3'];ctx.globalAlpha=.35;ctx.fillRect(X(t)-9,YY(y.rev),18,YY(L)-YY(y.rev));ctx.globalAlpha=1;}
   const lab=sim.p.keep?(y.rev>L?'kept':''):(r>0?'+'+M0(r):'');if(lab)txt(ctx,lab,X(t),Math.max(Q.T+28*k,YY(Math.max(y.rev,L))-10),{s:12*k,w:700,c:sim.p.keep?PAL['s4']:PAL['s3'],a:'center'});}}
 if(hon&&sh)line(y=>y.lim,PAL['s5'],true,2.5);
 line(y=>y.cap,PAL['rj']);line(y=>y.rev,PAL['s2']);
 if(!sh){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.setLineDash([4,6]);[[Y[0].cap,PAL['rj']],[Y[0].rev,PAL['s2']]].forEach(([v,c])=>{ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(X(0),YY(v));ctx.lineTo(X(1)-24,YY(v));ctx.stroke();});ctx.setLineDash([]);
  txt(ctx,'?',X(1),(YY(Y[0].cap)+YY(Y[0].rev))/2,{s:28*Math.min(k,1.4),w:700,c:PAL['s4'],a:'center',b:'middle'});
  txt(ctx,pend(sim)?'Work out the refund to run the years':'Lock in your guess to run the years',(X(2)+X(N))/2,(Q.T+Q.B)/2,{s:13*k,c:PAL['cv-soft'],a:'center'});}
 /* strip: this year and next year */
 const sy=Q.stripY,lh=20*k,c2=410;
 ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,sy-4,784,H-sy-2,10);ctx.fill();
 txt(ctx,ph?'This year, FY25-26':'This year (FY2025-26), actual',22,sy+14*k,{s:12*k,w:700});
 txt(ctx,`Cap ${M(CAP0)}`,22,sy+14*k+lh,{s:12*k});txt(ctx,`Revenue ${M(REV0)}`,22,sy+14*k+2*lh,{s:12*k});
 txt(ctx,ph?`${M(UNDER0)} under: no refund`:`${M(UNDER0)} under the cap: no refund`,22,sy+14*k+3*lh,{s:12*k,c:PAL['cv-soft']});
 const y1=Y[1],gp=(g(sim)*100).toFixed(1),rp=(String(sim.p.rec)==='1'?sim.p.drop:sim.p.rg);
 txt(ctx,ph?'Next year, FY26-27':'Next year (FY2026-27), your scenario',c2,sy+14*k,{s:12*k,w:700});
 const fx=sh&&revealed(sim)&&!ph;/* at the reveal, the growth math itself */
 txt(ctx,fx?`${orig(sim)?'Limit':'Cap'} ${M(base1(sim))} × ${fG(sim)} = ${M(lim(sim,y1))}`:sh?`${orig(sim)?'Limit':'Cap'} ${M(lim(sim,y1))} (+${gp}%)`:`Cap grows ${gp}% (${sim.p.infl.toFixed(1)}% + ${sim.p.pop.toFixed(1)}%)`,c2,sy+14*k+lh,{s:12*k,c:PAL['rj'],w:600});
 txt(ctx,fx?`Revenue ${M(REV0)} × ${fR(sim)} = ${M(y1.rev)}`:sh?`Revenue ${M(y1.rev)} (${pc(rp)})`:`Revenue grows ${pc(rp).replace('+','')}`,c2,sy+14*k+2*lh,{s:12*k,c:PAL['s2'],w:600});
 if(sh){const r=ref(sim,y1);txt(ctx,sim.p.keep?(ph?'Voters keep the surplus':'Voters let the state keep any surplus'):r>0?(ph?`Refund ${M(r)}`:`Refund ${M(r)}, paid the year after`):`Under the ${orig(sim)?'limit':'cap'}: no refund`,c2,sy+14*k+3*lh,{s:12*k,w:700,c:sim.p.keep?PAL['s4']:PAL['s3']});}
 else txt(ctx,'Refund: ?',c2,sy+14*k+3*lh,{s:12*k,w:700,c:PAL['s4']});
 if(G&&G.g&&sh&&!ph)txt(ctx,`Your gut: ${M(G.g.guess)}`,780,sy+14*k+3*lh,{s:12*k,w:700,c:PAL['s4'],a:'right'});}

/* Context that used to sit under the picture; it now lives in About. */
const CONTEXT=`<p><b>If there is a surplus, refunds go out in this order:</b> ${ORDER.map((x,i)=>`(${i+1}) ${x}`).join('; ')}. Each one is used only if the surplus is big enough to reach it (Legislative Council Staff memo, August 2026). This tool shows the total, not the split.</p>
 <p><b>Two views of the TABOR cap.</b> <b>Supporters say:</b> the cap makes the state ask voters before it keeps more money or raises taxes, and it returns money to taxpayers when revenue runs ahead of inflation and population growth. When voters agree the state needs more, they can say yes, as they did with Referendum C in 2005.</p><p><b>Critics say:</b> the cap, together with other limits in the state constitution and fast-growing costs such as Medicaid, leaves gaps in other services. A formula tied to inflation and population does not track what services actually cost.</p><p>Whether the cap is good policy is a question of values. The math here is not.</p>`;

const SIM={
 id:'tabor',hash:'tabor',apUnit:4,order:1,tab:'Colorado’s TABOR machine',kind:'Simulation',
 skills:{bio:'Percent growth: amount × (1 + rate), then max(0, revenue − cap) · Algebra 1 (Unit 2)',honors:'Percent growth and a piecewise rule (the ratchet) · Algebra 1 (Unit 2), Algebra 2 (Unit 5)',ap:'Compound growth: cap × (1 + i + p)ⁿ · Algebra 2 (Unit 5), AP Precalculus (Unit 2A)'},
 card:'Guess next year’s TABOR refund, then run Colorado’s revenue cap year by year, through a recession, and see where the ratchet debate comes from.',
 title:'Colorado’s TABOR machine',
 lede:{bio:'Colorado’s Taxpayer’s Bill of Rights (TABOR) caps how much revenue the state may keep. The cap grows each year by inflation plus population growth. Revenue above it goes back to taxpayers, unless voters say the state may keep it.',
  honors:'Referendum C (2005) raised the base and made the cap grow from last year’s cap. Under the old rule, a recession lowered the base for good: the “ratchet.” Compare the two rules through a bad year.',
  ap:'Each year: cap_t = cap_(t−1) × (1 + i + p). Refund_t = max(0, revenue_t − cap_t). After n years of steady growth, cap_n = cap_0 × (1 + i + p)^n.'},
 scale:'Colorado state revenue that counts toward the TABOR cap, about $20 billion a year. Federal money does not count. Amounts in millions of dollars.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your scenario',
 controls:[
  {id:'guess',label:'Your guess: next year’s refund, in millions of dollars',type:'range',min:0,max:1500,step:10,def:500,unit:'',d:0},
  {id:'show',label:'Run the years',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'infl',label:'Inflation',type:'range',min:0,max:8,step:0.1,def:2.5,unit:'%',d:1,noGut:true,onChange:clearGut,help:'TABOR uses inflation for the Denver area. 2.5% is an assumption for illustration.'},
  {id:'pop',label:'Population growth',type:'range',min:0,max:3,step:0.1,def:0.8,unit:'%',d:1,noGut:true,onChange:clearGut,help:'0.8% is an assumption for illustration.'},
  {id:'rg',label:'Revenue growth in a normal year',type:'range',min:-5,max:12,step:0.5,def:5,unit:'%',d:1,noGut:true,onChange:clearGut},
  {id:'rec',label:'Recession year',type:'seg',def:'3',noGut:true,onChange:clearGut,options:[{v:'0',l:'None'},{v:'1',l:'Next year'},{v:'3',l:'Year 3'},{v:'4',l:'Year 4'}]},
  {id:'drop',label:'Revenue change in the recession year',type:'range',min:-20,max:0,step:1,def:-8,unit:'%',d:0,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'rule',label:'Which rule sets the limit?',type:'seg',def:'refc',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'refc',l:'Referendum C cap (today)'},{v:'orig',l:'Old rule (what if)'}],help:'Old rule: each limit is built on last year’s revenue if it fell below the limit. That is the ratchet.'},
  {id:'keep',label:'Voters let the state keep the surplus',type:'toggle',def:false,lvl:'honors',noGut:true,onChange:clearGut,help:'A statewide vote can let the state keep revenue above the cap.'},
  {id:'costg',label:'Growth in the cost of today’s services',type:'range',min:0,max:10,step:0.5,def:5,unit:'%',d:1,lvl:'ap',noGut:true,help:'An assumption: how fast the cost of keeping today’s services (such as Medicaid and schools) grows.'}
 ],
 actions:[{id:'refund',label:'Set my guess to the math',lvl:'honors',run(sim){BioLab.setValues(sim,{guess:Math.round(ref1(sim)),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cap1',label:'Next year’s limit',unit:'$ millions',d:1,min:0,max:null,get:sim=>shown(sim)?lim(sim,run(sim)[1]):null},
  {id:'rev1',label:'Next year’s revenue',unit:'$ millions',d:1,min:0,max:null,get:sim=>shown(sim)?run(sim)[1].rev:null},
  {id:'ref1',label:'Next year’s refund',unit:'$ millions',d:1,min:0,max:1500,get:sim=>shown(sim)?ref1(sim):null},
  {id:'tot5',label:'Refunds over 5 years',unit:'$ millions',d:1,min:0,max:null,get:sim=>shown(sim)?tot(sim,y=>ref(sim,y)):null},
  {id:'ratchet',label:'Revenue kept: Ref C cap minus old rule, 5 years',unit:'$ millions',d:1,lvl:'honors',min:null,max:null,get:sim=>shown(sim)?tot(sim,y=>y.refO-y.refC):null},
  {id:'cap5',label:'Referendum C cap in FY2030-31',unit:'$ millions',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?run(sim)[N].cap:null},
  {id:'gap5',label:'Year 5: cost of today’s services minus revenue kept',unit:'$ millions',d:1,lvl:'ap',min:null,max:null,get:sim=>{if(!shown(sim))return null;const y=run(sim)[N];return REV0*Math.pow(1+sim.p.costg/100,N)-(y.rev-ref(sim,y));}}
 ],
 graphs:[{id:'hist',label:'Real refunds, FY2021-22 to FY2026-27',custom:true},{id:'yours',label:'Your scenario: refunds by year',lvl:'honors',custom:true}],defaultGraph:'hist',
 plot(sim,ctx,box,id){if(id==='yours'){const Y=run(sim).slice(1),m=Math.max(100,...Y.map(y=>Math.max(y.refC,y.refO)));
   const ax=axes(ctx,box,{xmin:0,xmax:N,ymin:0,ymax:Math.ceil(m/250)*250,xcats:Y.map(y=>FY(y.t)),yl:'Refund ($M)',xl:'Fiscal year'});
   if(!shown(sim)){txt(ctx,'Lock in your guess to run the years',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
   Y.forEach((y,i)=>{[[y.refC,PAL['rj']],[y.refO,PAL['s5']]].forEach(([v,c],j)=>{const x0=ax.X(i+0.18+j*0.33),x1=ax.X(i+0.48+j*0.33);ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));});});
   legend(ctx,box.L+10,box.T+8,[{label:'Referendum C cap',color:PAL['rj']},{label:'Old rule',color:PAL['s5']}]);return;}
  const cats=HIST.map(h=>h[0]).concat(['26-27 (forecast)']),v=HIST.map(h=>h[1]).concat([FC.oblig]);
  const ax=axes(ctx,box,{xmin:0,xmax:5,ymin:0,ymax:4000,xcats:cats,yl:'Refund ($M)',xl:'Fiscal year (FY2024-25 preliminary)'});
  BioLab.h.bars(ctx,ax,v,{colors:[PAL['s3'],PAL['s3'],PAL['s3'],PAL['s3'],PAL['s4']],d:1});},
 draw,
 narrate(sim){const Y=run(sim),y1=Y[1];
  if(pend(sim))return `Your turn: grow the cap by ${(g(sim)*100).toFixed(1)}%, grow revenue by ${pc(rp1(sim)).replace('+','')}, then <b>refund = max(0, revenue − cap)</b>.`;
  if(!shown(sim))return `This year revenue came in ${M(UNDER0)} under the cap, so there is no refund. Next year the cap grows ${(g(sim)*100).toFixed(1)}% and revenue grows ${pc(String(sim.p.rec)==='1'?sim.p.drop:sim.p.rg).replace('+','')}. <b>How much goes back?</b> Guess first.`;
  if(sim.p.keep)return `Voters let the state keep the surplus, so <b>no refunds</b> go out. Over 5 years the state keeps ${M(tot(sim,y=>orig(sim)?y.rev-y.lim:y.rev-y.cap))} more than the ${orig(sim)?'limit':'cap'} allows.`;
  const r=ref(sim,y1),t5=tot(sim,y=>ref(sim,y)),rt=tot(sim,y=>y.refO-y.refC);
  return `Next year revenue is ${M(y1.rev)} against a ${orig(sim)?'limit':'cap'} of ${M(lim(sim,y1))}: ${r>0?`<b>${M(r)} goes back</b> to taxpayers the year after`:'<b>no refund</b>'}. Over 5 years, refunds total ${M(t5)}.${atLeast('honors')&&rt>0.05?` The old rule would refund ${M(rt)} more, because a bad year lowers its base for good.`:''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Next year the cap grows by inflation plus population growth (2.5% + 0.8%), and revenue grows 5%. How much do you think goes back to taxpayers? Drag <b>Your guess</b>, then lock it in.',
   honors:'Before you run the formula: with the growth rates in the picture, how big will next year’s refund be? Set <b>Your guess</b> by feel, then lock it in.'},
  lock(sim){const r=ref1(sim);return {v:Math.abs(sim.p.guess-r),guess:sim.p.guess,label:M(sim.p.guess)};},
  solve(sim){const r=ref1(sim);sim.p.guess=r;sim.p.show=true;return {v:0,guess:r,label:M(r)};},
  hint:{bio:'Lock in your guess. Then you will work out next year’s refund yourself with two percent increases and a subtraction.'},
  calc:{unit:'million dollars',d:1,tol:a=>Math.max(1,0.01*a),after:'lock',
   prompt:{bio:sim=>sim.p.keep?`Voters let the state keep any surplus this time. What refund goes out next year, in millions of dollars?`:`This year’s ${orig(sim)?'base (the lower of revenue and the limit)':'cap'} is <b>${M(base1(sim))}</b>, and revenue was <b>${M(REV0)}</b>. Next year the ${orig(sim)?'limit':'cap'} grows by inflation plus population growth, ${sim.p.infl.toFixed(1)}% + ${sim.p.pop.toFixed(1)}% = <b>${(g(sim)*100).toFixed(1)}%</b>, and revenue grows <b>${pc(rp1(sim)).replace('+','')}</b>. Refund = revenue − ${orig(sim)?'limit':'cap'}, or $0 if revenue is under it. Work out next year’s refund, in millions.`,
    ap:sim=>sim.p.keep?`Voters let the state keep any surplus this time. What refund goes out next year, in millions of dollars?`:`Use refund₁ = max(0, revenue₀(1 + r) − ${orig(sim)?'base₀':'cap₀'}(1 + i + p)) with ${orig(sim)?'base₀':'cap₀'} = ${M(base1(sim))}, revenue₀ = ${M(REV0)}, i + p = ${(g(sim)*100).toFixed(1)}% and r = ${rp1(sim).toFixed(1)}%. Find next year’s refund, in millions.`},
   answer:sim=>r1(ref1(sim)),
   hint:'Multiply each amount by (1 + its growth rate as a decimal). Then subtract the cap from the revenue. A negative result means no refund.',
   steps(sim){const y1=run(sim)[1],Lm=lim(sim,y1),w=orig(sim)?'Limit':'Cap';if(sim.p.keep)return [`Voters let the state keep the surplus, so the refund is <b>$0.0M</b>, whatever the math says. Without that vote it would be ${M(Math.max(0,y1.rev-Lm))}.`];
    return [`${w}: ${M(base1(sim))} × ${fG(sim)} = ${M(Lm)}.`,`Revenue: ${M(REV0)} × ${fR(sim)} = ${M(y1.rev)}.`,
     y1.rev>Lm?`Refund: ${M(y1.rev)} − ${M(Lm)} = <b>${M(r1(ref1(sim)))}</b>, paid back the year after.`:`Revenue is ${M(Lm-y1.rev)} under the ${w.toLowerCase()}, so the refund is <b>$0.0M</b>.`];}},
  formula(sim){const y1=run(sim)[1],Lm=lim(sim,y1),w=orig(sim)?'limit':'cap';
   return `${w==='cap'?'Cap':'Limit'} = ${M(base1(sim))} × ${fG(sim)} = ${M(Lm)}; revenue = ${M(REV0)} × ${fR(sim)} = ${M(y1.rev)}<br>Refund = max(0, ${M(y1.rev)} − ${M(Lm)}) = ${M(Math.max(0,y1.rev-Lm))}`+(sim.p.keep?' (kept by the state after a vote)':'');},
  how:{bio:'Next year’s cap = this year’s cap × (1 + inflation + population growth). Next year’s revenue = this year’s revenue × (1 + growth). The refund is whatever revenue is above the cap.',
   honors:'Under Referendum C the cap grows from last year’s cap. Under the old rule it grows from last year’s revenue whenever revenue fell short. Refund = max(0, revenue − limit).',
   ap:'cap_1 = 20,011.3 × (1 + i + p); revenue_1 = 19,835.4 × (1 + r); refund_1 = max(0, revenue_1 − cap_1).'},
  compare(sim,g,m){const y1=run(sim)[1],off=Math.abs(g.guess-m.guess),L=lim(sim,y1);
   const math=sim.p.keep?'Voters chose to keep the surplus, so the refund is $0.':`${orig(sim)?'Limit':'Cap'}: ${M(L)}. Revenue: ${M(y1.rev)}. ${m.guess>0?`Refund: ${M(y1.rev)} − ${M(L)} = <b>${M(m.guess)}</b>.`:'Revenue is under the limit, so the refund is <b>$0</b>.'}`;
   if(off<25)return `Your gut was right on: within ${M(off)}. ${math}`;
   return `${math} Your guess was off by <b>${M(off)}</b>: about ${(off/ED*100).toFixed(1)}% of what the General Fund gives the Department of Education in a year (${M(ED)}).`;},
  again(sim){sim.p.infl=+(1+Math.random()*4).toFixed(1);sim.p.pop=+(0.3+Math.random()*1.2).toFixed(1);sim.p.rg=Math.round((2+Math.random()*7)*2)/2;sim.p.guess=500;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different year: the cap is $21,000.0M and grows 4.0% (3.0% inflation + 1.0% population). Revenue is $20,800.0M and grows 6%. What is the refund, in millions of dollars?',answer:208,tol:1,unit:'million dollars',d:1,hint:'Cap × 1.04 and revenue × 1.06, then subtract.',explain:'Cap: $21,000.0M × 1.04 = $21,840.0M. Revenue: $20,800.0M × 1.06 = $22,048.0M. Refund: $22,048.0M − $21,840.0M = $208.0M. Revenue started below the cap but grew faster.'},
  {lvl:'bio',instant:true,q:'In FY2025-26, revenue came in $175.9M under the $20,011.3M Referendum C cap. How much is refunded?',choices:['$175.9M','Nothing','$20,011.3M'],correct:1,explain:'Refunds come only from revenue above the cap. Revenue was $19,835.4M, below the cap, so nothing goes back.'},
  {lvl:'bio',instant:true,q:'Inflation is 2.5% and population grows 0.8%. By how much does the $20,011.3M cap grow?',choices:['2.5%, about $500.3M','3.3%, about $660.4M','5%, about $1,000.6M'],correct:1,explain:'The cap grows by inflation plus population growth: 2.5% + 0.8% = 3.3%. 0.033 × $20,011.3M ≈ $660.4M, for a new cap of $20,671.7M.'},
  {lvl:'honors',instant:true,q:'Under the old rule, revenue falls 8% in a recession year. What happens to the limit in the years after?',choices:['It bounces back to where it would have been','It is built on the lower revenue, so it stays lower for every year after','It stops growing'],correct:1,explain:'The old rule built each limit on last year’s revenue when that was lower. In the default scenario, year 4’s old-rule limit is $20,119.0M × 1.033 = $20,783.0M, far below the Ref C cap of $22,786.4M. As revenue recovers, it hits the low limit and refunds go out: $342.0M in year 4 and $712.4M in year 5. That is the ratchet.'},
  {lvl:'honors',instant:true,q:'In the default scenario, how much more revenue does the state keep over 5 years under the Referendum C cap than under the old rule?',choices:['$155.5M','About $1,423.9M','About $5,000M'],correct:1,explain:'Old-rule refunds ($337.2M, $702.4M, $342.0M and $712.4M) total $2,094.1M before rounding. Ref C refunds ($155.5M and $514.7M) total $670.2M. The difference, $1,423.9M, stays with the state for services.'},
  {lvl:'ap',instant:true,q:'With the cap growing 3.3% a year from $20,011.3M, what is the cap after 5 years?',choices:['About $20,671.7M','About $23,313.2M','About $23,538.4M','About $25,000.0M'],correct:2,explain:'cap_5 = 20,011.3 × 1.033^5 ≈ $23,538.4M. Adding 3.3% of the original cap each year would give $23,313.2M; compounding adds about $225M more.'},
  {lvl:'ap',instant:true,q:'Suppose the cost of today’s services grows 5% a year while the cap grows 3.3%, both starting at the same amount. After 5 years, about what share of those services can the capped revenue pay for?',choices:['About 100%','About 92%','About 83%','About 67%'],correct:1,explain:'(1.033 ÷ 1.05)^5 ≈ 0.922. Supporters answer that the state can set priorities or ask voters to keep more; critics answer that costs like Medicaid are hard to slow. The math is the same either way.'}
 ],
 tour:[
  {title:'This year',text:'In FY2025-26, Colorado’s Referendum C cap was $20,011.3M. Revenue came in $175.9M under it, at $19,835.4M, so there is no refund.',pause:true,setup:sim=>BioLab.setValues(sim,{show:false}),focus:sim=>{const Q=lay(sim._k||1);return [8,Q.stripY-4,400,450-Q.stripY];}},
  {title:'The cap grows by a formula',text:'Each year the cap grows by inflation plus population growth. With 2.5% + 0.8% = 3.3%: $20,011.3M × 1.033 = $20,671.7M.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Over the cap goes back',text:'If revenue grows 5%, it reaches $20,827.2M: $155.5M over the cap. That surplus is refunded the next year, unless voters approve keeping it.',pause:true,focus:sim=>{const Q=lay(sim._k||1);return [Q.L,Q.T,Q.R-Q.L,Q.B-Q.T];}},
  {title:'A recession year',text:'In year 3 (FY2028-29) revenue falls 8%, to $20,119.0M: $1,939.5M under the cap of $22,058.5M. The cap keeps growing from last year’s cap, so recovering revenue stays under it.',pause:true},
  {lvl:'honors',title:'The ratchet',text:'Under the old rule (purple), the limit after a bad year is built on the lower revenue: $20,119.0M × 1.033 = $20,783.0M. As revenue recovers, it runs into that low limit, and refunds go out in years 4 and 5. Referendum C ended this.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,rule:'orig'})},
  {title:'Where refunds go',text:'Refunds go out in a set order, starting with property-tax exemption reimbursements (About lists the full order). Real refunds have ranged from $306.1M (FY2024-25, preliminary) to $3,757.4M (FY2021-22).',pause:true,setup:sim=>BioLab.setValues(sim,{rule:'refc'})},
  {title:'Two views',text:'Supporters say the cap requires voter consent and returns surplus to taxpayers. Critics say the cap, other limits and fast-growing costs like Medicaid leave gaps. About gives both in full; the math does not decide between them.',pause:true},
  {lvl:'ap',title:'Compounding',text:'Growth multiplies: cap_5 = $20,011.3M × 1.033^5 ≈ $23,538.4M. If costs grow 5% a year from the same start, after 5 years the cap covers about (1.033 ÷ 1.05)^5 ≈ 92% of them.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> What makes a refund bigger?</p><ol><li>Turn on <b>Run the years</b>.</li><li>Record a trial. Then raise <b>Revenue growth</b> to 8% and record again.</li><li>Put revenue growth back at 5% and raise <b>Inflation</b> to 4%. Record again.</li></ol><p>Write two sentences: what makes refunds grow, and what makes them shrink?</p>',
  honors:'<p><b>Question:</b> How much does the ratchet cost the state?</p><ol><li>With a recession in year 3, record <b>Refunds over 5 years</b> under each rule.</li><li>Make the recession deeper (−15%) and repeat.</li><li>Turn on <b>Voters let the state keep the surplus</b> and note what changes.</li></ol><p>Explain the ratchet in your own words, using one number from your table.</p>',
  ap:'<p><b>Question:</b> Does a cap that grows with inflation and population keep up with costs?</p><ol><li>Record <b>Referendum C cap in FY2030-31</b> and check it with cap_0 × (1 + i + p)^5.</li><li>Set <b>Growth in the cost of today’s services</b> to 3%, 5% and 7%. Record the year-5 gap each time.</li></ol><p><b>CER:</b> Make a claim about the TABOR cap, with evidence from your table and reasoning that answers the strongest point of the other view. Your claim is your own; the math must be right.</p>'},
 terms:[
  {t:'TABOR',d:'Colorado’s Taxpayer’s Bill of Rights, part of the state constitution. It limits state revenue and requires voter approval for tax increases.'},
  {t:'Revenue cap',d:'The most revenue the state may keep in a year. Here it grows by inflation plus population growth.'},
  {t:'Refund',d:'Revenue above the cap, returned to taxpayers the next year unless voters let the state keep it.'},
  {t:'Referendum C',d:'A 2005 measure Colorado voters approved. It raised the base for the cap and made the cap grow from the previous year’s cap.',lvl:'honors'},
  {t:'Ratchet',d:'Under the old rule, a recession year lowered the base, so the limit stayed lower for every year after.',lvl:'honors'},
  {t:'Compound growth',d:'Growing by the same percent each year: amount × (1 + rate)^years.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not tax or financial advice.</b> Each year the Referendum C cap grows by inflation plus population growth: cap_t = cap_(t−1) × (1 + i + p). Revenue above the cap is refunded the next year unless voters approve keeping it. The old-rule comparison is a what-if: it builds each limit on the lower of last year’s revenue and last year’s limit, starting from this year’s cap.</p><p><b>What is simplified:</b> the real formula uses the previous calendar year’s Denver-area inflation and state population growth; the real cap has adjustments (for example, for voter-approved changes); the real refund obligation includes adjustments for earlier years; and each refund method kicks in only above set thresholds, which this tool does not model. Inflation (2.5%), population growth (0.8%), revenue growth and the recession are assumptions you can change. The cost-of-services growth at Deep dive is an assumption for illustration.</p><p><b>Real figures:</b> FY2025-26 revenue $175.9M under the Referendum C cap of $20,011.3M; FY2026-27 forecast surplus $826.8M with a refund obligation of $463.7M after adjustments (Legislative Council Staff, <a href="https://content.leg.colorado.gov/sites/default/files/2026-09/sept2026-forecast-with-cover-for-remediation-and-posting-accessible.pdf" target="_blank" rel="noopener">September 2026 forecast</a>). Refunds: FY2021-22 $3,757.4M; FY2022-23 $3,614.7M; FY2023-24 $1,665.1M; FY2024-25 $306.1M (preliminary). Refund order from the Legislative Council Staff memo of August 2026 (<a href="https://content.leg.colorado.gov/sites/default/files/r26-757-the-tabor-limit-accessible.pdf" target="_blank" rel="noopener">The TABOR Limit</a>). Colorado FY2026-27 budget: $49.60B total funds, $17.44B General Fund, Department of Education 26.3% of the General Fund.</p>'+CONTEXT+'<p><b>What this number hides.</b> A refund total hides how it is split among taxpayers (see the refund order above), what the same money would have paid for if kept, and the uncertainty in the growth rates behind any forecast.</p>'
};
BioLab.register(SIM);
})();
