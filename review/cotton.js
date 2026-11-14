BioLab.addReview({
cotton:{
 questions:[
  {id:'factor',kind:'test',lvl:'bio',q:'3,135 bales (1790) → 3,837,402 (1860). How many times as much, to the nearest whole number?',num:{ans:1224,tol:1,unit:'×'},
   steps:['3,837,402 ÷ 3,135 = 1,224.1.'],lab:{set:{reveal:true},look:'Read <b>Times as much as 1790</b>.'}},
  {id:'notcot',kind:'test',lvl:'bio',q:'Cotton was 57.5% of 1860 exports. What percent was everything else?',num:{ans:42.5,tol:0.05,unit:'%'},
   steps:['100 − 57.5 = 42.5.']},
  {id:'both',kind:'real',lvl:'bio',q:'Cotton was 57.5% of exports and about 5% of the economy. Why are both true?',choices:['One is a typo','Exports were only a small part of the whole economy','The economy was smaller than exports'],correct:1,
   steps:['Different wholes give different shares.']},
  {id:'double',kind:'test',lvl:'honors',q:'Why is adding the cost of land and loans to the $77M crop wrong as a share of GDP?',choices:['Those costs are already counted in GDP elsewhere','Land has no value','Loans are illegal'],correct:0,
   steps:['GDP counts final output once.']},
  {id:'pick',kind:'test',lvl:'honors',q:'Picking: 40 lb/day (1811) → 126 lb/day (1861). Times as much, to one decimal place?',num:{ans:3.2,tol:0.05,unit:'×'},
   steps:['126 ÷ 40 = 3.15.','≈ 3.2.']},
  {id:'wright',kind:'ap',lvl:'ap',q:'How can slavery be very profitable for enslavers and still slow a country’s growth?',choices:['Profit for owners is not growth for all; the South built fewer towns, schools and factories','It cannot','Cotton was not sold'],correct:0,
   steps:['Whose gains count, and what else could have been built?']}
 ]
}
});
