(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* 270: the math of the Electoral College.
   Electors per state = House seats + 2 (D.C.: 3, 23rd Amendment). 538 in all; a majority is 270.
   Data: U.S. Census Bureau, 2020 Census apportionment, Table 1 (apportionment population and House seats, April 1, 2020)
   and Table 2 (D.C. resident population 689,545). Electors for the 2024 and 2028 elections: National Archives.
   Electors per million = electors / (population / 1,000,000). Weight ratio = higher per-million / lower per-million.
   Theoretical minimum: choose the set of places with the fewest people whose electors total >= 270 (exact 0/1 knapsack),
   win each by one vote, get no votes anywhere else, and assume votes cast match population: share = (sum of floor(pop/2) + 1) / total.
   District method (Maine, Nebraska): 2 electors to the statewide winner, 1 to each district winner. Equal-size districts assumed.
   Swing power (illustrative): Banzhaf index on toy maps: count the winning line-ups in which a state's electors are decisive. */
const RAW='Alabama|AL|5030053|7;Alaska|AK|736081|1;Arizona|AZ|7158923|9;Arkansas|AR|3013756|4;California|CA|39576757|52;Colorado|CO|5782171|8;Connecticut|CT|3608298|5;Delaware|DE|990837|1;District of Columbia|DC|689545|0;Florida|FL|21570527|28;Georgia|GA|10725274|14;Hawaii|HI|1460137|2;Idaho|ID|1841377|2;Illinois|IL|12822739|17;Indiana|IN|6790280|9;Iowa|IA|3192406|4;Kansas|KS|2940865|4;Kentucky|KY|4509342|6;Louisiana|LA|4661468|6;Maine|ME|1363582|2;Maryland|MD|6185278|8;Massachusetts|MA|7033469|9;Michigan|MI|10084442|13;Minnesota|MN|5709752|8;Mississippi|MS|2963914|4;Missouri|MO|6160281|8;Montana|MT|1085407|2;Nebraska|NE|1963333|3;Nevada|NV|3108462|4;New Hampshire|NH|1379089|2;New Jersey|NJ|9294493|12;New Mexico|NM|2120220|3;New York|NY|20215751|26;North Carolina|NC|10453948|14;North Dakota|ND|779702|1;Ohio|OH|11808848|15;Oklahoma|OK|3963516|5;Oregon|OR|4241500|6;Pennsylvania|PA|13011844|17;Rhode Island|RI|1098163|2;South Carolina|SC|5124712|7;South Dakota|SD|887770|1;Tennessee|TN|6916897|9;Texas|TX|29183290|38;Utah|UT|3275252|4;Vermont|VT|643503|1;Virginia|VA|8654542|11;Washington|WA|7715946|10;West Virginia|WV|1795045|2;Wisconsin|WI|5897473|8;Wyoming|WY|577719|1';
const ST=RAW.split(';').map(l=>{const [n,a,p,h]=l.split('|');return {n,a,p:+p,h:+h,e:a==='DC'?3:+h+2};});
const BY={};ST.forEach(s=>BY[s.a]=s);
const TOT=ST.reduce((t,s)=>t+s.p,0),TOT50=ST.filter(s=>s.a!=='DC').reduce((t,s)=>t+s.p,0);
const n0=v=>Math.round(v).toLocaleString('en-US');
const f1=v=>v.toFixed(1),f2=v=>v.toFixed(2),f3=v=>v.toFixed(3);
const mil=p=>p/1e6;
const perM=s=>s.e/mil(s.p);
const seatTxt=h=>h===1?'1 House seat':h+' House seats';
/* exact minimum: fewest people whose electors reach the target */
function minSet(list,ev,need){const M=list.reduce((t,s)=>t+ev(s),0),INF=1e18,dp=new Array(M+1).fill(INF),ch=new Array(M+1).fill(null);dp[0]=0;ch[0]=[];
 list.forEach((s,i)=>{const e=ev(s);if(!e)return;for(let v=M;v>=e;v--){if(dp[v-e]+s.p<dp[v]){dp[v]=dp[v-e]+s.p;ch[v]=ch[v-e].concat(i);}}});
 let best=INF,bv=need;for(let v=need;v<=M;v++)if(dp[v]<best){best=dp[v];bv=v;}
 const won=ch[bv].map(i=>list[i]),lost=list.filter(s=>!won.includes(s)&&ev(s)>0),votes=won.reduce((t,s)=>t+Math.floor(s.p/2)+1,0),tot=list.reduce((t,s)=>t+s.p,0);
 const topN=list.slice().sort((x,y)=>y.p-x.p).slice(0,lost.length),biggest=lost.every(s=>topN.includes(s));
 return {won,lost,pop:best,ev:bv,need,all:M,votes,tot,share:100*votes/tot,evOf:ev,biggest};}
const MIN={full:minSet(ST,s=>s.e,270),house:minSet(ST.filter(s=>s.a!=='DC'),s=>s.h,218)};
const minR=sim=>(atLeast('ap')&&sim.p.house)?MIN.house:MIN.full;
/* history: share of the popular vote received by the Electoral College winner (1824: the person the House chose) */
const HIST=[{y:1824,v:30.9,note:'House chose'},{y:1876,v:48.0},{y:1888,v:47.8},{y:2000,v:47.9},{y:2016,v:46.1}];
/* district method */
const MS={ME:{n:'Maine',d:2,e:4},NE:{n:'Nebraska',d:3,e:5}};
const msOf=sim=>MS[sim.p.ms]||MS.NE;
const dShares=sim=>[sim.p.d1,sim.p.d2,sim.p.d3].slice(0,msOf(sim).d);
const winOf=v=>v>50?'A':v<50?'B':'T';
const stateShare=sim=>{const d=dShares(sim);return d.reduce((t,v)=>t+v,0)/d.length;};
function split(sim){const sw=winOf(stateShare(sim)),dw=dShares(sim).map(winOf),m=msOf(sim);
 const wta={A:sw==='A'?m.e:0,B:sw==='B'?m.e:0,T:sw==='T'?m.e:0};
 const dist={A:(sw==='A'?2:0)+dw.filter(w=>w==='A').length,B:(sw==='B'?2:0)+dw.filter(w=>w==='B').length,T:(sw==='T'?2:0)+dw.filter(w=>w==='T').length};
 return {sw,dw,wta,dist};}
/* Banzhaf on toy maps (illustrative) */
const TOY={three:{w:[50,49,1],q:51,l:'Three states: 50, 49, 1'},dummy:{w:[10,10,10,1],q:16,l:'Four states: 10, 10, 10, 1'},five:{w:[9,7,5,3,3],q:14,l:'Five states: 9, 7, 5, 3, 3'}};
function bz(t){const w=t.w,n=w.length,c=new Array(n).fill(0);for(let m=0;m<(1<<n);m++){let s=0;for(let i=0;i<n;i++)if(m>>i&1)s+=w[i];if(s<t.q)continue;for(let i=0;i<n;i++)if((m>>i&1)&&s-w[i]<t.q)c[i]++;}
 const T=c.reduce((a,b)=>a+b,0),tot=w.reduce((a,b)=>a+b,0);return {c,T,tot,n,ways:Math.pow(2,n-1)};}
const toyOf=sim=>TOY[sim.p.toy]||TOY.three;
const pickOf=sim=>Math.min(sim.p.pick,toyOf(sim).w.length-1);
const LET='ABCDE';
/* the two states: the one with more electors per person is always shown on the left */
function pair(sim){const a=BY[sim.p.sa]||BY.WY,b=BY[sim.p.sb]||BY.CA;return perM(a)>=perM(b)?[a,b]:[b,a];}
const ratio=sim=>{const [h,l]=pair(sim);return perM(h)/perM(l);};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on&&sim.st.peek)||(GS(sim)&&GS(sim).g&&!pend(sim)));
function clearGut(sim){if(sim.tour&&sim.tour.on)return;if(BioLab.gutClear)BioLab.gutClear(sim);}
const APP='<a href="#apportion">Apportionment</a>';
const COL={A:'#2a7f7a',B:'#6b4fa0',T:'#7a7a7a'};
/* fit text to a width by shrinking the font, never below 12k */
function fit(ctx,s,x,y,maxW,o,k){let sz=o.s;ctx.font=(o.w||400)+' '+sz+'px '+FONT;while(sz>12*k&&ctx.measureText(s).width>maxW){sz-=1;ctx.font=(o.w||400)+' '+sz+'px '+FONT;}txt(ctx,s,x,y,Object.assign({},o,{s:sz}));}

/* ---------- drawing ---------- */
function drawPer(sim,ctx,k){const big=k>1.3,sh=shown(sim),[H,L]=pair(sim),G=GS(sim);
 /* positions: phone (big) scales with k; desktop uses a fixed, roomier layout */
 const P=big?{y0:40*k,tile:34*k,nm:16*k,l1:14*k,l2:13*k,dv:15*k,gap1:20*k,gap2:18*k,gap3:26*k,bar:12*k,pb:40*k+34*k+64*k+12*k+12*k+8*k,ry:40*k+34*k+64*k+12*k+12*k+8*k+30*k,rs:16*k}
  :{y0:56,tile:48,nm:20,l1:16,l2:14,dv:21,gap1:30,gap2:24,gap3:38,bar:16,pb:300,ry:346,rs:24};
 txt(ctx,big?'Electors per million people':'Electors per million people: one state against another',24,26*k,{s:15*k,w:700});
 if(!big)txt(ctx,'2020 Census counts · electors for 2024 and 2028',776,26*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const maxPer=5.5;
 [H,L].forEach((s,i)=>{const x0=i?420:24,w=356,y0=P.y0,tile=P.tile,pm=perM(s);
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x0-8,y0-10,w+8,P.pb-y0+10,12);ctx.fill();
  rr(ctx,x0,y0,tile,tile,8);ctx.fillStyle='#55657a';ctx.fill();txt(ctx,s.a,x0+tile/2,y0+tile/2+1,{s:(big?15*k:17),w:700,c:'#fff',a:'center',b:'middle'});
  fit(ctx,s.n,x0+tile+10,y0+tile*0.64,w-tile-14,{s:P.nm,w:700},k);
  let y=y0+tile+P.gap1;
  fit(ctx,s.a==='DC'?(big?'3 electors (23rd Amendment)':'No House seats; 3 electors (23rd Amendment)'):(big?`${s.h} + 2 = ${s.e} electors`:`${seatTxt(s.h)} + 2 Senators = ${s.e} electors`),x0,y,w-6,{s:P.l1},k);y+=P.gap2;
  fit(ctx,big?`${f3(mil(s.p))} million people`:`${n0(s.p)} people (${f3(mil(s.p))} million)`,x0,y,w-6,{s:P.l2,c:PAL['cv-soft']},k);y+=P.gap3;
  fit(ctx,`${s.e} ÷ ${f3(mil(s.p))} = ${sh?f3(pm):'?'}${big?' per million':''}`,x0,y,w-6,{s:P.dv,w:700,c:sh?PAL['rj']:PAL['muted']},k);
  if(!big){y+=22;txt(ctx,'electors per million people',x0,y,{s:13,c:PAL['cv-soft']});}
  const by=big?y+12*k:y+14,bw=w-10;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x0,by,bw,P.bar,4);ctx.stroke();
  if(sh){ctx.fillStyle=PAL['rj'];rr(ctx,x0,by,Math.max(4,bw*Math.min(pm,maxPer)/maxPer),P.bar,4);ctx.fill();}
  if(!big&&sh)txt(ctx,`1 elector for every ${n0(s.p/s.e)} people`,x0,by+P.bar+22,{s:13,c:PAL['cv-ink']});
 });
 const y=P.ry,r=ratio(sim);
 if(sh){txt(ctx,`${f3(perM(H))} ÷ ${f3(perM(L))} = ${f2(r)}`,24,y,{s:P.rs,w:700,c:PAL['rj']});
  fit(ctx,big?`1 person in ${H.a} = ${f2(r)} in ${L.a}`:`One person in ${H.n} carries the electoral weight of ${f2(r)} people in ${L.n}.`,24,y+(big?24*k:30),752,{s:big?13*k:15},k);
  const CO=BY.CO;if(!big&&H!==CO&&L!==CO)txt(ctx,`Colorado, for comparison: 10 ÷ ${f3(mil(CO.p))} = ${f3(perM(CO))} electors per million`,24,y+58,{s:13,c:PAL['cv-soft']});}
 else txt(ctx,big?'Weight of one person: ?':'One person on the left carries the weight of ? people on the right.',24,y,{s:big?14*k:16,c:PAL['cv-soft']});
 if(G&&G.g)pill(ctx,'Your gut: '+f1(G.g.guess),776-70*Math.min(k,1.4),y-(big?6*k:8),PAL['s4'],'#fff',(big?14*Math.min(k,1.4):16));}
function drawMin(sim,ctx,k){const big=k>1.3,sh=shown(sim),R=minR(sim),ev=R.evOf,W=752,X0=24,ho=R===MIN.house;
 txt(ctx,big?'Smallest share that wins (theory)':'The smallest share of the vote that could win: a theoretical case',X0,26*k,{s:15*k,w:700});
 const unit=ho?'House seats':'electors';
 txt(ctx,big?`All ${R.all} ${unit}, one block per place`:`All ${R.all} ${unit}, one block per ${ho?'state':'state or D.C.'}, the places won first`,X0,52*k,{s:12*k,c:PAL['cv-soft']});
 const order=R.won.slice().sort((a,b)=>a.p/ev(a)-b.p/ev(b)).concat(R.lost.slice().sort((a,b)=>a.p/ev(a)-b.p/ev(b)));
 const G2=big?k:1.35,sy=62*k,sh2=26*k*(big?1:1.2);let x=X0;
 order.forEach(s=>{const wv=ev(s)/R.all*W,won=R.won.includes(s);ctx.fillStyle=sh?(won?PAL['rj']:PAL['line']):PAL['line'];ctx.fillRect(x,sy,Math.max(1,wv-1),sh2);x+=wv;});
 const xm=X0+R.need/R.all*W;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(xm,sy-6);ctx.lineTo(xm,sy+sh2+6);ctx.stroke();ctx.setLineDash([]);
 txt(ctx,R.need+' to win',xm,sy+sh2+20*k,{s:12*k,w:700,a:'center'});
 if(sh){txt(ctx,big?`Win ${R.won.length}: ${R.ev}`:`Won by one vote each: ${R.won.length} places, ${R.ev} ${unit}`,X0,sy+sh2+40*G2,{s:13*k,w:700,c:PAL['rj']});
  txt(ctx,big?`Lose ${R.lost.length}: ${R.all-R.ev}`:`Lost: ${R.biggest?'the '+R.lost.length+' biggest states':R.lost.length+' states'}, ${R.all-R.ev} ${unit}`,X0+W,sy+sh2+40*G2,{s:13*k,c:PAL['cv-soft'],a:'right'});}
 else txt(ctx,big?'Which places, and how many votes?':'Which places would you need, and how many votes would it take?',X0,sy+sh2+40*G2,{s:13*k,c:PAL['cv-soft']});
 /* people bar */
 const py=sy+sh2+(big?72*k:100),ph=big?26*k:34;txt(ctx,big?`All ${f1(mil(R.tot))} million people`:`All ${f1(mil(R.tot))} million people, as if everyone voted`,X0,py-6*k,{s:12*k,c:PAL['cv-soft']});
 const wonP=R.pop,v=R.votes,w1=v/R.tot*W,w2=(wonP-v)/R.tot*W;
 ctx.fillStyle=PAL['line'];ctx.fillRect(X0,py,W,ph);
 if(sh){ctx.fillStyle=PAL['rj'];ctx.fillRect(X0,py,w1,ph);ctx.fillStyle=PAL['s2'];ctx.globalAlpha=0.45;ctx.fillRect(X0+w1,py,w2,ph);ctx.globalAlpha=1;
  txt(ctx,f1(R.share)+'%',X0+w1/2,py+ph/2+1,{s:13*k,w:700,c:'#fff',a:'center',b:'middle'});
  txt(ctx,big?'Votes for the winner':'Votes for the winner: one more than half in each won place',X0,py+ph+(big?18*k:22),{s:big?12*k:13,w:700,c:PAL['rj']});
  if(!big)txt(ctx,'Lighter: the other half in those places. Gray: every vote in the lost states.',X0,py+ph+44,{s:13,c:PAL['cv-soft']});
  const fy=py+ph+(big?50*k:92);
  txt(ctx,`(½ × ${f2(mil(wonP))} million + 1 per place) ÷ ${f2(mil(R.tot))} million = ${f1(R.share)}%`,X0,fy,{s:big?13*k:18,w:700,c:PAL['rj']});
  if(fy+24*k<448)txt(ctx,big?'Theory only: everyone votes.':'Theoretical: assumes everyone votes and each place’s votes match its population.',X0,fy+(big?22*k:28),{s:big?12*k:13,c:PAL['cv-soft']});}
 }
function drawHist(sim,ctx,k){const big=k>1.3,sh=shown(sim);
 txt(ctx,big?'Winner without the popular vote':'When the Electoral College winner did not win the popular vote',24,26*k,{s:15*k,w:700});
 const lg=48*k;ctx.lineWidth=2.5;
 ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(24,lg-4*k);ctx.lineTo(54,lg-4*k);ctx.stroke();txt(ctx,big?'50%':'50%: half of the popular vote',60,lg,{s:12*k,c:PAL['cv-ink']});
 const lx=big?160:300;ctx.strokeStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(lx,lg-4*k);ctx.lineTo(lx+30,lg-4*k);ctx.stroke();ctx.setLineDash([]);
 txt(ctx,big?`${f1(MIN.full.share)}%: theory`:`${f1(MIN.full.share)}%: theoretical minimum with today’s electors`,lx+36,lg,{s:12*k,c:PAL['cv-ink']});
 const L=64,R=780,T=lg+22*k,B=450-50*k,Y=v=>B-(v/60)*(B-T);
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,10,20,30,40,50,60].forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();if(!big||v%20===0)txt(ctx,v+'%',L-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});});
 const n=HIST.length,slot=(R-L)/n,bw=Math.min(78,slot*0.55);
 HIST.forEach((h,i)=>{const cx=L+slot*(i+0.5);ctx.fillStyle=sh?PAL['rj']:PAL['line'];ctx.fillRect(cx-bw/2,Y(h.v),bw,B-Y(h.v));
  txt(ctx,sh?f1(h.v)+'%':'?',cx,Y(h.v)+18*k,{s:13*k,w:700,a:'center',c:sh?'#fff':PAL['cv-ink']});
  txt(ctx,String(h.y),cx,B+18*k,{s:13*k,w:700,a:'center'});
  if(h.note)txt(ctx,h.note,cx,B+35*k,{s:12*k,a:'center',c:PAL['cv-soft']});});
 ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(L,Y(50));ctx.lineTo(R,Y(50));ctx.stroke();
 ctx.strokeStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(L,Y(MIN.full.share));ctx.lineTo(R,Y(MIN.full.share));ctx.stroke();ctx.setLineDash([]);}
function drawSplit(sim,ctx,k){const big=k>1.3,m=msOf(sim),S=split(sim),d=dShares(sim),ss=stateShare(sim);
 txt(ctx,big?`${m.n}: two ways to count`:`${m.n}, ${m.e} electors: winner-take-all vs. the district method`,24,26*k,{s:15*k,w:700});
 if(!big)txt(ctx,'Vote shares are what-ifs, not results',776,26*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const bx=24,by=big?40*k:44*k,bw=(big?752:470)/m.d,bh=big?54*k:84*k;
 d.forEach((v,i)=>{const w=winOf(v);ctx.fillStyle=COL[w];rr(ctx,bx+i*bw+2,by,bw-4,bh,10);ctx.fill();
  txt(ctx,big?'D'+(i+1):'District '+(i+1),bx+i*bw+bw/2,by+bh*0.36,{s:13*k,w:700,c:'#fff',a:'center',b:'middle'});
  txt(ctx,big?`A ${v}%`:`A ${v}% · B ${100-v}%`,bx+i*bw+bw/2,by+bh*0.72,{s:12*k,c:'#fff',a:'center',b:'middle'});});
 const swc=S.sw==='A'?PAL['s6']:S.sw==='B'?PAL['s5']:PAL['cv-soft'],swt=S.sw==='T'?'a tie':`side ${S.sw} wins`;
 let ry;
 if(big){txt(ctx,`Statewide: A ${f1(ss)}%, ${swt}`,24,by+bh+22*k,{s:13*k,w:700,c:swc});ry=by+bh+48*k;}
 else{const sx=520,sy=by+24*k;txt(ctx,'Statewide (equal districts):',sx,sy,{s:12*k,c:PAL['cv-soft']});txt(ctx,`A ${f1(ss)}% · B ${f1(100-ss)}%`,sx,sy+20*k,{s:14*k,w:700});
  txt(ctx,S.sw==='T'?'A tie':`Side ${S.sw} wins the state`,sx,sy+40*k,{s:13*k,w:700,c:swc});ry=by+bh+44;}
 const rows=[['Winner-take-all',Array(m.e).fill(S.sw)],['District method',[S.sw,S.sw].concat(S.dw)]];
 const rad=big?9*k:15,gapC=big?rad*2+8*k:64;
 rows.forEach(([lab,arr],ri)=>{const tally=ri?S.dist:S.wta;txt(ctx,lab,24,ry,{s:13*k,w:700});
  txt(ctx,`A ${tally.A} · B ${tally.B}${tally.T?' · tied '+tally.T:''}`,776,ry,{s:13*k,w:700,a:'right'});
  arr.forEach((w,i)=>{const cx=24+(big?rad:32)+i*gapC,cy=ry+(big?8*k:12)+rad;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fillStyle=COL[w];ctx.fill();
   txt(ctx,w==='T'?'?':w,cx,cy+1,{s:12*k,w:700,c:'#fff',a:'center',b:'middle'});
   if(ri&&!big)txt(ctx,i<2?'statewide':'District '+(i-1),cx,cy+rad+16,{s:12,c:PAL['cv-soft'],a:'center'});});
  ry+=big?(8*k+rad*2+24*k):(rad*2+(ri?62:40));});
 const fy=Math.min(ry+(big?0:6),446),parts=S.dw.map(w=>w==='A'?1:0);
 fit(ctx,big?`A = ${S.sw==='A'?2:0} + ${parts.join(' + ')} = ${S.dist.A}; B = ${S.dist.B}`:`District method: A gets ${S.sw==='A'?2:0} (statewide) + ${parts.join(' + ')} (districts) = ${S.dist.A}; B gets ${S.dist.B}.`,24,fy,752,{s:14*k,w:700,c:PAL['rj']},k);}
function drawPower(sim,ctx,k){const big=k>1.3,t=toyOf(sim),r=bz(t),pk=pickOf(sim),n=t.w.length;
 txt(ctx,big?'Swing power (illustration)':'Swing power: how often is a state’s vote decisive? (an illustration)',24,26*k,{s:15*k,w:700});
 txt(ctx,big?`${t.l}; ${t.q} to win`:`${t.l}. ${t.q} electors to win. Each other state treated as a coin flip.`,24,48*k,{s:12*k,c:PAL['cv-soft']});
 const lw=big?190:170,bx=24+lw,bw=big?470:540;
 if(big){txt(ctx,'Bar: decisive moments',24,70*k,{s:12*k,c:PAL['rj'],w:700});txt(ctx,'Tick: electors',24+320,70*k,{s:12*k,c:PAL['cv-ink']});}
 else{txt(ctx,'Share of electors',bx,64*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'Share of decisive moments',bx+260,64*k,{s:12*k,c:PAL['rj'],w:700});}
 const top=big?82*k:72*k,rowH=big?Math.min(30*k,(450-top-62*k)/n):Math.min(58,(450-top-80*k)/n);
 t.w.forEach((w,i)=>{const y=top+i*rowH,es=w/r.tot,ps=r.c[i]/r.T;
  if(i===pk){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,18,y,764,rowH-3,8);ctx.fill();}
  txt(ctx,`State ${LET[i]} · ${w}`,24,y+rowH/2,{s:13*k,w:i===pk?700:400,b:'middle'});
  if(big){const hh=rowH*0.5,yy=y+(rowH-hh)/2-1;ctx.fillStyle=PAL['rj'];ctx.fillRect(bx,yy,Math.max(2,bw*ps),hh);
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx+bw*es,yy-4);ctx.lineTo(bx+bw*es,yy+hh+4);ctx.stroke();
   txt(ctx,f1(100*ps)+'%',bx+Math.max(bw*ps,bw*es)+8,yy+hh/2,{s:12*k,w:700,c:PAL['rj'],b:'middle'});}
  else{const hh=Math.max(8,(rowH-16)/2);ctx.fillStyle=PAL['line'];ctx.fillRect(bx,y+5,Math.max(2,bw*es),hh);txt(ctx,f1(100*es)+'%',bx+bw*es+6,y+5+hh/2,{s:12*k,c:PAL['cv-soft'],b:'middle'});
   ctx.fillStyle=PAL['rj'];ctx.fillRect(bx,y+7+hh,Math.max(2,bw*ps),hh);txt(ctx,f1(100*ps)+'%',bx+bw*ps+6,y+7+hh*1.5,{s:12*k,w:700,c:PAL['rj'],b:'middle'});}});
 const fy=top+n*rowH+(big?22*k:20*k),c=r.c[pk];
 fit(ctx,big?`${LET[pk]}: ${c} of ${r.ways} line-ups = ${f1(100*c/r.ways)}%`:`State ${LET[pk]}: decisive in ${c} of ${r.ways} line-ups of the others = ${f1(100*c/r.ways)}%`,24,fy,752,{s:14*k,w:700,c:PAL['rj']},k);
 if(fy+22*k<448)fit(ctx,big?`Power share: ${c} ÷ ${r.T} = ${f1(100*c/r.T)}%`:`Power share = ${c} ÷ ${r.T} decisive moments in all = ${f1(100*c/r.T)}%`,24,fy+22*k,752,{s:13*k},k);}

/* ---------- info panel ---------- */
function infoHTML(sim){const [H,L]=pair(sim),hon=atLeast('honors');
 let h=`<h3>What this number hides</h3><ul>
<li><b>People, not voters.</b> Electors per million counts everyone in the 2020 Census count, including children and adults who cannot vote. Turnout differs by state, so electors per <i>voter</i> is a different number.</li>
<li><b>Winner-take-all.</b> In ${hon?'48 states and D.C.':'most states'}, everyone who voted for the losing side in that state is represented by none of its electors.</li>
<li><b>Weight is not power.</b> A Wyoming resident has more electors per person, but in a state that is not close, no one’s vote is likely to change which way its electors go. Being decisive depends on how close the state is.</li>
<li><b>Ten-year-old counts.</b> Electors for 2024 and 2028 come from the April 1, 2020 count. People who moved since then shift nothing until the next census (see ${APP}).</li></ul>
<h3>Questions to ask any number</h3><ol>
<li><b>Who counted, and when?</b> Here: the U.S. Census Bureau, April 1, 2020.</li>
<li><b>Per what?</b> Per person, per adult, per citizen or per voter each gives a different answer.</li>
<li><b>Compared with what?</b> ${H.n} at ${f2(perM(H))} per million means little until you set it beside ${L.n} at ${f2(perM(L))}.</li>
<li><b>What is left out?</b> Turnout, closeness and the losing side’s voters in each state.</li>
<li><b>Fact, model or assumption?</b> Elector counts are facts. The ${f1(MIN.full.share)}% minimum is a model built on stated assumptions.</li></ol>`;
 if(hon)h+=`<h3>Reforms, with each side’s strongest case</h3><p>These are arguments people make, not findings. The math above is checkable; which kind of equality should count most is a question of values, and this tool does not score it.</p><ul>
<li><b>Keep the Electoral College.</b> For: a candidate must win support spread across many states, states keep a role the Constitution gave them, and a dispute is contained to one state’s count instead of a national recount. Against: people count unequally by state, a candidate can win with fewer votes, and campaigns focus on a few close states.</li>
<li><b>A constitutional amendment for a national popular vote.</b> For: one person, one vote, nationwide, with uniform rules written into the Constitution itself. Against: it needs two-thirds of both houses of Congress and three-fourths of the states (38 of 50), and it would end the federal design that gives smaller states their two extra electors.</li>
<li><b>The National Popular Vote Interstate Compact.</b> Member states agree to give their electors to the national popular vote winner, but only once members hold at least 270 electoral votes. As of 2026, 18 states and D.C. have joined, with 222 electoral votes, including Colorado’s 10. For: it uses each state’s existing power to choose how its electors are appointed, with no amendment, and the winner always has the most votes. Against: a state’s electors could go to a candidate its own voters rejected, there is no national recount process, and whether it needs the consent of Congress under the Constitution’s Compact Clause is an open legal question.</li>
<li><b>The district method.</b> Maine and Nebraska give 1 elector per congressional district. For: a state’s electors better reflect how its regions voted. Against: district lines are drawn by people, so the method inherits any gerrymander (see the districts tool).</li></ul>`;
 if(hon)h+=`<p><b>Colorado.</b> In 2019 the legislature passed SB 19-042 to join the compact. A citizen petition referred it to voters as Proposition 113 in 2020, and it passed 52.33% to 47.67%. Colorado had 9 electors in 2020; after the 2020 Census added a House seat, it has 10.</p>`;
 if(atLeast('ap'))h+=`<p><b>Discuss.</b> What should “equal” mean in a presidential election: equal weight for each person, or a voice for each state? What would you need to know about the people in each state to answer well?</p>`;
 return h;}

const SIM={
 id:'electoral',hash:'electoral',apUnit:7,order:3,tab:'270 to win',kind:'Simulation',prereq:['apportion'],next:['districts','margin','turnout'],
 card:'Work out how many electors per million people two states get, then find the smallest share of the vote that could, in theory, win 270.',
 title:'270: the math of the Electoral College',
 skills:{bio:'Rates per million and ratios · U.S. Government (Unit 3: winner-take-all, the Electoral College)',
  honors:'Rates, ratios and weighted totals · U.S. Government (Unit 3), AP U.S. Government (Units 4 and 5)',
  ap:'Rates, optimization and the Banzhaf power index · U.S. Government (Unit 3), AP U.S. Government (Units 4 and 5)'},
 lede:{bio:'Each state gets one elector for every House seat, plus 2 for its two Senators. That +2 gives small states more electors per person. Work out the weight of one person in two states, then see how a candidate could, in theory, win 270 electors with far less than half the votes.',
  honors:'Forty-eight states and D.C. give every elector to whoever wins the state, even by one vote. Maine and Nebraska split theirs by congressional district. Compare the two methods, and weigh the reforms people propose.',
  ap:'Weight per person is not the same as power. A state matters most when its electors are decisive. Find the theoretical minimum winning share as an optimization problem, and count decisive moments with the Banzhaf index.'},
 scale:'The whole country: 538 electors for the 2024 and 2028 elections, and 331.8 million people in the 2020 Census counts used here.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The electors',
 controls:[
  {id:'guess',label:'Your gut: one person on the left carries the weight of how many people on the right?',type:'range',min:1,max:6,step:0.1,def:2,d:1,unit:' people',help:'1 means both count the same.'},
  {id:'view',label:'Show',type:'seg',def:'per',noGut:true,options:[{v:'per',l:'Electors per person'},{v:'min',l:'Smallest winning share'},{v:'hist',l:'History'},{v:'split',l:'Winner-take-all vs. districts',lvl:'honors'},{v:'power',l:'Swing power',lvl:'ap'}]},
  {id:'sa',label:'State 1',type:'select',def:'WY',noGut:true,onChange:clearGut,options:ST.map(s=>({v:s.a,l:s.n}))},
  {id:'sb',label:'State 2',type:'select',def:'CA',noGut:true,onChange:clearGut,options:ST.map(s=>({v:s.a,l:s.n}))},
  {id:'house',label:'What if states got only their House seats (no +2, no D.C.)?',type:'toggle',def:false,lvl:'ap',noGut:true,help:'For the smallest-winning-share view: 218 of 435 seats to win.'},
  {id:'ms',label:'District-method state',type:'seg',def:'NE',lvl:'honors',noGut:true,options:[{v:'ME',l:'Maine (2 districts)'},{v:'NE',l:'Nebraska (3 districts)'}]},
  {id:'d1',label:'District 1: side A’s share',type:'range',min:30,max:70,step:1,def:58,unit:'%',lvl:'honors',noGut:true,help:'What-if vote shares, not real results.'},
  {id:'d2',label:'District 2: side A’s share',type:'range',min:30,max:70,step:1,def:47,unit:'%',lvl:'honors',noGut:true},
  {id:'d3',label:'District 3: side A’s share (Nebraska only)',type:'range',min:30,max:70,step:1,def:70,unit:'%',lvl:'honors',noGut:true},
  {id:'toy',label:'Toy map for swing power',type:'seg',def:'three',lvl:'ap',noGut:true,options:[{v:'three',l:'50, 49, 1'},{v:'dummy',l:'10, 10, 10, 1'},{v:'five',l:'9, 7, 5, 3, 3'}]},
  {id:'pick',label:'State to explain',type:'seg',def:2,lvl:'ap',noGut:true,options:[0,1,2,3,4].map(i=>({v:i,l:LET[i]}))},
  {id:'show',label:'Show the math now',type:'toggle',def:false,help:'Normally the answers appear once you lock in your gut and work out the number.'}
 ],
 init(){return {peek:0};},step(){},
 infoPanel:infoHTML,
 metrics:[
  {id:'eA',label:'Electors, state on the left',unit:'electors',d:0,min:0,max:60,get:sim=>pair(sim)[0].e},
  {id:'eB',label:'Electors, state on the right',unit:'electors',d:0,min:0,max:60,get:sim=>pair(sim)[1].e},
  {id:'perA',label:'Electors per million, left',unit:'per million',d:2,min:0,max:6,get:sim=>shown(sim)?perM(pair(sim)[0]):null},
  {id:'perB',label:'Electors per million, right',unit:'per million',d:2,min:0,max:6,get:sim=>shown(sim)?perM(pair(sim)[1]):null},
  {id:'ratio',label:'One person on the left equals this many on the right',unit:'people',d:2,min:1,max:6,get:sim=>shown(sim)?ratio(sim):null},
  {id:'minshare',label:'Smallest winning share of the popular vote (theory)',unit:'%',d:1,min:0,max:50,get:sim=>shown(sim)?minR(sim).share:null},
  {id:'distA',label:'District method: electors for side A',unit:'electors',d:0,lvl:'honors',min:0,max:5,get:sim=>split(sim).dist.A},
  {id:'wtaA',label:'Winner-take-all: electors for side A',unit:'electors',d:0,lvl:'honors',min:0,max:5,get:sim=>split(sim).wta.A},
  {id:'bzShare',label:'Picked state’s share of decisive moments',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>{const r=bz(toyOf(sim));return 100*r.c[pickOf(sim)]/r.T;}},
  {id:'pDec',label:'Chance the picked state is decisive (coin-flip others)',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>{const r=bz(toyOf(sim));return 100*r.c[pickOf(sim)]/r.ways;}}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  let v=sim.p.view;if(v==='split'&&!atLeast('honors'))v='per';if(v==='power'&&!atLeast('ap'))v='per';
  ({per:drawPer,min:drawMin,hist:drawHist,split:drawSplit,power:drawPower})[v](sim,ctx,k);},
 narrate(sim){const v=sim.p.view,[H,L]=pair(sim),r=ratio(sim);
  if(v==='min'){const R=minR(sim);if(!shown(sim))return `To win you need ${R.need} of ${R.all}. <b>What is the smallest share of all the votes that could get there?</b> Lock in your gut, or turn on Show the math now.`;
   return `Win ${R.won.length} places by one vote each, get nothing in the ${R.biggest?R.lost.length+' biggest':'other '+R.lost.length} states, and you have ${R.ev}: <b>${f1(R.share)}% of the popular vote</b>. Theoretical only: it assumes everyone votes.`;}
  if(v==='hist')return shown(sim)?'In 1876, 1888, 2000 and 2016, the Electoral College winner got <b>less than half of the popular vote</b> and fewer votes than another candidate. In 1824 the House of Representatives chose the president.':'Five elections went to someone without the most popular votes. <b>What share do you think the winner received?</b> Lock in your gut to see.';
  if(v==='split'&&atLeast('honors')){const S=split(sim),m=msOf(sim);return `${m.n}: winner-take-all gives side A <b>${S.wta.A} of ${m.e}</b>; the district method gives A <b>${S.dist.A}</b> and B <b>${S.dist.B}</b>. The 2 statewide electors follow the whole state; each district elector follows its district.`;}
  if(v==='power'&&atLeast('ap')){const t=toyOf(sim),b=bz(t),pk=pickOf(sim);return `State ${LET[pk]} has ${f1(100*t.w[pk]/b.tot)}% of the electors but <b>${f1(100*b.c[pk]/b.T)}% of the decisive moments</b>. Power comes from being needed to cross the line, not from size alone.`;}
  if(!shown(sim))return `${H.n}: ${H.e} electors for ${n0(H.p)} people. ${L.n}: ${L.e} electors for ${n0(L.p)} people. <b>Whose residents carry more electoral weight, and by how much?</b>`;
  return `${H.n} has <b>${f2(perM(H))}</b> electors per million people; ${L.n} has <b>${f2(perM(L))}</b>. One elector stands for ${n0(H.p/H.e)} people in ${H.n} and ${n0(L.p/L.e)} in ${L.n}, so one ${H.n} resident carries the weight of <b>${f2(r)}</b> in ${L.n}. House seats follow population (see ${APP}); the +2 does not.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the two states in the picture (Wyoming and California to start). Drag the slider here to how many people in the state on the right it takes to match the electoral weight of one person in the state on the left. 1 means equal. Then lock it in.',
   honors:'Drag the slider here: one person in the state on the left carries the electoral weight of how many people in the state on the right? Then lock it in.'},
  hint:'Lock in your gut. Then you will work out electors per million people for both states yourself.',
  lock(sim){const r=ratio(sim);return {v:Math.abs(sim.p.guess-r),guess:sim.p.guess,label:`1 person on the left = ${f1(sim.p.guess)} on the right`};},
  solve(sim){const r=ratio(sim);sim.p.guess=r;return {v:0,guess:r,label:`1 person on the left = ${f2(r)} on the right`};},
  calc:{unit:'people',d:2,tol:0.05,
   prompt:sim=>{const [H,L]=pair(sim);const one=s=>s.a==='DC'?`${s.n}: 3 electors (23rd Amendment), ${n0(s.p)} people`:`${s.n}: ${seatTxt(s.h)}, ${n0(s.p)} people`;
    return `Electors = House seats + 2. ${one(H)}. ${one(L)}. Find each state’s electors per million people (electors ÷ people in millions). Then divide the bigger rate by the smaller: one person in ${H.n} equals how many people in ${L.n}?`;},
   answer:sim=>ratio(sim),
   hint:'Add 2 to each state’s House seats. Divide by the population in millions (577,719 is 0.577719 million). Then divide the two rates.',
   steps(sim){const [H,L]=pair(sim),el=s=>s.a==='DC'?`${s.n}: 3 electors`:`${s.n}: ${s.h} + 2 = ${s.e} electors`;
    return [`${el(H)}. ${el(L)}.`,`${H.n}: ${H.e} ÷ ${f3(mil(H.p))} = ${f3(perM(H))} electors per million.`,`${L.n}: ${L.e} ÷ ${f3(mil(L.p))} = ${f3(perM(L))} electors per million.`,`${f3(perM(H))} ÷ ${f3(perM(L))} = <b>${f2(ratio(sim))}</b>. One person in ${H.n} carries the electoral weight of ${f2(ratio(sim))} people in ${L.n}.`];}},
  formula(sim){const [H,L]=pair(sim);const one=s=>`${s.n}: ${s.a==='DC'?'3':'('+s.h+' + 2)'} ÷ ${f3(mil(s.p))} = ${f3(perM(s))} per million`;return `${one(H)}<br>${one(L)}<br>${f3(perM(H))} ÷ ${f3(perM(L))} = ${f2(ratio(sim))}`;},
  how:{bio:'Electors = House seats + 2. Divide by people in millions for each state, then divide the two rates.',ap:'Weight ratio = (e₁ ÷ P₁) ÷ (e₂ ÷ P₂), with e = House seats + 2.'},
  compare(sim,g,m){const [H,L]=pair(sim),r=m.guess,off=Math.abs(g.guess-r),ph=H.p/H.e,pl=L.p/L.e;
   const tail=` In real terms: in ${H.n}, one elector stands for <b>${n0(ph)}</b> people; in ${L.n}, for <b>${n0(pl)}</b>. A group of ${n0(H.p)} people in ${L.n} would get only ${f2(H.p*perM(L)/1e6)} electors, not ${H.e}.`;
   const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked it out yourself, so you can check any state against any other.':'';
   if(off<=0.25)return `Your gut was right on: ${f1(g.guess)} against ${f2(r)}. You already sense what the +2 does for small states.`+tail+self;
   return `Your gut said ${f1(g.guess)}; the math says <b>${f2(r)}</b>, off by ${f2(off)}. ${g.guess<r?'Most people guess low: the +2 is the same for every state, so it counts for far more where there are few people.':'You guessed high: House seats do follow population, so the gap comes only from the +2.'}`+tail+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.sa=R(['WY','VT','DC','AK','ND','SD','DE','RI','MT']);sim.p.sb=R(['CA','TX','FL','NY','PA','CO','IL','OH']);sim.p.guess=2;sim.p.show=false;sim.p.view='per';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Colorado has 8 House seats and 5,782,171 people in the 2020 apportionment count. Electors = House seats + 2. How many electors per million people does Colorado have? Round to 2 decimal places.',answer:10/5.782171,tol:0.01,unit:'per million',d:2,hint:'8 + 2 = 10 electors. Write the population in millions: 5.782171. Then divide.',explain:'8 + 2 = 10 electors, and 10 ÷ 5.782171 = 1.73 electors per million people. That is more than California’s 1.36 and far less than Wyoming’s 5.19.'},
  {lvl:'bio',instant:true,q:'There are 538 electors. Why does a candidate need 270, not 269?',choices:['269 is exactly half, and a tie is not a majority: a majority needs more than half','Because D.C. adds 1','Because 270 is half of 540'],correct:0,explain:'538 ÷ 2 = 269. A 269 to 269 tie is possible, and then no one has a majority. Under the 12th Amendment the House of Representatives would choose, with each state delegation casting one vote.'},
  {lvl:'bio',instant:true,q:'In theory, what is the smallest share of the national popular vote that could win 270 electors today, if everyone voted?',choices:['Just over 50%','About 40%','About 22%'],correct:2,explain:'Win 39 states and D.C., everything except the 11 biggest states, by one vote each (270 electors from 143.05 million people), and get no votes in those 11 states. Half of 143.05 million is about 71.5 million, which is 21.6% of 331.8 million. It is a theoretical case, not a strategy anyone could carry out.'},
  {lvl:'bio',instant:true,q:'Which statement about past presidential elections is true?',choices:['The Electoral College winner has always won the most popular votes','In 1876, 1888, 2000 and 2016, the Electoral College winner received less of the popular vote than another candidate','It has happened only once'],correct:1,explain:'The winners received 48.0% (1876), 47.8% (1888), 47.9% (2000) and 46.1% (2016) of the popular vote. In 1824 no one won a majority of electors, and the House chose a president who had received 30.9%.'},
  {lvl:'honors',instant:true,q:'Nebraska has 5 electors: 2 for the statewide winner and 1 for each of its 3 districts. Side A wins the state and districts 1 and 3; side B wins district 2. How do the electors split?',choices:['A 5, B 0','A 4, B 1','A 3, B 2'],correct:1,explain:'A gets 2 (statewide) + 1 + 1 = 4, and B gets 1. Nebraska’s electors split 4 to 1 this way in 2008, 2020 and 2024. Under winner-take-all, A would get all 5.'},
  {lvl:'honors',kind:'num',q:'As of 2026, the states and D.C. in the National Popular Vote Interstate Compact hold 222 electoral votes. How many more must join before the compact takes effect?',answer:48,tol:0,unit:'electoral votes',d:0,hint:'The compact takes effect at 270.',explain:'270 − 222 = 48. Until then, every member awards its electors the usual way. Colorado’s 10 are among the 222.'},
  {lvl:'honors',instant:true,q:'A state votes 50.5% to 49.5%. Under winner-take-all, what share of its electors does the 50.5% side get?',choices:['50.5%','100%','About half'],correct:1,explain:'Winner-take-all gives every elector to the statewide winner, whatever the margin. A 1-point edge and a 40-point edge earn the same electors, which is why close states draw so much attention.'},
  {lvl:'ap',instant:true,q:'Three states have 50, 49 and 1 electors, and 51 wins. Which has more power to swing the result: the 49-elector state or the 1-elector state?',choices:['The 49-elector state, by 49 times','They have exactly the same power','The 1-elector state has none'],correct:1,explain:'The 50 needs a partner: 50 + 49 and 50 + 1 both win, and 49 + 1 = 50 loses. The 49 and the 1 are each decisive in exactly 1 winning line-up; the 50 in 3. Banzhaf shares: 60%, 20%, 20%. Size and power are not the same thing.'},
  {lvl:'ap',kind:'num',q:'In the toy map 9, 7, 5, 3, 3 (14 to win), the 9-elector state is decisive in 10 of the 16 ways the other four states can line up. If each other state is a coin flip, what is the chance it is decisive, in percent?',answer:62.5,tol:0.1,unit:'%',d:1,hint:'Four other states, each for or against: 2 × 2 × 2 × 2 = 16 line-ups.',explain:'10 ÷ 16 = 0.625, so 62.5%. Its share of all decisive moments is 10 ÷ 26 = 38.5%, while it holds 9 ÷ 27 = 33.3% of the electors.'},
  {lvl:'ap',instant:true,q:'If states got only their House seats (no +2, no D.C.), the theoretical minimum winning share would be about:',choices:['24.4%: the +2 makes small states cheaper to win','50%: it would become a popular vote','21.6%: the +2 changes nothing'],correct:0,explain:'With only House seats, 218 of 435 wins. The 218 seats with the fewest people behind them come from 28 states, and one vote more than half of their people is 24.4% of everyone. The +2 lowers that to 21.6%. Winner-take-all, not the +2, keeps it far below 50%.'}
 ],
 tour:[
  {title:'Electors = House seats + 2',text:'Every state gets one elector for each House seat, plus 2 for its two Senators. House seats are divided by population after each census (that is apportionment). Wyoming: 1 + 2 = 3. California: 52 + 2 = 54. D.C. gets 3 under the 23rd Amendment. In all: 435 + 100 + 3 = 538.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'per',sa:'WY',sb:'CA',show:false});sim.st.peek=0;}},
  {title:'Electors per million people',text:'Divide electors by people, in millions. Wyoming: 3 ÷ 0.578 = 5.193 per million. California: 54 ÷ 39.577 = 1.364 per million. 5.193 ÷ 1.364 = 3.81. Colorado sits between: 10 ÷ 5.782 = 1.73.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'per',sa:'WY',sb:'CA'});sim.st.peek=1;}},
  {title:'270 to win',text:'Half of 538 is 269, so a majority is 270. In 48 states and D.C., whoever wins the state’s popular vote, even by one vote, gets all of its electors. That is winner-take-all.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'min',house:false});sim.st.peek=0;}},
  {title:'The smallest winning share (theory)',text:'Win 39 states and D.C., everything except the 11 biggest states, by one vote each, and get no votes in those 11. That is exactly 270 electors from 143.05 million people. Half of them is 21.6% of all 331.8 million. This is a theoretical case: it assumes everyone votes and votes match population.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'min',house:false});sim.st.peek=1;}},
  {title:'It has happened',text:'Real elections are nowhere near 21.6%, but the gap is real. In 1876, 1888, 2000 and 2016, the Electoral College winner received 48.0%, 47.8%, 47.9% and 46.1% of the popular vote while someone else received more. In 1824 no one won a majority of electors, and the House chose a president who had received 30.9%.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'hist'});sim.st.peek=1;}},
  {lvl:'honors',title:'Two ways to award electors',text:'Maine (since 1972) and Nebraska (since 1992) give 2 electors to the statewide winner and 1 to the winner of each congressional district. Here side A wins the state and districts 1 and 3. Winner-take-all would give A all 5; the district method gives A 4 and B 1. Nebraska split 4 to 1 in 2008, 2020 and 2024.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'split',ms:'NE',d1:58,d2:47,d3:70});sim.st.peek=1;}},
  {lvl:'ap',title:'Weight is not power',text:'Three states with 50, 49 and 1 electors, 51 to win. List every way they can line up. The 49 and the 1 are each decisive in 1 winning line-up, the 50 in 3. So 49 electors buy no more swing power than 1. The Banzhaf index counts these decisive moments. It is an illustration, not a forecast.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'power',toy:'three',pick:1});sim.st.peek=1;}}
 ],
 onTourExit(sim){sim.st.peek=0;},
 lab:{bio:'<p><b>Question:</b> Which states carry the most and the least electoral weight per person?</p><ol><li>Turn on <b>Show the math now</b>. Keep <b>Electors per person</b>.</li><li>Set State 1 to Colorado. Try five different states as State 2 and record a trial each time.</li><li>Find one state with more electors per million than Colorado and one with fewer.</li></ol><p>Write one sentence: why do the states with the most electors per person all have small populations?</p>',
  honors:'<p><b>Question:</b> When do the two methods give different results?</p><ol><li>Choose <b>Winner-take-all vs. districts</b> and Nebraska.</li><li>Set district shares so side A wins the state but loses 2 of 3 districts. Record both tallies.</li><li>Can side A win more districts and still lose the state? Try it.</li></ol><p>Then a discussion question with no single right answer: which reform in the panel below has the strongest case, and what is the best argument against it?</p>',
  ap:'<p><b>Question:</b> How much do the +2 and winner-take-all each lower the minimum winning share?</p><ol><li>Choose <b>Smallest winning share</b>. Record the share with the toggle off and on.</li><li>Under a pure national popular vote, the minimum is just over 50%.</li><li>In <b>Swing power</b>, record each toy state’s share of electors and share of decisive moments.</li></ol><p><b>CER:</b> Using your numbers, explain why electors per person and swing power can point in different directions.</p>'},
 terms:[
  {t:'Elector',d:'A person chosen to cast one of a state’s votes for president. Each state has as many as its House seats plus 2.'},
  {t:'Apportionment',d:'Dividing the 435 House seats among the states by population after each census.'},
  {t:'Majority',d:'More than half. Of 538 electors, a majority is 270.'},
  {t:'Winner-take-all',d:'The statewide popular vote winner gets all of the state’s electors.'},
  {t:'Popular vote',d:'The total of individual votes cast, nationwide or in one state.'},
  {t:'District method',d:'Maine’s and Nebraska’s rule: 2 electors to the statewide winner, 1 to the winner of each congressional district.',lvl:'honors'},
  {t:'Interstate compact',d:'A binding agreement among states. The National Popular Vote compact takes effect only when members hold 270 electoral votes.',lvl:'honors'},
  {t:'Banzhaf power index',d:'A state’s share of all decisive moments: winning line-ups that would lose without it.',lvl:'ap'},
  {t:'Optimization',d:'Finding the best value (here, the fewest people) that meets a constraint (at least 270 electors).',lvl:'ap'}
 ],
 about:'<p><b>Facts used.</b> Apportionment population and House seats by state: U.S. Census Bureau, 2020 Census Apportionment, Table 1 (April 1, 2020), https://www2.census.gov/programs-surveys/decennial/2020/data/apportionment/apportionment-2020-table01.pdf. D.C. resident population 689,545: the same release, Table 2. Electors for the 2024 and 2028 elections (538 in all, 270 to win; Colorado 10, California 54, Wyoming 3, D.C. 3, Maine 4, Nebraska 5): National Archives, https://www.archives.gov/electoral-college/allocation. Maine’s and Nebraska’s district method: the same National Archives page; first used in Maine in 1972 and Nebraska in 1992 (270toWin, https://270towin.com/content/split-electoral-votes-maine-and-nebraska). Splits in 2024 (Maine 3 to 1, Nebraska 4 to 1): National Archives, https://www.archives.gov/electoral-college/2024. A 2026 initiative to return Nebraska to winner-take-all did not make the ballot (Ballotpedia, https://ballotpedia.org/Nebraska_2026_ballot_measures).</p>'+
  '<p><b>History.</b> Popular vote shares of the Electoral College winner: 1876, 48.0%; 1888, 47.8%; 2000, 47.9%; and 1824, 30.9% for the president chosen by the House (six states chose electors in the legislature that year, so there is no popular vote for them): American Presidency Project, UC Santa Barbara, https://www.presidency.ucsb.edu/statistics/elections/1876 (and /1888, /2000, /1824). 2016, 46.09%: Federal Election Commission, Federal Elections 2016, https://www.fec.gov/resources/cms-content/documents/federalelections2016.pdf. In 1876 the winner had 185 of 369 electors, exactly a majority, after an Electoral Commission settled disputed returns from four states (National Archives, https://www.archives.gov/electoral-college/1876).</p>'+
  '<p><b>The compact.</b> 18 states and D.C. with 222 electoral votes, Virginia the latest (2026): National Popular Vote, https://www.nationalpopularvote.com/ (checked June 2026), and the member list on Wikipedia’s National Popular Vote Interstate Compact page (checked August 2026). Colorado: SB 19-042 (2019), referred to voters as Proposition 113 and approved 52.33% to 47.67% on November 3, 2020 (Ballotpedia, https://ballotpedia.org/Colorado_Proposition_113,_National_Popular_Vote_Interstate_Compact_Referendum_(2020)).</p>'+
  '<p><b>Assumptions.</b> Electors per million use the apportionment count (residents plus overseas federal employees assigned to a home state), and for D.C. its resident count. That is everyone, not voters. The smallest-winning-share case is theoretical: it assumes everyone votes, each place’s votes match its population, and the winner gets one vote more than half in each won place and none elsewhere. It is found exactly, as the set of places with the fewest people whose electors reach 270. A quicker rule, taking places with the fewest people per elector first, stops at 273 electors and 21.8%; the exact search does slightly better by swapping one state. The district view assumes equal-size districts, and its vote shares are what-ifs. Swing power uses toy maps and treats every other state as a coin flip, an illustration of the Banzhaf idea, not a model of any real election. No party or candidate is named, because the math is the same whoever wins.</p>'
};
BioLab.register(SIM);
})();
