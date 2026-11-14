(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Whose hands? Does it matter whether money goes to a woman or a man in a household? (the question Kristof and WuDunn's Half the Sky, 2009, made famous)
   Pitt and Khandker (Journal of Political Economy, 1998), Bangladesh microcredit, 1991-92 survey: annual household consumption rises
   18 taka for every 100 taka borrowed by women, compared with 11 taka for men. Roodman and Morduch (Journal of Development Studies, 2014)
   re-ran the analysis and found the evidence weak (their estimates had the opposite signs); Pitt and Khandker (World Bank, 2012) defended the result.
   Thomas (Journal of Human Resources, 1990), Brazil: unearned income in a mother's hands had an effect on child survival almost 20 times
   bigger than income in the father's hands. Duflo (World Bank Economic Review, 2003), South Africa: old-age pensions received by women
   raised girls' weight for height by 1.19 standard deviations, with little effect for boys; pensions received by men showed no such effect.
   Randomized tests: Haushofer and Shapiro (QJE 2016), Kenya (GiveDirectly): recipient gender (wife vs. husband) was randomized and did not
   change the household response. Armand, Attanasio, Carneiro and Lechene (Economic Journal 2020), Macedonia: payments randomized to mothers
   or fathers; paying mothers raised the food share of spending by 4 to 5 percentage points. Bastagli et al. (ODI, 2016) review: no conclusive
   evidence on recipient gender. Catechism 2334: God gives man and woman an equal personal dignity. */
const W=18,M=11,RATIO=W/M;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f1=v=>(+v).toFixed(1);
function tag(ctx,t,x,y,bg,size){ctx.font='700 '+size+'px '+FONT;const w=ctx.measureText(t).width+size*1.1;pill(ctx,t,x+w/2,y,bg,'#fff',size);return w;}
function tagR(ctx,t,xr,y,bg,size){ctx.font='700 '+size+'px '+FONT;const w=ctx.measureText(t).width+size*1.1;pill(ctx,t,xr-w/2,y,bg,'#fff',size);return w;}
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function box(ctx,k,x,y,w,h,title,lines){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 let yy=y+18*k;txt(ctx,title,x+12,yy,{s:14*k,w:700,b:'middle'});yy+=18*k;lines.forEach(l=>{yy+=wrap(ctx,l,x+12,yy,w-24,{s:12.5*k,b:'middle'})+4;});}
/* evidence rows: [step it appears, place, method, result text, women value, men value, max, unit] */
const EV=[
 [3,'Brazil (1990)','survey','Child survival: mother’s income had about 20× the effect',20,1,20,'×','Mother’s income: ~20× the effect on child survival'],
 [4,'South Africa (2003)','natural experiment','Girls’ weight for height: grandmother’s pension +1.19 SD; grandfather’s, no clear effect',1.19,0,1.3,'SD','Grandmother’s pension: girls +1.19 SD'],
 [6,'Kenya (2016)','randomized','Wife vs. husband chosen by lottery: no difference in how households spent',1,1,1.3,'','Lottery, wife vs. husband: no difference'],
 [6,'Macedonia (2020)','randomized','Paying mothers raised the food share of spending by 4 to 5 points',4.5,0,5,'pts','Paying mothers: food share +4 to 5 pts']
];

const SIM={
 id:'whosehands',hash:'whosehands',apUnit:5,order:4,tab:'Whose hands?',kind:'Learning tool',prereq:['measurewealth'],next:['remittances'],
 skills:{bio:'Rates per 100 and comparing two rates as a ratio · Algebra 1 (Unit 2), Sociology (Gender), Social Justice (Poverty)',
  honors:'How strong is the evidence? Survey vs. natural experiment vs. randomized trial · Statistics (Chapter 4), AP Comparative Government (Unit 1: development)',
  ap:'Testing a model: does a household pool its income? · Statistics (Chapter 4), AP Statistics (Unit 3), AP Microeconomics (Unit 6)'},
 card:'Lend 100 to a woman or to a man: does the family spend it differently? Work out the ratio, then weigh four studies and see what the strongest tests found.',
 title:'Whose hands? Money to women and to men',
 lede:{bio:'Nicholas Kristof and Sheryl WuDunn’s <i>Half the Sky</i> made a claim famous: money in a woman’s hands does more for her family. See the numbers behind it, then check how strong they are.',
  honors:'Several famous studies say money to women helps children more. Randomized trials, the strongest test, are more mixed. Weigh the evidence by how it was gathered.',
  ap:'If a household pools its income, it should not matter who receives a dollar. Each study is a test of that model; read what each design can and cannot rule out.'},
 scale:'Bangladesh, Brazil, South Africa, Kenya and Macedonia, 1974 to 2016. Peer-reviewed studies; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: taka of added spending per 100 lent to a man',type:'range',min:0,max:40,step:1,def:25,unit:''},
  {id:'reveal',label:'Show the study now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'w',label:'Added spending per 100 lent to a woman',unit:'taka',d:0,min:0,max:40,get:s=>W},
  {id:'m',label:'Added spending per 100 lent to a man',unit:'taka',d:0,min:0,max:40,get:s=>shown(s)?M:null},
  {id:'ratio',label:'Women ÷ men',unit:'×',d:1,min:0,max:3,get:s=>shown(s)?RATIO:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const Wd=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,Wd,H);
  /* left: two households, 100 coins each */
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  txt(ctx,big?'100 taka lent':'Bangladesh, 1991-92: 100 taka lent',20,18,{s:14*k,w:700,b:'middle'});
  const cell=13,gx0=20,gy0=58;
  const grid=(x0,label,n,col,known)=>{txt(ctx,label,x0,gy0-16,{s:13*k,w:700,b:'middle'});
   for(let i=0;i<100;i++){const cx=x0+(i%10)*cell+6,cy=gy0+Math.floor(i/10)*cell+6;ctx.beginPath();ctx.arc(cx,cy,5,0,7);ctx.fillStyle=(known&&i<n)?col:PAL['cv-bg2'];ctx.fill();}
   txt(ctx,known?`+${n} taka a year`:'+? taka a year',x0,gy0+10*cell+14*k,{s:13*k,w:700,c:known?col:PAL['cv-soft'],b:'middle'});};
  grid(gx0,'To a woman',W,'#c8102e',true);
  grid(gx0+150,'To a man',M,'#2b5fb3',sh);
  if(gv!=null&&!sh)txt(ctx,'your gut: +'+gv,gx0+150,gy0+10*cell+32*k,{s:12*k,w:700,c:PAL['s4'],b:'middle'});
  txt(ctx,'Each filled dot = 1 taka of added spending.',gx0,gy0+10*cell+(sh?38:50)*k,{s:11.5*k,c:PAL['cv-soft'],b:'middle'});
  if(sh&&(s>=2))txt(ctx,`18 ÷ 11 = ${f1(RATIO)} times`,gx0,gy0+10*cell+58*k,{s:14*k,w:700,c:PAL['s1'],b:'middle'});
  if(s===1&&ONT)ring(ctx,gx0-6,gy0-28,290,10*cell+50*k);
  if(s===2&&ONT)ring(ctx,gx0-6,gy0+10*cell+46*k,200,24*k);
  if((s===99?sh:s>=5)&&atLeast('honors')){const yy=gy0+10*cell+76*k;const tw=tag(ctx,big?'Disputed':'Disputed: a re-analysis found weak evidence',gx0,yy,'#b5650d',11.5*k);if(s===5&&ONT)ring(ctx,gx0-6,yy-14,tw+12,28);}
  /* right: evidence board */
  const RX=330,RW=Wd-RX-16;let y=20;
  const showEv=EV.filter(e=>s===99?sh:(e[0]<=s&&(e[0]!==6||atLeast('honors'))));
  if(showEv.length){txt(ctx,'Other studies',RX,y,{s:14*k,w:700,b:'middle'});y+=14*k;
   showEv.forEach((e,i)=>{const rh=big?50:56;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,y,RW,rh,8);ctx.fill();
    txt(ctx,e[1],RX+10,y+14*k,{s:12.5*k,w:700,b:'middle'});
    const mc=e[2]==='randomized'?'#2f9e44':e[2]==='survey'?'#8a4fbf':'#e0a10b';tagR(ctx,big&&e[2]==='natural experiment'?'natural exp.':e[2],RX+RW-8,y+14*k,mc,11*k);
    wrap(ctx,big?e[8]:e[3],RX+10,y+32*k,RW-20,{s:11.5*k,b:'middle'});
    if(ONT&&e[0]===s)ring(ctx,RX-4,y-4,RW+8,rh+8);
    y+=rh+6;});}
  const by=Math.max(y+4,s===7||s===8?250:300),bh=H-by-12;
  if(s===7&&atLeast('ap'))box(ctx,k,RX,by,RW,bh,'A model to test',big?['Pooling: who receives a dollar should not matter.','Brazil, South Africa, Macedonia reject it; Kenya does not.']:['Pooling model: a family adds up its income, then decides. Who receives a dollar should not matter.','Brazil, South Africa and Macedonia reject pooling; Kenya does not. A lottery (randomizing) rules out other differences between the families.']);
  else if(s===8)box(ctx,k,RX,by,RW,bh,'A question to discuss',big?['CCC 2334: man and woman have equal dignity.','Who should receive aid? What would you want to know?']:['The Catechism (2334) teaches that God gives man and woman an equal personal dignity.','Many programs (Mexico’s, for one) pay mothers. Discuss: what would you want to know before deciding who receives aid?']);
 },
 narrate(sim){if(!shown(sim))return `In a Bangladesh study, every 100 taka lent to a woman raised her household’s yearly spending by <b>18 taka</b>. What about 100 taka lent to a man? Your gut: ${sim.p.guess}.`;
  return `Lent to a woman: <b>+18 taka</b> per 100. Lent to a man: <b>+11 taka</b>. That is about <b>${f1(RATIO)} times</b> as much. A later re-analysis found this evidence weak, and randomized trials since then are mixed.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In Bangladesh in the 1990s, every 100 taka borrowed by a woman from a microcredit program raised her household’s yearly spending by 18 taka. How much do you think 100 taka borrowed by a man raised it? Drag to your gut guess, then lock it in.',honors:'100 taka lent to a woman: +18 taka of household spending a year. Drag to your gut guess for 100 lent to a man, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will compare the two numbers yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-M),guess:sim.p.guess,label:`+${sim.p.guess} taka`};},
  solve(sim){sim.p.guess=M;return {v:0,guess:M,label:'+11 taka (Pitt and Khandker, 1998)'};},
  calc:{unit:'times',d:1,tol:0.05,
   prompt:{bio:'Per 100 taka lent: <b>+18</b> taka of spending when lent to a woman, <b>+11</b> when lent to a man. How many times as much is the women’s number? Round to one decimal place.',ap:'Effects per 100 taka: women 18, men 11. Compute the ratio to one decimal place.'},
   answer:()=>+RATIO.toFixed(1),hint:'Divide: 18 ÷ 11.',
   steps:()=>['Ratio = women’s effect ÷ men’s effect.','18 ÷ 11 = 1.636…',`About <b>${f1(RATIO)} times</b> as much, according to this study.`]},
  formula:()=>`18 ÷ 11 = ${f1(RATIO)} times`+(atLeast('honors')?'<br>Strength of evidence: randomized trial &gt; natural experiment &gt; survey':''),
  how:{bio:'Compare two rates per 100 by dividing one by the other.',honors:'Ask how a number was found before you lean on it: who was compared with whom, and could something else explain the gap?'},
  compare(sim,g){const off=Math.abs(g.guess-M);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the ratio yourself.':'';
   return (off<=2?'Close: within 2 taka.':`You guessed +${g.guess}. The study found <b>+11</b>, so you were off by ${off}.`)+' This was one of the best-known numbers behind the claim. It was later disputed, so the walkthrough shows what stronger tests found.'+self;},
  again(sim){sim.p.guess=25;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'At the study’s rates, a microcredit program lends 5,000 taka to a woman. About how much does yearly household spending rise?',answer:900,tol:1,unit:'taka',d:0,hint:'18 per 100, so multiply 5,000 by 18 ÷ 100.',explain:'5,000 × 0.18 = 900 taka a year (if the study’s estimate is right).'},
  {lvl:'bio',instant:true,q:'A study compares families where mothers happen to have more income with families where fathers do. What could explain a difference besides who holds the money?',choices:['Nothing; it must be the money','The families may differ in other ways, like education or where they live','The money changes value'],correct:1,explain:'Without a lottery, other differences between families can explain part of the result.'},
  {lvl:'honors',instant:true,q:'Which design gives the strongest evidence that who receives the money matters?',choices:['A survey comparing families','Randomly choosing, by lottery, whether the wife or the husband receives it','Asking people what they would do'],correct:1,explain:'Randomizing makes the two groups alike in everything but the recipient.'},
  {lvl:'honors',instant:true,q:'Kenya’s randomized trial found no difference by recipient; Macedonia’s found mothers shifted spending toward food. What is the most honest summary?',choices:['Money to women always helps children more','Gender never matters','It can matter; it depends on the place and program, and the evidence is mixed'],correct:2,explain:'Reviews of the evidence (ODI, 2016; IPA, 2024) say the effect of recipient gender is inconclusive or depends on context.'},
  {lvl:'ap',kind:'num',q:'In Macedonia, suppose a family spends 4,000 a month and paying the mother raises the food share from 50% to 54.5%. How much more goes to food each month?',answer:180,tol:1,unit:'',d:0,hint:'4.5 percentage points of 4,000.',explain:'0.045 × 4,000 = 180 more a month on food, with total spending the same.'}
 ],
 tour:[
  {title:'100 taka, two hands',text:'In Bangladesh in 1991-92, Mark Pitt and Shahidur Khandker studied microcredit loans. They estimated that every 100 taka a woman borrowed raised her household’s yearly spending by 18 taka. For men: 11 taka.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Compare by dividing',text:'18 ÷ 11 ≈ 1.6. By this estimate, lending to a woman raised family spending about 1.6 times as much as lending to a man. <i>Half the Sky</i> and many aid programs leaned on findings like this.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Brazil: child survival',text:'Duncan Thomas (1990) studied Brazilian families. Income a mother received (not from her wages) had an effect on child survival almost 20 times bigger than the same income received by a father.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'South Africa: grandmothers',text:'When South Africa expanded its old-age pension, Esther Duflo (2003) found that a grandmother’s pension raised her granddaughters’ weight for height by 1.19 standard deviations. A grandfather’s pension showed no such effect.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'How good is the first number?',text:'David Roodman and Jonathan Morduch re-ran the Bangladesh analysis (2014) and found the evidence weak; their estimates even had the opposite signs. Pitt and Khandker defended their result. Always ask how a famous number was found.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'honors',title:'Two lotteries',text:'In Kenya (2016), a lottery decided whether the wife or the husband received a GiveDirectly cash transfer: households responded the same either way. In Macedonia (2020), a lottery paid mothers or fathers: paying mothers raised the food share of spending by 4 to 5 points.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Testing a model',text:'If a family pools its income, who receives a dollar should not matter. Brazil, South Africa and Macedonia reject pooling; Kenya does not. Reviews of the evidence call the effect of recipient gender inconclusive: it depends on the place and the program.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'A question to discuss',text:'The Catechism (2334) teaches that God gives man and woman an equal personal dignity. Many aid programs, including Mexico’s, pay mothers. Discuss: what would you want to know before deciding who in a family should receive aid?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> Does it matter who in a family receives money?</p><ol><li>Lock in your gut, then work out the ratio of the women’s effect to the men’s.</li><li>Read the Brazil and South Africa results.</li></ol><p>Write one sentence about what else could explain a difference between families.</p>',
  honors:'<p><b>Question:</b> How strong is the evidence?</p><ol><li>Sort the four studies by design: survey, natural experiment, randomized.</li><li>Say what each design can and cannot rule out.</li></ol>',
  ap:'<p><b>Question:</b> Do households pool their income?</p><ol><li>State the pooling model as a prediction you could test.</li><li>Which studies reject it, and which do not?</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Microcredit',d:'Small loans to people, often women, who cannot borrow from banks.'},
  {t:'Ratio',d:'One number divided by another: 18 ÷ 11 ≈ 1.6.'},
  {t:'Randomized trial',d:'A study that uses a lottery to decide who gets what, so the groups are alike in everything else.',lvl:'honors'},
  {t:'Natural experiment',d:'A real-world rule (like a pension that starts at 60) that sorts people almost as a lottery would.',lvl:'honors'},
  {t:'Income pooling',d:'The idea that a family adds up all its income before deciding how to spend it.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Mark Pitt and Shahidur Khandker, “The Impact of Group-Based Credit Programs on Poor Households in Bangladesh: Does the Gender of Participants Matter?” <i>Journal of Political Economy</i> 106 (1998): 18 taka per 100 borrowed by women, 11 for men. David Roodman and Jonathan Morduch, <i>Journal of Development Studies</i> 50 (2014), a replication that found the evidence weak; Pitt and Khandker’s reply, World Bank Policy Research Working Paper (2012). Duncan Thomas, “Intra-Household Resource Allocation,” <i>Journal of Human Resources</i> 25 (1990). Esther Duflo, “Grandmothers and Granddaughters,” <i>World Bank Economic Review</i> 17 (2003). Johannes Haushofer and Jeremy Shapiro, <i>Quarterly Journal of Economics</i> 131 (2016). Alex Armand, Orazio Attanasio, Pedro Carneiro and Valérie Lechene, <i>Economic Journal</i> 130 (2020). Francesca Bastagli and others, <i>Cash Transfers: What Does the Evidence Say?</i> (ODI, 2016). Nicholas Kristof and Sheryl WuDunn, <i>Half the Sky</i> (2009). <i>Catechism of the Catholic Church</i>, 2334.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>An average effect can hide very different families: some pool income, some do not.</li><li>Giving money to mothers can add to their workload; some researchers warn it can reinforce who does the caregiving.</li><li>Most of these studies come from one country and one program each; results may not carry over.</li></ul>'
};
BioLab.register(SIM);
})();
