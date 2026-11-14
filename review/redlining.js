BioLab.addReview({
redlining:{
 questions:[
  {id:'g',kind:'test',lvl:'bio',q:'The median home was worth $7,354 in 1950 and $119,600 in 2000. What is the growth factor, to one decimal place?',num:{ans:16.3,tol:0.1,unit:'times'},
   steps:['Growth factor = new ÷ old.','119,600 ÷ 7,354 ≈ 16.3.'],lab:{set:{reveal:true},look:'Read <b>Growth factor, 1950 to 2000</b>.'}},
  {id:'own',kind:'test',lvl:'bio',q:'Homeownership: 75.1% (White) and 48.7% (Hispanic). What is the gap in percentage points?',num:{ans:26.4,tol:0.05,unit:'points'},
   steps:['75.1 − 48.7 = 26.4 percentage points.']},
  {id:'equity',kind:'real',lvl:'bio',q:'Why does owning a home usually build more wealth than renting the same kind of home?',choices:['Owners pay no taxes','Each payment pays down the loan, and the home’s value can grow; rent builds no ownership','Rent is always higher'],correct:1,
   steps:['Equity = value − what is owed.','Paying down the loan and rising value both add equity.']},
  {id:'law',kind:'real',lvl:'bio',q:'Which law outlawed racial discrimination in housing and lending?',choices:['The Fair Housing Act of 1968','The Social Security Act of 1935','The Voting Rights Act of 1965'],correct:0,
   steps:['The Fair Housing Act was passed in 1968.']},
  {id:'wealth',kind:'test',lvl:'honors',q:'Median wealth in 2022: $285,000 and $61,600. How many times larger is the first, to one decimal place?',num:{ans:4.6,tol:0.1,unit:'times'},
   steps:['285,000 ÷ 61,600 ≈ 4.6.']},
  {id:'real',kind:'test',lvl:'honors',q:'In 2000 dollars, 1950’s median home was $44,600. What was the real growth factor to 2000’s $119,600, to one decimal place?',num:{ans:2.7,tol:0.1,unit:'times'},
   steps:['119,600 ÷ 44,600 ≈ 2.7.','Most of the 16.3× was inflation; real growth was about 2.7×.']},
  {id:'rate',kind:'ap',lvl:'ap',q:'A growth factor of 16.3 over 50 years. What yearly rate, in percent, to one decimal place?',num:{ans:5.7,tol:0.1,unit:'%'},
   steps:['(1 + r)^50 = 16.3.','r = 16.3^(1/50) − 1 ≈ 0.057.','About 5.7% a year.']}
 ]
}
});
