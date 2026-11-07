/* Raider CivicsLab: topic sections, organized by Catholic social teaching rather than by party. */
BioLab.COURSES = [];
BioLab.TOPIC_ORDER = {1:['polygons','tipping','margin'],2:['budget','lifeworth'],3:['claims','whatmoved'],4:['tabor','foodmath']};
BioLab.setSections({units:{},extra:{1:'Small choices, big patterns',2:'A budget is a moral document',3:'Does the math hold up?',4:'Colorado and creation',11:'Go further'},order:[1,2,3,4,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
