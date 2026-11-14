(function(){
'use strict';
const {clamp,txt,rr,PAL,atLeast,FONT,axes,legend}=BioLab.h;
/* Three Arapahoe County school districts.
   Mills: CDE Final Mill Levies, December 2024 (tax year 2024). tp = total program; ovr = voter-approved overrides incl. hold harmless;
   bond = bond redemption; oth = other levies (capital/technology funds) plus abatements. av = net assessed valuation, same file.
   n, TP, L: funded pupil count, total program and local share for FY2025-26, HB25-1320 fiscal note (Legislative Council Staff, May 3, 2025). */
const D={
 cc:{name:'Cherry Creek School District',short:'Cherry Creek',tp:18.756,ovr:17.761,bond:12.141,oth:5.304,av:8925308725,n:50360,TP:594491793,L:198702044},
 aps:{name:'Aurora Public Schools',short:'Aurora',tp:27.000,ovr:22.514,bond:15.901,oth:5.916,av:5571676611,n:39522,TP:502260391,L:180825830},
 lps:{name:'Littleton Public Schools',short:'Littleton',tp:27.000,ovr:11.580,bond:15.846,oth:10.367,av:2488254932,n:12779,TP:144610359,L:78126091}};
/* Per pupil revenue (PPR) as printed in the fiscal note. */
const PPR={cc:11805,aps:12709,lps:11316};
const KEYS=['cc','aps','lps'];
KEYS.forEach(k=>{const d=D[k];d.tot=+(d.tp+d.ovr+d.bond+d.oth).toFixed(3);d.ppr=PPR[k];d.lpp=d.L/d.n;d.spp=(d.TP-d.L)/d.n;d.mill=d.av/1000/d.n;d.opp=d.ovr*d.av/1000/d.n;});
const SCH=0.0705;                    /* school district residential assessment rate, 2025 and 2026 */
const LOC={'2025':0.0625,'2026':0.068};/* local government residential rate */
const dist=sim=>D[sim.p.dist]||D.cc;
const yr=sim=>atLeast('honors')?String(sim.p.yr):'2025';
const senior=sim=>atLeast('honors')&&!!sim.p.senior;
const othM=sim=>+sim.p.oth;
/* Senior exemption: 50% of the first $200,000 of actual value. */
const senOff=(sim,v)=>senior(sim)?Math.min(v,200000)*0.5:0;
const schAV=sim=>{const v=+sim.p.val;return (v-senOff(sim,v))*SCH;};
const locCut=(sim,v)=>yr(sim)==='2026'?Math.min(0.1*v,70000):0;
const locAV=sim=>{const v=+sim.p.val,v1=v-senOff(sim,v);return (v1-locCut(sim,v1))*LOC[yr(sim)];};
const schTax=sim=>schAV(sim)*dist(sim).tot/1000;
const othTax=sim=>locAV(sim)*othM(sim)/1000;
const totTax=sim=>schTax(sim)+othTax(sim);
const lineTax=(sim,m)=>schAV(sim)*m/1000;
const saveSen=sim=>{if(!senior(sim))return 0;const v=+sim.p.val,s=Math.min(v,200000)*0.5,v1=v-s;
 const loc0=(v-locCut(sim,v))*LOC[yr(sim)],loc1=(v1-locCut(sim,v1))*LOC[yr(sim)];return s*SCH*dist(sim).tot/1000+(loc0-loc1)*othM(sim)/1000;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The tax stays hidden while the student works it out by hand ("Your turn"). */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g&&!pend(sim)));
const c2=v=>Math.round(v*100)/100;
const calcAns=sim=>c2(schTax(sim));
const $2=v=>(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const $0=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US');
const m3=v=>(+v).toFixed(3);
const pct=v=>(v*100).toFixed(2).replace(/\.?0+$/,'')+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const LINES=[['tp','School: total program','Total program'],['ovr','School: voter-approved overrides','Overrides'],['bond','School: bond repayment','Bonds'],['oth','School: other levies','Other levies']];

function layL(k){const ph=k>1.4,lh=Math.round(13*k+9);return {ph,lh,y0:Math.round(14+16*k)};}
function draw(sim,ctx,vdt,k){const W=800,H=500,d=dist(sim),sh=shown(sim),G=GS(sim),hon=atLeast('honors'),ph=k>1.4,lh=Math.round(13*k+9);sim._k=k;
 ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
 /* ---- left: the bill ---- */
 ctx.fillStyle=PAL['cv-bg2'];rr(ctx,8,8,ph?432:476,H-16,10);ctx.fill();
 const xL=22,xM=ph?306:330,xT=ph?428:470;let y=Math.round(14+16*k);
 const row=(a,b,c,o)=>{o=o||{};txt(ctx,a,xL,y,{s:12*k,w:o.w||400,c:o.c||PAL['cv-ink']});if(b!=null)txt(ctx,b,xM,y,{s:12*k,w:o.w||400,c:o.c||PAL['cv-ink'],a:'right'});if(c!=null)txt(ctx,c,xT,y,{s:12*k,w:o.w||400,c:o.cc||o.c||PAL['cv-ink'],a:'right'});y+=lh;};
 txt(ctx,ph?`Tax year ${yr(sim)} bill`:`Sample bill: tax year ${yr(sim)} (paid in ${+yr(sim)+1})`,xL,y,{s:14*k,w:700});y+=lh+2;
 const v=+sim.p.val;
 row(ph?'Actual value':'Home’s actual value',null,$0(v));
 if(senior(sim))row(ph?'Senior exemption':'Senior exemption (50% of first $200,000)',null,'−'+$0(senOff(sim,v)),{c:PAL['s3']});
 if(!ph)row('× School assessment rate',null,'7.05%');
 row(ph?'School AV (7.05%)':'= School assessed value',null,$0(schAV(sim)),{w:700});
 y+=2;row(ph?'School line':'School district line','Mills','Tax',{c:PAL['cv-soft']});
 LINES.forEach(L=>row(ph?L[2]:L[1],m3(d[L[0]]),sh?$2(lineTax(sim,d[L[0]])):'?',{cc:sh?PAL['cv-ink']:PAL['s4']}));
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xL,y-lh+4*k);ctx.lineTo(xT,y-lh+4*k);ctx.stroke();y+=2;
 row(ph?'School total':`${d.short} total`,m3(d.tot),sh?$2(schTax(sim)):'?',{w:700,cc:PAL['s4']});
 if(G&&G.g&&sh&&!ph){txt(ctx,`Your gut: ${$0(G.g.guess)}`,xT,y-4,{s:12*k,w:700,c:PAL['s4'],a:'right'});y+=lh-6;}
 y+=4;
 const lr=yr(sim)==='2026'?'6.8%':'6.25%';
 row(ph?`Local AV ${lr}`:(yr(sim)==='2026'?`Local assessed value: 6.8% after −10%`:`Local assessed value: 6.25%`),null,$0(locAV(sim)));
 row(ph?'County, city, etc.':'County, city, special districts (example)',m3(othM(sim)),$2(othTax(sim)));
 row(ph?'Total bill':'Total yearly bill',null,sh?$2(totTax(sim)):'?',{w:700,cc:sh?PAL['cv-ink']:PAL['s4']});
 if(G&&G.m&&!ph&&y<470){y+=4;txt(ctx,`The math: ${$0(schAV(sim))} × ${m3(d.tot)} ÷ 1,000 = ${$2(schTax(sim))}`,xL,y,{s:12*k,w:700,c:PAL['rj']});y+=lh;}
 else if(pend(sim)){y+=4;txt(ctx,ph?'Your turn: find the ?':'Your turn: work out the school total (?)',xL,y,{s:12*k,w:700,c:PAL['rj']});y+=lh;}
 if(sh&&!ph){y+=4;row(ph?'School, per month':'School tax per month',null,$2(schTax(sim)/12),{c:PAL['cv-soft']});if(hon)row(ph?'School, % of value':'School tax as a percent of value',null,(schTax(sim)/v*100).toFixed(3)+'%',{c:PAL['cv-soft']});}
 /* ---- right: same mill, different dollars ---- */
 const X0=ph?454:500,X1=788,BW=X1-X0;let ry=Math.round(14+16*k);
 txt(ctx,ph?'1 mill, per student':'One mill raises, per student',X0,ry,{s:13*k,w:700});ry+=Math.round(10*k)+8;
 const mmax=200;
 KEYS.forEach(kk=>{const q=D[kk],on=q===d;ry+=Math.round(12*k);
  txt(ctx,q.short,X0,ry,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft']});txt(ctx,$2(q.mill),X1,ry,{s:12*k,w:700,c:on?PAL['rj']:PAL['cv-soft'],a:'right'});
  ry+=6;ctx.fillStyle=PAL['line'];ctx.fillRect(X0,ry,BW,12);ctx.fillStyle=on?PAL['rj']:PAL['s2'];ctx.globalAlpha=on?1:.6;ctx.fillRect(X0,ry,BW*q.mill/mmax,12);ctx.globalAlpha=1;ry+=12+Math.round(10*k);});
 if(!ph){txt(ctx,'1 mill × assessed value ÷ funded students',X0,ry+Math.round(8*k),{s:12*k,c:PAL['cv-soft']});ry+=Math.round(12*k)+14;}
 if(hon){ry+=Math.round(10*k);txt(ctx,ph?'Per student':'Per student: formula + overrides',X0,ry,{s:13*k,w:700});ry+=Math.round(8*k)+6;
  const cols=[[PAL['s2'],'Local'],[PAL['s3'],'State'],[PAL['s5'],'Overrides']];let lx=X0;ry+=Math.round(10*k);
  cols.forEach(([c,l])=>{ctx.font='400 '+(12*k)+'px '+FONT;const w=ctx.measureText(l).width;if(lx+12*k+w>X1){lx=X0;ry+=Math.round(14*k)+4;}ctx.fillStyle=c;ctx.fillRect(lx,ry-10*k,10*k,10*k);txt(ctx,l,lx+13*k,ry,{s:12*k,c:PAL['cv-soft']});lx+=13*k+w+12;});
  ry+=6;const smax=16000;
  KEYS.forEach(kk=>{const q=D[kk],on=q===d;ry+=Math.round(12*k)+4;
   txt(ctx,q.short,X0,ry,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft']});txt(ctx,ph?$0(q.ppr+q.opp):$0(q.ppr)+' + '+$0(q.opp),X1,ry,{s:12*k,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft'],a:'right'});
   ry+=6;let bx=X0;[[q.lpp,PAL['s2']],[q.spp,PAL['s3']],[q.opp,PAL['s5']]].forEach(([vv,c])=>{const w=BW*vv/smax;ctx.fillStyle=c;ctx.globalAlpha=on?1:.6;ctx.fillRect(bx,ry,w,12);bx+=w;});ctx.globalAlpha=1;ry+=12;});}
}

function plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:16000,xcats:KEYS.map(k=>D[k].short),yl:'Dollars per student',xl:'District (FY2025-26 formula; override mills from Dec 2024)'});
 KEYS.forEach((kk,i)=>{const q=D[kk];let b=0;[[q.lpp,PAL['s2']],[q.spp,PAL['s3']],[q.opp,PAL['s5']]].forEach(([vv,c])=>{const x0=ax.X(i+0.25),x1=ax.X(i+0.75);ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(b+vv),x1-x0,ax.Y(b)-ax.Y(b+vv));b+=vv;});
  txt(ctx,$0(b),ax.X(i+0.5),ax.Y(b)-6,{s:12,w:700,c:PAL['fg'],a:'center'});});
 legend(ctx,box.L+10,box.T+8,[{label:'Local share',color:PAL['s2']},{label:'State share',color:PAL['s3']},{label:'Overrides',color:PAL['s5']}]);}

function infoMore(){
 const fam=`<p><b>For families.</b> <b>Renters:</b> economists teach that a tax on property can be shifted to tenants through rent, depending on how many rentals there are and how many people want them. How much is shifted in a real market is debated. The slider <b>Share passed on to rent</b> (Closer look) is an assumption, not a measured fact. <b>Seniors:</b> Colorado’s senior exemption takes 50% off the first $200,000 of a home’s actual value for owners 65 or older who have owned and lived in the home at least 10 years in a row. The state pays local governments back. In 2025, 304,141 homes got it, and the state reimbursed $172,985,247.41 (about $569 a home on average). Apply with the county assessor by July 15.</p>`;
 const views=`<p><b>Two views: paying for schools with local property.</b> <i>For local overrides and local control:</i> voters in each district decide directly whether to tax themselves more for their own schools, and they see what they get. Communities that want more for schools can choose it. <i>For more state equalization:</i> one mill raises ${$2(D.lps.mill)} per student in Littleton and ${$2(D.aps.mill)} in Aurora, so the same tax effort buys different amounts. Critics say a student’s school funding should not depend on the property values of the district they happen to live in.</p>
  <p><b>Two views: property tax relief.</b> <i>For lower assessment rates:</i> when home values jump, bills can rise faster than family incomes, which is hardest on people with fixed incomes. Relief keeps families in their homes. <i>For keeping the revenue:</i> lower rates cut money for schools and local services unless the state replaces it, and the state’s own revenue is capped by TABOR. Who should carry the cost is the open question. Which mix is fair is a question of values. The math in this tool is not.</p>`;
 const laws=`<p><b>Laws and ballot measures.</b></p><ul><li><b>Amendment B (2020)</b> repealed the Gallagher Amendment, which had adjusted the residential assessment rate to keep homes’ share of assessed value stable.</li><li><b>Proposition HH (2023)</b> would have lowered property taxes and let the state keep more revenue under its TABOR cap. Voters rejected it.</li><li><b>SB24-233</b> split the residential rate in two, one for schools and one for other local governments, starting in 2025. <b>HB24B-1001</b> set the rates: 7.05% for schools and 6.25% (2025) or 6.8% after a 10% value cut (2026) for local governments.</li><li><b>HB24-1448</b> created a new school finance formula, phased in from 15% in FY2025-26 to 100% in FY2031-32.</li><li><b>TABOR</b> requires voter approval for tax increases, including overrides and bonds. See <a href="#tabor">Colorado’s TABOR machine</a>.</li></ul>`;
 const other=`<p><b>Other states.</b> Most states pair a state formula with local property taxes, as Colorado does. Hawaii runs one statewide school district. The Education Law Center, an advocacy group that pushes for fairer school funding, grades Colorado (2022-23 data) C on funding level ($16,780 per student, state and local, cost-adjusted), B on distribution (how high-poverty districts are funded compared with low-poverty ones) and F on effort (2.66% of state GDP, against a 3.10% national average). Those are its own measures and grades.</p>`;
 return fam+views+laws+other;}
function infoHTML(sim){const d=dist(sim),T=totTax(sim),pass=(+sim.p.pass)/100,hon=atLeast('honors');
 const hide=`<h3>What this number hides</h3><ul>
  <li><b>Renters.</b> A renter’s name is on no property tax bill, yet the owner of a rental like this one pays ${$2(T)} a year. If all of it is passed on, that is ${$2(T/12)} a month in rent; if half, ${$2(T/24)}. How much is passed on is debated (see About this model).</li>
  <li><b>Students whose needs cost more.</b> ${d.short}’s ${$0(d.ppr)} per student is an average. The state formula (HB24-1448) adds money for students at risk, English learners and special education, so the dollars behind one student can be far from the average.</li>
  <li><b>Schools within a district.</b> A district’s per-student figure says nothing about how it splits money among its own schools.</li>
  <li><b>Override money.</b> The ${$0(d.ppr)} leaves out voter-approved overrides: ${m3(d.ovr)} mills × ${$0(d.av)} ÷ 1,000 ÷ ${d.n.toLocaleString('en-US')} students ≈ ${$0(d.opp)} more per student.</li></ul>`;
 return hide;}
/* Long context lives in About this model, off the working screen. */
const ABOUT_MORE=infoMore();

const SIM={
 id:'propertytax',hash:'propertytax',apUnit:4,order:3,tab:'Your house, your school',kind:'Simulation',next:['tabor'],
 skills:{bio:'Percent of a value and rates per 1,000 (mills) · Algebra 1 (Unit 2), US Government (Final: Colorado ballot)',honors:'Multi-step rates, and dividing a total by students · Algebra 1 (Units 2 and 3), AP Macroeconomics (Unit 1)',ap:'Rates per student, and solving for the mills that match a target · Algebra 1 (Unit 2), AP Microeconomics (Unit 6: tax incidence)'},
 card:'Read a real Colorado property tax bill line by line, guess a home’s school tax, then see why one mill buys different dollars per student in Cherry Creek, Aurora and Littleton.',
 title:'Your house, your school: property tax and school funding',
 lede:{bio:'Every home in Colorado pays property tax, and the biggest share usually goes to the local school district. Build a real bill from real Arapahoe County school tax rates, and see how much of a student’s school funding comes from the homes around them.',
  honors:'Colorado’s school finance formula sets each district’s total program. Local property tax pays a share, and the state fills the rest. Voter-approved overrides and bonds come on top, and those depend on local property wealth.',
  ap:'Tax = actual value × assessment rate × mills ÷ 1,000. One mill raises assessed value ÷ 1,000 dollars; per student, divide by funded pupils. An override of x mills raises x × AV ÷ 1,000 ÷ students.'},
 scale:'One home’s yearly property tax bill, and three Arapahoe County school districts with about 12,800 to 50,400 funded students each.',
 aspect:1.6,timeless:true,trials:true,graph:true,defaultGraph:'pp',
 controlsTitle:'Your bill',
 controls:[
  {id:'guess',label:'Your guess: this home’s yearly school district tax, in dollars',type:'range',min:0,max:6000,step:10,def:1500,unit:'',d:0},
  {id:'show',label:'Show the taxes',type:'toggle',def:false,help:'Off: you guess first.'},
  {id:'val',label:'Home’s actual value, in dollars',type:'range',min:200000,max:1500000,step:10000,def:500000,unit:'',d:0,noGut:true,onChange:clearGut,help:'$500,000 is an example value. Your county assessor lists the real one for any address.'},
  {id:'dist',label:'School district',type:'seg',def:'cc',noGut:true,onChange:clearGut,options:[{v:'cc',l:'Cherry Creek'},{v:'aps',l:'Aurora'},{v:'lps',l:'Littleton'}]},
  {id:'yr',label:'Tax year',type:'seg',def:'2025',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'2025',l:'2025 (paid 2026)'},{v:'2026',l:'2026 (paid 2027)'}],help:'Local governments use 6.25% in 2025, and 6.8% after taking 10% (up to $70,000) off the value in 2026. Schools use 7.05% both years.'},
  {id:'oth',label:'County, city and special district mills',type:'range',min:0,max:120,step:0.001,def:25.046,unit:'mills',d:3,lvl:'honors',noGut:true,onChange:clearGut,help:'Real 2025 Arapahoe County tax areas: City of Aurora 25.046; City of Littleton 41.009; Centennial 50.269; a new Aurora neighborhood with a metro district 99.608. Your own bill lists each line.'},
  {id:'senior',label:'Owner qualifies for the senior exemption',type:'toggle',def:false,lvl:'honors',noGut:true,onChange:clearGut,help:'65 or older, and owned and lived in the home at least 10 years in a row.'},
  {id:'pass',label:'Share passed on to rent (assumption)',type:'range',min:0,max:100,step:10,def:100,unit:'%',d:0,lvl:'honors',noGut:true,help:'If this home were a rental: how much of the tax the landlord passes on. Economists debate the real share.'},
  {id:'xm',label:'Extra override mills voters approve',type:'range',min:0,max:10,step:0.5,def:0,unit:'mills',d:1,lvl:'ap',noGut:true}
 ],
 actions:[{id:'math',label:'Set my guess to the math',lvl:'honors',run(sim){BioLab.setValues(sim,{guess:Math.round(schTax(sim)),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'schAV',label:'School assessed value',unit:'$',d:0,min:0,max:null,get:sim=>schAV(sim)},
  {id:'schTax',label:'School district tax, per year',unit:'$',d:2,min:0,max:null,get:sim=>shown(sim)?schTax(sim):null},
  {id:'othTax',label:'County, city and special district tax',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>othTax(sim)},
  {id:'totTax',label:'Total yearly bill',unit:'$',d:2,min:0,max:null,get:sim=>shown(sim)?totTax(sim):null},
  {id:'eff',label:'School tax as a percent of home value',unit:'%',d:3,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?schTax(sim)/(+sim.p.val)*100:null},
  {id:'mill',label:'One mill raises, per student',unit:'$',d:2,min:0,max:null,get:sim=>dist(sim).mill},
  {id:'avpp',label:'Assessed value per student',unit:'$',d:0,lvl:'honors',min:0,max:null,get:sim=>dist(sim).av/dist(sim).n},
  {id:'spp',label:'State share per student (formula)',unit:'$',d:0,lvl:'honors',min:0,max:null,get:sim=>dist(sim).spp},
  {id:'save',label:'Senior exemption saves, per year',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>saveSen(sim)},
  {id:'rent',label:'If a rental: rent increase per month',unit:'$',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?totTax(sim)*(+sim.p.pass)/100/12:null},
  {id:'opp',label:'Existing overrides, per student',unit:'$',d:0,lvl:'ap',min:0,max:null,get:sim=>dist(sim).opp},
  {id:'xpp',label:'Your extra override, per student',unit:'$',d:2,lvl:'ap',min:0,max:null,get:sim=>(+sim.p.xm)*dist(sim).mill},
  {id:'xhome',label:'Your extra override, this home per year',unit:'$',d:2,lvl:'ap',min:0,max:null,get:sim=>(+sim.p.xm)*schAV(sim)/1000}
 ],
 graphs:[{id:'pp',label:'Per student: local share, state share and overrides',custom:true}],
 plot,draw,infoPanel:infoHTML,
 narrate(sim){const d=dist(sim),av=schAV(sim);
  if(!shown(sim)&&pend(sim))return `<b>Your turn:</b> value × 7.05% = school assessed value; then × ${m3(d.tot)} mills ÷ 1,000.`;
  if(!shown(sim))return `This home’s school assessed value is ${$0(av)}. ${d.name} levies ${m3(d.tot)} mills on it. <b>How much school tax is that in a year?</b> Guess first, then work it out by hand: assessed value × mills ÷ 1,000.`;
  const t=schTax(sim),o=KEYS.filter(k=>D[k]!==d).map(k=>`${$2(D[k].mill)} in ${D[k].short}`).join(' and ');
  let s=`${m3(d.tot)} mills on ${$0(av)} is <b>${$2(t)} a year</b> for ${d.short} schools, about ${$2(t/12)} a month. One mill here raises ${$2(d.mill)} per student, against ${o}.`;
  if(atLeast('ap')&&+sim.p.xm>0)s+=` Your ${(+sim.p.xm).toFixed(1)} extra mills would raise ${$2(+sim.p.xm*d.mill)} per student and cost this home ${$2(+sim.p.xm*av/1000)} a year.`;
  else if(senior(sim))s+=` The senior exemption saves this owner ${$2(saveSen(sim))} a year.`;
  return s;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'A home worth the value shown sits in the school district shown. The school district’s lines on its bill add up to the mills in the picture. How many dollars a year does this home pay for schools? Drag <b>Your guess</b> by feel and lock it in.',
   honors:'Before you multiply: how much school district tax does this home pay in a year? Set <b>Your guess</b> by feel and lock it in.'},
  hint:'Lock in your gut answer. Then you will work out the bill yourself: value × 7.05% × mills ÷ 1,000.',
  calc:{unit:'$',d:2,tol:a=>Math.max(1,0.005*a),
   prompt:sim=>{const d=dist(sim),v=+sim.p.val,so=senOff(sim,v);return `The home is worth <b>${$0(v)}</b>${so?` (the senior exemption takes off ${$0(so)})`:''}. Schools tax <b>7.05%</b> of that value, and ${d.short}’s school lines add up to <b>${m3(d.tot)} mills</b>. A mill is $1 per $1,000 of assessed value. How many dollars a year does this home pay for schools?`;},
   answer:calcAns,
   hint:'Step 1: value × 0.0705 is the assessed value. Step 2: assessed value ÷ 1,000 × the mills.',
   steps(sim){const d=dist(sim),v=+sim.p.val,so=senOff(sim,v),av=schAV(sim),out=[];
    if(so)out.push(`Senior exemption: ${$0(v)} − ${$0(so)} = ${$0(v-so)}.`);
    out.push(`School assessed value: ${$0(v-so)} × 0.0705 = ${$0(av)}.`);
    out.push(`Tax: ${$0(av)} ÷ 1,000 = ${$2(av/1000)} per mill, and ${$2(av/1000)} × ${m3(d.tot)} = <b>${$2(calcAns(sim))}</b> a year.`);
    out.push(`That is about ${$2(calcAns(sim)/12)} a month.`);return out;}},
  formula(sim){const d=dist(sim),v=+sim.p.val-senOff(sim,+sim.p.val);return `School tax = ${$0(v)} × 0.0705 × ${m3(d.tot)} ÷ 1,000 = ${$2(schTax(sim))} a year`;},
  lock(sim){const t=schTax(sim);return {v:Math.abs(sim.p.guess-t),guess:+sim.p.guess,label:$0(sim.p.guess)+' a year'};},
  solve(sim){const t=schTax(sim);sim.p.guess=Math.round(t);sim.p.show=true;return {v:Math.abs(Math.round(t)-t),guess:t,label:$2(t)+' a year'};},
  how:{bio:'Step 1: school assessed value = actual value × 7.05%. Step 2: a mill is $1 of tax for every $1,000 of assessed value, so tax = assessed value × mills ÷ 1,000.',
   ap:'Tax = V × 0.0705 × M ÷ 1,000. As a percent of the home’s value: 0.0705 × M ÷ 10.'},
  compare(sim,g,m){const d=dist(sim),av=schAV(sim),t=m.guess,off=Math.abs(g.guess-t);
   const math=`School assessed value: ${$0(+sim.p.val-senOff(sim,+sim.p.val))} × 7.05% = ${$0(av)}. Tax: ${$0(av)} × ${m3(d.tot)} ÷ 1,000 = <b>${$2(t)}</b> a year.`;
   const per=`Per student: ${d.short}’s formula funding is ${$0(d.ppr)} per student, so it takes the school tax of about ${(d.ppr/t).toFixed(1)} homes like this to equal one student’s total program.`;
   if(off<50)return `Your gut was right on: within ${$0(off)}. ${math} ${per}`;
   return `${math} Your guess was off by <b>${$0(off)} a year</b>, about ${$0(off/12)} a month in a family’s budget. ${per}`;},
  again(sim){sim.p.dist=KEYS[Math.floor(Math.random()*3)];sim.p.val=Math.round((300000+Math.random()*700000)/10000)*10000;sim.p.guess=1500;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A $400,000 home is in Aurora Public Schools, where the school lines add up to 71.331 mills. Schools tax 7.05% of the value. How many dollars a year does this home pay for schools?',answer:2011.53,tol:1,unit:'$',d:2,hint:'$400,000 × 0.0705 is the assessed value. Divide by 1,000, then multiply by 71.331.',explain:'$400,000 × 0.0705 = $28,200 of assessed value. $28,200 ÷ 1,000 × 71.331 = $2,011.53 a year, about $167.63 a month.'},
  {lvl:'bio',instant:true,q:'A $500,000 home is in a school district. Schools use a 7.05% assessment rate. What is the school assessed value?',choices:['$500,000','$35,250','$3,525'],correct:1,explain:'Assessed value = actual value × assessment rate = $500,000 × 0.0705 = $35,250. Mills apply to this smaller number, not to the home’s full value.'},
  {lvl:'bio',instant:true,q:'A district levies 1 mill on a home with $35,250 of school assessed value. How much tax is that?',choices:['$35.25','$352.50','$3,525'],correct:0,explain:'A mill is $1 per $1,000 of assessed value: $35,250 ÷ 1,000 × 1 = $35.25. Cherry Creek’s 53.962 mills make $35.25 × 53.962 = $1,902.16.'},
  {lvl:'bio',instant:true,q:'What this number hides: a family rents an apartment. Their name is on no property tax bill. Do they pay any property tax?',choices:['No: only owners pay property tax','Possibly part of it, through rent; how much is debated','Yes: renters get their own bill'],correct:1,explain:'The bill goes to the owner. Economics teaches that owners can pass some of the tax on through rent, depending on the market. Economists disagree on how much, so the bill hides a cost renters may carry.'},
  {lvl:'honors',instant:true,q:'One mill on all the property in a district, divided by its funded students. Which district raises the most per student?',choices:['Cherry Creek ($177.23)','Aurora ($140.98)','Littleton ($194.71)'],correct:2,explain:'One mill raises assessed value ÷ 1,000. Littleton: $2,488,254,932 ÷ 1,000 ÷ 12,779 ≈ $194.71. Aurora: $5,571,676,611 ÷ 1,000 ÷ 39,522 ≈ $140.98. Aurora has more total property, but less behind each student.'},
  {lvl:'honors',instant:true,q:'Littleton has more assessed value per student than Aurora, yet Aurora’s formula funding per student is higher ($12,709 vs. $11,316). Why?',choices:['Aurora levies more mills, so it gets more formula money','The formula sets funding by students and district factors; property wealth mostly changes who pays, local or state','It is a mistake in the data'],correct:1,explain:'Total program comes from the formula: a base amount plus factors such as students at risk and English learners. Then the local share is subtracted and the state pays the rest: about $8,133 per student in Aurora and $5,203 in Littleton.'},
  {lvl:'honors',instant:true,q:'What this number hides: Cherry Creek’s formula funding is $11,805 per student. What does that number leave out?',choices:['Nothing: it is everything the district gets','Override money (about $3,148 more per student) and how funding differs by school and by student','Only federal money'],correct:1,explain:'Overrides: 17.761 mills × $8,925,308,725 ÷ 1,000 ÷ 50,360 ≈ $3,148 per student, outside the formula. The average also blends students whose needs cost more with those whose needs cost less, and it hides how the district splits money among schools.'},
  {lvl:'ap',instant:true,q:'Aurora voters approve 5 extra override mills. How many mills would Littleton need to raise the same dollars per student?',choices:['5 mills','About 3.62 mills','About 6.91 mills'],correct:1,explain:'Aurora: 5 × $140.98 = $704.88 per student. Littleton raises $194.71 per mill, so $704.88 ÷ $194.71 ≈ 3.62 mills. The other way round, Aurora needs about 6.91 mills to match 5 Littleton mills.'},
  {lvl:'ap',instant:true,q:'In tax year 2026, local governments use 6.8% after taking 10% (up to $70,000) off the value. For a $500,000 home, what is the local assessed value, and how does it compare with 2025’s 6.25%?',choices:['$34,000, higher than 2025','$30,600, lower than 2025’s $31,250','$31,250, the same'],correct:1,explain:'($500,000 − $50,000) × 0.068 = $30,600. In 2025: $500,000 × 0.0625 = $31,250. The higher rate on a smaller value gives a lower assessed value for this home.'},
  {lvl:'ap',instant:true,q:'Cherry Creek’s school mills are 53.962. What percent of the home’s actual value is the school tax each year?',choices:['About 5.40%','About 0.380%','About 0.0538%'],correct:1,explain:'Percent of value = 0.0705 × 53.962 ÷ 1,000 = 0.003804, or about 0.380%. Mills apply to assessed value, so you multiply by the assessment rate first.'}
 ],
 tour:[
  {title:'Actual value',text:'The county assessor sets each home’s actual value every two years. For tax years 2025 and 2026 it comes from sales between January 1, 2023 and June 30, 2024. This example home is worth $500,000.',pause:true,setup:sim=>BioLab.setValues(sim,{show:false,val:500000,dist:'cc'}),focus:sim=>{const k=sim._k||1;return [8,8,476,Math.round(14+16*k)+2*Math.round(13*k+9)+6];}},
  {title:'Assessment rate',text:'Colorado taxes only part of the value. For school districts the rate is 7.05%: $500,000 × 0.0705 = $35,250 of school assessed value.',pause:true,focus:sim=>{const k=sim._k||1,lh=Math.round(13*k+9);return [8,8,476,Math.round(14+16*k)+lh*4+8];}},
  {title:'Mills',text:'A mill is $1 of tax per $1,000 of assessed value, or 0.1%. Cherry Creek’s lines add up to 53.962 mills: $35,250 × 53.962 ÷ 1,000 = $1,902.16 a year.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true}),focus:[8,8,476,484]},
  {stn:{rings:[[14,134,464,92]],card:{x:18,y:374,w:456,title:'Cherry Creek’s four school lines',lines:['Formula share, 18.756 mills: the local part of the state formula.','Overrides, 17.761 mills: extra money local voters approved.','Bonds, 12.141 mills: paying back loans for buildings.','Other levies and abatements, 5.304 mills.']}},title:'The school lines',text:'18.756 mills pay Cherry Creek’s local share of the state formula. 17.761 mills are overrides voters approved. 12.141 mills repay bonds for buildings. 5.304 mills are other levies and abatements.',pause:true,focus:[8,8,476,484]},
  {title:'The rest of the bill',text:'County, city and special districts use their own assessment rate: 6.25% in 2025, so $31,250 for this home. In the City of Aurora those lines add up to 25.046 mills (county 15.959, developmental disability 1, city 7.087, flood control 1): $782.69. In Centennial they add up to 50.269 mills.',pause:true},
  {title:'Same mill, different dollars',text:'One mill raises $177.23 per student in Cherry Creek, $140.98 in Aurora and $194.71 in Littleton. The difference is the property behind each student.',pause:true,focus:[492,8,300,Math.round(200)]},
  {lvl:'honors',title:'The state fills the gap',text:'The formula sets total program; local property tax pays a share and the state pays the rest. Littleton pays $6,114 per student locally and the state adds $5,203. In Aurora, $4,575 local and $8,133 state.',pause:true},
  {lvl:'ap',title:'Overrides sit outside the formula',text:'An override of x mills raises x × assessed value ÷ 1,000. Five mills: $704.88 per student in Aurora, $886.15 in Cherry Creek, $973.57 in Littleton. That is where property wealth still shows.',pause:true,setup:sim=>BioLab.setValues(sim,{xm:5,dist:'aps'})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{xm:0,dist:'cc',show:false});},
 lab:{bio:'<p><b>Question:</b> How does a home’s value change its school tax?</p><ol><li>Turn on <b>Show the taxes</b> and check the school tax for the $500,000 home against your own calculation.</li><li>Record a trial at $300,000, $500,000 and $800,000 in one district.</li><li>Switch districts and repeat for $500,000.</li></ol><p>Write two sentences: what happens to the tax when the value rises 10%, and why do two districts tax the same home differently?</p>',
  honors:'<p><b>Question:</b> Who carries the cost?</p><ol><li>For a $500,000 home in each district, record the total bill.</li><li>Turn on the senior exemption and record what it saves.</li><li>Set <b>Share passed on to rent</b> to 0%, 50% and 100%. Record the monthly rent change.</li></ol><p>Explain what the bill shows and what it hides about who pays, using numbers from your table.</p>',
  ap:'<p><b>Question:</b> Does the same tax effort buy the same schools?</p><ol><li>Set <b>Extra override mills</b> to 5. Record the dollars per student in each district.</li><li>Find how many mills Aurora needs to match Littleton’s 5 mills per student.</li><li>Record what that costs a $500,000 home in each district.</li></ol><p><b>CER:</b> Make a claim about funding schools with local overrides, with evidence from your table and reasoning that answers the strongest point of the other view. Your claim is your own; the math must be right.</p>'},
 terms:[
  {t:'Actual value',d:'What the county assessor says a property is worth, set every two years from recent sales.'},
  {t:'Assessment rate',d:'The percent of actual value that is taxed. For homes in 2025: 7.05% for schools, 6.25% for other local governments.'},
  {t:'Assessed value',d:'Actual value × assessment rate. Mills apply to this number.'},
  {t:'Mill',d:'$1 of tax per $1,000 of assessed value, or 0.1%.'},
  {t:'Mill levy',d:'The total mills a government taxes. A bill adds the levies of every government that covers the home.'},
  {t:'Total program',d:'The funding Colorado’s school finance formula sets for a district, paid by local property and vehicle taxes plus state aid.',lvl:'honors'},
  {t:'Local share',d:'The part of total program paid locally: property tax from the total program mills plus specific ownership tax on vehicles.',lvl:'honors'},
  {t:'Equalization',d:'State aid that fills the gap between total program and what local property can raise.',lvl:'honors'},
  {t:'Mill levy override',d:'Extra mills a district’s voters approve, outside the formula.',lvl:'honors'},
  {t:'Bond levy',d:'Mills that repay money voters approved borrowing, usually for buildings.',lvl:'honors'},
  {t:'Assessed value per student',d:'A district’s assessed value ÷ funded students: how much property stands behind each student.',lvl:'ap'},
  {t:'Tax incidence',d:'Who really bears a tax, which can differ from who writes the check.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not tax or financial advice.</b> School tax = actual value × 7.05% × school mills ÷ 1,000. Other local tax = actual value × 6.25% (tax year 2025), or (actual value − the lesser of 10% or $70,000) × 6.8% (tax year 2026), × other mills ÷ 1,000. Tax year 2025 bills are paid in 2026.</p>'+
 '<p><b>Assessment rates:</b> Colorado Division of Property Taxation, 2025 Annual Report (May 2026): the State Board of Equalization certified 4.27% statewide value growth, so 2025 rates are 7.05% (schools) and 6.25% (local governments); Amendment B (2020) repealed Gallagher; values for 2025 and 2026 use sales from January 1, 2023 to June 30, 2024 (<a href="https://dpt.colorado.gov/annual-reports" target="_blank" rel="noopener">dpt.colorado.gov/annual-reports</a>; <a href="https://dpt.colorado.gov/understanding-property-taxes-in-colorado" target="_blank" rel="noopener">Understanding Property Taxes in Colorado</a>, 2026 chart: 7.05% schools, 6.8% local). 2026 local value cut of 10% up to $70,000: HB24B-1001 (<a href="https://content.leg.colorado.gov/sites/default/files/documents/2024B/bills/2024b_1001_01.pdf" target="_blank" rel="noopener">bill text</a>) and Jefferson County’s 2026 worked example (<a href="https://www.jeffco.us/885/How-Property-Taxes-are-Calculated" target="_blank" rel="noopener">jeffco.us</a>). How the senior exemption and the 10% cut combine is simplified here: the exemption comes off first.</p>'+
 '<p><b>School mill levies:</b> CDE Final Mill Levies, December 2024, tax year 2024 (<a href="https://spl.cde.state.co.us/artemis/edserials/ed55021internet/ed55021202425internet.pdf" target="_blank" rel="noopener">CDE</a>). Cherry Creek 53.962 (18.756 total program, 17.761 overrides incl. hold harmless, 12.141 bonds, 5.304 other); Adams-Arapahoe 28J (Aurora) 71.331 (27.000, 22.514, 15.901, 5.916); Littleton 64.793 (27.000, 11.580, 15.846, 10.367). Net assessed value: $8,925,308,725; $5,571,676,611 (Adams and Arapahoe parts); $2,488,254,932. Levies change every December, so a 2025 bill uses slightly different mills. Here they are applied to 2025 and 2026 rates as an illustration.</p>'+
 '<p><b>Formula funding, FY2025-26:</b> funded pupils, total program and local share from the HB25-1320 fiscal note, Legislative Council Staff, May 3, 2025 (<a href="https://statebillinfo.com/bills/fiscal/25/2025a_hb1320_r4.pdf" target="_blank" rel="noopener">copy of the fiscal note</a>): Cherry Creek 50,360 pupils, $594,491,793, local $198,702,044; Aurora 39,522, $502,260,391, $180,825,830; Littleton 12,779, $144,610,359, $78,126,091. These are estimates; final amounts differ slightly. Per-student figures here divide these. Pairing December 2024 assessed values with FY2025-26 pupil counts is a simplification. Override dollars = override mills × net assessed value, before uncollected taxes.</p>'+
 '<p><b>Statewide:</b> FY2025-26 total program $9,998,057,000 for 841,832 pupils ($11,877 each); local share 46.3%, state share 53.7%; base per pupil $8,691.80; HB24-1448 phase-in 15% (FY2025-26) to 100% (FY2031-32); in FY2024-25, 113 districts raised nearly $1.7 billion from overrides and 132 raised about $1.4 billion from bonds (Legislative Council Staff, <a href="https://content.leg.colorado.gov/sites/default/files/School%20Finance%20Handbook%202026_0.pdf" target="_blank" rel="noopener">School Finance in Colorado</a>, 2026).</p>'+
 '<p><b>Senior exemption:</b> 50% of the first $200,000 of actual value; 304,141 homes in 2025; $172,985,247.41 reimbursed for tax year 2025 (DPT 2025 Annual Report). <b>Proposition HH (2023):</b> rejected by voters (<a href="https://www.cpr.org/2023/11/07/colorado-proposition-hh-election-results/" target="_blank" rel="noopener">CPR News</a>, Nov 7, 2023). <b>Other states:</b> Education Law Center, an advocacy organization, <a href="https://edlawcenter.org/wp-content/uploads/2025/12/Making-the-Grade-2025.pdf" target="_blank" rel="noopener">Making the Grade 2025</a> (2022-23 data).</p>'+
 ABOUT_MORE+'<p><b>County, city and special district mills (tax year 2025):</b> Arapahoe County Assessor, <a href="https://files.arapahoeco.gov/Assessor/Mill%20Levies%20by%20Tax%20Area/2025%20Taxing%20District%20Levy%20Percentage.pdf" target="_blank" rel="noopener">Taxing District Levy Percentage, Tax Year 2025</a> (December 30, 2025). Every home sits in one tax area, and every tax area has its own list. Examples: City of Aurora (tax area 0002) 25.046 mills: Arapahoe County 15.959, developmental disability 1.000, City of Aurora 7.087, Urban Drainage and Flood 0.900 and 0.100. City of Littleton (0008) 41.009: adds the City of Littleton 2.000, South Metro Fire Rescue 12.250 and South Suburban Parks and Recreation 8.800. Centennial (0129) 50.269: adds the City of Centennial 5.076, Arapahoe Library District 5.719, South Metro Fire Rescue 12.250, Southgate Sanitation 0.465 and South Suburban Parks and Recreation 8.800. Aurora’s Murphy Creek neighborhood (0140) 99.608, because its metropolitan district levies 74.562 mills to repay the bonds that built its streets and pipes. The default is the City of Aurora list.</p><p><b>School mills by type</b> are the Colorado Department of Education’s tax year 2024 split (the latest split by type). The county’s certified tax year 2025 totals are a little higher: Cherry Creek 54.108, Aurora 73.186 and Littleton 65.193 mills (<a href="https://files.arapahoeco.gov/Assessor/Certification%20of%20Levies%20and%20Revenues/2026%20Certification%20of%20Levies%20and%20Revenues.pdf" target="_blank" rel="noopener">Arapahoe County Certification of Levies and Revenues, budget year 2026</a>).</p><p><b>Assumptions for illustration:</b> the $500,000 home and the share of tax passed on to rent. The tool does not rank schools or say anything about their quality.</p>'
};
BioLab.register(BioLab.stepWrap(SIM));
})();
