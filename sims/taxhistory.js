(function(){
'use strict';
const {clamp,txt,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Sources for every figure are listed in `about`.
   CPI: BLS CPI annual averages (1982-84=100) as tabulated by the Federal Reserve Bank of Minneapolis. "Today" = 2025 dollars. */
const CPI={1913:9.9,1921:17.9,2021:271.0,1925:17.5,1944:17.6,1955:26.8,1965:31.5,1967:33.4,1975:53.8,1979:72.6,1982:96.5,1988:118.3,1995:152.4,2000:172.2,2005:195.3,2018:251.1,2025:321.9};
const NOW=2025;
/* Married-filing-jointly brackets, nominal dollars: [start of bracket, rate %]. Tax Foundation historical table (from IRS data);
   2005 from IRS Rev. Proc. 2004-71; 2025 from IRS. Before 1948 there were no joint brackets: the 1925 and 1944 schedules are the ones every filer used. */
const B65=[[0,14],[1000,15],[2000,16],[3000,17],[4000,19],[8000,22],[12000,25],[16000,28],[20000,32],[24000,36],[28000,39],[32000,42],[36000,45],[40000,48],[44000,50],[52000,53],[64000,55],[76000,58],[88000,60],[100000,62],[120000,64],[140000,66],[160000,68],[180000,69],[200000,70]];
const S=[
 {y:1925,law:'Revenue Act of 1926',sl:'1926 act',br:[[0,1.5],[4000,3],[8000,5],[10000,6],[14000,7],[16000,8],[18000,9],[20000,10],[22000,11],[24000,12],[28000,13],[32000,14],[36000,15],[40000,16],[44000,17],[48000,18],[52000,19],[56000,20],[60000,21],[64000,22],[70000,23],[80000,24],[100000,25]],
  ded:(N,n,k)=>3500+400*k,dl:'Exemptions: $3,500 for a married couple + $400 per child. No standard deduction yet.',pay:[]},
 {y:1944,law:'Revenue Act of 1942 and Individual Income Tax Act of 1944',sl:'1942 and 1944 acts',br:[[0,23],[2000,25],[4000,29],[6000,33],[8000,37],[10000,41],[12000,46],[14000,50],[16000,53],[18000,56],[20000,59],[22000,62],[26000,65],[32000,68],[38000,72],[44000,75],[50000,78],[60000,81],[70000,84],[80000,87],[90000,90],[100000,92],[150000,93],[200000,94]],
  ded:(N,n)=>500*n+Math.min(.1*N,500),dl:'Exemptions: $500 per person. Standard deduction: 10% of income, up to $500.',cap:.9,pay:[[1,3000]]},
 {y:1955,law:'Internal Revenue Code of 1954 (rates from the Revenue Act of 1951)',sl:'1954 code',br:[[0,20],[4000,22],[8000,26],[12000,30],[16000,34],[20000,38],[24000,43],[28000,47],[32000,50],[36000,53],[40000,56],[44000,59],[52000,62],[64000,65],[76000,69],[88000,72],[100000,75],[120000,78],[140000,81],[160000,84],[180000,87],[200000,89],[300000,90],[400000,91]],
  ded:(N,n)=>600*n+Math.min(.1*N,1000),dl:'Exemptions: $600 per person. Standard deduction: 10% of income, up to $1,000.',pay:[[2,4200]]},
 {y:1965,law:'Revenue Act of 1964',sl:'1964 act',br:B65,ded:(N,n)=>600*n+Math.max(Math.min(.1*N,1000),Math.min(1000,200+100*n)),dl:'Exemptions: $600 per person. Standard deduction: the larger of 10% of income or $200 + $100 per person, up to $1,000.',pay:[[3.625,4800]]},
 {y:1975,law:'Revenue Act of 1964 rates, Tax Reduction Act of 1975',sl:'1975 act',br:B65,ded:(N,n)=>750*n+Math.max(1900,Math.min(.16*N,2600)),dl:'Exemptions: $750 per person. Standard deduction: 16% of income, between $1,900 and $2,600. Credit: $30 per person.',cr:30,pay:[[5.85,14100]]},
 {y:1982,law:'Economic Recovery Tax Act of 1981',sl:'1981 act',br:[[0,0],[3400,12],[5500,14],[7600,16],[11900,19],[16000,22],[20200,25],[24600,29],[29900,33],[35200,39],[45800,44],[60000,49],[85600,50]],ded:(N,n)=>1000*n,dl:'Exemptions: $1,000 per person. The first $3,400 is a 0% bracket (the “zero bracket amount”), which did the job of a standard deduction.',pay:[[6.7,32400]]},
 {y:1988,law:'Tax Reform Act of 1986',sl:'1986 act',br:[[0,15],[29750,28],[71900,33],[149250,28]],ded:(N,n)=>1950*n+5000,dl:'Exemptions: $1,950 per person. Standard deduction: $5,000. A 33% “bubble” rate ran from $71,900 to $149,250, above the 28% top rate.',pay:[[7.51,45000]]},
 {y:1995,law:'Omnibus Budget Reconciliation Act of 1993',sl:'1993 act',br:[[0,15],[39000,28],[94250,31],[143600,36],[256500,39.6]],ded:(N,n)=>2500*n+6550,dl:'Exemptions: $2,500 per person. Standard deduction: $6,550.',pay:[[6.2,61200],[1.45,Infinity]]},
 {y:2005,law:'2001 and 2003 tax laws (EGTRRA, JGTRRA)',sl:'2001 and 2003 laws',br:[[0,10],[14600,15],[59400,25],[119950,28],[182800,33],[326450,35]],ded:(N,n)=>3200*n+10000,dl:'Exemptions: $3,200 per person. Standard deduction: $10,000. Child tax credit: $1,000 per child.',ctc:[1000,110000],pay:[[6.2,90000],[1.45,Infinity]]},
 {y:2018,law:'Tax Cuts and Jobs Act (2017)',sl:'2017 law',br:[[0,10],[19050,12],[77400,22],[165000,24],[315000,32],[400000,35],[600000,37]],ded:()=>24000,dl:'No personal exemptions. Standard deduction: $24,000. Child tax credit: $2,000 per child.',ctc:[2000,400000],pay:[[6.2,128400],[1.45,Infinity]],add:true},
 {y:2025,law:'2025 reconciliation law (Public Law 119-21)',sl:'P.L. 119-21',br:[[0,10],[23850,12],[96950,22],[206700,24],[394600,32],[501050,35],[751600,37]],ded:()=>31500,dl:'No personal exemptions. Standard deduction: $31,500. Child tax credit: $2,200 per child.',ctc:[2200,400000],pay:[[6.2,176100],[1.45,Infinity]],add:true}];
const SY=y=>S.find(s=>s.y===+y)||S[S.length-1];
function sched(br,x){let t=0;for(let i=0;i<br.length;i++){const lo=br[i][0],hi=i+1<br.length?br[i+1][0]:Infinity;if(x>lo)t+=(Math.min(x,hi)-lo)*br[i][1]/100;}return t;}
function marg(br,x){let r=br[0][1];br.forEach(b=>{if(x>b[0])r=b[1];});return r;}
/* One family, one year. real = income in 2025 dollars. All income is wages from a job covered by Social Security. */
function calc(s,real,kids,earners){const N=real*CPI[s.y]/CPI[NOW],n=2+kids,ded=s.ded(N,n,kids),ti=Math.max(0,N-ded),pre=sched(s.br,ti);let it=pre;
 if(s.cap)it=Math.min(it,s.cap*N);if(s.cr)it=Math.max(0,it-s.cr*n);let ctc=0;
 if(s.ctc&&kids){const red=N>s.ctc[1]?50*Math.ceil((N-s.ctc[1])/1000):0;ctc=Math.min(it,Math.max(0,s.ctc[0]*kids-red));it-=ctc;}
 const e=earners||1;let pt=0;s.pay.forEach(([r,base])=>{pt+=e*Math.min(N/e,base)*r/100;});if(s.add)pt+=Math.max(0,N-250000)*0.009;
 const toR=CPI[NOW]/CPI[s.y];return {N,ded,ti,pre,it,pt,ctc,mr:marg(s.br,ti),share:(it+pt)/N,itR:it*toR,ptR:pt*toR,take:(N-it-pt)*toR};}
const fam=(sim,y)=>calc(SY(y),sim.p.inc*1000,sim.p.kids,+sim.p.earn||1);
/* Top income tax rate by year (IRS, via FRED series IITTRHB; 2019-2025 from IRS brackets: 37%). */
const TOP=[[1913,7],[1916,15],[1917,67],[1918,77],[1919,73],[1922,58],[1923,43.5],[1924,46],[1925,25],[1929,24],[1930,25],[1932,63],[1936,79],[1940,81.1],[1941,81],[1942,88],[1944,94],[1946,86.45],[1948,82.13],[1950,84.36],[1951,91],[1952,92],[1954,91],[1964,77],[1965,70],[1968,75.25],[1969,77],[1970,71.75],[1971,70],[1981,69.125],[1982,50],[1987,38.5],[1988,28],[1991,31],[1993,39.6],[2001,39.1],[2002,38.6],[2003,35],[2013,39.6],[2018,37]];
/* Employee payroll tax rate, Social Security + Medicare (SSA). */
const PAY=[[1937,1],[1950,1.5],[1954,2],[1957,2.25],[1959,2.5],[1960,3],[1962,3.125],[1963,3.625],[1966,4.2],[1967,4.4],[1969,4.8],[1971,5.2],[1973,5.85],[1978,6.05],[1979,6.13],[1981,6.65],[1982,6.7],[1984,7],[1985,7.05],[1986,7.15],[1988,7.51],[1990,7.65]];
const stepAt=(arr,y)=>{let v=null;arr.forEach(a=>{if(y>=a[0])v=a[1];});return v;};
const MARKS=[[1913,7,'7%'],[1921,73,'73%'],[1928,25,'25%'],[1944,94,'94%'],[1959,91,'91%'],[1976,70,'70%'],[1985,50,'50%'],[1989,28,'28%',1],[1997,39.6,'39.6%'],[2008,35,'35%'],[2021,37,'37%']];
/* Census CPS money income, households, 2021 dollars (R-CPI-U-RS): mean income by fifth and top 5%, and share of all income (%).
   P60-276, Tables A-4a and A-4b. 2025 shares from P60-289. */
const GR=['Bottom fifth','Second fifth','Middle fifth','Fourth fifth','Top fifth','Top 5%'];
const GRs=['Bottom','Second','Middle','Fourth','Top fifth','Top 5%'];
const CEN={1967:{m:[11378,31526,50337,70428,126743,199925],s:[4.0,10.8,17.3,24.2,43.6,17.2],lim:[21337,41607,59053,84210,135134]},
 1979:{m:[13985,34784,57348,84156,151031,230339],s:[4.1,10.2,16.8,24.6,44.2,16.9],lim:[24436,45381,69820,101234,163580]},
 2000:{m:[16025,40011,66631,103581,224458,398210],s:[3.6,8.9,14.8,23.0,49.8,22.1],lim:[28272,52064,82315,129002,229113]},
 2019:{m:[16199,43082,73058,117752,269655,478081],s:[3.1,8.3,14.1,22.7,51.9,23.0],lim:[29762,56700,91657,151017,286138]},
 2021:{m:[14859,41025,70879,115462,269356,480236],s:[2.9,8.0,13.9,22.6,52.7,23.5],lim:[28007,55000,89744,149131,286304]}};
const SH25=[3.0,8.2,13.9,22.5,52.4,23.5];
const PER={p6779:[1967,1979],p7900:[1979,2000],p0021:[2000,2021],p7921:[1979,2021],p6721:[1967,2021],p1921:[2019,2021]};
const per=sim=>PER[sim.p.per]||PER.p7921;
const chg=(sim,i)=>{const [a,b]=per(sim);return {a:CEN[a].m[i],b:CEN[b].m[i],d:CEN[b].m[i]-CEN[a].m[i],pc:(CEN[b].m[i]/CEN[a].m[i]-1)*100,sa:CEN[a].s[i],sb:CEN[b].s[i]};};
const crosses=sim=>{const [a,b]=per(sim);const br=[];if(a<1993&&b>=1993)br.push('1993');if(a<2013&&b>=2013)br.push('2013');return br;};
/* Fed Distributional Financial Accounts, share of net worth (%): bottom 50, 50-90, 90-99, top 1. */
const DFA={a:{l:'1989 Q3',s:[3.5,35.7,38.0,22.8]},b:{l:'2026 Q2',s:[2.3,28.8,36.4,32.5]}};
function giniPts(p,s){let a=0,L=0;for(let i=0;i<p.length;i++){const L2=L+s[i]/100;a+=p[i]*(L+L2)/2;L=L2;}return 1-2*a;}
const DFAP=[.5,.4,.09,.01],Q5=[.2,.2,.2,.2,.2];
/* Gut questions. */
const GQ={g_bot:{l:'Bottom fifth',i:0,kind:'g'},g_mid:{l:'Middle fifth',i:2,kind:'g',lvl:'honors'},g_top5:{l:'Top 5%',i:5,kind:'g'},t_1955:{l:'Tax, 1955 rules',y:1955,kind:'t'},t_2025:{l:'Tax, 2025 rules',y:2025,kind:'t'}};
const gq=sim=>GQ[sim.p.gq]||GQ.g_bot;
const truth=sim=>{const q=gq(sim);return q.kind==='g'?chg(sim,q.i).pc:fam(sim,q.y).share*100;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The answer stays hidden while the student works it out ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g&&!pend(sim)));
const hideG=sim=>!shown(sim)&&gq(sim).kind==='g';
const hideT=(sim,y)=>!shown(sim)&&gq(sim).kind==='t'&&gq(sim).y===+y;
const usd=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US');
const usdK=v=>{const a=Math.abs(v);return (v<0?'−':'')+(a>=1e6?'$'+(a/1e6).toFixed(2)+'M':a>=1e4?'$'+Math.round(a/1000)+'k':'$'+Math.round(a).toLocaleString('en-US'));};
const sgn=v=>(v>0?'+':v<0?'−':'±');
const pct=(v,d)=>sgn(v)+Math.abs(v).toFixed(d==null?1:d)+'%';
const p1=v=>v.toFixed(1)+'%';
const u2=v=>'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const calcAns=sim=>Math.round(truth(sim)*100)/100;
const gqKindTol=a=>0.15;
/* The pieces of one year's federal tax for this family, in that year's dollars, for "Your turn". */
function taxParts(sim,y){const s=SY(y),r=fam(sim,y),out=[],sl=[];
 for(let i=0;i<s.br.length;i++){const lo=s.br[i][0],hi=i+1<s.br.length?s.br[i+1][0]:Infinity;if(r.ti>lo){const w=Math.min(r.ti,hi)-lo;sl.push({rate:s.br[i][1],lo,hi,w,t:w*s.br[i][1]/100});}}
 return {s,r,sl};}
function payText(s,e){return s.pay.map(([rt,base])=>base===Infinity?`${rt}% of all wages`:`${rt}% of wages up to ${usd(base)}${e>1?' per earner':''}`).join(' plus ')+(s.add?' (plus 0.9% above $250,000)':'');}
function credText(s,sim){const n=2+sim.p.kids;if(s.cr)return ` A $${s.cr} credit per person (${n} people) comes off the income tax.`;if(s.ctc&&sim.p.kids)return ` A ${usd(s.ctc[0])} credit per child (${sim.p.kids}) comes off the income tax.`;if(s.cap)return ' Income tax cannot be more than 90% of income.';return '';}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function onGq(sim){clearGut(sim);const q=gq(sim);const v=q.kind==='g'?'groups':'family';if(sim.p.view!==v)BioLab.setValues(sim,{view:v});if(q.kind==='t'&&String(sim.p.yr)!==String(q.y))BioLab.setValues(sim,{yr:String(q.y)});}
function famLabel(sim){const k=sim.p.kids;return `Married couple, ${k===0?'no children':k===1?'1 child':k+' children'}, ${usd(sim.p.inc*1000)} a year in 2025 dollars`;}
function placeOf(v,lim){let i=0;while(i<5&&v>lim[i])i++;return i;} /* 0..4 = fifth; 5 = above 95th percentile handled separately */
const PLACE=['bottom fifth','second fifth','middle fifth','fourth fifth','top fifth'];
function placeText(sim,y){const L=CEN[y].lim,v=sim.p.hh*1000,i=placeOf(v,L.slice(0,4));return i===4&&v>L[4]?'top 5%':PLACE[i];}

/* ---------- drawing ---------- */
function wrap(ctx,str,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=str.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
function bg(ctx){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,500);}
function drawGroups(sim,ctx,k){const ph=k>1.4,hid=hideG(sim),G=GS(sim),q=gq(sim),[a,b]=per(sim),meas=atLeast('honors')?sim.p.meas:'census';
 if(meas==='cbo'){drawCBO(ctx,k,ph);return;}if(meas==='pew'){drawPew(ctx,k,ph);return;}
 txt(ctx,ph?`Real mean income, ${a} → ${b}`:`Average income of each group, ${a} vs. ${b}, in 2021 dollars (Census)`,20,22*k,{s:14*k,w:700});
 const top=Math.round(34*k+14),rowH=Math.round((300-top)/6),LX=ph?104:120,BX0=LX+8,BW=ph?250:300,sc=BW/500000;
 const cx=BX0+BW+12;
 if(!ph){txt(ctx,'Change (dollars, percent)',cx,top-4,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Share of all income',640,top-4,{s:12*k,c:PAL['cv-soft']});}
 for(let i=0;i<6;i++){const y=top+i*rowH+4,c=chg(sim,i),mid=y+rowH/2-2;
  txt(ctx,ph?GRs[i]:GR[i],LX,mid,{s:12*k,w:700,a:'right',b:'middle'});
  const h=Math.max(6,(rowH-10)/2);
  ctx.fillStyle=PAL['line'];ctx.fillRect(BX0,mid-h-1,Math.max(2,c.a*sc),h);
  if(!hid){ctx.fillStyle=c.d>=0?PAL['s2']:PAL['s1'];ctx.fillRect(BX0,mid+1,Math.max(2,c.b*sc),h);}
  else{ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,4]);ctx.strokeRect(BX0,mid+1,Math.max(8,c.a*sc),h);ctx.setLineDash([]);}
  const gi=G&&G.g&&GQ[G.g.q]&&GQ[G.g.q].kind==='g'?GQ[G.g.q].i:(hid&&q.kind==='g'?q.i:-1);
  if(hid){const t=i===q.i?`Your guess: ${pct(sim.p.guess,0)}`:'?';txt(ctx,t,cx,mid,{s:12*k,w:700,c:i===q.i?PAL['s4']:PAL['cv-soft'],b:'middle'});}
  else{const t=ph?`${pct(c.pc)}`:`${sgn(c.d)}${usd(Math.abs(c.d)).slice(0)} (${pct(c.pc)})`;txt(ctx,t,cx,mid,{s:12*k,w:700,c:c.d>=0?PAL['s3']:PAL['s1'],b:'middle'});
   if(gi===i&&G&&G.g&&!ph){txt(ctx,`your gut ${pct(G.g.guess,0)}`,cx,mid+13*k,{s:12*k,c:PAL['s4'],b:'middle'});}
   if(!ph){const ds=c.sb-c.sa;txt(ctx,`${p1(c.sa)} → ${p1(c.sb)}`,640,mid,{s:12*k,b:'middle'});txt(ctx,(ds>0?'▲':ds<0?'▼':'=')+Math.abs(ds).toFixed(1),790,mid,{s:12*k,w:700,a:'right',b:'middle',c:ds>0?PAL['s3']:ds<0?PAL['s1']:PAL['cv-soft']});}}}
 /* legend */
 const ly=top+6*rowH+12;ctx.fillStyle=PAL['line'];ctx.fillRect(20,ly-5*k,12*k,8*k);txt(ctx,String(a),20+16*k,ly,{s:12*k,b:'middle'});
 ctx.fillStyle=PAL['s2'];ctx.fillRect(80*k,ly-5*k,12*k,8*k);txt(ctx,hid?`${b}: hidden until you lock your guess`:String(b),80*k+16*k,ly,{s:12*k,b:'middle'});
 if(G&&G.m&&gq(sim).kind==='g'&&!ph){const q=gq(sim),c=chg(sim,q.i);txt(ctx,`The math: (${usd(c.b)} − ${usd(c.a)}) ÷ ${usd(c.a)} × 100 = ${pct(c.pc)}`,790,ly,{s:12*k,w:700,c:PAL['rj'],a:'right',b:'middle'});}
 const br=crosses(sim);let ly2=ly;if(br.length){ly2=ly+17*k;txt(ctx,ph?`Survey breaks: ${br.join(', ')}`:`Survey changes in ${br.join(' and ')} break the series: treat the change as approximate.`,20,ly2,{s:12*k,c:PAL['cv-soft'],b:'middle'});}
 /* ladder: where an example household falls */
 drawLadder(sim,ctx,k,ph,Math.round(ly2+14*k));}
function drawLadder(sim,ctx,k,ph,y0){const [a,b]=per(sim),H=500-y0-6;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,y0,784,H,10);ctx.fill();
 const X0=24,X1=776,mx=350000,X=v=>X0+Math.min(v,mx)/mx*(X1-X0),v=sim.p.hh*1000;
 txt(ctx,ph?`Example household: ${usd(v)}`:`Example household: ${usd(v)} a year (2021 dollars). Where does it fall?`,X0,y0+15*k,{s:12*k,w:700});
 const rowY=[y0+H*0.52,y0+H*0.84],yrs=[a,b];
 yrs.forEach((yy,j)=>{const L=CEN[yy].lim,ry=rowY[j],col=j?PAL['s2']:PAL['cv-soft'];
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(X0,ry);ctx.lineTo(X1,ry);ctx.stroke();
  const hideB=j===1&&hideG(sim);
  if(!hideB)L.forEach((l,i)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(l),ry-8);ctx.lineTo(X(l),ry+8);ctx.stroke();});
  txt(ctx,String(yy),X1,ry-10,{s:12*k,w:700,c:col,a:'right'});
  const place=hideB?'?':placeText(sim,yy);ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(X(v),ry,6,0,7);ctx.fill();
  if(ph){txt(ctx,place,X1-62*k,ry-10,{s:12*k,w:700,c:PAL['s4'],a:'right'});return;}
  const lab=place;ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(lab).width;txt(ctx,lab,clamp(X(v),X0+w/2,X1-60-w/2),ry-12,{s:12*k,w:700,c:PAL['s4'],a:'center'});});
 if(!ph){txt(ctx,'Tick marks: the 20th, 40th, 60th, 80th and 95th percentile limits. Scale runs to $350,000.',X0,y0+H-4,{s:12*k,c:PAL['cv-soft']});}}
function drawCBO(ctx,k,ph){txt(ctx,ph?'CBO, 1979 vs. 2023':'CBO counts more: benefits, taxes, capital gains (1979 vs. 2023, 2023 dollars)',20,22*k,{s:14*k,w:700});
 if(ph){const L=['Average income before transfers and taxes:','Bottom fifth $19,000 → $28,500 (+50%)','Top fifth $179,700 → $409,300 (+128%)','Share after transfers and taxes:','Bottom fifth 8% → 8%','Middle three fifths: down 5 points','Top 1% 7% → 13%','Before transfers and taxes: bottom fifth 5% → 4%, top 1% 9% → 16%.'];
  let y=52*k;L.forEach((t,i)=>{const hd=i===0||i===3;y=wrap(ctx,t,20,y,760,17*k,{s:12*k,w:hd?700:400,c:hd||i===7?PAL['cv-soft']:PAL['cv-ink']})+(hd?17*k:19*k);});return;}
 const rows=[['Bottom fifth',19000,28500],['Top fifth',179700,409300]],X0=170,W=360,sc=W/420000;
 txt(ctx,'Average income before transfers and taxes',20,52*k,{s:12*k,w:700,c:PAL['cv-soft']});
 rows.forEach((r,i)=>{const y=64*k+i*38*k;txt(ctx,r[0],X0-8,y+9*k,{s:12*k,w:700,a:'right',b:'middle'});ctx.fillStyle=PAL['line'];ctx.fillRect(X0,y,r[1]*sc,8*k);ctx.fillStyle=PAL['s2'];ctx.fillRect(X0,y+10*k,r[2]*sc,8*k);
  txt(ctx,`${usd(r[1])} → ${usd(r[2])} (${pct((r[2]/r[1]-1)*100,0)})`,X0+r[2]*sc+8,y+9*k,{s:12*k,w:700,c:PAL['s3'],b:'middle'});});
 const y2=150*k;txt(ctx,'Share of all income after transfers and taxes',20,y2,{s:12*k,w:700,c:PAL['cv-soft']});
 [['Bottom fifth','8%','8%','unchanged'],['Middle three fifths','','','down 5 points'],['Top 1%','7%','13%','up 6 points']].forEach((r,i)=>{const y=y2+22*k+i*24*k;txt(ctx,r[0],X0-8,y,{s:12*k,w:700,a:'right',b:'middle'});
  txt(ctx,r[1]?`${r[1]} → ${r[2]}: ${r[3]}`:r[3],X0,y,{s:12*k,b:'middle'});});
 let y3=y2+100*k;txt(ctx,'Before transfers and taxes, shares moved more: bottom fifth 5% → 4%, top 1% 9% → 16%.',20,y3,{s:12*k,c:PAL['cv-soft']});
 y3=wrap(ctx,'In 2023, average individual income tax rates ran from −11% for the bottom fifth (refundable credits pay out more than the tax) to 16% for the top fifth.',20,y3+22*k,760,17*k,{s:12*k});
 wrap(ctx,'CBO adds Social Security, Medicare, Medicaid, SNAP, employer health insurance and realized capital gains, then subtracts federal taxes. Census money income counts none of the noncash items and no capital gains.',20,y3+22*k,760,17*k,{s:12*k,c:PAL['cv-soft']});}
function drawPew(ctx,k,ph){txt(ctx,ph?'Pew: income tiers':'Pew: lower, middle and upper tiers (size-adjusted, 2023 dollars)',20,22*k,{s:14*k,w:700});
 const T=[['Lower income',27,30,22800,35300,10,8],['Middle income',61,51,66400,106100,62,43],['Upper income',11,19,144100,256900,29,48]];
 const hy=48*k;if(!ph){txt(ctx,'Share of Americans',200,hy,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Median income, 3 people',400,hy,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Share of all income',640,hy,{s:12*k,c:PAL['cv-soft']});}
 T.forEach((r,i)=>{const y=(ph?40*k:hy+30*k)+i*(ph?68:44)*k;txt(ctx,r[0],20,y,{s:12*k,w:700,b:'middle'});
  const lh=ph?16*k:0,xa=ph?36:200,xb=ph?36:400,xc=ph?36:640;
  txt(ctx,ph?`${r[1]}% → ${r[2]}% of people (1971 → 2023)`:`${r[1]}% → ${r[2]}% (1971 → 2023)`,xa,y+lh,{s:12*k,b:'middle'});
  txt(ctx,`${ph?'median ':''}${usdK(r[3])} → ${usdK(r[4])} (${pct((r[4]/r[3]-1)*100,0)})`,xb,y+2*lh,{s:12*k,w:700,c:PAL['s3'],b:'middle'});
  txt(ctx,`${r[5]}% → ${r[6]}% of income`,xc,y+3*lh,{s:12*k,b:'middle',c:r[6]>r[5]?PAL['s3']:PAL['s1']});});
 if(!ph)txt(ctx,'Median incomes and income shares: 1970 → 2022. Tiers: below 2/3 of the median, 2/3 to 2 times the median, above 2 times.',20,hy+170*k,{s:12*k,c:PAL['cv-soft']});
 wrap(ctx,'Every tier’s median rose; the middle tier’s share of people and of income fell.',20,ph?40*k+3*68*k:hy+190*k,760,17*k,{s:12*k,w:700});}

function famLay(k){const ph=k>1.4,sh=Math.round((ph?5:4)*19*k+14),stripY=500-sh,B=stripY-Math.round(30*k);return {T:Math.round(44+(ph?46:36)*k),B,stripY};}
function drawFamily(sim,ctx,k){const ph=k>1.4,Q=famLay(k),G=GS(sim),sel=+sim.p.yr;
 txt(ctx,ph?`${usd(sim.p.inc*1000)}, ${sim.p.kids} kids (2025 $)`:famLabel(sim),20,20*k,{s:14*k,w:700});
 /* legend */
 let lx=20;const lg=(c,l)=>{ctx.fillStyle=c;ctx.fillRect(lx,34*k,10*k,10*k);txt(ctx,l,lx+14*k,39*k,{s:12*k,b:'middle'});ctx.font='400 '+(12*k)+'px '+FONT;lx+=14*k+ctx.measureText(l).width+16;};
 lg('#c0504d','Income tax');lg('#b8862b','Payroll tax');lg('#3f6fb0','Take-home');
 const n=S.length,W=760/n,bw=Math.min(46,W-14),H=Q.B-Q.T;
 S.forEach((s,i)=>{const r=calc(s,sim.p.inc*1000,sim.p.kids,+sim.p.earn||1),x=20+i*W+(W-bw)/2,hide=hideT(sim,s.y);
  if(s.y===sel){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x-6,Q.T-24*k,bw+12,H+24*k+22*k,6);ctx.fill();}
  if(hide){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeRect(x,Q.T,bw,H);ctx.setLineDash([]);txt(ctx,'?',x+bw/2,Q.T+H/2,{s:26*Math.min(k,1.4),w:700,c:PAL['s4'],a:'center',b:'middle'});
   const g=sim.p.guess;txt(ctx,`gut ${Math.round(g)}%`,x+bw/2,Q.T-10*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  else{const hi=r.it/r.N*H,hp=r.pt/r.N*H;ctx.fillStyle='#3f6fb0';ctx.fillRect(x,Q.T+hi+hp,bw,H-hi-hp);ctx.fillStyle='#b8862b';ctx.fillRect(x,Q.T+hi,bw,hp);ctx.fillStyle='#c0504d';ctx.fillRect(x,Q.T,bw,hi);
   if(!ph||i%2===0||s.y===sel)txt(ctx,(r.share*100).toFixed(r.share<0.1?1:0)+'%',x+bw/2,Q.T-10*k,{s:12*k,w:700,a:'center'});
   if(G&&G.g&&GQ[G.g.q]&&GQ[G.g.q].kind==='t'&&GQ[G.g.q].y===s.y){const gy=Q.T+clamp(G.g.guess,0,100)/100*H;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-5,gy);ctx.lineTo(x+bw+5,gy);ctx.stroke();}}
  txt(ctx,String(s.y),x+bw/2,Q.B+14*k,{s:12*k,w:s.y===sel?700:400,c:s.y===sel?PAL['cv-ink']:PAL['cv-soft'],a:'center'});});
 /* strip: the chosen year, step by step */
 const s=SY(sel),r=calc(s,sim.p.inc*1000,sim.p.kids,+sim.p.earn||1),sy=Q.stripY,lh=19*k,hide=hideT(sim,s.y);
 ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,sy-6,784,500-sy,10);ctx.fill();
 txt(ctx,ph?`${s.y} rules`:`${s.y} rules: ${s.law}`,22,sy+12*k,{s:12*k,w:700});
 if(ph){const P=[`Taxable: ${usd(r.ti)} (${s.y} dollars)`,hide?'Income tax: ?':`Income tax: ${usd(r.it)} (top bracket ${r.mr}%)`,hide?'Payroll tax: ?':`Payroll tax: ${usd(r.pt)}`,hide?'Take-home: ?':`Take-home: ${usd(r.take)} (2025 $)`];
  P.forEach((t,i)=>txt(ctx,t,22,sy+12*k+(i+1)*lh,{s:12*k,w:i===3?700:400}));return;}
 const L=[`Income in ${s.y} dollars: ${usd(r.N)}`,`Deductions and exemptions: ${usd(Math.min(r.ded,r.N))}`,`Taxable income: ${usd(r.ti)}`];
 const R=hide?['Income tax: ?','Payroll tax: ?','Take-home (2025 $): ?']:[`Income tax: ${usd(r.it)}  (top bracket reached: ${r.mr}%)`,`Payroll tax: ${usd(r.pt)}`,`Take-home: ${usd(r.take)} in 2025 dollars`];
 L.forEach((t,i)=>txt(ctx,t,22,sy+12*k+(i+1)*lh,{s:12*k}));
 R.forEach((t,i)=>txt(ctx,t,410,sy+12*k+(i+1)*lh,{s:12*k,w:i===2?700:400}));}

function drawRates(sim,ctx,k){const ph=k>1.4,L=Math.round(30+20*k),R=780,T=Math.round(34+16*k),B=Math.round(330-(k-1)*20),X=y=>L+(y-1913)/(2025-1913)*(R-L),Y=v=>B-v/100*(B-T),sel=+sim.p.yr;
 txt(ctx,ph?'Top tax rate, 1913 to 2025':'Top federal income tax rate and the payroll tax rate a worker pays, 1913 to 2025',20,18*k,{s:14*k,w:700});
 [0,25,50,75,100].forEach(v=>{ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.6;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+'%',L-6,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
 [1913,1940,1960,1980,2000,2025].forEach(y=>txt(ctx,String(y),X(y),B+15*k,{s:12*k,c:PAL['cv-soft'],a:y===2025?'right':y===1913?'left':'center'}));
 const stepLine=(arr,c,w,from)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();let first=true;for(let y=from;y<=2025;y++){const v=stepAt(arr,y);if(v==null)continue;const x0=X(y),x1=X(Math.min(y+1,2025));if(first){ctx.moveTo(x0,Y(v));first=false;}else ctx.lineTo(x0,Y(v));ctx.lineTo(x1,Y(v));}ctx.stroke();};
 stepLine(TOP,PAL['s1'],3,1913);stepLine(PAY,PAL['s4'],3,1937);
 MARKS.forEach(m=>{if(ph&&['1913','1997','2008'].includes(String(m[0])))return;txt(ctx,m[2],X(m[0]),m[3]?Y(m[1])+16*k:Y(m[1])-9,{s:12*k,w:700,c:PAL['s1'],a:'center'});});
 txt(ctx,ph?'Payroll tax':'Payroll tax (employee share)',ph?X(1960):X(1990),Y(7.65)-10,{s:12*k,w:700,c:PAL['s4'],a:'center'});
 /* chosen year */
 const s=SY(sel),tr=s.br[s.br.length-1];ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([3,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(s.y),T);ctx.lineTo(X(s.y),B);ctx.stroke();ctx.setLineDash([]);
 const sy=B+Math.round(28*k),lh=19*k;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,sy-6,784,500-sy,10);ctx.fill();
 const real=tr[0]*CPI[NOW]/CPI[s.y];
 txt(ctx,`${s.y}: top rate ${tr[1]}%`+(ph?'':`, set by the ${s.law}`),22,sy+12*k,{s:12*k,w:700});
 txt(ctx,ph?`Starts at ${usd(tr[0])} taxable`:`It applied only to taxable income above ${usd(tr[0])} (${s.y<1948?'every filer':'married couple'})${s.y===NOW?'.':`, about ${usdK(real)} in 2025 dollars.`}`,22,sy+12*k+lh,{s:12*k});
 if(ph)txt(ctx,`= ${usdK(real)} in 2025 dollars`,22,sy+12*k+2*lh,{s:12*k});
 const pay=s.pay.length?s.pay.map(p=>p[1]===Infinity?`${p[0]}% on all wages`:`${p[0]}% up to ${usd(p[1])}`).join(' + '):'none yet (Social Security began in 1937)';
 txt(ctx,ph?`Payroll: ${s.pay.length?s.pay.map(p=>p[0]+'%').join('+'):'none'}`:`Payroll tax on a worker that year: ${pay}${s.add?' (+0.9% over $250,000)':''}.`,22,sy+12*k+(ph?3:2)*lh,{s:12*k});
 if(!ph)txt(ctx,'1925: 3.60% of the population filed an income tax return. 2025: about 94% of workers are covered by the payroll tax.',22,sy+12*k+3*lh,{s:12*k,c:PAL['cv-soft']});}

function drawWealth(sim,ctx,k){const ph=k>1.4,inc=sim.p.lz==='income',S0=Math.round(ph?210:300),L=Math.round(40+16*k),T=Math.round(30+18*k),X=p=>L+p*S0,Y=v=>T+S0-v*S0;
 txt(ctx,inc?(ph?'Income: Lorenz curves':'Who gets the income? Lorenz curves, Census money income'):(ph?'Wealth: Lorenz curves':'Who owns the wealth? Lorenz curves, Federal Reserve'),20,20*k,{s:14*k,w:700});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(L,T,S0,S0);ctx.setLineDash([5,5]);ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(1),Y(1));ctx.stroke();ctx.setLineDash([]);
 txt(ctx,'Perfect equality',X(.62),Y(.66)-6,{s:12*k,c:PAL['cv-soft'],a:'right'});
 [0,.5,1].forEach(p=>{txt(ctx,Math.round(p*100)+'%',X(p),T+S0+14*k,{s:12*k,c:PAL['cv-soft'],a:'center'});if(p>0)txt(ctx,Math.round(p*100)+'%',L-5,Y(p),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});});
 txt(ctx,ph?'share of households →':'Share of households, poorest first →',X(.5),T+S0+30*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
 const sets=inc?[{l:'1967',p:Q5,s:CEN[1967].s.slice(0,5),c:PAL['cv-soft']},{l:'2025',p:Q5,s:SH25.slice(0,5),c:PAL['s1']}]:[{l:DFA.a.l,p:DFAP,s:DFA.a.s,c:PAL['cv-soft']},{l:DFA.b.l,p:DFAP,s:DFA.b.s,c:PAL['s1']}];
 sets.forEach(st=>{ctx.strokeStyle=st.c;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Y(0));let P=0,C=0;st.p.forEach((p,i)=>{P+=p;C+=st.s[i]/100;ctx.lineTo(X(P),Y(C));});ctx.stroke();
  P=0;C=0;st.p.forEach((p,i)=>{P+=p;C+=st.s[i]/100;ctx.fillStyle=st.c;ctx.beginPath();ctx.arc(X(P),Y(C),4,0,7);ctx.fill();});});
 /* right panel: shares */
 const rx=L+S0+(ph?20:40);let y=T+6;
 const labs=inc?(ph?['Bottom','Second','Middle','Fourth','Top']:['Bottom fifth','Second fifth','Middle fifth','Fourth fifth','Top fifth']):(ph?['Bottom 50%','50-90th','90-99th','Top 1%']:['Bottom 50%','50th to 90th','90th to 99th','Top 1%']);
 ctx.font='400 '+(12*k)+'px '+FONT;const lw=Math.max(...labs.map(l=>ctx.measureText(l).width));ctx.font='700 '+(12*k)+'px '+FONT;const cw=ctx.measureText('2026 Q2').width+14,c0=rx+lw+10+cw;
 txt(ctx,'Share of the total',rx,y,{s:12*k,w:700});y+=20*k;
 sets.forEach((st,j)=>{txt(ctx,st.l,c0+j*cw,y,{s:12*k,w:700,c:st.c,a:'right'});});y+=18*k;
 labs.forEach((l,i)=>{txt(ctx,l,rx,y,{s:12*k});sets.forEach((st,j)=>txt(ctx,st.s[i].toFixed(1)+'%',c0+j*cw,y,{s:12*k,w:700,a:'right',c:st.c}));y+=18*k;});
 y+=8*k;const gs=sets.map(st=>giniPts(st.p,st.s));
 txt(ctx,ph?'Gini from these points':'Gini from these points only',rx,y,{s:12*k,w:700});y+=18*k;
 txt(ctx,`${sets[0].l}: ${gs[0].toFixed(3)}   ${sets[1].l}: ${gs[1].toFixed(3)}`,rx,y,{s:12*k});y+=18*k;
 if(!ph){txt(ctx,inc?'Census’s own 2025 Gini, from every household: 0.490.':'Each straight segment hides the inequality inside a group,',rx,y,{s:12*k,c:PAL['cv-soft']});y+=16*k;
  txt(ctx,inc?'Straight segments hide inequality inside each fifth.':'so these Ginis are lower bounds.',rx,y,{s:12*k,c:PAL['cv-soft']});}}

function draw(sim,ctx,vdt,k){sim._k=k;bg(ctx);const v=sim.p.view;
 if(v==='family')drawFamily(sim,ctx,k);else if(v==='rates')drawRates(sim,ctx,k);else if(v==='wealth')drawWealth(sim,ctx,k);else drawGroups(sim,ctx,k);}

/* ---------- info panel ---------- */
function infoHTML(sim){const v=sim.p.view,[a,b]=per(sim);let h='';
 if(v==='groups'){const c0=chg(sim,0),c5=chg(sim,5);
  h+=`<h3>What this number hides</h3><ul><li>The bottom fifth in ${a} and in ${b} are not the same households. People move between fifths as they finish school, change jobs, marry, retire or lose work. These averages compare two snapshots, not one family’s life.</li><li>An average hides the spread inside a group. In ${b}, the bottom fifth runs from $0 up to ${usd(CEN[b].lim[0])}, and the top 5% has no upper limit.</li><li>Census money income is before taxes and leaves out capital gains and noncash benefits such as SNAP, health benefits and housing help. CBO counts those and finds faster growth for the bottom fifth: switch <b>Which measure?</b> (Closer look) to compare.</li></ul>`;}
 else if(v==='family'){const r55=fam(sim,1955),r25=fam(sim,2025);
  h+=`<h3>What this number hides</h3><ul><li>A top rate is a <b>marginal</b> rate: it applies only to dollars above the top bracket’s start. In 1955 that start was $400,000 of taxable income for a couple, about $4.80M in 2025 dollars. In 1950, fewer than 10,000 households had enough income to reach the top bracket.</li><li>This model taxes wages only. In the 1950s, high earners could take income in forms taxed at lower rates, such as capital gains, and use deductions. Using Piketty, Saez and Zucman’s data, the Tax Foundation reports the top 1% paid an average of 42.0% of income in federal, state and local taxes in the 1950s, against 36.4% in 2014.</li><li>The same real income meant a different place in society. In 1967, the first year of Census’s table, a household with ${usd(sim.p.inc*1000)} of 2025 income would have been ${sim.p.inc*1000*CPI[2021]/321.9>CEN[1967].lim[3]?'in the top fifth':sim.p.inc*1000*CPI[2021]/321.9>CEN[1967].lim[2]?'in the fourth fifth':'below the fourth fifth'} (approximate).</li></ul>`;
  if(!hideT(sim,1955)&&!hideT(sim,2025))h+=`<p><b>This household:</b> ${p1(r55.share*100)} of income in federal income plus payroll tax under 1955 rules, ${p1(r25.share*100)} under 2025 rules.</p>`;}
else if(v==='rates'){h+=`<h3>What this number hides</h3><p>The top rate tells you nothing about who paid it. In 1925, 3.60% of the population filed an income tax return at all. In 2025, about 94% of workers are covered by Social Security, so nearly every paycheck shows payroll tax. A family can face a low income tax and still pay 7.65% of wages in payroll tax.</p>`;}
 else{const g1=giniPts(DFAP,DFA.a.s),g2=giniPts(DFAP,DFA.b.s);
  h+=`<h3>What this number hides</h3><ul><li>The bottom 50%’s ${DFA.b.s[0]}% of all wealth is a net figure: some households owe more than they own, which pulls the total down.</li><li>These accounts do not count the Social Security benefits people expect as wealth.</li><li>Four groups give four points, so the Gini here (${g1.toFixed(3)} in 1989, ${g2.toFixed(3)} in 2026) is a lower bound. See <a href="#measurewealth">Measuring wealth</a> for how a Gini is built.</li></ul>`;
}
 h+=`<p class="help">Your settings stay in this page. Nothing you enter leaves your browser.</p>`;
 return h;}

const SIM={
 id:'taxhistory',hash:'taxhistory',apUnit:2,order:3,tab:'Tax rates then and now',kind:'Simulation',prereq:['budget'],next:['measurewealth'],
 skills:{bio:'Percent change, and tax by brackets (rate × slice) · Algebra 1 (Unit 2), AP Macroeconomics (Unit 2)',honors:'Marginal vs. effective rates, and percentage points vs. percent · Algebra 1 (Units 2 and 3: piecewise functions), AP Macroeconomics (Unit 2)',ap:'Inflation adjustment with CPI, and the Lorenz curve and Gini · Algebra 2, AP Macroeconomics (Unit 2), AP Microeconomics (Unit 6)'},
 card:'Guess how much each income group gained since 1979, then run one family through tax rules from 1925 to 2025 and see what a 91% top rate really meant.',
 title:'Tax rates then and now',
 lede:{bio:'The top income tax rate has run from 7% (1913) to 94% (1944) to 37% (2025). What did that mean for real families? Compare income growth by group, then run one family through a century of tax rules.',
  honors:'A top rate is a marginal rate: it applies only to income above the top bracket’s start. Effective rate = total tax ÷ income. Compare both, in dollars adjusted for inflation.',
  ap:'Real value = nominal × CPI(2025) ÷ CPI(year). Tax = Σ rate_i × (income in bracket i). Percent change = (new − old) ÷ old × 100.'},
 scale:'One U.S. household, and all U.S. households sorted into fifths. Money in 2025 dollars (family) or 2021 dollars (Census tables).',
 aspect:1.6,timeless:true,trials:true,graph:true,
 controlsTitle:'Your view',
 controls:[
  {id:'gq',label:'The question',type:'seg',def:'g_bot',noGut:true,onChange:onGq,options:[{v:'g_bot',l:'Bottom fifth’s gain'},{v:'g_mid',l:'Middle fifth’s gain',lvl:'honors'},{v:'g_top5',l:'Top 5%’s gain'},{v:'t_1955',l:'Tax, 1955 rules'},{v:'t_2025',l:'Tax, 2025 rules'}],help:'Gains: percent change in average income after inflation. Tax: federal income plus payroll tax as a percent of this family’s income.'},
  {id:'guess',label:'Your guess, in percent',type:'range',min:-50,max:150,step:1,def:20,unit:'%',d:0},
  {id:'show',label:'Show the answers',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'view',label:'Picture',type:'seg',def:'groups',noGut:true,options:[{v:'groups',l:'Who gained?'},{v:'family',l:'One family’s taxes'},{v:'rates',l:'Top rates since 1913'},{v:'wealth',l:'Wealth'}]},
  {id:'per',label:'Compare these years (Census)',type:'seg',def:'p7921',noGut:true,onChange:clearGut,options:[{v:'p6779',l:'1967 → 1979'},{v:'p7900',l:'1979 → 2000'},{v:'p0021',l:'2000 → 2021'},{v:'p7921',l:'1979 → 2021'},{v:'p6721',l:'1967 → 2021',lvl:'honors'},{v:'p1921',l:'2019 → 2021',lvl:'honors'}]},
  {id:'hh',label:'Example household income, in thousands of 2021 dollars',type:'range',min:5,max:350,step:1,def:60,unit:'k',d:0,noGut:true,help:'An example, not your family. Place it among the fifths in each year.'},
  {id:'inc',label:'Family income, in thousands of 2025 dollars',type:'range',min:10,max:5000,step:0.5,def:87.5,unit:'k',d:1,noGut:true,onChange:clearGut,help:'87.5 is about the 2025 median household income ($87,460). Use the buttons below for a top-bracket family.'},
  {id:'kids',label:'Children',type:'range',min:0,max:4,step:1,def:2,unit:'',d:0,noGut:true,onChange:clearGut},
  {id:'yr',label:'Look closely at one year’s rules',type:'select',def:'1955',noGut:true,options:S.map(s=>({v:String(s.y),l:`${s.y}: ${s.sl}`}))},
  {id:'meas',label:'Which measure?',type:'seg',def:'census',lvl:'honors',noGut:true,options:[{v:'census',l:'Census money income'},{v:'cbo',l:'CBO, with benefits and taxes'},{v:'pew',l:'Pew income tiers'}],help:'Same country, same decades, different things counted.'},
  {id:'earn',label:'Earners in the family',type:'seg',def:'1',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'1',l:'One'},{v:'2',l:'Two, equal pay'}],help:'Payroll tax stops at a wage cap for each worker, so two earners can pay more in total.'},
  {id:'lz',label:'Lorenz curve of',type:'seg',def:'wealth',noGut:true,options:[{v:'wealth',l:'Wealth (Fed)'},{v:'income',l:'Income (Census)'}]}
 ],
 actions:[
  {id:'median',label:'Family: median income, 2 kids',run(sim){BioLab.setValues(sim,{inc:87.5,kids:2,view:'family'});clearGut(sim);}},
  {id:'topfam',label:'Family: $5 million a year',run(sim){BioLab.setValues(sim,{inc:5000,kids:2,view:'family',yr:'1955'});clearGut(sim);}}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'chgbot',label:'Bottom fifth: real change in average income',unit:'%',d:1,min:null,max:null,get:sim=>hideG(sim)?null:chg(sim,0).pc},
  {id:'chgtop5',label:'Top 5%: real change in average income',unit:'%',d:1,min:null,max:null,get:sim=>hideG(sim)?null:chg(sim,5).pc},
  {id:'chgmid',label:'Middle fifth: real change in average income',unit:'%',d:1,lvl:'honors',min:null,max:null,get:sim=>hideG(sim)?null:chg(sim,2).pc},
  {id:'shbot',label:'Bottom fifth: change in share of all income',unit:'points',d:1,lvl:'honors',min:null,max:null,get:sim=>{if(hideG(sim))return null;const c=chg(sim,0);return +(c.sb-c.sa).toFixed(1);}},
  {id:'place',label:'Example household’s place, first year → last year',text:true,get:sim=>{const [a,b]=per(sim);return `${a}: ${placeText(sim,a)} → ${b}: ${hideG(sim)?'?':placeText(sim,b)}`;}},
  {id:'ftax',label:'Chosen year: federal income + payroll tax, share of income',unit:'%',d:2,min:0,max:100,get:sim=>hideT(sim,sim.p.yr)?null:fam(sim,sim.p.yr).share*100},
  {id:'itax',label:'Chosen year: income tax, that year’s dollars',unit:'$',d:2,min:0,max:null,get:sim=>hideT(sim,sim.p.yr)?null:fam(sim,sim.p.yr).it},
  {id:'ptax',label:'Chosen year: payroll tax, that year’s dollars',unit:'$',d:2,min:0,max:null,get:sim=>hideT(sim,sim.p.yr)?null:fam(sim,sim.p.yr).pt},
  {id:'marg',label:'Chosen year: this family’s top bracket (marginal rate)',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>fam(sim,sim.p.yr).mr},
  {id:'take',label:'Chosen year: take-home pay in 2025 dollars',unit:'$',d:0,lvl:'honors',min:0,max:null,get:sim=>hideT(sim,sim.p.yr)?null:fam(sim,sim.p.yr).take},
  {id:'real',label:'Chosen year: the family’s income in that year’s dollars',unit:'$',d:2,lvl:'ap',min:0,max:null,get:sim=>fam(sim,sim.p.yr).N},
  {id:'gini',label:'Lorenz-point Gini, latest year shown',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>sim.p.lz==='income'?giniPts(Q5,SH25.slice(0,5)):giniPts(DFAP,DFA.b.s)}
 ],
 graphs:[{id:'mve',label:'This family: top rate vs. its own marginal and effective rates',custom:true}],defaultGraph:'mve',
 plot(sim,ctx,box){const ys=S.map(s=>s.y),R=S.map(s=>calc(s,sim.p.inc*1000,sim.p.kids,+sim.p.earn||1));
  const ax=axes(ctx,box,{xmin:0,xmax:S.length,ymin:0,ymax:100,xcats:ys.map(String),yl:'Percent',xl:'Tax rules of year'});
  const line=(vals,c,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();vals.forEach((v,i)=>{if(v==null)return;const x=ax.X(i+0.5),y=ax.Y(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.setLineDash([]);
   vals.forEach((v,i)=>{if(v==null)return;ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(i+0.5),ax.Y(v),3.5,0,7);ctx.fill();});};
  line(S.map(s=>s.br[s.br.length-1][1]),PAL['s1'],true);line(R.map(r=>r.mr),PAL['s5']);
  line(R.map((r,i)=>hideT(sim,S[i].y)?null:r.share*100),PAL['s2']);
  legend(ctx,box.L+10,box.T+8,[{label:'Top rate in the law',color:PAL['s1'],dash:true},{label:'This family’s marginal rate',color:PAL['s5']},{label:'This family’s effective rate (income + payroll tax)',color:PAL['s2']}]);},
 draw,
 infoPanel:infoHTML,
 narrate(sim){const v=sim.p.view,[a,b]=per(sim);
  if(v==='groups'){const meas=atLeast('honors')?sim.p.meas:'census';
   if(meas==='cbo')return 'CBO adds benefits and subtracts taxes. Before transfers and taxes, the bottom fifth’s average rose from $19,000 to $28,500 (1979 to 2023), and <b>after transfers and taxes its share of income stayed at 8%</b>, while the top 1%’s rose from 7% to 13%.';
   if(meas==='pew')return 'Pew sorts Americans into tiers by household income adjusted for size. From 1971 to 2023 the middle tier shrank from 61% to 51% of people, <b>while both the lower and upper tiers grew</b>.';
   if(hideG(sim)&&pend(sim))return `<b>Your turn:</b> percent change = (new − old) ÷ old × 100. Work it out for the ${gq(sim).l.toLowerCase()}.`;
   if(hideG(sim))return `You are guessing how much the ${gq(sim).kind==='g'?gq(sim).l.toLowerCase():'bottom fifth'}’s average income changed from ${a} to ${b}, after inflation. <b>Go with your gut</b>, then lock it in.`;
   const c0=chg(sim,0),c5=chg(sim,5),c2=chg(sim,2);
   return `From ${a} to ${b}, after inflation, the bottom fifth’s average changed <b>${pct(c0.pc)} (${sgn(c0.d)}${usd(Math.abs(c0.d))})</b>, the middle fifth’s ${pct(c2.pc)}, and the top 5%’s <b>${pct(c5.pc)} (${sgn(c5.d)}${usd(Math.abs(c5.d))})</b>. ${c0.sb<c0.sa?'The bottom fifth’s share of all income fell':'The bottom fifth’s share of all income rose'} from ${p1(c0.sa)} to ${p1(c0.sb)}.`;}
  if(v==='family'){const s=SY(sim.p.yr),r=fam(sim,s.y);if(hideT(sim,s.y)&&pend(sim))return `<b>Your turn:</b> tax each bracket slice, take off credits, add payroll tax, then divide by income.`;if(hideT(sim,s.y))return `Under ${s.y} rules this family has ${usd(r.ti)} of taxable income in ${s.y} dollars. <b>What share of its income goes to federal income and payroll tax?</b> Guess first.`;
   return `Under ${s.y} rules this family’s top bracket is ${r.mr}%, but it pays <b>${p1(r.share*100)} of its income</b> in federal income plus payroll tax: ${usd(r.it)} income tax and ${usd(r.pt)} payroll tax in ${s.y} dollars. The marginal rate applies only to its last dollars.`;}
  if(v==='rates'){const s=SY(sim.p.yr),tr=s.br[s.br.length-1];return `In ${s.y} the top rate was ${tr[1]}%, but it started at ${usd(tr[0])} of taxable income, <b>about ${usdK(tr[0]*CPI[NOW]/CPI[s.y])} in 2025 dollars</b>. Payroll tax, which began in 1937, now reaches about 94% of workers.`;}
  const inc=sim.p.lz==='income';return inc?'Census quintile shares: the bottom fifth got 4.0% of all money income in 1967 and 3.0% in 2025; the top fifth got 43.6%, then 52.4%. <b>The farther the curve sags below the diagonal, the more unequal.</b>':`In ${DFA.b.l} the top 1% held ${DFA.b.s[3]}% of all net worth and the bottom 50% held ${DFA.b.s[0]}%. In ${DFA.a.l}: ${DFA.a.s[3]}% and ${DFA.a.s[0]}%. <b>The curve sags more than it did in 1989.</b>`;},
 gut:{better:'lower',controls:['gq','guess'],
  ask:{bio:'Pick a question here. The first one: after inflation, by what percent did the bottom fifth’s average income change from 1979 to 2021? Drag <b>Your guess</b> (a negative number means it fell), then lock it in.',
   honors:'Pick a question here, then set <b>Your guess</b> in percent by feel and lock it in. For a gain, a negative guess means the group lost ground.'},
  lock(sim){const t=truth(sim);return {v:Math.abs(sim.p.guess-t),q:sim.p.gq,guess:sim.p.guess,label:pct(sim.p.guess,0)};},
  solve(sim){const t=truth(sim);sim.p.guess=+t.toFixed(4);sim.p.show=true;return {v:0,q:sim.p.gq,guess:t,label:pct(t)};},
  hint:'Lock in your gut answer. Then you will work out the real number yourself.',
  calc:{unit:'%',d:2,tol:a=>gqKindTol(a),
   prompt:sim=>{const q=gq(sim);
    if(q.kind==='g'){const c=chg(sim,q.i),[a,b]=per(sim);return `The ${q.l.toLowerCase()}’s average income was <b>${usd(c.a)}</b> in ${a} and <b>${usd(c.b)}</b> in ${b}, both in 2021 dollars, so inflation is already taken out. By what percent did it change? Use (new − old) ÷ old × 100. A drop is a negative number.`;}
    const {s,r,sl}=taxParts(sim,q.y),e=+sim.p.earn||1;
    return `Under ${q.y} rules, this family earns <b>${usd(r.N)}</b> in ${q.y} dollars. Deductions and exemptions take off <b>${usd(r.ded)}</b>, so taxable income is ${usd(r.ti)}. Brackets: ${sl.map(x=>`${x.rate}% from ${usd(x.lo)}${x.hi===Infinity?' up':' to '+usd(x.hi)}`).join('; ')}.${credText(s,sim)} Payroll tax: ${payText(s,e)}. What percent of the family’s income goes to income tax plus payroll tax?`;},
   answer:calcAns,
   hint:'For a gain: subtract, divide by the old value, multiply by 100. For a tax: tax each bracket’s slice at its own rate, add them, take off credits, add payroll tax, and divide by income.',
   steps(sim){const q=gq(sim),A=calcAns(sim);
    if(q.kind==='g'){const c=chg(sim,q.i);return [`Change: ${usd(c.b)} − ${usd(c.a)} = ${c.d<0?'−':''}${usd(Math.abs(c.d))}.`,`Divide by the old value: ${c.d<0?'−':''}${usd(Math.abs(c.d))} ÷ ${usd(c.a)} = ${(c.d/c.a).toFixed(4)}.`,`Times 100: <b>${pct(A,2)}</b>.`];}
    const {s,r,sl}=taxParts(sim,q.y),out=[];
    out.push(`Taxable income: ${usd(r.N)} − ${usd(r.ded)} = ${usd(r.ti)}.`);
    out.push(`Bracket by bracket: ${sl.map(x=>`${x.rate}% × ${usd(x.w)} = ${u2(x.t)}`).join(', ')}; total ${u2(r.pre)}.`);
    if(Math.abs(r.pre-r.it)>0.005)out.push(`After ${r.ctc?'the child tax credit':s.cr?'the per-person credit':'the 90% cap'}: income tax ${u2(r.it)}.`);
    out.push(`Payroll tax: ${u2(r.pt)}. Together: ${u2(r.it+r.pt)}.`);
    out.push(`${u2(r.it+r.pt)} ÷ ${usd(r.N)} × 100 = <b>${A.toFixed(2)}%</b> of income.`);return out;}},
  formula(sim){const q=gq(sim);if(q.kind==='g'){const c=chg(sim,q.i);return `Percent change = (${usd(c.b)} − ${usd(c.a)}) ÷ ${usd(c.a)} × 100 = ${pct(c.pc,2)}`;}
   const r=fam(sim,q.y);return `Share = (income tax ${u2(r.it)} + payroll tax ${u2(r.pt)}) ÷ ${usd(r.N)} × 100 = ${(r.share*100).toFixed(2)}%`;},
  how:{bio:'Percent change = (new − old) ÷ old × 100, with both years in the same dollars. For a tax: add up each bracket’s slice, add payroll tax, and divide by income.',
   ap:'Gain: (m_b − m_a) ÷ m_a. Tax share: [Σ r_i × slice_i − credits + payroll] ÷ N, where N = real income × CPI(year) ÷ CPI(2025).'},
  compare(sim,g,m){const q=GQ[g.q]||GQ.g_bot;const off=Math.abs(g.guess-m.guess);
   if(q.kind==='g'){const c=chg(sim,q.i),[a,b]=per(sim),offD=off/100*c.a,c0=chg(sim,0),c5=chg(sim,5);
    const all=`From ${a} to ${b}: bottom fifth ${pct(c0.pc)} (${sgn(c0.d)}${usd(Math.abs(c0.d))}), top 5% ${pct(c5.pc)} (${sgn(c5.d)}${usd(Math.abs(c5.d))}).`;
    if(off<2)return `Your gut was right on: ${pct(g.guess,0)} against the real ${pct(c.pc)}. ${all}`;
    return `The ${q.l.toLowerCase()}’s average went from ${usd(c.a)} to ${usd(c.b)}: <b>${pct(c.pc)}</b>. You guessed ${pct(g.guess,0)}, off by <b>${off.toFixed(1)} points, about ${usd(offD)} a year</b> per household. ${all}`;}
   const r=fam(sim,q.y),offD=off/100*sim.p.inc*1000;
   if(off<1)return `Your gut was right on: ${pct(g.guess,0).replace('+','')} against the real ${p1(r.share*100)}.`;
   return `Under ${q.y} rules this family pays <b>${p1(r.share*100)}</b> of its income: ${usd(r.itR+r.ptR)} a year in 2025 dollars. You guessed ${Math.round(g.guess)}%, off by <b>${usd(offD)} a year</b>. Its top bracket is ${r.mr}%, but that rate touches only its last dollars.`;},
  again(sim){const ks=Object.keys(GQ).filter(x=>!GQ[x].lvl||atLeast(GQ[x].lvl));sim.p.gq=ks[Math.floor(Math.random()*ks.length)];sim.p.guess=20;sim.p.show=false;const q=gq(sim);sim.p.view=q.kind==='g'?'groups':'family';if(q.kind==='t')sim.p.yr=String(q.y);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Census money income, 2021 dollars: the second fifth of households averaged $34,784 in 1979 and $41,025 in 2021. By what percent did its average change?',answer:17.94,tol:0.15,unit:'%',d:1,hint:'Subtract 1979 from 2021, divide by the 1979 value, then multiply by 100.',explain:'$41,025 − $34,784 = $6,241. $6,241 ÷ $34,784 = 0.1794, so +17.9%. The bottom fifth rose 6.2% and the top 5% rose 108.5% over the same years.'},
  {lvl:'bio',kind:'num',q:'2025 rules. A couple with 2 kids earns $87,500. Subtract the $31,500 standard deduction. Tax 10% of the first $23,850 of what is left and 12% of the rest. Then subtract a $2,200 credit per child. What is their income tax?',answer:1843,tol:1,unit:'$',d:0,hint:'Taxable income is $56,000. The 12% slice is $56,000 − $23,850.',explain:'Taxable income $87,500 − $31,500 = $56,000. 10% × $23,850 = $2,385; 12% × $32,150 = $3,858. Total $6,243, minus 2 × $2,200 = $1,843. Payroll tax (7.65% × $87,500 = $6,694) is more than three times as big.'},
  {lvl:'bio',instant:true,q:'Work it by hand. In 1955 a married couple had $5,000 of taxable income. The first $4,000 was taxed at 20% and the next $4,000 at 22%. What was their income tax?',choices:['$1,000','$1,020','$1,100','$4,550 (91% of it)'],correct:1,explain:'20% × $4,000 = $800. 22% × $1,000 = $220. Total $1,020, about 20.4% of their taxable income. The 91% rate started at $400,000.'},
  {lvl:'bio',instant:true,q:'What this number hides: the bottom fifth averaged $14,859 in 2021. Which statement does that average NOT tell you?',choices:['The bottom fifth’s average income in 2021 dollars','Whether the same families were in the bottom fifth in 1979','That this is before taxes'],correct:1,explain:'Fifths are snapshots. People move between them as they age, change jobs or retire, so the 1979 and 2021 bottom fifths are different households. The table can’t follow one family.'},
  {lvl:'honors',instant:true,q:'Under 2025 rules a couple has $100,000 of taxable income: 10% up to $23,850, 12% up to $96,950, 22% above. What are their marginal rate and their average income tax rate?',choices:['22% and 22%','22% and about 11.8%','12% and 12%','37% and 22%'],correct:1,explain:'Tax = 10% × 23,850 + 12% × 73,100 + 22% × 3,050 = 2,385 + 8,772 + 671 = $11,828. Average rate: 11,828 ÷ 100,000 ≈ 11.8% of taxable income. Their marginal rate is 22%: only their last $3,050 is taxed at 22%.'},
  {lvl:'honors',instant:true,q:'Census shares of all money income, 1967 vs. 2025: bottom fifth 4.0% → 3.0%, top fifth 43.6% → 52.4%. Which is true?',choices:['Every group’s income fell','The top fifth’s share rose 8.8 points and the bottom fifth’s fell 1.0 point','Shares can’t change if all incomes rise'],correct:1,explain:'52.4 − 43.6 = 8.8 points; 4.0 − 3.0 = 1.0 point. A share can fall while real income rises: the bottom fifth’s average rose 30.6% from 1967 to 2021, but others rose faster.'},
  {lvl:'honors',instant:true,q:'A median family ($87,500, 2 kids) under 2025 rules pays $1,843 in income tax and $6,694 in payroll tax. Which tax is bigger for this family?',choices:['Income tax','Payroll tax, by more than 3 to 1','About equal'],correct:1,explain:'$6,694 ÷ $1,843 ≈ 3.6. After the $31,500 standard deduction and $4,400 child tax credit, payroll tax is this family’s main federal tax: 7.65% of wages.'},
  {lvl:'ap',instant:true,q:'The 1965 top rate (70%) started at $200,000 of taxable income. CPI was 31.5 in 1965 and 321.9 in 2025. About where did it start in 2025 dollars?',choices:['About $200,000','About $640,000','About $2.04 million','About $20 million'],correct:2,explain:'$200,000 × 321.9 ÷ 31.5 ≈ $2,043,810. The 2025 top rate (37%) starts at $751,600 for a couple.'},
  {lvl:'ap',instant:true,q:'Fed wealth shares, 2026 Q2: bottom 50% 2.3%, 50th to 90th 28.8%, 90th to 99th 36.4%, top 1% 32.5%. Joining those four points with straight lines, what Gini do you get?',choices:['About 0.45','About 0.62','About 0.75','About 0.95'],correct:2,explain:'Area under the curve = 0.5 × (0 + 0.023)/2 + 0.4 × (0.023 + 0.311)/2 + 0.09 × (0.311 + 0.675)/2 + 0.01 × (0.675 + 1)/2 ≈ 0.1253. Gini = 1 − 2 × 0.1253 ≈ 0.749, a lower bound.'},
  {lvl:'ap',instant:true,q:'For 2014, Piketty, Saez and Zucman put the top 1%’s pretax share at 20.2%; Auten and Splinter at 14.2%. Which is the best description of the gap?',choices:['A math error by one team','Different choices about unreported income, retirement income, taxes and who counts as a unit','Different years'],correct:1,explain:'Auten and Splinter attribute about 2.0 points to unreported income, 1.0 to retirement income and about 0.7 each to corporate and other taxes. Both teams use real data and defend their choices; the tool does not pick a winner.'}
 ],
 tour:[
  {title:'The question',text:'After inflation, how much did the average income of each fifth of U.S. households change from 1979 to 2021? Gray bars are 1979. Hidden bars are 2021.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'groups',per:'p7921',show:false,meas:'census'})},
  {title:'Who gained',text:'Bottom fifth: $13,985 → $14,859, +6.2% (+$874). Middle fifth: +23.6%. Top 5%: $230,339 → $480,236, +108.5%. The right column shows shares of all income: the bottom fifth went from 4.1% to 2.9%.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Some periods lost ground',text:'From 2000 to 2021 the bottom fifth’s average fell 7.3% after inflation, while the top 5%’s rose 20.6%. Pick the years and the picture changes.',pause:true,setup:sim=>BioLab.setValues(sim,{per:'p0021'})},
  {title:'What you count changes the answer',text:'Census counts money income before taxes. CBO adds benefits and subtracts taxes: after transfers and taxes, the bottom fifth’s share stayed at 8% from 1979 to 2023, while the top 1%’s went from 7% to 13%.',pause:true,setup:sim=>BioLab.setValues(sim,{per:'p7921'})},
  {title:'One tax, slice by slice',text:'2025 rules, a couple with 2 kids earning $87,500. Taxable income $56,000. 10% × 23,850 = $2,385; 12% × 32,150 = $3,858. Total $6,243, minus $4,400 = $1,843. Payroll tax: 7.65% × 87,500 = $6,694. Together: 9.76% of income.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'family',inc:87.5,kids:2,yr:'2025',show:true})},
  {title:'A 91% top rate',text:'Under 1955 rules, the same real income pays 12.61%. A $5 million family (2025 dollars) reaches the 91% bracket but pays 78.18% on wages alone, and real high earners used capital gains and deductions to pay much less. The 91% applied only above $400,000 taxable, about $4.80M today.',pause:true,setup:sim=>BioLab.setValues(sim,{yr:'1955',inc:5000})},
  {lvl:'honors',title:'A century of rates',text:'The top rate: 7% in 1913, 73% in 1921, 25% by 1925, 94% in 1944, 91% in the 1950s, 70%, 50%, 28% in 1988, 39.6%, 35%, 37% today. The payroll tax line grew from 1% in 1937 to 7.65%. Below the picture: the law behind each year.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'rates',inc:87.5,yr:'1944'})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{view:'groups',inc:87.5,kids:2,yr:'1955',per:'p7921',show:false});},
 lab:{bio:'<p><b>Question:</b> Did the same real income pay more federal tax in the past?</p><ol><li>Choose <b>One family’s taxes</b>. Keep the median family ($87,500, 2 kids).</li><li>For 1955, 1975, 1995 and 2025, record a trial with <b>Look closely at one year’s rules</b> set to that year.</li><li>Now set income to $175,000 and repeat.</li></ol><p>Write two sentences: which year took the most from each family, and was it income tax or payroll tax?</p>',
  honors:'<p><b>Question:</b> Which groups gained, and does the answer depend on the measure?</p><ol><li>In <b>Who gained?</b>, record the bottom fifth, middle fifth and top 5% changes for each period.</li><li>Find a period where some group lost ground.</li><li>Switch <b>Which measure?</b> to CBO and to Pew. Note what each counts.</li></ol><p>Explain how the same decades can look different, using one number from each measure.</p>',
  ap:'<p><b>Question:</b> How much does a top marginal rate tell you about what anyone paid?</p><ol><li>Set income to $5,000 thousand and record the effective rate for every year.</li><li>Compare each year’s top rate to this family’s effective rate on the graph.</li><li>Read the two views of the 1950s and the competing inequality estimates under <b>Wealth</b>.</li></ol><p><b>CER:</b> Make a claim about how top rates have changed what high earners pay, with evidence from your table and reasoning that answers the strongest point of the other view. Your claim is your own; the math must be right.</p>'},
 terms:[
  {t:'Marginal tax rate',d:'The rate on your next dollar of income: the rate of the highest bracket you reach.'},
  {t:'Effective (average) tax rate',d:'Total tax ÷ income. Always at or below the top marginal rate you reach.'},
  {t:'Tax bracket',d:'A slice of taxable income taxed at one rate. Each rate applies only to the income inside its slice.'},
  {t:'Taxable income',d:'Income minus deductions and exemptions. The brackets apply to this, not to all income.'},
  {t:'Payroll tax',d:'Social Security and Medicare tax on wages: 7.65% for a worker in 2025, with Social Security stopping at a wage cap ($176,100).'},
  {t:'Real (inflation-adjusted) dollars',d:'Dollars converted to one year’s prices: real = nominal × CPI(base year) ÷ CPI(that year).'},
  {t:'Quintile (fifth)',d:'One of five equal-size groups of households, sorted by income.'},
  {t:'Share of aggregate income',d:'A group’s total income ÷ everyone’s total income.',lvl:'honors'},
  {t:'Standard deduction and personal exemption',d:'Amounts subtracted from income before the brackets apply. Exemptions were per person; the 2017 law set them to $0 and raised the standard deduction.',lvl:'honors'},
  {t:'Lorenz curve',d:'A plot of the share of the total held by the poorest x% of households. The diagonal is perfect equality.',lvl:'ap'},
  {t:'Gini coefficient',d:'1 − 2 × (area under the Lorenz curve). 0 is perfect equality; 1 is one household holding everything.',lvl:'ap'}
 ],
 about:`<p><b>This is a simplified model for learning, not tax or financial advice.</b> The family calculator taxes a married couple filing one return, with all income from wages, using only that year’s brackets, personal exemptions, standard deduction and (2005 on) the child tax credit, counted only up to the income tax owed (the refundable part is left out). It leaves out state and local taxes, the earned income tax credit, itemized deductions, capital gains rates, the alternative minimum tax, exemption phase-outs, the 1925 earned income credit and the employer’s half of payroll tax (CBO counts the employer’s half as a tax on workers; this tool shows only what comes out of a paycheck). Before 1948 there were no joint brackets and two-earner couples filed separately; the model treats the family as one return. Payroll tax assumes the job was covered by Social Security, which many jobs were not in its early years.</p>
<p><b>Brackets</b> (married filing jointly, or the single schedule before 1948): Tax Foundation, <a href="https://taxfoundation.org/data/all/federal/historical-income-tax-rates-brackets/" target="_blank" rel="noopener">Historical U.S. Federal Individual Income Tax Rates and Brackets, 1862-2021</a> (1913 to 2018); 1925 combined normal tax and surtax rates as listed there. 2005: IRS Rev. Proc. 2004-71 (standard deduction $10,000, exemption $3,200). 2025: IRS, <a href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2025" target="_blank" rel="noopener">tax year 2025 brackets</a>; standard deduction $31,500 as raised by the 2025 law (IRS, <a href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" target="_blank" rel="noopener">tax year 2026 release</a>); child tax credit $2,200 per child, phasing out above $400,000 (IRS, <a href="https://www.irs.gov/credits-deductions/individuals/child-tax-credit" target="_blank" rel="noopener">Child Tax Credit</a>); 2005 child credit $1,000 above $110,000 (IRS Pub. 972, 2005). The 2025 law is Public Law 119-21, officially “An act to provide for reconciliation pursuant to title II of H. Con. Res. 14,” enacted July 4, 2025 (<a href="https://www.govinfo.gov/app/details/PLAW-119publ21" target="_blank" rel="noopener">govinfo</a>); it is widely called the One Big Beautiful Bill Act. 1988: the 33% bubble from $71,900 to $149,250 is from the Tax Foundation footnote; the real bubble also phased out exemptions.</p>
<p><b>Exemptions and standard deductions:</b> IRS Statistics of Income, <a href="https://www.irs.gov/pub/irs-soi/02inpetr.pdf" target="_blank" rel="noopener">Personal Exemptions and Individual Income Tax Rates, 1913-2002</a> (exemptions; the 1944 top rate was capped at 90% of income; 1975 $30 per-person credit). Standard deduction 1944: 10% of income up to $500 (C. Harry Kahn, <a href="https://www.nber.org/system/files/chapters/c2425/c2425.pdf" target="_blank" rel="noopener">NBER, 1960</a>); 1948 to 1969: 10% up to $1,000 (Tax Policy Center, <a href="https://www.taxpolicycenter.org/sites/default/files/legacy/taxfacts/content/pdf/historical_standard_deduct.pdf" target="_blank" rel="noopener">Standard Deduction 1970-2015</a>, which also gives 1988 $5,000 and 1995 $6,550); 1964 minimum standard deduction $200 + $100 per exemption (<a href="https://www.finance.senate.gov/download/1964/02/03/brief-summary-of-the-provisions-of-hr-8363-the-revenue-act-of-1964-as-agreed-to-by-the-conferees&download=1" target="_blank" rel="noopener">Senate Finance summary of the Revenue Act of 1964</a>); 1975: 16% up to $2,600, minimum $1,900 (Tax Reduction Act of 1975). Law names for each year follow Treasury’s Office of Tax Analysis list of major tax bills.</p>
<p><b>Payroll tax:</b> SSA, <a href="https://www.ssa.gov/oact/progdata/taxRates.html" target="_blank" rel="noopener">Social Security and Medicare tax rates</a> and <a href="https://www.ssa.gov/oact/cola/cbb.html" target="_blank" rel="noopener">contribution and benefit base</a>: 1944 1% to $3,000; 1955 2% to $4,200; 1965 3.625% to $4,800; 1975 5.85% to $14,100; 1982 6.7% to $32,400; 1988 7.51% to $45,000; 1995 6.2% to $61,200 + 1.45%; 2005 6.2% to $90,000 + 1.45%; 2018 6.2% to $128,400 + 1.45%; 2025 6.2% to $176,100 + 1.45%; plus 0.9% above $250,000 from 2013. About 94% of workers are covered (Congressional Research Service, <a href="https://www.everycrsreport.com/files/2025-07-22_IF10426_b04fd10c9b68a7cf62ccdfb5e1e2943d9e344431.pdf" target="_blank" rel="noopener">Social Security Overview, IF10426, 2025</a>). In 1925, 4,171,051 returns were filed and 3.60% of the population filed (IRS, <a href="https://www.irs.gov/pub/irs-soi/25soirepar.pdf" target="_blank" rel="noopener">Statistics of Income for 1925</a>).</p>
<p><b>Top rates by year:</b> IRS via FRED, <a href="https://fred.stlouisfed.org/series/IITTRHB" target="_blank" rel="noopener">IITTRHB</a> (1913 to 2018); 37% for 2019 to 2025 from IRS brackets. <b>Inflation:</b> BLS CPI annual averages (CPI-U from 1978), as tabulated by the <a href="https://www.minneapolisfed.org/about-us/monetary-policy/inflation-calculator/consumer-price-index-1913-" target="_blank" rel="noopener">Federal Reserve Bank of Minneapolis</a>: 1925 17.5; 1944 17.6; 1955 26.8; 1965 31.5; 1975 53.8; 1982 96.5; 1988 118.3; 1995 152.4; 2005 195.3; 2018 251.1; 2021 271.0; 2025 321.9. The 1967 placement of the family compares 2025 dollars to Census’s 2021 dollars with CPI-U, so it is approximate.</p>
<p><b>Who gained:</b> Census, <a href="https://www.census.gov/content/dam/Census/library/publications/2022/demo/p60-276.pdf" target="_blank" rel="noopener">Income in the United States: 2021 (P60-276)</a>, Tables A-4a and A-4b: mean income, percentile limits and shares by fifth, in 2021 dollars (R-CPI-U-RS). These are the same series as historical Tables H-1, H-2 and H-3; the latest H tables (through 2025) are spreadsheets this page could not read, so dollar figures here stop at 2021. 2025 shares (3.0, 8.2, 13.9, 22.5, 52.4; top 5% 23.5), the 2025 median ($87,460) and Gini (0.490): <a href="https://www.census.gov/library/publications/2026/demo/p60-289.html" target="_blank" rel="noopener">Income in the United States: 2025 (P60-289)</a>. Census money income is before taxes and excludes capital gains and noncash benefits such as nutrition assistance, health benefits and subsidized housing. The series breaks in 1993 (computer-assisted interviews) and 2013 (redesigned income questions; Census shows two 2013 rows; this tool uses neither).</p>
<p><b>CBO:</b> <a href="https://www.cbo.gov/publication/62792" target="_blank" rel="noopener">The Distribution of Household Income, 2023</a> (September 2026): bottom fifth before transfers and taxes $19,000 → $28,500, top fifth $179,700 → $409,300 (1979 to 2023, 2023 dollars); after transfers and taxes the top 1%’s share went from 7% to 13%, the bottom fifth’s stayed at 8%, and the middle three fifths’ fell 5 points; before transfers and taxes, bottom fifth 5% → 4% and top 1% 9% → 16%. In 2023 individual income tax rates ran from −11% (bottom fifth) to 16% (top fifth). CBO’s chart values for total federal tax rates by group are left out because they could not be read reliably. <b>Pew:</b> Rakesh Kochhar, <a href="https://www.pewresearch.org/race-and-ethnicity/2024/05/31/the-state-of-the-american-middle-class/" target="_blank" rel="noopener">The State of the American Middle Class</a> (May 31, 2024).</p>
<p><b>Wealth and inequality estimates:</b> Federal Reserve <a href="https://www.federalreserve.gov/releases/z1/dataviz/dfa/" target="_blank" rel="noopener">Distributional Financial Accounts</a>, net worth shares via FRED (WFRBST01134, WFRBSN09161, WFRBSN40188, WFRBSB50215), 1989 Q3 and 2026 Q2. Gerald Auten and David Splinter, “Income Inequality in the United States: Using Tax Data to Measure Long-Term Trends,” <i>Journal of Political Economy</i> 132(7), 2024 (<a href="https://doi.org/10.1086/728741" target="_blank" rel="noopener">doi:10.1086/728741</a>), Tables 1 to 4. Thomas Piketty, Emmanuel Saez and Gabriel Zucman, <a href="https://www.nber.org/papers/w22945" target="_blank" rel="noopener">Distributional National Accounts</a> (NBER, 2016; published 2018). Their team also runs <a href="https://realtimeinequality.org/" target="_blank" rel="noopener">Realtime Inequality</a>. 1950s debate: Scott Greenberg, <a href="https://taxfoundation.org/data/all/federal/taxes-on-the-rich-1950s-not-high/" target="_blank" rel="noopener">Taxes on the Rich Were Not That Much Higher in the 1950s</a> (Tax Foundation, 2017); Marshall Steinbaum, <a href="https://rooseveltinstitute.org/effective-progressive-tax-rates-1950s/" target="_blank" rel="noopener">Effective Progressive Tax Rates in the 1950s</a> (Roosevelt Institute, 2017).</p>
<p><b>Two readings of the same tables.</b> <i>One reading:</i> from 1979 to 2021 the top 5%’s average grew 108.5% while the bottom fifth’s grew 6.2%, and the bottom fifth’s share went from 4.1% to 2.9%. Gains went mostly to the top. <i>Another reading:</i> Census money income leaves out the benefits and tax credits that grew most for lower-income households. Counting them, CBO finds every fifth gained from 1979 to 2023 and the bottom fifth’s share of income after transfers and taxes stayed at 8%. Both readings use real data. Which measure fits a question depends on what the question is about: earnings from work, or what a household can spend.</p>
<p><b>Two views of the 1950s rates.</b> <i>One view (Tax Foundation, 2017):</i> the 91% rate reached very few people, and the rich shifted income into lower-taxed forms, so the top 1% paid only about 5.6 points more of their income than in 2014. <i>Another view (Roosevelt Institute, 2017):</i> the 1950s top 1% were mostly upper-middle-class households, because few households then had incomes like today’s richest. Comparing the two groups mixes different kinds of households. The math here is the same under either view: marginal rates apply to slices of income.</p>
<p><b>Laws behind the rates.</b></p><ul>${S.map(s=>`<li><b>${s.y}</b>: ${s.law}. Top rate ${s.br[s.br.length-1][1]}%. ${s.dl}</li>`).join('')}</ul>
<p><b>Competing estimates of the top 1%’s share of income.</b></p><table class="tbl"><tr><th>Estimate</th><th>1962 pretax</th><th>2014 pretax</th><th>1962 after tax</th><th>2014 after tax</th></tr><tr><td>Piketty, Saez and Zucman</td><td>12.6%</td><td>20.2%</td><td>10.1%</td><td>15.7%</td></tr><tr><td>Auten and Splinter</td><td>11.1%</td><td>14.2%</td><td>8.6%</td><td>9.1%</td></tr></table>
<p><b>Piketty, Saez and Zucman</b> find pre-tax income stagnated for the bottom 50% at about $16,000 a year since 1980, and the top 1% went from earning 27 times as much as the bottom 50% (1980) to 81 times (2014). <b>Auten and Splinter</b> (2024) find top shares are lower and rose less, and that growing transfers and tax progressivity raised real incomes for all groups, with little change in after-tax top shares. <b>Why they differ</b> (Auten and Splinter’s breakdown of the 2014 pretax gap): how to assign income that is not reported on tax returns (about 2.0 points), how to treat retirement account income (about 1.0), corporate taxes and other taxes (about 0.7 each), and whether to count people or tax units, since marriage has declined most outside the top. This tool does not pick a winner.</p>
<p><b>Taxes and the common good.</b> The Catechism names paying taxes among the duties of citizens: “co-responsibility for the common good make it morally obligatory to pay taxes” (<a href="https://www.vatican.va/archive/ENG0015/__P7W.HTM" target="_blank" rel="noopener">CCC 2240</a>). It does not say what rates should be: people of good will weigh that differently, and this tool does not score it.</p>`
};
BioLab.register(SIM);
})();
