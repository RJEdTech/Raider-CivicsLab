(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* The gap between groups: reading a percentage-point gap.
   U.S. Census Bureau, CPS Voting and Registration Supplement, November 2024 (released April 30, 2025): 65.3% of citizens 18+
   voted (154 million); 66.9% of women and 63.7% of men voted. As a share of the whole voting-age population (USAFacts from the same
   survey): women 61.0%, men 57.4%. 1980 was the first presidential election in which women voted at a higher rate than men
   (59.4% vs 59.1% of the voting-age population), and they have in every presidential election since (CAWP). */
const W24=66.9,M24=63.7,GAP=+(W24-M24).toFixed(1),REL=100*(W24/M24-1),VW=61.0,VM=57.4;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f1=v=>(+v).toFixed(1),sg=v=>(v>0?'+':v<0?'−':'')+Math.abs(v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;
 lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}

const SIM={
 id:'turnoutgap',hash:'turnoutgap',apUnit:6,order:3,tab:'The gap between groups',kind:'Learning tool',prereq:['turnout'],next:['pollmiss'],
 skills:{bio:'Percentage points: the difference between two percents · Algebra 1 (Unit 2), Sociology (Unit 4: gender), US Government (Unit 3: elections)',
  honors:'Percentage points vs. percent difference · Algebra 1 (Unit 2), Statistics (Chapter 1), AP US Government (Unit 5: participation)',
  ap:'Is a gap real? Margin of error for a difference between two groups · AP Statistics (Unit 6), AP US Government (Unit 4: polling)'},
 card:'Guess which group voted at a higher rate in 2024 and by how much, then work out the gap in percentage points and see why the same gap can be reported three ways.',
 title:'The gap between groups',
 lede:{bio:'Sociologists and journalists compare groups all the time: women and men, young and old. Learn to read a gap between two percents, and to ask who counted and how.',
  honors:'A 3-point gap can be reported as “3 points” or “5% higher.” Both are true. Know which one you are reading.',
  ap:'A gap measured in a survey is only real if it is bigger than the noise. Use the margin of error for a difference before you trust a gap.'},
 scale:'U.S. citizens 18 and older, November 2024 (Census Bureau survey).',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: women’s turnout minus men’s, in percentage points',type:'range',min:-10,max:10,step:0.5,def:0,unit:' points',d:1,help:'Negative means men voted at a higher rate.'},
  {id:'reveal',label:'Show the rates now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'w',label:'Women citizens who voted',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?W24:null},
  {id:'m',label:'Men citizens who voted',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?M24:null},
  {id:'gap',label:'Gap (women − men)',unit:'points',d:1,min:-10,max:10,get:s=>shown(s)?GAP:null},
  {id:'rel',label:'Women’s rate, percent higher',unit:'%',d:1,lvl:'honors',min:0,max:20,get:s=>shown(s)?REL:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3,inTour=sim.tour&&sim.tour.on;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  txt(ctx,'100 citizens in each group, 2024',20,18,{s:14*k,w:700,b:'middle'});
  const rows=[{l:'Women',v:W24,c:'#8a4fbf',st:1},{l:'Men',v:M24,c:'#2b7a8c',st:2}],cs=big?11:13,gx=90,LW=10*(cs+3);
  rows.forEach((r,ri)=>{const y0=44+ri*(10*(cs+3)+34*k),on=sh&&(s>=r.st);txt(ctx,r.l,20,y0+LW/2,{s:14*k,w:700,b:'middle',c:on?r.c:PAL['cv-soft']});
   for(let i=0;i<100;i++){const c=i%10,rr2=(i/10)|0,x=gx+c*(cs+3)+cs/2,y=y0+rr2*(cs+3)+cs/2,full=on&&i<Math.floor(r.v),part=on&&i===Math.floor(r.v);
    ctx.fillStyle=full?r.c:PAL['line'];ctx.beginPath();ctx.arc(x,y,cs/2,0,7);ctx.fill();
    if(part){ctx.save();ctx.beginPath();ctx.rect(x-cs/2,y-cs/2,cs*(r.v%1),cs);ctx.clip();ctx.fillStyle=r.c;ctx.beginPath();ctx.arc(x,y,cs/2,0,7);ctx.fill();ctx.restore();}}
   if(on)txt(ctx,f1(r.v)+' of 100 voted',gx+LW+10,y0+LW/2,{s:13*k,w:700,b:'middle',c:r.c});
   if(s===r.st&&inTour)ring(ctx,gx-6,y0-6,LW+150,LW+8);});
  /* right: the zoomed axis */
  const RX=400,RW=W-RX-24,ay=96,X=v=>RX+(v-56)/(70-56)*RW;
  if(!big)txt(ctx,'Zoomed in: 56% to 70%',RX,40,{s:13*k,w:700,b:'middle',c:PAL['cv-soft']});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(RX,ay);ctx.lineTo(RX+RW,ay);ctx.stroke();
  [56,58,60,62,64,66,68,70].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),ay-4);ctx.lineTo(X(v),ay+4);ctx.stroke();txt(ctx,v+'%',X(v),ay+16*k,{s:11*k,a:'center',c:PAL['cv-soft']});});
  if(sh&&s>=1){[[W24,'#8a4fbf','W',s>=1],[M24,'#2b7a8c','M',s>=2]].forEach(([v,c,l,ok])=>{if(!ok)return;ctx.fillStyle=c;ctx.beginPath();ctx.arc(X(v),ay,7,0,7);ctx.fill();txt(ctx,l+' '+f1(v)+'%',X(v),ay-16,{s:12*k,w:700,a:'center',c});});}
  if(sh&&s>=3){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(M24),ay+34*k);ctx.lineTo(X(W24),ay+34*k);ctx.stroke();
   txt(ctx,`gap: ${f1(GAP)} percentage points`,(X(M24)+X(W24))/2,ay+50*k,{s:13*k,w:700,a:'center',c:PAL['s1']});if(s===3)ring(ctx,X(M24)-90,ay+22*k,X(W24)-X(M24)+180,40*k);}
  if(s===7){[[VW,'#8a4fbf','W (all adults)'],[VM,'#2b7a8c','M (all adults)']].forEach(([v,c,l],i)=>{ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(v),ay,7,0,7);ctx.stroke();txt(ctx,(i?'M ':'W ')+'adults '+f1(v)+'%',X(v),ay-(i?44:30)*k,{s:11*k,w:700,a:'center',c});});ring(ctx,X(VM)-50,ay-40*k,X(VW)-X(VM)+100,78*k);}
  const S0=sim.gutS,gv=inTour?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  if(gv!=null&&!sh)txt(ctx,`Your gut: women ${sg(gv)} points vs. men`,RX,ay+46*k,{s:13*k,w:700,c:PAL['s4'],b:'middle'});
  /* lower right: step box */
  const by=ay+72*k,bh=H-by-14;
  if(s===4&&atLeast('honors'))box(ctx,k,RX,by,RW,bh,'Points vs. percent',[`Points: 66.9 − 63.7 = ${f1(GAP)} percentage points.`,`Percent: ${f1(GAP)} ÷ 63.7 = ${f1(REL)}% higher.`,'Both are true. A headline may use whichever sounds bigger.']);
  else if(s===5&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'Is a gap real?',['Poll of 500 women and 500 men: each rate ±4.5 points; the gap ±6.3. A 3.2-point gap could be noise.','The Census survey covers about 60,000 households, so this gap is far bigger than its noise.']);
  else if(s===6)box(ctx,k,RX,by,RW,bh,'Since 1980',['1980: the first presidential election where women voted at a higher rate than men (59.4% vs. 59.1%).','Women have in every presidential election since.']);
  else if(s===7)box(ctx,k,RX,by,RW,bh,'Same gap, different denominator',['Share of all adults, not only citizens: women 61.0%, men 57.4%.',`Gap: 3.6 points. Surveys also over-count voting a little: some people say they voted when they did not.`]);
  else if(s===99&&sh)box(ctx,k,RX,by,RW,bh,'The math',[`66.9 − 63.7 = ${f1(GAP)} percentage points.`,atLeast('honors')?`${f1(GAP)} ÷ 63.7 = ${f1(REL)}% higher.`:'A gap between two percents is measured in percentage points.']);
 },
 narrate(sim){if(!shown(sim))return `In the 2024 election, did women or men citizens vote at a higher rate, and by how many percentage points? Your gut right now: women ${sg(sim.p.guess)} points.`;
  return `<b>66.9%</b> of women citizens and <b>63.7%</b> of men citizens voted in 2024: a gap of <b>${f1(GAP)} percentage points</b>. Women have voted at a higher rate in every presidential election since 1980.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the 2024 presidential election, did women or men citizens vote at a higher rate, and by how many percentage points? Drag right if women voted more, left if men did. Then lock it in.',
   honors:'Women’s turnout minus men’s turnout in 2024, in percentage points: drag to your gut guess, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the gap yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-GAP),guess:sim.p.guess,label:`women ${sg(sim.p.guess)} points`};},
  solve(sim){sim.p.guess=GAP;return {v:0,guess:GAP,label:`women +${f1(GAP)} points (66.9% vs. 63.7%)`};},
  calc:{unit:'points',d:1,tol:0.05,
   prompt:{bio:'The Census Bureau found <b>66.9%</b> of women citizens and <b>63.7%</b> of men citizens voted in 2024. What is the gap, women minus men, in percentage points?',ap:'Women 66.9%, men 63.7%. Give the gap in percentage points (women − men).'},
   answer:()=>GAP,hint:'Subtract the two percents: 66.9 − 63.7.',
   steps:()=>['A gap between two percents is a subtraction.',`66.9 − 63.7 = <b>${f1(GAP)} percentage points</b>.`,`Not 3.2%: as a percent of men’s rate it is ${f1(GAP)} ÷ 63.7 = ${f1(REL)}% higher.`]},
  formula:()=>`Gap = 66.9% − 63.7% = ${f1(GAP)} percentage points`+(atLeast('honors')?`<br>Relative: ${f1(GAP)} ÷ 63.7 = ${f1(REL)}% higher`:''),
  how:{bio:'Subtract one percent from the other. The answer is in percentage points.',honors:'Percentage points subtract two percents. “Percent higher” divides the gap by the smaller rate.'},
  compare(sim,g){const off=Math.abs(g.guess-GAP);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the gap yourself.':'';
   return (off<=1?'Right on: within a point.':`You guessed women ${sg(g.guess)} points. The survey found <b>+${f1(GAP)}</b>, so you were off by ${f1(off)} points.`)+(g.guess<=0?' Many people expect men to vote more; women have voted at a higher rate in every presidential election since 1980.':'')+self;},
  again(sim){sim.p.guess=0;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'As a share of all adults (citizens or not), 61.0% of women and 57.4% of men voted in 2024. What is the gap in percentage points?',answer:3.6,tol:0.05,unit:'points',d:1,hint:'61.0 − 57.4.',explain:'61.0 − 57.4 = 3.6 points. Same election, different denominator, slightly different gap.'},
  {lvl:'bio',instant:true,q:'A headline says “Women out-voted men by 3.2%.” What should it say?',choices:['It is correct','3.2 percentage points (or about 5% higher)','32 points'],correct:1,explain:'66.9 − 63.7 is 3.2 percentage points. As a percent of men’s rate it is about 5% higher.'},
  {lvl:'honors',kind:'num',q:'By what percent is women’s turnout rate (66.9%) higher than men’s (63.7%)? Round to one decimal place.',answer:+REL.toFixed(1),tol:0.1,unit:'%',d:1,hint:'(66.9 − 63.7) ÷ 63.7 × 100.',explain:`3.2 ÷ 63.7 × 100 ≈ ${f1(REL)}%. Percentage points and percent differences answer different questions.`},
  {lvl:'honors',instant:true,q:'Women cast millions more votes than men in 2024. Which explains that best?',choices:['Only the higher turnout rate','A higher turnout rate and more women than men among adult citizens, especially at older ages','Men are not allowed to register'],correct:1,explain:'A count is people × rate. Both parts favor women.'},
  {lvl:'ap',kind:'num',q:'In a poll of 500 women and 500 men, each rate has a margin of error of about 1/√500. To one decimal place, what is that in percentage points?',answer:100/Math.sqrt(500),tol:0.1,unit:'points',d:1,hint:'1 ÷ √500 = 0.0447, then × 100.',explain:'About ±4.5 points for each group, and about ±6.3 for the gap between them (√2 × 4.5). A 3.2-point gap would not be clear in such a poll.'},
  {lvl:'ap',instant:true,q:'Why might a survey show higher turnout than official vote counts?',choices:['Survey takers add votes','Some people say they voted when they did not, and people who vote are more likely to answer surveys','Official counts include non-citizens'],correct:1,explain:'Over-reporting and nonresponse both push survey turnout up. The Census Bureau notes this.'}
 ],
 tour:[
  {title:'Women citizens',text:'Out of every 100 women citizens 18 and older, 66.9 voted in 2024, according to the Census Bureau’s survey right after the election.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Men citizens',text:'Out of every 100 men citizens, 63.7 voted.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'A gap in percentage points',text:'66.9 − 63.7 = 3.2. The gap between two percents is measured in percentage points, not percent.',pause:true,setup:sim=>{sim.tst=3;}},
  {lvl:'honors',title:'Points vs. percent',text:'The same gap is 3.2 ÷ 63.7 ≈ 5.0% higher. “3.2 points” and “5% higher” are both true. A headline may pick whichever sounds bigger.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'ap',title:'Is the gap real?',text:'In a poll of 500 women and 500 men, each rate has a margin of error near ±4.5 points, and the gap about ±6.3: a 3.2-point gap could be noise. The Census survey covers about 60,000 households, so this gap is real.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'Since 1980',text:'1980 was the first presidential election in which women voted at a higher rate than men, 59.4% to 59.1% of adults. Women have voted at a higher rate in every presidential election since.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Who counted, and how?',text:'Count all adults instead of citizens and the rates fall to 61.0% and 57.4%: a 3.6-point gap. Surveys also over-count voting a little. Always ask what the denominator is.',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How big is the turnout gap between women and men?</p><ol><li>Lock in your gut, then work out the gap in percentage points.</li><li>Work out the gap again using all adults (61.0% and 57.4%).</li></ol><p>Write one sentence explaining why the two gaps differ.</p>',
  honors:'<p><b>Question:</b> How should a gap be reported?</p><ol><li>Write the gap as percentage points and as a percent difference.</li><li>Find a news story that reports a gap between groups. Which way did it report it?</li></ol>',
  ap:'<p><b>Question:</b> When is a gap between two groups real?</p><ol><li>Compute the margin of error for each group and for the difference, for samples of 500, 2,000 and 100,000.</li><li>For each sample size, decide whether a 3.2-point gap is clear.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Percentage point',d:'The unit for the difference between two percents: 66.9% − 63.7% = 3.2 points.'},
  {t:'Turnout rate',d:'People who voted ÷ people who could vote. The denominator can be citizens, all adults or registered voters.'},
  {t:'Percent difference',d:'A gap divided by a base rate: 3.2 ÷ 63.7 ≈ 5% higher.',lvl:'honors'},
  {t:'Margin of error',d:'About 1/√n for a percent from a random sample of n people (95% confidence). A gap between two groups has a larger margin.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> U.S. Census Bureau, 2024 Presidential Election Voting and Registration Tables (April 30, 2025; <a href="https://www.census.gov/newsroom/press-releases/2025/2024-presidential-election-voting-registration-tables.html" target="_blank" rel="noopener">link</a>): 65.3% of the citizen voting-age population voted (154 million); 66.9% of women and 63.7% of men. USAFacts, from the same survey: 61.0% of voting-age women and 57.4% of men; 1980 was the first presidential election in which women voted at a higher rate (59.4% vs 59.1%). Center for American Women and Politics (Rutgers): women have voted at higher rates in every presidential election since 1980, and the survey over-reports voting.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>A national gap hides differences by age, education and marital status. CAWP finds almost no turnout gap among married citizens.</li><li>A survey records what people say. Some over-report voting.</li><li>Turnout says who voted, not how they voted. This tool does not report vote choice.</li></ul>'
};
BioLab.register(SIM);
})();
