(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Why polls miss. A city of 200,000 adults: 40% have a college degree. Volunteer rates: 40% of graduates, 20% of everyone else,
   so the true share who volunteered is 0.4 x 40% + 0.6 x 20% = 28%. All of these are illustrative assumptions.
   Base response rate R0 = 3.85%. Graduates answer EGAP times as often; volunteers answer VGAP times as often.
   Respondent cells (graduate & volunteer, graduate & not, other & volunteer, other & not):
     0.4*E*0.4*V, 0.4*E*0.6, 0.6*0.2*V, 0.6*0.8.  Raw result = volunteer cells / all cells.
   Weighting by education (post-stratification): within each degree group the volunteer share among respondents is
     p*V / (p*V + 1 - p), and the weighted result = 0.4*(graduate share) + 0.6*(other share). Education gap drops out; the
     volunteer gap does not. Closer look: an average of k polls, each = truth + shared error + house effect + sampling error.
   Deep dive: 500 forecasts, calibration and the Brier score. */
const CITY=200000,DEG=0.40,PD=0.40,PN=0.20,R0=0.0385,NS=[100,400,1600,4000],REP=30,SEED=41;
const TRUTH=DEG*PD+(1-DEG)*PN;
const TA=51,NP=800,SE=100*Math.sqrt(0.51*0.49/NP),MAXK=30,PSEED=199;
const PS=[0.1,0.3,0.5,0.7,0.9],OVER={0.1:0.03,0.3:0.15,0.5:0.5,0.7:0.85,0.9:0.97},NF=500,FSEED=39;
const V=sim=>sim.p.vgap,E=sim=>atLeast('honors')?sim.p.egap:1.5,W=sim=>atLeast('honors')&&!!sim.p.weight;
const cells=(v,e)=>[DEG*e*PD*v,DEG*e*(1-PD),(1-DEG)*PN*v,(1-DEG)*(1-PN)];
const sum=a=>a.reduce((s,x)=>s+x,0);
const expRaw=(v,e)=>{const c=cells(v,e);return (c[0]+c[2])/sum(c);};
const inG=(p,v)=>p*v/(p*v+1-p);
const expW=v=>DEG*inG(PD,v)+(1-DEG)*inG(PN,v);
const degShare=(v,e)=>{const c=cells(v,e);return (c[0]+c[1])/sum(c);};
const respRate=(v,e)=>R0*(DEG*e*(PD*v+1-PD)+(1-DEG)*(PN*v+1-PN));
const est=sim=>W(sim)?expW(V(sim)):expRaw(V(sim),E(sim));
const bias=sim=>100*(est(sim)-TRUTH);
const moe=(p,n)=>100*1.96*Math.sqrt(p*(1-p)/n);
const cache=new Map();
function draws(v,e,seed){const key=v+'|'+e+'|'+seed;if(cache.has(key))return cache.get(key);
 const c=cells(v,e),s=sum(c),q=[c[0]/s,(c[0]+c[1])/s,(c[0]+c[1]+c[2])/s],out={};
 NS.forEach(n=>{const r=rng((seed*7919+n*13+Math.round(v*100)*31+Math.round(e*100)*17)|0),raw=[],w=[];
  for(let j=0;j<REP;j++){const k=[0,0,0,0];for(let i=0;i<n;i++){const u=r();k[u<q[0]?0:u<q[1]?1:u<q[2]?2:3]++;}
   const rr0=(k[0]+k[2])/n,a=k[0]+k[1]?k[0]/(k[0]+k[1]):rr0,b=k[2]+k[3]?k[2]/(k[2]+k[3]):rr0;raw.push(rr0);w.push(DEG*a+(1-DEG)*b);}
  out[n]={raw,w};});
 if(cache.size>40)cache.clear();cache.set(key,out);return out;}
const D=sim=>draws(V(sim),E(sim),sim.st.seed||SEED);
const row=(sim,n)=>{const d=D(sim)[n];return W(sim)?d.w:d.raw;};
const mine=sim=>row(sim,sim.p.n)[0];
/* Poll averages */
function gauss(r){const u=Math.max(1e-12,r()),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
const pcache=new Map();
function pollBase(seed){if(pcache.has(seed))return pcache.get(seed);const r=rng((seed*104729+PSEED)|0),h=[],z=[];for(let i=0;i<MAXK;i++){h.push(gauss(r));z.push(gauss(r));}const o={h,z};pcache.set(seed,o);return o;}
const polls=sim=>{const b=pollBase(sim.st.seed||SEED),out=[];for(let i=0;i<sim.p.k;i++)out.push(TA+sim.p.shared+sim.p.house*b.h[i]+SE*b.z[i]);return out;};
const avgP=sim=>sum(polls(sim))/sim.p.k;
const oneT=sim=>Math.sqrt(sim.p.shared**2+sim.p.house**2+SE**2);
const avgT=sim=>Math.sqrt(sim.p.shared**2+(sim.p.house**2+SE**2)/sim.p.k);
/* Forecasts */
const fcache=new Map();
function events(seed){if(fcache.has(seed))return fcache.get(seed);const r=rng((seed*15485863+7+FSEED)|0),ev=[];for(let i=0;i<NF;i++){const p=PS[i%5];ev.push({p,o:r()<p?1:0});}fcache.set(seed,ev);return ev;}
const fOf=(type,p)=>type==='over'?OVER[p]:type==='coin'?0.5:p;
const EV=sim=>events(sim.st.seed||SEED);
const brierOf=(sim,type)=>{const ev=EV(sim);return sum(ev.map(e=>(fOf(type,e.p)-e.o)**2))/ev.length;};
function calib(sim){const ev=EV(sim),m=new Map();ev.forEach(e=>{const f=fOf(sim.p.fcst,e.p);if(!m.has(f))m.set(f,{f,n:0,y:0});const b=m.get(f);b.n++;b.y+=e.o;});return [...m.values()].sort((a,b)=>a.f-b.f);}
const ev70=sim=>EV(sim).filter(e=>e.p===0.7);
const hit70=sim=>{const a=ev70(sim);return 100*sum(a.map(e=>e.o))/a.length;};
const calGap=sim=>{const c=calib(sim);return sum(c.map(b=>b.n*Math.abs(100*b.y/b.n-100*b.f)))/NF;};

const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on&&sim.st.peek)||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1),f0=v=>Math.round(v).toLocaleString('en-US'),pc=v=>(100*v).toFixed(1);
const ppl=pts=>f0(Math.abs(pts)/100*CITY);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const ans=(sim,g)=>{const b=bias(sim);return {v:Math.abs(g-b),gut:g,bias:b,w:W(sim),label:`${f1(g)} points too high with 4,000 responses`};};
const MATHLAB='<a href="https://rjedtech.github.io/Raider-MathLab/#pollmargin" target="_blank" rel="noopener">MathLab: Is 54% a lock?</a>';

function infoHTML(sim){const rrt=respRate(V(sim),E(sim)),b=bias(sim);
 let h=`<p><b>Start with</b> ${MATHLAB} if the margin of error is new to you. It covers the first kind of error below.</p><p><b>Four ways a survey misses (total survey error)</b></p><ul>`+
 `<li><b>Sampling error:</b> the luck of who got picked. The dots bounce less as surveys grow. The margin of error measures only this.</li>`+
 `<li><b>Nonresponse bias:</b> who answers. Here volunteers answer ${f1(V(sim))} times as often, so the survey runs ${f1(b)} points high.</li>`+
 `<li><b>Coverage error:</b> who can be reached at all. A text survey misses anyone whose number is not on the list.</li>`+
 `<li><b>Measurement error:</b> how the question is asked. Wording, and wanting to look good (social desirability), can push answers one way.</li>`;
 if(atLeast('honors'))h+=`<li><b>Likely-voter model:</b> before an election, a pollster must guess who will actually vote. A wrong guess moves every poll that uses it.</li>`;
 h+=`</ul><p><b>What this number hides.</b> About ${f0(rrt*100)} in 100 people answered, so about ${f0(100-rrt*100)} in 100 never did. Every result on this page, weighted or not, is built only from the people who answered. Weighting does not hear from anyone new: it makes some answers count more, so a few people speak for many.`;
 if(atLeast('honors')){const ds=degShare(V(sim),E(sim));h+=` Here each non-graduate’s answer counts ${(0.6/(1-ds)).toFixed(2)} times and each graduate’s ${(0.4/ds).toFixed(2)} times.`;}
 h+=' People with no phone on the list are not in the survey at all, and no weight can bring them back.</p>';
 return h;}

const SIM={
 id:'pollmiss',hash:'pollmiss',apUnit:6,order:1,tab:'Why polls miss',kind:'Simulation',next:['turnout'],
 card:'Guess whether 10 times as many responses would fix a survey that came out 18 points too high, then watch what more answers can and cannot fix.',
 title:'Why polls miss',
 lede:{bio:'A bigger survey bounces around less. But if the people who answer are different from the people who do not, a bigger survey just lands more precisely on the wrong number. Getting good numbers is hard.',
  honors:'Total survey error has more parts than the margin of error: who answers, who can be reached, how questions are asked, and who is expected to vote. Weighting fixes what you measure. Averaging polls cuts the bounce, but not an error every poll shares.',
  ap:'A forecast of 70% is a claim about many events: of everything forecast at 70%, about 70% should happen. Calibration checks that claim; the Brier score, the mean of (forecast − outcome)², grades it.'},
 scale:'A city of 200,000 adults, surveyed by text message. Each dot is one survey. The city’s numbers are illustrative.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your survey',
 controls:[
  {id:'gut',label:'Your gut: points too high with 4,000 responses',type:'range',min:0,max:40,step:1,def:5,unit:' points'},
  {id:'view',label:'Show',type:'seg',def:'survey',noGut:true,options:[{v:'survey',l:'One survey'},{v:'avg',l:'Poll average',lvl:'honors'},{v:'fc',l:'Forecasts',lvl:'ap'}]},
  {id:'n',label:'Responses collected',type:'seg',def:400,noGut:true,options:[{v:100,l:'100'},{v:400,l:'400'},{v:1600,l:'1,600'},{v:4000,l:'4,000'}]},
  {id:'vgap',label:'Volunteers answer surveys this many times as often',type:'range',min:1,max:4,step:0.5,def:2,unit:'×',noGut:true,onChange:clearGut,help:'1× means volunteers and non-volunteers answer equally often. The 2× default is an assumption for illustration.'},
  {id:'egap',label:'College graduates answer this many times as often',type:'range',min:1,max:3,step:0.25,def:1.5,unit:'×',lvl:'honors',noGut:true,onChange:clearGut,help:'Graduates are 40% of the city. At 1.5×, they are about 54% of the answers.'},
  {id:'weight',label:'Weight by education (post-stratification)',type:'toggle',def:false,lvl:'honors',noGut:true,onChange:clearGut,help:'Count answers so graduates make up 40% of the total, as in the city.'},
  {id:'k',label:'Poll average: polls averaged',type:'seg',def:10,lvl:'honors',noGut:true,options:[{v:1,l:'1'},{v:3,l:'3'},{v:10,l:'10'},{v:30,l:'30'}]},
  {id:'shared',label:'Poll average: error every poll shares',type:'range',min:0,max:5,step:0.5,def:2,unit:' points',lvl:'honors',noGut:true,help:'For example, every poll reaching too few of one kind of voter. Illustrative.'},
  {id:'house',label:'Poll average: spread of house effects',type:'range',min:0,max:3,step:0.5,def:1.5,unit:' points',lvl:'honors',noGut:true,help:'Each pollster’s own steady lean, from its methods. Illustrative.'},
  {id:'fcst',label:'Forecaster',type:'seg',def:'cal',lvl:'ap',noGut:true,options:[{v:'cal',l:'Calibrated'},{v:'over',l:'Overconfident'},{v:'coin',l:'Always 50%'}]},
  {id:'show',label:'Show the answer now',type:'toggle',def:false,help:'Normally the bigger surveys appear once you lock in your gut.'}
 ],
 actions:[{id:'again',label:'Run every survey again',run(sim){sim.st.seed=((sim.st.seed||SEED)%9000)+1;sim.infoDirty=true;}}],
 init(){return {seed:SEED,peek:0};},step(){},
 infoPanel:infoHTML,
 metrics:[
  {id:'mine',label:'Your survey’s result',unit:'%',d:1,min:0,max:100,get:sim=>sim.p.view==='survey'?100*mine(sim):null},
  {id:'miss',label:'Your survey’s miss',unit:'points',d:1,min:-20,max:40,get:sim=>sim.p.view==='survey'?100*(mine(sim)-TRUTH):null},
  {id:'moe',label:'Margin of error at this size (95%)',unit:'± points',d:1,min:0,max:15,get:sim=>sim.p.view==='survey'?moe(mine(sim),sim.p.n):null},
  {id:'bias',label:'Miss that more responses can’t fix',unit:'points',d:1,min:0,max:40,get:sim=>shown(sim)?bias(sim):null},
  {id:'resp',label:'Share of people texted who answer',unit:'%',d:1,min:0,max:20,get:sim=>100*respRate(V(sim),E(sim))},
  {id:'deg',label:'College graduates among the answers',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>100*degShare(V(sim),E(sim))},
  {id:'one',label:'Typical miss of one poll',unit:'points',d:2,lvl:'honors',min:0,max:8,get:sim=>sim.p.view==='avg'?oneT(sim):null},
  {id:'avgm',label:'Typical miss of the average',unit:'points',d:2,lvl:'honors',min:0,max:8,get:sim=>sim.p.view==='avg'?avgT(sim):null},
  {id:'floor',label:'Miss averaging can’t remove',unit:'points',d:2,lvl:'honors',min:0,max:8,get:sim=>sim.p.view==='avg'?sim.p.shared:null},
  {id:'brier',label:'Brier score (lower is better)',unit:'',d:3,lvl:'ap',min:0,max:0.3,get:sim=>sim.p.view==='fc'?brierOf(sim,sim.p.fcst):null},
  {id:'calgap',label:'Calibration gap',unit:'points',d:1,lvl:'ap',min:0,max:30,get:sim=>sim.p.view==='fc'?calGap(sim):null},
  {id:'hit70',label:'Happened, of the 100 events with a 70% chance',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>sim.p.view==='fc'?hit70(sim):null}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.view==='avg'&&atLeast('honors'))return drawAvg(sim,ctx,k);
  if(sim.p.view==='fc'&&atLeast('ap'))return drawFc(sim,ctx,k);
  drawSurvey(sim,ctx,k);},
 narrate(sim){
  if(sim.p.view==='avg'&&atLeast('honors')){const a=avgP(sim);return `${sim.p.k} poll${sim.p.k>1?'s':''} averaged: ${f1(a)}%, against a result of ${TA}%. One poll typically misses by ${f1(oneT(sim))} points; the average by about ${f1(avgT(sim))}. <b>Averaging cuts the random part, but the ${f1(sim.p.shared)}-point error every poll shares never averages away.</b>`;}
  if(sim.p.view==='fc'&&atLeast('ap')){const b=brierOf(sim,sim.p.fcst);return `Brier score ${b.toFixed(3)}. Of the 100 events with a 70% chance, ${f1(hit70(sim))}% happened. <b>A 70% favorite that loses is not a broken forecast; a forecaster whose 70%s come true 95% of the time is.</b>`;}
  const m=100*mine(sim),b=bias(sim);
  if(!shown(sim))return `${f0(sim.p.n)} people answered, and ${f1(m)}% said they volunteered. The city’s real share is 28%. <b>Would more responses fix a miss of ${f1(m-28)} points?</b> Lock in your gut first.`;
  return `With ${f0(sim.p.n)} responses, your survey says ${f1(m)}% (margin of error ±${f1(moe(mine(sim),sim.p.n))}). <b>The surveys pile up around ${f1(100*est(sim))}%, ${f1(b)} points above the truth, at every size.</b> ${b>1?'More answers shrink the bounce, not the bias: the bias comes from who answers.':'Who answers barely differs here, so the surveys center on the truth.'}`;},
 gut:{better:'lower',controls:['gut'],
  ask:{bio:'Your survey (the ringed dot) came out too high, because volunteers answer surveys more often. If you collected 4,000 responses the same way, how many points too high would it be? Drag <b>Your gut</b> here, then lock it in.',
   honors:'Guess first: with 4,000 responses collected the same way, how many points too high would the survey be? Drag <b>Your gut</b> here, then lock it in. Try weighting by education after the reveal.'},
  lock(sim){return ans(sim,sim.p.gut);},
  solve(sim){const b=bias(sim);sim.p.gut=b;if(sim.p.view!=='survey')sim.p.view='survey';return ans(sim,b);},
  how:{bio:'The math does not add up dots. It works out who answers: volunteers answer twice as often, so they show up in the answers far more than in the city. That makes the center of every survey too high, whatever its size. Size only shrinks the bounce around that center.',
   honors:'Expected result = (volunteer answers) ÷ (all answers), from each group’s share of the city times how often it answers. Weighting by education fixes each degree group’s share, but inside each group volunteers still answer more, so the bias that remains is 0.4·pV/(pV + 1 − p) for graduates plus 0.6·(the same) for everyone else, minus 28%.'},
  compare(sim,g,m){const d=Math.abs(g.gut-m.bias),n4=moe(TRUTH+m.bias/100,4000);
   const base=`With 4,000 responses the survey still lands about <b>${f1(m.bias)} points too high</b>, give or take about ${f1(n4)} points from chance. In this city of 200,000 adults, that is about <b>${ppl(m.bias)} people</b> counted as volunteers who are not.`;
   if(d<1.5)return `Your gut was right on: ${f1(g.gut)} points against ${f1(m.bias)}. You already know that a bigger sample does not fix who answers. ${base}`;
   if(g.gut<m.bias)return `Your gut said ${f1(g.gut)} points; the math says ${f1(m.bias)}. You expected more responses to wash out <b>${f1(d)} points</b> of the miss (about ${ppl(d)} people) that they cannot touch. ${base} A bigger sample shrinks the bounce, not the bias.`;
   return `Your gut said ${f1(g.gut)} points; the math says ${f1(m.bias)}: <b>${f1(d)} points</b> less than you feared (about ${ppl(d)} people). ${base} More responses do not make the bias worse; they just stop hiding it behind the bounce.`;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.vgap=R([1,1.5,2,2.5,3,3.5]);if(atLeast('honors')){sim.p.egap=R([1,1.5,2,2.5]);sim.p.weight=Math.random()<0.5;}sim.p.gut=5;sim.p.n=400;sim.p.show=false;sim.p.view='survey';sim.st.seed=((sim.st.seed||SEED)%9000)+1;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Your survey of 400 is about 18 points too high because volunteers answer more often. You collect 4,000 responses the same way. What happens?',choices:['The miss mostly goes away','It stays about 18 points too high, with less bounce','It gets twice as bad'],correct:1,explain:'Ten times the responses shrinks the margin of error from about ±4.9 to about ±1.5 points, but the center stays near 46.2% against a true 28%. Size fixes luck, not who answers.'},
  {lvl:'bio',instant:true,q:'A poll reports “±3 points.” Which error does that margin cover?',choices:['Every way the poll could be wrong','Only the luck of who got picked (sampling error)','Only people who lied'],correct:1,explain:'The margin of error assumes a random sample in which everyone picked answers. It says nothing about who refused, who could not be reached or how the question was worded. MathLab’s “Is 54% a lock?” builds it from scratch.'},
  {lvl:'bio',instant:true,q:'In 2012, Pew Research Center phone surveys found 55% of people saying they volunteered in the past year. The Census Bureau’s Current Population Survey found 27%. What is the most likely reason?',choices:['Volunteering doubled that year','People who volunteer are also more willing to answer surveys','The Census Bureau asked the wrong people'],correct:1,explain:'Pew’s own analysis pointed to this: the same willingness that leads people to volunteer makes them more likely to take a survey. 55% − 27% = 28 points too high, even after weighting by demographics.'},
  {lvl:'bio',instant:true,q:'What does your survey’s result hide?',choices:['Nothing: 400 answers is plenty','The roughly 94 of every 100 people texted who never answered','Only the people who lied'],correct:1,explain:'About 6 in 100 people answered. The other 94 are not in the result at all: the survey speaks for them using the people who did answer. When the two groups differ, as volunteers and non-volunteers do here, the number hides it.'},
  {lvl:'honors',instant:true,q:'Graduates are 40% of the city but about 54% of your answers. You weight by education. What gets fixed?',choices:['Everything: the survey now matches the city','The degree mix, but not the extra volunteers inside each group','Nothing: weighting only works for elections'],correct:1,explain:'After weighting, graduates count for exactly 40%. But in each group volunteers still answer twice as often, so the result only drops from 46.2% to 42.9%: still 14.9 points too high. Weighting fixes what you measure.'},
  {lvl:'honors',instant:true,q:'Every poll shares a 2-point error, plus its own house effect and sampling error. You average 30 polls. About how far off is the average?',choices:['About 0.4 points: 30 polls cancel everything','About 2.0 points: the shared error stays','About 3.1 points, the same as one poll'],correct:1,explain:'Typical miss = √(2² + (1.5² + 1.77²)/30) = √(4 + 0.18) ≈ 2.04 points. The random parts shrink with √30; the shared 2 points never do.'},
  {lvl:'honors',instant:true,q:'In the 2015 U.K. general election, the final polls showed roughly a tie; the winning side won by 6.5 points. What did the official inquiry find was the main cause?',choices:['A late swing in the last days','Unrepresentative samples','Too few people polled'],correct:1,explain:'The inquiry chaired by Patrick Sturgis found the samples were unrepresentative and that weighting did not fix it. A late swing explained at most a small part. Australia’s 2019 inquiry reached a similar finding.'},
  {lvl:'ap',instant:true,q:'A forecaster gave an event a 70% chance, and it did not happen. What is the Brier score for that one forecast?',choices:['0.09','0.30','0.49','0.70'],correct:2,explain:'Brier = (forecast − outcome)² = (0.70 − 0)² = 0.49. Had it happened: (0.70 − 1)² = 0.09. One forecast tells you little; you judge a forecaster over many.'},
  {lvl:'ap',instant:true,q:'Of 50 races a forecaster rated 70% for the favorite, the favorite won 49. What does that say about the forecaster?',choices:['Well calibrated: favorites won','Underconfident: those races deserved more than 70%','Overconfident'],correct:1,explain:'Calibration expects about 0.7 × 50 = 35 wins. 49 of 50 is 98%, so the forecasts were too timid. Being “right” more often than you said is still a calibration error.'},
  {lvl:'ap',instant:true,q:'AAPOR found 2020 national polls overstated the winning side’s margin by 3.9 points. In a two-way race, about how far off was each side’s share?',choices:['About 3.9 points each','About 2 points each','About 7.8 points each'],correct:1,explain:'The margin is A − B. Move 1 point of share from B to A and the margin grows by 2. So a 3.9-point margin error is about 1.95 points on each share, if there are no third options.'}
 ],
 tour:[
  {title:'Your survey',text:'Your service club texted a survey to random numbers in a city of 200,000 adults. 400 people answered, and 46% said they volunteered last year. A benchmark survey that almost everyone answers says 28% (green). Each dot is one survey of 400; the ringed one is yours.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'survey',n:400,vgap:2,egap:1.5,weight:false,show:false});sim.st.seed=SEED;sim.st.peek=0;}},
  {title:'Your turn: compute it',text:'Leave out degrees for a moment. Of every 100 adults, 28 volunteered and 72 did not. If volunteers answer twice as often, answers come in like 28 × 2 = 56 volunteers for every 72 others. Before the next step, work out 56 ÷ (56 + 72) as a percent.',pause:true,setup:sim=>{sim.st.peek=0;}},
  {title:'Check your number',text:'56 ÷ 128 = 0.4375, about 43.8%. Graduates also answer more often here, which pushes it to 46.2%. That is nonresponse bias: the people who answer differ from the people who do not. Notice that the number of responses never appeared in your calculation.',focus:[0,262,800,188],pause:true,setup:sim=>{sim.st.peek=0;}},
  {title:'More responses',text:'Here are 30 surveys at each size, from 100 to 4,000 responses. They bounce less as they grow: the margin of error falls from about ±4.9 points at 400 to about ±1.5 at 4,000. But every row piles up around 46%, not 28%. The margin of error covers only sampling error, the luck of who got picked.',pause:true,focus:[0,30,800,200],setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{n:4000});}},
  {title:'What the number hides',text:'About 6 in 100 people texted answered. The other 94 are not in any of these dots. Each result speaks for them using the people who did answer, and nothing on the page shows how they differ.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{n:400});}},
  {lvl:'honors',title:'Weighting',text:'Weighting counts each graduate’s answer a little less and everyone else’s a little more, so graduates make up 40%, as in the city. The degree mix is now right. The volunteer share only drops to 42.9%: weighting cannot fix what it does not measure.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{weight:true});}},
  {lvl:'honors',title:'Averaging polls',text:'Before an election, 10 polls of 800 likely voters each. Averaging cuts the random bounce: one poll typically misses by 3.1 points, the average by 2.1. But all 10 share a 2-point error, and no number of polls removes it.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'avg',k:10,shared:2,house:1.5,weight:false});}},
  {lvl:'ap',title:'What 70% means',text:'500 forecasts. Of the 100 events given a 70% chance, 70 happened. A calibrated forecaster’s 70%s come true about 70% of the time. The Brier score grades every forecast: lower is better, and always saying 50% scores 0.25.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'fc',fcst:'cal'});}}
 ],
 lab:{bio:`<p>New to the margin of error? Start with ${MATHLAB}.</p><p><b>Question:</b> Does a bigger survey fix who answers?</p><ol><li>Turn on <b>Show the answer now</b>.</li><li>Set volunteers to answer 1×, 2×, 3× and 4× as often. Each time, record a trial at 400 and at 4,000 responses.</li><li>Compare <b>Your survey’s miss</b> with <b>Margin of error</b>.</li></ol><p>Write one sentence: what does a bigger survey fix, and what does it not fix?</p>`,
  honors:'<p><b>Question:</b> What can weighting fix?</p><ol><li>Set volunteers to 1×. Raise the graduate gap to 3×. Record the miss with weighting off, then on.</li><li>Now set volunteers to 2×. Repeat.</li><li>Switch to <b>Poll average</b>. Record the typical miss of the average for 1, 3, 10 and 30 polls, with a shared error of 0 and of 2 points.</li></ol><p>Explain why weighting fixed the first case but not the second, and why averaging cannot remove the shared error.</p>',
  ap:'<p><b>Question:</b> How do you grade a forecaster?</p><ol><li>Switch to <b>Forecasts</b>. Record the Brier score and calibration gap for each forecaster.</li><li>Press <b>Run every survey again</b> three times and record again.</li></ol><p><b>CER:</b> Claim which forecaster is best, with evidence from your table, and reason from what calibration means. Then explain why a 70% favorite losing is not, by itself, evidence the forecast was wrong.</p>'},
 terms:[
  {t:'Sampling error',d:'The difference between a sample and the whole group that comes from the luck of who got picked. The margin of error measures only this.'},
  {t:'Nonresponse bias',d:'Error that comes from who answers. If people who answer differ from people who do not, the result is off, at any sample size.'},
  {t:'Response rate',d:'The share of people contacted who answer. Pew Research Center’s typical telephone response rate fell from 36% in 1997 to 6% in 2018.'},
  {t:'Coverage error',d:'Error from people the survey cannot reach at all, such as people not on the list being called or texted.'},
  {t:'Measurement error',d:'Error from how a question is asked or answered: wording, order, or social desirability (giving the answer that looks good).'},
  {t:'Weighting (post-stratification)',d:'Counting some answers more and others less so the sample matches known population shares, such as the share with a college degree.',lvl:'honors'},
  {t:'House effect',d:'A pollster’s steady lean in one direction, from its own methods.',lvl:'honors'},
  {t:'Correlated error',d:'An error many polls share, so averaging them does not cancel it.',lvl:'honors'},
  {t:'Likely-voter model',d:'A pollster’s rule for deciding which respondents will actually vote.',lvl:'honors'},
  {t:'Total survey error',d:'All the ways a survey can miss: sampling, nonresponse, coverage, measurement and, for elections, the likely-voter model.',lvl:'honors'},
  {t:'Calibration',d:'A forecaster is calibrated if, of all events given a p% chance, about p% happen.',lvl:'ap'},
  {t:'Brier score',d:'The mean of (forecast − outcome)², with outcome 1 if it happened and 0 if not. 0 is perfect; always saying 50% scores 0.25.',lvl:'ap'}
 ],
 about:`<p><b>Start with</b> ${MATHLAB}, which teaches the margin of error for a random sample. This tool is about the errors that margin leaves out.</p>`+
 '<p><b>The model (illustrative).</b> A city of 200,000 adults; 40% have a college degree. 40% of graduates and 20% of others volunteered last year, so the true share is 0.4 × 40% + 0.6 × 20% = 28%. The 28% benchmark, the 40% graduate share, the volunteer rates, the base response rate (3.85%, which makes about 6% of people answer at the defaults) and the response gaps are assumptions for illustration, not measurements of any real city. Each simulated survey draws respondents at random from the people who would answer, from a fixed random seed. Expected result = Σ(group share × volunteer rate × response rate) ÷ Σ(group share × response rate). Weighting by education rescales the two degree groups to 40% and 60%; within each group the volunteer share among respondents is pV ÷ (pV + 1 − p), where V is the volunteer gap, so the education gap drops out and the volunteer gap does not.</p>'+
 `<p><b>Poll averages (illustrative).</b> Each poll = 51% + the shared error + its house effect (a normal draw times the spread) + sampling error for 800 people (standard error ${SE.toFixed(2)} points). Typical miss is the root-mean-square: one poll √(shared² + house² + SE²); an average of k polls √(shared² + (house² + SE²) ÷ k). House effects are assumed independent across pollsters.</p>`+
 '<p><b>Forecasts (illustrative).</b> 500 events with true chances of 10%, 30%, 50%, 70% and 90% (100 each), outcomes drawn at random. The overconfident forecaster says 3%, 15%, 50%, 85% and 97%. Brier score = mean of (forecast − outcome)²; the score was proposed by Glenn Brier in 1950 for weather forecasts. Calibration gap = average distance between each forecast level and how often those events happened. Always saying 50% can look well calibrated overall and still be useless, because it never separates likely events from unlikely ones; the Brier score catches that.</p>'+
 '<p><b>Real figures.</b></p><ul>'+
 '<li>Pew Research Center, 2012, “Assessing the Representativeness of Public Opinion Surveys”: the typical telephone survey response rate was 36% in 1997 and 9% in 2012. Its surveys found 55% saying they volunteered in the past year, against 27% in the Census Bureau’s Current Population Survey (<a href="https://www.pewresearch.org/politics/2012/05/15/assessing-the-representativeness-of-public-opinion-surveys/" target="_blank" rel="noopener">pewresearch.org</a>).</li>'+
 '<li>Pew Research Center, 2019: typical telephone response rates fell to 7% in 2017 and 6% in 2018 (<a href="https://www.pewresearch.org/short-reads/2019/02/27/response-rates-in-telephone-surveys-have-resumed-their-decline/" target="_blank" rel="noopener">pewresearch.org</a>). Pew’s studies found little relationship between response rate and accuracy on most measures, but standard weighting fell short for volunteering.</li>'+
 '<li>Pew Research Center, 2017, “What Low Response Rates Mean for Telephone Surveys”: phone surveys have overrepresented college graduates by 12 to 15 points since 2012, before weighting; weighting corrects demographic mixes like education (<a href="https://www.pewresearch.org/methods/2017/05/15/what-low-response-rates-mean-for-telephone-surveys/" target="_blank" rel="noopener">pewresearch.org</a>).</li>'+
 '<li>AAPOR, 2017, evaluation of the 2016 U.S. presidential election polls: national polls were “generally correct and accurate by historical standards,” showing the popular-vote leader about 3 points ahead; the final margin was 2. State polls underestimated the winning candidate’s support in the Upper Midwest. Causes included real late shifts in vote preference and many polls not adjusting for overrepresented college graduates (<a href="https://aapor.org/wp-content/uploads/2023/01/AAPOR-2016-Election-Polling-Report.pdf" target="_blank" rel="noopener">aapor.org</a>).</li>'+
 '<li>AAPOR Task Force on 2020 Pre-Election Polling, 2021: in the final two weeks, the average error on the margin was 4.5 points for national polls and 5.1 for state presidential polls, the highest in 40 years for the national popular vote. Errors ran mostly one way: national polls overstated the winning side’s margin by 3.9 points. The task force ruled out late deciders and a failure to weight by education, found some of the error came from nonresponse, and could not conclusively identify the main cause (<a href="https://aapor.org/wp-content/uploads/2022/11/AAPOR-Task-Force-on-2020-Pre-Election-Polling_Report-FNL.pdf" target="_blank" rel="noopener">aapor.org</a>).</li>'+
 '<li>2015 U.K. general election: final polls suggested a statistical dead heat between the top two; the winning side won Great Britain by 6.5 points. The inquiry chaired by Patrick Sturgis (2016) found the primary cause was unrepresentative samples that weighting did not fix; a late swing explained at most a small part, and herding could not be ruled out (<a href="https://www.southampton.ac.uk/news/2016/03/polling-inquiry.page" target="_blank" rel="noopener">University of Southampton</a>; <a href="https://www.irishtimes.com/news/world/uk/unrepresentative-sample-caused-failure-of-uk-opinion-polls-1.2502184" target="_blank" rel="noopener">Irish Times</a>).</li>'+
 '<li>2019 Australian federal election: every national poll showed the losing side ahead on the two-party-preferred vote, by 2 to 4 points; the winning side got 51.5% to 48.5%, so polls underestimated its two-party share by about 2.5 to 3.5 points. The inquiry led by the Association of Market and Social Research Organisations (AMSRO, Nov 2020) found the most likely cause was unrepresentative samples, inadequately adjusted, probably over-representing politically engaged and better-educated voters. It found no late swing and could not rule out herding (<a href="https://statsoc.org.au/News-and-media-releases/9356513" target="_blank" rel="noopener">Statistical Society of Australia</a>; <a href="https://www.research-live.com/article/news/unrepresentative-samples-led-to-australian-polling-failure-finds-inquiry/id/5076392" target="_blank" rel="noopener">Research Live</a>).</li></ul>'+
 '<p>Elections here are named by country, year and office only. The tool takes no side in any of them: the point is how hard it is to get good numbers, for anyone.</p>'
};

function drawSurvey(sim,ctx,k){const big=k>1.3,L=big?110:150,R=780,X=v=>L+clamp(v,0,80)/80*(R-L),sh=shown(sim),G=GS(sim),hon=atLeast('honors');
 const ys={100:64,400:106,1600:148,4000:190},AY=214;
 txt(ctx,big?'Share who volunteered':'Share who volunteered last year: 30 repeat surveys at each size',20,20,{s:13*k,w:700});
 /* axis */
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(L,AY);ctx.lineTo(R,AY);ctx.stroke();
 for(let v=0;v<=80;v+=big?20:10){ctx.beginPath();ctx.moveTo(X(v),AY);ctx.lineTo(X(v),AY+4);ctx.stroke();txt(ctx,v+'%',X(v),AY+7,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});}
 /* truth line */
 const xt=X(100*TRUTH);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xt,40);ctx.lineTo(xt,AY);ctx.stroke();
 txt(ctx,'City: 28%',xt-6,40,{s:12*k,w:700,c:PAL['s3'],a:'right',b:'middle'});
 if(sh){const xe=X(100*est(sim));ctx.strokeStyle=PAL['s1'];ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xe,46);ctx.lineTo(xe,AY);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,(big?'Center ':'Surveys center on ')+f1(100*est(sim))+'%',xe+6,40,{s:12*k,w:700,c:PAL['s1'],b:'middle'});}
 /* rows */
 NS.forEach(n=>{const y=ys[n],on=n===sim.p.n;if(!sh&&!on)return;
  txt(ctx,big?f0(n):f0(n)+' responses',20,y,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft'],b:'middle'});
  const r=row(sim,n);r.forEach((p,i)=>{const yy=y+((i*7)%9-4)*2;ctx.fillStyle=PAL['s2'];ctx.globalAlpha=0.65;ctx.beginPath();ctx.arc(X(100*p),yy,3.6,0,7);ctx.fill();});ctx.globalAlpha=1;
  if(on){const p=r[0],yy=y+((0)%9-4)*2;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(X(100*p),yy,8,0,7);ctx.stroke();
   txt(ctx,(big?'':'Your survey: ')+f1(100*p)+'%',X(100*p)+12,yy-12,{s:12*k,w:700,c:PAL['rj'],b:'middle'});}});
 if(!sh){const msg=big?'Lock in your gut to see more':'Lock in your gut to see surveys of 100, 1,600 and 4,000';ctx.font=(12*k)+'px '+FONT;const mw=ctx.measureText(msg).width+24;ctx.fillStyle=PAL['card'];rr(ctx,(L+R)/2-mw/2,ys[1600]-12*k,mw,24*k,8);ctx.fill();txt(ctx,msg,(L+R)/2,ys[1600],{s:12*k,c:PAL['cv-soft'],a:'center',b:'middle'});}
 /* gut marker */
 if(G&&G.g){const xg=X(100*TRUTH+G.g.gut);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(xg,ys[4000]-14);ctx.lineTo(xg,AY);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Your gut: +'+f1(G.g.gut),xg,AY+26*k,{s:12*k,w:700,c:PAL['s4'],a:'center',b:'top'});}
 /* who answered vs the city */
 const T0=big?262:274,v=V(sim),e=E(sim),ds=100*degShare(v,e),vr=100*expRaw(v,e),wt=W(sim);
 const grp=(x0,x1,title,city,ansd,wtd,good)=>{txt(ctx,title,x0,T0,{s:13*k,w:700,b:'middle'});
  const lw=(big?62:80)*k,vw=(big?48:52)*k,bx=x0+lw,bw=x1-bx-vw,rows=[['City',city,PAL['s3']],[big?'Answers':'Answered',ansd,PAL['s2']]];if(wt)rows.push([big?'Wtd.':'Weighted',wtd,PAL['rj']]);
  const rh=Math.max(26,20*k);rows.forEach((r,i)=>{const y=T0+18*k+i*rh;txt(ctx,r[0],x0,y+8,{s:12*k,c:PAL['cv-soft'],b:'middle'});ctx.fillStyle=r[2];ctx.fillRect(bx,y,bw*clamp(r[1],0,100)/100,16);txt(ctx,f1(r[1])+'%',bx+bw*clamp(r[1],0,100)/100+6,y+8,{s:12*k,w:700,b:'middle'});});
  const cy=T0+18*k+rows.length*rh+12*k;if(cy<444)txt(ctx,good,x0,cy,{s:12*k,c:PAL['cv-ink'],b:'middle'});};
 const right=wt?(big?`Still +${f1(100*expW(v)-28)} points`:`Still ${f1(100*expW(v)-28)} points too high after weighting`):(big?`+${f1(vr-28)} points`:`${f1(vr-28)} points too high: volunteers answer ${f1(v)}× as often`);
 const left=wt?(big?'Matches the city':'Weighting makes this match the city'):(big?`+${f1(ds-40)} points`:`Graduates: 40% of the city, ${f1(ds)}% of answers`);
 grp(20,388,big?'College degree':'Have a college degree',40,ds,40,left);
 grp(412,780,big?'Volunteered':'Volunteered last year',28,vr,100*expW(v),right);
 if(!hon){/* nothing else at Big picture */}}

function drawAvg(sim,ctx,k){const big=k>1.3,L=60,R=770,lo=42,hi=62,X=v=>L+(clamp(v,lo,hi)-lo)/(hi-lo)*(R-L),AY=318,P=polls(sim),a=avgP(sim),kk=sim.p.k;
 txt(ctx,big?`Average of ${kk} poll${kk>1?'s':''}`:`Election poll average: ${kk} poll${kk>1?'s':''} of 800 likely voters each`,20,20,{s:13*k,w:700});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(L,AY);ctx.lineTo(R,AY);ctx.stroke();
 for(let v=lo;v<=hi;v+=big?4:2){ctx.beginPath();ctx.moveTo(X(v),AY);ctx.lineTo(X(v),AY+4);ctx.stroke();txt(ctx,v+'%',X(v),AY+7,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});}
 txt(ctx,big?'Side A’s share':'Side A’s share of the two-way vote',R,AY-10,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const xt=X(TA);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xt,40);ctx.lineTo(xt,AY);ctx.stroke();txt(ctx,'Result: 51%',xt-6,44,{s:12*k,w:700,c:PAL['s3'],a:'right',b:'middle'});
 const T=60,B=270,dy=Math.min(22,(B-T)/kk),m=1.96*SE;
 P.forEach((p,i)=>{const y=T+i*dy+dy/2;ctx.strokeStyle=PAL['s2'];ctx.globalAlpha=0.5;ctx.lineWidth=Math.max(1.5,Math.min(4,dy*0.3));ctx.beginPath();ctx.moveTo(X(p-m),y);ctx.lineTo(X(p+m),y);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(X(p),y,Math.min(5,dy*0.4+1.5),0,7);ctx.fill();});
 const ya=292,xa=X(a);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.moveTo(xa,ya-9);ctx.lineTo(xa+9,ya);ctx.lineTo(xa,ya+9);ctx.lineTo(xa-9,ya);ctx.closePath();ctx.fill();
 txt(ctx,(big?'Avg ':'Average: ')+f1(a)+'%',xa+14,ya,{s:12*k,w:700,c:PAL['rj'],b:'middle'});
 const yb=AY+40*k;if(sim.p.shared>0){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(xt,yb-6);ctx.lineTo(xt,yb+6);ctx.moveTo(xt,yb);ctx.lineTo(X(TA+sim.p.shared),yb);ctx.moveTo(X(TA+sim.p.shared),yb-6);ctx.lineTo(X(TA+sim.p.shared),yb+6);ctx.stroke();
  txt(ctx,(big?'Shared: ':'Shared error: ')+f1(sim.p.shared)+' points',X(TA+sim.p.shared)+10,yb,{s:12*k,w:700,c:PAL['s1'],b:'middle'});}
 const y2=yb+28*k;if(y2<446)txt(ctx,big?`1 poll: ${f1(oneT(sim))}; average: ${f1(avgT(sim))}; floor: ${f1(sim.p.shared)}`:`Typical miss: one poll ${f1(oneT(sim))} points, this average ${f1(avgT(sim))}. No number of polls gets below ${f1(sim.p.shared)}.`,20,y2,{s:12*k,c:PAL['cv-ink'],b:'middle'});}

function drawFc(sim,ctx,k){const big=k>1.3,L=70,T=46,Wd=big?250:290,H=big?250:290,X=f=>L+f*Wd,Y=f=>T+H-f*H,C=calib(sim);
 txt(ctx,big?'Happened':'Share that happened',L,26,{s:12*k,w:700,c:PAL['cv-soft']});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(L,T,Wd,H);
 for(let v=0;v<=100;v+=big?50:25){txt(ctx,v+'%',L-6,Y(v/100),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});txt(ctx,v+'%',X(v/100),T+H+6,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});}
 txt(ctx,'Forecast chance',L+Wd/2,T+H+28*k,{s:12*k,w:700,c:PAL['cv-soft'],a:'center',b:'top'});
 ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(1),Y(1));ctx.stroke();ctx.setLineDash([]);
 if(!big)txt(ctx,'Perfect calibration',X(0.62),Y(0.62)-14,{s:12,c:PAL['cv-soft'],a:'right',b:'middle'});
 ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();C.forEach((b,i)=>{const x=X(b.f),y=Y(b.y/b.n);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
 C.forEach(b=>{ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(b.f),Y(b.y/b.n),4+Math.sqrt(b.n)*0.7,0,7);ctx.fill();});
 /* what 70% means */
 const RX=big?360:430,ev=ev70(sim).slice(0,50),hit=sum(ev.map(e=>e.o));
 txt(ctx,big?'50 events, 70% chance':'What 70% means: 50 events with a 70% chance',RX,26,{s:13*k,w:700});
 const sz=big?28:30;ev.forEach((e,i)=>{const x=RX+(i%10)*sz,y=46+Math.floor(i/10)*sz;ctx.lineWidth=2;if(e.o){ctx.fillStyle=PAL['s3'];ctx.fillRect(x,y,sz-6,sz-6);}else{ctx.strokeStyle=PAL['cv-soft'];ctx.strokeRect(x+1,y+1,sz-8,sz-8);}});
 let y=46+5*sz+16*k;txt(ctx,`${hit} of 50 happened (${f1(100*hit/50)}%). ${50-hit} did not.`,RX,y,{s:12*k,w:700,b:'middle'});
 y+=24*k;if(!big){txt(ctx,'A 70% favorite should lose about 3 times in 10.',RX,y,{s:12,c:PAL['cv-soft'],b:'middle'});y+=30;}
 const rows=[['cal','Calibrated'],['over','Overconfident'],['coin','Always 50%']];txt(ctx,'Brier score (lower is better)',RX,y,{s:12*k,w:700,b:'middle'});y+=22*k;
 rows.forEach(r=>{const cur=r[0]===sim.p.fcst;if(y<444)txt(ctx,`${r[1]}: ${brierOf(sim,r[0]).toFixed(3)}`,RX,y,{s:12*k,w:cur?700:400,c:cur?PAL['rj']:PAL['cv-ink'],b:'middle'});y+=20*k;});}

BioLab.register(SIM);
})();
