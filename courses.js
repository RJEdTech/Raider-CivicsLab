/* Raider CivicsLab: topic sections, organized by Catholic social teaching rather than by party.
   Course paths follow RJ's Canvas sequences for US Government, AP US Government, AP Macroeconomics and
   AP Microeconomics (pulled Nov 7, 2026), and Sociology, Social Justice (dual enrollment), AP Comparative
   Government, Advocacy and Social Change, Black History and Junior Theology (pulled Nov 13, 2026).
   Discipleship & Social Justice is no longer offered; Social Justice replaced it. Each unit lists the tools
   whose math that unit uses. */
BioLab.COURSES = [
 {id:'usgov',name:'US Government',blurb:'United States Government, in the order your class covers it. Each unit lists the tools that put numbers on what you are studying.',
  finals:[{t:'US Government final review',units:[0,1,2,3],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 1',t:'The Foundations of American Government',ids:['apportion','tabor'],note:'The Great Compromise in numbers: House seats by population, two Senate seats per state. Direct democracy in Colorado: voters set the TABOR cap.'},
   {n:'Unit 2',t:'The Three Branches of Government',ids:['budget','milspend','taxhistory','lifeworth','foodmath','apportion','deathpenalty'],note:'The power of the purse (including how U.S. military spending compares with the world’s), what agencies weigh when they write a rule, why the House has 435 seats, and the numbers behind a civil liberties debate: the death penalty.'},
   {n:'Unit 3',t:'Political Parties, Elections, & The Media',ids:['apportion','districts','electoral','margin','pollmiss','turnout','turnoutgap','claims','whatmoved'],note:'Reapportionment, redistricting and gerrymandering, the Electoral College and winner-take-all, then polls, turnout, gaps between groups and checking the numbers in the news.'},
   {n:'Final',t:'The Colorado ballot',ids:['tabor','propertytax','turnout'],note:'The math behind measures Colorado voters decide.'}
  ]},
 {id:'apgov',name:'AP US Government',blurb:'AP U.S. Government and Politics, by the units your class follows.',
  finals:[{t:'AP US Government final review',units:[0,1,2,3,4],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 1',t:'Foundations of American Democracy',ids:['apportion','tabor'],note:'Representation and federalism: how population becomes seats, and how a state constitution limits a state budget.'},
   {n:'Unit 2',t:'Interactions Among Branches of Government',ids:['districts','apportion','budget','lifeworth'],note:'Congressional elections and gerrymandering, the budget, and the cost-benefit math the bureaucracy uses.'},
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Unit 3',t:'Civil Liberties and Civil Rights',ids:['polygons','tipping','redlining','districts','deathpenalty'],note:'How small individual preferences can add up to segregation, how 1938 lending maps still show in homeownership and wealth, how district lines affect representation, and the counts behind the death penalty debate.'},
   {n:'Unit 4',t:'American Political Ideologies and Beliefs',ids:['pollmiss','margin','turnoutgap','claims'],note:'Public opinion polling: who answers, margins of error, and claims built on survey numbers.'},
   {n:'Unit 5',t:'Political Participation',ids:['turnout','turnoutgap','electoral','districts','seatsvotes','whatmoved'],note:'Who votes and the gaps between groups, how votes become electoral votes and seats, and how other systems would turn the same votes into seats.'}
  ]},
 {id:'apmacro',name:'AP Macroeconomics',blurb:'AP Macroeconomics, by College Board unit. Only units with a CivicsLab tool are listed.',
  finals:[{t:'AP Macroeconomics final review',units:[0,1,2,3],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 2',t:'Economic Indicators and the Business Cycle',ids:['measurewealth','northsouth','milspend'],note:'What GDP counts and leaves out, mean vs. median, comparing countries at purchasing-power parity, and spending as a share of GDP.'},
   {n:'Unit 3',t:'National Income and Price Determination',ids:['budget','taxhistory'],note:'Fiscal policy: where federal spending goes and how tax rates have changed since 1913.'},
   {n:'Unit 5',t:'Long-Run Consequences of Stabilization Policies',ids:['budget','tabor'],note:'Interest on the debt as a share of the budget, and a state rule that caps revenue growth.'},
   {n:'Unit 6',t:'Open Economy: International Trade and Finance',ids:['remittances','northsouth'],note:'Money sent across borders, transfer fees, and income gaps between regions.'}
  ]},
 {id:'apmicro',name:'AP Microeconomics',blurb:'AP Microeconomics, by College Board unit. Only units with a CivicsLab tool are listed.',
  finals:[{t:'AP Microeconomics final review',units:[0],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 6',t:'Market Failure and the Role of Government',ids:['northsouth','hiddenends','taxhistory','redlining','lifeworth','propertytax','foodmath'],note:'Income inequality (Lorenz curve and Gini), progressive taxes, cost-benefit analysis, public goods like schools, and food waste as an externality (the emissions no one pays for).'}
  ]},
 {id:'soc',name:'Sociology',blurb:'Sociology, in the order your class covers it. These tools put numbers on what sociologists study: who gets counted, how groups sort themselves, and what money and class do.',
  finals:[{t:'Sociology final review',units:[0,1,2,3,4],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 1',t:'The sociological perspective and culture',ids:['northsouth','pollmiss'],note:'Your life elsewhere: the world shrunk to 100 people. Then how sociologists count people, and why a survey can miss even with thousands of answers.'},
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Unit 2',t:'Socialization and social interaction',ids:['tipping','polygons'],note:'Are we free? How one person’s choice depends on how many others have already chosen, and how mild preferences add up to patterns nobody chose.'},
   {n:'Unit 3',t:'Social stratification and social class',ids:['hiddenends','measurewealth','pitcount','redlining','taxhistory','propertytax','whatmoved'],note:'Mean vs. median income, who the poverty numbers miss, wealth vs. income, how a 1938 loan map still shows in homeownership and wealth, how tax rules changed for each class, and how property tax ties school money to where you live.'},
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Unit 4',t:'Gender and race',ids:['turnoutgap','whosehands','polygons','redlining','districts'],note:'Reading a gap between groups (women and men voting), whether money in a woman’s or a man’s hands is spent differently, how neighborhoods can sort even when no one wants them sorted, and how lending maps and district lines shaped them.'},
   {n:'Unit 5',t:'Deviance, crime and social control',ids:['crimecount','claims','whatmoved','deathpenalty'],note:'The dark figure: how much crime never reaches police records. Then check claims by dividing, test what moves a number, and read the counts behind the death penalty.'}
  ]},
 {id:'socjust',name:'Social Justice',blurb:'Social Justice (dual enrollment). These tools add the numbers to issues the course studies; the course brings the questions.',
  finals:[{t:'Social Justice final review',units:[0,1,2,3,4],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Issue',t:'Poverty, wealth and the universal destination of goods',ids:['northsouth','measurewealth','remittances','whosehands'],note:'How far apart lives are by birthplace, what counts as wealth, and what families in El Salvador and elsewhere receive when relatives send money home. Then: does it matter whether aid goes to a mother or a father?'},
   {n:'Issue',t:'Life and medical ethics',ids:['deathpenalty','lifeworth'],note:'The counts behind the death penalty (executions, exonerations), and how agencies put a number on a life.'},
   {n:'Issue',t:'Homelessness',ids:['pitcount','hiddenends','foodmath'],note:'One night vs. the whole year: what a homelessness count sees and misses. Then why people without a home are hard to count in surveys, and where 100 pounds of surplus food ends up.'},
   {n:'Issue',t:'Just war and military spending',ids:['milspend','budget'],note:'The world’s $2.9 trillion in military spending ranked three ways (total, share of the economy, per person), then the federal budget with defense in people and things.'},
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Issue',t:'Racism, immigration and other issues',ids:['redlining','polygons','tipping','claims'],note:'How 1938 lending maps still show in homeownership and wealth, how mild preferences can still sort a town, and two opposite claims about immigrants and taxes checked with the same math.'}
  ]},
 {id:'apcomp',name:'AP Comparative Government',blurb:'AP Comparative Government and Politics, country by country in the order your class covers them. Good practice for the quantitative questions on the exam.',
  finals:[{t:'AP Comparative Government final review',units:[0,1,2,3,4],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 1',t:'Introduction, indicators and Mexico',ids:['measurewealth','northsouth','hiddenends','remittances','whosehands'],note:'GDP per person, HDI and the Gini coefficient: what each indicator counts and misses. Mexico is one of the largest receivers of money sent home, and its cash transfer program pays mothers: does that matter?'},
   {n:'Unit 2',t:'The United Kingdom',ids:['seatsvotes','districts','margin','pollmiss'],note:'The 2024 election: 33.7% of the votes became 63.2% of the seats. Then single-member districts, how close a vote can be, and why the polls missed the UK’s 2015 general election.'},
   {n:'Unit 3',t:'Russia',ids:['seatsvotes','turnout','pollmiss','milspend'],note:'A mixed system (half districts, half party lists), turnout that depends on what you divide by, and a poll that is only as good as who answers it. Then Russia’s military spending: $190 billion, but 7.5% of its economy.'},
   {n:'Unit 4',t:'Nigeria',ids:['northsouth','measurewealth','apportion','seatsvotes'],note:'Where Nigeria sits in a world of 100 people, ranking countries by money or by health and schooling, dividing seats among states by population, and the rule that a president needs 25% in two-thirds of the states.'},
   {n:'Unit 5',t:'China and Iran',ids:['measurewealth','turnout','electoral','milspend'],note:'Growth and development indicators, then elections compared: who can vote, who does, and how votes become an office.'}
  ]},
 {id:'advocacy',name:'Advocacy and Social Change',blurb:'Advocacy and Social Change. Good advocacy needs the numbers right: these tools check the math behind the issues you will speak about.',
  finals:[{t:'Advocacy and Social Change final review',units:[0,1,2,3],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Topic',t:'Dorothy Day and the works of mercy',ids:['pitcount','hiddenends','foodmath'],note:'Counting people without a home on one night and across a year, who official counts miss, and where surplus food goes.'},
   {n:'Topic',t:'Immigration',ids:['claims','remittances','northsouth'],note:'Two opposite claims about immigrants and taxes, checked with one method; the cost of sending money home; and what a child can expect depending on where she is born.'},
   {n:'Topic',t:'Care for creation and climate in Colorado',ids:['foodmath','propertytax','tabor'],note:'Wasted food and its emissions, plus how Colorado raises and limits the money behind any state plan.'},
   {n:'Topic',t:'Advocacy Day: making the case',ids:['budget','margin','tipping','turnout'],note:'Where federal money goes, how few votes can decide a race, how one person can tip a group, and who actually votes.'}
  ]},
 {id:'blackhist',name:'Black History',blurb:'Black History, in the order your class covers it. These tools put numbers on maps, votes and money the course studies.',
  finals:[{t:'Black History final review',units:[0,1,2],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Unit 1',t:'Jim Crow, covenants and redlining',ids:['redlining','polygons','propertytax','turnout'],note:'The 1938 lending grades and what a denied loan meant 50 years later, how sorting can persist, how home values feed school money through property tax, and who votes.'},
   {n:'Unit 2',t:'Harlem, Denver gentrification and Black members of Congress',ids:['redlining','propertytax','districts','apportion'],note:'Rising home values and the tax bill that follows, and how districts and seats are drawn and divided.'},
   {n:'Unit 3',t:'Elections: 2004 and 2008',ids:['electoral','turnout','turnoutgap','margin','pollmiss'],note:'The math of a presidential election: the Electoral College, turnout, close margins and polls.'}
  ]},
 {id:'jrtheo',name:'Junior Theology',blurb:'Junior Theology. These tools give the units’ questions something concrete to test; the course brings the questions.',
  finals:[{t:'Junior Theology final review',units:[0,1,2,3],note:'Covers every unit that has a Raider Labs tool. Your teacher decides what is on the final, so check the study guide.'}],
  units:[
   {n:'Unit 1',t:'Epistemology: Questioning (TRUTH?)',ids:['claims','crimecount','whatmoved','pollmiss'],note:'How do we know a number is true? Check a claim by dividing, ask what a count cannot see, test an explanation against the data, and see why more answers do not always mean a truer survey.'},
   {links:[{href:'https://ncase.me/polygons/',title:'Play the original: Parable of the Polygons (Vi Hart and Nicky Case)'}],n:'Unit 2',t:'Anthropology: Being (IS)',ids:['northsouth','polygons'],note:'One human family in 100 people, and how persons acting freely still shape the communities they live in.'},
   {n:'Unit 3',t:'Ethics: Doing (OUGHT)',ids:['lifeworth','deathpenalty','tipping'],note:'When a government decides what a life is worth in a cost-benefit test, what the numbers can and cannot settle about the death penalty, and how one person’s choice can start or stop a chain.'},
   {n:'Unit 4',t:'Tattoos on the Heart (HOW?)',ids:['hiddenends','pitcount'],note:'The people at the margins are the hardest to count. Who goes missing in the averages, and how many people pass through homelessness in a year when one night counts only some of them?'}
  ]}
];
BioLab.TOPIC_ORDER = {1:['polygons','tipping','margin','redlining'],2:['budget','milspend','lifeworth','taxhistory','hiddenends'],3:['claims','whatmoved','crimecount','pitcount','deathpenalty'],4:['tabor','foodmath','propertytax'],5:['measurewealth','whosehands','remittances','northsouth'],6:['pollmiss','turnout','turnoutgap'],7:['apportion','districts','electoral','seatsvotes']};
BioLab.setSections({units:{},extra:{1:'Small choices, big patterns',2:'Where the money goes: budgets and taxes',3:'Does the math hold up?',4:'Colorado and creation',5:'One human family',6:'Counting the people: polls and turnout',7:'Representation by the numbers',11:'Go further'},order:[1,7,6,2,3,4,5,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
