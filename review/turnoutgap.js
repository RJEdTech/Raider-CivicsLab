BioLab.addReview({
turnoutgap:{
 questions:[
  {id:'gap',kind:'test',lvl:'bio',q:'66.9% of women citizens and 63.7% of men citizens voted in 2024. What is the gap in percentage points?',num:{ans:3.2,tol:0.05,unit:'points'},
   steps:['66.9 − 63.7 = 3.2 percentage points.'],lab:{set:{reveal:true},look:'Read <b>Gap (women − men)</b>.'}},
  {id:'vap',kind:'test',lvl:'bio',q:'As a share of all adults: women 61.0%, men 57.4%. What is the gap?',num:{ans:3.6,tol:0.05,unit:'points'},
   steps:['61.0 − 57.4 = 3.6 points.','A different denominator gives a slightly different gap.']},
  {id:'headline',kind:'real',lvl:'bio',q:'A headline says “Turnout rose from 60% to 66%, a 6% increase.” What is more accurate?',choices:['6 percentage points, or a 10% increase','6% exactly','66%'],correct:0,
   steps:['66 − 60 = 6 percentage points.','6 ÷ 60 = 10% higher.']},
  {id:'since',kind:'real',lvl:'bio',q:'Since what year have women voted at a higher rate than men in every presidential election?',choices:['1920','1980','2008'],correct:1,
   steps:['1980: 59.4% vs. 59.1% of adults (Census survey).','Every presidential election since.']},
  {id:'rel',kind:'test',lvl:'honors',q:'By what percent is 66.9% higher than 63.7%, to one decimal place?',num:{ans:5.0,tol:0.1,unit:'%'},
   steps:['(66.9 − 63.7) ÷ 63.7 = 0.0502.','× 100 ≈ 5.0%.']},
  {id:'moe',kind:'ap',lvl:'ap',q:'A poll has 400 women and 400 men. About what is the margin of error for each group’s rate, in percentage points?',num:{ans:5,tol:0.1,unit:'points'},
   steps:['MOE ≈ 1/√n = 1/√400 = 1/20 = 0.05.','± 5 percentage points. The gap’s margin is larger, about √2 × 5 ≈ 7.']},
  {id:'over',kind:'ap',lvl:'ap',q:'Why might survey turnout be higher than official turnout?',choices:['Some people say they voted when they did not, and voters answer surveys more often','Surveys count non-citizens','Officials lose ballots'],correct:0,
   steps:['Over-reporting and nonresponse both push survey turnout up.']}
 ]
}
});
