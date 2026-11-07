(function(){
'use strict';
const {clamp,txt,rr,pill,PAL,FONT,axes,atLeast,rng}=BioLab.h;
/* The hidden ends: why the richest and the poorest are the hardest households to measure.
   Every real-world figure is listed, with its source, in `about`. The town, the family and the worker are illustrations. */

/* ---------- the town: 1,000 households (an illustration) ----------
   Body: lognormal with median $87,460 (Census median household income, 2025) and spread 0.8 (an assumption).
   Top 10%: a Pareto tail with exponent alpha (2 by default, an assumption), joined to the body at the 90th percentile. */
const MED=87460,SIG=0.8,PT=0.9;
function ninv(p){const a=[-3.969683028665376e+01,2.209460984245205e+02,-2.759285104469687e+02,1.383577518672690e+02,-3.066479806614716e+01,2.506628277459239e+00],b=[-5.447609879822406e+01,1.615858368580409e+02,-1.556989798598866e+02,6.680131188771972e+01,-1.328068155288572e+01],c=[-7.784894002430293e-03,-3.223964580411365e-01,-2.400758277161838e+00,-2.549732539343734e+00,4.374664141464968e+00,2.938163982698783e+00],d=[7.784695709041462e-03,3.224671290700398e-01,2.445134137142996e+00,3.754408661907416e+00];const pl=0.02425;let q,r;
 if(p<pl){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p<=1-pl){q=p-0.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
 q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
const X90=MED*Math.exp(SIG*ninv(PT));
const TC={};
function town(N,al){const key=N+'|'+al;if(TC[key])return TC[key];const a=[];
 for(let i=0;i<N;i++){const q=(i+0.5)/N;a.push(q<PT?MED*Math.exp(SIG*ninv(q)):X90*Math.pow((1-PT)/(1-q),1/al));}
 a.sort((x,y)=>x-y);return TC[key]=a;}
const sum=a=>a.reduce((s,x)=>s+x,0);
const mean=a=>a.length?sum(a)/a.length:0;
const median=a=>{const b=a.slice().sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2;};
const gini=a=>{const b=a.slice().sort((x,y)=>x-y),n=b.length,m=mean(b);if(!n||!m)return 0;let s=0;b.forEach((x,i)=>s+=(2*(i+1)-n-1)*x);return s/(n*n*m);};
const topShare=(a,f)=>{const b=a.slice().sort((x,y)=>x-y),k=Math.max(1,Math.round(b.length*f));return sum(b.slice(b.length-k))/sum(b);};
const T0=sim=>town(+sim.p.n,sim.p.alpha);
const rich=sim=>sim.p.rich*1e6;
const T1=sim=>T0(sim).concat([rich(sim)]);
const R={mean0:s=>mean(T0(s)),med0:s=>median(T0(s)),mean1:s=>mean(T1(s)),med1:s=>median(T1(s))};
const dMean=s=>R.mean1(s)-R.mean0(s),dMed=s=>R.med1(s)-R.med0(s);
const belowNewMean=s=>T0(s).filter(x=>x<R.mean1(s)).length;

/* ---------- the survey: top code, nonresponse in both tails, Pareto fit ---------- */
function respondents(sim){const a=T0(sim),n=a.length,r=sim.p.nonresp/100,tail=Math.round(n*0.05);if(!r)return a;
 return a.filter((x,i)=>{if(i>=tail&&i<n-tail)return true;return ((i*0.6180339887)%1)>=r;});}
const cap=sim=>sim.p.tcap==='none'?Infinity:+sim.p.tcap;
const measured=sim=>{const T=cap(sim);return respondents(sim).map(x=>Math.min(x,T));};
function paretoFit(sim){const T=cap(sim);if(!isFinite(T))return null;const r=respondents(sim),L=T/2,nT=r.filter(x=>x>=T).length,nL=r.filter(x=>x>=L).length;
 if(nT<2||nL<=nT)return {nT,nL,a:null,fix:null};const a=Math.log(nL/nT)/Math.log(T/L);
 const fix=a>1.05?(sum(r.filter(x=>x<T))+nT*a/(a-1)*T)/r.length:null;return {nT,nL,a,fix,above:a>1.05?a/(a-1)*T:null};}
const nCapped=sim=>{const T=cap(sim);return respondents(sim).filter(x=>x>=T).length;};

/* ---------- one very wealthy family's year (an illustration, in millions of dollars) ----------
   Simplified tax: 37% on wages and 23.8% (20% + 3.8% net investment income tax) on realized gains and dividends, no deductions. */
const TAXW=0.37,TAXG=0.238,CORP=5;
const taxPaid=s=>TAXW*s.p.twage+TAXG*s.p.treal;
const corpC=s=>s.p.corp?CORP:0;
const taxable=s=>s.p.twage+s.p.treal;
const econ=s=>s.p.twage+s.p.treal+s.p.tunr+corpC(s);
const rate1=s=>taxable(s)>0?100*taxPaid(s)/taxable(s):null;
const rate2=s=>econ(s)>0?100*(taxPaid(s)+corpC(s))/econ(s):null;

/* ---------- a parent with two jobs (an illustration) ----------
   Poverty thresholds: 2023 weighted averages, BLS A Profile of the Working Poor, 2023. */
const POV={one:15480,four:31200};
function weeks(sim){const p=sim.p,v=p.vary/100,R=rng(20261107),f=[];for(let k=0;k<52;k++)f.push(Math.max(0,1+v*Math.sqrt(3)*(2*R()-1)));
 const off=52-p.wks,work=[];for(let k=0;k<52;k++)work.push(true);
 for(let j=0;j<off;j++)work[Math.floor((j+0.5)*52/Math.max(off,1))]=false;
 const fm=mean(f.filter((x,k)=>work[k]))||1;
 return f.map((x,k)=>work[k]?{h1:p.h1*x/fm,h2:p.h2,on:true}:{h1:0,h2:0,on:false}).map(w=>Object.assign(w,{pay:w.h1*p.w1+w.h2*p.w2}));}
const earn=s=>sum(weeks(s).map(w=>w.pay));
const hoursYr=s=>sum(weeks(s).map(w=>w.h1+w.h2));
const pov=s=>POV[s.p.hh]||POV.four;
const wageAvg=s=>hoursYr(s)>0?earn(s)/hoursYr(s):0;
const toLine=s=>{const g=pov(s)-earn(s),w=wageAvg(s);return g<=0?0:(w>0?g/w:null);};
const lowWeek=s=>{const a=weeks(s).filter(w=>w.on).map(w=>w.pay);return a.length?Math.min(...a):0;};
const dipWeeks=s=>{const a=weeks(s).filter(w=>w.on),m=mean(a.map(w=>w.pay));return a.filter(w=>w.pay<0.75*m).length;};
const records=s=>s.p.cash?earn(s)-sum(weeks(s).map(w=>w.h2*s.p.w2)):earn(s);

/* ---------- formatting ---------- */
const usd=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US');
const usdk=v=>v>=1e6?'$'+(v/1e6).toFixed(1).replace(/\.0$/,'')+'M':'$'+(v/1000).toFixed(1).replace(/\.0$/,'')+'k';
const big=v=>Math.abs(v)>=1e9?'$'+(v/1e9).toFixed(2).replace(/\.?0+$/,'')+' billion':Math.abs(v)>=1e6?'$'+(v/1e6).toFixed(1).replace(/\.0$/,'')+' million':usd(v);
const mm=v=>(v<0?'−':'')+'$'+Math.abs(v).toFixed(2)+'M';
const pc=v=>v==null?'no rate':v.toFixed(1)+'%';
const LAD=[0,100,1000,10000,50000,500000];
const ladL=v=>'+'+usd(v);
const near=v=>LAD.reduce((b,x)=>Math.abs(x-v)<Math.abs(b-v)?x:b,LAD[0]);

const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
/* "Your turn": the rise in the mean. shown() already waits for the math, so the answer stays hidden while the student works. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const calcAns=sim=>Math.round(dMean(sim));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const VIEWCTL={gmean:'room',gmed:'room',show:'room',n:'room',rich:'room',tcap:'survey',nonresp:'survey',twage:'tax',treal:'tax',tunr:'tax',corp:'tax',borrow:'tax',heirs:'tax',hh:'work',w1:'work',h1:'work',w2:'work',h2:'work',wks:'work',vary:'work',cash:'work'};
function syncVis(sim){const u=sim.ui;if(!u||!u.ctlW)return;
 Object.keys(VIEWCTL).forEach(id=>{const w=u.ctlW[id];if(!w||w._home)return;const c=SIM.controls.find(x=>x.id===id);const hide=!atLeast(c.lvl)||VIEWCTL[id]!==sim.p.view;if(w.hidden!==hide)w.hidden=hide;});}
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}

/* ---------- drawing ---------- */
const W=800,H=500;
function drawRoom(sim,ctx,k){const a=T0(sim),sh=shown(sim),G=GS(sim),ph=k>1.4,N=a.length;
 txt(ctx,`A town of ${N.toLocaleString('en-US')} households`+(ph?'':', by income this year'),24,30,{s:15*k,w:700});
 if(!ph)txt(ctx,'Each bar counts households in a $20k band. One more household arrives.',24,30+18*k,{s:12*k,c:PAL['cv-soft']});
 const L=40,Rr=466,top=Math.round(64+22*k),base=H-58,bins=20,bw=(Rr-L)/bins,cnt=new Array(bins).fill(0);
 a.forEach(x=>{cnt[Math.min(bins-1,Math.floor(x/20000))]++;});const mx=Math.max(...cnt);
 cnt.forEach((c,i)=>{const h=(base-top)*c/mx;ctx.fillStyle='#3f6fb0';ctx.fillRect(L+i*bw+1,base-h,bw-2,h);});
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,base);ctx.lineTo(Rr,base);ctx.stroke();
 (ph?[0,200000]:[0,100000,200000,300000]).forEach(v=>txt(ctx,v?usdk(v):'$0',L+v/20000*bw,base+18*k,{s:12*k,a:'center',c:PAL['cv-soft']}));
 txt(ctx,'$400k+',Rr,base+18*k,{s:12*k,a:'right',c:PAL['cv-soft']});
 const X=v=>L+Math.min(v,400000)/20000*bw;
 const vline=(v,col,dash,lab,row)=>{const x=X(v);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,5]:[]);ctx.beginPath();ctx.moveTo(x,top-4);ctx.lineTo(x,base);ctx.stroke();ctx.setLineDash([]);
  if(lab){const rt=x>Rr-130;txt(ctx,lab,rt?x-5:x+5,top+8+row*17*k,{s:12*k,w:700,c:col,a:rt?'right':'left'});}};
 vline(R.med0(sim),PAL['s3'],false,ph?'median':'median (middle)',0);
 vline(R.mean0(sim),PAL['s1'],!!sh,sh?(ph?'':'mean before'):(ph?'mean':'mean (average)'),1);
 if(sh){const m1=R.mean1(sim);vline(m1,PAL['s1'],false,(ph?'mean now':'mean now')+(m1>400000?' (off the chart)':''),2);}
 /* the newcomer */
 const nx=Rr+10,ny=base-30;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.moveTo(nx,ny-10);ctx.lineTo(nx+14,ny);ctx.lineTo(nx,ny+10);ctx.closePath();ctx.fill();
 txt(ctx,'+1',nx+2,ny-16,{s:12*k,w:700,c:PAL['rj']});
 /* right panel */
 const px=528,pw=256;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,px-10,top-18,pw+18,base-top+30,10);ctx.fill();
 let y=top+4;txt(ctx,'The newcomer',px,y,{s:13*k,w:700});y+=19*k;
 txt(ctx,big(rich(sim))+(ph?'':' of income'),px,y,{s:14*k,w:700,c:PAL['rj']});y+=17*k;
 if(!ph){txt(ctx,'this year (far off the chart)',px,y,{s:12*k,c:PAL['cv-soft']});y+=17*k;}
 y+=8*k;
 const row=(lab,v0,v1,col)=>{txt(ctx,lab,px,y,{s:13*k,w:700,c:col});y+=19*k;txt(ctx,'Before: '+usd(v0),px,y,{s:12*k});y+=17*k;
  txt(ctx,'After: '+(sh?usd(v1):'?'),px,y,{s:12*k,w:sh?700:400,c:sh?PAL['cv-ink']:PAL['s4']});
  if(sh&&!ph)txt(ctx,'+'+usd(v1-v0),px+pw,y,{s:12*k,w:700,a:'right',c:col});y+=23*k;};
 row(ph?'Mean':'Mean (average) income',R.mean0(sim),R.mean1(sim),PAL['s1']);
 row(ph?'Median':'Median (middle) income',R.med0(sim),R.med1(sim),PAL['s3']);
 if(G&&G.g){txt(ctx,'Your gut: mean '+ladL(G.g.gm)+', median '+ladL(G.g.gd),px,y,{s:12*k,w:700,c:PAL['s4']});y+=18*k;}
 if(G&&G.m&&!ph){y=wrap(ctx,`The math: (${usd(rich(sim))} − ${usd(R.mean0(sim))}) ÷ ${(N+1).toLocaleString('en-US')} = +${usd(dMean(sim))}`,px,y+4,pw,16*k,{s:12*k,w:700,c:PAL['rj']})+18*k;}
 else if(pend(sim)){txt(ctx,ph?'Your turn: the mean’s rise':'Your turn: work out the mean’s rise',px,y+4,{s:12*k,w:700,c:PAL['rj']});y+=20*k;}
 if(sh&&!ph&&y<base-10)wrap(ctx,`${belowNewMean(sim).toLocaleString('en-US')} of ${(N+1).toLocaleString('en-US')} households now earn less than the mean.`,px,y+4,pw,16*k,{s:12*k,c:PAL['cv-soft']});
 if(!ph)txt(ctx,'Incomes are an illustration shaped like a real town: median $87,460.',24,H-14,{s:12*k,c:PAL['cv-soft']});}

function drawSurvey(sim,ctx,k){const a=T0(sim),r=respondents(sim),T=cap(sim),ph=k>1.4,fit=atLeast('ap')?paretoFit(sim):null,N=a.length;
 txt(ctx,'What the survey file shows',24,30,{s:15*k,w:700});
 if(!ph)txt(ctx,'Share of households above each income, on log scales',24,30+18*k,{s:12*k,c:PAL['cv-soft']});
 const L=70,Rr=470,top=Math.round(66+20*k),bot=H-60,x0=4.5,x1=7,y0=-3.3,y1=0;
 const X=v=>L+(Math.log10(v)-x0)/(x1-x0)*(Rr-L),Y=s=>bot-(Math.log10(s)-y0)/(y1-y0)*(bot-top);
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[1,0.1,0.01,0.001].forEach(s=>{ctx.beginPath();ctx.moveTo(L,Y(s));ctx.lineTo(Rr,Y(s));ctx.stroke();txt(ctx,s>=0.01?(s*100)+'%':'0.1%',L-6,Y(s),{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
 [[1e5,'$100k'],[1e6,'$1M'],[1e7,'$10M']].forEach(([v,l])=>{ctx.beginPath();ctx.moveTo(X(v),top);ctx.lineTo(X(v),bot);ctx.stroke();txt(ctx,l,X(v),bot+17*k,{s:12*k,a:'center',c:PAL['cv-soft']});});
 /* true incomes, faint */
 ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.45;a.forEach((x,i)=>{const s=(N-i)/N;if(x>=10**x0&&s>=10**y0){ctx.fillRect(X(x)-1.5,Y(s)-1.5,3,3);}});ctx.globalAlpha=1;
 /* measured */
 const m=r.map(x=>Math.min(x,T)),n=m.length;ctx.fillStyle=PAL['s2'];
 m.forEach((x,i)=>{const s=(n-i)/n;if(x>=10**x0&&s>=10**y0)ctx.fillRect(X(x)-2.5,Y(s)-2.5,5,5);});
 if(isFinite(T)){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(T),top);ctx.lineTo(X(T),bot);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'top code '+usdk(T),X(T)+5,top+10,{s:12*k,w:700,c:PAL['s1']});
  if(!ph)txt(ctx,`${nCapped(sim)} recorded at the cap`,X(T)+5,top+10+16*k,{s:12*k,c:PAL['s1']});}
 if(fit&&fit.a&&!ph){const Lc=T/2,sT=fit.nT/r.length;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([8,5]);ctx.beginPath();
  const sx=v=>sT*Math.pow(v/T,-fit.a);let first=true;for(let v=Lc;v<=1e7;v*=1.08){const s=sx(v);if(s<10**y0)break;const px=X(v),py=Y(s);if(first){ctx.moveTo(px,py);first=false;}else ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Pareto fit, α ≈ '+fit.a.toFixed(2),X(T)+5,top+10+(ph?16:32)*k,{s:12*k,w:700,c:PAL['s4']});}
 if(!ph){legendDot(ctx,L,H-22,PAL['cv-soft'],'true incomes',k);legendDot(ctx,L+120*k,H-22,PAL['s2'],'what the file shows',k);}
 /* Lorenz */
 const LX=530,LY=Math.round(top+6+40*k),fx=fit&&fit.fix,s=Math.max(120,Math.min(230,H-LY-(fx?70:54)*k-6)),LX2=v=>LX+v*s,LY2=v=>LY+s-v*s;
 txt(ctx,'Lorenz curves',LX,top+6,{s:14*k,w:700});
 txt(ctx,(ph?'Gini ':'Gini: true ')+gini(a).toFixed(3)+(ph?' / ':', file ')+gini(m).toFixed(3),LX,top+6+18*k,{s:12*k,w:700,c:PAL['s2']});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.strokeRect(LX,LY,s,s);ctx.beginPath();ctx.moveTo(LX2(0),LY2(0));ctx.lineTo(LX2(1),LY2(1));ctx.stroke();
 const lor=(arr,col,dash)=>{const b=arr.slice().sort((x,y)=>x-y),Tt=sum(b);let c=0;ctx.strokeStyle=col;ctx.lineWidth=3;if(dash)ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(LX2(0),LY2(0));
  const st=Math.max(1,Math.floor(b.length/200));b.forEach((x,i)=>{c+=x;if(i%st===0||i===b.length-1)ctx.lineTo(LX2((i+1)/b.length),LY2(c/Tt));});ctx.stroke();ctx.setLineDash([]);};
 lor(a,PAL['cv-ink'],true);lor(m,PAL['s2'],false);
 const tm=mean(a),mm2=mean(m);txt(ctx,`Mean: true ${usd(tm)}`,LX,LY+s+20*k,{s:12*k,w:700});txt(ctx,`File shows ${usd(mm2)}`,LX,LY+s+37*k,{s:12*k,w:700,c:PAL['s2']});
 if(fx)txt(ctx,`Pareto fix ${usd(fit.fix)}`,LX,LY+s+54*k,{s:12*k,w:700,c:PAL['s4']});}
function legendDot(ctx,x,y,col,lab,k){ctx.fillStyle=col;ctx.fillRect(x,y-5,8,8);txt(ctx,lab,x+13,y,{s:12*k,b:'middle',c:PAL['cv-soft']});}

function drawTax(sim,ctx,k){const ph=k>1.4,ap=atLeast('ap');
 txt(ctx,ph?'Two ways to count income':'One very wealthy family’s year, two ways to count income',24,30,{s:15*k,w:700});
 if(!ph)txt(ctx,'An illustration. Amounts in millions of dollars.',24,30+18*k,{s:12*k,c:PAL['cv-soft']});
 const L=40,Wd=720,ti=taxable(sim),ec=econ(sim),tx=taxPaid(sim)+corpC(sim),pos2=sim.p.twage+sim.p.treal+Math.max(0,sim.p.tunr)+corpC(sim),sc=Wd/Math.max(ti,pos2,tx,1);
 const bar=(y,lab,tot,tax,rate,parts)=>{txt(ctx,lab,L,y-10,{s:13*k,w:700});let x=L;parts.forEach(([v,col,l])=>{if(v<=0)return;const w=v*sc;ctx.fillStyle=col;ctx.fillRect(x,y,w,26);if(w>70&&!ph)txt(ctx,l,x+6,y+13,{s:12*k,b:'middle',c:'#fff',w:700});x+=w;});
  if(tot<=0){txt(ctx,'Zero or less: no meaningful rate',L,y+13,{s:12*k,b:'middle',c:PAL['s1'],w:700});return;}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.strokeRect(L,y,Math.min(tax*sc,Wd),26);
  txt(ctx,`Tax ${mm(tax)} ÷ ${mm(tot)} = ${pc(rate)}`,L,y+26+18*k,{s:13*k,w:700,c:PAL['rj']});};
 const y1=Math.round(88+18*k),y2=y1+Math.round(70+22*k);
 bar(y1,'Income on the tax return (realized)',ti,taxPaid(sim),rate1(sim),[[sim.p.twage,'#3f6fb0','wages'],[sim.p.treal,'#2f7d5b','gains sold']]);
 bar(y2,ap&&sim.p.corp?'Economic income: + gains not sold + corporate tax':'Economic income: + stock gains not sold',ec,tx,rate2(sim),[[sim.p.twage,'#3f6fb0','wages'],[sim.p.treal,'#2f7d5b','gains sold'],[Math.max(0,sim.p.tunr),'#8a5a12','gains not sold (unrealized)'],[corpC(sim),'#6b4fa0','corp. tax']]);
 /* rate axis with published estimates */
 if(sim.p.tunr<0)txt(ctx,`Stock fell ${mm(-sim.p.tunr)}: subtract it`,L+Wd,y2-10,{s:12*k,w:700,a:'right',c:PAL['s1']});
 const ay=y2+26+Math.round(110*k),ax0=60,ax1=740,RX=v=>ax0+clamp(v,0,40)/40*(ax1-ax0);
 txt(ctx,ph?'Rates':'Published estimates of federal income tax rates at the very top',24,ay-62*k,{s:13*k,w:700});
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax0,ay);ctx.lineTo(ax1,ay);ctx.stroke();
 [0,10,20,30,40].forEach(v=>{ctx.beginPath();ctx.moveTo(RX(v),ay-4);ctx.lineTo(RX(v),ay+4);ctx.stroke();txt(ctx,v+'%',RX(v),ay+17*k,{s:12*k,a:'center',c:PAL['cv-soft']});});
 const mark=(v,lab,row,col,up)=>{const x=RX(v);ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,ay,5,0,7);ctx.fill();const yy=up?ay-10-row*15*k:ay+(30+row*15)*k;if(lab)txt(ctx,lab,x,yy,{s:12*k,w:700,a:x<ax0+60?'left':x>ax1-60?'right':'center',c:col});};
 mark(3.4,ph?'3.4%':'3.4% ProPublica',2,PAL['s4'],true);mark(8.2,ph?'8.2%':'8.2% CEA/OMB',1,PAL['s4'],true);mark(14,ph?'14%':'14% typical household',0,PAL['cv-soft'],true);
 const r1=rate1(sim),r2=rate2(sim);if(r1!=null)mark(r1,ph?'':'return '+pc(r1),0,PAL['rj'],false);if(r2!=null)mark(r2,ph?'':'economic '+pc(r2),1,PAL['rj'],false);
 if(ap&&!ph){let y=H-14;const notes=[];if(sim.p.borrow>0)notes.push(`Borrowed and spent ${mm(sim.p.borrow)} against stock: taxable income from it $0.`);
  if(sim.p.heirs&&sim.p.tunr>0)notes.push(`Heirs inherit with a step-up in basis: ${mm(Math.max(0,sim.p.tunr))} of gain never taxed as income (${mm(TAXG*Math.max(0,sim.p.tunr))} at 23.8%).`);
  notes.reverse().forEach(t=>{txt(ctx,t,24,y,{s:12*k,c:PAL['cv-soft']});y-=17*k;});}}

function drawWork(sim,ctx,k){const ws=weeks(sim),ph=k>1.4,E=earn(sim),P=pov(sim);
 txt(ctx,ph?'A parent with two jobs':'A parent with two jobs: 52 weeks of hours',24,30,{s:15*k,w:700});
 if(!ph)txt(ctx,'Blue: main job (hours change week to week). Amber: second job. Line: 40 hours.',24,30+18*k,{s:12*k,c:PAL['cv-soft']});
 const L=ph?62:40,Rr=780,top=Math.round(62+20*k),base=Math.round(250+10*k),bw=(Rr-L)/52,hm=70,Y=h=>base-(base-top)*Math.min(h,hm)/hm;
 ws.forEach((w,i)=>{const x=L+i*bw+1;if(!w.on){ctx.strokeStyle=PAL['line'];ctx.strokeRect(x,base-6,bw-2,6);return;}
  ctx.fillStyle='#3f6fb0';ctx.fillRect(x,Y(w.h1),bw-2,base-Y(w.h1));ctx.fillStyle=sim.p.cash?'#a8761c':'#c98a1e';ctx.fillRect(x,Y(w.h1+w.h2),bw-2,Y(w.h1)-Y(w.h1+w.h2));});
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,base);ctx.lineTo(Rr,base);ctx.stroke();
 ctx.strokeStyle=PAL['s1'];ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(L,Y(40));ctx.lineTo(Rr,Y(40));ctx.stroke();ctx.setLineDash([]);
 txt(ctx,'40 h',L-4,Y(40),{s:12*k,a:'right',b:'middle',c:PAL['s1']});txt(ctx,'Week 1',L,base+16*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Week 52',Rr,base+16*k,{s:12*k,a:'right',c:PAL['cv-soft']});
 /* the year against the poverty line */
 const by=base+Math.round(56+20*k),bx=L,bwid=Rr-L-10,mx=Math.max(E,P)*1.12,X=v=>bx+v/mx*bwid;
 txt(ctx,`The year: ${Math.round(hoursYr(sim)).toLocaleString('en-US')} hours, ${usd(E)} earned`,L,by-12,{s:13*k,w:700});
 ctx.fillStyle=PAL['line'];ctx.fillRect(bx,by,bwid,24);
 const j2=sum(ws.map(w=>w.h2*sim.p.w2));ctx.fillStyle='#3f6fb0';ctx.fillRect(bx,by,X(E-j2)-bx,24);ctx.fillStyle='#c98a1e';ctx.fillRect(X(E-j2),by,X(E)-X(E-j2),24);
 if(sim.p.cash){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.strokeRect(X(E-j2),by,X(E)-X(E-j2),24);ctx.setLineDash([]);}
 ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(P),by-8);ctx.lineTo(X(P),by+32);ctx.stroke();
 const pl=`Poverty line ${usd(P)}`;ctx.font='700 '+(12*k)+'px '+FONT;const plw=ctx.measureText(pl).width;txt(ctx,pl,clamp(X(P),bx+plw/2,Rr-plw/2),by+50*k,{s:12*k,w:700,a:'center',c:PAL['s1']});
 let y=by+(ph?72:76)*k;const g=P-E,h=toLine(sim);
 txt(ctx,g>0?(ph?`${usd(g)} below the line (${Math.round(h)} more hours)`:`${usd(g)} below the line: about ${Math.round(h)} more hours at this pay.`):`${usd(-g)} above the line.`,L,y,{s:13*k,w:700,c:g>0?PAL['s1']:PAL['s3']});
 if(!ph){y+=18*k;txt(ctx,`Lowest week: ${usd(lowWeek(sim))}. Weeks under 75% of a usual week: ${dipWeeks(sim)}.`,L,y,{s:12*k,c:PAL['cv-soft']});}
 if(sim.p.cash&&!ph){y+=17*k;txt(ctx,`Paid in cash, the second job is missing from payroll records, which show ${usd(records(sim))}.`,L,y,{s:12*k,c:PAL['cv-soft']});}}

function draw(sim,ctx,vdt,k){sim._k=k;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);syncVis(sim);
 const v=sim.p.view;if(v==='survey')drawSurvey(sim,ctx,k);else if(v==='tax')drawTax(sim,ctx,k);else if(v==='work')drawWork(sim,ctx,k);else drawRoom(sim,ctx,k);}

function infoHTML(sim){return `<h3>What this number hides</h3><ul>
<li><b>The town’s mean income</b> counts the newcomer. The median ignores how rich the top is. Neither one tells you who is struggling.</li>
<li><b>A top-coded survey</b> records the richest households at the cap. Their real incomes are not in the public file, so the measured mean and Gini come out too low.</li>
<li><b>A tax rate</b> depends on what you divide by. Wealth that grows without a sale is not taxable income, so the same family can show 26% or 3%.</li>
<li><b>A yearly income</b> hides the week the paycheck came up short, the second job, and the work paid in cash that no record shows.</li>
<li><b>The homeless count</b> is one night in January. It counts people in shelters and on the street. It does not count families who double up with relatives.</li></ul>
`;}

const SIM={
 id:'hiddenends',hash:'hiddenends',apUnit:2,order:4,tab:'The hidden ends',kind:'Simulation',
 skills:{bio:'Mean vs. median, and a rate depends on its denominator · Algebra 1 (Unit 2), Statistics (Chapter 1)',honors:'Resistant measures, heavy tails and top-coding · Statistics (Chapter 1), AP Statistics (Unit 1), AP Microeconomics (Unit 6)',ap:'Fitting a Pareto tail with logarithms; the mean above a cap · Algebra 2 (Unit 5), AP Statistics (Unit 1)'},
 card:'Guess how much one very rich household moves a town’s average and middle income, then see why the richest and the poorest are the hardest people to measure.',
 title:'The hidden ends: measuring the richest and the poorest',
 lede:{bio:'Statistics describe the middle well. The two ends are hard to see, for opposite reasons. At the top, privacy rules, unsold stock and offshore accounts hide income. At the bottom, it is two jobs, changing hours and cash pay. Start with one rich household moving into a town.',
  honors:'Income at the top follows a heavy-tailed (Pareto) distribution: a few households hold a large share, so one of them can move a mean but not a median. Public survey files cap or swap the top incomes, which pulls the measured mean and Gini down.',
  ap:'If the share of households above x falls like x^−α, then α = ln(n_L ÷ n_T) ÷ ln(T ÷ L) from two counts, and the mean above a cap T is α ÷ (α − 1) × T. A tax rate is tax ÷ income, and the answer depends on which income you divide by.'},
 scale:'One town of 1,000 households for one year (an illustration), one very wealthy family’s year in millions of dollars, and one working parent’s 52 weeks.',
 aspect:1.6,timeless:true,trials:true,graph:true,
 controlsTitle:'What to measure',
 controls:[
  {id:'view',label:'What to look at',type:'seg',def:'room',noGut:true,onChange:syncVis,options:[{v:'room',l:'A rich household moves in'},{v:'tax',l:'Two tax rates'},{v:'work',l:'Two jobs, still poor'},{v:'survey',l:'What the survey misses',lvl:'honors'}]},
  {id:'gmean',label:'Your guess: the average (mean) income rises by',type:'seg',def:1000,options:LAD.map(v=>({v,l:ladL(v)}))},
  {id:'gmed',label:'Your guess: the middle (median) income rises by',type:'seg',def:1000,options:LAD.map(v=>({v,l:ladL(v)}))},
  {id:'show',label:'Show the new mean and median',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'rich',label:'Newcomer’s income this year, in millions of dollars',type:'range',min:1,max:1000,step:1,def:50,unit:'M',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'n',label:'Households in the town',type:'seg',def:'1000',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'100',l:'100'},{v:'1000',l:'1,000'},{v:'10000',l:'10,000'}]},
  {id:'alpha',label:'Tail exponent α (lower = heavier tail at the top)',type:'range',min:1.3,max:3,step:0.1,def:2,d:1,lvl:'ap',noGut:true,onChange:clearGut,help:'Shapes the top 10% of the town. 2 is an assumption for illustration.'},
  {id:'tcap',label:'Survey top code (incomes above it are recorded at it)',type:'seg',def:'458000',lvl:'honors',noGut:true,options:[{v:'none',l:'None'},{v:'150000',l:'$150k'},{v:'250000',l:'$250k'},{v:'458000',l:'$458k'},{v:'1000000',l:'$1M'}]},
  {id:'nonresp',label:'Households who don’t answer, in the top 5% and bottom 5%',type:'range',min:0,max:50,step:5,def:0,unit:'%',lvl:'ap',noGut:true},
  {id:'twage',label:'Wages and salary, $ millions',type:'range',min:0,max:10,step:0.1,def:2,d:1,unit:'M',lvl:'honors',noGut:true},
  {id:'treal',label:'Gains and dividends from stock sold, $ millions',type:'range',min:0,max:50,step:0.5,def:8,d:1,unit:'M',lvl:'honors',noGut:true},
  {id:'tunr',label:'Rise in value of stock not sold, $ millions',type:'range',min:-50,max:200,step:1,def:90,unit:'M',lvl:'honors',noGut:true,help:'Negative means the stock fell this year.'},
  {id:'corp',label:'Also count corporate income tax on their companies ($5M)',type:'toggle',def:false,lvl:'ap',noGut:true,help:'The Tax Foundation’s critique. $5M is an assumption for illustration.'},
  {id:'borrow',label:'Spending paid for with loans against the stock, $ millions',type:'range',min:0,max:20,step:0.5,def:0,d:1,unit:'M',lvl:'ap',noGut:true},
  {id:'heirs',label:'The stock passes to heirs at death (step-up in basis)',type:'toggle',def:false,lvl:'ap',noGut:true},
  {id:'hh',label:'Household',type:'seg',def:'four',noGut:true,options:[{v:'one',l:'Lives alone'},{v:'four',l:'Family of four'}]},
  {id:'w1',label:'Main job: pay per hour',type:'range',min:7.25,max:30,step:0.25,def:14,d:2,unit:' $/h',noGut:true},
  {id:'h1',label:'Main job: usual hours a week',type:'range',min:0,max:50,step:1,def:28,unit:' h',noGut:true},
  {id:'w2',label:'Second job: pay per hour',type:'range',min:7.25,max:30,step:0.25,def:12,d:2,unit:' $/h',noGut:true},
  {id:'h2',label:'Second job: hours a week',type:'range',min:0,max:30,step:1,def:14,unit:' h',noGut:true},
  {id:'wks',label:'Weeks worked this year',type:'range',min:27,max:52,step:1,def:50,unit:' weeks',noGut:true},
  {id:'vary',label:'How much main-job hours change week to week',type:'range',min:0,max:60,step:5,def:30,unit:'%',lvl:'honors',noGut:true},
  {id:'cash',label:'The second job pays in cash, off the books',type:'toggle',def:false,lvl:'honors',noGut:true}
 ],
 actions:[
  {id:'arrive',label:'Show the newcomer’s effect',run(sim){BioLab.setValues(sim,{view:'room',show:true});}},
  {id:'twofam',label:'Try it: a year the stock falls',lvl:'honors',run(sim){BioLab.setValues(sim,{view:'tax',tunr:-40});}},
  {id:'minwage',label:'Try it: full time at $7.25, alone',run(sim){BioLab.setValues(sim,{view:'work',hh:'one',w1:7.25,h1:40,h2:0,wks:52,vary:0,cash:false});}},
  {id:'cps',label:'Use a $458k top code',lvl:'honors',run(sim){BioLab.setValues(sim,{view:'survey',tcap:'458000'});}}
 ],
 init(){return {};},step(){},
 onLevel:syncVis,
 metrics:[
  {id:'mean0',label:'Town mean income, before',unit:'dollars',d:0,min:0,max:null,get:R.mean0},
  {id:'med0',label:'Town median income, before',unit:'dollars',d:0,min:0,max:null,get:R.med0},
  {id:'dmean',label:'Rise in the mean',unit:'dollars',d:0,min:0,max:null,get:s=>shown(s)?dMean(s):null},
  {id:'dmed',label:'Rise in the median',unit:'dollars',d:2,min:0,max:null,get:s=>shown(s)?dMed(s):null},
  {id:'below',label:'Households earning less than the new mean',unit:'households',d:0,min:0,max:null,get:s=>shown(s)?belowNewMean(s):null},
  {id:'rate1',label:'Tax rate on the tax-return income',unit:'%',d:1,min:0,max:50,get:rate1},
  {id:'rate2',label:'Tax rate on economic income',unit:'%',d:2,min:0,max:50,get:rate2},
  {id:'earn',label:'Parent’s earnings this year',unit:'dollars',d:0,min:0,max:null,get:earn},
  {id:'hours',label:'Hours worked this year',unit:'hours',d:0,min:0,max:null,get:hoursYr},
  {id:'gap',label:'Distance below the poverty line',unit:'dollars',d:0,min:null,max:null,get:s=>pov(s)-earn(s)},
  {id:'tohours',label:'More hours needed to reach the line',unit:'hours',d:0,min:0,max:null,get:s=>toLine(s)},
  {id:'lowwk',label:'Lowest week’s pay',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:lowWeek},
  {id:'records',label:'Earnings that payroll records show',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:records},
  {id:'tmean',label:'True mean income (survey view)',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:s=>mean(T0(s))},
  {id:'mmean',label:'Mean income the survey file shows',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:s=>mean(measured(s))},
  {id:'ncap',label:'Households recorded at the top code',unit:'households',d:0,lvl:'honors',min:0,max:null,get:nCapped},
  {id:'tgini',label:'True Gini',unit:'0 to 1',d:3,lvl:'honors',min:0,max:1,get:s=>gini(T0(s))},
  {id:'mgini',label:'Gini the survey file shows',unit:'0 to 1',d:3,lvl:'honors',min:0,max:1,get:s=>gini(measured(s))},
  {id:'top1',label:'Top 1% share of income: true',unit:'%',d:1,lvl:'honors',min:0,max:100,get:s=>100*topShare(T0(s),0.01)},
  {id:'ahat',label:'Pareto α fitted from the file',unit:'',d:3,lvl:'ap',min:0,max:null,get:s=>{const f=paretoFit(s);return f&&f.a!=null?f.a:null;}},
  {id:'fixmean',label:'Mean with the Pareto fix',unit:'dollars',d:0,lvl:'ap',min:0,max:null,get:s=>{const f=paretoFit(s);return f&&f.fix!=null?f.fix:null;}}
 ],
 graphs:[{id:'meanmed',label:'Mean and median vs. the newcomer’s income',custom:true}],defaultGraph:'meanmed',
 plot(sim,ctx,box){const a=T0(sim),m0=mean(a),d0=median(a),N=a.length,md1=median(a.concat([1e12]));
  const xs=[1,2,5,10,20,50,100,200,500,1000],ymax=Math.max(1.2,(m0+(1000e6-m0)/(N+1))/m0*1.05);
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:ymax,xl:'Newcomer’s income, $ millions (log scale): 1, 10, 100, 1,000',yl:'Value ÷ value before'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the math',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const line=(f,col)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=60;i++){const lx=i/20,v=10**lx*1e6,y=f(v);i?ctx.lineTo(ax.X(lx),ax.Y(y)):ctx.moveTo(ax.X(lx),ax.Y(y));}ctx.stroke();};
  line(v=>(m0+(v-m0)/(N+1))/m0,PAL['s1']);line(()=>md1/d0,PAL['s3']);
  const lx=Math.log10(sim.p.rich);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(lx),ax.Y(R.mean1(sim)/m0),5,0,7);ctx.fill();
  txt(ctx,'mean',box.L+box.W-6,ax.Y((m0+(1000e6-m0)/(N+1))/m0)+14,{s:12,a:'right',c:PAL['fg'],w:700});
  txt(ctx,'median',box.L+box.W-6,ax.Y(md1/d0)-8,{s:12,a:'right',c:PAL['fg'],w:700});},
 draw,
 infoPanel:infoHTML,
 narrate(sim){const v=sim.p.view;
  if(v==='tax'){const r1=rate1(sim),r2=rate2(sim);if(r2==null)return `The stock fell, so economic income is ${mm(econ(sim))}. <b>A rate on income that is zero or negative means nothing.</b> This is one reason critics say paper gains make a shaky tax base.`;
   return `Divide the same ${mm(taxPaid(sim)+corpC(sim))} of tax by the income on the return and the rate is <b>${pc(r1)}</b>. Divide by economic income, which counts stock gains not yet sold, and it is <b>${pc(r2)}</b>. The tax did not change; the definition did.`;}
  if(v==='work'){const g=pov(sim)-earn(sim);return `${Math.round(hoursYr(sim)).toLocaleString('en-US')} hours of work this year pays ${usd(earn(sim))}. ${g>0?`<b>That is ${usd(g)} below the poverty line</b> for this household`:`<b>That is ${usd(-g)} above the poverty line</b> for this household`}. A full-time year is 2,080 hours.`;}
  if(v==='survey'){const T=cap(sim);if(!isFinite(T))return 'With no top code, the file shows every income. <b>Pick a top code</b> and watch the mean and the Gini fall.';
   return `${nCapped(sim)} households are recorded at exactly ${usdk(T)}. <b>The file’s mean is ${usd(mean(T0(sim))-mean(measured(sim)))} too low</b>, and its Gini reads ${gini(measured(sim)).toFixed(3)} instead of ${gini(T0(sim)).toFixed(3)}.`;}
  if(!shown(sim))return `The town’s median income is ${usd(R.med0(sim))}. <b>One household with ${big(rich(sim))} of income moves in.</b> Guess how far the mean and the median move, then lock it in.`;
  return `The mean rises by <b>${usd(dMean(sim))}</b>, but the median rises by only <b>${usd(dMed(sim))}</b>. ${belowNewMean(sim).toLocaleString('en-US')} households now earn less than the “average” income, and not one of their paychecks changed.`;},
 gut:{better:'lower',controls:['gmean','gmed'],
  ask:{bio:'A household with $50 million of income this year moves into a town of 1,000 households. By feel, pick how much the town’s <b>average</b> income rises, and how much its <b>middle</b> income rises. Then lock it in.',
   honors:'Before the reveal: pick the rise in the mean and the rise in the median when the newcomer arrives. Hint: the newcomer’s income is spread over 1,001 households in the mean.'},
  lock(sim){const dm=dMean(sim),dd=dMed(sim),gm=+sim.p.gmean,gd=+sim.p.gmed;return {v:Math.abs(gm-dm)+Math.abs(gd-dd),gm,gd,label:`mean ${ladL(gm)}, median ${ladL(gd)}`};},
  solve(sim){const dm=dMean(sim),dd=dMed(sim);sim.p.gmean=near(dm);sim.p.gmed=near(dd);sim.p.show=true;sim.p.view='room';return {v:0,gm:dm,gd:dd,label:`mean +${usd(dm)}, median +${usd(dd)}`};},
  hint:'Lock in your gut answer. Then you will work out the rise in the mean yourself.',
  calc:{unit:'$',d:0,tol:a=>Math.max(5,0.002*a),
   prompt:{bio:sim=>{const N=T0(sim).length;return `The town’s ${N.toLocaleString('en-US')} households have a mean income of <b>${usd(R.mean0(sim))}</b>. A household with <b>${usd(rich(sim))}</b> of income moves in. Find the town’s total income before, add the newcomer, and divide by ${(N+1).toLocaleString('en-US')} households. How many dollars does the mean rise?`;},
    ap:sim=>{const N=T0(sim).length;return `Use Δx̄ = (x_new − x̄) ÷ (N + 1) with x̄ = ${usd(R.mean0(sim))}, x_new = ${usd(rich(sim))} and N = ${N.toLocaleString('en-US')}. How many dollars does the mean rise?`;}},
   answer:calcAns,
   hint:'Total before = mean × households. New mean = (total before + the newcomer) ÷ (households + 1). Subtract the old mean.',
   steps(sim){const N=T0(sim).length,m0=R.mean0(sim),tot=m0*N,m1=R.mean1(sim);
    return [`Total before: ${usd(m0)} × ${N.toLocaleString('en-US')} = ${usd(tot)}.`,`Add the newcomer: ${usd(tot)} + ${usd(rich(sim))} = ${usd(tot+rich(sim))}, over ${(N+1).toLocaleString('en-US')} households: ${usd(m1)}.`,`Rise: ${usd(m1)} − ${usd(m0)} = <b>${usd(dMean(sim))}</b>. Shortcut: (${usd(rich(sim))} − ${usd(m0)}) ÷ ${(N+1).toLocaleString('en-US')} gives the same.`,`The median only moves one household up the line: +${usd(dMed(sim))}.`];}},
  formula(sim){const N=T0(sim).length;return `Rise in the mean = (${usd(rich(sim))} − ${usd(R.mean0(sim))}) ÷ ${(N+1).toLocaleString('en-US')} = ${usd(dMean(sim))}; the median moves one household up the line: +${usd(dMed(sim))}`;},
  how:{bio:'The new mean is (everyone’s income + the newcomer’s) ÷ 1,001. The new median is the middle household of 1,001, which is one step up the line from the old middle.',
   honors:'Rise in the mean = (newcomer − old mean) ÷ (N + 1). The median moves to the next household in line, half the gap between the 500th and 501st incomes.',
   ap:'Mean: Δx̄ = (x_new − x̄) ÷ (N + 1), linear in x_new. Median: Δ = (x₍₅₀₁₎ − x₍₅₀₀₎) ÷ 2, the same for any newcomer above the middle. A mean has a breakdown point of 0; a median’s is 50%.'},
  compare(sim,g,m){const em=Math.abs(g.gm-m.gm),ed=Math.abs(g.gd-m.gd),N=T0(sim).length;
   const a=em<0.15*m.gm?`Your mean guess (${ladL(g.gm)}) was close: it really rises by <b>${usd(m.gm)}</b>.`:`You guessed the mean rises ${ladL(g.gm)}; it really rises by <b>${usd(m.gm)}</b>, off by ${usd(em)} for every household in town.`;
   const b=ed<=100?` Your median guess (${ladL(g.gd)}) was right on: it rises just <b>${usd(m.gd)}</b>.`:` You guessed the median rises ${ladL(g.gd)}; it rises just <b>${usd(m.gd)}</b>.`;
   return `${a}${b} The newcomer’s ${big(rich(sim))} is spread over ${(N+1).toLocaleString('en-US')} households in the mean, but the median only moves one household up the line. ${belowNewMean(sim).toLocaleString('en-US')} of ${(N+1).toLocaleString('en-US')} households now earn less than the mean.`;},
  again(sim){const opts=[5,20,50,200,1000];sim.p.rich=opts[Math.floor(Math.random()*opts.length)];sim.p.gmean=1000;sim.p.gmed=1000;sim.p.show=false;sim.p.view='room';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A street of 20 households has a mean income of $80,000. A household with $2,080,000 of income moves in. How many dollars does the street’s mean income rise?',answer:95238,tol:2,unit:'$',d:0,hint:'Total before: $80,000 × 20. Add the newcomer and divide by 21. Then subtract $80,000.',explain:'Total before: $1,600,000. With the newcomer: $3,680,000 ÷ 21 = $175,238, so the mean rises $95,238. Shortcut: ($2,080,000 − $80,000) ÷ 21 = $95,238. The median moves only one household up the line.'},
  {lvl:'bio',instant:true,q:'A town of 1,000 households has a median income of $87,460. One household with $50 million of income moves in. Which number barely changes?',choices:['The mean (average)','The median (middle)','Both jump by about $50,000'],correct:1,explain:'The median moves one household up the line: about $88. The mean rises about $49,820, because the $50 million is spread across 1,001 households. A report of “average income” can jump while no one else’s paycheck changes.'},
  {lvl:'bio',instant:true,q:'A family earns $10 million on its tax return and pays $2.64 million in federal income tax. Its stock also rose $90 million without being sold. What rate do you get if you divide the tax by all $100 million?',choices:['26.4%','2.6%','0%, because unsold gains are not taxed'],correct:1,explain:'$2.64M ÷ $100M = 2.64%. On the $10M on the return it is 26.4%. Same tax, two definitions of income, a 23.8-point difference.'},
  {lvl:'bio',instant:true,q:'Someone who lives alone works 40 hours a week, all 52 weeks, at the federal minimum wage of $7.25. The 2023 poverty line for one person was $15,480 (weighted average). Where do they land?',choices:['Above the line','About $400 below the line','Exactly on the line'],correct:1,explain:'$7.25 × 40 × 52 = $15,080, which is $400 below $15,480. A full-time, full-year job at that wage does not lift one person over the line.'},
  {lvl:'honors',instant:true,q:'A survey file records every income above $458,000 as $458,000. What happens to the measured mean and Gini of the town?',choices:['Both come out too low','Both come out too high','Neither changes, since few households are affected'],correct:0,explain:'In the town, 28 households are capped. The file’s mean falls from $129,785 to $118,281 and its Gini from 0.468 to 0.417. A few households at the top carry a large share of all income.'},
  {lvl:'honors',instant:true,q:'ProPublica found that the 25 wealthiest Americans’ wealth grew $401 billion from 2014 to 2018 and they paid $13.6 billion in federal income tax. What “true tax rate” is that?',choices:['About 34%','About 3.4%','About 0.34%'],correct:1,explain:'$13.6B ÷ $401B = 3.4%. ProPublica divided taxes by wealth growth, not by income on a tax return. That choice of denominator is exactly what critics contest.'},
  {lvl:'honors',instant:true,q:'One parent works full time all year at $15 an hour, and no one else in the family of four earns. The 2023 weighted average poverty line for a family of four was $31,200. Where does the family land?',choices:['Below the line','Exactly at the line','About twice the line'],correct:1,explain:'A full-time year is 40 hours × 52 weeks = 2,080 hours, and $15 × 2,080 = $31,200, exactly the line. For a family of four with one earner, $15 an hour full time is the official edge of poverty.'},
  {lvl:'ap',instant:true,q:'In the survey file, 114 households earn at least $229,000 and 28 earn at least $458,000. Assuming a Pareto tail, what is α?',choices:['About 1.0','About 2.0','About 4.1'],correct:1,explain:'α = ln(114 ÷ 28) ÷ ln(458,000 ÷ 229,000) = ln 4.07 ÷ ln 2 ≈ 2.03. With the unrounded α = 2.026, the mean of the capped households is α ÷ (α − 1) × $458,000 ≈ $904,000.'},
  {lvl:'ap',instant:true,q:'You fit a Pareto tail and get α = 0.9. Why can’t you use α ÷ (α − 1) × T for the mean above the cap?',choices:['The formula gives a negative number, because a Pareto tail with α ≤ 1 has no finite mean','It works fine; α just has to be positive','α below 1 means the data have no top'],correct:0,explain:'For α ≤ 1 the integral for the mean diverges: the tail is so heavy that the average is dominated by the largest values ever drawn. The fix only works for α > 1, and the tool refuses to use it near 1.'},
  {lvl:'ap',instant:true,q:'The Tax Foundation says an accrual-based rate must count corporate tax. Add $5M of corporate tax to both the tax and the income of the family ($100M economic income, $2.64M tax). What is the new rate?',choices:['About 2.6%','About 7.3%','About 26%'],correct:1,explain:'($2.644M + $5M) ÷ ($100M + $5M) = $7.644M ÷ $105M ≈ 7.3%. The definition question has a second step: which taxes count, not just which income.'}
 ],
 tour:[
  {title:'A town, sorted by income',text:'Here are 1,000 households, by income this year. Most are near the middle: the median, the household halfway up the line, earns $87,460. A few at the top earn far more, so the mean (average) is higher: $129,785.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'room',show:false,rich:50,n:'1000',alpha:2}),focus:[0,40,500,460]},
  {title:'One household moves in',text:'A household with $50 million of income this year arrives. The mean is total income ÷ households: it rises by ($50,000,000 − $129,785) ÷ 1,001 ≈ $49,820. The median only moves one household up the line: about $88.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'room',show:true})},
  {title:'Two ways to count income',text:'A very wealthy family reports $10 million on its tax return ($2M of wages, $8M of gains from stock it sold) and pays $2.64 million: 26.4%. Its other stock rose $90 million, but unsold gains are not taxable income. Counted as income, they drop the rate to 2.64%.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'tax',twage:2,treal:8,tunr:90,corp:false,borrow:0,heirs:false})},
  {title:'Published estimates',text:'The White House Council of Economic Advisers and OMB (2021) estimated 8.2% for the 400 wealthiest families, 2010 to 2018, counting unsold gains. ProPublica (2021) found 3.4% for the 25 wealthiest, 2014 to 2018. Critics answer that paper gains can vanish and that corporate taxes are left out.',pause:true},
  {lvl:'honors',title:'The survey caps the top',text:'Public survey files protect privacy by capping or swapping the highest incomes. With a $458,000 cap, 28 households are recorded at the cap. The file’s mean falls by $11,505 and its Gini from 0.468 to 0.417.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'survey',tcap:'458000',nonresp:0})},
  {lvl:'ap',title:'Fit the tail',text:'On log scales, a Pareto tail is a straight line. Count 114 households above $229,000 and 28 above $458,000: α = ln(114 ÷ 28) ÷ ln 2 ≈ 2.03. The fitted mean above the cap, α ÷ (α − 1) × $458,000, brings the mean back to within about $1,000 of the truth.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'survey',tcap:'458000',nonresp:0})},
  {title:'The other end: two jobs',text:'A parent works 28 hours at $14 and 14 hours at $12, 50 weeks a year: 2,100 hours, more than a full-time year. That pays $28,000, $3,200 below the $31,200 poverty line for a family of four. The weekly hours swing too, which the yearly number hides.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'work',hh:'four',w1:14,h1:28,w2:12,h2:14,wks:50,vary:30,cash:false})},
  {title:'What the numbers hide',text:'Below the picture, read what each number here leaves out. Both ends of the distribution are hard to see, for opposite reasons. Which one would you measure better first, and how?',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Which number tells you more about a typical household: the mean or the median?</p><ol><li>In <b>A rich household moves in</b>, turn on <b>Show the new mean and median</b>. Record a trial.</li><li>Switch to <b>Two tax rates</b>. Record both rates.</li><li>Switch to <b>Two jobs, still poor</b>. Change the hours and pay until the parent reaches the poverty line. Record what it took.</li></ol><p>Write two sentences: which number in this tool surprised you most, and what does it hide?</p>',
  honors:'<p><b>Question:</b> How much does a top code change what a survey shows?</p><ol><li>In <b>What the survey misses</b>, try each top code. Record the measured mean, the Gini and how many households are capped.</li><li>In <b>A rich household moves in</b>, set the newcomer to $1M, $10M, $100M and $1,000M. Record the rise in the mean and the median.</li><li>In <b>Two jobs, still poor</b>, raise the week-to-week change in hours from 0% to 60%. Record the lowest week’s pay.</li></ol><p>Explain why a yearly or average number can hide both the very top and the very bottom.</p>',
  ap:'<p><b>Question:</b> How well does a Pareto fit recover what a top code hides?</p><ol><li>Set the top code to $458k and record the true mean, the file’s mean and the Pareto fix.</li><li>Change α from 1.3 to 3. Record how far the file’s mean and the fix are from the truth.</li><li>Try the $150k top code, which sits below where the tail begins (the 90th percentile). What happens to the fit?</li><li>Raise nonresponse in both tails to 50%. What happens to the Gini?</li></ol><p><b>CER:</b> Make a claim about when a Pareto fit can be trusted, with evidence from your trials and reasoning from the shape of the tail.</p>'},
 terms:[
  {t:'Mean and median',d:'The mean adds every value and divides by how many there are. The median is the middle value when they are sorted.'},
  {t:'Realized and unrealized gains',d:'A gain is realized when you sell an asset for more than you paid. Until then it is unrealized, and U.S. law does not tax it as income.'},
  {t:'Effective tax rate',d:'Tax paid ÷ income. The answer depends on which definition of income you divide by.'},
  {t:'Working poor',d:'BLS: people who spent at least 27 weeks in the labor force (working or looking for work) whose income was still below the official poverty line.'},
  {t:'Heavy-tailed (Pareto) distribution',d:'A distribution where the share of people above x falls like x^−α. A few very large values hold a big share of the total.',lvl:'honors'},
  {t:'Top-coding',d:'Recording every value above a cap at the cap (or swapping and rounding it) so that no one in a public file can be identified.',lvl:'honors'},
  {t:'Nonresponse',d:'When a household skips a survey or one of its questions. Research linking Census survey answers to tax records finds it is highest at both ends of the earnings ladder.',lvl:'honors'},
  {t:'Income, wealth and consumption',d:'Income is what comes in during a year, wealth is what you own minus what you owe, and consumption is what you spend. Each one ranks households differently.',lvl:'honors'},
  {t:'Haig-Simons income',d:'An economist’s definition: consumption plus the change in net worth over the year, whether or not anything was sold.',lvl:'ap'},
  {t:'Step-up in basis',d:'At death, the tax basis of inherited assets is reset to their market value, so gains built up during the owner’s life are never taxed as income.',lvl:'ap'},
  {t:'Pareto exponent α',d:'From two counts, α = ln(n_L ÷ n_T) ÷ ln(T ÷ L). For α > 1, the mean above T is α ÷ (α − 1) × T.',lvl:'ap'}
 ],
 about:`<p><b>This is a simplified model for learning, not tax or financial advice.</b> The town, the wealthy family and the working parent are illustrations. Every real-world figure is stored in this page, with its source below.</p>
<p><b>The town (an illustration).</b> 1,000 households (100 or 10,000 at Closer look) on an evenly spaced grid of percentiles. Below the 90th percentile, income = $87,460 × e^(0.8z), a lognormal shape; above it, a Pareto tail joined at the 90th percentile ($243,818) with exponent α = 2. The median, $87,460, is the U.S. median household income for 2025 (Census, <i>Income in the United States: 2025</i>, P60-289, Sept. 15, 2026, <a href="https://www.census.gov/library/publications/2026/demo/p60-289.html" target="_blank" rel="noopener">census.gov</a>). The spread 0.8, the 90th-percentile join and α = 2 are assumptions for illustration, so the town’s mean, Gini and top shares are not real U.S. figures. The newcomer’s $50 million is also an assumption.</p>
<p><b>The survey (an illustration of real methods).</b> The tool caps incomes at the top code. The Census Bureau’s public CPS ASEC file instead swaps and rounds values above a threshold, and IPUMS lists the threshold for earnings from a person’s main job as $458,000 in 2025 and 2026 (<a href="https://cps.ipums.org/cps/topcodes_tables.shtml" target="_blank" rel="noopener">IPUMS CPS topcode tables</a>). That threshold applies to one person’s earnings, not household income, so the $458k cap here only borrows its size. Nonresponse in the tool drops a share of households from the bottom 5% and the top 5%; the U-shape comes from Bollinger, Hirsch, Hokayem and Ziliak, who linked CPS records to administrative earnings and found nonresponse “highest in the left and right tails” (<i>Journal of Political Economy</i>, 2019, <a href="https://econpapers.repec.org/RePEc:ucp:jpolec:doi:10.1086/701807" target="_blank" rel="noopener">abstract</a>); the 0% to 50% rates are assumptions. Pareto fix: α = ln(n_L ÷ n_T) ÷ ln(T ÷ L) with L = T ÷ 2, and the mean above T is α ÷ (α − 1) × T; the tool reports no fix when α ≤ 1.05.</p>
<p><b>Wealth at the top.</b> Federal Reserve Distributional Financial Accounts, second quarter of 2026: the top 1% held 32.5% of U.S. household net worth, the top 0.1% held 15.0%, and the bottom 50% held 2.3% (via FRED, updated Sept. 18, 2026: <a href="https://fred.stlouisfed.org/series/WFRBST01134" target="_blank" rel="noopener">top 1%</a>, <a href="https://fred.stlouisfed.org/series/WFRBSTP1300" target="_blank" rel="noopener">top 0.1%</a>, <a href="https://fred.stlouisfed.org/series/WFRBSB50215" target="_blank" rel="noopener">bottom 50%</a>). The Fed’s Survey of Consumer Finances, which these accounts build on, excludes people on the Forbes 400 list from its sample (SCF codebook, as cited by <a href="https://en.wikipedia.org/wiki/Survey_of_Consumer_Finances" target="_blank" rel="noopener">Wikipedia</a>).</p>
<p><b>Rich lists.</b> Bloomberg says each net worth on its index is “updated every business day” and that public stakes use the latest closing price (<a href="https://www.bloomberg.com/billionaires/" target="_blank" rel="noopener">Bloomberg Billionaires Index</a>). Forbes values private companies from estimated sales or profits times the ratios of similar public companies, takes a discount of 10% or more, and factors in debt; its figures are snapshot estimates, and some subjects decline to cooperate (Forbes 400 methodology, 2019 list, <a href="https://www.inkl.com/news/forbes-400-methodology-how-we-crunch-the-numbers" target="_blank" rel="noopener">Forbes via inkl</a>).</p>
<p><b>Tax rates at the top.</b> White House Council of Economic Advisers and OMB, Sept. 23, 2021: an average federal individual income tax rate of 8.2% for the 400 wealthiest families, 2010 to 2018, counting unrealized gains as they accrue, with a range of 6% to 12% under other assumptions; the authors call any such estimate “uncertain and open to refinement” (<a href="https://bidenwhitehouse.archives.gov/cea/written-materials/2021/09/23/what-is-the-average-federal-individual-income-tax-rate-on-the-wealthiest-americans/" target="_blank" rel="noopener">CEA</a>). ProPublica, “The Secret IRS Files,” June 8, 2021: the 25 wealthiest Americans’ wealth grew $401 billion from 2014 to 2018 (Forbes estimates) and they paid $13.6 billion in federal income taxes, a “true tax rate” of 3.4%; the median household earned about $70,000 and paid 14% in federal taxes (<a href="https://www.propublica.org/article/the-secret-irs-files-trove-of-never-before-seen-records-reveal-how-the-wealthiest-avoid-income-tax" target="_blank" rel="noopener">ProPublica</a>). The critique: the Tax Foundation (York, Watson and McBride, Sept. 24, 2021, updated July 24, 2023) argues an accrual measure of income needs an accrual measure of tax, including corporate income tax, which it calls the report’s main problem; it cites a total rate of 23% for the top 400 by income when corporate, estate and sales taxes are counted (Saez and Zucman), and calls the Forbes data “a questionable data source” (<a href="https://taxfoundation.org/blog/white-house-average-tax-rates-wealthy/" target="_blank" rel="noopener">Tax Foundation</a>).</p>
<p><b>Unsold gains, borrowing and death.</b> A capital gain arises when you sell an asset for more than its basis (<a href="https://www.irs.gov/taxtopics/tc409" target="_blank" rel="noopener">IRS Topic 409</a>). At death, the basis is “stepped up” to market value, so gains held until death are never subject to income tax; the Joint Committee on Taxation estimates the exclusion of gains at death costs $40 billion a year (Congressional Research Service, IF11812, Apr. 21, 2021, <a href="https://www.congress.gov/crs_external_products/IF/PDF/IF11812/IF11812.2.pdf" target="_blank" rel="noopener">congress.gov</a>). Loans are not income because they must be repaid; ProPublica describes borrowing against assets and credits the phrase “buy, borrow, die” to tax law professor Edward McCaffery. The family’s tax uses the top rates as if every dollar were taxed at them: 37% on wages (top rate for 2026, <a href="https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill" target="_blank" rel="noopener">IRS</a>) and 20% plus the 3.8% net investment income tax on gains (<a href="https://www.irs.gov/taxtopics/tc559" target="_blank" rel="noopener">IRS Topic 559</a>). Real returns have brackets, deductions and credits. The family’s amounts and the $5M of corporate tax are assumptions.</p>
<p><b>Offshore wealth.</b> EU Tax Observatory, <i>Global Tax Evasion Report 2024</i> (Alstadsæter, Godar, Nicolaides and Zucman, Oct. 2023): households held about $12 trillion offshore at the end of 2022, the equivalent of 12% of world GDP (<a href="https://policycommons.net/artifacts/5431695/global-tax-evasion" target="_blank" rel="noopener">report</a>). It estimates that about 25% of offshore financial wealth is still untaxed, after automatic exchange of bank information cut evasion, and that billionaires’ effective tax rates equal 0% to 0.5% of their wealth (as summarized by Jayati Ghosh, Social Europe, Oct. 30, 2023, <a href="https://www.socialeurope.eu/global-tax-evasion-the-good-and-the-bad-news" target="_blank" rel="noopener">socialeurope.eu</a>).</p>
<p><b>Two hard-to-see ends.</b> At the top, the numbers are hidden by privacy rules, by households who decline to answer, by wealth that is not income, and by money held offshore. At the bottom, they are hidden by irregular hours, by cash work, by people a household survey never reaches, and by benefits people forget to report. Researchers who linked Census survey answers to tax records found that people skip the earnings question most often at <b>both</b> ends of the income ladder.</p>
<p><b>A question of definitions, not just numbers.</b> <b>For counting gains as they grow:</b> economists often define income as what you spend plus the change in your wealth (the Haig-Simons definition). By that yardstick, a fortune that grows by billions is billions of income, whether or not anything is sold.</p>
<p><b>Against it:</b> a gain on paper can vanish next year, and nothing has been sold to pay a tax with. The Tax Foundation argues that a rate built on that definition must also count the corporate income tax the family’s companies pay, which pushes the rate up, and that the Forbes estimates behind it are a questionable data source.</p>
<p>The math in this tool is checkable. Which definition of income is fairer is a question of values, and the tool does not score it.</p>
<p><b>What the Church says about goods and work.</b> The Catechism teaches that “the goods of creation are destined for the whole human race” (no. 2402). The same paragraph defends private property as a guard for the freedom and dignity of persons. Saint John Paul II wrote that work has value first because “the one who is doing it is a person” (<i>Laborem Exercens</i>, no. 6). Neither text picks a tax rate.</p>
<p><b>Discuss:</b> Which of these hidden numbers would you most want your town to measure better? What would it take to measure it, and who would have to agree to be counted?</p>
<p><b>The working poor.</b> BLS, <i>A Profile of the Working Poor, 2023</i> (Report 1116, Dec. 2025): 6.1 million people were in the labor force at least 27 weeks and still below the official poverty line, a working-poor rate of 3.8%, down from 4.0% in 2022; 2.4% of usual full-time workers and 9.4% of part-time workers. Weighted average poverty thresholds in 2023: $15,480 for one person and $31,200 for a family of four. The official measure counts money income before taxes and leaves out noncash benefits such as SNAP (<a href="https://www.bls.gov/opub/reports/working-poor/2023/home.htm" target="_blank" rel="noopener">bls.gov</a>). Multiple jobholders: 8,805,000 in October 2026 (<a href="https://fred.stlouisfed.org/series/LNS12026619" target="_blank" rel="noopener">BLS CPS via FRED</a>), 5.5% of the employed in September 2026 (<a href="https://fred.stlouisfed.org/series/LNS12026620" target="_blank" rel="noopener">FRED</a>). The parent’s wages, hours and weeks, the 30% swing in hours and the one-earner household are assumptions. The federal minimum wage is $7.25 an hour.</p>
<p><b>Homelessness.</b> HUD’s point-in-time count found 745,652 people experiencing homelessness on one night in January 2025 (266,320 unsheltered), down from 771,480 in 2024 (<a href="https://www.hud.gov/news/hud-no-26-037" target="_blank" rel="noopener">HUD, May 29, 2026</a>; <a href="https://www.everycrsreport.com/files/2026-07-16_IF12985_72d0a36116392bd1d0a8436319884dc54412a17c.html" target="_blank" rel="noopener">CRS IF12985, July 16, 2026</a>). Limits: it is one night, not a year; it counts shelters and the street, not people about to lose housing; and in 2025, 29 of almost 400 local Continuums of Care did not do an unsheltered count. Schools use a broader definition that includes families doubled up with others: Colorado schools identified 22,896 students experiencing homelessness in 2023-24, 2.5% of students (<a href="https://www.cde.state.co.us/studentsupport/mkv23-24summarydata" target="_blank" rel="noopener">Colorado Department of Education</a>).</p>
<p><b>Missing at the bottom.</b> Meyer and Mittag linked New York administrative records to the Current Population Survey: the survey missed receipt for over 40% of food stamp (SNAP) recipients, over 60% of TANF and General Assistance recipients and over a third of housing assistance recipients; with the linked data, the poverty-reducing effect of these programs nearly doubles (<i>American Economic Journal: Applied Economics</i>, 2019, <a href="https://econpapers.repec.org/paper/izaizadps/dp10943.htm" target="_blank" rel="noopener">abstract</a>). Meyer, Mok and Sullivan describe rising nonresponse, imputation and misreporting of program receipt in household surveys (<i>Journal of Economic Perspectives</i>, 2015, <a href="https://www.aeaweb.org/articles?id=10.1257/jep.29.4.199" target="_blank" rel="noopener">aeaweb.org</a>). Work paid in cash and never reported, common in informal jobs and including work by undocumented immigrants without a payroll record, does not appear in payroll or tax records. For the cost side of being poor and informal, see <a href="https://rjedtech.github.io/Raider-MathLab/#costofliving" target="_blank" rel="noopener">Cost of living</a> and <a href="https://rjedtech.github.io/Raider-MathLab/#povertypremium" target="_blank" rel="noopener">The poverty premium</a> in Raider MathLab.</p>
<p><b>Quotations.</b> <i>Catechism of the Catholic Church</i>, no. 2402 (<a href="https://www.vatican.va/archive/ENG0015/__P8A.HTM" target="_blank" rel="noopener">vatican.va</a>); John Paul II, <i>Laborem Exercens</i> (1981), no. 6 (<a href="https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_14091981_laborem-exercens.html" target="_blank" rel="noopener">vatican.va</a>).</p>
<p><b>No definition here is scored.</b> Whether unsold gains should count as income, and what to do about either end of the distribution, are questions of values. The tool checks the math, not the answer.</p>`
};
BioLab.register(SIM);
})();
