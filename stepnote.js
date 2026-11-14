/* Raider CivicsLab: walkthrough step layers.
   A tour step's setup can set sim.stn = {i:sim.tour.i, ...}. While that step is on screen:
   - rings: [[x,y,w,h],...] red outlines around what the step talks about
   - card: {x,y,w,title,lines:[...],bars:[{l,v,max,c,t}]} a card with the step's numbers
   - any other key is a flag a tool's draw can read with BioLab.stepFlag(sim,'key').
   The note belongs to one step only: it disappears when the student moves on.
   Wrap a definition with BioLab.stepWrap(SIM) before BioLab.register. */
(function(){
'use strict';
const {txt,rr,PAL,FONT}=BioLab.h;
const cur=sim=>{const n=sim&&sim.stn;return n&&sim.tour&&sim.tour.on&&n.i===sim.tour.i?n:null;};
BioLab.stepFlag=(sim,key)=>{const n=cur(sim);return n?n[key]:undefined;};
BioLab.stepSet=(sim,o)=>{sim.stn=Object.assign({i:sim.tour?sim.tour.i:-1},o||{});};
function wrapLines(ctx,s,w){const out=[];String(s).split('\n').forEach(par=>{const words=par.split(' ');let line='';
  words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){out.push(line);line=wd;}else line=t;});if(line)out.push(line);});return out;}
function card(ctx,k,c){const s=Math.min(13*k,15),pad=10,w=c.w||300,x=c.x,inner=w-2*pad;
  ctx.font='700 '+(s+1)+'px '+FONT;const tl=c.title?wrapLines(ctx,c.title,inner):[];
  ctx.font='400 '+s+'px '+FONT;const L=[];(c.lines||[]).forEach(l=>wrapLines(ctx,l.replace(/<\/?b>/g,''),inner).forEach((x2,j)=>L.push({t:x2,b:/^<b>/.test(l)&&j===0||c.boldAll})));
  const lh=s*1.32,bh=(c.bars||[]).length*(s*1.32+10);
  const h=pad*2+tl.length*(s+1)*1.3+(tl.length?4:0)+L.length*lh+bh;
  let y=c.y;if(c.anchor==='bottom')y=c.y-h;
  ctx.save();ctx.shadowColor='rgba(0,0,0,.18)';ctx.shadowBlur=8;ctx.fillStyle=PAL['card'];rr(ctx,x,y,w,h,9);ctx.fill();ctx.restore();
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;rr(ctx,x,y,w,h,9);ctx.stroke();
  let yy=y+pad;tl.forEach(t=>{txt(ctx,t,x+pad,yy+(s+1)*0.65,{s:s+1,w:700,b:'middle',c:PAL['cv-ink']});yy+=(s+1)*1.3;});if(tl.length)yy+=4;
  L.forEach(o=>{txt(ctx,o.t,x+pad,yy+lh*0.5,{s:s,w:o.b?700:400,b:'middle',c:PAL['cv-ink']});yy+=lh;});
  (c.bars||[]).forEach(b=>{const bw=inner*Math.max(0,Math.min(1,b.v/(b.max||1)));
   txt(ctx,b.l,x+pad,yy+s*0.6,{s:s*0.95,w:700,b:'middle',c:PAL['cv-ink']});
   if(b.t)txt(ctx,b.t,x+w-pad,yy+s*0.6,{s:s*0.95,w:700,a:'right',b:'middle',c:b.c||PAL['s2']});
   yy+=s*1.2;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,x+pad,yy,inner,8,4);ctx.fill();ctx.fillStyle=b.c||PAL['s2'];rr(ctx,x+pad,yy,Math.max(3,bw),8,4);ctx.fill();yy+=10+s*0.12;});
  return {x,y,w,h};}
BioLab.stepCard=card;
BioLab.stepNote=function(sim,ctx,k){const n=cur(sim);if(!n)return;
  (n.rings||[]).forEach(r=>{ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,r[0],r[1],r[2],r[3],7);ctx.stroke();});
  if(n.card)card(ctx,k,typeof n.card==='function'?n.card(sim,k):n.card);};
/* Steps can carry stn (the note), stnSet (control values to set first) and stnFocus (a focus box, or 'none'). */
BioLab.stepWrap=function(def){const d=def.draw;def.draw=function(sim,ctx,vdt,k,t){d.call(this,sim,ctx,vdt,k,t);BioLab.stepNote(sim,ctx,k);};
  (def.tour||[]).forEach(s=>{if(!s.stn&&!s.stnSet&&s.stnFocus===undefined)return;const o=s.setup;
   if(s.stnFocus!==undefined)s.focus=s.stnFocus==='none'?undefined:s.stnFocus;
   s.setup=function(sim){if(s.stnSet)BioLab.setValues(sim,s.stnSet);if(o)o(sim);BioLab.stepSet(sim,typeof s.stn==='function'?s.stn(sim):(s.stn||{}));};});
  return def;};
})();
