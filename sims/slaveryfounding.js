(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
function wrap(ctx,s,x,y,w,o){o=o||{};const sz=o.s||13;ctx.font=(o.w||400)+' '+sz+'px '+FONT;const words=String(s).split(' ');let line='';const lines=[];
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){lines.push(line);line=wd;}else line=t;});if(line)lines.push(line);
 const lh=o.lh||sz*1.28;lines.forEach((l,i)=>txt(ctx,l,x,y+i*lh,o));return lines.length*lh;}
function panel(ctx,k,x,y,w,h,title,tag,tagc){ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,y,w,h,10);ctx.fill();if(ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,10);ctx.stroke();}
 txt(ctx,title,x+12,y+18*k,{s:14*k,w:700,b:'middle'});
 if(tag){ctx.font='700 '+(11*k)+'px '+FONT;const tw=ctx.measureText(tag).width+11*k*1.1;pill(ctx,tag,x+w-10-tw/2,y+18*k,tagc,'#fff',11*k);}
 return y+38*k;}
function lines(ctx,k,x,y,w,arr){arr.forEach(l=>{y+=wrap(ctx,l,x,y,w,{s:12.5*k,b:'middle'})+5;});return y;}
function hbars(ctx,k,x,y,w,rows,max,col){const lab=w*0.42;rows.forEach((r,i)=>{const yy=y+i*22*k;txt(ctx,r[0],x,yy,{s:12*k,w:700,b:'middle'});const bw=(w-lab-46)*r[1]/max;
 ctx.fillStyle=r[2]||col;rr(ctx,x+lab,yy-6,bw,12,4);ctx.fill();txt(ctx,r[1]+'%',x+lab+bw+5,yy,{s:12*k,w:700,b:'middle'});});return y+rows.length*22*k;}
/* Slavery and the founding: the numbers (Jason, Nov 13: the economics of slavery and the founding, as in the NYT 1619 Project; checked with historians).
   Census (via University of Virginia Historical Census Browser): enslaved 697,681 of 3,929,214 (1790) ... 3,953,760 of 31,443,321 (1860).
   About 450,000 people were brought to what became the United States; import banned 1808 (CUNY American Social History Project).
   Three-fifths clause: in 1793 slave states held 47 of 105 House seats; 33 if seats followed free population (Leonard Richards).
   1860: enslaved people valued at about $3 billion, more than railroads and manufacturing combined ($2.2 billion; James Huston), about 19% of
   U.S. wealth; cotton above 57% of exports in 1860 (Cambridge History). Some economic historians put cotton nearer 5% of GDP (Magness, AIER).
   1619 Project (NYT Magazine, Aug 2019): five historians (Bynum, McPherson, Oakes, Wilentz, Wood) disputed its Revolution claim; the Times
   later changed the sentence to "some of" the colonists (March 2020). Olmstead and Rhode (2008) credit new cotton varieties for most of the
   rise in picking rates. Hornbeck and Logan: counting costs to the enslaved, emancipation produced large economic gains.
   1838: Maryland Jesuits sold 272 people for $115,000 (about $3.3 million today) to save Georgetown; 2021: Jesuits pledged $100 million to the
   Descendants Truth and Reconciliation Foundation. Catechism 2414. */
const CEN=[[1790,697681,3929214],[1800,893602,5308483],[1810,1191362,7239881],[1820,1538022,9638453],[1830,2009043,12860702],[1840,2487355,17063353],[1850,3204313,23191876],[1860,3953760,31443321]];
const E60=3953760,T60=31443321,SH60=100*E60/T60;
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(+v).toFixed(1);
const SIM={
 id:'slaveryfounding',hash:'slaveryfounding',apUnit:7,order:5,tab:'Slavery and the founding',kind:'Learning tool',prereq:['apportion'],next:['redlining'],
 skills:{bio:'Percent of a total and reading growth on a bar chart · Algebra 1 (Unit 2), US Government (Unit 1: Foundations), Black History (background before 1865)',
  honors:'Checking a big claim: separating the numbers from the argument built on them · Statistics (Chapter 4), AP US Government (Unit 1)',
  ap:'Whose costs count? How including the enslaved changes the economics of slavery · AP Macroeconomics (Unit 2), AP US Government (Unit 1)'},
 card:'Guess how many people were enslaved in 1860, then see how slavery shaped the House, the economy and even Georgetown, and how historians check the big claims.',
 title:'Slavery and the founding: the numbers',
 lede:{bio:'From 1619 to 1865, slavery shaped the country’s population, its Constitution and its economy. Work out the numbers from the census.',
  honors:'The 1619 Project (2019) put slavery at the center of the American story. Some of its numbers are solid; some of its claims historians disputed. Learn to tell them apart.',
  ap:'Was slavery an engine of the economy? It depends on whose gains and losses you count.'},
 scale:'United States, 1619 to 1865. U.S. census counts and economic historians; see About.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'Your guess',
 controls:[
  {id:'guess',label:'Your gut: millions of people enslaved in the U.S. in 1860',type:'range',min:0,max:8,step:0.1,def:1,unit:'M'},
  {id:'reveal',label:'Show the census now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'e60',label:'People enslaved, 1860 census',unit:'',d:0,min:0,max:8e6,get:s=>shown(s)?E60:null},
  {id:'sh',label:'Share of the U.S. population, 1860',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?SH60:null},
  {id:'e90',label:'People enslaved, 1790 census',unit:'',d:0,min:0,max:8e6,get:s=>697681}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const S0=sim.gutS,gv=ONT?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  txt(ctx,'Enslaved people (census)',20,18,{s:14*k,w:700,b:'middle'});
  const L=30,B=300,T=50,Wb=250,bw=Wb/8-6,Y=v=>B-(B-T)*v/4.4e6;
  CEN.forEach((c,i)=>{const x=L+i*(Wb/8),last=i===7,vis=s===1?i===0:(!last||sh);
   if(vis){ctx.fillStyle=last?'#c8102e':'#6b7c93';rr(ctx,x,Y(c[1]),bw,B-Y(c[1]),3);ctx.fill();}
   else{ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x,T,bw,B-T,3);ctx.fill();txt(ctx,'?',x+bw/2,(T+B)/2,{s:13*k,w:700,a:'center',b:'middle',c:PAL['cv-soft']});}
   txt(ctx,"'"+String(c[0]).slice(2),x+bw/2,B+12*k,{s:10.5*k,a:'center',b:'middle',c:PAL['cv-soft']});});
  if(gv!=null&&!sh){const y=Y(gv*1e6);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(L-4,y);ctx.lineTo(L+Wb,y);ctx.stroke();txt(ctx,'your gut: '+f1(gv)+'M',L,y-9,{s:11.5*k,w:700,c:PAL['s4'],b:'middle'});}
  let ly=B+32*k;
  if(s===1)txt(ctx,big?'1790: 0.70M of 3.93M':'1790: 697,681 of 3,929,214',L,ly,{s:12.5*k,w:700,b:'middle'});
  else if(sh){txt(ctx,big?'1860: 3.95M of 31.4M':'1860: 3,953,760 of 31,443,321',L,ly,{s:12.5*k,w:700,b:'middle'});ly+=20*k;txt(ctx,`= ${f1(SH60)}% of all people`,L,ly,{s:14*k,w:700,c:PAL['s1'],b:'middle'});}
  if(s===2&&ONT){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,L-8,T-8,Wb+10,B-T+70*k,7);ctx.stroke();}
  const RX=300,RW=W-RX-14,PY=14,PH=H-28;
  if(s===1){let y=panel(ctx,k,RX,PY,RW,PH,'1619 to 1790');y=lines(ctx,k,RX+12,y,RW-24,big?['1619: about 20 Africans sold at Point Comfort, Virginia.','1790: 697,681 enslaved, 17.8% of all people.']:['In 1619, a ship brought about 20 captive Africans to Point Comfort, Virginia, where they were sold: the usual starting date for slavery in British North America.','The first census, in 1790, counted 697,681 enslaved people out of 3,929,214: 17.8% of everyone in the new country.']);}
  else if(s===2){let y=panel(ctx,k,RX,PY,RW,PH,'Growth to 1860');y=lines(ctx,k,RX+12,y,RW-24,big?['1860: 3,953,760 enslaved.','About 450,000 were brought here; most growth was births.']:['By 1860 the census counted 3,953,760 enslaved people, more than five times the 1790 count.','About 450,000 people in all were brought to what became the U.S.; the import trade was banned in 1808. Most of the growth was children born into slavery.']);}
  else if(s===3){let y=panel(ctx,k,RX,PY,RW,PH,'Three-fifths in the House');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?110:150),w=(RW-(big?150:190))*v/105;ctx.fillStyle=c;rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,v+' of 105',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=24*k;};
   bar(big?'1793':'Actual, 1793',47,'#c8102e');bar(big?'Free only':'Free people only',33,'#6b7c93');
   lines(ctx,k,RX+12,y+6,RW-24,big?['47 − 33 = 14 extra seats.','Also extra electoral votes.']:['Counting three-fifths of enslaved people, who could not vote, gave slave states 47 − 33 = 14 extra House seats, and extra electoral votes.','The 14th Amendment (1868) ended the three-fifths count.']);}
  else if(s===4){let y=panel(ctx,k,RX,PY,RW,PH,'Worth more than the railroads');
   const bar=(lab,v,c)=>{txt(ctx,lab,RX+12,y,{s:12*k,w:700,b:'middle'});const x0=RX+(big?120:170),w=(RW-(big?170:220))*v/3.2;ctx.fillStyle=c;rr(ctx,x0,y-7,w,14,4);ctx.fill();txt(ctx,'$'+v+'B',x0+w+5,y,{s:12*k,w:700,b:'middle'});y+=24*k;};
   bar(big?'Enslaved':'Enslaved people',3.0,'#c8102e');bar(big?'Rail, factories':'Railroads and factories',2.2,'#6b7c93');
   lines(ctx,k,RX+12,y+6,RW-24,big?['About 19% of U.S. wealth in 1860.','Cotton: over 57% of exports.']:['In 1860, enslaved people were valued at about $3 billion: about 19% of all U.S. wealth.','Cotton, grown mostly by enslaved people, was over 57% of U.S. exports.']);}
  else if(s===5&&atLeast('honors')){let y=panel(ctx,k,RX,PY,RW,PH,'Checking the big claims');y=lines(ctx,k,RX+12,y,RW-24,big?['Historians disputed the 1619 Project’s Revolution claim.','The Times changed it to “some of” the colonists.','Cotton: about 5% of GDP, by some estimates.']:['Five leading historians wrote that the 1619 Project’s claim that protecting slavery was a primary reason for the Revolution was not true. The Times changed the sentence to say “some of” the colonists.','Cotton was most of exports but, some economic historians estimate, closer to 5% of the whole economy. A claim can rest on a true number and still overreach.']);}
  else if(s===6&&atLeast('ap')){let y=panel(ctx,k,RX,PY,RW,PH,'Whose costs count?');y=lines(ctx,k,RX+12,y,RW-24,big?['Count the costs to the enslaved, and slavery drags the economy.','Emancipation: one of the biggest gains in U.S. history.']:['Slavery made enslavers rich. But economists Richard Hornbeck and Trevon Logan count the costs to the enslaved too (lost freedom, lost lives). On that accounting, emancipation was one of the largest economic gains in U.S. history.','Whose gains and losses you count decides the answer.']);}
  else if(s===7){let y=panel(ctx,k,RX,PY,RW,PH,'Our own history');y=lines(ctx,k,RX+12,y,RW-24,big?['1838: Maryland Jesuits sold 272 people to save Georgetown.','2021: Jesuits pledged $100M to descendants.','CCC 2414: buying and selling people is a grave wrong.']:['In 1838, the Maryland Jesuits sold 272 enslaved men, women and children to Louisiana planters for $115,000 (about $3.3 million today) to save Georgetown College.','In 2021 the Jesuits pledged $100 million to a foundation with the descendants. The Catechism (2414) condemns buying and selling human beings. Discuss: what does repair look like?']);}
  else if(s===99&&sh){let y=panel(ctx,k,RX,PY,RW,180,'1790 → 1860');lines(ctx,k,RX+12,y,RW-24,['Enslaved: 697,681 → 3,953,760.','Share of all people: 17.8% → 12.6%. The number rose more than five times, even as the share fell.']);}
 },
 narrate(sim){if(!shown(sim))return `The 1790 census counted 697,681 enslaved people. How many do you think the 1860 census counted? Your gut: ${f1(sim.p.guess)} million.`;
  return `The 1860 census counted <b>3,953,760</b> enslaved people: <b>${f1(SH60)}%</b> of everyone in the country. Valued at about $3 billion, they were worth more than all U.S. railroads and factories combined.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The 1790 census counted 697,681 enslaved people. How many millions do you think the 1860 census counted? Drag to your gut guess, then lock it in.',honors:'1790: 697,681 enslaved. Drag to your gut guess for 1860 (in millions), then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the share yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-E60/1e6),guess:sim.p.guess,label:`${f1(sim.p.guess)} million`};},
  solve(sim){sim.p.guess=4;return {v:0,guess:E60/1e6,label:'3,953,760 (1860 census)'};},
  calc:{unit:'%',d:1,tol:0.1,
   prompt:{bio:'The 1860 census counted <b>3,953,760</b> enslaved people out of <b>31,443,321</b> people in all. What percent were enslaved? Round to one decimal place.',ap:'1860: 3,953,760 enslaved of 31,443,321. Compute the percent to one decimal place.'},
   answer:()=>+SH60.toFixed(1),hint:'Part ÷ whole × 100.',
   steps:()=>['3,953,760 ÷ 31,443,321 = 0.1257.',`× 100 = <b>${f1(SH60)}%</b>: about 1 in 8 people in the country.`]},
  formula:()=>`3,953,760 ÷ 31,443,321 × 100 = ${f1(SH60)}%`+(atLeast('honors')?'<br>1793 House: 47 seats with the three-fifths count, 33 without':''),
  how:{bio:'Part ÷ whole × 100.',honors:'Check the number and the claim built on it separately.'},
  compare(sim,g){const off=Math.abs(g.guess-E60/1e6);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the share yourself.':'';
   return (off<=0.4?'Close: about 4 million.':`You guessed ${f1(g.guess)} million. The 1860 census counted <b>3,953,760</b>.`)+' The number grew more than five times from 1790, mostly through children born into slavery.'+self;},
  again(sim){sim.p.guess=1;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In 1790, 697,681 of 3,929,214 people were enslaved. What percent is that? Round to one decimal place.',answer:100*697681/3929214,tol:0.1,unit:'%',d:1,hint:'Part ÷ whole × 100.',explain:'697,681 ÷ 3,929,214 × 100 ≈ 17.8%.'},
  {lvl:'bio',kind:'num',q:'In 1793, slave states had 47 of 105 House seats; counting only free people, they would have had 33. How many extra seats did the three-fifths clause give them?',answer:14,tol:0,unit:'seats',d:0,hint:'47 − 33.',explain:'14 extra seats, and 14 extra electoral votes.'},
  {lvl:'bio',instant:true,q:'The share of people who were enslaved fell from 17.8% (1790) to 12.6% (1860). Did the number of enslaved people fall too?',choices:['Yes','No: it rose more than five times, while the free population grew even faster'],correct:1,explain:'A share can fall while the count rises. Always check both.'},
  {lvl:'honors',kind:'num',q:'Enslaved people were valued at about $3.0 billion in 1860; railroads and factories at about $2.2 billion. How many times as much is that? Round to one decimal place.',answer:3/2.2,tol:0.05,unit:'times',d:1,hint:'3.0 ÷ 2.2.',explain:'About 1.4 times as much.'},
  {lvl:'honors',instant:true,q:'Historians agreed slavery was central to the early U.S. but disputed the claim that protecting it was a primary reason for the Revolution. What does that show?',choices:['A project is all right or all wrong','Check each claim on its own evidence: solid numbers can sit beside an overreaching claim','Historians never disagree'],correct:1,explain:'Separate the facts from the argument built on them.'},
  {lvl:'ap',kind:'num',q:'The Jesuits sold 272 people for $115,000 in 1838. About what was the average price per person? Round to the nearest dollar.',answer:115000/272,tol:1,unit:'$',d:0,hint:'115,000 ÷ 272.',explain:'About $423 a person, a number that shows how human beings were treated as property.'}
 ],
 tour:[
  {title:'1619 to 1790',text:'In 1619 about 20 captive Africans were sold at Point Comfort, Virginia. By the first census, in 1790, 697,681 people were enslaved: 17.8% of the 3,929,214 people counted.',pause:true,setup:sim=>{sim.tst=1;}},
  {title:'Growth to 1860',text:'By 1860 the census counted 3,953,760 enslaved people, more than five times as many. About 450,000 people in all were brought here; the import trade was banned in 1808, and most of the growth was children born into slavery.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Three-fifths in the House',text:'The Constitution counted three-fifths of enslaved people when dividing House seats, though they could not vote. In 1793 slave states held 47 of 105 seats; counting only free people, they would have had 33.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Worth more than the railroads',text:'By 1860 enslaved people were valued at about $3 billion, more than all U.S. railroads and factories combined (about $2.2 billion) and about 19% of the nation’s wealth. Cotton was over 57% of exports.',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Checking the big claims',text:'The New York Times’ 1619 Project (2019) brought these numbers to millions. Five leading historians disputed its claim that protecting slavery was a primary reason for the Revolution, and the Times changed the sentence to “some of” the colonists. Some economic historians also estimate cotton was closer to 5% of the whole economy. Check each claim on its own evidence.',pause:true,setup:sim=>{sim.tst=5;}},
  {lvl:'ap',title:'Whose costs count?',text:'Slavery enriched enslavers. Economists Richard Hornbeck and Trevon Logan add the costs to enslaved people themselves; on that accounting, emancipation was one of the largest economic gains in U.S. history.',pause:true,setup:sim=>{sim.tst=6;}},
  {title:'Our own history',text:'In 1838 the Maryland Jesuits sold 272 enslaved men, women and children to Louisiana planters for $115,000 to save Georgetown College. In 2021 the Jesuits pledged $100 million to a foundation built with the descendants. The Catechism (2414) condemns treating human beings as merchandise. Discuss: what does repair look like?',pause:true,setup:sim=>{sim.tst=7;}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How large was slavery in the early United States?</p><ol><li>Lock in your gut, then work out the 1860 share.</li><li>Work out the 1790 share and compare.</li></ol><p>Write one sentence on how a share can fall while a count rises.</p>',
  honors:'<p><b>Question:</b> Which claims hold up?</p><ol><li>List three numbers in this tool and their sources.</li><li>For one big claim, say what evidence supports it and what historians dispute.</li></ol>',
  ap:'<p><b>Question:</b> Was slavery an engine of the economy?</p><ol><li>Give the case using the 1860 values and exports.</li><li>Give the case that counting the enslaved changes the answer.</li></ol><p><b>CER:</b> Claim, evidence and reasoning.</p>'},
 terms:[
  {t:'Census',d:'The official count of the population every ten years since 1790.'},
  {t:'Three-fifths clause',d:'Article I, Section 2: three-fifths of enslaved people counted toward House seats and taxes; ended by the 14th Amendment (1868).'},
  {t:'Share vs. count',d:'A share is part ÷ whole; it can fall even while the count grows.',lvl:'honors'},
  {t:'Social cost',d:'All the gains and losses in an economy, including to the people with no say.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> U.S. census counts, 1790–1860 (University of Virginia Historical Census Browser, via NCpedia). CUNY American Social History Project on imports and the 1808 ban. Leonard Richards on House seats (47 vs. 33 in 1793). James Huston, <i>Calculating the Value of the Union</i>, on the $3 billion value vs. $2.2 billion in railroads and manufacturing; <i>Cambridge History</i> on cotton exports. The 1619 Project (<i>New York Times Magazine</i>, 2019); letter from Bynum, McPherson, Oakes, Wilentz and Wood (December 2019); the Times’ clarification (March 2020); Phillip Magness (AIER) on cotton’s share of GDP; Olmstead and Rhode, <i>Creating Abundance</i> (2008). Hornbeck and Logan on the gains from emancipation (Chicago Booth Review). Georgetown and the 1838 sale: <i>America</i> magazine; the Descendants Truth and Reconciliation Foundation. <i>Catechism of the Catholic Church</i>, 2414.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Census counts were taken by enslavers and marshals; they recorded people as property, often without names.</li><li>Dollar values are what enslavers paid, not the worth of a person.</li><li>Each of the 3,953,760 was a person with a family, a name and a story.</li></ul>'
};
BioLab.register(SIM);
})();
