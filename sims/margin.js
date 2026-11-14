(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Small effects times huge numbers. Extra votes = (nudge in percentage points / 100) x people who could vote.
   Compared with the certified 537-vote margin in the 2000 presidential race in Florida.
   Closer look: extra voters only move a margin if they lean one way: change in margin = extra x (2 x lean - 1).
   Deep dive: two groups of n people, base rate 18%, the other 18% + nudge. Two-proportion z = d / sqrt(pbar(1 - pbar)(2/n)). */
const FL=537,BASE=18,FB_USERS=61e6,FB_VOTES=340000;
const n0=v=>Math.round(v).toLocaleString('en-US');
const f1=v=>(Math.round(v*10)/10).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const popTxt=v=>v>=1e6?(v/1e6)+' million':n0(v);
const extra=sim=>sim.p.effect/100*sim.p.pop;
const lean=sim=>atLeast('honors')?sim.p.lean:50;
const net=sim=>extra(sim)*(2*lean(sim)/100-1);
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const zOf=sim=>{const d=sim.p.effect/100,p1=BASE/100,pb=p1+d/2;return d/Math.sqrt(pb*(1-pb)*2/sim.p.n);};
const pOf=z=>Math.max(0,1-erf(Math.abs(z)/Math.SQRT2));
const pTxt=p=>p<0.001?'p < 0.001':'p = '+p.toFixed(3);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The answer stays hidden while the student works out the extra votes ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on&&sim.st.peek)||(GS(sim)&&GS(sim).g&&!pend(sim)));
const logOff=(a,b)=>Math.abs(Math.log10(Math.max(a,1))-Math.log10(Math.max(b,1)));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const unitFor=v=>{let u=FL;while(v/u>600)u*=10;return u;};

const SIM={
 id:'margin',hash:'margin',apUnit:1,order:3,tab:'The margin',kind:'Simulation',
 skills:{bio:'Percentage points: a rate times a population · Algebra 1 (Unit 2), US Government (Unit 3)',honors:'Rate × population, and a weighted difference: extra × (2L − 1) · Algebra 1 (Unit 2), US Government (Unit 3)',ap:'Two-proportion z-test: significance vs. size · AP Statistics (Unit 6), AP US Government (Units 4 and 5)'},
 card:'Guess how many extra votes a tiny nudge makes across a whole state, then stack the answer against a 537-vote margin.',
 title:'The margin',
 lede:{bio:'A nudge that moves one person in 250 sounds like nothing. Multiply it by millions of people and it can be bigger than the margin that decided a presidential race. Guess first, then multiply.',
  honors:'Extra votes only change a result if they lean one way. Split them evenly and the margin does not move. Tilt them slightly and a tiny nudge across millions of people can outweigh a close race.',
  ap:'With millions of people, a difference of a fraction of a point is “statistically significant.” Significant means unlikely to be chance. It does not mean large, and a click is not a vote.'},
 scale:'Each small square is 537 votes: the certified margin in the 2000 presidential race in Florida. When the answer is huge, each square stands for 10 or 100 of those margins.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The nudge',
 controls:[
  {id:'guess',label:'Your gut: how many extra votes?',type:'seg',def:1000,options:[{v:100,l:'About 100'},{v:1000,l:'About 1,000'},{v:10000,l:'About 10,000'},{v:100000,l:'About 100,000'},{v:1000000,l:'About 1,000,000'}]},
  {id:'effect',label:'The nudge: change in turnout (or clicks)',type:'range',min:0.1,max:3,step:0.1,def:0.4,unit:' points',noGut:true,onChange:clearGut,help:'Percentage points. 0.4 points means 4 more people out of every 1,000.'},
  {id:'pop',label:'People who could vote',type:'seg',def:6000000,noGut:true,onChange:clearGut,options:[{v:1000000,l:'1 million'},{v:3000000,l:'3 million'},{v:6000000,l:'6 million'},{v:10000000,l:'10 million'},{v:61000000,l:'61 million'}],help:'6 million is an illustrative round number for a big state. 61 million is about the number of users in the 2010 Facebook “I Voted” experiment.'},
  {id:'lean',label:'Share of the extra voters who favor side A',type:'range',min:50,max:70,step:1,def:50,unit:'%',lvl:'honors',noGut:true,help:'50% means the nudge reaches both sides equally.'},
  {id:'n',label:'People in each comparison group',type:'seg',def:1000000,lvl:'ap',noGut:true,options:[{v:1000,l:'1,000'},{v:10000,l:'10,000'},{v:100000,l:'100,000'},{v:1000000,l:'1 million'},{v:30000000,l:'30 million'}],help:'For the significance test: two groups, one at an 18% rate and one at 18% plus the nudge. Group sizes are illustrative.'},
  {id:'reveal',label:'Show the math now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut.'}
 ],
 init(){return {peek:0};},step(){},
 metrics:[
  {id:'extra',label:'Extra votes from the nudge',unit:'votes',d:0,min:0,max:null,get:sim=>shown(sim)?extra(sim):null},
  {id:'times',label:'Times the 537-vote margin',unit:'×',d:1,min:0,max:null,get:sim=>shown(sim)?extra(sim)/FL:null},
  {id:'per',label:'People per extra vote',unit:'people',d:0,min:0,max:null,get:sim=>100/sim.p.effect},
  {id:'net',label:'Change in the margin between the sides',unit:'votes',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?net(sim):null},
  {id:'z',label:'z for this difference',unit:'',d:1,lvl:'ap',min:0,max:null,get:zOf},
  {id:'sig',label:'Significant at the 5% level?',text:true,lvl:'ap',get:sim=>{const z=zOf(sim),p=pOf(z);return (Math.abs(z)>=1.96?'Yes':'No')+`, ${pTxt(p)}`;}}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),E=extra(sim),G=GS(sim),big=k>1.3,hon=atLeast('honors'),ap=atLeast('ap');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(400,0,400,450);
  /* left: the multiplication */
  const X0=26;let y=34*k;
  txt(ctx,n0(sim.p.pop),X0,y,{s:22*k,w:700});y+=20*k;txt(ctx,'people who could vote',X0,y,{s:12*k,c:PAL['cv-soft']});y+=30*k;
  txt(ctx,'× '+f1(sim.p.effect)+' points',X0,y,{s:22*k,w:700});y+=20*k;txt(ctx,big?`${n0(sim.p.effect*10)} per 1,000`:`= ${n0(sim.p.effect*10)} more out of every 1,000`,X0,y,{s:12*k,c:PAL['cv-soft']});y+=34*k;
  if(sh)pill(ctx,big?'= '+n0(E)+' votes':'= '+n0(E)+' extra votes',X0+(big?90:130)*k,y,PAL['rj'],'#fff',16*Math.min(k,1.4));
  else pill(ctx,pend(sim)?'= ? Your turn':'= ? extra votes',X0+(big?80:90)*k,y,pend(sim)?PAL['rj']:PAL['muted'],'#fff',16*Math.min(k,1.4));
  y+=36*k;
  txt(ctx,'Florida, 2000 presidential race:',X0,y,{s:12*k,c:PAL['cv-ink']});y+=20*k;txt(ctx,'certified margin of 537 votes',X0,y,{s:12*k,w:700});y+=24*k;
  if(sh){txt(ctx,big?`= ${f1(E/FL)} × that margin`:`The nudge is ${f1(E/FL)} times that margin.`,X0,y,{s:13*k,w:700,c:PAL['rj']});y+=22*k;
   if(G&&G.m&&!big){txt(ctx,`${n0(E)} ÷ 537 = ${f1(E/FL)}`,X0,y,{s:12*k,c:PAL['cv-soft']});y+=22*k;}else y+=4*k;}
  if(hon&&sh&&y<420){const nv=net(sim);txt(ctx,big?`Split ${lean(sim)}/${100-lean(sim)}: margin moves ${n0(nv)}`:`Split ${lean(sim)}% / ${100-lean(sim)}%: the margin moves ${n0(nv)} votes`,X0,y,{s:12*k,c:nv>=FL?PAL['rj']:PAL['cv-ink'],w:nv>=FL?700:400});y+=22*k;}
  if(ap&&y<430&&!big){const z=zOf(sim);txt(ctx,`${n0(sim.p.n)} per group: z = ${f1(z)}, ${Math.abs(z)>=1.96?'significant':'not significant'}`,X0,y,{s:12*k,c:PAL['cv-soft']});}
  /* right: squares, each one a 537-vote margin */
  const RX=420,RW=360,top=66*k;
  const gv=G&&G.g?G.g.guess:0,U=unitFor(Math.max(sh?E:0,gv)),HH=440-top-(big?50:56)*k;
  /* square size: as big as fits (12 to 36 px) */
  const need=Math.max(1,Math.ceil(Math.max(sh?E:0,gv)/U));let sz=36,cols=10;
  while(sz>12){cols=Math.floor(RW/sz);if(Math.ceil(need/cols)*sz<=HH)break;sz--;}cols=Math.floor(RW/sz);
  const unitLab=U===FL?'Each square = 537 votes':`Each square = ${n0(U/FL)} margins (${n0(U)} votes)`;
  txt(ctx,big?'Extra votes in margins':'The extra votes, in 537-vote margins',RX,30*k,{s:13*k,w:700});
  txt(ctx,big?(U===FL?'Square = 537 votes':`Square = ${n0(U)} votes`):unitLab,RX,30*k+18*k,{s:12*k,c:PAL['cv-soft']});
  const cell=i=>[RX+(i%cols)*sz,top+Math.floor(i/cols)*sz],g2=Math.max(2,Math.round(sz*0.12));
  let ly=top;
  if(sh){const cnt=E/U,full=Math.floor(cnt),part=cnt-full;ctx.fillStyle=PAL['rj'];
   for(let i=0;i<full;i++){const [x,yy]=cell(i);ctx.fillRect(x,yy,sz-g2,sz-g2);}
   if(part>0.02){const [x,yy]=cell(full);ctx.fillRect(x,yy,(sz-g2)*part,sz-g2);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1;ctx.strokeRect(x+.5,yy+.5,sz-g2-1,sz-g2-1);}
   ly=top+Math.ceil(cnt)/cols*0+Math.ceil(Math.ceil(cnt)/cols)*sz;}
  else{ctx.fillStyle=PAL['rj'];ctx.fillRect(RX,top,sz-g2,sz-g2);txt(ctx,'← one margin: 537 votes',RX+sz+6,top+sz/2,{s:12*k,c:PAL['cv-ink'],b:'middle'});
   txt(ctx,big?'How many squares?':'How many of these would the nudge fill?',RX,top+sz+24*k,{s:12*k,c:PAL['cv-soft']});ly=top+sz+24*k;}
  if(G&&G.g){const gf=Math.ceil(gv/U);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();
   for(let r=0;r*cols<gf;r++){const inRow=Math.min(cols,gf-r*cols);ctx.rect(RX-2,top+r*sz-2,inRow*sz-g2+4,sz-g2+4);}ctx.stroke();
   ly=Math.max(ly,top+Math.ceil(gf/cols)*sz);}
  ly+=20*k;
  if(sh){txt(ctx,`Math: ${f1(E/FL)} margins`,RX,ly,{s:12*k,w:700,c:PAL['rj']});ly+=20*k;}
  if(G&&G.g)txt(ctx,big?`Gut: ${f1(gv/FL)} margins`:`Your gut: ${n0(gv)} votes, ${f1(gv/FL)} margins`,RX,ly,{s:12*k,w:700,c:PAL['s4']});},
 narrate(sim){const E=extra(sim),r=E/FL;
  if(!shown(sim)&&pend(sim))return `<b>Your turn:</b> ${f1(sim.p.effect)} ÷ 100 × ${n0(sim.p.pop)} = ? Work out the extra votes.`;
  if(!shown(sim))return `${n0(sim.p.pop)} people could vote, and a reminder raises turnout by ${f1(sim.p.effect)} percentage points. <b>How many extra votes is that?</b> Pick your gut answer, then lock it in.`;
  let s=`${f1(sim.p.effect)} points of ${n0(sim.p.pop)} is <b>${n0(E)} extra votes</b>, ${f1(r)} times the 537-vote margin of the 2000 presidential race in Florida.`;
  if(atLeast('honors')){const nv=net(sim);s+=lean(sim)===50?' <b>Split evenly, they move the margin by 0.</b>':` Split ${lean(sim)}% to ${100-lean(sim)}%, they move the margin by <b>${n0(nv)}</b> votes${nv>=FL?', more than 537':''}.`;}
  return s;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'A big state has 6 million people who could vote. A reminder message nudges turnout up by 0.4 percentage points: 4 more voters out of every 1,000. Pick how many extra votes you think that makes, then lock it in.',
   honors:'Pick the size of the answer by feel: how many extra votes does this nudge make? Then lock it in.'},
  lock(sim){const E=extra(sim);return {v:logOff(sim.p.guess,E),guess:sim.p.guess,label:`about ${n0(sim.p.guess)} extra votes`};},
  solve(sim){const E=extra(sim);sim.p.guess=E;return {v:0,guess:E,label:`${n0(E)} extra votes`};},
  hint:{bio:'Lock in your gut answer. Then you will work out the real number yourself: points ÷ 100, times the people.'},
  calc:{unit:'votes',d:0,tol:a=>Math.max(1,0.01*a),
   prompt:{bio:sim=>`${n0(sim.p.pop)} people could vote, and the nudge raises turnout by <b>${f1(sim.p.effect)} percentage points</b>. Turn the points into a decimal (divide by 100), then multiply by the people. How many extra votes is that?`,
    ap:sim=>`Use extra = (Δ ÷ 100) × N with Δ = ${f1(sim.p.effect)} points and N = ${n0(sim.p.pop)}. How many extra votes?`},
   answer:sim=>Math.round(extra(sim)),
   hint:'Percentage points out of 100: 0.4 points is 0.4 ÷ 100 = 0.004. Multiply that decimal by the number of people.',
   steps(sim){const d=sim.p.effect/100,E=extra(sim);return [`Points to a decimal: ${f1(sim.p.effect)} ÷ 100 = ${+d.toFixed(4)}.`,`Multiply by the people: ${+d.toFixed(4)} × ${n0(sim.p.pop)} = <b>${n0(E)}</b> extra votes.`,`Compare with the margin: ${n0(E)} ÷ 537 = ${f1(E/FL)} times the 2000 Florida margin.`];}},
  formula(sim){const E=extra(sim),base=`Extra votes = ${f1(sim.p.effect)} ÷ 100 × ${n0(sim.p.pop)} = ${n0(E)}, and ${n0(E)} ÷ 537 = ${f1(E/FL)} margins`;
   if(atLeast('honors')&&lean(sim)!==50)return base+`<br>Margin moves ${n0(E)} × (2 × ${(lean(sim)/100).toFixed(2)} − 1) = ${n0(net(sim))} votes`;return base;},
  how:{bio:'Turn the points into a fraction and multiply: 0.4 points is 0.4 ÷ 100 = 0.004, and 0.004 × 6,000,000 = 24,000.',
   ap:'Extra = (Δ / 100) × N. A shift in the margin also needs a lean L: Δmargin = extra × (2L − 1).'},
  compare(sim,g,m){const E=m.guess,ratio=g.guess>E?g.guess/E:E/g.guess;
   if(ratio<1.6)return `Your gut was right on: about ${n0(g.guess)} against ${n0(E)}. You already sense how fast small rates grow across big groups. That is <b>${f1(E/FL)} times</b> the 537-vote Florida margin.`;
   return `Your gut said about <b>${n0(g.guess)}</b> (${f1(g.guess/FL)} margins). The math says <b>${n0(E)}</b>: ${f1(E/FL)} times the 537-vote margin that decided the 2000 presidential race in Florida. Your gut was off by a factor of about <b>${n0(ratio)}</b>. ${g.guess<E?'Most people guess low, because 4 in 1,000 feels like nothing.':'The rate is small, so even millions of people give fewer extra votes than it seems.'}`;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.effect=R([0.1,0.2,0.3,0.4,0.5,0.8,1,1.5,2]);sim.p.pop=R([1e6,3e6,6e6,1e7,6.1e7]);sim.p.guess=1000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Student council: 1,600 students can vote. A reminder text raises turnout by 5 percentage points. How many extra votes is that? (Suppose last year’s race was decided by 12 votes.)',answer:80,tol:0,unit:'votes',d:0,hint:'5 points is 5 ÷ 100 = 0.05 of the students.',explain:'5 ÷ 100 = 0.05, and 0.05 × 1,600 = 80 extra votes: almost 7 times a 12-vote margin. They only change the result if they lean one way.'},
  {lvl:'bio',instant:true,q:'A nudge raises turnout by 0.1 percentage points among 1 million people who could vote. Is that more or less than 537 votes?',choices:['Less: 0.1 points is too small to matter','About 1,000 votes: almost twice 537','About 100,000 votes'],correct:1,explain:'0.1 points is 1 in 1,000. 1,000,000 ÷ 1,000 = 1,000 extra votes, which is 1.9 times the 537-vote margin of the 2000 presidential race in Florida.'},
  {lvl:'bio',instant:true,q:'In the 2010 Facebook experiment, about 20% of users shown friends’ “I Voted” photos clicked the button, against about 18% shown the message without friends. How big is that difference?',choices:['2%','2 percentage points, which is about 11% more clicks','20%'],correct:1,explain:'20% − 18% = 2 percentage points. As a share of 18%, it is 2 ÷ 18 ≈ 11% more clicks. Saying “2%” mixes up the two, and news stories often do.'},
  {lvl:'bio',instant:true,q:'Does a click on an “I Voted” button prove that someone voted?',choices:['Yes: people would not click if they had not voted','No: a click is a proxy. The researchers checked public voting records, and estimated about 340,000 extra votes','No, and nobody can ever check'],correct:1,explain:'A click is easy to measure but is not the thing you care about. The researchers matched users to public voting records to estimate real votes: about 340,000 across about 61 million users, about 1 for every 180 users.'},
  {lvl:'honors',instant:true,q:'A nudge adds 24,000 voters, and they split exactly 50% to 50% between two sides. How much does the margin between the sides change?',choices:['24,000 votes','12,000 votes','0 votes'],correct:2,explain:'Each side gains 12,000, so the gap between them stays the same. Turnout went up for everyone; the result did not move. A nudge only shifts a margin if it reaches one side more than the other.'},
  {lvl:'honors',instant:true,q:'The same 24,000 extra voters split 52% to 48%. How much does the margin move?',choices:['About 480 votes','About 960 votes: more than 537','About 12,000 votes'],correct:1,explain:'Side A gains 0.52 × 24,000 = 12,480 and side B gains 11,520. The gap changes by 960 votes, which is 1.8 times the 537-vote margin. A small tilt in a small nudge can still decide a close race.'},
  {lvl:'ap',instant:true,q:'Two groups of 1,000 people: 18.0% vs 18.4% (a 0.4-point difference). Is it statistically significant at the 5% level?',choices:['Yes, z ≈ 7.3','No, z ≈ 0.23','Yes, z ≈ 2.3'],correct:1,explain:'z = 0.004 ÷ √(0.182 × 0.818 × 2 ÷ 1,000) ≈ 0.004 ÷ 0.0173 ≈ 0.23. A difference that small is easily chance with 1,000 people per group. With 1 million per group, the same difference gives z ≈ 7.3.'},
  {lvl:'ap',instant:true,q:'With 30 million people per group, 18.0% vs 18.1% gives z ≈ 10. What should you conclude?',choices:['The effect is large','The difference is almost surely real, but it is still tiny: 1 extra person per 1,000','The test is broken'],correct:1,explain:'Significant means unlikely to be chance. With huge groups, even a 0.1-point difference is significant. Whether it matters depends on its size and on what it adds up to: here 1 in 1,000, which is 30,000 people across 30 million.'}
 ],
 tour:[
  {title:'The nudge',text:'A big state has 6 million people who could vote. A reminder message raises turnout by 0.4 percentage points: 4 more voters out of every 1,000. That sounds like nothing.',pause:true,focus:[10,0,380,200],setup:sim=>{BioLab.setValues(sim,{effect:0.4,pop:6000000,lean:50,n:1000000,reveal:false});sim.st.peek=0;}},
  {title:'Multiply',text:'0.4 points is 0.4 ÷ 100 = 0.004. Then 0.004 × 6,000,000 = 24,000 extra votes.',pause:true,focus:[10,0,380,250],setup:sim=>{sim.st.peek=1;}},
  {title:'Against a real margin',text:'The 2000 presidential race in Florida was decided by a certified margin of 537 votes. Each red square is one of those margins. 24,000 votes fill about 44.7 of them.',pause:true,focus:[400,0,400,450],setup:sim=>{sim.st.peek=1;}},
  {title:'61 million people',text:'In 2010, researchers showed about 61 million Facebook users a get-out-the-vote message. Here, a 0.6-point nudge across 61 million gives 366,000 votes. The researchers’ own estimate was about 340,000 extra votes: about 633 Florida margins.',pause:true,setup:sim=>{BioLab.setValues(sim,{pop:61000000,effect:0.6});sim.st.peek=1;}},
  {stn:{card:{x:20,y:292,w:360,title:'A click is not a vote',lines:['To count real votes, researchers matched users to public voting records.'],bars:[{l:'Saw friends’ “I Voted” photos',v:20,max:25,t:'20%'},{l:'No friends shown',v:18,max:25,t:'18%'}]}},title:'A click is not a vote',text:'About 20% of users who saw friends’ “I Voted” photos clicked the button, against about 18% without friends. But a click is a proxy. To count real votes, researchers matched users to public voting records.',pause:true,setup:sim=>{sim.st.peek=1;}},
  {lvl:'honors',title:'Which way they lean',text:'If the 24,000 extra voters split 50/50, the margin does not move at all. At 52% to 48%, it moves 960 votes: more than 537. A nudge matters to a result only if it reaches one side more.',pause:true,setup:sim=>{BioLab.setValues(sim,{pop:6000000,effect:0.4,lean:52});sim.st.peek=1;}},
  {lvl:'ap',title:'Significant is not the same as big',text:'With 1 million people per group, an 18.0% vs 18.4% difference gives z ≈ 7.3: almost surely real. It is still only 4 people in 1,000. Ask how big an effect is, and what it adds up to, not only whether it is significant.',pause:true,setup:sim=>{BioLab.setValues(sim,{pop:6000000,effect:0.4,lean:50,n:1000000});sim.st.peek=1;}}
 ],
 lab:{bio:'<p><b>Question:</b> How small can a nudge be and still beat a 537-vote margin?</p><ol><li>Turn on <b>Show the math now</b>. Pick 1 million people.</li><li>Set the nudge to 0.1, 0.2, 0.5 and 1 point. Record a trial each time.</li><li>Repeat with 6 million.</li></ol><p>Write one sentence: what is the smallest nudge that beats 537 in each state?</p>',
  honors:'<p><b>Question:</b> When does a nudge change a result?</p><ol><li>Use 6 million people and a 0.4-point nudge.</li><li>Set the lean to 50%, 51%, 52% and 55%. Record the change in the margin.</li><li>Find the smallest lean that moves the margin more than 537.</li></ol><p>Then a discussion question with no single right answer: should a platform be allowed to show a voting reminder to some users and not others? Give the strongest case on each side.</p>',
  ap:'<p><b>Question:</b> How does group size change significance?</p><ol><li>Set the nudge to 0.4 points. Record z for each group size from 1,000 to 30 million.</li><li>Find the smallest group size where 0.1 points is significant.</li></ol><p><b>CER:</b> Explain why z grows like √n, and argue whether “statistically significant” tells a reader what they need to know.</p>'},
 terms:[
  {t:'Percentage point',d:'The plain difference between two percentages. 20% − 18% is 2 percentage points.'},
  {t:'Margin',d:'How many more votes the winner got than the runner-up.'},
  {t:'Turnout',d:'The share of people who could vote who actually do.'},
  {t:'Proxy',d:'Something easy to measure that stands in for what you care about, like a button click standing in for a vote.'},
  {t:'Relative change',d:'A difference as a share of the starting value. From 18% to 20% is 2 points, or about 11% relative.',lvl:'honors'},
  {t:'Statistical significance',d:'A result unlikely to come from chance alone. It says nothing about whether the effect is big.',lvl:'ap'},
  {t:'Two-proportion z-test',d:'z = (p₂ − p₁) ÷ √(p̄(1 − p̄)(1/n₁ + 1/n₂)). |z| ≥ 1.96 is significant at the 5% level.',lvl:'ap'}
 ],
 about:'<p><b>Facts used.</b> The 2000 presidential race in Florida was decided by a certified margin of 537 votes. In the 2010 Facebook “I Voted” experiment (Bond and colleagues, <i>Nature</i>, 2012, also described in Chapter 10 of Cathy O’Neil’s <i>Weapons of Math Destruction</i>), about 61 million users saw a get-out-the-vote message. About 20% of those shown friends’ “I Voted” photos clicked the button, against about 18% of those shown the message without friends. By matching users to public voting records, the researchers estimated about 340,000 additional votes.</p>'+
  '<p><b>Assumptions.</b> “6 million people who could vote” is an illustrative round number, not any state’s official count. Extra votes = nudge (in points) ÷ 100 × people, which assumes the nudge reaches everyone equally. The lean slider is a what-if, not data about any group. The significance panel uses two equal groups with an 18% base rate; the group sizes are for illustration and are not the experiment’s design. O’Neil’s concern is that a platform able to nudge millions of people at once holds real power over close elections, and the public cannot see who was nudged.</p>'+
  '<p><b>What this number hides.</b> “24,000 extra votes” is one total. It hides which way those voters lean (split evenly, the margin does not move), who was nudged and who was not, and whether the thing counted was a vote or only a click. The 537 is also one total: millions of votes on each side.</p>'+
  '<p><b>Catholic social teaching.</b> The U.S. bishops’ <i>Forming Consciences for Faithful Citizenship</i> calls participation in political life a moral obligation. Question for discussion: what do small acts add up to across a whole community, and who should be able to see who was nudged?</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
