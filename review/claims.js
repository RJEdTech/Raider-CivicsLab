BioLab.addReview({
claims:{
 questions:[
  {id:'aidshare',kind:'test',lvl:'bio',
   q:'In fiscal year 2026, federal outlays were $7,395.8B and international affairs was $48.0B. What percent of federal spending was international affairs? Round to two decimal places.',
   num:{ans:0.65,tol:0.01,unit:'%'},
   steps:['Share = part ÷ whole = 48.0 ÷ 7,395.8.','48.0 ÷ 7,395.8 ≈ 0.00649.','Multiply by 100: about 0.65%, or 65 cents of every $100.'],
   lab:{set:{card:'aid'},act:'show',look:'Read <b>International affairs share of federal outlays</b>.'},verify:[['aidpct',0.649,0.002]]},
  {id:'aidbill',kind:'real',lvl:'bio',
   q:'Your family’s federal tax bill is $8,000. If each tax dollar were spread evenly across federal spending, about how much would go to international affairs?',
   choices:['About $5','About $52','About $520','About $2,000'],correct:1,
   steps:['Use the share: 0.649%.','$8,000 × 0.00649 ≈ $51.92.','About $52. (Taxes are not really earmarked this way, and the government also borrows, so this is an illustration.)'],
   lab:{set:{card:'aid',bill:8000},act:'show',look:'Read <b>Your family’s tax bill × that share</b>.'},verify:[['aidbill',51.92,0.1]]},
  {id:'perperson',kind:'test',lvl:'honors',
   q:'ITEP estimates $96.7B in taxes from 10.9 million people. FAIR estimates $31B from 15.5 million. How many times larger is ITEP’s per-person figure? Round to one decimal place.',
   num:{ans:4.4,tol:0.1,unit:'times'},
   steps:['ITEP: $96.7B ÷ 10.9 million ≈ $8,872 per person.','FAIR: $31B ÷ 15.5 million = $2,000 per person.','$8,872 ÷ $2,000 ≈ 4.4. The sources differ mostly in method, not headcount.'],
   lab:{set:{card:'tax'},act:'show',look:'Read the two per-person tiles (Closer look).'},verify:[['pp_itep',8871.6,1],['pp_fair',2000,0.5]]},
  {id:'atpop',kind:'test',lvl:'ap',
   q:'Apply ITEP’s per-person rate to FAIR’s population of 15.5 million. What total in taxes does that give, to the nearest $0.1B?',
   num:{ans:137.5,tol:0.2,unit:'$B'},
   steps:['Per-person rate: $96.7B ÷ 10.9 million ≈ $8,871.6.','× 15.5 million = $137.5B.','So a bigger headcount, at ITEP’s method, would widen the gap with FAIR’s $31B, not close it.'],
   lab:{set:{card:'tax',pop:15.5},act:'show',look:'Read <b>ITEP’s per-person rate × your population</b> (Deep dive).'},verify:[['atpop',137.5,0.1]]},
  {id:'ctcper',kind:'real',lvl:'bio',
   q:'Child poverty (SPM) was 5.2% in 2021 and 12.4% in 2022. In a school district with 10,000 children, about how many more children would be in poverty in 2022?',
   choices:['About 72','About 720','About 1,240','About 7,200'],correct:1,
   steps:['The rate rose 12.4 − 5.2 = 7.2 percentage points.','7.2% of 10,000 = 720.','About 720 more children, assuming the district matches the national rate.'],
   lab:{set:{card:'ctc'},act:'show',look:'Read <b>Rise in child poverty</b> and <b>More children in poverty per 1,000</b>.'},verify:[['jump',7.2,0.01]]},
  {id:'nasratio',kind:'test',lvl:'honors',
   q:'The National Academies estimated the 2013 net cost of all first-generation immigrants at about $279B when each person is charged an average share of public goods, and about $43B when only the added cost is charged. What does that show?',
   choices:['The study is unreliable','One accounting choice moves the answer about 6.5 times','Immigrants pay no taxes','The second generation costs the most'],correct:1,
   steps:['279 ÷ 43 ≈ 6.5.','The difference comes from one assumption: how to charge for things like national defense that one more resident barely changes.','The same study found the second generation among the strongest fiscal contributors, so whose costs and whose taxes you count matters too.']},
  {id:'factvalue',kind:'real',lvl:'honors',
   q:'Which of these is a value claim that math alone cannot settle?',
   choices:['Undocumented immigrants paid $0 in taxes in 2022','International affairs is under 1% of federal spending','The expanded Child Tax Credit cost too much for what it did','Child poverty rose from 2021 to 2022'],correct:2,
   steps:['The other three are checkable numbers: false, true and true.','“Too much” weighs a cost against what you value: children’s needs, work, other uses of the money.','Math can inform that judgment with costs and effects. It cannot make it for you.']}
 ]
}
});
