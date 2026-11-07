(function(){
'use strict';
const {clamp,txt,rr,PAL,atLeast,fmtNum}=BioLab.h;
/* FY2026 federal budget, in billions of dollars. Source: Treasury Monthly Treasury Statement, table 9, fiscal year ending Sep 30, 2026.
   "Everything else" is the remainder so the lines add to total outlays. */
const TOT=7395.8,REV=5403.3,DEBT=32.43,DISC=0.27;
const LINES=[
 {id:'ss',l:'Social Security',sl:'Social Security',v:1667.1,kind:'mandatory',c:'dss'},
 {id:'mc',l:'Medicare',sl:'Medicare',v:1072.6,kind:'mandatory',c:'dmc'},
 {id:'int',l:'Net interest on the debt',sl:'Net interest',v:1051.8,kind:'interest',c:null},
 {id:'hl',l:'Health (mostly Medicaid)',sl:'Health (Medicaid)',v:1025.6,kind:'mostly mandatory',c:'dhl'},
 {id:'df',l:'National defense',sl:'Defense',v:965.2,kind:'discretionary',c:'ddf'},
 {id:'is',l:'Income security (SNAP, SSI, credits, housing)',sl:'Income security',v:694.2,kind:'mostly mandatory',c:'dis'},
 {id:'va',l:'Veterans',sl:'Veterans',v:416.2,kind:'mixed',c:'dva'},
 {id:'tr',l:'Transportation',sl:'Transportation',v:142.9,kind:'mixed',c:'dtr'},
 {id:'ed',l:'Education, training, employment, social services',sl:'Education',v:107.6,kind:'mixed',c:'ded'},
 {id:'ag',l:'Agriculture',sl:'Agriculture',v:52.6,kind:'mostly mandatory',c:'dag'},
 {id:'ia',l:'International affairs (all foreign aid plus the State Dept.)',sl:'International affairs',v:48.0,kind:'mostly discretionary',c:'dia'},
 {id:'ot',l:'Everything else',sl:'Everything else',v:0,kind:'mixed',c:null}];
LINES[11].v=+(TOT-LINES.slice(0,11).reduce((a,b)=>a+b.v,0)).toFixed(1);
const SRC=[
 {id:'inc',l:'Individual income tax',sl:'Income tax',v:2845.5,c:'dinc',col:'#2f7d5b'},
 {id:'pay',l:'Payroll taxes',sl:'Payroll',v:1754.3,c:'dpay',col:'#3a7f95'},
 {id:'cor',l:'Corporate income tax',sl:'Corporate',v:381.4,c:'dcor',col:'#7a5aa6'},
 {id:'cus',l:'Customs duties (tariffs)',sl:'Customs',v:173.2,c:'dcus',col:'#a8742a'},
 {id:'oth',l:'Other receipts',sl:'Other',v:0,c:null,col:'#69707c'}];
SRC[4].v=+(REV-SRC.slice(0,4).reduce((a,b)=>a+b.v,0)).toFixed(1);
const L=id=>LINES.find(x=>x.id===id);
/* Human units: what $1 billion buys. */
const SNAP_PY=1e9/(189.36*12),LUNCH=1e9/4.76,JET=1e9/6.6e6,PELL=1e9/7395;
const RATE=1051.8/(DEBT*1000);
const ASKQ={ia:{l:'International affairs',p:'international affairs (all foreign aid plus the State Department)',short:'foreign aid + State Dept.'},int:{l:'Net interest',p:'net interest on the debt',short:'interest on the debt'}};

const chg=(sim,c)=>c?(+sim.p[c]||0):0;
const lineV=(sim,x)=>x.v+chg(sim,x.c);
const outl=sim=>LINES.reduce((a,x)=>a+lineV(sim,x),0);
const rcpt=sim=>SRC.reduce((a,x)=>a+x.v+chg(sim,x.c),0);
const defc=sim=>outl(sim)-rcpt(sim);
const anyChange=sim=>LINES.some(x=>chg(sim,x.c)!==0)||SRC.some(x=>chg(sim,x.c)!==0);
const truth=q=>L(q).v/TOT*100;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
/* The real budget stays hidden while the student works out the share ("Your turn"). */
const shown=sim=>!pend(sim)&&!!(sim.p.show||anyChange(sim)||(GS(sim)&&GS(sim).g));
const revealed=sim=>!!(GS(sim)&&GS(sim).m);
const share2=q=>Math.round(truth(q)*100)/100;
const n1=v=>Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const B=v=>(v<0?'−':'')+'$'+n1(v)+'B';
const B0=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US')+'B';
const sB=v=>(v>0?'+':v<0?'−':'')+'$'+n1(v)+'B';
const per100=v=>'$'+(v).toFixed(2);
const big=v=>{const a=Math.abs(v);return a>=1e9?(a/1e9).toFixed(1)+' billion':a>=1e6?(a/1e6).toFixed(1)+' million':Math.round(a).toLocaleString('en-US');};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* The natural human unit for a change to a line. */
function human(id,d){const a=Math.abs(d);
 if(id==='is')return `about ${big(a*SNAP_PY)} person-years of SNAP`;
 if(id==='df')return `about ${big(a*JET)} years of flying one Air Force F-35`;
 if(id==='ed')return `about ${big(a*PELL)} maximum Pell Grants`;
 return `about ${big(a*LUNCH)} free school lunches, for scale`;}

const ctl=(x,lvl,cap,step)=>({id:x.c,label:`${x.sl}: change, in billions of dollars`,type:'range',min:-Math.min(cap,Math.floor(x.v)),max:cap,step:step||5,def:0,unit:'',d:0,noGut:true,lvl,
 help:x.kind==='mandatory'?'Mandatory spending: it changes only if Congress changes the law that sets it.':x.kind==='mostly mandatory'?'Mostly mandatory: most of it changes only if the law changes.':x.kind==='discretionary'?'Discretionary: Congress sets it in a yearly vote.':x.kind==='mostly discretionary'?'Mostly discretionary: Congress sets most of it in a yearly vote.':'A mix of mandatory programs and yearly votes.'});
const rctl=(x,lvl,cap)=>({id:x.c,label:`${x.sl} revenue: change, in billions of dollars`,type:'range',min:-cap,max:cap,step:5,def:0,unit:'',d:0,noGut:true,lvl,help:'Changing revenue takes a change in tax law.'});

/* Word-wrap helper for canvas text. */
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+BioLab.h.FONT;const words=s.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}

function drawGuess(sim,ctx,k){const q=ASKQ[sim.p.gq],g=sim.p.guess,H=500;
 txt(ctx,'Every $100 the federal government spent in FY2026',400,32,{s:15*k,w:700,a:'center'});
 txt(ctx,'Each square is $1',400,32+20*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
 const cs=32,gx=400-5*cs,gy=Math.round(46+22*k);
 for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10,x=gx+c*cs,y=gy+r*cs,f=clamp(g-i,0,1);
  ctx.strokeStyle=PAL['cv-soft'];ctx.globalAlpha=.45;ctx.lineWidth=1;ctx.strokeRect(x+2.5,y+2.5,cs-5,cs-5);ctx.globalAlpha=1;
  if(f>0){ctx.fillStyle=PAL['s4'];ctx.fillRect(x+3,y+3,(cs-6)*f,cs-6);}}
 const ty=gy+10*cs+24*k;
 txt(ctx,`Your guess: ${per100(g)} of every $100`,400,ty,{s:14*k,w:700,c:PAL['s4'],a:'center'});
 txt(ctx,`for ${q.short}: ${B(g/100*TOT)} a year`,400,ty+20*k,{s:13*k,a:'center'});
 if(ty+42*k<H-4)txt(ctx,pend(sim)?'Work out the real share to see the budget.':'Lock in your guess to see the real budget.',400,ty+42*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}

function lay(k){const y1=16,bh=26,y2=y1+bh+12,ly=y2+bh+34*k,top=Math.round(ly+14*k);return {y1,bh,y2,ly,top,rowH:(494-top)/6};}
const rowRect=(sim,i)=>{const Q=lay(sim._k||1),col=i<6?0:1,row=i%6;return [12+col*390,Q.top+row*Q.rowH-4,386,Q.rowH];};
function draw(sim,ctx,vdt,k){const W=800,H=500;sim._k=k;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
 if(!shown(sim)){drawGuess(sim,ctx,k);return;}
 const G=GS(sim),o=outl(sim),r=rcpt(sim),dft=o-r,X0=Math.round(70+46*k),Wmax=W-20-X0,sc=Wmax/Math.max(8000,o,r);
 /* top: spending vs. revenue */
 const Q=lay(k),y1=Q.y1,bh=Q.bh,y2=Q.y2;
 txt(ctx,'Spending',20,y1+bh/2,{s:13*k,w:700,b:'middle'});txt(ctx,'Revenue',20,y2+bh/2,{s:13*k,w:700,b:'middle'});
 ctx.fillStyle='#3f6fb0';rr(ctx,X0,y1,o*sc,bh,4);ctx.fill();
 txt(ctx,B(o),X0+o*sc-8,y1+bh/2+1,{s:12*k,w:700,c:'#fff',a:'right',b:'middle'});
 let x=X0;SRC.forEach(s=>{const v=s.v+chg(sim,s.c),w=Math.max(0,v*sc);ctx.fillStyle=s.col;ctx.fillRect(x,y2,w,bh);
  const lab=k>1.4?s.sl:s.l;ctx.font='600 '+(12*k)+'px '+BioLab.h.FONT;if(ctx.measureText(lab).width<w-10)txt(ctx,lab,x+6,y2+bh/2+1,{s:12*k,w:600,c:'#fff',b:'middle'});x+=w;});
 const rx=X0+r*sc,ox=X0+o*sc;
 if(dft>0){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(rx,y2+1,ox-rx,bh-2);ctx.setLineDash([]);}
 const dl=dft>=0?`Deficit (borrowed): ${B(dft)}`:`Surplus: ${B(-dft)}`;
 ctx.font='700 '+(12*k)+'px '+BioLab.h.FONT;const dw=ctx.measureText(dl).width;
 txt(ctx,dl,clamp((rx+ox)/2,20+dw/2,W-12-dw/2),y2+bh+16*k,{s:12*k,w:700,c:PAL['s1'],a:'center'});
 const ly=Q.ly;
 {let lx=20;const ph=k>1.4,BB=ph?B0:B;if(!ph){txt(ctx,`Total revenue ${B(r)}:`,lx,ly,{s:12*k,c:PAL['cv-soft']});ctx.font='400 '+(12*k)+'px '+BioLab.h.FONT;lx+=ctx.measureText(`Total revenue ${B(r)}:`).width+10;}
  SRC.slice(2).forEach(s=>{const t=`${s.sl} ${BB(s.v+chg(sim,s.c))}`;ctx.fillStyle=s.col;ctx.fillRect(lx,ly-10*k,10*k,10*k);txt(ctx,t,lx+14*k,ly,{s:12*k,c:PAL['cv-soft']});ctx.font='400 '+(12*k)+'px '+BioLab.h.FONT;lx+=14*k+ctx.measureText(t).width+14;});}
 /* lines: two columns of six */
 const top=Q.top,rowH=Q.rowH,cw=370,bmax=cw-64*k,bs=bmax/2000;
 LINES.forEach((ln,i)=>{const col=i<6?0:1,row=i%6,cx=20+col*(cw+20),y=top+row*rowH,v=lineV(sim,ln),d=chg(sim,ln.c);
  const by=y+4+11*k+6;
  txt(ctx,k>1.4?(ln.id==='ia'?'International':ln.sl):(ln.id==='ia'?'International affairs':ln.id==='is'?'Income security':ln.id==='ed'?'Education & social services':ln.l),cx,y+4+11*k,{s:12*k,w:700});
  txt(ctx,k>1.4?B0(v):B(v),cx+cw,y+4+11*k,{s:12*k,a:'right'});
  ctx.fillStyle=PAL['line'];ctx.fillRect(cx,by,Math.max(2,ln.v*bs),12);
  ctx.fillStyle=ln.id==='int'?PAL['s1']:'#3f6fb0';ctx.fillRect(cx,by+3,Math.max(2,Math.min(v*bs,bmax)),12);
  let right='';let rc=PAL['cv-ink'];
  const gq=G&&G.g?G.g.q:null;
  if(gq===ln.id){right=`Your gut: ${B(G.g.guess/100*TOT)}`;rc=PAL['s4'];ctx.font='700 '+(12*k)+'px '+BioLab.h.FONT;const lim=cw-ctx.measureText(right).width-14,want=G.g.guess/100*TOT*bs,gw=Math.min(want,lim);
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.strokeRect(cx,by-1,Math.max(3,gw),20);
   if(want>lim){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(cx+gw+1,by-4);ctx.lineTo(cx+gw+9,by+9);ctx.lineTo(cx+gw+1,by+22);ctx.fill();}}
  else if(d){right=(d>0?'▲ ':'▼ ')+'$'+Math.abs(d)+'B';rc=d>0?PAL['s3']:PAL['s1'];}
  if(right)txt(ctx,right,cx+cw,by+12,{s:12*k,w:700,c:rc,a:'right'});
  /* at the reveal: the share formula under the line that was guessed */
  if(gq===ln.id&&revealed(sim)&&by+20+12*k<y+rowH+2)txt(ctx,`${n1(ln.v)} ÷ ${n1(TOT)} × 100 = $${share2(ln.id).toFixed(2)} of every $100`,cx,by+18+12*k,{s:12*k,w:700,c:PAL['rj']});});}

/* The working panel keeps only the math: each change converted to human units. The bishops' asks live in About. */
function asksHTML(sim){let h='';
 const moved=LINES.filter(x=>chg(sim,x.c)).map(x=>`<li>${x.sl}: ${sB(chg(sim,x.c))}, ${human(x.id,chg(sim,x.c))}</li>`);
 h+=`<h3>Your changes in human terms</h3>${moved.length?`<ul>${moved.join('')}</ul>`:'<p>Move a slider to see what each change means.</p>'}`;
 return h;}

const SIM={
 id:'budget',hash:'budget',apUnit:2,order:1,tab:'Where $7.4 trillion goes',kind:'Simulation',
 skills:{bio:'Percent of a whole: share = part ÷ total × 100 · Algebra 1 (Unit 2), AP Macroeconomics (Unit 5)',honors:'Percent of a whole and unit conversion · Algebra 1 (Unit 2), AP Macroeconomics (Unit 5)',ap:'Deficit = outlays − receipts, and an average rate (interest ÷ debt) · Algebra 1 (Unit 2), AP Macroeconomics (Unit 5)'},
 card:'Guess how much goes to foreign aid, then rebuild the real FY2026 federal budget and see what each change means in people, lunches and jets.',
 title:'Where $7.4 trillion goes: the FY2026 federal budget',
 lede:{bio:'In FY2026 the federal government spent $7,395.8 billion and took in $5,403.3 billion. Where did it go? Move money between the lines and see what each choice means for real people.',
  honors:'Only about 27% of federal spending is discretionary, set in a yearly vote (FY2025, CBO). The rest is mandatory spending and interest: it changes only when the law changes or the debt does.',
  ap:'Deficit = outlays − receipts. Each year’s deficit adds to the debt held by the public ($32.43 trillion on Sep 30, 2026), and net interest ÷ debt gives an average rate of about 3.24%.'},
 scale:'The whole federal budget for one year: FY2026, October 1, 2025 to September 30, 2026. All amounts in billions of dollars.',
 aspect:1.6,timeless:true,trials:true,graph:true,
 controlsTitle:'Your budget',
 controls:[
  {id:'gq',label:'The guess',type:'seg',def:'ia',noGut:true,onChange:clearGut,options:[{v:'ia',l:'Foreign aid'},{v:'int',l:'Interest on the debt'}],help:'Foreign aid here means international affairs: all foreign aid plus the State Department.'},
  {id:'guess',label:'Your guess: dollars out of every $100 of spending',type:'range',min:0,max:30,step:0.25,def:10,unit:'',d:2},
  {id:'show',label:'Show the real budget',type:'toggle',def:false,help:'Off: you guess first.'},
  ctl(L('df'),'bio',300),ctl(L('is'),'bio',200),ctl(L('ia'),'bio',48,1),ctl(L('hl'),'honors',300),ctl(L('ed'),'honors',100,1),
  rctl(SRC[0],'bio',400),
  ctl(L('ss'),'honors',300),ctl(L('mc'),'honors',300),ctl(L('va'),'honors',100),rctl(SRC[1],'honors',300),rctl(SRC[2],'honors',200),
  ctl(L('tr'),'ap',50,1),ctl(L('ag'),'ap',50,1),rctl(SRC[3],'ap',150)
 ],
 actions:[{id:'swap',label:'Try it: move $10B from defense to income security',run(sim){BioLab.setValues(sim,{ddf:-10,dis:10,show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'outlays',label:'Spending',unit:'$ billions',d:1,min:0,max:null,get:sim=>shown(sim)?outl(sim):null},
  {id:'receipts',label:'Revenue',unit:'$ billions',d:1,min:0,max:null,get:sim=>shown(sim)?rcpt(sim):null},
  {id:'deficit',label:'Deficit (borrowed)',unit:'$ billions',d:1,min:0,max:null,get:sim=>shown(sim)?defc(sim):null},
  {id:'dchange',label:'Your change to the deficit',unit:'$ billions',d:1,min:null,max:null,get:sim=>shown(sim)?defc(sim)-(TOT-REV):null},
  {id:'share',label:'Real share of FY2026 spending for your guess',unit:'%',d:2,min:0,max:30,get:sim=>shown(sim)?truth(sim.p.gq):null},
  {id:'snap',label:'Your income security change, as SNAP person-years',unit:'millions',d:2,lvl:'honors',min:null,max:null,get:sim=>chg(sim,'dis')*SNAP_PY/1e6},
  {id:'jets',label:'Your defense change, as F-35 jet-years',unit:'jet-years',d:0,lvl:'honors',min:null,max:null,get:sim=>chg(sim,'ddf')*JET},
  {id:'debt',label:'Debt held by the public after this year',unit:'$ trillions',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?DEBT+defc(sim)/1000:null},
  {id:'addint',label:'Yearly interest added by this year’s borrowing',unit:'$ billions',d:1,lvl:'ap',min:null,max:null,get:sim=>shown(sim)?defc(sim)*RATE:null}
 ],
 graphs:[{id:'moves',label:'Your changes, line by line',custom:true}],defaultGraph:'moves',
 plot(sim,ctx,box){const items=LINES.filter(x=>chg(sim,x.c)).map(x=>({l:x.sl,v:chg(sim,x.c)})).concat(SRC.filter(x=>chg(sim,x.c)).map(x=>({l:x.sl+' revenue',v:chg(sim,x.c),rev:true})));
  if(!items.length){txt(ctx,'Move a slider to see your changes here.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const m=Math.max(50,...items.map(i=>Math.abs(i.v))),mid=box.L+box.W*0.62,half=box.W*0.36,rh=Math.min(28,box.H/(items.length+1));
  ctx.strokeStyle=PAL['g-axis'];ctx.beginPath();ctx.moveTo(mid,box.T);ctx.lineTo(mid,box.T+rh*items.length+4);ctx.stroke();
  items.forEach((it,i)=>{const y=box.T+i*rh+4,w=it.v/m*half;ctx.fillStyle=it.rev?PAL['s3']:(it.v>0?PAL['s2']:PAL['s1']);ctx.fillRect(Math.min(mid,mid+w),y,Math.abs(w),rh-8);
   txt(ctx,it.l,mid-half-8,y+rh/2-4,{s:12,c:PAL['fg'],a:'right',b:'middle'});txt(ctx,sB(it.v),it.v>0?mid+w+6:mid+6,y+rh/2-4,{s:12,c:PAL['fg'],b:'middle',w:600});});
  txt(ctx,'Blue: more spending. Red: less spending. Green: revenue change.',box.L,box.T+rh*items.length+22,{s:12,c:PAL['muted']});},
 draw,
 infoPanel:asksHTML,
 narrate(sim){if(pend(sim))return `Your turn: <b>share = line ÷ total × 100</b>. Work out how many dollars of every $100 go to ${ASKQ[sim.p.gq].p}.`;
  if(!shown(sim))return `You are guessing how many dollars out of every $100 go to ${ASKQ[sim.p.gq].p}. Go with your gut first; then you will work it out.`;
  const d=defc(sim),dc=d-(TOT-REV);
  if(!anyChange(sim))return `The government spent ${B(TOT)} and took in ${B(REV)}, so it <b>borrowed ${B(TOT-REV)}</b>. Social Security is the biggest line; net interest on the debt (${B(1051.8)}) is bigger than national defense (${B(965.2)}).`;
  if(Math.abs(dc)<0.05)return `Your moves add and cut the same amount, so <b>the deficit stays at ${B(d)}</b>. Moving money changes who gets helped, not how much is borrowed.`;
  return `Your changes ${dc<0?'shrink':'grow'} the deficit by <b>${B(Math.abs(dc))}</b>, to ${d>=0?B(d):'a surplus of '+B(-d)}. ${Math.abs(dc)>=TOT*DISC?'That is more than the whole discretionary budget Congress votes on each year.':'Remember that mandatory lines only change if the law changes.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Out of every $100 the federal government spends, how many dollars go to foreign aid (all foreign aid plus the State Department)? Drag <b>Your guess</b>, then lock it in.',
   honors:'Before you see the budget: how many dollars out of every $100 go to international affairs (all foreign aid plus the State Department)? Set <b>Your guess</b> by feel, then lock it in.'},
  lock(sim){const q=sim.p.gq,g=sim.p.guess;return {v:Math.abs(g-truth(q)),q,guess:g,label:`${per100(g)} of every $100 (${B(g/100*TOT)})`};},
  solve(sim){const q=sim.p.gq,t=truth(q);sim.p.guess=+t.toFixed(4);sim.p.show=true;return {v:0,q,guess:t,label:`${per100(t)} of every $100 (${B(L(q).v)})`};},
  hint:{bio:'Lock in your guess. Then you will work out the real share yourself from two numbers.'},
  calc:{unit:'$',d:2,tol:a=>Math.max(0.006,0.005*a),after:'lock',
   prompt:{bio:sim=>{const q=sim.p.gq;return `${ASKQ[q].l} (${ASKQ[q].short}) was <b>${B(L(q).v)}</b>. All federal spending in FY2026 was <b>${B(TOT)}</b>. How many dollars of every $100 is that? Use share = line ÷ total × 100.`;},
    honors:sim=>{const q=sim.p.gq;return `${ASKQ[q].l} was ${B(L(q).v)} out of ${B(TOT)} of FY2026 spending. How many dollars of every $100 is that, to the cent?`;}},
   answer:sim=>share2(sim.p.gq),
   hint:'Divide the line by the total first. That gives dollars per $1. Multiply by 100 for dollars per $100.',
   steps(sim){const q=sim.p.gq,v=L(q).v,f=v/TOT;return [`Share = line ÷ total = ${n1(v)} ÷ ${n1(TOT)} = ${f.toFixed(5)}: that many dollars of every $1.`,
    `Per $100: ${f.toFixed(5)} × 100 = <b>$${share2(q).toFixed(2)}</b>.`,
    q==='ia'?`So 65 cents of every $100. At that share, an $800 monthly paycheck would put $${(8*share2(q)).toFixed(2)} on this line.`:`So about $14 of every $100: more than national defense ($${(965.2/TOT*100).toFixed(2)}).`];}},
  formula(sim){const q=sim.p.gq,v=L(q).v;return `Share = ${n1(v)} ÷ ${n1(TOT)} × 100 = $${share2(q).toFixed(2)} of every $100`+(atLeast('ap')?`<br>Deficit = outlays − receipts = ${n1(TOT)} − ${n1(REV)} = ${n1(TOT-REV)} (billions)`:'');},
  how:{bio:'The math divides the line by the total: share = line ÷ total spending × 100. For international affairs that is $48.0B ÷ $7,395.8B × 100 ≈ 0.65, so about 65 cents of every $100.',
   ap:'Share = line ÷ outlays. International affairs: 48.0 ÷ 7,395.8 = 0.00649. Net interest: 1,051.8 ÷ 7,395.8 = 0.1422.'},
  compare(sim,g,m){const q=g.q,t=truth(q),off=Math.abs(g.guess-t)/100*TOT;
   const extra=q==='ia'?` Cutting all of it would shrink the ${B(TOT-REV)} deficit by only 2.4%.`:` That is more than all of national defense (${B(965.2)}).`;
   if(off<TOT*0.003)return `Your gut was right on: ${per100(g.guess)} against the real ${per100(t)}. The real line is ${B(L(q).v)}.${extra}`;
   return `You guessed ${per100(g.guess)} of every $100; the real figure is <b>${per100(t)}</b>. Your guess was off by <b>${B(off)} a year</b>: about ${big(off*SNAP_PY)} person-years of SNAP, or ${big(off*JET)} F-35 jet-years.${extra}`;},
  again(sim){sim.p.gq=Math.random()<0.5?'ia':'int';sim.p.guess=10;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different line: national defense was $965.2B out of $7,395.8B of FY2026 spending. How many dollars of every $100 went to defense?',answer:13.05,tol:0.03,unit:'$',d:2,hint:'Share = line ÷ total × 100.',explain:'965.2 ÷ 7,395.8 = 0.13051, and × 100 ≈ $13.05 of every $100. Compare international affairs at $0.65: defense is about 20 times bigger.'},
  {lvl:'bio',instant:true,q:'You cut all of international affairs: every dollar of foreign aid and the State Department ($48.0B). What happens to the $1,992.5B deficit?',choices:['It disappears','It falls by about half','It falls by about 2.4%, to $1,944.5B'],correct:2,explain:'$1,992.5B − $48.0B = $1,944.5B. International affairs is 65 cents of every $100 of spending, so cutting it cannot close a gap that big.'},
  {lvl:'bio',instant:true,q:'You move $10B from defense to income security. What happens to the deficit?',choices:['It grows by $10B','It shrinks by $10B','It does not change'],correct:2,explain:'Spending goes down $10B in one line and up $10B in another, so the total and the deficit stay the same. In human terms: about 1,515 F-35 jet-years become about 4.4 million person-years of SNAP.'},
  {lvl:'honors',instant:true,q:'Congress votes each year on only the discretionary part: about 27% of spending, or about $1,997B. To erase the $1,992.5B deficit by cutting only that part, how much of it would have to go?',choices:['About a quarter of it','About half of it','Nearly all of it'],correct:2,explain:'0.27 × $7,395.8B ≈ $1,996.9B, and $1,992.5B ÷ $1,996.9B ≈ 99.8%. That includes defense. Any real plan to close the gap has to touch mandatory programs, interest or taxes, and those need changes in law.'},
  {lvl:'honors',instant:true,q:'SNAP averages $189.36 per person per month. About how many person-years of SNAP does $10B pay for?',choices:['About 44,000','About 440,000','About 4.4 million','About 44 million'],correct:2,explain:'$189.36 × 12 = $2,272.32 per person-year. $10,000,000,000 ÷ $2,272.32 ≈ 4,400,000 person-years.'},
  {lvl:'ap',instant:true,q:'Net interest was $1,051.8B on $32.43T of debt held by the public. At that average rate, about how much yearly interest does this year’s $1,992.5B of borrowing add?',choices:['About $6.5B','About $64.6B','About $199B','About $1,052B'],correct:1,explain:'Average rate ≈ 1,051.8 ÷ 32,430 ≈ 3.24%. 0.0324 × $1,992.5B ≈ $64.6B a year, every year the debt stays.'},
  {lvl:'ap',instant:true,q:'To balance the budget with revenue alone, by what percent would all FY2026 revenue need to rise?',choices:['About 3.7%','About 14%','About 37%','About 100%'],correct:2,explain:'$1,992.5B ÷ $5,403.3B ≈ 0.369, so about 37% more revenue, with spending unchanged.'}
 ],
 tour:[
  {title:'Where the money goes',text:'The blue bar at the top is all federal spending in FY2026: $7,395.8B. Below, each bar is one line of it. Social Security is the biggest: $1,667.1B, or $22.54 of every $100.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true}),focus:sim=>[[10,10,780,32],rowRect(sim,0)]},
  {title:'Where it comes from',text:'Revenue was $5,403.3B, mostly individual income tax ($2,845.5B) and payroll taxes ($1,754.3B). The dashed red gap, $1,992.5B, is the deficit: money the government borrowed.',pause:true,focus:sim=>{const Q=lay(sim._k||1);return [10,Q.y2-6,780,Q.ly-Q.y2+14];}},
  {title:'The smallest lines',text:'International affairs, which holds all foreign aid plus the State Department, is $48.0B: 65 cents of every $100. Net interest on the debt is $1,051.8B, more than national defense.',pause:true,focus:sim=>[rowRect(sim,10),rowRect(sim,2)]},
  {title:'Dollars into people',text:'$1B pays for about 440,000 person-years of SNAP, about 210 million free school lunches, or about 150 years of flying one Air Force F-35. Use these to read every change you make.',pause:true},
  {title:'Move money',text:'Here $10B moved from defense to income security. The deficit does not move. About 1,515 F-35 jet-years became about 4.4 million person-years of SNAP.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,ddf:-10,dis:10})},
  {title:'Values and lines',text:'In 2025 the U.S. Catholic bishops (USCCB) wrote to lawmakers about SNAP, Medicaid, the Child Tax Credit and other items. About lists each ask and the lines it touches. Question for discussion: which line would you move, and what value is behind that choice?',pause:true},
  {lvl:'honors',title:'What Congress votes on each year',text:'Only about 27% of spending is discretionary, set in yearly votes (FY2025, CBO). Social Security, Medicare and most of Medicaid and SNAP are mandatory: they change only when the law changes.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,ddf:0,dis:0})},
  {lvl:'ap',title:'Borrowing has a price',text:'Net interest ÷ debt held by the public = $1,051.8B ÷ $32.43T ≈ 3.24%. At that average rate, this year’s $1,992.5B of borrowing adds about $64.6B of interest every year after.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Can you close the deficit by cutting the lines people argue about most?</p><ol><li>Turn on <b>Show the real budget</b>.</li><li>Cut international affairs to $0 and record a trial.</li><li>Now cut defense by $300B too, and record again.</li><li>Read the bishops’ asks in About: which lines did your cuts touch?</li></ol><p>Write two sentences: how much of the deficit did you close, and what did it cost in human terms?</p>',
  honors:'<p><b>Question:</b> What does a budget that protects SNAP and Medicaid have to give up, or raise?</p><ol><li>Raise income security and health by $50B each.</li><li>Pay for it two different ways: once with spending cuts, once with revenue. Record a trial for each.</li><li>For each, note which lines are mandatory and would need a change in law.</li></ol><p>Explain the trade-off you would choose and the value behind it. There is no single right answer.</p>',
  ap:'<p><b>Question:</b> How does this year’s deficit shape future budgets?</p><ol><li>Record the deficit, debt and added yearly interest for the actual budget.</li><li>Build a budget that cuts the deficit by $500B. Record the same three numbers.</li><li>Compute how many years of the added interest you avoided would pay for your largest single cut.</li></ol><p><b>CER:</b> Make a claim about one trade-off in your budget, with evidence from the readouts and reasoning that names the value you are weighing. Your claim is your own; the math must be right.</p>'},
 terms:[
  {t:'Outlays',d:'Money the government actually spends in a year.'},
  {t:'Receipts',d:'Money the government takes in, mostly from taxes.'},
  {t:'Deficit',d:'Outlays minus receipts. The government borrows to cover it.'},
  {t:'Share',d:'A line ÷ the total. As dollars per $100: line ÷ total × 100.'},
  {t:'Mandatory spending',d:'Spending set by a standing law, such as Social Security and Medicare. It changes only if the law changes.',lvl:'honors'},
  {t:'Discretionary spending',d:'Spending Congress sets in yearly appropriations votes, such as most of defense.',lvl:'honors'},
  {t:'Debt held by the public',d:'What the government owes to outside lenders. Each deficit adds to it.',lvl:'ap'},
  {t:'Net interest',d:'Interest the government pays on its debt, minus interest it earns.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning.</b> Spending, revenue and the deficit are the actual FY2026 totals from the Treasury’s Monthly Treasury Statement, table 9, for the fiscal year ending Sep 30, 2026 (<a href="https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9?filter=record_date:eq:2026-09-30" target="_blank" rel="noopener">Treasury Fiscal Data</a>), stored in this page, not fetched live. Outlays $7,395.8B; receipts $5,403.3B; deficit ≈ $1,992.5B. “Everything else” ($152.0B) and “Other receipts” ($248.9B) are the remainders so the lines add to the totals; they net many smaller items together. Debt held by the public on Sep 30, 2026: $32.43 trillion.</p><p><b>Human units.</b> SNAP: average benefit $189.36 per person per month (USDA, FY2025), so $1B ≈ 440,000 person-years. Free school lunch reimbursement: $4.76 (school year 2026-27), so $1B ≈ 210 million lunches. F-35: about $6.6M per Air Force jet per year to operate (GAO-24-106703), so $1B ≈ 150 jet-years. Pell Grant: the 2026-27 maximum award is $7,395 (Federal Student Aid, Dear Colleague Letter GEN-26-01, Jan 30, 2026, <a href="https://fsapartners.ed.gov/knowledge-center/library/dear-colleague-letters/2026-01-30/2026-27-federal-pell-grant-maximum-and-minimum-award-amounts" target="_blank" rel="noopener">FSA Partners</a>), so $1B ≈ 135,000 maximum awards. The human units are for scale: real programs have overhead and rules, and a line like Income security holds more than SNAP.</p><p><b>What the model leaves out.</b> Moving a slider changes one year only. In real life, cutting or raising a program changes the economy, tax revenue and future years. About 27% of spending is discretionary (CBO, FY2025); the mandatory/discretionary tags on each slider are approximate for lines that mix both. Added interest uses one average rate (net interest ÷ debt ≈ 3.24%); real rates vary by bond.</p><p><b>What the bishops asked (2025).</b> The U.S. Conference of Catholic Bishops (USCCB) asked lawmakers to: protect SNAP and Medicaid (Income security and Health lines); shape a Child Tax Credit that reaches the poorest families (Income security, since the refundable part is paid out as spending, and individual income tax); end taxpayer funding of major abortion providers (a rule about which providers programs pay, not a total, so no slider shows it); support parental choice in education (Education and tax credits; most school funding is state and local); and care for immigrants (spread across lines, including refugee aid in International affairs). A total shows direction only; how a law is written decides who is helped. People weigh these asks differently, and positions on them cut across today’s political lines. This tool does not score a budget. Question for discussion: which of these asks would change your budget, and how?</p><p><b>The section title.</b> “A budget is a moral document” is a phrase the USCCB and others have often used about federal budgets.</p>'+'<p><b>What this number hides.</b> A share of the total hides who receives the money and what it buys. One year hides the debt built up before it. A federal total also hides state and local spending, which pays for most schools.</p>'
};
BioLab.register(SIM);
})();
