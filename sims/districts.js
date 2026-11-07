(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast}=BioLab.h;
/* Redistricting a made-up town. 90 voters on a 10 x 9 grid: 45 Green, 45 Purple. 6 districts of 15; a side needs 8 of 15 to win.
   Wasted votes (Stephanopoulos and McGhee, 2015): every vote for a district's loser, plus the winner's votes beyond the number needed to win.
   Here "needed" is a majority of the district's voters: floor(n/2) + 1, so 8 of 15. A tie has no winner and wastes every vote.
   Efficiency gap shown here = (Purple wasted - Green wasted) / all votes; positive favors Green. Their shortcut, for equal districts and
   two sides: EG = seat margin - 2 x vote margin (margins measured from 50%), which treats the winning line as exactly half.
   Compactness (Polsby and Popper, 1991): 4 pi A / P^2, with A = squares in the district and P = its outside edges, each square 1 by 1. */
const W=10,H=9,N=W*H,D=6,SIZE=15;
const TOWN=('PGPGPPGGGG'+'PGPPPPGPGG'+'PPPGPPPPGG'+'PPPGGPPGGG'+'PPGPPPGGGG'+'PPPPPPGPPG'+'PPPGGGPGGG'+'GGGGPGPGGG'+'GGGGPGPPPG').split('').map(c=>c==='P'?1:0);
const MAPS={blocks:'000001111100000111110000011111222223333322222333332222233333444445555544444555554444455555',
 a:'000111111100011111110002133333000223333300022333334442222555444422555544442255554444225555',
 b:'000011111100001111110000111222000333322244433333224445533322444553332244455555224445555552',
 c:'000000111100000011112220001111222233311122223334442222333444555553344455555334445555533444'};
const ARR={};for(const k in MAPS)ARR[k]=MAPS[k].split('').map(Number);
const MAPNAME={blocks:'Blocks',a:'Map A',b:'Map B',c:'Map C',own:'Your own map'};
const f1=v=>v.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const f3=v=>v.toFixed(3);
const nb=i=>{const x=i%W,y=(i/W)|0,o=[];if(x>0)o.push(i-1);if(x<W-1)o.push(i+1);if(y>0)o.push(i-W);if(y<H-1)o.push(i+W);return o;};
const assign=sim=>sim.p.map==='own'&&atLeast('honors')?sim.st.own:ARR[sim.p.map==='own'?'blocks':sim.p.map]||ARR.blocks;
const mapKey=sim=>sim.p.map==='own'&&!atLeast('honors')?'blocks':sim.p.map;
function analyze(a){const g=Array(D).fill(0),p=Array(D).fill(0),n=Array(D).fill(0),A=Array(D).fill(0),P=Array(D).fill(0);
 for(let i=0;i<N;i++){const d=a[i];n[d]++;if(TOWN[i])p[d]++;else g[d]++;A[d]++;const x=i%W,y=(i/W)|0;
  P[d]+=(x===0||a[i-1]!==d)+(x===W-1||a[i+1]!==d)+(y===0||a[i-W]!==d)+(y===H-1||a[i+W]!==d);}
 const need=n.map(v=>Math.floor(v/2)+1),win=g.map((v,d)=>n[d]===0?'none':v>=need[d]?'G':p[d]>=need[d]?'P':'tie');
 const wg=g.map((v,d)=>win[d]==='G'?v-need[d]:v),wp=p.map((v,d)=>win[d]==='P'?v-need[d]:v);
 const pp=A.map((v,d)=>P[d]?4*Math.PI*v/(P[d]*P[d]):0);
 const contig=[];for(let d=0;d<D;d++){const cells=[];for(let i=0;i<N;i++)if(a[i]===d)cells.push(i);if(!cells.length){contig.push(false);continue;}const seen=new Set([cells[0]]),st=[cells[0]];while(st.length){const c=st.pop();for(const q of nb(c))if(a[q]===d&&!seen.has(q)){seen.add(q);st.push(q);}}contig.push(seen.size===cells.length);}
 const WG=wg.reduce((s,v)=>s+v,0),WP=wp.reduce((s,v)=>s+v,0),GS=win.filter(w=>w==='G').length,PS=win.filter(w=>w==='P').length;
 const used=n.filter(v=>v>0).length;
 return {g,p,n,need,win,wg,wp,WG,WP,GS,PS,eg:100*(WP-WG)/N,pp,A,P,contig,equal:n.every(v=>v===SIZE),onePiece:contig.every(Boolean),used,
  short:100*((GS/D-0.5)-2*(45/90-0.5)),ppAvg:pp.reduce((s,v)=>s+v,0)/D,ppMin:Math.min(...pp)};}
const R=sim=>analyze(assign(sim));
const SEATS={};for(const k in ARR)SEATS[k]=analyze(ARR[k]).GS;
const MAXG=Math.floor(45/8);
const GS_=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shownW=sim=>!pending(sim)&&(!(sim.guide&&sim.guide.phase==='gut')||!!sim.p.reveal);
const mathOn=sim=>!pending(sim)&&!!((GS_(sim)&&GS_(sim).m)||sim.p.reveal||(sim.tour&&sim.tour.on&&sim.st.peek===2));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const egWords=v=>Math.abs(v)<0.05?'0%: neither side':`${f1(Math.abs(v))}% toward ${v>0?'Green':'Purple'}`;
const list=a=>a.join(', ');
const plus=a=>a.join(' + ');
function formulaText(sim,short){const r=R(sim),nm=MAPNAME[mapKey(sim)];
 const head=`Most Green can win: 45 Green votes ÷ 8 votes per win = 5.6, so at most ${MAXG} districts.`;
 if(short)return `45 ÷ 8 = 5.6, so ${MAXG} seats. ${nm}: EG = (${r.WP} − ${r.WG}) ÷ 90 = ${egWords(r.eg)}`;
 return `${head} ${nm}: Green wasted ${plus(r.wg)} = ${r.WG}; Purple wasted ${plus(r.wp)} = ${r.WP}. Efficiency gap = (${r.WP} − ${r.WG}) ÷ 90 = ${egWords(r.eg)}.`;}
function wrap(ctx,s,x,y,maxW,size,o){o=o||{};ctx.font=(o.w||400)+' '+size+'px '+FONT;const words=s.split(' ');let line='',lines=[];
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}else line=t;});if(line)lines.push(line);
 lines.forEach((l,i)=>txt(ctx,l,x,y+i*size*1.35,{s:size,w:o.w||400,c:o.c}));return y+lines.length*size*1.35;}
const CELL=38,GX=14,GY=58;
function voter(ctx,purple,cx,cy,r){ctx.beginPath();if(purple){ctx.moveTo(cx,cy-r*1.15);ctx.lineTo(cx+r*1.15,cy);ctx.lineTo(cx,cy+r*1.15);ctx.lineTo(cx-r*1.15,cy);ctx.closePath();ctx.fillStyle=PAL['s5'];}else{ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fillStyle=PAL['s3'];}ctx.fill();}
function labelCells(a){const out=[];for(let d=0;d<D;d++){let sx=0,sy=0,c=0;for(let i=0;i<N;i++)if(a[i]===d){sx+=i%W;sy+=(i/W)|0;c++;}if(!c){out.push(-1);continue;}sx/=c;sy/=c;let best=-1,bd=1e9;
 for(let i=0;i<N;i++)if(a[i]===d){const dd=(i%W-sx)**2+((i/W|0)-sy)**2;if(dd<bd){bd=dd;best=i;}}out.push(best);}return out;}

function draw(sim,ctx,vdt,k){const big=k>1.3,a=assign(sim),r=analyze(a),hon=atLeast('honors'),ap=atLeast('ap'),G=GS_(sim),sw=shownW(sim),mo=mathOn(sim);
 ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
 txt(ctx,big?`${MAPNAME[mapKey(sim)]}: 45 Green, 45 Purple`:`${MAPNAME[mapKey(sim)]}: 90 voters, 45 Green and 45 Purple`,GX,28*k,{s:13*k,w:700});
 const gy=GY;
 /* winner tint, voters, borders */
 const lab=labelCells(a);
 for(let i=0;i<N;i++){const x=GX+(i%W)*CELL,y=gy+((i/W)|0)*CELL,d=a[i],w=r.win[d];
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(x,y,CELL,CELL);
  if(w==='G'||w==='P'){ctx.globalAlpha=0.22;ctx.fillStyle=PAL[w==='G'?'s3':'s5'];ctx.fillRect(x,y,CELL,CELL);ctx.globalAlpha=1;}
  const isLab=lab[d]===i;voter(ctx,TOWN[i],isLab?x+CELL*0.76:x+CELL/2,isLab?y+CELL*0.76:y+CELL/2,isLab?5.5:9);}
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let i=0;i<=W;i++){ctx.beginPath();ctx.moveTo(GX+i*CELL,gy);ctx.lineTo(GX+i*CELL,gy+H*CELL);ctx.stroke();}
 for(let j=0;j<=H;j++){ctx.beginPath();ctx.moveTo(GX,gy+j*CELL);ctx.lineTo(GX+W*CELL,gy+j*CELL);ctx.stroke();}
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3.5;ctx.beginPath();
 for(let i=0;i<N;i++){const x=GX+(i%W)*CELL,y=gy+((i/W)|0)*CELL,cx=i%W,cy=(i/W)|0;
  if(cx===W-1||a[i+1]!==a[i]){ctx.moveTo(x+CELL,y);ctx.lineTo(x+CELL,y+CELL);}if(cy===H-1||a[i+W]!==a[i]){ctx.moveTo(x,y+CELL);ctx.lineTo(x+CELL,y+CELL);}
  if(cx===0){ctx.moveTo(x,y);ctx.lineTo(x,y+CELL);}if(cy===0){ctx.moveTo(x,y);ctx.lineTo(x+CELL,y);}}
 ctx.stroke();
 lab.forEach((i,d)=>{if(i<0)return;const x=GX+(i%W)*CELL,y=gy+((i/W)|0)*CELL;pill(ctx,String(d+1),x+CELL*0.36,y+CELL*0.36,PAL['card'],PAL['cv-ink'],12*Math.min(k,1.5));});
 if(hon&&sim.p.map==='own'){const i=(sim.p.row-1)*W+(sim.p.col-1),x=GX+(i%W)*CELL,y=gy+((i/W)|0)*CELL;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,CELL-4,CELL-4);}
 const gb=gy+H*CELL;
 if(gb+16*k<448){voter(ctx,0,GX+8,gb+12*k,6);txt(ctx,'Green',GX+18,gb+16*k,{s:12*k});voter(ctx,1,GX+18+52*k,gb+12*k,6);txt(ctx,big?'Purple':'Purple    Tint: who wins the district',GX+28+52*k,gb+16*k,{s:12*k});}
 /* right: the count */
 const X=GX+W*CELL+18,RW=800-X-10;let y=28*k;
 const cols=big?[X,X+70,X+128,X+140,X+300,X+RW]:[X,X+100,X+152,X+166,X+300,X+RW];
 const hd=big?['#','G','P','Wins','wG','wP']:['District','Green','Purple','Winner','Wasted G','Wasted P'];
 hd.forEach((h,j)=>txt(ctx,h,cols[j],y,{s:12*k,w:700,a:j===0||j===3?'left':'right',c:j>=4?PAL['cv-soft']:PAL['cv-ink']}));
 const rh=(big?19:21)*k;
 for(let d=0;d<D;d++){y+=rh;const w=r.win[d];
  if(w==='G'||w==='P'){ctx.globalAlpha=0.22;ctx.fillStyle=PAL[w==='G'?'s3':'s5'];ctx.fillRect(X-4,y-15*k,RW+6,rh-2);ctx.globalAlpha=1;}
  txt(ctx,String(d+1),cols[0]+4,y,{s:12*k,w:700});txt(ctx,String(r.g[d]),cols[1],y,{s:12*k,a:'right'});txt(ctx,String(r.p[d]),cols[2],y,{s:12*k,a:'right'});
  const tag=!big&&(w==='G'||w==='P')?((w==='G'?r.g[d]:r.p[d])>=11?' packed':(Math.abs(r.g[d]-r.p[d])===1?' close':'')):'';
  txt(ctx,(w==='G'?'Green':w==='P'?'Purple':w==='tie'?'Tie':'none').slice(0,big?1:9)+tag,cols[3],y,{s:12*k,w:700});
  txt(ctx,sw?String(r.wg[d]):'?',cols[4],y,{s:12*k,a:'right',c:PAL['cv-soft']});txt(ctx,sw?String(r.wp[d]):'?',cols[5],y,{s:12*k,a:'right',c:PAL['cv-soft']});}
 y+=rh;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X-4,y-16*k);ctx.lineTo(X+RW+2,y-16*k);ctx.stroke();
 txt(ctx,big?'All':'Total',cols[0]+4,y,{s:12*k,w:700});txt(ctx,'45',cols[1],y,{s:12*k,a:'right',w:700});txt(ctx,'45',cols[2],y,{s:12*k,a:'right',w:700});
 txt(ctx,big?`${r.GS}–${r.PS}`:`${r.GS} G, ${r.PS} P`,cols[3],y,{s:12*k,w:700});
 txt(ctx,sw?String(r.WG):'?',cols[4],y,{s:12*k,a:'right',w:700});txt(ctx,sw?String(r.WP):'?',cols[5],y,{s:12*k,a:'right',w:700});
 y+=(big?22:26)*k;
 const gl=G&&G.g&&big?` (gut: ${G.g.guess})`:'';
 const seatLine=big?`Green ${r.GS} seat${r.GS===1?'':'s'}, Purple ${r.PS}${gl}`:`Half the votes: Green wins ${r.GS} of 6 seats, Purple ${r.PS}.`;
 y=wrap(ctx,seatLine,X,y,RW,13*k,{w:700})-13*k*1.35+(big?18:20)*k;
 if(!r.equal||!r.onePiece){txt(ctx,big?'Not a legal map':`Not a legal map: ${!r.equal?'districts must have 15 voters each':'each district must be in one piece'}`,X,y,{s:12*k,w:700,c:PAL['rj']});y+=20*k;}
 if(hon&&sw&&!mo){txt(ctx,big?`EG ${egWords(r.eg)}`:`Efficiency gap: (${r.WP} − ${r.WG}) ÷ 90 = ${egWords(r.eg)}`,X,y,{s:12*k});y+=19*k;}
 if(hon&&!mo&&y<425){txt(ctx,big?`Compactness: avg ${f3(r.ppAvg)}`:`Compactness 4πA ÷ P²: average ${f3(r.ppAvg)}, lowest ${f3(r.ppMin)}`,X,y,{s:12*k,c:PAL['cv-soft']});y+=19*k;}
 if(G&&G.g&&!big&&y<430){pill(ctx,`Your gut: at most ${G.g.guess} for Green`,X+(big?110:120)*Math.min(k,1.3),y+4*k,PAL['s4'],'#111',12*Math.min(k,1.4));y+=26*k;}
 if(mo&&y<435){wrap(ctx,(big?'':'The math: ')+formulaText(sim,big),X,y,RW,12*k,{w:700,c:PAL['rj']});}}

function stepsWasted(r){return [`A district has 15 voters, so a side needs 8 to win.`,`Green’s wasted votes, district by district: ${r.g.map((v,d)=>r.win[d]==='G'?`${v} − 8 = ${r.wg[d]}`:`${v} (lost)`).join(', ')}.`,`Add them: ${plus(r.wg)} = <b>${r.WG}</b> wasted Green votes.`];}
const SIM={
 id:'districts',hash:'districts',apUnit:7,order:2,tab:'Drawing the lines',kind:'Simulation',prereq:['apportion'],
 card:'Split a made-up town of 90 voters into 6 equal districts, and count how the same votes can win 1 seat or 5 depending on where the lines go.',
 title:'Drawing the lines: districts and gerrymandering',
 skills:{bio:'Counting, majorities and percents · Algebra 1 · U.S. Government Unit 3 (redistricting and gerrymandering)',
  honors:'Percents, area and perimeter · Algebra 1, Geometry · U.S. Government Unit 3',
  ap:'Linear relationships between votes and seats; area and perimeter of a circle · Algebra 1, Geometry · AP U.S. Government (Congress)'},
 lede:{bio:'After apportionment, each state draws its district lines. Here a made-up town of 90 voters splits exactly 50/50 between Green and Purple. Every map has 6 districts of 15 voters. Guess how many seats the lines alone can give one side, then count.',
  honors:'Two measures try to put a number on a map. The efficiency gap compares the votes each side wastes. Compactness (Polsby–Popper, 4πA ÷ P²) compares a district with a circle. Draw your own map and watch both move.',
  ap:'With equal districts and two sides, the efficiency gap equals the seat margin minus twice the vote margin. Courts and scholars disagree about whether any such number should decide a case. Learn the math, then weigh the strongest case on each side.'},
 scale:'A made-up town: 90 voters on a 10 × 9 grid, one voter per square. Each district must have exactly 15 voters and be in one piece.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The map',
 controls:[
  {id:'guess',label:'Your gut: the most seats Green could win with 50% of the vote',type:'seg',def:3,options:[{v:1,l:'1'},{v:2,l:'2'},{v:3,l:'3'},{v:4,l:'4'},{v:5,l:'5'},{v:6,l:'6'}]},
  {id:'map',label:'Map',type:'seg',def:'blocks',noGut:true,onChange:sim=>{if(sim.p.map!=='own')sim.st.last=sim.p.map;clearGut(sim);},options:[{v:'blocks',l:'Blocks'},{v:'a',l:'Map A'},{v:'b',l:'Map B'},{v:'c',l:'Map C'},{v:'own',l:'Your own map',lvl:'honors'}]},
  {id:'brush',label:'Paint squares into district',type:'seg',def:1,lvl:'honors',noGut:true,options:[1,2,3,4,5,6].map(v=>({v,l:String(v)})),help:'Click a square on the map, or pick a row and column below and press Paint.'},
  {id:'row',label:'Square: row (top = 1)',type:'range',min:1,max:9,step:1,def:1,lvl:'honors',noGut:true},
  {id:'col',label:'Square: column (left = 1)',type:'range',min:1,max:10,step:1,def:1,lvl:'honors',noGut:true},
  {id:'reveal',label:'Show the math now',type:'toggle',def:false,help:'Normally the formula appears once you lock in your gut and work out the number.'}
 ],
 actions:[
  {id:'paint',label:'Paint the chosen square',lvl:'honors',run(sim){paint(sim,(sim.p.row-1)*W+(sim.p.col-1));}},
  {id:'restart',label:'Start my map over from Blocks',lvl:'honors',run(sim){sim.st.own=ARR.blocks.slice();BioLab.setValues(sim,{map:'own'});}}
 ],
 init(sim){return {own:((sim.st&&sim.st.own)||ARR.blocks).slice(),last:'blocks',peek:0};},step(){},
 onClick(sim,x,y){if(!atLeast('honors'))return;const cx=Math.floor((x-GX)/CELL),cy=Math.floor((y-GY)/CELL);if(cx<0||cx>=W||cy<0||cy>=H)return;BioLab.setValues(sim,{row:cy+1,col:cx+1});paint(sim,cy*W+cx);},
 metrics:[
  {id:'gseats',label:'Seats Green wins',unit:'of 6',d:0,min:0,max:6,get:sim=>R(sim).GS},
  {id:'pseats',label:'Seats Purple wins',unit:'of 6',d:0,min:0,max:6,get:sim=>R(sim).PS},
  {id:'gshare',label:'Green share of the votes',unit:'%',d:0,min:0,max:100,get:()=>50},
  {id:'wg',label:'Green wasted votes',unit:'votes',d:0,min:0,max:90,get:sim=>shownW(sim)?R(sim).WG:null},
  {id:'wp',label:'Purple wasted votes',unit:'votes',d:0,min:0,max:90,get:sim=>shownW(sim)?R(sim).WP:null},
  {id:'eg',label:'Efficiency gap (+ favors Green, − favors Purple)',unit:'%',d:1,lvl:'honors',min:-50,max:50,get:sim=>shownW(sim)?R(sim).eg:null},
  {id:'short',label:'Shortcut: seat margin − 2 × vote margin',unit:'%',d:1,lvl:'ap',min:-50,max:50,get:sim=>shownW(sim)?R(sim).short:null},
  {id:'pp',label:'Average compactness, 4πA ÷ P² (1 = circle)',unit:'',d:3,lvl:'honors',min:0,max:1,get:sim=>R(sim).ppAvg},
  {id:'ppmin',label:'Least compact district',unit:'',d:3,lvl:'honors',min:0,max:1,get:sim=>R(sim).ppMin},
  {id:'legal',label:'Equal population and each district in one piece?',text:true,lvl:'honors',get:sim=>{const r=R(sim);return r.equal&&r.onePiece?'Yes: 15 voters each, all in one piece':`No: sizes ${r.n.join(', ')}${r.onePiece?'':'; a district is split in two'}`;}}
 ],
 draw,
 narrate(sim){const r=R(sim),nm=MAPNAME[mapKey(sim)];
  if(pending(sim))return 'Work out the number in the box above from the table of votes. The picture hides the wasted votes until you check.';
  let s=`${nm}: with exactly half the votes, <b>Green wins ${r.GS} of 6 seats</b> and Purple wins ${r.PS}.`;
  const packed=r.win.map((w,d)=>w==='G'&&r.g[d]>=11?d+1:w==='P'&&r.p[d]>=11?d+1:0).filter(Boolean);
  if(packed.length)s+=` District${packed.length>1?'s':''} ${packed.join(' and ')} ${packed.length>1?'are':'is'} packed: the winner has 11 or more of 15, so many votes beyond the 8 needed are wasted.`;
  const close=r.win.filter((w,d)=>(w==='G'||w==='P')&&Math.abs(r.g[d]-r.p[d])===1).length;if(close>=3)s+=` ${close} districts are won 8 to 7: the losing side there is cracked, spread thin enough to lose each one.`;
  if(atLeast('honors')&&shownW(sim))s+=` Efficiency gap: ${egWords(r.eg)}.`;
  if(!r.equal||!r.onePiece)s+=' <b>This map is not legal yet:</b> every district needs exactly 15 voters, in one piece.';
  return s;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'This town splits exactly 50/50: 45 Green voters and 45 Purple. Every map must have 6 districts of 15 voters. If you could draw any legal map, what is the most seats Green could win? Pick one here, then lock it in.',
   honors:'Pick here the most seats Green could win with 50% of the vote, if you could draw any map with 6 equal districts. Then lock it in.'},
  hint:'Lock your gut answer. Then you will count the wasted votes on the map on screen yourself.',
  lock(sim){return {v:Math.abs(sim.p.guess-MAXG),guess:sim.p.guess,label:`at most ${sim.p.guess} seat${sim.p.guess>1?'s':''} for Green`};},
  solve(sim){sim.p.guess=MAXG;sim.p.map='a';sim.st.last='a';return {v:0,guess:MAXG,label:`${MAXG} of 6 seats for Green (Map A)`};},
  calc:{get d(){return atLeast('honors')?1:0;},tol:a=>atLeast('honors')?0.15:0,
   get unit(){return atLeast('honors')?'%':'votes';},
   prompt:{bio:sim=>{const r=R(sim);return `On the map on screen (${MAPNAME[mapKey(sim)]}), each district has 15 voters, so a side needs <b>8 votes</b> to win it. A vote is <b>wasted</b> if it goes to the side that loses the district, or if it is beyond the 8 the winner needed. Green’s votes in districts 1 to 6 are <b>${list(r.g)}</b>. How many Green votes are wasted in all?`;},
    honors:sim=>{const r=R(sim);return `On the map on screen (${MAPNAME[mapKey(sim)]}), find the <b>efficiency gap</b> as a percent, to one decimal. A side needs 8 of 15 votes to win a district. Wasted votes are every vote for a district’s loser plus the winner’s votes beyond 8. Green’s votes, districts 1 to 6: <b>${list(r.g)}</b>. Purple’s: <b>${list(r.p)}</b>. Efficiency gap = (Purple’s wasted − Green’s wasted) ÷ 90 × 100.`;}},
   answer:sim=>atLeast('honors')?R(sim).eg:R(sim).WG,
   hint:{bio:'District by district: if Green lost, all its votes are wasted. If Green won, subtract 8.',honors:'Find each side’s wasted votes first, district by district. Then subtract and divide by 90.'},
   steps(sim){const r=R(sim),s=stepsWasted(r);
    if(atLeast('honors')){s[2]=`Green’s total: ${plus(r.wg)} = ${r.WG}.`;s.push(`Purple’s wasted votes: ${r.p.map((v,d)=>r.win[d]==='P'?`${v} − 8 = ${r.wp[d]}`:`${v} (lost)`).join(', ')}, total ${r.WP}.`,`Efficiency gap = (${r.WP} − ${r.WG}) ÷ 90 × 100 = <b>${f1(r.eg)}</b>%: ${egWords(r.eg)}.`);}
    return s;}},
  formula:sim=>formulaText(sim,false),
  how:{bio:'Green needs 8 votes to win a district of 15. Its 45 votes can cover at most 45 ÷ 8 = 5.6 districts, so 5. A map that gives Green exactly 8 or 9 voters in 5 districts, and puts the rest of Green’s voters with most of Purple’s in the sixth, does it.',
   ap:'Each win costs at least 8 votes, so seats ≤ ⌊45 ÷ 8⌋ = 5. With 45 votes a side, wasted votes are 45 − 8 × (seats won), so the efficiency gap is 8 × (Green seats − Purple seats) ÷ 90.'},
  compare(sim,g,m){const G=g.guess,K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also counted the wasted votes yourself, which is how the efficiency gap is built.':'';
   const range=`Same 45 Green and 45 Purple votes: Map B gives Green ${SEATS.b} seat, Map C ${SEATS.c}, Blocks ${SEATS.blocks} and Map A ${SEATS.a}.`;
   if(G===MAXG)return `Your gut was right on: <b>${MAXG} of 6</b>. ${range} Where the lines go moved ${SEATS.a-SEATS.b} of the 6 seats, with no vote changing.${self}`;
   return `Your gut said <b>${G}</b>; the math says <b>${MAXG} of 6</b>. ${range} In real terms, the lines alone moved <b>${SEATS.a-SEATS.b} of 6 seats</b>, with not one vote changing. ${G<MAXG?'Most people guess 3, because 50% of 6 is 3. Votes split evenly do not have to mean seats split evenly.':'Green cannot win all 6: that would take 6 × 8 = 48 Green votes, and there are only 45.'}${self}`;},
  again(sim){const o=['blocks','c','b'];sim.p.map=o[Math.floor(Math.random()*o.length)];sim.st.last=sim.p.map;sim.p.guess=3;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A district has 15 voters: 11 Green and 4 Purple. Green needs 8 to win. How many Green votes are wasted?',answer:3,tol:0,unit:'votes',d:0,hint:'Green won. Its wasted votes are the ones beyond the 8 it needed.',explain:'11 − 8 = 3 wasted Green votes. All 4 Purple votes are wasted too, because Purple lost.'},
  {lvl:'bio',instant:true,q:'In Map B, district 3 holds 13 Green voters, and Green wins it 13 to 2. What is that called?',choices:['Cracking: splitting a side’s voters so they lose','Packing: crowding a side’s voters into one district so most of their votes are wasted','Compactness'],correct:1,explain:'Green needed 8 there and got 13, so 5 Green votes are wasted. The other 32 Green voters are cracked: spread across districts where they lose 7 to 8 or worse. Green ends with 1 seat.'},
  {lvl:'bio',instant:true,q:'Every map here uses the same 90 votes: 45 Green, 45 Purple. What is the fewest seats Green can win on a legal map?',choices:['0','1','3'],correct:1,explain:'To shut Green out, every district would need 7 or fewer Green voters, and 6 × 7 = 42 is less than 45. So Green wins at least 1. Map B does it: Green 1 seat, Purple 5.'},
  {lvl:'honors',kind:'num',q:'In Map B, Green wastes 37 votes and Purple wastes 5. Find the efficiency gap, (Purple wasted − Green wasted) ÷ 90 × 100, as a percent to one decimal.',answer:-35.6,tol:0.1,unit:'%',d:1,hint:'Subtract in the order given: 5 − 37 is negative.',explain:'(5 − 37) ÷ 90 × 100 = −35.6%. The minus sign means the map favors Purple: Purple wins 5 of 6 seats with half the votes.'},
  {lvl:'honors',instant:true,q:'Compactness = 4πA ÷ P². A 5 × 3 block of squares has A = 15 and P = 16. A 15 × 1 strip has A = 15 and P = 32. Which scores closer to a circle?',choices:['The block: about 0.736, against about 0.184 for the strip','The strip: it is longer','They tie, because the areas are equal'],correct:0,explain:'Block: 4π × 15 ÷ 256 ≈ 0.736. Strip: 4π × 15 ÷ 1,024 ≈ 0.184. Doubling the perimeter divides the score by 4. On a grid of squares, even a perfect square scores only π ÷ 4 ≈ 0.785.'},
  {lvl:'honors',instant:true,q:'Blocks is six neat rectangles drawn with no plan at all, yet Green wins 4 seats and the efficiency gap is 17.8% toward Green. Why?',choices:['Someone drew Blocks to help Green','Purple voters live close together near the top left, so even neutral lines pack them','The efficiency gap is computed wrong'],correct:1,explain:'Where people live matters. Purple wins its 2 districts 11 to 4 and 12 to 3, wasting many votes. Stephanopoulos and McGhee themselves let a state answer a large gap by pointing to unavoidable political geography.'},
  {lvl:'ap',kind:'num',q:'A side wins 60% of the votes and 5 of 6 seats, in equal districts with two sides. Use the shortcut: efficiency gap = seat margin − 2 × vote margin, with margins measured from 50%. Give the percent to one decimal.',answer:13.3,tol:0.1,unit:'%',d:1,hint:'Seat margin = 5/6 − 50%. Vote margin = 60% − 50%.',explain:'Seat margin = 83.3% − 50% = 33.3%. Vote margin = 10%. 33.3% − 2 × 10% = 13.3% in that side’s favor.'},
  {lvl:'ap',instant:true,q:'By the shortcut, an efficiency gap of 0 means seat margin = 2 × vote margin. So a side with 60% of the votes and a gap of 0 wins what share of seats?',choices:['60%','70%','100%'],correct:1,explain:'Vote margin 10%, so seat margin 20%: 50% + 20% = 70% of seats. The measure builds in a “winner’s bonus” of 2 points of seats per point of votes. Critics say that norm is a choice, not a law of nature; supporters say it matches how fairly drawn single-member districts usually behave.'},
  {lvl:'ap',instant:true,q:'What did the Supreme Court hold in Rucho v. Common Cause (2019)?',choices:['The efficiency gap is the constitutional test for maps','Partisan gerrymandering claims are political questions that federal courts cannot decide','States may not use independent commissions'],correct:1,explain:'The 5 to 4 majority found no clear, manageable, politically neutral standard. It pointed to state courts, state laws, independent commissions and Congress instead. The dissent argued that lower courts had already used workable standards and that extreme gerrymanders harm democracy.'}
 ],
 tour:[
  {title:'The town',text:'90 voters live in this town: 45 Green and 45 Purple, so each side has exactly 50% of the votes. Every map splits the town into 6 districts of 15 voters. A side that gets 8 or more of a district’s 15 votes wins its seat.',pause:true,focus:[10,30,400,390],setup:sim=>{BioLab.setValues(sim,{map:'blocks',reveal:false});sim.st.peek=1;}},
  {title:'Blocks',text:'Blocks splits the town into six neat 5 × 3 rectangles. Purple voters live close together near the top left, so Purple wins districts 1 and 3 by a lot, 11 to 4 and 12 to 3. Green wins the other 4. Half the votes, 4 seats to 2.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'blocks'});sim.st.peek=1;}},
  {title:'Wasted votes',text:'A vote is wasted if it goes to the loser, or if it is beyond the 8 the winner needed. In district 1, all 4 Green votes are wasted, and 3 of Purple’s 11 are. Add every district: Green wastes 13 votes on this map and Purple wastes 29.',pause:true,focus:[420,0,380,240],setup:sim=>{BioLab.setValues(sim,{map:'blocks'});sim.st.peek=1;}},
  {title:'Packing',text:'Map B packs Green: district 3 holds 13 Green voters, who win by 5 more votes than they need. Those 5 votes are wasted. Packing gives a side one huge win instead of several narrow ones.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'b'});sim.st.peek=1;}},
  {title:'Cracking',text:'The rest of Green is cracked: in districts 2, 4, 5 and 6, Green has 7 of 15 voters and loses each by one vote. Map B gives Purple 5 seats and Green 1, from the same 50/50 vote.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'b'});sim.st.peek=1;}},
  {title:'The most Green can win',text:'Each win costs Green at least 8 votes, and 45 ÷ 8 = 5.6, so 5 seats at most. Map A gets there: Green has 8 or 9 voters in 5 districts, and Purple is packed 12 to 3 into district 1. Green wastes only 5 votes; Purple wastes 37.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'a'});sim.st.peek=2;}},
  {lvl:'honors',title:'Two measures',text:'Efficiency gap = (Purple wasted − Green wasted) ÷ 90. Map A: (37 − 5) ÷ 90 = 35.6% toward Green; Blocks: 17.8%. Compactness = 4πA ÷ P². A 5 × 3 block has A = 15 and P = 16, so 4π × 15 ÷ 256 = 0.736. Map A’s longer districts score lower.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'a'});sim.st.peek=1;}},
  {lvl:'ap',title:'Who decides?',text:'In Rucho v. Common Cause (2019), the Supreme Court held 5 to 4 that federal courts cannot decide partisan gerrymandering claims, and pointed to states and Congress instead. In 2018, Colorado voters passed Amendments Y and Z, which gave map drawing to two independent commissions.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:'c'});sim.st.peek=1;}}
 ],
 onTourExit(sim){sim.st.peek=0;},
 infoPanel(sim){const r=R(sim);
  let h='<h3>What this number hides</h3><ul>';
  h+='<li><b>Where people live.</b> Blocks has a 17.8% gap toward Green with no plan behind it, only because Purple voters live close together. One number cannot tell geography from intent.</li>';
  h+='<li><b>Real voters are not fixed colors.</b> Here every voter always votes, and always the same way. Real people change their minds, turnout rises and falls, and some races have only one candidate. A map’s gap can change from one election to the next.</li>';
  h+='<li><b>Two sides only.</b> The shortcut and this town assume two choices. Many places have more.</li></ul>';
  if(atLeast('honors'))h+='<h3>The strongest case on each side</h3><p>These are arguments people make. The tool does not score them.</p><ul>'+
   '<li><b>For a measure like the efficiency gap:</b> it uses real election results, it catches packing and cracking in one number, and its authors proposed clear thresholds (a gap above two seats for congressional maps or 8% for state house maps, if it is likely to last).</li>'+
   '<li><b>Against it:</b> the Supreme Court’s majority in Rucho found no clear, manageable, politically neutral standard. A gap can reflect geography rather than intent, it moves from election to election, and it assumes a particular “fair” link between votes and seats.</li>'+
   '<li><b>For compactness:</b> twisted shapes are a warning sign, and Colorado’s constitution asks for districts as compact as is reasonably possible.</li>'+
   '<li><b>Against relying on it:</b> compact lines can still pack a clustered group, as Blocks does, and they can split a community that belongs together. Perimeters along rivers or mountains look jagged for reasons no one chose.</li></ul>';
  if(atLeast('ap'))h+='<p><b>Who should draw the lines?</b> A discussion question with no single right answer. For legislatures: the Constitution’s Elections Clause gives state legislatures the first say over how House elections are held, and legislators answer to voters. For independent commissions: the people drawing districts should not be choosing their own voters. Colorado chose commissions in 2018.</p>';
  h+='<div style="border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:10px 0"><p style="margin:0 0 4px"><b>Questions to ask any number</b></p><ul style="margin:0;padding-left:1.3em"><li>Who counted, and how?</li><li>Who is missing?</li><li>Per what? (per voter, per district, per seat?)</li><li>Compared to what?</li><li>What would change the answer?</li><li>What does this number hide?</li></ul></div>';
  return h;},
 lab:{bio:'<p><b>Question:</b> How much can the lines alone change the result?</p><ol><li>Pick each map in turn: Blocks, Map A, Map B and Map C. Record a trial for each.</li><li>For each map, write Green’s seats and Green’s wasted votes.</li></ol><p>Write one sentence: why do more wasted Green votes go with fewer Green seats?</p>',
  honors:'<p><b>Question:</b> Can you draw a legal map that is compact and has a small efficiency gap?</p><ol><li>Choose <b>Your own map</b>. Pick a district number, then click squares to paint them into it (or set a row and column and press Paint).</li><li>Keep every district at 15 voters and in one piece; the legal check tells you.</li><li>Record your map’s seats, efficiency gap and average compactness. Try to beat Blocks on the gap without losing much compactness.</li></ol><p>Explain one trade-off you ran into.</p>',
  ap:'<p><b>Question:</b> Does the efficiency gap measure fairness?</p><ol><li>Record the efficiency gap and the shortcut for all four maps. Explain why they differ by a little (8 votes to win, not 7.5).</li><li>Show that with 45 votes a side, the gap here is 8 × (Green seats − Purple seats) ÷ 90.</li></ol><p><b>CER:</b> Using Blocks as evidence, argue whether a large efficiency gap alone should prove a map was drawn unfairly. Present the strongest case on the other side too.</p>'},
 terms:[
  {t:'Redistricting',d:'Drawing new district lines, usually after each census, so every district has about the same number of people.'},
  {t:'Gerrymandering',d:'Drawing district lines on purpose to help one side or group win more seats than it otherwise would.'},
  {t:'Packing',d:'Crowding one side’s voters into a few districts they win by huge margins, wasting many votes.'},
  {t:'Cracking',d:'Spreading one side’s voters across many districts so they fall just short in each.'},
  {t:'Wasted vote',d:'A vote for a district’s loser, or a winner’s vote beyond what was needed to win.'},
  {t:'Efficiency gap',d:'The difference between the two sides’ wasted votes, divided by all votes (Stephanopoulos and McGhee, 2015).',lvl:'honors'},
  {t:'Polsby–Popper compactness',d:'4πA ÷ P²: a district’s area compared with a circle of the same perimeter. A circle scores 1.',lvl:'honors'},
  {t:'Nonjusticiable',d:'A question courts will not decide. Rucho v. Common Cause (2019) put partisan gerrymandering claims in this category for federal courts.',lvl:'ap'}
 ],
 about:'<p><b>The town is made up.</b> 90 voters, each always voting Green or Purple, arranged by hand so the maps show packing and cracking. Green and Purple stand for any two sides; they are not real parties. The four preset maps were found by a computer search for equal, one-piece districts.</p>'+
  '<p><b>The measures.</b> Wasted votes and the efficiency gap are from Nicholas O. Stephanopoulos and Eric M. McGhee, “Partisan Gerrymandering and the Efficiency Gap,” <i>University of Chicago Law Review</i> 82 (2015), 831. They count votes for a loser and a winner’s votes beyond what was needed; this tool uses 8 of 15. Their shortcut, seat margin − 2 × vote margin, assumes equal districts, two parties and a winning line at exactly half, so it differs slightly here. They suggested a presumption against plans with gaps above two seats (congressional) or 8% (state house) likely to last, which a state could rebut, for example with unavoidable political geography. Compactness is the Polsby–Popper score from Daniel D. Polsby and Robert Popper, “The Third Criterion: Compactness as a Procedural Safeguard Against Partisan Gerrymandering,” <i>Yale Law &amp; Policy Review</i> 9, no. 2 (1991): 4πA ÷ P², the district’s area divided by the area of a circle with the same perimeter. On a grid, A is squares and P is outside edges, so even a square scores only π ÷ 4.</p>'+
  '<p><b>The courts.</b> <i>Rucho v. Common Cause</i>, decided June 27, 2019, 5 to 4 (<a href="https://www.supremecourt.gov/opinions/18pdf/18-422_9ol1.pdf" target="_blank" rel="noopener">opinion</a>): partisan gerrymandering claims present political questions beyond the reach of federal courts. The majority pointed to state courts, state constitutions, independent commissions and Congress. The dissent argued that lower courts had used workable, limited standards.</p>'+
  '<p><b>Colorado.</b> Amendments Y and Z (2018) created independent commissions to draw Colorado’s congressional and state legislative districts (<a href="https://redistricting.colorado.gov/" target="_blank" rel="noopener">redistricting.colorado.gov</a>). As described by Colorado Public Radio (October 15, 2018), each commission has 12 members: four from each of the state’s two largest parties and four unaffiliated voters, and a map needs 8 votes including at least 2 unaffiliated members. The Colorado Constitution (Article V, Section 44.3) asks the congressional commission for districts as equal in population as possible, compliance with the Voting Rights Act of 1965, whole communities of interest and political subdivisions where possible, compact districts, and, where possible, the most politically competitive districts; no map may be drawn to protect incumbents or favor a political party. This tool describes those rules and does not judge any real map.</p>'
};
function paint(sim,i){if(!atLeast('honors')||i<0||i>=N)return;if(sim.p.map!=='own'){sim.st.own=(ARR[sim.p.map]||ARR.blocks).slice();BioLab.setValues(sim,{map:'own'});}sim.st.own[i]=clamp((sim.p.brush|0)-1,0,D-1);clearGut(sim);sim.infoDirty=true;}
BioLab.register(SIM);
})();
