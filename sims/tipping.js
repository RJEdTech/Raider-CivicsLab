(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Mark Granovetter's threshold model of collective behavior (1978).
   100 people. Person i joins once at least th[i] OTHER people have joined. Round 1: everyone with threshold 0 joins.
   Each later round, everyone whose threshold is at most the number already joined joins: J(t+1) = F(J(t)), where F(x) = #people with threshold <= x.
   The crowd stops where F(J) = J: where the cumulative curve meets the 45-degree line. No randomness: every crowd is fully determined. */
const NP=100,CW=40,GX=30,GY=28;
/* inverse of the standard normal CDF (Acklam's rational approximation, accurate to about 1e-9) */
function ninv(p){const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
 const pl=0.02425;let q,r;if(p<pl){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 q=p-0.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}
const crowdOf=sim=>{const c=sim.p.crowd;return c==='bell'&&!atLeast('honors')?'gap':c;};
const Q=sim=>({crowd:crowdOf(sim),k:sim.p.starters,mu:sim.p.mu,sd:sim.p.sd});
function thresholds(q){let t=[];
 if(q.crowd==='bell'){for(let i=0;i<NP;i++)t.push(Math.max(0,Math.round(q.mu+q.sd*ninv((i+0.5)/NP))));}
 else{for(let i=0;i<NP;i++)t.push(i);if(q.crowd==='gap')t[1]=2;}
 t.sort((a,b)=>a-b);
 /* first movers: the k people who needed the most convincing decide to go first */
 for(let j=0;j<q.k;j++)t[NP-1-j]=0;
 return t.sort((a,b)=>a-b);}
const cache=new Map();
function model(q){const key=[q.crowd,q.k,q.mu,q.sd].join('|');if(cache.has(key))return cache.get(key);
 const th=thresholds(q),F=x=>{let n=0;for(const v of th)if(v<=x)n++;return n;};
 const hist=[0];let J=0;while(true){const n=F(J);if(n===J)break;J=n;hist.push(J);}
 const mean=th.reduce((a,b)=>a+b,0)/NP,sd=Math.sqrt(th.reduce((a,b)=>a+(b-mean)*(b-mean),0)/NP);
 const out={th,F,hist,R:hist.length-1,J,mean,sd};if(cache.size>200)cache.clear();cache.set(key,out);return out;}
const M=sim=>model(Q(sim));
/* While the student traces the chain ("Your turn"), the crowd stays at round 0 so the picture does not give the count away. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const rIdx=sim=>pend(sim)?0:clamp(Math.floor((sim.st&&sim.st.r)||0),0,M(sim).R);
const joinedNow=sim=>M(sim).hist[rIdx(sim)];
const atEnd=sim=>rIdx(sim)>=M(sim).R;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const revealed=sim=>atEnd(sim)&&(M(sim).R>0)||!!(GS(sim)&&GS(sim).m);
const nextNeed=sim=>{const m=M(sim),j=joinedNow(sim);return j>=NP?null:m.th[j];};
const plural=(n,a,b)=>n===1?a:b;
function restart(sim){if(sim.st){sim.st.r=0;sim.st.play=false;}}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const onCrowd=sim=>{restart(sim);clearGut(sim);};
const oneMore=sim=>model(Object.assign({},Q(sim),{k:sim.p.starters+1})).J;
/* the chain as a short sequence: 0 → 1 → 2 → … → 100 */
const chainSeq=sim=>{const h=M(sim).hist;return h.length<=6?h.join(' → '):h.slice(0,4).join(' → ')+' → … → '+h[h.length-1];};
function traceSteps(sim){const m=M(sim),h=m.hist,R=m.R,out=[],z=m.th.filter(v=>v===0).length;
 if(R===0)return ['Nobody has a threshold of 0, so nobody goes first. <b>0</b> sign up.'];
 out.push(`Round 1: ${z} ${plural(z,'person needs','people need')} nobody, so ${h[1]} ${plural(h[1],'signs','sign')} up.`);
 const show=R<=5?R:3;for(let t=2;t<=show;t++)out.push(`Round ${t}: ${h[t-1]} ${plural(h[t-1],'has','have')} joined, so everyone who needs ${h[t-1]} or fewer is in: ${h[t]}.`);
 if(R>show)out.push(`Each round meets the next thresholds the same way, up to round ${R}: ${h[R]}.`);
 const J=m.J;out.push(J>=NP?`Nobody is left waiting: <b>${J}</b> sign up.`:`Now ${J} ${plural(J,'has','have')} joined, but the next person needs ${m.th[J]}. ${J} < ${m.th[J]}, so the chain stops at <b>${J}</b>.`);
 return out;}
const CROWD_TXT={ladder:'Thresholds 0, 1, 2 … 99',gap:'Thresholds 0, 2, 2, 3 … 99',bell:'Bell-shaped thresholds'};

/* the cumulative curve, the 45-degree line and the staircase, in a box */
function cdfPlot(ctx,sim,ax,k,small){const m=M(sim),ri=rIdx(sim);
 ctx.strokeStyle=PAL['s2'];ctx.lineWidth=small?2:2.5;ctx.beginPath();let prev=m.F(0);ctx.moveTo(ax.X(0),ax.Y(prev));
 for(let x=1;x<=100;x++){const v=m.F(x);ctx.lineTo(ax.X(x),ax.Y(prev));ctx.lineTo(ax.X(x),ax.Y(v));prev=v;}ctx.stroke();
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(100),ax.Y(100));ctx.stroke();ctx.setLineDash([]);
 /* staircase: from (J, J) up to (J, F(J)) then across to (F(J), F(J)) */
 ctx.strokeStyle=PAL['s3'];ctx.lineWidth=small?2:2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));
 for(let i=0;i<ri;i++){const a=m.hist[i],b=m.hist[i+1];ctx.lineTo(ax.X(a),ax.Y(b));ctx.lineTo(ax.X(b),ax.Y(b));}ctx.stroke();
 const j=m.hist[ri];ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(j),ax.Y(j),small?4:5,0,7);ctx.fill();
 if(atEnd(sim)){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(ax.X(m.J),ax.Y(m.J),small?7:9,0,7);ctx.stroke();}}

const SIM={
 id:'tipping',hash:'tipping',apUnit:1,order:2,tab:'Tipping point',kind:'Simulation',
 skills:{bio:'Iterating a rule: counting a chain round by round · Algebra 1 (Unit 3: functions), US Government (Unit 3)',honors:'Cumulative counts F(x) and where F(x) = x · Statistics (Chapter 1), Precalculus (Unit 1: composition)',ap:'Iteration to a fixed point, and normal quantiles · Precalculus (Unit 1), AP Statistics (Unit 1)'},
 card:'Guess how many of 100 classmates sign up for a service drive, then watch one person’s choice start, or stop, a chain.',
 title:'Tipping point',
 lede:{bio:'Most people join something once enough others have. Each person here has a threshold: how many others must sign up before they will. Change one person’s threshold, or add one person willing to go first, and the whole crowd can flip.',
  honors:'Mark Granovetter’s 1978 threshold model: the crowd’s outcome depends on the whole distribution of thresholds, not its average. Plot how many people would join at each count, F(x), and the crowd stops where that curve first meets the line y = x.',
  ap:'The cascade is the iteration J(t+1) = F(J(t)) from J = 0, where F is the cumulative count of thresholds. It stops at the smallest fixed point F(J) = J. For bell-shaped thresholds, a small change in the spread can move that fixed point from a handful of people to everyone.'},
 scale:'100 classmates deciding whether to sign up. Each circle is one person; the number on it is how many others must sign up first. Sorted from lowest threshold to highest.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'The crowd',
 controls:[
  {id:'guess',label:'Your gut: how many of the 100 sign up',type:'range',min:0,max:100,step:1,def:50,unit:' people'},
  {id:'crowd',label:'The crowd',type:'seg',def:'gap',noGut:true,onChange:onCrowd,options:[{v:'ladder',l:'Everyone different: 0, 1, 2 … 99'},{v:'gap',l:'One person moves from 1 to 2'},{v:'bell',l:'Bell curve',lvl:'honors'}],help:'In the second crowd, the person who needed 1 other now needs 2. Nobody else changes.'},
  {id:'starters',label:'First movers: people who sign up no matter what',type:'range',min:0,max:5,step:1,def:0,unit:'',noGut:true,onChange:onCrowd,help:'Each first mover is someone who would have needed the most convincing, deciding to go first instead.'},
  {id:'mu',label:'Bell curve: average threshold',type:'range',min:5,max:50,step:1,def:25,unit:' people',lvl:'honors',noGut:true,onChange:onCrowd,help:'Only used by the Bell curve crowd.'},
  {id:'sd',label:'Bell curve: spread (standard deviation)',type:'range',min:0,max:30,step:0.5,def:10,unit:' people',lvl:'honors',noGut:true,onChange:onCrowd,help:'Only used by the Bell curve crowd. Thresholds are rounded to whole people; none goes below 0.'}
 ],
 actions:[
  {id:'run',label:'Run it',primary:true,run(sim){if(atEnd(sim))sim.st.r=0;sim.st.play=true;}},
  {id:'round',label:'One round',run(sim){sim.st.play=false;sim.st.r=Math.min(M(sim).R,rIdx(sim)+1);}},
  {id:'end',label:'Skip to the end',run(sim){sim.st.play=false;sim.st.r=M(sim).R;}}
 ],
 init(){return {r:0,play:false};},
 step(sim,dt){const s=sim.st;if(!s.play||pend(sim))return;const R=M(sim).R;s.r+=dt*Math.max(2,R/8);if(s.r>=R){s.r=R;s.play=false;}},
 metrics:[
  {id:'joined',label:'Signed up so far',unit:'of 100',d:0,min:0,max:100,get:joinedNow},
  {id:'round',label:'Rounds',unit:'',d:0,min:0,max:null,get:rIdx},
  {id:'next',label:'Next person in line needs',unit:'others',d:0,min:0,max:100,get:nextNeed},
  {id:'avg',label:'Average threshold',unit:'people',d:2,lvl:'honors',min:0,max:100,get:sim=>M(sim).mean},
  {id:'eq',label:'Where F(x) first meets y = x',unit:'people',d:0,lvl:'honors',min:0,max:100,get:sim=>revealed(sim)?M(sim).J:null},
  {id:'spread',label:'Spread of the thresholds (SD)',unit:'people',d:1,lvl:'ap',min:0,max:50,get:sim=>M(sim).sd}
 ],
 graphs:[{id:'time',label:'Signed up, round by round',custom:true},{id:'cdf',label:'F(x): who would sign up once x have',lvl:'honors',custom:true}],defaultGraph:'time',
 plot(sim,ctx,box,id){const m=M(sim),G=GS(sim);
  if(id==='cdf'){const ax=axes(ctx,box,{xmin:0,xmax:100,ymin:0,ymax:100,xl:'x: people already signed up',yl:'F(x): people willing at x'});cdfPlot(ctx,sim,ax,1,false);
   legend(ctx,ax.X(55),ax.Y(30),[{label:'F(x)',color:PAL['s2']},{label:'y = x',color:PAL['cv-ink'],dash:true}]);legend(ctx,ax.X(55),ax.Y(15),[{label:'The cascade',color:PAL['s3']}]);return;}
  const ri=rIdx(sim),xmax=Math.max(10,Math.ceil(m.R/10)*10);const ax=axes(ctx,box,{xmin:0,xmax,ymin:0,ymax:100,xl:'Round',yl:'Signed up (of 100)'});
  if(G&&G.g){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(G.g.guess));ctx.lineTo(ax.X(xmax),ax.Y(G.g.guess));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut: '+Math.round(G.g.guess),ax.X(xmax)-6,ax.Y(G.g.guess)+(G.g.guess>85?16:-6),{s:12,w:700,c:PAL['s4'],a:'right'});}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=ri;i++){const x=ax.X(i),y=ax.Y(m.hist[i]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.fillStyle=PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(ri),ax.Y(m.hist[ri]),5,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k){const m=M(sim),ri=rIdx(sim),J=m.hist[ri],Jp=ri>0?m.hist[ri-1]:0,big=k>1.3,G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,GX-8,GY-8,10*CW+16,10*CW+16,10);ctx.fill();
  const ON=PAL['s3'];
  for(let i=0;i<NP;i++){const x=GX+(i%10)*CW+CW/2,y=GY+Math.floor(i/10)*CW+CW/2,joined=i<J,isNew=joined&&i>=Jp&&ri>0,first=m.th[i]===0;
   ctx.beginPath();ctx.arc(x,y,16,0,7);ctx.fillStyle=joined?ON:PAL['card'];ctx.fill();ctx.lineWidth=joined?0:1.5;if(!joined){ctx.strokeStyle=first?PAL['s4']:PAL['line'];ctx.lineWidth=first?2.5:1.5;ctx.stroke();}
   if(isNew){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,19,0,7);ctx.stroke();}
   txt(ctx,String(m.th[i]),x,y+1,{s:(m.th[i]>=100?11:13)*Math.min(k,1.5),w:700,c:joined?'#fff':PAL['cv-ink'],a:'center',b:'middle'});}
  /* the panel */
  const X0=462,W=318;let y=GY+14*k;
  const ttl=ri===0?(big?'Before anyone joins':'Before anyone signs up'):(atEnd(sim)?(J>=NP?(big?`Round ${ri}: all in`:`Round ${ri}: everyone is in`):(big?`Round ${ri}: stuck`:`Round ${ri}: the chain stops`)):`Round ${ri}`);
  txt(ctx,ttl,X0,y,{s:15*k,w:700});y+=22*k;
  const fm=sim.p.starters?`${sim.p.starters} first mover${sim.p.starters>1?'s':''}`:'';
  if(big){txt(ctx,CROWD_TXT[Q(sim).crowd],X0,y,{s:12*k,c:PAL['cv-soft']});if(fm){y+=20*k;txt(ctx,'+ '+fm,X0,y,{s:12*k,c:PAL['cv-soft']});}}
  else txt(ctx,CROWD_TXT[Q(sim).crowd]+(fm?' + '+fm:''),X0,y,{s:12*k,c:PAL['cv-soft']});
  y+=26*k;
  txt(ctx,'Signed up',X0,y,{s:13*k,w:700});txt(ctx,J+' of 100',X0+W,y,{s:13*k,w:700,a:'right'});y+=8*k;
  const bh=16*k;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,X0,y,W,bh,4);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,X0,y,W,bh,4);ctx.stroke();
  if(J>0){ctx.fillStyle=ON;rr(ctx,X0,y,Math.max(4,W*J/NP),bh,4);ctx.fill();}
  if(G&&G.g){const gx=X0+W*G.g.guess/NP;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,y-4);ctx.lineTo(gx,y+bh+4);ctx.stroke();txt(ctx,'Your gut: '+Math.round(G.g.guess),clamp(gx,X0+44*k,X0+W-44*k),y+bh+16*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  y+=bh+(G&&G.g?36:26)*k;
  const nn=nextNeed(sim),z=m.th.filter(v=>v===0).length;
  if(J>=NP)txt(ctx,'Nobody is left waiting.',X0,y,{s:12*k,c:PAL['cv-ink']});
  else if(ri===0){txt(ctx,z?(big?`${z} will go first.`:`${z} ${plural(z,'person needs','people need')} nobody: they go first.`):'Nobody will go first.',X0,y,{s:12*k,c:PAL['cv-ink']});}
  else{txt(ctx,big?`Next needs ${nn}.`:`Next in line needs ${nn} other${nn===1?'':'s'}.`,X0,y,{s:12*k,c:PAL['cv-ink']});y+=20*k;
   const go=nn<=J;txt(ctx,big?(go?`${J} in: it goes on.`:`Only ${J} in: stuck.`):(go?`${J} ${plural(J,'has','have')} signed up: the chain goes on.`:`Only ${J} ${plural(J,'has','have')} signed up: the chain stops.`),X0,y,{s:12*k,w:go?400:700,c:go?PAL['cv-ink']:PAL['s1']});}
  y+=22*k;
  /* the cumulative curve, at Closer look */
  if(atLeast('honors')&&!big){const bx={L:X0+34,T:y+4,W:W-44,H:Math.max(60,440-y-30)};
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(bx.L,bx.T,bx.W,bx.H);
   const ax={X:x=>bx.L+x/100*bx.W,Y:v=>bx.T+bx.H-v/100*bx.H};cdfPlot(ctx,sim,ax,k,true);
   txt(ctx,'0',bx.L-6,bx.T+bx.H,{s:12,c:PAL['cv-soft'],a:'right',b:'middle'});txt(ctx,'100',bx.L-6,bx.T+6,{s:12,c:PAL['cv-soft'],a:'right',b:'middle'});
   txt(ctx,'F(x)',bx.L+8,bx.T+16,{s:12,w:700,c:PAL['s2']});txt(ctx,'y = x',bx.L+bx.W-6,ax.Y(60),{s:12,c:PAL['cv-soft'],a:'right'});
   txt(ctx,'x = people signed up',bx.L+bx.W/2,bx.T+bx.H+16,{s:12,c:PAL['cv-soft'],a:'center'});}
  else if(!big){txt(ctx,'Green: signed up.',X0,y,{s:12*k,c:PAL['cv-soft']});y+=20*k;txt(ctx,'Gold ring: just joined this round.',X0,y,{s:12*k,c:PAL['cv-soft']});
   if(G&&G.m&&atEnd(sim)){y+=30*k;txt(ctx,'The chain: '+chainSeq(sim),X0,y,{s:13*k,w:700,c:PAL['rj']});
    if(m.J<NP){y+=20*k;txt(ctx,`Stops: ${m.J} in, next needs ${m.th[m.J]}`,X0,y,{s:12*k,c:PAL['cv-ink']});}}}
  if(pend(sim)&&!big&&!atLeast('honors')){txt(ctx,'Your turn: trace the chain',X0,y+30*k,{s:13*k,w:700,c:PAL['rj']});}},
 narrate(sim){const m=M(sim),ri=rIdx(sim),J=m.hist[ri],nn=nextNeed(sim),q=Q(sim);
  if(ri===0&&pend(sim))return `<b>Your turn:</b> trace the chain from the numbers on the circles. Who signs up in round 1? Round 2? Where does it stop?`;
  if(ri===0){const z=m.th.filter(v=>v===0).length;return z?`${z} ${plural(z,'person signs','people sign')} up no matter what. <b>Everyone else waits for enough others.</b> Press Run it to see how far the chain goes.`:`<b>Nobody has a threshold of 0, so nobody goes first</b>, and nobody will ever sign up.`;}
  if(!atEnd(sim))return `Round ${ri}: ${J} signed up. The next person needs ${nn}, and ${J} ${plural(J,'has','have')} joined, so the chain keeps going. <b>Each new sign-up is exactly what the next person was waiting for.</b>`;
  if(J>=NP)return `<b>All 100 signed up</b>, in ${ri} round${ri===1?'':'s'}. ${sim.p.starters&&q.crowd!=='ladder'?'The extra first mover filled the gap the chain needed.':'Every person’s threshold was met by the people before them.'}`;
  return `<b>The chain stops at ${J}.</b> The next person needs ${nn} others and only ${J} ${plural(J,'has','have')} joined. ${J<=5?`Add one first mover and ${oneMore(sim)} sign up.`:''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the circles: one person needs nobody, then 2, 2, 3, 4 and so on up to 99. Drag the slider here to how many of the 100 you think end up signing up, then lock it in.',
   honors:'Before you run it: drag the slider here to where you think this crowd stops, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-M(sim).J),guess:sim.p.guess,label:`${Math.round(sim.p.guess)} of 100 sign up`};},
  solve(sim){const m=M(sim);sim.st.play=false;sim.st.r=m.R;sim.p.guess=m.J;return {v:0,guess:m.J,label:`${m.J} of 100 sign up`};},
  hint:{bio:'Lock in your gut answer. Then you will trace the chain yourself, round by round, from the numbers on the circles.'},
  calc:{unit:'of 100',d:0,tol:0,
   prompt:{bio:sim=>{const t=M(sim).th;return `Trace the chain. The circles hold the thresholds in order: <b>${t.slice(0,6).join(', ')} … ${t[NP-1]}</b>. Round 1: everyone who needs 0 signs up. Each next round: everyone whose number is at most the count so far signs up. Keep going until a round adds nobody. How many of the 100 sign up?`;},
    honors:sim=>{const t=M(sim).th;return `Iterate x → F(x) from x = 0, where F(x) counts thresholds at most x. The thresholds, in order, are on the circles: <b>${t.slice(0,8).join(', ')} …</b>. Where does the chain stop?`;}},
   answer:sim=>M(sim).J,
   hint:'Count the people who need 0. Then find who needs that many or fewer. Stop when nobody new can join.',
   steps:traceSteps},
  formula(sim){const m=M(sim);return `J → F(J), starting at 0: ${chainSeq(sim)}. `+(m.J>=NP?'All 100 are in.':`It stops because F(${m.J}) = ${m.J}: the next person needs ${m.th[m.J]}.`);},
  how:{bio:'The model runs the chain: first everyone who needs nobody signs up. Then everyone whose number is met by that count, and so on, until the next person needs more than have joined.',
   honors:'Count F(x), the people willing once x have joined. Start at x = 0 and step: x becomes F(x). The crowd stops at the first x where F(x) = x.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),one=oneMore(sim);
   const pos=m.guess<NP&&one>m.guess?` Add one first mover and ${one} sign up.`:'';
   if(off<3)return `Your gut was right on, within ${Math.round(off)} ${plural(Math.round(off),'person','people')}. You saw that the chain needs every link.`+pos;
   return `Your gut said ${Math.round(g.guess)}; the chain gives <b>${m.guess}</b>. That is a difference of <b>${Math.round(off)} people</b> at the drive. ${m.guess<g.guess?'The chain needed someone ready at each step, and one gap stopped it.':'One link after another, the people before them met each threshold.'}`+pos;},
  again(sim){const r=Math.random();if(r<0.4){sim.p.crowd='ladder';sim.p.starters=0;}else if(r<0.7){sim.p.crowd='gap';sim.p.starters=Math.random()<0.5?1:0;}else if(atLeast('honors')){sim.p.crowd='bell';sim.p.mu=25;sim.p.sd=[8,10,12,12.5,15,20][Math.floor(Math.random()*6)];sim.p.starters=0;}else{sim.p.crowd='gap';sim.p.starters=0;}sim.p.guess=50;restart(sim);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A club of 10 has thresholds 0, 1, 1, 2, 5, 5, 6, 7, 8, 9. Trace the chain round by round. How many sign up?',answer:4,tol:0,unit:'people',d:0,hint:'Round 1: who needs 0? Round 2: who needs 1 or fewer? Keep going until a round adds nobody.',explain:'Round 1: 1 signs up. Round 2: everyone who needs 1 or fewer: 3. Round 3: everyone who needs 3 or fewer: 4 (0, 1, 1, 2). Round 4: still 4, because the next person needs 5. The chain stops at 4.'},
  {lvl:'bio',instant:true,q:'Thresholds 0, 1, 2, 3 … 99: one person needs nobody, one needs 1 other, one needs 2, and so on. How many sign up?',choices:['Just 1','About half','All 100'],correct:2,explain:'The person who needs nobody signs up. That is the 1 the next person needed, then 2 have joined, which is what the third person needed. Every link holds, so all 100 sign up, one per round.'},
  {lvl:'bio',instant:true,q:'Same crowd, except the person who needed 1 other now needs 2. Thresholds: 0, 2, 2, 3 … 99. How many sign up?',choices:['99','About 50','Just 1'],correct:2,explain:'Only the first person signs up. Now 1 has joined, and nobody else has a threshold of 1. The chain stops at 1, even though this crowd is almost identical to the last one.'},
  {lvl:'bio',instant:true,q:'In that stuck crowd, one more person decides to sign up no matter what. How many sign up now?',choices:['2','About 50','All 100'],correct:2,explain:'With two first movers, 2 have joined: that meets both people who need 2. Then 4 have joined, and the chain climbs two at a time to all 100, in 50 rounds.'},
  {lvl:'honors',instant:true,q:'The first crowd’s average threshold is 49.50. The stuck crowd’s average is 49.51. What does that tell you?',choices:['The two crowds should act almost the same','The average cannot predict the outcome: 100 sign up in one and 1 in the other','The stuck crowd is more willing'],correct:1,explain:'Averages hide the order that matters. A cascade needs someone at every step, so one missing link can stop it. That is Granovetter’s point: you cannot read a crowd’s behavior off its average member.'},
  {lvl:'honors',instant:true,q:'On the graph of F(x) against x, where does the chain stop?',choices:['Where F(x) is highest','At the first point where F(x) meets the line y = x','Where F(x) crosses 50'],correct:1,explain:'Each round moves x to F(x). While F(x) is above the line, more people are willing than have joined, so the count grows. At the first point where F(x) = x, the next round adds nobody.'},
  {lvl:'ap',instant:true,q:'Bell-shaped thresholds with an average of 25 people. At a spread of 12, only 4 sign up. What happens at a spread of 12.5?',choices:['About 4 again','About 10','All 100'],correct:2,explain:'A wider spread puts a few more people at very low thresholds. At 12.5 they are enough to reach the next person at every step, and the chain runs to all 100 in 13 rounds. Between 12 and 12.5 the outcome flips.'},
  {lvl:'ap',instant:true,q:'Bell curve, average 25, spread 10: only 1 person signs up. A campaign lowers everyone’s threshold by the same amount. How far must the average drop before all 100 sign up?',choices:['1 person, to 24','4 people, to 21','15 people, to 10'],correct:1,explain:'At an average of 24, 1 signs up; at 22, 3 do. At 21, all 100 sign up in 11 rounds. Lowering thresholds raises F(x), but the crowd only tips once F(x) stays above y = x at every step from 0.'}
 ],
 tour:[
  {title:'100 classmates',text:'Your class of 100 is deciding whether to sign up for a service drive. Each circle is one person. The number is how many others must sign up before they will. They are sorted from lowest to highest.',pause:true,focus:[GX-10,GY-10,10*CW+20,10*CW+20],setup:sim=>{BioLab.setValues(sim,{crowd:'ladder',starters:0,mu:25,sd:10});restart(sim);}},
  {title:'Someone goes first',text:'One person needs nobody. In round 1 they sign up. Now 1 has joined: exactly what the person marked 1 was waiting for.',pause:true,setup:sim=>{sim.st.play=false;sim.st.r=1;}},
  {title:'The chain',text:'Each new sign-up is the one the next person needed. Watch the count climb one per round.',pause:false,speed:1,setup:sim=>{sim.st.r=1;sim.st.play=true;}},
  {title:'Everyone is in',text:'All 100 signed up, one per round. Every link in the chain held.',pause:true,setup:sim=>{sim.st.play=false;sim.st.r=M(sim).R;}},
  {title:'Change one person',text:'Now the person who needed 1 other needs 2. Nobody else changes. The first person signs up, and then the chain stops: 1 has joined, and nobody is waiting for exactly 1.',pause:true,setup:sim=>{BioLab.setValues(sim,{crowd:'gap',starters:0});sim.st.r=M(sim).R;},focus:[GX-10,GY-10,10*CW+20,2*CW+20]},
  {title:'One more first mover',text:'Add one person willing to go first. Now 2 sign up at once, which meets both people who need 2, and the chain runs to all 100 in 50 rounds.',pause:false,speed:1,setup:sim=>{BioLab.setValues(sim,{crowd:'gap',starters:1});restart(sim);sim.st.play=true;}},
  {lvl:'honors',title:'The curve and the line',text:'The blue steps are F(x): how many people would sign up once x have. The dashed line is y = x. The green staircase is the chain. It climbs while F(x) is above the line and stops where they first meet.',pause:true,focus:[452,150,340,295],setup:sim=>{BioLab.setValues(sim,{crowd:'gap',starters:0});sim.st.r=M(sim).R;}},
  {lvl:'ap',title:'A bell-shaped crowd',text:'Thresholds now follow a bell curve with an average of 25. At a spread of 12, only 4 sign up. Nudge the spread to 12.5 and all 100 do. The same average, a tiny change, and the opposite outcome.',pause:true,setup:sim=>{BioLab.setValues(sim,{crowd:'bell',starters:0,mu:25,sd:12.5});sim.st.r=M(sim).R;}}
 ],
 lab:{bio:'<p><b>Question:</b> How many first movers does a stuck crowd need?</p><ol><li>Pick <b>One person moves from 1 to 2</b>. Skip to the end and record a trial.</li><li>Set first movers to 1, 2 and 3. Record each.</li></ol><p>Write one sentence: how does the final count change with each first mover? Then a discussion question with no single right answer: where at school does a sign-up depend on the first few names?</p>',
  honors:'<p><b>Question:</b> Can you predict a crowd from its average?</p><ol><li>Record the average threshold and the final count for both of the first two crowds.</li><li>Pick <b>Bell curve</b>. Keep the spread at 12 and change the average: 15, 20, 25, 30. Record each.</li><li>Open the graph <b>F(x)</b> and find where the curve meets the line each time.</li></ol><p>Explain in two sentences why the average is not enough.</p>',
  ap:'<p><b>Question:</b> Where is the tipping spread?</p><ol><li>Bell curve, average 25. Raise the spread from 10 in steps of 0.5 and record the final count and the rounds.</li><li>Repeat at an average of 30 and 40.</li></ol><p><b>CER:</b> Claim how the tipping spread depends on the average, show your table, and reason from F(x) and the line y = x.</p>'},
 terms:[
  {t:'Threshold',d:'How many others must join before a person will. A threshold of 0 means they go first.'},
  {t:'Cascade',d:'A chain reaction: each person who joins meets the next person’s threshold.'},
  {t:'First mover',d:'Someone who joins no matter what. In a stuck crowd, one more first mover can restart the chain.'},
  {t:'Tipping point',d:'A point where a small change flips the outcome for the whole group.'},
  {t:'Cumulative distribution F(x)',d:'The number of people whose threshold is at most x: how many would join once x have.',lvl:'honors'},
  {t:'Equilibrium',d:'A count where nobody new wants to join: F(x) = x. The cascade stops at the first one.',lvl:'honors'},
  {t:'Fixed point',d:'A value that an iteration maps to itself. Here, J with F(J) = J.',lvl:'ap'}
 ],
 about:'<p><b>Source.</b> Mark Granovetter, “Threshold Models of Collective Behavior,” <i>American Journal of Sociology</i> 83(6), 1978. The crowds 0, 1, 2 … 99 and the one-person change from 1 to 2 are his classic example.</p>'+
  '<p><b>Rules.</b> 100 people. A person joins once at least their threshold number of <i>other</i> people have joined, and nobody leaves. Round 1: everyone with threshold 0 joins. Each later round, everyone whose threshold is at most the number already joined joins. The chain stops when a round adds nobody, which happens at the first x where F(x) = x. A first mover replaces the person with the highest threshold, so the crowd stays at 100. The bell curve uses evenly spaced quantiles of a normal distribution, rounded to whole people and floored at 0, so it has no randomness. Real thresholds are not known numbers, and people can change their minds; this model is a simplification for thinking, not a forecast.</p>'+
  '<p><b>What this number hides.</b> An average threshold of 49.50 or 49.51 hides the order of the thresholds, and the order is what decides whether the chain stops. A final count also hides who was waiting on whom. Real thresholds are not known numbers, and people change their minds.</p>'+
  '<p><b>Catholic social teaching.</b> Pope John Paul II described solidarity as a firm and lasting commitment to the common good (<i>Sollicitudo Rei Socialis</i>, 1987, section 38). Question for discussion: in a crowd where everyone waits on each other, what does this model say about the person who commits first?</p>'
};
BioLab.register(SIM);
})();
