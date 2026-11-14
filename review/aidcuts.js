BioLab.addReview({
aidcuts:{
 questions:[
  {id:'day',kind:'test',lvl:'bio',q:'USAID cost each American about $64 a year. About how many cents a day is that, to one decimal place?',num:{ans:17.5,tol:0.3,unit:'cents'},
   steps:['$64 ÷ 365 = $0.175.','× 100 = 17.5 cents a day.'],lab:{set:{reveal:true},look:'Read <b>Cost to each American per day</b>.'}},
  {id:'share',kind:'real',lvl:'bio',q:'Before 2025, about what share of the federal budget went to foreign aid?',choices:['About 1%','About 10%','About 26%'],correct:0,
   steps:['About 1% (KFF).','26% was the average guess in a 2025 poll.']},
  {id:'kids',kind:'test',lvl:'bio',q:'4.5 million of a projected 14 million extra deaths would be children under 5. What percent is that, to the nearest whole percent?',num:{ans:32,tol:0.6,unit:'%'},
   steps:['4.5 ÷ 14 = 0.321.','≈ 32%.']},
  {id:'model',kind:'real',lvl:'bio',q:'Which description of “14 million extra deaths by 2030” is accurate?',choices:['A count of recorded deaths','A model’s projection if the cuts continue, with a range of about 8 to 19 million','An official government figure'],correct:1,
   steps:['It is a projection from a model built on past data.','Report the range and the condition.']},
  {id:'cofin',kind:'test',lvl:'honors',q:'The U.S. committed $12.7 billion and partner countries $7.8 billion under new agreements. What percent of the total came from partners, to the nearest whole percent?',num:{ans:38,tol:0.6,unit:'%'},
   steps:['12.7 + 7.8 = 20.5.','7.8 ÷ 20.5 ≈ 38%.']},
  {id:'range',kind:'real',lvl:'honors',q:'Why does a projection come with a range?',choices:['To make it look scientific','Because the model’s inputs are uncertain, so several outcomes are plausible','Because the authors disagree with each other'],correct:1,
   steps:['Uncertain inputs give a spread of outcomes.','The middle is the best single estimate.']},
  {id:'conf',kind:'ap',lvl:'ap',q:'In a study comparing countries, more USAID funding went with fewer deaths. Which is a possible confounder?',choices:['Other donors giving more to the same countries','The number of countries studied','The year the study was published'],correct:0,
   steps:['A confounder is linked to both the funding and the outcome.','Other aid could explain part of the drop.']}
 ]
}
});
