/* Raider CivicsLab: topic sections, organized by Catholic social teaching rather than by party.
   Course paths follow RJ's Canvas sequences for US Government, AP US Government, AP Macroeconomics,
   AP Microeconomics and Discipleship & Social Justice (pulled Nov 7, 2026). Each unit lists the tools
   whose math that unit uses. */
BioLab.COURSES = [
 {id:'usgov',name:'US Government',blurb:'United States Government, in the order your class covers it. Each unit lists the tools that put numbers on what you are studying.',
  units:[
   {n:'Unit 1',t:'The Foundations of American Government',ids:['apportion','tabor'],note:'The Great Compromise in numbers: House seats by population, two Senate seats per state. Direct democracy in Colorado: voters set the TABOR cap.'},
   {n:'Unit 2',t:'The Three Branches of Government',ids:['budget','taxhistory','lifeworth','foodmath','apportion'],note:'The power of the purse, what agencies weigh when they write a rule, and why the House has 435 seats.'},
   {n:'Unit 3',t:'Political Parties, Elections, & The Media',ids:['apportion','districts','electoral','margin','pollmiss','turnout','claims','whatmoved'],note:'Reapportionment, redistricting and gerrymandering, the Electoral College and winner-take-all, then polls, turnout and checking the numbers in the news.'},
   {n:'Final',t:'The Colorado ballot',ids:['tabor','propertytax','turnout'],note:'The math behind measures Colorado voters decide.'}
  ]},
 {id:'apgov',name:'AP US Government',blurb:'AP U.S. Government and Politics, by the units your class follows.',
  units:[
   {n:'Unit 1',t:'Foundations of American Democracy',ids:['apportion','tabor'],note:'Representation and federalism: how population becomes seats, and how a state constitution limits a state budget.'},
   {n:'Unit 2',t:'Interactions Among Branches of Government',ids:['districts','apportion','budget','lifeworth'],note:'Congressional elections and gerrymandering, the budget, and the cost-benefit math the bureaucracy uses.'},
   {n:'Unit 3',t:'Civil Liberties and Civil Rights',ids:['polygons','tipping','districts'],note:'How small individual preferences can add up to segregation, and how district lines decide whose votes count.'},
   {n:'Unit 4',t:'American Political Ideologies and Beliefs',ids:['pollmiss','margin','claims'],note:'Public opinion polling: who answers, margins of error, and claims built on survey numbers.'},
   {n:'Unit 5',t:'Political Participation',ids:['turnout','electoral','districts','whatmoved'],note:'Voting rules and turnout, the Electoral College, and reading what moved a number.'}
  ]},
 {id:'apmacro',name:'AP Macroeconomics',blurb:'AP Macroeconomics, by College Board unit. Only units with a CivicsLab tool are listed.',
  units:[
   {n:'Unit 2',t:'Economic Indicators and the Business Cycle',ids:['measurewealth','northsouth'],note:'What GDP counts and leaves out, mean vs. median, and comparing countries at purchasing-power parity.'},
   {n:'Unit 3',t:'National Income and Price Determination',ids:['budget','taxhistory'],note:'Fiscal policy: where federal spending goes and how tax rates have changed since 1913.'},
   {n:'Unit 5',t:'Long-Run Consequences of Stabilization Policies',ids:['budget','tabor'],note:'Interest on the debt as a share of the budget, and a state rule that caps revenue growth.'},
   {n:'Unit 6',t:'Open Economy: International Trade and Finance',ids:['remittances','northsouth'],note:'Money sent across borders, transfer fees, and income gaps between regions.'}
  ]},
 {id:'apmicro',name:'AP Microeconomics',blurb:'AP Microeconomics, by College Board unit. Only units with a CivicsLab tool are listed.',
  units:[
   {n:'Unit 6',t:'Market Failure and the Role of Government',ids:['northsouth','hiddenends','taxhistory','lifeworth','propertytax','foodmath'],note:'Income inequality (Lorenz curve and Gini), progressive taxes, cost-benefit analysis, public goods like schools, and food waste as an externality (the emissions no one pays for).'}
  ]},
 {id:'dsj',name:'Discipleship & Social Justice',blurb:'Discipleship & Social Justice. These tools add the numbers to issues the course studies; the course brings the questions.',
  units:[
   {n:'Issue',t:'Poverty and the unhoused',ids:['hiddenends','foodmath','northsouth','measurewealth'],note:'Who official statistics count well and who they miss, where surplus food goes, and what “wealth” measures.'},
   {n:'Issue',t:'Immigration',ids:['remittances','northsouth'],note:'What families sending money home pay in fees, and how far apart incomes are by birthplace.'},
   {n:'Issue',t:'“Collateral damage”: Flint water',ids:['lifeworth'],note:'How agencies put numbers on safety rules, and what those numbers leave out.'}
  ]}
];
BioLab.TOPIC_ORDER = {1:['polygons','tipping','margin'],2:['budget','lifeworth','taxhistory','hiddenends'],3:['claims','whatmoved'],4:['tabor','foodmath','propertytax'],5:['measurewealth','remittances','northsouth'],6:['pollmiss','turnout'],7:['apportion','districts','electoral']};
BioLab.setSections({units:{},extra:{1:'Small choices, big patterns',2:'Where the money goes: budgets and taxes',3:'Does the math hold up?',4:'Colorado and creation',5:'One human family',6:'Counting the people: polls and turnout',7:'Representation by the numbers',11:'Go further'},order:[1,7,6,2,3,4,5,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
