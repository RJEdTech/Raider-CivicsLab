(function(){
'use strict';
const {txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const out=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);
 const lh=o.lh||sz*1.28;out.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return out.length*lh;}
function panel(ctx,k,x,y,w,h,title){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
/* Built and blocked: Black inventors (Jason, Nov 14: "the outsized role black people have had on the economy, for good and for ill").
   Lisa D. Cook, "Violence and economic activity: evidence from African American patents, 1870–1940," Journal of Economic Growth 19 (2014):
   violence, riots and segregation laws account for more than 1,100 missing patents, compared with 726 actual patents by African American
   inventors; patenting rose again when violence declined; major riots peaked 1919 and 1921, lynchings 1892–93. IMF F&D profile (Dec 2020):
   until 1900 Black and white patenting moved together; the pace of Black patenting topped out in 1899 and did not exceed it until 2010;
   1,100 ≈ a medium-sized European country's patents. NPR Planet Money (2019).
   Opportunity Insights, "Lost Einsteins" (Bell, Chetty, Jaravel, Petkova, Van Reenen): white children 3× as likely as Black children to
   become inventors; if women, minorities and low-income children invented at the rate of high-income white men, innovation would quadruple.
   Inventors: Latimer (carbon filament process, 1882), Morgan (safety hood 1914; three-position traffic signal 1923), F. M. Jones (truck
   refrigeration; Thermo King), Bath (Laserphaco cataract probe, 1988), West (math models of Earth's shape used by GPS), Dean (IBM PC; three
   of nine original PC patents), Croak (voice over internet; 200+ patents), Johnson (Super Soaker; NASA engineer). CCC 1935; USCCB 2018. */
const INV=[['Lewis Latimer','1882','Longer-lasting light bulb filaments'],['Garrett Morgan','1923','Three-light traffic signal'],['Frederick M. Jones','1940s','Refrigerated trucks'],
 ['Patricia Bath','1988','Laser cataract surgery tool'],['Gladys West','1970s–80s','Math of Earth’s shape behind GPS'],['Mark Dean','1981','IBM personal computer'],
 ['Marian Croak','2000s','Calls over the internet'],['Lonnie Johnson','1990','Super Soaker']];
const PEAK=1899,PASS=2010,ACT=726,MISS=1100;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
const SIM={
 id:'inventors',hash:'inventors',apUnit:1,order:6,tab:'Inventors',kind:'Learning tool',prereq:[],next:['greenwood'],
 skills:{bio:'Reading a timeline and comparing two counts · Algebra 1 (Unit 2), Black History (Unit 1: Jim Crow)',
  honors:'Evidence for cause: does the effect reverse when the cause goes away? · Statistics (Chapter 4), Sociology',
  ap:'Innovation and long-run growth: what lost talent costs everyone · AP Macroeconomics (Unit 5)'},
 card:'Meet Black inventors whose work you use every day, then see how violence and segregation laws cost the whole country inventions, and for how long.',
 title:'Built and blocked: Black inventors',
 lede:{bio:'Traffic lights, GPS, the personal computer: Black inventors helped build things you use every day. Then see what violence took away from everyone.',
  honors:'Economist Lisa Cook counted patents by Black inventors from 1870 to 1940. Where violence rose, invention fell, and it came back when violence eased.',
  ap:'Innovation drives long-run growth. What happens to growth when a country blocks some of its inventors?'},
 scale:'United States, 1870 to today. Lisa Cook (2014), Opportunity Insights; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: the year Black inventors passed their 1899 peak again',type:'range',min:1900,max:2025,step:1,def:1930,unit:''},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){return {};},step(){},
 metrics:[
  {id:'pass',label:'Year the 1899 peak was passed',unit:'',d:0,min:1899,max:2025,get:s=>shown(s)?PASS:null},
  {id:'gap',label:'Years it took',unit:'years',d:0,min:0,max:130,get:s=>shown(s)?PASS-PEAK:null},
  {id:'miss',label:'Patents lost to violence, 1870–1940 (Cook)',unit:'',d:0,min:0,max:2000,get:s=>shown(s)?MISS:null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const LW=270,RX=300,RW=W-RX-14,PY=14,PH=H-28;
  /* left: invention wall on step 1 and at rest before reveal; timeline otherwise */
  if(s===1||(s===99&&!sh)){txt(ctx,big?'Things you use':'Things you use every day',20,18,{s:14*k,w:700,b:'middle'});
   const cw=(LW-10)/2,ch=big?88:84;INV.forEach((v,i)=>{const nm=big?v[0].replace('Frederick M.','F. M.').replace('Lonnie ','L. ').replace('Patricia ','P. '):v[0];const x=16+(i%2)*(cw+6),y=36+Math.floor(i/2)*(ch+6);ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,cw,ch,8);ctx.fill();
    ctx.fillStyle='#C11430';rr(ctx,x,y,5,ch,3);ctx.fill();
    txt(ctx,nm,x+12,y+16*k*0.9,{s:12*k,w:700,b:'middle'});txt(ctx,v[1],x+12,y+33*k*0.9,{s:11*k,b:'middle',c:PAL['cv-soft']});wrap(ctx,v[2],x+12,y+50*k*0.9,cw-18,{s:11*k,b:'middle'});});}
  else{txt(ctx,big?'Black inventors, 1870 →':'Black inventors, 1870 → today',20,18,{s:14*k,w:700,b:'middle'});
   const X0=60,Y0=48,Y1=400,Y=yr=>Y0+(Y1-Y0)*(yr-1870)/(2025-1870);
   ctx.strokeStyle=PAL['g-axis'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0,Y0);ctx.lineTo(X0,Y1);ctx.stroke();
   /* violence band */
   ctx.fillStyle='rgba(193,20,48,.13)';rr(ctx,X0-8,Y(1890),16,Y(1925)-Y(1890),4);ctx.fill();
   const mk=(yr,lab,c,bold,dy)=>{const y=Y(yr)+(dy||0)*k;ctx.fillStyle=c;ctx.beginPath();ctx.arc(X0,y,bold?7:5,0,7);ctx.fill();txt(ctx,String(yr),X0-12,y,{s:11*k,w:700,a:'right',b:'middle',c});wrap(ctx,lab,X0+14,y,LW-X0-6,{s:11.5*k,w:bold?700:400,b:'middle',c:bold?c:PAL['cv-ink']});};
   mk(1870,big?'Patents rise':'Patents rise with white inventors’',PAL['cv-soft']);
   mk(PEAK,big?'Peak rate':'Peak rate of Black patenting','#1b7339',true,7);
   if(s>=3||s===99){mk(1893,big?'Lynchings peak':'Lynchings peak (1892–93)','#C11430',false,-8);mk(1921,big?'Riots peak':'Major riots peak (1919, 1921)','#C11430');}
   if(sh)mk(PASS,big?'Peak finally passed':'The 1899 rate is finally passed','#1b7339',true);
   else txt(ctx,'?',X0+14,Y(2010),{s:16*k,w:700,b:'middle',c:PAL['cv-soft']});
   if(gv!=null&&!sh){const y=Y(gv);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0-16,y);ctx.lineTo(LW,y);ctx.stroke();txt(ctx,'your gut: '+gv,X0+14,y-10,{s:11.5*k,w:700,c:PAL['s4'],b:'middle'});}
   if(sh&&s!==2){ctx.strokeStyle='#1b7339';ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(X0+4,Y(PEAK));ctx.lineTo(X0+4,Y(PASS));ctx.stroke();ctx.setLineDash([]);}}
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'Built: inventions you use');y=lines(ctx,k,RX+12,y,RW-24,big?['Traffic lights, GPS, the PC.','Refrigerated trucks feed cities.','Black inventors built them.']:['Garrett Morgan patented a three-light traffic signal in 1923. Gladys West’s math models of the Earth’s shape are part of how GPS works. Mark Dean helped build the first IBM personal computer.','Frederick McKinley Jones’s refrigerated trucks made it possible to ship fresh food across the country. Every one of these made the whole economy richer.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Rising with everyone');y=lines(ctx,k,RX+12,y,RW-24,big?['After 1870, Black patents rose.','Same pace as white inventors.','Then 1899: the peak.']:['After emancipation, Black inventors began patenting. Until about 1900, their patenting rose at the same pace as white inventors’.','In 1899 the rate of patenting by Black inventors reached a peak. Lock in your gut: when was that rate passed again?']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Then the violence');y=lines(ctx,k,RX+12,y,RW-24,big?['Lynchings peaked in 1892–93.','Major riots: 1919 and 1921.','New segregation laws spread.']:['Lynchings peaked in 1892 and 1893. Major race riots peaked in 1919 and 1921, including Tulsa. States passed new segregation laws.','A patent protects your idea only if the law protects you. Where the law didn’t protect Black citizens, inventing was a risk.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'Blocked: the missing patents');
   const dot=(x,y,fill)=>{ctx.beginPath();ctx.arc(x,y,3.4,0,7);if(fill){ctx.fillStyle=fill;ctx.fill();}else{ctx.strokeStyle='#C11430';ctx.lineWidth=1.2;ctx.stroke();}};
   const per=big?14:22,gap=big?10:9.4;let n=0;for(let i=0;i<ACT/10;i++,n++)dot(RX+18+(n%per)*gap,y+Math.floor(n/per)*gap,'#1b7339');for(let i=0;i<MISS/10;i++,n++)dot(RX+18+(n%per)*gap,y+Math.floor(n/per)*gap,null);
   y+=Math.ceil(n/per)*gap+8;
   lines(ctx,k,RX+12,y,RW-24,big?['● 726 patents granted','○ 1,100+ lost to violence','(each dot = 10)']:['Each dot is 10 patents. Green: the 726 patents Black inventors received, 1870–1940. Open red: the more than 1,100 that economist Lisa Cook estimates violence and segregation cost.','That’s about as many patents as a medium-sized European country produced in those years.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'How do we know it was the violence?');y=lines(ctx,k,RX+12,y,RW-24,big?['Invention fell after violence.','It rose when violence eased.','States with more riots: fewer patents.']:['Cook checked both directions: Black patenting fell after waves of violence, and it rose again when violence eased.','States with more riots and segregation laws had lower patenting. An effect that reverses when the cause goes away is strong evidence.']);}
  else if(s===6){let y=panel(ctx,k,RX,PY,RW,PH,'111 years');y=lines(ctx,k,RX+12,y,RW-24,big?['1899 peak rate.','Passed again: 2010.','2010 − 1899 = 111 years.']:['The rate of patenting by Black inventors didn’t pass its 1899 peak until 2010.','2010 − 1899 = 111 years. A few decades of violence cast a shadow more than a century long.']);}
  else if(s===7&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'Lost Einsteins today');y=lines(ctx,k,RX+12,y,RW-24,big?['White children: 3× as likely to invent.','Not ability: exposure.','Equal rates → 4× the inventing.']:['Today white children are three times as likely as Black children to become inventors. The gap comes from exposure to inventors and opportunity, not from ability.','Researchers at Opportunity Insights estimate that if women, minorities and low-income children invented at the rate of high-income white men, America’s rate of innovation would quadruple.']);}
  else if(s===8){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church teaches');y=lines(ctx,k,RX+12,y,RW-24,big?['Every form of discrimination must be ended (CCC 1935).','Racism is a sin (USCCB, 2018).']:['The Catechism (1935) teaches that every form of discrimination in fundamental rights is incompatible with God’s design and must be ended.','The U.S. bishops (Open Wide Our Hearts, 2018) call racism a sin. Discuss: who else lost when these inventors were blocked?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,190,'Built and blocked');lines(ctx,k,RX+12,y,RW-24,['1899: peak rate of Black patenting. Passed again: 2010, 111 years later.','1870–1940: 726 patents granted; 1,100+ lost to violence (Cook).']);}
 },
 narrate(sim){if(!shown(sim))return `Black inventors’ rate of patenting peaked in 1899. Your gut for the year it was passed again: ${sim.p.guess}.`;
  return `The 1899 peak wasn’t passed until <b>2010</b>: <b>111 years</b> later. Lisa Cook estimates violence and segregation cost more than <b>1,100</b> patents between 1870 and 1940, beside the <b>726</b> Black inventors received.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The rate of patenting by Black inventors peaked in 1899. In what year do you think that rate was passed again? Drag to your gut, then lock it in.',honors:'Black patenting peaked in 1899. Drag to your gut for the year it was passed again, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out how long it took.'},
  lock(sim){return {v:Math.abs(sim.p.guess-PASS),guess:sim.p.guess,label:String(sim.p.guess)};},
  solve(sim){sim.p.guess=PASS;return {v:0,guess:PASS,label:'2010'};},
  calc:{unit:'years',d:0,tol:0,
   prompt:{bio:'The rate peaked in <b>1899</b> and was passed again in <b>2010</b>. How many years is that?',ap:'Peak 1899, passed 2010. Years between?'},
   answer:()=>PASS-PEAK,hint:'Later year − earlier year.',
   steps:()=>['2010 − 1899 = <b>111 years</b>.','More than a century to recover a rate first reached in 1899.']},
  formula:()=>'2010 − 1899 = 111 years'+(atLeast('honors')?'<br>1870–1940: 726 granted · 1,100+ missing (Cook)':''),
  how:{bio:'Count the years between two dates.',honors:'Check whether the effect reverses when the cause eases.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked it out yourself.':'';
   return (Math.abs(g.guess-PASS)<=10?'Close.':`You guessed ${g.guess}. The answer is <b>2010</b>.`)+' The rate stalled for 111 years after violence and segregation laws spread.'+self;},
  again(sim){sim.p.guess=1930;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Black inventors received 726 patents from 1870 to 1940; Cook estimates 1,100 more were lost. How many could there have been in all?',answer:1826,tol:0,unit:'patents',d:0,hint:'726 + 1,100.',explain:'About 1,826 patents: more than twice as many as were granted.'},
  {lvl:'bio',instant:true,q:'Which of these came from a Black inventor?',choices:['The three-light traffic signal','Math behind GPS','A key part of the first IBM PC','All three'],correct:3,explain:'Garrett Morgan, Gladys West and Mark Dean.'},
  {lvl:'honors',kind:'num',q:'726 granted out of a possible 1,826. What percent of the possible patents were granted? One decimal place.',answer:100*726/1826,tol:0.1,unit:'%',d:1,hint:'726 ÷ 1,826 × 100.',explain:'About 39.8%: fewer than 4 in 10 of the inventions that could have been patented.'},
  {lvl:'honors',instant:true,q:'Black patenting fell after violence and rose when violence eased. Why does the second half matter?',choices:['It doesn’t','An effect that reverses when the cause goes away is stronger evidence of cause','It proves patents cause violence'],correct:1,explain:'Seeing both directions rules out many other explanations.'},
  {lvl:'ap',instant:true,q:'If blocked groups invented at the rate of high-income white men, innovation would about quadruple (Opportunity Insights). Who gains?',choices:['Only the new inventors','Everyone: new products, jobs and growth','No one'],correct:1,explain:'Ideas spread. Lost inventors are lost growth for the whole country.'}
 ],
 tour:[
  {title:'Built: inventions you use',text:'Garrett Morgan’s three-light traffic signal (1923). Gladys West’s math behind GPS. Mark Dean’s work on the first IBM personal computer. Frederick McKinley Jones’s refrigerated trucks. Black inventors built things the whole economy runs on.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Rising with everyone',text:'After emancipation, patenting by Black inventors rose at the same pace as white inventors’, until about 1900. The rate peaked in 1899.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Then the violence',text:'Lynchings peaked in 1892–93; major race riots in 1919 and 1921; states passed new segregation laws. A patent protects your idea only if the law protects you.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Blocked: the missing patents',text:'Economist Lisa Cook found that violence and segregation account for more than 1,100 missing patents, beside the 726 Black inventors actually received from 1870 to 1940: about what a medium-sized European country produced.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'How do we know it was the violence?',text:'Black patenting fell after waves of violence and rose again when violence eased, and it was lower in states with more riots and segregation laws. An effect that reverses when the cause eases is strong evidence.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'111 years',text:'The 1899 peak rate wasn’t passed until 2010: 111 years later.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Lost Einsteins today',text:'White children are three times as likely as Black children to become inventors, a gap of exposure and opportunity, not ability. If every group invented at the rate of high-income white men, innovation would about quadruple.',pause:true,setup:sim=>{sim.tst=7;}},
  {title:'What the Church teaches',text:'The Catechism (1935) teaches that every form of discrimination in fundamental rights must be ended as incompatible with God’s design. The U.S. bishops call racism a sin (2018). Who else lost when these inventors were blocked?',pause:true,setup:sim=>{sim.tst=8;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What did Black inventors build, and what did violence cost?</p><ol><li>Pick one inventor and explain how their invention touches your day.</li><li>Lock in your gut, then work out the years.</li></ol>',
  honors:'<p><b>Question:</b> How do we know violence caused the drop?</p><ol><li>Name two kinds of evidence Cook used.</li><li>Explain why the rebound matters.</li></ol>',
  ap:'<p><b>Question:</b> What does blocked talent cost growth?</p><ol><li>Use Cook’s missing patents and the “Lost Einsteins” finding.</li><li>Propose one policy that would raise exposure to invention.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Patent',d:'A government grant that protects an inventor’s right to their invention for a period of years.'},
  {t:'Rule of law',d:'Laws that protect everyone equally, including their property and ideas.'},
  {t:'Reversal test',d:'Checking whether an effect goes away when its cause does.',lvl:'honors'},
  {t:'Innovation and growth',d:'New ideas raise output per person for everyone over the long run.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> Lisa D. Cook, “Violence and economic activity: evidence from African American patents, 1870–1940,” <i>Journal of Economic Growth</i> 19 (2014); NPR Planet Money, <i>The Indicator</i> (2019); IMF <i>Finance &amp; Development</i> profile of Lisa Cook (December 2020). Opportunity Insights, “Lost Einsteins” (Bell, Chetty, Jaravel, Petkova and Van Reenen). Inventor histories: the National Inventors Hall of Fame and the U.S. Patent and Trademark Office. <i>Catechism of the Catholic Church</i>, 1935; USCCB, <i>Open Wide Our Hearts</i> (2018).</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Patents count only inventions someone could afford and dared to file.</li><li>Many Black inventors filed through white partners or not at all, so 726 is a floor.</li><li>“Missing patents” is an estimate from a model; the people behind them were real.</li></ul>'
};
BioLab.register(SIM);
})();
