(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast}=BioLab.h;
const rr=(ctx,x,y,w,h,r)=>BioLab.h.rr(ctx,x,y,Math.max(2,w),Math.max(2,h),Math.min(r,Math.max(1,w)/2,Math.max(1,h)/2));
/* Votes into seats: the same votes under three electoral systems.
   UK general election, July 4, 2024 (House of Commons Library results): 650 seats. Vote shares and seats:
   largest party 33.7% / 411, second 23.7% / 121, third by seats 12.2% / 72, third by votes 14.3% / 5, 6.7% / 4,
   a regional party 2.5% / 9, all others 6.9% / 28. Parties are shown by letter so the math is the focus.
   Proportional representation here is one national list with the D'Hondt method and no threshold (an illustration).
   Mixed: half the seats from the districts (the real results, halved) and half by D'Hondt, the parallel design Russia uses. */
const P=[
 {id:'A',v:33.7,s:411,c:'#c8102e',l:'Party A (largest)'},
 {id:'B',v:23.7,s:121,c:'#2b5fb3',l:'Party B'},
 {id:'C',v:12.2,s:72,c:'#e0a10b',l:'Party C'},
 {id:'D',v:14.3,s:5,c:'#14a3b8',l:'Party D'},
 {id:'E',v:6.7,s:4,c:'#2f9e44',l:'Party E'},
 {id:'F',v:2.5,s:9,c:'#8a6fd1',l:'Party F (regional)'},
 {id:'O',v:6.9,s:28,c:'#8c8c8c',l:'All others'}];
const SEATS=650;
function dhondt(n){const seats=P.map(()=>0);for(let i=0;i<n;i++){let b=0,bv=-1;P.forEach((p,j)=>{const q=p.v/(seats[j]+1);if(q>bv){bv=q;b=j;}});seats[b]++;}return seats;}
const PR=dhondt(SEATS),HALF=dhondt(SEATS/2);
function seatsFor(sys){if(sys==='pr')return PR.slice();if(sys==='mixed'){const fp=P.map(p=>Math.floor(p.s/2));let left=SEATS/2-fp.reduce((a,b)=>a+b,0);const rem=P.map((p,j)=>[p.s/2-fp[j],j]).sort((a,b)=>b[0]-a[0]);for(let i=0;i<left;i++)fp[rem[i][1]]++;return fp.map((x,j)=>x+HALF[j]);}return P.map(p=>p.s);}
const gallagher=sys=>{const s=seatsFor(sys);return Math.sqrt(0.5*P.reduce((a,p,j)=>a+Math.pow(p.v-100*s[j]/SEATS,2),0));};
const ASH=100*411/SEATS;
let REF=null,ONT=false;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const stg=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
function shown(sim){if(sim.tour&&sim.tour.on)return true;if(sim.p.reveal)return true;const S=sim.gutS;return !!(S&&S.g&&!pend(sim));}
const f1=v=>(+v).toFixed(1);
function ring(ctx,x,y,w,h){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,x,y,w,h,7);ctx.stroke();}
/* hemicycle seat positions, sorted left to right by angle */
const HEMI=(()=>{const rows=13,r0=0.42,r1=1,pts=[];const rad=[];for(let i=0;i<rows;i++)rad.push(r0+(r1-r0)*i/(rows-1));const tot=rad.reduce((a,b)=>a+b,0);
 let cnt=rad.map(r=>Math.floor(SEATS*r/tot));let d=SEATS-cnt.reduce((a,b)=>a+b,0);for(let i=rows-1;d>0;i--,d--)cnt[i]++;
 rad.forEach((r,i)=>{for(let j=0;j<cnt[i];j++){const a=Math.PI*(1-j/(cnt[i]-1));pts.push({a,r});}});return pts.sort((p,q)=>q.a-p.a||p.r-q.r);})();

const SIM={
 id:'seatsvotes',hash:'seatsvotes',apUnit:7,order:4,tab:'Votes into seats',kind:'Learning tool',prereq:['districts'],next:['electoral'],
 skills:{bio:'Percent of a whole: seats ÷ 650 vs. votes ÷ all votes · Algebra 1 (Unit 2), AP Comparative Government (Unit 2: the United Kingdom)',
  honors:'Divisor methods (D’Hondt) and comparing two shares · Algebra 1 (Unit 2), AP Comparative Government (Units 1 to 3: electoral systems)',
  ap:'A disproportionality index: √(½ Σ(vote % − seat %)²) · Statistics (Chapter 1), AP Comparative Government (quantitative FRQs)'},
 card:'One party won about a third of the votes. Guess its share of the seats, work it out, then rerun the same votes under proportional and mixed systems.',
 title:'Votes into seats',
 lede:{bio:'The UK elects 650 members of Parliament, one per district, and the top vote-getter in each district wins. Compare each party’s share of the votes with its share of the seats.',
  honors:'Same votes, different rules. Single-member districts reward a party whose votes are spread efficiently; proportional representation hands out seats by vote share; mixed systems do some of each.',
  ap:'Measure how far seat shares stray from vote shares with the Gallagher index, and compare the UK’s single-member districts with proportional and mixed designs used in your case-study countries.'},
 scale:'UK general election, July 4, 2024: 650 seats. Parties are shown by letter.',
 aspect:16/9,timeless:true,trials:false,graph:false,
 controlsTitle:'The rules',
 controls:[
  {id:'guess',label:'Your gut: Party A’s share of the 650 seats',type:'range',min:0,max:100,step:1,def:34,unit:'%'},
  {id:'sys',label:'Electoral system',type:'seg',def:'fptp',noGut:true,options:[{v:'fptp',l:'Single-member districts (real)'},{v:'pr',l:'Proportional',lvl:'honors'},{v:'mixed',l:'Mixed, half and half',lvl:'honors'}]},
  {id:'reveal',label:'Show the seats now',type:'toggle',def:false,noGut:true}
 ],
 init(sim){REF=sim;return {};},step(){},
 metrics:[
  {id:'aseat',label:'Party A’s share of seats',unit:'%',d:1,min:0,max:100,get:s=>shown(s)?100*seatsFor(s.p.sys)[0]/SEATS:null},
  {id:'avote',label:'Party A’s share of votes',unit:'%',d:1,min:0,max:100,get:s=>33.7},
  {id:'dseat',label:'Party D’s seats (14.3% of votes)',unit:'seats',d:0,lvl:'honors',min:0,max:650,get:s=>shown(s)?seatsFor(s.p.sys)[3]:null},
  {id:'gall',label:'Gallagher index (0 = seats match votes)',unit:'',d:1,lvl:'ap',min:0,max:40,get:s=>shown(s)?gallagher(s.p.sys):null}
 ],
 draw(sim,ctx,vdt,k){ONT=!!(sim.tour&&sim.tour.on);k=Math.min(k,1.45);const W=800,H=450,s=stg(sim),sh=shown(sim),big=k>1.3,sys=sim.p.sys,se=seatsFor(sys);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const name={fptp:'Single-member districts: the real 2024 result',pr:'Proportional representation (one national list, D’Hondt)',mixed:'Mixed: half districts, half proportional'}[sys];
  txt(ctx,name,20,18,{s:14*k,w:700,b:'middle'});
  /* hemicycle */
  const cx=210,cy=270,R=180;let idx=0;const cols=[];se.forEach((n,j)=>{for(let i=0;i<n;i++)cols.push(P[j].c);});
  HEMI.forEach((p,i)=>{const x=cx+Math.cos(p.a)*R*p.r,y=cy-Math.sin(p.a)*R*p.r;ctx.fillStyle=sh&&s>=2?cols[i]:PAL['line'];ctx.beginPath();ctx.arc(x,y,4.1,0,7);ctx.fill();});
  if(sh&&s>=2){txt(ctx,`${se[0]} of 650 seats`,cx,cy+20*k,{s:15*k,w:700,a:'center',c:P[0].c});txt(ctx,'326 needed for a majority',cx,cy+40*k,{s:12*k,a:'center',c:PAL['cv-soft']});
   if(s===2)ring(ctx,cx-R-12,cy-R-12,2*R+24,R+66*k);}
  else txt(ctx,'650 seats',cx,cy+20*k,{s:15*k,w:700,a:'center',c:PAL['cv-soft']});
  /* right: votes vs seats bars */
  const RX=430,RW=W-RX-20;let y=44;
  txt(ctx,big?'Votes (light) vs. seats (dark)':'Share of votes (light) vs. share of seats (dark)',RX,y,{s:12*k,w:700,c:PAL['cv-soft'],b:'middle'});y+=16*k;
  const sc=RW/70,S0=sim.gutS,gv=(sim.tour&&sim.tour.on)?null:(S0&&S0.g?S0.g.guess:sim.p.guess);
  P.forEach((p,j)=>{if(s===1&&j>0&&!(sim.tour&&sim.tour.on))return;const showS=sh&&s>=2;
   txt(ctx,big?p.id:p.l,RX,y,{s:12*k,w:700,b:'middle'});const lw=big?16:118,bw=v=>Math.max(2,Math.min(RW-lw,v*sc));
   const lab=(v,yy,w,c,bold)=>{const x=RX+lw+bw(v);if(bw(v)>RW-lw-46)txt(ctx,f1(v)+'%',x-4,yy,{s:11*k,w:700,a:'right',b:'middle',c:'#fff'});else txt(ctx,f1(v)+'%',x+4,yy,{s:11*k,w:bold?700:400,b:'middle',c:c});};
   ctx.globalAlpha=.4;ctx.fillStyle=p.c;rr(ctx,RX+lw,y-12,bw(p.v),9,3);ctx.fill();ctx.globalAlpha=1;lab(p.v,y-7.5,0,PAL['cv-soft'],false);
   if(showS){const sp=100*se[j]/SEATS;ctx.fillStyle=p.c;rr(ctx,RX+lw,y+2,bw(sp),9,3);ctx.fill();lab(sp,y+6.5,0,PAL['cv-ink'],true);}
   if(j===0&&gv!=null&&!sh){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(RX+lw+gv*sc,y-12);ctx.lineTo(RX+lw+gv*sc,y+12);ctx.stroke();txt(ctx,'your gut '+gv+'%',RX+lw+gv*sc+4,y+8,{s:11*k,w:700,c:PAL['s4'],b:'middle'});}
   if(s===3&&(j===0||j===3))ring(ctx,RX-4,y-14,RW+8,28);
   y+=35*k;});
  /* bottom line: the math */
  const by=H-28;let line='';
  if(s===4&&atLeast('honors'))line='D’Hondt: each seat goes to the party with the biggest votes ÷ (seats so far + 1).';
  else if(s===5&&atLeast('ap'))line=`Gallagher index = √(½ Σ (vote % − seat %)²) = ${f1(gallagher(sys))}${sys==='fptp'?' (a UK record)':''}`;
  else if(sh&&s>=2)line=sys==='fptp'?`Party A: 411 ÷ 650 = ${f1(ASH)}% of seats from 33.7% of votes.`:`Same votes, new rules: Party A gets ${se[0]} seats (${f1(100*se[0]/SEATS)}%).`;
  if(line)txt(ctx,line,20,by,{s:13*k,w:700,b:'middle',c:PAL['cv-ink']});
  if(s===4||s===5)ring(ctx,12,by-14,W-24,28);
  if(s===7){const cy2=y+4,ch=by-22-cy2;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,cy2,RW,ch,10);ctx.fill();ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,RX,cy2,RW,ch,10);ctx.stroke();
   txt(ctx,'Two views (the math does not choose)',RX+10,cy2+16*k,{s:13*k,w:700,b:'middle'});txt(ctx,'Districts: a clear winner, one local member per place.',RX+10,cy2+36*k,{s:12*k,b:'middle'});txt(ctx,'Proportional: seats that match votes.',RX+10,cy2+54*k,{s:12*k,b:'middle'});}
 },
 narrate(sim){const se=seatsFor(sim.p.sys);if(!shown(sim))return `Party A won <b>33.7%</b> of the votes in 650 single-member districts. What share of the seats do you think it won? Your gut: ${sim.p.guess}%.`;
  if(sim.p.sys==='fptp')return `Party A won <b>411 of 650 seats (${f1(ASH)}%)</b> on 33.7% of the votes. Party D won 14.3% of the votes but only 5 seats: its votes were spread thin, so it rarely came first in a district.`;
  return `Under ${sim.p.sys==='pr'?'proportional representation':'the mixed system'}, Party A would have ${se[0]} seats and Party D ${se[3]}. Same votes, different rules, different Parliament.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'In the UK’s 2024 election, Party A won 33.7% of the votes. Each of the 650 districts elects whoever gets the most votes there. What share of the 650 seats do you think Party A won? Drag, then lock it in.',
   honors:'Party A: 33.7% of the votes, in 650 winner-take-all districts. Drag to your gut guess of its share of seats, then lock it in.'},
  hint:{bio:'Lock in your gut. Then you will work out the real seat share yourself.'},
  lock(sim){return {v:Math.abs(sim.p.guess-ASH),guess:sim.p.guess,label:`${sim.p.guess}% of seats`};},
  solve(sim){BioLab.setValues(sim,{sys:'fptp'});sim.p.guess=Math.round(ASH);return {v:0,guess:ASH,label:`${f1(ASH)}% (411 of 650 seats)`};},
  calc:{unit:'%',d:1,tol:0.2,
   prompt:{bio:'Party A won <b>411</b> of the <b>650</b> seats. What percent of the seats is that?',ap:'Party A: 411 of 650 seats on 33.7% of the votes. Compute its seat share, and the gap in percentage points between seats and votes.'},
   answer:()=>+ASH.toFixed(1),hint:'Part ÷ whole × 100: 411 ÷ 650 × 100.',
   steps:()=>['411 ÷ 650 = 0.632.',`× 100 = <b>${f1(ASH)}%</b> of the seats.`,`From 33.7% of the votes: ${f1(ASH-33.7)} percentage points more seats than votes.`]},
  formula:()=>`Seat share = 411 ÷ 650 × 100 = ${f1(ASH)}% (votes: 33.7%)`+(atLeast('ap')?`<br>Gallagher index, 2024: √(½ Σ(v − s)²) = ${f1(gallagher('fptp'))}`:''),
  how:{bio:'Seat share = seats won ÷ all seats × 100. Compare it with the vote share.',honors:'Single-member districts give a seat to the top vote-getter in each district, so a party that comes first in many districts can win far more seats than votes.'},
  compare(sim,g){const off=Math.abs(g.guess-ASH);const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the seat share yourself.':'';
   return (off<=5?`Close: within ${Math.round(off)} points.`:`You guessed ${g.guess}%. Party A won <b>${f1(ASH)}%</b> of the seats, so you were off by ${Math.round(off)} points.`)+' Its votes were spread efficiently, so it came first in many districts. Party D, with 14.3% of the votes, won only 5 seats.'+self;},
  again(sim){sim.p.guess=34;sim.p.reveal=false;BioLab.setValues(sim,{sys:'fptp'});}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Party D won 14.3% of the votes and 5 of 650 seats. What percent of the seats is that? Round to one decimal place.',answer:100*5/650,tol:0.1,unit:'%',d:1,hint:'5 ÷ 650 × 100.',explain:'5 ÷ 650 × 100 ≈ 0.8% of the seats, from 14.3% of the votes. Its voters were spread out, so it rarely came first in a district.'},
  {lvl:'bio',instant:true,q:'In winner-take-all districts, why can a party with a third of the votes win most of the seats?',choices:['Its votes count double','It only needs to come first in each district, and many districts were close three- or four-way races','The rules give the largest party bonus seats'],correct:1,explain:'Coming first in a district wins the whole seat, even with a third of that district’s votes.'},
  {lvl:'honors',kind:'num',q:'Under the proportional rules here (D’Hondt, one national list), how many of the 650 seats would Party A get?',answer:PR[0],tol:0.5,unit:'seats',d:0,hint:'Switch the system to Proportional and read Party A’s seats.',explain:`D’Hondt gives Party A ${PR[0]} seats, close to 33.7% of 650 = 219. It would need partners to govern.`},
  {lvl:'honors',instant:true,q:'Russia elects half its Duma in districts and half by party list. Compared with pure districts, a mixed system usually makes seat shares…',choices:['Further from vote shares','Closer to vote shares, but not equal','Exactly equal to vote shares'],correct:1,explain:'The list half pulls seat shares toward vote shares; the district half still rewards whoever comes first.'},
  {lvl:'ap',kind:'num',q:'With single-member districts, the Gallagher index for 2024 is √(½ Σ(v − s)²). Compute it from the tool’s seven parties, to one decimal place.',answer:+gallagher('fptp').toFixed(1),tol:0.3,unit:'',d:1,hint:'For each party, subtract seat % from vote %, square it, add the squares, halve, take the square root.',explain:`It comes to about ${f1(gallagher('fptp'))}, a record for a UK general election. Under the proportional rules it falls to about ${f1(gallagher('pr'))}.`},
  {lvl:'ap',instant:true,q:'Nigeria’s president must win the most votes and at least 25% of the vote in at least two-thirds of the 36 states (and the capital). What is that rule designed to do?',choices:['Make it easier to win with one region’s votes','Require support spread across the country, not concentrated in one region','Replace the popular vote'],correct:1,explain:'A geographic distribution rule pushes candidates to campaign across regions in a diverse federation.'}
 ],
 tour:[
  {title:'650 seats, 650 districts',text:'The UK elects one member of Parliament in each of 650 districts. In each district, whoever gets the most votes wins the whole seat, even with a third of the votes.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{sys:'fptp'});}},
  {title:'The 2024 result',text:'Party A won 411 seats: 411 ÷ 650 = 63.2%. A majority takes 326 seats.',pause:true,setup:sim=>{sim.tst=2;BioLab.setValues(sim,{sys:'fptp'});}},
  {title:'Votes vs. seats',text:'Party A: 33.7% of the votes, 63.2% of the seats. Party D: 14.3% of the votes, 0.8% of the seats. Spread-out votes win few districts; votes that come first in many districts win many seats.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{sys:'fptp'});}},
  {lvl:'honors',title:'Same votes, proportional rules',text:'Proportional representation gives seats in proportion to votes. The D’Hondt method gives each seat to the party with the biggest votes ÷ (seats so far + 1). Party A falls to about a third of the seats.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{sys:'pr'});}},
  {lvl:'ap',title:'Measure the gap',text:'The Gallagher index squares each party’s gap between vote % and seat %, adds them, halves, and takes the square root. 2024 in the UK: about 23.7, a record. Proportional rules bring it near zero. Mixed rules land in between.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{sys:'fptp'});}},
  {lvl:'honors',title:'Mixed systems',text:'Russia elects half its Duma in districts and half from party lists. Mexico elects 300 deputies in districts and 200 from lists. Here, half and half: seat shares move toward vote shares, but the largest party still gains.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{sys:'mixed'});}},
  {title:'Which rule is fairer?',text:'Supporters of single-member districts value a clear winner and one local representative for each place. Supporters of proportional rules value seats that match votes. Countries choose differently. The math shows the trade-off; it does not pick for you.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{sys:'fptp'});}}
 ],
 onTourExit(sim){sim.tst=0;BioLab.setValues(sim,{sys:'fptp'});},
 lab:{bio:'<p><b>Question:</b> How far apart are vote shares and seat shares?</p><ol><li>Lock in your gut, then work out Party A’s seat share.</li><li>For each party, compute seats ÷ 650 and compare with its vote share.</li></ol><p>Write one sentence about which party gained the most from the rules, and which lost the most.</p>',
  honors:'<p><b>Question:</b> What would the same votes give under proportional or mixed rules?</p><ol><li>Switch the system to Proportional and to Mixed. Record each party’s seats.</li><li>Does any party have a majority (326) in each system?</li></ol>',
  ap:'<p><b>Question:</b> How disproportional is each system?</p><ol><li>Compute the Gallagher index for each system.</li><li>Connect your results to the UK, Russia and Mexico case studies.</li></ol><p><b>CER:</b> Claim, evidence and reasoning about a trade-off between clear majorities and proportional seats.</p>'},
 terms:[
  {t:'Single-member district (first past the post)',d:'Each district elects one representative: whoever gets the most votes.'},
  {t:'Proportional representation',d:'Seats are shared out in proportion to each party’s votes, usually from party lists.',lvl:'honors'},
  {t:'D’Hondt method',d:'Each seat goes, in turn, to the party with the largest votes ÷ (seats already won + 1).',lvl:'honors'},
  {t:'Mixed system',d:'Some seats from districts and some from party lists, as in Russia and Mexico.',lvl:'honors'},
  {t:'Gallagher index',d:'√(½ Σ(vote % − seat %)²): 0 when seats match votes exactly.',lvl:'ap'}
 ],
 about:'<p><b>Sources.</b> UK general election, July 4, 2024, House of Commons results as summarized by the Electoral Reform Society, <i>A System Out of Step</i> (Dec 10, 2024; <a href="https://www.electoral-reform.org.uk/latest-news-and-research/publications/a-system-out-of-step-the-2024-general-election/" target="_blank" rel="noopener">link</a>): the largest party won 411 seats (63.2%) on 33.7% of the vote, the least proportional result in UK history by the Gallagher index. Vote shares used: 33.7, 23.7, 12.2, 14.3, 6.7, 2.5 and 6.9 (all others); seats 411, 121, 72, 5, 4, 9 and 28. Parties are shown by letter so the math is the focus; your textbook names them.</p>'+
  '<p><b>Model.</b> The proportional result is an illustration: one national list, D’Hondt, no threshold, with “all others” treated as one list. Real proportional systems use regional lists and thresholds. Mixed: half the seats from the real district results (halved) and half by D’Hondt, the parallel design used for Russia’s State Duma (225 + 225). Mexico’s Chamber of Deputies has 300 district and 200 list seats.</p>'+
  '<p><b>What this number hides.</b></p><ul><li>Voters may vote differently under different rules (for example, for a small party they now skip), so rerunning the same votes is only a first estimate.</li><li>Turnout was about 60%, so a party’s vote share is a share of those who voted, not of all adults.</li><li>A national seat count hides how close many districts were.</li></ul>'
};
BioLab.register(SIM);
})();
