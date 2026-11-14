(function(){
'use strict';
const {txt,PAL,FONT,atLeast}=BioLab.h;
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
/* Greenwood: built, burned, rebuilt (Jason, Nov 14: the role Black Americans have had in the economy, for good and for ill).
   NBER Digest (Sept 2021) on Albright, Cook, Feigenbaum, Kincaide, Long and Nunn, "After the Burning," NBER WP 28985: before the massacre
   Greenwood had 191 businesses, a library, two schools and a hospital; May 31–June 1, 1921: 35 square blocks destroyed, deaths estimated up
   to 300, residents taken to internment centers at gunpoint; 1920 Black Tulsan home ownership 30%; the massacre reduced home ownership among
   Black male household heads by 4.2 percentage points; effects persisted and grew to 1980–2000; spillovers through newspaper coverage, about
   75% of the direct effect in the most-exposed state. BlackPast: 1,256 homes burned; over 100 buildings rebuilt by summer 1922.
   PBS American Experience: by 1925 Greenwood stood again, rebuilt by its residents; the National Negro Business League met in Tulsa in 1925.
   Carlos Moreno (Smithsonian, Next City): 45 years of prosperity, then urban renewal and the Inner Dispersal Loop/I-244 (Federal-Aid
   Highway Acts 1965, 1968; completed 1971); Mabel Little lost home and business in 1921 and again around 1970. Marketplace (2025):
   Vernon AME rebuilt by its congregation. CCC 1935; USCCB Open Wide Our Hearts (2018). */
const OWN=30,DROP=4.2;
const f1=v=>(+v).toFixed(1);
const SIM={
 id:'greenwood',hash:'greenwood',apUnit:1,order:7,tab:'Greenwood',kind:'Learning tool',prereq:['inventors'],next:['redlining'],
 skills:{bio:'Percentage points and before-and-after comparisons · Algebra 1 (Unit 2), Black History (Unit 1: Jim Crow)',
  honors:'Comparison groups: how researchers separate one event’s effect from everything else · Statistics (Chapter 4), Sociology',
  ap:'Wealth, risk and spillovers: why one city’s loss changed decisions far away · AP Macroeconomics (Unit 2)'},
 card:'Guess how many Black families in Tulsa owned their homes in 1920, then follow Greenwood: built, burned in 1921, rebuilt, and cut by a highway.',
 title:'Greenwood: built, burned, rebuilt',
 lede:{bio:'Greenwood, in Tulsa, was a thriving Black business district called “Black Wall Street.” Follow what its people built, what was taken, and what they built again.',
  honors:'Economists used census records to measure what the 1921 massacre did to Black Tulsans’ homes and jobs, and to Black families in other cities.',
  ap:'A home is a family’s main store of wealth. What happens to everyone’s choices when that wealth can be burned in a day?'},
 scale:'Tulsa, Oklahoma, 1906 to today. NBER research, PBS and historians; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: % of Black Tulsans who owned their home, 1920',type:'range',min:0,max:100,step:1,def:10,unit:'%'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){return {};},step(){},
 metrics:[
  {id:'own',label:'Home ownership, Black Tulsans, 1920',unit:'%',d:0,min:0,max:100,get:s=>shown(s)?OWN:null},
  {id:'drop',label:'Drop caused by the massacre',unit:'pts',d:1,min:0,max:30,get:s=>shown(s)?DROP:null},
  {id:'biz',label:'Businesses in Greenwood before 1921',unit:'',d:0,min:0,max:300,get:s=>191}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  /* left: 35 blocks of Greenwood, colored by era */
  const era=s===2?'burned':(s===5?'rebuilt':(s===6?'highway':(s===99&&sh?'highway':'built')));
  const title={built:big?'Greenwood, 1921':'Greenwood: 35 blocks, before 1921',burned:big?'June 1, 1921':'May 31–June 1, 1921',rebuilt:big?'Rebuilt, 1925':'Rebuilt by 1925',highway:big?'1971: the highway':'1971: urban renewal and the highway'}[era];
  txt(ctx,title,20,18,{s:14*k,w:700,b:'middle'});
  const cols=5,rows=7,bw=44,bh=34,g=6,X0=24,Y0=40;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=X0+c*(bw+g),y=Y0+r*(bh+g),i=r*cols+c;let col='#d9a441';
   if(era==='burned')col=(i%5===2&&r%3===0)?'#6b6b6b':'#3a1c14';
   if(era==='rebuilt')col='#d9a441';
   if(era==='highway')col=(r===3)?'#7d7d7d':((i*7)%5<2?'#d9a441':PAL['cv-bg2']);
   ctx.fillStyle=col;rr(ctx,x,y,bw,bh,4);ctx.fill();
   if(era==='built'||era==='rebuilt'){ctx.fillStyle='rgba(255,255,255,.55)';for(let w=0;w<3;w++)ctx.fillRect(x+7+w*12,y+9,6,7);}
   if(era==='burned'){ctx.fillStyle='rgba(255,120,40,.55)';ctx.beginPath();ctx.moveTo(x+bw/2-7,y+bh-6);ctx.quadraticCurveTo(x+bw/2,y+4,x+bw/2+7,y+bh-6);ctx.fill();}}
  if(era==='highway'){ctx.fillStyle='#4a4a4a';const y=Y0+3*(bh+g)-4;ctx.fillRect(X0-8,y,cols*(bw+g)+6,bh+8);ctx.strokeStyle='#f2d24c';ctx.setLineDash([10,8]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X0-8,y+(bh+8)/2);ctx.lineTo(X0+cols*(bw+g)-2,y+(bh+8)/2);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'I-244',X0+cols*(bw+g)/2,y+(bh+8)/2-10,{s:11*k,w:700,a:'center',b:'middle',c:'#fff'});}
  let ly=Y0+rows*(bh+g)+12*k;
  const leg={built:big?'191 businesses':'191 businesses, a library, 2 schools, a hospital',burned:big?'1,256 homes burned':'1,256 homes and the business district burned',rebuilt:big?'Rebuilt by its residents':'Rebuilt by its residents, without insurance payouts',highway:big?'Cut in two':'Homes and businesses cleared; the district cut in two'}[era];
  ly+=wrap(ctx,leg,X0,ly,262,{s:12*k,w:700,b:'middle',c:era==='burned'?'#C11430':PAL['cv-ink']})-12*k;
  /* gut marker as a small bar under the map when not shown */
  if(gv!=null&&!sh&&s===99){ly+=22*k;txt(ctx,'Your gut: '+gv+'% owned their home',X0,ly,{s:12*k,w:700,b:'middle',c:PAL['s4']});}
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'Built: Black Wall Street');y=lines(ctx,k,RX+12,y,RW-24,big?['191 businesses before 1921.','A library, two schools, a hospital.','Money circulated in Greenwood.']:['Black families built Greenwood in north Tulsa beginning around 1906. Shut out of white businesses by segregation, they built their own: by 1921 it had 191 businesses, a library, two schools and a hospital.','Grocers, doctors, lawyers, hotels and theaters. People called it “Black Wall Street.”']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Burned: May 31–June 1, 1921');y=lines(ctx,k,RX+12,y,RW-24,big?['35 blocks burned in a day.','Deaths: estimates up to 300.','Survivors held at gunpoint.']:['A white mob looted and burned 35 square blocks, including about 1,256 homes. Estimates of the dead range up to 300.','Black residents were taken to internment centers at gunpoint. Insurance companies refused nearly all claims.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Homes: the main store of wealth');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?110:150),w=(RW-(big?160:200))*v/40;ctx.fillStyle=c;rr(ctx,x0,y-8,w,16,4);ctx.fill();txt(ctx,f1(v)+'%',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=26*k;};
   bar(big?'1920':'1920, before',OWN,'#d9a441');bar(big?'After':'After the massacre',OWN-DROP,'#C11430');
   lines(ctx,k,RX+12,y+6,RW-24,big?['−4.2 points, and it grew.','Lower job status and schooling too.']:['In 1920, 30% of Black Tulsan families owned their home. Economists comparing them with similar families elsewhere find the massacre cut that by 4.2 points.','Job status and children’s schooling fell too. By 1980–2000 the gap in home ownership was even larger.']);}
  else if(s===4&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'The warning spread');y=lines(ctx,k,RX+12,y,RW-24,big?['Black home ownership fell in other cities too.','Most where newspapers covered it.']:['Black home ownership fell in other cities too, most where newspapers covered the massacre heavily or where cities were segregated like Tulsa.','In the most-exposed state, the drop was about 75% as large as in Tulsa itself. The researchers call it a warning: a home could be destroyed in an instant.']);}
  else if(s===5){let y=panel(ctx,k,RX,PY,RW,PH,'Rebuilt');y=lines(ctx,k,RX+12,y,RW-24,big?['100+ buildings back by 1922.','By 1925, Greenwood stood again.','A second boom in the 1940s.']:['Residents began rebuilding at once, against new city rules meant to stop them. Over 100 buildings were back by summer 1922; by 1925 Greenwood stood again, and the National Negro Business League held its national meeting in Tulsa.','Vernon AME Church, burned in 1921, was rebuilt by its congregation. Greenwood boomed again in the 1940s.']);}
  else if(s===6){let y=panel(ctx,k,RX,PY,RW,PH,'The second destruction');y=lines(ctx,k,RX+12,y,RW-24,big?['1960s: urban renewal.','1971: a highway through it.','Mabel Little lost all twice.']:['In the 1960s, federally funded urban renewal and a new highway loop cleared much of Greenwood; Interstate 244 cut through it, finished in 1971.','Mabel Little, a beauty salon owner, lost her home and business in 1921, rebuilt, and lost them both again around 1970.']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'What the Church teaches');y=lines(ctx,k,RX+12,y,RW-24,big?['Every form of discrimination must be ended (CCC 1935).','Racism is a sin (USCCB, 2018).']:['The Catechism (1935) teaches that every form of discrimination in fundamental rights must be ended as incompatible with God’s design. The U.S. bishops call racism a sin.','Discuss: Greenwood was built twice by its own people. What would repair look like for the families who lost it twice?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,210,'Built, burned, rebuilt');lines(ctx,k,RX+12,y,RW-24,['1920: 30% of Black Tulsans owned their home. The massacre cut that by 4.2 points, and the gap widened for decades.','Greenwood was rebuilt by 1925, then cut by urban renewal and I-244 by 1971.']);}
 },
 narrate(sim){if(!shown(sim))return `Before the 1921 massacre, what share of Black families in Tulsa owned their home? Your gut: ${sim.p.guess}%.`;
  return `In 1920, <b>30%</b> of Black Tulsan families owned their home. The massacre cut that by <b>4.2 points</b>, to about <b>25.8%</b>, and the gap kept growing for decades.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Greenwood was called “Black Wall Street.” In 1920, what percent of Black families in Tulsa do you think owned their home? Drag to your gut, then lock it in.',honors:'1920, Tulsa: what percent of Black families owned their home? Drag to your gut, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out what the massacre took.'},
  lock(sim){return {v:Math.abs(sim.p.guess-OWN),guess:sim.p.guess,label:`${sim.p.guess}%`};},
  solve(sim){sim.p.guess=OWN;return {v:0,guess:OWN,label:'30%'};},
  calc:{unit:'%',d:1,tol:0.05,
   prompt:{bio:'In 1920, <b>30%</b> of Black Tulsan families owned their home. The massacre lowered that by <b>4.2 percentage points</b>. What was the new rate?',ap:'30% − 4.2 points = ?'},
   answer:()=>OWN-DROP,hint:'Subtract the points.',
   steps:()=>['30 − 4.2 = <b>25.8%</b>.','About 1 in 7 of the families who would have owned a home did not (4.2 ÷ 30 ≈ 14%).']},
  formula:()=>'30% − 4.2 points = 25.8%'+(atLeast('honors')?'<br>4.2 ÷ 30 ≈ 14% of would-be homeowners':''),
  how:{bio:'Percentage points: subtract the rates.',honors:'Compare with similar families elsewhere to isolate the massacre’s effect.'},
  compare(sim,g){const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the drop yourself.':'';
   return (Math.abs(g.guess-OWN)<=5?'Close.':`You guessed ${g.guess}%. It was <b>30%</b>.`)+' Many people guess low: Greenwood families had built real wealth before 1921.'+self;},
  again(sim){sim.p.guess=10;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Greenwood stood again by 1925, and the highway cut through it by 1971. How many years did the rebuilt Greenwood thrive?',answer:46,tol:0,unit:'years',d:0,hint:'1971 − 1925.',explain:'About 46 years: historians speak of 45 years of prosperity after the massacre.'},
  {lvl:'bio',instant:true,q:'What happened to Greenwood after 1921?',choices:['It was abandoned forever','Its residents rebuilt it by 1925, and it boomed again in the 1940s','The city rebuilt it for them'],correct:1,explain:'Residents rebuilt it themselves, against city rules meant to stop them.'},
  {lvl:'honors',kind:'num',q:'Home ownership fell 4.2 points from 30%. What percent of would-be homeowners is that? Round to the nearest whole percent.',answer:14,tol:0.5,unit:'%',d:0,hint:'4.2 ÷ 30 × 100.',explain:'About 14%: roughly 1 in 7.'},
  {lvl:'honors',instant:true,q:'Why compare Black Tulsans with similar families in other cities?',choices:['To separate the massacre’s effect from the Depression and other changes','Because Tulsa had no census','It makes the number bigger'],correct:0,explain:'A comparison group shows what would have happened without the event.'},
  {lvl:'ap',instant:true,q:'Black home ownership fell even in cities far from Tulsa that read about it. What does that show?',choices:['Nothing','Fear raises the risk of holding wealth in a home, changing choices far away','Newspapers caused the massacre'],correct:1,explain:'If your home can be destroyed without protection, owning one is riskier everywhere.'}
 ],
 tour:[
  {title:'Built: Black Wall Street',text:'Black families built Greenwood in north Tulsa beginning around 1906. By 1921 it had 191 businesses, a library, two schools and a hospital.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Burned: May 31–June 1, 1921',text:'A white mob looted and burned 35 square blocks, including about 1,256 homes. Estimates of the dead range up to 300. Residents were taken to internment centers at gunpoint.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Homes: the main store of wealth',text:'In 1920, 30% of Black Tulsan families owned their home. Economists find the massacre cut that by 4.2 points and lowered job status and schooling; by 1980–2000 the home ownership gap was even larger.',pause:true,setup:sim=>{sim.tst=3;}},
  {lvl:'honors',title:'The warning spread',text:'Black home ownership fell in other cities too, most where newspapers covered the massacre or cities were segregated like Tulsa. In the most-exposed state the drop was about 75% as large as Tulsa’s.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'Rebuilt',text:'Residents rebuilt at once, against new city rules meant to stop them. By 1925 Greenwood stood again and hosted the National Negro Business League. Vernon AME was rebuilt by its congregation. The 1940s brought a second boom.',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'The second destruction',text:'In the 1960s, federally funded urban renewal and a highway loop cleared much of Greenwood; Interstate 244 cut through it by 1971. Mabel Little lost her home and business in 1921, rebuilt, and lost them again around 1970.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'What the Church teaches',text:'The Catechism (1935) teaches that every form of discrimination in fundamental rights must be ended. The U.S. bishops call racism a sin (2018). Greenwood was built twice by its own people: what would repair look like?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> What did Greenwood build, and what did it lose?</p><ol><li>Lock in your gut, then work out the new home ownership rate.</li><li>List what was built, burned and rebuilt.</li></ol>',
  honors:'<p><b>Question:</b> How do we know the massacre caused the drop?</p><ol><li>Explain the comparison group.</li><li>Explain the spillover to other cities.</li></ol>',
  ap:'<p><b>Question:</b> How does insecurity about property change economic choices?</p><ol><li>Use the Tulsa and spillover findings.</li><li>Connect to the second destruction in the 1960s.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Percentage point',d:'The difference between two percents: 30% to 25.8% is a drop of 4.2 points.'},
  {t:'Black Wall Street',d:'The name given to Greenwood’s business district.'},
  {t:'Comparison group',d:'Similar people not affected by an event, used to show what would have happened anyway.',lvl:'honors'},
  {t:'Urban renewal',d:'Federal programs (1949–1974) that cleared neighborhoods for new projects; they often displaced Black communities.',lvl:'honors'}
 ],
 about:'<p><b>Sources.</b> Albright, Cook, Feigenbaum, Kincaide, Long and Nunn, “After the Burning: The Economic Effects of the 1921 Tulsa Race Massacre,” NBER Working Paper 28985 (2021), and the NBER Digest summary (September 2021). BlackPast on homes burned and rebuilding. PBS <i>American Experience</i> on Greenwood’s rebuilding and the 1925 National Negro Business League meeting. Oklahoma Commission to Study the Tulsa Race Riot of 1921 (2001) on insurance claims. Carlos Moreno (<i>Smithsonian</i>, Next City) on urban renewal, I-244 and Mabel Little. Marketplace (2025) on Vernon AME. <i>Catechism of the Catholic Church</i>, 1935; USCCB, <i>Open Wide Our Hearts</i> (2018).</p>'+
  '<p><b>What this number hides.</b></p><ul><li>The death toll is still uncertain; searches for graves continue.</li><li>Home ownership measures one kind of loss; businesses, savings and lives are harder to count.</li><li>Greenwood’s story is also one of people who rebuilt, twice.</li></ul>'
};
BioLab.register(SIM);
})();
