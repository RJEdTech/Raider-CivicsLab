(function(){
'use strict';
const {clamp,txt,rr,PAL,FONT,axes,atLeast}=BioLab.h;
/* World Bank Poverty and Inequality Platform (PIP), accessed Nov 2026, 2021 PPP dollars per person per day.
   Share of the world's people living below each line. */
const BELOW={2024:{3:0.104,4.2:0.1893,8.3:0.4616,30:0.8064},1990:{3:0.4341,4.2:0.5561,8.3:0.7037,30:0.874}};
const POP={2024:8141.808945,1990:5299.246757};            /* millions, PIP reporting population */
const POOR3={2024:846.762143,1990:2300.592838};            /* millions below $3.00 */
const LINES={3:{l:'$3.00 a day',s:'$3.00',name:'the World Bank’s extreme poverty line'},8.3:{l:'$8.30 a day',s:'$8.30',name:'the poverty line for upper-middle-income countries'},30:{l:'$30 a day',s:'$30',name:'a line close to a rich country’s poverty line'}};
const BANDS=[{l:'Below $3.00',c:'#7b3f8f'},{l:'$3.00 to $4.20',c:'#b35a83'},{l:'$4.20 to $8.30',c:'#c98a4b'},{l:'$8.30 to $30',c:'#3f8f9b'},{l:'Above $30',c:'#2f5f9f'}];
/* World Bank regions, 2024 population (millions, WDI SP.POP.TOTL) and share below $3.00 (PIP 2024). */
const REG=[
 {id:'eas',ph:'East Asia & Pacific',l:'East Asia & Pacific',pop:2388.319468,p3:0.0197,c:'#3f7fb0'},
 {id:'sas',ph:'South Asia',l:'South Asia',pop:1677.384532,p3:0.0378,c:'#2f8f6f'},
 {id:'ssf',ph:'Sub-Saharan Africa',l:'Sub-Saharan Africa',pop:1289.936286,p3:0.4509,c:'#a8742a'},
 {id:'ecs',ph:'Europe & C. Asia',l:'Europe & Central Asia',pop:928.566925,p3:0.0057,c:'#7a5aa6'},
 {id:'mea',ph:'Mid. East, N. Africa+',l:'Middle East, N. Africa, Afghanistan & Pakistan',sl:'Middle East, N. Africa, Afg. & Pak.',pop:813.173936,p3:0.1437,c:'#b5534a'},
 {id:'lcn',ph:'Latin Am. & Carib.',l:'Latin America & Caribbean',pop:662.185614,p3:0.0428,c:'#3f9b8f'},
 {id:'nac',ph:'North America',l:'North America',pop:381.330762,p3:0.0094,c:'#69707c'}];
const WPOP=REG.reduce((a,r)=>a+r.pop,0);
/* Where a child is born. le, mys: UNDP HDR 2025 (2023). u5, u590: under-5 deaths per 1,000 births, UN IGME via World Bank (2024, 1990).
   elec: % with electricity, World Bank 2024. ppp: GDP per person, PPP, World Bank 2024. */
const PL=[
 {id:'nor',n:'Norway',le:83.3,u5:2.5,u590:8.7,mys:13.1,elec:100,ppp:105657,q:[9.1,14.4,18.0,22.7,35.8],gini:26.5,gy:2023},
 {id:'usa',n:'United States',le:79.3,u5:6.5,u590:11.2,mys:13.9,elec:100,ppp:86170,q:[5.1,10.0,15.1,22.6,47.1],gini:41.8,gy:2024},
 {id:'cri',n:'Costa Rica',le:80.8,u5:10.4,u590:16.9,mys:8.8,elec:99.8,ppp:31552,q:[4.7,9.0,13.8,21.5,50.9],gini:45.5,gy:2025},
 {id:'ecu',n:'Ecuador',le:77.4,u5:12.9,u590:53.7,mys:9.0,elec:98.5,ppp:15848,q:[4.8,8.9,13.7,21.2,51.5],gini:45.9,gy:2025},
 {id:'btn',n:'Bhutan',le:73.0,u5:17.2,u590:128,mys:5.8,elec:100,ppp:17762,q:[8.8,13.5,17.6,22.8,37.3],gini:28.5,gy:2022},
 {id:'ind',n:'India',le:72.0,u5:26.6,u590:127,mys:6.9,elec:99.9,ppp:10719,q:[11.1,14.8,17.9,22.0,34.2],gini:23.0,gy:2023},
 {id:'nga',n:'Nigeria',le:54.5,u5:115.6,u590:207.6,mys:7.6,elec:62.5,ppp:9100,q:[7.5,12.0,16.4,22.6,41.6],gini:33.9,gy:2022},
 {id:'wld',n:'World average',le:73.4,u5:37.4,u590:93.5,mys:8.8,elec:91.9,ppp:24544,q:null,gini:null}];
const P=id=>PL.find(x=>x.id===id)||PL[0];
/* World income distribution, 2024: share of people below each daily income (PIP), and the mean ($21.61 a day). */
const WCDF=[[0,0],[2,0.048],[3,0.104],[4.2,0.1893],[6,0.3292],[8.3,0.4616],[9,0.4919],[10,0.5287],[15,0.6503],[30,0.8064],[50,0.8889],[100,0.9668]];
const WMEAN=21.6119,WMED=9+(0.5-0.4919)/(0.5287-0.4919)*1;
/* Lorenz points: within each band, people are placed at the band's midpoint income; the top 3.3% hold the rest of the mean. */
const WLOR=(()=>{const p=[[0,0]];let inc=0;for(let i=1;i<WCDF.length;i++){inc+=(WCDF[i][1]-WCDF[i-1][1])*(WCDF[i][0]+WCDF[i-1][0])/2;p.push([WCDF[i][1],inc/WMEAN]);}p.push([1,1]);return p;})();
const lorQ=q=>{const T=q.reduce((s,x)=>s+x,0);let c=0;const p=[[0,0]];q.forEach((x,i)=>{c+=x;p.push([(i+1)/5,c/T]);});return p;};
const giniPts=p=>1-p.slice(1).reduce((s,pt,i)=>s+(pt[0]-p[i][0])*(pt[1]+p[i][1]),0);
/* Lakner and Milanovic (2013, World Bank WPS 6719), Table 3: real income growth 1988 to 2008 by global percentile group (2005 PPP). */
const ELE=[{x:5,l:'Bottom 10%',g:24.9},{x:45,l:'40th to 50th',g:70.6},{x:55,l:'50th to 60th',g:71.7},{x:65,l:'60th to 70th',g:57.9},{x:85,l:'80th to 90th',g:4.6},{x:92.5,l:'90th to 95th',g:16.6},{x:97,l:'95th to 99th',g:26.9},{x:99.5,l:'Top 1%',g:64.8}];
/* Share below $3.00 and $8.30, World 1990 to 2024 (PIP). */
const TS3=[.4341,.4312,.4251,.4206,.4073,.394,.3807,.3769,.3792,.3733,.362,.3525,.3374,.3215,.3026,.2833,.2699,.2529,.2414,.2306,.2098,.191,.1783,.155,.1451,.1342,.1257,.1179,.1112,.1076,.1141,.1133,.1089,.1062,.104];
const TS8=[.7037,.7073,.7115,.7171,.7184,.7124,.7132,.7088,.7081,.7133,.7057,.6999,.6928,.6867,.674,.6623,.6498,.6363,.6255,.6174,.6021,.588,.5752,.5583,.5465,.5345,.524,.5147,.5037,.4962,.5044,.4873,.4827,.4708,.4616];

/* Round shares to whole people out of 100 (largest remainder). */
function to100(xs){const t=xs.reduce((a,b)=>a+b,0),raw=xs.map(x=>x/t*100),fl=raw.map(Math.floor);let left=100-fl.reduce((a,b)=>a+b,0);
 raw.map((r,i)=>[r-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){fl[i]++;left--;}});return fl;}
const bandShares=y=>{const b=BELOW[y];return [b[3],b[4.2]-b[3],b[8.3]-b[4.2],b[30]-b[8.3],1-b[30]];};
const yr=sim=>sim.p.year==='1990'?1990:2024;
const truth=sim=>BELOW[yr(sim)][sim.p.line]*100;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
const revealed=sim=>!!(GS(sim)&&GS(sim).m);
/* "Your turn": per 100 = people below the line ÷ world population × 100, with the counts rounded to the million as a student would read them. */
const below=sim=>{const y=yr(sim);return sim.p.line==='3'?POOR3[y]:BELOW[y][sim.p.line]*POP[y];};
const mil=v=>Math.round(v).toLocaleString('en-US');
const per100=sim=>Math.round(1000*Math.round(below(sim))/Math.round(POP[yr(sim)]))/10;
const f1=v=>v.toFixed(1);
const big=m=>m>=1000?(m/1000).toFixed(2)+' billion':Math.round(m)+' million';
const usd=v=>'$'+Math.round(v).toLocaleString('en-US');
const dbl=g=>g>0?Math.log(2)/Math.log(1+g/100):null;
const close=sim=>{const A=P(sim.p.a),B=P(sim.p.b);const lo=A.ppp<=B.ppp?A:B,hi=lo===A?B:A,gl=lo===A?sim.p.ga:sim.p.gb,gh=lo===A?sim.p.gb:sim.p.ga;
 if(Math.abs(hi.ppp-lo.ppp)<1)return 0;if(gl<=gh)return null;return Math.log(hi.ppp/lo.ppp)/Math.log((1+gl/100)/(1+gh/100));};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const VIEWCTL={line:'people',guess:'people',show:'people',year:'people',colorby:'people',a:'born',b:'born',lc:'lorenz',ga:'growth',gb:'growth'};
function syncVis(sim){const u=sim.ui;if(!u||!u.ctlW)return;
 Object.keys(VIEWCTL).forEach(id=>{const w=u.ctlW[id];if(!w||w._home)return;const c=SIM.controls.find(x=>x.id===id);let v=VIEWCTL[id];
  const vis=atLeast(c.lvl)&&(sim.p.view===v||(id==='a'||id==='b')&&sim.p.view==='growth');if(w.hidden===vis)w.hidden=!vis;});}

/* ---------- drawing ---------- */
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
const W=800,H=500;
function person(ctx,x,y,s,col,alpha){ctx.globalAlpha=alpha==null?1:alpha;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*0.32,s*0.2,0,7);ctx.fill();rr(ctx,x-s*0.27,y-s*0.08,s*0.54,s*0.5,s*0.2);ctx.fill();ctx.globalAlpha=1;}
function drawPeople(sim,ctx,k){const sh=shown(sim),y=yr(sim),G=GS(sim),L=LINES[sim.p.line],ph=k>1.4;
 const cs=Math.min(40,(H-70)/10),gx=24,gy=Math.round(H-10-cs*10);
 txt(ctx,`The world in 100 people, ${y}`,gx,28,{s:15*k,w:700});
 txt(ctx,`1 person here ≈ ${Math.round(POP[y]/100)} million people`,gx,28+18*k,{s:12*k,c:PAL['cv-soft']});
 let cols=new Array(100).fill(null),legend=[];
 if(sh&&sim.p.colorby==='region'){const n=to100(REG.map(r=>r.pop));let i=0;REG.forEach((r,j)=>{for(let t=0;t<n[j];t++)cols[i++]=r.c;legend.push({c:r.c,l:ph?r.ph:(r.sl||r.l),n:n[j],p3:r.pop*r.p3/WPOP*100});});}
 else if(sh){const n=to100(bandShares(y));let i=0;BANDS.forEach((b,j)=>{for(let t=0;t<n[j];t++)cols[i++]=b.c;legend.push({c:b.c,l:b.l,n:n[j]});});}
 const gv=G&&G.g?G.g.guess:sim.p.guess;
 for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=gx+c*cs+cs/2,yy=gy+r*cs+cs/2;
  if(sh)person(ctx,x,yy,cs*.85,cols[i]);else person(ctx,x,yy,cs*.85,i<Math.round(gv)?PAL['s4']:PAL['cv-soft'],i<Math.round(gv)?1:.35);}
 if(sh&&sim.p.colorby!=='region'&&G&&G.g){const gi=Math.round(gv);if(gi>0&&gi<=100){const r=Math.floor((gi-1)/10),c=(gi-1)%10;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.strokeRect(gx+c*cs+1,gy+r*cs+1,cs-2,cs-2);}}
 /* right panel */
 const rx=gx+cs*10+28,rw=W-rx-16;
 if(!sh){txt(ctx,'Your guess',rx,gy+16*k,{s:14*k,w:700,c:PAL['s4']});
  txt(ctx,`${Math.round(gv)} of 100 people live`,rx,gy+40*k,{s:14*k,w:700});txt(ctx,`on less than ${L.l}`,rx,gy+60*k,{s:14*k,w:700});
  txt(ctx,ph?'Income at local prices':'Income per person, at local prices',rx,gy+88*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'(2021 PPP dollars)',rx,gy+104*k,{s:12*k,c:PAL['cv-soft']});
  txt(ctx,'Lock in your guess to color in',rx,gy+136*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'the real world.',rx,gy+152*k,{s:12*k,c:PAL['cv-soft']});return;}
 txt(ctx,sim.p.colorby==='region'?'Where the 100 live':'Daily income, 2021 PPP dollars',rx,gy+14*k,{s:14*k,w:700});
 const lh=Math.min(46,(H-gy-40*k)/(legend.length+1.3));
 legend.forEach((e,i)=>{const yy=gy+30*k+i*lh+lh/2;person(ctx,rx+10,yy+2,22,e.c);
  txt(ctx,`${e.n}  ${e.l}`,rx+30,yy-(e.p3!=null&&!ph?6:0),{s:13*k,w:700,b:'middle'});
  if(e.p3!=null&&!ph)txt(ctx,`${e.p3<0.05?'Under 0.1':f1(e.p3)} of the 100 live below $3.00`,rx+30,yy+12*k,{s:12*k,b:'middle',c:PAL['cv-soft']});});
 const by=gy+30*k+legend.length*lh+8;
 if(sim.p.colorby!=='region'&&by+14*k<H){const r=truth(sim);txt(ctx,`Below ${L.s}: ${f1(r)} of 100`+(G&&G.g?` (your gut: ${Math.round(G.g.guess)})`:''),rx,by+12*k,{s:13*k,w:700,c:PAL['rj']});
  if(revealed(sim)&&by+34*k<H-4)txt(ctx,`${mil(below(sim))}M ÷ ${mil(POP[y])}M × 100 = ${f1(per100(sim))}`,rx,by+34*k,{s:13*k,w:700,c:PAL['rj']});}}

function drawBorn(sim,ctx,k){const A=P(sim.p.a),B=P(sim.p.b),ph=k>1.4,cA='#b0702a',cB='#3f6fb0';
 txt(ctx,'Born in ',20,28,{s:15*k,w:700});ctx.font='700 '+(15*k)+'px '+FONT;let x=20+ctx.measureText('Born in ').width;
 txt(ctx,A.n,x,28,{s:15*k,w:700,c:cA});x+=ctx.measureText(A.n).width;txt(ctx,' or ',x,28,{s:15*k,w:700});x+=ctx.measureText(' or ').width;txt(ctx,B.n,x,28,{s:15*k,w:700,c:cB});
 const rows=[['Life expectancy at birth','le',90,v=>f1(v)+' years'],['Children who die before age 5','u5',120,v=>f1(v)+' per 1,000'],['Years of school, adults','mys',15,v=>f1(v)+' years'],['Homes with electricity','elec',100,v=>f1(v)+'%'],['Income per person (PPP)','ppp',110000,v=>usd(v)+' a year']];
 ctx.font='700 '+(12*k)+'px '+FONT;const vw=Math.max(...rows.map(r=>Math.max(ctx.measureText(r[3](A[r[1]])).width,ctx.measureText(r[3](B[r[1]])).width)));
 const top=44+8*k,rh=(H-top-6)/rows.length,lx=20,bx=ph?20:250,bw=W-bx-vw-24;
 rows.forEach(([l,key,mx,f],i)=>{const y=top+i*rh;txt(ctx,l,lx,y+(ph?14:rh/2-2)*k,{s:13*k,w:700,b:'middle'});
  const b0=ph?y+22*k:y+rh/2-16,bh=Math.min(14,(rh-(ph?22*k:0)-14)/2);
  if(key==='u5'&&!ph&&A.u5!==B.u5){const hi=A.u5>B.u5?A:B,lo=hi===A?B:A;txt(ctx,`${f1(hi.u5)} ÷ ${f1(lo.u5)} = ${(hi.u5/lo.u5).toFixed(1)} times`,lx,y+rh/2+16*k,{s:12*k,w:700,c:PAL['rj'],b:'middle'});}
  [[A,cA],[B,cB]].forEach(([c,col],j)=>{const yy=b0+j*(bh+6);ctx.fillStyle=PAL['line'];ctx.fillRect(bx,yy,bw,bh);ctx.fillStyle=col;ctx.fillRect(bx,yy,bw*clamp(c[key]/mx,0,1),bh);
   txt(ctx,f(c[key]),bx+bw+8,yy+bh/2,{s:12*k,w:700,b:'middle',c:PAL['cv-ink']});});});}

function drawLorenz(sim,ctx,k){const s=Math.min(360,H-96),LX=56,LY=H-40-s,X=p=>LX+p*s,Y=p=>LY+s-p*s,ph=k>1.4,c=sim.p.lc!=='none'?P(sim.p.lc):null;
 txt(ctx,'How the world’s income is shared',20,28,{s:15*k,w:700});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.strokeRect(LX,LY,s,s);ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(1),Y(1));ctx.stroke();
 const pl=(p,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;if(dash)ctx.setLineDash([7,5]);ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.stroke();ctx.setLineDash([]);};
 if(c&&c.q)pl(lorQ(c.q),PAL['s2'],true);pl(WLOR,PAL['rj']);
 txt(ctx,'Share of people, poorest first',X(.5),Y(0)+18*k,{s:12*k,a:'center',c:PAL['cv-soft']});
 ctx.save();ctx.translate(LX-14,Y(.5));ctx.rotate(-Math.PI/2);txt(ctx,'Share of income',0,0,{s:12*k,a:'center',c:PAL['cv-soft']});ctx.restore();
 txt(ctx,'World',X(.97),Y(.06),{s:13*k,w:700,a:'right',c:PAL['rj']});if(c&&c.q)txt(ctx,c.n,X(.06),Y(.9),{s:13*k,w:700,c:PAL['s2']});
 if(!ph)txt(ctx,'Equal shares',X(.4),Y(.4)-12,{s:12*k,c:PAL['cv-soft'],a:'right'});
 /* right: mean vs. median */
 const rx=LX+s+36,rw=W-rx-16;let y=LY+8;const lh=16*k;
 const wr=(t,o)=>{y=wrap(ctx,t,rx,y,rw,lh,o)+lh;};
 wr('A typical person vs. the average',{s:13*k,w:700});y+=4;
 const bar=(l,v,col)=>{wr(l,{s:12*k,w:700,c:col});y-=lh-6;ctx.fillStyle=col;ctx.fillRect(rx,y,rw*v/25,14);y+=14+lh+4;};
 bar(ph?`Median: $${WMED.toFixed(2)} a day`:`Median (middle person): $${WMED.toFixed(2)} a day`,WMED,PAL['s3']);bar(ph?`Mean: $${WMEAN.toFixed(2)} a day`:`Mean (average): $${WMEAN.toFixed(2)} a day`,WMEAN,PAL['s1']);
 if(!ph)wr('Half the world lives on less than the median.',{s:12*k,c:PAL['cv-soft']});y+=8;
 wr('Gini, 0 to 1',{s:13*k,w:700});
 wr('World: 0.62',{s:12*k,c:PAL['rj'],w:700});
 if(c&&c.q)wr(`${c.n}: ${(c.gini/100).toFixed(2)}`,{s:12*k,c:PAL['s2'],w:700});
 if(!ph){y+=6;wr('Higher means less equal. Gaps between countries make the world less equal than any one of them.',{s:12*k,c:PAL['cv-soft']});}}

function drawElephant(sim,ctx,k){const L0=70,R0=770,T0=70,B0=H-60,X=p=>L0+p/100*(R0-L0),Y=g=>B0-(g+10)/90*(B0-T0);
 txt(ctx,'Who gained, 1988 to 2008?',20,28,{s:15*k,w:700});txt(ctx,'Growth in real income by place in the world’s income ladder',20,28+18*k,{s:12*k,c:PAL['cv-soft']});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,20,40,60,80].forEach(g=>{ctx.beginPath();ctx.moveTo(L0,Y(g));ctx.lineTo(R0,Y(g));ctx.stroke();txt(ctx,g+'%',L0-8,Y(g),{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
 [0,25,50,75,100].forEach(p=>txt(ctx,p===0?'Poorest':p===100?'Richest':p+'th',X(p),B0+18*k,{s:12*k,a:'center',c:PAL['cv-soft']}));
 txt(ctx,'Percentile of world income (2005 PPP dollars)',(L0+R0)/2,B0+36*k,{s:12*k,a:'center',c:PAL['cv-soft']});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.beginPath();ELE.forEach((e,i)=>i?ctx.lineTo(X(e.x),Y(e.g)):ctx.moveTo(X(e.x),Y(e.g)));ctx.stroke();ctx.setLineDash([]);
 ELE.forEach(e=>{ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(e.x),Y(e.g),6,0,7);ctx.fill();});
 const lab=(e,t,dx,dy,a)=>txt(ctx,t,X(e.x)+dx,Y(e.g)+dy,{s:12*k,w:700,a,c:PAL['cv-ink']});
 lab(ELE[2],'A: middle of the world, +71.7%',0,-14,'center');lab(ELE[4],'B: 80th to 90th, +4.6%',0,22*k,'center');lab(ELE[7],'C: top 1%, +64.8%',-10,-14,'right');
 lab(ELE[0],'Bottom 10%, +24.9%',-4,18*k,'left');}

function drawGrowth(sim,ctx,k){const A=P(sim.p.a),B=P(sim.p.b),cA='#b0702a',cB='#3f6fb0',L0=80,R0=W-30,T0=60,B0=H-56,yrs=100,lo=Math.log(1000),hi=Math.log(2e6);
 const X=t=>L0+t/yrs*(R0-L0),Y=v=>B0-(Math.log(clamp(v,1000,2e6))-lo)/(hi-lo)*(B0-T0);
 txt(ctx,'Closing the gap',20,28,{s:15*k,w:700});txt(ctx,'Income per person (PPP), log scale: each step up is 10 times more',20,28+18*k,{s:12*k,c:PAL['cv-soft']});
 [1e3,1e4,1e5,1e6].forEach(v=>{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L0,Y(v));ctx.lineTo(R0,Y(v));ctx.stroke();txt(ctx,v>=1e6?'$1M':'$'+(v/1000)+'k',L0-8,Y(v),{s:12*k,a:'right',b:'middle',c:PAL['cv-soft']});});
 [0,25,50,75,100].forEach(t=>txt(ctx,t+' yr',X(t),B0+18*k,{s:12*k,a:'center',c:PAL['cv-soft']}));
 const path=(c,g,col)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(let t=0;t<=yrs;t+=1){const v=c.ppp*Math.pow(1+g/100,t);t?ctx.lineTo(X(t),Y(v)):ctx.moveTo(X(t),Y(v));}ctx.stroke();};
 path(A,sim.p.ga,cA);path(B,sim.p.gb,cB);
 const hl=(t,x,y,col)=>{ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(t).width;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x-3,y-12*k,w+6,15*k);ctx.globalAlpha=1;txt(ctx,t,x,y,{s:12*k,w:700,c:col});};
 hl(`${A.n}, ${f1(sim.p.ga)}% a year`,X(1),Y(A.ppp)+(A.ppp<B.ppp?22:-14)*k,cA);
 hl(`${B.n}, ${f1(sim.p.gb)}% a year`,X(1),Y(B.ppp)+(A.ppp<B.ppp?-14:22)*k,cB);
 const tc=close(sim);if(tc!=null&&tc>0&&tc<=yrs){const lo2=A.ppp<B.ppp?A:B,g=lo2===A?sim.p.ga:sim.p.gb,v=lo2.ppp*Math.pow(1+g/100,tc);ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X(tc),Y(v),6,0,7);ctx.fill();
  txt(ctx,`Gap closes in ${f1(tc)} years`,clamp(X(tc),L0+90*k,R0-90*k),Y(v)+24*k,{s:13*k,w:700,a:'center'});}
 else if(tc==null)txt(ctx,'At these rates the gap never closes',(L0+R0)/2,B0-16,{s:13*k,w:700,a:'center',c:PAL['s1']});}

function draw(sim,ctx,vdt,k){sim._k=k;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);syncVis(sim);const v=sim.p.view;
 if(v==='born')drawBorn(sim,ctx,k);else if(v==='lorenz')drawLorenz(sim,ctx,k);else if(v==='elephant')drawElephant(sim,ctx,k);else if(v==='growth')drawGrowth(sim,ctx,k);else drawPeople(sim,ctx,k);}

/* Context that used to sit under the picture; it now lives in About, and its question is the last tour step. */
const CONTEXT=`<p><b>One human family.</b> Catholic social teaching holds that the goods of the earth are meant for everyone: the <b>universal destination of goods</b>. Pope Paul VI, quoting the Second Vatican Council, wrote that God intended the earth and everything in it “for the use of all human beings and peoples” (<i>Populorum Progressio</i>, 1967, no. 22).</p>
<p>Pope John Paul II called <b>solidarity</b> “a firm and persevering determination to commit oneself to the common good” (<i>Sollicitudo Rei Socialis</i>, 1987, no. 38). It is not a vague feeling of pity for people far away.</p>
<p><b>Progress and what remains.</b> In 1990, 43 of every 100 people lived on less than $3.00 a day; in 2024, about 10 did. Child deaths before age 5 fell from 93.5 to 37.4 per 1,000 births. Yet about 847 million people still live below $3.00 a day, and a child born in Nigeria is about 46 times as likely to die before age 5 as one born in Norway.</p>
<p><b>Discuss:</b> what does solidarity ask of a student in Colorado? People of good will answer this differently: through charity, trade, aid, migration policy, business or prayer. There is no answer key.</p>`;

const SIM={
 id:'northsouth',hash:'northsouth',apUnit:5,order:3,tab:'The world in 100 people',kind:'Simulation',
 skills:{bio:'Rates per 100 (part ÷ whole × 100) and ratios · Algebra 1 (Unit 2)',honors:'Mean vs. median, the Lorenz curve and the Gini index · Statistics (Chapter 1), AP Microeconomics (Unit 6)',ap:'Exponential growth and the rule of 70 · Algebra 2 (Unit 5), AP Precalculus (Unit 2A)'},
 card:'Shrink the world to 100 people, guess how many live on less than $3 a day, and compare what a child can expect depending on where she is born.',
 title:'The world in 100 people',
 lede:{bio:'More than 8 billion people share one planet. Shrink them to 100, and you can see how many live on less than $3 a day, where they live, and how much a birthplace shapes a child’s life.',
  honors:'Averages hide a lot. The world’s mean income is $21.61 a day, but the median person lives on about $9.22. A Lorenz curve and the Gini coefficient show how unequal the whole world is.',
  ap:'Growth compounds. At g% a year, income doubles in about 70 ÷ g years. The “elephant curve” shows who gained from 1988 to 2008. A gap between two countries closes only if the poorer one grows faster, and it takes ln(ratio) ÷ ln((1 + g₁)/(1 + g₂)) years.'},
 scale:'The whole world, 2024: about 8.14 billion people. One figure in the grid stands for about 81 million people. Incomes are per person per day, in 2021 PPP dollars (what money buys at local prices).',
 aspect:1.6,timeless:true,trials:true,graph:true,
 controlsTitle:'The world',
 controls:[
  {id:'view',label:'What to look at',type:'seg',def:'people',noGut:true,onChange:syncVis,options:[{v:'people',l:'100 people'},{v:'born',l:'Born here, born there'},{v:'lorenz',l:'How income is shared',lvl:'honors'},{v:'elephant',l:'Who gained?',lvl:'ap'},{v:'growth',l:'Closing the gap',lvl:'ap'}]},
  {id:'line',label:'The income line',type:'seg',def:'3',noGut:true,onChange:clearGut,options:[{v:'3',l:'$3.00 a day'},{v:'8.3',l:'$8.30 a day'},{v:'30',l:'$30 a day',lvl:'honors'}],help:'$3.00 a day is the World Bank’s extreme poverty line. $8.30 is its line for upper-middle-income countries. All in 2021 PPP dollars.'},
  {id:'guess',label:'Your guess: how many of the 100 live below the line?',type:'range',min:0,max:100,step:1,def:50,unit:' people',d:0},
  {id:'show',label:'Show the real world',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'colorby',label:'Color the 100 by',type:'seg',def:'income',noGut:true,options:[{v:'income',l:'Daily income'},{v:'region',l:'Region'}]},
  {id:'year',label:'Year',type:'seg',def:'2024',noGut:true,onChange:clearGut,options:[{v:'2024',l:'2024'},{v:'1990',l:'1990'}],help:'Region colors use 2024 data.'},
  {id:'a',label:'Born in',type:'select',def:'nga',noGut:true,options:PL.map(p=>({v:p.id,l:p.n}))},
  {id:'b',label:'Or born in',type:'select',def:'nor',noGut:true,options:PL.map(p=>({v:p.id,l:p.n}))},
  {id:'lc',label:'Compare one country’s Lorenz curve',type:'select',def:'usa',lvl:'honors',noGut:true,options:[{v:'none',l:'None'}].concat(PL.filter(p=>p.q).map(p=>({v:p.id,l:p.n})))},
  {id:'ga',label:'Growth per person, first country (% a year)',type:'range',min:0,max:10,step:0.1,def:5,unit:'%',d:1,lvl:'ap',noGut:true},
  {id:'gb',label:'Growth per person, second country (% a year)',type:'range',min:0,max:5,step:0.1,def:1.5,unit:'%',d:1,lvl:'ap',noGut:true}
 ],
 actions:[{id:'then',label:'Compare with 1990',run(sim){BioLab.setValues(sim,{view:'people',year:sim.p.year==='1990'?'2024':'1990',show:true,colorby:'income'});}}],
 init(){return {};},step(){},
 onLevel:syncVis,
 metrics:[
  {id:'real',label:'Real number below the line, per 100 people',unit:'people',d:1,min:0,max:100,get:sim=>shown(sim)?truth(sim):null},
  {id:'people',label:'That many people in the world',unit:'millions',d:0,min:0,max:null,get:sim=>shown(sim)?truth(sim)/100*POP[yr(sim)]:null},
  {id:'ssa',label:'Of people below $3.00 in 2024, share in Sub-Saharan Africa',unit:'%',d:1,min:0,max:100,get:()=>REG[2].pop*REG[2].p3/POOR3[2024]*100},
  {id:'legap',label:'Life expectancy gap between the two birthplaces',unit:'years',d:1,min:0,max:null,get:sim=>Math.abs(P(sim.p.a).le-P(sim.p.b).le)},
  {id:'u5ratio',label:'How many times as likely to die before age 5',unit:'times',d:1,min:0,max:null,get:sim=>{const x=P(sim.p.a).u5,y=P(sim.p.b).u5;return Math.max(x,y)/Math.min(x,y);}},
  {id:'u5a',label:'Under-5 deaths per 1,000, first birthplace (1990 → 2024)',unit:'',text:true,get:sim=>{const p=P(sim.p.a);return `${p.n}: ${f1(p.u590)} → ${f1(p.u5)}`;}},
  {id:'wmean',label:'World mean income',unit:'$ a day',d:2,lvl:'honors',min:0,max:null,get:()=>WMEAN},
  {id:'wmed',label:'World median income',unit:'$ a day',d:2,lvl:'honors',min:0,max:null,get:()=>WMED},
  {id:'cgini',label:'Gini of the country you compare',unit:'0 to 1',d:2,lvl:'honors',min:0,max:1,get:sim=>{const c=P(sim.p.lc);return sim.p.lc!=='none'&&c.gini?c.gini/100:null;}},
  {id:'dbla',label:'Years for the first country’s income to double',unit:'years',d:1,lvl:'ap',min:0,max:null,get:sim=>dbl(sim.p.ga)},
  {id:'r70',label:'Rule of 70 estimate',unit:'years',d:1,lvl:'ap',min:0,max:null,get:sim=>sim.p.ga>0?70/sim.p.ga:null},
  {id:'close',label:'Years for the gap to close',unit:'years',d:1,lvl:'ap',min:0,max:null,get:close}
 ],
 graphs:[{id:'trend',label:'Share of the world below $3.00 and $8.30 a day, 1990 to 2024',custom:true}],defaultGraph:'trend',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:1990,xmax:2024,ymin:0,ymax:80,xl:'Year',yl:'People out of 100'});
  [[TS8,PAL['s2'],'Below $8.30'],[TS3,PAL['s1'],'Below $3.00']].forEach(([ts,col,l])=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ts.forEach((v,i)=>i?ctx.lineTo(ax.X(1990+i),ax.Y(v*100)):ctx.moveTo(ax.X(1990+i),ax.Y(v*100)));ctx.stroke();
   txt(ctx,l,ax.X(2024)-4,ax.Y(ts[ts.length-1]*100)-10,{s:12,w:700,a:'right',c:col});});
  txt(ctx,'2020: the pandemic pushed the share back up for the first time in decades.',box.L+8,box.T+12,{s:12,c:PAL['muted']});},
 draw,
 narrate(sim){const v=sim.p.view;
  if(v==='born'){const A=P(sim.p.a),B=P(sim.p.b);if(A.id===B.id)return 'Pick two different birthplaces to compare.';const hi=A.u5>B.u5?A:B,lo=hi===A?B:A;
   return `A child born in ${hi.n} is <b>${(hi.u5/lo.u5).toFixed(1)} times as likely to die before age 5</b> as one born in ${lo.n} (${f1(hi.u5)} vs. ${f1(lo.u5)} per 1,000), and can expect ${f1(Math.abs(A.le-B.le))} ${hi.le<lo.le?'fewer':'more'} years of life. The ratio, not the difference, shows the size of the gap.`;}
  if(v==='lorenz')return `The middle person in the world lives on about <b>$${WMED.toFixed(2)} a day</b>, less than half the $${WMEAN.toFixed(2)} average. A few high incomes pull the mean up, so the median says more about a typical life.`;
  if(v==='elephant')return 'From 1988 to 2008, people near the middle of the world’s income ladder (many in China and India) gained about 72%. The global top 1% gained about 65%. <b>People around the 80th to 90th percentile, mostly in rich countries, gained only about 5%.</b>';
  if(v==='growth'){const t=close(sim),A=P(sim.p.a),B=P(sim.p.b);const d=dbl(sim.p.ga);
   return `At ${f1(sim.p.ga)}% a year, ${A.n}’s income doubles every ${d?f1(d):'(never)'} years. ${t==null?'<b>The poorer country is not growing faster, so the gap never closes.</b>':t===0?'The two start at the same income.':`<b>The gap closes in about ${f1(t)} years</b>, if both rates held that long.`}`;}
  const y=yr(sim),L=LINES[sim.p.line];if(BioLab.calcPending&&BioLab.calcPending(sim))return `Your turn: <b>per 100 = people below the line ÷ all people × 100</b>.`;
  if(!shown(sim))return `Each figure stands for about ${Math.round(POP[y]/100)} million people. <b>How many of the 100 live on less than ${L.l}?</b> Drag your guess, then lock it in.`;
  if(sim.p.colorby==='region')return 'East Asia and South Asia hold half the world’s people. <b>About 7 of every 10 people below $3.00 a day live in Sub-Saharan Africa</b>, where about 45% of people live below that line.';
  const r=truth(sim);return `In ${y}, <b>${f1(r)} of every 100 people</b> lived on less than ${L.l}: about ${big(r/100*POP[y])} people. ${y===2024&&sim.p.line==='3'?'In 1990 it was 43.4 of 100.':y===1990&&sim.p.line==='3'?'By 2024 it fell to 10.4 of 100.':''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Out of 100 people in the world, how many live on less than the daily income shown in the picture ($3.00 a day to start)? Drag <b>Your guess</b> until that many figures are colored in, then lock it in.',
   honors:'Before you look: how many of the 100 live below the income line? Set <b>Your guess</b>, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-truth(sim)),guess:g,line:sim.p.line,y:yr(sim),label:`${Math.round(g)} of 100 below ${LINES[sim.p.line].l}`};},
  solve(sim){const t=truth(sim);sim.p.guess=t;sim.p.show=true;sim.p.view='people';sim.p.colorby='income';return {v:0,guess:t,line:sim.p.line,y:yr(sim),label:`${f1(t)} of 100 below ${LINES[sim.p.line].l} (${big(t/100*POP[yr(sim)])} people)`};},
  hint:{bio:'Lock in your guess. Then you will work out the real number yourself from two counts.'},
  calc:{unit:'people',d:1,tol:0.15,after:'lock',
   prompt:{bio:sim=>{const y=yr(sim);return `In ${y}, <b>${mil(below(sim))} million</b> of the world’s <b>${mil(POP[y])} million</b> people lived on less than ${LINES[sim.p.line].l}. If the world were 100 people, how many would that be? Use part ÷ whole × 100, to one decimal place.`;},
    ap:sim=>{const y=yr(sim);return `The headcount below ${LINES[sim.p.line].l} in ${y} was ${mil(below(sim))} million, out of ${mil(POP[y])} million people. Find the headcount ratio per 100 people, to one decimal place.`;}},
   answer:per100,
   hint:'Divide the people below the line by all the people. Then multiply by 100.',
   steps(sim){const y=yr(sim),a=Math.round(below(sim)),b=Math.round(POP[y]);return [`Part ÷ whole = ${mil(a)} ÷ ${mil(b)} = ${(a/b).toFixed(4)}.`,`× 100 = <b>${f1(per100(sim))} people out of 100</b>.`,`Each of the 100 stands for about ${Math.round(b/100)} million people.`];}},
  formula(sim){const y=yr(sim);return `Per 100 = ${mil(below(sim))} million ÷ ${mil(POP[y])} million × 100 = ${f1(per100(sim))} of 100`;},
  how:{bio:'The math scales the world down: the World Bank’s count of people below the line ÷ the world’s population × 100. For $3.00 in 2024: 847 million ÷ 8,142 million × 100 ≈ 10.4 people out of 100.',
   ap:'Per 100 = headcount ratio × 100. The headcount ratio comes from household surveys, converted to 2021 PPP dollars so that $3.00 buys about the same everywhere.'},
  compare(sim,g,m){const y=m.y,off=Math.abs(g.guess-m.guess),L=LINES[m.line],ppl=off/100*POP[y];
   const prog=m.line==='3'?(y===2024?' Progress is real: in 1990, 43.4 of 100 lived below this line (2.30 billion people). About 7 of every 10 people still below it live in Sub-Saharan Africa.':' By 2024 it was 10.4 of 100.'):m.line==='8.3'?(y===2024?' In 1990 it was 70.4 of 100.':''):'';
   if(off<1.5)return `Your gut was right on: ${Math.round(g.guess)} against the real ${f1(m.guess)} of 100 below ${L.l}, about ${big(m.guess/100*POP[y])} people.${prog}`;
   return `You guessed ${Math.round(g.guess)} of 100; the real number is <b>${f1(m.guess)} of 100</b>. You were off by <b>${f1(off)} people per 100</b>, which in the real world is about <b>${big(ppl)} people</b>.${prog}`;},
  again(sim){const ls=['3','8.3'].concat(atLeast('honors')?['30']:[]);sim.p.line=ls[Math.floor(Math.random()*ls.length)];sim.p.year=Math.random()<0.25?'1990':'2024';sim.p.guess=50;sim.p.show=false;sim.p.view='people';sim.p.colorby='income';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different count: in 2024, 1,290 million of the world’s 8,142 million people lived in Sub-Saharan Africa. If the world were 100 people, how many would live there? Answer to one decimal place.',answer:15.8,tol:0.15,unit:'people',d:1,hint:'Part ÷ whole × 100.',explain:'1,290 ÷ 8,142 = 0.1584, and × 100 ≈ 15.8 of 100, so about 16 figures. East Asia & Pacific (29) and South Asia (21) hold half the world.'},
  {lvl:'bio',instant:true,q:'Under-5 deaths: Nigeria 115.6 per 1,000 births, Norway 2.5. How many times as likely is a child in Nigeria to die before age 5?',choices:['About 5 times','About 46 times','About 113 times'],correct:1,explain:'115.6 ÷ 2.5 ≈ 46. Comparing with a ratio, not a difference, shows the size of the gap. Nigeria’s rate has also fallen, from 207.6 in 1990.'},
  {lvl:'honors',instant:true,q:'The world’s mean income is $21.61 a day, but the median is about $9.22. What does that tell you?',choices:['Most people earn about $21.61','A smaller number of very high incomes pull the mean far above the typical person','The data must be wrong'],correct:1,explain:'Income is right-skewed: a long tail of high incomes raises the mean. Half the world lives on less than about $9.22 a day, so the median describes a typical life better.'},
  {lvl:'honors',instant:true,q:'The U.S. Gini is 0.42 and Ecuador’s is 0.46, yet the world’s is about 0.62. How can the world be less equal than any of these countries?',choices:['Because the world measures wealth, not income','Because it adds the gaps between countries to the gaps within them','It cannot; the numbers must be from different years'],correct:1,explain:'A world Gini compares a farmer in Niger with a lawyer in Norway. The gaps between countries’ average incomes are large, so the whole world is less equal than any single country here.'},
  {lvl:'ap',instant:true,q:'Using the rule of 70, how many years does it take an income growing 5% a year to double?',choices:['5 years','14 years','35 years','70 years'],correct:1,explain:'70 ÷ 5 = 14 years. The exact answer is ln 2 ÷ ln 1.05 ≈ 14.2 years. The rule works because ln 2 ≈ 0.693 and ln(1 + g) ≈ g for small g.'},
  {lvl:'ap',instant:true,q:'Nigeria’s income per person (PPP) is $9,100; Norway’s is $105,657. If Nigeria grows 5% a year and Norway 1.5%, about how long until the gap closes?',choices:['About 14 years','About 33 years','About 72 years','Never'],correct:2,explain:'Ratio = 105,657 ÷ 9,100 ≈ 11.6. Years = ln 11.6 ÷ ln(1.05 ÷ 1.015) ≈ 2.452 ÷ 0.0339 ≈ 72.3. Convergence is possible, but at these rates it takes most of a lifetime.'}
 ],
 tour:[
  {title:'The world as 100 people',text:'Each figure stands for about 81 million people, so these 100 are all 8.14 billion of us in 2024. Before you look, picture how many live on less than $3.00 a day.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'people',line:'3',year:'2024',show:false,colorby:'income'})},
  {title:'Daily income',text:'Colored by daily income (2021 PPP dollars): 10 of the 100 live on less than $3.00 a day, the World Bank’s extreme poverty line. 46 live on less than $8.30. 19 live on more than $30.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'people',show:true,colorby:'income'})},
  {title:'Real progress',text:'In 1990 the world had 5.3 billion people, and 43 of every 100 lived on less than $3.00 a day. By 2024 that fell to about 10, even as the population grew by 2.8 billion.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'people',show:true,year:'1990'})},
  {title:'Where the 100 live',text:'Colored by region: 29 live in East Asia & Pacific, 21 in South Asia, 16 in Sub-Saharan Africa and 5 in North America. About 7 of every 10 people below $3.00 a day live in Sub-Saharan Africa.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'people',show:true,year:'2024',colorby:'region'})},
  {title:'Born here, born there',text:'A child born in Nigeria can expect to live 54.5 years; in Norway, 83.3. Nigeria’s under-5 death rate is 115.6 per 1,000 births, about 46 times Norway’s 2.5: 115.6 ÷ 2.5 = 46.2.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'born',a:'nga',b:'nor'})},
  {lvl:'honors',title:'Average vs. typical',text:'The world’s mean income is $21.61 a day; the median is about $9.22. The world’s Lorenz curve bows much farther from equality than the U.S. curve.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'lorenz',lc:'usa'})},
  {lvl:'ap',title:'Growth compounds',text:'At 5% a year, income doubles in about 14 years (rule of 70). If Nigeria grew 5% a year and Norway 1.5%, the gap would close in about 72 years.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'growth',a:'nga',b:'nor',ga:5,gb:1.5})},
  {stnSet:{view:'people',show:true,year:'2024',colorby:'income'},stnFocus:'none',stn:{card:{x:430,y:385,w:360,title:'One human family',lines:['1990: 43 of 100 below $3.00 a day. 2024: about 10.','Populorum Progressio 22: creation’s goods are meant for all.','Sollicitudo Rei Socialis 38: solidarity.']}},title:'One human family',text:'Catholic social teaching speaks of the universal destination of goods (Paul VI, Populorum Progressio 22) and of solidarity (John Paul II, Sollicitudo Rei Socialis 38); About quotes both. Discuss: what does solidarity ask of a student in Colorado? People of good will answer this differently: through charity, trade, aid, migration policy, business or prayer. There is no answer key.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How has the world changed since 1990?</p><ol><li>Turn on <b>Show the real world</b>. Record a trial for each income line in 2024.</li><li>Switch the year to 1990 and record the same lines.</li><li>Open <b>Born here, born there</b> and compare three pairs of birthplaces. Record the life expectancy gap and the under-5 ratio.</li></ol><p>Write two sentences: one about real progress, and one about what remains.</p>',
  honors:'<p><b>Question:</b> Why do averages mislead?</p><ol><li>In <b>How income is shared</b>, compare the world’s Lorenz curve with three countries’ curves. Record each Gini.</li><li>Explain why the world’s Gini is higher than any one country’s.</li><li>Compute the gap between the world mean and median, and explain which one describes a typical person.</li></ol><p>Write a paragraph explaining to a friend why a world average can mislead, using the mean and median.</p>',
  ap:'<p><b>Question:</b> Can poorer countries catch up?</p><ol><li>In <b>Closing the gap</b>, set the growth rates and record the doubling time and the years to close the gap.</li><li>Check the rule of 70 against the exact formula ln 2 ÷ ln(1 + g) for 2%, 5% and 10%.</li><li>Find the smallest growth rate for the poorer country that closes the gap within 50 years.</li></ol><p><b>CER:</b> Make a claim about convergence, with evidence from your trials and reasoning from the compound growth formula.</p>'},
 terms:[
  {t:'International poverty line',d:'The World Bank’s line for extreme poverty: $3.00 per person per day in 2021 PPP dollars (updated June 2025).'},
  {t:'PPP (purchasing power parity)',d:'A way of converting money so that a dollar buys about the same basket of goods in every country.'},
  {t:'Under-5 mortality rate',d:'Deaths before age 5 per 1,000 live births.'},
  {t:'Global North and Global South',d:'Loose names for richer countries (mostly in the Northern Hemisphere) and lower-income countries (mostly in the South). They describe income, not exact geography: Australia is “North,” and much of Asia is “South.”'},
  {t:'Solidarity',d:'A term from Catholic social teaching. John Paul II described it as “a firm and persevering determination to commit oneself to the common good” (Sollicitudo Rei Socialis, 1987, no. 38).'},
  {t:'Mean and median',d:'The mean adds all incomes and divides by the number of people. The median is the income of the person in the middle.',lvl:'honors'},
  {t:'Lorenz curve and Gini coefficient',d:'The Lorenz curve plots the share of income held by the poorest x% of people. The Gini measures how far it bows from equality, from 0 (equal) to 1.',lvl:'honors'},
  {t:'Elephant curve',d:'A graph of income growth by global percentile from 1988 to 2008 whose shape looks like an elephant: high gains in the middle and at the top, little gain around the 80th to 90th percentile.',lvl:'ap'},
  {t:'Rule of 70',d:'Doubling time ≈ 70 ÷ growth rate in percent. It comes from ln 2 ≈ 0.693.',lvl:'ap'},
  {t:'Convergence',d:'Poorer countries growing faster than richer ones, so gaps shrink. Divergence is the opposite.',lvl:'ap'}
 ],
 about:`<p><b>This is a simplified model for learning, not financial advice.</b> All figures are stored in this page, not fetched live. Nothing here asks for your own family’s income.</p>
<p><b>Income lines and shares</b>: World Bank Poverty and Inequality Platform (PIP), accessed Nov 2026, World totals, 2021 PPP dollars per person per day (<a href="https://pip.worldbank.org" target="_blank" rel="noopener">pip.worldbank.org</a>; the June 2025 update set the extreme line at $3.00, the lower-middle line at $4.20 and the upper-middle line at $8.30: <a href="https://www.worldbank.org/en/news/factsheet/2025/06/05/june-2025-update-to-global-poverty-lines" target="_blank" rel="noopener">World Bank factsheet</a>). Share below $3.00: 10.40% in 2024 (846.8 million people), 43.41% in 1990 (2.30 billion). Below $4.20: 18.93% (2024), 55.61% (1990). Below $8.30: 46.16% (2024), 70.37% (1990). Below $30: 80.64% (2024), 87.40% (1990). The 2024 world mean is $21.61 a day; the median, about $9.22, is interpolated between the $9 (49.19%) and $10 (52.87%) lines. PIP revises these numbers as new surveys arrive; earlier releases gave slightly different values.</p>
<p><b>Regions</b>: World Bank WDI population, 2024 (SP.POP.TOTL), and PIP share below $3.00 by region, 2024 (Sub-Saharan Africa 45.09%, 582.1 million people, which is 68.7% of everyone below the line). People are rounded to whole figures out of 100 by largest remainder.</p>
<p><b>Birthplaces</b>: life expectancy and mean years of schooling, UNDP Human Development Report 2025, Table 1, data year 2023 (<a href="https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Statistical_Annex_HDI_Table.pdf" target="_blank" rel="noopener">hdr.undp.org</a>). Under-5 mortality, UN Inter-agency Group for Child Mortality Estimation (UN IGME) estimates via World Bank indicator SH.DYN.MORT, 2024 and 1990 (<a href="https://data.worldbank.org/indicator/SH.DYN.MORT" target="_blank" rel="noopener">data.worldbank.org</a>). Electricity access, World Bank EG.ELC.ACCS.ZS, 2024. GDP per person, PPP, World Bank NY.GDP.PCAP.PP.CD, 2024.</p>
<p><b>Lorenz curves</b>: the world curve is built here from PIP’s 2024 shares below 11 income lines, placing people at each band’s midpoint; it is approximate (its own Gini comes out near 0.59). The world Gini of about 0.62 (62 on a 0 to 100 scale, 2019, down from about 70 in 1990) is from the World Bank’s Atlas of Sustainable Development Goals (<a href="https://datatopics.worldbank.org/sdgatlas/goal-10-reduced-inequalities" target="_blank" rel="noopener">datatopics.worldbank.org</a>). Country curves use World Bank income or consumption shares by fifth (latest year 2022 to 2025); India, Nigeria and Bhutan measure consumption, which is usually more equal than income.</p>
<p><b>Elephant curve</b>: Christoph Lakner and Branko Milanovic, “Global Income Distribution: From the Fall of the Berlin Wall to the Great Recession,” World Bank Policy Research Working Paper 6719 (2013), Table 3, cumulative real growth 1988 to 2008 in 2005 PPP dollars (<a href="https://documents1.worldbank.org/curated/en/914431468162277879/pdf/WPS6719.pdf" target="_blank" rel="noopener">documents.worldbank.org</a>); published in the <i>World Bank Economic Review</i> 30(2), 2016. Only the percentile groups in that table are plotted; the 10th to 40th and 70th to 80th groups are not shown.</p>
<p><b>Growth</b>: years to double = ln 2 ÷ ln(1 + g); rule of 70 ≈ 70 ÷ g. Years to close a gap = ln(ratio) ÷ ln((1 + g₁) ÷ (1 + g₂)). Real growth rates change from year to year; constant rates are an assumption for illustration.</p>
<p><b>Quotations</b>: Paul VI, <i>Populorum Progressio</i> (1967), no. 22 (<a href="https://www.vatican.va/content/paul-vi/en/encyclicals/documents/hf_p-vi_enc_26031967_populorum.html" target="_blank" rel="noopener">vatican.va</a>); John Paul II, <i>Sollicitudo Rei Socialis</i> (1987), no. 38 (<a href="https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_30121987_sollicitudo-rei-socialis.html" target="_blank" rel="noopener">vatican.va</a>).</p>`+CONTEXT+'<p><b>What this number hides.</b> A count per 100 hides how far below the line people are, how many sit just above it, the differences inside each country and region, and anyone household surveys do not reach.</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
