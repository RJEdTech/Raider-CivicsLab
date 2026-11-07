/* Raider CivicsLab: topic sections, organized by Catholic social teaching rather than by party. */
BioLab.COURSES = [];
BioLab.TOPIC_ORDER = {1:['polygons','tipping','margin'],2:['budget','lifeworth','hiddenends'],3:['claims','whatmoved'],4:['tabor','foodmath','propertytax'],5:['measurewealth','remittances','northsouth'],6:['pollmiss','turnout']};
BioLab.setSections({units:{},extra:{1:'Small choices, big patterns',2:'A budget is a moral document',3:'Does the math hold up?',4:'Colorado and creation',5:'One human family',6:'Counting the people: polls and turnout',11:'Go further'},order:[1,2,3,4,5,6,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
