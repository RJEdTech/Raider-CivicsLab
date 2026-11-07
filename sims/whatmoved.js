(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,atLeast}=BioLab.h;
/* USDA ERS food insecurity in households with children (%), and BLS annual average unemployment (%), 2001–2024.
   USDA ended the annual report in 2025, so 2024 is the last official year. Fits are ordinary least squares on the
   years the student picks; r, r², slope and the typical miss (root-mean-square error) are all computed live. */
const Y0=2001;
const FOODI=[16.1,16.5,16.7,17.6,16.9,15.6,15.8,21.0,21.3,20.2,20.6,20.0,19.5,19.2,16.6,16.5,15.7,13.9,13.6,14.8,12.5,17.3,17.9,18.4];
const UNEMP=[4.7,5.8,6.0,5.5,5.1,4.6,4.6,5.8,9.3,9.6,8.9,8.1,7.4,6.2,5.3,4.9,4.4,3.9,3.7,8.1,5.4,3.6,3.6,4.0];
const RECY=[2001,2007,2008,2009,2020];                         /* years with any recession month */
const RECB=[[2001+2/12,2001+11/12],[2007+11/12,2009.5],[2020+1/12,2020+4/12]];  /* Mar–Nov 2001, Dec 2007–Jun 2009, Feb–Apr 2020 */
const CHILD=[[2021,5.2],[2022,12.4],[2023,13.7]];
const EX={unemp:'Unemployment that year',trend:'A steady trend over time',recess:'A recession that year'};
const yrs=FOODI.map((_,i)=>Y0+i);
const fi=y=>FOODI[y-Y0],un=y=>UNEMP[y-Y0];
function ols(xs,ys){const n=xs.length,mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;
 for(let i=0;i<n;i++){sxy+=(xs[i]-mx)*(ys[i]-my);sxx+=(xs[i]-mx)**2;syy+=(ys[i]-my)**2;}
 const b=sxx>0?sxy/sxx:0,a=my-b*mx,r=(sxx>0&&syy>0)?sxy/Math.sqrt(sxx*syy):0;let se=0;for(let i=0;i<n;i++)se+=(ys[i]-(a+b*xs[i]))**2;
 return {a,b,r,r2:r*r,rmse:Math.sqrt(se/n),n,sse:se,sst:syy};}
/* the x value of a predictor for year y (lag applies to unemployment only) */
function xOf(ex,y,lag){if(ex==='unemp')return un(y-lag);if(ex==='trend')return y;return RECY.includes(y)?1:0;}
function yearSet(sim){const lag=lagOf(sim),last=sim.p.years==='pre'?2019:2024,out=[];for(let y=Y0+lag;y<=last;y++)out.push(y);return out;}
const lagOf=sim=>atLeast('honors')?+sim.p.lag:0;
function fitFor(sim,ex){const ys=yearSet(sim),lag=lagOf(sim);return ols(ys.map(y=>xOf(ex,y,lag)),ys.map(fi));}
function bestEx(sim){let b='unemp',v=-1;Object.keys(EX).forEach(k=>{const r2=fitFor(sim,k).r2;if(r2>v+1e-12){v=r2;b=k;}});return b;}
/* the pre-pandemic unemployment fit, used to measure the 2020–2024 policy gaps */
const PRE=(()=>{const ys=[];for(let y=2001;y<=2019;y++)ys.push(y);return ols(ys.map(un),ys.map(fi));})();
const predPre=y=>PRE.a+PRE.b*un(y);
const gap=y=>fi(y)-predPre(y);
const swing=()=>(fi(2022)-fi(2021))-(predPre(2022)-predPre(2021));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.st&&sim.st.rev)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
/* "Your turn": r is given rounded to 2 decimals (Big picture, Closer look); at Deep dive SSE and SST are given to 1 decimal. */
const r2d=v=>Math.round(v*100)/100,s1=v=>Math.round(v*10)/10;
function calcAns(sim){const F=fitFor(sim,sim.p.expl);if(atLeast('ap'))return 100*(1-s1(F.sse)/s1(F.sst));const r=r2d(F.r);return 100*r*r;}
const pc=v=>Math.round(100*v)+'%',f1=v=>(+v).toFixed(1),f2=v=>(+v).toFixed(2);
/* r with a true minus sign, and r squared written so a negative r is squared in parentheses */
const fr1=v=>(v<0?'−':'')+Math.abs(v).toFixed(1);
const fr=v=>(v<0?'−':'')+Math.abs(v).toFixed(2),sq=v=>v<0?`(${fr(v)})²`:`${fr(v)}²`,sqx=v=>v<0?`(${fr(v)}) × (${fr(v)})`:`${fr(v)} × ${fr(v)}`;
function clearGut(sim){const S=sim.gutS;if(S&&!(sim.guide&&sim.guide.keep)&&(S.g||S.m)){S.g=null;S.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const self=sim=>{const K=sim.ui&&sim.ui.calc;return K&&K.done&&K.correct?' You also squared r yourself, so you can read any r this way.':'';};
const yrsLbl=sim=>sim.p.years==='pre'?'2001–2019':'2001–2024';

const SIM={
 id:'whatmoved',hash:'whatmoved',apUnit:3,order:2,tab:'What actually moved the number?',kind:'Learning tool',prereq:['claims'],
 skills:{bio:'Correlation r and r²: the share of the ups and downs a straight line explains · Statistics (Chapter 3), AP Statistics (Unit 2)',
  honors:'r², residuals (actual − predicted) and lag · Statistics (Chapter 3), AP Statistics (Unit 2), AP Macroeconomics (Unit 2)',
  ap:'Least squares and r² = 1 − SSE/SST · Statistics (Chapter 3), AP Statistics (Unit 2), AP Macroeconomics (Unit 2)'},
 card:'Test explanations for 24 years of child food insecurity: recessions, unemployment and specific laws, with presidents and parties hidden.',
 title:'What actually moved the number?',
 lede:{bio:'When a number gets better or worse, people credit or blame whoever was in charge. Here you test that habit. Pick what you think explains 24 years of hunger data, then let the correlation decide.',
  honors:'Correlation (r) measures how closely two series move together. Square it (r²) to get the share of the ups and downs one variable explains. Compare unemployment, a time trend and recessions, then look at what is left over.',
  ap:'Fit food insecurity on each predictor by least squares. The residuals after 2019 show the policy jump: well below the line while pandemic aid flowed, well above it after the expansions expired.'},
 scale:'One point per year, 2001–2024. Food insecurity: percent of U.S. households with children that could not always afford enough food (USDA ERS).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your test',
 controls:[
  {id:'expl',label:'What explains the food line best?',type:'seg',def:'trend',onChange:clearGut,options:[{v:'unemp',l:EX.unemp},{v:'trend',l:EX.trend},{v:'recess',l:EX.recess}]},
  {id:'years',label:'Years to fit',type:'seg',def:'all',noGut:true,onChange:clearGut,options:[{v:'all',l:'All, 2001–2024'},{v:'pre',l:'Before the pandemic, 2001–2019'}]},
  {id:'events',label:'Mark recessions and major laws',type:'toggle',def:true,noGut:true},
  {id:'fit',label:'Show what unemployment alone predicts',type:'toggle',def:false,lvl:'honors',noGut:true,help:'A line fit to 2001–2019, carried forward. The gap after 2019 is what unemployment cannot explain.'},
  {id:'lag',label:'Unemployment from',type:'seg',def:0,lvl:'honors',noGut:true,onChange:clearGut,options:[{v:0,l:'The same year'},{v:1,l:'The year before'}],help:'Effects can lag. Test whether last year’s jobs explain this year’s hunger better.'},
  {id:'series',label:'What to look at',type:'seg',def:'food',lvl:'honors',noGut:true,options:[{v:'food',l:'Food insecurity'},{v:'child',l:'Child poverty'}]}
 ],
 actions:[{id:'reveal',label:'Show the fits',run(sim){sim.st.rev=true;}}],
 init(){return {rev:false};},step(){},
 metrics:[
  {id:'r',label:'Correlation r (your pick)',unit:'',d:2,min:-1,max:1,get:sim=>shown(sim)?fitFor(sim,sim.p.expl).r:null},
  {id:'r2',label:'Share of the ups and downs explained (r²)',unit:'%',d:0,min:0,max:100,get:sim=>shown(sim)?100*fitFor(sim,sim.p.expl).r2:null},
  {id:'rmse',label:'Typical miss predicting a year',unit:'points',d:1,min:0,max:4,get:sim=>shown(sim)?fitFor(sim,sim.p.expl).rmse:null},
  {id:'best',label:'Best single explanation',text:true,get:sim=>shown(sim)?`${EX[bestEx(sim)]}: ${pc(fitFor(sim,bestEx(sim)).r2)} explained, ${yrsLbl(sim)}`:'Lock in your pick first.'},
  {id:'slope',label:'Food insecurity per point of unemployment',unit:'points',d:2,lvl:'honors',min:0,max:2,get:sim=>shown(sim)?fitFor(sim,'unemp').b:null},
  {id:'gap21',label:'2021: actual minus unemployment-only prediction',unit:'points',d:1,lvl:'honors',min:-6,max:6,get:sim=>shown(sim)?gap(2021):null},
  {id:'gap22',label:'2022: actual minus unemployment-only prediction',unit:'points',d:1,lvl:'honors',min:-6,max:6,get:sim=>shown(sim)?gap(2022):null},
  {id:'swing',label:'2021 to 2022 change unemployment cannot explain',unit:'points',d:1,lvl:'ap',min:0,max:10,get:sim=>shown(sim)?swing():null},
  {id:'cjump',label:'Child poverty (SPM), 2021 to 2022',unit:'points',d:1,lvl:'honors',min:0,max:10,get:()=>CHILD[1][1]-CHILD[0][1]}
 ],
 graphs:[{id:'scatter',label:'Food insecurity vs. your pick',custom:true}],defaultGraph:'scatter',
 plot(sim,ctx,box){const ex=sim.p.expl,ys=yearSet(sim),lag=lagOf(sim),xs=ys.map(y=>xOf(ex,y,lag)),F=fitFor(sim,ex);
  let xmin=Math.min(...xs),xmax=Math.max(...xs);if(ex==='recess'){xmin=-0.5;xmax=1.5;}else{const pd=(xmax-xmin)*0.06;xmin-=pd;xmax+=pd;}
  const xl=ex==='unemp'?(lag?'Unemployment the year before (%)':'Unemployment rate (%)'):ex==='trend'?'Year':'Recession that year (0 = no, 1 = yes)';
  const ax=axes(ctx,box,{xmin,xmax,ymin:10,ymax:24,xl,yl:'Food insecurity (%)',xd:ex==='trend'?0:undefined});
  if(!shown(sim)){txt(ctx,sim.gutS&&sim.gutS.g?'Work out r² to see the fit':'Lock in your pick to see the fit',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ys.forEach((y,i)=>{const jit=ex==='recess'?((y*7)%5-2)*0.04:0,late=y>=2020;ctx.fillStyle=late?PAL['s4']:PAL['g-dot'];ctx.beginPath();ctx.arc(ax.X(xs[i]+jit),ax.Y(fi(y)),late?6:4.5,0,7);ctx.fill();});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(xmin),ax.Y(F.a+F.b*xmin));ctx.lineTo(ax.X(xmax),ax.Y(F.a+F.b*xmax));ctx.stroke();
  txt(ctx,`r = ${fr(F.r)}, r² = ${pc(F.r2)}`,box.L+10,box.T+14,{s:13,w:700,c:PAL['g-line']});
  if(sim.p.years==='all')txt(ctx,'Orange: 2020–2024',box.L+10,box.T+32,{s:12,c:PAL['s4']});},
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const ser=atLeast('honors')?sim.p.series:'food';if(ser==='child')return drawChild(sim,ctx,k);
  const L=58,R=740,T=(sim.p.events?30+14*k+36*k:40+16*k),B=372-34*Math.max(0,k-1),X=y=>L+(y-2001)/24*(R-L),Y=v=>B-(v-10)/14*(B-T),UY=v=>B-v/12*(B-T);
  txt(ctx,'Households with children that could not always afford food (%)',L-40,24,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
  const sh=shown(sim),ev=sim.p.events,ex=sim.p.expl,S=GS(sim);
  /* recessions */
  if(ev){ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.16;RECB.forEach(([a,b])=>ctx.fillRect(X(a),T,Math.max(3,X(b)-X(a)),B-T));ctx.globalAlpha=1;}
  /* grid and axes */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[10,14,18,22].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();txt(ctx,v+'%',L-8,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
  [2001,2005,2010,2015,2020,2024].forEach(y=>txt(ctx,String(y),X(y+0.5),B+8,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'}));
  /* laws */
  if(ev){[[2022,'2022: expanded CTC expires'],[2021,'2021: expanded CTC, SNAP increases']].forEach(([y,l],i)=>{ctx.strokeStyle=PAL['s5'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;const ly=T-36*k+i*17*k+8*k;ctx.beginPath();ctx.moveTo(X(y),ly);ctx.lineTo(X(y),B);ctx.stroke();ctx.setLineDash([]);
    txt(ctx,l,X(y)-6,ly,{s:12*k,w:700,c:PAL['s5'],a:'right',b:'middle'});});
   txt(ctx,'Shaded: recessions',L+6,B-8,{s:12*k,c:PAL['cv-soft'],b:'bottom'});}
  /* unemployment on a right axis, once revealed */
  if(sh&&(ex==='unemp'||(S&&S.m&&S.m.ex==='unemp'))){ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.globalAlpha=.75;ctx.beginPath();yrs.forEach((y,i)=>{const p=[X(y+0.5),UY(un(y))];i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();ctx.globalAlpha=1;
   [0,4,8,12].forEach(v=>txt(ctx,v+'%',R+8,UY(v),{s:12*k,c:PAL['s2'],b:'middle'}));}
  /* unemployment-only prediction from 2001–2019, carried forward */
  if(sh&&atLeast('honors')&&sim.p.fit){ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.22;for(let y=2020;y<=2024;y++){const a=Y(fi(y)),b=Y(predPre(y));ctx.fillRect(X(y+0.5)-7,Math.min(a,b),14,Math.abs(a-b));}ctx.globalAlpha=1;
   /* the 2021 residual: actual minus predicted */
   {const x=X(2021.5),ya=Y(fi(2021)),yp=Y(predPre(2021));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,yp);ctx.lineTo(x,ya-2);ctx.stroke();ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(x,ya);ctx.lineTo(x-5,ya-8);ctx.lineTo(x+5,ya-8);ctx.closePath();ctx.fill();
    txt(ctx,(k>1.3?'':'2021 residual: ')+fr1(gap(2021)),x-14,Y(10.8),{s:12*k,w:700,c:PAL['s4'],a:'right',b:'middle'});}
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();yrs.forEach((y,i)=>{const p=[X(y+0.5),Y(predPre(y))];i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();ctx.setLineDash([]);}
  /* prediction from the picked variable(s) */
  const predLine=(e,col)=>{const F=fitFor(sim,e),lag=lagOf(sim);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash([3,4]);ctx.beginPath();let st=false;yearSet(sim).forEach(y=>{const p=[X(y+0.5),Y(clamp(F.a+F.b*xOf(e,y,lag),10,24))];st?ctx.lineTo(...p):ctx.moveTo(...p);st=true;});ctx.stroke();ctx.setLineDash([]);};
  if(sh&&!(atLeast('honors')&&sim.p.fit)){if(S&&S.g&&S.m&&S.g.ex!==S.m.ex){predLine(S.g.ex,PAL['s4']);predLine(S.m.ex,PAL['s3']);}else predLine(ex,PAL['s3']);}
  /* the data */
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=3;ctx.beginPath();yrs.forEach((y,i)=>{const p=[X(y+0.5),Y(fi(y))];i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();
  ctx.fillStyle=PAL['g-line'];yrs.forEach(y=>{ctx.beginPath();ctx.arc(X(y+0.5),Y(fi(y)),3.5,0,7);ctx.fill();});
  [[2008,-1],[2021,1],[2024,-1]].forEach(([y,d])=>txt(ctx,f1(fi(y))+'%',X(y+0.5),Y(fi(y))+d*10,{s:12*k,w:700,c:PAL['g-line'],a:'center',b:d<0?'bottom':'top'}));
  /* legend */
  const ly=B+18+14*k;let lx=L-40;const item=(col,dash,lab)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+22,ly);ctx.stroke();ctx.setLineDash([]);txt(ctx,lab,lx+28,ly,{s:12*k,c:PAL['cv-ink'],b:'middle'});ctx.font=(12*k)+'px '+FONT;lx+=40+ctx.measureText(lab).width;};
  const big=k>1.3;item(PAL['g-line'],[],big?'Food':'Food insecurity');
  if(sh){const two=S&&S.g&&S.m&&S.g.ex!==S.m.ex;if(atLeast('honors')&&sim.p.fit)item(PAL['s4'],[7,5],big?'Jobs alone predict':'Unemployment alone predicts');else if(two){item(PAL['s4'],[3,4],big?'Your pick':'Your pick predicts');item(PAL['s3'],[3,4],big?'Best pick':'Best pick predicts');}else item(PAL['s3'],[3,4],big?'Your pick':'Your pick predicts');if(ex==='unemp'&&!(big&&two))item(PAL['s2'],[],big?'Jobs (right)':'Unemployment (right)');}
  else txt(ctx,'Presidents and parties are hidden on purpose.',lx,ly,{s:12*k,c:PAL['cv-soft'],b:'middle'});
  /* the math, once it is shown */
  if(sh){const F=fitFor(sim,ex),fy=ly+20*k;let t;
   if(atLeast('honors')&&sim.p.fit)t=k>1.3?`2021: ${f1(fi(2021))} − ${f1(predPre(2021))} = ${fr1(gap(2021))} points`:`2001–2019 line: ŷ = ${PRE.a.toFixed(2)} + ${PRE.b.toFixed(2)} × unemployment. 2021: ${f1(fi(2021))} − ${f1(predPre(2021))} = ${fr1(gap(2021))} points`;
   else t=k>1.3?`r = ${fr(F.r)}, so r² = ${sq(F.r)} ≈ ${pc(F.r2)} explained`:`${EX[ex]}: r = ${fr(F.r)}, so r² = ${sq(F.r)} ≈ ${pc(F.r2)} of the ups and downs (${yrsLbl(sim)})`;
   txt(ctx,t,L-40,fy,{s:13*k,w:700,c:PAL['cv-ink'],b:'middle'});}},
 narrate(sim){const ser=atLeast('honors')?sim.p.series:'food';
  if(ser==='child')return `Child poverty (SPM) went from <b>5.2% in 2021 to 12.4% in 2022</b>, then 13.7% in 2023. The expanded Child Tax Credit was paid in 2021 and expired after it: a <b>specific policy you can test</b>, not a party label.`;
  if(!shown(sim)&&sim.gutS&&sim.gutS.g)return `For your pick, r = <b>${fr(r2d(fitFor(sim,sim.p.expl).r))}</b>. Square it to find the share of the ups and downs it explains.`;
  if(!shown(sim))return `Hunger in families with kids rose from <b>15.8% in 2007 to 21.0% in 2008</b>, fell to 12.5% in 2021, then jumped to 17.3% in 2022. What moved it? Pick an explanation and lock it in.`;
  const ex=sim.p.expl,F=fitFor(sim,ex),b=bestEx(sim);
  if(atLeast('honors')&&sim.p.fit)return `Unemployment alone predicts ${f1(predPre(2021))}% for 2021; the real number was <b>${f1(fi(2021))}%</b>. In 2022 it predicts ${f1(predPre(2022))}%; the real number was <b>${f1(fi(2022))}%</b>. That swing lines up with pandemic aid arriving, then expiring.`;
  return `${EX[ex]} explains <b>${pc(F.r2)}</b> of the ups and downs over ${yrsLbl(sim)}. ${b===ex?'That is the best of the three.':`${EX[b]} explains ${pc(fitFor(sim,b).r2)}.`} ${sim.p.years==='all'?'The pandemic years break the pattern: try fitting only 2001–2019.':'Before the pandemic, jobs and hunger moved together closely.'}`;},
 gut:{better:'higher',controls:['expl'],
  ask:{bio:'The red line shows the share of U.S. households with children that could not always afford enough food. Which explains its ups and downs best? Pick one here, then lock it in.',honors:'Which single variable explains the most variation in the red line? Pick one, then lock it in before you see any r.'},
  lock(sim){const e=sim.p.expl,F=fitFor(sim,e);return {ex:e,v:F.r2,miss:F.rmse,label:EX[e]};},
  solve(sim){const e=bestEx(sim),F=fitFor(sim,e);sim.p.expl=e;sim.st.rev=true;return {ex:e,v:F.r2,miss:F.rmse,label:`${EX[e]}, which explains ${pc(F.r2)}`};},
  how:{bio:'For each choice, the math draws the best straight-line prediction and checks how close it comes to the real line, year by year. The one with the smallest misses explains the most.',
   honors:'Correlation r runs from −1 to 1. r² is the share of the variation the best line explains. The math computes r² for each choice and picks the largest.',
   ap:'Least squares: b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)², a = ȳ − b·x̄, and r² = 1 − SSE/SST.'},
  hint:{bio:'Lock in your pick. Then you will work out how much of the line it explains, from its correlation r.'},
  calc:{unit:'%',d:1,tol:0.6,
   prompt:{bio:sim=>{const F=fitFor(sim,sim.p.expl);return `For your pick, <b>${EX[sim.p.expl].toLowerCase()}</b>, over ${yrsLbl(sim)}, the correlation with the food line is <b>r = ${fr(r2d(F.r))}</b>. Square r to find the share of the ups and downs it explains. What percent is that?`;},
    ap:sim=>{const F=fitFor(sim,sim.p.expl);return `For your pick, <b>${EX[sim.p.expl].toLowerCase()}</b>, over ${yrsLbl(sim)}: the squared misses of the best line add to <b>SSE = ${s1(F.sse).toFixed(1)}</b>, and the total squared variation of the food line around its mean is <b>SST = ${s1(F.sst).toFixed(1)}</b>. Use r² = 1 − SSE/SST. What percent is explained?`;}},
   answer:calcAns,
   hint:{bio:'Multiply r by itself, then write the decimal as a percent. A negative r still gives a positive r².',ap:'Divide SSE by SST, subtract from 1, then write it as a percent.'},
   steps(sim){const e=sim.p.expl,F=fitFor(sim,e),a=calcAns(sim),out=[];
    if(atLeast('ap')){const q=s1(F.sse)/s1(F.sst);out.push(`SSE ÷ SST = ${s1(F.sse).toFixed(1)} ÷ ${s1(F.sst).toFixed(1)} = ${q.toFixed(4)}.`);out.push(`r² = 1 − ${q.toFixed(4)} = ${(1-q).toFixed(4)}, so <b>${a.toFixed(1)}%</b> of the ups and downs.`);out.push(`Check: r = ${fr(F.r)}, and ${sq(F.r)} ≈ ${(F.r*F.r).toFixed(3)}.`);}
    else{const r=r2d(F.r);out.push(`r² = ${sqx(r)} = ${(r*r).toFixed(4)}.`);out.push(`As a percent: <b>${a.toFixed(1)}%</b> of the ups and downs in the food line.`);}
    const others=Object.keys(EX).filter(k=>k!==e).map(k=>`${EX[k].toLowerCase()}, r = ${fr(r2d(fitFor(sim,k).r))}, r² ≈ ${pc(fitFor(sim,k).r2)}`).join('; ');
    out.push(`The other two choices, same years: ${others}.`);return out;}},
  formula(sim){const S=sim.gutS,ge=S&&S.g?S.g.ex:sim.p.expl,G=fitFor(sim,ge),M=fitFor(sim,bestEx(sim));
   let t=`Your pick: r = ${fr(G.r)}, so r² = ${sq(G.r)} ≈ ${pc(G.r2)} explained`;
   if(ge!==bestEx(sim))t+=`<br>${EX[bestEx(sim)]}: r = ${fr(M.r)}, so r² = ${sq(M.r)} ≈ ${pc(M.r2)} explained`;
   if(atLeast('honors')){const U=fitFor(sim,'unemp');t+=`<br>Best line (${yrsLbl(sim)}): food insecurity ≈ ${U.a.toFixed(2)} + ${U.b.toFixed(2)} × unemployment${lagOf(sim)?' the year before':''}`;}
   return t;},
  compare(sim,g,m){const yl=yrsLbl(sim);
   if(g.ex===m.ex)return `Your gut was right on: ${EX[g.ex].toLowerCase()} explains ${pc(g.v)} of the ups and downs over ${yl}. Predicting each year from it misses by about ${f1(g.miss)} points, the best of the three. ${sim.p.years==='all'?'Before the pandemic it explained 77%: the 2020–2024 aid and its expiration broke the pattern.':''}`+self(sim);
   return `${EX[m.ex]} explains <b>${pc(m.v)}</b> of the ups and downs over ${yl}; your pick explains <b>${pc(g.v)}</b>. In real terms: predicting each year from your pick misses by about <b>${f1(g.miss)} points</b> of households, against ${f1(m.miss)} points with ${EX[m.ex].toLowerCase()}. ${sim.p.years==='all'?'Before the pandemic, unemployment explained 77%.':''}`+self(sim);},
  again(sim){sim.p.expl='trend';sim.p.years=Math.random()<0.5?'all':'pre';sim.st.rev=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Fit only 2001–2019 and the best straight line is: food insecurity ≈ 10.72 + 1.14 × unemployment. In 2021 unemployment was 5.4%. What food insecurity rate (%) does the line predict for 2021?',answer:10.72+1.14*5.4,tol:0.15,unit:'%',d:1,hint:'Multiply 1.14 by 5.4 first, then add 10.72.',explain:'1.14 × 5.4 = 6.156, and 10.72 + 6.156 ≈ 16.9%. The real 2021 rate was 12.5%, so the residual (actual − predicted) is about −4.4 points: 2021 ran far below what jobs alone predict, the year pandemic aid and the expanded Child Tax Credit were paid.'},
  {lvl:'bio',instant:true,q:'Over all 24 years, unemployment and food insecurity have r = 0.60. About what share of the ups and downs does unemployment explain?',choices:['About 60%','About 36%','About 6%'],correct:1,explain:'r² = 0.60 × 0.60 = 0.36, so about 36%. Squaring matters: r = 0.60 sounds like 60%, but the share explained is 36%.'},
  {lvl:'bio',instant:true,q:'In 2020 unemployment jumped to 8.1%, yet food insecurity rose only to 14.8%, and in 2021 it fell to 12.5%. What best explains the broken pattern?',choices:['Unemployment stopped mattering','Pandemic aid, including SNAP increases and in 2021 the expanded Child Tax Credit, cushioned families','The numbers were made up'],correct:1,explain:'Based on 2001–2019, 8.1% unemployment predicts about 20% food insecurity. The real 2020 number was 14.8%. Then in 2022, as the expanded credit expired, it jumped to 17.3% even though unemployment fell to 3.6%.'},
  {lvl:'honors',instant:true,q:'A student says: “Food insecurity fell in 2021, so whoever was president fixed hunger.” What is the strongest problem with that?',choices:['Nothing: presidents control the economy','Many forces move the number: Congress writes the laws, the Federal Reserve sets interest rates, effects lag, and the 2021 aid expired a year later. A specific policy is easier to test than who was president.','Food insecurity cannot be measured'],correct:1,explain:'The 2021 drop and the 2022 jump both line up with specific laws starting and ending. That is testable. “Who was president” bundles everything together and cannot separate these causes.'},
  {lvl:'honors',instant:true,q:'From 2021 to 2022, unemployment fell from 5.4% to 3.6%, and food insecurity rose from 12.5% to 17.3%. The 2001–2019 fit gives about 1.14 points of food insecurity per point of unemployment. How far did food insecurity move against what unemployment predicts?',choices:['About 2 points','About 4.8 points','About 6.9 points'],correct:2,explain:'Predicted change: 1.14 × (3.6 − 5.4) ≈ −2.05 points. Actual change: +4.8 points. The gap is 4.8 − (−2.05) ≈ 6.9 points that unemployment cannot explain.'},
  {lvl:'ap',kind:'num',q:'Over 2001–2019, unemployment from the year before has r ≈ 0.69 with food insecurity. What percent of the variation does it explain? (Same-year unemployment explains about 77%.)',answer:69*69/100,tol:0.6,unit:'%',d:1,hint:'Square 0.69 and write it as a percent.',explain:'0.69² = 0.4761, about 48%. Last year’s jobs explain much less than this year’s, so in these data the effect does not lag by a year.'},
  {lvl:'ap',instant:true,q:'Over 2001–2019, unemployment and food insecurity have r ≈ 0.88. About what share of the year-to-year variation does unemployment explain?',choices:['About 88%','About 77%','About 94%'],correct:1,explain:'r² = 0.876² ≈ 0.77. Squaring matters: r = 0.88 sounds like 88%, but the share explained is 77%.'}
 ],
 tour:[
  {title:'The line',text:'Each red point is one year: the share of U.S. households with children that could not always afford enough food, from USDA. Presidents and parties are hidden on purpose.',pause:true,setup:sim=>BioLab.setValues(sim,{expl:'trend',years:'all',events:true,fit:false,lag:0,series:'food'})},
  {title:'Recessions',text:'The shaded bands are recessions. From 2007 to 2008 the line jumps from 15.8% to 21.0%, as the Great Recession hits.',pause:true,focus:[[150,30,260,350]]},
  {title:'Test unemployment',text:'Here is the unemployment rate (blue, right axis) and the best straight-line prediction from it (green, dashed). Over all 24 years, r = 0.60: it explains about 36% of the ups and downs.',pause:true,setup:sim=>BioLab.setValues(sim,{expl:'unemp'})},
  {title:'Before the pandemic',text:'Fit only 2001–2019 and unemployment explains 77% (r = 0.88). For almost two decades, hunger in families with kids rose and fell with jobs.',pause:true,setup:sim=>BioLab.setValues(sim,{years:'pre'})},
  {lvl:'honors',title:'The policy jump',text:'Carry that 2001–2019 line forward. In 2021 food insecurity was 4.4 points below what unemployment predicts, while the expanded Child Tax Credit and SNAP increases were paid. In 2022 it was 2.5 points above, after the expansion expired.',pause:true,setup:sim=>BioLab.setValues(sim,{years:'all',fit:true}),focus:[[560,30,200,350]]},
  {title:'Why not just credit a president?',text:'Many forces move a number at once: Congress writes laws, the Federal Reserve sets interest rates, and effects take time. A specific policy, like the 2021 credit starting and ending, is something you can actually test.',pause:true,setup:sim=>BioLab.setValues(sim,{fit:false,years:'all'})},
  {lvl:'honors',title:'Another policy test',text:'Child poverty (SPM) shows the same jump: 5.2% in 2021, 12.4% in 2022 after the expansion ended, and 13.7% in 2023.',pause:true,setup:sim=>BioLab.setValues(sim,{series:'child'})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{series:'food'});},
 lab:{bio:'<p><b>Question:</b> What moved hunger in families with kids?</p><ol><li>Lock in your pick. Then record r² for all three explanations, first for 2001–2024, then for 2001–2019.</li><li>Find two years where the line moved against unemployment.</li></ol><p>Write two sentences: which explanation wins, and what changed in 2020–2022?</p>',
  honors:'<p><b>Question:</b> Does a lag help?</p><ol><li>Record r² for unemployment from the same year and from the year before.</li><li>Turn on <b>Show what unemployment alone predicts</b> and record the 2021 and 2022 gaps.</li><li>Name the specific laws that line up with each gap.</li></ol>',
  ap:'<p><b>Question:</b> How big is the policy effect, and how sure can you be?</p><ol><li>Compute the 2021-to-2022 change unemployment cannot explain.</li><li>List two other things that changed in 2022 besides the Child Tax Credit.</li></ol><p><b>CER:</b> Claim, evidence from the residuals, and reasoning about what this design can and cannot prove.</p>'},
 terms:[
  {t:'Food insecurity',d:'USDA’s measure of households that could not always afford enough food for everyone at some point in the year.'},
  {t:'Recession',d:'A broad decline in the economy lasting more than a few months. Dates here are the official U.S. business-cycle dates.'},
  {t:'Correlation (r)',d:'A number from −1 to 1 that measures how closely two variables move together in a straight-line pattern.'},
  {t:'r²',d:'The share of the variation in one variable that a straight-line fit on another explains.',lvl:'honors'},
  {t:'Residual',d:'Actual value minus predicted value. Big residuals point to something the predictor leaves out.',lvl:'honors'},
  {t:'Lag',d:'A delay between a cause and its effect.',lvl:'honors'},
  {t:'Confounding',d:'When something else changes at the same time as the variable you are testing, so you cannot tell which one caused the effect.',lvl:'ap'}
 ],
 about:'<p><b>Data.</b> Food insecurity in households with children, 2001–2024, USDA Economic Research Service. USDA ended the annual report in 2025, so 2024 is the last official year. Unemployment: BLS annual averages. Recessions: March–November 2001, December 2007–June 2009, February–April 2020. A year counts as a recession year if any month of it was in a recession. Child poverty (Supplemental Poverty Measure): 5.2% (2021), 12.4% (2022), 13.7% (2023), from Census via Columbia’s Center on Poverty and Social Policy.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>A household counts as food insecure if it could not always afford enough food at some point in the year. One bad month and a whole hard year count the same.</li><li>Annual averages smooth over short swings: the 2020 recession lasted only February to April, but the yearly unemployment rate averages it with the recovery.</li><li>r measures only how well a straight line fits. A low r does not mean no connection, and a high r does not show what caused what.</li><li>USDA ended the annual report in 2025. If a later chart joins a different survey onto this line, check that the measure stayed the same before reading it as a trend.</li></ul>'+
  '<p><b>Model.</b> Each fit is a least-squares straight line on the years you choose. r² and the typical miss (root-mean-square error) are computed live. The “unemployment alone predicts” line is fit on 2001–2019 and carried forward. Correlation is not causation: other things changed in 2020–2022 too, so the gaps are evidence about pandemic-era policy, not proof of one law’s effect.</p>'+
  '<p>Presidents and parties are left off on purpose. A president is one of many forces on a number like this; specific programs and laws, named here, are easier to test.</p>'
};

function drawChild(sim,ctx,k){const L=110,R=520,T=60,B=380,Y=v=>B-v/16*(B-T),bw=(R-L)/3;
 txt(ctx,'Child poverty, Supplemental Poverty Measure (%)',20,26,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,5,10,15].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();txt(ctx,v+'%',L-8,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
 CHILD.forEach(([y,v],i)=>{const cx=L+bw*i+bw/2;ctx.fillStyle=i?PAL['s1']:PAL['s3'];rr(ctx,cx-bw*0.3,Y(v),bw*0.6,B-Y(v),4);ctx.fill();txt(ctx,f1(v)+'%',cx,Y(v)-6,{s:12*k,w:700,a:'center',b:'bottom'});txt(ctx,String(y),cx,B+8,{s:12*k,w:700,a:'center',b:'top'});});
 const mx=L+bw;ctx.strokeStyle=PAL['s5'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(mx,T-10);ctx.lineTo(mx,B);ctx.stroke();ctx.setLineDash([]);
 const tx=560;let y=80;y+=wrapT(ctx,'2021: expanded Child Tax Credit paid, fully refundable.',tx,y,220,{s:12*k,w:700,c:PAL['s3']})+12;
 y+=wrapT(ctx,'After 2021: the expansion expired.',tx,y,220,{s:12*k,w:700,c:PAL['s1']})+12;
 wrapT(ctx,'A specific policy that started and stopped is a test you can run. A party label is not.',tx,y,220,{s:12*k,c:PAL['cv-soft']});}
function wrapT(ctx,s,x,y,w,o){o=Object.assign({b:'top'},o||{});const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=sz*1.25,Ls=lines.slice(0,o.max||99);Ls.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return Ls.length*lh;}
BioLab.register(SIM);
})();
