(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Who votes? Turnout = ballots counted / a denominator. Data: UF Election Lab (Michael McDonald), 2024 general election
   turnout v0.4, estimates as of March 2, 2026. VEP = VAP − noncitizens − ineligible people with felony convictions + eligible overseas.
   Rates here are computed from the stored counts (ballots ÷ VEP, ballots ÷ VAP), and match the file's published rates.
   Model view (illustrative): new turnout = base + an assumed effect in points; extra voters = effect/100 × VEP.
   One vote (illustrative): forecast vote share ~ Normal(mu, sigma); P(exact tie) ≈ φ((50 − mu)/sigma) / (sigma/100 × N). */
const US={b:156766239,vap:264798961,vep:243803423,fel:2609565,ovs:3325217};
const NONC=US.vap-US.vep-US.fel+US.ovs;
/* abbreviation, ballots counted, VAP, VEP */
const ST=[['AL',2270000,4020661,3867406],['AK',340981,560512,536581],['AZ',3428011,5951329,5366526],['AR',1190172,2391789,2201764],['CA',16140044,30601993,25922868],['CO',3241120,4728091,4415631],['CT',1788981,2912979,2670153],['DE',518330,835621,776224],['DC',328871,561851,506415],['FL',11004209,18664571,16327632],['GA',5297264,8647469,7793977],['HI',522236,1140526,1038968],['ID',917469,1532761,1429619],['IL',5705246,9862416,8982526],['IN',2976581,5321237,5041013],['IA',1674011,2491222,2359332],['KS',1344147,2257952,2122704],['KY',2092872,3531795,3327188],['LA',2021164,3500993,3305398],['ME',842447,1157850,1130059],['MD',3062527,4845926,4411216],['MA',3512930,5695621,5132767],['MI',5706503,7959215,7624237],['MN',3272414,4479893,4277436],['MS',1250000,2268545,2164463],['MO',3000000,4856207,4642204],['MT',612423,911605,896053],['NE',965236,1512908,1406843],['NV',1487887,2541020,2249102],['NH',831467,1158408,1127497],['NJ',4321921,7330478,6401643],['NM',928290,1675845,1554606],['NY',8381429,15566053,13853326],['NC',5723987,8674601,8102246],['ND',371975,605359,582216],['OH',5851387,9261250,8947502],['OK',1575000,3131836,2945902],['OR',2308256,3412120,3211515],['PA',7075000,10350349,9903829],['RI',523402,897523,826559],['SC',2566404,4337447,4121955],['SD',436478,709340,676581],['TN',3080000,5651068,5317723],['TX',11400000,23513616,20059077],['UT',1525885,2545169,2357958],['VT',372885,535384,527067],['VA',4537976,6891962,6350428],['WA',3961569,6226585,5640909],['WV',770587,1416183,1387010],['WI',3437142,4704055,4483698],['WY',271123,459772,442780]];
const NAME={CO:'Colorado',CA:'California',TX:'Texas',WI:'Wisconsin',HI:'Hawaii',MN:'Minnesota'};
const rateOf=(s,dn)=>100*s[1]/(dn==='vap'?s[2]:s[3]);
const usRate=dn=>100*US.b/(dn==='vap'?US.vap:US.vep);
const DN=sim=>sim.p.denom;
const sorted=dn=>ST.slice().sort((a,b)=>rateOf(b,dn)-rateOf(a,dn));
const rankOf=(ab,dn)=>sorted(dn).findIndex(s=>s[0]===ab)+1;
const mean51=dn=>ST.reduce((t,s)=>t+rateOf(s,dn),0)/ST.length;
const spread=dn=>{const r=ST.map(s=>rateOf(s,dn));return Math.max(...r)-Math.min(...r);};
const CO=ST.find(s=>s[0]==='CO');
const PLACE={us:{n:'the U.S.',base:usRate('vep'),vep:US.vep,b:US.b},co:{n:'Colorado',base:rateOf(CO,'vep'),vep:CO[3],b:CO[1]}};
const RULE={mail:{l:'Mail a ballot to every voter',lo:2,hi:2,def:2,ev:'Studies of California, Utah and Washington counties: about 2 points (Thompson and colleagues, 2020).'},
 cvu:{l:'Compulsory voting, not enforced',lo:7.5,hi:10,def:8.5,ev:'Cross-national study: about 7.5 to 10 points of registered voters (Kostelka, Singh and Blais).'},
 cve:{l:'Compulsory voting, enforced',lo:14.5,hi:18.5,def:16.5,ev:'Same study, with enforced penalties: about 14.5 to 18.5 points of registered voters.'},
 avr:{l:'Automatic registration',lo:null,hi:null,def:0,ev:'No single estimate here. Oregon, 2016: of more than 230,000 people registered automatically, 97,184 voted. Mixed evidence.'}};
const place=sim=>PLACE[atLeast('honors')?sim.p.place:'us'];
const newT=sim=>Math.min(100,place(sim).base+sim.p.eff);
const extra=sim=>(newT(sim)-place(sim).base)/100*place(sim).vep;
const phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
const tieOdds=sim=>{const N=place(sim).b,z=(50-sim.p.mu)/sim.p.sigma;return (sim.p.sigma/100*N)/phi(z);};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The rates stay hidden while the student works out the turnout ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on&&sim.st.peek)||(GS(sim)&&GS(sim).g&&!pend(sim)));
const f1=v=>v.toFixed(1),f0=v=>Math.round(v).toLocaleString('en-US'),mil=v=>(v/1e6).toFixed(1)+' million';
const sig3=v=>{const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(v))-2));return f0(Math.round(v/p)*p);};
const ord=n=>n+(n%100>=11&&n%100<=13?'th':['th','st','nd','rd'][n%10]||'th');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const TRUE=usRate('vep');
const ans=(sim,g)=>({v:Math.abs(g-TRUE),g,label:`${f1(g)} of every 100 eligible citizens`});
const MARGIN='<a href="#margin">The margin</a>';

function infoHTML(sim){const nv=US.vep-US.b;
 let h=`<p><b>What this number hides.</b> The U.S. figure${shown(sim)?' of '+f1(usRate('vep'))+'%':''} is one number for ${mil(US.vep)} eligible citizens. It hides:</p><ul>`+
 `<li><b>Places:</b> state turnout ran from ${f1(rateOf(ST.find(s=>s[0]==='HI'),'vep'))}% in Hawaii to ${f1(rateOf(ST.find(s=>s[0]==='WI'),'vep'))}% in Wisconsin, a ${f1(spread('vep'))}-point gap.</li>`+
 `<li><b>People outside the denominator:</b> about ${mil(NONC)} adults who live in the U.S. but are not citizens, and ${mil(US.fel)} citizens who could not vote because of a felony conviction, are not in VEP at all, so no turnout rate counts them.</li>`+
 `<li><b>Reasons:</b> about ${mil(nv)} eligible citizens did not vote. The rate does not record why.</li></ul>`;
 if(atLeast('ap'))h+=`<p><b>One vote.</b> See ${MARGIN} for how small changes across many people add up.</p>`;
 return h;}

const SIM={
 id:'turnout',hash:'turnout',apUnit:6,order:2,tab:'Who votes?',kind:'Simulation',next:['margin'],
 skills:{bio:'Rates: a count divided by a denominator · Algebra 1 (Unit 2), US Government (Unit 3)',honors:'Rates, denominators and weighted averages of rates · Algebra 1 (Unit 2), Statistics (Chapter 1), US Government (Unit 3)',ap:'Probability density and the chance of an exact tie · AP Statistics (Unit 4), AP US Government (Units 4 and 5)'},
 card:'Guess how many eligible Americans voted in 2024, then watch the same ballots give different turnout rates, and different rankings, with different denominators.',
 title:'Who votes? Turnout around the world',
 lede:{bio:'Turnout is ballots divided by people. Which people? All adults, eligible citizens or registered voters each give a different number and a different ranking. Before you compare places, check the denominator.',
  honors:'Countries and states vote under different rules: compulsory voting, mail ballots, automatic registration, weekend voting. Some effects are well measured, some are mixed, and none can be read straight off a ranking.',
  ap:'One vote moves turnout by a tiny fraction of a point, and it decides an election only if everyone else ties. Model that chance, then compare it with published estimates.'},
 scale:'U.S. 2024 presidential election: 156.8 million ballots counted. Figures are from the sources in About this model.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Count the voters',
 controls:[
  {id:'guess',label:'Your gut: of every 100 eligible citizens, how many voted?',type:'range',min:20,max:100,step:1,def:50,unit:''},
  {id:'view',label:'Show',type:'seg',def:'count',noGut:true,options:[{v:'count',l:'Denominators'},{v:'states',l:'States'},{v:'rules',l:'Rules',lvl:'honors'},{v:'model',l:'A rule change',lvl:'honors'},{v:'one',l:'One vote',lvl:'ap'}]},
  {id:'denom',label:'Count turnout against',type:'seg',def:'vep',noGut:true,options:[{v:'vep',l:'Eligible citizens (VEP)'},{v:'vap',l:'All adults (VAP)'}],help:'VAP: everyone 18 and older living here. VEP: VAP minus noncitizens and people barred by a felony conviction, plus eligible citizens living abroad.'},
  {id:'place',label:'Place',type:'seg',def:'us',lvl:'honors',noGut:true,options:[{v:'us',l:'United States'},{v:'co',l:'Colorado'}]},
  {id:'rule',label:'Rule change',type:'seg',def:'mail',lvl:'honors',noGut:true,onChange:sim=>{sim.p.eff=RULE[sim.p.rule].def;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.eff)sim.ui.ctl.eff.set(sim.p.eff);},options:[{v:'mail',l:'Mail ballots'},{v:'cvu',l:'Compulsory'},{v:'cve',l:'Compulsory, enforced'},{v:'avr',l:'Auto-registration'}]},
  {id:'eff',label:'Effect you assume',type:'range',min:0,max:20,step:0.5,def:2,unit:' points',lvl:'honors',noGut:true,help:'An assumption for a what-if, not a prediction.'},
  {id:'mu',label:'Forecast share for side A',type:'range',min:40,max:60,step:0.5,def:50,unit:'%',lvl:'ap',noGut:true},
  {id:'sigma',label:'Forecast uncertainty (1 standard deviation)',type:'range',min:0.5,max:5,step:0.5,def:2,unit:' points',lvl:'ap',noGut:true},
  {id:'show',label:'Show the answers now',type:'toggle',def:false,help:'Normally the turnout rates appear once you lock in your gut.'}
 ],
 init(){return {peek:0};},step(){},
 infoPanel:infoHTML,
 metrics:[
  {id:'rate',label:'U.S. 2024 turnout, this denominator',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?usRate(DN(sim)):null},
  {id:'ballots',label:'Ballots counted, U.S. 2024',unit:'million',d:1,min:0,max:300,get:()=>US.b/1e6},
  {id:'den',label:'Denominator',unit:'million',d:1,min:0,max:300,get:sim=>(DN(sim)==='vap'?US.vap:US.vep)/1e6},
  {id:'corank',label:'Colorado’s rank of 51',unit:'',d:0,min:1,max:51,get:sim=>rankOf('CO',DN(sim))},
  {id:'spread',label:'Highest state minus lowest',unit:'points',d:1,min:0,max:40,get:sim=>spread(DN(sim))},
  {id:'gap',label:'VEP rate minus VAP rate',unit:'points',d:1,lvl:'honors',min:0,max:10,get:sim=>shown(sim)?usRate('vep')-usRate('vap'):null},
  {id:'carank',label:'California’s rank of 51',unit:'',d:0,lvl:'honors',min:1,max:51,get:sim=>rankOf('CA',DN(sim))},
  {id:'mean51',label:'Plain average of the 51 rates',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>mean51(DN(sim))},
  {id:'newt',label:'Turnout with the rule (illustrative)',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>sim.p.view==='model'?newT(sim):null},
  {id:'extra',label:'Extra voters (illustrative)',unit:'million',d:2,lvl:'honors',min:0,max:60,get:sim=>sim.p.view==='model'?extra(sim)/1e6:null},
  {id:'odds',label:'Exact tie in this place: 1 in',unit:'',d:0,lvl:'ap',min:0,max:null,get:sim=>sim.p.view==='one'?tieOdds(sim):null},
  {id:'onev',label:'One vote’s effect on Colorado turnout',unit:'points',d:7,lvl:'ap',min:0,max:0.001,get:sim=>sim.p.view==='one'?100/CO[3]:null}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const v=sim.p.view;
  if(v==='states')return drawStates(sim,ctx,k);
  if(v==='rules'&&atLeast('honors'))return drawRules(sim,ctx,k);
  if(v==='model'&&atLeast('honors'))return drawModel(sim,ctx,k);
  if(v==='one'&&atLeast('ap'))return drawOne(sim,ctx,k);
  drawCount(sim,ctx,k);},
 narrate(sim){const v=sim.p.view,dn=DN(sim);
  if(v==='states')return `Sorted by ${dn==='vep'?'eligible citizens (VEP)':'all adults (VAP)'}, Colorado ranks <b>${ord(rankOf('CO',dn))}</b> of 51 and California ${ord(rankOf('CA',dn))}. ${dn==='vap'?'<b>States with many adults who are not citizens drop, because those adults sit in the denominator but cannot vote.</b>':'Switch to all adults (VAP) and watch states with many noncitizen adults fall.'}`;
  if(v==='rules'&&atLeast('honors'))return 'Each bar uses its own denominator: enrolled voters, voting-age population or eligible citizens. <b>A ranking that mixes them compares different things.</b> Australia’s jump from 59% to 91% came with compulsory voting; Colorado’s high turnout comes with mail ballots, but many other things differ too.';
  if(v==='model'&&atLeast('honors')){const P=place(sim),R=RULE[sim.p.rule];return `If ${R.l.toLowerCase()} added ${f1(sim.p.eff)} points in ${P.n}, turnout would go from ${f1(P.base)}% to ${f1(newT(sim))}%: about <b>${(extra(sim)/1e6).toFixed(2)} million more voters</b>. This is a what-if with an assumed effect, not a prediction.`;}
  if(v==='one'&&atLeast('ap'))return `With ${f0(place(sim).b)} ballots and a forecast of ${f1(sim.p.mu)}% ± ${f1(sim.p.sigma)}, the chance of an exact tie is about <b>1 in ${sig3(tieOdds(sim))}</b>. Only then does one vote decide.`;
  if(!shown(sim)&&pend(sim))return `<b>Your turn:</b> ${f0(US.b)} ballots ÷ ${f0(US.vep)} eligible citizens. Work it out as a number out of 100.`;
  if(!shown(sim))return `${f1(US.b/1e6)} million ballots were counted in the 2024 U.S. presidential election. <b>Out of every 100 eligible citizens, how many voted?</b> Lock in your gut first.`;
  return `The same ${f1(US.b/1e6)} million ballots are <b>${f1(usRate('vep'))}%</b> of eligible citizens and <b>${f1(usRate('vap'))}%</b> of all adults. The ${f1(usRate('vep')-usRate('vap'))}-point gap is the denominator, not the voters.`;},
 gut:{better:'lower',controls:['guess'],
  ask:'In the 2024 U.S. presidential election, out of every 100 citizens who were eligible to vote, how many do you think voted? Drag <b>Your gut</b> here, then lock it in.',
  lock(sim){return ans(sim,sim.p.guess);},
  solve(sim){sim.p.guess=TRUE;if(sim.p.view!=='count')sim.p.view='count';return ans(sim,TRUE);},
  hint:'Lock in your gut answer. Then you will work out the real number yourself from the ballots and the eligible citizens.',
  calc:{unit:'of 100',d:1,tol:0.15,
   prompt:{bio:`<b>${f0(US.b)}</b> ballots were counted. <b>${f0(US.vep)}</b> citizens were eligible to vote (VEP). Divide, then multiply by 100: out of every 100 eligible citizens, how many voted? Use a calculator and round to one decimal place.`,
    honors:`Ballots: ${f0(US.b)}. Eligible citizens (VEP): ${f0(US.vep)}. Find the VEP turnout as a number out of 100, to one decimal place. (Then think: would dividing by all ${f0(US.vap)} adults give more or less?)`},
   answer:()=>Math.round(TRUE*10)/10,
   hint:'Divide the ballots by the eligible citizens: you should get a decimal less than 1. Multiply by 100.',
   steps:()=>[`Divide: ${f0(US.b)} ÷ ${f0(US.vep)} = ${(US.b/US.vep).toFixed(4)}.`,`Times 100: <b>${f1(TRUE)}</b> of every 100 eligible citizens voted.`,`The same ballots ÷ ${f0(US.vap)} adults (VAP) = ${f1(usRate('vap'))} of 100. A bigger denominator gives a smaller rate.`]},
  formula:()=>`VEP turnout = ${f0(US.b)} ÷ ${f0(US.vep)} × 100 = ${f1(TRUE)}; VAP turnout = ${f0(US.b)} ÷ ${f0(US.vap)} × 100 = ${f1(usRate('vap'))}`,
  how:{bio:'Divide the ballots by the people who could have cast them: 156,766,239 ÷ 243,803,423 ≈ 0.643, so 64.3 of every 100 eligible citizens voted.',
   honors:'VEP turnout = ballots ÷ (VAP − noncitizens − ineligible people with felony convictions + eligible citizens abroad) = 156.8 ÷ 243.8 million ≈ 64.3%. VAP turnout = 156.8 ÷ 264.8 million ≈ 59.2%.'},
  compare(sim,g,m){const d=Math.abs(g.g-TRUE),ppl=d/100*US.vep,tail=` Counted against all adults instead, it is ${f1(usRate('vap'))}%: the denominator alone moves the number ${f1(usRate('vep')-usRate('vap'))} points, and moves California from ${ord(rankOf('CA','vep'))} to ${ord(rankOf('CA','vap'))} among the 51 states and D.C.`;
   if(d<2)return `Your gut was right on: ${f1(g.g)} against ${f1(TRUE)}. That is ${f1(US.b/1e6)} million ballots out of ${f1(US.vep/1e6)} million eligible citizens.${tail}`;
   return `Your gut said ${f1(g.g)}; it was <b>${f1(TRUE)}</b>. You were ${f1(d)} points ${g.g<TRUE?'low':'high'}: about <b>${mil(ppl)}</b> people.${tail}`;},
  again(sim){sim.p.guess=50;sim.p.show=false;sim.p.view='count';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Colorado, 2024: 3,241,120 ballots were counted, and 4,415,631 citizens were eligible to vote. Out of every 100 eligible Coloradans, how many voted? Round to one decimal place.',answer:73.4,tol:0.1,unit:'of 100',d:1,hint:'Divide the ballots by the eligible citizens, then multiply by 100.',explain:'3,241,120 ÷ 4,415,631 = 0.734, so 73.4 of every 100 eligible Coloradans voted: 9.1 more per 100 than the U.S. rate of 64.3.'},
  {lvl:'bio',instant:true,q:'The same 156.8 million ballots are divided by two different groups. Which gives the higher turnout rate?',choices:['All adults living in the U.S. (VAP)','Eligible citizens (VEP), because it is the smaller group','They give the same rate'],correct:1,explain:'156.8 ÷ 243.8 million = 64.3% (VEP); 156.8 ÷ 264.8 million = 59.2% (VAP). Same voters, smaller denominator, bigger rate.'},
  {lvl:'bio',instant:true,q:'California ranks 38th of 51 by VEP turnout. Where does it rank by VAP turnout?',choices:['About the same','47th: about 15% of its adults are not citizens and cannot vote','1st'],correct:1,explain:'California’s VEP turnout is 62.3%, its VAP turnout 52.7%. Noncitizen adults count in VAP but cannot vote, so states with many of them drop. Colorado only moves from 6th to 7th.'},
  {lvl:'bio',instant:true,q:'What does the national turnout figure of 64.3% hide?',choices:['Nothing: it is the same everywhere','A 26.4-point gap between states, and 21.7 million adults who live here but are not counted at all','Only mail ballots'],correct:1,explain:'Wisconsin reached 76.7% and Hawaii 50.3%. And VEP leaves out about 21.7 million noncitizen adults and 2.6 million citizens barred by a felony conviction. One average hides places and people.'},
  {lvl:'honors',instant:true,q:'Australia’s 2025 turnout was 90.7% of enrolled voters, and 98.2% of eligible people were enrolled. About what share of eligible people voted?',choices:['About 98%','About 91%','About 89%'],correct:2,explain:'0.907 × 0.982 ≈ 0.891, about 89.1%. A rate based on registered (enrolled) voters is always at least as high as one based on everyone eligible.'},
  {lvl:'honors',instant:true,q:'Colorado’s turnout rose from 51.7% in 2010 to 54.7% in 2014, after its 2013 law began mailing ballots to voters. Does that prove the law added 3 points?',choices:['Yes: turnout rose right after the law','No: 2014 also had a high-profile, competitive U.S. Senate race, and many things change between elections','No: mail ballots always lower turnout'],correct:1,explain:'A before-and-after comparison cannot separate the law from everything else that changed. Pew Charitable Trusts said the law’s effect “cannot be precisely measured.” Studies that compare similar counties found about 2 points for mail ballots.'},
  {lvl:'honors',instant:true,q:'Colorado: 3,241,120 ballots, 4,415,631 eligible (73.4%). Texas: 11,400,000 ballots, 20,059,077 eligible (56.8%). What is their combined turnout?',choices:['65.1%, the average of the two rates','59.8%: Texas has far more voters, so it weighs more','73.4%'],correct:1,explain:'Combined = (3,241,120 + 11,400,000) ÷ (4,415,631 + 20,059,077) = 14,641,120 ÷ 24,474,708 ≈ 59.8%. A plain average of rates treats a small state like a big one; a weighted average does not.'},
  {lvl:'ap',instant:true,q:'Model: 3,241,120 ballots and a forecast of 50% ± 2 points for side A. About how likely is an exact tie?',choices:['About 1 in 1,600','About 1 in 162,000','About 1 in 3 million'],correct:1,explain:'Density of the vote share at 50% is φ(0) ÷ 0.02 ≈ 19.9 per unit share. One vote is 1 ÷ 3,241,120 of the share, so P ≈ 19.9 ÷ 3,241,120 ≈ 1 in 162,000. A tie decides a state, not a presidency: Gelman, Silver and Edlin put the 2008 chance of deciding the national result at about 1 in 10 million in Colorado.'},
  {lvl:'ap',instant:true,q:'One study estimates enforced compulsory voting adds 14.5 to 18.5 points of registered-voter turnout. As an illustration only, 14.5 points of the 243.8 million U.S. eligible citizens is about how many people?',choices:['About 3.5 million','About 35 million','About 145 million'],correct:1,explain:'0.145 × 243.8 million ≈ 35.4 million. The estimate came from other countries and from registered voters, so carrying it to the U.S. is a what-if, not a forecast.'}
 ],
 tour:[
  {title:'The ballots',text:'156.8 million ballots were counted in the 2024 U.S. presidential election. Turnout is that number divided by a group of people. Which group is the whole question.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'count',denom:'vep',show:false,place:'us',rule:'mail',eff:2,mu:50,sigma:2});sim.st.peek=0;}},
  {title:'Two denominators',text:'156.8 ÷ 264.8 ≈ 0.592: 59.2% of all adults (VAP) voted. 156.8 ÷ 243.8 ≈ 0.643: 64.3% of eligible citizens (VEP). Same ballots, different denominators.',pause:true,setup:sim=>{sim.st.peek=1;}},
  {title:'Who is left out',text:'VEP removes about 21.7 million adults who are not citizens and 2.6 million barred by a felony conviction, and adds 3.3 million eligible citizens living abroad. They are real people a turnout rate does not count.',pause:true,focus:[0,90,800,140],setup:sim=>{sim.st.peek=1;}},
  {title:'Rankings move',text:'All 50 states and D.C., by VAP turnout. By VEP, Colorado was 6th and California 38th. By VAP, California falls to 47th: about 15% of its adults are not citizens. Colorado moves to 7th. The voters did not change; the denominator did.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'states',denom:'vap'});}},
  {lvl:'honors',title:'Rules around the world',text:'Australia made voting compulsory in 1924: turnout of enrolled voters went from 59.4% in 1922 to 91.4% in 1925. Each bar here names its denominator, because they are not all the same.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'rules',denom:'vep'});}},
  {lvl:'honors',title:'A what-if',text:'Suppose mailing every voter a ballot added about 2 points, the size studies found in three states. Across 243.8 million eligible citizens, that is about 4.9 million more voters. It is an illustration, with the effect assumed.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'model',place:'us',rule:'mail',eff:2});}},
  {lvl:'ap',title:'One vote',text:'One vote moves Colorado’s turnout by 0.0000226 points. It decides a result only in an exact tie: with 3.2 million ballots and a 50% ± 2 forecast, about 1 in 162,000.',pause:true,setup:sim=>{sim.st.peek=1;BioLab.setValues(sim,{view:'one',place:'co',mu:50,sigma:2});}}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the denominator change the story?</p><ol><li>Turn on <b>Show the answers now</b>. Record a trial with each denominator.</li><li>Open <b>States</b>. Record Colorado’s rank with each denominator, then find California and Texas.</li></ol><p>Write one sentence: why does a state with many noncitizen adults drop when you switch to VAP?</p>',
  honors:'<p><b>Question:</b> What can a turnout comparison tell you about a rule?</p><ol><li>Open <b>Rules</b>. List each bar’s denominator.</li><li>Open <b>A rule change</b>. For each rule, record the extra voters at the low and high end of the evidence, for the U.S. and for Colorado.</li></ol><p>Then a discussion question with no single right answer: should a government require people to vote? Give the strongest case on each side, using About this model.</p>',
  ap:'<p><b>Question:</b> How does the chance of a tie depend on the race?</p><ol><li>Open <b>One vote</b>. Record the odds for forecasts of 50%, 51% and 53%, with uncertainty of 1, 2 and 4 points.</li><li>Repeat for the U.S. and for Colorado.</li></ol><p><b>CER:</b> Explain why the odds grow with the number of voters and fall fast as the forecast moves from 50%. Then an open question: does a tiny chance of deciding settle whether one vote matters? Weigh the math against other reasons people give, including the Catholic teaching in About this model.</p>'},
 terms:[
  {t:'Turnout',d:'Ballots counted divided by a group of people who could have voted. Always ask: which group?'},
  {t:'Voting-age population (VAP)',d:'Everyone 18 and older living in a place, including people who cannot vote.'},
  {t:'Voting-eligible population (VEP)',d:'VAP minus noncitizens and people barred by a felony conviction, plus eligible citizens living abroad.'},
  {t:'Registered (enrolled) voters',d:'People on the voter roll. Turnout of registered voters is at least as high as turnout of all eligible people.'},
  {t:'Denominator',d:'The number you divide by. Changing it changes the rate, and can change a ranking.'},
  {t:'Compulsory voting',d:'A law requiring citizens to vote, sometimes with penalties. Australia adopted it for federal elections in 1924.',lvl:'honors'},
  {t:'Weighted average',d:'An average that counts each part by its size. National turnout is a weighted average of state turnouts.',lvl:'honors'},
  {t:'Pivotal vote',d:'A vote that changes the result, which happens only if all other votes tie.',lvl:'ap'}
 ],
 about:'<p><b>Rules, and the strongest case on each side.</b> These are arguments people make, not findings.</p><ul>'+
  '<li><b>Compulsory voting.</b> For: near-universal participation, so results reflect everyone and campaigns must reach everyone. Against: freedom includes the choice not to vote, fines fall hardest on people with the least, and forced votes may be uninformed.</li>'+
  '<li><b>Mail ballots to every voter.</b> For: convenience, time to study the ballot, and lower costs (Colorado counties’ costs fell 40% on average in five categories). Against: worries about ballots sent to old addresses, chain of custody and slower counts, and losing voting as a shared public act.</li>'+
  '<li><b>Automatic registration.</b> For: fuller, more current voter rolls. Against: it adds people who may not plan to vote and depends on agency records being right. Oregon’s first results were mixed.</li>'+
  '<li><b>Weekend or holiday voting.</b> For: fewer conflicts with work and school. Against: weekend jobs and religious observance, and a holiday costs a workday. Countries that vote on weekends differ in many other ways too, so comparing them cannot isolate the effect.</li></ul>'+'<p><b>U.S. 2024.</b> UF Election Lab (Michael McDonald), 2024 general election turnout rates, version 0.4, estimates as of March 2, 2026 (<a href="https://election.lab.ufl.edu/2024-general-election-turnout" target="_blank" rel="noopener">election.lab.ufl.edu</a>; data file <a href="https://election.lab.ufl.edu/data-downloads/turnoutdata/Turnout_2024G_v0.4.csv" target="_blank" rel="noopener">Turnout_2024G_v0.4.csv</a>). Ballots counted 156,766,239; VAP 264,798,961 (59.2%); VEP 243,803,423 (64.3%); noncitizens 8.2% of VAP; ineligible because of a felony conviction 2,609,565; eligible citizens overseas 3,325,217. State counts are stored in this page from the same file; rates and ranks are computed here and match the file. These estimates may be revised.</p>'+
 '<p><b>Definitions.</b> International IDEA’s Voter Turnout Database codebook (2018): VAP turnout is the total vote divided by the voting-age population; voter turnout is the total vote divided by registered voters (<a href="https://www.idea.int/sites/default/files/publications/voter-turnout-database-codebook.pdf" target="_blank" rel="noopener">idea.int</a>).</p>'+
 '<p><b>Other countries.</b> Pew Research Center, Nov 1, 2022 (<a href="https://www.pewresearch.org/short-reads/2022/11/01/turnout-in-u-s-has-soared-in-recent-elections-but-by-some-measures-still-trails-that-of-many-other-countries/" target="_blank" rel="noopener">pewresearch.org</a>): U.S. 2020 turnout was 62.8% of the voting-age population, 31st of 50 countries, but 94.1% of registered voters. Luxembourg 2018: 48.2% of VAP, 89.7% of registered voters. Switzerland 2019: 36.1% of VAP, 45.1% of registered. Of the 50 countries, the 8 that enforce compulsory voting averaged 78.2% of VAP; 4 with unenforced laws, 57.6%; the other 38 and Switzerland, 65%. Australian Electoral Commission: a 1924 private member’s bill made federal voting compulsory; turnout was 59.38% in 1922 and 91.38% in 1925 (<a href="https://aec.gov.au/about_AEC/publications/voting/files/compulsory-voting.pdf" target="_blank" rel="noopener">aec.gov.au</a>). 2025 federal election: turnout 90.7% of enrolment; enrolment a record 98.2% (<a href="https://aec.gov.au/election/fe25/participation-rates.htm" target="_blank" rel="noopener">aec.gov.au</a>).</p>'+
 '<p><b>Evidence on rules.</b> Kostelka, Singh and Blais, <i>Political Science Research and Methods</i> (2024; online 2022): compulsory voting raises turnout about 7.5 to 10 points of registered voters without enforced sanctions and 14.5 to 18.5 points with them (<a href="https://www.cambridge.org/core/services/aop-cambridge-core/content/view/4ED6699B791F437FDFDC13D7A12D483E/S2049847022000577a.pdf/is_compulsory_voting_a_solution_to_low_and_declining_turnout_crossnational_evidence_since_1945.pdf" target="_blank" rel="noopener">cambridge.org</a>). Thompson, Wu, Yoder and Hall, <i>PNAS</i> (2020): county roll-outs of universal vote-by-mail in California, Utah and Washington, 1996 to 2018, modestly raised turnout, about 2 points, and did not raise either side’s vote share (<a href="https://www.andrewbenjaminhall.com/Thompson_et_al_VBM.pdf" target="_blank" rel="noopener">paper</a>; <a href="https://phys.org/news/2020-04-voting-mail-neutral-partisan-effects.amp" target="_blank" rel="noopener">phys.org</a>). Colorado: HB 13-1303, the Voter Access and Modernized Elections Act, signed May 10, 2013, made it the third state with vote-by-mail for all; the state ranked 2nd in turnout in 2020 (Colorado Secretary of State, 2023, <a href="https://www.coloradosos.gov/pubs/newsRoom/pressReleases/2023/PR20230510VoteByMail.html" target="_blank" rel="noopener">coloradosos.gov</a>). Pew Charitable Trusts (2016): Colorado turnout grew from 51.7% in 2010 to 54.7% in 2014, but the law’s effect “cannot be precisely measured”; 2014 had a competitive, high-profile Senate contest; county costs fell 40% on average in five categories (<a href="https://www.pew.org/en/research-and-analysis/issue-briefs/2016/03/colorado-voting-reforms-early-results" target="_blank" rel="noopener">pew.org</a>). Oregon automatic registration, 2016: more than 230,000 people registered through the program and 97,184 voted; nearly 43% of those registered at the DMV voted, against 79% of people who registered themselves (Stateline, Nov 16, 2016, <a href="https://stateline.org/2016/11/16/oregons-first-test-of-automatic-voter-registration-has-mixed-results/" target="_blank" rel="noopener">stateline.org</a>). This tool found no well-measured effect size for weekend voting to cite, so it gives none.</p>'+
 '<p><b>One vote.</b> Gelman, Silver and Edlin, “What Is the Probability Your Vote Will Make a Difference?” (NBER Working Paper 15220, 2009; <i>Economic Inquiry</i>, 2012): in the 2008 presidential election the average voter had about a 1 in 60 million chance of deciding the national result, and about 1 in 10 million in New Mexico, Virginia, New Hampshire and Colorado (<a href="https://www.nber.org/system/files/working_papers/w15220/w15220.pdf" target="_blank" rel="noopener">nber.org</a>). The tie model here is a simplification: P(exact tie) ≈ φ((50 − μ)/σ) ÷ (σ/100 × ballots), assuming a normal forecast of side A’s share. The rule-change view adds an assumed number of points to a base rate: an illustration, not a prediction, and studies of compulsory voting measured registered voters in other countries.</p>'+
 '<p><b>Catholic social teaching.</b> The Catechism (no. 2240) says “co-responsibility for the common good” makes it “morally obligatory” to “exercise the right to vote” (<a href="https://www.vatican.va/archive/ENG0015/__P7W.HTM" target="_blank" rel="noopener">vatican.va</a>; no. 2239 asks citizens to contribute to “the good of society”). <i>Gaudium et Spes</i> (1965), no. 75, speaks of “the right and also the duty to use their free vote” for the common good (<a href="https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/vat-ii_const_19651207_gaudium-et-spes_en.html" target="_blank" rel="noopener">vatican.va</a>). This tool does not tell anyone how to vote, and whether a government should require voting is a prudential question on which people of good will disagree. No tool here scores an answer to it.</p>'
};

function drawCount(sim,ctx,k){const big=k>1.3,sh=shown(sim),G=GS(sim),dn=DN(sim),hon=atLeast('honors'),L=big?20:190,R=big?640:720,S=(R-L)/US.vap,h=26;
 txt(ctx,big?'U.S. 2024: two denominators':'U.S. 2024: the same 156.8 million ballots, two denominators',20,22,{s:13*k,w:700});
 const bar=(y,lab,den,key)=>{const on=dn===key,lw=den*S,bw=US.b*S;
  if(big)txt(ctx,lab,L,y-8,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft']});else txt(ctx,lab,20,y+h/2,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft'],b:'middle'});
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,y,lw,h);ctx.strokeStyle=on?PAL['cv-ink']:PAL['line'];ctx.lineWidth=on?2:1;ctx.strokeRect(L,y,lw,h);
  ctx.fillStyle=PAL['rj'];ctx.fillRect(L,y,bw,h);txt(ctx,big?'Ballots':'Ballots: 156.8 million',L+8,y+h/2,{s:12*k,w:700,c:'#fff',b:'middle'});
  txt(ctx,sh?f1(100*US.b/den)+'%':'?%',L+lw+8,y+h/2,{s:14*k,w:700,c:on?PAL['rj']:PAL['cv-ink'],b:'middle'});
  if(!big)txt(ctx,mil(den),L+lw-6,y+h+14,{s:12*k,c:PAL['cv-soft'],a:'right'});};
 const y1=big?42+22*k:56,y2=big?y1+h+36*k+30*k:168;
 bar(y1,big?'All adults (VAP): 264.8M':'All adults living here (VAP)',US.vap,'vap');
 if(big)txt(ctx,`−${(NONC/1e6).toFixed(1)}M noncitizens, −${(US.fel/1e6).toFixed(1)}M felony, +${(US.ovs/1e6).toFixed(1)}M abroad`,L,y1+h+18*k,{s:12*k,c:PAL['cv-soft'],b:'middle'});
 else[`− ${mil(NONC)} adults who are not citizens`,`− ${mil(US.fel)} citizens barred by a felony conviction`,`+ ${mil(US.ovs)} eligible citizens living abroad`].forEach((t,i)=>txt(ctx,t,L+10,y1+h+18+i*17,{s:12,c:PAL['cv-soft'],b:'middle'}));
 bar(y2,big?'Eligible citizens (VEP): 243.8M':'Eligible citizens (VEP)',US.vep,'vep');
 if(G&&G.g){const x=L+G.g.g/100*US.vep*S;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y2-6);ctx.lineTo(x,y2+h+6);ctx.stroke();txt(ctx,'Your gut: '+f1(G.g.g),x,y2+h+(big?16*k:22),{s:12*k,w:700,c:PAL['s4'],a:'center',b:'middle'});}
 let y=big?y2+h+40*k:256;
 if(G&&G.m){txt(ctx,big?'156.8M ÷ 243.8M = '+f1(TRUE)+'%':'The math: 156,766,239 ÷ 243,803,423 = '+(US.b/US.vep).toFixed(3)+' = '+f1(TRUE)+'%',20,y,{s:13*k,w:700,c:PAL['rj'],b:'middle'});y+=28*k;}
 else if(pend(sim)){txt(ctx,big?'Your turn: work out the ?':'Your turn: work out the ? yourself',20,y,{s:13*k,w:700,c:PAL['rj'],b:'middle'});y+=28*k;}
 if(hon){txt(ctx,big?'VAP vs. registered voters':'Same idea elsewhere: voting-age population vs. registered voters',20,y,{s:13*k,w:700,b:'middle'});y+=20*k;
  const rows=[['U.S. 2020',62.8,94.1],['Luxembourg 2018',48.2,89.7],['Switzerland 2019',36.1,45.1]];
  if(big){rows.forEach(r=>{if(y<440)txt(ctx,`${r[0]}: ${f1(r[1])}% vs. ${f1(r[2])}%`,20,y,{s:12*k,c:PAL['cv-ink'],b:'middle'});y+=19*k;});}
  else{const bx=150,bw=300;rows.forEach(r=>{txt(ctx,r[0],20,y+8,{s:12,c:PAL['cv-ink'],b:'middle'});ctx.fillStyle=PAL['s2'];ctx.fillRect(bx,y,bw*r[1]/100,7);ctx.fillStyle=PAL['s5'];ctx.fillRect(bx,y+9,bw*r[2]/100,7);
   txt(ctx,`${f1(r[1])}% of VAP (blue), ${f1(r[2])}% of registered (purple)`,bx+bw+10,y+8,{s:12,c:PAL['cv-soft'],b:'middle'});y+=30;});}}
 else txt(ctx,big?'Who counts changes the rate.':'Same voters. Who you count as “could have voted” changes the rate.',20,y,{s:12*k,c:PAL['cv-soft'],b:'middle'});}

function drawStates(sim,ctx,k){const big=k>1.3,dn=DN(sim),S=sorted(dn),L=big?72:40,R=784,B=big?372:386,T=56,lo=40,hi=80,Y=v=>B-(clamp(v,lo,hi)-lo)/(hi-lo)*(B-T),bw=(R-L)/S.length,sh=shown(sim);
 txt(ctx,big?`States, by ${dn.toUpperCase()}`:`2024 turnout, 50 states and D.C., counted against ${dn==='vep'?'eligible citizens (VEP)':'all adults (VAP)'}`,20,22,{s:13*k,w:700});
 for(let v=lo;v<=hi;v+=10){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(R,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+'%',L-4,Y(v),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
 S.forEach((s,i)=>{const r=rateOf(s,dn),x=L+i*bw,hl=s[0]==='CO'?PAL['rj']:(s[0]==='CA'||s[0]==='TX')?PAL['s5']:PAL['s2'];ctx.fillStyle=hl;ctx.globalAlpha=hl===PAL['s2']?0.55:1;ctx.fillRect(x+1,Y(r),bw-2,B-Y(r));ctx.globalAlpha=1;
  const key=s[0]==='CO'||s[0]==='CA'||s[0]==='TX';
  if(!big)txt(ctx,s[0],x+bw/2,B+4+(i%2)*14,{s:12,w:key?700:400,c:key?hl:PAL['cv-soft'],a:'center',b:'top'});
  else if(key)txt(ctx,s[0],x+bw/2,B+4,{s:12*k,w:700,c:hl,a:'center',b:'top'});});
 const lab=(ab)=>{const i=S.findIndex(s=>s[0]===ab),s=S[i],r=rateOf(s,dn),x=L+i*bw+bw/2;return {i,r,x};};
 const co=lab('CO');pill(ctx,(big?'CO ':'Colorado: ')+ord(co.i+1)+', '+f1(co.r)+'%',clamp(co.x+(big?70:90),120,700),Y(co.r)-22*Math.min(k,1.4),PAL['rj'],'#fff',12*Math.min(k,1.4));
 const ca=lab('CA'),u=usRate(dn);let cy=Y(ca.r)-10;if(sh&&Math.abs(cy-Y(u))<16*k)cy=Y(u)-8;txt(ctx,(big?'CA ':'California: ')+ord(ca.i+1),clamp(ca.x,80,700),cy,{s:12*k,w:700,c:PAL['s5'],a:'center'});
 if(sh){ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([6,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,Y(u));ctx.lineTo(R,Y(u));ctx.stroke();ctx.setLineDash([]);
  if(big)txt(ctx,'- - U.S. '+f1(u)+'%',R,22,{s:12*k,w:700,a:'right'});else txt(ctx,'Whole U.S.: '+f1(u)+'%',R,Y(u)-6,{s:12*k,w:700,a:'right'});}}

function drawRules(sim,ctx,k){const big=k>1.3,rows=[
  ['Australia 1922, before compulsory voting',59.38,'enrolled'],['Australia 1925, first compulsory election',91.38,'enrolled'],['Australia 2025',90.7,'enrolled'],
  ['8 countries that enforce compulsory voting',78.2,'VAP'],['4 countries with unenforced laws',57.6,'VAP'],['38 countries and Switzerland, no law',65,'VAP'],
  ['Colorado 2024: mail ballots since 2013',rateOf(CO,'vep'),'VEP'],['United States 2024',usRate('vep'),'VEP']],
  short=['AU 1922','AU 1925','AU 2025','Enforced CV','Unenforced CV','No law','Colorado 2024','U.S. 2024'],
  col={enrolled:PAL['s5'],VAP:PAL['s2'],VEP:PAL['rj']};
 txt(ctx,big?'Rules and turnout':'Rules and turnout: check the denominator before you compare',20,22,{s:13*k,w:700});
 const lw=big?185:300,bx=20+lw,bw=big?390:330,rh=big?46:44;let y=44;
 rows.forEach((r,i)=>{txt(ctx,big?short[i]:r[0],20,y+10,{s:12*k,c:PAL['cv-ink'],b:'middle'});ctx.fillStyle=col[r[2]];ctx.fillRect(bx,y+2,bw*r[1]/100,16);
  txt(ctx,`${f1(r[1])}% of ${r[2]}`,bx+bw*r[1]/100+6,y+10,{s:12*k,w:700,c:PAL['cv-ink'],b:'middle'});y+=rh;});
 if(!big)txt(ctx,'Sources: Australian Electoral Commission; Pew Research Center 2022; UF Election Lab. Averages are of countries, not people.',20,y+6,{s:12,c:PAL['cv-soft'],b:'middle'});}

function drawModel(sim,ctx,k){const big=k>1.3,P=place(sim),R=RULE[sim.p.rule],L=40,Rr=760,X=v=>L+clamp(v,0,100)/100*(Rr-L),y=150,h=40,nt=newT(sim);
 txt(ctx,big?'A rule change: what-if':`A what-if for ${P.n}: ${R.l.toLowerCase()}`,20,22,{s:13*k,w:700});
 txt(ctx,'Illustrative: the effect is an assumption you set.',20,22+20*k,{s:12*k,c:PAL['cv-soft']});
 if(R.lo!==null){const a=X(P.base+R.lo),b=X(P.base+R.hi);ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.3;ctx.fillRect(a-3,y-30,Math.max(6,b-a+6),h+60);ctx.globalAlpha=1;
  txt(ctx,big?'Evidence':'Range in the evidence',(a+b)/2,y-36,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
 ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,y,Rr-L,h);ctx.strokeStyle=PAL['line'];ctx.strokeRect(L,y,Rr-L,h);
 ctx.fillStyle=PAL['s2'];ctx.fillRect(L,y,X(P.base)-L,h);ctx.fillStyle=PAL['rj'];ctx.fillRect(X(P.base),y,X(nt)-X(P.base),h);
 for(let v=0;v<=100;v+=big?25:10)txt(ctx,v+'%',X(v),y+h+6,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});
 txt(ctx,(big?'Now ':'Now: ')+f1(P.base)+'%',X(P.base)-6,y+h/2,{s:12*k,w:700,c:'#fff',a:'right',b:'middle'});
 const yy=y+h+46*k;txt(ctx,`${f1(P.base)}% + ${f1(nt-P.base)} points = ${f1(nt)}%`,20,yy,{s:14*k,w:700,b:'middle'});
 txt(ctx,big?`≈ ${(extra(sim)/1e6).toFixed(2)} million more voters`:`${f1(nt-P.base)} ÷ 100 × ${f0(P.vep)} eligible ≈ ${(extra(sim)/1e6).toFixed(2)} million more voters`,20,yy+26*k,{s:13*k,w:700,c:PAL['rj'],b:'middle'});
 if(!big){const words=R.ev.split(' ');let line='',ly=yy+60;words.forEach(w=>{if((line+w).length>95){txt(ctx,line,20,ly,{s:12,c:PAL['cv-soft'],b:'middle'});line='';ly+=18;}line+=w+' ';});txt(ctx,line,20,ly,{s:12,c:PAL['cv-soft'],b:'middle'});}}

function drawOne(sim,ctx,k){const big=k>1.3,P=place(sim),mu=sim.p.mu,sg=sim.p.sigma,L=40,R=760,lo=35,hi=65,X=v=>L+(v-lo)/(hi-lo)*(R-L),B=270,T=60,pk=phi(0)/sg,Y=d=>B-d/pk*(B-T)*0.9;
 txt(ctx,big?`Forecast for ${P.n}`:`Forecast of side A’s share in ${P.n}: ${f1(mu)}% ± ${f1(sg)} points`,20,22,{s:13*k,w:700});
 ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.25;ctx.beginPath();ctx.moveTo(X(lo),B);for(let v=lo;v<=hi;v+=0.1)ctx.lineTo(X(v),Y(phi((v-mu)/sg)/sg));ctx.lineTo(X(hi),B);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
 ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();for(let v=lo;v<=hi;v+=0.1){const p=[X(v),Y(phi((v-mu)/sg)/sg)];v===lo?ctx.moveTo(...p):ctx.lineTo(...p);}ctx.stroke();
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();for(let v=lo;v<=hi;v+=5)txt(ctx,v+'%',X(v),B+6,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});
 const yt=Y(phi((50-mu)/sg)/sg);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(50),B);ctx.lineTo(X(50),Math.min(B-4,yt));ctx.stroke();
 txt(ctx,big?'Tie':'Exact tie: 50%',X(50)+8,Math.max(T,yt)-8,{s:12*k,w:700,c:PAL['rj']});
 const y=B+48*k;txt(ctx,`Chance of an exact tie: about 1 in ${sig3(tieOdds(sim))}`,20,y,{s:14*k,w:700,c:PAL['rj'],b:'middle'});
 txt(ctx,big?`One vote: +${(100/CO[3]).toFixed(7)} points in CO`:`One vote moves Colorado’s turnout by 1 ÷ ${f0(CO[3])} = ${(100/CO[3]).toFixed(7)} points.`,20,y+26*k,{s:12*k,c:PAL['cv-ink'],b:'middle'});
 if(!big)txt(ctx,'Gelman, Silver and Edlin: in 2008, about 1 in 10 million in Colorado to decide the national result.',20,y+50,{s:12,c:PAL['cv-soft'],b:'middle'});}

BioLab.register(SIM);
})();
