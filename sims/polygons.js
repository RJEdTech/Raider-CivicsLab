(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* An original take on Thomas Schelling's 1971 segregation model, inspired by "Parable of the Polygons" (Vi Hart and Nicky Case, 2014, CC0).
   A 20 x 20 town. Each shape looks at its 8 neighbor cells (fewer on an edge). It is unhappy if the share of its neighbors that are like it
   is below the bias, or (when the diversity limit is under 100%) above that limit. A shape with no neighbors is content.
   Each round, every unhappy shape (in a shuffled order) moves to a random empty cell. The town stops when nobody is unhappy, or after MAXR rounds.
   Every run uses a fixed seed, so the same settings always give the same town. */
const N=20,CELLS=N*N,MAXR=150,SEED=23,CS=20,GX=24,GY=25;
const nbr=(g,i)=>{const r=(i/N)|0,c=i%N,me=g[i];let s=0,o=0;for(let dr=-1;dr<=1;dr++){const rr2=r+dr;if(rr2<0||rr2>=N)continue;for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const cc=c+dc;if(cc<0||cc>=N)continue;const v=g[rr2*N+cc];if(v){o++;if(v===me)s++;}}}return [s,o];};
const isUnhappy=(g,i,lo,hi)=>{const [s,o]=nbr(g,i);if(!o)return false;const f=s/o;return f<lo-1e-9||(hi<1&&f>hi+1e-9);};
function stats(g,lo,hi){let ss=0,n=0,u=0,a=0,all=0;for(let i=0;i<CELLS;i++){if(!g[i])continue;a++;const [s,o]=nbr(g,i);if(o){ss+=s/o;n++;if(s===o)all++;}if(isUnhappy(g,i,lo,hi))u++;}
 return {seg:n?100*ss/n:50,unh:a?100*u/a:0,alike:a?100*all/a:0};}
function fresh(seed,empty){const r=rng(seed*977+13),ne=Math.round(CELLS*empty/100),na=CELLS-ne,g=new Int8Array(CELLS);
 for(let i=0;i<na;i++)g[i]=i<na/2?1:2;for(let i=CELLS-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=g[i];g[i]=g[j];g[j]=t;}return g;}
function runFrom(g0,lo,hi,seed){const g=g0.slice(),r=rng(seed*31+7),grids=[g.slice()],st=[stats(g,lo,hi)];let R=0;
 while(R<MAXR){const un=[];for(let i=0;i<CELLS;i++)if(g[i]&&isUnhappy(g,i,lo,hi))un.push(i);if(!un.length)break;
  for(let i=un.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=un[i];un[i]=un[j];un[j]=t;}
  const em=[];for(let i=0;i<CELLS;i++)if(!g[i])em.push(i);
  for(const i of un){const k=Math.floor(r()*em.length),e=em[k];g[e]=g[i];g[i]=0;em[k]=i;}
  R++;grids.push(g.slice());st.push(stats(g,lo,hi));}
 return {grids,st,R,settled:st[st.length-1].unh===0};}
const cache=new Map();
function town(seed,empty,start){const key='t|'+seed+'|'+empty+'|'+start;if(cache.has(key))return cache.get(key);
 let g=fresh(seed,empty);if(start==='split')g=runFrom(g,0.33,1,seed).grids.slice(-1)[0];cache.set(key,g);return g;}
/* the settings that define a run */
const P=sim=>({bias:sim.p.bias,hi:atLeast('honors')?sim.p.hi:100,start:atLeast('honors')?sim.p.start:'mixed',empty:atLeast('ap')?sim.p.empty:10,seed:(sim.st&&sim.st.seed)||SEED});
function runOf(q){const key=[q.bias,q.hi,q.start,q.empty,q.seed].join('|');if(cache.has(key))return cache.get(key);
 const out=runFrom(town(q.seed,q.empty,q.start),q.bias/100,q.hi/100,q.seed);if(cache.size>220)cache.clear();cache.set(key,out);return out;}
const RUN=sim=>runOf(P(sim));
const rIdx=sim=>{const R=RUN(sim).R;return clamp(Math.floor((sim.st&&sim.st.r)||0),0,R);};
const now=sim=>RUN(sim).st[rIdx(sim)];
const fin=sim=>{const r=RUN(sim);return r.st[r.R];};
const atEnd=sim=>rIdx(sim)>=RUN(sim).R;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const f0=v=>Math.round(v).toString();
const of8=v=>{const n=Math.round(v/100*8);return n+' of 8';};
const ruleTxt=q=>`Unhappy if under ${q.bias}% alike`+(q.hi<100?` or over ${q.hi}%`:'');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function restart(sim){if(sim.st){sim.st.r=0;sim.st.play=false;}}
const onRule=sim=>{restart(sim);clearGut(sim);};
/* shapes: 1 = triangle, 2 = square */
function shape(ctx,t,x,y,s,col){ctx.fillStyle=col;if(t===1){ctx.beginPath();ctx.moveTo(x,y-s*0.52);ctx.lineTo(x+s*0.55,y+s*0.42);ctx.lineTo(x-s*0.55,y+s*0.42);ctx.closePath();ctx.fill();}
 else{rr(ctx,x-s*0.42,y-s*0.42,s*0.84,s*0.84,s*0.12);ctx.fill();}}
function bar(ctx,x,y,w,h,v,col,k){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,4);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x,y,w,h,4);ctx.stroke();
 if(v>0){ctx.fillStyle=col;rr(ctx,x,y,Math.max(4,w*clamp(v,0,100)/100),h,4);ctx.fill();}}

const SIM={
 id:'polygons',hash:'polygons',apUnit:1,order:1,tab:'Polygons, Raider Edition',kind:'Simulation',
 card:'Give every shape a mild preference, guess how mixed the town stays, then watch small choices draw lines nobody asked for.',
 title:'Polygons, Raider Edition',
 lede:{bio:'Every shape in this town is happy to be outnumbered. It only wants at least 1 in 3 of its neighbors to be like it. Unhappy shapes move. Guess how mixed the town ends up, then let them move and see.',
  honors:'Thomas Schelling showed in 1971 that a mild bias in each person can add up to a highly separated town. Add a small preference for variety and the same rules can mix it back. Then turn the bias off and see what the town remembers.',
  ap:'The segregation index here is the average share of same-type neighbors. Random mixing gives about 50%. Run the bias from 0% to 75% and watch the final index jump, then ask what a model that only sees your address learns once a town is separated.'},
 scale:'A town of 400 lots: 20 by 20. Each shape checks its 8 neighboring lots. About 10% of lots are empty, so shapes have somewhere to move.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'The town',
 controls:[
  {id:'guess',label:'Your gut: share of same-type neighbors when the town settles',type:'range',min:30,max:100,step:1,def:50,unit:'%',help:'At the start, with the shapes mixed at random, it is about 50%.'},
  {id:'bias',label:'Bias: unhappy if fewer than this share of neighbors are alike',type:'range',min:0,max:75,step:1,def:33,unit:'%',noGut:true,onChange:onRule,help:'33% means a shape wants at least 1 in 3 neighbors like it. It is fine being outnumbered 2 to 1.'},
  {id:'hi',label:'Also unhappy if MORE than this share are alike',type:'range',min:50,max:100,step:5,def:100,unit:'%',lvl:'honors',noGut:true,onChange:onRule,help:'A small preference for variety. 100% turns it off. 95% means a shape is unhappy only when every neighbor is like it.'},
  {id:'start',label:'Start from',type:'seg',def:'mixed',lvl:'honors',noGut:true,onChange:onRule,options:[{v:'mixed',l:'A mixed town'},{v:'split',l:'The separated town'}],help:'The separated town is where the 33% bias left the mixed town. Use it to see whether new rules can undo old lines.'},
  {id:'empty',label:'Empty lots',type:'range',min:5,max:30,step:5,def:10,unit:'%',lvl:'ap',noGut:true,onChange:onRule}
 ],
 actions:[
  {id:'run',label:'Run the town',primary:true,run(sim){if(atEnd(sim))sim.st.r=0;sim.st.play=true;}},
  {id:'round',label:'One round',run(sim){sim.st.play=false;sim.st.r=Math.min(RUN(sim).R,rIdx(sim)+1);}},
  {id:'end',label:'Skip to the end',run(sim){sim.st.play=false;sim.st.r=RUN(sim).R;}},
  {id:'new',label:'New random town',run(sim){sim.st.seed=((sim.st.seed||SEED)%997)+1;restart(sim);clearGut(sim);}}
 ],
 init(){return {r:0,play:false,seed:SEED};},
 step(sim,dt){const s=sim.st;if(!s.play)return;const R=RUN(sim).R;s.r+=dt*Math.max(3,R/10);if(s.r>=R){s.r=R;s.play=false;}},
 metrics:[
  {id:'seg',label:'Same-type neighbors (segregation index)',unit:'%',d:0,min:0,max:100,get:sim=>now(sim).seg},
  {id:'unh',label:'Unhappy shapes',unit:'%',d:0,min:0,max:100,get:sim=>now(sim).unh},
  {id:'round',label:'Rounds of moving',unit:'',d:0,min:0,max:null,get:sim=>rIdx(sim)},
  {id:'alike',label:'Shapes with no neighbor unlike them',unit:'%',d:0,lvl:'honors',min:0,max:100,get:sim=>now(sim).alike},
  {id:'seg0',label:'Same-type neighbors at the start',unit:'%',d:0,lvl:'ap',min:0,max:100,get:sim=>RUN(sim).st[0].seg}
 ],
 graphs:[{id:'time',label:'Same-type neighbors, round by round',custom:true},{id:'sweep',label:'Where the town settles, for every bias',lvl:'ap',custom:true}],defaultGraph:'time',
 plot(sim,ctx,box,id){const G=GS(sim),q=P(sim);
  if(id==='sweep'){const ax=axes(ctx,box,{xmin:0,xmax:75,ymin:40,ymax:100,xl:'Bias: unhappy below this share alike (%)',yl:'Settled same-type share (%)'});
   const pts=[];for(let b=0;b<=75;b+=5)pts.push([b,runOf(Object.assign({},q,{bias:b})).st.slice(-1)[0].seg]);
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();pts.forEach(([b,v],i)=>i?ctx.lineTo(ax.X(b),ax.Y(v)):ctx.moveTo(ax.X(b),ax.Y(v)));ctx.stroke();
   pts.forEach(([b,v])=>{ctx.fillStyle=PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(b),ax.Y(v),3,0,7);ctx.fill();});
   ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(50));ctx.lineTo(ax.X(75),ax.Y(50));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Random mix',ax.X(75)-4,ax.Y(50)+16,{s:12,c:PAL['muted'],a:'right'});
   const fv=fin(sim).seg;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(q.bias),ax.Y(fv),6,0,7);ctx.fill();txt(ctx,'This town',ax.X(q.bias)+10,ax.Y(fv)+16,{s:12,w:700,c:PAL['rj']});
   if(G&&G.g){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(q.bias),ax.Y(clamp(G.g.guess,40,100)),6,0,7);ctx.fill();txt(ctx,'Your gut',ax.X(q.bias)+10,ax.Y(clamp(G.g.guess,40,100))-8,{s:12,w:700,c:PAL['s4']});}
   return;}
  const run=RUN(sim),ri=rIdx(sim),xmax=Math.max(10,Math.ceil(run.R/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax,ymin:0,ymax:100,xl:'Round',yl:'Same-type neighbors (%)'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(50));ctx.lineTo(ax.X(xmax),ax.Y(50));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Random mix: about 50%',ax.X(xmax)-4,ax.Y(50)+16,{s:12,c:PAL['muted'],a:'right'});
  if(G&&G.g){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(G.g.guess));ctx.lineTo(ax.X(xmax),ax.Y(G.g.guess));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut: '+f0(G.g.guess)+'%',ax.X(0)+6,ax.Y(G.g.guess)+(G.g.guess>85?16:-6),{s:12,w:700,c:PAL['s4']});}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=ri;i++){const x=ax.X(i),y=ax.Y(run.st[i].seg);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.fillStyle=PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(ri),ax.Y(run.st[ri].seg),5,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k){const run=RUN(sim),ri=rIdx(sim),g=run.grids[ri],q=P(sim),lo=q.bias/100,hi=q.hi/100,s=run.st[ri],G=GS(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the town */
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,GX-6,GY-6,N*CS+12,N*CS+12,10);ctx.fill();
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;for(let i=0;i<=N;i++){ctx.beginPath();ctx.moveTo(GX+i*CS,GY);ctx.lineTo(GX+i*CS,GY+N*CS);ctx.stroke();ctx.beginPath();ctx.moveTo(GX,GY+i*CS);ctx.lineTo(GX+N*CS,GY+i*CS);ctx.stroke();}ctx.globalAlpha=1;
  const C1=PAL['s6'],C2=PAL['s5'],UN=PAL['s1'];
  for(let i=0;i<CELLS;i++){const t=g[i];if(!t)continue;const x=GX+(i%N)*CS+CS/2,y=GY+((i/N)|0)*CS+CS/2;shape(ctx,t,x,y,CS*0.8,t===1?C1:C2);
   if(isUnhappy(g,i,lo,hi)){ctx.strokeStyle=UN;ctx.lineWidth=2.2;rr(ctx,x-CS/2+1.5,y-CS/2+1.5,CS-3,CS-3,4);ctx.stroke();}}
  /* the panel */
  const X0=452,W=330;let y=GY+14*k;
  const title=ri===0?(q.start==='split'?'The separated town':(big?'Round 0: mixed':'Round 0: mixed at random')):(atEnd(sim)?(run.settled?(big?`Round ${ri}: settled`:`Round ${ri}: everyone content`):(big?`Round ${ri}: moving`:`Round ${ri}: still moving`)):`Round ${ri}`);
  txt(ctx,title,X0,y,{s:15*k,w:700});y+=24*k;
  if(big&&q.hi<100){txt(ctx,`Unhappy under ${q.bias}% alike`,X0,y,{s:12*k,c:PAL['cv-soft']});y+=20*k;txt(ctx,`or over ${q.hi}% alike`,X0,y,{s:12*k,c:PAL['cv-soft']});}
  else txt(ctx,ruleTxt(q),X0,y,{s:12*k,c:PAL['cv-soft']});y+=26*k;
  /* legend */
  shape(ctx,1,X0+8*k,y-4*k,14*k,C1);txt(ctx,'Triangle',X0+20*k,y,{s:12*k});shape(ctx,2,X0+(big?112:100)*k,y-4*k,14*k,C2);txt(ctx,'Square',X0+(big?124:112)*k,y,{s:12*k});
  if(!big){ctx.strokeStyle=UN;ctx.lineWidth=2.2;rr(ctx,X0+190,y-13,16,16,4);ctx.stroke();txt(ctx,'Unhappy',X0+212,y,{s:12*k});}
  y+=big?22*k:26*k;if(big){ctx.strokeStyle=UN;ctx.lineWidth=2.2;rr(ctx,X0+1,y-13*k,14*k,14*k,4);ctx.stroke();txt(ctx,'Unhappy: will move',X0+20*k,y,{s:12*k});y+=26*k;}
  /* same-type bar */
  txt(ctx,'Same-type neighbors',X0,y,{s:13*k,w:700});txt(ctx,f0(s.seg)+'%',X0+W,y,{s:13*k,w:700,a:'right'});y+=8*k;
  const bh=16*k;bar(ctx,X0,y,W,bh,s.seg,PAL['rj'],k);
  const tick=(v,col,lab,below)=>{const tx=X0+W*clamp(v,0,100)/100;ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(tx,y-4);ctx.lineTo(tx,y+bh+4);ctx.stroke();if(lab)txt(ctx,lab,clamp(tx,X0+30*k,X0+W-30*k),below?y+bh+16*k:y-6,{s:12*k,w:700,c:col,a:'center'});};
  tick(50,PAL['cv-soft'],'mixed',true);
  if(G&&G.g)tick(G.g.guess,PAL['s4'],null);
  y+=bh+(big?32:30)*k;
  if(G&&G.g){txt(ctx,'Your gut: '+f0(G.g.guess)+'%',X0,y,{s:12*k,w:700,c:PAL['s4']});y+=22*k;}
  /* unhappy bar */
  txt(ctx,'Unhappy shapes',X0,y,{s:13*k,w:700});txt(ctx,f0(s.unh)+'%',X0+W,y,{s:13*k,w:700,a:'right'});y+=8*k;bar(ctx,X0,y,W,bh*0.8,s.unh,UN,k);y+=bh*0.8+26*k;
  if(atLeast('honors')&&y<430){txt(ctx,big?'No unlike neighbor: '+f0(s.alike)+'%':'Shapes with no unlike neighbor: '+f0(s.alike)+'%',X0,y,{s:12*k,c:PAL['cv-soft']});y+=22*k;}
  if(y<436&&!big)txt(ctx,'Typical shape: '+of8(s.seg)+' neighbors alike',X0,y,{s:12*k,c:PAL['cv-soft']});},
 narrate(sim){const run=RUN(sim),ri=rIdx(sim),s=run.st[ri],q=P(sim),f=run.st[run.R];
  if(q.bias===0&&q.hi>=100&&q.start==='split')return `<b>Nobody is unhappy, so nobody moves.</b> The bias is gone, but the town stays at ${f0(s.seg)}% same-type neighbors. The lines outlast the preference that drew them.`;
  if(ri===0&&run.R===0)return `Nobody is unhappy under these rules, so nobody will move. The town stays at ${f0(s.seg)}% same-type neighbors.`;
  if(ri===0)return `The town starts at ${f0(s.seg)}% same-type neighbors. ${f0(s.unh)}% of shapes are unhappy under the rule: ${ruleTxt(q).toLowerCase()}. <b>Press Run the town and watch where they go.</b>`;
  if(!atEnd(sim))return `Round ${ri}: ${f0(s.unh)}% of shapes are still unhappy and moving to random empty lots. <b>Every move that makes one shape content can leave a neighbor outnumbered,</b> so the moves chain.`;
  if(q.hi<100&&s.seg<run.st[0].seg-3)return `The preference for variety pulled the town from ${f0(run.st[0].seg)}% back down to ${f0(s.seg)}% same-type neighbors. <b>A small wish to live near someone different undoes most of the lines.</b>`;
  if(s.seg>=65)return `The town settled at <b>${f0(s.seg)}% same-type neighbors</b>, though no shape asked for more than ${q.bias}%. <b>Mild choices, added up, drew strong lines.</b>`;
  return `The town settled at ${f0(f.seg)}% same-type neighbors. <b>With a bias this small, a few moves are enough</b> and the town stays fairly mixed.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Each shape is fine being outnumbered 2 to 1: it only wants at least 1 in 3 neighbors like it. Right now about half of each shape’s neighbors are like it. Drag the slider here to the share you think the town will settle at, then lock it in.',
   honors:'Bias 33%, no other rule. Drag the slider here to the segregation index you expect when the town settles, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-fin(sim).seg),guess:sim.p.guess,label:`${f0(sim.p.guess)}% same-type neighbors`};},
  solve(sim){const run=RUN(sim),f=run.st[run.R];sim.st.play=false;sim.st.r=run.R;sim.p.guess=f.seg;return {v:0,guess:f.seg,label:`${f0(f.seg)}% same-type neighbors, after ${run.R} round${run.R===1?'':'s'}`};},
  how:{bio:'The model applies the rule to every shape, moves the unhappy ones to random empty lots, and repeats until nobody is unhappy. It computes the share of same-type neighbors after every round.',
   ap:'Each round: find every shape whose same-type share is below the bias (or above the variety limit), shuffle them, and move each to a uniformly random empty lot. Repeat until no shape is unhappy or 150 rounds pass. The index is the mean, over shapes with at least one neighbor, of (same-type neighbors ÷ occupied neighbors).'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),f=fin(sim),q=P(sim);
   const tail=` And ${f0(f.alike)}% of shapes ended with <b>no neighbor of the other type at all</b>, though not one of them asked for that.`;
   if(off<4)return `Your gut was right on, within ${f0(off)} points. You already sense that small preferences add up. The typical shape ends with about <b>${of8(m.guess)} neighbors like it</b>, where the bias asked for ${q.bias}%.`+tail;
   return `Your gut was off by <b>${f0(off)} points</b>. You pictured the typical shape with about ${of8(g.guess)} neighbors like it; the town actually settles at about <b>${of8(m.guess)}</b>, with ${f0(m.guess)}% same-type neighbors.${g.guess<m.guess?' Most people guess low, because no single shape wants a separated town.':' The bias is mild, so the town stops sorting once most shapes are content.'}`+tail;},
  again(sim){sim.st.seed=((sim.st.seed||SEED)%997)+1;sim.p.guess=50;restart(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Before anyone moves, the shapes are placed at random, half triangles and half squares. About what share of a shape’s neighbors are like it?',choices:['About 50%','About 33%','About 75%'],correct:0,explain:'With equal numbers placed at random, each neighbor is about equally likely to be either type, so the town starts near 50%. In this town it starts at 50%.'},
  {lvl:'bio',instant:true,q:'Every shape is happy to be outnumbered 2 to 1. It only wants at least 1 in 3 neighbors like it. Where does the town settle?',choices:['Still about 50%: nobody asked for more','About 33%, the share they asked for','Well above half: about 3 in 4 neighbors alike'],correct:2,explain:'This town settles at 77% same-type neighbors after 9 rounds. A move that makes one shape content can leave someone else outnumbered, and the moves chain until the town is sorted far past what anyone wanted.'},
  {lvl:'honors',instant:true,q:'Start from the separated town. Keep the 33% bias, and add one more rule: a shape is also unhappy if every neighbor is like it (over 95%). What happens?',choices:['Nothing: once lines are drawn they stay','The town mixes back a long way, to about 60%','It separates even further'],correct:1,explain:'It falls from 77% to about 60%, and the share of shapes with no unlike neighbor drops from 33% to under 1%. A small, active preference for variety pulls the lines apart.'},
  {lvl:'honors',instant:true,q:'Start from the separated town and turn the bias down to 0%. Nobody minds who lives next door anymore. What happens to the town?',choices:['It mixes back to about 50%','It stays separated at 77%','It becomes even more separated'],correct:1,explain:'With no bias, no shape is unhappy, so no shape moves. The town stays at 77%. Removing a bias does not undo what it built: that takes an active choice, like the variety rule.'},
  {lvl:'ap',instant:true,q:'Raise the bias from 33% to 50% (start from a mixed town). Where does this town settle?',choices:['About the same, 77%','About 87%','100%: complete separation'],correct:1,explain:'At 50% this town settles at 87% after 17 rounds. The settled index climbs steeply with the bias, and every value sits well above the bias itself. Open the AP graph to see the whole curve.'},
  {lvl:'ap',instant:true,q:'A lender’s model never looks at shape. It only uses your address. In the separated town, is that model shape-blind?',choices:['Yes: it never sees shape','No: in a separated town, address carries most of the same information as shape, so it works as a proxy','Only if the lender means well'],correct:1,explain:'When about 3 in 4 of your neighbors share your type, your address predicts your type well. A model that uses address inherits the separation. Cathy O’Neil makes this point about zip codes in credit, insurance and policing models.'}
 ],
 tour:[
  {title:'A mixed town',text:'Triangles and squares, half and half, placed at random on 400 lots. Each shape looks at its 8 neighbors. Right now about 50% of a shape’s neighbors are like it.',pause:true,focus:[GX-8,GY-8,N*CS+16,N*CS+16],setup:sim=>{BioLab.setValues(sim,{bias:33,hi:100,start:'mixed',empty:10});sim.st.seed=SEED;restart(sim);}},
  {title:'A mild bias',text:'The rule: a shape is unhappy if fewer than 1 in 3 of its neighbors are like it. It is fine being outnumbered 2 to 1. Unhappy shapes have a red outline: 18% of them right now.',pause:true,focus:[440,20,350,130]},
  {title:'They move',text:'Each round, every unhappy shape moves to a random empty lot. Watch the red outlines, and watch the same-type bar on the right climb.',pause:false,speed:1,setup:sim=>{sim.st.r=0;sim.st.play=true;}},
  {title:'Where it settles',text:'After 9 rounds nobody is unhappy, and the town sits at 77% same-type neighbors. A third of the shapes (33%) have no neighbor of the other type at all. No shape wanted this. The pattern comes from the rules, not from any one choice.',pause:true,setup:sim=>{sim.st.play=false;sim.st.r=RUN(sim).R;}},
  {lvl:'honors',title:'Bias off, lines stay',text:'Start from that separated town and set the bias to 0%. Nobody is unhappy, so nobody moves. The town stays at 77%. Ending a bias does not undo what it built.',pause:true,setup:sim=>{BioLab.setValues(sim,{start:'split',bias:0,hi:100});restart(sim);}},
  {lvl:'honors',title:'A small wish for variety',text:'Now keep the 33% bias, but a shape is also unhappy if every one of its neighbors is like it. Watch the town mix back to about 60%.',pause:false,speed:1,setup:sim=>{BioLab.setValues(sim,{start:'split',bias:33,hi:95});restart(sim);sim.st.play=true;}},
  {title:'From a toy town to Denver',text:'Real lines were also drawn on purpose. In 1938 the federal Home Owners’ Loan Corporation graded Denver’s neighborhoods for mortgage lending, and the lowest grade was shaded red: redlining. Once neighborhoods are separated, a zip code tells a model a lot about who lives there. Cathy O’Neil warns that today’s credit, insurance and policing models can inherit those lines through it.',pause:true,setup:sim=>{BioLab.setValues(sim,{start:'mixed',bias:33,hi:100});sim.st.play=false;sim.st.r=RUN(sim).R;}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the bias change where the town settles?</p><ol><li>Set the bias to 0%, 10%, 20%, 33%, 40% and 50%. Each time, press <b>Skip to the end</b> and record a trial.</li><li>Graph <b>Trials</b> with the bias on x and same-type neighbors on y.</li></ol><p>Write one sentence: is the settled town ever as mild as the bias that built it?</p>',
  honors:'<p><b>Question:</b> What does it take to undo a separated town?</p><ol><li>Start from <b>The separated town</b>. Set the bias to 0% and skip to the end. Record a trial.</li><li>Keep the bias at 33% and set the variety limit to 95%, 85% and 75%. Record each.</li></ol><p>Write two sentences: what is the difference between removing a bias and adding a preference for variety? This is a discussion question with no single right answer: where do you see that difference at RJ?</p>',
  ap:'<p><b>Question:</b> Is there a tipping point in the bias?</p><ol><li>Open the graph <b>Where the town settles, for every bias</b>.</li><li>Use <b>New random town</b> three times and note how the curve moves. Record the settled index at 25%, 33% and 40% for each town.</li><li>Raise the empty lots to 30% and repeat.</li></ol><p><b>CER:</b> Claim where the index jumps fastest, give your evidence, and reason from the rule about why a shape that just moved can make its new neighbors unhappy.</p>'},
 terms:[
  {t:'Bias (threshold)',d:'The share of same-type neighbors below which a shape is unhappy and moves. 33% means at least 1 in 3.'},
  {t:'Segregation index',d:'Here, the average share of a shape’s neighbors that are its own type. About 50% means mixed at random; 100% means fully separated.'},
  {t:'Emergent pattern',d:'A pattern of the whole group that no single member chose or wanted.'},
  {t:'Redlining',d:'Grading neighborhoods for lending and marking the lowest grade in red, as the federal Home Owners’ Loan Corporation did in 1938 in Denver and other cities.'},
  {t:'Proxy',d:'A stand-in variable that carries the same information as one a model is not supposed to use, like a zip code standing in for race.',lvl:'honors'},
  {t:'Agent-based model',d:'A simulation that gives each individual simple rules and watches what the group does.',lvl:'honors'},
  {t:'Path dependence',d:'When where a system ends up depends on where it started, not only on the current rules. The separated town stays separated at 0% bias.',lvl:'ap'}
 ],
 about:'<p><b>Credits.</b> This is an original adaptation of the segregation model Thomas Schelling published in 1971, inspired by <a href="https://en.wikipedia.org/wiki/Parable_of_the_Polygons" target="_blank" rel="noopener">“Parable of the Polygons”</a> by Vi Hart and Nicky Case (2014), which they released into the public domain (CC0). The code and drawings here are new.</p>'+
  '<p><b>Rules.</b> 400 lots in a 20 × 20 grid, about 10% empty, with equal numbers of triangles and squares placed at random. A shape looks at its 8 neighbor lots (fewer on an edge). It is unhappy if the share of its occupied neighbor lots holding its own type is below the bias, or above the variety limit when that is under 100%. A shape with no neighbors is content. Each round, every unhappy shape moves, in a shuffled order, to a random empty lot. The town stops when nobody is unhappy or after 150 rounds. Each town uses a fixed random seed, so the same settings always give the same result; <b>New random town</b> changes the seed. “The separated town” is where the 33% bias leaves a mixed town.</p>'+
  '<p><b>What it shows and what it does not.</b> The model shows that strong separation can come out of mild individual preferences. It does not show that real segregation came from mild preferences. In real cities, laws and lending rules also drew lines on purpose. In 1938 the federal Home Owners’ Loan Corporation (HOLC) graded Denver neighborhoods for mortgage lending. The Denver Public Library holds a copy of the map, and <a href="https://dsl.richmond.edu/panorama/redlining/#loc=12/39.71/-105.084&city=denver-co" target="_blank" rel="noopener">Mapping Inequality</a> (University of Richmond) hosts it online. In <i>Weapons of Math Destruction</i>, Cathy O’Neil argues that once neighborhoods are separated, a zip code becomes a proxy that credit, insurance and policing models inherit.</p>'+
  '<p><b>Catholic social teaching.</b> In 2018 the U.S. Catholic bishops issued <i>Open Wide Our Hearts: The Enduring Call to Love</i>, a pastoral letter against racism. Solidarity asks us to look past our own small choices to the patterns they make together.</p>'
};
BioLab.register(SIM);
})();
