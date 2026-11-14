BioLab.addReview({
pitcount:{
 questions:[
  {id:'ratio',kind:'test',lvl:'bio',q:'Metro Denver counted 10,774 people on one night in January 2025 and 35,601 across the year. How many times bigger is the year count, to one decimal place?',num:{ans:3.3,tol:0.05,unit:'times'},
   steps:['35,601 ÷ 10,774 = 3.30…','About 3.3 times.'],lab:{set:{reveal:true},look:'Read the two Denver bars.'}},
  {id:'unshel',kind:'test',lvl:'bio',q:'266,320 of the 745,652 people counted nationally were unsheltered. What percent is that, to the nearest whole percent?',num:{ans:36,tol:0.6,unit:'%'},
   steps:['266,320 ÷ 745,652 = 0.357.','× 100 ≈ 36%.']},
  {id:'why',kind:'real',lvl:'bio',q:'Why does a one-night count miss people?',choices:['People move in and out of homelessness during the year','Volunteers only count adults','The count is done in summer'],correct:0,
   steps:['A one-night count is a snapshot of who is homeless that night.','Over a year, many more people pass through.']},
  {id:'drop',kind:'real',lvl:'bio',q:'Denver’s one-night count fell from 10,774 to 9,950. What is the best conclusion?',choices:['Homelessness is solved','It may have fallen, but check methods, weather and other data first','The count is useless'],correct:1,
   steps:['One-night counts move with weather, volunteers and methods.','Check other sources before drawing a conclusion.']},
  {id:'change',kind:'test',lvl:'honors',q:'The national count went from 771,480 (2024) to 745,652 (2025). What was the percent change, to one decimal place?',num:{ans:-3.3,tol:0.1,unit:'%'},
   steps:['(745,652 − 771,480) ÷ 771,480 = −0.0335.','× 100 ≈ −3.3%.']},
  {id:'rate',kind:'test',lvl:'honors',q:'745,652 people out of about 340 million. About how many is that per 10,000 people?',num:{ans:22,tol:0.5,unit:'per 10,000'},
   steps:['745,652 ÷ 340,000,000 × 10,000 ≈ 21.9.','About 22 per 10,000.']},
  {id:'flow',kind:'ap',lvl:'ap',q:'If 8,000 people are homeless on any night and a typical stay lasts 2 months, about how many different people are homeless across a year?',num:{ans:48000,tol:500,unit:'people'},
   steps:['Turnover = 12 ÷ 2 = 6 times a year.','8,000 × 6 = 48,000.']}
 ]
}
});
